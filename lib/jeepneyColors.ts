/**
 * A palette of visually distinct, high-contrast colors for jeepney identification.
 * Each entry is clearly distinguishable from adjacent entries to avoid confusion.
 */
const JEEPNEY_COLOR_PALETTE = [
  '#E53E3E', // Vivid Red
  '#3182CE', // Royal Blue
  '#38A169', // Forest Green
  '#D69E2E', // Golden Amber
  '#805AD5', // Purple
  '#DD6B20', // Burnt Orange
  '#319795', // Teal
  '#B83280', // Hot Pink
  '#2B6CB0', // Navy Blue
  '#276749', // Dark Green
  '#6B46C1', // Deep Violet
  '#C05621', // Rust Orange
  '#2C7A7B', // Dark Cyan
  '#C53030', // Crimson
  '#285E61', // Pine Green
  '#744210', // Warm Brown
  '#553C9A', // Indigo
  '#97266D', // Dark Magenta
  '#1A365D', // Midnight Blue
  '#22543D', // Deep Emerald
];

/**
 * Returns a consistent unique color for a jeepney.
 * - Uses the stored color from the database if one is set.
 * - Otherwise derives a deterministic color from the jeepneyId so the
 *   same jeepney always gets the same color across sessions.
 */
export function getJeepneyColor(jeepneyId: string, storedColor?: string | null): string {
  if (storedColor) return storedColor;

  // Deterministic hash → consistent palette index per jeepneyId
  let hash = 0;
  for (let i = 0; i < jeepneyId.length; i++) {
    hash = jeepneyId.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0; // Force 32-bit integer
  }
  return JEEPNEY_COLOR_PALETTE[Math.abs(hash) % JEEPNEY_COLOR_PALETTE.length];
}
