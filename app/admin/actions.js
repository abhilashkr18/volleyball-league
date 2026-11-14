'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { replaySet, setWinner, targetFor, setsToWin, pendingBreak } from '@/lib/engine';
import { ABOUT_FILES } from '@/lib/aboutContent';

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
export async function addVideo(formData) {
  const sb = supabaseServer();
  const title = String(formData.get('title') || '').trim();
  const url = String(formData.get('video_url') || '').trim();
  if (!title || !/^https?:\/\//i.test(url)) redirect('/admin/videos?error=1');
  const { error } = await sb.from('videos').insert({
    title,
    video_url: url,
    sport_id: formData.get('sport_id') ? Number(formData.get('sport_id')) : null,
  });
  if (error) redirect('/admin/videos?error=2');
  revalidatePath('/');
  revalidatePath('/videos');
  revalidatePath('/admin/videos');
  redirect('/admin/videos');
}

export async function deleteVideo(formData) {
  await supabaseServer().from('videos').delete().eq('id', String(formData.get('id')));
  revalidatePath('/');
  revalidatePath('/videos');
  revalidatePath('/admin/videos');
}
export async function saveAbout(formData) {
  const value = String(formData.get('about') || '').trim();
  if (!value) redirect('/admin/home?error=1');
  const { error } = await supabaseServer().from('site_settings').upsert({ key: 'about_text', value });
  if (error) redirect('/admin/home?error=2');
  revalidatePath('/');
  redirect('/admin/home?saved=1');
}

export async function addNews(formData) {
  const title = String(formData.get('title') || '').trim();
  if (!title) redirect('/admin/home?error=3');
  const { error } = await supabaseServer().from('news').insert({ title });
  if (error) redirect('/admin/home?error=2');
  revalidatePath('/');
  redirect('/admin/home');
}

export async function deleteNews(formData) {
  await supabaseServer().from('news').delete().eq('id', String(formData.get('id')));
  revalidatePath('/');
  revalidatePath('/admin/home');
}
export async function createCompetition(formData) {
  const sb = supabaseServer();
  const name = String(formData.get('name') || '').trim();
  const category_id = Number(formData.get('category_id'));
  const sport_id = Number(formData.get('sport_id'));
  const start = String(formData.get('start_date') || '');
  const end = String(formData.get('end_date') || '');
  if (!name || !category_id || !sport_id) redirect('/admin/competitions?error=1');
  if (start && end && end < start) redirect('/admin/competitions?error=2');
    const { data: made, error } = await sb.from('competitions').insert({
    name,
    category_id,
    sport_id,
    format: String(formData.get('format') || 'knockout'),
    venue: String(formData.get('venue') || '').trim() || null,
    description: String(formData.get('description') || '').trim() || null,
    start_date: start || null,
       end_date: end || null,
  }).select('id').single();
  if (error) redirect('/admin/competitions?error=3'); 
  revalidatePath('/admin/competitions');
  revalidatePath('/');
    redirect(`/admin/competitions/${made.id}?created=1`);
}

export async function deleteCompetition(formData) {
  await supabaseServer().from('competitions').delete().eq('id', String(formData.get('id')));
  revalidatePath('/admin/competitions');
  revalidatePath('/');
      }

export async function addTeam(formData) {
  const sb = supabaseServer();
  const cid = String(formData.get('competition_id'));
  const name = String(formData.get('name') || '').trim();
  if (!name) redirect(`/admin/competitions/${cid}?error=1`);
  const { error } = await sb.from('teams').insert({ competition_id: cid, name });
  if (error) redirect(`/admin/competitions/${cid}?error=2`);
  revalidatePath(`/admin/competitions/${cid}`);
  redirect(`/admin/competitions/${cid}`);
}

export async function deleteTeam(formData) {
  const cid = String(formData.get('competition_id'));
  await supabaseServer().from('teams').delete().eq('id', String(formData.get('id')));
  revalidatePath(`/admin/competitions/${cid}`);
  redirect(`/admin/competitions/${cid}`);
}

export async function registerPlayer(formData) {
  const sb = supabaseServer();
  const cid = String(formData.get('competition_id'));
  const back = (q) => redirect(`/admin/competitions/${cid}?${q}`);
  const code = String(formData.get('code') || '').trim().toUpperCase();
  if (!code) back('error=3');
  const { data: comp } = await sb.from('competitions').select('sport_id').eq('id', cid).maybeSingle();
  const { data: p } = await sb.from('players').select('id,status').eq('player_code', code).maybeSingle();
  if (!comp || !p || p.status !== 'active') back('error=4');
  const { data: ps } = await sb.from('player_sports').select('player_id').eq('player_id', p.id).eq('sport_id', comp.sport_id).maybeSingle();
  if (!ps) back('error=5');
  const team = String(formData.get('team_id') || '');
  const j = String(formData.get('jersey') || '');
  const { error } = await sb.from('competition_players').insert({
    competition_id: cid,
    player_id: p.id,
    team_id: team || null,
    jersey_number: j === '' ? null : Number(j),
  });
  if (error) back(error.message.includes('team_jersey') ? 'error=7' : error.code === '23505' ? 'error=6' : 'error=8');
  revalidatePath(`/admin/competitions/${cid}`);
  back('ok=1');
}

export async function updateRegistration(formData) {
  const sb = supabaseServer();
  const cid = String(formData.get('competition_id'));
  const team = String(formData.get('team_id') || '');
  const j = String(formData.get('jersey') || '');
  const { error } = await sb.from('competition_players').update({
    team_id: team || null,
    jersey_number: j === '' ? null : Number(j),
  }).eq('id', String(formData.get('id')));
  revalidatePath(`/admin/competitions/${cid}`);
  if (error) redirect(`/admin/competitions/${cid}?error=${error.message.includes('team_jersey') ? 7 : 8}`);
  redirect(`/admin/competitions/${cid}?saved=1`);
}

export async function removeRegistration(formData) {
  const cid = String(formData.get('competition_id'));
  await supabaseServer().from('competition_players').delete().eq('id', String(formData.get('id')));
  revalidatePath(`/admin/competitions/${cid}`);
  redirect(`/admin/competitions/${cid}`);
}
export async function updateCompetition(formData) {
  const sb = supabaseServer();
  const id = String(formData.get('id'));
  const name = String(formData.get('name') || '').trim();
  const start = String(formData.get('start_date') || '');
  const end = String(formData.get('end_date') || '');
  if (!name) redirect(`/admin/competitions/${id}?error=9`);
  if (start && end && end < start) redirect(`/admin/competitions/${id}?error=10`);
  const { error } = await sb.from('competitions').update({
    name,
    format: String(formData.get('format') || 'knockout'),
    status: String(formData.get('status') || 'upcoming'),
    venue: String(formData.get('venue') || '').trim() || null,
    description: String(formData.get('description') || '').trim() || null,
    start_date: start || null,
    end_date: end || null,
  }).eq('id', id);
  revalidatePath('/');
  revalidatePath('/competitions');
  revalidatePath(`/competitions/${id}`);
  revalidatePath(`/admin/competitions/${id}`);
  if (error) redirect(`/admin/competitions/${id}?error=8`);
  redirect(`/admin/competitions/${id}?saved=1`);
}
export async function setTeamLogo(formData) {
  const sb = supabaseServer();
  const cid = String(formData.get('competition_id'));
  const id = String(formData.get('id'));
  const img = formData.get('photo');
  if (!img || img.size === 0) redirect(`/admin/competitions/${cid}?error=11`);
  if (img.size > 3.5 * 1024 * 1024) redirect(`/admin/competitions/${cid}?error=12`);
  const ext = (img.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `teams/${id}-${Date.now()}.${ext}`;
  const up = await sb.storage.from('media').upload(path, img, { contentType: img.type });
  if (up.error) redirect(`/admin/competitions/${cid}?error=13`);
  const { error } = await sb.from('teams').update({ logo_url: sb.storage.from('media').getPublicUrl(path).data.publicUrl }).eq('id', id);
  if (error) redirect(`/admin/competitions/${cid}?error=13`);
  revalidatePath(`/admin/competitions/${cid}`);
  revalidatePath(`/competitions/${cid}`);
  redirect(`/admin/competitions/${cid}?saved=1`);
    }
export async function setCaptain(formData) {
  const sb = supabaseServer();
  const cid = String(formData.get('competition_id'));
  const teamId = String(formData.get('team_id'));
  const playerId = String(formData.get('captain') || '');
  if (playerId) {
    const { data: ok } = await sb.from('competition_players').select('id').eq('team_id', teamId).eq('player_id', playerId).maybeSingle();
    if (!ok) redirect(`/admin/competitions/${cid}?error=14`);
  }
  const { error } = await sb.from('teams').update({ captain_player_id: playerId || null }).eq('id', teamId);
  if (error) redirect(`/admin/competitions/${cid}?error=8`);
  revalidatePath(`/admin/competitions/${cid}`);
  revalidatePath(`/competitions/${cid}`);
  redirect(`/admin/competitions/${cid}?saved=1`);
}
export async function createMatch(formData) {
  const sb = supabaseServer();
  const cid = String(formData.get('competition_id'));
  const back = (q) => redirect(`/admin/competitions/${cid}/matches?${q}`);
  const a = String(formData.get('team_a') || '');
  const b = String(formData.get('team_b') || '');
  if (!a || !b) back('error=1');
  if (a === b) back('error=2');
  const { data: ok } = await sb.from('teams').select('id').eq('competition_id', cid).in('id', [a, b]);
  if ((ok || []).length !== 2) back('error=3');
  const when = String(formData.get('scheduled_at') || '');
  const { error } = await sb.from('matches').insert({
    competition_id: cid,
    team_a_id: a,
    team_b_id: b,
    round_label: String(formData.get('round_label') || '').trim() || null,
    scheduled_at: when ? new Date(`${when}:00+05:30`).toISOString() : null,
    venue: String(formData.get('venue') || '').trim() || null,
    best_of: Number(formData.get('best_of')) || 3,
  });
  if (error) back('error=4');
  revalidatePath(`/admin/competitions/${cid}/matches`);
  revalidatePath(`/competitions/${cid}`);
  back('ok=1');
}

export async function deleteMatch(formData) {
  const cid = String(formData.get('competition_id'));
  await supabaseServer().from('matches').delete().eq('id', String(formData.get('id')));
  revalidatePath(`/admin/competitions/${cid}/matches`);
  revalidatePath(`/competitions/${cid}`);
  redirect(`/admin/competitions/${cid}/matches`);
}
export async function saveMatchSetup(formData) {
  const sb = supabaseServer();
  const mid = String(formData.get('match_id'));
  const back = (q) => redirect(`/admin/matches/${mid}/setup?${q}`);
  const { data: m } = await sb.from('matches').select('id,status,team_a_id,team_b_id,competition_id').eq('id', mid).maybeSingle();
  if (!m) back('error=1');
  if (m.status !== 'scheduled') back('error=2');
  const { data: regs } = await sb.from('competition_players').select('player_id,team_id').eq('competition_id', m.competition_id).in('team_id', [m.team_a_id, m.team_b_id]);
  const rows = [];
  for (const r of regs || []) {
    if (formData.get(`in_${r.player_id}`) !== 'on') continue;
    const j = String(formData.get(`jersey_${r.player_id}`) || '');
    if (j === '') back('error=3');
    rows.push({ match_id: mid, team_id: r.team_id, player_id: r.player_id, jersey_number: Number(j), is_libero: formData.get(`lib_${r.player_id}`) === 'on' });
  }
  for (const tid of [m.team_a_id, m.team_b_id]) {
    const mine = rows.filter((x) => x.team_id === tid);
    if (mine.length > 12) back('error=4');
    if (mine.filter((x) => x.is_libero).length > 2) back('error=5');
    if (new Set(mine.map((x) => x.jersey_number)).size !== mine.length) back('error=6');
  }
  const toss = String(formData.get('toss_winner') || '');
  const txt = (k) => String(formData.get(k) || '').trim() || null;
  const { error: e1 } = await sb.from('matches').update({
    first_referee: txt('first_referee'),
    second_referee: txt('second_referee'),
    scorer_name: txt('scorer_name'),
    line_judges: txt('line_judges'),
    commissioner: txt('commissioner'),
    toss_winner_team_id: [m.team_a_id, m.team_b_id].includes(toss) ? toss : null,
    toss_choice: toss ? String(formData.get('toss_choice') || '') || null : null,
  }).eq('id', mid);
  if (e1) back('error=7');
  await sb.from('set_lineups').delete().eq('match_id', mid);
  await sb.from('match_rosters').delete().eq('match_id', mid);
  if (rows.length) {
    const { error: e2 } = await sb.from('match_rosters').insert(rows);
    if (e2) back('error=7');
  }
  revalidatePath(`/admin/matches/${mid}/setup`);
  back('ok=1');
}
// ---------- Live scoring ----------
async function scoringState(sb, matchId, setNo) {
  const { data: m } = await sb.from('matches').select('id,status,best_of,team_a_id,team_b_id,competition_id').eq('id', matchId).maybeSingle();
  if (!m) return null;
  const { data: sets } = await sb.from('match_sets').select('*').eq('match_id', matchId).order('set_number');
  const set = (sets || []).find((s) => s.set_number === setNo) || null;
  const { data: roster } = await sb.from('match_rosters').select('team_id,player_id,jersey_number,is_libero').eq('match_id', matchId);
  let rallies = [];
  let events = [];
  let state = null;
  if (set) {
    const [l, r, e] = await Promise.all([
      sb.from('set_lineups').select('team_id,slot,player_id').eq('match_id', matchId).eq('set_number', setNo).order('slot'),
      sb.from('rallies').select('*').eq('match_id', matchId).eq('set_number', setNo).order('seq'),
      sb.from('match_events').select('*').eq('match_id', matchId).eq('set_number', setNo).order('created_at'),
    ]);
    rallies = r.data || [];
    events = e.data || [];
    const lineA = (l.data || []).filter((x) => x.team_id === m.team_a_id).map((x) => x.player_id);
    const lineB = (l.data || []).filter((x) => x.team_id === m.team_b_id).map((x) => x.player_id);
    if (lineA.length === 6 && lineB.length === 6) {
      state = replaySet({ teamA: m.team_a_id, teamB: m.team_b_id, lineupA: lineA, lineupB: lineB, firstServe: set.first_serve_team_id, rallies, events });
    }
  }
  return { m, sets: sets || [], set, roster: roster || [], rallies, events, state };
}

function refreshMatch(m) {
  revalidatePath(`/matches/${m.id}`);
  revalidatePath(`/admin/matches/${m.id}/score`);
  revalidatePath(`/competitions/${m.competition_id}`);
}

export async function startSet(input) {
  const sb = supabaseServer();
  const { data: m } = await sb.from('matches').select('id,status,best_of,team_a_id,team_b_id,competition_id').eq('id', input.matchId).maybeSingle();
  if (!m) return { error: 'Match not found.' };
  if (m.status === 'completed') return { error: 'This match is already finished.' };
  const { data: sets } = await sb.from('match_sets').select('set_number,completed').eq('match_id', m.id);
  if ((sets || []).some((s) => !s.completed)) return { error: 'Finish the current set first.' };
  const setNo = (sets || []).length + 1;
  if (setNo > m.best_of) return { error: 'All sets are already played.' };
  const { data: ros } = await sb.from('match_rosters').select('team_id,player_id,is_libero').eq('match_id', m.id);
  const okTeam = (tid, ids) => Array.isArray(ids) && ids.length === 6 && new Set(ids).size === 6 && ids.every((id) => (ros || []).some((r) => r.team_id === tid && r.player_id === id && !r.is_libero));
  if (!okTeam(m.team_a_id, input.lineupA) || !okTeam(m.team_b_id, input.lineupB)) return { error: 'Each team needs 6 different starting players from its roster. The libero is not part of the starting six.' };
  if (![m.team_a_id, m.team_b_id].includes(input.firstServe)) return { error: 'Choose which team serves first.' };
  const { error: e1 } = await sb.from('match_sets').insert({ match_id: m.id, set_number: setNo, first_serve_team_id: input.firstServe });
  if (e1) return { error: 'Could not start the set.' };
  const rows = [
    ...input.lineupA.map((p, i) => ({ match_id: m.id, set_number: setNo, team_id: m.team_a_id, slot: i + 1, player_id: p })),
    ...input.lineupB.map((p, i) => ({ match_id: m.id, set_number: setNo, team_id: m.team_b_id, slot: i + 1, player_id: p })),
  ];
  const { error: e2 } = await sb.from('set_lineups').insert(rows);
  if (e2) {
    await sb.from('match_sets').delete().eq('match_id', m.id).eq('set_number', setNo);
    return { error: 'Could not save the starting lineups.' };
  }
  if (m.status === 'scheduled') await sb.from('matches').update({ status: 'live', started_at: new Date().toISOString() }).eq('id', m.id);
  refreshMatch(m);
  return { ok: true, setNo };
}

async function addRally(sb, ctx, r) {
  const { m, set, state } = ctx;
  const A = m.team_a_id;
  const scoreA = state.scoreA + (r.pt === A ? 1 : 0);
  const scoreB = state.scoreB + (r.pt === A ? 0 : 1);
  const { error } = await sb.from('rallies').insert({
    match_id: m.id, set_number: set.set_number, seq: state.rallies + 1,
    serving_team_id: state.serving, server_player_id: state.server, point_team_id: r.pt,
    action: r.action, scorer_player_id: r.scorer || null, error_player_id: r.errP || null, error_kind: r.errorKind || null,
    score_a: scoreA, score_b: scoreB,
  });
  if (error) return { error: 'Could not save the point. Please try again.' };
  const winner = setWinner(scoreA, scoreB, targetFor(set.set_number, m.best_of));
  await sb.from('match_sets').update({ points_a: scoreA, points_b: scoreB, completed: !!winner }).eq('id', set.id);
  let matchOver = false;
  if (winner) {
    const { data: all } = await sb.from('match_sets').select('points_a,points_b,completed').eq('match_id', m.id);
    const wa = (all || []).filter((s) => s.completed && s.points_a > s.points_b).length;
    const wb = (all || []).filter((s) => s.completed && s.points_b > s.points_a).length;
    const need = setsToWin(m.best_of);
    if (wa >= need || wb >= need) {
      matchOver = true;
      await sb.from('matches').update({ status: 'completed', winner_team_id: wa >= need ? m.team_a_id : m.team_b_id, ended_at: new Date().toISOString() }).eq('id', m.id);
    }
  }
  refreshMatch(m);
  return { ok: true, scoreA, scoreB, setOver: !!winner, matchOver };
}

function playing(ctx) {
  const { m, set, state } = ctx;
  return !!(m && set && state && m.status !== 'completed' && !set.completed);
}

export async function scorePoint(input) {
  const sb = supabaseServer();
  const ctx = await scoringState(sb, input.matchId, input.setNo);
  if (!ctx || !playing(ctx)) return { error: 'This set is not in play.' };
  const { m, state, roster } = ctx;
  const pt = input.pointTeam;
  if (![m.team_a_id, m.team_b_id].includes(pt)) return { error: 'Choose the team that won the point.' };
  const other = pt === m.team_a_id ? m.team_b_id : m.team_a_id;
  const isLibero = (id) => roster.some((x) => x.player_id === id && x.is_libero);
  const action = input.action;
  let scorer = null;
  let errP = null;
  if (['kill', 'block', 'ace'].includes(action)) {
    scorer = input.scorer;
    const i = state.court[pt].indexOf(scorer);
    if (i < 0) return { error: 'That player is not on the court.' };
    if (isLibero(scorer) && action !== 'ace') return { error: 'The libero cannot score an attack or block point.' };
    if (action === 'ace' && (pt !== state.serving || scorer !== state.server)) return { error: 'An ace must be scored by the player who is serving.' };
    if (action === 'block' && (i < 1 || i > 3)) return { error: 'Only a front-row player can score a block.' };
  } else if (action === 'opp_error') {
    errP = input.errorPlayer || null;
    if (errP && !state.court[other].includes(errP)) return { error: 'That player is not on the court.' };
  } else {
    return { error: 'Unknown action.' };
  }
  return addRally(sb, ctx, { pt, action, scorer, errP, errorKind: input.errorKind });
}

// Yellow card (penalty) and delay penalty: point and service go to the opponent.
export async function givePenalty(input) {
  const sb = supabaseServer();
  const ctx = await scoringState(sb, input.matchId, input.setNo);
  if (!ctx || !playing(ctx)) return { error: 'This set is not in play.' };
  const { m } = ctx;
  if (![m.team_a_id, m.team_b_id].includes(input.teamId)) return { error: 'Choose the team.' };
  if (!['yellow', 'delay'].includes(input.kind)) return { error: 'Unknown penalty.' };
  const pt = input.teamId === m.team_a_id ? m.team_b_id : m.team_a_id;
  return addRally(sb, ctx, { pt, action: 'penalty', scorer: null, errP: input.playerId || null, errorKind: input.kind });
}

export async function undoLast(input) {
  const sb = supabaseServer();
  const { data: m } = await sb.from('matches').select('id,status,team_a_id,team_b_id,competition_id').eq('id', input.matchId).maybeSingle();
  if (!m) return { error: 'Match not found.' };
  const { data: rs } = await sb.from('rallies').select('*').eq('match_id', m.id).eq('set_number', input.setNo).order('seq', { ascending: false }).limit(1);
  const { data: es } = await sb.from('match_events').select('*').eq('match_id', m.id).eq('set_number', input.setNo).order('created_at', { ascending: false }).limit(1);
  const r = (rs || [])[0];
  const e = (es || [])[0];
  if (!r && !e) {
    // Nothing played in this set: remove the empty set so the lineups can be chosen again.
    await sb.from('set_lineups').delete().eq('match_id', m.id).eq('set_number', input.setNo);
    await sb.from('match_sets').delete().eq('match_id', m.id).eq('set_number', input.setNo);
    const { data: left } = await sb.from('match_sets').select('set_number').eq('match_id', m.id);
    if (!(left || []).length) await sb.from('matches').update({ status: 'scheduled', started_at: null }).eq('id', m.id);
    refreshMatch(m);
    return { ok: true, undone: 'set' };
  }
  if (e && (!r || new Date(e.created_at) > new Date(r.created_at))) {
    await sb.from('match_events').delete().eq('id', e.id);
    refreshMatch(m);
    return { ok: true, undone: 'event' };
  }
  await sb.from('rallies').delete().eq('id', r.id);
  await sb.from('match_sets').update({
    points_a: r.score_a - (r.point_team_id === m.team_a_id ? 1 : 0),
    points_b: r.score_b - (r.point_team_id === m.team_b_id ? 1 : 0),
    completed: false,
  }).eq('match_id', m.id).eq('set_number', input.setNo);
  if (m.status === 'completed') await sb.from('matches').update({ status: 'live', winner_team_id: null, ended_at: null }).eq('id', m.id);
  refreshMatch(m);
  return { ok: true, undone: 'point' };
    }
export async function recordEvent(input) {
  const sb = supabaseServer();
  const ctx = await scoringState(sb, input.matchId, input.setNo);
  if (!ctx || !playing(ctx)) return { error: 'This set is not in play.' };
  const { m, state, roster, events } = ctx;
  const kind = input.kind;
  const row = {
    match_id: m.id, set_number: ctx.set.set_number, after_seq: state.rallies, kind,
    team_id: null, player_id: null, player_in_id: null, score_a: state.scoreA, score_b: state.scoreB, note: input.note || null,
  };
  if (kind === 'technical_timeout' || kind === 'side_change') {
    const need = pendingBreak({ setNo: ctx.set.set_number, bestOf: m.best_of, a: state.scoreA, b: state.scoreB, events });
    if (!need || need.kind !== kind) return { error: 'No break is due right now.' };
    row.note = need.at ? String(need.at) : null;
  } else {
    const t = input.teamId;
    if (![m.team_a_id, m.team_b_id].includes(t)) return { error: 'Choose the team.' };
    row.team_id = t;
    const court = state.court[t];
    const inRoster = (id) => roster.some((x) => x.team_id === t && x.player_id === id);
    const isLib = (id) => roster.some((x) => x.player_id === id && x.is_libero);
    const out = input.playerId || null;
    const inn = input.playerInId || null;
    if (kind === 'substitution') {
      if (state.subs[t] >= 6) return { error: 'This team has already used all 6 substitutions in this set.' };
      if (!court.includes(out) || isLib(out)) return { error: 'Choose a player who is on the court.' };
      if (!inRoster(inn) || court.includes(inn) || isLib(inn)) return { error: 'Choose a player from the bench.' };
      row.player_id = out;
      row.player_in_id = inn;
    } else if (kind === 'libero_in') {
      const i = court.indexOf(out);
      if (i !== 4 && i !== 5) return { error: 'The libero can replace a back-row player only (positions V and VI).' };
      if (isLib(out)) return { error: 'Choose a regular player to replace.' };
      if (!inRoster(inn) || !isLib(inn) || court.includes(inn)) return { error: 'Choose a libero from the bench.' };
      row.player_id = out;
      row.player_in_id = inn;
    } else if (kind === 'libero_out') {
      const orig = state.libero[t][out];
      if (!orig || !court.includes(out)) return { error: 'That libero is not on the court.' };
      row.player_id = out;
      row.player_in_id = orig;
    } else if (kind === 'timeout') {
      if (state.timeouts[t] >= 2) return { error: 'This team has already used both time-outs in this set.' };
    } else if (kind === 'red_card') {
      if (!inRoster(out)) return { error: 'Choose a player of this team.' };
      row.player_id = out;
    } else if (kind === 'delay_warning') {
      const { data: prev } = await sb.from('match_events').select('id').eq('match_id', m.id).eq('team_id', t).eq('kind', 'delay_warning');
      if ((prev || []).length) return { error: 'This team already has a delay warning. Give a delay penalty instead.' };
    } else {
      return { error: 'Unknown event.' };
    }
  }
  const { error } = await sb.from('match_events').insert(row);
  if (error) return { error: 'Could not save. Please try again.' };
  refreshMatch(m);
  return { ok: true };
}
// ---------- About section ----------
export async function importAboutContent() {
  const sb = supabaseServer();
  const { data: existing } = await sb.from('about_pages').select('slug');
  const have = new Set((existing || []).map((p) => p.slug));
  let added = 0;
  for (const file of ABOUT_FILES) {
    for (const p of file.pages) {
      if (have.has(p.slug)) continue;
      const { data: row, error } = await sb.from('about_pages').insert({
        slug: p.slug, tab: file.tab, sort_order: p.sort_order, accent: p.accent, published: p.published,
        title_en: p.title_en, title_hi: p.title_hi, subtitle_en: p.subtitle_en, subtitle_hi: p.subtitle_hi,
      }).select('id').single();
      if (error || !row) redirect('/admin/about?error=1');
      const blocks = p.blocks.map((b, i) => ({
        page_id: row.id, sort_order: i, kind: b.kind,
        heading_en: b.heading_en, heading_hi: b.heading_hi, body_en: b.body_en, body_hi: b.body_hi, images: b.images,
      }));
      const { error: e2 } = await sb.from('about_blocks').insert(blocks);
      if (e2) {
        await sb.from('about_pages').delete().eq('id', row.id);
        redirect('/admin/about?error=2');
      }
      added += 1;
    }
  }
  revalidatePath('/about');
  revalidatePath('/admin/about');
  redirect(`/admin/about?imported=${added}`);
}

export async function setAboutPageVisible(formData) {
  await supabaseServer().from('about_pages').update({ published: formData.get('show') === 'true', updated_at: new Date().toISOString() }).eq('id', String(formData.get('id')));
  revalidatePath('/about');
  revalidatePath('/admin/about');
}
