/**
 * OSRM (Open Source Routing Machine) Utility Functions
 * Used to snap waypoints to roads and generate realistic driving routes
 */

export interface Waypoint {
  lat: number;
  lng: number;
}

export interface OSRMResponse {
  code: string;
  routes?: Array<{
    geometry: {
      coordinates: number[][];
      type: string;
    };
    distance: number;
    duration: number;
  }>;
  waypoints?: Array<{
    location: number[];
    name: string;
  }>;
}

/**
 * Fetches a driving route from OSRM API that follows roads
 * @param waypoints Array of lat/lng coordinates to route through
 * @returns Geometry coordinates for drawing polyline on map
 */
export async function getRouteFromOSRM(waypoints: Waypoint[]): Promise<{
  coordinates: [number, number][];
  distance: number;
  duration: number;
} | null> {
  if (waypoints.length < 2) {
    console.warn('Need at least 2 waypoints for routing');
    return null;
  }

  try {
    // Format coordinates as "lng,lat;lng,lat;..." (OSRM uses lng,lat order)
    const coordinatesString = waypoints
      .map(wp => `${wp.lng},${wp.lat}`)
      .join(';');

    // OSRM API endpoint - using the public demo server with high-quality routing
    // steps=true gives turn-by-turn instructions for more accurate road following
    // continue_straight=false allows the router to make turns at intersections
    // annotations=true provides additional route metadata
    const url = `https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson&steps=true&annotations=true&continue_straight=false`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`);
    }

    const data: OSRMResponse = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.error('OSRM returned no routes:', data);
      return null;
    }

    const route = data.routes[0];
    
    // Convert from [lng, lat] to [lat, lng] for Leaflet
    const coordinates: [number, number][] = route.geometry.coordinates.map(
      coord => [coord[1], coord[0]]
    );

    return {
      coordinates,
      distance: route.distance, // in meters
      duration: route.duration, // in seconds
    };
  } catch (error) {
    console.error('Error fetching route from OSRM:', error);
    return null;
  }
}

/**
 * Format distance for display
 * @param meters Distance in meters
 * @returns Formatted string (e.g., "5.2 km" or "850 m")
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

/**
 * Format duration for display
 * @param seconds Duration in seconds
 * @returns Formatted string (e.g., "45 min" or "1h 30min")
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes} min`;
}
