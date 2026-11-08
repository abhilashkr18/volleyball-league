import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'About | Ground Zero Muri' };

const DEFAULT_ABOUT = 'Ground Zero Muri is more than just a sports platform. It is a movement, a place where sports, friendship and community come together to inspire, compete and grow. From local tournaments to bigger dreams, we stand for the spirit of sports in Muri and beyond.';

export default async function About() {
  const { data } = await supabaseServer().from('site_settings').select('value').eq('key', 'about_text').maybeSingle();
  return (
    <main className="wrap">
      <section className="about">
        <img src="/about.jpg" alt="Ground Zero Muri team huddle" />
        <div>
          <h2>About <em>Ground Zero Muri</em></h2>
          <p>{data?.value || DEFAULT_ABOUT}</p>
          <ul><li>Sports Community</li><li>Regular Events</li><li>Youth Development</li><li>Team Spirit</li><li>A Healthier Society</li></ul>
          <span className="script" style={{ fontSize: '1.8rem' }}>Play Hard. Dream Big.</span>
          <p style={{ marginTop: '1.2rem', display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
            <Link className="btn" href="/sports">Explore Sports</Link>
            <Link className="btn btn-line" href="/players">Meet the Players</Link>
          </p>
        </div>
      </section>
    </main>
  );
    }
