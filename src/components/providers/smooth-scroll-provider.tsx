"use client";

import * as React from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import "lenis/dist/lenis.css";

export interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

/**
 * SmoothScrollProvider
 *
 * Implements luxury, high-performance inertia momentum smooth scrolling using Lenis.
 * Features:
 * - Exponential physics easing for natural, floating deceleration on mouse wheel & trackpad.
 * - Hardware-accelerated RAF sync that drives Framer Motion and ScrollProgressBar seamlessly.
 * - Auto-disabled if prefers-reduced-motion is active.
 * - Instant reset on route change.
 * - Full cleanup on unmount, preserving pristine dashboard isolation.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const lenisRef = React.useRef<Lenis | null>(null);

  React.useEffect(() => {
    // Graceful degradation: standard native scrolling if reduced motion is preferred
    if (shouldReduceMotion) return;

    const lenis = new Lenis({
      duration: 1.15, // Golden ratio momentum duration
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Linear/Apple style exponential curve
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
      syncTouch: false, // Let mobile touch retain native physical momentum
    });

    lenisRef.current = lenis;

    let rafId: number;
    function update(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(update);
    }
    rafId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [shouldReduceMotion]);

  // Reset scroll to top smoothly on pathname change
  React.useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  return <>{children}</>;
}
