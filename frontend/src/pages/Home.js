import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getPlants, getTranscriptions } from '../services/api';
import '../App.css';

function Home() {
  const [query, setQuery] = useState('');
  const [stats, setStats] = useState({ plants: 0, transcriptions: 0 });
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('access');

  const handleSearch = () => { if (query.trim()) navigate(`/search?q=${query}`); };
  const handleLogout = () => { localStorage.removeItem('access'); localStorage.removeItem('refresh'); navigate('/'); };

  useEffect(() => {
    getPlants().then(data => setStats(prev => ({ ...prev, plants: data.length })));
    getTranscriptions().then(data => setStats(prev => ({ ...prev, transcriptions: data.length })));
  }, []);

  return (
    <div>
      <nav className='navbar'>
        <h1>🌿 Herbal Medicine Repository</h1>
        <div>
          <Link to='/plants'>All Plants</Link>
          <Link to='/dashboard'>Dashboard</Link>
          <Link to='/reports'>Reports</Link>
          <Link to='/approvals'>Approvals</Link>
          <Link to='/classify'>Classify</Link>
          <Link to='/chatbot'>Chatbot</Link>
          {isLoggedIn ? (
            <>
              <Link to='/upload'>Upload</Link>
              <Link to='/profile'>Profile</Link>
              <span onClick={handleLogout} style={{ color: '#FF8F00', cursor: 'pointer', marginLeft: '20px' }}>Logout</span>
            </>
          ) : (
            <>
              <Link to='/login'>Contributor Login</Link>
              <Link to='/register' style={{ marginLeft: '20px' }}>Sign Up</Link>
            </>
          )}
        </div>
      </nav>
      <div className='hero'>
        <h1>Indigenous Herbal Knowledge</h1>
        <p>Preserving traditional medicine from Bukedi Sub-Region, Uganda</p>
        <div className='search-bar'>
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} placeholder='Search by plant name or ailment...' />
          <button onClick={handleSearch}>Search</button>
        </div>
      </div>
      <div style={{ background: '#1a3a2a', padding: '24px 20px' }}>
  <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', textAlign: 'center' }}>
    <div>
      <div style={{ fontSize: '36px', fontWeight: '800', color: '#F5E6C8' }}>{stats.plants}</div>
      <div style={{ fontSize: '13px', color: '#A8D5B5', marginTop: '4px' }}>Plants Documented</div>
    </div>
    <div>
      <div style={{ fontSize: '36px', fontWeight: '800', color: '#F5E6C8' }}>5</div>
      <div style={{ fontSize: '13px', color: '#A8D5B5', marginTop: '4px' }}>Districts Covered</div>
    </div>
    <div>
      <div style={{ fontSize: '36px', fontWeight: '800', color: '#F5E6C8' }}>4</div>
      <div style={{ fontSize: '13px', color: '#A8D5B5', marginTop: '4px' }}>Local Languages</div>
    </div>
    <div>
      <div style={{ fontSize: '36px', fontWeight: '800', color: '#F5E6C8' }}>{stats.transcriptions}</div>
      <div style={{ fontSize: '13px', color: '#A8D5B5', marginTop: '4px' }}>Audio Recordings</div>
    </div>
  </div>
</div>
      <div className='container'>
        <h2 className='page-title'>Quick Access</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div className='card' style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px' }}>🌱</div>
            <h3>Browse Plants</h3><p>Explore all documented medicinal plants</p><br />
            <Link to='/plants'><button className='btn'>View All</button></Link>
          </div>
          <div className='card' style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px' }}>🎤</div>
            <h3>Upload Recording</h3><p>Upload audio or video from traditional healers</p><br />
            <Link to={isLoggedIn ? '/upload' : '/login'}><button className='btn btn-orange'>Upload</button></Link>
          </div>
          <div className='card' style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px' }}>🤖</div>
            <h3>Ask the Chatbot</h3><p>Ask questions about herbal remedies</p><br />
            <Link to='/chatbot'><button className='btn'>Chat Now</button></Link>
          </div>
          <div className='card' style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px' }}>📊</div>
            <h3>Dashboard</h3><p>View system statistics and recent uploads</p><br />
            <Link to={isLoggedIn ? '/dashboard' : '/login'}><button className='btn'>View Dashboard</button></Link>
          </div>
          <div className='card' style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px' }}>📈</div>
            <h3>Reports</h3><p>View analytics and export data</p><br />
            <Link to={isLoggedIn ? '/reports' : '/login'}><button className='btn'>View Reports</button></Link>
          </div>
          <div className='card' style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px' }}>🔍</div>
            <h3>AI Classify</h3><p>Auto-classify plants by disease, family, and body system</p><br />
            <Link to='/classify'><button className='btn'>Classify Now</button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Home;
