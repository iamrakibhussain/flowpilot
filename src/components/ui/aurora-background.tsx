"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface AuroraBackgroundProps {
  className?: string;
}

const emptySubscribe = () => () => {};

/**
 * AuroraBackground
 *
 * Implements a subtle, executive-level React Bits Aurora effect across the
 * ENTIRE FlowPilot homepage.
 *
 * Density: 12% - 15% opacity (Golden Ratio for B2B SaaS light mode).
 * Features:
 * - Scoped strictly to the public homepage (not authenticated dashboard or login).
 * - Light-mode treatment blending seamlessly into FlowPilot's `#f7f9fc`.
 * - Fixed viewport positioning ensures continuous 60 FPS performance.
 * - Broader 110px-120px Gaussian blur eliminates color banding and harsh edges.
 * - Fully SSR/Hydration safe with a static CSS gradient fallback.
 * - Respects prefers-reduced-motion and optimizes for mobile devices.
 */
export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({ className = "" }) => {
  const shouldReduceMotion = useReducedMotion();
  const isClient = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none ${className}`}
    >
      {/* 1. Static CSS Gradient Foundation (SSR-safe, zero layout shift, seamless fallback) */}
      <div
        className="absolute inset-0 h-full w-full"
        style={{
          background: `
            radial-gradient(ellipse 90% 65% at 50% -10%, rgba(49, 95, 232, 0.12) 0%, rgba(14, 165, 233, 0.08) 45%, transparent 75%),
            radial-gradient(ellipse 80% 55% at 50% 105%, rgba(49, 95, 232, 0.10) 0%, rgba(14, 165, 233, 0.07) 50%, transparent 80%)
          `,
        }}
      />

      {/* 2. Living React Bits Aurora Waves (Active when mounted & motion is allowed) */}
      {isClient && !shouldReduceMotion && (
        <div className="relative h-full w-full">
          {/* Upper Aurora Wave (FlowPilot #315fe8 - 14% peak opacity) */}
          <motion.div
            animate={{
              x: ["-5%", "5%", "-5%"],
              y: ["-3%", "4%", "-3%"],
              scale: [1, 1.06, 1],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="from-primary/15 absolute -top-24 left-1/2 h-[520px] w-[1020px] -translate-x-1/2 transform-gpu rounded-full bg-gradient-to-r via-blue-500/12 to-cyan-400/10 blur-[110px] will-change-transform"
          />

          {/* Mid-Page Floating Cyan Ribbon (Pale Ice Cyan #38bdf8 - 13% opacity) */}
          <motion.div
            animate={{
              x: ["6%", "-6%", "6%"],
              y: ["4%", "-4%", "4%"],
              scale: [1.05, 0.95, 1.05],
            }}
            transition={{
              duration: 26,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="to-primary/12 absolute top-[30%] -right-24 h-[580px] w-[880px] transform-gpu rounded-full bg-gradient-to-bl from-cyan-400/13 via-sky-400/11 blur-[120px] will-change-transform"
          />

          {/* Lower-Page Floating Ice-Blue Ribbon (Subtle depth behind Benefits & Architecture) */}
          <motion.div
            animate={{
              x: ["-4%", "6%", "-4%"],
              y: ["-3%", "3%", "-3%"],
              scale: [0.97, 1.04, 0.97],
            }}
            transition={{
              duration: 24,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="from-primary/13 absolute top-[60%] -left-28 h-[560px] w-[880px] transform-gpu rounded-full bg-gradient-to-tr via-indigo-400/10 to-teal-400/10 blur-[115px] will-change-transform"
          />

          {/* Bottom Ambient Aurora Wave (Behind FAQ & Final CTA - 14% peak opacity) */}
          <motion.div
            animate={{
              opacity: [0.75, 1, 0.75],
              scale: [0.98, 1.04, 0.98],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="via-primary/14 absolute -bottom-24 left-1/2 h-[460px] w-[980px] -translate-x-1/2 transform-gpu rounded-full bg-gradient-to-t from-blue-400/12 to-cyan-400/9 blur-[110px] will-change-transform"
          />
        </div>
      )}
    </div>
  );
};
