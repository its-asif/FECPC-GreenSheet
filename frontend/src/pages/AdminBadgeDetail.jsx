import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

export default function AdminBadgeDetail() {
  const { badgeId } = useParams();
  const [badge, setBadge] = useState(null);
  const [users, setUsers] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [selectedUid, setSelectedUid] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [badgesRes, usersRes] = await Promise.all([
          api.get('/api/badges'),
          api.get('/api/admin/users'),
        ]);
        const b = badgesRes.data.badges.find(x => x.id === badgeId);
        setBadge(b);
        setUsers(usersRes.data.users || []);
        
        // Get users who have this badge
        const awarded = [];
        for (const u of usersRes.data.users) {
          const { data } = await api.get(`/api/badges/user/${u.uid}`);
          if (data.badges.find(ub => ub.id === badgeId)) {
            awarded.push({ ...u, awardedAt: data.badges.find(ub => ub.id === badgeId).awardedAt });
          }
        }
        setUserBadges(awarded);
      } finally {
        setLoading(false);
      }
    })();
  }, [badgeId]);

  const awardBadge = async () => {
    if (!selectedUid) return;
    await api.post('/api/badges/award', { userUid: selectedUid, badgeId });
    setMsg('Badge awarded.');
    setSelectedUid('');
    window.location.reload();
  };

  const revokeBadge = async (uid) => {
    const ok = confirm('Revoke this badge from user?');
    if (!ok) return;
    await api.delete('/api/badges/award', { data: { userUid: uid, badgeId } });
    setMsg('Badge revoked.');
    window.location.reload();
  };

  if (loading) return <div className="center">Loading...</div>;
  if (!badge) return <div className="card">Badge not found.</div>;

  return (
    <div>
      {msg && <div className="card" style={{borderColor:'#16a34a'}}>{msg}</div>}
      
      <div className="card">
        <h2>{badge.icon} {badge.name}</h2>
        <div>Description: {badge.description}</div>
        <div>Type: {badge.type}</div>
        {badge.criteria && <div>Criteria: {badge.criteria}</div>}
        <div>Color: <span style={{padding:'4px 12px', borderRadius:'4px', backgroundColor:badge.color}}>{badge.color}</span></div>
      </div>

      <div className="card">
        <h3>Award Badge</h3>
        <div style={{display:'flex', gap:8}}>
          <select className="select" value={selectedUid} onChange={(e)=>setSelectedUid(e.target.value)}>
            <option value="">Select user...</option>
            {users.map(u => (
              <option key={u.uid} value={u.uid}>{u.fullName || u.email}</option>
            ))}
          </select>
          <button className="button" onClick={awardBadge}>Award</button>
        </div>
      </div>

      <div className="card">
        <h3>Users with this Badge ({userBadges.length})</h3>
        <table className="table">
          <thead>
            <tr><th>User</th><th>Awarded At</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {userBadges.map(u => (
              <tr key={u.uid}>
                <td>{u.fullName || u.email}</td>
                <td>{new Date(u.awardedAt).toLocaleString()}</td>
                <td>
                  <button className="button secondary" onClick={()=>revokeBadge(u.uid)}>Revoke</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
