import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sports | Ground Zero Muri' };

const ICON = { volleyball: '🏐', cricket: '🏏', football: '⚽', badminton: '🏸', kabaddi: '🤼' };

export default async function Sports() {
  const { data } = await supabaseServer().from('sports').select('id,slug,name,player_sports(count)').eq('is_active', true).order('id');
  return (
    <main className="wrap">
      <div className="sec-title"><h2>Our <em>Sports</em></h2><p className="muted">Multiple Games. One Community.</p></div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))' }}>
        {(data || []).map((s) => (
          <Link key={s.slug} href={`/sports/${s.slug}`} className="box" style={{ textDecoration: 'none', color: 'inherit', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', lineHeight: 1.2 }}>{ICON[s.slug] || '🏆'}</div>
            <h3 style={{ marginTop: '.4rem' }}>{s.name}</h3>
            <p className="muted" style={{ margin: 0 }}>{s.player_sports?.[0]?.count ?? 0} players</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
