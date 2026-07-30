import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/api';
import '../App.css';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    getProfile().then(data => { setProfile(data); setForm(data); }).catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      await updateProfile(form);
      setProfile(form);
      setEditing(false);
      setMessage('Profile updated successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setMessage('Failed to update profile.');
    }
  };

  if (!profile) return <div className="container"><p>Loading profile...</p></div>;

  return (
    <div>
      <nav className='navbar'>
        <h1>🌿 Herbal Medicine Repository</h1>
        <div>
          <Link to="/" style={{ color: '#A8D5B5', textDecoration: 'none', marginLeft: '20px' }}>Home</Link>
          <Link to="/dashboard" style={{ color: '#A8D5B5', textDecoration: 'none', marginLeft: '20px' }}>Dashboard</Link>
        </div>
      </nav>
      <div className="container">
        <h2 className="page-title">👤 User Profile</h2>
        {message && <p style={{ color: '#2d5a3d', marginBottom: '16px' }}>{message}</p>}
        <div className="card">
          <div className="detail-section"><h4>Username</h4><p>{profile.username}</p></div>
          <div className="detail-section"><h4>Email</h4><p>{profile.email}</p></div>
          <div className="detail-section"><h4>Full Name</h4><p>{profile.first_name} {profile.last_name}</p></div>
          <div className="detail-section"><h4>Role</h4><p>{profile.role}</p></div>
          <div className="detail-section"><h4>Phone</h4><p>{profile.phone_number || 'N/A'}</p></div>
          <div className="detail-section"><h4>Specialization</h4><p>{profile.specialization || 'N/A'}</p></div>
          <div className="detail-section"><h4>Organization</h4><p>{profile.organization || 'N/A'}</p></div>
          <div className="detail-section"><h4>Bio</h4><p>{profile.bio || 'N/A'}</p></div>
          {!editing ? (
            <button className="btn" onClick={() => setEditing(true)}>Edit Profile</button>
          ) : (
            <div>
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone_number || ''} onChange={e => setForm({ ...form, phone_number: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Specialization</label>
                <input value={form.specialization || ''} onChange={e => setForm({ ...form, specialization: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Organization</label>
                <input value={form.organization || ''} onChange={e => setForm({ ...form, organization: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} />
              </div>
              <button className="btn" onClick={handleSave}>Save</button>
              <button className="btn" style={{ background: '#999' }} onClick={() => { setEditing(false); setForm(profile); }}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;