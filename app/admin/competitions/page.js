import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { createCompetition, deleteCompetition } from '../actions';

export const dynamic = 'force-dynamic';

const ERRORS = {
  1: 'Enter the name and choose a category and sport.',
  2: 'End date cannot be before the start date.',
  3: 'Could not create the competition. Please try again.',
};
const FORMATS = [['knockout', 'Knockout'], ['round_robin', 'Round robin (league)'], ['groups', 'Groups + knockout'], ['single', 'Single match']];

export default async function AdminCompetitions({ searchParams }) {
  const sb = supabaseServer();
  const { data: cats } = await sb.from('categories').select('id,name').order('sort_order');
  const { data: sports } = await sb.from('sports').select('id,name').eq('is_active', true).order('id');
  const { data: list } = await sb.from('competitions').select('id,name,format,status,start_date,categories(name),sports(name)').order('created_at', { ascending: false });
  return (
    <main className="wrap" style={{ maxWidth: 720 }}>
      <p><Link href="/admin">← Admin</Link></p>
      <h1>Competitions</h1>
      {searchParams.error && <div className="err">{ERRORS[searchParams.error] || 'Something went wrong.'}</div>}
      {searchParams.created && <div className="warn">Competition created.</div>}
      <form action={createCompetition} className="panel">
        <h3>Create competition</h3>
        <label htmlFor="name">Name</label><input id="name" name="name" placeholder="e.g. Summer Cup 2026" required />
        <div className="row">
          <div><label htmlFor="category_id">Category</label>
            <select id="category_id" name="category_id" required defaultValue=""><option value="" disabled>Choose</option>{(cats || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label htmlFor="sport_id">Sport</label>
            <select id="sport_id" name="sport_id" required defaultValue=""><option value="" disabled>Choose</option>{(sports || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        </div>
        <label htmlFor="format">Format</label>
        <select id="format" name="format" defaultValue="knockout">{FORMATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <div className="row">
          <div><label htmlFor="start_date">Start date</label><input id="start_date" name="start_date" type="date" /></div>
          <div><label htmlFor="end_date">End date</label><input id="end_date" name="end_date" type="date" /></div>
        </div>
        <label htmlFor="venue">Venue</label><input id="venue" name="venue" placeholder="Muri, Jharkhand" />
        <label htmlFor="description">Description (optional)</label><input id="description" name="description" />
        <p><button type="submit">Create competition</button></p>
      </form>
      <h3>All competitions</h3>
      {(list || []).length === 0 && <p className="muted">No competitions yet.</p>}
      {(list || []).map((c) => (
        <form action={deleteCompetition} className="panel" key={c.id} style={{ display: 'flex', gap: '.8rem', alignItems: 'center' }}>
          <span style={{ flex: 1 }}><b>{c.name}</b><br /><span className="muted">{c.sports?.name} · {c.categories?.name} · {c.format.replace('_', ' ')} · {c.status}{c.start_date ? ` · ${c.start_date}` : ''}</span></span>
          <input type="hidden" name="id" value={c.id} />
          <button className="btn-line">Delete</button>
        </form>
      ))}
    </main>
  );
        }
