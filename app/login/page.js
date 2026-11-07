import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

async function signIn(formData) {
  'use server';
  const sb = supabaseServer();
  const { error } = await sb.auth.signInWithPassword({ email: formData.get('email'), password: formData.get('password') });
  if (error) redirect('/login?error=1');
  redirect('/admin');
}

export default function Login({ searchParams }) {
  return (
    <main className="wrap" style={{ maxWidth: 420 }}>
      <h1>Admin sign in</h1>
      {searchParams.error && <div className="err">Email or password is incorrect.</div>}
      <form action={signIn} className="panel">
        <label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" />
        <label htmlFor="password">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" />
        <p><button type="submit">Sign in</button></p>
      </form>
    </main>
  );
      }
