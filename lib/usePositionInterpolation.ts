"use client";

import { useState, useEffect, useRef } from "react";

export type EasingFunction = "linear" | "ease-out" | "ease-in" | "ease-in-out";

export interface InterpolationOptions {
  /** Animation duration in milliseconds. Default: 1000 */
  duration?: number;
  /** Easing function to apply. Default: "ease-out" */
  easing?: EasingFunction;
}

/**
 * Easing functions that map a [0, 1] progress value to a [0, 1] eased value.
 */
const easings: Record<EasingFunction, (t: number) => number> = {
  linear: (t) => t,
  "ease-in": (t) => t * t * t,
  "ease-out": (t) => 1 - Math.pow(1 - t, 3),
  "ease-in-out": (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
};

/**
 * Smoothly interpolates a GPS position between updates using React state.
 *
 * Unlike `useAnimateMarker` (which drives a Leaflet marker ref directly),
 * this hook returns interpolated [lat, lng] state that can be consumed by
 * any React component — e.g. overlays, HUDs, or non-Leaflet renderers.
 *
 * Usage:
 * ```tsx
 * const smoothPos = usePositionInterpolation([jeep.lat, jeep.lng], {
 *   duration: 1200,
 *   easing: "ease-in-out",
 * });
 * // smoothPos is [lat, lng] and updates every animation frame
 * ```
 *
 * @param targetPosition The latest GPS position [lat, lng]
 * @param options        Animation duration and easing function
 * @returns              Smoothly interpolated [lat, lng] position
 */
export function usePositionInterpolation(
  targetPosition: [number, number],
  options: InterpolationOptions = {}
): [number, number] {
  const { duration = 1000, easing = "ease-out" } = options;

  const [interpolated, setInterpolated] = useState<[number, number]>(targetPosition);

  const fromRef = useRef<[number, number]>(targetPosition);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const [toLat, toLng] = targetPosition;
    const [fromLat, fromLng] = fromRef.current;

    // Skip imperceptible movements (< ~0.1 m)
    if (
      Math.abs(fromLat - toLat) < 0.000001 &&
      Math.abs(fromLng - toLng) < 0.000001
    ) {
      return;
    }

    // Cancel any in-flight animation
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const startLat = fromLat;
    const startLng = fromLng;
    const deltaLat = toLat - startLat;
    const deltaLng = toLng - startLng;
    const startTime = performance.now();
    const easeFn = easings[easing];

    fromRef.current = targetPosition;

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const t = easeFn(progress);

      const lat = startLat + deltaLat * t;
      const lng = startLng + deltaLng * t;

      setInterpolated([lat, lng]);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Snap to exact target to avoid floating-point drift
        setInterpolated([toLat, toLng]);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // Only re-run when the target coordinates actually change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetPosition[0], targetPosition[1], duration, easing]);

  return interpolated;
}
