import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function AdminSheets() {
  const [sheets, setSheets] = useState([]);
  const [newSheet, setNewSheet] = useState('');
  const [newVisibility, setNewVisibility] = useState('public');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await api.get('/api/admin/sheets');
    setSheets(data.sheets || []);
  };

  useEffect(() => { (async()=>{ try{ await load(); } finally{ setLoading(false); } })(); }, []);

  const addSheet = async () => {
    if (!newSheet.trim()) return;
    await api.post('/api/admin/sheets', { name: newSheet.trim(), visibility: newVisibility });
    setNewSheet('');
    setNewVisibility('public');
    setMsg('Sheet added.');
    load();
  };

  const seedGreen = async () => {
    await api.post('/api/admin/seed/greensheet');
    setMsg('Green Sheet seeded.');
    load();
  };

  const toggleVisibility = async (sheetId, current) => {
    const next = current === 'restricted' ? 'public' : 'restricted';
    await api.put(`/api/admin/sheets/${sheetId}`, { visibility: next });
    setMsg(`Sheet visibility set to ${next}.`);
    load();
  };

  if (loading) return <div className="center">Loading sheets...</div>;

  return (
    <div>
      {msg && <div className="card" style={{borderColor:'#16a34a'}}>{msg}</div>}
      <div className="card">
        <h3>Sheets</h3>
        <div style={{display:'flex', gap:8}}>
          <input className="input" placeholder="New sheet name" value={newSheet} onChange={(e)=>setNewSheet(e.target.value)} />
          <select className="select" value={newVisibility} onChange={(e)=>setNewVisibility(e.target.value)}>
            <option value="public">Public</option>
            <option value="restricted">Restricted</option>
          </select>
          <button className="button" onClick={addSheet}>Add</button>
          <button className="button secondary" onClick={seedGreen}>Seed Green Sheet</button>
        </div>
        <div style={{height:12}} />
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Visibility</th><th>Problems</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {sheets.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.visibility}</td>
                <td>{s.problemCount}</td>
                <td>
                  <Link className="button" to={`/admin/sheets/${s.id}`}>Open</Link>
                  <button className="button secondary" style={{marginLeft:8}} onClick={()=>toggleVisibility(s.id, s.visibility)}>
                    {s.visibility === 'restricted' ? 'Make Public' : 'Restrict'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
