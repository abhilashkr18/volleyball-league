import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { saveMatchSetup } from '../../../actions';

export const dynamic = 'force-dynamic';

const ERRORS = {
  1: 'Match not found.',
  2: 'This match has already started, so the roster is locked.',
  3: 'Every selected player needs a jersey number.',
  4: 'A team can have at most 12 players in a match.',
  5: 'A team can have at most 2 liberos.',
  6: 'Two players in the same team cannot have the same jersey number.',
  7: 'Could not save. Please try again.',
};

function TeamBox({ team, list, saved, hasSaved }) {
  return (
    <section className="panel">
      <h3>{team.name}</h3>
      {list.length === 0 && <p className="muted">No players registered in this team.</p>}
      {list.map((r) => {
        const p = r.players;
        const s = saved[p.id];
        return (
          <div key={p.id} style={{ display: 'flex', gap: '.6rem', alignItems: 'center', borderTop: '1px solid var(--line)', padding: '.5rem 0', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', gap: '.5rem', alignItems: 'center', margin: 0, flex: 1, minWidth: 150 }}>
              <input type="checkbox" name={`in_${p.id}`} defaultChecked={hasSaved ? !!s : true} style={{ width: 'auto' }} />
              <span><b>{p.full_name}</b><br /><span className="muted">{p.player_code}</span></span>
            </label>
            <input name={`jersey_${p.id}`} type="number" min="0" max="99" placeholder="Jersey" aria-label={`Jersey number for ${p.full_name}`} defaultValue={s?.jersey_number ?? r.jersey_number ?? ''} style={{ width: 80 }} />
            <label style={{ display: 'flex', gap: '.3rem', alignItems: 'center', margin: 0, fontWeight: 400 }}>
              <input type="checkbox" name={`lib_${p.id}`} defaultChecked={!!s?.is_libero} style={{ width: 'auto' }} /> Libero
            </label>
          </div>
        );
      })}
    </section>
  );
}

export default async function MatchSetup({ params, searchParams }) {
  const sb = supabaseServer();
  const { data: m } = await sb.from('matches')
    .select('id,status,competition_id,first_referee,second_referee,scorer_name,line_judges,commissioner,toss_winner_team_id,toss_choice,team_a:teams!matches_team_a_id_fkey(id,name),team_b:teams!matches_team_b_id_fkey(id,name)')
    .eq('id', params.id).maybeSingle();
  if (!m || !m.team_a || !m.team_b) notFound();
  const { data: regs } = await sb.from('competition_players')
    .select('team_id,jersey_number,players(id,player_code,full_name)')
    .eq('competition_id', m.competition_id).in('team_id', [m.team_a.id, m.team_b.id])
    .order('jersey_number', { ascending: true, nullsFirst: false });
  const { data: ros } = await sb.from('match_rosters').select('player_id,jersey_number,is_libero').eq('match_id', m.id);
  const saved = Object.fromEntries((ros || []).map((r) => [r.player_id, r]));
  const hasSaved = (ros || []).length > 0;
  const locked = m.status !== 'scheduled';
  const of = (tid) => (regs || []).filter((r) => r.team_id === tid && r.players);

  return (
    <main className="wrap" style={{ maxWidth: 720 }}>
      <p><Link href={`/admin/competitions/${m.competition_id}/matches`}>← Matches</Link></p>
      <h1>Match setup</h1>
      <p className="muted">{m.team_a.name} vs {m.team_b.name}</p>
      {searchParams.error && <div className="err">{ERRORS[searchParams.error] || 'Something went wrong.'}</div>}
      {searchParams.ok && <div className="warn">Saved.</div>}
      {locked && <div className="warn">This match has started, so the setup is locked.</div>}
      <form action={saveMatchSetup}>
        <input type="hidden" name="match_id" value={m.id} />
        <fieldset disabled={locked} style={{ border: 0, padding: 0, margin: 0 }}>
          <section className="panel">
            <h3>Officials</h3>
            <div className="row">
              <div><label htmlFor="first_referee">1st referee</label><input id="first_referee" name="first_referee" defaultValue={m.first_referee ?? ''} /></div>
              <div><label htmlFor="second_referee">2nd referee</label><input id="second_referee" name="second_referee" defaultValue={m.second_referee ?? ''} /></div>
            </div>
            <div className="row">
              <div><label htmlFor="scorer_name">Scorer</label><input id="scorer_name" name="scorer_name" defaultValue={m.scorer_name ?? ''} /></div>
              <div><label htmlFor="commissioner">Match commissioner</label><input id="commissioner" name="commissioner" defaultValue={m.commissioner ?? ''} /></div>
            </div>
            <label htmlFor="line_judges">Line judges</label><input id="line_judges" name="line_judges" defaultValue={m.line_judges ?? ''} />
          </section>
          <section className="panel">
            <h3>Toss</h3>
            <div className="row">
              <div><label htmlFor="toss_winner">Won by</label>
                <select id="toss_winner" name="toss_winner" defaultValue={m.toss_winner_team_id ?? ''}>
                  <option value="">Not decided</option>
                  <option value={m.team_a.id}>{m.team_a.name}</option>
                  <option value={m.team_b.id}>{m.team_b.name}</option>
                </select></div>
              <div><label htmlFor="toss_choice">Chose to</label>
                <select id="toss_choice" name="toss_choice" defaultValue={m.toss_choice ?? ''}>
                  <option value="">Not decided</option>
                  <option value="serve">Serve first</option>
                  <option value="receive">Receive first</option>
                </select></div>
            </div>
          </section>
          <TeamBox team={m.team_a} list={of(m.team_a.id)} saved={saved} hasSaved={hasSaved} />
          <TeamBox team={m.team_b} list={of(m.team_b.id)} saved={saved} hasSaved={hasSaved} />
          <p><button type="submit">Save match setup</button></p>
        </fieldset>
      </form>
    </main>
  );
}
