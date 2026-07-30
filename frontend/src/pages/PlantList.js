import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildMediaUrl, getPlants } from '../services/api';
import '../App.css';

function PlantList() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('');
  const [familyFilter, setFamilyFilter] = useState('');
  const [bodyFilter, setBodyFilter] = useState('');
  const [treatmentFilter, setTreatmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    getPlants().then(data => { setPlants(data); setLoading(false); });
  }, []);

  const filtered = plants.filter(plant => {
    const matchesSearch = !search ||
      plant.name.toLowerCase().includes(search.toLowerCase()) ||
      (plant.disease_cured && plant.disease_cured.toLowerCase().includes(search.toLowerCase())) ||
      (plant.scientific_name && plant.scientific_name.toLowerCase().includes(search.toLowerCase()));
    const matchesDisease = !diseaseFilter || (plant.disease_cured && plant.disease_cured.toLowerCase().includes(diseaseFilter.toLowerCase()));
    const matchesFamily = !familyFilter || (plant.plant_family && plant.plant_family.toLowerCase().includes(familyFilter.toLowerCase()));
    const matchesBody = !bodyFilter || (plant.body_system && plant.body_system.toLowerCase().includes(bodyFilter.toLowerCase()));
    const matchesTreatment = !treatmentFilter || (plant.treatment_category && plant.treatment_category.toLowerCase().includes(treatmentFilter.toLowerCase()));
    const matchesStatus = !statusFilter || plant.approval_status === statusFilter;
    return matchesSearch && matchesDisease && matchesFamily && matchesBody && matchesTreatment && matchesStatus;
  });

  if (loading) return <div className="container"><p>Loading plants...</p></div>;

  return (
    <div>
      <nav className="navbar">
        <h1>🌿 Herbal Medicine Repository</h1>
        <div>
          <Link to="/" style={{ color: '#A5D6A7', textDecoration: 'none', marginLeft: '20px' }}>Home</Link>
          <Link to="/plants" style={{ color: '#A5D6A7', textDecoration: 'none', marginLeft: '20px' }}>Plants</Link>
          <Link to="/dashboard" style={{ color: '#A5D6A7', textDecoration: 'none', marginLeft: '20px' }}>Dashboard</Link>
          <Link to="/classify" style={{ color: '#A5D6A7', textDecoration: 'none', marginLeft: '20px' }}>Classify</Link>
          <Link to="/chatbot" style={{ color: '#A5D6A7', textDecoration: 'none', marginLeft: '20px' }}>Chatbot</Link>
        </div>
      </nav>
      <div className="container">
        <h2 className="page-title">All Medicinal Plants ({filtered.length})</h2>

        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by plant name, disease or scientific name..."
            style={{ width: '100%', padding: '12px 20px', borderRadius: '50px', border: '1.5px solid #e0ddd8', fontSize: '15px', outline: 'none', backgroundColor: '#FAFAF8' }}
          />
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <select value={diseaseFilter} onChange={e => setDiseaseFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e0ddd8', fontSize: '14px', backgroundColor: '#FAFAF8' }}>
              <option value=''>All Diseases</option>
            </select>
            <select value={familyFilter} onChange={e => setFamilyFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e0ddd8', fontSize: '14px', backgroundColor: '#FAFAF8' }}>
              <option value=''>All Families</option>
            </select>
            <select value={bodyFilter} onChange={e => setBodyFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e0ddd8', fontSize: '14px', backgroundColor: '#FAFAF8' }}>
              <option value=''>All Body Systems</option>
            </select>
            <select value={treatmentFilter} onChange={e => setTreatmentFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e0ddd8', fontSize: '14px', backgroundColor: '#FAFAF8' }}>
              <option value=''>All Categories</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e0ddd8', fontSize: '14px', backgroundColor: '#FAFAF8' }}>
              <option value=''>All Status</option>
              <option value='approved'>Approved</option>
              <option value='pending'>Pending</option>
              <option value='rejected'>Rejected</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="card">
            <p>No plants found for "{search}". Try a different search term or filter.</p>
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
            {plant.plant_family && <span className="badge">🌿 {plant.plant_family}</span>}
            {plant.treatment_category && <span className="badge">💊 {plant.treatment_category}</span>}
            {plant.body_system && <span className="badge">🫁 {plant.body_system}</span>}
            {plant.geographic_distribution && <span className="badge">📍 {plant.geographic_distribution}</span>}
            <span className="badge" style={{ background: plant.approval_status === 'approved' ? '#C8E6C9' : plant.approval_status === 'pending' ? '#FFF9C4' : '#FFCDD2', color: plant.approval_status === 'approved' ? '#2E7D32' : plant.approval_status === 'pending' ? '#F57F17' : '#C62828' }}>
              {plant.approval_status}
            </span>
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
