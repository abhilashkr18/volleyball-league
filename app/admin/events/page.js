import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { addEvent, deleteEvent } from '../actions';

export const dynamic = 'force-dynamic';

const ERRORS = {
  1: 'Enter the event title and date and time.',
  2: 'Image must be 3 MB or smaller.',
  3: 'Image upload failed. Try a smaller image.',
  4: 'Could not save the event. Please try again.',
};

export default async function AdminEvents({ searchParams }) {
  const sb = supabaseServer();
  const { data: sports } = await sb.from('sports').select('id,name').eq('is_active', true).order('id');
  const { data: events } = await sb.from('events').select('id,title,venue,starts_at,image_url,sports(name)').order('starts_at', { ascending: false });
  return (
    <main className="wrap" style={{ maxWidth: 720 }}>
      <p><Link href="/admin">← Admin</Link></p>
      <h1>Events</h1>
      {searchParams.error && <div className="err">{ERRORS[searchParams.error] || 'Something went wrong.'}</div>}
      <form action={addEvent} className="panel">
        <h3>Add event</h3>
        <label htmlFor="title">Title</label><input id="title" name="title" required />
        <div className="row">
          <div><label htmlFor="starts_at">Date and time</label><input id="starts_at" name="starts_at" type="datetime-local" required /></div>
          <div><label htmlFor="sport_id">Sport</label>
            <select id="sport_id" name="sport_id" defaultValue=""><option value="">All sports</option>{(sports || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        </div>
        <label htmlFor="venue">Venue</label><input id="venue" name="venue" placeholder="Muri, Jharkhand" />
        <label htmlFor="description">Description</label><input id="description" name="description" />
        <label htmlFor="image">Event image (max 3 MB)</label><input id="image" name="image" type="file" accept="image/*" />
        <p><button type="submit">Add event</button></p>
      </form>
      <h3>All events</h3>
      {(events || []).length === 0 && <p className="muted">No events yet.</p>}
      {(events || []).map((e) => (
        <form action={deleteEvent} className="panel" key={e.id} style={{ display: 'flex', gap: '.8rem', alignItems: 'center' }}>
          {e.image_url && <img src={e.image_url} alt="" style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 6 }} />}
          <span style={{ flex: 1 }}><b>{e.title}</b><br /><span className="muted">{new Date(e.starts_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} · {e.sports?.name || 'All sports'}{e.venue ? ` · ${e.venue}` : ''}</span></span>
          <input type="hidden" name="id" value={e.id} />
          <button className="btn-line">Delete</button>
        </form>
      ))}
    </main>
  );
}
