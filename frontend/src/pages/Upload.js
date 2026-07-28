import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPlant, processNLP, transcribeRecording, uploadTranscription } from '../services/api';
import '../App.css';

function Upload() {
  const [mode, setMode] = useState('audio');
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState('');
  const [plantName, setPlantName] = useState('');
  const [status, setStatus] = useState('');
  const [transcriptionId, setTranscriptionId] = useState(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [nlpResult, setNlpResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualData, setManualData] = useState({
    name: '',
    scientific_name: '',
    local_language: '',
    geographic_distribution: '',
    disease_cured: '',
    preparation_method: '',
    dosage: '',
    side_effects: '',
    cultural_significance: '',
    cultivation_notes: '',
  });
  const navigate = useNavigate();

  const handleManualChange = (field) => (event) => {
    setManualData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus('Please select an audio file');
      return;
    }
    setLoading(true);
    setStatus('Uploading file...');
    const formData = new FormData();
    formData.append('audio_file', file);
    formData.append('language', language);
    try {
      const data = await uploadTranscription(formData);
      setTranscriptionId(data.id);
      setStatus('File uploaded! Click Transcribe to convert audio to text.');
    } catch {
      setStatus('Upload failed. Make sure you are logged in.');
    }
    setLoading(false);
  };

  const handleTranscribe = async () => {
    setLoading(true);
    setStatus('Transcribing audio with Whisper AI... this may take a few minutes.');
    try {
      const data = await transcribeRecording(transcriptionId);
      setTranscribedText(data.transcribed_text);
      setStatus('Transcription complete! Click Extract Data to identify plant information.');
    } catch {
      setStatus('Transcription failed.');
    }
    setLoading(false);
  };

  const handleNLP = async () => {
    setLoading(true);
    setStatus('Extracting plant information with NLP...');
    try {
      const data = await processNLP(transcriptionId);
      setNlpResult(data);
      setStatus('Done! Review the extracted data below and save to the plant database.');
    } catch {
      setStatus('NLP extraction failed.');
    }
    setLoading(false);
  };

  const handleSavePlant = async (payload) => {
    setLoading(true);
    setStatus('Saving plant data to the database...');
    try {
      await createPlant(payload);
      setStatus('Plant saved to database successfully!');
      setTimeout(() => navigate('/plants'), 2000);
    } catch {
      setStatus('Failed to save plant.');
    }
    setLoading(false);
  };

  const handleSaveManualPlant = async () => {
    const payload = { ...manualData };
    if (!payload.name || !payload.disease_cured || !payload.preparation_method) {
      setStatus('Please enter at least plant name, disease cured, and preparation method.');
      return;
    }
    await handleSavePlant(payload);
  };

  const handleSaveExtractedPlant = async () => {
    const payload = {
      name: plantName || nlpResult.plant_name,
      scientific_name: '',
      local_language: language,
      geographic_distribution: '',
      disease_cured: nlpResult.ailments,
      preparation_method: nlpResult.preparation,
      dosage: nlpResult.dosage,
      side_effects: '',
      cultural_significance: '',
      cultivation_notes: '',
    };
    await handleSavePlant(payload);
  };

  return (
    <div>
      <nav className="navbar">
        <h1>🌿 Herbal Medicine Repository</h1>
        <div>
          <Link to="/" style={{ color: '#A5D6A7', textDecoration: 'none', marginLeft: '20px' }}>Home</Link>
          <Link to="/plants" style={{ color: '#A5D6A7', textDecoration: 'none', marginLeft: '20px' }}>Plants</Link>
          <span onClick={() => { localStorage.removeItem('access'); localStorage.removeItem('refresh'); window.location.href='/'; }} style={{ color: '#FF8F00', cursor: 'pointer', marginLeft: '20px' }}>Logout</span>
        </div>
      </nav>
      <div className='container'>
        <h2 className='page-title'>✍️ Add Plant Information</h2>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
          <button className='btn' style={{ flex: 1, background: mode === 'audio' ? '#1B5E20' : '#A5D6A7' }} onClick={() => setMode('audio')}>
            Audio Upload
          </button>
          <button className='btn' style={{ flex: 1, background: mode === 'manual' ? '#1B5E20' : '#A5D6A7' }} onClick={() => setMode('manual')}>
            Manual Entry
          </button>
        </div>

        {mode === 'audio' && (
          <>
            <div className='card'>
              <h3 style={{ marginBottom: '16px', color: '#1B5E20' }}>Step 1: Upload Audio File</h3>
              <div className='form-group'>
                <label>Plant Name (optional — NLP will try to detect it)</label>
                <input value={plantName} onChange={e => setPlantName(e.target.value)} placeholder='e.g. Omwetango' />
              </div>
              <div className='form-group'>
                <label>Language Spoken</label>
                <select value={language} onChange={e => setLanguage(e.target.value)}>
                  <option value=''>Select Language</option>
                  <option>Lugwere</option>
                  <option>Lusamia</option>
                  <option>Lumasaaba</option>
                  <option>Ateso</option>
                  <option>English</option>
                </select>
              </div>
              <div className='form-group'>
                <label>Audio File (mp3, m4a, wav)</label>
                <input type='file' accept='audio/*' onChange={e => setFile(e.target.files[0])} />
              </div>
              <button className='btn' onClick={handleUpload} disabled={loading}>
                {loading ? 'Processing...' : '⬆️ Upload File'}
              </button>
            </div>

            {transcriptionId && (
              <div className='card' style={{ marginTop: '16px' }}>
                <h3 style={{ marginBottom: '16px', color: '#1B5E20' }}>Step 2: Transcribe Audio</h3>
                <p>File uploaded successfully. Click below to convert the audio to text using Whisper AI.</p>
                <br />
                <button className='btn btn-orange' onClick={handleTranscribe} disabled={loading}>
                  🤖 Transcribe with Whisper AI
                </button>
              </div>
            )}

            {transcribedText && (
              <div className='card' style={{ marginTop: '16px' }}>
                <h3 style={{ marginBottom: '10px', color: '#1B5E20' }}>Step 3: Transcribed Text</h3>
                <p style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px' }}>{transcribedText}</p>
                <br />
                <button className='btn' onClick={handleNLP} disabled={loading}>🔍 Extract Plant Data (NLP)</button>
              </div>
            )}

            {nlpResult && (
              <div className='card' style={{ marginTop: '16px' }}>
                <h3 style={{ marginBottom: '16px', color: '#1B5E20' }}>Step 4: Extracted Plant Data</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div><strong>Plant Name:</strong><p>{nlpResult.plant_name || plantName || 'Not detected'}</p></div>
                  <div><strong>Disease Cured:</strong><p>{nlpResult.ailments || 'Not detected'}</p></div>
                  <div><strong>Preparation:</strong><p>{nlpResult.preparation || 'Not detected'}</p></div>
                  <div><strong>Dosage:</strong><p>{nlpResult.dosage || 'Not detected'}</p></div>
                </div>
                <br />
                <button className='btn' onClick={handleSaveExtractedPlant} disabled={loading}>💾 Save to Plant Database</button>
              </div>
            )}
          </>
        )}

        {mode === 'manual' && (
          <div className='card'>
            <h3 style={{ marginBottom: '16px', color: '#1B5E20' }}>Manual Plant Entry</h3>
            <div className='form-group'>
              <label>Plant Name</label>
              <input value={manualData.name} onChange={handleManualChange('name')} placeholder='e.g. Omwetango' />
            </div>
            <div className='form-group'>
              <label>Scientific Name</label>
              <input value={manualData.scientific_name} onChange={handleManualChange('scientific_name')} placeholder='e.g. Hoslundia opposita' />
            </div>
            <div className='form-group'>
              <label>Local Language</label>
              <input value={manualData.local_language} onChange={handleManualChange('local_language')} placeholder='e.g. Lugwere' />
            </div>
            <div className='form-group'>
              <label>Geographic Distribution</label>
              <textarea value={manualData.geographic_distribution} onChange={handleManualChange('geographic_distribution')} placeholder='Where the plant is found'></textarea>
            </div>
            <div className='form-group'>
              <label>Disease Cured</label>
              <textarea value={manualData.disease_cured} onChange={handleManualChange('disease_cured')} placeholder='Disease or condition this plant cures' />
            </div>
            <div className='form-group'>
              <label>Preparation Method</label>
              <textarea value={manualData.preparation_method} onChange={handleManualChange('preparation_method')} placeholder='How the plant is prepared' />
            </div>
            <div className='form-group'>
              <label>Dosage</label>
              <textarea value={manualData.dosage} onChange={handleManualChange('dosage')} placeholder='Recommended dosage' />
            </div>
            <div className='form-group'>
              <label>Side Effects</label>
              <textarea value={manualData.side_effects} onChange={handleManualChange('side_effects')} placeholder='Possible side effects (optional)' />
            </div>
            <div className='form-group'>
              <label>Cultural Significance</label>
              <textarea value={manualData.cultural_significance} onChange={handleManualChange('cultural_significance')} placeholder='Traditional or cultural uses' />
            </div>
            <div className='form-group'>
              <label>Cultivation Notes</label>
              <textarea value={manualData.cultivation_notes} onChange={handleManualChange('cultivation_notes')} placeholder='How the plant is grown or harvested' />
            </div>
            <button className='btn btn-orange' onClick={handleSaveManualPlant} disabled={loading}>
              {loading ? 'Saving...' : '💾 Save Plant Information'}
            </button>
          </div>
        )}

        {status && (
          <div style={{ marginTop: '16px', padding: '12px', background: '#E8F5E9', borderRadius: '6px', color: '#2E7D32' }}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
export default Upload;
