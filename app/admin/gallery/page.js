import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { addPhoto, deletePhoto } from '../actions';

export const dynamic = 'force-dynamic';

const ERRORS = {
  1: 'Choose a photo first.',
  2: 'Photo must be 3.5 MB or smaller.',
  3: 'Upload failed. Try a smaller photo.',
  4: 'Could not save the photo. Please try again.',
};

export default async function AdminGallery({ searchParams }) {
  const sb = supabaseServer();
  const { data: sports } = await sb.from('sports').select('id,name').eq('is_active', true).order('id');
  const { data: photos } = await sb.from('photos').select('id,image_url,caption,sports(name)').order('created_at', { ascending: false });
  return (
    <main className="wrap" style={{ maxWidth: 720 }}>
      <p><Link href="/admin">← Admin</Link></p>
      <h1>Gallery</h1>
      {searchParams.error && <div className="err">{ERRORS[searchParams.error] || 'Something went wrong.'}</div>}
      <form action={addPhoto} className="panel">
        <h3>Add photo</h3>
        <label htmlFor="image">Photo (max 3.5 MB)</label><input id="image" name="image" type="file" accept="image/*" required />
        <div className="row">
          <div><label htmlFor="sport_id">Sport</label>
            <select id="sport_id" name="sport_id" defaultValue=""><option value="">General</option>{(sports || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div><label htmlFor="caption">Caption (optional)</label><input id="caption" name="caption" /></div>
        </div>
        <p><button type="submit">Upload photo</button></p>
      </form>
      <h3>All photos</h3>
      {(photos || []).length === 0 && <p className="muted">No photos yet.</p>}
      <div className="grid">
        {(photos || []).map((p) => (
          <form action={deletePhoto} className="panel" key={p.id} style={{ padding: '.6rem', marginBottom: 0 }}>
            <img src={p.image_url} alt={p.caption || ''} style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 8 }} />
            <p className="muted" style={{ margin: '.4rem 0' }}>{p.sports?.name || 'General'}{p.caption ? ` · ${p.caption}` : ''}</p>
            <input type="hidden" name="id" value={p.id} />
            <button className="btn-line">Delete</button>
          </form>
        ))}
      </div>
    </main>
  );
        }
