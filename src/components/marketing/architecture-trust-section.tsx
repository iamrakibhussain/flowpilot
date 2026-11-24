"use client";

import * as React from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Server,
  FileCode,
  CheckCircle2,
  Terminal,
  Check,
  CheckCheck,
  Download,
  RefreshCw,
  FileArchive,
  ShieldAlert,
  Fingerprint,
  Database,
  KeyRound,
} from "lucide-react";
import { Container } from "@/components/layout/container";

/**
 * 3D Physics Bento Card with Specular Laser Follower and Damped Perspective Tilt
 */
interface Card3DProps {
  children: React.ReactNode;
  className?: string;
}

const Card3D: React.FC<Card3DProps> = ({ children, className = "" }) => {
  const shouldReduceMotion = useReducedMotion();
  const cardRef = React.useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [glarePos, setGlarePos] = React.useState<{ x: number; y: number } | null>(null);

  // Damped spring physics for ultra-smooth 3D card tilt (-5deg to +5deg)
  const rotateX = useSpring(useTransform(mouseY, [-180, 180], [5, -5]), {
    stiffness: 260,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(mouseX, [-260, 260], [-5, 5]), {
    stiffness: 260,
    damping: 24,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x - rect.width / 2);
    mouseY.set(y - rect.height / 2);
    setGlarePos({ x, y });
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setGlarePos(null);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1200px" }}
      className={`h-full ${className}`}
    >
      <motion.div
        style={{
          rotateX: shouldReduceMotion ? 0 : rotateX,
          rotateY: shouldReduceMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        className="group border-border/80 bg-surface/80 hover:border-border/90 relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border p-3.5 shadow-xs backdrop-blur-2xl transition-shadow duration-300 hover:shadow-xl sm:p-6 xl:p-8 dark:border-neutral-800/80"
      >
        {/* Specular Radial Spotlight Follower */}
        {glarePos && !shouldReduceMotion && (
          <div
            className="pointer-events-none absolute -inset-px rounded-2xl opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(450px circle at ${glarePos.x}px ${glarePos.y}px, rgba(16, 185, 129, 0.08), transparent 75%)`,
            }}
            aria-hidden="true"
          />
        )}

        {/* Specular Laser Top Rim */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent dark:via-emerald-400/40"
          aria-hidden="true"
        />

        {/* Micro-dot Background Texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
            backgroundSize: "16px 16px",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex h-full flex-col justify-between">{children}</div>
      </motion.div>
    </div>
  );
};

export const ArchitectureTrustSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  // Pillar 1: Tenant Context Switcher & Simulated Cross-Tenant Leak Attempt
  const [activeTenant, setActiveTenant] = React.useState<"apex" | "meridian">("apex");
  const [isSimulatingLeak, setIsSimulatingLeak] = React.useState<boolean>(false);

  // Pillar 2: RBAC Matrix Role Switcher (Verified Prisma roles: OWNER, ADMIN, MEMBER, BILLING)
  const [selectedRole, setSelectedRole] = React.useState<"owner" | "admin" | "member" | "billing">(
    "owner"
  );

  // Pillar 3: API Runtime Contract Simulation ("valid" vs "malformed")
  const [apiContractMode, setApiContractMode] = React.useState<"valid" | "malformed">("valid");

  // Pillar 4: Data Export Simulation & Schema Preview Tab
  const [schemaTab, setSchemaTab] = React.useState<"json" | "ddl">("json");
  const [exportPhase, setExportPhase] = React.useState<"idle" | "packaging" | "ready">("idle");
  const [exportProgress, setExportProgress] = React.useState<number>(0);

  const handleSimulateExport = () => {
    if (exportPhase === "packaging") return;
    setExportPhase("packaging");
    setExportProgress(15);

    const t1 = setTimeout(() => setExportProgress(45), 300);
    const t2 = setTimeout(() => setExportProgress(80), 700);
    const t3 = setTimeout(() => {
      setExportProgress(100);
      setExportPhase("ready");
    }, 1100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  const handleResetExport = () => {
    setExportPhase("idle");
    setExportProgress(0);
  };

  return (
    <section
      id="architecture"
      className="border-border/40 relative scroll-mt-20 overflow-hidden border-t bg-transparent py-16 md:py-24"
    >
      {/* Ambient Engineering Spotlight Background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(16,185,129,0.04),transparent)]"
        aria-hidden="true"
      />

      <Container>
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-2xs backdrop-blur-md sm:px-3.5 dark:text-emerald-300">
            <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] ring-2 ring-emerald-500/25" />
            </span>
            <span className="font-mono text-[10px] font-bold tracking-wider uppercase min-[360px]:text-[11px] sm:text-xs">
              <span className="hidden min-[420px]:inline">
                Verifiable Architecture &bull; Engineering Standards
              </span>
              <span className="min-[420px]:hidden">Verified Architecture &bull; Standards</span>
            </span>
          </div>

          <h2 className="mt-3.5 text-2xl leading-tight font-extrabold tracking-tight text-neutral-900 min-[360px]:text-3xl sm:mt-4 sm:text-4xl md:text-5xl dark:text-white">
            Built with Engineering Discipline{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-300">
              from Day One
            </span>
          </h2>

          <p className="text-muted-foreground mx-auto mt-2.5 max-w-2xl text-xs leading-relaxed min-[360px]:text-sm sm:mt-3 sm:text-base">
            Transparent architectural integrity ensuring your business operations remain secure,
            organization-scoped, and highly reliable. Explore our verified engineering standards
            below.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* TOP VERIFIED ARCHITECTURE TELEMETRY COCKPIT */}
        {/* ========================================================================= */}
        <div className="border-border/80 bg-surface/80 relative mt-6 overflow-hidden rounded-2xl border p-3 shadow-xs backdrop-blur-2xl sm:mt-8 sm:p-4.5 dark:border-neutral-800/80">
          {/* Specular Laser Top Rim */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"
            aria-hidden="true"
          />

          {/* Top Live Heartbeat Row */}
          <div className="border-border/60 mb-2.5 flex items-center justify-between gap-2 border-b pb-2 text-xs sm:mb-3 sm:pb-2.5">
            <div className="flex min-w-0 items-center gap-1.5 font-mono text-[10px] min-[360px]:text-[11px] sm:gap-2 sm:text-xs">
              <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/25" />
              </span>
              <span className="truncate font-bold text-emerald-600 dark:text-emerald-400">
                SYSTEM STATE: NOMINAL
              </span>
              <span className="text-muted-foreground hidden min-[440px]:inline">&bull;</span>
              <span className="text-muted-foreground hidden min-[440px]:inline">
                KERNEL BOUNDARY ENFORCED
              </span>
            </div>
            <div className="text-muted-foreground shrink-0 font-mono text-[9.5px] min-[360px]:text-[10.5px] sm:text-[11px]">
              AUDIT LATENCY: <span className="text-foreground font-semibold">&lt;0.8ms</span>
            </div>
          </div>

          {/* 4 Verifiable Telemetry Status Chips — 2x2 Grid on Mobile, 4 Cols on Desktop */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-4">
            <div className="border-border/60 bg-muted/30 flex flex-col justify-between rounded-xl border p-2 transition-colors sm:p-2.5">
              <div className="mb-0.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span className="text-foreground truncate text-[11px] leading-tight font-bold sm:text-xs">
                  <span className="hidden sm:inline">Organization-Scoped Queries</span>
                  <span className="sm:hidden">Org-Scoped Queries</span>
                </span>
              </div>
              <span className="text-muted-foreground truncate text-[9.5px] leading-tight sm:text-[10px]">
                PostgreSQL 16 RLS &amp; Prisma
              </span>
            </div>

            <div className="border-border/60 bg-muted/30 flex flex-col justify-between rounded-xl border p-2 transition-colors sm:p-2.5">
              <div className="mb-0.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span className="text-foreground truncate text-[11px] leading-tight font-bold sm:text-xs">
                  <span className="hidden sm:inline">Server-Side Membership Checks</span>
                  <span className="sm:hidden">Server-Side Checks</span>
                </span>
              </div>
              <span className="text-muted-foreground truncate text-[9.5px] leading-tight sm:text-[10px]">
                Session JWT Engine
              </span>
            </div>

            <div className="border-border/60 bg-muted/30 flex flex-col justify-between rounded-xl border p-2 transition-colors sm:p-2.5">
              <div className="mb-0.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span className="text-foreground truncate text-[11px] leading-tight font-bold sm:text-xs">
                  Strict Zod Contracts
                </span>
              </div>
              <span className="text-muted-foreground truncate text-[9.5px] leading-tight sm:text-[10px]">
                Zero Unvalidated Inputs
              </span>
            </div>

            <div className="border-border/60 bg-muted/30 flex flex-col justify-between rounded-xl border p-2 transition-colors sm:p-2.5">
              <div className="mb-0.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span className="text-foreground truncate text-[11px] leading-tight font-bold sm:text-xs">
                  Zero Monetization
                </span>
              </div>
              <span className="text-muted-foreground truncate text-[9.5px] leading-tight sm:text-[10px]">
                100% Data Sovereignty
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4 PILLARS: ENGINEERING COMMAND BENTO GRID */}
        {/* ========================================================================= */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* ======================================================================= */}
          {/* PILLAR 1: STRICT MULTI-TENANT ISOLATION (col-span-7) */}
          {/* ======================================================================= */}
          <Card3D className="lg:col-span-7">
            <div>
              {/* Card Meta & Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4">
                <div className="flex w-full min-w-0 flex-1 items-center gap-2.5 sm:w-auto sm:gap-3">
                  <div className="border-border/80 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-emerald-500/10 text-emerald-600 sm:h-10 sm:w-10 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-foreground text-sm leading-snug font-bold break-words min-[360px]:text-base sm:text-lg">
                      Strict Multi-Tenant Isolation
                    </h3>
                    <p className="text-muted-foreground text-[10.5px] leading-normal font-medium break-words sm:text-[11px]">
                      Server-Side Tenant Context Verification
                    </p>
                  </div>
                </div>

                {/* Tenant Switcher Segmented Control */}
                <div
                  role="group"
                  aria-label="Simulated Tenant Context Selection"
                  className="border-border/80 bg-muted/60 flex w-full items-center rounded-xl border p-1 sm:w-auto"
                >
                  <button
                    type="button"
                    aria-pressed={activeTenant === "apex"}
                    onClick={() => {
                      setActiveTenant("apex");
                      setIsSimulatingLeak(false);
                    }}
                    className="focus-visible:ring-primary relative flex-1 rounded-lg px-2.5 py-1 text-center text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-hidden min-[360px]:flex-initial"
                  >
                    {activeTenant === "apex" && (
                      <motion.span
                        layoutId="active-tenant-trust-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                        className="absolute inset-0 rounded-lg bg-neutral-900 text-white shadow-xs dark:bg-white dark:text-neutral-950"
                      />
                    )}
                    <span
                      className={`relative z-10 text-[10.5px] transition-colors sm:text-[11px] ${
                        activeTenant === "apex"
                          ? "font-semibold text-white dark:text-neutral-950"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Apex Studio
                    </span>
                  </button>

                  <button
                    type="button"
                    aria-pressed={activeTenant === "meridian"}
                    onClick={() => {
                      setActiveTenant("meridian");
                      setIsSimulatingLeak(false);
                    }}
                    className="focus-visible:ring-primary relative flex-1 rounded-lg px-2.5 py-1 text-center text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-hidden min-[360px]:flex-initial"
                  >
                    {activeTenant === "meridian" && (
                      <motion.span
                        layoutId="active-tenant-trust-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                        className="absolute inset-0 rounded-lg bg-neutral-900 text-white shadow-xs dark:bg-white dark:text-neutral-950"
                      />
                    )}
                    <span
                      className={`relative z-10 text-[10.5px] transition-colors sm:text-[11px] ${
                        activeTenant === "meridian"
                          ? "font-semibold text-white dark:text-neutral-950"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Meridian Corp
                    </span>
                  </button>
                </div>
              </div>

              <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                Every customer dossier, appointment booking, and invoice record is strictly scoped
                by Organization ID. Server-side middleware verifies user membership on every request
                before querying the database.
              </p>

              {/* JWT Tenant Session Pill */}
              <div className="bg-muted/40 border-border/60 mt-3 flex flex-wrap items-center justify-between gap-1.5 rounded-lg border px-2.5 py-2 font-mono text-[10.5px] sm:mt-4 sm:px-3 sm:text-[11px]">
                <div className="text-muted-foreground flex min-w-0 items-center gap-1.5">
                  <KeyRound className="text-primary h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">JWT Context Claim:</span>
                  <span className="text-foreground shrink-0 font-semibold">
                    {activeTenant === "apex" ? "org_apex92" : "org_mrd54"}
                  </span>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9.5px] font-semibold text-emerald-600 sm:text-[10px] dark:text-emerald-400">
                  RLS Attached
                </span>
              </div>

              {/* Interactive Multi-Tenant Query Terminal */}
              <div className="border-border/80 bg-background/95 relative mt-3 overflow-hidden rounded-xl border p-3 shadow-xs sm:p-4">
                <div className="border-border/60 flex items-center justify-between gap-2 border-b pb-2 text-[10px] sm:text-[11px]">
                  <span className="text-muted-foreground flex min-w-0 items-center gap-1.5 font-mono">
                    <Terminal className="text-foreground h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">tenant_context_middleware.ts</span>
                  </span>
                  <span className="shrink-0 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    Org-Scoped
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {!isSimulatingLeak ? (
                    <motion.div
                      key="normal-query"
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="bg-muted/40 text-foreground/90 border-border/50 relative mt-2.5 max-w-full overflow-x-auto rounded-lg border p-2.5 font-mono text-[10px] leading-relaxed sm:p-3 sm:text-[11px]"
                    >
                      <p className="text-muted-foreground">
                        {"// Server validates organization membership via session"}
                      </p>
                      <p className="text-foreground">
                        const orgId = req.headers[&apos;x-organization-id&apos;];
                      </p>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                        const query = prisma.customer.findMany(&#123;
                      </p>
                      <p className="pl-4 font-semibold text-emerald-600 dark:text-emerald-400">
                        where: &#123; organizationId: &apos;
                        {activeTenant === "apex" ? "org_apex92" : "org_mrd54"}&apos; &#125;
                      </p>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                        &#125;);
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="breach-attempt"
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="relative mt-2.5 overflow-hidden rounded-lg border border-rose-500/40 bg-rose-500/10 p-2.5 font-mono text-[10.5px] leading-relaxed text-rose-700 sm:p-3 sm:text-[11px] dark:text-rose-300"
                    >
                      <div className="flex flex-wrap items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
                        <ShieldAlert className="h-4 w-4 shrink-0" />
                        <span className="truncate">[403 FORBIDDEN] Tenant Boundary Enforced</span>
                      </div>
                      <p className="text-muted-foreground mt-1 text-[9.5px] sm:text-[10px]">
                        Mismatched tenant token attempted cross-organization data injection:
                      </p>
                      <p className="mt-1 break-words text-rose-600 dark:text-rose-400">
                        Blocked at DB Layer in 0.8ms &bull; 0 records exposed &bull; Incident logged
                        to Security Audit Stream
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Interactive Breach Simulation Action Bar */}
                <div className="border-border/50 text-muted-foreground mt-3 flex flex-col justify-between gap-2 border-t pt-2 text-[10px] sm:flex-row sm:items-center">
                  <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3 w-3 shrink-0" /> Server-Side Membership Verification
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsSimulatingLeak(!isSimulatingLeak)}
                    className={`focus-visible:ring-primary inline-flex w-full items-center justify-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-hidden sm:w-auto ${
                      isSimulatingLeak
                        ? "bg-rose-600 text-white hover:bg-rose-700"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    }`}
                  >
                    {isSimulatingLeak ? (
                      <>
                        <RefreshCw className="h-3 w-3 shrink-0" />
                        <span>Reset Attack Sim</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-3 w-3 shrink-0 text-rose-500" />
                        <span>Test Cross-Tenant Isolation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Spec Checkmarks */}
            <div className="border-border/60 mt-5 border-t pt-3.5 sm:mt-6 sm:pt-4">
              <ul className="text-foreground/85 space-y-2 text-xs font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Mandatory server-side tenant authorization</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Prisma queries filtered strictly by organizationId</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Unauthenticated organization switching blocked (403)</span>
                </li>
              </ul>
            </div>
          </Card3D>

          {/* ======================================================================= */}
          {/* PILLAR 2: ROLE-BASED ACCESS CONTROL (RBAC) (col-span-5) */}
          {/* ======================================================================= */}
          <Card3D className="lg:col-span-5">
            <div>
              {/* Card Meta & Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4">
                <div className="flex w-full min-w-0 flex-1 items-center gap-2.5 sm:w-auto sm:gap-3">
                  <div className="border-border/80 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-indigo-500/10 text-indigo-500 sm:h-10 sm:w-10">
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-foreground text-sm leading-snug font-bold break-words min-[360px]:text-base sm:text-lg">
                      Role-Based Access Control (RBAC)
                    </h3>
                    <p className="text-muted-foreground text-[10.5px] leading-normal font-medium break-words sm:text-[11px]">
                      Verified 4-Tier Permission Matrix
                    </p>
                  </div>
                </div>

                {/* Role Switcher Segmented Control (Verified Prisma Roles) */}
                <div
                  role="group"
                  aria-label="Role-Based Access Selection"
                  className="border-border/80 bg-muted/60 flex w-full items-center rounded-xl border p-0.5 sm:w-auto sm:p-1"
                >
                  {(["owner", "admin", "member", "billing"] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      aria-pressed={selectedRole === role}
                      onClick={() => setSelectedRole(role)}
                      className="focus-visible:ring-primary relative flex-1 rounded-lg px-2 py-0.5 text-center text-xs font-medium capitalize transition-colors focus-visible:ring-2 focus-visible:outline-hidden min-[360px]:flex-initial sm:px-2.5 sm:py-1"
                    >
                      {selectedRole === role && (
                        <motion.span
                          layoutId="active-rbac-trust-pill"
                          transition={{ type: "spring", stiffness: 450, damping: 35 }}
                          className="absolute inset-0 rounded-lg bg-neutral-900 text-white shadow-xs dark:bg-white dark:text-neutral-950"
                        />
                      )}
                      <span
                        className={`relative z-10 text-[9.5px] transition-colors sm:text-[10px] ${
                          selectedRole === role
                            ? "font-semibold text-white dark:text-neutral-950"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                Server-enforced role permissions clearly differentiate Owner, Admin, Member, and
                Billing roles. Sensitive billing details, staff rate cards, and workspace controls
                remain restricted by role.
              </p>

              {/* Holographic Role Tier Badge */}
              <div className="bg-muted/30 border-border/60 mt-3 flex flex-wrap items-center justify-between gap-1 rounded-lg border px-2.5 py-1.5 text-xs sm:mt-4 sm:px-3">
                <span className="text-muted-foreground text-[10.5px] sm:text-[11px]">
                  Privilege Classification:
                </span>
                <span className="font-mono text-[9.5px] font-bold text-indigo-600 sm:text-[10px] dark:text-indigo-400">
                  {selectedRole === "owner" && "[L-4] FULL UNRESTRICTED"}
                  {selectedRole === "admin" && "[L-3] OPERATIONAL DELEGATED"}
                  {selectedRole === "member" && "[L-2] MASKED PRIVACY"}
                  {selectedRole === "billing" && "[L-2] FINANCIAL SCOPE"}
                </span>
              </div>

              {/* Dynamic Permission Access Matrix */}
              <div className="border-border/80 bg-background/95 relative mt-3 overflow-hidden rounded-xl border p-3 shadow-xs sm:p-4">
                <div className="space-y-2 text-xs">
                  {/* Row 1: Client Dossiers & Appointments */}
                  <div className="border-border/60 bg-muted/20 relative flex items-center justify-between gap-2 overflow-hidden rounded-lg border p-2 sm:p-2.5">
                    <span className="text-foreground truncate text-[11px] font-semibold sm:text-xs">
                      Client Dossiers &amp; Appointments
                    </span>
                    <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9.5px] font-semibold text-emerald-600 sm:text-[10px] dark:text-emerald-400">
                      {selectedRole === "billing" ? "View Only" : "Full Access"}
                    </span>
                  </div>

                  {/* Row 2: Rate Cards & Internal Profit Margins */}
                  <div className="border-border/60 bg-muted/20 relative flex items-center justify-between gap-2 overflow-hidden rounded-lg border p-2 sm:p-2.5">
                    <span className="text-foreground truncate text-[11px] font-semibold sm:text-xs">
                      Rate Cards &amp; Profit Margins
                    </span>
                    {selectedRole === "member" ? (
                      <span className="shrink-0 rounded-full bg-rose-500/10 px-2 py-0.5 text-[9.5px] font-semibold text-rose-600 sm:text-[10px] dark:text-rose-400">
                        Masked 🔒
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9.5px] font-semibold text-emerald-600 sm:text-[10px] dark:text-emerald-400">
                        Authorized
                      </span>
                    )}

                    {/* Frosted Shutter for Member with Biometric Padlock */}
                    <AnimatePresence>
                      {selectedRole === "member" && (
                        <motion.div
                          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="bg-background/95 absolute inset-0 flex items-center justify-center gap-1.5 font-mono text-[9.5px] font-semibold text-rose-600 backdrop-blur-xs sm:text-[10px] dark:text-rose-400"
                        >
                          <Fingerprint className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">RESTRICTED: Admin &amp; Owner Only</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Row 3: Stripe Payouts & Organization Billing */}
                  <div className="border-border/60 bg-muted/20 relative flex items-center justify-between gap-2 overflow-hidden rounded-lg border p-2 sm:p-2.5">
                    <span className="text-foreground truncate text-[11px] font-semibold sm:text-xs">
                      Stripe Payouts &amp; Settings
                    </span>
                    {selectedRole === "owner" || selectedRole === "billing" ? (
                      <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9.5px] font-semibold text-emerald-600 sm:text-[10px] dark:text-emerald-400">
                        Authorized
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-rose-500/10 px-2 py-0.5 text-[9.5px] font-semibold text-rose-600 sm:text-[10px] dark:text-rose-400">
                        Locked 🔒
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-border/50 text-muted-foreground mt-3 flex flex-wrap items-center justify-between gap-1 border-t pt-2 text-[10px]">
                  <span>Active Role Context:</span>
                  <span className="text-foreground font-mono font-semibold capitalize">
                    {selectedRole} Permissions Enforced
                  </span>
                </div>
              </div>
            </div>

            {/* Spec Checkmarks */}
            <div className="border-border/60 mt-5 border-t pt-3.5 sm:mt-6 sm:pt-4">
              <ul className="text-foreground/85 space-y-2 text-xs font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Verified Prisma role hierarchy (Owner, Admin, Member, Billing)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Route-level middleware permission verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Financial rate protection for non-admin roles</span>
                </li>
              </ul>
            </div>
          </Card3D>

          {/* ======================================================================= */}
          {/* PILLAR 3: DECOUPLED API BOUNDARY & TYPE SAFETY (col-span-5) */}
          {/* ======================================================================= */}
          <Card3D className="lg:col-span-5">
            <div>
              {/* Card Meta & Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4">
                <div className="flex w-full min-w-0 flex-1 items-center gap-2.5 sm:w-auto sm:gap-3">
                  <div className="border-border/80 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-emerald-500/10 text-emerald-500 sm:h-10 sm:w-10">
                    <Server className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-foreground text-sm leading-snug font-bold break-words min-[360px]:text-base sm:text-lg">
                      Decoupled API Boundary &amp; Type Safety
                    </h3>
                    <p className="text-muted-foreground text-[10.5px] leading-normal font-medium break-words sm:text-[11px]">
                      Zod Runtime Contract Validation
                    </p>
                  </div>
                </div>

                {/* Payload Contract Simulator Switcher Segmented Control */}
                <div
                  role="group"
                  aria-label="API Contract Scenario Selection"
                  className="border-border/80 bg-muted/60 flex w-full items-center rounded-xl border p-1 sm:w-auto"
                >
                  <button
                    type="button"
                    aria-pressed={apiContractMode === "valid"}
                    onClick={() => setApiContractMode("valid")}
                    className="focus-visible:ring-primary relative flex-1 rounded-lg px-2.5 py-1 text-center text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-hidden min-[380px]:flex-initial"
                  >
                    {apiContractMode === "valid" && (
                      <motion.span
                        layoutId="active-api-contract-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                        className="absolute inset-0 rounded-lg bg-neutral-900 text-white shadow-xs dark:bg-white dark:text-neutral-950"
                      />
                    )}
                    <span
                      className={`relative z-10 text-[10.5px] transition-colors sm:text-[11px] ${
                        apiContractMode === "valid"
                          ? "font-semibold text-white dark:text-neutral-950"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Valid Contract
                    </span>
                  </button>

                  <button
                    type="button"
                    aria-pressed={apiContractMode === "malformed"}
                    onClick={() => setApiContractMode("malformed")}
                    className="focus-visible:ring-primary relative flex-1 rounded-lg px-2.5 py-1 text-center text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-hidden min-[380px]:flex-initial"
                  >
                    {apiContractMode === "malformed" && (
                      <motion.span
                        layoutId="active-api-contract-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                        className="bg-background absolute inset-0 rounded-lg shadow-xs"
                      />
                    )}
                    <span
                      className={`relative z-10 text-[10.5px] transition-colors sm:text-[11px] ${
                        apiContractMode === "malformed"
                          ? "font-semibold text-rose-600"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Malformed Payload
                    </span>
                  </button>
                </div>
              </div>

              <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                Engineered with strict TypeScript, validated Zod runtime contracts, and structured
                HTTP error responses ensuring predictable, type-safe API interactions.
              </p>

              {/* Zod Runtime Schema Validator Console */}
              <div className="border-border/80 bg-background/95 relative mt-4 overflow-hidden rounded-xl border p-3 shadow-xs sm:mt-5 sm:p-4">
                <div className="border-border/60 flex flex-wrap items-center justify-between gap-1.5 border-b pb-2 text-[10px] sm:text-[11px]">
                  <span className="text-muted-foreground flex min-w-0 items-center gap-1.5 font-mono">
                    <FileCode className="text-foreground h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">validate_request.ts</span>
                  </span>
                  <span
                    className={`shrink-0 font-mono text-[10px] font-semibold sm:text-xs ${
                      apiContractMode === "valid"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {apiContractMode === "valid"
                      ? "200 OK — Validated"
                      : "422 Unprocessable Entity"}
                  </span>
                </div>

                <div className="bg-muted/40 border-border/50 relative mt-2.5 max-w-full overflow-x-auto rounded-lg border p-2.5 font-mono text-[10.5px] leading-relaxed sm:p-3 sm:text-[11px]">
                  {apiContractMode === "valid" ? (
                    <div className="text-emerald-700 dark:text-emerald-300">
                      <p className="font-semibold">✓ appointmentSchema.parse(req.body)</p>
                      <div className="bg-background/80 text-foreground/80 my-2 rounded-md border p-2 text-[9.5px] break-all sm:text-[10px]">
                        &#123; clientEmail: &quot;sarah@apexdesign.co&quot;, durationMins: 60 &#125;
                      </div>
                      <p className="text-muted-foreground mt-1 text-[9.5px] sm:text-[10px]">
                        Validated in &lt; 1ms: Zero unvalidated fields reach database execution.
                      </p>
                    </div>
                  ) : (
                    <div className="text-rose-600 dark:text-rose-400">
                      <p className="font-semibold">
                        &#123; code: &apos;VALIDATION_ERROR&apos;, status: 422 &#125;
                      </p>
                      <div className="bg-background/80 text-foreground/80 my-2 rounded-md border border-rose-500/20 p-2 text-[9.5px] break-all sm:text-[10px]">
                        &#123; clientEmail: &quot;not-an-email&quot;, durationMins: -45 &#125;
                      </div>
                      <p className="text-muted-foreground mt-1 text-[9.5px] sm:text-[10px]">
                        details: &#123; serviceMins: [&apos;Number must be greater than 0&apos;]
                        &#125;
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-border/50 text-muted-foreground mt-3 flex flex-wrap items-center justify-between gap-1 border-t pt-2 text-[10px]">
                  <span>TypeScript Strict Mode:</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    Validated Request Envelope
                  </span>
                </div>
              </div>
            </div>

            {/* Spec Checkmarks */}
            <div className="border-border/60 mt-5 border-t pt-3.5 sm:mt-6 sm:pt-4">
              <ul className="text-foreground/85 space-y-2 text-xs font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Strict zero-any TypeScript configuration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Runtime Zod contract schema validation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Standardized 422 validation error envelopes</span>
                </li>
              </ul>
            </div>
          </Card3D>

          {/* ======================================================================= */}
          {/* PILLAR 4: DATA SOVEREIGNTY & PRIVACY STANDARDS (col-span-7) */}
          {/* ======================================================================= */}
          <Card3D className="lg:col-span-7">
            <div>
              {/* Card Meta & Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4">
                <div className="flex w-full min-w-0 flex-1 items-center gap-2.5 sm:w-auto sm:gap-3">
                  <div className="border-border/80 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-emerald-500/10 text-emerald-600 sm:h-10 sm:w-10 dark:text-emerald-400">
                    <Database className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-foreground text-sm leading-snug font-bold break-words min-[360px]:text-base sm:text-lg">
                      Data Sovereignty &amp; Privacy Standards
                    </h3>
                    <p className="text-muted-foreground text-[10.5px] leading-normal font-medium break-words sm:text-[11px]">
                      Simulated Data Portability Demonstration
                    </p>
                  </div>
                </div>

                {/* Schema Format Preview Tabs */}
                <div className="border-border/80 bg-muted/60 flex w-full items-center rounded-xl border p-1 sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setSchemaTab("json")}
                    className={`flex-1 rounded-lg px-2.5 py-0.5 text-center text-xs font-medium transition-colors min-[360px]:flex-initial ${
                      schemaTab === "json"
                        ? "bg-neutral-900 text-white shadow-xs dark:bg-white dark:text-neutral-950"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    JSON Export
                  </button>
                  <button
                    type="button"
                    onClick={() => setSchemaTab("ddl")}
                    className={`flex-1 rounded-lg px-2.5 py-0.5 text-center text-xs font-medium transition-colors min-[360px]:flex-initial ${
                      schemaTab === "ddl"
                        ? "bg-neutral-900 text-white shadow-xs dark:bg-white dark:text-neutral-950"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    PostgreSQL DDL
                  </button>
                </div>
              </div>

              <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                Your business data belongs exclusively to your organization. FlowPilot enforces
                encrypted communication in transit, zero third-party telemetry monetization, and
                structured data export portability.
              </p>

              {/* 3-Step Cryptographic Pipeline Indicator */}
              <div className="bg-muted/30 border-border/60 mt-3 grid grid-cols-3 gap-1 rounded-lg border p-1.5 text-center font-mono text-[9.5px] sm:mt-4 sm:gap-2 sm:p-2 sm:text-[10px]">
                <div className="border-border/40 border-r pr-1">
                  <span className="text-muted-foreground block truncate text-[8px] sm:text-[9px]">
                    1. IN-TRANSIT
                  </span>
                  <span className="block truncate font-semibold text-emerald-600 dark:text-emerald-400">
                    TLS 1.3
                  </span>
                </div>
                <div className="border-border/40 border-r px-1">
                  <span className="text-muted-foreground block truncate text-[8px] sm:text-[9px]">
                    2. AT-REST
                  </span>
                  <span className="block truncate font-semibold text-emerald-600 dark:text-emerald-400">
                    AES-256
                  </span>
                </div>
                <div className="pl-1">
                  <span className="text-muted-foreground block truncate text-[8px] sm:text-[9px]">
                    3. SOVEREIGN
                  </span>
                  <span className="block truncate font-semibold text-emerald-600 dark:text-emerald-400">
                    Zero Lock-In
                  </span>
                </div>
              </div>

              {/* Data Export Demonstration (Explicitly Labeled Simulation) */}
              <div className="border-border/80 bg-background/95 relative mt-3 overflow-hidden rounded-xl border p-3 shadow-xs sm:p-4">
                <div className="border-border/60 flex items-center justify-between gap-2 border-b pb-2 text-[10px] sm:text-[11px]">
                  <span className="text-muted-foreground flex min-w-0 items-center gap-1.5 font-mono">
                    <FileArchive className="text-foreground h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {schemaTab === "json" ? "workspace_export.tar.gz" : "sovereign_schema.sql"}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    Simulated Preview
                  </span>
                </div>

                <div className="border-border/60 bg-muted/30 relative mt-2.5 flex flex-col justify-between gap-3 overflow-hidden rounded-lg border p-2.5 text-xs sm:flex-row sm:items-center sm:p-3">
                  <div className="min-w-0">
                    <span className="text-foreground block text-[11px] font-semibold sm:text-xs">
                      Complete Organizational Snapshot
                    </span>
                    <span className="text-muted-foreground mt-0.5 block text-[10px] leading-tight">
                      Clients &bull; Appointments &bull; Invoices &bull; Audit Trail (JSON/CSV)
                    </span>
                  </div>

                  <div className="flex w-full items-center gap-2 sm:w-auto">
                    <button
                      type="button"
                      onClick={handleSimulateExport}
                      disabled={exportPhase === "packaging"}
                      className="focus-visible:ring-primary inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-neutral-800 focus-visible:ring-2 focus-visible:outline-hidden sm:w-auto dark:bg-white dark:text-neutral-950"
                    >
                      {exportPhase === "packaging" ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 shrink-0 animate-spin" />
                          <span>Packaging ({exportProgress}%)...</span>
                        </>
                      ) : exportPhase === "ready" ? (
                        <>
                          <CheckCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                          <span>Simulated Ready ✓</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5 shrink-0" />
                          <span>Simulate Org Export</span>
                        </>
                      )}
                    </button>

                    {exportPhase === "ready" && (
                      <button
                        type="button"
                        onClick={handleResetExport}
                        className="text-muted-foreground hover:text-foreground shrink-0 text-[10px] font-medium underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar when packaging */}
                {exportPhase === "packaging" && (
                  <div className="mt-2.5">
                    <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                      <motion.div
                        className="h-full bg-emerald-500"
                        initial={{ width: "0%" }}
                        animate={{ width: `${exportProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className="text-muted-foreground mt-1 block font-mono text-[9.5px] leading-tight sm:text-[10px]">
                      Compressing database relations &bull; Generating SHA-256 integrity checksum...
                    </span>
                  </div>
                )}

                {exportPhase === "ready" && (
                  <div className="mt-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 font-mono text-[9px] leading-relaxed break-all text-emerald-700 sm:text-[10px] dark:text-emerald-300">
                    Archive verified: SHA-256:
                    e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                  </div>
                )}

                <div className="border-border/50 text-muted-foreground mt-3 flex flex-wrap items-center justify-between gap-1 border-t pt-2 text-[10px]">
                  <span>Data Ownership Guarantee:</span>
                  <span className="text-foreground font-semibold">Portable Structured Data</span>
                </div>
              </div>
            </div>

            {/* Spec Checkmarks */}
            <div className="border-border/60 mt-5 border-t pt-3.5 sm:mt-6 sm:pt-4">
              <ul className="text-foreground/85 space-y-2 text-xs font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Encrypted communication in transit (TLS)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>JSON/CSV structured data export readiness</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>Zero third-party telemetry monetization</span>
                </li>
              </ul>
            </div>
          </Card3D>
        </div>
      </Container>
    </section>
  );
};
