import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import Countdown from '@/components/Countdown';

export const dynamic = 'force-dynamic';

const EVENT = { name: 'Ground Zero Muri Sports Championship 2026', place: 'Muri, Jharkhand', date: '2026-12-15T10:00:00+05:30' };
const NEWS = ['Registration Open for GZ Muri Championship 2026', 'Ground Zero Muri: A Sports Movement', 'Team GZ Muri Wins Friendly Tournament', 'Sports for a Better Tomorrow'];

export default async function Home() {
  const sb = supabaseServer();
  const { data: cats } = await sb.from('categories').select('id,name').eq('is_active', true).order('sort_order');
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1>Ground Zero<b>Muri</b></h1>
          <div className="tag">Where Sports Bring Us <span className="script">Together...</span></div>
          <p>A platform for sports, passion and community. Uniting players, fans and dreamers at Ground Zero Muri.</p>
          <div className="acts">
            <Link className="btn" href="/#sports">Explore Sports</Link>
            <Link className="btn btn-line" href="/#videos">Watch Highlights</Link>
          </div>
        </div>
      </section>

      <main className="wrap" style={{ paddingTop: 0 }}>
        <div className="evbar">
          <div className="lab">Upcoming<b>Event</b></div>
          <div className="nm"><b>{EVENT.name}</b><span className="muted">{EVENT.place}</span></div>
          <Countdown target={EVENT.date} />
          <Link className="btn" href="/#events">Know More</Link>
        </div>

        <section id="sports">
          <div className="sec-title"><h2>Our <em>Sports</em></h2><p className="muted">Multiple Games. One Community.</p></div>
          <div className="sports-scroll"><div className="sports-strip"><img src="/sports.jpg" alt="Cricket, Football, Volleyball, Badminton, Kabaddi and more" /></div></div>
        </section>

        <section id="competitions">
          <div className="sec-title"><h2>Our <em>Competitions</em></h2></div>
          <div className="grid">
            {(cats || []).map((c) => (<div className="cat" key={c.id}><h3>{c.name}</h3><p className="muted">No competitions yet.</p></div>))}
          </div>
        </section>

        <section id="about" className="about">
          <img src="/about.jpg" alt="Ground Zero Muri team huddle" />
          <div>
            <h2>About <em>Ground Zero Muri</em></h2>
            <p>Ground Zero Muri is more than just a sports platform. It is a movement, a place where sports, friendship and community come together to inspire, compete and grow. From local tournaments to bigger dreams, we stand for the spirit of sports in Muri and beyond.</p>
            <ul><li>Sports Community</li><li>Regular Events</li><li>Youth Development</li><li>Team Spirit</li><li>A Healthier Society</li></ul>
            <span className="script" style={{ fontSize: '1.8rem' }}>Play Hard. Dream Big.</span>
          </div>
        </section>

        <div className="duo">
          <section id="gallery" className="box">
            <div className="hd"><h3>Gallery</h3><Link className="btn" href="/#gallery">View All</Link></div>
            <p className="muted">Moments that inspire</p>
            <img src="/gallery.jpg" alt="Ground Zero Muri photo gallery" style={{ width: '100%', borderRadius: 10 }} />
          </section>
          <section id="videos" className="box">
            <div className="hd"><h3>Videos</h3><Link className="btn" href="/#videos">View All</Link></div>
            <p className="muted">Relive the action</p>
            <img src="/video.jpg" alt="Sports Championship highlights video" style={{ width: '100%', borderRadius: 10 }} />
          </section>
        </div>

        <section id="events" className="box" style={{ marginTop: '1rem' }}>
          <div className="hd"><h3>Events &amp; News</h3></div>
          <p className="muted">Stay updated with our latest events</p>
          <div className="news">
            <img src="/event.jpg" alt={EVENT.name} />
            <div>
              <h3>Latest Updates</h3>
              <ul>{NEWS.map((n) => <li key={n}>{n}</li>)}</ul>
            </div>
          </div>
        </section>
      </main>
    </>
  );
  }
