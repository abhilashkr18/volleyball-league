'use client';
import { setTeamLogo } from '@/app/admin/actions';
import { shrinkPhotoInput } from '@/lib/shrinkPhoto';

export default function TeamLogoForm({ competitionId, teamId }) {
  return (
    <form action={setTeamLogo} style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '.5rem' }}>
      <input type="hidden" name="competition_id" value={competitionId} />
      <input type="hidden" name="id" value={teamId} />
      <input name="photo" type="file" accept="image/*" aria-label="Team logo" onChange={(e) => shrinkPhotoInput(e.target.form)} style={{ flex: 1, minWidth: 160 }} />
      <button type="submit" className="btn-line" style={{ padding: '.4rem 1rem' }}>Upload logo</button>
    </form>
  );
}
