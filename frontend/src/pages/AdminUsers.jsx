import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [selectedUids, setSelectedUids] = useState(new Set());
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    batch: '',
    approved: 'all',
    admin: 'all',
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  const load = async () => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.department) params.append('department', filters.department);
    if (filters.batch) params.append('batch', filters.batch);
    if (filters.approved !== 'all') params.append('approved', filters.approved);
    if (filters.admin !== 'all') params.append('admin', filters.admin);
    params.append('sortBy', filters.sortBy);
    params.append('sortDir', filters.sortDir);
    const qs = params.toString();
    const { data } = await api.get(`/api/admin/users${qs ? `?${qs}` : ''}`);
    setUsers(data.users || []);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { await load(); } finally { setLoading(false); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const approve = async (uid, approved) => {
    await api.post('/api/admin/users/approve', { uid, approved });
    setMsg('Updated user approval.');
    load();
  };

  const setAdmin = async (uid, isAdmin) => {
    await api.post('/api/admin/users/role', { uid, isAdmin });
    setMsg(isAdmin ? 'User promoted to admin.' : 'User removed from admin.');
    load();
  };

  const deleteUser = async (uid) => {
    const ok = confirm('Delete this user and all their progress? This cannot be undone.');
    if (!ok) return;
    await api.delete(`/api/admin/users/${uid}`);
    setMsg('User deleted.');
    load();
  };

  const toggleSelect = (uid) => {
    setSelectedUids(prev => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedUids.size === users.length) {
      setSelectedUids(new Set());
    } else {
      setSelectedUids(new Set(users.map(u => u.uid)));
    }
  };

  const bulkApprove = async (approved) => {
    if (selectedUids.size === 0) {
      setMsg('No users selected.');
      return;
    }
    const ok = confirm(`${approved ? 'Approve' : 'Revoke approval for'} ${selectedUids.size} user(s)?`);
    if (!ok) return;
    
    await api.post('/api/admin/users/bulk-approve', { uids: Array.from(selectedUids), approved });
    setMsg(`Bulk ${approved ? 'approved' : 'revoked'} ${selectedUids.size} user(s).`);
    setSelectedUids(new Set());
    load();
  };

  if (loading) return <div className="center">Loading users...</div>;

  return (
    <div>
      {msg && <div className="card" style={{borderColor:'#16a34a'}}>{msg}</div>}
      <div className="card" style={{display:'flex', flexDirection:'column', gap:8}}>
        <h4>Filters</h4>
        <div style={{display:'grid', gap:8, gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))'}}>
          <input className="input" placeholder="Search name/email" value={filters.search} onChange={(e)=>setFilters(f=>({...f, search:e.target.value}))} />
          <input className="input" placeholder="Department" value={filters.department} onChange={(e)=>setFilters(f=>({...f, department:e.target.value}))} />
          <input className="input" placeholder="Batch/Reg" value={filters.batch} onChange={(e)=>setFilters(f=>({...f, batch:e.target.value}))} />
          <select className="select" value={filters.approved} onChange={(e)=>setFilters(f=>({...f, approved:e.target.value}))}>
            <option value="all">Approved + Pending</option>
            <option value="true">Approved only</option>
            <option value="false">Pending only</option>
          </select>
          <select className="select" value={filters.admin} onChange={(e)=>setFilters(f=>({...f, admin:e.target.value}))}>
            <option value="all">Admins + Users</option>
            <option value="true">Admins only</option>
            <option value="false">Non-admins only</option>
          </select>
          <div style={{display:'flex', gap:8}}>
            <select className="select" value={filters.sortBy} onChange={(e)=>setFilters(f=>({...f, sortBy:e.target.value}))}>
              <option value="createdAt">Sort: Recent</option>
              <option value="name">Sort: Name</option>
              <option value="department">Sort: Department</option>
              <option value="problemsAdded">Sort: Problems Added</option>
              <option value="done">Sort: Problems Done</option>
            </select>
            <select className="select" value={filters.sortDir} onChange={(e)=>setFilters(f=>({...f, sortDir:e.target.value}))}>
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </div>
      </div>
      <div className="card">
        <h3>Users</h3>
        {selectedUids.size > 0 && (
          <div style={{marginBottom:12, display:'flex', gap:8, alignItems:'center'}}>
            <span>{selectedUids.size} user(s) selected</span>
            <button className="button" onClick={()=>bulkApprove(true)}>Bulk Approve</button>
            <button className="button secondary" onClick={()=>bulkApprove(false)}>Bulk Revoke</button>
            <button className="button secondary" onClick={()=>setSelectedUids(new Set())}>Clear Selection</button>
          </div>
        )}
        <table className="table">
          <thead>
            <tr>
              <th><input type="checkbox" checked={selectedUids.size === users.length && users.length > 0} onChange={toggleSelectAll} /></th>
              <th>Name</th><th>Email</th><th>Dept</th><th>Reg</th><th>Phone</th><th>Added Problems</th><th>Done</th><th>Admin</th><th>Approved</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.uid}>
                <td><input type="checkbox" checked={selectedUids.has(u.uid)} onChange={()=>toggleSelect(u.uid)} /></td>
                <td><Link to={`/admin/users/${u.uid}`}>{u.fullName || u.email}</Link></td>
                <td>{u.email}</td>
                <td>{u.department}</td>
                <td>{u.registrationNumber}</td>
                <td>{u.phoneNumber}</td>
                <td>{u.problemsAddedCount ?? 0}</td>
                <td>{u.doneCount ?? 0}</td>
                <td>
                  {u.isAdmin ? (
                    <>
                      <span className="badge">Admin</span>
                      <button className="button secondary" style={{marginLeft:8}} onClick={()=>setAdmin(u.uid, false)}>Remove Admin</button>
                    </>
                  ) : (
                    <button className="button" onClick={()=>setAdmin(u.uid, true)}>Make Admin</button>
                  )}
                </td>
                <td>{String(u.approved)}</td>
                <td>
                  {u.approved ? (
                    <button className="button secondary" onClick={()=>approve(u.uid, false)}>Revoke</button>
                  ) : (
                    <button className="button" onClick={()=>approve(u.uid, true)}>Approve</button>
                  )}
                  <button className="button secondary" style={{marginLeft:8}} onClick={()=>deleteUser(u.uid)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
