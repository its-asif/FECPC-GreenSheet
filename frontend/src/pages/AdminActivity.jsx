import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AdminActivity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ userUid: '', action: '', limit: 100 });

  const load = async () => {
    const params = new URLSearchParams();
    if (filters.userUid) params.append('userUid', filters.userUid);
    if (filters.action) params.append('action', filters.action);
    params.append('limit', filters.limit);
    const { data } = await api.get(`/api/activity?${params.toString()}`);
    setLogs(data.logs || []);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { await load(); } finally { setLoading(false); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    load();
  };

  if (loading) return <div className="center">Loading activity logs...</div>;

  return (
    <div>
      <div className="card">
        <h2>Activity Logs</h2>
        <div style={{display:'grid', gap:8, gridTemplateColumns:'1fr 1fr 100px auto', marginBottom:12}}>
          <input className="input" placeholder="User UID" value={filters.userUid} onChange={(e)=>setFilters(f=>({...f, userUid:e.target.value}))} />
          <select className="select" value={filters.action} onChange={(e)=>setFilters(f=>({...f, action:e.target.value}))}>
            <option value="">All Actions</option>
            <option value="problem_solved">Problem Solved</option>
            <option value="badge_earned">Badge Earned</option>
            <option value="user_approved">User Approved</option>
            <option value="user_unapproved">User Unapproved</option>
          </select>
          <input className="input" type="number" placeholder="Limit" value={filters.limit} onChange={(e)=>setFilters(f=>({...f, limit:e.target.value}))} />
          <button className="button" onClick={applyFilters}>Apply Filters</button>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr><th>Time</th><th>User</th><th>Action</th><th>Metadata</th></tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.userName}</td>
                <td>{log.action}</td>
                <td><pre style={{fontSize:'0.85em', whiteSpace:'pre-wrap'}}>{JSON.stringify(log.metadata, null, 2)}</pre></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
