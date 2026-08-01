import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import ProfileSetup from './pages/ProfileSetup.jsx';
import Sheets from './pages/Sheets.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import MyBadges from './pages/MyBadges.jsx';
import PublicProfile from './pages/PublicProfile.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminUserDetail from './pages/AdminUserDetail.jsx';
import AdminSheets from './pages/AdminSheets.jsx';
import AdminSheetDetail from './pages/AdminSheetDetail.jsx';
import AdminBadges from './pages/AdminBadges.jsx';
import AdminBadgeDetail from './pages/AdminBadgeDetail.jsx';
import AdminActivity from './pages/AdminActivity.jsx';
import NumberTheory from './pages/NumberTheory.jsx';
import BasicNumberTheory from './pages/BasicNumberTheory.jsx';
import Tutorials from './pages/Tutorials.jsx';

function Protected({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly) {
    const admins = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map(e=>e.trim().toLowerCase());
    const email = (user.email||'').toLowerCase();
    const isEnvAdmin = admins.includes(email);
    const isDbAdmin = !!profile?.isAdmin;
    if (!isEnvAdmin && !isDbAdmin) return <Navigate to="/" replace />;
  }
  return children;
}

function ApprovedOnly({ children }) {
  const { profile } = useAuth();
  if (!profile) return <Navigate to="/profile" replace />;
  if (!profile.approved) {
    const isProfileFilled = !!(profile.fullName?.trim() && profile.department?.trim() && profile.registrationNumber?.trim() && profile.batch?.trim());
    return (
      <div className="center">
        <div className="card" style={{ textAlign: 'center', maxWidth: '400px', borderColor: isProfileFilled ? '#eab308' : '#ef4444' }}>
          {isProfileFilled ? (
            <>
              <h3 style={{ color: '#eab308', marginBottom: '12px' }}>Awaiting Approval ⏳</h3>
              <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.5' }}>
                Your profile details have been saved. Please contact the admin on Discord to get your account approved.
              </p>
            </>
          ) : (
            <>
              <h3 style={{ color: '#ef4444', marginBottom: '12px' }}>Profile Incomplete ⚠️</h3>
              <p style={{ color: '#f87171', fontSize: '14px', lineHeight: '1.5' }}>
                Please complete your profile, else the admin won't approve your account.
              </p>
              <div style={{ marginTop: '16px' }}>
                <a href="/profile" className="button" style={{ textDecoration: 'none', display: 'inline-block' }}>Go to Profile Setup</a>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Leaderboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Protected><ProfileSetup /></Protected>} />
          <Route path="/profile/:uid" element={<PublicProfile />} />
          <Route path="/sheets" element={<Protected><ApprovedOnly><Sheets /></ApprovedOnly></Protected>} />
          <Route path="/badges" element={<Protected><MyBadges /></Protected>} />
          <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
          <Route path="/admin/users" element={<Protected adminOnly><AdminUsers /></Protected>} />
          <Route path="/admin/users/:uid" element={<Protected adminOnly><AdminUserDetail /></Protected>} />
          <Route path="/admin/sheets" element={<Protected adminOnly><AdminSheets /></Protected>} />
          <Route path="/admin/sheets/:sheetId" element={<Protected adminOnly><AdminSheetDetail /></Protected>} />
          <Route path="/admin/badges" element={<Protected adminOnly><AdminBadges /></Protected>} />
          <Route path="/admin/badges/:badgeId" element={<Protected adminOnly><AdminBadgeDetail /></Protected>} />
          <Route path="/admin/activity" element={<Protected adminOnly><AdminActivity /></Protected>} />
          <Route path="/tutorial/number-theory" element={<NumberTheory />} />
          <Route path="/tutorial/basic-number-theory" element={<BasicNumberTheory />} />
          <Route path="/tutorials" element={<Protected><ApprovedOnly><Tutorials /></ApprovedOnly></Protected>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}
