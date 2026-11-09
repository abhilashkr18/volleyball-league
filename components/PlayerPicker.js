'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const rowStyle = { display: 'flex', alignItems: 'center', gap: '.7rem', width: '100%', textAlign: 'left', background: 'var(--panel2)', color: 'var(--text)', boxShadow: 'none', borderRadius: 12, padding: '.5rem .7rem', border: '1px solid var(--line)' };

export default function PlayerPicker({ sportId, registered = [] }) {
  const [q, setQ] = useState('');
  const [list, setList] = useState([]);
  const [picked, setPicked] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (picked || q.trim().length < 2) { setList([]); setBusy(false); return; }
    setBusy(true);
    const t = setTimeout(async () => {
      const sb = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      const { data } = await sb.from('player_sports')
        .select('players!inner(player_code,full_name,photo_url,status)')
        .eq('sport_id', sportId)
        .ilike('players.full_name', `%${q.trim()}%`)
        .limit(8);
      setList((data || []).map((r) => r.players).filter((p) => p && p.status === 'active'));
      setBusy(false);
    }, 250);
    return () => clearTimeout(t);
  }, [q, picked, sportId]);

  const face = (p) => (p.photo_url ? <img className="av" src={p.photo_url} alt="" style={{ width: 40, height: 40 }} /> : <span className="av" style={{ width: 40, height: 40 }}>{p.full_name[0]}</span>);

  return (
    <div>
      <input type="hidden" name="code" value={picked ? picked.player_code : ''} />
      {picked ? (
        <div style={{ ...rowStyle, cursor: 'default' }}>
          {face(picked)}
          <span style={{ flex: 1 }}><b>{picked.full_name}</b><br /><span className="code">{picked.player_code}</span></span>
          <button type="button" className="btn-line" onClick={() => { setPicked(null); setQ(''); }} style={{ padding: '.35rem .9rem' }}>Change</button>
        </div>
      ) : (
        <>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type the player's name" aria-label="Search player by name" autoComplete="off" />
          {q.trim().length >= 2 && !busy && list.length === 0 && <p className="muted" style={{ margin: '.5rem 0 0' }}>No player found for this sport. Check the spelling, or add the sport in the player's profile.</p>}
          <div style={{ display: 'grid', gap: '.4rem', marginTop: '.5rem' }}>
            {list.map((p) => {
              const taken = registered.includes(p.player_code);
              return (
                <button type="button" key={p.player_code} disabled={taken} onClick={() => setPicked(p)} style={{ ...rowStyle, opacity: taken ? 0.5 : 1 }}>
                  {face(p)}
                  <span style={{ flex: 1 }}><b>{p.full_name}</b><br /><span className="code">{p.player_code}</span></span>
                  {taken && <span className="muted">Already registered</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
