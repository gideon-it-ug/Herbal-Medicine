import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getReportsSummary } from '../services/api';
import '../App.css';

function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReportsSummary()
      .then(data => { setReport(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="container"><p>Loading reports...</p></div>;
  if (!report) return <div className="container"><p>Failed to load reports.</p></div>;

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
        <h2 className="page-title">📈 Reports & Analytics</h2>
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3>Total Approved Plants: {report.total_approved}</h3>
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <h3>Disease Distribution</h3>
          {report.disease_distribution.map((d, i) => (
            <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f0ede8' }}>
              <span>{d.disease_cured || 'Uncategorized'}</span>
              <span className="badge" style={{ marginLeft: '12px' }}>{d.count} plants</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <h3>Plant Family Distribution</h3>
          {report.family_distribution.map((f, i) => (
            <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f0ede8' }}>
              <span>{f.plant_family || 'Uncategorized'}</span>
              <span className="badge" style={{ marginLeft: '12px' }}>{f.count} plants</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <h3>Body System Distribution</h3>
          {report.body_system_distribution.map((b, i) => (
            <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f0ede8' }}>
              <span>{b.body_system || 'Uncategorized'}</span>
              <span className="badge" style={{ marginLeft: '12px' }}>{b.count} plants</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <h3>Treatment Category Distribution</h3>
          {report.treatment_category_distribution.map((t, i) => (
            <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f0ede8' }}>
              <span>{t.treatment_category || 'Uncategorized'}</span>
              <span className="badge" style={{ marginLeft: '12px' }}>{t.count} plants</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h3>Top Contributors</h3>
          {report.top_contributors.map((c, i) => (
            <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f0ede8' }}>
              <span>{c.submitted_by__username}</span>
              <span className="badge" style={{ marginLeft: '12px' }}>{c.count} plants</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Reports;