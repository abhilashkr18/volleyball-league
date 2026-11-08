import PlayerForm from '@/components/PlayerForm';

export default function NewPlayer() {
  return (
    <main className="wrap" style={{ maxWidth: 640 }}>
      <h1>Add player</h1>
      <p className="muted">A unique Player ID (GZM-000000) is created when you save.</p>
      <PlayerForm />
    </main>
  );
}
