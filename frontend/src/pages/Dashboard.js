import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../services/api';
import '../App.css';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="container"><p>Loading dashboard...</p></div>;
  if (!stats) return <div className="container"><p>Failed to load dashboard.</p></div>;

  return (
    <div>
      <nav className='navbar'>
        <h1>🌿 Herbal Medicine Repository</h1>
        <div>
          <Link to="/" style={{ color: '#A8D5B5', textDecoration: 'none', marginLeft: '20px' }}>Home</Link>
          <Link to="/plants" style={{ color: '#A8D5B5', textDecoration: 'none', marginLeft: '20px' }}>Plants</Link>
          <Link to="/approvals" style={{ color: '#A8D5B5', textDecoration: 'none', marginLeft: '20px' }}>Approvals</Link>
          <Link to="/reports" style={{ color: '#A8D5B5', textDecoration: 'none', marginLeft: '20px' }}>Reports</Link>
        </div>
      </nav>
      <div className="container">
        <h2 className="page-title">📊 Dashboard</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div className="card">
            <h3>{stats.total_plants}</h3>
            <p>Total Plants</p>
          </div>
          <div className="card">
            <h3 style={{ color: '#2d5a3d' }}>{stats.approved_plants}</h3>
            <p>Approved</p>
          </div>
          <div className="card">
            <h3 style={{ color: '#C8860A' }}>{stats.pending_plants}</h3>
            <p>Pending Approval</p>
          </div>
          <div className="card">
            <h3 style={{ color: '#c0392b' }}>{stats.rejected_plants}</h3>
            <p>Rejected</p>
          </div>
          <div className="card">
            <h3>{stats.total_practitioners}</h3>
            <p>Practitioners</p>
          </div>
          <div className="card">
            <h3>{stats.unique_diseases}</h3>
            <p>Diseases Documented</p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <h3>Top Plant Families</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {stats.top_families.map((f, i) => (
              <span key={i} className="badge">{f.plant_family || 'Uncategorized'}: {f.count}</span>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <h3>Top Body Systems</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {stats.top_body_systems.map((b, i) => (
              <span key={i} className="badge">{b.body_system || 'Uncategorized'}: {b.count}</span>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Recent Uploads</h3>
          {stats.recent_uploads.map((plant, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f0ede8' }}>
              <Link to={`/plants/${plant.id}`} style={{ fontWeight: 600 }}>{plant.name}</Link>
              <span className="badge" style={{ marginLeft: '12px' }}>{plant.approval_status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;