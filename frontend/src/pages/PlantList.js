import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildMediaUrl, getPlants } from '../services/api';
import '../App.css';

function PlantList() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getPlants().then(data => { setPlants(data); setLoading(false); });
  }, []);

  const filtered = plants.filter(plant =>
    plant.name.toLowerCase().includes(search.toLowerCase()) ||
    (plant.disease_cured && plant.disease_cured.toLowerCase().includes(search.toLowerCase())) ||
    (plant.scientific_name && plant.scientific_name.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="container"><p>Loading plants...</p></div>;

  return (
    <div>
      <nav className="navbar">
        <h1>🌿 Herbal Medicine Repository</h1>
        <div>
          <Link to="/" style={{ color: '#A5D6A7', textDecoration: 'none', marginLeft: '20px' }}>Home</Link>
          <Link to="/chatbot" style={{ color: '#A5D6A7', textDecoration: 'none', marginLeft: '20px' }}>Chatbot</Link>
        </div>
      </nav>
      <div className="container">
        <h2 className="page-title">All Medicinal Plants ({filtered.length})</h2>

        {/* Search bar */}
        <div style={{ marginBottom: '24px' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by plant name, disease or scientific name..."
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: '50px',
              border: '1.5px solid #e0ddd8',
              fontSize: '15px',
              outline: 'none',
              backgroundColor: '#FAFAF8'
            }}
          />
        </div>

        {filtered.length === 0 && (
          <div className="card">
            <p>No plants found for "{search}". Try a different search term.</p>
          </div>
        )}

        {filtered.map(plant => (
          <div className="card" key={plant.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
  {plant.image && (
    <img
      src={buildMediaUrl(plant.image)}
      alt={plant.name}
      style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
    />
  )}
  <div style={{ flex: 1 }}>
  <h3>{plant.name}</h3>
            {plant.scientific_name && <span className="badge">🔬 {plant.scientific_name}</span>}
            {plant.local_language && <span className="badge">{plant.local_language}</span>}
            {plant.geographic_distribution && <span className="badge">📍 {plant.geographic_distribution}</span>}
            <p style={{ marginTop: '10px' }}><strong>Disease Cured:</strong> {plant.disease_cured}</p>
            <br />
            <Link to={`/plants/${plant.id}`}>View Full Details →</Link>
          </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlantList;
