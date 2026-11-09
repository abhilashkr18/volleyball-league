'use client';
import { useEffect, useRef, useState } from 'react';

const ICONS = {
  ig: (<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="#fff" stroke="none" /></svg>),
  yt: (<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4" fill="#fff" /><path d="M10 9l5 3-5 3z" fill="#E62117" /></svg>),
  mp: (<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></svg>),
};

const ITEMS = [
  { cls: 'ig', name: 'Instagram', sub: '@ground_zero_muri · Reels and daily updates', href: 'https://www.instagram.com/ground_zero_muri' },
  { cls: 'yt', name: 'YouTube', sub: '@groundzero_muri · Match highlights', href: 'https://youtube.com/@groundzero_muri' },
  { cls: 'mp', name: 'Find the Ground', sub: 'Open location in Google Maps', href: 'https://maps.app.goo.gl/ZJa4pZNaUE3GKRFaA' },
];

const CSS = `
.jm-over{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:1rem;background:rgba(0,0,0,.7);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.jm-box{position:relative;width:100%;max-width:420px;background:linear-gradient(160deg,rgba(30,30,34,.97),rgba(10,10,12,.98));border:1px solid var(--orline);border-radius:20px;padding:1.4rem 1.1rem 1.1rem;box-shadow:0 0 60px rgba(255,106,0,.28),0 20px 60px rgba(0,0,0,.6)}
.jm-box h2{font-style:italic;margin:0 2rem .2rem 0}
.jm-x{position:absolute;top:.8rem;right:.8rem;width:34px;height:34px;padding:0;border-radius:50%;background:#1d1d21;color:#fff;box-shadow:none;border:1px solid var(--line);font-size:1rem;line-height:1}
.jm-card{display:flex;align-items:center;gap:.9rem;padding:.75rem;margin-top:.7rem;border-radius:14px;background:#121215;border:1px solid var(--line);text-decoration:none;color:var(--text)}
.jm-card:hover{border-color:var(--or)}
.jm-ic{width:52px;height:52px;border-radius:14px;display:grid;place-items:center;flex:none}
.jm-ic.ig{background:linear-gradient(45deg,#F9CE34,#EE2A7B 50%,#6228D7)}
.jm-ic.yt{background:#E62117}
.jm-ic.mp{background:linear-gradient(135deg,#1FA463,#0B6E3F)}
.jm-card b{display:block;font-size:1.02rem}
.jm-sub{color:var(--muted);font-size:.8rem;line-height:1.3;display:block}
.jm-go{margin-left:auto;color:var(--or);font-size:1.3rem}
`;

export default function JoinMenu() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current && closeRef.current.focus();
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <button type="button" className="btn join" onClick={() => setOpen(true)}>Join Us</button>
      {open && (
        <div className="jm-over" onClick={() => setOpen(false)}>
          <style>{CSS}</style>
          <div className="jm-box" role="dialog" aria-modal="true" aria-labelledby="jm-title" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="jm-x" ref={closeRef} onClick={() => setOpen(false)} aria-label="Close">✕</button>
            <h2 id="jm-title">Join the <em>Community</em></h2>
            <p className="muted" style={{ margin: 0 }}>Follow Ground Zero Muri and find us on the map.</p>
            {ITEMS.map((i) => (
              <a key={i.name} className="jm-card" href={i.href} target="_blank" rel="noopener noreferrer">
                <span className={`jm-ic ${i.cls}`}>{ICONS[i.cls]}</span>
                <span><b>{i.name}</b><span className="jm-sub">{i.sub}</span></span>
                <span className="jm-go" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
  }
