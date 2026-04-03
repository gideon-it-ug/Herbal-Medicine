import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPlants } from '../services/api';
import '../App.css';

function PlantList() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlants().then(data => { setPlants(data); setLoading(false); });
  }, []);

  if (loading) return <div className="container"><p>Loading plants...</p></div>;

  return (
    <div>
      <nav className="navbar">
        <h1>🌿 Herbal Medicine Repository</h1>
        <div>
          <Link to="/" style={{ color: '#A5D6A7', textDecoration: 'none', marginLeft: '20px' }}>Home</Link>
          <Link to="/upload" style={{ color: '#A5D6A7', textDecoration: 'none', marginLeft: '20px' }}>Upload</Link>
          <Link to="/chatbot" style={{ color: '#A5D6A7', textDecoration: 'none', marginLeft: '20px' }}>Chatbot</Link>
        </div>
      </nav>
      <div className="container">
        <h2 className="page-title">All Medicinal Plants ({plants.length})</h2>
        {plants.map(plant => (
          <div className="card" key={plant.id}>
            <h3>{plant.name}</h3>
            {plant.scientific_name && <span className="badge">{plant.scientific_name}</span>}
            {plant.local_language && <span className="badge">{plant.local_language}</span>}
            {plant.geographic_distribution && <span className="badge">📍 {plant.geographic_distribution}</span>}
            <p style={{ marginTop: '10px' }}><strong>Treats:</strong> {plant.ailments_treated}</p>
            <br />
            <Link to={`/plants/${plant.id}`}>View Full Details →</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlantList;