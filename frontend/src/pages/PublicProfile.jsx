import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import UserBadges from '../components/UserBadges.jsx';

export default function PublicProfile() {
  const { uid } = useParams();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ totalSolved: 0, totalTried: 0, sheetStats: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/api/profile/${uid}`);
        setProfile(data.profile);
        setStats(data.stats || { totalSolved: 0, totalTried: 0, sheetStats: [] });
      } catch (err) {
        setError('Profile not found');
      } finally {
        setLoading(false);
      }
    })();
  }, [uid]);

  if (loading) return <div className="center">Loading profile...</div>;
  if (error || !profile) return <div className="card">{error || 'Profile not found'}</div>;

  return (
    <div>
      <div className="card">
        <h2>{profile.fullName}</h2>
        <div>Department: {profile.department || '-'}</div>
        <div>Registration: {profile.registrationNumber || '-'}</div>
      </div>

      <div className="card">
        <h3>Badges</h3>
        <UserBadges uid={uid} />
      </div>

      <div className="card">
        <h3>Stats</h3>
        <div style={{display:'flex', gap:16, flexWrap:'wrap'}}>
          <div>Total Solved: {stats.totalSolved}</div>
          <div>Total Tried: {stats.totalTried}</div>
        </div>
        <table className="table" style={{marginTop:12}}>
          <thead>
            <tr><th>Sheet</th><th>Solved</th><th>Tried</th><th>Total</th><th>%</th></tr>
          </thead>
          <tbody>
            {stats.sheetStats.map((s, idx) => (
              <tr key={idx}>
                <td>{s.sheetName}</td>
                <td>{s.solved}</td>
                <td>{s.tried}</td>
                <td>{s.total}</td>
                <td>{s.percentage}%</td>
              </tr>
            ))}
            {!stats.sheetStats.length && (
              <tr><td colSpan={5}>No progress yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
