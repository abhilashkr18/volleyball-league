import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Profile({ params }) {
    const { data: isAdmin } = await supabaseServer().rpc('is_admin');
  const { data: p } = await supabaseServer().from('players')
    .select('player_code,full_name,photo_url,height_cm,dominant_hand,village,player_sports(position,preferred_jersey,sports(name))')
    .eq('player_code', params.code.toUpperCase()).maybeSingle();
  if (!p) notFound();
  return (
    <main className="wrap">
      <div className="profile">
        {p.photo_url ? <img className="av" src={p.photo_url} alt={p.full_name} /> : <span className="av">{p.full_name[0]}</span>}
        <div><h1>{p.full_name}</h1><div className="code">{p.player_code}</div></div>
      </div>
        {isAdmin && <p style={{ marginTop: '1rem' }}><Link className="btn" href={`/admin/players/${p.player_code}/edit`}>Edit player</Link></p>}
      <div className="panel" style={{ marginTop: '1.25rem' }}>
        <h2>Details</h2>
        <dl>
          <dt>Village / area</dt><dd>{p.village || 'Not set'}</dd>
          <dt>Height</dt><dd>{p.height_cm ? `${p.height_cm} cm` : 'Not set'}</dd>
          <dt>Dominant hand</dt><dd>{p.dominant_hand || 'Not set'}</dd>
        </dl>
      </div>
      {(p.player_sports || []).map((s) => (
        <div className="panel" key={s.sports.name}>
          <h2>{s.sports.name}</h2>
          <dl><dt>Position</dt><dd>{s.position || 'Not set'}</dd><dt>Preferred jersey</dt><dd>{s.preferred_jersey ? `#${s.preferred_jersey}` : 'Not set'}</dd></dl>
          <p className="muted">Match stats will appear here after this player's first recorded match.</p>
        </div>
      ))}
    </main>
  );
            }
