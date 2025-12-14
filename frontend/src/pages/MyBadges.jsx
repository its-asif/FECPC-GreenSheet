import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import UserBadges from '../components/UserBadges.jsx';

export default function MyBadges() {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data } = await api.get(`/api/badges/user/${user.uid}`);
        setBadges(data.badges || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!user) return <div className="center">Please login.</div>;
  if (loading) return <div className="center">Loading badges...</div>;

  return (
    <div className="card">
      <h2>My Badges</h2>
      {!badges.length && <div>No badges yet.</div>}
      {badges.length > 0 && <UserBadges uid={user.uid} />}
    </div>
  );
}
