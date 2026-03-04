"use client";

import { useEffect, useRef } from "react";

/** Haversine distance in metres between two GPS coordinates. */
function haversineMeters(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Smoothly animates a Leaflet marker to each new GPS position.
 *
 * Rules:
 *  - Movement >= 1 km  → snap instantly (teleport, no animation).
 *    Handles calibration jumps / fresh GPS lock far from last position.
 *  - Movement < 1 km   → smooth ease-out-cubic animation over `duration` ms.
 *  - Movement < ~0.1 m → ignored (noise / duplicate update).
 *
 * IMPORTANT: This hook drives the marker EXCLUSIVELY via the Leaflet API
 * (marker.setLatLng). The <Marker> in react-leaflet must receive a STABLE
 * position prop (the mount-time position, never updated) so react-leaflet
 * never calls setLatLng itself and fights the animation.
 */
export function useAnimateMarker(
  markerRef: React.RefObject<any>,
  targetPosition: [number, number],
  duration: number = 2_000,
  snapThresholdMeters: number = 1_000
): void {
  const animationRef = useRef<number | null>(null);
  const prevPosRef   = useRef<[number, number]>(targetPosition);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const from = prevPosRef.current;
    const to   = targetPosition;

    // Skip sub-decimetre noise
    if (
      Math.abs(from[0] - to[0]) < 0.000_001 &&
      Math.abs(from[1] - to[1]) < 0.000_001
    ) {
      return;
    }

    // Cancel any in-progress animation
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const distMeters = haversineMeters(from[0], from[1], to[0], to[1]);

    // ── SNAP: GPS jump >= 1 km (fresh lock, manual re-position, etc.) ──
    if (distMeters >= snapThresholdMeters) {
      marker.setLatLng(to);
      prevPosRef.current = to;
      return;
    }

    // ── ANIMATE: smooth interpolation for normal GPS movement ──
    const startLat  = from[0];
    const startLng  = from[1];
    const deltaLat  = to[0] - startLat;
    const deltaLng  = to[1] - startLng;
    const startTime = performance.now();

    // Update reference immediately so the next update starts from here
    prevPosRef.current = to;

    const tick = (now: number) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic: fast start, smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);

      marker.setLatLng([
        startLat + deltaLat * eased,
        startLng + deltaLng * eased,
      ]);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(tick);
      } else {
        marker.setLatLng(to); // Snap exactly to target at end
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [targetPosition[0], targetPosition[1]]);
}
