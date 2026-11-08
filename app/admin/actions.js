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

    const rows = await sportRows(sb, formData, p.id);
  const r1 = await sb.from('player_private').insert({ player_id: p.id, date_of_birth: dob, phone: phone || null });
  const r2 = rows.length ? await sb.from('player_sports').insert(rows) : { error: null };
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
export async function updatePlayer(_prev, formData) {
  const sb = supabaseServer();
  const id = String(formData.get('id'));
  const code = String(formData.get('code'));
  const full_name = String(formData.get('full_name') || '').trim();
  const phone = String(formData.get('phone') || '').replace(/\D/g, '');
  const dob = String(formData.get('dob') || '');
  const photo = formData.get('photo');
  if (!full_name || !dob) return { error: 'Enter the full name and date of birth.' };
  if (phone && phone.length < 10) return { error: 'Phone must be 10 digits, or leave it empty.' };
  if (photo && photo.size > 2 * 1024 * 1024) return { error: 'Photo must be 2 MB or smaller.' };

  const changes = {
    full_name,
    height_cm: formData.get('height') ? Number(formData.get('height')) : null,
    dominant_hand: formData.get('hand') || null,
    village: String(formData.get('village') || '').trim() || null,
  };
  if (photo && photo.size > 0) {
    const ext = (photo.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${id}-${Date.now()}.${ext}`;
    const up = await sb.storage.from('player-photos').upload(path, photo, { contentType: photo.type });
    if (up.error) return { error: 'Photo upload failed. Try a smaller image.' };
    changes.photo_url = sb.storage.from('player-photos').getPublicUrl(path).data.publicUrl;
  }

    const rows = await sportRows(sb, formData, id);
  const r0 = await sb.from('players').update(changes).eq('id', id);
  const r1 = await sb.from('player_private').update({ date_of_birth: dob, phone: phone || null }).eq('player_id', id);
  await sb.from('player_sports').delete().eq('player_id', id);
  const r2 = rows.length ? await sb.from('player_sports').insert(rows) : { error: null };
  if (r0.error || r1.error || r2.error) return { error: 'Could not save the changes. Please try again.' };

  revalidatePath('/players');
  revalidatePath(`/players/${code}`);
  redirect(`/players/${code}`);
}
async function sportRows(sb, formData, playerId) {
  const { data: sports } = await sb.from('sports').select('id,slug').eq('is_active', true);
  return (sports || []).filter((s) => formData.get(`play_${s.slug}`) === 'on').map((s) => {
    const j = formData.get(`jersey_${s.slug}`);
    return { player_id: playerId, sport_id: s.id, position: formData.get(`pos_${s.slug}`) || null, preferred_jersey: j ? Number(j) : null };
  });
}
export async function addEvent(formData) {
  const sb = supabaseServer();
  const title = String(formData.get('title') || '').trim();
  const when = String(formData.get('starts_at') || '');
  if (!title || !when) redirect('/admin/events?error=1');
  const row = {
    title,
    sport_id: formData.get('sport_id') ? Number(formData.get('sport_id')) : null,
    description: String(formData.get('description') || '').trim() || null,
    venue: String(formData.get('venue') || '').trim() || null,
    starts_at: new Date(`${when}:00+05:30`).toISOString(),
  };
  const img = formData.get('image');
  if (img && img.size > 0) {
    if (img.size > 3 * 1024 * 1024) redirect('/admin/events?error=2');
    const ext = (img.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `events/${Date.now()}.${ext}`;
    const up = await sb.storage.from('media').upload(path, img, { contentType: img.type });
    if (up.error) redirect('/admin/events?error=3');
    row.image_url = sb.storage.from('media').getPublicUrl(path).data.publicUrl;
  }
  const { error } = await sb.from('events').insert(row);
  if (error) redirect('/admin/events?error=4');
  revalidatePath('/');
  revalidatePath('/events');
  revalidatePath('/admin/events');
  redirect('/admin/events');
}

export async function deleteEvent(formData) {
  await supabaseServer().from('events').delete().eq('id', String(formData.get('id')));
  revalidatePath('/');
  revalidatePath('/events');
  revalidatePath('/admin/events');
}
export async function addPhoto(formData) {
  const sb = supabaseServer();
  const img = formData.get('image');
  if (!img || img.size === 0) redirect('/admin/gallery?error=1');
  if (img.size > 3.5 * 1024 * 1024) redirect('/admin/gallery?error=2');
  const ext = (img.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `gallery/${Date.now()}.${ext}`;
  const up = await sb.storage.from('media').upload(path, img, { contentType: img.type });
  if (up.error) redirect('/admin/gallery?error=3');
  const { error } = await sb.from('photos').insert({
    image_url: sb.storage.from('media').getPublicUrl(path).data.publicUrl,
    sport_id: formData.get('sport_id') ? Number(formData.get('sport_id')) : null,
    caption: String(formData.get('caption') || '').trim() || null,
  });
  if (error) redirect('/admin/gallery?error=4');
  revalidatePath('/');
  revalidatePath('/gallery');
  revalidatePath('/admin/gallery');
  redirect('/admin/gallery');
}

export async function deletePhoto(formData) {
  const sb = supabaseServer();
  const id = String(formData.get('id'));
  const { data: row } = await sb.from('photos').select('image_url').eq('id', id).maybeSingle();
  await sb.from('photos').delete().eq('id', id);
  const stored = row?.image_url?.split('/media/')[1];
  if (stored) await sb.storage.from('media').remove([stored]);
  revalidatePath('/');
  revalidatePath('/gallery');
  revalidatePath('/admin/gallery');
}
