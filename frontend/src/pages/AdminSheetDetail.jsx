import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function AdminSheetDetail() {
  const { sheetId } = useParams();
  const nav = useNavigate();
  const [sheet, setSheet] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [name, setName] = useState('');
  const [newProblem, setNewProblem] = useState({ title: '', platform: 'BeeCrowd', link: '' });
  const [bulkText, setBulkText] = useState('');

  const load = async () => {
    const { data } = await api.get(`/api/admin/sheets/${sheetId}`);
    setSheet(data.sheet);
    setName(data.sheet?.name || '');
    setProblems(data.problems || []);
  };

  useEffect(() => { (async()=>{ try{ await load(); } finally{ setLoading(false); } })(); }, [sheetId]);

  const saveName = async () => {
    await api.put(`/api/admin/sheets/${sheetId}`, { name });
    setMsg('Sheet name updated.');
    load();
  };

  const deleteSheet = async () => {
    if (!confirm('Delete this sheet and all its problems and progress?')) return;
    await api.delete(`/api/admin/sheets/${sheetId}`);
    nav('/admin/sheets');
  };

  const addProblem = async () => {
    if (!newProblem.title || !newProblem.link) return;
    await api.post(`/api/admin/sheets/${sheetId}/problems`, newProblem);
    setNewProblem({ title: '', platform: 'BeeCrowd', link: '' });
    setMsg('Problem added.');
    load();
  };

  const addBulk = async () => {
    if (!bulkText.trim()) return;
    const { data } = await api.post(`/api/admin/sheets/${sheetId}/problems/bulk`, { bulkText });
    setMsg(`Bulk added: ${data.addedCount} added, ${data.skippedCount} skipped, ${data.errorCount} errors.`);
    setBulkText('');
    load();
  };

  const saveProblem = async (pid, p) => {
    await api.put(`/api/admin/problems/${pid}`, { title: p.title, platform: p.platform, link: p.link });
    setMsg('Problem updated.');
    load();
  };

  const removeProblem = async (pid) => {
    if (!confirm('Delete this problem?')) return;
    await api.delete(`/api/admin/problems/${pid}`);
    setMsg('Problem deleted.');
    load();
  };

  if (loading) return <div className="center">Loading sheet...</div>;
  if (!sheet) return <div className="card">Sheet not found.</div>;

  return (
    <div>
      {msg && <div className="card" style={{borderColor:'#16a34a'}}>{msg}</div>}
      <div className="card">
        <h3>Sheet</h3>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <input className="input" value={name} onChange={(e)=>setName(e.target.value)} />
          <button className="button" onClick={saveName}>Save</button>
          <button className="button secondary" onClick={deleteSheet}>Delete Sheet</button>
          <div style={{marginLeft:'auto'}} />
          <Link to="/admin/sheets" className="button secondary">Back</Link>
        </div>
      </div>

      <div className="card">
        <h3>Problems</h3>
        <div style={{display:'flex', gap:8, marginBottom:12}}>
          <input className="input" placeholder="Title" value={newProblem.title} onChange={(e)=>setNewProblem({...newProblem, title:e.target.value})} />
          <select className="select" value={newProblem.platform} onChange={(e)=>setNewProblem({...newProblem, platform:e.target.value})}>
            <option>BeeCrowd</option>
            <option>Codeforces</option>
            <option>LeetCode</option>
            <option>CodeChef</option>
          </select>
          <input className="input" placeholder="Link" value={newProblem.link} onChange={(e)=>setNewProblem({...newProblem, link:e.target.value})} />
          <button className="button" onClick={addProblem}>Add</button>
        </div>

        <div className="card" style={{marginTop:12}}>
          <h4>Bulk Add</h4>
          <div className="small">One per line, format: title, platform, link</div>
          <div className="small">Example:</div>
          <pre className="small" style={{whiteSpace:'pre-wrap'}}>
problem_name1, BeeCrowd, https://judge.beecrowd.com/en/problems/view/1000 <br/>
problem_name2,  beecrowd,  https://judge.beecrowd.com/en/problems/view/2755
          </pre>
          <textarea className="input" rows={6} placeholder="Paste lines here..." value={bulkText} onChange={(e)=>setBulkText(e.target.value)} />
          <div style={{height:8}} />
          <button className="button" onClick={addBulk}>Add in bulk</button>
        </div>
        <table className="table">
          <thead>
            <tr><th>#</th><th>Title</th><th>Platform</th><th>Link</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {problems.map((p, idx) => (
              <tr key={p.id}>
                <td>{idx+1}</td>
                <td><input className="input" value={p.title} onChange={(e)=>setProblems(ps => ps.map(x=>x.id===p.id?{...x,title:e.target.value}:x))} /></td>
                <td>
                  <select className="select" value={p.platform} onChange={(e)=>setProblems(ps => ps.map(x=>x.id===p.id?{...x,platform:e.target.value}:x))}>
                    <option>BeeCrowd</option>
                    <option>Codeforces</option>
                    <option>LeetCode</option>
                    <option>CodeChef</option>
                  </select>
                </td>
                <td><input className="input" value={p.link} onChange={(e)=>setProblems(ps => ps.map(x=>x.id===p.id?{...x,link:e.target.value}:x))} /></td>
                <td>
                  <button className="button" onClick={()=>saveProblem(p.id, p)}>Save</button>
                  <button className="button secondary" onClick={()=>removeProblem(p.id)} style={{marginLeft:8}}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
