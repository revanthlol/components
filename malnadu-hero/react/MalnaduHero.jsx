'use client';
import { useEffect, useRef } from 'react';
import { createHero } from '../src/hero.js';
import '../src/hero.css';

// Props are the same as createHero options.
export default function MalnaduHero({ className = '', style = {}, ...options }) {
  const ref = useRef(null);
  const key = JSON.stringify(options);

  useEffect(() => {
    if (!ref.current) return;
    const hero = createHero(ref.current, options);
    return () => hero.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return <section ref={ref} className={className} style={style} />;
}
