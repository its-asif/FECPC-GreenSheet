import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import UserBadges from '../components/UserBadges';

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sheetId: '',
    department: '',
    batch: '',
    includeAdmins: false,
    sortBy: 'done',
    sortDir: 'desc',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    sheetId: '',
    department: '',
    batch: '',
    includeAdmins: false,
    sortBy: 'done',
    sortDir: 'desc',
  });

  const load = async (filtersToApply) => {
    const params = new URLSearchParams();
    if (filtersToApply.sheetId) params.append('sheetId', filtersToApply.sheetId);
    if (filtersToApply.department) params.append('department', filtersToApply.department);
    if (filtersToApply.batch) params.append('batch', filtersToApply.batch);
    if (filtersToApply.includeAdmins) params.append('includeAdmins', 'true');
    params.append('sortBy', filtersToApply.sortBy);
    params.append('sortDir', filtersToApply.sortDir);
    const { data } = await api.get(`/api/leaderboard${params.toString() ? `?${params.toString()}` : ''}`);
    setRows(data.leaderboard || []);
    setSheets(data.sheets || []);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await load(appliedFilters);
      } catch (e) {}
      finally { setLoading(false); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters]);

  const applyFilters = () => {
    setAppliedFilters({...filters});
  };

  if (loading) return <div className="center">Loading leaderboard...</div>;

  return (
    <div className="card">
      <h2>Leaderboard</h2>

      <div style={{display:'grid', gap:8, gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', marginBottom:12}}>
        <select className="select" value={filters.sheetId} onChange={(e)=>setFilters(f=>({...f, sheetId:e.target.value}))}>
          <option value="">All sheets</option>
          {sheets.map(s => <option key={s.id} value={s.id}>{s.name} {s.visibility === 'restricted' ? '(restricted)' : ''}</option>)}
        </select>
        <select className="select" value={filters.department} onChange={(e)=>setFilters(f=>({...f, department:e.target.value}))}>
          <option value="">All Departments</option>
          <option value="CSE">CSE</option>
          <option value="EEE">EEE</option>
          <option value="CIVIL">CIVIL</option>
        </select>
        <input className="input" placeholder="Batch/Reg" value={filters.batch} onChange={(e)=>setFilters(f=>({...f, batch:e.target.value}))} />
        <select className="select" value={filters.sortBy} onChange={(e)=>setFilters(f=>({...f, sortBy:e.target.value}))}>
          <option value="done">Sort: Problems Done</option>
          <option value="name">Sort: Name</option>
          <option value="department">Sort: Department</option>
        </select>
        <select className="select" value={filters.sortDir} onChange={(e)=>setFilters(f=>({...f, sortDir:e.target.value}))}>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
        <label style={{display:'flex', alignItems:'center', gap:6}}>
          <input type="checkbox" checked={filters.includeAdmins} onChange={(e)=>setFilters(f=>({...f, includeAdmins:e.target.checked}))} />
          Include admins
        </label>
      </div>

      <div style={{marginBottom:12}}>
        <button className="button" onClick={applyFilters}>Apply Filters</button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>User</th>
            <th>Dept/Reg</th>
            <th>Total Done</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={r.uid}>
              <td>{idx+1}</td>
              <td style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                <Link to={`/profile/${r.uid}`}>{r.name}</Link>
                <UserBadges uid={r.uid} inline />
              </td>
              <td>{r.deptBatch || '-'}</td>
              <td>{r.doneCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
