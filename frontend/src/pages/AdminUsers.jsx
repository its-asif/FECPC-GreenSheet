import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = async () => {
    const { data } = await api.get('/api/admin/users');
    setUsers(data.users || []);
  };

  useEffect(() => {
    (async () => {
      try { await load(); } finally { setLoading(false); }
    })();
  }, []);

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

  if (loading) return <div className="center">Loading users...</div>;

  return (
    <div>
      {msg && <div className="card" style={{borderColor:'#16a34a'}}>{msg}</div>}
      <div className="card">
        <h3>Users</h3>
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Dept</th><th>Reg</th><th>Phone</th><th>Admin</th><th>Approved</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.uid}>
                <td><Link to={`/admin/users/${u.uid}`}>{u.fullName || u.email}</Link></td>
                <td>{u.email}</td>
                <td>{u.department}</td>
                <td>{u.registrationNumber}</td>
                <td>{u.phoneNumber}</td>
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
