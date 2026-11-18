"use client";

import * as React from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import {
  Layers,
  ArrowRight,
  ArrowUp,
  ShieldCheck,
  Heart,
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

const GitHubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    width="15"
    height="15"
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
  const [dispatchStatus, setDispatchStatus] = React.useState<"idle" | "notice">("idle");
  const [isTelemetryHovered, setIsTelemetryHovered] = React.useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Mouse glare tracking for 3D Dispatch Card
  const [cardMousePos, setCardMousePos] = React.useState({ x: 0, y: 0 });
  const [isCardHovered, setIsCardHovered] = React.useState(false);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setCardMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Dynamic copyright year (always current)
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    // Truthful feedback: Document that public automated subscription list is in preview
    setDispatchStatus("notice");
    setTimeout(() => {
      setDispatchStatus("idle");
    }, 6000);
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: shouldReduceMotion ? "auto" : "smooth",
      });
    }
  };

  const triggerCommandPalette = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "k",
          metaKey: true,
          ctrlKey: true,
          bubbles: true,
        })
      );
    }
  };

  return (
    <footer
      role="contentinfo"
      aria-label="Site Footer"
      className="relative overflow-hidden border-t border-white/[0.08] bg-gradient-to-b from-neutral-950 via-[#070b14] to-black text-neutral-400"
    >
      {/* 1. Architectural Dot-Grid Background Canvas with Radial Mask */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(rgba(56,189,248,0.12)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_50%,transparent_100%)] [background-size:30px_30px] opacity-35"
        aria-hidden="true"
      />

      {/* 2. Top Specular Horizon Beam */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
        aria-hidden="true"
      />

      {/* 3. Upper Engineering Dispatch & Product Updates Card (3D Spatial Chassis) */}
      <div className="border-b border-neutral-800/80 py-8 sm:py-12 md:py-16">
        <Container>
          <div
            onMouseMove={handleCardMouseMove}
            onMouseEnter={() => setIsCardHovered(true)}
            onMouseLeave={() => setIsCardHovered(false)}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/[0.1] bg-gradient-to-b from-neutral-900/95 via-neutral-950/98 to-black p-4 min-[360px]:p-5 sm:p-8 md:p-10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.85),0_0_70px_rgba(37,99,235,0.12)] backdrop-blur-2xl transition-all duration-300"
          >
            {/* Aerospace Corner Reticles (Hidden on mobile to preserve clean padding) */}
            <div
              className="pointer-events-none absolute top-3.5 left-4 hidden font-mono text-[9px] text-neutral-700/80 select-none sm:block"
              aria-hidden="true"
            >
              + ENG.DISPATCH // v2.4
            </div>
            <div
              className="pointer-events-none absolute top-3.5 right-4 hidden font-mono text-[9px] text-neutral-700/80 select-none sm:block"
              aria-hidden="true"
            >
              RADAR.ACTIVE // CLUSTER
            </div>

            {/* Interactive Dynamic Mouse Glare Spotlight */}
            {isCardHovered && !shouldReduceMotion && (
              <div
                className="pointer-events-none absolute -inset-px transition-opacity duration-300"
                style={{
                  background: `radial-gradient(550px circle at ${cardMousePos.x}px ${cardMousePos.y}px, rgba(56, 189, 248, 0.12), transparent 70%)`,
                }}
                aria-hidden="true"
              />
            )}

            {/* Dual Specular Top Rim Lighting */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-x-12 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent blur-[1px]"
              aria-hidden="true"
            />

            <div className="relative z-10 grid gap-6 sm:gap-8 lg:grid-cols-12 lg:items-center">
              {/* Left Column: Heading & Technical Value Proposition */}
              <div className="lg:col-span-7">
                <div className="inline-flex max-w-full flex-wrap items-center gap-1.5 sm:gap-2 rounded-full border border-neutral-700/70 bg-neutral-900/90 px-3 sm:px-3.5 py-1 sm:py-1.5 text-[10.5px] min-[360px]:text-xs font-medium text-neutral-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                  </span>
                  <span className="font-semibold tracking-wide text-white">
                    ENGINEERING DISPATCH
                  </span>
                  <span className="text-neutral-600">•</span>
                  <span className="font-mono text-[10.5px] sm:text-[11px] text-cyan-400">v2.4 LTS</span>
                  <span className="hidden text-neutral-600 sm:inline">•</span>
                  <span className="hidden font-mono text-[10px] text-neutral-400 sm:inline">
                    Quarterly Releases
                  </span>
                </div>

                <h3 className="mt-3 sm:mt-4 text-lg min-[360px]:text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent">
                    Stay Ahead with Operational Architectural Insights
                  </span>
                </h3>

                <p className="mt-2 sm:mt-2.5 max-w-xl text-xs sm:text-sm leading-relaxed text-neutral-300">
                  Quarterly release notes, server-side organization scoping patterns, and
                  architectural advice for running high-margin agencies and consultancies.
                </p>
              </div>

              {/* Right Column: Dispatch Subscription Form */}
              <div className="lg:col-span-5">
                <form
                  onSubmit={handleSubscribe}
                  className="relative flex flex-col gap-2.5 sm:flex-row sm:items-center"
                >
                  <div className="relative flex h-11 sm:h-12 min-w-0 flex-1 items-center gap-2.5 rounded-xl sm:rounded-2xl border border-neutral-700/80 bg-neutral-950/95 px-3.5 sm:px-4 text-xs shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)] transition-all duration-200 focus-within:border-cyan-500/60 focus-within:shadow-[0_0_25px_rgba(6,182,212,0.25)] focus-within:ring-1 focus-within:ring-cyan-500/40">
                    <Mail className="h-4 w-4 shrink-0 text-neutral-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="work.email@agency.com"
                      className="w-full min-w-0 bg-transparent text-xs font-medium text-white outline-none placeholder:text-neutral-500"
                      aria-label="Work email for engineering dispatch"
                    />
                  </div>

                  {/* Master Dispatch Submit Button (Linear / Stripe Quality) */}
                  <button
                    type="submit"
                    className="group focus-visible:ring-primary relative inline-flex h-11 sm:h-12 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 p-[1.5px] shadow-[0_0_25px_rgba(59,130,246,0.35),0_8px_20px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(59,130,246,0.55)] focus-visible:ring-2 focus-visible:outline-none active:scale-[0.98] sm:w-auto"
                  >
                    <div className="relative flex h-full w-full items-center justify-center gap-2 sm:gap-2.5 rounded-[9.5px] sm:rounded-[14.5px] bg-white px-5 sm:px-6 py-2.5 text-xs font-bold text-neutral-950 shadow-[inset_0_1px_1px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.12)] transition-colors group-hover:bg-neutral-50">
                      {/* Live Blue Status Pulse Diamond */}
                      <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
                        <span className="absolute h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
                        <span className="relative h-1.5 w-1.5 rounded-full bg-blue-600 shadow-[0_0_6px_rgba(37,99,235,0.8)]" />
                      </span>

                      <span className="whitespace-nowrap">Subscribe</span>

                      {/* Signature Dark Arrow Capsule */}
                      <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-lg bg-neutral-950 text-white shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-600">
                        <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </button>
                </form>

                {/* Honest Subscription Dispatch Notice */}
                {dispatchStatus === "notice" ? (
                  <div
                    role="status"
                    aria-live="polite"
                    className="mt-3 rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-2.5 font-mono text-[11px] text-cyan-300 shadow-2xs"
                  >
                    Public newsletter subscriptions opening Q2 2026. Follow our GitHub releases or
                    view Architecture documentation for current updates.
                  </div>
                ) : (
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10.5px] sm:text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1 text-emerald-400 shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>Zero spam policy</span>
                    </span>
                    <span className="text-neutral-600 hidden min-[360px]:inline">&bull;</span>
                    <span className="text-neutral-400 shrink-0">Direct engineering release notes</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* 4. Responsive 5-Column Executive Navigation Directory */}
      <nav aria-label="Footer Navigation" className="py-14 md:py-20">
        <Container>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-12 lg:gap-8 xl:gap-12">
            {/* Column 1: Brand & Purpose */}
            <div className="space-y-4 sm:col-span-2 md:col-span-12 lg:col-span-4">
              <Link
                href="/"
                className="group inline-flex items-center gap-2.5 transition-opacity hover:opacity-95"
                aria-label="FlowPilot Home"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-b from-neutral-800 to-neutral-950 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.5)] transition-transform duration-200 group-hover:scale-105">
                  <Layers className="h-5 w-5 text-cyan-400" />
                </div>
                <span className="text-xl font-extrabold tracking-tight text-white">FlowPilot</span>
              </Link>

              <p className="max-w-xs text-xs leading-relaxed text-neutral-400">
                The unified business operations platform engineered for agencies, consultancies, and
                service firms. Reconcile client CRM, scheduling, team capacity, and automated
                invoicing in one calm workspace.
              </p>

              {/* Truthful Operational Descriptor Pill */}
              <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 py-1 font-mono text-[10.5px] font-semibold text-neutral-300 shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
                <span>Organization Scoped • Typed Runtime</span>
              </div>

              {/* Aerospace Command Palette Quick Trigger Capsule Button */}
              <div>
                <button
                  type="button"
                  onClick={triggerCommandPalette}
                  title="Open Command Palette (⌘K / Ctrl+K)"
                  className="group/cmd focus-visible:ring-primary relative inline-flex cursor-pointer items-center gap-2.5 rounded-2xl border border-neutral-700/80 bg-gradient-to-b from-neutral-800/90 to-neutral-900/95 px-3.5 py-2 text-left text-xs font-medium text-neutral-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_4px_12px_rgba(0,0,0,0.4)] transition-all duration-200 hover:scale-[1.02] hover:border-cyan-500/50 hover:text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] focus-visible:ring-2 focus-visible:outline-none active:scale-95"
                  aria-label="Open Command Palette Search (⌘K)"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/15 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)] transition-transform duration-200 group-hover/cmd:scale-110">
                    <Command className="h-3 w-3" />
                  </div>
                  <span>
                    Press{" "}
                    <kbd className="rounded-md border border-neutral-600/80 bg-neutral-800 px-1.5 py-0.5 font-mono text-[10.5px] font-bold text-neutral-200 shadow-[0_2px_0_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)]">
                      ⌘K
                    </kbd>{" "}
                    for quick search
                  </span>
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-neutral-800 text-neutral-400 transition-all duration-200 group-hover/cmd:translate-x-0.5 group-hover/cmd:bg-cyan-500 group-hover/cmd:text-neutral-950">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </button>
              </div>

              {/* Social & Developer Community Frosted Jewel Icon Pods */}
              <div className="flex items-center gap-2.5 pt-2">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="GitHub Repository"
                  className="focus-visible:ring-primary relative flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-700/80 bg-gradient-to-b from-neutral-800/90 to-neutral-900/95 text-neutral-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_4px_10px_rgba(0,0,0,0.4)] transition-all duration-200 hover:scale-110 hover:border-neutral-400 hover:text-white hover:shadow-[0_0_16px_rgba(255,255,255,0.2)] focus-visible:ring-2 focus-visible:outline-none active:scale-95"
                  aria-label="GitHub Repository"
                >
                  <GitHubIcon className="h-4 w-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Twitter / X Profile"
                  className="focus-visible:ring-primary relative flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-700/80 bg-gradient-to-b from-neutral-800/90 to-neutral-900/95 text-neutral-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_4px_10px_rgba(0,0,0,0.4)] transition-all duration-200 hover:scale-110 hover:border-sky-400/60 hover:text-sky-300 hover:shadow-[0_0_16px_rgba(56,189,248,0.3)] focus-visible:ring-2 focus-visible:outline-none active:scale-95"
                  aria-label="Twitter / X Profile"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </a>
                <Link
                  href="/#architecture"
                  title="Architecture Documentation"
                  className="focus-visible:ring-primary relative flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-700/80 bg-gradient-to-b from-neutral-800/90 to-neutral-900/95 text-neutral-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_4px_10px_rgba(0,0,0,0.4)] transition-all duration-200 hover:scale-110 hover:border-cyan-400/60 hover:text-cyan-300 hover:shadow-[0_0_16px_rgba(6,182,212,0.3)] focus-visible:ring-2 focus-visible:outline-none active:scale-95"
                  aria-label="Architecture Documentation"
                >
                  <FileCode className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard"
                  title="Live Demo Workspace"
                  className="focus-visible:ring-primary relative flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-700/80 bg-gradient-to-b from-neutral-800/90 to-neutral-900/95 text-neutral-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_4px_10px_rgba(0,0,0,0.4)] transition-all duration-200 hover:scale-110 hover:border-indigo-400/60 hover:text-indigo-300 hover:shadow-[0_0_16px_rgba(99,102,241,0.3)] focus-visible:ring-2 focus-visible:outline-none active:scale-95"
                  aria-label="Live Demo Workspace"
                >
                  <Globe className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Column 2: Product Capabilities */}
            <div className="space-y-3.5 md:col-span-3 lg:col-span-2">
              <h3 className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.12em] text-white uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                <span>Product</span>
              </h3>
              <ul className="space-y-1 text-xs">
                <li>
                  <Link
                    href="/#features"
                    className="group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-cyan-400 opacity-0 shadow-[0_0_6px_rgba(6,182,212,0.8)] transition-opacity group-hover:opacity-100" />
                      <span>Core Capabilities</span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#features"
                    className="group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-cyan-400 opacity-0 shadow-[0_0_6px_rgba(6,182,212,0.8)] transition-opacity group-hover:opacity-100" />
                      <span>Smart Scheduling</span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#features"
                    className="group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-cyan-400 opacity-0 shadow-[0_0_6px_rgba(6,182,212,0.8)] transition-opacity group-hover:opacity-100" />
                      <span>Client CRM Dossier</span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#features"
                    className="group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-cyan-400 opacity-0 shadow-[0_0_6px_rgba(6,182,212,0.8)] transition-opacity group-hover:opacity-100" />
                      <span>Invoicing &amp; Settlement</span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#preview"
                    className="group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-cyan-400 opacity-0 shadow-[0_0_6px_rgba(6,182,212,0.8)] transition-opacity group-hover:opacity-100" />
                      <span>Product Preview</span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#how-it-works"
                    className="group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-cyan-400 opacity-0 shadow-[0_0_6px_rgba(6,182,212,0.8)] transition-opacity group-hover:opacity-100" />
                      <span>How It Works</span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
                      <span>Live Workspace</span>
                    </span>
                    <span className="py-0.2 rounded-md border border-emerald-500/30 bg-emerald-500/15 px-1.5 font-mono text-[9px] font-bold text-emerald-400 transition-transform duration-200 group-hover:scale-105">
                      Demo
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Architecture & Security */}
            <div className="space-y-3.5 md:col-span-3 lg:col-span-2">
              <h3 className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.12em] text-white uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
                <span>Architecture</span>
              </h3>
              <ul className="space-y-1 text-xs">
                <li>
                  <Link
                    href="/#architecture"
                    className="group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-indigo-400 opacity-0 shadow-[0_0_6px_rgba(99,102,241,0.8)] transition-opacity group-hover:opacity-100" />
                      <span>Multi-Tenant Isolation</span>
                    </span>
                    <span className="py-0.2 rounded-md border border-cyan-500/30 bg-cyan-500/15 px-1.5 font-mono text-[9px] font-bold text-cyan-400 transition-transform duration-200 group-hover:scale-105">
                      Scoped
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#architecture"
                    className="group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-indigo-400 opacity-0 shadow-[0_0_6px_rgba(99,102,241,0.8)] transition-opacity group-hover:opacity-100" />
                      <span>Organization-Scoped Access</span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#architecture"
                    className="group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-indigo-400 opacity-0 shadow-[0_0_6px_rgba(99,102,241,0.8)] transition-opacity group-hover:opacity-100" />
                      <span>Role-Based Access (RBAC)</span>
                    </span>
                    <span className="py-0.2 rounded-md border border-indigo-500/30 bg-indigo-500/15 px-1.5 font-mono text-[9px] font-bold text-indigo-400 transition-transform duration-200 group-hover:scale-105">
                      Enforced
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#architecture"
                    className="group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-indigo-400 opacity-0 shadow-[0_0_6px_rgba(99,102,241,0.8)] transition-opacity group-hover:opacity-100" />
                      <span>Typed API Contracts</span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#architecture"
                    className="group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-indigo-400 opacity-0 shadow-[0_0_6px_rgba(99,102,241,0.8)] transition-opacity group-hover:opacity-100" />
                      <span>Zod Runtime Validation</span>
                    </span>
                    <span className="py-0.2 rounded-md border border-amber-500/30 bg-amber-500/15 px-1.5 font-mono text-[9px] font-bold text-amber-400 transition-transform duration-200 group-hover:scale-105">
                      Safe
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#faq"
                    className="group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-indigo-400 opacity-0 shadow-[0_0_6px_rgba(99,102,241,0.8)] transition-opacity group-hover:opacity-100" />
                      <span>Security FAQ</span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#architecture"
                    className="group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-indigo-400 opacity-0 shadow-[0_0_6px_rgba(99,102,241,0.8)] transition-opacity group-hover:opacity-100" />
                      <span>Data Sovereignty Standards</span>
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Platform & Resources */}
            <div className="space-y-3.5 md:col-span-3 lg:col-span-2">
              <h3 className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.12em] text-white uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                <span>Resources</span>
              </h3>
              <ul className="space-y-1 text-xs">
                <li>
                  <Link
                    href="/login"
                    className="group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-amber-400 opacity-0 shadow-[0_0_6px_rgba(245,158,11,0.8)] transition-opacity group-hover:opacity-100" />
                      <span>Sign In</span>
                    </span>
                  </Link>
                </li>
                <li>
                  {/* High-Luminance Master CTA Pill Button with Signature Obsidian Pod */}
                  <Link
                    href="/register"
                    className="group focus-visible:ring-primary relative inline-flex w-full items-center justify-between overflow-hidden rounded-xl border border-blue-400/40 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-3.5 py-2 text-xs font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.35),inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(37,99,235,0.6)] focus-visible:ring-2 focus-visible:outline-none active:scale-[0.98]"
                  >
                    {/* Top Specular Edge */}
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                      aria-hidden="true"
                    />

                    <span>Get Started Free</span>

                    {/* Signature Dark Arrow Capsule */}
                    <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-neutral-950/40 shadow-xs backdrop-blur-xs transition-all duration-200 group-hover:translate-x-0.5 group-hover:bg-neutral-950/70">
                      <ArrowRight className="h-3 w-3 text-white transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#cta"
                    className="group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-cyan-400 opacity-0 shadow-[0_0_6px_rgba(6,182,212,0.8)] transition-opacity group-hover:opacity-100" />
                      <span>Workspace Provisioner</span>
                    </span>
                    <span className="py-0.2 rounded-md border border-cyan-500/30 bg-cyan-500/15 px-1.5 font-mono text-[9px] font-bold text-cyan-400 transition-transform duration-200 group-hover:scale-105">
                      Instant
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#benefits"
                    className="group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-amber-400 opacity-0 shadow-[0_0_6px_rgba(245,158,11,0.8)] transition-opacity group-hover:opacity-100" />
                      <span>Business Benefits</span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#faq"
                    className="group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-amber-400 opacity-0 shadow-[0_0_6px_rgba(245,158,11,0.8)] transition-opacity group-hover:opacity-100" />
                      <span>System FAQ &amp; Migration</span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-amber-400 opacity-0 shadow-[0_0_6px_rgba(245,158,11,0.8)] transition-opacity group-hover:opacity-100" />
                      <span>Interactive Sandbox</span>
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 5: Legal & Governance */}
            <div className="space-y-3.5 md:col-span-3 lg:col-span-2">
              <h3 className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.12em] text-white uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                <span>Governance</span>
              </h3>
              <ul className="space-y-1 text-xs">
                <li>
                  <Link
                    href="/login"
                    className="group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-emerald-400 opacity-0 shadow-[0_0_6px_rgba(16,185,129,0.8)] transition-opacity group-hover:opacity-100" />
                      <span>Privacy Policy</span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-emerald-400 opacity-0 shadow-[0_0_6px_rgba(16,185,129,0.8)] transition-opacity group-hover:opacity-100" />
                      <span>Terms of Service</span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#architecture"
                    className="group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-emerald-400 opacity-0 shadow-[0_0_6px_rgba(16,185,129,0.8)] transition-opacity group-hover:opacity-100" />
                      <span>Security Statement</span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#architecture"
                    className="group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-emerald-400 opacity-0 shadow-[0_0_6px_rgba(16,185,129,0.8)] transition-opacity group-hover:opacity-100" />
                      <span>Tenant Boundary Audit</span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#faq"
                    className="group relative flex items-center justify-between rounded-xl px-2.5 py-1.5 font-medium text-neutral-400 transition-all duration-200 hover:bg-neutral-800/50 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-emerald-400 opacity-0 shadow-[0_0_6px_rgba(16,185,129,0.8)] transition-opacity group-hover:opacity-100" />
                      <span>Compliance Inquiries</span>
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </nav>

      {/* 5. Mission Control Telemetry Status Bar */}
      <div className="relative border-t border-neutral-800/80 bg-neutral-950/80 py-3.5 sm:py-4 text-xs backdrop-blur-xl">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[10.5px] sm:text-[11px] text-neutral-400">
            {/* Operational Signal (Hoverable & Touch-Clickable for Architectural Telemetry Details) */}
            <div
              role="button"
              tabIndex={0}
              aria-haspopup="dialog"
              aria-expanded={isTelemetryHovered}
              aria-label="Toggle Infrastructure Specifications Telemetry"
              className="group/telemetry focus-visible:ring-primary relative cursor-pointer rounded-lg outline-none focus-visible:ring-1"
              onClick={() => setIsTelemetryHovered((prev) => !prev)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsTelemetryHovered((prev) => !prev);
                }
              }}
              onMouseEnter={() => setIsTelemetryHovered(true)}
              onMouseLeave={() => setIsTelemetryHovered(false)}
            >
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
                </span>
                <span className="font-semibold text-white whitespace-nowrap">
                  <span className="hidden min-[360px]:inline">Operational Status: Active</span>
                  <span className="min-[360px]:hidden">Status: Active</span>
                </span>
                <span className="text-neutral-600 hidden min-[480px]:inline">&bull;</span>
                <span className="text-neutral-300 hidden min-[480px]:inline whitespace-nowrap">
                  Calm Enterprise Architecture
                </span>
                <Info className="h-3.5 w-3.5 shrink-0 text-neutral-500 transition-colors group-hover/telemetry:text-neutral-300 ml-0.5" />
              </div>

              {/* Hoverable Telemetry Blueprint Popover */}
              {isTelemetryHovered && (
                <div
                  role="region"
                  aria-label="Infrastructure Specifications"
                  className="absolute bottom-full left-0 z-50 mb-3 w-[calc(100vw-32px)] max-w-xs rounded-2xl border border-neutral-700/80 bg-neutral-900/98 p-3.5 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_30px_rgba(16,185,129,0.1)] backdrop-blur-2xl sm:w-80"
                >
                  {/* Top Specular Edge */}
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"
                    aria-hidden="true"
                  />
                  <p className="text-[10px] font-bold tracking-wider text-white uppercase">
                    Infrastructure Specifications
                  </p>
                  <div className="mt-2.5 space-y-2 font-mono text-[10.5px] text-neutral-300">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                      <span className="text-neutral-400">Tenant Boundary:</span>
                      <span className="font-semibold text-emerald-400">Organization Scoped</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                      <span className="text-neutral-400">Contract Validation:</span>
                      <span className="font-semibold text-white">Zod Safe Runtime</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                      <span className="text-neutral-400">Server Engine:</span>
                      <span className="font-semibold text-white">Next.js 16 App Router</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Database Engine:</span>
                      <span className="font-semibold text-white">PostgreSQL + Prisma</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Architectural Telemetry Badges (Truthful & Verified) */}
            <div className="hidden items-center gap-3.5 sm:flex">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 px-2.5 py-1 text-neutral-300 shadow-2xs">
                <Database className="h-3 w-3 text-emerald-400" />
                <span>Organization-Scoped Queries</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 px-2.5 py-1 text-neutral-300 shadow-2xs">
                <Lock className="h-3 w-3 text-cyan-400" />
                <span>Role-Based Team Access</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 px-2.5 py-1 text-neutral-300 shadow-2xs">
                <Activity className="h-3 w-3 text-indigo-400" />
                <span>Runtime Type Validation</span>
              </span>
            </div>
          </div>
        </Container>
      </div>

      {/* 6. Lower Copyright, Compliance & Tactile Back-To-Top Bar */}
      <div className="relative border-t border-neutral-800/80 bg-black/60 py-6 sm:py-8 text-xs">
        <Container className="flex flex-col items-center justify-between gap-5 sm:gap-6 lg:flex-row">
          {/* Left Block: Dynamic Copyright & Legal Links */}
          <div className="flex flex-col items-center gap-2.5 sm:gap-3 text-center sm:flex-row sm:text-left">
            <p className="text-xs text-neutral-400">
              &copy; {currentYear} FlowPilot Inc. All rights reserved. Engineered for service teams.
            </p>
            <span className="hidden text-neutral-700 sm:inline">&bull;</span>
            <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 text-xs text-neutral-400 sm:justify-start">
              <Link
                href="/login"
                className="whitespace-nowrap transition-colors hover:text-white focus-visible:underline focus-visible:outline-none"
              >
                Privacy Policy
              </Link>
              <span className="text-neutral-700">&bull;</span>
              <Link
                href="/login"
                className="whitespace-nowrap transition-colors hover:text-white focus-visible:underline focus-visible:outline-none"
              >
                Terms of Service
              </Link>
              <span className="text-neutral-700">&bull;</span>
              <span className="inline-flex items-center gap-1 whitespace-nowrap text-neutral-400">
                <span>Crafted with</span>
                <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
              </span>
            </div>
          </div>

          {/* Right Block: Verified Architecture Jewel Badge & Tactile Back-To-Top */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
            {/* Verified Architecture Jewel Badge */}
            <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border border-emerald-500/40 bg-gradient-to-b from-emerald-500/15 to-emerald-500/5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.25),inset_0_1px_0_rgba(255,255,255,0.1)]">
              <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 shrink-0" />
              <span>Verified Architecture</span>
            </span>

            {/* Tactile Back to Top Executive Rocker Switch Button */}
            <button
              type="button"
              onClick={scrollToTop}
              className="group focus-visible:ring-primary relative inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-neutral-700/90 bg-gradient-to-b from-neutral-800 to-neutral-900 px-3.5 sm:px-4 py-2 text-[11px] sm:text-xs font-bold text-neutral-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_4px_12px_rgba(0,0,0,0.5)] transition-all duration-200 hover:scale-105 hover:border-cyan-400/60 hover:text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.35)] focus-visible:ring-2 focus-visible:outline-none active:scale-95"
              aria-label="Scroll back to top of page"
            >
              <span>Back to top</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-lg border border-neutral-700/80 bg-neutral-950 text-neutral-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-cyan-400 group-hover:bg-cyan-500 group-hover:text-neutral-950">
                <ArrowUp className="h-3 w-3" />
              </span>
            </button>
          </div>
        </Container>
      </div>
    </footer>
  );
};
