import React, { useEffect, useState } from 'react';
import api from '../api';

export default function UserBadges({ uid, inline = false }) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchBadges = async () => {
      if (!uid) return;
      setLoading(true);
      try {
        const { data } = await api.get(`/api/badges/user/${uid}`);
        if (mounted) setBadges(data.badges || []);
      } catch (err) {
        if (mounted) setBadges([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchBadges();
    return () => { mounted = false; };
  }, [uid]);

  // Inline mode (leaderboard): stay quiet when empty/loading
  if (inline) {
    if (loading || !badges.length) return null;
  } else {
    if (loading) return <span className="small">Loading badges...</span>;
    if (!badges.length) return <span className="small">No badges yet</span>;
  }

  const containerStyle = inline
    ? { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }
    : { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 };

  return (
    <div style={containerStyle}>
      {badges.map(b => (
        <span key={b.id} title={b.description || b.name} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 8px',
          borderRadius: 6,
          backgroundColor: b.color || '#e5e7eb',
          color: '#000',
          fontSize: inline ? 12 : 14,
          lineHeight: 1.2,
        }}>
          <span>{b.icon || '🏅'}</span>
          <span>{b.name}</span>
        </span>
      ))}
    </div>
  );
}
