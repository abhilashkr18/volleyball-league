'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';

export async function signOut() {
  await supabaseServer().auth.signOut();
  redirect('/login');
}

export async function addCategory(formData) {
  const name = String(formData.get('name') || '').trim();
  if (!name) return;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const sb = supabaseServer();
  const { count } = await sb.from('categories').select('*', { count: 'exact', head: true });
  await sb.from('categories').insert({ name, slug, sort_order: (count || 0) + 1 });
  revalidatePath('/admin/categories');
  revalidatePath('/');
}

export async function toggleCategory(formData) {
  const sb = supabaseServer();
  await sb.from('categories').update({ is_active: formData.get('active') === 'true' }).eq('id', Number(formData.get('id')));
  revalidatePath('/admin/categories');
  revalidatePath('/');
}

export async function createPlayer(_prev, formData) {
  const sb = supabaseServer();
  const full_name = String(formData.get('full_name') || '').trim();
  const phone = String(formData.get('phone') || '').replace(/\D/g, '');
  const dob = String(formData.get('dob') || '');
  const force = formData.get('force') === 'on';
  const photo = formData.get('photo');
    if (!full_name || !dob) return { error: 'Enter the full name and date of birth.' };
  if (phone && phone.length < 10) return { error: 'Phone must be 10 digits, or leave it empty.' };
  if (photo && photo.size > 2 * 1024 * 1024) return { error: 'Photo must be 2 MB or smaller.' };

  // Duplicate check: same phone, or same name with same date of birth.
  if (!force) {
        const { data: hits } = await sb.from('player_private').select('phone,date_of_birth,players(full_name,player_code)').or(phone ? `phone.eq.${phone},date_of_birth.eq.${dob}` : `date_of_birth.eq.${dob}`);
    const dup = (hits || []).find((h) => (phone && h.phone === phone) || h.players?.full_name.toLowerCase() === full_name.toLowerCase());
    if (dup) return { duplicate: `${dup.players.full_name} (${dup.players.player_code})` };
  }

  const { data: p, error } = await sb.from('players').insert({
    full_name,
    height_cm: formData.get('height') ? Number(formData.get('height')) : null,
    dominant_hand: formData.get('hand') || null,
    village: String(formData.get('village') || '').trim() || null,
  }).select('id,player_code').single();
  if (error) return { error: 'Could not save the player. Check that you are signed in as admin.' };

  const { data: vb } = await sb.from('sports').select('id').eq('slug', 'volleyball').single();
  const jersey = formData.get('jersey') ? Number(formData.get('jersey')) : null;
    const r1 = await sb.from('player_private').insert({ player_id: p.id, date_of_birth: dob, phone: phone || null });
  const r2 = await sb.from('player_sports').insert({ player_id: p.id, sport_id: vb.id, position: formData.get('position') || null, preferred_jersey: jersey });
  if (r1.error || r2.error) {
    await sb.from('players').delete().eq('id', p.id);
    return { error: 'Could not save the player details. Nothing was created, please try again.' };
  }

  if (photo && photo.size > 0) {
    const ext = (photo.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${p.id}.${ext}`;
    const up = await sb.storage.from('player-photos').upload(path, photo, { contentType: photo.type, upsert: true });
    if (!up.error) {
      const { data } = sb.storage.from('player-photos').getPublicUrl(path);
      await sb.from('players').update({ photo_url: data.publicUrl }).eq('id', p.id);
    }
  }
  redirect(`/players/${p.player_code}`);
}
