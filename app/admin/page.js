import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { signOut } from './actions';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const sb = supabaseServer();
  const { count: players } = await sb.from('players').select('*', { count: 'exact', head: true });
  const { count: cats } = await sb.from('categories').select('*', { count: 'exact', head: true });
  return (
    <main className="wrap">
      <h1>Admin</h1>
      <div className="grid">
        <div className="cat"><h3>{players ?? 0} players</h3><Link className="btn" href="/admin/players/new">Add player</Link></div>
        <div className="cat"><h3>{cats ?? 0} categories</h3><Link className="btn" href="/admin/categories">Manage categories</Link></div>
          <div className="cat"><h3>Events</h3><Link className="btn" href="/admin/events">Manage events</Link></div>
          <div className="cat"><h3>Gallery</h3><Link className="btn" href="/admin/gallery">Manage photos</Link></div>
          <div className="cat"><h3>Videos</h3><Link className="btn" href="/admin/videos">Manage videos</Link></div>
          <div className="cat"><h3>Home content</h3><Link className="btn" href="/admin/home">Manage home</Link></div>
        <div className="cat"><h3>Competitions</h3><Link className="btn" href="/admin/competitions">Manage competitions</Link></div>
          <div className="cat"><h3>About section</h3><Link className="btn" href="/admin/about">Manage About</Link></div>
      </div>
      <form action={signOut} style={{ marginTop: '1.5rem' }}><button className="ghost btn">Sign out</button></form>
    </main>
  );
}
