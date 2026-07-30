import React, { useState } from 'react';
import { classifyText } from '../services/api';
import '../App.css';

function Classification() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClassify = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const data = await classifyText(text);
      setResult(data);
    } catch (e) {
      setResult({ error: 'Classification failed' });
    }
    setLoading(false);
  };

  return (
    <div>
      <nav className='navbar'>
        <h1>🌿 Herbal Medicine Repository</h1>
        <div>
          <Link to="/" style={{ color: '#A8D5B5', textDecoration: 'none', marginLeft: '20px' }}>Home</Link>
          <Link to="/plants" style={{ color: '#A8D5B5', textDecoration: 'none', marginLeft: '20px' }}>Plants</Link>
        </div>
      </nav>
      <div className="container">
        <h2 className="page-title">🤖 AI Classification</h2>
        <p style={{ color: '#666', marginBottom: '16px' }}>
          Enter text about a medicinal plant to automatically classify it by disease, body system, treatment category, and plant family.
        </p>
        <div className="card">
          <div className="form-group">
            <label>Describe the plant or its uses:</label>
            <textarea
              rows="6"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="e.g., This plant is used to treat malaria and fever. It belongs to the Lamiaceae family and is used as an antimalarial remedy..."
            />
          </div>
          <button className="btn" onClick={handleClassify} disabled={loading || !text.trim()}>
            {loading ? 'Classifying...' : 'Classify'}
          </button>
        </div>

        {result && !result.error && (
          <div style={{ marginTop: '24px' }}>
            <div className="card" style={{ marginBottom: '16px' }}>
              <h3>Detected Diseases</h3>
              {result.diseases.length === 0 ? <p>None detected</p> : (
                <div>{result.diseases.map((d, i) => <span key={i} className="badge">{d}</span>)}</div>
              )}
            </div>
            <div className="card" style={{ marginBottom: '16px' }}>
              <h3>Body Systems</h3>
              {result.body_systems.length === 0 ? <p>None detected</p> : (
                <div>{result.body_systems.map((b, i) => <span key={i} className="badge">{b}</span>)}</div>
              )}
            </div>
            <div className="card" style={{ marginBottom: '16px' }}>
              <h3>Treatment Categories</h3>
              {result.treatment_categories.length === 0 ? <p>None detected</p> : (
                <div>{result.treatment_categories.map((t, i) => <span key={i} className="badge">{t}</span>)}</div>
              )}
            </div>
            <div className="card">
              <h3>Plant Families</h3>
              {result.plant_families.length === 0 ? <p>None detected</p> : (
                <div>{result.plant_families.map((f, i) => <span key={i} className="badge">{f}</span>)}</div>
              )}
            </div>
          </div>
        )}

        {result && result.error && (
          <div className="card" style={{ marginTop: '24px', color: '#c0392b' }}>
            <p>{result.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Classification;