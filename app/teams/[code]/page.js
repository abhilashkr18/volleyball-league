import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const TABS = [['overview', 'Overview'], ['players', 'Players'], ['matches', 'Matches'], ['tournament', 'Tournament'], ['stats', 'Statistics'], ['compare', 'Compare']];
const dt = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : null);

async function squad(sb, teamId, sportId) {
  const { data } = await sb.from('competition_players')
    .select('jersey_number,players(id,player_code,full_name,photo_url,height_cm,player_sports(position,sport_id))')
    .eq('team_id', teamId).order('jersey_number', { ascending: true, nullsFirst: false });
  return (data || []).filter((r) => r.players).map((r) => ({
    id: r.players.id, code: r.players.player_code, name: r.players.full_name, photo: r.players.photo_url,
    height: r.players.height_cm, jersey: r.jersey_number,
    position: (r.players.player_sports || []).find((s) => s.sport_id === sportId)?.position || null,
  }));
}
const avgHeight = (list) => { const h = list.map((p) => p.height).filter(Boolean); return h.length ? `${Math.round(h.reduce((a, b) => a + b, 0) / h.length)} cm` : '—'; };

function Logo({ t, size = 96 }) {
  const s = { width: size, height: size, borderRadius: 18, flex: 'none', border: '2px solid var(--or)', boxShadow: '0 0 24px rgba(255,106,0,.3)' };
  return t.logo_url ? <img src={t.logo_url} alt={t.name} style={{ ...s, objectFit: 'cover' }} /> : <span className="av" style={{ ...s, fontSize: size / 2.5 }}>{t.name[0]}</span>;
}

function PlayerList({ list }) {
  if (list.length === 0) return <p className="muted">No players in this team yet.</p>;
  return (
    <ul className="plist">
      {list.map((p) => (
        <li key={p.code}>
          <Link href={`/players/${p.code}`}>
            {p.photo ? <img className="av" src={p.photo} alt="" /> : <span className="av">{p.name[0]}</span>}
            <span><b>{p.name}</b><br /><span className="muted">{p.position || 'Position not set'} · {p.code}</span></span>
            {p.jersey !== null && <span className="code" style={{ marginLeft: 'auto', fontSize: '1.6rem' }}>#{p.jersey}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function TeamPage({ params, searchParams }) {
  const sb = supabaseServer();
  const { data: t } = await sb.from('teams')
    .select('id,name,team_code,logo_url,captain_player_id,competitions(id,name,status,format,venue,start_date,end_date,sport_id,sports(name,slug),categories(name))')
    .eq('team_code', params.code.toUpperCase()).maybeSingle();
  if (!t || !t.competitions) notFound();
  const c = t.competitions;
  const tab = TABS.some(([k]) => k === searchParams.tab) ? searchParams.tab : 'overview';
  const players = await squad(sb, t.id, c.sport_id);
  const captain = players.find((p) => p.id === t.captain_player_id);
    let games = [];
  if (tab === 'matches') {
    const { data } = await sb.from('matches')
      .select('id,round_label,scheduled_at,venue,best_of,status,team_a_id,team_b_id,team_a:teams!matches_team_a_id_fkey(name,team_code),team_b:teams!matches_team_b_id_fkey(name,team_code)')
      .or(`team_a_id.eq.${t.id},team_b_id.eq.${t.id}`).order('scheduled_at', { ascending: true, nullsFirst: false });
    games = data || [];
}

  let others = [], other = null, otherPlayers = [];
  if (tab === 'compare') {
    const { data } = await sb.from('teams').select('id,name,team_code,logo_url').eq('competition_id', c.id).neq('id', t.id).order('created_at');
    others = data || [];
    other = others.find((o) => o.team_code === String(searchParams.vs || '').toUpperCase()) || null;
    if (other) otherPlayers = await squad(sb, other.id, c.sport_id);
  }

  const posCount = {};
  players.forEach((p) => { const k = p.position || 'Position not set'; posCount[k] = (posCount[k] || 0) + 1; });
  const when = [dt(c.start_date), dt(c.end_date)].filter(Boolean).join(' to ');
  const stat = (label, value) => (<div className="cat" key={label}><h3 style={{ marginBottom: 0 }}>{value}</h3><p className="muted" style={{ margin: 0 }}>{label}</p></div>);

  return (
    <main className="wrap">
      <p><Link href={`/competitions/${c.id}`}>← {c.name}</Link></p>
      <div className="profile" style={{ marginBottom: '1rem' }}>
        <Logo t={t} />
        <div>
          <h1 style={{ marginBottom: '.2rem' }}>{t.name}</h1>
          <div className="code">{t.team_code}</div>
          <p className="muted" style={{ margin: 0 }}>{c.sports?.name} · {c.name}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '.4rem', overflowX: 'auto', paddingBottom: '.4rem', marginBottom: '1rem' }}>
        {TABS.map(([k, label]) => (<Link key={k} className={tab === k ? 'btn' : 'btn btn-line'} href={`/teams/${t.team_code}?tab=${k}`} style={{ whiteSpace: 'nowrap', padding: '.45rem 1rem' }}>{label}</Link>))}
      </div>

      {tab === 'overview' && (
        <section className="box">
          <h3>Team overview</h3>
          <dl>
            <dt>Team ID</dt><dd>{t.team_code}</dd>
            <dt>Sport</dt><dd>{c.sports?.name}</dd>
            <dt>Competition</dt><dd>{c.name}</dd>
            <dt>Captain</dt><dd>{captain ? captain.name : 'Not announced'}</dd>
            <dt>Players</dt><dd>{players.length}</dd>
            <dt>Average height</dt><dd>{avgHeight(players)}</dd>
          </dl>
          {players.length > 0 && <p className="muted" style={{ marginTop: '.8rem' }}>{Object.entries(posCount).map(([k, n]) => `${k}: ${n}`).join(' · ')}</p>}
        </section>
      )}

      {tab === 'players' && (<section className="box"><h3>Squad ({players.length})</h3><PlayerList list={players} /></section>)}

      
      {tab === 'matches' && (
        <section className="box">
          <h3>Matches ({games.length})</h3>
          {games.length === 0 && <p className="muted">No matches scheduled for {t.name} yet.</p>}
          {games.map((m) => {
            const opp = m.team_a_id === t.id ? m.team_b : m.team_a;
            return (
              <div key={m.id} style={{ borderTop: '1px solid var(--line)', padding: '.7rem 0' }}>
                <b>{t.name} <em style={{ color: 'var(--or)', fontStyle: 'normal' }}>vs</em> {opp?.name}</b>
                <p className="muted" style={{ margin: '.2rem 0 0' }}>{m.round_label ? `${m.round_label} · ` : ''}{m.scheduled_at ? new Date(m.scheduled_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) : 'Time to be announced'} · Best of {m.best_of} · {m.status}</p>
              </div>
            );
          })}
        </section>
      )}
      {tab === 'tournament' && (
        <section className="box">
          <h3>Tournament</h3>
          <dl>
            <dt>Name</dt><dd><Link href={`/competitions/${c.id}`}>{c.name}</Link></dd>
            <dt>Category</dt><dd>{c.categories?.name}</dd>
            <dt>Format</dt><dd>{c.format.replace('_', ' ')}</dd>
            <dt>Status</dt><dd>{c.status}</dd>
            {when && (<><dt>Dates</dt><dd>{when}</dd></>)}
            {c.venue && (<><dt>Venue</dt><dd>{c.venue}</dd></>)}
          </dl>
        </section>
      )}

      {tab === 'stats' && (
        <section>
          <div className="grid">{[['Matches played', '—'], ['Wins', '—'], ['Losses', '—'], ['Points scored', '—']].map(([l, v]) => stat(l, v))}</div>
          <p className="muted" style={{ marginTop: '.8rem' }}>Team statistics are calculated from match results and will fill in after the first match.</p>
        </section>
      )}

      {tab === 'compare' && (
        <section className="box">
          <h3>Compare with</h3>
          {others.length === 0 && <p className="muted">No other teams in this competition yet.</p>}
          <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {others.map((o) => (<Link key={o.id} className={other?.id === o.id ? 'btn' : 'btn btn-line'} href={`/teams/${t.team_code}?tab=compare&vs=${o.team_code}`} style={{ padding: '.4rem 1rem' }}>{o.name}</Link>))}
          </div>
          {other && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.8rem' }}>
              {[[t, players], [other, otherPlayers]].map(([team, list]) => (
                <div key={team.id} className="cat" style={{ textAlign: 'center' }}>
                  <div style={{ display: 'grid', placeItems: 'center' }}><Logo t={team} size={64} /></div>
                  <h3 style={{ marginTop: '.5rem' }}>{team.name}</h3>
                  <div className="code">{team.team_code}</div>
                  <p style={{ margin: '.5rem 0 0' }}><b>{list.length}</b> <span className="muted">players</span></p>
                  <p style={{ margin: 0 }}><b>{avgHeight(list)}</b> <span className="muted">avg height</span></p>
                  <p style={{ margin: 0 }}><b>—</b> <span className="muted">wins</span></p>
                </div>
              ))}
            </div>
          )}
          {!other && others.length > 0 && <p className="muted">Choose a team above to compare.</p>}
        </section>
      )}
    </main>
  );
}
