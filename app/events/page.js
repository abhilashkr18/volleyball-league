import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Events | Ground Zero Muri' };

const fmt = (d) => new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

function Card({ e }) {
  return (
    <div className="box">
      {e.image_url && <img src={e.image_url} alt={e.title} style={{ width: '100%', height: 170, objectFit: 'cover', borderRadius: 10, marginBottom: '.7rem' }} />}
      <h3>{e.title}</h3>
      <p className="muted" style={{ margin: '.2rem 0' }}>{fmt(e.starts_at)}</p>
      <p className="muted" style={{ margin: '.2rem 0' }}>{e.sports?.name || 'All sports'}{e.venue ? ` · ${e.venue}` : ''}</p>
      {e.description && <p style={{ margin: '.5rem 0 0' }}>{e.description}</p>}
    </div>
  );
}

export default async function Events({ searchParams }) {
  const sb = supabaseServer();
  const { data: sports } = await sb.from('sports').select('id,slug,name').eq('is_active', true).order('id');
  const cur = (sports || []).find((s) => s.slug === searchParams.sport);
  let q = sb.from('events').select('id,title,description,venue,starts_at,image_url,sports(name)').order('starts_at');
  if (cur) q = q.or(`sport_id.eq.${cur.id},sport_id.is.null`);
  const { data } = await q;
  const now = Date.now();
  const upcoming = (data || []).filter((e) => new Date(e.starts_at).getTime() >= now);
  const past = (data || []).filter((e) => new Date(e.starts_at).getTime() < now).reverse();
  return (
    <main className="wrap">
      <div className="sec-title"><h2>Events &amp; <em>Schedule</em></h2><p className="muted">Every event at Ground Zero Muri</p></div>
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <Link className={cur ? 'btn btn-line' : 'btn'} href="/events">All</Link>
        {(sports || []).map((s) => <Link key={s.slug} className={cur?.slug === s.slug ? 'btn' : 'btn btn-line'} href={`/events?sport=${s.slug}`}>{s.name}</Link>)}
      </div>
      <h2>Upcoming <em>Events</em></h2>
      {upcoming.length === 0 && <p className="muted">No upcoming events yet. Check back soon.</p>}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))' }}>{upcoming.map((e) => <Card key={e.id} e={e} />)}</div>
      <h2 style={{ marginTop: '2rem' }}>Past <em>Events</em></h2>
      {past.length === 0 && <p className="muted">No past events yet.</p>}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))' }}>{past.map((e) => <Card key={e.id} e={e} />)}</div>
    </main>
  );
    }
