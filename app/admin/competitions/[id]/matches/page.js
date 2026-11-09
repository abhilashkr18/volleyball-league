import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { createMatch, deleteMatch } from '../../../actions';

export const dynamic = 'force-dynamic';

const ERRORS = {
  1: 'Choose both teams.',
  2: 'A team cannot play against itself.',
  3: 'Both teams must belong to this competition.',
  4: 'Could not create the match. Please try again.',
};
const fmt = (d) => (d ? new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) : 'Time not set');

export default async function AdminMatches({ params, searchParams }) {
  const sb = supabaseServer();
  const { data: comp } = await sb.from('competitions').select('id,name').eq('id', params.id).maybeSingle();
  if (!comp) notFound();
  const { data: teams } = await sb.from('teams').select('id,name,team_code').eq('competition_id', comp.id).order('created_at');
  const { data: matches } = await sb.from('matches')
    .select('id,round_label,scheduled_at,venue,best_of,status,team_a:teams!matches_team_a_id_fkey(name),team_b:teams!matches_team_b_id_fkey(name)')
    .eq('competition_id', comp.id).order('scheduled_at', { ascending: true, nullsFirst: false });
  const opts = (teams || []).map((t) => <option key={t.id} value={t.id}>{t.name} ({t.team_code})</option>);
  return (
    <main className="wrap" style={{ maxWidth: 720 }}>
      <p><Link href={`/admin/competitions/${comp.id}`}>← {comp.name}</Link></p>
      <h1>Matches</h1>
      {searchParams.error && <div className="err">{ERRORS[searchParams.error] || 'Something went wrong.'}</div>}
      {searchParams.ok && <div className="warn">Match created.</div>}
      {(teams || []).length < 2 ? (
        <p className="muted">Add at least two teams to this competition before creating matches.</p>
      ) : (
        <form action={createMatch} className="panel">
          <h3>Create match</h3>
          <input type="hidden" name="competition_id" value={comp.id} />
          <div className="row">
            <div><label htmlFor="team_a">Team A</label><select id="team_a" name="team_a" required defaultValue=""><option value="" disabled>Choose</option>{opts}</select></div>
            <div><label htmlFor="team_b">Team B</label><select id="team_b" name="team_b" required defaultValue=""><option value="" disabled>Choose</option>{opts}</select></div>
          </div>
          <div className="row">
            <div><label htmlFor="scheduled_at">Date and time</label><input id="scheduled_at" name="scheduled_at" type="datetime-local" /></div>
            <div><label htmlFor="best_of">Format</label>
              <select id="best_of" name="best_of" defaultValue="3"><option value="1">Single set</option><option value="3">Best of 3 sets</option><option value="5">Best of 5 sets</option></select></div>
          </div>
          <div className="row">
            <div><label htmlFor="round_label">Round (optional)</label><input id="round_label" name="round_label" placeholder="e.g. Semi-final" /></div>
            <div><label htmlFor="venue">Venue (optional)</label><input id="venue" name="venue" placeholder="Muri, Jharkhand" /></div>
          </div>
          <p><button type="submit">Create match</button></p>
        </form>
      )}
      <h3>All matches ({(matches || []).length})</h3>
      {(matches || []).length === 0 && <p className="muted">No matches yet.</p>}
      {(matches || []).map((m) => (
        <form action={deleteMatch} className="panel" key={m.id} style={{ display: 'flex', gap: '.8rem', alignItems: 'center' }}>
          <input type="hidden" name="competition_id" value={comp.id} />
          <input type="hidden" name="id" value={m.id} />
          <span style={{ flex: 1 }}><b>{m.team_a?.name} vs {m.team_b?.name}</b><br /><span className="muted">{m.round_label ? `${m.round_label} · ` : ''}{fmt(m.scheduled_at)} · Best of {m.best_of} · {m.status}</span></span>
          <button className="btn-line">Delete</button>
        </form>
      ))}
    </main>
  );
        }
