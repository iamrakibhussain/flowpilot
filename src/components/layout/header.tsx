"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from "framer-motion";
import {
  Layers,
  Menu,
  X,
  ArrowRight,
  Command,
  ChevronDown,
  Users,
  Calendar,
  FileText,
  ShieldCheck,
  Laptop,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/ui/command-palette";
import { cn } from "@/lib/utils/cn";

export interface HeaderProps {
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
  badge?: string;
  hasDropdown?: boolean;
}

const navItems: NavItem[] = [
  {
    label: "Features",
    href: "/#features",
    hasDropdown: true,
  },
  {
    label: "How It Works",
    href: "/#how-it-works",
  },
  {
    label: "Architecture",
    href: "/#architecture",
  },
  {
    label: "Live Workspace",
    href: "/dashboard",
    badge: "Demo",
  },
];

const megaMenuCapabilities = [
  {
    icon: Users,
    title: "Client CRM Dossier",
    desc: "Unified customer history, service tiers & contact context.",
    href: "/#features",
    color:
      "text-blue-600 bg-blue-500/10 border-blue-500/25 dark:text-blue-400 dark:bg-blue-500/15 dark:border-blue-400/25 shadow-blue-500/5",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    desc: "Service calendars with buffer intervals & availability sync.",
    href: "/#features",
    color:
      "text-violet-600 bg-violet-500/10 border-violet-500/25 dark:text-violet-400 dark:bg-violet-500/15 dark:border-violet-400/25 shadow-violet-500/5",
  },
  {
    icon: FileText,
    title: "Invoicing & Billing",
    desc: "One-click appointment conversion into itemized invoices.",
    href: "/#features",
    color:
      "text-emerald-600 bg-emerald-500/10 border-emerald-500/25 dark:text-emerald-400 dark:bg-emerald-500/15 dark:border-emerald-400/25 shadow-emerald-500/5",
  },
  {
    icon: ShieldCheck,
    title: "Team Governance",
    desc: "Multi-tenant workspace scoping & role-based access control.",
    href: "/#architecture",
    color:
      "text-amber-600 bg-amber-500/10 border-amber-500/25 dark:text-amber-400 dark:bg-amber-500/15 dark:border-amber-400/25 shadow-amber-500/5",
  },
];

export const Header: React.FC<HeaderProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [hoveredNav, setHoveredNav] = React.useState<string | null>(null);
  const [isFeaturesMenuOpen, setIsFeaturesMenuOpen] = React.useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<string | null>(null);
  const dropdownTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  // Interactive Live Telemetry HUD Popover State
  const [isTelemetryOpen, setIsTelemetryOpen] = React.useState(false);
  const telemetryTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleTelemetryMouseEnter = () => {
    if (telemetryTimeoutRef.current) clearTimeout(telemetryTimeoutRef.current);
    setIsTelemetryOpen(true);
  };

  const handleTelemetryMouseLeave = () => {
    telemetryTimeoutRef.current = setTimeout(() => {
      setIsTelemetryOpen(false);
    }, 250);
  };

  // 3D Spatial Monolith Logo Motion Tracking
  const logoBoxRef = React.useRef<HTMLDivElement | null>(null);
  const logoMouseX = useMotionValue(0);
  const logoMouseY = useMotionValue(0);
  const logoRotateX = useTransform(logoMouseY, [-18, 18], [8, -8]);
  const logoRotateY = useTransform(logoMouseX, [-18, 18], [-8, 8]);
  const springLogoRotateX = useSpring(logoRotateX, { stiffness: 400, damping: 25 });
  const springLogoRotateY = useSpring(logoRotateY, { stiffness: 400, damping: 25 });

  const handleLogoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!logoBoxRef.current) return;
    const rect = logoBoxRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    logoMouseX.set(x);
    logoMouseY.set(y);
  };

  const handleLogoMouseLeave = () => {
    logoMouseX.set(0);
    logoMouseY.set(0);
  };

  // Magnetic Gravitational Attraction for Primary CTA
  const ctaContainerRef = React.useRef<HTMLDivElement | null>(null);
  const ctaMouseX = useMotionValue(0);
  const ctaMouseY = useMotionValue(0);
  const springCtaX = useSpring(ctaMouseX, { stiffness: 350, damping: 25 });
  const springCtaY = useSpring(ctaMouseY, { stiffness: 350, damping: 25 });

  const handleCtaMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ctaContainerRef.current) return;
    const rect = ctaContainerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) * 0.22;
    const distanceY = (e.clientY - centerY) * 0.22;
    ctaMouseX.set(Math.max(-7, Math.min(7, distanceX)));
    ctaMouseY.set(Math.max(-5, Math.min(5, distanceY)));
  };

  const handleCtaMouseLeave = () => {
    ctaMouseX.set(0);
    ctaMouseY.set(0);
  };

  // Reset mobile menu and popovers on route change
  const [prevPathname, setPrevPathname] = React.useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
    setIsFeaturesMenuOpen(false);
    setIsCommandPaletteOpen(false);
    setIsTelemetryOpen(false);
  }

  // Active Section ScrollSpy on Homepage
  React.useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const sectionIds = ["features", "how-it-works", "architecture"];
    const handleScrollSpy = () => {
      const scrollPos = window.scrollY + 220;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sectionIds[i]);
          return;
        }
      }
      setActiveSection(null);
    };

    handleScrollSpy();
    window.addEventListener("scroll", handleScrollSpy, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, [pathname]);

  // Scroll threshold listener
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut handler (Escape to close menus/dialogs, Cmd+K / Ctrl+K for command palette)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsFeaturesMenuOpen(false);
        setIsCommandPaletteOpen(false);
        setIsTelemetryOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleMouseEnterDropdown = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setIsFeaturesMenuOpen(true);
  };

  const handleMouseLeaveDropdown = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsFeaturesMenuOpen(false);
    }, 240);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsFeaturesMenuOpen(false);
    setIsTelemetryOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          "pointer-events-none sticky top-0 z-40 w-full px-3 pt-3 transition-all duration-300 sm:px-6 md:pt-4",
          className
        )}
      >
        {/* Floating Capsule Header with Consistent Stable Width & VisionOS 3D Refractive Glass Aesthetics */}
        <div
          className={cn(
            "group/capsule pointer-events-auto relative mx-auto flex w-full max-w-7xl items-center justify-between rounded-full border transition-all duration-300",
            "min-h-[58px] px-3.5 py-1.5 sm:min-h-[60px] sm:px-4 xl:px-5",
            isScrolled
              ? "border-border/90 glass-visionos scale-[0.99] shadow-[0_12px_32px_rgba(0,0,0,0.12)] backdrop-blur-2xl dark:border-neutral-800/90 dark:shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
              : "border-border/75 bg-surface/85 glass-visionos scale-100 shadow-[0_8px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-neutral-800/80 dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
          )}
        >
          {/* VisionOS Nano-Texture Ambient Substrate */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(#0000000a_1px,transparent_1px)] [background-size:14px_14px] opacity-60 dark:bg-[radial-gradient(#ffffff0a_1px,transparent_1px)]"
            aria-hidden="true"
          />

          {/* Dual Precision Specular Top Rim Lighting (Static Horizon) */}
          <div
            className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-neutral-950/20 to-transparent dark:via-white/40"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-20 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent blur-[0.5px] dark:via-cyan-400/40"
            aria-hidden="true"
          />

          {/* Left: Brand Logo, Wordmark & Interactive Live Status Pill */}
          <div className="flex shrink-0 items-center gap-3 xl:gap-3.5">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="group focus-visible:ring-primary flex shrink-0 items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label="FlowPilot Home"
            >
              {/* 3D Spatial Layered Monolith Brand Icon */}
              <motion.div
                ref={logoBoxRef}
                onMouseMove={handleLogoMouseMove}
                onMouseLeave={handleLogoMouseLeave}
                style={{
                  rotateX: springLogoRotateX,
                  rotateY: springLogoRotateY,
                  transformStyle: "preserve-3d",
                  perspective: 600,
                }}
                className="group-hover:shadow-primary/20 relative flex h-8.5 w-8.5 items-center justify-center rounded-xl transition-shadow duration-300 group-hover:shadow-lg"
              >
                {/* Layer 1: Base Obsidian Chassis (Z: 0px) */}
                <div
                  style={{ transform: "translateZ(0px)" }}
                  className="absolute inset-0 rounded-xl border border-neutral-800/80 bg-gradient-to-b from-neutral-800 to-neutral-950 shadow-md shadow-neutral-950/30 dark:border-white/20 dark:from-white dark:to-neutral-200"
                />

                {/* Layer 2: Frosted Specular Middle Rim (Z: 7px) */}
                <div
                  style={{ transform: "translateZ(7px)" }}
                  className="pointer-events-none absolute inset-[2px] rounded-[10px] border border-white/20 bg-gradient-to-b from-white/10 to-transparent dark:border-neutral-900/10"
                />

                {/* Hairline Specular Top Highlight (Z: 10px) */}
                <div
                  style={{ transform: "translateZ(10px)" }}
                  className="pointer-events-none absolute inset-x-1.5 top-0.5 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-neutral-950/30"
                />

                {/* Layer 3: Floating Metallic Layers Glyph (Z: 14px) */}
                <div
                  style={{ transform: "translateZ(14px)" }}
                  className="relative z-10 flex items-center justify-center text-white drop-shadow-sm dark:text-neutral-950"
                >
                  <Layers className="h-4 w-4 drop-shadow-xs" />
                </div>
              </motion.div>

              {/* Wordmark */}
              <div className="flex items-center">
                <span className="text-foreground text-base font-bold tracking-tight sm:text-lg">
                  Flow<span className="text-primary font-extrabold">Pilot</span>
                </span>
                <span className="border-border/80 bg-muted/70 text-muted-foreground ml-2 hidden items-center rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase 2xl:inline-flex">
                  v2.4
                </span>
              </div>
            </Link>

            {/* Interactive Telemetry Radar & Architecture Specifications HUD Popover */}
            <div
              onMouseEnter={handleTelemetryMouseEnter}
              onMouseLeave={handleTelemetryMouseLeave}
              className="relative hidden xl:inline-block"
            >
              <button
                type="button"
                onClick={() => setIsTelemetryOpen((prev) => !prev)}
                aria-expanded={isTelemetryOpen}
                aria-haspopup="dialog"
                aria-label="System status: Operational, click to view architecture specifications"
                className="group/telemetry relative flex cursor-pointer items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/[0.08] px-2.5 py-1 text-[11px] font-medium text-emerald-800 shadow-2xs backdrop-blur-xs transition-all duration-200 hover:border-emerald-500/50 hover:bg-emerald-500/[0.16] active:scale-95 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300"
              >
                <span className="relative flex h-2 w-2 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                </span>
                <span className="font-mono text-[10px] font-semibold">Active • Verified</span>
                <Activity className="h-3 w-3 text-emerald-500 transition-transform group-hover/telemetry:scale-110" />
              </button>

              {/* Satellite Telemetry HUD Popover with AnimatePresence */}
              <AnimatePresence>
                {isTelemetryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    role="dialog"
                    aria-label="Architecture Specifications"
                    className="border-border/80 bg-surface/98 absolute top-full left-0 z-50 mt-2.5 w-80 overflow-hidden rounded-2xl border p-4 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#080d1a]/98"
                  >
                    {/* Specular Hairline Top Highlight */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

                    <div className="border-border/60 flex items-center justify-between border-b pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
                        </span>
                        <span className="text-foreground text-xs font-bold">
                          Operational Status: Active
                        </span>
                      </div>
                      <span className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Verified
                      </span>
                    </div>

                    {/* Truthful Architecture Specifications Grid */}
                    <div className="mt-3 space-y-2 font-mono text-[10.5px]">
                      <div className="bg-muted/40 border-border/40 flex items-center justify-between rounded-lg border px-2.5 py-1.5">
                        <span className="text-muted-foreground font-sans text-[11px]">
                          Tenant Context:
                        </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          Organization Scoped
                        </span>
                      </div>
                      <div className="bg-muted/40 border-border/40 flex items-center justify-between rounded-lg border px-2.5 py-1.5">
                        <span className="text-muted-foreground font-sans text-[11px]">
                          Contract Validation:
                        </span>
                        <span className="text-foreground font-semibold">Zod Safe Runtime</span>
                      </div>
                      <div className="bg-muted/40 border-border/40 flex items-center justify-between rounded-lg border px-2.5 py-1.5">
                        <span className="text-muted-foreground font-sans text-[11px]">
                          Server Engine:
                        </span>
                        <span className="text-foreground font-semibold">Next.js 16 App Router</span>
                      </div>
                      <div className="bg-muted/40 border-border/40 flex items-center justify-between rounded-lg border px-2.5 py-1.5">
                        <span className="text-muted-foreground font-sans text-[11px]">
                          Database Engine:
                        </span>
                        <span className="text-foreground font-semibold">PostgreSQL + Prisma</span>
                      </div>
                    </div>

                    {/* Enterprise Governance Micro-Bar */}
                    <div className="border-border/50 text-muted-foreground mt-3 flex items-center justify-between border-t pt-2.5 text-[10px]">
                      <span className="flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9.5px] font-medium text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Verified Architecture</span>
                      </span>
                      <span className="text-muted-foreground font-mono text-[10px] font-semibold">
                        v2.4 LTS
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Navigation with Framer Motion Sliding Spring Capsule */}
            <nav
              className="hidden shrink-0 items-center gap-0.5 whitespace-nowrap lg:flex xl:gap-1"
              aria-label="Primary Desktop Navigation"
            >
              {navItems.map((item) => {
                const isHovered = hoveredNav === item.label;
                const isSectionActive =
                  pathname === "/" && activeSection !== null && item.href === `/#${activeSection}`;
                const isActive = item.href === pathname || isSectionActive;

                return (
                  <div
                    key={item.href}
                    className="relative shrink-0"
                    onMouseEnter={() => {
                      setHoveredNav(item.label);
                      if (item.hasDropdown) handleMouseEnterDropdown();
                    }}
                    onMouseLeave={() => {
                      setHoveredNav(null);
                      if (item.hasDropdown) handleMouseLeaveDropdown();
                    }}
                  >
                    <Link
                      href={item.href}
                      aria-expanded={item.hasDropdown ? isFeaturesMenuOpen : undefined}
                      aria-haspopup={item.hasDropdown ? "true" : undefined}
                      className={cn(
                        "focus-visible:ring-primary relative z-10 inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-1 xl:gap-1 xl:px-3 xl:text-[13px]",
                        isActive
                          ? "text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground",
                        isHovered && "text-foreground"
                      )}
                    >
                      <span>{item.label}</span>

                      {item.hasDropdown && (
                        <ChevronDown
                          className={cn(
                            "text-muted-foreground h-3 w-3 transition-transform duration-200",
                            isFeaturesMenuOpen && "text-primary rotate-180"
                          )}
                        />
                      )}

                      {item.badge && (
                        <span className="bg-primary/10 text-primary hidden items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase 2xl:inline-flex">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                          {item.badge}
                        </span>
                      )}

                      {/* Liquid Magnetic Frosted Lens */}
                      {isHovered && (
                        <motion.span
                          layoutId="nav-hover-capsule"
                          className="absolute inset-0 -z-10 rounded-full border border-neutral-300/60 bg-gradient-to-b from-neutral-200/50 to-neutral-200/20 shadow-xs backdrop-blur-md dark:border-white/15 dark:from-white/15 dark:to-white/5"
                          transition={{
                            type: "spring",
                            stiffness: 450,
                            damping: 30,
                          }}
                        />
                      )}
                    </Link>

                    {/* Holographic VisionOS Precision Mega-Menu */}
                    {item.hasDropdown && (
                      <AnimatePresence>
                        {isFeaturesMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.98 }}
                            transition={{
                              type: "spring",
                              stiffness: 450,
                              damping: 30,
                              mass: 0.6,
                            }}
                            role="region"
                            aria-label="Features Capabilities Directory"
                            onKeyDown={(e) => {
                              if (e.key === "Escape") {
                                setIsFeaturesMenuOpen(false);
                              }
                            }}
                            onMouseEnter={handleMouseEnterDropdown}
                            onMouseLeave={handleMouseLeaveDropdown}
                            className="border-border/80 bg-surface/98 absolute top-[calc(100%+16px)] -left-6 z-50 w-[min(620px,calc(100vw-3rem))] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border p-4 whitespace-normal shadow-[0_24px_60px_-15px_rgba(0,0,0,0.22)] backdrop-blur-2xl before:absolute before:inset-x-0 before:-top-6 before:h-6 before:content-[''] sm:-left-12 dark:border-white/10 dark:bg-[#080d1a]/98 dark:shadow-[0_24px_70px_-15px_rgba(0,0,0,0.85)]"
                          >
                            {/* Specular Top Rim Light */}
                            <div className="via-primary/40 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent dark:via-white/25" />

                            <div className="grid grid-cols-12 gap-4">
                              {/* Left Column: 4 Core Modules (7 of 12 columns for generous text wrapping) */}
                              <div className="col-span-7 min-w-0 space-y-1">
                                <p className="text-muted-foreground px-2 pb-1 text-[10px] font-bold tracking-wider uppercase">
                                  Core Capabilities
                                </p>
                                {megaMenuCapabilities.map((cap) => {
                                  const Icon = cap.icon;
                                  return (
                                    <Link
                                      key={cap.title}
                                      href={cap.href}
                                      onClick={() => setIsFeaturesMenuOpen(false)}
                                      className="group hover:bg-muted/80 flex min-w-0 items-start gap-3 rounded-xl p-2.5 transition-all duration-200 hover:translate-x-1 hover:shadow-xs dark:hover:bg-white/[0.06]"
                                    >
                                      <div
                                        className={cn(
                                          "relative flex h-8.5 w-8.5 shrink-0 items-center justify-center overflow-hidden rounded-xl border shadow-xs transition-transform duration-200 group-hover:scale-110 group-hover:rotate-[-3deg]",
                                          cap.color
                                        )}
                                      >
                                        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" />
                                        <Icon className="relative z-10 h-4 w-4" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-foreground group-hover:text-primary text-xs font-semibold transition-colors">
                                          {cap.title}
                                        </p>
                                        <p className="text-muted-foreground mt-0.5 text-[11px] leading-snug">
                                          {cap.desc}
                                        </p>
                                      </div>
                                    </Link>
                                  );
                                })}
                              </div>

                              {/* Right Column: Spotlight Feature Card (5 of 12 columns) */}
                              <div className="border-primary/20 from-primary/[0.08] via-primary/[0.02] dark:border-primary/25 dark:from-primary/[0.12] hover:border-primary/40 relative col-span-5 flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-br to-transparent p-3.5 shadow-xs transition-all duration-300 hover:shadow-sm dark:to-neutral-900/40">
                                {/* Ambient Spotlight Glow */}
                                <div className="bg-primary/10 pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full blur-xl" />

                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="border-primary/25 bg-background/90 text-foreground/90 rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase">
                                      Platform Hub
                                    </span>
                                    <Layers className="text-primary h-3.5 w-3.5" />
                                  </div>
                                  <h4 className="text-foreground mt-2.5 text-xs font-bold">
                                    Operations Stack 2.0
                                  </h4>
                                  <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                                    Unify calendars, clients, and automated billing into one
                                    structured flow.
                                  </p>

                                  <div className="border-border/50 mt-3 space-y-1.5 border-t pt-2.5 text-[10px]">
                                    <div className="text-foreground/80 flex items-center gap-1.5">
                                      <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
                                      <span className="truncate">Tenant-Isolated Database</span>
                                    </div>
                                    <div className="text-foreground/80 flex items-center gap-1.5">
                                      <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
                                      <span className="truncate">Calendar Buffer Automation</span>
                                    </div>
                                  </div>
                                </div>

                                <Link
                                  href="/dashboard"
                                  onClick={() => setIsFeaturesMenuOpen(false)}
                                  className="group/cta bg-primary text-primary-foreground hover:bg-primary-hover shadow-primary/25 relative mt-3 flex items-center justify-between overflow-hidden rounded-xl px-3 py-2 text-[11px] font-semibold shadow-xs transition-all duration-200 active:scale-95"
                                >
                                  <span className="relative z-10 flex items-center gap-1.5">
                                    <Laptop className="h-3.5 w-3.5" />
                                    Launch Demo
                                  </span>
                                  <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover/cta:translate-x-1" />
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Right: Command Trigger, Sign In & High-Contrast CTA */}
          <div className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap lg:flex xl:gap-2">
            {/* Hardware-Grade Interactive Command Palette Trigger */}
            <div className="group/cmd relative">
              <button
                type="button"
                onClick={() => setIsCommandPaletteOpen(true)}
                className="group text-muted-foreground hover:text-foreground relative flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-neutral-300/70 bg-white/70 px-2.5 py-1 text-xs shadow-2xs backdrop-blur-md transition-all duration-200 hover:border-neutral-400 hover:bg-white hover:shadow-xs active:translate-y-0.5 sm:px-3 dark:border-white/10 dark:bg-neutral-900/60 dark:hover:bg-neutral-800/80"
                title="Open Command Palette (⌘K)"
                aria-label="Open Command Palette (⌘K)"
              >
                <Command className="text-muted-foreground group-hover/cmd:text-primary h-3.5 w-3.5 transition-colors" />
                <span className="text-foreground/80 hidden text-[11px] font-medium 2xl:inline">
                  Quick Search
                </span>
                <kbd className="rounded-md border-b-2 border-neutral-300 bg-gradient-to-b from-neutral-100 to-neutral-200/90 px-1.5 py-0.5 font-mono text-[9px] font-bold text-neutral-800 shadow-2xs transition-transform group-hover/cmd:border-b dark:border-neutral-700 dark:from-neutral-800 dark:to-neutral-900 dark:text-neutral-200">
                  ⌘K
                </kbd>
              </button>
              {/* Subtle hover micro-tooltip */}
              <div className="bg-foreground/90 text-background pointer-events-none absolute -bottom-7 left-1/2 z-50 hidden -translate-x-1/2 rounded-md px-2 py-0.5 text-[10px] font-medium whitespace-nowrap opacity-0 shadow-md backdrop-blur-md transition-all duration-200 group-hover/cmd:-bottom-6.5 group-hover/cmd:opacity-100 sm:block">
                Quick Search &amp; Actions (⌘K)
              </div>
            </div>

            {/* Sign In Ghost Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground/80 hover:bg-muted/80 hover:text-foreground h-8.5 shrink-0 rounded-full px-2.5 text-xs font-medium whitespace-nowrap transition-colors sm:h-9 xl:px-3"
              asChild
            >
              <Link href="/login">Sign In</Link>
            </Button>

            {/* Magnetic Gravitational Primary CTA with Signature Obsidian Capsule */}
            <motion.div
              ref={ctaContainerRef}
              onMouseMove={handleCtaMouseMove}
              onMouseLeave={handleCtaMouseLeave}
              style={{ x: springCtaX, y: springCtaY }}
              className="relative shrink-0"
            >
              <Button
                size="sm"
                className="group relative h-9.5 shrink-0 overflow-hidden rounded-full border border-neutral-700/80 bg-gradient-to-b from-neutral-800 via-neutral-900 to-black px-4.5 text-xs font-bold whitespace-nowrap text-white shadow-[0_4px_14px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.22)] ring-1 ring-white/10 transition-all duration-300 hover:scale-[1.02] hover:border-cyan-500/60 hover:shadow-[0_0_24px_rgba(6,182,212,0.35)] active:scale-95 dark:from-white dark:via-neutral-100 dark:to-neutral-200 dark:text-neutral-950 dark:shadow-[0_0_20px_rgba(255,255,255,0.25)] dark:ring-white/20"
                asChild
              >
                <Link href="/register" className="relative flex items-center gap-2">
                  {/* Top Specular Edge Highlight */}
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-neutral-950/30" />

                  {/* Internal Specular Ray Sweeper */}
                  <span className="pointer-events-none absolute -inset-full w-[200%] -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full dark:via-neutral-950/15" />

                  {/* Live Blue Status Pulse Diamond */}
                  <span className="relative flex h-2 w-2 items-center justify-center">
                    <span className="absolute h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                  </span>

                  <span>Get Started</span>

                  {/* Signature Obsidian Mini Arrow Capsule */}
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-800 text-white shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-600 dark:bg-neutral-300 dark:text-neutral-950 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                    <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu & Quick Command Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="border-border/80 bg-muted/40 text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-full border"
              aria-label="Open search command palette"
            >
              <Command className="h-4 w-4" />
            </button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="text-foreground hover:bg-muted/80 h-9 w-9 rounded-full p-0 transition-transform active:scale-95"
            >
              {isMobileMenuOpen ? (
                <X
                  className="h-5 w-5 rotate-90 transition-transform duration-200"
                  aria-hidden="true"
                />
              ) : (
                <Menu className="h-5 w-5 transition-transform duration-200" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Card with AnimatePresence */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              id="mobile-navigation"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="border-border/90 bg-surface/95 pointer-events-auto relative mx-auto mt-2 max-w-6xl overflow-hidden rounded-2xl border p-5 shadow-2xl backdrop-blur-2xl lg:hidden"
            >
              {/* Specular Top Rim Light */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/25" />

              <nav className="flex flex-col space-y-1.5" aria-label="Mobile Navigation">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      "focus-visible:ring-primary flex h-11 items-center justify-between rounded-xl px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-2",
                      item.href === pathname
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold uppercase">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>

              {/* Mobile Action Buttons */}
              <div className="border-border/70 mt-4 flex flex-col gap-2.5 border-t pt-4">
                <Button
                  variant="outline"
                  className="border-border/80 text-foreground hover:bg-muted h-10 w-full rounded-xl text-sm font-medium"
                  asChild
                >
                  <Link href="/login" onClick={closeMobileMenu}>
                    Sign In
                  </Link>
                </Button>

                <Button
                  className="group relative h-11 w-full overflow-hidden rounded-xl border border-neutral-700/80 bg-gradient-to-b from-neutral-800 via-neutral-900 to-black text-sm font-bold text-white shadow-[0_4px_14px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:border-cyan-500/60 hover:shadow-[0_0_24px_rgba(6,182,212,0.3)] active:scale-[0.98] dark:from-white dark:via-neutral-100 dark:to-neutral-200 dark:text-neutral-950"
                  asChild
                >
                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-2"
                  >
                    <span className="relative flex h-2 w-2 items-center justify-center">
                      <span className="absolute h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                    </span>
                    <span>Get Started</span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-800 text-white shadow-xs transition-transform duration-200 group-hover:translate-x-0.5 group-hover:bg-blue-600 dark:bg-neutral-300 dark:text-neutral-950 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Real Interactive Command Palette Spotlight Dialog */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </>
  );
};
