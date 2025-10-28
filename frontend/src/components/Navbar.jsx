import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, profile, signIn, signOut } = useAuth();
  const isAdmin = user && (import.meta.env.VITE_ADMIN_EMAILS || '').toLowerCase().split(',').map(s=>s.trim()).includes((user.email||'').toLowerCase());

  return (
    <nav className="nav">
      <Link to="/" className="brand">FECPC Tracker</Link>
      <Link to="/">Leaderboard</Link>
      {user && <Link to="/sheets">Sheets</Link>}
      {isAdmin && (
        <>
          <Link to="/admin/users">Admin Users</Link>
          <Link to="/admin/sheets">Admin Sheets</Link>
        </>
      )}
      <div style={{ marginLeft: 'auto' }} />
      {!user && <button className="button" onClick={signIn}>Login with Google</button>}
      {user && (
        <>
          <span className="small">{profile?.fullName || user.email}</span>
          <button className="button secondary" onClick={signOut}>Logout</button>
        </>
      )}
    </nav>
  );
}
