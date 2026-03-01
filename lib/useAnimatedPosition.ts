"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Smoothly animates a marker between GPS positions using linear interpolation.
 * No external dependencies — guaranteed to always update the marker position.
 *
 * @param targetPosition The latest GPS position [lat, lng] from Convex
 * @param jeepId Unique ID (unused but kept for API compatibility)
 * @param options Animation options
 */
export function useAnimatedPosition(
  targetPosition: [number, number],
  jeepId: string,
  options: { duration?: number; osrmThreshold?: number; useRoadSnapping?: boolean } = {}
): [number, number] {
  const { duration = 2000 } = options;

  const [animatedPos, setAnimatedPos] = useState<[number, number]>(targetPosition);
  const animationRef = useRef<number | null>(null);
  const startPosRef = useRef<[number, number]>(targetPosition);
  const startTimeRef = useRef<number>(Date.now());
  const fromPosRef = useRef<[number, number]>(targetPosition);

  useEffect(() => {
    const from = fromPosRef.current;
    const to = targetPosition;

    // Skip if position hasn't changed
    if (from[0] === to[0] && from[1] === to[1]) return;

    // Cancel any running animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Record start of new animation
    startPosRef.current = from;
    startTimeRef.current = Date.now();
    fromPosRef.current = to;

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);

      const pos: [number, number] = [
        startPosRef.current[0] + (to[0] - startPosRef.current[0]) * eased,
        startPosRef.current[1] + (to[1] - startPosRef.current[1]) * eased,
      ];

      setAnimatedPos(pos);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(tick);
      } else {
        // Snap exactly to target at end
        setAnimatedPos(to);
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

  return animatedPos;
}
