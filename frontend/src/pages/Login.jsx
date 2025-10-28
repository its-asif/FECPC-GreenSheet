import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Navigate } from 'react-router-dom';

export default function Login() {
  const { user, profile, signIn } = useAuth();

  if (user) {
    if (!profile) return <Navigate to="/profile" replace />
    return <Navigate to="/sheets" replace />
  }

  return (
    <div className="center">
      <div className="card" style={{textAlign:'center'}}>
        <h2>Welcome to FECPC Practice Tracker</h2>
        <p>Login with your Google account to continue.</p>
        <button className="button" onClick={signIn}>Login with Google</button>
      </div>
    </div>
  );
}
