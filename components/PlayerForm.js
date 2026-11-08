'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { createPlayer } from '@/app/admin/actions';
import SportsPicker from '@/components/SportsPicker';

function Submit() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save player'}</button>;
}

export default function PlayerForm({ sports }) {
  const [state, action] = useFormState(createPlayer, {});
  return (
    <form action={action} className="panel">
      {state?.error && <div className="err">{state.error}</div>}
      {state?.duplicate && (
        <div className="warn">
          A similar player is already registered: <b>{state.duplicate}</b>.
          <label style={{ fontWeight: 400 }}><input type="checkbox" name="force" style={{ width: 'auto' }} /> This is a different person, create a new ID anyway</label>
        </div>
      )}
      <label htmlFor="full_name">Full name</label><input id="full_name" name="full_name" required />
      <div className="row">
        <div><label htmlFor="dob">Date of birth</label><input id="dob" name="dob" type="date" required /></div>
        <div><label htmlFor="phone">Phone (optional)</label><input id="phone" name="phone" inputMode="numeric" /></div>
      </div>
      <label htmlFor="village">Village / area</label><input id="village" name="village" />
      <div className="row">
        <div><label htmlFor="height">Height (cm)</label><input id="height" name="height" type="number" min="100" max="250" /></div>
        <div><label htmlFor="hand">Dominant hand</label>
          <select id="hand" name="hand" defaultValue=""><option value="">Not set</option><option>Right</option><option>Left</option><option>Both</option></select></div>
      </div>
      <SportsPicker sports={sports} />
      <label htmlFor="photo">Profile photo (max 2 MB)</label><input id="photo" name="photo" type="file" accept="image/*" />
      <p><Submit /></p>
    </form>
  );
}
