'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

const REFRESH_INTERVAL_MS = 30_000; // rafraichissement toutes les 30s
const ANIMATION_DURATION_MS = 1200;

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export default function AnimatedUserCounter() {
  const [displayValue, setDisplayValue] = useState(0);
  const targetValue = useRef(0);
  const animationFrame = useRef<number | null>(null);

  const animateTo = (newTarget: number) => {
    const start = displayValue;
    const diff = newTarget - start;
    const startTime = performance.now();

    if (animationFrame.current) cancelAnimationFrame(animationFrame.current);

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / ANIMATION_DURATION_MS, 1);
      const eased = easeOutExpo(progress);
      setDisplayValue(Math.round(start + diff * eased));
      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(step);
      }
    };
    animationFrame.current = requestAnimationFrame(step);
    targetValue.current = newTarget;
  };

  const fetchCount = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('get_public_user_count');
    if (!error && typeof data === 'number' && data !== targetValue.current) {
      animateTo(data);
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, REFRESH_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, []);

  return (
    <div className="text-center">
      <p className="text-4xl md:text-5xl font-bold tabular-nums text-orange-500">
        {displayValue.toLocaleString('fr-FR')}+
      </p>
      <p className="text-sm text-gray-500 mt-1">
        utilisateurs inscrits sur PrestaConnect
      </p>
    </div>
  );
}
