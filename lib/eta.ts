/**
 * ETA (Estimated Time of Arrival) utilities
 *
 * Calculates the straight-line distance between two GPS coordinates using the
 * Haversine formula, then converts that to an estimated travel time based on an
 * average jeepney city-traffic speed of 20 km/h.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/** Average jeepney speed in city traffic (meters per minute) */
export const JEEPNEY_SPEED_M_PER_MIN = 20_000 / 60; // 20 km/h → ~333 m/min

// ─── Distance ─────────────────────────────────────────────────────────────────

/**
 * Returns the great-circle distance between two GPS points in **metres** using
 * the Haversine formula.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6_371_000; // Earth's mean radius in metres
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── ETA calculation ──────────────────────────────────────────────────────────

/**
 * Converts a distance in metres to an estimated travel time in **minutes**.
 * Uses the average jeepney city-traffic speed (20 km/h).
 */
export function getETAMinutes(distanceMeters: number): number {
  return distanceMeters / JEEPNEY_SPEED_M_PER_MIN;
}

/**
 * Formats an ETA (in minutes) as a human-readable string.
 *
 * Examples:
 *  - 0.4  → "< 1 min"
 *  - 7    → "~7 min"
 *  - 75   → "~1h 15m"
 */
export function formatETA(minutes: number): string {
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `~${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `~${h}h ${m}m` : `~${h}h`;
}

/**
 * Colour-tier for ETA urgency.
 * green  → arriving soon  (< 5 min)
 * yellow → a few minutes  (5–15 min)
 * orange → coming soon    (15–30 min)
 * red    → far away       (> 30 min)
 */
export type ETAColor = "green" | "yellow" | "orange" | "red";

export function getETAColor(minutes: number): ETAColor {
  if (minutes < 5) return "green";
  if (minutes < 15) return "yellow";
  if (minutes < 30) return "orange";
  return "red";
}

/**
 * All-in-one helper: given a distance in metres, returns the formatted string
 * and colour tier.
 */
export function computeETA(distanceMeters: number): {
  minutes: number;
  label: string;
  color: ETAColor;
} {
  const minutes = getETAMinutes(distanceMeters);
  return {
    minutes,
    label: formatETA(minutes),
    color: getETAColor(minutes),
  };
}
