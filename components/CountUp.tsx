'use client';

import { useState, useEffect } from 'react';

interface CountUpProps {
  target: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
}

export default function CountUp({ target, duration = 1.5, decimals = 0, suffix = '' }: CountUpProps) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let current = 0;
    const step = target / (duration * 60);
    const id = setInterval(() => {
      current += step;
      if (current >= target) {
        setVal(target);
        clearInterval(id);
      } else {
        setVal(current);
      }
    }, 1000 / 60);
    return () => clearInterval(id);
  }, [target, duration]);

  return <span>{val.toFixed(decimals)}{suffix}</span>;
}
