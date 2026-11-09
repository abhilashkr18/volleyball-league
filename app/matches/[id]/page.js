import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const TEAM = 'id,name,team_code,logo_url';

function Logo({ t, size = 72 }) {
  const s = { width: size, height: size, borderRadius: 16, border: '2px solid var(--or)', flex: 'none' };
  return t.logo_url ? <img src={t.logo_url} alt={t.name} style={{ ...s, objectFit: 'cover' }} /> : <span className="av" style={{ ...s, fontSize: size / 2.5 }}>{t.name[0]}</span>;
}

function Squad({ list }) {
  if (list.length === 0) return <p className="muted">No players registered.</p>;
  return (
    <ul className="plist">
      {list.map((r) => (
        <li key={r.players.player_code}>
          <Link href={`/players/${r.players.player_code}`}>
            {r.players.photo_url ? <img className="av" src={r.players.photo_url} alt="" /> : <span className="av">{r.players.full_name[0]}</span>}
            <span><b>{r.players.full_name}</b><br /><span className="muted">{r.players.player_code}</span></span>
            {r.jersey_number !== null && <span className="code" style={{ marginLeft: 'auto', fontSize: '1.4rem' }}>#{r.jersey_number}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function MatchPage({ params }) {
  const sb = supabaseServer();
  const { data: m } = await sb.from('matches')
    .select(`id,round_label,scheduled_at,venue,best_of,status,winner_team_id,competitions(id,name,sports(name)),team_a:teams!matches_team_a_id_fkey(${TEAM}),team_b:teams!matches_team_b_id_fkey(${TEAM})`)
    .eq('id', params.id).maybeSingle();
  if (!m || !m.team_a || !m.team_b) notFound();
  const { data: sets } = await sb.from('match_sets').select('set_number,points_a,points_b,completed').eq('match_id', m.id).order('set_number');
  const { data: regs } = await sb.from('competition_players')
    .select('team_id,jersey_number,players(player_code,full_name,photo_url)')
    .in('team_id', [m.team_a.id, m.team_b.id]).order('jersey_number', { ascending: true, nullsFirst: false });
  const squad = (tid) => (regs || []).filter((r) => r.team_id === tid && r.players);
  const done = (sets || []).filter((s) => s.completed);
  const winsA = done.filter((s) => s.points_a > s.points_b).length;
  const winsB = done.filter((s) => s.points_b > s.points_a).length;
  const winner = m.winner_team_id === m.team_a.id ? m.team_a : m.winner_team_id === m.team_b.id ? m.team_b : null;
  const when = m.scheduled_at ? new Date(m.scheduled_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) : 'Time to be announced';

  return (
    <main className="wrap">
      <p><Link href={`/competitions/${m.competitions?.id}`}>← {m.competitions?.name}</Link></p>
      <p className="muted" style={{ margin: 0 }}>{m.competitions?.sports?.name}{m.round_label ? ` · ${m.round_label}` : ''} · Best of {m.best_of} · {m.status.toUpperCase()}</p>
      <div className="box" style={{ marginTop: '.6rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '.8rem', alignItems: 'center', textAlign: 'center' }}>
          {[m.team_a, m.team_b].map((t, i) => (
            <Link key={t.id} href={`/teams/${t.team_code}`} style={{ order: i === 0 ? 0 : 2, textDecoration: 'none', color: 'inherit', display: 'grid', placeItems: 'center', gap: '.3rem' }}>
              <Logo t={t} /><b>{t.name}</b><span className="code">{t.team_code}</span>
            </Link>
          ))}
          <div style={{ order: 1 }}>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: '2.6rem', lineHeight: 1 }}>{winsA} <span style={{ color: 'var(--or)' }}>-</span> {winsB}</div>
            <span className="muted">sets</span>
          </div>
        </div>
        <p className="muted" style={{ textAlign: 'center', margin: '.8rem 0 0' }}>{when}{m.venue ? ` · ${m.venue}` : ''}</p>
        {winner && <p style={{ textAlign: 'center', margin: '.5rem 0 0' }}><b style={{ color: 'var(--or)' }}>{winner.name} won the match</b></p>}
      </div>

      <section className="box" style={{ marginTop: '1rem' }}>
        <h3>Set scores</h3>
        {(sets || []).length === 0 ? <p className="muted">Scores will appear here once the match starts.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ textAlign: 'left', color: 'var(--muted)' }}><th>Set</th><th>{m.team_a.name}</th><th>{m.team_b.name}</th><th></th></tr></thead>
            <tbody>
              {sets.map((s) => (
                <tr key={s.set_number} style={{ borderTop: '1px solid var(--line)' }}>
                  <td style={{ padding: '.5rem 0' }}>Set {s.set_number}</td><td><b>{s.points_a}</b></td><td><b>{s.points_b}</b></td><td className="muted">{s.completed ? 'Final' : 'In play'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <div className="duo">
        {[m.team_a, m.team_b].map((t) => (
          <section className="box" key={t.id}><div className="hd"><h3>{t.name}</h3><span className="muted">{squad(t.id).length} players</span></div><Squad list={squad(t.id)} /></section>
        ))}
      </div>
    </main>
  );
}
