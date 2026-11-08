import { supabaseServer } from '@/lib/supabase/server';
import { signOut } from './actions';

export default async function AdminLayout({ children }) {
  const { data: ok } = await supabaseServer().rpc('is_admin');
  if (!ok) {
    return (
      <main className="wrap">
        <h1>No access</h1>
        <p>This account is not an admin. Add its user ID to the admins table in Supabase.</p>
        <form action={signOut}><button>Sign out</button></form>
      </main>
    );
  }
  return children;
}
