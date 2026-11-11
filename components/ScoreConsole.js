'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { replaySet, targetFor, setsToWin } from '@/lib/engine';
import { scorePoint, undoLast } from '@/app/admin/actions';

// Landscape court. Team A plays on the left, Team B on the right, the net is in the middle.
// Each cell is a court position index: 0=I (serves), 1=II, 2=III, 3=IV, 4=V, 5=VI.
const CELLS_A = [[4, 3], [5, 2], [0, 1]];
const CELLS_B = [[1, 0], [2, 5], [3, 4]];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const FAULTS = ['Serve error', 'Attack error', 'Net touch', 'Out of bounds', 'Double hit', 'Lift / catch', 'Four hits', 'Foot fault', 'Other'];
const COLOR_A = '#3B82F6';
const COLOR_B = '#FF6A00';

const CSS = `
.cs{position:fixed;inset:0;z-index:60;background:#05080d;color:#fff;display:flex;flex-direction:column;font-family:var(--font-body),system-ui,sans-serif}
.cs-top{display:flex;align-items:center;gap:.5rem;padding:.3rem .6rem;background:#0b0f16;border-bottom:1px solid #222}
.cs-team{flex:1;display:flex;align-items:center;gap:.5rem;min-width:0}
.cs-team.r{flex-direction:row-reverse;text-align:right}
.cs-nm{font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.95rem}
.cs-sc{font-family:var(--font-head);font-size:2.4rem;line-height:1;min-width:2.2ch;text-align:center}
.cs-mid{text-align:center;font-size:.72rem;color:#9aa3b2;line-height:1.2}
.cs-mid b{display:block;color:#fff;font-size:.9rem}
.cs-flag{display:inline-block;background:#FF6A00;color:#fff;border-radius:6px;padding:0 .4rem;font-size:.65rem;font-weight:700}
.cs-small{padding:.4rem .8rem;font-size:.8rem;border-radius:10px;background:#1b2230;color:#fff;box-shadow:none;border:1px solid #2c3647;text-decoration:none}
.cs-court{flex:1;min-height:0;display:grid;grid-template-columns:1fr 12px 1fr;gap:0;padding:6px;background:linear-gradient(180deg,#0f5a63,#0b4650)}
.cs-half{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(3,1fr);gap:5px;min-height:0}
.cs-net{background:repeating-linear-gradient(180deg,#fff 0 8px,#222 8px 14px);border-radius:3px}
.cs-cell{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,.38);border:2px solid var(--tc);border-radius:10px;color:#fff;padding:2px;min-height:0;min-width:0;box-shadow:none;font-weight:600}
.cs-cell .n{font-family:var(--font-head);font-size:1.8rem;line-height:1}
.cs-cell .p{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.68rem;opacity:.9}
.cs-cell .ps{position:absolute;top:1px;left:5px;font-size:.6rem;opacity:.65}
.cs-cell .bl{position:absolute;top:0;right:4px;font-size:1rem}
.cs-cell.lib{background:rgba(255,214,0,.28)}
.cs-bot{display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.3rem .6rem;background:#0b0f16;border-top:1px solid #222;min-height:44px}
.cs-msg{flex:1;text-align:center;font-size:.8rem;color:#ffb4b4}
.cs-sheet{position:fixed;inset:0;z-index:70;background:rgba(0,0,0,.72);display:grid;place-items:center;padding:.5rem}
.cs-card{background:#141a24;border:1px solid var(--orline);border-radius:16px;padding:.8rem;width:min(660px,100%);max-height:100%;overflow:auto}
.cs-row{display:flex;gap:.5rem;flex-wrap:wrap;margin:.4rem 0}
.cs-btn{padding:.7rem 1.2rem;border-radius:12px;font-size:1rem}
.cs-chip{padding:.5rem .8rem;border-radius:10px;font-size:.85rem;background:#1b2230;color:#fff;border:1px solid #2c3647;box-shadow:none}
.cs-hint{display:none;background:#FF6A00;color:#fff;text-align:center;font-size:.8rem;padding:.2rem}
@media (orientation:portrait){.cs-hint{display:block}.cs-cell .n{font-size:1.2rem}}
`;

export default function ScoreConsole({ matchId, backHref, bestOf, setNo, teamA, teamB, players, lineupA, lineupB, firstServe, initialRallies, setsWon }) {
  const router = useRouter();
  const [rallies, setRallies] = useState(initialRallies);
  const [sheet, setSheet] = useState(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const byId = useMemo(() => Object.fromEntries(players.map((p) => [p.id, p])), [players]);
  const st = useMemo(
    () => replaySet({ teamA: teamA.id, teamB: teamB.id, lineupA, lineupB, firstServe, rallies, events: [] }),
    [teamA.id, teamB.id, lineupA, lineupB, firstServe, rallies],
  );
  const team = (id) => (id === teamA.id ? teamA : teamB);
  const other = (id) => (id === teamA.id ? teamB : teamA);
  const target = targetFor(setNo, bestOf);
  const need = setsToWin(bestOf);
  const flag = (mine, theirs, won) => {
    if (mine < target - 1 || mine - theirs < 1) return null;
    return won + 1 >= need ? 'MATCH POINT' : 'SET POINT';
  };

  async function award(args) {
    if (busy) return;
    setSheet(null);
    setMsg('');
    setBusy(true);
    const seq = rallies.length + 1;
    setRallies((r) => [...r, { seq, point_team_id: args.pointTeam, serving_team_id: st.serving, server_player_id: st.server, action: args.action }]);
    const res = await scorePoint({ matchId, setNo, ...args });
    if (res && res.error) {
      setRallies((r) => r.filter((x) => x.seq !== seq));
      setMsg(res.error);
    } else if (res && res.setOver) {
      router.refresh();
    }
    setBusy(false);
  }

  async function undo() {
    if (busy) return;
    setBusy(true);
    setMsg('');
    const res = await undoLast({ matchId, setNo });
    if (res && res.error) setMsg(res.error);
    else if (res && res.undone === 'set') router.refresh();
    else setRallies((r) => r.slice(0, -1));
    setBusy(false);
  }

  const half = (t, cells, color) => (
    <div className="cs-half">
      {cells.flat().map((idx) => {
        const pid = st.court[t.id][idx];
        const p = byId[pid] || { name: '?', jersey: '', isLibero: false };
        return (
          <button key={idx} type="button" className={`cs-cell${p.isLibero ? ' lib' : ''}`} style={{ '--tc': color }} onClick={() => setSheet({ playerId: pid, teamId: t.id, idx })} aria-label={`${t.name} position ${ROMAN[idx]} ${p.name}`}>
            <span className="ps">{ROMAN[idx]}</span>
            {st.serving === t.id && idx === 0 && <span className="bl">🏐</span>}
            <span className="n">{p.jersey}</span>
            <span className="p">{p.name}</span>
          </button>
        );
      })}
    </div>
  );

  const fA = flag(st.scoreA, st.scoreB, setsWon.a);
  const fB = flag(st.scoreB, st.scoreA, setsWon.b);
  const sp = sheet ? byId[sheet.playerId] : null;
  const front = sheet ? sheet.idx >= 1 && sheet.idx <= 3 : false;

  return (
    <div className="cs">
      <style>{CSS}</style>
      <div className="cs-hint">Turn your phone sideways for the full court</div>
      <div className="cs-top">
        <Link className="cs-small" href={backHref}>Exit</Link>
        <div className="cs-team">
          <span className="cs-nm" style={{ color: COLOR_A }}>{teamA.name}{st.serving === teamA.id ? ' 🏐' : ''}</span>
          {fA && <span className="cs-flag">{fA}</span>}
        </div>
        <div className="cs-sc">{st.scoreA}</div>
        <div className="cs-mid"><b>SET {setNo}</b>sets {setsWon.a} - {setsWon.b}<br />to {target}</div>
        <div className="cs-sc">{st.scoreB}</div>
        <div className="cs-team r">
          <span className="cs-nm" style={{ color: COLOR_B }}>{teamB.name}{st.serving === teamB.id ? ' 🏐' : ''}</span>
          {fB && <span className="cs-flag">{fB}</span>}
        </div>
        <button type="button" className="cs-small" onClick={undo} disabled={busy}>Undo</button>
      </div>

      <div className="cs-court">
        {half(teamA, CELLS_A, COLOR_A)}
        <div className="cs-net" aria-hidden="true" />
        {half(teamB, CELLS_B, COLOR_B)}
      </div>

      <div className="cs-bot">
        <button type="button" className="cs-small" disabled={busy} onClick={() => award({ pointTeam: teamA.id, action: 'opp_error', errorKind: 'Unknown' })}>+1 {teamA.name} (fault, player unknown)</button>
        <div className="cs-msg" role="status">{busy ? 'Saving…' : msg}</div>
        <button type="button" className="cs-small" disabled={busy} onClick={() => award({ pointTeam: teamB.id, action: 'opp_error', errorKind: 'Unknown' })}>+1 {teamB.name} (fault, player unknown)</button>
      </div>

      {sheet && sp && (
        <div className="cs-sheet" onClick={() => setSheet(null)}>
          <div className="cs-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0 }}>#{sp.jersey} {sp.name} <span className="muted">· {team(sheet.teamId).name} · position {ROMAN[sheet.idx]}</span></h3>
            <p className="muted" style={{ margin: '.5rem 0 0' }}>Point for {team(sheet.teamId).name}</p>
            <div className="cs-row">
              {!sp.isLibero && <button type="button" className="cs-btn" onClick={() => award({ pointTeam: sheet.teamId, action: 'kill', scorer: sheet.playerId })}>Attack kill</button>}
              {!sp.isLibero && front && <button type="button" className="cs-btn" onClick={() => award({ pointTeam: sheet.teamId, action: 'block', scorer: sheet.playerId })}>Block</button>}
              {st.serving === sheet.teamId && sheet.idx === 0 && <button type="button" className="cs-btn" onClick={() => award({ pointTeam: sheet.teamId, action: 'ace', scorer: sheet.playerId })}>Service ace</button>}
            </div>
            <p className="muted" style={{ margin: '.5rem 0 0' }}>Fault by this player (point to {other(sheet.teamId).name})</p>
            <div className="cs-row">
              {FAULTS.map((f) => <button key={f} type="button" className="cs-chip" onClick={() => award({ pointTeam: other(sheet.teamId).id, action: 'opp_error', errorPlayer: sheet.playerId, errorKind: f })}>{f}</button>)}
            </div>
            <button type="button" className="cs-small" onClick={() => setSheet(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
  }
