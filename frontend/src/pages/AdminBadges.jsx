import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function AdminBadges() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [newBadge, setNewBadge] = useState({ name: '', description: '', color: '#22c55e', icon: '🏆' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const load = async () => {
    const { data } = await api.get('/api/badges');
    setBadges(data.badges || []);
  };

  useEffect(() => {
    (async () => {
      try { await load(); } finally { setLoading(false); }
    })();
  }, []);

  const createBadge = async () => {
    if (!newBadge.name.trim()) return;
    await api.post('/api/badges', newBadge);
    setNewBadge({ name: '', description: '', color: '#22c55e', icon: '🏆' });
    setMsg('Badge created.');
    load();
  };

  const deleteBadge = async (badgeId) => {
    const ok = confirm('Delete this badge? This will remove it from all users.');
    if (!ok) return;
    await api.delete(`/api/badges/${badgeId}`);
    setMsg('Badge deleted.');
    load();
  };

  const startEdit = (badge) => {
    setEditingId(badge.id);
    setEditData({
      name: badge.name,
      description: badge.description,
      color: badge.color,
      icon: badge.icon,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (badgeId) => {
    await api.put(`/api/badges/${badgeId}`, editData);
    setMsg('Badge updated.');
    setEditingId(null);
    setEditData({});
    load();
  };

  const generateSheetBadges = async () => {
    await api.post('/api/badges/generate-sheet-badges');
    setMsg('Sheet badges generated.');
    load();
  };

  const autoAwardBadges = async () => {
    const ok = confirm('Auto-award sheet badges to users based on their progress?');
    if (!ok) return;
    const { data } = await api.post('/api/badges/auto-award-sheet-badges');
    setMsg(`Auto-awarded ${data.awarded} badge(s).`);
  };

  if (loading) return <div className="center">Loading badges...</div>;

  return (
    <div>
      {msg && <div className="card" style={{borderColor:'#16a34a'}}>{msg}</div>}
      
      <div className="card">
        <h3>Badge Management</h3>
        <div style={{display:'flex', gap:8, marginBottom:12}}>
          <button className="button" onClick={generateSheetBadges}>Generate Sheet Badges</button>
          <button className="button" onClick={autoAwardBadges}>Auto-Award Sheet Badges</button>
        </div>
      </div>

      <div className="card">
        <h3>Create Manual Badge</h3>
        <div style={{display:'grid', gap:8, gridTemplateColumns:'1fr 2fr 100px 80px auto'}}>
          <input className="input" placeholder="Name" value={newBadge.name} onChange={(e)=>setNewBadge({...newBadge, name:e.target.value})} />
          <input className="input" placeholder="Description" value={newBadge.description} onChange={(e)=>setNewBadge({...newBadge, description:e.target.value})} />
          <input className="input" type="color" value={newBadge.color} onChange={(e)=>setNewBadge({...newBadge, color:e.target.value})} />
          <input className="input" placeholder="Icon" value={newBadge.icon} onChange={(e)=>setNewBadge({...newBadge, icon:e.target.value})} />
          <button className="button" onClick={createBadge}>Create</button>
        </div>
      </div>

      <div className="card">
        <h3>All Badges</h3>
        <table className="table">
          <thead>
            <tr><th>Icon</th><th>Name</th><th>Description</th><th>Type</th><th>Criteria</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {badges.map(b => (
              <tr key={b.id}>
                {editingId === b.id ? (
                  <>
                    <td style={{fontSize:'24px'}}>
                      <input className="input" style={{width:60}} value={editData.icon || ''} onChange={(e)=>setEditData({...editData, icon:e.target.value})} />
                    </td>
                    <td>
                      <div style={{display:'flex', gap:4, alignItems:'center'}}>
                        <input className="input" value={editData.name || ''} onChange={(e)=>setEditData({...editData, name:e.target.value})} />
                        <input type="color" value={editData.color || '#22c55e'} onChange={(e)=>setEditData({...editData, color:e.target.value})} style={{width:40, height:30, border:'none'}} />
                      </div>
                    </td>
                    <td>
                      <input className="input" value={editData.description || ''} onChange={(e)=>setEditData({...editData, description:e.target.value})} />
                    </td>
                    <td>{b.type}</td>
                    <td>{b.criteria || '-'}</td>
                    <td>
                      <button className="button" onClick={()=>saveEdit(b.id)}>Save</button>
                      <button className="button secondary" style={{marginLeft:8}} onClick={cancelEdit}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{fontSize:'24px'}}>{b.icon}</td>
                    <td><span style={{padding:'4px 8px', borderRadius:'4px', backgroundColor:b.color, color:'#000'}}>{b.name}</span></td>
                    <td>{b.description}</td>
                    <td>{b.type}</td>
                    <td>{b.criteria || '-'}</td>
                    <td>
                      <button className="button" onClick={()=>startEdit(b)}>Edit</button>
                      <Link className="button" style={{marginLeft:8}} to={`/admin/badges/${b.id}`}>Manage</Link>
                      <button className="button secondary" style={{marginLeft:8}} onClick={()=>deleteBadge(b.id)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
