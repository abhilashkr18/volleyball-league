'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { updatePlayer } from '@/app/admin/actions';
import SportsPicker from '@/components/SportsPicker';
import { shrinkPhotoInput } from '@/lib/shrinkPhoto';

function Submit() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save changes'}</button>;
}

export default function EditPlayerForm({ p, sports }) {
  const [state, action] = useFormState(updatePlayer, {});
  return (
    <form action={action} className="panel">
      {state?.error && <div className="err">{state.error}</div>}
      <input type="hidden" name="id" value={p.id} />
      <input type="hidden" name="code" value={p.player_code} />
      <label>Player ID (cannot be changed)</label><input value={p.player_code} disabled readOnly />
      <label htmlFor="full_name">Full name</label><input id="full_name" name="full_name" defaultValue={p.full_name} required />
      <div className="row">
        <div><label htmlFor="dob">Date of birth</label><input id="dob" name="dob" type="date" defaultValue={p.dob} required /></div>
        <div><label htmlFor="phone">Phone (optional)</label><input id="phone" name="phone" inputMode="numeric" defaultValue={p.phone} /></div>
      </div>
      <label htmlFor="village">Village / area</label><input id="village" name="village" defaultValue={p.village} />
      <div className="row">
        <div><label htmlFor="height">Height (cm)</label><input id="height" name="height" type="number" min="100" max="250" defaultValue={p.height} /></div>
        <div><label htmlFor="hand">Dominant hand</label>
          <select id="hand" name="hand" defaultValue={p.hand}><option value="">Not set</option><option>Right</option><option>Left</option><option>Both</option></select></div>
      </div>
      <SportsPicker sports={sports} selected={p.selected} />
            <label htmlFor="photo">New profile photo (leave empty to keep current)</label><input id="photo" name="photo" type="file" accept="image/*" onChange={(e) => shrinkPhotoInput(e.target.form)} />
      <p><Submit /></p>
    </form>
  );
    }
