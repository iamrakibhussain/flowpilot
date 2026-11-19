"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useTransform,
  useSpring,
  useScroll,
} from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Laptop,
  Calendar,
  DollarSign,
  Users,
  Lock,
  Clock,
  Activity,
  Check,
  LayoutDashboard,
  Zap,
  TrendingUp,
  Video,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

type CockpitLens = "overview" | "workflow" | "financials";

/**
 * High-performance fluid counting animation helper for hero metrics
 */
const AnimatedCounter: React.FC<{
  target: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}> = ({ target, prefix = "", suffix = "", decimals = 0, duration = 650 }) => {
  const shouldReduceMotion = useReducedMotion();
  const [val, setVal] = React.useState(shouldReduceMotion ? target : 0);

  React.useEffect(() => {
    if (shouldReduceMotion) {
      return;
    }

    const start = performance.now();
    let frameId: number;

    const update = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth ease-out expo curve for organic easing
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const next = target * ease;
      setVal(next);

      if (progress < 1) {
        frameId = requestAnimationFrame(update);
      } else {
        setVal(target);
      }
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration, shouldReduceMotion]);

  return (
    <span>
      {prefix}
      {val.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
};

const heroFounders = [
  {
    name: "Sarah Jenkins",
    role: "Creative Agency Founder",
    metric: "42 Team Members",
    image: "/images/homepage/founder-sarah.jpg",
    accentGlow: "group-hover/avatar:ring-cyan-400 group-hover/avatar:shadow-cyan-500/30",
  },
  {
    name: "Marcus Vance",
    role: "Operations Director",
    metric: "1,400+ hrs Automated",
    image: "/images/homepage/founder-marcus.jpg",
    accentGlow: "group-hover/avatar:ring-emerald-400 group-hover/avatar:shadow-emerald-500/30",
  },
  {
    name: "Elena Chen",
    role: "Principal Consultancy Partner",
    metric: "Zero Billing Desync",
    image: "/images/homepage/founder-elena.jpg",
    accentGlow: "group-hover/avatar:ring-indigo-400 group-hover/avatar:shadow-indigo-500/30",
  },
];

const enterprisePartners = [
  {
    name: "VERTEX",
    suffix: "advisory",
    metric: "$4.2M ARR Managed",
    hoverBorder: "hover:border-cyan-500/40 hover:shadow-cyan-500/10 hover:shadow-lg",
    iconBg:
      "group-hover/logo:bg-cyan-500/15 group-hover/logo:border-cyan-500/40 group-hover/logo:text-cyan-400",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-4 w-4 transition-colors"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="12 2 2 22 22 22" fill="currentColor" fillOpacity="0.15" />
        <path d="M12 6L18 18H6L12 6Z" />
      </svg>
    ),
  },
  {
    name: "KINETIC",
    suffix: "ops",
    metric: "120+ Active Staff",
    hoverBorder: "hover:border-emerald-500/40 hover:shadow-emerald-500/10 hover:shadow-lg",
    iconBg:
      "group-hover/logo:bg-emerald-500/15 group-hover/logo:border-emerald-500/40 group-hover/logo:text-emerald-400",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-4 w-4 transition-colors"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="13 17 18 12 13 7" />
        <polyline points="6 17 11 12 6 7" />
      </svg>
    ),
  },
  {
    name: "MERIDIAN",
    suffix: "capital",
    metric: "99.98% Settlement",
    hoverBorder: "hover:border-indigo-500/40 hover:shadow-indigo-500/10 hover:shadow-lg",
    iconBg:
      "group-hover/logo:bg-indigo-500/15 group-hover/logo:border-indigo-500/40 group-hover/logo:text-indigo-400",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-4 w-4 transition-colors"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3.6 9h16.8M3.6 15h16.8" />
        <path d="M12 3a14.5 14.5 0 0 1 0 18M12 3a14.5 14.5 0 0 0 0 18" />
      </svg>
    ),
  },
  {
    name: "PULSE",
    suffix: "studio",
    metric: "Design Studio of '25",
    hoverBorder: "hover:border-violet-500/40 hover:shadow-violet-500/10 hover:shadow-lg",
    iconBg:
      "group-hover/logo:bg-violet-500/15 group-hover/logo:border-violet-500/40 group-hover/logo:text-violet-400",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-4 w-4 transition-colors"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    name: "APEX",
    suffix: "labs",
    metric: "1,800+ Bookings/Mo",
    hoverBorder: "hover:border-blue-500/40 hover:shadow-blue-500/10 hover:shadow-lg",
    iconBg:
      "group-hover/logo:bg-blue-500/15 group-hover/logo:border-blue-500/40 group-hover/logo:text-blue-400",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-4 w-4 transition-colors"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2L2 12h5v8h10v-8h5L12 2z" fill="currentColor" fillOpacity="0.15" />
      </svg>
    ),
  },
  {
    name: "NEXUS",
    suffix: "global",
    metric: "14 Global Branches",
    hoverBorder: "hover:border-amber-500/40 hover:shadow-amber-500/10 hover:shadow-lg",
    iconBg:
      "group-hover/logo:bg-amber-500/15 group-hover/logo:border-amber-500/40 group-hover/logo:text-amber-400",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-4 w-4 transition-colors"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="6" cy="6" r="3" />
        <circle cx="18" cy="18" r="3" />
        <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
      </svg>
    ),
  },
];

export const HeroSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [cockpitView, setCockpitView] = React.useState<CockpitLens>("overview");

  // WAI-ARIA Accessible Keyboard Tab Navigation between Cockpit Lenses
  const handleTabKeyDown = (e: React.KeyboardEvent) => {
    const lenses: CockpitLens[] = ["overview", "workflow", "financials"];
    const currentIndex = lenses.indexOf(cockpitView);
    let nextIndex = currentIndex;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % lenses.length;
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + lenses.length) % lenses.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = lenses.length - 1;
    } else {
      return;
    }

    const nextLens = lenses[nextIndex];
    setCockpitView(nextLens);
    const targetTab = document.getElementById(`hero-lens-tab-${nextLens}`);
    targetTab?.focus();
  };

  // 3D Spatial Gyroscopic Perspective Cockpit Tilt (Clamped to 0 on Reduced Motion)
  const cockpitRef = React.useRef<HTMLDivElement | null>(null);
  const cockpitMouseX = useMotionValue(0);
  const cockpitMouseY = useMotionValue(0);
  const cockpitRotateX = useTransform(
    cockpitMouseY,
    [-200, 200],
    shouldReduceMotion ? [0, 0] : [4, -4]
  );
  const cockpitRotateY = useTransform(
    cockpitMouseX,
    [-350, 350],
    shouldReduceMotion ? [0, 0] : [-5, 5]
  );
  const springCockpitRotateX = useSpring(cockpitRotateX, { stiffness: 220, damping: 28 });
  const springCockpitRotateY = useSpring(cockpitRotateY, { stiffness: 220, damping: 28 });

  // Dynamic Ray-Traced Reactive Card Parallax (Disabled on Reduced Motion)
  const card1ParallaxX = useTransform(
    cockpitMouseX,
    [-350, 350],
    shouldReduceMotion ? [0, 0] : [7, -7]
  );
  const card1ParallaxY = useTransform(
    cockpitMouseY,
    [-200, 200],
    shouldReduceMotion ? [0, 0] : [6, -6]
  );
  const card2ParallaxX = useTransform(
    cockpitMouseX,
    [-350, 350],
    shouldReduceMotion ? [0, 0] : [-8, 8]
  );
  const card2ParallaxY = useTransform(
    cockpitMouseY,
    [-200, 200],
    shouldReduceMotion ? [0, 0] : [-6, 6]
  );
  const card3ParallaxX = useTransform(
    cockpitMouseX,
    [-350, 350],
    shouldReduceMotion ? [0, 0] : [5, -5]
  );
  const card3ParallaxY = useTransform(
    cockpitMouseY,
    [-200, 200],
    shouldReduceMotion ? [0, 0] : [-4, 4]
  );

  const handleCockpitMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cockpitRef.current) return;
    const rect = cockpitRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    cockpitMouseX.set(e.clientX - centerX);
    cockpitMouseY.set(e.clientY - centerY);
  };

  const handleCockpitMouseLeave = () => {
    cockpitMouseX.set(0);
    cockpitMouseY.set(0);
  };

  // Magnetic Gravitational Pull for Primary CTA
  const heroCtaRef = React.useRef<HTMLDivElement | null>(null);
  const heroCtaX = useMotionValue(0);
  const heroCtaY = useMotionValue(0);
  const springHeroCtaX = useSpring(heroCtaX, { stiffness: 350, damping: 25 });
  const springHeroCtaY = useSpring(heroCtaY, { stiffness: 350, damping: 25 });

  const handleHeroCtaMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroCtaRef.current) return;
    const rect = heroCtaRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) * 0.22;
    const distanceY = (e.clientY - centerY) * 0.22;
    heroCtaX.set(Math.max(-7, Math.min(7, distanceX)));
    heroCtaY.set(Math.max(-5, Math.min(5, distanceY)));
  };

  const handleHeroCtaMouseLeave = () => {
    heroCtaX.set(0);
    heroCtaY.set(0);
  };

  // Scroll-Driven Perspective Depth (Hardware-Accelerated on Both Desktop & Mobile)
  const heroSectionRef = React.useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroSectionRef,
    offset: ["start start", "end start"],
  });

  const scrollCockpitScale = useTransform(
    scrollYProgress,
    [0, 0.85],
    shouldReduceMotion ? [1, 1] : [1, 0.94]
  );
  const scrollCockpitOpacity = useTransform(
    scrollYProgress,
    [0, 0.85],
    shouldReduceMotion ? [1, 1] : [1, 0.9]
  );
  const scrollCockpitY = useTransform(
    scrollYProgress,
    [0, 0.85],
    shouldReduceMotion ? [0, 0] : [0, 28]
  );

  const springScrollCockpitScale = useSpring(scrollCockpitScale, {
    stiffness: 280,
    damping: 30,
    restDelta: 0.001,
  });
  const springScrollCockpitOpacity = useSpring(scrollCockpitOpacity, {
    stiffness: 280,
    damping: 30,
    restDelta: 0.001,
  });
  const springScrollCockpitY = useSpring(scrollCockpitY, {
    stiffness: 280,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section ref={heroSectionRef} className="relative overflow-hidden pt-8 pb-14 md:pt-14 md:pb-24">
      {/* 1. Volumetric Celestial Aurora Mesh & 3D Perspective Horizon Plane */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        {/* Deep Core Sapphire Light Pool */}
        <div
          className={`absolute top-1/4 left-1/2 h-[480px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.11),transparent_70%)] blur-[95px] dark:bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.14),transparent_70%)] ${shouldReduceMotion ? "animate-none" : "animate-aurora"}`}
        />

        {/* Hyper-Violet Prismatic Ambient Glow */}
        <div
          className={`absolute top-1/3 left-1/3 h-[380px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.09),transparent_70%)] blur-[85px] [animation-delay:2.5s] dark:bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12),transparent_70%)] ${shouldReduceMotion ? "animate-none" : "animate-aurora"}`}
        />

        {/* Electric Cyan Secondary Accent Horizon Pool */}
        <div
          className={`absolute top-1/2 left-2/3 h-[340px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08),transparent_70%)] blur-[90px] [animation-delay:5s] dark:bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.11),transparent_70%)] ${shouldReduceMotion ? "animate-none" : "animate-aurora"}`}
        />

        {/* Precision Blueprint Dot Matrix Grid */}
        <div className="absolute inset-0 [background-image:radial-gradient(rgba(100,116,139,0.14)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_35%,#000_65%,transparent_100%)] [background-size:24px_24px] opacity-75 dark:[background-image:radial-gradient(rgba(148,163,184,0.14)_1px,transparent_1px)]" />

        {/* 3D Perspective Vector Horizon Floor Grid */}
        <div
          className={`absolute inset-x-0 bottom-0 h-56 origin-bottom [transform:perspective(650px)_rotateX(64deg)] [background-image:linear-gradient(to_right,rgba(100,116,139,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.14)_1px,transparent_1px)] [background-size:40px_40px] opacity-60 dark:opacity-40 ${shouldReduceMotion ? "animate-none" : "animate-horizon-glide"}`}
        />
        <div className="from-primary/15 via-primary/5 pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t to-transparent opacity-80 blur-lg" />
      </div>

      <Container className="flex flex-col items-center text-center">
        {/* 2. Living Telemetry Eyebrow Pill */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="shimmer-badge group border-border/80 bg-surface/90 hover:border-primary/50 relative inline-flex cursor-pointer items-center gap-2.5 rounded-full border px-4 py-1.5 text-xs font-medium shadow-xs backdrop-blur-xl transition-all duration-300 hover:shadow-md motion-reduce:!transform-none motion-reduce:!opacity-100 dark:border-neutral-800/90 dark:bg-neutral-900/70"
        >
          {/* Hairline Specular Top Highlight */}
          <div className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/30" />

          <Badge
            variant="outline"
            className="h-5.5 gap-1.5 border-emerald-500/30 bg-emerald-500/10 px-2.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400"
          >
            <span className="relative flex h-2 w-2 items-center justify-center">
              <span
                className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 ${shouldReduceMotion ? "opacity-0" : "animate-ping opacity-75"}`}
              />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
            </span>
            <span>FlowPilot v2.4.8</span>
          </Badge>
          <span className="text-muted-foreground/60 hidden sm:inline">&bull;</span>
          <span className="text-muted-foreground hidden font-medium sm:inline">
            Multi-Tenant Enterprise Engine Active
          </span>
          <ArrowRight className="text-muted-foreground group-hover:text-primary h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </motion.div>

        {/* 3. Primary Headline with 3D Editorial Typography */}
        <div className="relative mt-6 w-full max-w-4xl">
          <motion.h1
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.5,
              delay: shouldReduceMotion ? 0 : 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-3xl font-extrabold tracking-[-0.04em] text-balance motion-reduce:!transform-none motion-reduce:!opacity-100 sm:text-5xl md:text-6xl md:leading-[1.12]"
          >
            <span className="bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-700 bg-clip-text text-transparent dark:from-white dark:via-neutral-100 dark:to-neutral-400">
              Run Your Client{" "}
              <span className="text-foreground font-black underline decoration-blue-500/35 decoration-2 underline-offset-4 dark:text-white">
                Operations
              </span>
              ,{" "}
              <span className="text-foreground font-black underline decoration-violet-500/35 decoration-2 underline-offset-4 dark:text-white">
                Scheduling
              </span>
              , and{" "}
              <span className="text-foreground font-black underline decoration-emerald-500/35 decoration-2 underline-offset-4 dark:text-white">
                Billing
              </span>{" "}
              with{" "}
            </span>
            <span className="relative inline-block sm:whitespace-nowrap">
              <span className="text-shimmer bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text font-black text-transparent dark:from-white dark:via-blue-300 dark:to-cyan-300">
                Absolute Precision
              </span>
              {/* Precision Underline Light Beam with Ambient Core Pulse */}
              <span
                className="pointer-events-none absolute inset-x-0 -bottom-1.5 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent dark:via-cyan-400"
                aria-hidden="true"
              />
              <span
                className="pointer-events-none absolute -bottom-1.5 left-1/2 h-[4px] w-28 -translate-x-1/2 bg-blue-500/50 blur-[3px] dark:bg-cyan-400/60"
                aria-hidden="true"
              />
              {/* Luminous Center Spark */}
              <span
                className="pointer-events-none absolute -bottom-[3px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_2px_rgba(59,130,246,0.9)] dark:bg-cyan-200"
                aria-hidden="true"
              />
            </span>
          </motion.h1>
        </div>

        {/* 4. Supporting Value Proposition Copy */}
        <motion.p
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.5,
            delay: shouldReduceMotion ? 0 : 0.16,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="text-muted-foreground mt-5 max-w-2xl text-base leading-relaxed text-balance motion-reduce:!transform-none motion-reduce:!opacity-100 sm:text-lg md:text-xl"
        >
          FlowPilot unifies{" "}
          <strong className="text-foreground font-semibold">client relationships</strong>,{" "}
          <strong className="text-foreground font-semibold">booking schedules</strong>,{" "}
          <strong className="text-foreground font-semibold">team capacity</strong>, and{" "}
          <strong className="text-foreground font-semibold">automated invoicing</strong> into one
          structured platform—eliminating tool sprawl and administrative chaos.
        </motion.p>

        {/* 5. Dual Call to Action Buttons (Synchronized Master Obsidian Standard) */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.45,
            delay: shouldReduceMotion ? 0 : 0.24,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-7 flex w-full max-w-sm flex-col items-center justify-center gap-3 motion-reduce:!transform-none motion-reduce:!opacity-100 sm:max-w-none sm:flex-row md:mt-8"
        >
          {/* Flagship Master Obsidian CTA (Liquid Onyx Chassis with Cyan Status Beacon) */}
          <motion.div
            ref={heroCtaRef}
            onMouseMove={handleHeroCtaMouseMove}
            onMouseLeave={handleHeroCtaMouseLeave}
            style={{ x: springHeroCtaX, y: springHeroCtaY }}
            className="relative flex w-full shrink-0 justify-center sm:w-auto"
          >
            <Button
              size="lg"
              className="group relative h-12 min-h-[48px] w-full max-w-xs overflow-hidden rounded-full border border-neutral-700/80 bg-gradient-to-b from-neutral-800 via-neutral-900 to-black px-6 text-sm font-bold whitespace-nowrap text-white shadow-[0_6px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.25)] ring-1 ring-white/10 transition-all duration-300 hover:scale-[1.02] hover:border-cyan-500/60 hover:shadow-[0_0_32px_rgba(6,182,212,0.4)] active:scale-[0.98] sm:h-13 sm:min-h-[52px] sm:w-auto sm:max-w-none sm:px-7 dark:from-white dark:via-neutral-100 dark:to-neutral-200 dark:text-neutral-950 dark:shadow-[0_0_28px_rgba(255,255,255,0.3)] dark:ring-white/20"
              asChild
            >
              <Link href="/register" className="relative flex items-center justify-center gap-3">
                {/* Top Specular Edge Highlight */}
                <span className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-neutral-950/30" />

                {/* Internal Specular Ray Sweeper */}
                <span className="pointer-events-none absolute -inset-full w-[200%] -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full dark:via-neutral-950/15" />

                {/* Live Cyan Status Pulse Diamond */}
                <span className="relative flex h-2 w-2 items-center justify-center">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.9)]" />
                </span>

                <span>Get Started Free</span>

                {/* Signature Embedded Obsidian Arrow Capsule */}
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-white shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-600 dark:bg-neutral-300 dark:text-neutral-950 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Button>
          </motion.div>

          {/* Secondary CTA Button (VisionOS Frosted Glass with Live Demo Beacon) */}
          <Button
            size="lg"
            variant="outline"
            className="text-foreground relative h-12 min-h-[48px] w-full max-w-xs overflow-hidden rounded-full border-neutral-300/80 bg-white/85 px-5 text-sm font-semibold shadow-xs backdrop-blur-xl transition-all duration-200 hover:border-neutral-400 hover:bg-neutral-100/80 active:scale-[0.98] sm:h-13 sm:min-h-[52px] sm:w-auto sm:max-w-none sm:px-6 dark:border-white/15 dark:bg-white/[0.06] dark:hover:border-white/25 dark:hover:bg-white/[0.12]"
            asChild
          >
            <Link href="/dashboard" className="flex items-center justify-center gap-2.5">
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/20" />
              <Laptop className="text-muted-foreground h-4 w-4" />
              <span>Explore Live Workspace</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 uppercase dark:text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Demo
              </span>
            </Link>
          </Button>
        </motion.div>

        {/* 6. Unified Enterprise Architecture Trust & Telemetry Strip */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.45,
            delay: shouldReduceMotion ? 0 : 0.32,
          }}
          className="border-border/75 bg-surface/80 relative mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2.5 rounded-2xl border px-3.5 py-2.5 text-xs shadow-2xs backdrop-blur-xl transition-all duration-300 hover:border-neutral-300 hover:shadow-md motion-reduce:!opacity-100 sm:gap-x-5 sm:gap-y-2.5 sm:px-6 md:mt-7 dark:hover:border-neutral-700"
        >
          {/* Hairline Specular Top Highlight */}
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent dark:via-cyan-400/30" />

          {/* Overlapping Founder Avatars with Interactive Dossier Tooltips */}
          <div className="flex items-center gap-2.5">
            <div className="flex -space-x-1.5 py-0.5 sm:-space-x-2">
              {heroFounders.map((founder) => (
                <div className="group/avatar relative" key={founder.name}>
                  <div
                    className={cn(
                      "border-background relative h-7 w-7 overflow-hidden rounded-full border-2 shadow-sm transition-all duration-300 group-hover/avatar:z-30 group-hover/avatar:scale-125 group-hover/avatar:ring-2 sm:h-7.5 sm:w-7.5",
                      founder.accentGlow
                    )}
                  >
                    <Image
                      src={founder.image}
                      alt={`${founder.name}, ${founder.role}`}
                      width={30}
                      height={30}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {/* Tactile Founder Dossier Tooltip */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2.5 hidden -translate-x-1/2 flex-col items-center opacity-0 transition-all duration-200 group-hover/avatar:opacity-100 sm:group-hover/avatar:flex">
                    <div className="rounded-xl border border-neutral-800 bg-neutral-950/95 px-3 py-2 text-center whitespace-nowrap shadow-2xl backdrop-blur-xl">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                        <span className="text-[11px] font-bold text-white">{founder.name}</span>
                      </div>
                      <div className="text-[10px] font-medium text-neutral-400">{founder.role}</div>
                      <div className="mt-1 inline-flex items-center gap-1 rounded border border-neutral-700/60 bg-neutral-800/90 px-1.5 py-0.5 font-mono text-[9px] text-cyan-400">
                        ⚡ {founder.metric}
                      </div>
                    </div>
                    <div className="-mt-1 h-2 w-2 rotate-45 border-r border-b border-neutral-800 bg-neutral-950/95" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              </span>
              <span className="text-muted-foreground text-xs font-medium">
                Trusted by{" "}
                <strong className="text-foreground font-semibold">800+ Agency Founders</strong>
              </span>
            </div>
          </div>

          <div className="text-border hidden md:inline">&bull;</div>

          {/* Hard Architectural Telemetry Badges with Responsive Micro-Pill Hover */}
          <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1.5 text-[11px] font-medium sm:gap-x-2 sm:text-xs">
            <span className="group/badge text-foreground inline-flex cursor-default items-center gap-1 rounded-lg border border-transparent px-1.5 py-0.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/30 hover:bg-blue-500/10 hover:shadow-xs sm:gap-1.5 sm:px-2">
              <Lock className="h-3 w-3 text-blue-500 transition-transform duration-200 group-hover/badge:scale-110 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">Organization-Scoped Workspace Data</span>
              <span className="sm:hidden">Tenant Scoped Data</span>
            </span>
            <span className="text-border hidden lg:inline">&bull;</span>
            <span className="group/badge text-foreground inline-flex cursor-default items-center gap-1 rounded-lg border border-transparent px-1.5 py-0.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:shadow-xs sm:gap-1.5 sm:px-2">
              <Clock className="h-3 w-3 text-emerald-500 transition-transform duration-200 group-hover/badge:scale-110 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">Automated Buffer Logic</span>
              <span className="sm:hidden">Auto Buffer Logic</span>
            </span>
            <span className="text-border hidden lg:inline">&bull;</span>
            <span className="group/badge text-foreground inline-flex cursor-default items-center gap-1 rounded-lg border border-transparent px-1.5 py-0.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:shadow-xs sm:gap-1.5 sm:px-2">
              <CheckCircle2 className="h-3 w-3 text-indigo-500 transition-transform duration-200 group-hover/badge:scale-110 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">One-Click Invoicing</span>
              <span className="sm:hidden">1-Click Invoicing</span>
            </span>
            <span className="text-border hidden sm:inline">&bull;</span>
            <span className="group/badge text-muted-foreground hover:text-foreground inline-flex cursor-default items-center gap-1 rounded-lg border border-transparent px-1.5 py-0.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:shadow-xs sm:gap-1.5 sm:px-2">
              <ShieldCheck className="h-3 w-3 text-emerald-600 transition-transform duration-200 group-hover/badge:scale-110 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">Zero Credit Card Required</span>
              <span className="sm:hidden">No Card Required</span>
            </span>
          </div>
        </motion.div>

        {/* 7. Interactive Cockpit Mode Lens Selector (Chromatic Segmented Control) */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.45,
            delay: shouldReduceMotion ? 0 : 0.38,
          }}
          className="border-border/75 bg-muted/60 relative mt-7 mb-2 inline-flex max-w-full items-center gap-0.5 rounded-xl border p-1 shadow-2xs backdrop-blur-md motion-reduce:!opacity-100 sm:gap-1 md:mt-8"
          role="tablist"
          aria-label="Cockpit perspective mode"
          onKeyDown={handleTabKeyDown}
        >
          <button
            type="button"
            role="tab"
            id="hero-lens-tab-overview"
            tabIndex={cockpitView === "overview" ? 0 : -1}
            aria-selected={cockpitView === "overview"}
            aria-controls="hero-cockpit-viewport"
            onClick={() => setCockpitView("overview")}
            className={`relative inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors duration-200 sm:gap-1.5 sm:px-3.5 sm:text-xs ${
              cockpitView === "overview"
                ? "text-primary font-semibold dark:text-blue-400"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cockpitView === "overview" && (
              <motion.div
                layoutId="hero-cockpit-lens-pill"
                className="bg-background border-border/80 absolute inset-0 rounded-lg border shadow-xs"
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 450, damping: 30 }
                }
              />
            )}
            <LayoutDashboard className="relative z-10 h-3.5 w-3.5 text-blue-500" />
            <span className="relative z-10 hidden sm:inline">Command Center</span>
            <span className="relative z-10 sm:hidden">Command</span>
          </button>
          <button
            type="button"
            role="tab"
            id="hero-lens-tab-workflow"
            tabIndex={cockpitView === "workflow" ? 0 : -1}
            aria-selected={cockpitView === "workflow"}
            aria-controls="hero-cockpit-viewport"
            onClick={() => setCockpitView("workflow")}
            className={`relative inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors duration-200 sm:gap-1.5 sm:px-3.5 sm:text-xs ${
              cockpitView === "workflow"
                ? "text-primary font-semibold dark:text-violet-400"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cockpitView === "workflow" && (
              <motion.div
                layoutId="hero-cockpit-lens-pill"
                className="bg-background border-border/80 absolute inset-0 rounded-lg border shadow-xs"
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 450, damping: 30 }
                }
              />
            )}
            <Activity className="relative z-10 h-3.5 w-3.5 text-violet-500" />
            <span className="relative z-10 hidden sm:inline">Workflow Engine</span>
            <span className="relative z-10 sm:hidden">Workflow</span>
          </button>
          <button
            type="button"
            role="tab"
            id="hero-lens-tab-financials"
            tabIndex={cockpitView === "financials" ? 0 : -1}
            aria-selected={cockpitView === "financials"}
            aria-controls="hero-cockpit-viewport"
            onClick={() => setCockpitView("financials")}
            className={`relative inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors duration-200 sm:gap-1.5 sm:px-3.5 sm:text-xs ${
              cockpitView === "financials"
                ? "text-primary font-semibold dark:text-emerald-400"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cockpitView === "financials" && (
              <motion.div
                layoutId="hero-cockpit-lens-pill"
                className="bg-background border-border/80 absolute inset-0 rounded-lg border shadow-xs"
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 450, damping: 30 }
                }
              />
            )}
            <DollarSign className="relative z-10 h-3.5 w-3.5 text-emerald-500" />
            <span className="relative z-10 hidden sm:inline">Financial Velocity</span>
            <span className="relative z-10 sm:hidden">Financials</span>
          </button>
        </motion.div>

        {/* 8. The 3D Spatial Gyroscopic Cockpit with Balanced Floating Z-Cards */}
        <motion.div
          style={{
            scale: shouldReduceMotion ? 1 : springScrollCockpitScale,
            opacity: shouldReduceMotion ? 1 : springScrollCockpitOpacity,
            y: shouldReduceMotion ? 0 : springScrollCockpitY,
          }}
          className="flex w-full justify-center"
        >
          <motion.div
            ref={cockpitRef}
            id="hero-cockpit-viewport"
            role="region"
            aria-labelledby={`hero-lens-tab-${cockpitView}`}
            onMouseMove={handleCockpitMouseMove}
            onMouseLeave={handleCockpitMouseLeave}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.7,
              delay: shouldReduceMotion ? 0 : 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="perspective-1400 relative mt-4 w-full max-w-5xl motion-reduce:!transform-none motion-reduce:!opacity-100 md:mt-6 2xl:max-w-6xl"
          >
            {/* Subtle Atmospheric Aurora Depth behind Window */}
            <div
              className="from-primary/15 via-primary/5 pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b to-transparent opacity-70 blur-3xl sm:-inset-6"
              aria-hidden="true"
            />

            {/* 3D Isometric Viewport Container with Hardware Specular Materials */}
            <motion.div
              style={{
                rotateX: springCockpitRotateX,
                rotateY: springCockpitRotateY,
                transformStyle: "preserve-3d",
              }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="preserve-3d relative transition-shadow duration-500"
            >
              {/* Floating Informational Card 1 (Top-Left: Adaptive Lens Metric with Z-Depth & Reactive Parallax) */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: shouldReduceMotion ? 0 : [0, -6, 0] }}
                transition={{
                  opacity: { duration: 0.45, delay: shouldReduceMotion ? 0 : 0.5 },
                  y: { duration: 5, repeat: shouldReduceMotion ? 0 : Infinity, ease: "easeInOut" },
                }}
                style={{ transform: "translateZ(50px)", x: card1ParallaxX, y: card1ParallaxY }}
                className="border-border/90 bg-surface/95 text-foreground pointer-events-none absolute top-3 left-3 z-30 hidden w-64 overflow-hidden rounded-2xl border p-4 text-left shadow-[0_25px_60px_-12px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:block md:w-72 xl:-top-6 xl:-left-6 dark:border-white/10 dark:bg-[#0c1222]/95"
              >
                {/* Hairline Specular Top Edge Light */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />

                <AnimatePresence mode="wait">
                  {cockpitView === "overview" && (
                    <motion.div
                      key="widget-calendar"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7.5 w-7.5 items-center justify-center rounded-xl border border-blue-500/25 bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <span className="text-foreground text-xs font-semibold">
                            8 Scheduled Today
                          </span>
                        </div>
                        <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                      </div>

                      <div className="border-border/50 mt-3 space-y-1.5 border-t pt-2.5 text-[11px]">
                        <div className="bg-muted/60 flex items-center justify-between rounded-lg px-2.5 py-1.5">
                          <div className="flex items-center gap-1.5">
                            <Video className="text-primary h-3.5 w-3.5" />
                            <span className="text-foreground font-medium">Acme Strategy Call</span>
                          </div>
                          <span className="text-primary font-mono font-semibold">10:30 AM</span>
                        </div>
                        <div className="text-muted-foreground flex items-center justify-between text-[10px]">
                          <span>Buffer Protection</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            +15m Locked
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {cockpitView === "workflow" && (
                    <motion.div
                      key="widget-buffer"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7.5 w-7.5 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
                            <Zap className="h-4 w-4" />
                          </div>
                          <span className="text-foreground text-xs font-semibold">
                            Buffer Engine
                          </span>
                        </div>
                        <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Active
                        </span>
                      </div>

                      <div className="border-border/50 mt-3 border-t pt-2.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Collision Guard</span>
                          <span className="text-foreground font-medium">+15m between sessions</span>
                        </div>
                        <p className="text-muted-foreground mt-1 text-[10px]">
                          Zero calendar overlaps across 6 consultants
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {cockpitView === "financials" && (
                    <motion.div
                      key="widget-mrr"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7.5 w-7.5 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                              Monthly Retainers
                            </p>
                            <p className="text-foreground text-sm font-bold">
                              <AnimatedCounter target={48250} prefix="$" decimals={2} />
                            </p>
                          </div>
                        </div>
                        <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          +24%
                        </span>
                      </div>

                      <div className="border-border/50 text-muted-foreground mt-3 flex items-center justify-between border-t pt-2 text-[10px]">
                        <span>18 Active Retainers</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          0 Overdue
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Floating Informational Card 2 (Bottom-Right: Automated Settlement with Z-Depth & Reactive Parallax) */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: shouldReduceMotion ? 0 : [0, 6, 0] }}
                transition={{
                  opacity: { duration: 0.45, delay: shouldReduceMotion ? 0 : 0.55 },
                  y: { duration: 6, repeat: shouldReduceMotion ? 0 : Infinity, ease: "easeInOut" },
                }}
                style={{ transform: "translateZ(60px)", x: card2ParallaxX, y: card2ParallaxY }}
                className="border-border/90 bg-surface/95 text-foreground pointer-events-none absolute right-3 bottom-3 z-30 hidden w-64 overflow-hidden rounded-2xl border p-4 text-left shadow-[0_25px_60px_-12px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:block md:w-74 xl:-right-6 xl:-bottom-6 dark:border-white/10 dark:bg-[#0c1222]/95"
              >
                {/* Hairline Specular Top Edge Light */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7.5 w-7.5 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                      <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                        Invoice Settled
                      </p>
                      <p className="text-foreground text-sm font-bold">$3,780.00 USD</p>
                    </div>
                  </div>
                  <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-600 uppercase dark:text-emerald-400">
                    Paid
                  </span>
                </div>

                <div className="border-border/50 text-muted-foreground mt-3 flex items-center justify-between border-t pt-2 text-[10px]">
                  <span>Horizon Media &bull; Retainer Q4</span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3 w-3" /> Auto-reconciled
                  </span>
                </div>
              </motion.div>

              {/* Floating Informational Card 3 (Bottom-Left: Team Utilization Meter with Z-Depth & Reactive Parallax) */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: shouldReduceMotion ? 0 : [0, -4, 0] }}
                transition={{
                  opacity: { duration: 0.45, delay: shouldReduceMotion ? 0 : 0.6 },
                  y: {
                    duration: 5.5,
                    repeat: shouldReduceMotion ? 0 : Infinity,
                    ease: "easeInOut",
                  },
                }}
                style={{ transform: "translateZ(45px)", x: card3ParallaxX, y: card3ParallaxY }}
                className="border-border/90 bg-surface/95 text-foreground pointer-events-none absolute -bottom-5 left-10 z-20 hidden w-64 overflow-hidden rounded-2xl border p-4 text-left shadow-[0_25px_60px_-12px_rgba(0,0,0,0.28)] backdrop-blur-2xl xl:block dark:border-white/10 dark:bg-[#0c1222]/95"
              >
                {/* Hairline Specular Top Edge Light */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-amber-500/25 bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                      <Users className="h-3.5 w-3.5" />
                    </div>
                    <span>Team Utilization</span>
                  </div>
                  <span className="text-foreground font-mono font-semibold">84%</span>
                </div>
                {/* Dynamic Progress Meter */}
                <div className="bg-muted mt-2.5 h-1.5 w-full overflow-hidden rounded-full">
                  <div className="h-full w-[84%] rounded-full bg-emerald-500" />
                </div>
                <div className="text-muted-foreground mt-2 flex items-center justify-between text-[10px]">
                  <span>5 of 6 booked</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    1 Lead Ready
                  </span>
                </div>
              </motion.div>

              {/* Main macOS Hardware Frame with Calm Specular Bevel */}
              <div className="group/window border-border/80 bg-card relative overflow-hidden rounded-3xl border shadow-[0_30px_90px_-20px_rgba(0,0,0,0.35)] transition-shadow duration-300 dark:border-neutral-800 dark:shadow-[0_30px_90px_-20px_rgba(0,0,0,0.7)]">
                {/* Static Specular Top Horizon Rim */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/35" />
                <div className="pointer-events-none absolute inset-x-12 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent blur-[0.5px] dark:via-cyan-400/50" />

                {/* macOS Frosted Glass Window Header Bar */}
                <div className="border-border/80 bg-muted/60 flex items-center justify-between border-b px-4.5 py-3 backdrop-blur-xl">
                  {/* Traffic Light Glass Dots */}
                  <div className="flex items-center gap-2">
                    <span className="relative h-3 w-3 overflow-hidden rounded-full border border-rose-600/40 bg-rose-500/90 shadow-2xs">
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-white/40" />
                    </span>
                    <span className="relative h-3 w-3 overflow-hidden rounded-full border border-amber-500/40 bg-amber-400/90 shadow-2xs">
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-white/40" />
                    </span>
                    <span className="relative h-3 w-3 overflow-hidden rounded-full border border-emerald-600/40 bg-emerald-500/90 shadow-2xs">
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-white/40" />
                    </span>
                  </div>

                  {/* Secure Workspace Domain Pill */}
                  <div className="border-border/70 bg-background/95 text-muted-foreground flex max-w-[190px] items-center gap-2 rounded-lg border px-3 py-1 font-mono text-xs shadow-2xs sm:max-w-none sm:px-3.5">
                    <Lock className="h-3 w-3 shrink-0 text-emerald-500" />
                    <span className="text-foreground/80 truncate text-[11px] font-medium sm:text-xs">
                      app.flowpilot.io/workspace/acme-agency
                    </span>
                  </div>

                  {/* Live Workspace Status */}
                  <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-foreground/80 hidden sm:inline">Workspace Active</span>
                  </div>
                </div>

                {/* High-Density Native Application Cockpit Viewport */}
                <div className="bg-background/80 relative min-h-[440px] w-full p-3.5 text-left sm:min-h-[460px] sm:p-6">
                  {/* Lens 1: Command Center (Interactive Operations Canvas) */}
                  {cockpitView === "overview" && (
                    <motion.div
                      key="cockpit-lens-overview"
                      initial={{ opacity: 0, scale: 0.99 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.99 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      {/* Top KPI Ribbon */}
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                        <div className="border-border/70 bg-surface/90 rounded-xl border p-2.5 shadow-2xs backdrop-blur-md sm:p-3">
                          <div className="text-muted-foreground flex items-center justify-between text-[9.5px] font-bold tracking-wider uppercase sm:text-[10px]">
                            <span className="truncate">Today&apos;s Sessions</span>
                            <Calendar className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                          </div>
                          <p className="text-foreground mt-1 truncate text-base font-bold sm:text-lg">
                            8 Appointments
                          </p>
                          <span className="block truncate text-[9.5px] font-medium text-emerald-600 sm:text-[10px] dark:text-emerald-400">
                            +15m Buffers Active
                          </span>
                        </div>
                        <div className="border-border/70 bg-surface/90 rounded-xl border p-2.5 shadow-2xs backdrop-blur-md sm:p-3">
                          <div className="text-muted-foreground flex items-center justify-between text-[9.5px] font-bold tracking-wider uppercase sm:text-[10px]">
                            <span className="truncate">Active Client CRM</span>
                            <Users className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                          </div>
                          <p className="text-foreground mt-1 truncate text-base font-bold sm:text-lg">
                            142 Retainers
                          </p>
                          <span className="block truncate text-[9.5px] font-medium text-emerald-600 sm:text-[10px] dark:text-emerald-400">
                            98.4% Retention
                          </span>
                        </div>
                        <div className="border-border/70 bg-surface/90 rounded-xl border p-2.5 shadow-2xs backdrop-blur-md sm:p-3">
                          <div className="text-muted-foreground flex items-center justify-between text-[9.5px] font-bold tracking-wider uppercase sm:text-[10px]">
                            <span className="truncate">Billing Velocity</span>
                            <DollarSign className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          </div>
                          <p className="text-foreground mt-1 truncate text-base font-bold sm:text-lg">
                            <AnimatedCounter target={48250} prefix="$" decimals={2} />
                          </p>
                          <span className="block truncate text-[9.5px] font-medium text-emerald-600 sm:text-[10px] dark:text-emerald-400">
                            +24% vs Prev Mo
                          </span>
                        </div>
                        <div className="border-border/70 bg-surface/90 rounded-xl border p-2.5 shadow-2xs backdrop-blur-md sm:p-3">
                          <div className="text-muted-foreground flex items-center justify-between text-[9.5px] font-bold tracking-wider uppercase sm:text-[10px]">
                            <span className="truncate">Tenant Scoping</span>
                            <Lock className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                          </div>
                          <p className="text-foreground mt-1 truncate text-base font-bold sm:text-lg">
                            100% Isolated
                          </p>
                          <span className="block truncate text-[9.5px] font-medium text-blue-600 sm:text-[10px] dark:text-blue-400">
                            Multi-Tenant Guard
                          </span>
                        </div>
                      </div>

                      {/* Split Operations Workspace Grid */}
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                        {/* Left: Interactive Schedule Timeline with Visualized Buffer Engine */}
                        <div className="border-border/70 bg-surface/90 rounded-2xl border p-4 shadow-xs backdrop-blur-md lg:col-span-7">
                          <div className="border-border/50 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <Clock className="text-primary h-4 w-4 shrink-0" />
                              <h4 className="text-foreground truncate text-xs font-bold">
                                <span className="hidden sm:inline">
                                  Live Schedule Timeline &bull; Thursday, Nov 16
                                </span>
                                <span className="sm:hidden">Schedule Timeline &bull; Nov 16</span>
                              </h4>
                            </div>
                            <span className="shrink-0 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                              Sync: 0 Conflicts
                            </span>
                          </div>

                          {/* Timeline Session 1 */}
                          <div className="mt-3 space-y-2">
                            <div className="border-border/60 bg-muted/40 hover:bg-muted/70 flex flex-col justify-between gap-2 rounded-xl border p-2.5 transition-colors sm:flex-row sm:items-center sm:p-3">
                              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                                <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 font-mono text-xs font-bold text-blue-600 sm:h-8 sm:w-8 dark:text-blue-400">
                                  09:00
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-foreground truncate text-xs font-semibold">
                                    Acme Corp Strategy Kickoff
                                  </p>
                                  <p className="text-muted-foreground truncate text-[11px]">
                                    Sarah Jenkins &bull; 60m Executive Session
                                  </p>
                                </div>
                              </div>
                              <span className="shrink-0 self-start rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600 sm:self-auto dark:text-blue-400">
                                Zoom Confirmed
                              </span>
                            </div>

                            {/* Visualized Calendar Buffer Logic Guard */}
                            <div className="flex items-center justify-between gap-1.5 overflow-hidden rounded-lg border border-dashed border-emerald-500/30 bg-emerald-500/[0.06] px-2 py-1.5 text-[10px] text-emerald-700 sm:px-3 dark:text-emerald-400">
                              <div className="flex min-w-0 items-center gap-1.5 font-semibold">
                                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                <span className="hidden truncate sm:inline">
                                  +15m Protected Auto-Buffer
                                </span>
                                <span className="truncate sm:hidden">+15m Buffer Guard</span>
                              </div>
                              <span className="text-muted-foreground shrink-0 font-mono text-[9px]">
                                <span className="hidden sm:inline">Prevents Collisions</span>
                                <span className="sm:hidden">Auto-Guard</span>
                              </span>
                            </div>

                            {/* Timeline Session 2 */}
                            <div className="border-border/60 bg-muted/40 hover:bg-muted/70 flex flex-col justify-between gap-2 rounded-xl border p-2.5 transition-colors sm:flex-row sm:items-center sm:p-3">
                              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                                <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 font-mono text-xs font-bold text-violet-600 sm:h-8 sm:w-8 dark:text-violet-400">
                                  10:30
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-foreground truncate text-xs font-semibold">
                                    Meridian Tech Architecture Review
                                  </p>
                                  <p className="text-muted-foreground truncate text-[11px]">
                                    Marcus Vance &bull; 60m Technical Consulting
                                  </p>
                                </div>
                              </div>
                              <span className="shrink-0 self-start rounded-md bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-600 sm:self-auto dark:text-violet-400">
                                In-Person
                              </span>
                            </div>

                            {/* Visualized Calendar Buffer Logic Guard 2 */}
                            <div className="flex items-center justify-between gap-1.5 overflow-hidden rounded-lg border border-dashed border-emerald-500/30 bg-emerald-500/[0.06] px-2 py-1.5 text-[10px] text-emerald-700 sm:px-3 dark:text-emerald-400">
                              <div className="flex min-w-0 items-center gap-1.5 font-semibold">
                                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                <span className="hidden truncate sm:inline">
                                  +15m Protected Auto-Buffer
                                </span>
                                <span className="truncate sm:hidden">+15m Buffer Guard</span>
                              </div>
                              <span className="text-muted-foreground shrink-0 font-mono text-[9px]">
                                <span className="hidden sm:inline">Next Slot: 01:00 PM</span>
                                <span className="sm:hidden">Next: 01:00 PM</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Client Dossier Spotlight & Live Audit Stream */}
                        <div className="space-y-3 lg:col-span-5">
                          {/* Client Dossier Card */}
                          <div className="border-border/70 bg-surface/90 rounded-2xl border p-4 shadow-xs backdrop-blur-md">
                            <div className="border-border/50 flex items-center justify-between border-b pb-2.5">
                              <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                                Client CRM Dossier
                              </span>
                              <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                Active Tier
                              </span>
                            </div>
                            <div className="mt-2.5 flex items-center gap-2.5 sm:gap-3">
                              <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-xs font-bold text-blue-600 sm:h-9 sm:w-9 dark:text-blue-400">
                                SJ
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-foreground truncate text-xs font-bold">
                                  Sarah Jenkins
                                </p>
                                <p className="text-muted-foreground truncate text-[11px]">
                                  Apex Dynamics &bull; Enterprise Retainer ($4.5k/mo)
                                </p>
                              </div>
                            </div>
                            <div className="border-border/40 mt-3 grid grid-cols-2 gap-2 border-t pt-2 text-[10px]">
                              <div>
                                <span className="text-muted-foreground">Last Invoice:</span>
                                <p className="text-foreground font-semibold">#FP-1094 (Paid)</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Next Session:</span>
                                <p className="text-foreground font-semibold">Tomorrow, 10:00 AM</p>
                              </div>
                            </div>
                          </div>

                          {/* Live Audit & Telemetry Stream */}
                          <div className="border-border/70 bg-surface/90 rounded-2xl border p-4 shadow-xs backdrop-blur-md">
                            <div className="border-border/50 flex items-center justify-between border-b pb-2">
                              <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                                Real-Time Activity Stream
                              </span>
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                            </div>
                            <div className="mt-2.5 space-y-2 text-[11px]">
                              <div className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                <p className="text-muted-foreground leading-tight">
                                  <strong className="text-foreground">Invoice #FP-1094</strong>{" "}
                                  auto-reconciled via Stripe ($4,500.00).
                                </p>
                              </div>
                              <div className="flex items-start gap-2">
                                <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                                <p className="text-muted-foreground leading-tight">
                                  Calendar buffer automatically applied (+15m locked).
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Lens 2: Workflow Engine (Visual Automation Pipeline) */}
                  {cockpitView === "workflow" && (
                    <motion.div
                      key="cockpit-lens-workflow"
                      initial={{ opacity: 0, scale: 0.99 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.99 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      <div className="border-border/70 bg-surface/90 rounded-2xl border p-5 shadow-xs backdrop-blur-md">
                        <div className="border-border/50 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                          <div>
                            <h4 className="text-foreground text-sm font-bold">
                              End-to-End Operational Automation Flow
                            </h4>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                              From customer booking to automated invoice settlement in under 2
                              seconds.
                            </p>
                          </div>
                          <span className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400">
                            Active &bull; 0 Conflicts
                          </span>
                        </div>

                        {/* Visual Automation Pipeline Nodes */}
                        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
                          {/* Step 1 */}
                          <div className="rounded-xl border border-blue-500/30 bg-blue-500/[0.06] p-3.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="rounded-md bg-blue-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-blue-600 dark:text-blue-400">
                                STEP 1
                              </span>
                              <Calendar className="h-4 w-4 text-blue-500" />
                            </div>
                            <h5 className="text-foreground mt-2 text-xs font-bold">
                              Client Booking
                            </h5>
                            <p className="text-muted-foreground mt-1 text-[11px] leading-tight">
                              Client selects 60m session via self-serve link.
                            </p>
                          </div>

                          {/* Step 2 */}
                          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-3.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                STEP 2
                              </span>
                              <ShieldCheck className="h-4 w-4 text-emerald-500" />
                            </div>
                            <h5 className="text-foreground mt-2 text-xs font-bold">
                              Buffer Protection
                            </h5>
                            <p className="text-muted-foreground mt-1 text-[11px] leading-tight">
                              Locks +15m before &amp; after to eliminate collisions.
                            </p>
                          </div>

                          {/* Step 3 */}
                          <div className="rounded-xl border border-violet-500/30 bg-violet-500/[0.06] p-3.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="rounded-md bg-violet-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-violet-600 dark:text-violet-400">
                                STEP 3
                              </span>
                              <Users className="h-4 w-4 text-violet-500" />
                            </div>
                            <h5 className="text-foreground mt-2 text-xs font-bold">
                              CRM Context Sync
                            </h5>
                            <p className="text-muted-foreground mt-1 text-[11px] leading-tight">
                              Injects client dossier history &amp; service tiers.
                            </p>
                          </div>

                          {/* Step 4 */}
                          <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-3.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-600 dark:text-amber-400">
                                STEP 4
                              </span>
                              <DollarSign className="h-4 w-4 text-amber-500" />
                            </div>
                            <h5 className="text-foreground mt-2 text-xs font-bold">
                              Instant Invoicing
                            </h5>
                            <p className="text-muted-foreground mt-1 text-[11px] leading-tight">
                              Generates invoice &amp; reconciles via Stripe in 1.2s.
                            </p>
                          </div>
                        </div>

                        {/* Performance Bar */}
                        <div className="border-border/50 bg-muted/40 mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-xs">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 shrink-0 text-emerald-500" />
                            <span className="text-foreground font-semibold">
                              124 Automated Pipeline Runs Completed Today
                            </span>
                          </div>
                          <span className="text-muted-foreground font-mono text-[11px]">
                            Average execution: 1.2s &bull; 0 manual interventions
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Lens 3: Financial Velocity (Billing & Real-Time Cash Flow) */}
                  {cockpitView === "financials" && (
                    <motion.div
                      key="cockpit-lens-financials"
                      initial={{ opacity: 0, scale: 0.99 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.99 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      {/* Top Metric Cards */}
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                        <div className="border-border/70 bg-surface/90 rounded-xl border p-2.5 shadow-xs backdrop-blur-md sm:p-3.5">
                          <p className="text-muted-foreground truncate text-[9.5px] font-bold tracking-wider uppercase sm:text-[10px]">
                            MTD Billing
                          </p>
                          <p className="text-foreground mt-1 truncate text-base font-bold sm:text-xl">
                            <AnimatedCounter target={48250} prefix="$" decimals={2} />
                          </p>
                          <span className="block truncate text-[9.5px] font-semibold text-emerald-600 sm:text-[10px] dark:text-emerald-400">
                            +24% vs Prev Mo
                          </span>
                        </div>
                        <div className="border-border/70 bg-surface/90 rounded-xl border p-2.5 shadow-xs backdrop-blur-md sm:p-3.5">
                          <p className="text-muted-foreground truncate text-[9.5px] font-bold tracking-wider uppercase sm:text-[10px]">
                            Billable Ratio
                          </p>
                          <p className="text-foreground mt-1 truncate text-base font-bold sm:text-xl">
                            <AnimatedCounter target={92.4} suffix="%" decimals={1} />
                          </p>
                          <span className="text-muted-foreground block truncate text-[9.5px] font-medium sm:text-[10px]">
                            Target: 85%
                          </span>
                        </div>
                        <div className="border-border/70 bg-surface/90 rounded-xl border p-2.5 shadow-xs backdrop-blur-md sm:p-3.5">
                          <p className="text-muted-foreground truncate text-[9.5px] font-bold tracking-wider uppercase sm:text-[10px]">
                            Avg Booking Lead
                          </p>
                          <p className="text-foreground mt-1 truncate text-base font-bold sm:text-xl">
                            1.8 Days
                          </p>
                          <span className="block truncate text-[9.5px] font-semibold text-emerald-600 sm:text-[10px] dark:text-emerald-400">
                            Zero Idle Gaps
                          </span>
                        </div>
                        <div className="border-border/70 bg-surface/90 rounded-xl border p-2.5 shadow-xs backdrop-blur-md sm:p-3.5">
                          <p className="text-muted-foreground truncate text-[9.5px] font-bold tracking-wider uppercase sm:text-[10px]">
                            Payout Velocity
                          </p>
                          <p className="text-foreground mt-1 truncate text-base font-bold sm:text-xl">
                            Instant
                          </p>
                          <span className="block truncate text-[9.5px] font-semibold text-emerald-600 sm:text-[10px] dark:text-emerald-400">
                            Stripe Connected
                          </span>
                        </div>
                      </div>

                      {/* Interactive SVG Sparkline Revenue Velocity Graph */}
                      <div className="border-border/70 bg-surface/90 rounded-2xl border p-4 shadow-xs backdrop-blur-md">
                        <div className="border-border/50 flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
                          <div className="flex min-w-0 items-center gap-2">
                            <TrendingUp className="h-4 w-4 shrink-0 text-emerald-500" />
                            <h4 className="text-foreground truncate text-xs font-bold">
                              <span className="hidden sm:inline">
                                Monthly Recurring Revenue (MRR) Velocity
                              </span>
                              <span className="sm:hidden">MRR Revenue Velocity</span>
                            </h4>
                          </div>
                          <span className="shrink-0 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Live Ledger Synchronized
                          </span>
                        </div>

                        {/* High-Fidelity SVG Curve Chart */}
                        <div className="relative mt-3 h-28 w-full overflow-hidden">
                          <svg
                            className="h-full w-full"
                            viewBox="0 0 600 100"
                            preserveAspectRatio="none"
                          >
                            <defs>
                              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            {/* Grid Lines */}
                            <line
                              x1="0"
                              y1="25"
                              x2="600"
                              y2="25"
                              stroke="currentColor"
                              strokeOpacity="0.08"
                              strokeDasharray="3 3"
                            />
                            <line
                              x1="0"
                              y1="50"
                              x2="600"
                              y2="50"
                              stroke="currentColor"
                              strokeOpacity="0.08"
                              strokeDasharray="3 3"
                            />
                            <line
                              x1="0"
                              y1="75"
                              x2="600"
                              y2="75"
                              stroke="currentColor"
                              strokeOpacity="0.08"
                              strokeDasharray="3 3"
                            />

                            {/* Area Fill */}
                            <polygon
                              points="0,95 60,82 120,75 180,68 240,54 300,58 360,42 420,38 480,24 540,18 600,8 600,100 0,100"
                              fill="url(#revenueGradient)"
                            />
                            {/* Glowing Line */}
                            <polyline
                              points="0,95 60,82 120,75 180,68 240,54 300,58 360,42 420,38 480,24 540,18 600,8"
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>

                        {/* Recent Settled Ledger Rows */}
                        <div className="border-border/50 mt-3 space-y-1.5 border-t pt-2.5 text-xs">
                          <div className="bg-muted/40 flex flex-col justify-between gap-1 rounded-lg px-2.5 py-1.5 sm:flex-row sm:items-center sm:gap-2 sm:px-3">
                            <span className="text-foreground truncate text-[11px] font-medium sm:text-xs">
                              #FP-1094 &bull; Vertex Advisory Retainer
                            </span>
                            <span className="shrink-0 font-mono text-[11px] font-bold text-emerald-600 sm:text-xs dark:text-emerald-400">
                              +$4,500.00 (Paid)
                            </span>
                          </div>
                          <div className="bg-muted/40 flex flex-col justify-between gap-1 rounded-lg px-2.5 py-1.5 sm:flex-row sm:items-center sm:gap-2 sm:px-3">
                            <span className="text-foreground truncate text-[11px] font-medium sm:text-xs">
                              #FP-1093 &bull; Kinetic Ops Consulting
                            </span>
                            <span className="shrink-0 font-mono text-[11px] font-bold text-emerald-600 sm:text-xs dark:text-emerald-400">
                              +$2,850.00 (Paid)
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* 9. Enterprise Social Proof & High-Prestige Client Logo Strip (3D Frosted Glass Chassis) */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.6,
            delay: shouldReduceMotion ? 0 : 0.65,
          }}
          className="border-border/40 relative z-20 mt-16 border-t pt-10 text-center motion-reduce:!transform-none motion-reduce:!opacity-100 sm:mt-24 sm:pt-14"
        >
          {/* Laser Top Rim Accent */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent dark:via-cyan-400/30" />

          {/* Subtle Ambient Radial Glow behind the logo marquee */}
          <div
            className="pointer-events-none absolute top-0 left-1/2 h-28 w-3/4 max-w-3xl -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500/0 via-cyan-500/10 to-indigo-500/0 blur-3xl dark:via-cyan-500/15"
            aria-hidden="true"
          />

          {/* Editorial Trust Eyebrow Pill - Responsive Text Wrapping */}
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-neutral-200/80 bg-white/75 px-3 py-1 text-[10px] font-semibold text-neutral-600 shadow-2xs backdrop-blur-xl sm:text-[11px] dark:border-neutral-800/80 dark:bg-neutral-900/70 dark:text-neutral-400">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
            </span>
            <span className="tracking-wider uppercase sm:tracking-widest">
              <span className="hidden sm:inline">
                Engineered for high-output digital agencies, consultancies &amp; service teams
              </span>
              <span className="sm:hidden">Engineered for High-Output Agencies</span>
            </span>
          </div>

          {/* 3D Interactive Frosted Glass Logo Grid - Responsive 2-Col on Mobile, Balanced Flex on Desktop */}
          <div className="mx-auto mt-6 grid w-full max-w-5xl grid-cols-2 gap-2 px-1 sm:mt-8 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-4 sm:px-0 md:gap-5">
            {enterprisePartners.map((partner) => (
              <div
                key={partner.name}
                className={cn(
                  "group/logo relative flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-200/80 bg-white/70 p-2 shadow-xs backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white sm:gap-2.5 sm:rounded-2xl sm:px-4 sm:py-2.5 dark:border-neutral-800/80 dark:bg-neutral-900/60 dark:hover:bg-neutral-900/90",
                  partner.hoverBorder
                )}
                aria-label={`${partner.name} ${partner.suffix}`}
              >
                {/* Micro Brand Icon Pod with Illumination */}
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-neutral-200/70 bg-neutral-100/80 text-neutral-600 transition-all duration-300 sm:h-8 sm:w-8 sm:rounded-xl dark:border-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-300",
                    partner.iconBg
                  )}
                >
                  {partner.icon}
                </div>

                {/* Brand Name Typography & Micro Metrics */}
                <div className="flex min-w-0 flex-col text-left">
                  <span className="text-foreground/85 group-hover/logo:text-foreground truncate font-sans text-[11px] font-bold tracking-wider uppercase transition-colors sm:text-sm sm:text-xs">
                    {partner.name}
                    <span className="text-muted-foreground ml-1 text-[9px] font-medium tracking-normal lowercase sm:text-[10px]">
                      {partner.suffix}
                    </span>
                  </span>
                  {/* Verified Sub-Metric Badge on hover */}
                  <span className="truncate font-mono text-[8.5px] font-medium text-neutral-400 transition-colors group-hover/logo:text-cyan-600 sm:text-[9.5px] dark:text-neutral-500 dark:group-hover/logo:text-cyan-400">
                    {partner.metric}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
};
