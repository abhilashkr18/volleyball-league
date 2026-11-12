// Match statistics, calculated from the rally log. Pure functions, no database access.
// Rating (used for the MVP): kill = 1, block = 1.5, ace = 1.5, each fault or penalty = -1.
export function computeMatchStats({ teamA, teamB, roster, rallies, events = [] }) {
  const pl = {};
  for (const r of roster) {
    pl[r.player_id] = { id: r.player_id, name: r.name, jersey: r.jersey, teamId: r.team_id, isLibero: !!r.isLibero, kills: 0, blocks: 0, aces: 0, errors: 0, serveErrors: 0, attackErrors: 0, yellow: 0, red: 0 };
  }
  const mk = () => ({ points: 0, kills: 0, blocks: 0, aces: 0, oppErrors: 0 });
  const teams = { [teamA]: mk(), [teamB]: mk() };
  const perSet = {};
  for (const r of rallies) {
    const T = teams[r.point_team_id];
    if (!T) continue;
    T.points += 1;
    perSet[r.set_number] = perSet[r.set_number] || { [teamA]: 0, [teamB]: 0 };
    perSet[r.set_number][r.point_team_id] += 1;
    const sc = pl[r.scorer_player_id];
    if (r.action === 'kill') { T.kills += 1; if (sc) sc.kills += 1; }
    else if (r.action === 'block') { T.blocks += 1; if (sc) sc.blocks += 1; }
    else if (r.action === 'ace') { T.aces += 1; if (sc) sc.aces += 1; }
    else {
      T.oppErrors += 1;
      const ep = pl[r.error_player_id];
      if (ep) {
        ep.errors += 1;
        if (r.action === 'penalty' && r.error_kind === 'yellow') ep.yellow += 1;
        if (r.error_kind === 'Serve error') ep.serveErrors += 1;
        if (r.error_kind === 'Attack error') ep.attackErrors += 1;
      }
    }
  }
  for (const e of events) {
    if (e.kind === 'red_card' && pl[e.player_id]) pl[e.player_id].red += 1;
  }
  const players = Object.values(pl).map((p) => ({ ...p, points: p.kills + p.blocks + p.aces, rating: p.kills + 1.5 * (p.blocks + p.aces) - p.errors }));
  players.sort((a, b) => b.points - a.points || a.errors - b.errors || a.jersey - b.jersey);
  const top = (key) => [...players].filter((p) => p[key] > 0).sort((a, b) => b[key] - a[key] || b.rating - a.rating || a.errors - b.errors)[0] || null;
  const mvp = [...players].filter((p) => p.rating > 0).sort((a, b) => b.rating - a.rating || b.points - a.points || a.errors - b.errors)[0] || null;
  return { players, teams, perSet, awards: { mvp, topScorer: top('points'), bestSpiker: top('kills'), bestBlocker: top('blocks'), bestServer: top('aces') } };
}
