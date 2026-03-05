// component/routeBadge.tsx
// Reusable colored route-number badge — single source for the marker-color pill
// shown in carousel cards, popup cards, stop popups, etc.
import React from 'react';
import { getJeepneyColor } from '@/lib/jeepneyColors';

const SIZE_CLASSES: Record<string, string> = {
  sm: 'px-2.5 py-1 text-sm font-black tracking-wide',
  md: 'px-3 py-1.5 text-lg font-bold',
  lg: 'px-4 py-2 text-2xl font-bold',
};

interface RouteBadgeProps {
  /** The label to display (pre-derived route number / fallback). */
  label: string;
  /** jeepneyId — used to look up the deterministic marker color. */
  jeepneyId: string;
  /** Stored color override from the admin panel. */
  color?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function RouteBadge({ label, jeepneyId, color, size = 'md', className = '' }: RouteBadgeProps) {
  const bgColor = getJeepneyColor(jeepneyId, color);
  return (
    <span
      className={`rounded-lg text-white ${SIZE_CLASSES[size]} ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {label}
    </span>
  );
}
