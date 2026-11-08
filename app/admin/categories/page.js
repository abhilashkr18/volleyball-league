import { supabaseServer } from '@/lib/supabase/server';
import { addCategory, toggleCategory } from '../actions';

export const dynamic = 'force-dynamic';

export default async function Categories() {
  const { data: cats } = await supabaseServer().from('categories').select('*').order('sort_order');
  return (
    <main className="wrap">
      <h1>Categories</h1>
      <form action={addCategory} className="panel">
        <label htmlFor="name">New category name</label>
        <input id="name" name="name" required placeholder="e.g. Friday Knockout" />
        <p><button>Add category</button></p>
      </form>
      {(cats || []).map((c) => (
        <form action={toggleCategory} className="panel" key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><b>{c.name}</b> <span className="muted">{c.is_active ? 'Visible' : 'Hidden'}</span></span>
          <input type="hidden" name="id" value={c.id} /><input type="hidden" name="active" value={String(!c.is_active)} />
          <button className="ghost btn">{c.is_active ? 'Hide' : 'Show'}</button>
        </form>
      ))}
    </main>
  );
}
