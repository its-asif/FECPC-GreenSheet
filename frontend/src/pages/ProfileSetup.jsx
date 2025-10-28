import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api';
import { Navigate } from 'react-router-dom';

export default function ProfileSetup() {
  const { profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({ fullName: '', department: 'CSE', registrationNumber: '', phoneNumber: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || '',
        department: profile.department || 'CSE',
        registrationNumber: profile.registrationNumber || '',
        phoneNumber: profile.phoneNumber || ''
      });
    }
  }, [profile]);

  if (profile?.approved) return <Navigate to="/sheets" replace />;

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/api/auth/profile', form);
      await refreshProfile();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save');
    } finally { setLoading(false); }
  };

  return (
    <div className="container" style={{maxWidth:600}}>
      <div className="card">
        <h2>Profile Setup</h2>
        <p className="small">Fill in your details. Admin will approve your account shortly.</p>
        <form onSubmit={onSubmit}>
          <label>Full Name</label>
          <input className="input" name="fullName" value={form.fullName} onChange={onChange} placeholder="Your full name" />
          <div style={{height:8}} />
          <label>Department</label>
          <select className="select" name="department" value={form.department} onChange={onChange}>
            <option>CSE</option>
            <option>EEE</option>
            <option>CIVIL</option>
          </select>
          <div style={{height:8}} />
          <label>Registration Number</label>
          <input className="input" name="registrationNumber" value={form.registrationNumber} onChange={onChange} placeholder="e.g., 08XXXXX" />
          <div style={{height:8}} />
          <label>Phone Number</label>
          <input className="input" name="phoneNumber" value={form.phoneNumber} onChange={onChange} placeholder="01XXXXXXXXX" />
          {error && <div className="small" style={{color:'#f87171'}}>{error}</div>}
          <div style={{height:12}} />
          <button className="button" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        </form>
        {profile && !profile.approved && (
          <div className="card" style={{marginTop:16}}>
            Waiting for approval by admin.
          </div>
        )}
      </div>
    </div>
  );
}
