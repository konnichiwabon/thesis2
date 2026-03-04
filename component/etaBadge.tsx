// component/etaBadge.tsx
import React from "react";
import { Clock } from "lucide-react";
import { computeETA, getETAMinutes, formatETA, getETAColor, type ETAColor } from "@/lib/eta";

// ─── Colour maps ──────────────────────────────────────────────────────────────

const COLOR_CLASSES: Record<
  ETAColor,
  { bg: string; text: string; border: string; dot: string }
> = {
  green: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-300",
    dot: "bg-green-500",
  },
  yellow: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-300",
    dot: "bg-yellow-500",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-300",
    dot: "bg-orange-500",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-300",
    dot: "bg-red-500",
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface ETABadgeProps {
  /** Distance from the jeepney to the bus stop in **metres**. */
  distanceMeters?: number;
  /** Visual size of the badge. Defaults to "md". */
  size?: "sm" | "md" | "lg";
  /** Extra Tailwind classes for the outer wrapper. */
  className?: string;
  /** Show the distance in metres alongside the ETA. */
  showDistance?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ETABadge({
  distanceMeters,
  size = "md",
  className = "",
  showDistance = false,
}: ETABadgeProps) {
  if (distanceMeters == null || distanceMeters < 0) return null;

  const { minutes, label, color } = computeETA(distanceMeters);
  const cls = COLOR_CLASSES[color];

  const sizeMap = {
    sm: { wrapper: "px-2 py-0.5 gap-1 text-xs rounded-full", icon: 10 },
    md: { wrapper: "px-2.5 py-1 gap-1.5 text-sm rounded-full", icon: 12 },
    lg: { wrapper: "px-3 py-1.5 gap-2 text-base rounded-lg", icon: 14 },
  }[size];

  return (
    <span
      className={`inline-flex items-center font-semibold border ${cls.bg} ${cls.text} ${cls.border} ${sizeMap.wrapper} ${className}`}
      title={`Estimated ${Math.round(minutes)} min travel time (based on 20 km/h avg speed)`}
    >
      {/* Pulsing dot */}
      <span className="relative flex h-2 w-2 shrink-0">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cls.dot}`}
        />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${cls.dot}`} />
      </span>

      <Clock size={sizeMap.icon} className="shrink-0" />

      <span>ETA {label}</span>

      {showDistance && distanceMeters != null && (
        <span className="opacity-70">
          · {distanceMeters < 1000
            ? `${Math.round(distanceMeters)}m`
            : `${(distanceMeters / 1000).toFixed(1)}km`}
        </span>
      )}
    </span>
  );
}
