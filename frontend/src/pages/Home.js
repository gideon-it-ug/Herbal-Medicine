import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('access');

  const handleSearch = () => { if (query.trim()) navigate(`/search?q=${query}`); };
  const handleLogout = () => { localStorage.removeItem('access'); localStorage.removeItem('refresh'); navigate('/'); };

  return (
    <div>
      <nav className='navbar'>
        <h1>🌿 Herbal Medicine Repository</h1>
        <div>
          <Link to='/plants'>All Plants</Link>
          <Link to='/chatbot'>Chatbot</Link>
          {isLoggedIn ? (
            <>
              <Link to='/upload'>Upload</Link>
              <span onClick={handleLogout} style={{ color: '#FF8F00', cursor: 'pointer', marginLeft: '20px' }}>Logout</span>
            </>
          ) : (
            <Link to='/login'>Login</Link>
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
            <h3>Upload Recording</h3><p>Upload audio from traditional healers</p><br />
            <Link to={isLoggedIn ? '/upload' : '/login'}><button className='btn btn-orange'>Upload</button></Link>
          </div>
          <div className='card' style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px' }}>🤖</div>
            <h3>Ask the Chatbot</h3><p>Ask questions about herbal remedies</p><br />
            <Link to='/chatbot'><button className='btn'>Chat Now</button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Home;
