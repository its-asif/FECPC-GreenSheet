import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [newSheet, setNewSheet] = useState('');
  const [selectedSheet, setSelectedSheet] = useState('');
  const [problem, setProblem] = useState({ title: '', platform: 'BeeCrowd', link: '' });
  const [msg, setMsg] = useState('');
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  const load = async () => {
    const [{ data: u }, { data: s }] = await Promise.all([
      api.get('/api/admin/users'),
      api.get('/api/sheets')
    ]);
    setUsers(u.users || []);
    setSheets(s.sheets || []);
    if (!selectedSheet && (s.sheets||[]).length) setSelectedSheet(s.sheets[0].id);
  };

  useEffect(() => { load().catch(()=>{}); }, []);

  const approve = async (uid, approved) => {
    await api.post('/api/admin/users/approve', { uid, approved });
    setMsg('Updated user approval.');
    load();
  };

  const addSheet = async () => {
    if (!newSheet.trim()) return;
    await api.post('/api/admin/sheets', { name: newSheet.trim() });
    setNewSheet('');
    setMsg('Sheet added.');
    load();
  };

  const addProblem = async () => {
    if (!selectedSheet || !problem.title || !problem.link) return;
    await api.post(`/api/admin/sheets/${selectedSheet}/problems`, problem);
    setProblem({ title: '', platform: 'BeeCrowd', link: '' });
    setMsg('Problem added.');
    load();
  };

  const seedGreen = async () => {
    await api.post('/api/admin/seed/greensheet');
    setMsg('Green Sheet seeded.');
    load();
  }

  const fillDefaults = async () => {
    if (!confirm('Fill missing default fields across users/sheets/problems?')) return;
    setMaintenanceLoading(true);
    try {
      const { data } = await api.post('/api/admin/maintenance/fill-defaults');
      setMsg(`Filled defaults. Updated: usersAllowed=${data.updated?.usersAllowed ?? 0}, usersAdmin=${data.updated?.usersAdmin ?? 0}, usersApproved=${data.updated?.usersApproved ?? 0}, sheetsVisibility=${data.updated?.sheetsVisibility ?? 0}, problemsCreatedBy=${data.updated?.problemsCreatedBy ?? 0}`);
    } catch (e) {
      setMsg('Failed to fill defaults.');
    } finally {
      setMaintenanceLoading(false);
      load();
    }
  }

  return (
    <div>
      {msg && <div className="card" style={{borderColor:'#16a34a'}}>{msg}</div>}

      <div className="card">
        <h3>Users</h3>
        <button className="button secondary" disabled={maintenanceLoading} onClick={fillDefaults} style={{marginBottom:8}}>
          {maintenanceLoading ? 'Filling defaults...' : 'Fill Missing Defaults'}
        </button>
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Department</th><th>Reg.</th><th>Phone</th><th>Approved</th><th>Action</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.uid}>
                <td>{u.fullName || u.email}</td>
                <td>{u.department}</td>
                <td>{u.registrationNumber}</td>
                <td>{u.phoneNumber}</td>
                <td>{String(u.approved)}</td>
                <td>
                  {u.approved ? (
                    <button className="button secondary" onClick={()=>approve(u.uid, false)}>Revoke</button>
                  ) : (
                    <button className="button" onClick={()=>approve(u.uid, true)}>Approve</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Sheets</h3>
        <div style={{display:'flex', gap:8}}>
          <input className="input" placeholder="New sheet name" value={newSheet} onChange={(e)=>setNewSheet(e.target.value)} />
          <button className="button" onClick={addSheet}>Add</button>
          <button className="button secondary" onClick={seedGreen}>Seed Green Sheet</button>
        </div>
        <div style={{height:12}} />
        <div style={{display:'flex', gap:8}}>
          <select className="select" value={selectedSheet} onChange={(e)=>setSelectedSheet(e.target.value)}>
            {sheets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input className="input" placeholder="Problem title" value={problem.title} onChange={(e)=>setProblem({...problem, title: e.target.value})} />
          <select className="select" value={problem.platform} onChange={(e)=>setProblem({...problem, platform: e.target.value})}>
            <option>BeeCrowd</option>
            <option>Codeforces</option>
            <option>LeetCode</option>
            <option>CodeChef</option>
          </select>
          <input className="input" placeholder="Problem link" value={problem.link} onChange={(e)=>setProblem({...problem, link: e.target.value})} />
          <button className="button" onClick={addProblem}>Add Problem</button>
        </div>
      </div>
    </div>
  );
}
