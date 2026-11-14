'use client';
import { useEffect, useState } from 'react';

// Photo mosaic. Tap a photo to open it large, with arrows, a caption and a close button.
export default function AboutGallery({ images }) {
  const [open, setOpen] = useState(null);
  const n = images.length;

  useEffect(() => {
    if (open === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((i) => (i + 1) % n);
      if (e.key === 'ArrowLeft') setOpen((i) => (i - 1 + n) % n);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, n]);

  if (n === 0) return null;
  const cur = open === null ? null : images[open];
  return (
    <>
      <div className={`ab-gal g${Math.min(n, 4)}`}>
        {images.map((im, i) => (
          <button type="button" key={im.src + i} className="ab-ph" onClick={() => setOpen(i)} aria-label={im.cap || 'Open photo'}>
            <img src={im.src} alt={im.cap || ''} loading="lazy" />
            {im.cap && <span>{im.cap}</span>}
          </button>
        ))}
      </div>
      {cur && (
        <div className="ab-lb" role="dialog" aria-modal="true" onClick={() => setOpen(null)}>
          <img src={cur.src} alt={cur.cap || ''} onClick={(e) => e.stopPropagation()} />
          {cur.cap && <p onClick={(e) => e.stopPropagation()}>{cur.cap}</p>}
          <button type="button" className="x" onClick={() => setOpen(null)} aria-label="Close">✕</button>
          {n > 1 && <button type="button" className="pv" onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + n) % n); }} aria-label="Previous photo">‹</button>}
          {n > 1 && <button type="button" className="nx" onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % n); }} aria-label="Next photo">›</button>}
        </div>
      )}
    </>
  );
        }
