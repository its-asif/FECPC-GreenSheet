import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';

export default function Sheets() {
  const [sheets, setSheets] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/api/sheets');
        setSheets(data.sheets);
        if (data.sheets.length) setActiveId(data.sheets[0].id);
      } catch (e) {}
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (!activeId) return;
    (async () => {
      const { data } = await api.get(`/api/progress/${activeId}`);
      setStatuses(data.statuses || {});
    })();
  }, [activeId]);

  const activeSheet = useMemo(() => sheets.find(s => s.id === activeId), [sheets, activeId]);

  const updateStatus = async (pid, status) => {
    // Optimistically update local status map
    setStatuses((prev) => {
      const next = { ...prev, [pid]: status };
      // Recalculate solved count for the active sheet immediately
      setSheets((prevSheets) => prevSheets.map((s) => {
        if (s.id !== activeId) return s;
        const problems = s.problems || [];
        const solved = problems.reduce((acc, p) => acc + (next[p.id] === 'Done' ? 1 : 0), 0);
        if (s.solvedCount === solved) return s;
        return { ...s, solvedCount: solved };
      }));
      return next;
    });
    try { await api.put(`/api/progress/${activeId}/${pid}`, { status }); } catch {}
  };

  // Keep solvedCount in sync when statuses are reloaded or active sheet changes
  useEffect(() => {
    if (!activeId) return;
    setSheets((prevSheets) => prevSheets.map((s) => {
      if (s.id !== activeId) return s;
      const problems = s.problems || [];
      const solved = problems.reduce((acc, p) => acc + (statuses[p.id] === 'Done' ? 1 : 0), 0);
      if (s.solvedCount === solved) return s;
      return { ...s, solvedCount: solved };
    }));
  }, [statuses, activeId]);

  if (loading) return <div className="center">Loading sheets...</div>;

  if (!sheets.length) return <div className="card">No sheets yet. Please wait for admin to add problems.</div>;

  return (
    <div>
      <div className="card" style={{display:'flex', gap:12, alignItems:'center'}}>
        <label>Sheet:</label>
        <select className="select" value={activeId} onChange={(e)=>setActiveId(e.target.value)}>
          {sheets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {activeSheet && (
        <div className="card" style={{display:'flex', flexDirection:'column', gap:8}}>
          <div style={{display:'flex', gap:12, alignItems:'center', flexWrap:'wrap'}}>
            <strong>{activeSheet.name}</strong>
            <span className="small">Solved {activeSheet.solvedCount ?? 0} / {activeSheet.totalProblems ?? 0}</span>
            <span className="small">
              {activeSheet.totalProblems ? Math.round(((activeSheet.solvedCount || 0) / activeSheet.totalProblems) * 100) : 0}%
            </span>
          </div>
          <div style={{height:10, background:'#2b2b2b', borderRadius:6, overflow:'hidden'}}>
            <div style={{height:'100%', width:`${activeSheet.totalProblems ? ((activeSheet.solvedCount || 0)/activeSheet.totalProblems)*100 : 0}%`, background:'#22c55e'}} />
          </div>
        </div>
      )}

      {activeSheet && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Problem</th>
                <th>Platform</th>
                <th>Link</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activeSheet.problems.map((p, idx) => (
                <tr key={p.id}>
                  <td>{idx+1}</td>
                  <td>{p.title}</td>
                  <td><span className="badge">{p.platform}</span></td>
                  <td><a href={p.link} target="_blank" rel="noreferrer">Open</a></td>
                  <td>
                    <select className="select" value={statuses[p.id] || 'Unopened'} onChange={(e)=>updateStatus(p.id, e.target.value)}>
                      <option>Unopened</option>
                      <option>Tried</option>
                      <option>Done</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
