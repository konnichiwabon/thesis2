// Jeepney Type Definitions for Tracking System

/**
 * Static Data - Updates infrequently (set once or rarely changed)
 */
export interface JeepneyStaticData {
  jeepneyId: string;           // Unique identifier (e.g., "Jeep-01")
  routeNumber: string;         // Display route (e.g., "04C", "62D")
  plateNumber: string;         // Vehicle plate (e.g., "ABC-123")
  maxLoad: number;             // Maximum passenger capacity (default: 40)
  color?: string;              // Custom marker color
  operator?: string;           // Operator/Company name
}

/**
 * Dynamic Data - Updates every ~5 seconds in real-time
 */
export interface JeepneyDynamicData {
  passengerCount: number;      // Current passenger count
  latitude: number;            // Current GPS latitude
  longitude: number;           // Current GPS longitude
  lastUpdated: number;         // Timestamp of last update
}

/**
 * Complete Jeepney Entity - Combines static and dynamic data
 */
export interface Jeepney extends JeepneyStaticData, JeepneyDynamicData {
  _id?: string;                // Convex database ID
}

/**
 * Jeepney for Map Display - Formatted for map markers
 */
export interface JeepneyMapMarker {
  id: string;
  plateNumber: string;
  routeNumber?: string;
  passengerCount: number;
  position: [number, number];  // [lat, lng]
  colorTheme: 'green' | 'red' | 'orange' | 'purple';
  status: string;
  color?: string;
}

/**
 * Jeepney for Carousel Display - Formatted for carousel cards
 */
export interface JeepneyCarouselItem {
  id: number;
  route: string;
  plateNumber: string;
  currentLoad: number;
  maxLoad: number;
  status: string;
  colorTheme: 'green' | 'red' | 'orange' | 'purple';
}

/**
 * Helper function to calculate load status
 */
export function getLoadStatus(passengerCount: number, maxLoad: number = 40): {
  status: string;
  colorTheme: 'green' | 'red' | 'orange' | 'purple';
} {
  const percentage = (passengerCount / maxLoad) * 100;
  
  if (percentage <= 32.5) {
    return { status: "Low", colorTheme: "green" };
  } else if (percentage <= 65) {
    return { status: "Moderate", colorTheme: "orange" };
  } else if (percentage <= 100) {
    return { status: "High", colorTheme: "red" };
  } else {
    return { status: "Overloaded", colorTheme: "purple" };
  }
}
