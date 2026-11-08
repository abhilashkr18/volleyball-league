import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Gallery | Ground Zero Muri' };

export default async function Gallery({ searchParams }) {
  const sb = supabaseServer();
  const { data: sports } = await sb.from('sports').select('id,slug,name').eq('is_active', true).order('id');
  const cur = (sports || []).find((s) => s.slug === searchParams.sport);
  let q = sb.from('photos').select('id,image_url,caption,sports(name)').order('created_at', { ascending: false });
  if (cur) q = q.eq('sport_id', cur.id);
  const { data: photos } = await q;
  return (
    <main className="wrap">
      <div className="sec-title"><h2>Photo <em>Gallery</em></h2><p className="muted">Moments that inspire</p></div>
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <Link className={cur ? 'btn btn-line' : 'btn'} href="/gallery">All</Link>
        {(sports || []).map((s) => <Link key={s.slug} className={cur?.slug === s.slug ? 'btn' : 'btn btn-line'} href={`/gallery?sport=${s.slug}`}>{s.name}</Link>)}
      </div>
      {(photos || []).length === 0 && <p className="muted" style={{ textAlign: 'center' }}>No photos yet. Check back soon.</p>}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>
        {(photos || []).map((p) => (
          <a key={p.id} href={p.image_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <img src={p.image_url} alt={p.caption || p.sports?.name || 'Ground Zero Muri photo'} loading="lazy" style={{ width: '100%', height: 190, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--line)' }} />
            <p className="muted" style={{ margin: '.3rem 0 0' }}>{p.sports?.name || 'General'}{p.caption ? ` · ${p.caption}` : ''}</p>
          </a>
        ))}
      </div>
    </main>
  );
  }
