import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPlant } from '../services/api';
import '../App.css';

function PlantDetail() {
  const { id } = useParams();
  const [plant, setPlant] = useState(null);

  useEffect(() => { getPlant(id).then(data => setPlant(data)); }, [id]);

  if (!plant) return <div className="container"><p>Loading...</p></div>;

  return (
    <div>
      <nav className="navbar">
        <h1>🌿 Herbal Medicine Repository</h1>
        <div>
          <Link to="/" style={{ color: '#A5D6A7', textDecoration: 'none', marginLeft: '20px' }}>Home</Link>
          <Link to="/plants" style={{ color: '#A5D6A7', textDecoration: 'none', marginLeft: '20px' }}>All Plants</Link>
        </div>
      </nav>
      <div className="container">
        <div className="card">
          <h2 style={{ color: '#1B5E20', fontSize: '32px', marginBottom: '10px' }}>{plant.name}</h2>
          {plant.scientific_name && <span className="badge">🔬 {plant.scientific_name}</span>}
          {plant.local_language && <span className="badge">🗣️ {plant.local_language}</span>}
          {plant.geographic_distribution && <span className="badge">📍 {plant.geographic_distribution}</span>}

          {plant.image && (
            <img
              src={`http://127.0.0.1:8000/media/${plant.image.name || plant.image}`}
              alt={plant.name}
              style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px', marginTop: '16px' }}
            />
          )}

          <hr style={{ margin: '20px 0', borderColor: '#e0e0e0' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="detail-section">
              <h4>Disease Treated</h4>
              <p>{plant.ailments_treated || 'Not specified'}</p>
            </div>
            <div className="detail-section">
              <h4>Dosage</h4>
              <p>{plant.dosage || 'Not specified'}</p>
            </div>
            <div className="detail-section">
              <h4>Preparation Method</h4>
              <p>{plant.preparation_method || 'Not specified'}</p>
            </div>
            <div className="detail-section">
              <h4>Side Effects</h4>
              <p>{plant.side_effects || 'None documented'}</p>
            </div>
            <div className="detail-section">
              <h4>Cultural Significance</h4>
              <p>{plant.cultural_significance || 'Not documented'}</p>
            </div>
            <div className="detail-section">
              <h4>Cultivation Notes</h4>
              <p>{plant.cultivation_notes || 'Not documented'}</p>
            </div>
          </div>
        </div>
        <Link to="/plants"><button className="btn" style={{ marginTop: '16px' }}>← Back to All Plants</button></Link>
      </div>
    </div>
  );
}

export default PlantDetail;