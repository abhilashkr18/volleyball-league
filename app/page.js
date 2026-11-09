import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import Countdown from '@/components/Countdown';

export const dynamic = 'force-dynamic';

const DEFAULT_ABOUT = 'Ground Zero Muri is more than just a sports platform. It is a movement, a place where sports, friendship and community come together to inspire, compete and grow. From local tournaments to bigger dreams, we stand for the spirit of sports in Muri and beyond.';
const SAMPLE_NEWS = ['Registration Open for GZ Muri Championship 2026', 'Ground Zero Muri: A Sports Movement', 'Team GZ Muri Wins Friendly Tournament', 'Sports for a Better Tomorrow'];
const fmt = (d) => new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

function ytId(url) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/i);
  return m ? m[1] : null;
}

function VideoPreview({ v }) {
  const box = { width: '100%', aspectRatio: '16/9', borderRadius: 10, display: 'block' };
  if (!v) return <Link href="/videos"><img src="/video.jpg" alt="Match highlights" style={{ width: '100%', borderRadius: 10 }} /></Link>;
  const id = ytId(v.video_url);
  if (id) {
    return (
      <Link href="/videos" style={{ position: 'relative', display: 'block' }}>
        <img src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt={v.title} style={{ ...box, objectFit: 'cover' }} />
        <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: '3rem', color: '#fff', textShadow: '0 0 20px #000' }}>▶</span>
      </Link>
    );
  }
  if (/instagram\.com|facebook\.com|fb\.watch/i.test(v.video_url)) {
    return <Link href="/videos" style={{ ...box, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#1b1b1f,#3a1d05)', border: '1px solid var(--orline)', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>▶ {v.title}</Link>;
  }
  return <video controls preload="metadata" src={v.video_url} style={{ ...box, background: '#000' }} />;
}

export default async function Home() {
  const sb = supabaseServer();
    const [cats, ev, aboutRow, news, photos, vids, comps] = await Promise.all([
    sb.from('categories').select('id,name').eq('is_active', true).order('sort_order'),
    sb.from('events').select('id,title,venue,starts_at,image_url').gte('starts_at', new Date().toISOString()).order('starts_at').limit(1),
    sb.from('site_settings').select('value').eq('key', 'about_text').maybeSingle(),
    sb.from('news').select('id,title').order('created_at', { ascending: false }).limit(6),
    sb.from('photos').select('id,image_url,caption').order('created_at', { ascending: false }).limit(8),
    sb.from('videos').select('id,title,video_url').order('created_at', { ascending: false }).limit(1),
         sb.from('competitions').select('id,name,category_id').order('created_at', { ascending: false }), 
  ]);
  const event = ev.data?.[0];
  const newsList = news.data?.length ? news.data.map((n) => n.title) : SAMPLE_NEWS;
  const video = vids.data?.[0];

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1>Ground Zero<b>Muri</b></h1>
          <div className="tag">Where Sports Bring Us <span className="script">Together...</span></div>
          <p>A platform for sports, passion and community. Uniting players, fans and dreamers at Ground Zero Muri.</p>
          <div className="acts">
            <Link className="btn" href="/sports">Explore Sports</Link>
            <Link className="btn btn-line" href="/videos">Watch Highlights</Link>
          </div>
        </div>
      </section>

      <main className="wrap" style={{ paddingTop: 0 }}>
        <div className="evbar">
          <div className="lab">Upcoming<b>Event</b></div>
          <div className="nm">
            <b>{event ? event.title : 'Next event coming soon'}</b>
            <span className="muted">{event ? [fmt(event.starts_at), event.venue].filter(Boolean).join(' · ') : 'Muri, Jharkhand'}</span>
          </div>
          {event ? <Countdown target={event.starts_at} /> : <div />}
          <Link className="btn" href="/events">Know More</Link>
        </div>

        <section id="sports">
          <div className="sec-title"><h2>Our <em>Sports</em></h2><p className="muted">Multiple Games. One Community.</p></div>
          <div className="sports-scroll"><div className="sports-strip"><img src="/sports.jpg" alt="Cricket, Football, Volleyball, Badminton, Kabaddi and more" />{['cricket', 'football', 'volleyball', 'badminton', 'kabaddi', ''].map((s, i) => (<Link key={i} href={s ? `/sports/${s}` : '/sports'} aria-label={s || 'All sports'} style={{ left: `${i * 16.66}%` }} />))}</div></div>
        </section>

        <section id="competitions">
          <div className="sec-title"><h2>Our <em>Competitions</em></h2></div>
          <div className="grid">
                      {(cats.data || []).map((c) => { const mine = (comps.data || []).filter((x) => x.category_id === c.id); return (<div className="cat" key={c.id}><h3><Link href={`/competitions?category=${c.id}`}>{c.name}</Link></h3>{mine.length === 0 ? <p className="muted">No competitions yet.</p> : mine.slice(0, 3).map((x) => <p key={x.id} style={{ margin: '.25rem 0' }}><Link href={`/competitions/${x.id}`}>{x.name}</Link></p>)}</div>); })}
          </div>
        </section>

        <section id="about" className="about">
          <img src="/about.jpg" alt="Ground Zero Muri team huddle" />
          <div>
            <h2>About <em>Ground Zero Muri</em></h2>
            <p>{aboutRow.data?.value || DEFAULT_ABOUT}</p>
            <ul><li>Sports Community</li><li>Regular Events</li><li>Youth Development</li><li>Team Spirit</li><li>A Healthier Society</li></ul>
            <span className="script" style={{ fontSize: '1.8rem' }}>Play Hard. Dream Big.</span>
          </div>
        </section>

        <div className="duo">
          <section id="gallery" className="box">
            <div className="hd"><h3>Gallery</h3><Link className="btn" href="/gallery">View All</Link></div>
            <p className="muted">Moments that inspire</p>
            {photos.data?.length ? (
              <Link href="/gallery" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                {photos.data.map((p) => (<img key={p.id} src={p.image_url} alt={p.caption || 'Ground Zero Muri photo'} loading="lazy" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 6 }} />))}
              </Link>
            ) : (
              <Link href="/gallery"><img src="/gallery.jpg" alt="Ground Zero Muri photo gallery" style={{ width: '100%', borderRadius: 10 }} /></Link>
            )}
          </section>
          <section id="videos" className="box">
            <div className="hd"><h3>Videos</h3><Link className="btn" href="/videos">View All</Link></div>
            <p className="muted">Relive the action</p>
            <VideoPreview v={video} />
            {video && <p className="muted" style={{ margin: '.5rem 0 0' }}>{video.title}</p>}
          </section>
        </div>

        <section id="events" className="box" style={{ marginTop: '1rem' }}>
          <div className="hd"><h3>Events &amp; News</h3><Link className="btn" href="/events">View All</Link></div>
          <p className="muted">Stay updated with our latest events</p>
          <div className="news">
            <Link href="/events"><img src={event?.image_url || '/event.jpg'} alt={event?.title || 'Upcoming event'} /></Link>
            <div>
              <h3>Latest Updates</h3>
              <ul>{newsList.map((n) => <li key={n}>{n}</li>)}</ul>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
