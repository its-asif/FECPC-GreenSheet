import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, onAuthStateChanged, googleSignIn, googleSignOut } from '../firebase';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const { data } = await api.get('/api/auth/me');
          setProfile(data.user);
        } catch (e) {
          setProfile(null);
        }
      } else setProfile(null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const value = {
    user,
    profile,
    loading,
    signIn: googleSignIn,
    signOut: googleSignOut,
    refreshProfile: async () => {
      if (!auth.currentUser) return;
      const { data } = await api.get('/api/auth/me');
      setProfile(data.user);
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
