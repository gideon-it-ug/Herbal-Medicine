import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPlant, processNLP, transcribeRecording, uploadTranscription } from '../services/api';
import '../App.css';

function Upload() {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState('');
  const [plantName, setPlantName] = useState('');
  const [status, setStatus] = useState('');
  const [transcriptionId, setTranscriptionId] = useState(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [nlpResult, setNlpResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('access');

  const handleUpload = async () => {
    if (!file) { setStatus('Please select an audio file'); return; }
    setLoading(true);
    setStatus('Uploading file...');
    const formData = new FormData();
    formData.append('audio_file', file);
    formData.append('language', language);
    try {
      const data = await uploadTranscription(formData);
      setTranscriptionId(data.id);
      setStatus('File uploaded! Click Transcribe to convert audio to text.');
    } catch { setStatus('Upload failed. Make sure you are logged in.'); }
    setLoading(false);
  };

  const handleTranscribe = async () => {
    setLoading(true);
    setStatus('Transcribing audio with Whisper AI... this may take a few minutes.');
    try {
      const data = await transcribeRecording(transcriptionId, token);
      setTranscribedText(data.transcribed_text);
      setStatus('Transcription complete! Click Extract Data to identify plant information.');
    } catch { setStatus('Transcription failed.'); }
    setLoading(false);
  };

  const handleNLP = async () => {
    setLoading(true);
    setStatus('Extracting plant information with NLP...');
    try {
      const data = await processNLP(transcriptionId);
      setNlpResult(data);
      setStatus('Done! Review the extracted data below and save to the plant database.');
    } catch { setStatus('NLP extraction failed.'); }
    setLoading(false);
  };

  const handleSavePlant = async () => {
    if (!nlpResult) return;
    setLoading(true);
    try {
      await createPlant(token, {
        name: plantName || nlpResult.plant_name,
        ailments_treated: nlpResult.ailments,
        preparation_method: nlpResult.preparation,
        dosage: nlpResult.dosage,
        local_language: language,
      });
      setStatus('Plant saved to database successfully!');
      setTimeout(() => navigate('/plants'), 2000);
    } catch { setStatus('Failed to save plant.'); }
    setLoading(false);
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
        <h2 className='page-title'>🎤 Upload Audio Recording</h2>
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
              <div><strong>Ailments:</strong><p>{nlpResult.ailments || 'Not detected'}</p></div>
              <div><strong>Preparation:</strong><p>{nlpResult.preparation || 'Not detected'}</p></div>
              <div><strong>Dosage:</strong><p>{nlpResult.dosage || 'Not detected'}</p></div>
            </div>
            <br />
            <button className='btn' onClick={handleSavePlant} disabled={loading}>💾 Save to Plant Database</button>
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
