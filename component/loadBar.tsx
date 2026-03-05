// component/loadBar.tsx
// Reusable passenger load progress bar — used in carousel, popup card, cardBox, jeepStop popup, etc.
import React from 'react';
import { getColorTheme } from '@/lib/loadStatus';

const BAR_COLORS: Record<string, string> = {
  green:  'bg-green-500',
  orange: 'bg-orange-500',
  red:    'bg-red-500',
  purple: 'bg-purple-500',
};

interface LoadBarProps {
  currentLoad: number;
  maxLoad: number;
  /** h-2 (slim) or h-3 (standard). Defaults to 'md' (h-3). */
  size?: 'sm' | 'md';
  /** Extra Tailwind classes on the track wrapper (e.g. margin, border). */
  className?: string;
}

export default function LoadBar({ currentLoad, maxLoad, size = 'md', className = '' }: LoadBarProps) {
  const pct = maxLoad > 0 ? Math.min((currentLoad / maxLoad) * 100, 100) : 0;
  const colorTheme = getColorTheme(currentLoad, maxLoad);
  const barColor = BAR_COLORS[colorTheme];
  const h = size === 'sm' ? 'h-2' : 'h-3';

  return (
    <div className={`w-full bg-gray-200 rounded-full ${h} overflow-hidden ${className}`}>
      <div
        className={`${h} rounded-full transition-all duration-500 ease-out ${barColor}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
