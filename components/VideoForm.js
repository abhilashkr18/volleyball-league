'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { addVideo } from '@/app/admin/actions';

const MAX = 45 * 1024 * 1024;

export default function VideoForm({ sports }) {
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(formData) {
    setMsg('');
    const file = formData.get('file');
    const link = String(formData.get('link') || '').trim();
    const hasFile = file && file.size > 0;
    if (!String(formData.get('title') || '').trim()) return setMsg('Enter a title.');
    if (!hasFile && !/^https?:\/\//i.test(link)) return setMsg('Upload a video file, or paste a YouTube, Instagram or Facebook link.');
    formData.delete('file');
    if (hasFile) {
      if (file.size > MAX) return setMsg('Video must be 45 MB or smaller.');
      setBusy(true);
      setMsg('Uploading video, please wait. Do not close this page.');
      const sb = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      const ext = (file.name.split('.').pop() || 'mp4').toLowerCase();
      const path = `videos/${Date.now()}.${ext}`;
      const up = await sb.storage.from('media').upload(path, file, { contentType: file.type });
      if (up.error) { setBusy(false); return setMsg(`Upload failed: ${up.error.message}`); }
      formData.set('video_url', sb.storage.from('media').getPublicUrl(path).data.publicUrl);
    } else {
      formData.set('video_url', link);
    }
    await addVideo(formData);
    setBusy(false);
  }

  return (
    <form action={submit} className="panel">
      <h3>Add video</h3>
      {msg && <div className={busy ? 'warn' : 'err'}>{msg}</div>}
      <label htmlFor="title">Title</label><input id="title" name="title" required />
      <label htmlFor="sport_id">Sport</label>
      <select id="sport_id" name="sport_id" defaultValue=""><option value="">General</option>{sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
      <label htmlFor="file">Upload a video (max 45 MB)</label><input id="file" name="file" type="file" accept="video/*" />
      <p className="muted" style={{ margin: '.6rem 0 0' }}>or</p>
      <label htmlFor="link">Paste a link (YouTube, Instagram, Facebook)</label><input id="link" name="link" placeholder="https://..." />
      <p><button type="submit" disabled={busy}>{busy ? 'Uploading…' : 'Add video'}</button></p>
    </form>
  );
        }
