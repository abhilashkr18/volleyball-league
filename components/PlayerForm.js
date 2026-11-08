'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { createPlayer } from '@/app/admin/actions';
import { POSITIONS } from '@/lib/volleyball';

function Submit() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save player'}</button>;
}

export default function PlayerForm() {
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
        <div><label htmlFor="phone">Phone (10 digits)</label><input id="phone" name="phone" inputMode="numeric" required /></div>
      </div>
      <label htmlFor="village">Village / area</label><input id="village" name="village" />
      <h3 style={{ marginTop: '1.2rem' }}>Volleyball profile</h3>
      <div className="row">
        <div><label htmlFor="position">Position</label>
          <select id="position" name="position" defaultValue=""><option value="">Not set</option>{POSITIONS.map((x) => <option key={x}>{x}</option>)}</select></div>
        <div><label htmlFor="jersey">Preferred jersey (1–20)</label><input id="jersey" name="jersey" type="number" min="1" max="20" /></div>
        <div><label htmlFor="height">Height (cm)</label><input id="height" name="height" type="number" min="100" max="250" /></div>
        <div><label htmlFor="hand">Dominant hand</label>
          <select id="hand" name="hand" defaultValue=""><option value="">Not set</option><option>Right</option><option>Left</option><option>Both</option></select></div>
      </div>
      <label htmlFor="photo">Profile photo (max 2 MB)</label><input id="photo" name="photo" type="file" accept="image/*" />
      <p><Submit /></p>
    </form>
  );
}
