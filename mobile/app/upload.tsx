import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import {
  uploadTranscription, transcribeRecording, processNLP, createPlant,
} from '../src/services/api';

type Mode = 'audio' | 'manual';

export default function UploadScreen() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>('audio');
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [language, setLanguage] = useState('');
  const [plantName, setPlantName] = useState('');
  const [status, setStatus] = useState('');
  const [transcriptionId, setTranscriptionId] = useState<number | null>(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [nlpResult, setNlpResult] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualData, setManualData] = useState({
    name: '', scientific_name: '', local_language: '', geographic_distribution: '',
    disease_cured: '', preparation_method: '', dosage: '',
    side_effects: '', cultural_significance: '', cultivation_notes: '',
  });

  useEffect(() => {
    AsyncStorage.getItem('access').then((token) => {
      if (!token) router.replace('/login');
      else setReady(true);
    });
  }, [router]);

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a3a2a" />
      </View>
    );
  }

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
    if (!result.canceled && result.assets?.[0]) {
      setFile(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      Alert.alert('Error', 'Select an audio file first');
      return;
    }
    setLoading(true);
    setStatus('Uploading file...');
    const formData = new FormData();
    formData.append('audio_file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'audio/mpeg',
    } as unknown as Blob);
    formData.append('language', language);
    try {
      const { data } = await uploadTranscription(formData);
      setTranscriptionId(data.id);
      setStatus('Uploaded! Tap Transcribe to convert audio to text.');
    } catch {
      setStatus('Upload failed. Make sure you are logged in.');
    }
    setLoading(false);
  };

  const handleTranscribe = async () => {
    if (!transcriptionId) return;
    setLoading(true);
    setStatus('Transcribing with Whisper AI... this may take a few minutes.');
    try {
      const { data } = await transcribeRecording(transcriptionId);
      setTranscribedText(data.transcribed_text);
      setStatus('Transcription complete! Tap Extract Data.');
    } catch {
      setStatus('Transcription failed.');
    }
    setLoading(false);
  };

  const handleNLP = async () => {
    if (!transcriptionId) return;
    setLoading(true);
    setStatus('Extracting plant information...');
    try {
      const { data } = await processNLP(transcriptionId);
      setNlpResult(data);
      setStatus('Review extracted data and save to database.');
    } catch {
      setStatus('NLP extraction failed.');
    }
    setLoading(false);
  };

  const handleSavePlant = async (payload: Record<string, string>) => {
    setLoading(true);
    setStatus('Saving plant...');
    try {
      await createPlant(payload);
      setStatus('Plant saved successfully!');
      setTimeout(() => router.push('/plants'), 1500);
    } catch {
      setStatus('Failed to save plant.');
    }
    setLoading(false);
  };

  const handleSaveExtracted = () => {
    handleSavePlant({
      name: plantName || nlpResult?.plant_name || 'Unknown',
      scientific_name: '',
      local_language: language,
      geographic_distribution: '',
      disease_cured: nlpResult?.ailments || '',
      preparation_method: nlpResult?.preparation || '',
      dosage: nlpResult?.dosage || '',
      side_effects: '',
      cultural_significance: '',
      cultivation_notes: '',
    });
  };

  const handleSaveManual = () => {
    if (!manualData.name || !manualData.disease_cured || !manualData.preparation_method) {
      Alert.alert('Error', 'Enter plant name, disease cured, and preparation method.');
      return;
    }
    handleSavePlant(manualData);
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['access', 'refresh']);
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Add Plant Information</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logout}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modeRow}>
          <TouchableOpacity style={[styles.modeBtn, mode === 'audio' && styles.modeActive]} onPress={() => setMode('audio')}>
            <Text style={[styles.modeText, mode === 'audio' && styles.modeTextActive]}>Audio Upload</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modeBtn, mode === 'manual' && styles.modeActive]} onPress={() => setMode('manual')}>
            <Text style={[styles.modeText, mode === 'manual' && styles.modeTextActive]}>Manual Entry</Text>
          </TouchableOpacity>
        </View>

        {mode === 'audio' && (
          <>
            <View style={styles.card}>
              <Text style={styles.step}>Step 1: Upload Audio</Text>
              <TextInput style={styles.input} value={plantName} onChangeText={setPlantName} placeholder="Plant name (optional)" placeholderTextColor="#999" />
              <TextInput style={styles.input} value={language} onChangeText={setLanguage} placeholder="Language (e.g. Lugwere)" placeholderTextColor="#999" />
              <TouchableOpacity style={styles.secondaryBtn} onPress={pickFile}>
                <Text style={styles.secondaryBtnText}>{file ? file.name : 'Select Audio File'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={handleUpload} disabled={loading}>
                <Text style={styles.btnText}>{loading ? 'Processing...' : 'Upload File'}</Text>
              </TouchableOpacity>
            </View>

            {transcriptionId && (
              <View style={styles.card}>
                <Text style={styles.step}>Step 2: Transcribe</Text>
                <TouchableOpacity style={styles.orangeBtn} onPress={handleTranscribe} disabled={loading}>
                  <Text style={styles.btnText}>Transcribe with Whisper AI</Text>
                </TouchableOpacity>
              </View>
            )}

            {transcribedText ? (
              <View style={styles.card}>
                <Text style={styles.step}>Step 3: Transcribed Text</Text>
                <Text style={styles.transcript}>{transcribedText}</Text>
                <TouchableOpacity style={styles.btn} onPress={handleNLP} disabled={loading}>
                  <Text style={styles.btnText}>Extract Plant Data (NLP)</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {nlpResult && (
              <View style={styles.card}>
                <Text style={styles.step}>Step 4: Extracted Data</Text>
                <Text style={styles.field}><Text style={styles.label}>Plant:</Text> {nlpResult.plant_name || plantName || 'Not detected'}</Text>
                <Text style={styles.field}><Text style={styles.label}>Disease:</Text> {nlpResult.ailments || 'Not detected'}</Text>
                <Text style={styles.field}><Text style={styles.label}>Preparation:</Text> {nlpResult.preparation || 'Not detected'}</Text>
                <Text style={styles.field}><Text style={styles.label}>Dosage:</Text> {nlpResult.dosage || 'Not detected'}</Text>
                <TouchableOpacity style={styles.btn} onPress={handleSaveExtracted} disabled={loading}>
                  <Text style={styles.btnText}>Save to Database</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {mode === 'manual' && (
          <View style={styles.card}>
            <Text style={styles.step}>Manual Plant Entry</Text>
            {(['name', 'scientific_name', 'local_language', 'geographic_distribution', 'disease_cured', 'preparation_method', 'dosage', 'side_effects', 'cultural_significance', 'cultivation_notes'] as const).map((field) => (
              <TextInput
                key={field}
                style={styles.input}
                value={manualData[field]}
                onChangeText={(v) => setManualData((prev) => ({ ...prev, [field]: v }))}
                placeholder={field.replace(/_/g, ' ')}
                placeholderTextColor="#999"
                multiline={field.includes('method') || field.includes('notes') || field.includes('significance')}
              />
            ))}
            <TouchableOpacity style={styles.orangeBtn} onPress={handleSaveManual} disabled={loading}>
              <Text style={styles.btnText}>Save Plant Information</Text>
            </TouchableOpacity>
          </View>
        )}

        {status ? <Text style={styles.status}>{status}</Text> : null}
        {loading && <ActivityIndicator size="large" color="#1a3a2a" style={{ marginTop: 12 }} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  scroll: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a3a2a' },
  logout: { color: '#C8860A', fontWeight: '600' },
  modeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  modeBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#e8f0ea', alignItems: 'center' },
  modeActive: { backgroundColor: '#1a3a2a' },
  modeText: { fontWeight: '600', color: '#1a3a2a' },
  modeTextActive: { color: 'white' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  step: { fontSize: 16, fontWeight: '700', color: '#1a3a2a', marginBottom: 12 },
  input: { borderWidth: 1.5, borderColor: '#e0ddd8', borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 14, backgroundColor: '#FAFAF8' },
  btn: { backgroundColor: '#1a3a2a', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  orangeBtn: { backgroundColor: '#C8860A', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  secondaryBtn: { backgroundColor: '#e8f0ea', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 10 },
  secondaryBtnText: { color: '#1a3a2a', fontWeight: '600' },
  btnText: { color: 'white', fontWeight: '700' },
  transcript: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 12, lineHeight: 20 },
  field: { marginBottom: 8, lineHeight: 20 },
  label: { fontWeight: '700', color: '#1a3a2a' },
  status: { marginTop: 12, padding: 12, backgroundColor: '#E8F5E9', borderRadius: 8, color: '#2E7D32' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
