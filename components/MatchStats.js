const CSS = `
.ms-awards{display:grid;gap:.6rem;grid-template-columns:repeat(auto-fill,minmax(170px,1fr))}
.ms-award{background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:.7rem}
.ms-award.mvp{grid-column:1/-1;border:1px solid var(--or);box-shadow:0 0 24px rgba(255,106,0,.25)}
.ms-award small{color:var(--muted);text-transform:uppercase;letter-spacing:.06em;font-size:.65rem}
.ms-award b{display:block;font-size:1.05rem}
.ms-award .v{font-family:var(--font-head);color:var(--or);font-size:1.6rem;line-height:1.1}
.ms-scroll{overflow-x:auto}
.ms-tbl{width:100%;border-collapse:collapse;min-width:320px}
.ms-tbl th,.ms-tbl td{padding:.35rem .3rem;text-align:center;border-top:1px solid var(--line)}
.ms-tbl th{color:var(--muted);font-weight:400;font-size:.75rem;border-top:0}
.ms-tbl td:nth-child(2),.ms-tbl th:nth-child(2){text-align:left}
`;

export default function MatchStats({ stats, teamA, teamB }) {
  const tn = (id) => (id === teamA.id ? teamA.name : teamB.name);
  const { awards, teams, players } = stats;
  const card = (title, p, value, cls) => (
    <div className={`ms-award${cls ? ` ${cls}` : ''}`} key={title}>
      <small>{title}</small>
      {p ? (<><b>#{p.jersey} {p.name}</b><span className="muted">{tn(p.teamId)}</span><div className="v">{value}</div></>) : <span className="muted">Not available</span>}
    </div>
  );
  const rows = [['Total points', 'points'], ['Attack kills', 'kills'], ['Block points', 'blocks'], ['Service aces', 'aces'], ['Points from opponent errors', 'oppErrors']];
  return (
    <section style={{ marginTop: '1rem' }}>
      <style>{CSS}</style>
      <div className="box" style={{ marginBottom: '1rem' }}>
        <h3>Awards</h3>
        <div className="ms-awards">
          {card('Most valuable player', awards.mvp, awards.mvp ? `${awards.mvp.points} pts` : '', 'mvp')}
          {card('Top scorer', awards.topScorer, awards.topScorer ? `${awards.topScorer.points} pts` : '')}
          {card('Best spiker', awards.bestSpiker, awards.bestSpiker ? `${awards.bestSpiker.kills} kills` : '')}
          {card('Best blocker', awards.bestBlocker, awards.bestBlocker ? `${awards.bestBlocker.blocks} blocks` : '')}
          {card('Best server', awards.bestServer, awards.bestServer ? `${awards.bestServer.aces} aces` : '')}
        </div>
      </div>

      <div className="box" style={{ marginBottom: '1rem' }}>
        <h3>Team statistics</h3>
        <div className="ms-scroll">
          <table className="ms-tbl">
            <thead><tr><th>{teamA.name}</th><th style={{ textAlign: 'center' }}>Category</th><th>{teamB.name}</th></tr></thead>
            <tbody>
              {rows.map(([label, key]) => (
                <tr key={key}><td><b>{teams[teamA.id][key]}</b></td><td style={{ textAlign: 'center' }} className="muted">{label}</td><td><b>{teams[teamB.id][key]}</b></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="duo" style={{ marginTop: 0 }}>
        {[teamA, teamB].map((t) => (
          <div className="box" key={t.id}>
            <h3>{t.name}</h3>
            <div className="ms-scroll">
              <table className="ms-tbl">
                <thead><tr><th>#</th><th>Player</th><th>Pts</th><th>K</th><th>B</th><th>A</th><th>Err</th></tr></thead>
                <tbody>
                  {players.filter((p) => p.teamId === t.id).map((p) => (
                    <tr key={p.id}><td>{p.jersey}</td><td>{p.name}{p.isLibero ? ' (L)' : ''}</td><td><b>{p.points}</b></td><td>{p.kills}</td><td>{p.blocks}</td><td>{p.aces}</td><td>{p.errors}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
      <p className="muted">K = attack kills, B = block points, A = service aces, Err = faults and penalties. MVP rating: kill 1, block 1.5, ace 1.5, each fault -1.</p>
    </section>
  );
    }
