import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import '../App.css';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = { username, password, email, first_name: firstName, last_name: lastName };
      await registerUser(payload);
      setSuccess('Account created successfully. Please login to continue.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError('Registration failed. Please check your information and try again.');
    }
    setLoading(false);
  };

  return (
    <div>
      <nav className='navbar'>
        <h1>🌿 Herbal Medicine Repository</h1>
        <div><Link to='/'>Home</Link></div>
      </nav>
      <div className='container' style={{ maxWidth: '420px', marginTop: '80px' }}>
        <div className='card'>
          <h2 style={{ color: '#1B5E20', marginBottom: '20px' }}>Contributor Signup</h2>
          {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
          {success && <p style={{ color: '#2E7D32', marginBottom: '10px' }}>{success}</p>}
          <div className='form-group'>
            <label>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder='Enter username' />
          </div>
          <div className='form-group'>
            <label>Password</label>
            <input type='password' value={password} onChange={e => setPassword(e.target.value)} placeholder='Enter password' />
          </div>
          <div className='form-group'>
            <label>Email (optional)</label>
            <input type='email' value={email} onChange={e => setEmail(e.target.value)} placeholder='Enter email' />
          </div>
          <div className='form-group'>
            <label>First Name</label>
            <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder='First name' />
          </div>
          <div className='form-group'>
            <label>Last Name</label>
            <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder='Last name' />
          </div>
          <button className='btn' onClick={handleRegister} disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
          <p style={{ marginTop: '16px', textAlign: 'center' }}>
            Already have an account? <Link to='/login' style={{ color: '#1B5E20' }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
export default Register;
