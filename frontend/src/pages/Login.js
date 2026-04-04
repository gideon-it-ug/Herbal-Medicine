import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.access) {
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);
        navigate('/upload');
      } else {
        setError('Invalid username or password');
      }
    } catch {
      setError('Cannot connect to server');
    }
    setLoading(false);
  };

  return (
    <div>
      <nav className='navbar'>
        <h1>🌿 Herbal Medicine Repository</h1>
        <div><Link to='/'>Home</Link></div>
      </nav>
      <div className='container' style={{ maxWidth: '400px', marginTop: '80px' }}>
        <div className='card'>
          <h2 style={{ color: '#1B5E20', marginBottom: '20px' }}>Researcher Login</h2>
          {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
          <div className='form-group'>
            <label>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder='Enter username' />
          </div>
          <div className='form-group'>
            <label>Password</label>
            <input type='password' value={password} onChange={e => setPassword(e.target.value)} placeholder='Enter password' onKeyPress={e => e.key === 'Enter' && handleLogin()} />
          </div>
          <button className='btn' onClick={handleLogin} disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
export default Login;
