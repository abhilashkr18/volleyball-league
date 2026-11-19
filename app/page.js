import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import Countdown from '@/components/Countdown';
import HomeStyles from '@/components/HomeStyles';
import Reveal from '@/components/Reveal';

export const dynamic = 'force-dynamic';

const SPORT = {
  cricket: ['🏏', '#B6F23A', '/about/p07_i01.jpg'],
  football: ['⚽', '#FF7A1A', '/about/p13_i02.jpg'],
  volleyball: ['🏐', '#37D6FF', '/about/p17_i01.jpg'],
  badminton: ['🏸', '#FFC84A', '/about/p01_i01.jpg'],
  kabaddi: ['🤼', '#FF5C8A', '/about/p33_i01.jpg'],
};
const FALLBACK_GALLERY = ['p31_i01', 'p30_i01', 'p29_i01', 'p13_i02', 'p17_i02', 'p10_i01'].map((n) => ({ id: n, image_url: `/about/${n}.jpg`, caption: 'Ground Zero Muri' }));
const fmt = (d) => new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

function ytId(url) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/i);
  return m ? m[1] : null;
}

function VideoPreview({ v }) {
  const box = { width: '100%', aspectRatio: '16/9', borderRadius: 12, display: 'block' };
  if (!v) return <Link href="/videos" className="hm-btn g" style={{ ...box, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#1b1b1f,#0e3a2a)' }}>Highlights are coming soon</Link>;
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
  const [ev, news, photos, vids, comps, cats, sports, live, latest, pc] = await Promise.all([
    sb.from('events').select('id,title,venue,starts_at,image_url').gte('starts_at', new Date().toISOString()).order('starts_at').limit(1),
    sb.from('news').select('id,title').order('created_at', { ascending: false }).limit(6),
    sb.from('photos').select('id,image_url,caption').order('created_at', { ascending: false }).limit(8),
    sb.from('videos').select('id,title,video_url').order('created_at', { ascending: false }).limit(1),
    sb.from('competitions').select('id,name,category_id').order('created_at', { ascending: false }),
    sb.from('categories').select('id,name').eq('is_active', true).order('sort_order'),
    sb.from('sports').select('id,slug,name,player_sports(count)').eq('is_active', true).order('id'),
    sb.from('matches').select('id,team_a:teams!matches_team_a_id_fkey(name),team_b:teams!matches_team_b_id_fkey(name)').eq('status', 'live').limit(1),
    sb.from('players').select('player_code,full_name,photo_url').eq('status', 'active').order('created_at', { ascending: false }).limit(10),
    sb.from('players').select('*', { count: 'exact', head: true }),
  ]);
  const event = ev.data && ev.data[0];
  const liveMatch = live.data && live.data[0];
  const gallery = photos.data && photos.data.length ? photos.data : FALLBACK_GALLERY;
  const video = vids.data && vids.data[0];
  const sportList = sports.data || [];
  const compList = comps.data || [];

  return (
    <div className="hm">
      <HomeStyles />
      {liveMatch && (
        <Link className="hm-live" href={`/matches/${liveMatch.id}`}><i />LIVE NOW: {liveMatch.team_a ? liveMatch.team_a.name : ''} vs {liveMatch.team_b ? liveMatch.team_b.name : ''} · Watch the score →</Link>
      )}

      <section className="hm-hero">
        <div className="hm-aur" aria-hidden="true" />
        <div className="in">
          <span className="hm-kick">Kasigoda · Muri · Jharkhand</span>
          <h1>Ground Zero<span>Muri</span></h1>
          <p className="tg">One ground. Many sports. Generations of players. A story that began with cricket and keeps growing.</p>
          <div className="hm-cta">
            <Link className="hm-btn p" href="/sports">Explore sports</Link>
            <Link className="hm-btn g" href="/about">Our story</Link>
            <Link className="hm-btn g" href="/videos">Watch highlights</Link>
          </div>
        </div>
      </section>

      <div className="hm-mq" aria-hidden="true">
        <div>{[0, 1].map((k) => (<span key={k}>Cricket ✦ Football ✦ Volleyball ✦ Badminton ✦ Kabaddi ✦ KPL ✦ Community ✦ </span>))}{[2, 3].map((k) => (<span key={k}>Cricket ✦ Football ✦ Volleyball ✦ Badminton ✦ Kabaddi ✦ KPL ✦ Community ✦ </span>))}</div>
      </div>

      <div className="hm-wrap">
        <div className="hm-st">
          {[['2005-06', 'Cricket roots', '#B6F23A'], [String(pc.count ?? 0), 'Players', '#37D6FF'], [String(compList.length), 'Competitions', '#FFC84A'], [String(sportList.length), 'Sports', '#FF7A1A']].map(([v, l, c]) => (
            <div className="hm-stat" key={l} style={{ '--c': c }}><b>{v}</b><span>{l}</span></div>
          ))}
        </div>

        <div className="hm-evbar">
          <div className="lab">Upcoming<b>Event</b></div>
          <div className="nm"><b>{event ? event.title : 'Next event coming soon'}</b><span className="muted">{event ? [fmt(event.starts_at), event.venue].filter(Boolean).join(' · ') : 'Muri, Jharkhand'}</span></div>
          {event ? <Countdown target={event.starts_at} /> : <div />}
          <Link className="hm-btn p" href="/events" style={{ padding: '.6rem 1.2rem' }}>Know more</Link>
        </div>

        <Reveal>
          <div className="hm-h"><h2>Our <em>Sports</em></h2><p>Multiple games. One community.</p></div>
          <div className="hm-sp">
            {sportList.map((s) => {
              const m = SPORT[s.slug] || ['🏆', '#37D6FF', '/about/p01_i01.jpg'];
              return (
                <Link key={s.slug} href={`/sports/${s.slug}`} className="hm-sc" style={{ '--c': m[1], '--img': `url(${m[2]})` }}>
                  <div className="tx"><span className="ic">{m[0]}</span><b>{s.name}</b><small>{(s.player_sports && s.player_sports[0] ? s.player_sports[0].count : 0)} players</small><span className="go">Explore →</span></div>
                </Link>
              );
            })}
          </div>
        </Reveal>

        <Reveal>
          <div className="hm-h"><h2>Our <em>Story</em></h2></div>
          <div className="hm-split">
            <div className="hm-fig"><img src="/about/p10_i01.jpg" alt="Ground Zero Muri players with the Season 5 winners cheque" loading="lazy" /></div>
            <div className="hm-tx">
              <h2>More than a <em>place to play.</em></h2>
              <p>Ground Zero Muri is the modern identity of the long-running Kasigoda Ground sporting community in Muri, Jharkhand. It began around 2005-06, when local senior players needed a large, flat ground, and it grew into a meeting point for generations: cricket, football, volleyball, badminton and the people who keep coming back.</p>
              <div className="hm-years">
                {[['2005-06 Cricket', '#B6F23A'], ['2018 Football', '#FF7A1A'], ['2022 KPL', '#FFC84A'], ['2023 Volleyball', '#37D6FF']].map(([t, c]) => <span key={t} style={{ '--c': c }}>{t}</span>)}
              </div>
              <div className="hm-cta">
                <Link className="hm-btn p" href="/about">Read our story</Link>
                <Link className="hm-btn g" href="/about?lang=hi">हिंदी में पढ़ें</Link>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="hm-h"><h2>The <em>KPL</em></h2><p>Kasigoda Premier League</p></div>
          <div className="hm-kpl">
            <div className="hm-split">
              <div className="hm-fig"><img src="/about/p09_i02.jpg" alt="KPL winners with the cheque" loading="lazy" /></div>
              <div className="hm-tx">
                <div className="eb">Player-owned · Player-run</div>
                <h2>Paper slips. <em style={{ color: 'var(--gold)' }}>Live bidding.</em></h2>
                <p>Every year three teams, an auction at the ground and cold-morning matches decide the KPL champions. The league began in 2022 and its live scores are kept on a mobile app.</p>
                <div className="hm-cta"><Link className="hm-btn p" href="/about?tab=kpl" style={{ background: 'linear-gradient(90deg,#FFC84A,#FF7A1A)', color: '#1a0f00', boxShadow: '0 0 30px rgba(255,200,74,.4)' }}>Explore the KPL</Link></div>
              </div>
            </div>
          </div>
        </Reveal>

        {latest.data && latest.data.length > 0 && (
          <Reveal>
            <div className="hm-h"><h2>Our <em>Players</em></h2><p>Every player has one ID for every sport.</p></div>
            <div className="hm-pl">
              {latest.data.map((p) => (
                <Link key={p.player_code} href={`/players/${p.player_code}`} className="hm-pc">
                  <div className="im">{p.photo_url ? <img src={p.photo_url} alt={p.full_name} loading="lazy" /> : p.full_name[0]}</div>
                  <div className="bd"><b>{p.full_name}</b><span>{p.player_code}</span></div>
                </Link>
              ))}
            </div>
            <p style={{ textAlign: 'center' }}><Link className="hm-btn g" href="/players">See all players</Link></p>
          </Reveal>
        )}

        {cats.data && cats.data.length > 0 && (
          <Reveal>
            <div className="hm-h"><h2>Our <em>Competitions</em></h2></div>
            <div className="grid">
              {cats.data.map((c) => {
                const mine = compList.filter((x) => x.category_id === c.id);
                return (
                  <div className="cat" key={c.id}>
                    <h3><Link href={`/competitions?category=${c.id}`}>{c.name}</Link></h3>
                    {mine.length === 0 ? <p className="muted">No competitions yet.</p> : mine.slice(0, 3).map((x) => <p key={x.id} style={{ margin: '.25rem 0' }}><Link href={`/competitions/${x.id}`}>{x.name}</Link></p>)}
                  </div>
                );
              })}
            </div>
          </Reveal>
        )}

        <Reveal>
          <div className="hm-h"><h2>Moments that <em>inspire</em></h2></div>
          <div className="hm-gl">
            {gallery.map((p) => (<Link key={p.id} href="/gallery"><img src={p.image_url} alt={p.caption || 'Ground Zero Muri photo'} loading="lazy" /></Link>))}
          </div>
          <p style={{ textAlign: 'center', marginTop: '.8rem' }}><Link className="hm-btn g" href="/gallery">Open the gallery</Link></p>
        </Reveal>

        <Reveal>
          <div className="hm-h"><h2>Relive the <em>action</em></h2></div>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <VideoPreview v={video} />
            {video && <p className="muted" style={{ margin: '.5rem 0 0' }}>{video.title}</p>}
            <p style={{ textAlign: 'center', marginTop: '.8rem' }}><Link className="hm-btn g" href="/videos">All videos</Link></p>
          </div>
        </Reveal>

        {((news.data && news.data.length > 0) || event) && (
          <Reveal>
            <div className="hm-h"><h2>Events &amp; <em>News</em></h2></div>
            <div className="box">
              <div className="news">
                {event && event.image_url && <Link href="/events"><img src={event.image_url} alt={event.title} /></Link>}
                <div>
                  {event && <h3>{event.title}</h3>}
                  {event && <p className="muted">{[fmt(event.starts_at), event.venue].filter(Boolean).join(' · ')}</p>}
                  {news.data && news.data.length > 0 && (<><h3>Latest Updates</h3><ul>{news.data.map((n) => <li key={n.id}>{n.title}</li>)}</ul></>)}
                  <Link className="hm-btn g" href="/events">All events</Link>
                </div>
              </div>
            </div>
          </Reveal>
        )}

        <div className="hm-join">
          <h2>Join the <em style={{ color: 'var(--lime)', fontStyle: 'italic' }}>community</em></h2>
          <p>Follow Ground Zero Muri and find us on the map. One ground, every generation.</p>
          <Link className="hm-btn p" href="/about">Meet Ground Zero Muri</Link>
        </div>
      </div>
    </div>
  );
}
