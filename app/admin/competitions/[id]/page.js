import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { addTeam, deleteTeam, registerPlayer, updateRegistration, removeRegistration, updateCompetition } from '../../actions';
import PlayerPicker from '@/components/PlayerPicker';

export const dynamic = 'force-dynamic';

const ERRORS = {
  1: 'Enter the team name.',
  2: 'Could not add the team. The name may already exist in this competition.',
  3: 'Search and choose a player first.',
  4: 'No active player found with that Player ID.',
  5: 'This player has not selected this sport in their profile. Edit the player first.',
  6: 'This player is already registered in this competition.',
  7: 'That jersey number is already taken in this team.',
  8: 'Could not save. Please try again.',
    9: 'Competition name cannot be empty.',
  10: 'End date cannot be before the start date.',
};

export default async function ManageCompetition({ params, searchParams }) {
  const sb = supabaseServer();
     const { data: comp } = await sb.from('competitions').select('id,sport_id,name,format,status,venue,description,start_date,end_date,sports(name),categories(name)').eq('id', params.id).maybeSingle();
  if (!comp) notFound();
  const { data: teams } = await sb.from('teams').select('id,name').eq('competition_id', comp.id).order('created_at');
  const { data: regs } = await sb.from('competition_players').select('id,team_id,jersey_number,players(player_code,full_name)').eq('competition_id', comp.id).order('created_at');
  const teamOptions = (teams || []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>);
  const count = (tid) => (regs || []).filter((r) => r.team_id === tid).length;
  const unassigned = (regs || []).filter((r) => !r.team_id).length;

  return (
    <main className="wrap" style={{ maxWidth: 720 }}>
      <p><Link href="/admin/competitions">← Competitions</Link></p>
      <h1>{comp.name}</h1>
      <p className="muted">{comp.sports?.name} · {comp.categories?.name} · {comp.format.replace('_', ' ')} · {comp.status}</p>
      {searchParams.error && <div className="err">{ERRORS[searchParams.error] || 'Something went wrong.'}</div>}
      {(searchParams.ok || searchParams.saved || searchParams.created) && <div className="warn">Saved.</div>}
        
      <form action={updateCompetition} className="panel">
        <h3>Competition details</h3>
        <input type="hidden" name="id" value={comp.id} />
        <label htmlFor="cname">Name</label><input id="cname" name="name" defaultValue={comp.name} required />
        <div className="row">
          <div><label htmlFor="cformat">Format</label>
            <select id="cformat" name="format" defaultValue={comp.format}>
              <option value="knockout">Knockout</option>
              <option value="round_robin">Round robin (league)</option>
              <option value="groups">Groups + knockout</option>
              <option value="single">Single match</option>
            </select></div>
          <div><label htmlFor="cstatus">Status</label>
            <select id="cstatus" name="status" defaultValue={comp.status}>
              <option value="upcoming">Upcoming</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
            </select></div>
        </div>
        <div className="row">
          <div><label htmlFor="cstart">Start date</label><input id="cstart" name="start_date" type="date" defaultValue={comp.start_date ?? ''} /></div>
          <div><label htmlFor="cend">End date</label><input id="cend" name="end_date" type="date" defaultValue={comp.end_date ?? ''} /></div>
        </div>
        <label htmlFor="cvenue">Venue</label><input id="cvenue" name="venue" defaultValue={comp.venue ?? ''} />
        <label htmlFor="cdesc">Description</label><input id="cdesc" name="description" defaultValue={comp.description ?? ''} />
        <p><button type="submit">Save changes</button></p>
      </form>
      <section className="panel">
        <h3>Teams ({(teams || []).length})</h3>
        <form action={addTeam} style={{ display: 'flex', gap: '.5rem' }}>
          <input type="hidden" name="competition_id" value={comp.id} />
          <input name="name" placeholder="Team name" aria-label="Team name" required />
          <button type="submit">Add team</button>
        </form>
        {(teams || []).length === 0 && <p className="muted">No teams yet.</p>}
        {(teams || []).map((t) => (
          <form action={deleteTeam} key={t.id} style={{ display: 'flex', gap: '.6rem', alignItems: 'center', marginTop: '.6rem' }}>
            <input type="hidden" name="competition_id" value={comp.id} />
            <input type="hidden" name="id" value={t.id} />
            <span style={{ flex: 1 }}><b>{t.name}</b> <span className="muted">{count(t.id)} players</span></span>
            <button className="btn-line">Delete</button>
          </form>
        ))}
      </section>

      <form action={registerPlayer} className="panel">
        <h3>Register a player</h3>
        <input type="hidden" name="competition_id" value={comp.id} />
               <label>Player</label>
        <PlayerPicker sportId={comp.sport_id} registered={(regs || []).map((r) => r.players?.player_code)} /> 
        <div className="row">
          <div><label htmlFor="team_id">Team</label>
            <select id="team_id" name="team_id" defaultValue=""><option value="">No team yet</option>{teamOptions}</select></div>
          <div><label htmlFor="jersey">Jersey number</label><input id="jersey" name="jersey" type="number" min="0" max="99" /></div>
        </div>
        <p><button type="submit">Register player</button></p>
      </form>

      <h3>Registered players ({(regs || []).length}){unassigned ? ` · ${unassigned} without a team` : ''}</h3>
      {(regs || []).length === 0 && <p className="muted">No players registered yet.</p>}
      {(regs || []).map((r) => (
        <div className="panel" key={r.id}>
          <p style={{ margin: '0 0 .5rem' }}><b>{r.players?.full_name}</b> <span className="code">{r.players?.player_code}</span></p>
          <form action={updateRegistration} style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="hidden" name="competition_id" value={comp.id} />
            <input type="hidden" name="id" value={r.id} />
            <select name="team_id" defaultValue={r.team_id || ''} aria-label="Team" style={{ flex: 1, minWidth: 130 }}><option value="">No team</option>{teamOptions}</select>
            <input name="jersey" type="number" min="0" max="99" defaultValue={r.jersey_number ?? ''} placeholder="Jersey" aria-label="Jersey number" style={{ width: 90 }} />
            <button type="submit">Save</button>
          </form>
          <form action={removeRegistration} style={{ marginTop: '.5rem' }}>
            <input type="hidden" name="competition_id" value={comp.id} />
            <input type="hidden" name="id" value={r.id} />
            <button className="btn-line">Remove from competition</button>
          </form>
        </div>
      ))}
    </main>
  );
    }
