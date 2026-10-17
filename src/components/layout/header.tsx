"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import {
  Layers,
  Menu,
  X,
  ArrowRight,
  Sparkles,
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
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    desc: "Service calendars with buffer intervals & availability sync.",
    href: "/#features",
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    icon: FileText,
    title: "Invoicing & Billing",
    desc: "One-click appointment conversion into itemized invoices.",
    href: "/#features",
    color: "text-indigo-500 bg-indigo-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Team Governance",
    desc: "Multi-tenant workspace scoping & role-based access control.",
    href: "/#architecture",
    color: "text-amber-500 bg-amber-500/10",
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

  // Scroll Progress Tracking for the Ambient Reading Line
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    restDelta: 0.001,
  });

  // Reset mobile menu on route change
  const [prevPathname, setPrevPathname] = React.useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
    setIsFeaturesMenuOpen(false);
    setIsCommandPaletteOpen(false);
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

  // Keyboard shortcut handler (Escape to close menus, Cmd+K / Ctrl+K for command palette)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsFeaturesMenuOpen(false);
        setIsCommandPaletteOpen(false);
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
    }, 180);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsFeaturesMenuOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          "pointer-events-none sticky top-0 z-40 w-full px-3 pt-3 transition-all duration-300 sm:px-6 md:pt-4",
          className
        )}
      >
        {/* Floating Capsule Header with Consistent Stable Width & Glass Aesthetics */}
        <div
          className={cn(
            "pointer-events-auto relative mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border transition-all duration-300",
            "min-h-[58px] px-4 py-2.5 sm:min-h-[62px] sm:px-6",
            isScrolled
              ? "border-primary/25 bg-surface/92 shadow-[0_12px_36px_-6px_rgba(49,95,232,0.18)] backdrop-blur-2xl"
              : "border-border/80 bg-surface/80 shadow-[0_4px_24px_-2px_rgba(23,32,51,0.06)] backdrop-blur-xl"
          )}
        >
          {/* Dual Rim Light Highlight: Ultra-crisp top glass reflection */}
          <div
            className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent"
            aria-hidden="true"
          />

          {/* Dynamic Scroll Progress Glow Beam */}
          <motion.div
            style={{ scaleX, transformOrigin: "left" }}
            className="from-primary pointer-events-none absolute inset-x-6 -bottom-[1px] h-[2px] bg-gradient-to-r via-blue-500 to-indigo-500 shadow-[0_0_8px_rgba(49,95,232,0.6)]"
            aria-hidden="true"
          />

          {/* Left: Brand Logo, Wordmark & Live Status Pill */}
          <div className="flex shrink-0 items-center gap-4 lg:gap-6">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="group focus-visible:ring-primary flex shrink-0 items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label="FlowPilot Home"
            >
              {/* 3D Glass Refractive Logo Icon */}
              <div className="from-primary relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br via-blue-600 to-indigo-600 text-white shadow-[0_0_16px_rgba(49,95,232,0.35)] transition-all duration-300 group-hover:scale-105 group-hover:rotate-6 group-hover:shadow-[0_0_26px_rgba(49,95,232,0.6)]">
                <Layers className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110" />
                {/* Micro Ambient Sparkle Light */}
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-cyan-300 blur-[1px]" />
              </div>

              {/* Wordmark */}
              <div className="flex items-center">
                <span className="text-foreground text-base font-bold tracking-tight sm:text-lg">
                  Flow
                  <span className="from-primary bg-gradient-to-r to-blue-600 bg-clip-text font-extrabold text-transparent">
                    Pilot
                  </span>
                </span>
                <span className="border-primary/20 bg-primary/10 text-primary ml-1.5 hidden items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase lg:inline-flex">
                  <Sparkles className="h-2.5 w-2.5" />
                  SaaS
                </span>
              </div>
            </Link>

            {/* Live Systems Operational Indicator (Enterprise Trust Signal) */}
            <div className="border-border/70 bg-muted/40 hidden items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium xl:inline-flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-muted-foreground text-[10px]">Systems Operational</span>
            </div>

            {/* Desktop Navigation with Framer Motion Sliding Spring Capsule */}
            <nav
              className="hidden shrink-0 items-center gap-1 whitespace-nowrap md:flex"
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
                      className={cn(
                        "focus-visible:ring-primary relative z-10 inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-1 sm:text-sm",
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
                        <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                          {item.badge}
                        </span>
                      )}

                      {/* Magnetic Sliding Spring Capsule */}
                      {isHovered && (
                        <motion.span
                          layoutId="nav-hover-capsule"
                          className="bg-primary/10 absolute inset-0 -z-10 rounded-full"
                          transition={{
                            type: "spring",
                            stiffness: 450,
                            damping: 32,
                          }}
                        />
                      )}
                    </Link>

                    {/* Stripe-Grade Rich 2-Column Mega-Menu */}
                    {item.hasDropdown && (
                      <AnimatePresence>
                        {isFeaturesMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 12, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            onMouseEnter={handleMouseEnterDropdown}
                            onMouseLeave={handleMouseLeaveDropdown}
                            className="border-border/80 bg-surface/95 absolute relative top-full left-0 mt-2.5 w-[580px] overflow-hidden rounded-2xl border p-4 shadow-2xl backdrop-blur-2xl"
                          >
                            {/* Specular Top Rim Light */}
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/25" />

                            <div className="grid grid-cols-5 gap-4">
                              {/* Left Column: 4 Core Modules */}
                              <div className="col-span-3 space-y-1">
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
                                      className="group hover:bg-muted/80 flex items-start gap-3 rounded-xl p-2.5 transition-colors"
                                    >
                                      <div
                                        className={cn(
                                          "relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/20 shadow-xs transition-transform group-hover:scale-105 dark:border-white/10",
                                          cap.color
                                        )}
                                      >
                                        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" />
                                        <Icon className="relative z-10 h-4 w-4" />
                                      </div>
                                      <div>
                                        <p className="text-foreground group-hover:text-primary text-xs font-semibold transition-colors">
                                          {cap.title}
                                        </p>
                                        <p className="text-muted-foreground mt-0.5 text-[11px] leading-tight">
                                          {cap.desc}
                                        </p>
                                      </div>
                                    </Link>
                                  );
                                })}
                              </div>

                              {/* Right Column: Spotlight Feature Card */}
                              <div className="border-border/70 from-muted/60 to-muted/20 relative col-span-2 flex flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-b p-3.5 shadow-sm">
                                {/* Specular Accent Line */}
                                <div className="via-primary/50 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />

                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="bg-primary/10 text-primary border-primary/20 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                                      Spotlight
                                    </span>
                                    <Activity className="text-primary h-3.5 w-3.5 animate-pulse" />
                                  </div>
                                  <h4 className="text-foreground mt-2.5 text-xs font-bold">
                                    Operations Autopilot 2.0
                                  </h4>
                                  <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                                    Consolidate fragmented calendars, invoices, and clients into one
                                    calm flow.
                                  </p>

                                  <div className="border-border/50 mt-3 space-y-1.5 border-t pt-2.5 text-[10px]">
                                    <div className="text-foreground/80 flex items-center gap-1.5">
                                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                      <span>Zero Cross-Tenant Leakage</span>
                                    </div>
                                    <div className="text-foreground/80 flex items-center gap-1.5">
                                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                      <span>Automated Buffer Logic</span>
                                    </div>
                                  </div>
                                </div>

                                <Link
                                  href="/dashboard"
                                  onClick={() => setIsFeaturesMenuOpen(false)}
                                  className="group/cta bg-primary text-primary-foreground hover:bg-primary-hover relative mt-3 flex items-center justify-between overflow-hidden rounded-xl px-2.5 py-1.5 text-[11px] font-semibold shadow-xs transition-all"
                                >
                                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                                  <span className="relative z-10 flex items-center gap-1.5">
                                    <Laptop className="h-3.5 w-3.5" />
                                    Launch Demo
                                  </span>
                                  <ArrowRight className="h-3 w-3 transition-transform group-hover/cta:translate-x-1" />
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

          {/* Right: Command Trigger, Sign In & Shimmering CTA */}
          <div className="hidden shrink-0 items-center gap-2 whitespace-nowrap md:flex lg:gap-2.5">
            {/* Interactive Command Palette Trigger (Linear/Raycast style) */}
            <div className="group/cmd relative">
              <button
                type="button"
                onClick={() => setIsCommandPaletteOpen(true)}
                className="border-border/80 bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/70 group flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs shadow-2xs transition-all active:scale-95 lg:px-3"
                title="Open Command Palette (⌘K)"
                aria-label="Open Command Palette (⌘K)"
              >
                <Command className="text-muted-foreground group-hover/cmd:text-primary h-3 w-3 transition-colors" />
                <span className="hidden text-[11px] font-medium xl:inline">Quick Search</span>
                <kbd className="border-border/80 bg-background text-foreground/80 py-0.2 rounded border px-1.5 font-mono text-[9px] shadow-2xs">
                  ⌘K
                </kbd>
              </button>
              {/* Subtle hover micro-tooltip */}
              <div className="bg-foreground/90 text-background pointer-events-none absolute -bottom-7 left-1/2 z-50 hidden -translate-x-1/2 rounded-md px-2 py-0.5 text-[10px] font-medium whitespace-nowrap opacity-0 shadow-md backdrop-blur-md transition-all duration-200 group-hover/cmd:-bottom-6.5 group-hover/cmd:opacity-100 sm:block">
                Quick Search & Actions (⌘K)
              </div>
            </div>

            {/* Sign In Ghost Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground/80 hover:bg-muted/80 hover:text-foreground h-9 shrink-0 rounded-full px-3.5 text-xs font-medium whitespace-nowrap transition-colors"
              asChild
            >
              <Link href="/login">Sign In</Link>
            </Button>

            {/* Shimmering Glow Primary CTA */}
            <Button
              size="sm"
              className="group from-primary relative h-9 shrink-0 overflow-hidden rounded-full bg-gradient-to-r via-blue-600 to-indigo-600 px-4 text-xs font-semibold whitespace-nowrap text-white shadow-[0_0_18px_rgba(49,95,232,0.35)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(49,95,232,0.55)] active:scale-[0.98] sm:px-5"
              asChild
            >
              <Link href="/login" className="flex items-center gap-1.5">
                {/* Sweeping Shimmer Light Beam */}
                <span
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full"
                  aria-hidden="true"
                />
                <span>Get Started</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {/* Mobile Menu & Quick Command Button */}
          <div className="flex items-center gap-2 md:hidden">
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
              className="border-border/90 bg-surface/95 pointer-events-auto relative mx-auto mt-2 max-w-6xl overflow-hidden rounded-2xl border p-5 shadow-2xl backdrop-blur-2xl md:hidden"
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
                  className="from-primary h-10 w-full rounded-xl bg-gradient-to-r via-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-md"
                  asChild
                >
                  <Link href="/login" onClick={closeMobileMenu}>
                    <span>Get Started</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
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
