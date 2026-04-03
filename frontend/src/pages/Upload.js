import React, { useState } from 'react';
import { uploadTranscription } from '../services/api';
function Upload() {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState('');
  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('audio_file', file);
    formData.append('language', language);
    await uploadTranscription(formData);
    alert('Uploaded successfully!');
  };
  return (
    <div>
      <h2>Upload Audio Recording</h2>
      <input type='file' onChange={e => setFile(e.target.files[0])} />
      <input value={language} onChange={e => setLanguage(e.target.value)} placeholder='Language (e.g. Lugwere)' />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}
export default Upload;