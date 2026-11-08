import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Players({ searchParams }) {
  const q = (searchParams.q || '').trim();
  let query = supabaseServer().from('players').select('player_code,full_name,photo_url,player_sports(position,preferred_jersey,sports(name))').order('player_code');
  if (q) query = /^gzm/i.test(q) ? query.ilike('player_code', `%${q}%`) : query.ilike('full_name', `%${q}%`);
  const { data: list } = await query.limit(100);
  return (
    <main className="wrap">
      <h1>Players</h1>
      <form style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem' }}>
        <input name="q" defaultValue={q} placeholder="Search by name or Player ID" aria-label="Search players" />
        <button>Search</button>
      </form>
      {(list || []).length === 0 && <p className="muted">No players found.</p>}
      <ul className="plist">
        {(list || []).map((p) => (
          <li key={p.player_code}><Link href={`/players/${p.player_code}`}>
            {p.photo_url ? <img className="av" src={p.photo_url} alt="" /> : <span className="av">{p.full_name[0]}</span>}
                        <span><b>{p.full_name}</b><br /><span className="muted">{(p.player_sports || []).length ? p.player_sports.map((s) => `${s.sports?.name}: ${s.position || 'Position not set'}`).join(' · ') : 'No sport selected'}</span></span>
            <span className="code" style={{ marginLeft: 'auto' }}>{p.player_code}</span>
          </Link></li>
        ))}
      </ul>
    </main>
  );
}
