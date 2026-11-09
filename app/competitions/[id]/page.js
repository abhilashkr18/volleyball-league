import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const dt = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : null);

function PlayerRow({ r }) {
  const p = r.players;
  return (
    <li>
      <Link href={`/players/${p.player_code}`}>
        {p.photo_url ? <img className="av" src={p.photo_url} alt="" /> : <span className="av">{p.full_name[0]}</span>}
        <span><b>{p.full_name}</b><br /><span className="muted">{p.player_code}</span></span>
        {r.jersey_number !== null && <span className="code" style={{ marginLeft: 'auto', fontSize: '1.6rem' }}>#{r.jersey_number}</span>}
      </Link>
    </li>
  );
}

export default async function CompetitionPage({ params }) {
  const sb = supabaseServer();
  const { data: c } = await sb.from('competitions').select('id,name,format,status,venue,description,start_date,end_date,sports(name,slug),categories(name)').eq('id', params.id).maybeSingle();
  if (!c) notFound();
  const { data: teams } = await sb.from('teams').select('id,name').eq('competition_id', c.id).order('created_at');
  const { data: regs } = await sb.from('competition_players').select('team_id,jersey_number,players(player_code,full_name,photo_url)').eq('competition_id', c.id).order('jersey_number', { ascending: true, nullsFirst: false });
  const rows = (regs || []).filter((r) => r.players);
  const solo = rows.filter((r) => !r.team_id);
  const when = [dt(c.start_date), dt(c.end_date)].filter(Boolean).join(' to ');

  return (
    <main className="wrap">
      <p><Link href={`/sports/${c.sports?.slug}`}>← {c.sports?.name}</Link></p>
      <h1>{c.name}</h1>
      <p className="muted">{c.categories?.name} · {c.sports?.name} · {c.format.replace('_', ' ')} · {c.status}</p>
      <p className="muted">{[when, c.venue].filter(Boolean).join(' · ')}</p>
      {c.description && <p>{c.description}</p>}

      <div className="sec-title" style={{ textAlign: 'left' }}><h2>Teams <em>({(teams || []).length})</em></h2></div>
      {(teams || []).length === 0 && <p className="muted">Teams will be announced soon.</p>}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))' }}>
        {(teams || []).map((t) => {
          const mine = rows.filter((r) => r.team_id === t.id);
          return (
            <section className="box" key={t.id}>
              <div className="hd"><h3>{t.name}</h3><span className="muted">{mine.length} players</span></div>
              {mine.length === 0 && <p className="muted">No players yet.</p>}
              <ul className="plist">{mine.map((r) => <PlayerRow key={r.players.player_code} r={r} />)}</ul>
            </section>
          );
        })}
      </div>

      {solo.length > 0 && (
        <section className="box" style={{ marginTop: '1rem' }}>
          <div className="hd"><h3>Registered players</h3><span className="muted">{solo.length} waiting for a team</span></div>
          <ul className="plist">{solo.map((r) => <PlayerRow key={r.players.player_code} r={r} />)}</ul>
        </section>
      )}
    </main>
  );
          }
