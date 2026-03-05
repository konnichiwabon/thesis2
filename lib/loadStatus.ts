/**
 * Shared load/status utilities used across all jeepney components.
 * Single source of truth — edit here to update every component at once.
 */

export type ColorTheme = 'green' | 'red' | 'orange' | 'purple';

/** Returns the color theme based on passenger load percentage. */
export function getColorTheme(load: number, maxLoad: number = 40): ColorTheme {
  const pct = maxLoad > 0 ? (load / maxLoad) * 100 : 0;
  if (pct <= 33) return 'green';
  if (pct <= 66) return 'orange';
  if (pct < 100) return 'red';
  return 'purple';
}

/** Returns the human-readable status label for a given load. */
export function getStatus(load: number, maxLoad: number = 40): string {
  const pct = maxLoad > 0 ? (load / maxLoad) * 100 : 0;
  if (pct <= 33) return 'Low';
  if (pct <= 66) return 'Moderate';
  if (pct < 100) return 'High';
  return 'Full';
}

/**
 * Derives the display-friendly route label from DB fields.
 * Priority: routeNumber → digits stripped from jeepneyId → last 2 chars of jeepneyId
 */
export function deriveDisplayRoute(jeepneyId: string, routeNumber?: string | null): string {
  return routeNumber || jeepneyId.replace(/[^0-9]/g, '') || jeepneyId.slice(-2);
}
