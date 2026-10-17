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
    <footer className="border-border/80 bg-surface/90 text-muted-foreground relative border-t backdrop-blur-xl">
      {/* Specular Top Rim Light */}
      <div className="via-primary/50 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />

      {/* 1. Upper Engineering Dispatch & Product Updates Card */}
      <div className="border-border/60 border-b py-10 md:py-14">
        <Container>
          <div className="border-border/80 from-muted/50 via-muted/20 to-muted/40 relative overflow-hidden rounded-2xl border bg-gradient-to-b p-6 shadow-lg backdrop-blur-xl md:p-8">
            {/* Card Top Specular Highlight */}
            <div className="via-primary/40 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />

            <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
              {/* Left Column: Heading & Value Prop */}
              <div className="lg:col-span-7">
                <div className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  <span>Engineering Dispatch & Changelogs</span>
                  <span className="bg-primary h-1 w-1 rounded-full" />
                  <span className="text-primary/80 font-mono text-[10px]">v2.4 LTS Radar</span>
                </div>
                <h3 className="text-foreground mt-3 text-lg font-bold tracking-tight sm:text-xl">
                  Stay Ahead with Operational Architectural Insights
                </h3>
                <p className="text-muted-foreground mt-1.5 max-w-xl text-xs leading-relaxed sm:text-sm">
                  Quarterly release notes, PostgreSQL RLS schema strategies, and zero-bullshit
                  advice for running high-margin agencies and consultancies.
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
                      className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-xs outline-none"
                      aria-label="Work email for engineering dispatch"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    className={cn(
                      "relative h-9.5 shrink-0 overflow-hidden rounded-xl px-4 text-xs font-semibold text-white transition-all duration-300",
                      subscribed
                        ? "bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:bg-emerald-600"
                        : "bg-primary hover:bg-primary-hover shadow-xs"
                    )}
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
                    {subscribed ? (
                      <span className="flex items-center gap-1.5">
                        <Check className="animate-scale-in h-3.5 w-3.5 text-white" />
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
                <div className="bg-primary text-primary-foreground relative flex h-9.5 w-9.5 items-center justify-center overflow-hidden rounded-xl border border-white/20 shadow-xs transition-transform group-hover:scale-105">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" />
                  <Layers className="relative z-10 h-5 w-5" />
                </div>
                <span className="text-foreground text-xl font-bold tracking-tight">
                  Flow<span className="text-primary font-extrabold">Pilot</span>
                </span>
              </Link>
              <p className="text-muted-foreground max-w-sm text-xs leading-relaxed sm:text-sm">
                The unified business operations platform engineered for agencies, consultancies, and
                service firms. Reconcile client CRM, calendars, team capacity, and invoicing in one
                calm workspace.
              </p>

              {/* Interactive Quick Command Palette Trigger Button */}
              <div>
                <button
                  type="button"
                  onClick={triggerCommandPalette}
                  className="group/cmd border-border/70 bg-muted/40 hover:border-primary/50 hover:bg-muted/80 text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-1.5 text-left text-xs shadow-2xs transition-all active:scale-95"
                  aria-label="Open Command Palette Search (⌘K)"
                >
                  <Command className="text-primary h-3.5 w-3.5 transition-transform group-hover/cmd:scale-110" />
                  <span>
                    Press{" "}
                    <kbd className="border-border bg-background text-foreground/80 rounded border px-1 py-0.5 font-mono text-[10px] shadow-2xs">
                      ⌘K
                    </kbd>{" "}
                    for quick command navigation
                  </span>
                  <ArrowRight className="text-primary h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover/cmd:translate-x-0 group-hover/cmd:opacity-100" />
                </button>
              </div>

              {/* Social & Developer Community Links */}
              <div className="flex items-center gap-2 pt-1">
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
                    className="group hover:text-primary inline-flex items-center gap-1.5 transition-all duration-200 hover:translate-x-1"
                  >
                    <span className="bg-primary/40 h-1 w-1 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Core Capabilities</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#features"
                    className="group hover:text-primary inline-flex items-center gap-1.5 transition-all duration-200 hover:translate-x-1"
                  >
                    <span className="bg-primary/40 h-1 w-1 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Smart Scheduling</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#features"
                    className="group hover:text-primary inline-flex items-center gap-1.5 transition-all duration-200 hover:translate-x-1"
                  >
                    <span className="bg-primary/40 h-1 w-1 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Client CRM Dossier</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#features"
                    className="group hover:text-primary inline-flex items-center gap-1.5 transition-all duration-200 hover:translate-x-1"
                  >
                    <span className="bg-primary/40 h-1 w-1 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Invoicing & Settlement</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#preview"
                    className="group hover:text-primary inline-flex items-center gap-1.5 transition-all duration-200 hover:translate-x-1"
                  >
                    <span className="bg-primary/40 h-1 w-1 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Product Preview</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#how-it-works"
                    className="group hover:text-primary inline-flex items-center gap-1.5 transition-all duration-200 hover:translate-x-1"
                  >
                    <span className="bg-primary/40 h-1 w-1 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>How It Works</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#benefits"
                    className="group hover:text-primary inline-flex items-center gap-1.5 transition-all duration-200 hover:translate-x-1"
                  >
                    <span className="bg-primary/40 h-1 w-1 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Business Benefits</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="group hover:text-primary inline-flex items-center gap-1.5 transition-all duration-200 hover:translate-x-1"
                  >
                    <span className="bg-primary/40 h-1 w-1 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Live Workspace</span>
                    <span className="bg-primary/10 text-primary border-primary/20 py-0.2 rounded-full border px-1.5 text-[10px] font-semibold">
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
                    className="group hover:text-primary inline-flex items-center gap-1.5 transition-all duration-200 hover:translate-x-1"
                  >
                    <span className="bg-primary/40 h-1 w-1 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Multi-Tenant Isolation</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#architecture"
                    className="group hover:text-primary inline-flex items-center gap-1.5 transition-all duration-200 hover:translate-x-1"
                  >
                    <span className="bg-primary/40 h-1 w-1 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Role-Based Access (RBAC)</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#architecture"
                    className="group hover:text-primary inline-flex items-center gap-1.5 transition-all duration-200 hover:translate-x-1"
                  >
                    <span className="bg-primary/40 h-1 w-1 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Typed API Contracts</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#architecture"
                    className="group hover:text-primary inline-flex items-center gap-1.5 transition-all duration-200 hover:translate-x-1"
                  >
                    <span className="bg-primary/40 h-1 w-1 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Zod Runtime Validation</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#faq"
                    className="group hover:text-primary inline-flex items-center gap-1.5 transition-all duration-200 hover:translate-x-1"
                  >
                    <span className="bg-primary/40 h-1 w-1 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Security FAQ</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#architecture"
                    className="group hover:text-primary inline-flex items-center gap-1.5 transition-all duration-200 hover:translate-x-1"
                  >
                    <span className="bg-primary/40 h-1 w-1 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Data Sovereignty Guarantee</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#architecture"
                    className="group hover:text-primary inline-flex items-center gap-1.5 transition-all duration-200 hover:translate-x-1"
                  >
                    <span className="bg-primary/40 h-1 w-1 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
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
                    className="group hover:text-primary inline-flex items-center gap-1.5 transition-all duration-200 hover:translate-x-1"
                  >
                    <span className="bg-primary/40 h-1 w-1 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Sign In</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="group text-primary inline-flex items-center gap-1.5 font-semibold transition-all duration-200 hover:translate-x-1"
                  >
                    <span className="bg-primary h-1 w-1 rounded-full opacity-100" />
                    <span>Get Started Free</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="group hover:text-primary inline-flex items-center gap-1.5 transition-all duration-200 hover:translate-x-1"
                  >
                    <span className="bg-primary/40 h-1 w-1 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Workspace Preview</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#faq"
                    className="group hover:text-primary inline-flex items-center gap-1.5 transition-all duration-200 hover:translate-x-1"
                  >
                    <span className="bg-primary/40 h-1 w-1 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>System FAQ & Migration</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="group hover:text-primary inline-flex items-center gap-1.5 transition-all duration-200 hover:translate-x-1"
                  >
                    <span className="bg-primary/40 h-1 w-1 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                    <span>Request Dedicated Tenant</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </div>

      {/* 3. Live Enterprise Telemetry Status Bar with Interactive Detail Tooltip */}
      <div className="border-border/60 bg-muted/40 relative border-t py-3 text-xs">
        <Container>
          <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
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
                <Info className="text-muted-foreground/70 h-3 w-3" />
              </div>

              {/* Hoverable Telemetry Blueprint Popover */}
              {isTelemetryHovered && (
                <div className="border-border/80 bg-surface/95 absolute bottom-full left-0 z-50 mb-2 w-[calc(100vw-32px)] max-w-xs rounded-xl border p-3 shadow-xl backdrop-blur-2xl sm:w-72">
                  <p className="text-primary text-[10px] font-bold tracking-wider uppercase">
                    Live Infrastructure Telemetry
                  </p>
                  <div className="text-muted-foreground mt-2 space-y-1.5 font-mono text-[10px]">
                    <div className="border-border/40 flex items-center justify-between border-b pb-1">
                      <span>PostgreSQL RLS:</span>
                      <span className="font-semibold text-emerald-500">Active (0ms locks)</span>
                    </div>
                    <div className="border-border/40 flex items-center justify-between border-b pb-1">
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
      <div className="border-border/60 bg-muted/20 relative border-t py-6 text-xs">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10" />
        <Container className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-muted-foreground text-center text-xs md:text-left">
            &copy; 2026 FlowPilot Inc. All rights reserved. Engineered with precision for
            professional service teams.
          </p>

          <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-6 text-xs">
            <span className="text-foreground/80 inline-flex items-center gap-1.5 font-medium">
              <ShieldCheck className="text-primary h-4 w-4" />
              Verified Architecture
            </span>
            <span className="text-muted-foreground/40 hidden sm:inline">&bull;</span>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <span className="text-muted-foreground/40 hidden sm:inline">&bull;</span>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <span className="text-muted-foreground/40 hidden sm:inline">&bull;</span>
            <span className="inline-flex items-center gap-1">
              Crafted with precision <Heart className="h-3 w-3 fill-red-500 text-red-500" />
            </span>
            <span className="text-muted-foreground/40 hidden sm:inline">&bull;</span>

            {/* Back to Top Smooth Scroll Button */}
            <button
              type="button"
              onClick={scrollToTop}
              className="group border-border/80 bg-muted/50 text-muted-foreground hover:border-primary/50 hover:bg-muted/80 hover:text-foreground relative flex h-7 cursor-pointer items-center gap-1 overflow-hidden rounded-lg border px-2.5 text-[11px] font-medium shadow-2xs transition-all active:scale-95"
              aria-label="Scroll back to top of page"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
              <span>Back to top</span>
              <ArrowUp className="text-primary h-3 w-3 transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </Container>
      </div>
    </footer>
  );
};
