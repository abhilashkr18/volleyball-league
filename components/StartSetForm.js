'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startSet } from '@/app/admin/actions';

// Court view from behind the baseline: top row is the front row (at the net).
const GRID = [['IV', 3], ['III', 2], ['II', 1], ['V', 4], ['VI', 5], ['I', 0]];

function TeamPicker({ team, players, value, onChange }) {
  const used = value.filter(Boolean);
  return (
    <section className="panel">
      <h3>{team.name}</h3>
      <p className="muted" style={{ margin: '0 0 .5rem' }}>Top row is the front row (at the net). Position I serves.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.5rem' }}>
        {GRID.map(([label, idx]) => (
          <div key={label}>
            <label style={{ margin: '0 0 .2rem' }}>{label}{idx === 0 ? ' · serves' : ''}</label>
            <select aria-label={`${team.name} position ${label}`} value={value[idx] || ''} onChange={(e) => { const v = [...value]; v[idx] = e.target.value; onChange(v); }}>
              <option value="">Choose</option>
              {players.filter((p) => !p.isLibero && (!used.includes(p.id) || p.id === value[idx])).map((p) => (
                <option key={p.id} value={p.id}>#{p.jersey} {p.name}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function StartSetForm({ matchId, setNo, teamA, teamB, playersA, playersB, initialA, initialB, defaultServe }) {
  const router = useRouter();
  const [a, setA] = useState(initialA);
  const [b, setB] = useState(initialB);
  const [serve, setServe] = useState(defaultServe);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function go() {
    setMsg('');
    if (a.filter(Boolean).length !== 6 || b.filter(Boolean).length !== 6) return setMsg('Choose all 6 positions for both teams.');
    setBusy(true);
    const r = await startSet({ matchId, lineupA: a, lineupB: b, firstServe: serve });
    setBusy(false);
    if (r && r.error) return setMsg(r.error);
    router.refresh();
  }

  return (
    <div>
      <h2>Start set {setNo}</h2>
      {msg && <div className="err">{msg}</div>}
      <TeamPicker team={teamA} players={playersA} value={a} onChange={setA} />
      <TeamPicker team={teamB} players={playersB} value={b} onChange={setB} />
      <section className="panel">
        <label htmlFor="serve" style={{ marginTop: 0 }}>Serves first</label>
        <select id="serve" value={serve} onChange={(e) => setServe(e.target.value)}>
          <option value={teamA.id}>{teamA.name}</option>
          <option value={teamB.id}>{teamB.name}</option>
        </select>
        <p><button type="button" onClick={go} disabled={busy}>{busy ? 'Starting…' : `Start set ${setNo}`}</button></p>
      </section>
    </div>
  );
                                                                                     }
