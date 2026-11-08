import PlayerForm from '@/components/PlayerForm';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function NewPlayer() {
  const { data } = await supabaseServer().from('sports').select('id,slug,name,sport_positions(name,sort_order)').eq('is_active', true).order('id');
  const sports = (data || []).map((s) => ({
    slug: s.slug,
    name: s.name,
    positions: [...(s.sport_positions || [])].sort((a, b) => a.sort_order - b.sort_order).map((p) => p.name),
  }));
  return (
    <main className="wrap" style={{ maxWidth: 640 }}>
      <h1>Add player</h1>
      <p className="muted">A unique Player ID (GZM-000000) is created when you save.</p>
      <PlayerForm sports={sports} />
    </main>
  );
}
