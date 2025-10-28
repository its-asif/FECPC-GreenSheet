import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/api/leaderboard');
        setRows(data.leaderboard || []);
      } catch (e) {}
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="center">Loading leaderboard...</div>;

  return (
    <div className="card">
      <h2>Leaderboard</h2>
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>User</th>
            <th>Total Done</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={r.uid}>
              <td>{idx+1}</td>
              <td>{r.name} {r.deptBatch ? `(${r.deptBatch})` : ''}</td>
              <td>{r.doneCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
