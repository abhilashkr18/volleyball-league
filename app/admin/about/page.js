import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { importAboutContent, setAboutPageVisible } from '../actions';

export const dynamic = 'force-dynamic';

const TABS = [['story', 'Story'], ['people', 'People'], ['cricket', 'Cricket'], ['kpl', 'KPL'], ['football', 'Football'], ['volleyball', 'Volleyball and badminton'], ['community', 'Community']];
const ERRORS = { 1: 'Could not create a page. Please try again.', 2: 'Could not save the blocks of a page. Nothing was half-saved for it, please try again.' };

export default async function AdminAbout({ searchParams }) {
  const { data: pages } = await supabaseServer().from('about_pages').select('id,slug,tab,sort_order,title_en,published').order('sort_order');
  const list = pages || [];
  return (
    <main className="wrap" style={{ maxWidth: 720 }}>
      <p><Link href="/admin">← Admin</Link></p>
      <h1>About section</h1>
      {searchParams.error && <div className="err">{ERRORS[searchParams.error] || 'Something went wrong.'}</div>}
      {searchParams.imported !== undefined && <div className="warn">{Number(searchParams.imported) > 0 ? `${searchParams.imported} pages imported.` : 'Nothing new to import. Every page is already in the database.'}</div>}

      <form action={importAboutContent} className="panel">
        <h3>Import the default content</h3>
        <p className="muted">Adds the About pages (English and Hindi) that are not in the database yet. It never overwrites a page you have already edited, so it is safe to press again.</p>
        <button type="submit">Import About content</button>
        <p className="muted" style={{ margin: '.8rem 0 0' }}>{list.length} pages in the database.</p>
      </form>

      {TABS.map(([key, label]) => {
        const rows = list.filter((p) => p.tab === key);
        if (rows.length === 0) return null;
        return (
          <section className="panel" key={key}>
            <h3>{label}</h3>
            {rows.map((p) => (
              <form action={setAboutPageVisible} key={p.id} style={{ display: 'flex', gap: '.6rem', alignItems: 'center', borderTop: '1px solid var(--line)', padding: '.5rem 0' }}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="show" value={String(!p.published)} />
                <span style={{ flex: 1 }}><b>{p.title_en}</b><br /><span className="muted">{p.slug} · {p.published ? 'Visible to everyone' : 'Hidden (only you can see it)'}</span></span>
                <button className="btn-line" style={{ padding: '.35rem .9rem' }}>{p.published ? 'Hide' : 'Show'}</button>
              </form>
            ))}
          </section>
        );
      })}
    </main>
  );
        }
