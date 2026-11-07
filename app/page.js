import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const sb = supabaseServer();
  const { data: cats } = await sb.from('categories').select('id,name').eq('is_active', true).order('sort_order');
  return (
    <>
      <section className="hero">
        <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true" fill="none" stroke="#fff" strokeWidth="2">
          <rect x="20" y="20" width="360" height="160" /><line x1="200" y1="20" x2="200" y2="180" strokeWidth="4" />
          <line x1="130" y1="20" x2="130" y2="180" /><line x1="270" y1="20" x2="270" y2="180" />
        </svg>
        <div className="wrap">
          <h1>Ground Zero Muri</h1>
          <p>Every match, every point, every player. One ID follows each player across every competition.</p>
          <Link className="btn ball" href="/players">Browse players</Link>
        </div>
      </section>
      <main className="wrap">
        <h2>Competitions</h2>
        <div className="grid">
          {(cats || []).map((c) => (<div className="cat" key={c.id}><h3>{c.name}</h3><p className="muted">No competitions yet.</p></div>))}
        </div>
      </main>
    </>
  );
    }
