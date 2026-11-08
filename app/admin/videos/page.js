import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import VideoForm from '@/components/VideoForm';
import { deleteVideo } from '../actions';

export const dynamic = 'force-dynamic';

const ERRORS = {
  1: 'Enter a title and a valid link.',
  2: 'Could not save the video. Please try again.',
};

function kind(url) {
  if (/youtu\.?be/i.test(url)) return 'YouTube';
  if (/instagram\.com/i.test(url)) return 'Instagram';
  if (/facebook\.com|fb\.watch/i.test(url)) return 'Facebook';
  return 'Uploaded video';
}

export default async function AdminVideos({ searchParams }) {
  const sb = supabaseServer();
  const { data: sports } = await sb.from('sports').select('id,name').eq('is_active', true).order('id');
  const { data: videos } = await sb.from('videos').select('id,title,video_url,sports(name)').order('created_at', { ascending: false });
  return (
    <main className="wrap" style={{ maxWidth: 720 }}>
      <p><Link href="/admin">← Admin</Link></p>
      <h1>Videos</h1>
      {searchParams.error && <div className="err">{ERRORS[searchParams.error] || 'Something went wrong.'}</div>}
      <VideoForm sports={sports || []} />
      <h3>All videos</h3>
      {(videos || []).length === 0 && <p className="muted">No videos yet.</p>}
      {(videos || []).map((v) => (
        <form action={deleteVideo} className="panel" key={v.id} style={{ display: 'flex', gap: '.8rem', alignItems: 'center' }}>
          <span style={{ flex: 1 }}><b>{v.title}</b><br /><span className="muted">{kind(v.video_url)} · {v.sports?.name || 'General'}</span></span>
          <input type="hidden" name="id" value={v.id} />
          <button className="btn-line">Delete</button>
        </form>
      ))}
    </main>
  );
}
