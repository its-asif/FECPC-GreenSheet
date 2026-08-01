import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, profile, signIn, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isEnvAdmin = user && (import.meta.env.VITE_ADMIN_EMAILS || '').toLowerCase().split(',').map(s=>s.trim()).includes((user.email||'').toLowerCase());
  const isAdmin = isEnvAdmin || !!profile?.isAdmin;

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="nav">
      <div className="nav-header">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-logo">🟢</span>
          <span className="brand-text">FECPC Tracker</span>
        </Link>
        <button className="nav-toggle" onClick={toggleMenu} aria-label="Toggle Menu">
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      <div className={`nav-links ${isOpen ? 'open' : ''}`}>
        <Link to="/" onClick={closeMenu}>Leaderboard</Link>
        {user && <Link to="/sheets" onClick={closeMenu}>Sheets</Link>}
        {user && <Link to="/tutorials" onClick={closeMenu}>Tutorials</Link>}
        {user && <Link to="/badges" onClick={closeMenu}>My Badges</Link>}
        {user && <Link to="/profile" onClick={closeMenu}>Profile</Link>}
        {isAdmin && (
          <>
            <Link to="/admin/users" onClick={closeMenu}>Admin Users</Link>
            <Link to="/admin/sheets" onClick={closeMenu}>Admin Sheets</Link>
            <Link to="/admin/badges" onClick={closeMenu}>Admin Badges</Link>
            <Link to="/admin/activity" onClick={closeMenu}>Activity</Link>
          </>
        )}
        <div className="nav-user-section">
          {!user && <button className="button" onClick={() => { signIn(); closeMenu(); }}>Login with Google</button>}
          {user && (
            <>
              <span className="small user-name">{profile?.fullName || user.email}</span>
              <button className="button secondary" onClick={() => { signOut(); closeMenu(); }}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
