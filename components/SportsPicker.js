'use client';
import { useState } from 'react';

export default function SportsPicker({ sports, selected = {} }) {
  const [on, setOn] = useState(() => Object.keys(selected));
  const toggle = (slug) => setOn((o) => (o.includes(slug) ? o.filter((x) => x !== slug) : [...o, slug]));
  return (
    <div>
      <h3 style={{ marginTop: '1.2rem' }}>Sports played</h3>
      <p className="muted">Select every sport this player plays, then choose the position.</p>
      {sports.map((s) => {
        const active = on.includes(s.slug);
        const cur = selected[s.slug] || {};
        return (
          <div className="panel" key={s.slug} style={{ padding: '.7rem', marginBottom: '.6rem' }}>
            <label style={{ display: 'flex', gap: '.6rem', alignItems: 'center', margin: 0 }}>
              <input type="checkbox" name={`play_${s.slug}`} checked={active} onChange={() => toggle(s.slug)} style={{ width: 'auto' }} />
              <b>{s.name}</b>
            </label>
            {active && (
              <div className="row">
                <div>
                  <label htmlFor={`pos_${s.slug}`}>Position</label>
                  <select id={`pos_${s.slug}`} name={`pos_${s.slug}`} defaultValue={cur.position || ''}>
                    <option value="">Not set</option>
                    {s.positions.map((x) => <option key={x}>{x}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor={`jersey_${s.slug}`}>Preferred jersey (1-20)</label>
                  <input id={`jersey_${s.slug}`} name={`jersey_${s.slug}`} type="number" min="1" max="20" defaultValue={cur.jersey ?? ''} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
        }
