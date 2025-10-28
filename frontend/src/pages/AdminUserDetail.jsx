import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

export default function AdminUserDetail() {
  const { uid } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/api/admin/users/${uid}`);
        setData(data);
      } finally { setLoading(false); }
    })();
  }, [uid]);

  // Hooks must be called unconditionally and in the same order on every render
  // Define filter state and derived memos BEFORE any early returns
  const [statusFilter, setStatusFilter] = useState('All');
  const [sheetFilter, setSheetFilter] = useState('All');

  const problemsRaw = useMemo(() => {
    if (Array.isArray(data?.problems)) return data.problems;
    if (Array.isArray(data?.solvedProblems)) {
      return data.solvedProblems.map(p => ({ ...p, status: 'Done', time: null }));
    }
    return [];
  }, [data]);

  const sheetOptions = useMemo(() => {
    const set = new Set(problemsRaw.map(p => p.sheetName).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [problemsRaw]);

  const problems = useMemo(() => {
    return problemsRaw.filter(p => {
      const statusOk = statusFilter === 'All' || p.status === statusFilter;
      const sheetOk = sheetFilter === 'All' || p.sheetName === sheetFilter;
      return statusOk && sheetOk;
    });
  }, [problemsRaw, statusFilter, sheetFilter]);

  const formatTimeUTCPlus6 = (value) => {
    if (!value) return '-';
    try {
      return new Date(value).toLocaleString(undefined, {
        timeZone: 'Asia/Dhaka', // UTC+6
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
      });
    } catch {
      return '-';
    }
  };

  if (loading) return <div className="center">Loading user...</div>;
  if (!data?.user) return <div className="card">User not found.</div>;

  const u = data.user;

  return (
    <div>
      <div className="card">
        <h3>User Details</h3>
        <div className="small">UID: {u.uid}</div>
        <div>Name: {u.fullName || '(not set)'} {u.isAdmin ? <span className="badge">Admin</span> : null}</div>
        <div>Email: {u.email}</div>
        <div>Department: {u.department || '-'}</div>
        <div>Registration: {u.registrationNumber || '-'}</div>
        <div>Phone: {u.phoneNumber || '-'}</div>
        <div>Approved: {String(u.approved)}</div>
        <div style={{height:12}} />
        <h4>Stats</h4>
        <div>Total Done: {data.stats?.doneCount ?? 0}</div>
        <div style={{height:12}} />
        <Link to="/admin/users" className="button secondary">Back to Users</Link>
      </div>

      <div className="card">
        <h3>User Problems</h3>
        <div style={{display:'flex', gap:8, marginBottom:12}}>
          <label>Status</label>
          <select className="select" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
            <option>All</option>
            <option>Done</option>
            <option>Tried</option>
          </select>
          <label>Sheet</label>
          <select className="select" value={sheetFilter} onChange={(e)=>setSheetFilter(e.target.value)}>
            {sheetOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        {!problems.length ? (
          <div className="small">No problems match the selected filters.</div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Problem</th><th>Platform</th><th>Link</th><th>Sheet</th><th>Status</th><th>Time</th></tr>
            </thead>
            <tbody>
              {problems.map(p => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td><span className="badge">{p.platform}</span></td>
                  <td><a href={p.link} target="_blank" rel="noreferrer">Open</a></td>
                  <td>{p.sheetName}</td>
                  <td>{p.status}</td>
                  <td>{formatTimeUTCPlus6(p.time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
