import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import EditPlayerForm from '@/components/EditPlayerForm';

export const dynamic = 'force-dynamic';

export default async function EditPlayer({ params }) {
  const { data } = await supabaseServer().from('players')
    .select('id,player_code,full_name,height_cm,dominant_hand,village,player_private(date_of_birth,phone),player_sports(position,preferred_jersey)')
    .eq('player_code', params.code.toUpperCase()).maybeSingle();
  if (!data) notFound();
  const priv = (Array.isArray(data.player_private) ? data.player_private[0] : data.player_private) || {};
  const sport = data.player_sports?.[0] || {};
  const p = {
    id: data.id,
    player_code: data.player_code,
    full_name: data.full_name,
    village: data.village ?? '',
    dob: priv.date_of_birth ?? '',
    phone: priv.phone ?? '',
    position: sport.position ?? '',
    jersey: sport.preferred_jersey ?? '',
    height: data.height_cm ?? '',
    hand: data.dominant_hand ?? '',
  };
  return (
    <main className="wrap" style={{ maxWidth: 640 }}>
      <h1>Edit player</h1>
      <EditPlayerForm p={p} />
    </main>
  );
}
