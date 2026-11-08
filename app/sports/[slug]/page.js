import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const ICON = { volleyball: '🏐', cricket: '🏏', football: '⚽', badminton: '🏸', kabaddi: '🤼' };
const fmt = (d) => new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

export default async function SportPage({ params }) {
  const sb = supabaseServer();
  const { data: sport } = await sb.from('sports').select('id,slug,name').eq('slug', params.slug).eq('is_active', true).maybeSingle();
  if (!sport) notFound();

  const { data: rows } = await sb.from('player_sports').select('position,preferred_jersey,players(player_code,full_name,photo_url,status)').eq('sport_id', sport.id);
  const players = (rows || []).filter((r) => r.players && r.players.status === 'active');
  const { data: photos } = await sb.from('photos').select('id,image_url,caption').eq('sport_id', sport.id).order('created_at', { ascending: false }).limit(8);
  const { data: videos } = await sb.from('videos').select('id,title').eq('sport_id', sport.id).order('created_at', { ascending: false }).limit(5);
  const { data: events } = await sb.from('events').select('id,title,starts_at,venue').or(`sport_id.eq.${sport.id},sport_id.is.null`).gte('starts_at', new Date().toISOString()).order('starts_at').limit(5);

  const byPos = {};
  players.forEach((r) => { const k = r.position || 'Position not set'; byPos[k] = (byPos[k] || 0) + 1; });

  return (
    <main className="wrap">
      <p><Link href="/sports">← All sports</Link></p>
      <div className="profile" style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '4rem' }}>{ICON[sport.slug] || '🏆'}</div>
        <div><h1>{sport.name}</h1><p className="muted" style={{ margin: 0 }}>{players.length} players registered</p></div>
      </div>

      <section className="box" style={{ marginBottom: '1rem' }}>
        <div className="hd"><h3>Players</h3></div>
        {Object.keys(byPos).length > 0 && <p className="muted">{Object.entries(byPos).map(([k, n]) => `${k}: ${n}`).join(' · ')}</p>}
        {players.length === 0 && <p className="muted">No players registered for {sport.name} yet.</p>}
        <ul className="plist">
          {players.map((r) => (
            <li key={r.players.player_code}>
              <Link href={`/players/${r.players.player_code}`}>
                {r.players.photo_url ? <img className="av" src={r.players.photo_url} alt="" /> : <span className="av">{r.players.full_name[0]}</span>}
                <span><b>{r.players.full_name}</b><br /><span className="muted">{r.position || 'Position not set'}{r.preferred_jersey ? ` · #${r.preferred_jersey}` : ''}</span></span>
                <span className="code" style={{ marginLeft: 'auto' }}>{r.players.player_code}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="duo" style={{ marginTop: 0 }}>
        <section className="box">
          <div className="hd"><h3>Upcoming events</h3><Link className="btn" href={`/events?sport=${sport.slug}`}>View all</Link></div>
          {(events || []).length === 0 && <p className="muted">No upcoming events.</p>}
          {(events || []).map((e) => (<p key={e.id} style={{ margin: '.3rem 0' }}><b>{e.title}</b><br /><span className="muted">{fmt(e.starts_at)}{e.venue ? ` · ${e.venue}` : ''}</span></p>))}
        </section>
        <section className="box">
          <div className="hd"><h3>Matches &amp; tournaments</h3></div>
          <p className="muted">Match history, tournaments, teams and best moments will appear here once competitions start.</p>
        </section>
      </div>

      <section className="box" style={{ marginTop: '1rem' }}>
        <div className="hd"><h3>Photos</h3><Link className="btn" href={`/gallery?sport=${sport.slug}`}>View all</Link></div>
        {(photos || []).length === 0 && <p className="muted">No photos yet.</p>}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))' }}>
          {(photos || []).map((p) => (<img key={p.id} src={p.image_url} alt={p.caption || ''} loading="lazy" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }} />))}
        </div>
      </section>

      <section className="box" style={{ marginTop: '1rem' }}>
        <div className="hd"><h3>Videos</h3><Link className="btn" href={`/videos?sport=${sport.slug}`}>Watch all</Link></div>
        {(videos || []).length === 0 && <p className="muted">No videos yet.</p>}
        {(videos || []).map((v) => (<p key={v.id} style={{ margin: '.3rem 0' }}>▶ {v.title}</p>))}
      </section>
    </main>
  );
}
