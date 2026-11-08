import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Videos | Ground Zero Muri' };

function ytId(url) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/i);
  return m ? m[1] : null;
}

function Player({ v }) {
  const id = ytId(v.video_url);
  if (id) {
    return <iframe src={`https://www.youtube.com/embed/${id}`} title={v.title} loading="lazy" allowFullScreen style={{ width: '100%', aspectRatio: '16/9', border: 0, borderRadius: 10 }} />;
  }
  const social = /instagram\.com/i.test(v.video_url) ? 'Instagram' : /facebook\.com|fb\.watch/i.test(v.video_url) ? 'Facebook' : null;
  if (social) {
    return (
      <a href={v.video_url} target="_blank" rel="noopener noreferrer" style={{ display: 'grid', placeItems: 'center', width: '100%', aspectRatio: '16/9', borderRadius: 10, background: 'linear-gradient(135deg,#1b1b1f,#3a1d05)', border: '1px solid var(--orline)', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
        <span>▶ Watch on {social}</span>
      </a>
    );
  }
  return <video controls preload="metadata" src={v.video_url} style={{ width: '100%', aspectRatio: '16/9', borderRadius: 10, background: '#000' }} />;
}

export default async function Videos({ searchParams }) {
  const sb = supabaseServer();
  const { data: sports } = await sb.from('sports').select('id,slug,name').eq('is_active', true).order('id');
  const cur = (sports || []).find((s) => s.slug === searchParams.sport);
  let q = sb.from('videos').select('id,title,video_url,sports(name)').order('created_at', { ascending: false });
  if (cur) q = q.eq('sport_id', cur.id);
  const { data: videos } = await q;
  return (
    <main className="wrap">
      <div className="sec-title"><h2>Match <em>Highlights</em></h2><p className="muted">Relive the action</p></div>
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <Link className={cur ? 'btn btn-line' : 'btn'} href="/videos">All</Link>
        {(sports || []).map((s) => <Link key={s.slug} className={cur?.slug === s.slug ? 'btn' : 'btn btn-line'} href={`/videos?sport=${s.slug}`}>{s.name}</Link>)}
      </div>
      {(videos || []).length === 0 && <p className="muted" style={{ textAlign: 'center' }}>No videos yet. Check back soon.</p>}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))' }}>
        {(videos || []).map((v) => (
          <div className="box" key={v.id}>
            <Player v={v} />
            <h3 style={{ marginTop: '.7rem' }}>{v.title}</h3>
            <p className="muted" style={{ margin: 0 }}>{v.sports?.name || 'General'}</p>
          </div>
        ))}
      </div>
    </main>
  );
    }
