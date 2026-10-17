"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Users,
  Calendar,
  ShieldCheck,
  FileText,
  Check,
  Lock,
  Unlock,
  ArrowRight,
  Clock,
  Sparkles,
  CreditCard,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";

/**
 * 3D Spatial Glass Container with Mouse Parallax & Specular Rim Light
 */
interface SpatialGlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

const SpatialGlassCard: React.FC<SpatialGlassCardProps> = ({
  children,
  className = "",
  glowColor = "rgba(49, 95, 232, 0.12)",
}) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
      }}
      className={`relative ${className}`}
    >
      {/* Subtle Ambient Glow Mesh */}
      <div
        className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl blur-2xl transition-opacity duration-500"
        style={{
          background: glowColor,
          opacity: isHovered ? 0.45 : 0.2,
        }}
        aria-hidden="true"
      />

      {/* 3D Tilting Glass Box */}
      <div
        style={{
          transform:
            shouldReduceMotion || !isHovered
              ? "none"
              : `rotateY(${mousePos.x * 5}deg) rotateX(${-mousePos.y * 5}deg) translateZ(8px)`,
          transition: "transform 0.16s cubic-bezier(0.16, 1, 0.3, 1)",
          transformStyle: "preserve-3d",
        }}
        className="group border-border/80 bg-surface/90 hover:border-primary/40 relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md sm:p-8"
      >
        {/* Specular Rim Highlight Light Beam */}
        <div
          className="pointer-events-none absolute inset-x-8 top-0 z-20 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent transition-opacity duration-300 group-hover:via-white"
          aria-hidden="true"
        />

        {/* Dynamic Cursor Spotlight Glare */}
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(400px circle at ${(mousePos.x + 0.5) * 100}% ${(mousePos.y + 0.5) * 100}%, rgba(255, 255, 255, 0.1), transparent 60%)`,
          }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-between">{children}</div>
      </div>
    </div>
  );
};

export const CoreCapabilitiesSection: React.FC = () => {
  // Card 1: Scheduling Buffer Interactive Slider
  const [schedulingBuffer, setSchedulingBuffer] = React.useState<0 | 15 | 30>(15);

  // Card 2: RBAC Interactive Role Toggle
  const [activeRole, setActiveRole] = React.useState<"owner" | "staff">("owner");

  // Card 3: CRM Client Profile Toggle
  const [selectedClient, setSelectedClient] = React.useState<"apex" | "meridian">("apex");

  // Card 4: Invoicing Simulation State
  const [isSettled, setIsSettled] = React.useState(false);

  return (
    <section id="features" className="relative scroll-mt-20 overflow-hidden py-20 md:py-28">
      {/* Subtle Background Glow Mesh */}
      <div
        className="from-primary/10 pointer-events-none absolute inset-x-0 top-1/3 -z-10 mx-auto h-[500px] w-full max-w-6xl rounded-full bg-gradient-to-tr via-cyan-400/5 to-indigo-600/5 opacity-30 blur-3xl"
        aria-hidden="true"
      />

      <Container>
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 text-primary px-4 py-1 text-xs font-semibold backdrop-blur-xl"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              <span>Core Capabilities</span>
            </Badge>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-foreground mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl"
          >
            Engineered for Every Stage of Service Delivery
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg"
          >
            FlowPilot replaces fragmented point tools with a calm, integrated operations engine.
            Experience the real architectural mechanics below.
          </motion.p>
        </div>

        {/* ========================================================================= */}
        {/* ASYMMETRIC 3D BENTO SHOWCASE GRID */}
        {/* ========================================================================= */}
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* ======================================================================= */}
          {/* CARD 1: APPOINTMENT SCHEDULING (BENTO HERO - 7 COLS) */}
          {/* ======================================================================= */}
          <SpatialGlassCard className="lg:col-span-7" glowColor="rgba(16, 185, 129, 0.25)">
            <div>
              {/* Card Meta & Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-[0_0_24px_rgba(16,185,129,0.30)]">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-600"
                    >
                      Appointment Scheduling
                    </Badge>
                    <p className="text-muted-foreground text-[11px] font-medium">
                      Intelligent Service Calendars
                    </p>
                  </div>
                </div>

                {/* Interactive Dynamic Buffer Mode Switcher */}
                <div className="border-border/70 bg-background/90 flex items-center gap-1.5 rounded-full border p-1 text-xs shadow-2xs">
                  <span className="text-muted-foreground pl-2 text-[10px] font-bold tracking-wider uppercase">
                    Buffer:
                  </span>
                  {([0, 15, 30] as const).map((mins) => {
                    const isSelected = schedulingBuffer === mins;
                    return (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setSchedulingBuffer(mins)}
                        className="relative rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-colors"
                      >
                        {isSelected && (
                          <motion.span
                            layoutId="active-buffer-pill"
                            transition={{ type: "spring", stiffness: 500, damping: 35 }}
                            className={`absolute inset-0 rounded-full shadow-xs ${
                              mins === 0 ? "bg-rose-500" : "bg-emerald-600"
                            }`}
                          />
                        )}
                        <span
                          className={`relative z-10 transition-colors ${
                            isSelected
                              ? "text-white"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {mins === 0 ? "0m" : `+${mins}m`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <h3 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                Coordinated Service Calendars with Buffer Intelligence
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Zero calendar collisions, no awkward email ping-pong, and guaranteed rest gaps
                between high-stakes client strategy calls.
              </p>

              {/* 3D HOLOGRAPHIC TIMELINE CANVAS */}
              <div className="border-border/80 bg-background/95 relative mt-6 space-y-3 overflow-hidden rounded-2xl border p-4.5 shadow-sm backdrop-blur-xl">
                {/* Specular Top Rim */}
                <div
                  className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent"
                  aria-hidden="true"
                />

                {/* Meeting Block 1 */}
                <div className="border-border/70 bg-surface/90 shadow-2xs flex flex-col justify-between gap-2 rounded-xl border p-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="from-primary/20 to-indigo-600/10 text-primary border-primary/20 flex h-9.5 w-9.5 items-center justify-center rounded-xl border bg-gradient-to-br font-mono text-xs font-bold shadow-2xs">
                      09:00
                    </div>
                    <div>
                      <p className="text-foreground text-xs font-bold">Enterprise Strategy Call</p>
                      <p className="text-muted-foreground text-[11px]">
                        Apex Solutions &bull; Lead: Sarah Chen (60m)
                      </p>
                    </div>
                  </div>
                  <span className="self-start rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-emerald-600 sm:self-center">
                    09:00 – 10:00 AM
                  </span>
                </div>

                {/* The Dynamic Neon Buffer Wave */}
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-xl border border-dashed px-3.5 sm:px-4 py-2.5 transition-all duration-300 ${
                    schedulingBuffer === 0
                      ? "border-rose-500/60 bg-rose-500/10 text-rose-600"
                      : "border-emerald-500/60 bg-emerald-500/15 text-emerald-700 shadow-[0_0_20px_rgba(16,185,129,0.16)] dark:text-emerald-300"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold">
                    {schedulingBuffer === 0 ? (
                      <AlertTriangle className="h-4 w-4 animate-bounce text-rose-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-emerald-500" />
                    )}
                    <span>
                      {schedulingBuffer === 0
                        ? "⚠️ Alert: 0m Buffer (High burnout risk & back-to-back overlap)"
                        : `✓ Protected Buffer (+${schedulingBuffer}m Rest & Recovery Gap)`}
                    </span>
                  </div>
                  <span className="bg-background rounded-full px-2.5 py-0.5 font-mono text-[10px] font-extrabold shadow-2xs">
                    {schedulingBuffer === 0
                      ? "0m Gap"
                      : `10:00 – 10:${schedulingBuffer.toString().padStart(2, "0")} AM`}
                  </span>
                </motion.div>

                {/* Meeting Block 2 */}
                <div className="border-border/70 bg-surface/90 shadow-2xs flex flex-col justify-between gap-2 rounded-xl border p-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9.5 w-9.5 items-center justify-center rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/15 to-blue-500/5 font-mono text-xs font-bold text-blue-600 shadow-2xs">
                      {schedulingBuffer === 0
                        ? "10:00"
                        : schedulingBuffer === 15
                          ? "10:15"
                          : "10:30"}
                    </div>
                    <div>
                      <p className="text-foreground text-xs font-bold">Architecture Review</p>
                      <p className="text-muted-foreground text-[11px]">
                        Meridian Health &bull; Lead: Marcus Vance (45m)
                      </p>
                    </div>
                  </div>
                  <span className="self-start rounded-full bg-blue-500/10 px-2 py-0.5 font-mono text-[11px] font-bold text-blue-600 sm:self-center">
                    {schedulingBuffer === 0 && "10:00 – 10:45 AM"}
                    {schedulingBuffer === 15 && "10:15 – 11:00 AM"}
                    {schedulingBuffer === 30 && "10:30 – 11:15 AM"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Feature Pills */}
            <div className="border-border/60 mt-6 flex flex-wrap items-center gap-2 border-t pt-4 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-600">
                <Check className="h-3.5 w-3.5" /> Automatic Buffer Intervals
              </span>
              <span className="bg-surface text-foreground/85 border-border/80 inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                <Check className="h-3.5 w-3.5 text-emerald-500" /> 6 Consultants Synchronized
              </span>
              <span className="bg-surface text-foreground/85 border-border/80 inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                <Check className="h-3.5 w-3.5 text-emerald-500" /> Auto-Timezone Normalization
              </span>
            </div>
          </SpatialGlassCard>

          {/* ======================================================================= */}
          {/* CARD 2: WORKSPACE & RBAC GOVERNANCE (BENTO PILLAR - 5 COLS) */}
          {/* ======================================================================= */}
          <SpatialGlassCard className="lg:col-span-5" glowColor="rgba(245, 158, 11, 0.25)">
            <div>
              {/* Card Meta & Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 shadow-[0_0_24px_rgba(245,158,11,0.30)]">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className="border-amber-500/30 bg-amber-500/10 text-xs font-semibold text-amber-600"
                    >
                      Workspace & Team Governance
                    </Badge>
                    <p className="text-muted-foreground text-[11px] font-medium">
                      Multi-Tenant Isolation
                    </p>
                  </div>
                </div>

                {/* Tactile 3D Physical Role Switcher */}
                <div className="border-border/70 bg-background/90 flex items-center rounded-full border p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setActiveRole("owner")}
                    className="relative rounded-full px-3 py-1 text-xs font-bold transition-colors"
                  >
                    {activeRole === "owner" && (
                      <motion.span
                        layoutId="active-rbac-role-pill"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        className="absolute inset-0 rounded-full bg-amber-500 shadow-xs"
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors ${
                        activeRole === "owner"
                          ? "text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Owner View
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveRole("staff")}
                    className="relative rounded-full px-3 py-1 text-xs font-bold transition-colors"
                  >
                    {activeRole === "staff" && (
                      <motion.span
                        layoutId="active-rbac-role-pill"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        className="absolute inset-0 rounded-full bg-rose-500 shadow-xs"
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors ${
                        activeRole === "staff"
                          ? "text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Staff View
                    </span>
                  </button>
                </div>
              </div>

              <h3 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                Granular Role-Based Access & Workspace Isolation
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Click toggle above to test how FlowPilot dynamically isolates confidential payroll
                and invoices from regular team members.
              </p>

              {/* 3D HOLOGRAPHIC PERMISSION VAULT */}
              <div className="border-border/80 bg-background/95 relative mt-6 overflow-hidden rounded-2xl border p-4.5 shadow-sm backdrop-blur-xl">
                {/* Specular Top Rim */}
                <div
                  className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent"
                  aria-hidden="true"
                />
                <div className="space-y-3">
                  {/* Public CRM Scope */}
                  <div className="border-border/70 bg-surface/90 shadow-2xs flex items-center justify-between rounded-xl border p-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                        <Unlock className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-foreground font-semibold">
                        Client Dossiers & Bookings
                      </span>
                    </div>
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                      Full Access
                    </span>
                  </div>

                  {/* Confidential Financial Scope (Shuttered on Staff View) */}
                  <div className="border-border/70 bg-surface/90 shadow-2xs relative overflow-hidden rounded-xl border p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                            activeRole === "owner"
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-rose-500/10 text-rose-600"
                          }`}
                        >
                          {activeRole === "owner" ? (
                            <Unlock className="h-3.5 w-3.5" />
                          ) : (
                            <Lock className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <span className="text-foreground font-semibold">
                          Financial Margins & Invoicing
                        </span>
                      </div>

                      {activeRole === "owner" ? (
                        <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                          $48,250 MTD Visible
                        </span>
                      ) : (
                        <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-bold text-rose-600">
                          Confidential 🔒
                        </span>
                      )}
                    </div>

                    {/* Dynamic Frosted Blur Shutter for Staff */}
                    <AnimatePresence>
                      {activeRole === "staff" && (
                        <motion.div
                          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                          animate={{ opacity: 1, backdropFilter: "blur(6px)" }}
                          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                          className="bg-background/85 absolute inset-0 flex items-center justify-center font-mono text-[11px] font-bold text-rose-600 backdrop-blur-md"
                        >
                          <Lock className="mr-1.5 h-3.5 w-3.5" />
                          <span>RESTRICTED: Admin Permission Required</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Security Specs */}
                  <div className="border-border/50 text-muted-foreground flex items-center justify-between border-t pt-2.5 text-[10px]">
                    <span>PostgreSQL RLS Multi-Tenant Isolation</span>
                    <span className="font-semibold text-emerald-600">
                      ✓ Zero Cross-Tenant Leakage
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Feature Pills */}
            <div className="border-border/60 mt-6 flex flex-wrap items-center gap-2 border-t pt-4 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-amber-600">
                <Check className="h-3.5 w-3.5" /> Owner, Admin & Staff Tiers
              </span>
              <span className="bg-surface text-foreground/85 border-border/80 inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                <Check className="h-3.5 w-3.5 text-amber-500" /> Multi-Tenant Scoping
              </span>
            </div>
          </SpatialGlassCard>

          {/* ======================================================================= */}
          {/* CARD 3: CLIENT RELATIONSHIP MANAGEMENT (BENTO 5 COLS) */}
          {/* ======================================================================= */}
          <SpatialGlassCard className="lg:col-span-5" glowColor="rgba(49, 95, 232, 0.25)">
            <div>
              {/* Card Meta & Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 shadow-[0_0_24px_rgba(49,95,232,0.30)]">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className="border-blue-500/30 bg-blue-500/10 text-xs font-semibold text-blue-600"
                    >
                      Client Relationship Management
                    </Badge>
                    <p className="text-muted-foreground text-[11px] font-medium">
                      Living Intelligence Dossier
                    </p>
                  </div>
                </div>

                {/* Tactile 3D Client Profile Selector */}
                <div className="border-border/70 bg-background/90 flex items-center rounded-full border p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setSelectedClient("apex")}
                    className="relative rounded-full px-3 py-1 text-xs font-bold transition-colors"
                  >
                    {selectedClient === "apex" && (
                      <motion.span
                        layoutId="active-crm-client-pill"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        className="bg-primary absolute inset-0 rounded-full shadow-xs"
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors ${
                        selectedClient === "apex"
                          ? "text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Apex
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedClient("meridian")}
                    className="relative rounded-full px-3 py-1 text-xs font-bold transition-colors"
                  >
                    {selectedClient === "meridian" && (
                      <motion.span
                        layoutId="active-crm-client-pill"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        className="bg-primary absolute inset-0 rounded-full shadow-xs"
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors ${
                        selectedClient === "meridian"
                          ? "text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Meridian
                    </span>
                  </button>
                </div>
              </div>

              <h3 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                Centralized Client Dossier & Historical Context
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Consolidates communication history, service contracts, and lifetime revenue under
                one tenant-isolated dashboard.
              </p>

              {/* 3D HOLOGRAPHIC CLIENT DOSSIER CARD WITH SMOOTH CROSSFADE */}
              <div className="border-border/80 bg-background/95 relative mt-6 overflow-hidden rounded-2xl border p-4.5 shadow-sm backdrop-blur-xl">
                {/* Specular Top Rim */}
                <div
                  className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent"
                  aria-hidden="true"
                />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedClient}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="border-border/60 flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-3">
                        <div className="from-primary/20 to-indigo-600/10 text-primary border-primary/25 shadow-2xs flex h-10 w-10 items-center justify-center rounded-xl border bg-gradient-to-br font-mono text-xs font-bold">
                          {selectedClient === "apex" ? "AS" : "MH"}
                        </div>
                        <div>
                          <p className="text-foreground text-xs font-bold">
                            {selectedClient === "apex"
                              ? "Apex Solutions Inc."
                              : "Meridian Health Group"}
                          </p>
                          <p className="text-muted-foreground text-[11px]">
                            Lead: {selectedClient === "apex" ? "Sarah Chen" : "Marcus Vance"}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-bold text-blue-600">
                        VIP Retainer
                      </span>
                    </div>

                    <div className="mt-3.5 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-surface/90 border-border/80 shadow-2xs relative overflow-hidden rounded-xl border p-2.5">
                        <div className="pointer-events-none absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" aria-hidden="true" />
                        <span className="text-muted-foreground block text-[10px] font-medium">
                          LTV Value
                        </span>
                        <span className="text-foreground font-mono text-xs sm:text-sm font-extrabold truncate block">
                          {selectedClient === "apex" ? "$34,850.00" : "$52,400.00"}
                        </span>
                      </div>
                      <div className="bg-surface/90 border-border/80 shadow-2xs relative overflow-hidden rounded-xl border p-2.5">
                        <div className="pointer-events-none absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" aria-hidden="true" />
                        <span className="text-muted-foreground block text-[10px] font-medium">
                          Health Score
                        </span>
                        <span className="flex items-center justify-center gap-1 font-bold text-emerald-600 text-xs sm:text-sm">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                          {selectedClient === "apex" ? "98%" : "94%"}
                        </span>
                      </div>
                      <div className="bg-surface/90 border-border/80 shadow-2xs relative overflow-hidden rounded-xl border p-2.5">
                        <div className="pointer-events-none absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" aria-hidden="true" />
                        <span className="text-muted-foreground block text-[10px] font-medium">
                          Renewal
                        </span>
                        <span className="text-foreground text-[10px] sm:text-[11px] font-bold truncate block">
                          Auto-renews Q4
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="border-border/50 text-muted-foreground mt-3 flex items-center justify-between border-t pt-2.5 text-[10px]">
                  <span className="line-through">Scattered across 5 email threads</span>
                  <span className="font-semibold text-blue-600">✓ 1 Unified Dossier</span>
                </div>
              </div>
            </div>

            {/* Quick Feature Pills */}
            <div className="border-border/60 mt-6 flex flex-wrap items-center gap-2 border-t pt-4 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-blue-600">
                <Check className="h-3.5 w-3.5" /> Tenant-Isolated Customer Records
              </span>
              <span className="bg-surface text-foreground/85 border-border/80 inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                <Check className="h-3.5 w-3.5 text-blue-500" /> Direct Conversion to Bookings
              </span>
            </div>
          </SpatialGlassCard>

          {/* ======================================================================= */}
          {/* CARD 4: INVOICING & BILLING (BENTO 7 COLS) */}
          {/* ======================================================================= */}
          <SpatialGlassCard className="lg:col-span-7" glowColor="rgba(6, 182, 212, 0.25)">
            <div>
              {/* Card Meta & Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 shadow-[0_0_24px_rgba(6,182,212,0.30)]">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className="border-cyan-500/30 bg-cyan-500/10 text-xs font-semibold text-cyan-600"
                    >
                      Invoicing & Billing
                    </Badge>
                    <p className="text-muted-foreground text-[11px] font-medium">
                      Cashflow Automation
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-600">
                  Stripe Connected
                </span>
              </div>

              <h3 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                Appointment-Linked Invoicing & Cash Flow Control
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                Click the simulation button below to experience instant 1-click conversion from
                delivered hours into auto-reconciled Stripe payouts.
              </p>

              {/* 3D HOLOGRAPHIC INVOICE SETTLEMENT TERMINAL */}
              <div className="border-border/80 bg-background/95 relative mt-6 overflow-hidden rounded-2xl border p-4.5 shadow-sm backdrop-blur-xl">
                {/* Specular Top Rim */}
                <div
                  className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent"
                  aria-hidden="true"
                />

                {/* 3-Step Pipeline Flow */}
                <div className="border-border/60 flex items-center justify-between border-b pb-3 text-xs">
                  <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Delivered</span>
                  </div>
                  <ArrowRight className="text-muted-foreground h-3.5 w-3.5" />
                  <div className="flex items-center gap-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 font-bold text-cyan-600">
                    <FileText className="h-3.5 w-3.5" />
                    <span>#FP-10892</span>
                  </div>
                  <ArrowRight className="text-muted-foreground h-3.5 w-3.5" />
                  <div className="flex items-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 font-bold text-indigo-600">
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Stripe Payout</span>
                  </div>
                </div>

                {/* Line Item Card */}
                <motion.div
                  layout
                  className={`mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border p-3.5 text-xs transition-colors duration-300 ${
                    isSettled
                      ? "border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.14)]"
                      : "border-border/80 bg-surface/90 shadow-2xs"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-foreground font-semibold">
                        Monthly Strategic Advisory Retainer
                      </p>
                      {isSettled && (
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                          Disbursed
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-[10px]">
                      20 verified hours @ $175/hr &bull; Client: Apex Solutions
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-foreground font-mono text-base font-extrabold">
                      $3,500.00
                    </span>
                    <span className="text-muted-foreground block text-[10px]">
                      Net 0% Dispute Risk
                    </span>
                  </div>
                </motion.div>

                {/* Interactive Instant Settlement Button */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs font-semibold">
                      One-Click Cash Flow:
                    </span>
                    {isSettled && (
                      <button
                        type="button"
                        onClick={() => setIsSettled(false)}
                        className="text-muted-foreground hover:text-foreground text-[10px] font-semibold underline underline-offset-2 transition-colors"
                      >
                        Reset Simulation
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSettled((prev) => !prev)}
                    className={`relative inline-flex items-center gap-2 overflow-hidden rounded-full px-5 py-2 text-xs font-extrabold shadow-md transition-all duration-300 ${
                      isSettled
                        ? "bg-emerald-600 text-white shadow-emerald-500/25"
                        : "from-primary shadow-primary/30 bg-gradient-to-r via-blue-600 to-indigo-600 text-white hover:scale-105"
                    }`}
                  >
                    {isSettled ? (
                      <>
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                        <span>✓ Settled via Stripe Connect</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5" />
                        <span>Simulate 1-Click Settlement</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Holographic Paid Stamp Overlay */}
                <AnimatePresence>
                  {isSettled && (
                    <motion.div
                      initial={{ scale: 2, opacity: 0, rotate: -25 }}
                      animate={{ scale: 1, opacity: 1, rotate: -8 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className="pointer-events-none absolute top-4 right-4 rounded-xl border-2 border-emerald-500 bg-emerald-500/15 px-3 py-1 shadow-lg backdrop-blur-md"
                    >
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <Check className="h-4 w-4 stroke-[3]" />
                        <span className="font-mono text-xs font-black tracking-wider uppercase">
                          PAID & RECONCILED
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Quick Feature Pills */}
            <div className="border-border/60 mt-6 flex flex-wrap items-center gap-2 border-t pt-4 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-cyan-600">
                <Check className="h-3.5 w-3.5" /> 1-Click Appointment-to-Invoice
              </span>
              <span className="bg-surface text-foreground/85 border-border/80 inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                <Check className="h-3.5 w-3.5 text-cyan-500" /> Itemized Taxes & Line Items
              </span>
            </div>
          </SpatialGlassCard>
        </div>
      </Container>
    </section>
  );
};
