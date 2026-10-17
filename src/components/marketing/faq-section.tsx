"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  Search,
  X,
  Sparkles,
  ShieldCheck,
  Users,
  CreditCard,
  Laptop,
  ChevronDown,
  Check,
  Copy,
  ArrowRight,
  ThumbsUp,
  Database,
  Lock,
  HelpCircle,
  Clock,
  Layers,
  ChevronUp,
  Receipt,
  Play,
  CheckCircle2,
  Activity,
  Terminal,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type FAQCategory = "all" | "security" | "operations" | "billing" | "sandbox";

interface FAQItem {
  id: string;
  category: FAQCategory;
  categoryLabel: string;
  categoryIcon: React.FC<{ className?: string }>;
  accentColor: string;
  question: string;
  answer: string;
  proofBadge: string;
  proofTitle: string;
  proofDetail: string;
  codeSnippet?: string;
  simulationOutput?: string;
  actionLink?: {
    href: string;
    label: string;
  };
  initialHelpful: number;
}

const faqs: FAQItem[] = [
  {
    id: "faq-what-is-flowpilot",
    category: "operations",
    categoryLabel: "Operational Core",
    categoryIcon: Layers,
    accentColor: "rgba(59, 130, 246, 0.4)",
    question: "What is FlowPilot and who is it designed for?",
    answer:
      "FlowPilot is a unified business operations SaaS platform built specifically for small-to-medium service businesses, agencies, consultancies, and professional teams. It brings client relationship management (CRM), appointment scheduling, team capacity management, and invoice tracking together into one calm, structured command center.",
    proofBadge: "CORE ARCHITECTURE",
    proofTitle: "Unified Operational Data Model",
    proofDetail:
      "Unlike fragmented point solutions that force dual entry into Airtable, Google Calendar, and QuickBooks, FlowPilot binds all entities to a single Organization schema.",
    codeSnippet:
      "interface OrganizationWorkspace {\n  id: UUID;\n  name: string;\n  tier: 'PRO' | 'ENTERPRISE';\n  tenancy: 'ISOLATED_RLS';\n}",
    simulationOutput:
      "✓ Entity Graph Loaded: Clients (1,240), Bookings (4,890), Invoices (982)\n✓ Zero Spreadsheet Desynchronization Detected",
    initialHelpful: 184,
  },
  {
    id: "faq-vs-generic-tools",
    category: "operations",
    categoryLabel: "Platform Comparison",
    categoryIcon: Users,
    accentColor: "rgba(168, 85, 247, 0.4)",
    question: "How does FlowPilot differ from generic task or project management tools?",
    answer:
      "Generic project tools focus on task checklists without understanding client service economics. FlowPilot coordinates the entire service delivery lifecycle: linking customer dossiers directly to appointment calendars, staff availability, and itemized billing statements without spreadsheet gymnastics.",
    proofBadge: "ECONOMIC SYNERGY",
    proofTitle: "End-to-End Service Delivery Pipeline",
    proofDetail:
      "Client Dossier → Booked Appointment → Real-Time Staff Capacity → Direct Invoice Conversion. Every billable hour is traceable to revenue.",
    codeSnippet:
      "type ServicePipeline = [\n  ClientDossier,\n  CalendarBooking,\n  StaffCapacityAllocation,\n  ReconciledStripeInvoice\n];",
    simulationOutput:
      "✓ Pipeline Execution: 100% of completed appointments mapped to billable items\n✓ Zero unbilled hours in active period",
    initialHelpful: 219,
  },
  {
    id: "faq-live-workspace-demo",
    category: "sandbox",
    categoryLabel: "Interactive Sandbox",
    categoryIcon: Laptop,
    accentColor: "rgba(20, 184, 166, 0.4)",
    question: "What can I test in the Live Workspace demo today?",
    answer:
      "You can launch our interactive dashboard shell immediately via the 'Explore Live Workspace' button. This allows you to explore the multi-tenant organization switcher, navigation structure, dashboard KPI metrics, and UI state toggles (Normal, Skeleton, and Empty state feedback) firsthand.",
    proofBadge: "INSTANT ACCESSIBILITY",
    proofTitle: "Zero-Setup Live Prototype",
    proofDetail:
      "Client-side pre-seeded operational state with interactive organization switching (Acme Consulting ↔ Meridian Digital).",
    codeSnippet:
      "const liveSandbox = {\n  status: 'READY',\n  authBypass: true,\n  mockTenant: 'org_meridian_digital'\n};",
    simulationOutput:
      "✓ Sandbox Session Initialized in 8ms\n✓ Switching tenants: Acme Consulting ⇄ Meridian Digital",
    actionLink: {
      href: "/dashboard",
      label: "Launch Live Sandbox",
    },
    initialHelpful: 342,
  },
  {
    id: "faq-multi-tenant-isolation",
    category: "security",
    categoryLabel: "Security & Isolation",
    categoryIcon: ShieldCheck,
    accentColor: "rgba(14, 165, 233, 0.4)",
    question: "How does multi-tenant workspace isolation protect our business data?",
    answer:
      "Every organization in FlowPilot is strictly scoped by an isolated Organization ID. All data queries and operational views enforce tenant boundaries, ensuring that confidential customer records, bookings, and financial statements can never be exposed across organizations.",
    proofBadge: "ROW LEVEL SECURITY",
    proofTitle: "PostgreSQL Engine-Level Policy",
    proofDetail:
      "Enforced at the database driver level. Tenant isolation cannot be bypassed even if application-level queries omit tenant scoping.",
    codeSnippet:
      "CREATE POLICY tenant_isolation ON clients\n  USING (org_id = current_setting('app.current_org_id'));",
    simulationOutput:
      "✓ Engine Evaluation: SELECT * FROM clients WHERE ...\n✓ Database Kernel Response: 12 rows returned for tenant_apex. 0 rows leaked.",
    initialHelpful: 412,
  },
  {
    id: "faq-rbac-permissions",
    category: "security",
    categoryLabel: "Team Governance",
    categoryIcon: Lock,
    accentColor: "rgba(234, 179, 8, 0.4)",
    question: "Can we configure different permissions for our team members?",
    answer:
      "Yes. FlowPilot incorporates Role-Based Access Control (RBAC). You can assign Owner, Admin, Staff, or Billing roles, ensuring that team members have full access to their assigned appointments while safeguarding organizational settings and sensitive rate cards.",
    proofBadge: "RBAC MATRIX",
    proofTitle: "Strict Role-Based Boundary",
    proofDetail:
      "Four discrete roles ('OWNER' | 'ADMIN' | 'STAFF' | 'BILLING') controlling route middleware, API mutations, and financial visibility.",
    codeSnippet:
      "enum UserRole {\n  OWNER = 'FULL_CONTROL',\n  ADMIN = 'OPS_MANAGEMENT',\n  STAFF = 'ASSIGNED_DELIVERY',\n  BILLING = 'FINANCIAL_READ_WRITE'\n}",
    simulationOutput:
      "✓ Role Guard check: Staff user requesting /api/rate-cards\n✓ HTTP 403 Forbidden: Protected by FinancialRBACGuard",
    initialHelpful: 198,
  },
  {
    id: "faq-appointments-to-invoices",
    category: "billing",
    categoryLabel: "Financial Automation",
    categoryIcon: Receipt,
    accentColor: "rgba(16, 185, 129, 0.4)",
    question: "How do completed appointments turn into invoices?",
    answer:
      "FlowPilot bridges scheduling and finance by allowing completed appointments to convert directly into structured invoice line items with calculated rates, taxes, and transparent payment tracking (Draft, Sent, and Paid).",
    proofBadge: "AUTOMATED SETTLEMENT",
    proofTitle: "1-Click Direct Line Item Generation",
    proofDetail:
      "Appointments marked 'COMPLETED' automatically aggregate service durations, staff hourly rates, and tax rules into a draft invoice.",
    codeSnippet:
      "if (appointment.status === 'COMPLETED') {\n  await generateDraftInvoice({\n    clientId: appointment.clientId,\n    lineItems: calculateStaffRateItems(appointment)\n  });\n}",
    simulationOutput:
      "✓ Appointment #4928 marked COMPLETED\n✓ Generated Draft Invoice #INV-2026-081 ($1,450.00) in 24ms",
    initialHelpful: 275,
  },
];

const categoryPills: { id: FAQCategory; label: string; icon: React.FC<{ className?: string }> }[] =
  [
    { id: "all", label: "All Questions", icon: Sparkles },
    { id: "security", label: "Architecture & Security", icon: ShieldCheck },
    { id: "operations", label: "Operations & Team", icon: Users },
    { id: "billing", label: "Invoicing & Billing", icon: CreditCard },
    { id: "sandbox", label: "Live Demo", icon: Laptop },
  ];

const quickQueries = [
  "Multi-tenant isolation",
  "Automated invoices",
  "RBAC team roles",
  "Live workspace demo",
  "Client dossier CRM",
];

const architectPrompts = [
  {
    q: "Can staff members see sensitive rate cards?",
    a: "No. Role-Based Access Control (RBAC) enforces strict field-level masking. Staff roles are restricted to assigned appointment delivery schedules.",
  },
  {
    q: "How does FlowPilot prevent cross-tenant data leakage?",
    a: "Tenant isolation is enforced via PostgreSQL Row Level Security (RLS) at the database kernel level, not relying on application where-clauses.",
  },
  {
    q: "How fast is appointment to invoice conversion?",
    a: "Under 30ms. Completed appointments compile hourly rates, service items, and organization tax rules into a Stripe-ready draft invoice instantly.",
  },
];

/**
 * 3D Spatial Tilt Container with Specular Cursor Glare & Ambient Glow
 */
function SpatialCard({
  children,
  className = "",
  glowColor = "rgba(49, 95, 232, 0.18)",
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
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
      {/* Ambient Pulsing Neon Glow Mesh */}
      <div
        className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl blur-2xl transition-opacity duration-500"
        style={{
          background: glowColor,
          opacity: isHovered ? 0.45 : 0.15,
        }}
        aria-hidden="true"
      />

      {/* 3D Tilting Body */}
      <div
        style={{
          transform:
            shouldReduceMotion || !isHovered
              ? "none"
              : `rotateY(${mousePos.x * 5}deg) rotateX(${-mousePos.y * 5}deg) translateZ(8px)`,
          transition: "transform 0.16s cubic-bezier(0.16, 1, 0.3, 1)",
          transformStyle: "preserve-3d",
        }}
        className="relative h-full overflow-hidden rounded-3xl transition-all duration-300"
      >
        {/* Dynamic Cursor Spotlight Glare */}
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(350px circle at ${(mousePos.x + 0.5) * 100}% ${(mousePos.y + 0.5) * 100}%, rgba(255, 255, 255, 0.1), transparent 60%)`,
          }}
          aria-hidden="true"
        />

        {children}
      </div>
    </div>
  );
}

/**
 * Real-time keyword highlighter component
 */
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) {
    return <>{text}</>;
  }

  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={index}
            className="bg-primary/25 text-primary rounded-xs px-1 font-bold shadow-xs dark:text-cyan-300"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export const FAQSection: React.FC = () => {
  const [openIndices, setOpenIndices] = React.useState<Set<number>>(() => new Set([0]));
  const [selectedCategory, setSelectedCategory] = React.useState<FAQCategory>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [copiedSpec, setCopiedSpec] = React.useState(false);
  const [copiedSnippetId, setCopiedSnippetId] = React.useState<string | null>(null);
  const [activeSimulationId, setActiveSimulationId] = React.useState<string | null>(null);
  const [helpfulCounts, setHelpfulCounts] = React.useState<Record<string, number>>(() =>
    faqs.reduce((acc, faq) => ({ ...acc, [faq.id]: faq.initialHelpful }), {})
  );
  const [votedItems, setVotedItems] = React.useState<Record<string, boolean>>({});

  // Lead architect simulator states
  const [activeArchitectAnswer, setActiveArchitectAnswer] = React.useState<{
    q: string;
    a: string;
  } | null>(null);
  const [isTypingArchitect, setIsTypingArchitect] = React.useState(false);

  const shouldReduceMotion = useReducedMotion();

  // Filter FAQs based on category and search query
  const filteredFaqs = React.useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
      const normalizedQuery = searchQuery.toLowerCase().trim();
      if (!normalizedQuery) return matchesCategory;

      const matchesText =
        faq.question.toLowerCase().includes(normalizedQuery) ||
        faq.answer.toLowerCase().includes(normalizedQuery) ||
        faq.categoryLabel.toLowerCase().includes(normalizedQuery) ||
        faq.proofTitle.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesText;
    });
  }, [selectedCategory, searchQuery]);

  const toggleItem = (index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setOpenIndices(new Set(filteredFaqs.map((_, i) => i)));
  };

  const handleCollapseAll = () => {
    setOpenIndices(new Set());
  };

  const handleVote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (votedItems[id]) return;
    setHelpfulCounts((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setVotedItems((prev) => ({ ...prev, [id]: true }));
  };

  const handleCopyCode = (snippet: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(snippet).then(() => {
        setCopiedSnippetId(id);
        setTimeout(() => setCopiedSnippetId(null), 2000);
      });
    } else {
      setCopiedSnippetId(id);
      setTimeout(() => setCopiedSnippetId(null), 2000);
    }
  };

  const handleRunSimulation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSimulationId(activeSimulationId === id ? null : id);
  };

  const handleTriggerArchitect = (prompt: { q: string; a: string }) => {
    setIsTypingArchitect(true);
    setActiveArchitectAnswer(null);
    setTimeout(() => {
      setIsTypingArchitect(false);
      setActiveArchitectAnswer(prompt);
    }, 600);
  };

  const handleCopySpec = () => {
    const spec = `FlowPilot Architectural Blueprint v2.4
- Multi-Tenancy: PostgreSQL 16 RLS (org_id tenant isolation)
- RBAC: 4 Discrete Roles (OWNER, ADMIN, STAFF, BILLING)
- Runtime Validation: Strict Zod Contract Boundaries
- Billing: Synchronous Stripe Invoice Settlement & Rate Card Engine
- Architecture: High-Availability Resilient Deployment | Zero Telemetry`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(spec).then(() => {
        setCopiedSpec(true);
        setTimeout(() => setCopiedSpec(false), 2400);
      });
    } else {
      setCopiedSpec(true);
      setTimeout(() => setCopiedSpec(false), 2400);
    }
  };

  return (
    <section
      id="faq"
      className="border-border/70 bg-surface/40 relative scroll-mt-20 overflow-hidden border-t py-20 md:py-28"
    >
      {/* Background Holographic Glow Mesh & Light Grid Matrix */}
      <div
        className="from-primary/10 pointer-events-none absolute inset-x-0 top-1/4 -z-10 mx-auto h-[600px] w-full max-w-6xl rounded-full bg-gradient-to-br via-cyan-500/10 to-indigo-500/10 blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(#315fe8_1px,transparent_1px)] [background-size:28px_28px] opacity-15"
        aria-hidden="true"
      />

      {/* Top Laser Sweep Conduit */}
      <div
        className="via-primary/70 pointer-events-none absolute top-0 right-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
        aria-hidden="true"
      />

      <Container>
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="outline"
            className="border-primary/40 bg-primary/10 text-primary inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold shadow-xs backdrop-blur-md"
          >
            <Sparkles className="text-primary h-3.5 w-3.5 animate-pulse" />
            <span>Frequently Asked Questions</span>
          </Badge>

          <h2 className="text-foreground mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Everything You Need to Know About FlowPilot
          </h2>

          <p className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg">
            Direct, factual answers regarding our product capabilities, architecture, and workspace
            access.
          </p>
        </div>

        {/* Neural Command Search Bar (Linear / Apple VisionOS Grade) */}
        <div className="mx-auto mt-12 max-w-3xl">
          <div className="shadow-primary/10 relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/90 p-3.5 shadow-2xl backdrop-blur-2xl transition-all focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-500/20">
            {/* Top Specular Rim Light */}
            <div
              className="pointer-events-none absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent"
              aria-hidden="true"
            />

            {/* Live Indicator Status Bar */}
            <div className="flex items-center justify-between px-2 pb-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-mono font-medium text-cyan-400">
                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-cyan-400" />
                <span>INDEXED ARCHITECTURAL KNOWLEDGE RADAR</span>
              </span>
              <span className="font-mono text-slate-400">
                {filteredFaqs.length} of {faqs.length} SPECIFICATIONS ACTIVE
              </span>
            </div>

            <div className="flex items-center gap-3 px-2 py-1">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-gradient-to-br from-primary/25 to-primary/10 text-cyan-300 shadow-inner ring-1 ring-cyan-400/20">
                <Search className="h-4.5 w-4.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search architecture, billing, multi-tenant isolation, or RBAC..."
                className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-slate-400 sm:text-base"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                  aria-label="Clear search query"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <div className="hidden items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-2.5 py-1 font-mono text-xs font-bold text-slate-300 shadow-xs sm:flex">
                <kbd>⌘K</kbd>
              </div>
            </div>

            {/* Quick Prompt Filter Pills */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-800/80 px-2 pt-2.5 text-xs">
              <span className="mr-1 flex items-center gap-1 text-xs font-bold text-slate-300">
                <Activity className="h-3 w-3 text-cyan-400" />
                <span>Popular:</span>
              </span>
              {quickQueries.map((query) => (
                <button
                  key={query}
                  type="button"
                  onClick={() => {
                    setSearchQuery(query);
                    setSelectedCategory("all");
                  }}
                  className="cursor-pointer rounded-full border border-slate-700/80 bg-slate-800/70 px-3 py-1 text-xs font-medium text-slate-200 shadow-2xs transition-all hover:border-cyan-400 hover:bg-cyan-500/15 hover:text-cyan-300 active:scale-95"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Switcher Tabs & View Controls */}
        <div className="mx-auto mt-10 flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Domain Category Filter Tabs with Spring Slider */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categoryPills.map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedCategory === tab.id;
              const count =
                tab.id === "all"
                  ? faqs.length
                  : faqs.filter((item) => item.category === tab.id).length;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={cn(
                    "relative flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all sm:text-sm",
                    isSelected
                      ? "font-bold text-white shadow-lg"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  )}
                >
                  {isSelected && (
                    <motion.div
                      layoutId={shouldReduceMotion ? undefined : "faq-tab-indicator"}
                      className="from-primary shadow-primary/25 absolute inset-0 rounded-xl bg-gradient-to-r to-cyan-500 shadow-md"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                    <span
                      className={cn(
                        "py-0.2 rounded-full px-2 font-mono text-[10px]",
                        isSelected
                          ? "bg-white/25 font-bold text-white"
                          : "bg-slate-800 font-medium text-slate-400"
                      )}
                    >
                      {count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Expand All / Collapse All Controls */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleExpandAll}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 font-medium text-slate-300 shadow-xs transition-all hover:border-cyan-400 hover:text-white active:scale-95"
            >
              <ChevronDown className="h-3.5 w-3.5 text-cyan-400" />
              <span>Expand All</span>
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 font-medium text-slate-300 shadow-xs transition-all hover:border-slate-500 hover:text-white active:scale-95"
            >
              <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
              <span>Collapse All</span>
            </button>
          </div>
        </div>

        {/* Main Content Area: Split 2-Column Luxury Spatial Cockpit */}
        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Left Column: System Sentinel & Interactive AI Architect Assistant */}
          <div className="space-y-6 lg:col-span-5">
            {/* 3D Spatial Sentinel Status Card */}
            <SpatialCard glowColor="rgba(14, 165, 233, 0.25)">
              <div className="relative overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-2xl">
                {/* Top Specular Rim Light */}
                <div
                  className="pointer-events-none absolute inset-x-8 top-0 z-20 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent"
                  aria-hidden="true"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                    </span>
                    <span className="font-mono text-xs font-bold tracking-wide text-emerald-400 uppercase">
                      Core System Sentinel Online
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-slate-700 bg-slate-800 font-mono text-[10px] text-cyan-300"
                  >
                    High Availability
                  </Badge>
                </div>

                {/* Lead Architect Identity Badge */}
                <div className="relative mt-4 flex items-center gap-3.5 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 p-3 shadow-inner">
                  <div
                    className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
                    aria-hidden="true"
                  />
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-cyan-400/60 shadow-md">
                    <Image
                      src="/images/homepage/architect-lead.jpg"
                      alt="Dr. David Sterling, Lead Systems Architect"
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">David Sterling</h4>
                    <p className="font-mono text-[11px] text-cyan-400">
                      Lead Systems Architect &bull; Multi-Tenant RLS
                    </p>
                  </div>
                </div>

                <h3 className="mt-4 text-base font-bold text-white">
                  Autonomous Architecture Knowledge Engine
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  Real-time engineering verification for enterprise data isolation, RBAC security,
                  and Stripe settlement workflows.
                </p>

                {/* Animated Health Checklist */}
                <div className="mt-5 space-y-2 border-t border-slate-800 pt-4 text-xs">
                  <div className="relative flex items-center justify-between overflow-hidden rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5">
                    <div
                      className="pointer-events-none absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent"
                      aria-hidden="true"
                    />
                    <span className="flex items-center gap-2 text-slate-300">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md border border-cyan-500/25 bg-cyan-500/10 text-cyan-400 shadow-2xs">
                        <Database className="h-3.5 w-3.5" />
                      </div>
                      <span>PostgreSQL 16 Engine RLS</span>
                    </span>
                    <span className="font-mono text-[11px] font-bold text-emerald-400">
                      100% Active
                    </span>
                  </div>
                  <div className="relative flex items-center justify-between overflow-hidden rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5">
                    <div
                      className="pointer-events-none absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent"
                      aria-hidden="true"
                    />
                    <span className="flex items-center gap-2 text-slate-300">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md border border-indigo-500/25 bg-indigo-500/10 text-indigo-400 shadow-2xs">
                        <Lock className="h-3.5 w-3.5" />
                      </div>
                      <span>RBAC Route & Mutation Guard</span>
                    </span>
                    <span className="font-mono text-[11px] font-bold text-emerald-400">
                      Zero Bypass
                    </span>
                  </div>
                  <div className="relative flex items-center justify-between overflow-hidden rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5">
                    <div
                      className="pointer-events-none absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent"
                      aria-hidden="true"
                    />
                    <span className="flex items-center gap-2 text-slate-300">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md border border-amber-500/25 bg-amber-500/10 text-amber-400 shadow-2xs">
                        <Clock className="h-3.5 w-3.5" />
                      </div>
                      <span>Telemetry / Tracking Policy</span>
                    </span>
                    <span className="font-mono text-[11px] font-bold text-cyan-400">
                      0% Third-Party
                    </span>
                  </div>
                </div>

                {/* Interactive Instant Architect Query Simulator */}
                <div className="mt-6 border-t border-slate-800 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Instant Technical Inquiries:</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">Click to run</span>
                  </div>

                  <div className="mt-2.5 space-y-1.5">
                    {architectPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleTriggerArchitect(prompt)}
                        className="w-full cursor-pointer rounded-xl border border-slate-700/60 bg-slate-800/50 p-2 text-left text-[11px] text-slate-300 transition-all hover:border-cyan-400 hover:bg-cyan-500/10 hover:text-white active:scale-98"
                      >
                        <div className="font-medium text-cyan-300">⚡ {prompt.q}</div>
                      </button>
                    ))}
                  </div>

                  {/* Typing simulation console */}
                  {isTypingArchitect && (
                    <div className="mt-3 animate-pulse rounded-xl border border-cyan-500/40 bg-slate-950/90 p-3 font-mono text-xs text-cyan-400">
                      &gt; Querying kernel architecture spec...
                    </div>
                  )}

                  {activeArchitectAnswer && !isTypingArchitect && (
                    <div className="relative mt-3 overflow-hidden rounded-xl border border-cyan-500/40 bg-slate-950/90 p-3 font-mono text-xs text-slate-200 shadow-inner">
                      <div
                        className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
                        aria-hidden="true"
                      />
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Verified Engineering Specification:</span>
                      </div>
                      <div className="mt-1 text-[11px] leading-relaxed text-slate-300">
                        {activeArchitectAnswer.a}
                      </div>
                    </div>
                  )}
                </div>

                {/* 1-Click Copy Technical Spec */}
                <div className="mt-6 flex flex-col gap-2">
                  <Button
                    type="button"
                    onClick={handleCopySpec}
                    variant="outline"
                    size="sm"
                    className="w-full cursor-pointer gap-2 border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:border-cyan-400 hover:bg-slate-700 hover:text-white"
                  >
                    {copiedSpec ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Copied RFC Spec to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-slate-400" />
                        <span>Copy Architectural RFC-089</span>
                      </>
                    )}
                  </Button>

                  <Link
                    href="/dashboard"
                    className="from-primary shadow-primary/25 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r to-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Laptop className="h-4 w-4" />
                    <span>Launch Live Interactive Sandbox</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </SpatialCard>
          </div>

          {/* Right Column: 3D Spatial Knowledge Accordion Cards */}
          <div className="space-y-4 lg:col-span-7">
            {filteredFaqs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
                <HelpCircle className="mx-auto h-10 w-10 text-slate-500" />
                <h4 className="mt-3 text-base font-bold text-white">No Direct Matches Found</h4>
                <p className="mt-1 text-xs text-slate-400">
                  We couldn&apos;t find an indexed answer for &ldquo;{searchQuery}&rdquo;.
                </p>
                <div className="mt-5 flex justify-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="border-slate-700 bg-slate-800 text-xs text-white hover:bg-slate-700"
                  >
                    Reset Search Filter
                  </Button>
                </div>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => {
                const isOpen = openIndices.has(index);
                const headingId = `faq-heading-${faq.id}`;
                const panelId = `faq-panel-${faq.id}`;
                const isVoted = votedItems[faq.id];
                const currentHelpful = helpfulCounts[faq.id] || faq.initialHelpful;
                const TopicIcon = faq.categoryIcon;
                const isSimulating = activeSimulationId === faq.id;

                return (
                  <SpatialCard key={faq.id} glowColor={faq.accentColor}>
                    <div
                      className={cn(
                        "relative overflow-hidden rounded-3xl border transition-all duration-300",
                        isOpen
                          ? "shadow-primary/15 border-cyan-400/80 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 shadow-2xl ring-1 ring-cyan-400/40"
                          : "border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900/90"
                      )}
                    >
                      {/* Top Specular Line: Active vs Inactive */}
                      <div
                        className={cn(
                          "pointer-events-none absolute top-0 right-0 left-0 transition-opacity duration-300",
                          isOpen
                            ? "h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-100"
                            : "h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-60"
                        )}
                        aria-hidden="true"
                      />

                      {/* Question Button Header */}
                      <button
                        type="button"
                        id={headingId}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => toggleItem(index)}
                        className="group flex w-full cursor-pointer items-start justify-between gap-4 p-5 text-left focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:outline-none sm:p-6"
                      >
                        <div className="space-y-2 pr-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase shadow-xs",
                                isOpen
                                  ? "border border-cyan-400/40 bg-cyan-500/20 text-cyan-300"
                                  : "border border-slate-700 bg-slate-800 text-slate-300"
                              )}
                            >
                              <TopicIcon className="h-3 w-3" />
                              <span>{faq.categoryLabel}</span>
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              SPEC-0{index + 1}
                            </span>
                          </div>

                          <h3
                            className={cn(
                              "text-base leading-snug font-bold transition-colors sm:text-lg",
                              isOpen ? "text-white" : "text-slate-200 group-hover:text-cyan-300"
                            )}
                          >
                            <HighlightedText text={faq.question} query={searchQuery} />
                          </h3>
                        </div>

                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-300",
                            isOpen
                              ? "border-cyan-400/60 bg-cyan-500/25 text-cyan-300 shadow-md shadow-cyan-500/20"
                              : "border-slate-700 bg-slate-800 text-slate-400 group-hover:border-slate-600 group-hover:text-white"
                          )}
                        >
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform duration-300",
                              isOpen && "rotate-180"
                            )}
                          />
                        </div>
                      </button>

                      {/* Expandable Region with Spring Motion */}
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={headingId}
                        className={cn(
                          "grid transition-all duration-300 ease-in-out",
                          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        )}
                      >
                        <div className="overflow-hidden">
                          <div className="border-t border-slate-800 px-5 pt-4 pb-6 sm:px-6">
                            {/* Answer Body */}
                            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                              <HighlightedText text={faq.answer} query={searchQuery} />
                            </p>

                            {/* Verified Architectural Rule Callout Window */}
                            <div className="relative mt-5 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/90 p-4 shadow-xl">
                              <div
                                className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
                                aria-hidden="true"
                              />
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-red-500/80" />
                                  <span className="h-2 w-2 rounded-full bg-amber-500/80" />
                                  <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
                                  <span className="ml-2 font-mono text-[10px] font-bold text-slate-400">
                                    RULE BLUEPRINT • {faq.proofBadge}
                                  </span>
                                </div>
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                                  <Check className="h-3 w-3" />
                                  <span>Verified Architectural Spec</span>
                                </span>
                              </div>

                              <div className="mt-3 text-xs font-bold text-white">
                                {faq.proofTitle}
                              </div>
                              <div className="mt-1 text-xs leading-relaxed text-slate-400">
                                {faq.proofDetail}
                              </div>

                              {/* Code Snippet Box with Copy & Simulation Trigger */}
                              {faq.codeSnippet && (
                                <div className="relative mt-3 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 p-3 font-mono text-[11px]">
                                  <div
                                    className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
                                    aria-hidden="true"
                                  />
                                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                                    <span className="font-mono text-[10px] tracking-wider text-cyan-400 uppercase">
                                      Database Kernel Constraint:
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {faq.simulationOutput && (
                                        <button
                                          type="button"
                                          onClick={(e) => handleRunSimulation(faq.id, e)}
                                          className="bg-primary/20 hover:bg-primary/30 flex cursor-pointer items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] text-cyan-300 transition-colors"
                                        >
                                          <Play className="h-2.5 w-2.5" />
                                          <span>{isSimulating ? "Hide Output" : "Run Test"}</span>
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={(e) =>
                                          handleCopyCode(faq.codeSnippet || "", faq.id, e)
                                        }
                                        className="flex cursor-pointer items-center gap-1 text-slate-400 transition-colors hover:text-white"
                                        title="Copy code"
                                      >
                                        {copiedSnippetId === faq.id ? (
                                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                                        ) : (
                                          <Copy className="h-3.5 w-3.5" />
                                        )}
                                      </button>
                                    </div>
                                  </div>

                                  <pre className="overflow-x-auto pt-2 whitespace-pre text-cyan-300">
                                    {faq.codeSnippet}
                                  </pre>

                                  {/* Simulated execution output drawer */}
                                  {isSimulating && faq.simulationOutput && (
                                    <div className="mt-2.5 rounded-lg border border-emerald-500/30 bg-black/60 p-2 font-mono text-[10px] whitespace-pre text-emerald-400">
                                      {faq.simulationOutput}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Action Link if applicable */}
                              {faq.actionLink && (
                                <div className="mt-3.5 border-t border-slate-800 pt-3">
                                  <Link
                                    href={faq.actionLink.href}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:underline"
                                  >
                                    <span>{faq.actionLink.label}</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  </Link>
                                </div>
                              )}
                            </div>

                            {/* Footer Action Bar: Helpful Counter & Feedback */}
                            <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-3.5 text-xs text-slate-400">
                              <span className="text-[11px]">
                                Was this engineering explanation clear?
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleVote(faq.id, e)}
                                className={cn(
                                  "flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all",
                                  isVoted
                                    ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-500/20"
                                    : "border-slate-700 bg-slate-800 text-slate-300 hover:border-cyan-400 hover:bg-slate-700 hover:text-white"
                                )}
                              >
                                <ThumbsUp
                                  className={cn("h-3.5 w-3.5", isVoted && "fill-current")}
                                />
                                <span>{isVoted ? "Marked Helpful" : "Helpful"}</span>
                                <span className="font-mono text-[11px] text-slate-400">
                                  ({currentHelpful})
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SpatialCard>
                );
              })
            )}
          </div>
        </div>
      </Container>
    </section>
  );
};
