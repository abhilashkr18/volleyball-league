// Volleyball scoring engine. Pure functions, no database access.
export const targetFor = (setNo, bestOf) => (bestOf > 1 && setNo === bestOf ? 15 : 25);
export const setsToWin = (bestOf) => Math.ceil(bestOf / 2);
export function setWinner(a, b, target) {
  if (Math.max(a, b) >= target && Math.abs(a - b) >= 2) return a > b ? 'a' : 'b';
  return null;
}

const rotate = (c) => [c[1], c[2], c[3], c[4], c[5], c[0]];

export function replaySet({ teamA, teamB, lineupA, lineupB, firstServe, rallies = [], events = [] }) {
  const court = { [teamA]: [...lineupA], [teamB]: [...lineupB] };
  const libero = { [teamA]: {}, [teamB]: {} };
  const subs = { [teamA]: 0, [teamB]: 0 };
  const timeouts = { [teamA]: 0, [teamB]: 0 };
  let serving = firstServe;
  let a = 0;
  let b = 0;
  const rs = [...rallies].sort((x, y) => x.seq - y.seq);
  const es = [...events].sort((x, y) => x.after_seq - y.after_seq || new Date(x.created_at) - new Date(y.created_at));
  let ei = 0;
  const swap = (t, out, inn) => { const i = court[t].indexOf(out); if (i >= 0) court[t][i] = inn; };
  const apply = (e) => {
    const t = e.team_id;
    if (e.kind === 'substitution') { swap(t, e.player_id, e.player_in_id); subs[t] += 1; }
    else if (e.kind === 'libero_in') { swap(t, e.player_id, e.player_in_id); libero[t][e.player_in_id] = e.player_id; }
    else if (e.kind === 'libero_out') { swap(t, e.player_id, e.player_in_id); delete libero[t][e.player_id]; }
    else if (e.kind === 'timeout') timeouts[t] += 1;
  };
  const flush = (upTo) => { while (ei < es.length && es[ei].after_seq <= upTo) apply(es[ei++]); };
  // A libero may not serve (position I) or play in the front row.
  const fixLibero = (t) => {
    for (const [lib, orig] of Object.entries(libero[t])) {
      const i = court[t].indexOf(lib);
      if (i === 0 || (i >= 1 && i <= 3)) { court[t][i] = orig; delete libero[t][lib]; }
    }
  };
  flush(0);
  for (const r of rs) {
    const pt = r.point_team_id;
    if (pt !== serving) { serving = pt; court[pt] = rotate(court[pt]); fixLibero(pt); }
    if (pt === teamA) a += 1; else b += 1;
    flush(r.seq);
  }
  flush(Infinity);
  return { court, serving, server: court[serving][0], scoreA: a, scoreB: b, subs, timeouts, libero, rallies: rs.length };
}

// Technical time-out at 8 and 16 (sets 1-4); side change at 8 in the deciding set.
export function pendingBreak({ setNo, bestOf, a, b, events = [] }) {
  const top = Math.max(a, b);
  const done = (kind, note) => events.some((e) => e.kind === kind && (note === undefined || e.note === note));
  if (bestOf > 1 && setNo === bestOf) {
    return top >= 8 && !done('side_change') ? { kind: 'side_change' } : null;
  }
  for (const th of [8, 16]) {
    if (top >= th && !done('technical_timeout', String(th))) return { kind: 'technical_timeout', at: th };
  }
  return null;
  }
