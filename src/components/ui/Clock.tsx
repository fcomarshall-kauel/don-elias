'use client';
import { useState, useEffect } from 'react';

interface ClockProps {
  className?: string;
}

export function Clock({ className = '' }: ClockProps) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span className={className}>{time}</span>;
}
