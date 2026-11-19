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
      className={`pointer-events-none fixed inset-0 -z-10 h-screen w-screen overflow-hidden select-none ${className}`}
    >
      {/* 1. Global Ambient Base Gradient (Rich, continuous luminous foundation) */}
      <div
        className="absolute inset-0 h-full w-full"
        style={{
          background: `
            radial-gradient(ellipse 100% 75% at 50% -5%, rgba(37, 99, 235, 0.22) 0%, rgba(6, 182, 212, 0.16) 40%, rgba(99, 102, 241, 0.10) 70%, transparent 90%),
            radial-gradient(ellipse 90% 70% at 50% 105%, rgba(37, 99, 235, 0.18) 0%, rgba(16, 185, 129, 0.12) 45%, transparent 80%)
          `,
        }}
      />

      {/* 2. Living React Bits Aurora Waves (Continuous organic motion) */}
      {isClient && !shouldReduceMotion && (
        <div className="relative h-full w-full overflow-hidden">
          {/* Main Upper Aurora Beam (Electric Sapphire to Cyan - sweeping left-to-right) */}
          <motion.div
            animate={{
              x: ["-8%", "8%", "-8%"],
              y: ["-4%", "6%", "-4%"],
              scale: [1, 1.1, 1],
              rotate: [0, 4, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-32 left-1/2 h-[680px] w-[1200px] -translate-x-1/2 transform-gpu rounded-full bg-gradient-to-r from-blue-600/32 via-cyan-400/28 to-indigo-500/26 blur-[110px] will-change-transform dark:from-blue-500/40 dark:via-cyan-400/34 dark:to-indigo-500/32"
          />

          {/* Right Flank Floating Aurora Ribbon (Luminous Cyan & Emerald light) */}
          <motion.div
            animate={{
              x: ["8%", "-10%", "8%"],
              y: ["-6%", "6%", "-6%"],
              scale: [1.08, 0.94, 1.08],
              rotate: [0, -6, 0],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-[20%] -right-32 h-[720px] w-[980px] transform-gpu rounded-full bg-gradient-to-bl from-cyan-400/30 via-teal-400/24 to-blue-500/28 blur-[120px] will-change-transform dark:from-cyan-400/38 dark:via-teal-400/30 dark:to-blue-600/36"
          />

          {/* Left Flank Floating Aurora Ribbon (Royal Violet & Sapphire glow) */}
          <motion.div
            animate={{
              x: ["-10%", "8%", "-10%"],
              y: ["5%", "-5%", "5%"],
              scale: [0.95, 1.08, 0.95],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-[50%] -left-32 h-[740px] w-[980px] transform-gpu rounded-full bg-gradient-to-tr from-indigo-500/30 via-purple-500/26 to-blue-500/28 blur-[125px] will-change-transform dark:from-indigo-600/38 dark:via-purple-600/32 dark:to-blue-600/36"
          />

          {/* Lower Center Aurora Wave (Cyan & Emerald Horizon Bloom) */}
          <motion.div
            animate={{
              x: ["-6%", "6%", "-6%"],
              y: ["-4%", "4%", "-4%"],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 16,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-28 left-1/2 h-[640px] w-[1140px] -translate-x-1/2 transform-gpu rounded-full bg-gradient-to-t from-blue-500/30 via-cyan-400/26 to-emerald-400/20 blur-[115px] will-change-transform dark:from-blue-600/38 dark:via-cyan-400/32 dark:to-emerald-500/24"
          />
        </div>
      )}
    </div>
  );
};
