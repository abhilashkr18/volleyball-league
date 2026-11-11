import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import StartSetForm from '@/components/StartSetForm';
import ScoreConsole from '@/components/ScoreConsole';

export const dynamic = 'force-dynamic';

export default async function ScoreMatch({ params }) {
  const sb = supabaseServer();
  const { data: m } = await sb.from('matches')
    .select('id,status,best_of,competition_id,toss_winner_team_id,toss_choice,winner_team_id,team_a:teams!matches_team_a_id_fkey(id,name),team_b:teams!matches_team_b_id_fkey(id,name)')
    .eq('id', params.id).maybeSingle();
  if (!m || !m.team_a || !m.team_b) notFound();
  const { data: ros } = await sb.from('match_rosters').select('team_id,player_id,jersey_number,is_libero,players(full_name)').eq('match_id', m.id).order('jersey_number');
  const { data: sets } = await sb.from('match_sets').select('*').eq('match_id', m.id).order('set_number');
  const back = <p><Link href={`/admin/competitions/${m.competition_id}/matches`}>← Matches</Link></p>;

  if ((ros || []).length === 0) {
    return (<main className="wrap" style={{ maxWidth: 720 }}>{back}<h1>Score match</h1><div className="warn">Save the match setup (roster and jersey numbers) first.</div><Link className="btn" href={`/admin/matches/${m.id}/setup`}>Open match setup</Link></main>);
  }
  const list = (tid) => (ros || []).filter((r) => r.team_id === tid).map((r) => ({ id: r.player_id, name: r.players?.full_name || 'Player', jersey: r.jersey_number, isLibero: r.is_libero }));
  const active = (sets || []).find((s) => !s.completed);
  const title = `${m.team_a.name} vs ${m.team_b.name}`;

  if (m.status === 'completed') {
    const w = m.winner_team_id === m.team_a.id ? m.team_a : m.team_b;
    return (<main className="wrap" style={{ maxWidth: 720 }}>{back}<h1>{title}</h1><div className="warn">Match completed. {w.name} won.</div><Link className="btn" href={`/matches/${m.id}`}>Open match page</Link></main>);
  }

  const finished = (sets || []).filter((s) => s.completed);

  if (active) {
    const [{ data: lu }, { data: rl }] = await Promise.all([
      sb.from('set_lineups').select('team_id,slot,player_id').eq('match_id', m.id).eq('set_number', active.set_number),
      sb.from('rallies').select('seq,point_team_id').eq('match_id', m.id).eq('set_number', active.set_number).order('seq'),
    ]);
    const line = (tid) => { const arr = ['', '', '', '', '', '']; (lu || []).filter((x) => x.team_id === tid).forEach((x) => { arr[x.slot - 1] = x.player_id; }); return arr; };
    const everyone = [...list(m.team_a.id), ...list(m.team_b.id)];
    return (
      <ScoreConsole
        key={active.set_number}
        matchId={m.id}
        backHref={`/admin/competitions/${m.competition_id}/matches`}
        bestOf={m.best_of}
        setNo={active.set_number}
        teamA={m.team_a}
        teamB={m.team_b}
        players={everyone}
        lineupA={line(m.team_a.id)}
        lineupB={line(m.team_b.id)}
        firstServe={active.first_serve_team_id}
        initialRallies={rl || []}
        setsWon={{ a: finished.filter((s) => s.points_a > s.points_b).length, b: finished.filter((s) => s.points_b > s.points_a).length }}
      />
    );
  }

  const setNo = (sets || []).length + 1;
  let initialA = ['', '', '', '', '', ''];
  let initialB = ['', '', '', '', '', ''];
  let defaultServe = m.team_a.id;
  if (setNo === 1) {
    if (m.toss_winner_team_id && m.toss_choice) {
      const other = m.toss_winner_team_id === m.team_a.id ? m.team_b.id : m.team_a.id;
      defaultServe = m.toss_choice === 'serve' ? m.toss_winner_team_id : other;
    }
  } else {
    const prev = sets[sets.length - 1];
    defaultServe = prev.first_serve_team_id === m.team_a.id ? m.team_b.id : m.team_a.id;
    const { data: pl } = await sb.from('set_lineups').select('team_id,slot,player_id').eq('match_id', m.id).eq('set_number', prev.set_number);
    const fill = (tid) => { const arr = ['', '', '', '', '', '']; (pl || []).filter((x) => x.team_id === tid).forEach((x) => { arr[x.slot - 1] = x.player_id; }); return arr; };
    initialA = fill(m.team_a.id);
    initialB = fill(m.team_b.id);
  }

  return (
    <main className="wrap" style={{ maxWidth: 720 }}>
      {back}<h1>{title}</h1>
      <p className="muted">Best of {m.best_of}. Sets played: {(sets || []).length}</p>
      {finished.length > 0 && <div className="warn">Set {finished[finished.length - 1].set_number} finished {finished[finished.length - 1].points_a} - {finished[finished.length - 1].points_b}. Choose the lineups for the next set.</div>}
      <StartSetForm matchId={m.id} setNo={setNo} teamA={m.team_a} teamB={m.team_b} playersA={list(m.team_a.id)} playersB={list(m.team_b.id)} initialA={initialA} initialB={initialB} defaultServe={defaultServe} />
    </main>
  );
}
