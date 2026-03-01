"use client";

import { useEffect, useRef } from "react";

/**
 * Smoothly animates a Leaflet marker between GPS positions.
 *
 * KEY DESIGN: This hook directly calls marker.setLatLng() via requestAnimationFrame.
 * It does NOT use React state — this avoids re-render fights with react-leaflet's
 * own position management that were causing the marker to appear stuck.
 *
 * Data flow:
 *   Convex DB (lat/lng) → useQuery → page.tsx → map.tsx → jeepneyMarker.tsx
 *   → useAnimateMarker → marker.setLatLng() (direct Leaflet API)
 *
 * @param markerRef React ref to the Leaflet marker instance
 * @param targetPosition The latest GPS position [lat, lng] from Convex
 * @param duration Animation duration in ms (default 2000)
 */
export function useAnimateMarker(
  markerRef: React.RefObject<any>,
  targetPosition: [number, number],
  duration: number = 2000
): void {
  const animationRef = useRef<number | null>(null);
  const prevPositionRef = useRef<[number, number]>(targetPosition);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) {
      console.warn("🚨 [useAnimateMarker] No marker ref yet — skipping animation");
      return;
    }

    const from = prevPositionRef.current;
    const to = targetPosition;

    // Skip if position hasn't meaningfully changed (< ~0.1m)
    if (Math.abs(from[0] - to[0]) < 0.000001 && Math.abs(from[1] - to[1]) < 0.000001) {
      return;
    }

    console.log(`🎯 [useAnimateMarker] Animating: [${from[0].toFixed(5)}, ${from[1].toFixed(5)}] → [${to[0].toFixed(5)}, ${to[1].toFixed(5)}]`);

    // Cancel any running animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Save starting point BEFORE updating prevPositionRef
    const startLat = from[0];
    const startLng = from[1];
    const deltaLat = to[0] - startLat;
    const deltaLng = to[1] - startLng;
    const startTime = performance.now();

    // Update ref so the next animation starts from the new target
    prevPositionRef.current = to;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);

      const lat = startLat + deltaLat * eased;
      const lng = startLng + deltaLng * eased;

      // Directly move the Leaflet marker — no React state, no re-renders
      marker.setLatLng([lat, lng]);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(tick);
      } else {
        // Snap exactly to target at end
        marker.setLatLng([to[0], to[1]]);
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [targetPosition[0], targetPosition[1], duration]);
}
