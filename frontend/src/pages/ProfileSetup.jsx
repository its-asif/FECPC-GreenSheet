import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api';

export default function ProfileSetup() {
  const { profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({ fullName: '', department: 'CSE', registrationNumber: '', batch: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || '',
        department: profile.department || 'CSE',
        registrationNumber: profile.registrationNumber || '',
        batch: profile.batch || ''
      });
    }
  }, [profile]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate inputs: fields cannot be empty/blank
    const fullNameTrimmed = form.fullName.trim();
    const departmentTrimmed = form.department.trim();
    const registrationNumberTrimmed = form.registrationNumber.trim();
    const batchTrimmed = form.batch.trim();

    if (!fullNameTrimmed || !departmentTrimmed || !registrationNumberTrimmed || !batchTrimmed) {
      setError('All fields are required and cannot be empty.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/api/auth/profile', {
        fullName: fullNameTrimmed,
        department: departmentTrimmed,
        registrationNumber: registrationNumberTrimmed,
        batch: batchTrimmed,
      });
      await refreshProfile();
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{maxWidth:600}}>
      <div className="card">
        <h2>Profile Details</h2>
        <p className="small">View or update your profile details below.</p>
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
          <label>Batch Number</label>
          <input className="input" name="batch" value={form.batch} onChange={onChange} placeholder="e.g., 12" />
          {error && <div className="small" style={{color:'#f87171', marginTop: 8}}>{error}</div>}
          {success && <div className="small" style={{color:'#4ade80', marginTop: 8}}>{success}</div>}
          <div style={{height:12}} />
          <button className="button" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
        </form>
        {profile && !profile.approved && (
          <div className="card" style={{ marginTop: 16, borderColor: (profile.fullName?.trim() && profile.department?.trim() && profile.registrationNumber?.trim() && profile.batch?.trim()) ? '#eab308' : '#ef4444' }}>
            {!!(profile.fullName?.trim() && profile.department?.trim() && profile.registrationNumber?.trim() && profile.batch?.trim()) ? (
              <span>Your profile is awaiting admin approval. Please contact the admin on Discord.</span>
            ) : (
              <span style={{ color: '#f87171' }}>Please complete your profile, else the admin won't approve your account.</span>
            )}
          </div>
        )}
        {profile && profile.approved && (
          <div className="card" style={{marginTop:16, borderColor: '#22c55e'}}>
            Status: Approved ✅
          </div>
        )}
      </div>
    </div>
  );
}
