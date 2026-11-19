"use client";

import * as React from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";

export interface DashboardSmoothScrollProps {
  children: React.ReactNode;
}

/**
 * DashboardSmoothScroll
 *
 * Professional, high-precision inertia smooth scrolling tuned specifically for the
 * FlowPilot operational cockpit.
 *
 * Architectural Features:
 * - Controlled 0.85s duration: Snappy enough to prevent mis-clicks during rapid data entry.
 * - Targets the inner <main id="main-content"> viewport instead of the window.
 * - Built-in safety guards: Automatically prevents background scroll when modals ([role="dialog"]),
 *   dropdown menus ([role="menu"]), or [data-lenis-prevent] containers are active.
 * - Mobile and tablet touch screens retain fast, 100% native momentum (syncTouch: false).
 * - Instant scroll reset on route changes.
 * - Full cleanup on unmount.
 */
export function DashboardSmoothScroll({ children }: DashboardSmoothScrollProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const mainRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const lenisRef = React.useRef<Lenis | null>(null);

  React.useEffect(() => {
    if (shouldReduceMotion) return;
    if (!mainRef.current || !contentRef.current) return;

    const lenis = new Lenis({
      wrapper: mainRef.current,
      content: contentRef.current,
      duration: 0.85, // Snappy & controlled duration: stops promptly for buttons and tables
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.1,
      syncTouch: false, // Retain native touch momentum on touchscreens
      prevent: (node) => {
        // Prevent background page momentum when interacting with modals, popovers or drawers
        return (
          node.closest("[data-lenis-prevent]") !== null ||
          node.closest('[role="dialog"]') !== null ||
          node.closest('[role="menu"]') !== null ||
          node.closest('[role="listbox"]') !== null
        );
      },
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

  // Reset scroll to top on dashboard route change
  React.useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [pathname]);

  return (
    <main
      ref={mainRef}
      id="main-content"
      tabIndex={-1}
      className="flex-1 overflow-x-hidden overflow-y-auto p-3.5 outline-none sm:p-6 lg:p-8"
      style={{ scrollBehavior: "auto" }}
    >
      <div ref={contentRef} className="mx-auto w-full max-w-7xl min-w-0 2xl:max-w-[1520px]">
        {children}
      </div>
    </main>
  );
}
