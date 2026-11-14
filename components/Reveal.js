'use client';
import { useEffect, useRef } from 'react';

// Fades a section in when it scrolls into view. Content stays visible if JavaScript is off.
export default function Reveal({ children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    if (el.getBoundingClientRect().top < window.innerHeight) return undefined;
    el.classList.add('pre');
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); io.disconnect(); }
    }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`ab-rv ${className}`}>{children}</div>;
}
