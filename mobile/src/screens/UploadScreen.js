import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';

export default function UploadScreen() {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState('');

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*'
    });

    if (result.assets) {
      setFile(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      Alert.alert('Error', 'Please select a file');
      return;
    }

    const formData = new FormData();

    formData.append('audio_file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'audio/mpeg',
    });

    formData.append('language', language);

    try {
      const response = await fetch('http://192.168.X.X:8000/api/upload/', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (response.ok) {
        Alert.alert('Success', 'Uploaded successfully!');
      } else {
        Alert.alert('Error', 'Upload failed');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not connect to server');
    }
  };

  return (
    <View style={{ padding: 20 }}>

      <Text style={{ fontSize: 20, marginBottom: 10 }}>
        Upload Audio Recording
      </Text>

      <TouchableOpacity
        onPress={pickFile}
        style={{
          backgroundColor: '#ccc',
          padding: 10,
          marginBottom: 10
        }}
      >
        <Text>Select Audio File</Text>
      </TouchableOpacity>

      <Text>{file ? file.name : 'No file selected'}</Text>

      <TextInput
        placeholder="Language (e.g. Lugwere)"
        value={language}
        onChangeText={setLanguage}
        style={{
          borderWidth: 1,
          marginVertical: 10,
          padding: 10
        }}
      />

      <TouchableOpacity
        onPress={handleUpload}
        style={{
          backgroundColor: 'green',
          padding: 12,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: 'white' }}>Upload</Text>
      </TouchableOpacity>

    </View>
  );
}