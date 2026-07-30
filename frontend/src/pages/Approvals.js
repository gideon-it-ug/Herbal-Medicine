import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPendingApprovals, getApprovedPlants, getRejectedPlants, approvePlant, rejectPlant } from '../services/api';
import '../App.css';

function Approvals() {
  const [activeTab, setActiveTab] = useState('pending');
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchPlants = async () => {
      try {
        let data;
        if (activeTab === 'pending') data = await getPendingApprovals();
        else if (activeTab === 'approved') data = await getApprovedPlants();
        else data = await getRejectedPlants();
        setPlants(data);
      } catch (e) {
        setPlants([]);
      }
      setLoading(false);
    };
    fetchPlants();
  }, [activeTab]);

  const handleApprove = async (id) => {
    try {
      await approvePlant(id);
      setPlants(plants.filter(p => p.id !== id));
    } catch (e) {
      alert('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectPlant(id);
      setPlants(plants.filter(p => p.id !== id));
    } catch (e) {
      alert('Failed to reject');
    }
  };

  return (
    <div>
      <nav className='navbar'>
        <h1>🌿 Herbal Medicine Repository</h1>
        <div>
          <Link to="/" style={{ color: '#A8D5B5', textDecoration: 'none', marginLeft: '20px' }}>Home</Link>
          <Link to="/dashboard" style={{ color: '#A8D5B5', textDecoration: 'none', marginLeft: '20px' }}>Dashboard</Link>
          <Link to="/plants" style={{ color: '#A8D5B5', textDecoration: 'none', marginLeft: '20px' }}>Plants</Link>
        </div>
      </nav>
      <div className="container">
        <h2 className="page-title">✅ Knowledge Validation</h2>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button className={`btn ${activeTab === 'pending' ? 'btn-orange' : ''}`} onClick={() => setActiveTab('pending')}>
            Pending ({plants.length})
          </button>
          <button className={`btn ${activeTab === 'approved' ? 'btn-orange' : ''}`} onClick={() => setActiveTab('approved')}>
            Approved
          </button>
          <button className={`btn ${activeTab === 'rejected' ? 'btn-orange' : ''}`} onClick={() => setActiveTab('rejected')}>
            Rejected
          </button>
        </div>

        {loading ? <p>Loading...</p> : plants.length === 0 ? (
          <div className="card"><p>No {activeTab} submissions.</p></div>
        ) : (
          plants.map(plant => (
            <div key={plant.id} className="card" style={{ marginBottom: '16px' }}>
              <h3>{plant.name} <span className="badge">{plant.approval_status}</span></h3>
              <p><strong>Scientific Name:</strong> {plant.scientific_name || 'N/A'}</p>
              <p><strong>Local Name:</strong> {plant.local_language || 'N/A'}</p>
              <p><strong>Disease:</strong> {plant.disease_cured}</p>
              <p><strong>Submitted by:</strong> {plant.submitted_by}</p>
              {activeTab === 'pending' && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button className="btn" onClick={() => handleApprove(plant.id)}>Approve</button>
                  <button className="btn" style={{ background: '#c0392b' }} onClick={() => handleReject(plant.id)}>Reject</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Approvals;