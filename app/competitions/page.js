import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Competitions | Ground Zero Muri' };

const dt = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : null);

export default async function Competitions({ searchParams }) {
  const sb = supabaseServer();
  const { data: cats } = await sb.from('categories').select('id,name').eq('is_active', true).order('sort_order');
  const cur = (cats || []).find((c) => String(c.id) === searchParams.category);
  let q = sb.from('competitions').select('id,name,format,status,start_date,venue,sports(name),categories(name)').order('created_at', { ascending: false });
  if (cur) q = q.eq('category_id', cur.id);
  const { data: list } = await q;
  return (
    <main className="wrap">
      <div className="sec-title"><h2>Our <em>Competitions</em></h2><p className="muted">Tournaments, leagues and special matches</p></div>
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <Link className={cur ? 'btn btn-line' : 'btn'} href="/competitions">All</Link>
        {(cats || []).map((c) => <Link key={c.id} className={cur?.id === c.id ? 'btn' : 'btn btn-line'} href={`/competitions?category=${c.id}`}>{c.name}</Link>)}
      </div>
      {(list || []).length === 0 && <p className="muted" style={{ textAlign: 'center' }}>No competitions yet. Check back soon.</p>}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
        {(list || []).map((c) => (
          <Link key={c.id} href={`/competitions/${c.id}`} className="box" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3>{c.name}</h3>
            <p className="muted" style={{ margin: '.2rem 0' }}>{c.sports?.name} · {c.categories?.name}</p>
            <p className="muted" style={{ margin: '.2rem 0' }}>{c.format.replace('_', ' ')} · {c.status}</p>
            {(c.start_date || c.venue) && <p className="muted" style={{ margin: '.2rem 0' }}>{[dt(c.start_date), c.venue].filter(Boolean).join(' · ')}</p>}
          </Link>
        ))}
      </div>
    </main>
  );
        }
