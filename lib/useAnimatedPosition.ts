"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface AnimatedPositionOptions {
  /** Duration of the animation in ms (default: 3000) */
  duration?: number;
  /** Minimum distance in meters to trigger OSRM road snapping (default: 50) */
  osrmThreshold?: number;
  /** Whether to use OSRM road snapping (default: true). Falls back to linear if OSRM fails. */
  useRoadSnapping?: boolean;
}

/**
 * Calculate distance between two lat/lng points in meters (Haversine)
 */
function haversineDistance(
  [lat1, lng1]: [number, number],
  [lat2, lng2]: [number, number]
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Linear interpolation between two points
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Interpolate along a polyline path given a progress value (0..1).
 * Returns the [lat, lng] at that progress point.
 */
function interpolateAlongPath(
  path: [number, number][],
  t: number
): [number, number] {
  if (path.length === 0) return [0, 0];
  if (path.length === 1 || t <= 0) return path[0];
  if (t >= 1) return path[path.length - 1];

  // Calculate total path length
  const segmentLengths: number[] = [];
  let totalLength = 0;
  for (let i = 1; i < path.length; i++) {
    const len = haversineDistance(path[i - 1], path[i]);
    segmentLengths.push(len);
    totalLength += len;
  }

  if (totalLength === 0) return path[0];

  // Find which segment we're on
  const targetDist = t * totalLength;
  let accumulated = 0;
  for (let i = 0; i < segmentLengths.length; i++) {
    const segLen = segmentLengths[i];
    if (accumulated + segLen >= targetDist) {
      // Interpolate within this segment
      const segProgress = segLen > 0 ? (targetDist - accumulated) / segLen : 0;
      return [
        lerp(path[i][0], path[i + 1][0], segProgress),
        lerp(path[i][1], path[i + 1][1], segProgress),
      ];
    }
    accumulated += segLen;
  }

  return path[path.length - 1];
}

/**
 * Fetch road-snapped path from OSRM between two points.
 * Returns array of [lat, lng] coordinates following the road.
 */
async function fetchRoadPath(
  from: [number, number],
  to: [number, number]
): Promise<[number, number][] | null> {
  try {
    const coords = `${from[1]},${from[0]};${to[1]},${to[0]}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.code !== "Ok" || !data.routes?.[0]) return null;

    // Convert [lng, lat] → [lat, lng]
    const coordinates: [number, number][] =
      data.routes[0].geometry.coordinates.map(
        (c: number[]) => [c[1], c[0]] as [number, number]
      );

    return coordinates;
  } catch {
    return null;
  }
}

/**
 * Hook that smoothly animates a marker position along the road
 * between GPS updates using OSRM road snapping.
 *
 * @param targetPosition The latest GPS position [lat, lng]
 * @param jeepId Unique ID for caching/tracking
 * @param options Animation options
 * @returns The current animated [lat, lng] to render the marker at
 */
export function useAnimatedPosition(
  targetPosition: [number, number],
  jeepId: string,
  options: AnimatedPositionOptions = {}
): [number, number] {
  const {
    duration = 3000,
    osrmThreshold = 50,
    useRoadSnapping = true,
  } = options;

  const [animatedPos, setAnimatedPos] = useState<[number, number]>(targetPosition);
  const prevTargetRef = useRef<[number, number]>(targetPosition);
  const animationRef = useRef<number | null>(null);
  const pathRef = useRef<[number, number][] | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const animate = useCallback(
    (path: [number, number][], startTime: number, dur: number) => {
      const tick = () => {
        if (!isMountedRef.current) return;

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / dur, 1);

        // Ease-in-out for natural movement
        const eased =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - (-2 * progress + 2) ** 2 / 2;

        const pos = interpolateAlongPath(path, eased);
        setAnimatedPos(pos);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(tick);
        }
      };
      animationRef.current = requestAnimationFrame(tick);
    },
    []
  );

  useEffect(() => {
    const prevPos = prevTargetRef.current;
    const newPos = targetPosition;

    // Skip if position hasn't actually changed
    if (prevPos[0] === newPos[0] && prevPos[1] === newPos[1]) return;

    const distance = haversineDistance(prevPos, newPos);
    prevTargetRef.current = newPos;

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // If too close, just snap (no animation needed for tiny GPS jitter)
    if (distance < 5) {
      setAnimatedPos(newPos);
      return;
    }

    // If distance is very large (> 5km), just snap - likely a data error or repositioned vehicle
    if (distance > 5000) {
      setAnimatedPos(newPos);
      return;
    }

    const startAnimation = (path: [number, number][]) => {
      if (!isMountedRef.current) return;
      pathRef.current = path;
      // Scale duration based on distance (longer distance = more time)
      const animDuration = Math.min(Math.max(duration, distance * 10), 8000);
      animate(path, Date.now(), animDuration);
    };

    // Try OSRM road snapping for distances > threshold
    if (useRoadSnapping && distance >= osrmThreshold) {
      fetchRoadPath(prevPos, newPos).then((roadPath) => {
        if (!isMountedRef.current) return;
        if (roadPath && roadPath.length >= 2) {
          startAnimation(roadPath);
        } else {
          // Fallback to linear interpolation
          startAnimation([prevPos, newPos]);
        }
      });
    } else {
      // Linear interpolation for short distances
      startAnimation([prevPos, newPos]);
    }
  }, [targetPosition[0], targetPosition[1], duration, osrmThreshold, useRoadSnapping, animate]);

  return animatedPos;
}
