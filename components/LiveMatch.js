'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { replaySet, targetFor } from '@/lib/engine';

const CELLS_A = [[4, 3], [5, 2], [0, 1]];
const CELLS_B = [[1, 0], [2, 5], [3, 4]];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const COLOR_A = '#3B82F6';
const COLOR_B = '#FF6A00';

const CSS = `
.lv-live{display:inline-flex;align-items:center;gap:.4rem;background:#c62828;color:#fff;border-radius:999px;padding:.1rem .7rem;font-size:.75rem;font-weight:700;letter-spacing:.06em}
.lv-live i{width:.5rem;height:.5rem;border-radius:50%;background:#fff;animation:lvp 1.2s infinite}
@keyframes lvp{50%{opacity:.25}}
.lv-board{display:grid;grid-template-columns:1fr auto 1fr;gap:.6rem;align-items:center;text-align:center}
.lv-team{display:grid;place-items:center;gap:.25rem;min-width:0}
.lv-team b{font-size:1rem;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.lv-logo{width:56px;height:56px;border-radius:14px;object-fit:cover;border:2px solid var(--or)}
.lv-score{font-family:var(--font-head);font-size:3.4rem;line-height:1}
.lv-sets{font-size:.8rem;color:var(--muted)}
.lv-court{display:grid;grid-template-columns:1fr 10px 1fr;padding:6px;border-radius:14px;background:linear-gradient(180deg,#0f5a63,#0b4650);margin-top:.8rem}
.lv-half{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(3,1fr);gap:4px}
.lv-net{background:repeating-linear-gradient(180deg,#fff 0 7px,#222 7px 12px);border-radius:3px}
.lv-cell{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,.4);border:2px solid var(--tc);border-radius:10px;min-height:64px;padding:2px;min-width:0}
.lv-cell .n{font-family:var(--font-head);font-size:1.6rem;line-height:1}
.lv-cell .p{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.64rem;opacity:.9}
.lv-cell .ps{position:absolute;top:1px;left:4px;font-size:.55rem;opacity:.65}
.lv-cell .bl{position:absolute;top:0;right:3px;font-size:.9rem}
.lv-cell.lib{background:rgba(255,214,0,.28)}
.lv-feed{list-style:none;margin:0;padding:0}
.lv-feed li{display:flex;justify-content:space-between;gap:.6rem;border-top:1px solid var(--line);padding:.45rem 0;font-size:.9rem}
.lv-feed b{white-space:nowrap}
.lv-tbl{width:100%;border-collapse:collapse}
.lv-tbl td,.lv-tbl th{padding:.35rem .2rem;text-align:center;border-top:1px solid var(--line)}
.lv-tbl th{color:var(--muted);font-weight:400;border-top:0}
`;

export default function LiveMatch({ matchId, bestOf, teamA, teamB, players, title }) {
  const router = useRouter();
  const [sb] = useState(() => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
  const [data, setData] = useState(null);
  const byId = useMemo(() => Object.fromEntries(players.map((p) => [p.id, p])), [players]);

  const load = useCallback(async () => {
    const [mt, ss] = await Promise.all([
      sb.from('matches').select('status,winner_team_id').eq('id', matchId).maybeSingle(),
      sb.from('match_sets').select('*').eq('match_id', matchId).order('set_number'),
    ]);
    if (mt.error || ss.error) return;
    const sets = ss.data || [];
    const active = sets.find((s) => !s.completed) || null;
    let lineA = [];
    let lineB = [];
    let rallies = [];
    let events = [];
    if (active) {
      const [lu, rl, ev] = await Promise.all([
        sb.from('set_lineups').select('team_id,slot,player_id').eq('match_id', matchId).eq('set_number', active.set_number).order('slot'),
        sb.from('rallies').select('*').eq('match_id', matchId).eq('set_number', active.set_number).order('seq'),
        sb.from('match_events').select('*').eq('match_id', matchId).eq('set_number', active.set_number).order('created_at'),
      ]);
      lineA = (lu.data || []).filter((x) => x.team_id === teamA.id).map((x) => x.player_id);
      lineB = (lu.data || []).filter((x) => x.team_id === teamB.id).map((x) => x.player_id);
      rallies = rl.data || [];
      events = ev.data || [];
    }
    setData({ status: mt.data ? mt.data.status : 'live', sets, active, lineA, lineB, rallies, events });
  }, [sb, matchId, teamA.id, teamB.id]);

  useEffect(() => {
    load();
    let timer;
    const soon = () => { clearTimeout(timer); timer = setTimeout(load, 150); };
    const ch = sb.channel(`live-${matchId}`);
    ['rallies', 'match_events', 'match_sets'].forEach((table) => ch.on('postgres_changes', { event: '*', schema: 'public', table, filter: `match_id=eq.${matchId}` }, soon));
    ch.on('postgres_changes', { event: '*', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` }, soon);
    ch.subscribe();
    const poll = setInterval(load, 4000);
    return () => { clearInterval(poll); clearTimeout(timer); sb.removeChannel(ch); };
  }, [sb, load, matchId]);

  useEffect(() => { if (data && data.status === 'completed') router.refresh(); }, [data, router]);

  const st = useMemo(() => {
    if (!data || !data.active || data.lineA.length !== 6 || data.lineB.length !== 6) return null;
    return replaySet({ teamA: teamA.id, teamB: teamB.id, lineupA: data.lineA, lineupB: data.lineB, firstServe: data.active.first_serve_team_id, rallies: data.rallies, events: data.events });
  }, [data, teamA.id, teamB.id]);

  const feed = useMemo(() => {
    if (!data) return [];
    const nm = (id) => { const p = byId[id]; return p ? `#${p.jersey} ${p.name}` : 'a player'; };
    const tn = (id) => (id === teamA.id ? teamA.name : id === teamB.id ? teamB.name : '');
    const items = [];
    data.rallies.forEach((r) => {
      let text;
      if (r.action === 'kill') text = `${nm(r.scorer_player_id)}: attack kill`;
      else if (r.action === 'block') text = `${nm(r.scorer_player_id)}: block`;
      else if (r.action === 'ace') text = `${nm(r.scorer_player_id)}: service ace`;
      else if (r.action === 'opp_error') text = r.error_player_id ? `${nm(r.error_player_id)}: ${r.error_kind || 'fault'}` : 'Opponent error';
      else text = `${r.error_kind === 'delay' ? 'Delay penalty' : 'Yellow card'}${r.error_player_id ? ` (${nm(r.error_player_id)})` : ''}`;
      items.push({ k: `r${r.seq}`, t: r.created_at, left: `${tn(r.point_team_id)} · ${text}`, right: `${r.score_a}-${r.score_b}` });
    });
    data.events.forEach((e) => {
      const T = tn(e.team_id);
      const map = {
        substitution: `${T} substitution: ${nm(e.player_in_id)} in for ${nm(e.player_id)}`,
        libero_in: `${T} libero in: ${nm(e.player_in_id)} for ${nm(e.player_id)}`,
        libero_out: `${T} libero out, ${nm(e.player_in_id)} returns`,
        timeout: `${T} time-out`,
        technical_timeout: 'Technical time-out',
        side_change: 'Side change',
        red_card: `${T} ${e.note === 'disqualified' ? 'disqualification' : 'red card'}: ${nm(e.player_id)}`,
        delay_warning: `${T} delay warning`,
      };
      if (map[e.kind]) items.push({ k: `e${e.id}`, t: e.created_at, left: map[e.kind], right: e.score_a !== null ? `${e.score_a}-${e.score_b}` : '' });
    });
    return items.sort((a, b) => new Date(b.t) - new Date(a.t)).slice(0, 10);
  }, [data, byId, teamA, teamB]);

  const logo = (t) => (t.logo_url ? <img className="lv-logo" src={t.logo_url} alt="" /> : <span className="av lv-logo" style={{ fontSize: '1.6rem' }}>{t.name[0]}</span>);
  const done = data ? data.sets.filter((s) => s.completed) : [];
  const winsA = done.filter((s) => s.points_a > s.points_b).length;
  const winsB = done.filter((s) => s.points_b > s.points_a).length;
  const half = (t, cells, color) => (
    <div className="lv-half">
      {cells.flat().map((idx) => {
        const p = byId[st.court[t.id][idx]] || { name: '?', jersey: '', isLibero: false };
        return (
          <div key={idx} className={`lv-cell${p.isLibero ? ' lib' : ''}`} style={{ '--tc': color }}>
            <span className="ps">{ROMAN[idx]}</span>
            {st.serving === t.id && idx === 0 && <span className="bl">🏐</span>}
            <span className="n">{p.jersey}</span>
            <span className="p">{p.name}</span>
          </div>
        );
      })}
    </div>
  );

  if (!data) return <p className="muted">Loading live score…</p>;
  const setNo = data.active ? data.active.set_number : done.length;

  return (
    <div>
      <style>{CSS}</style>
      <p style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap', margin: '0 0 .6rem' }}>
        <span className="lv-live"><i />LIVE</span><span className="muted">{title}</span>
      </p>
      <section className="box">
        <div className="lv-board">
          <div className="lv-team">{logo(teamA)}<b style={{ color: COLOR_A }}>{teamA.name}{st && st.serving === teamA.id ? ' 🏐' : ''}</b></div>
          <div>
            <div className="lv-score">{st ? st.scoreA : 0} <span style={{ color: 'var(--or)' }}>-</span> {st ? st.scoreB : 0}</div>
            <div className="lv-sets">{data.active ? `Set ${setNo} · to ${targetFor(setNo, bestOf)}` : 'Between sets'} · sets {winsA}-{winsB}</div>
          </div>
          <div className="lv-team">{logo(teamB)}<b style={{ color: COLOR_B }}>{teamB.name}{st && st.serving === teamB.id ? ' 🏐' : ''}</b></div>
        </div>
        {st && <div className="lv-court">{half(teamA, CELLS_A, COLOR_A)}<div className="lv-net" aria-hidden="true" />{half(teamB, CELLS_B, COLOR_B)}</div>}
        {st && <p className="muted" style={{ margin: '.5rem 0 0' }}>Sub {st.subs[teamA.id]}/6 · TO {st.timeouts[teamA.id]}/2 ({teamA.name}) | Sub {st.subs[teamB.id]}/6 · TO {st.timeouts[teamB.id]}/2 ({teamB.name})</p>}
      </section>

      {data.sets.length > 0 && (
        <section className="box" style={{ marginTop: '1rem' }}>
          <h3>Set scores</h3>
          <table className="lv-tbl">
            <thead><tr><th>Set</th><th>{teamA.name}</th><th>{teamB.name}</th><th /></tr></thead>
            <tbody>{data.sets.map((s) => (<tr key={s.set_number}><td>{s.set_number}</td><td><b>{s.points_a}</b></td><td><b>{s.points_b}</b></td><td className="muted">{s.completed ? 'Final' : 'In play'}</td></tr>))}</tbody>
          </table>
        </section>
      )}

      <section className="box" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        <h3>Live feed</h3>
        {feed.length === 0 && <p className="muted">Waiting for the first point.</p>}
        <ul className="lv-feed">{feed.map((f) => (<li key={f.k}><span>{f.left}</span><b>{f.right}</b></li>))}</ul>
      </section>
    </div>
  );
                      }
