import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { saveAbout, addNews, deleteNews } from '../actions';

export const dynamic = 'force-dynamic';

const DEFAULT_ABOUT = 'Ground Zero Muri is more than just a sports platform. It is a movement, a place where sports, friendship and community come together to inspire, compete and grow. From local tournaments to bigger dreams, we stand for the spirit of sports in Muri and beyond.';
const ERRORS = { 1: 'About text cannot be empty.', 2: 'Could not save. Please try again.', 3: 'Enter the news headline.' };

export default async function AdminHome({ searchParams }) {
  const sb = supabaseServer();
  const { data: about } = await sb.from('site_settings').select('value').eq('key', 'about_text').maybeSingle();
  const { data: news } = await sb.from('news').select('id,title').order('created_at', { ascending: false });
  return (
    <main className="wrap" style={{ maxWidth: 720 }}>
      <p><Link href="/admin">← Admin</Link></p>
      <h1>Home content</h1>
      {searchParams.error && <div className="err">{ERRORS[searchParams.error] || 'Something went wrong.'}</div>}
      {searchParams.saved && <div className="warn">Saved.</div>}
      <form action={saveAbout} className="panel">
        <h3>About text</h3>
        <label htmlFor="about">Shown in the About section on the home page</label>
        <textarea id="about" name="about" rows="6" defaultValue={about?.value || DEFAULT_ABOUT} style={{ width: '100%', font: 'inherit', padding: '.6rem', borderRadius: 8, border: '1px solid #3A3A40', background: '#0A0A0B', color: 'inherit' }} />
        <p><button type="submit">Save about text</button></p>
      </form>
      <form action={addNews} className="panel">
        <h3>Add news</h3>
        <label htmlFor="title">Headline</label><input id="title" name="title" required />
        <p><button type="submit">Add news</button></p>
      </form>
      <h3>All news</h3>
      {(news || []).length === 0 && <p className="muted">No news yet. The home page shows sample headlines until you add one.</p>}
      {(news || []).map((n) => (
        <form action={deleteNews} className="panel" key={n.id} style={{ display: 'flex', gap: '.8rem', alignItems: 'center' }}>
          <span style={{ flex: 1 }}>{n.title}</span>
          <input type="hidden" name="id" value={n.id} />
          <button className="btn-line">Delete</button>
        </form>
      ))}
    </main>
  );
        }
