"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Server,
  FileCode,
  CheckCircle2,
  Sparkles,
  Terminal,
  Check,
  CheckCheck,
  Download,
  RefreshCw,
  FileArchive,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";

/**
 * 3D Spatial Glass Card Container with Mouse Parallax & Specular Rim Light
 */
interface SpatialGlassCardProps {
  children: React.ReactNode;
  glowColor?: string;
  className?: string;
}

const SpatialGlassCard: React.FC<SpatialGlassCardProps> = ({
  children,
  glowColor = "rgba(49, 95, 232, 0.12)",
  className = "",
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

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0, y: 0 });
      }}
      style={{ perspective: 1000 }}
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

      {/* 3D Tilting Glass Card */}
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
          className="pointer-events-none absolute inset-x-8 top-0 z-20 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent transition-opacity duration-300 group-hover:via-white dark:via-white/25 dark:group-hover:via-white/50"
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

export const ArchitectureTrustSection: React.FC = () => {
  // Pillar 1: Tenant Shard Switcher
  const [activeTenant, setActiveTenant] = React.useState<"apex" | "meridian">("apex");

  // Pillar 2: RBAC Matrix Role Switcher
  const [selectedRole, setSelectedRole] = React.useState<"owner" | "admin" | "staff" | "billing">(
    "owner"
  );

  // Pillar 3: API Runtime Contract Simulation ("valid" vs "malformed")
  const [apiContractMode, setApiContractMode] = React.useState<"valid" | "malformed">("valid");

  // Pillar 4: Data Export Simulation
  const [isExporting, setIsExporting] = React.useState(false);
  const [isExportReady, setIsExportReady] = React.useState(false);

  const handleSimulateExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setIsExportReady(true);
    }, 1200);
  };

  return (
    <section
      id="architecture"
      className="border-border/70 bg-surface/40 relative scroll-mt-20 overflow-hidden border-t py-20 md:py-28"
    >
      {/* Background Holographic Glow Mesh & Dot Grid Matrix */}
      <div
        className="from-primary/10 pointer-events-none absolute inset-x-0 top-1/4 -z-10 mx-auto h-[600px] w-full max-w-6xl rounded-full bg-gradient-to-br via-indigo-500/10 to-cyan-400/10 opacity-65 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(#315fe8_1px,transparent_1px)] [background-size:24px_24px] opacity-20"
        aria-hidden="true"
      />

      <Container>
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="outline"
            className="border-primary/30 bg-primary/10 text-primary px-4 py-1 text-xs font-semibold backdrop-blur-xl"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            <span>Architecture & Security</span>
          </Badge>

          <h2 className="text-foreground mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Built with Engineering Discipline from Day One
          </h2>

          <p className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg">
            Transparent architectural integrity ensuring your business operations remain secure,
            isolated, and highly reliable. Explore our verifiable security standards below.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* TOP LIVE SECURITY COMPLIANCE STRIP */}
        {/* ========================================================================= */}
        <div className="border-border/70 bg-surface/85 relative mt-10 grid grid-cols-2 gap-3 overflow-hidden rounded-2xl border p-4 shadow-sm backdrop-blur-xl sm:grid-cols-4 sm:p-5">
          <div
            className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
            aria-hidden="true"
          />
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-foreground text-xs font-bold">PostgreSQL Row-Level Security</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-foreground text-xs font-bold">Multi-Tenant Isolation</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-foreground text-xs font-bold">
              Strict TypeScript &amp; Zod Contracts
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-foreground text-xs font-bold">Zero Telemetry Selling</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4 PILLARS: 3D SPATIAL TRUST CARDS GRID */}
        {/* ========================================================================= */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {/* ======================================================================= */}
          {/* PILLAR 1: STRICT MULTI-TENANT ISOLATION */}
          {/* ======================================================================= */}
          <SpatialGlassCard glowColor="rgba(49, 95, 232, 0.25)">
            <div>
              {/* Card Meta & Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                <div className="flex items-center gap-3">
                  <div className="border-primary/25 from-primary/20 via-primary/10 to-primary/5 text-primary ring-primary/20 relative flex h-12 w-12 items-center justify-center rounded-2xl border bg-gradient-to-br shadow-xs ring-1">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-xl font-bold">
                      Strict Multi-Tenant Isolation
                    </h3>
                    <p className="text-muted-foreground text-[11px] font-medium">
                      Cryptographic Shard Boundaries
                    </p>
                  </div>
                </div>

                {/* Tenant Switcher with Sliding Spring Pill */}
                <div className="border-border/70 bg-background/90 flex items-center rounded-full border p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setActiveTenant("apex")}
                    className="relative rounded-full px-2.5 py-1 text-xs font-bold transition-colors"
                  >
                    {activeTenant === "apex" && (
                      <motion.span
                        layoutId="active-tenant-trust-pill"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        className="bg-primary absolute inset-0 rounded-full shadow-xs"
                      />
                    )}
                    <span
                      className={`relative z-10 text-[11px] transition-colors ${
                        activeTenant === "apex"
                          ? "text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Tenant: org_apex92
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTenant("meridian")}
                    className="relative rounded-full px-2.5 py-1 text-xs font-bold transition-colors"
                  >
                    {activeTenant === "meridian" && (
                      <motion.span
                        layoutId="active-tenant-trust-pill"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        className="bg-primary absolute inset-0 rounded-full shadow-xs"
                      />
                    )}
                    <span
                      className={`relative z-10 text-[11px] transition-colors ${
                        activeTenant === "meridian"
                          ? "text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Tenant: org_mrd54
                    </span>
                  </button>
                </div>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed">
                Every customer dossier, appointment booking, and invoice record is explicitly
                partitioned by Organization ID. Data stores and queries enforce strict boundary
                separation.
              </p>

              {/* Live PostgreSQL RLS SQL Terminal Preview */}
              <div className="border-border/80 bg-background/95 relative mt-5 overflow-hidden rounded-2xl border p-4 shadow-sm">
                <div
                  className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
                  aria-hidden="true"
                />
                <div className="flex items-center justify-between border-b pb-2 text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-mono">
                    <Terminal className="h-3.5 w-3.5 text-blue-500" />
                    <span>postgres_rls_policy.sql</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-600">100% Isolated</span>
                </div>

                <div className="bg-muted/50 text-foreground/90 border-border/50 relative mt-2.5 overflow-hidden rounded-xl border p-3 font-mono text-[11px] leading-relaxed">
                  <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/10" />
                  <p className="text-blue-500">
                    SELECT <span className="text-foreground">*</span> FROM client_dossiers
                  </p>
                  <p className="text-emerald-600 dark:text-emerald-400">
                    WHERE organization_id = &apos;
                    {activeTenant === "apex" ? "org_apex92" : "org_mrd54"}&apos;
                  </p>
                  <p className="text-muted-foreground mt-1 text-[10px]">
                    {"-- Cryptographic session bound: zero cross-tenant leakage"}
                  </p>
                </div>

                <div className="border-border/50 text-muted-foreground mt-3 flex items-center justify-between border-t pt-2 text-[10px]">
                  <span className="flex items-center gap-1 font-semibold text-emerald-600">
                    <Check className="h-3 w-3" /> Cross-Tenant Leak Test: PASSED
                  </span>
                  <span className="font-mono">0 Leaks Detected</span>
                </div>
              </div>
            </div>

            {/* Spec Checkmarks */}
            <div className="border-border/60 mt-6 border-t pt-4">
              <ul className="text-foreground/85 space-y-2 text-xs font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Zero cross-tenant data exposure</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Tenant-scoped database queries</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Multi-organization context switching</span>
                </li>
              </ul>
            </div>
          </SpatialGlassCard>

          {/* ======================================================================= */}
          {/* PILLAR 2: ROLE-BASED ACCESS CONTROL (RBAC) */}
          {/* ======================================================================= */}
          <SpatialGlassCard glowColor="rgba(245, 158, 11, 0.25)">
            <div>
              {/* Card Meta & Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-amber-500/5 text-amber-600 shadow-xs ring-1 ring-amber-500/20">
                    <Lock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-xl font-bold">
                      Role-Based Access Control (RBAC)
                    </h3>
                    <p className="text-muted-foreground text-[11px] font-medium">
                      Granular Permission Tiers
                    </p>
                  </div>
                </div>

                {/* Role Switcher */}
                <div className="border-border/70 bg-background/90 flex items-center rounded-full border p-1 shadow-2xs">
                  {(["owner", "admin", "staff", "billing"] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className="relative rounded-full px-2 py-0.5 text-xs font-bold capitalize transition-colors"
                    >
                      {selectedRole === role && (
                        <motion.span
                          layoutId="active-rbac-trust-pill"
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                          className="absolute inset-0 rounded-full bg-amber-500 shadow-xs"
                        />
                      )}
                      <span
                        className={`relative z-10 text-[10px] transition-colors ${
                          selectedRole === role
                            ? "text-white"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed">
                Configurable permission tiers clearly differentiate Owner, Admin, Staff, and Billing
                roles. Protect organizational settings and rate cards from unauthorized eyes.
              </p>

              {/* Dynamic Permission Access Matrix */}
              <div className="border-border/80 bg-background/95 relative mt-5 overflow-hidden rounded-2xl border p-4 shadow-sm">
                <div
                  className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
                  aria-hidden="true"
                />
                <div className="space-y-2.5 text-xs">
                  {/* Row 1: Client Dossiers */}
                  <div className="bg-surface border-border/50 relative flex items-center justify-between overflow-hidden rounded-xl border p-2.5">
                    <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/10" />
                    <span className="text-foreground font-semibold">
                      Client Dossiers & Appointments
                    </span>
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                      Full Access
                    </span>
                  </div>

                  {/* Row 2: Rate Cards & Margins (Restricted for staff) */}
                  <div className="bg-surface border-border/50 relative flex items-center justify-between overflow-hidden rounded-xl border p-2.5">
                    <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/10" />
                    <span className="text-foreground font-semibold">
                      Rate Cards & Profit Margins
                    </span>
                    {selectedRole === "staff" ? (
                      <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                        Masked 🔒
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                        Authorized
                      </span>
                    )}

                    {/* Frosted Shutter for Staff */}
                    <AnimatePresence>
                      {selectedRole === "staff" && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="bg-background/80 absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-rose-600 backdrop-blur-xs"
                        >
                          RESTRICTED: Admin Only
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Row 3: Stripe Payouts & Transfers */}
                  <div className="bg-surface border-border/50 relative flex items-center justify-between overflow-hidden rounded-xl border p-2.5">
                    <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/10" />
                    <span className="text-foreground font-semibold">Stripe Payouts & Banking</span>
                    {selectedRole === "owner" || selectedRole === "billing" ? (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                        Owner Control
                      </span>
                    ) : (
                      <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                        Locked 🔒
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-border/50 text-muted-foreground mt-3 flex items-center justify-between border-t pt-2 text-[10px]">
                  <span>Active Role Context:</span>
                  <span className="font-mono font-bold text-amber-600 capitalize">
                    {selectedRole} Permissions Enforced
                  </span>
                </div>
              </div>
            </div>

            {/* Spec Checkmarks */}
            <div className="border-border/60 mt-6 border-t pt-4">
              <ul className="text-foreground/85 space-y-2 text-xs font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-500" />
                  <span>Granular role permissions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-500" />
                  <span>Separation of billing vs service roles</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-500" />
                  <span>Tamper-evident audit boundaries</span>
                </li>
              </ul>
            </div>
          </SpatialGlassCard>

          {/* ======================================================================= */}
          {/* PILLAR 3: DECOUPLED API BOUNDARY & TYPE SAFETY */}
          {/* ======================================================================= */}
          <SpatialGlassCard glowColor="rgba(16, 185, 129, 0.25)">
            <div>
              {/* Card Meta & Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-emerald-500/5 text-emerald-600 shadow-xs ring-1 ring-emerald-500/20">
                    <Server className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-xl font-bold">
                      Decoupled API Boundary & Type Safety
                    </h3>
                    <p className="text-muted-foreground text-[11px] font-medium">
                      Zero-Crash Runtime Contracts
                    </p>
                  </div>
                </div>

                {/* Payload Contract Simulator Switcher */}
                <div className="border-border/70 bg-background/90 flex items-center rounded-full border p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setApiContractMode("valid")}
                    className="relative rounded-full px-2.5 py-1 text-xs font-bold transition-colors"
                  >
                    {apiContractMode === "valid" && (
                      <motion.span
                        layoutId="active-api-contract-pill"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        className="absolute inset-0 rounded-full bg-emerald-600 shadow-xs"
                      />
                    )}
                    <span
                      className={`relative z-10 text-[11px] transition-colors ${
                        apiContractMode === "valid"
                          ? "text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Valid Contract
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setApiContractMode("malformed")}
                    className="relative rounded-full px-2.5 py-1 text-xs font-bold transition-colors"
                  >
                    {apiContractMode === "malformed" && (
                      <motion.span
                        layoutId="active-api-contract-pill"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        className="absolute inset-0 rounded-full bg-rose-500 shadow-xs"
                      />
                    )}
                    <span
                      className={`relative z-10 text-[11px] transition-colors ${
                        apiContractMode === "malformed"
                          ? "text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Malformed Payload
                    </span>
                  </button>
                </div>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed">
                Engineered with strict TypeScript, validated Zod runtime contracts, and structured
                HTTP error responses ensuring resilient, predictable platform interactions.
              </p>

              {/* Live Zod Runtime Schema Validator */}
              <div className="border-border/80 bg-background/95 relative mt-5 overflow-hidden rounded-2xl border p-4 shadow-sm">
                <div
                  className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
                  aria-hidden="true"
                />
                <div className="flex items-center justify-between border-b pb-2 text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-mono">
                    <FileCode className="h-3.5 w-3.5 text-emerald-500" />
                    <span>zod_contract_verifier.ts</span>
                  </span>
                  <span
                    className={`font-mono text-xs font-bold ${
                      apiContractMode === "valid" ? "text-emerald-600" : "text-rose-500"
                    }`}
                  >
                    {apiContractMode === "valid"
                      ? "200 OK — Valid"
                      : "400 Bad Request — Intercepted"}
                  </span>
                </div>

                <div className="bg-muted/50 border-border/50 relative mt-2.5 overflow-hidden rounded-xl border p-3 font-mono text-[11px] leading-relaxed">
                  <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/10" />
                  {apiContractMode === "valid" ? (
                    <div className="text-emerald-700 dark:text-emerald-300">
                      <p>✓ booking_schema.parse(req.body)</p>
                      <p className="text-muted-foreground mt-1 text-[10px]">
                        Contract validated in 0.4ms: zero undefined fields passed to domain logic.
                      </p>
                    </div>
                  ) : (
                    <div className="text-rose-600">
                      <p>⚠️ ZodError: Invalid duration at &quot;service_mins&quot;</p>
                      <p className="text-muted-foreground mt-1 text-[10px]">
                        Rejected at API boundary before database execution. System crash avoided.
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-border/50 text-muted-foreground mt-3 flex items-center justify-between border-t pt-2 text-[10px]">
                  <span>TypeScript Strict Mode:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    0 &apos;any&apos; types
                  </span>
                </div>
              </div>
            </div>

            {/* Spec Checkmarks */}
            <div className="border-border/60 mt-6 border-t pt-4">
              <ul className="text-foreground/85 space-y-2 text-xs font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Strict zero-any TypeScript configuration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Runtime contract schema validation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Normalized client error handling</span>
                </li>
              </ul>
            </div>
          </SpatialGlassCard>

          {/* ======================================================================= */}
          {/* PILLAR 4: DATA SOVEREIGNTY & PRIVACY STANDARDS */}
          {/* ======================================================================= */}
          <SpatialGlassCard glowColor="rgba(6, 182, 212, 0.25)">
            <div>
              {/* Card Meta & Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/20 via-cyan-500/10 to-cyan-500/5 text-cyan-600 shadow-xs ring-1 ring-cyan-500/20">
                    <FileCode className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-foreground text-xl font-bold">
                      Data Sovereignty & Privacy Standards
                    </h3>
                    <p className="text-muted-foreground text-[11px] font-medium">
                      Zero Vendor Lock-In Guarantee
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-600">
                  Full Ownership
                </span>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed">
                Your business data belongs exclusively to your organization. FlowPilot enforces
                encryption in transit, zero third-party advertising tracking, and complete
                exportability.
              </p>

              {/* 1-Click Encrypted Data Export Simulation */}
              <div className="border-border/80 bg-background/95 relative mt-5 overflow-hidden rounded-2xl border p-4 shadow-sm">
                <div
                  className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
                  aria-hidden="true"
                />
                <div className="flex items-center justify-between border-b pb-2 text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-mono">
                    <FileArchive className="h-3.5 w-3.5 text-cyan-500" />
                    <span>organization_archive_export.zip</span>
                  </span>
                  <span className="font-mono font-bold text-cyan-600">1-Click Portable</span>
                </div>

                <div className="bg-muted/50 border-border/50 relative mt-2.5 flex flex-wrap items-center justify-between gap-2 overflow-hidden rounded-xl border p-3 text-xs">
                  <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/10" />
                  <div>
                    <span className="text-foreground block font-bold">
                      Complete Organizational Snapshot
                    </span>
                    <span className="text-muted-foreground text-[10px]">
                      Clients &bull; Appointments &bull; Invoices &bull; Audit Trail (JSON/CSV)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulateExport}
                    disabled={isExporting}
                    className="from-primary inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r to-cyan-600 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-xs transition-all hover:scale-105"
                  >
                    {isExporting ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Packaging...</span>
                      </>
                    ) : isExportReady ? (
                      <>
                        <CheckCheck className="h-3.5 w-3.5" />
                        <span>Export Ready ✓</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        <span>Simulate Org Export</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="border-border/50 text-muted-foreground mt-3 flex items-center justify-between border-t pt-2 text-[10px]">
                  <span>Portability Commitment:</span>
                  <span className="font-semibold text-cyan-600">Zero Proprietary Lock-In</span>
                </div>
              </div>
            </div>

            {/* Spec Checkmarks */}
            <div className="border-border/60 mt-6 border-t pt-4">
              <ul className="text-foreground/85 space-y-2 text-xs font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-500" />
                  <span>Encrypted communication in transit</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-500" />
                  <span>Full organization export readiness</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-500" />
                  <span>Zero third-party telemetry selling</span>
                </li>
              </ul>
            </div>
          </SpatialGlassCard>
        </div>
      </Container>
    </section>
  );
};
