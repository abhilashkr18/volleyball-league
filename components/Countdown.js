'use client';
import { useEffect, useState } from 'react';

export default function Countdown({ target }) {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, new Date(target).getTime() - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [target]);
  const s = left === null ? 0 : Math.floor(left / 1000);
  const parts = [['Days', Math.floor(s / 86400)], ['Hours', Math.floor((s % 86400) / 3600)], ['Min', Math.floor((s % 3600) / 60)], ['Sec', s % 60]];
  return (
    <div className="cd" aria-label="Time left">
      {parts.map(([label, v]) => (<div key={label}><strong>{String(v).padStart(2, '0')}</strong><span>{label}</span></div>))}
    </div>
  );
                                                                               }
