"use client";

import * as React from "react";
import Link from "next/link";
import {
  Layers,
  ArrowRight,
  ArrowUp,
  ShieldCheck,
  Heart,
  Sparkles,
  Check,
  Mail,
  Globe,
  Command,
  Database,
  Lock,
  Activity,
  CheckCircle2,
  FileCode,
  Info,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const GitHubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <path d="M4 4l16 16m0-16L4 20" />
  </svg>
);

export const Footer: React.FC = () => {
  const [email, setEmail] = React.useState("");
  const [subscribed, setSubscribed] = React.useState(false);
  const [isTelemetryHovered, setIsTelemetryHovered] = React.useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
      setSubscribed(false);
    }, 4000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const triggerCommandPalette = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        metaKey: true,
        bubbles: true,
      })
    );
  };

  return (
    <footer className="relative border-border/80 bg-surface/90 text-muted-foreground border-t backdrop-blur-xl">
      {/* Specular Top Rim Light */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* 1. Upper Engineering Dispatch & Product Updates Card */}
      <div className="border-border/60 border-b py-10 md:py-14">
        <Container>
          <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-muted/50 via-muted/20 to-muted/40 p-6 shadow-lg backdrop-blur-xl md:p-8">
            {/* Card Top Specular Highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
              {/* Left Column: Heading & Value Prop */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  <span>Engineering Dispatch & Changelogs</span>
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  <span className="font-mono text-[10px] text-primary/80">v2.4 LTS Radar</span>
                </div>
                <h3 className="text-foreground mt-3 text-lg font-bold tracking-tight sm:text-xl">
                  Stay Ahead with Operational Architectural Insights
                </h3>
                <p className="text-muted-foreground mt-1.5 max-w-xl text-xs sm:text-sm leading-relaxed">
                  Quarterly release notes, PostgreSQL RLS schema strategies, and zero-bullshit advice
                  for running high-margin agencies and consultancies.
                </p>
              </div>

              {/* Right Column: Dispatch Subscription Form */}
              <div className="lg:col-span-5">
                <form
                  onSubmit={handleSubscribe}
                  className="relative flex flex-col gap-2 sm:flex-row sm:items-center"
                >
                  <div className="border-border/80 bg-background/90 focus-within:border-primary relative flex flex-1 items-center gap-2 rounded-xl border px-3 py-2 text-xs shadow-xs transition-colors">
                    <Mail className="text-muted-foreground h-4 w-4 shrink-0" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="work.email@agency.com"
                      className="text-foreground placeholder:text-muted-foreground w-full bg-transparent outline-none text-xs"
                      aria-label="Work email for engineering dispatch"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    className={cn(
                      "relative h-9.5 shrink-0 overflow-hidden rounded-xl px-4 text-xs font-semibold text-white transition-all duration-300",
                      subscribed
                        ? "bg-emerald-600 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                        : "bg-primary hover:bg-primary-hover shadow-xs"
                    )}
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
                    {subscribed ? (
                      <span className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-white animate-scale-in" />
                        Subscribed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <span>Subscribe</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </Button>
                </form>
                <div className="text-muted-foreground/80 mt-2 flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    Zero spam guarantee
                  </span>
                  <span>&bull;</span>
                  <span>Unsubscribe anytime in 1 click</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* 2. Main Navigation & Brand Grid */}
      <div className="py-12 md:py-16">
        <Container>
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
            {/* Brand & Purpose Column (2 spans on desktop) */}
            <div className="space-y-4 lg:col-span-2">
              <Link
                href="/"
                className="group inline-flex items-center gap-2.5 transition-opacity hover:opacity-90"
                aria-label="FlowPilot Home"
              >
                <div className="relative overflow-hidden bg-primary text-primary-foreground flex h-9.5 w-9.5 items-center justify-center rounded-xl shadow-xs transition-transform group-hover:scale-105 border border-white/20">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" />
                  <Layers className="h-5 w-5 relative z-10" />
                </div>
                <span className="text-foreground text-xl font-bold tracking-tight">
                  Flow<span className="text-primary font-extrabold">Pilot</span>
                </span>
              </Link>
              <p className="text-muted-foreground max-w-sm text-xs sm:text-sm leading-relaxed">
                The unified business operations platform engineered for agencies, consultancies, and
                service firms. Reconcile client CRM, calendars, team capacity, and invoicing in one
                calm workspace.
              </p>

              {/* Interactive Quick Command Palette Trigger Button */}
              <div>
                <button
                  type="button"
                  onClick={triggerCommandPalette}
                  className="group/cmd border-border/70 bg-muted/40 hover:border-primary/50 hover:bg-muted/80 inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground shadow-2xs transition-all active:scale-95 text-left cursor-pointer"
                  aria-label="Open Command Palette Search (⌘K)"
                >
                  <Command className="text-primary h-3.5 w-3.5 transition-transform group-hover/cmd:scale-110" />
                  <span>
                    Press <kbd className="border-border bg-background text-foreground/80 rounded border px-1 py-0.5 font-mono text-[10px] shadow-2xs">⌘K</kbd> for quick command navigation
                  </span>
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all group-hover/cmd:opacity-100 group-hover/cmd:translate-x-0 text-primary" />
                </button>
              </div>

              {/* Social & Developer Community Links */}
              <div className="pt-1 flex items-center gap-2">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border/80 bg-muted/30 text-muted-foreground hover:border-primary/50 hover:bg-muted/80 hover:text-foreground relative flex h-8 w-8 items-center justify-center rounded-xl border transition-all"
                  aria-label="GitHub Repository"
                >
                  <GitHubIcon className="h-3.5 w-3.5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border/80 bg-muted/30 text-muted-foreground hover:border-primary/50 hover:bg-muted/80 hover:text-foreground relative flex h-8 w-8 items-center justify-center rounded-xl border transition-all"
                  aria-label="Twitter / X Profile"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </a>
                <Link
                  href="/#architecture"
                  className="border-border/80 bg-muted/30 text-muted-foreground hover:border-primary/50 hover:bg-muted/80 hover:text-foreground relative flex h-8 w-8 items-center justify-center rounded-xl border transition-all"
                  aria-label="Architecture Documentation"
                >
                  <FileCode className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/dashboard"
                  className="border-border/80 bg-muted/30 text-muted-foreground hover:border-primary/50 hover:bg-muted/80 hover:text-foreground relative flex h-8 w-8 items-center justify-center rounded-xl border transition-all"
                  aria-label="Live Demo Workspace"
                >
                  <Globe className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Column 2: Product Capabilities */}
            <div className="space-y-3">
              <h3 className="text-foreground text-xs font-bold tracking-wider uppercase">
                Product
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link
                    href="/#features"
                    className="group inline-flex items-center gap-1.5 transition-all duration-200 hover:text-primary hover:translate-x-1"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Core Capabilities</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#features"
                    className="group inline-flex items-center gap-1.5 transition-all duration-200 hover:text-primary hover:translate-x-1"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Smart Scheduling</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#features"
                    className="group inline-flex items-center gap-1.5 transition-all duration-200 hover:text-primary hover:translate-x-1"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Client CRM Dossier</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#features"
                    className="group inline-flex items-center gap-1.5 transition-all duration-200 hover:text-primary hover:translate-x-1"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Invoicing & Settlement</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#preview"
                    className="group inline-flex items-center gap-1.5 transition-all duration-200 hover:text-primary hover:translate-x-1"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Product Preview</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#how-it-works"
                    className="group inline-flex items-center gap-1.5 transition-all duration-200 hover:text-primary hover:translate-x-1"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>How It Works</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#benefits"
                    className="group inline-flex items-center gap-1.5 transition-all duration-200 hover:text-primary hover:translate-x-1"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Business Benefits</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center gap-1.5 transition-all duration-200 hover:text-primary hover:translate-x-1"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Live Workspace</span>
                    <span className="bg-primary/10 text-primary border border-primary/20 rounded-full px-1.5 py-0.2 text-[10px] font-semibold">
                      Demo
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Architecture & Security */}
            <div className="space-y-3">
              <h3 className="text-foreground text-xs font-bold tracking-wider uppercase">
                Architecture & Security
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link
                    href="/#architecture"
                    className="group inline-flex items-center gap-1.5 transition-all duration-200 hover:text-primary hover:translate-x-1"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Multi-Tenant Isolation</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#architecture"
                    className="group inline-flex items-center gap-1.5 transition-all duration-200 hover:text-primary hover:translate-x-1"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Role-Based Access (RBAC)</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#architecture"
                    className="group inline-flex items-center gap-1.5 transition-all duration-200 hover:text-primary hover:translate-x-1"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Typed API Contracts</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#architecture"
                    className="group inline-flex items-center gap-1.5 transition-all duration-200 hover:text-primary hover:translate-x-1"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Zod Runtime Validation</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#faq"
                    className="group inline-flex items-center gap-1.5 transition-all duration-200 hover:text-primary hover:translate-x-1"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Security FAQ</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#architecture"
                    className="group inline-flex items-center gap-1.5 transition-all duration-200 hover:text-primary hover:translate-x-1"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Data Sovereignty Guarantee</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#architecture"
                    className="group inline-flex items-center gap-1.5 transition-all duration-200 hover:text-primary hover:translate-x-1"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Zero-Leakage Multi-Tenant RLS</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Platform & Account Access */}
            <div className="space-y-3">
              <h3 className="text-foreground text-xs font-bold tracking-wider uppercase">
                Access & Resources
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link
                    href="/login"
                    className="group inline-flex items-center gap-1.5 transition-all duration-200 hover:text-primary hover:translate-x-1"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Sign In</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="group inline-flex items-center gap-1.5 text-primary font-semibold transition-all duration-200 hover:translate-x-1"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary opacity-100" />
                    <span>Get Started Free</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center gap-1.5 transition-all duration-200 hover:text-primary hover:translate-x-1"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Workspace Preview</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#faq"
                    className="group inline-flex items-center gap-1.5 transition-all duration-200 hover:text-primary hover:translate-x-1"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>System FAQ & Migration</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="group inline-flex items-center gap-1.5 transition-all duration-200 hover:text-primary hover:translate-x-1"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Request Dedicated Tenant</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </div>

      {/* 3. Live Enterprise Telemetry Status Bar with Interactive Detail Tooltip */}
      <div className="relative border-border/60 bg-muted/40 border-t py-3 text-xs">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-muted-foreground">
            {/* Live Operational Signal (Hoverable for Architectural Telemetry Details) */}
            <div
              className="relative cursor-pointer"
              onMouseEnter={() => setIsTelemetryHovered(true)}
              onMouseLeave={() => setIsTelemetryHovered(false)}
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-foreground font-semibold">Systems Operational</span>
                <span className="text-muted-foreground/60">&bull;</span>
                <span>99.98% SLA</span>
                <Info className="h-3 w-3 text-muted-foreground/70" />
              </div>

              {/* Hoverable Telemetry Blueprint Popover */}
              {isTelemetryHovered && (
                <div className="absolute bottom-full left-0 mb-2 z-50 w-[calc(100vw-32px)] sm:w-72 max-w-xs rounded-xl border border-border/80 bg-surface/95 p-3 shadow-xl backdrop-blur-2xl">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Live Infrastructure Telemetry
                  </p>
                  <div className="mt-2 space-y-1.5 text-[10px] font-mono text-muted-foreground">
                    <div className="flex items-center justify-between border-b border-border/40 pb-1">
                      <span>PostgreSQL RLS:</span>
                      <span className="font-semibold text-emerald-500">Active (0ms locks)</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-border/40 pb-1">
                      <span>Zod Mutation Guards:</span>
                      <span className="font-semibold text-cyan-500">100% Enforced</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Global Edge Anycast:</span>
                      <span className="font-semibold text-indigo-500">14ms TTFB</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Architectural Telemetry Badges */}
            <div className="hidden items-center gap-4 sm:flex">
              <span className="inline-flex items-center gap-1">
                <Database className="h-3 w-3 text-emerald-500" />
                PostgreSQL RLS Active
              </span>
              <span className="text-muted-foreground/60">&bull;</span>
              <span className="inline-flex items-center gap-1">
                <Lock className="h-3 w-3 text-cyan-500" />
                Scoped RBAC Enforced
              </span>
              <span className="text-muted-foreground/60">&bull;</span>
              <span className="inline-flex items-center gap-1">
                <Activity className="h-3 w-3 text-indigo-500" />
                Global Edge CDN
              </span>
            </div>
          </div>
        </Container>
      </div>

      {/* 4. Lower Copyright, Compliance & Back-To-Top Bar */}
      <div className="relative border-border/60 bg-muted/20 border-t py-6 text-xs">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
        <Container className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-muted-foreground text-center md:text-left text-xs">
            &copy; 2026 FlowPilot Inc. All rights reserved. Engineered with precision for professional service teams.
          </p>

          <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-6 text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground/80">
              <ShieldCheck className="text-primary h-4 w-4" />
              Verified Architecture
            </span>
            <span className="hidden sm:inline text-muted-foreground/40">&bull;</span>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <span className="hidden sm:inline text-muted-foreground/40">&bull;</span>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <span className="hidden sm:inline text-muted-foreground/40">&bull;</span>
            <span className="inline-flex items-center gap-1">
              Crafted with precision <Heart className="h-3 w-3 fill-red-500 text-red-500" />
            </span>
            <span className="hidden sm:inline text-muted-foreground/40">&bull;</span>

            {/* Back to Top Smooth Scroll Button */}
            <button
              type="button"
              onClick={scrollToTop}
              className="group relative flex h-7 items-center gap-1 rounded-lg border border-border/80 bg-muted/50 px-2.5 text-[11px] font-medium text-muted-foreground hover:border-primary/50 hover:bg-muted/80 hover:text-foreground transition-all active:scale-95 shadow-2xs overflow-hidden cursor-pointer"
              aria-label="Scroll back to top of page"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
              <span>Back to top</span>
              <ArrowUp className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 text-primary" />
            </button>
          </div>
        </Container>
      </div>
    </footer>
  );
};
