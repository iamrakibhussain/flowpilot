"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Search,
  X,
  ShieldCheck,
  Users,
  CreditCard,
  Laptop,
  ChevronDown,
  ChevronUp,
  Check,
  Copy,
  ArrowRight,
  ThumbsUp,
  Database,
  Lock,
  HelpCircle,
  Layers,
  Receipt,
  Play,
  CheckCircle2,
  Activity,
  Terminal,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type FAQCategory = "all" | "security" | "operations" | "billing" | "sandbox";

interface FAQItem {
  id: string;
  category: FAQCategory;
  categoryLabel: string;
  categoryIcon: React.FC<{ className?: string }>;
  accentColor: string;
  stripeGradient: string;
  glowColor: string;
  badgeStyle: string;
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
    accentColor: "rgba(99, 102, 241, 0.4)",
    stripeGradient: "from-indigo-500 via-purple-500 to-pink-500",
    glowColor: "rgba(99, 102, 241, 0.6)",
    badgeStyle: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    question: "What is FlowPilot and who is it designed for?",
    answer:
      "FlowPilot is a unified business operations SaaS platform built specifically for small-to-medium service businesses, agencies, consultancies, and professional teams. It brings client dossiers and relationship management (CRM), appointment scheduling, team capacity management, and invoice tracking together into one calm, structured command center.",
    proofBadge: "CORE ARCHITECTURE",
    proofTitle: "Unified Operational Data Model",
    proofDetail:
      "Unlike fragmented point solutions that force dual entry into Airtable, Google Calendar, and QuickBooks, FlowPilot binds all entities to a single Organization schema.",
    codeSnippet:
      "interface OrganizationWorkspace {\n  id: string; // UUID\n  name: string;\n  tier: 'PRO' | 'ENTERPRISE';\n  tenancy: 'ORGANIZATION_SCOPED';\n}",
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
    stripeGradient: "from-purple-500 via-indigo-500 to-blue-500",
    glowColor: "rgba(168, 85, 247, 0.6)",
    badgeStyle: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
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
    accentColor: "rgba(245, 158, 11, 0.4)",
    stripeGradient: "from-amber-400 via-orange-500 to-yellow-500",
    glowColor: "rgba(245, 158, 11, 0.6)",
    badgeStyle: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
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
    accentColor: "rgba(6, 182, 212, 0.4)",
    stripeGradient: "from-cyan-400 via-blue-500 to-indigo-500",
    glowColor: "rgba(6, 182, 212, 0.6)",
    badgeStyle: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    question: "How does multi-tenant workspace isolation protect our business data?",
    answer:
      "Every organization in FlowPilot is strictly scoped by an isolated Organization ID. Server-side middleware verifies user membership on every request before querying the database, ensuring customer records, appointments, and financial data are never exposed across tenant boundaries.",
    proofBadge: "APPLICATION-LEVEL TENANT ISOLATION",
    proofTitle: "Server-Side Organization Scoping",
    proofDetail:
      "Enforced by server-side middleware and organizationId query scoping. Membership is verified on every request before database access.",
    codeSnippet:
      "// tenant_context_middleware.ts\nconst orgId = req.headers['x-organization-id'];\nawait verifyMembership(req.user.id, orgId);\n\nconst clients = await prisma.customer.findMany({\n  where: { organizationId: orgId }\n});",
    simulationOutput:
      "✓ Header: X-Organization-Id verified\n✓ Server Membership Verified: org_acme_01 (Active)\n✓ Query Scoped: 0 cross-tenant records exposed",
    initialHelpful: 412,
  },
  {
    id: "faq-rbac-permissions",
    category: "security",
    categoryLabel: "Team Governance",
    categoryIcon: Lock,
    accentColor: "rgba(14, 165, 233, 0.4)",
    stripeGradient: "from-blue-500 via-indigo-600 to-cyan-400",
    glowColor: "rgba(14, 165, 233, 0.6)",
    badgeStyle: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    question: "Can we configure different permissions for our team members?",
    answer:
      "Yes. FlowPilot incorporates Role-Based Access Control (RBAC). You can assign Owner, Admin, Member, or Billing roles, ensuring that team members have full access to their assigned appointments while safeguarding organizational settings and sensitive financial data.",
    proofBadge: "RBAC MATRIX",
    proofTitle: "Strict Role-Based Boundary",
    proofDetail:
      "Four discrete roles ('OWNER' | 'ADMIN' | 'MEMBER' | 'BILLING') controlling route middleware, API mutations, and financial visibility.",
    codeSnippet:
      "enum UserRole {\n  OWNER = 'FULL_CONTROL',\n  ADMIN = 'OPS_MANAGEMENT',\n  MEMBER = 'ASSIGNED_DELIVERY',\n  BILLING = 'FINANCIAL_READ_WRITE'\n}",
    simulationOutput:
      "✓ Role Guard check: Member user requesting /api/rate-cards\n✓ HTTP 403 Forbidden: Protected by FinancialRBACGuard",
    initialHelpful: 198,
  },
  {
    id: "faq-appointments-to-invoices",
    category: "billing",
    categoryLabel: "Financial Automation",
    categoryIcon: Receipt,
    accentColor: "rgba(16, 185, 129, 0.4)",
    stripeGradient: "from-emerald-400 via-teal-500 to-cyan-500",
    glowColor: "rgba(16, 185, 129, 0.6)",
    badgeStyle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
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

const categoryPills: {
  id: FAQCategory;
  label: string;
  shortLabel: string;
  icon: React.FC<{ className?: string }>;
  accentColor: string;
}[] = [
  {
    id: "all",
    label: "All Questions",
    shortLabel: "All",
    icon: Sparkles,
    accentColor: "from-blue-600 to-indigo-600",
  },
  {
    id: "security",
    label: "Architecture & Security",
    shortLabel: "Architecture",
    icon: ShieldCheck,
    accentColor: "from-cyan-500 to-blue-600",
  },
  {
    id: "operations",
    label: "Operations & Team",
    shortLabel: "Operations",
    icon: Users,
    accentColor: "from-indigo-500 to-purple-600",
  },
  {
    id: "billing",
    label: "Invoicing & Billing",
    shortLabel: "Billing",
    icon: CreditCard,
    accentColor: "from-emerald-500 to-teal-600",
  },
  {
    id: "sandbox",
    label: "Live Demo",
    shortLabel: "Live Demo",
    icon: Laptop,
    accentColor: "from-amber-500 to-orange-600",
  },
];

const quickQueries = [
  {
    label: "Multi-tenant isolation",
    category: "security" as FAQCategory,
    icon: Database,
    theme:
      "text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-500/20",
  },
  {
    label: "Automated invoices",
    category: "billing" as FAQCategory,
    icon: Receipt,
    theme:
      "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/20",
  },
  {
    label: "RBAC team roles",
    category: "security" as FAQCategory,
    icon: Lock,
    theme:
      "text-purple-700 dark:text-purple-300 bg-purple-500/10 border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/20",
  },
  {
    label: "Live workspace demo",
    category: "sandbox" as FAQCategory,
    icon: Laptop,
    theme:
      "text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/20",
  },
  {
    label: "Client dossier CRM",
    category: "operations" as FAQCategory,
    icon: Users,
    theme:
      "text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 border-indigo-500/30 hover:border-indigo-500/60 hover:bg-indigo-500/20",
  },
];

const architectPrompts = [
  {
    q: "Can staff members see sensitive rate cards?",
    a: "No. Role-Based Access Control (RBAC) enforces strict role-level masking. Member roles are restricted to assigned appointment delivery schedules, while rate cards and billing configurations are restricted to Admin and Owner roles.",
    hash: "SHA-256: 8f4e91b...enforced",
  },
  {
    q: "How does FlowPilot prevent cross-tenant data leakage?",
    a: "Tenant isolation is enforced via server-side tenant context middleware and organizationId-scoped Prisma queries. The server cryptographically validates user membership before any database query executes.",
    hash: "SHA-256: 3c1a77d...verified",
  },
  {
    q: "How fast is appointment to invoice conversion?",
    a: "Under 30ms. Completed appointments compile hourly rates, service items, and organization tax rules into a draft invoice instantly.",
    hash: "SHA-256: 9e0b44f...deterministic",
  },
];

/**
 * 3D Spatial Bento Card with Specular Cursor Glare & Ambient Glow
 */
function SpatialCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const cardRef = React.useRef<HTMLDivElement>(null);
  const rectRef = React.useRef<DOMRect | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Damped spring physics for smooth, organic 3D tilt (-3.5deg to +3.5deg)
  const rotateX = useSpring(useTransform(mouseY, [-280, 280], [3.5, -3.5]), {
    stiffness: 260,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(mouseX, [-240, 240], [-3.5, 3.5]), {
    stiffness: 260,
    damping: 24,
  });

  const handleMouseEnter = () => {
    if (cardRef.current) {
      rectRef.current = cardRef.current.getBoundingClientRect();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = rectRef.current || cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);

    mouseX.set(x - rect.width / 2);
    mouseY.set(y - rect.height / 2);
  };

  const handleMouseLeave = () => {
    rectRef.current = null;
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
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
        className="group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-3xl border border-neutral-200/90 bg-white/85 p-3.5 shadow-xl backdrop-blur-2xl transition-all duration-300 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/10 min-[360px]:p-4 sm:p-6 dark:border-neutral-800/80 dark:bg-neutral-900/80 dark:hover:border-cyan-400/40"
      >
        {/* Specular Ambient Glare Follower */}
        {!shouldReduceMotion && (
          <div
            className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `radial-gradient(420px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(6, 182, 212, 0.12), transparent 75%)`,
            }}
            aria-hidden="true"
          />
        )}

        {/* Laser Top Rim Light */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          aria-hidden="true"
        />

        {/* Micro-dot Background Texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
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
}

/**
 * High-craft Monaco/VS Code-style Syntax Highlighting Block
 */
function SyntaxCodeBlock({ code }: { code: string }) {
  const lines = code.split("\n");

  const tokenizeLine = (line: string) => {
    // Comment line
    if (line.trim().startsWith("//")) {
      return <span className="text-zinc-500 italic">{line}</span>;
    }

    // Split on word boundary preserving whitespace and symbols
    const tokens = line
      .split(
        /(\b(?:interface|type|const|let|var|await|if|enum|async|return|function)\b|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\/\/.*$|[a-zA-Z0-9_$]+|[^\s\w])/g
      )
      .filter(Boolean);

    return tokens.map((token, i) => {
      if (/^(interface|type|const|let|var|await|if|enum|async|return|function)$/.test(token)) {
        return (
          <span key={i} className="font-semibold text-purple-400">
            {token}
          </span>
        );
      }
      if (/^('.*'|".*")$/.test(token)) {
        return (
          <span key={i} className="text-emerald-400">
            {token}
          </span>
        );
      }
      if (token.startsWith("//")) {
        return (
          <span key={i} className="text-zinc-500 italic">
            {token}
          </span>
        );
      }
      if (
        /^(string|UUID|PRO|ENTERPRISE|ORGANIZATION_SCOPED|ServicePipeline|ClientDossier|CalendarBooking|StaffCapacityAllocation|ReconciledStripeInvoice|UserRole|OWNER|ADMIN|MEMBER|BILLING|READY|boolean|number|true|false)$/.test(
          token
        )
      ) {
        return (
          <span key={i} className="font-medium text-cyan-400">
            {token}
          </span>
        );
      }
      if (/^[:{}()[\],;=<>|]$/.test(token)) {
        return (
          <span key={i} className="text-zinc-400">
            {token}
          </span>
        );
      }
      return (
        <span key={i} className="text-slate-200">
          {token}
        </span>
      );
    });
  };

  return (
    <pre className="max-w-full scrollbar-thin overflow-x-auto font-mono text-[9.5px] leading-relaxed select-text min-[360px]:text-[10.5px] sm:text-[11.5px]">
      {lines.map((line, idx) => (
        <div key={idx} className="table-row">
          <span className="table-cell pr-2 text-right font-mono text-[8.5px] text-zinc-600 select-none min-[360px]:text-[9px] sm:pr-3 sm:text-[10px]">
            {idx + 1}
          </span>
          <span className="table-cell whitespace-pre">{tokenizeLine(line)}</span>
        </div>
      ))}
    </pre>
  );
}

/**
 * Real-time keyword highlighter component
 */
function HighlightedText({ text, query }: { text: string; query: string }) {
  const trimmed = query.trim();
  if (!trimmed) {
    return <>{text}</>;
  }

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return <>{text}</>;

  const escapedTokens = tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escapedTokens.join("|")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        tokens.some((t) => t.toLowerCase() === part.toLowerCase()) ? (
          <mark
            key={index}
            className="rounded-xs bg-amber-400/25 px-1 font-bold text-amber-700 dark:text-amber-300"
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
    hash: string;
  } | null>(null);
  const [isTypingArchitect, setIsTypingArchitect] = React.useState(false);

  const shouldReduceMotion = useReducedMotion();
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const tabsRef = React.useRef<(HTMLButtonElement | null)[]>([]);

  // Keyboard shortcut: Cmd/Ctrl + K to focus search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter FAQs based on category and search query (<50ms execution)
  const filteredFaqs = React.useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    return faqs.filter((faq) => {
      const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
      if (!normalizedQuery) return matchesCategory;

      const searchableText =
        `${faq.question} ${faq.answer} ${faq.categoryLabel} ${faq.proofTitle} ${faq.proofBadge} ${faq.proofDetail}`.toLowerCase();
      const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

      const matchesText =
        searchableText.includes(normalizedQuery) ||
        tokens.every((token) => searchableText.includes(token));

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

  const handleCopyCode = async (snippet: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(snippet);
      }
    } catch {
      // Graceful fallback
    }
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const handleRunSimulation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSimulationId((prev) => (prev === id ? null : id));
  };

  const handleTriggerArchitect = (prompt: { q: string; a: string; hash: string }) => {
    setIsTypingArchitect(true);
    setActiveArchitectAnswer(null);
    setTimeout(() => {
      setIsTypingArchitect(false);
      setActiveArchitectAnswer(prompt);
    }, 420);
  };

  const handleCopySpec = async () => {
    const spec = `FlowPilot Architectural Blueprint v2.4
- Multi-Tenancy: Organization-scoped data access via server-side membership verification
- RBAC: 4 Discrete Roles (OWNER, ADMIN, MEMBER, BILLING)
- Runtime Validation: Strict Zod Contract Boundaries
- Billing: Synchronous Stripe Invoice Settlement & Rate Card Engine
- Architecture: High-Availability Resilient Deployment | Zero Telemetry`;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(spec);
      }
    } catch {
      // Graceful fallback
    }
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2400);
  };

  // Keyboard navigation for tablist
  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    let targetIndex = index;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      targetIndex = (index + 1) % categoryPills.length;
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      targetIndex = (index - 1 + categoryPills.length) % categoryPills.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      targetIndex = categoryPills.length - 1;
    }

    if (targetIndex !== index) {
      tabsRef.current[targetIndex]?.focus();
      setSelectedCategory(categoryPills[targetIndex].id);
    }
  };

  return (
    <section
      id="faq"
      className="relative scroll-mt-24 overflow-hidden border-t border-neutral-200/80 bg-neutral-50/60 py-16 sm:scroll-mt-28 sm:py-24 md:py-28 dark:border-neutral-800/80 dark:bg-neutral-950/70"
    >
      {/* Dynamic Atmospheric Multi-Stop Gradient Halos */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[450px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-500/15 via-indigo-500/10 to-cyan-400/15 blur-[120px] sm:h-[550px] sm:w-[1000px] xl:h-[700px] xl:w-[1300px] 2xl:h-[850px] 2xl:w-[1600px] dark:from-blue-600/20 dark:via-indigo-600/15 dark:to-cyan-500/20"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 -right-40 -z-10 h-[350px] w-[450px] rounded-full bg-gradient-to-b from-purple-500/10 via-pink-500/5 to-transparent blur-[100px] xl:h-[500px] xl:w-[650px] 2xl:h-[650px] 2xl:w-[850px]"
        aria-hidden="true"
      />

      {/* Top Laser Accent Separator */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent dark:via-blue-400/40"
        aria-hidden="true"
      />

      <Container size="lg">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center xl:max-w-4xl">
          {/* Iridescent Gradient Pill Badge */}
          <div className="group relative inline-flex max-w-full items-center gap-2 overflow-hidden rounded-full p-[1px] shadow-lg shadow-blue-500/10 transition-transform duration-300 hover:scale-105">
            <span className="animate-gradient-x absolute inset-0 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />
            <div className="relative flex max-w-full items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold text-neutral-800 backdrop-blur-xl min-[360px]:text-xs sm:gap-2 sm:px-4 sm:py-1.5 dark:bg-neutral-900/90 dark:text-neutral-200">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="truncate tracking-normal sm:tracking-wide">
                VERIFIED KNOWLEDGE BASE &bull; SPECIFICATIONS v2.4
              </span>
            </div>
          </div>

          <h2 className="mt-4 text-2xl leading-tight font-black tracking-tight text-neutral-900 min-[360px]:text-3xl sm:mt-5 sm:text-4xl md:text-5xl lg:text-6xl dark:text-white">
            Everything You Need to Know About{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-300">
              FlowPilot
            </span>
          </h2>

          <p className="mt-3.5 text-sm leading-relaxed text-neutral-600 sm:mt-5 sm:text-base md:text-lg dark:text-neutral-400">
            Direct, verifiable answers regarding our operational architecture, tenant isolation,
            financial automation, and sandbox access.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* COMMAND CENTER SPOTLIGHT SEARCH CONSOLE */}
        {/* ========================================================================= */}
        <div className="mx-auto mt-10 max-w-3xl sm:mt-12 xl:max-w-4xl 2xl:max-w-5xl">
          <div className="relative rounded-3xl p-[1px] shadow-2xl transition-all duration-300">
            {/* Glowing Gradient Border Ring */}
            <div
              className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-blue-500/40 via-indigo-500/30 to-cyan-400/40 opacity-70 blur-xs transition-opacity duration-300 focus-within:opacity-100 dark:from-blue-400/30 dark:via-indigo-400/20 dark:to-cyan-300/30"
              aria-hidden="true"
            />

            {/* Inner Console Card */}
            <div className="relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-white/95 p-3.5 shadow-xl backdrop-blur-2xl transition-all sm:p-5 dark:border-neutral-800 dark:bg-neutral-950/90">
              {/* Telemetry Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-neutral-200/70 pb-2.5 text-[10px] sm:pb-3 sm:text-[11px] dark:border-neutral-800">
                <div className="flex min-w-0 items-center gap-1.5 font-mono font-semibold sm:gap-2">
                  <span className="flex h-2 w-2 shrink-0 items-center justify-center">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  </span>
                  <span className="truncate text-neutral-900 dark:text-neutral-100">
                    KNOWLEDGE BASE KERNEL
                  </span>
                  <span className="hidden text-neutral-400 sm:inline">&bull;</span>
                  <span className="hidden font-medium text-emerald-600 sm:inline dark:text-emerald-400">
                    STATUS: ONLINE (99.99%)
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-semibold text-emerald-600 sm:px-2.5 sm:text-[10px] dark:text-emerald-400">
                    ⚡ &lt;12ms Indexing
                  </span>
                  <span className="hidden rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 font-mono text-[10px] text-neutral-600 sm:inline dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                    {filteredFaqs.length}/{faqs.length} SPECS ACTIVE
                  </span>
                </div>
              </div>

              {/* Main Input Row */}
              <div className="mt-3 flex items-center gap-2 sm:mt-3.5 sm:gap-3">
                <label htmlFor="faq-search-input" className="sr-only">
                  Search frequently asked questions
                </label>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 sm:h-11 sm:w-11 sm:rounded-2xl">
                  <Search className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                </div>
                <input
                  ref={searchInputRef}
                  id="faq-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search architecture, RBAC, or billing..."
                  aria-label="Search frequently asked questions"
                  className="w-full bg-transparent text-xs font-semibold text-neutral-900 placeholder:font-normal placeholder:text-neutral-400 focus:outline-hidden sm:text-sm md:text-base dark:text-neutral-100 dark:placeholder:text-neutral-500"
                />

                {searchQuery && (
                  <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="rounded-xl p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
                    aria-label="Clear search query"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                )}

                <button
                  type="button"
                  onClick={() => searchInputRef.current?.focus()}
                  className="hidden shrink-0 items-center gap-1.5 rounded-xl border border-neutral-300/80 bg-gradient-to-b from-neutral-100 to-neutral-200/80 px-2.5 py-1 font-mono text-xs font-bold text-neutral-700 shadow-sm transition-transform active:scale-95 sm:flex dark:border-neutral-700 dark:from-neutral-800 dark:to-neutral-900 dark:text-neutral-300"
                  title="Press ⌘K or Ctrl+K to search"
                  aria-label="Focus search input (Shortcut: ⌘K or Ctrl+K)"
                >
                  <kbd>⌘K</kbd>
                </button>
              </div>

              {/* Categorized Cyber Prompt Chips */}
              <div className="mt-3.5 flex scrollbar-none flex-nowrap items-center gap-1.5 overflow-x-auto border-t border-neutral-200/70 pt-2.5 pb-1.5 text-xs sm:mt-4 sm:flex-wrap sm:gap-2 sm:pt-3 dark:border-neutral-800">
                <span className="flex shrink-0 items-center gap-1 font-mono text-[11px] font-bold text-neutral-500 uppercase dark:text-neutral-400">
                  <Activity className="h-3 w-3 animate-pulse text-blue-500" />
                  <span>Popular:</span>
                </span>
                {quickQueries.map((item) => {
                  const ChipIcon = item.icon;
                  const isCurrent = searchQuery === item.label;

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setSearchQuery(item.label);
                        setSelectedCategory("all");
                      }}
                      className={cn(
                        "group flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs active:scale-95",
                        isCurrent
                          ? "border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-500/25"
                          : item.theme
                      )}
                    >
                      <ChipIcon className="h-3 w-3 transition-transform group-hover:scale-110" />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FLUID CATEGORY PILL NAVIGATION & DUAL VIEW CONTROLS */}
        {/* ========================================================================= */}
        <div className="mx-auto mt-10 flex w-full max-w-6xl flex-col items-center justify-between gap-4 sm:mt-12 xl:max-w-7xl xl:flex-row 2xl:max-w-[1400px]">
          {/* Framer Motion Sliding Pill Navigation Bar - Smooth horizontal swipe on mobile, centered/inline on desktop */}
          <div className="relative w-full overflow-hidden rounded-2xl p-0.5 xl:w-auto">
            <div
              role="tablist"
              aria-label="FAQ category filters"
              className="relative flex w-full scrollbar-none items-center justify-start gap-1 overflow-x-auto rounded-2xl border border-neutral-200/80 bg-neutral-200/50 p-1.5 shadow-inner backdrop-blur-xl sm:justify-center sm:gap-1.5 xl:w-auto dark:border-neutral-800 dark:bg-neutral-900/60"
            >
              {categoryPills.map((tab, idx) => {
                const Icon = tab.icon;
                const isSelected = selectedCategory === tab.id;
                const count =
                  tab.id === "all"
                    ? faqs.length
                    : faqs.filter((item) => item.category === tab.id).length;

                return (
                  <button
                    key={tab.id}
                    ref={(el) => {
                      tabsRef.current[idx] = el;
                    }}
                    role="tab"
                    id={`faq-tab-${tab.id}`}
                    aria-selected={isSelected}
                    aria-controls="faq-accordion-list"
                    tabIndex={isSelected ? 0 : -1}
                    type="button"
                    onClick={() => setSelectedCategory(tab.id)}
                    onKeyDown={(e) => handleTabKeyDown(e, idx)}
                    className={cn(
                      "relative flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-colors sm:px-3 sm:py-2 xl:text-sm",
                      isSelected
                        ? "text-white"
                        : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                    )}
                  >
                    {/* Sliding Background Indicator */}
                    {isSelected && (
                      <motion.div
                        layoutId="activeCategoryPill"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      />
                    )}

                    <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap">
                      <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.shortLabel}</span>
                      <span
                        className={cn(
                          "py-0.2 rounded-full px-1.5 font-mono text-[10px] transition-colors sm:px-2 sm:py-0.5",
                          isSelected
                            ? "bg-white/20 font-black text-white"
                            : "bg-neutral-300/70 font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        )}
                      >
                        {count}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dual Expand/Collapse Capsule Controls */}
          <div className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-neutral-200/80 bg-neutral-200/50 p-1 shadow-inner backdrop-blur-xl sm:w-auto sm:p-1.5 dark:border-neutral-800 dark:bg-neutral-900/60">
            <button
              type="button"
              onClick={handleExpandAll}
              aria-label="Expand all FAQ items"
              className={cn(
                "group flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all duration-150 active:scale-95 sm:flex-initial sm:px-3",
                openIndices.size === filteredFaqs.length && filteredFaqs.length > 0
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                  : "bg-white text-neutral-800 shadow-xs hover:-translate-y-0.5 hover:shadow-md dark:bg-neutral-800 dark:text-neutral-200"
              )}
            >
              <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
              <span>Expand All</span>
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              aria-label="Collapse all FAQ items"
              className={cn(
                "group flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all duration-150 active:scale-95 sm:flex-initial sm:px-3",
                openIndices.size === 0
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                  : "bg-white text-neutral-800 shadow-xs hover:-translate-y-0.5 hover:shadow-md dark:bg-neutral-800 dark:text-neutral-200"
              )}
            >
              <ChevronUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
              <span>Collapse All</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN COCKPIT: LEFT 3D SENTINEL & RIGHT SPATIAL ACCORDION SPEC CARDS */}
        {/* ========================================================================= */}
        <div className="mx-auto mt-10 grid w-full max-w-6xl grid-cols-1 items-start gap-8 sm:mt-12 lg:grid-cols-12 xl:max-w-7xl xl:gap-8 2xl:max-w-[1400px] 2xl:gap-10">
          {/* Left Column: Holographic Systems Sentinel & Live Architect Terminal */}
          {/* order-2 on mobile so FAQs appear first for mobile readers, order-1 on desktop with sticky positioning */}
          <div className="order-2 space-y-6 lg:sticky lg:top-28 lg:order-1 lg:col-span-5 xl:col-span-4">
            {/* Ambient Behind Glow for Sentinel */}
            <div className="relative">
              <div
                className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-b from-cyan-500/20 via-blue-500/10 to-transparent blur-2xl"
                aria-hidden="true"
              />

              <SpatialCard>
                <div>
                  {/* Top Online Beacon HUD */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      </span>
                      <span className="truncate font-mono text-[11px] font-extrabold tracking-wider text-neutral-900 uppercase sm:text-xs dark:text-white">
                        Core System Sentinel
                      </span>
                    </div>
                    <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-600 sm:px-2.5 sm:text-[10px] dark:text-emerald-400">
                      HIGH AVAILABILITY
                    </span>
                  </div>

                  {/* Lead Architect Persona Badge */}
                  <div className="relative mt-4 flex items-center gap-3 overflow-hidden rounded-2xl border border-neutral-200/80 bg-gradient-to-r from-neutral-100/90 to-neutral-50/50 p-2.5 shadow-inner sm:mt-5 sm:gap-3.5 sm:p-3.5 dark:border-neutral-800 dark:from-neutral-900/90 dark:to-neutral-900/50">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-cyan-500 shadow-md sm:h-12 sm:w-12">
                      <Image
                        src="/images/homepage/architect-lead.jpg"
                        alt="David Sterling, Lead Systems Architect"
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 sm:h-3 sm:w-3 dark:border-neutral-900" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-xs font-bold text-neutral-900 sm:text-sm dark:text-white">
                        David Sterling
                      </h4>
                      <p className="truncate font-mono text-[10px] text-neutral-500 min-[360px]:text-[11px] dark:text-neutral-400">
                        Lead Systems Architect &bull; Multi-Tenant Core
                      </p>
                    </div>
                  </div>

                  <h3 className="mt-4 text-sm font-extrabold text-neutral-900 sm:mt-5 sm:text-base dark:text-white">
                    Autonomous Architecture Knowledge Engine
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                    Real-time engineering verification for multi-tenant data isolation, strict RBAC
                    mutation guards, and zero-leakage security boundaries.
                  </p>

                  {/* Live Security & Architectural Monitors */}
                  <div className="mt-4 space-y-2 border-t border-neutral-200/70 pt-3.5 text-xs sm:mt-5 sm:pt-4 dark:border-neutral-800">
                    <div className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200/80 bg-neutral-100/50 p-2 transition-all duration-200 hover:border-cyan-500/40 hover:bg-neutral-100 sm:p-2.5 dark:border-neutral-800/80 dark:bg-neutral-900/50 dark:hover:border-cyan-400/40">
                      <span className="flex min-w-0 items-center gap-2 font-medium text-neutral-900 dark:text-neutral-200">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 shadow-xs sm:h-7 sm:w-7 dark:text-cyan-400">
                          <Database className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                        <span className="truncate text-[11px] sm:text-xs">
                          Server-Side Organization Scoping
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-600 sm:text-[10px] dark:text-emerald-400">
                        Enforced
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200/80 bg-neutral-100/50 p-2 transition-all duration-200 hover:border-purple-500/40 hover:bg-neutral-100 sm:p-2.5 dark:border-neutral-800/80 dark:bg-neutral-900/50 dark:hover:border-purple-400/40">
                      <span className="flex min-w-0 items-center gap-2 font-medium text-neutral-900 dark:text-neutral-200">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 shadow-xs sm:h-7 sm:w-7 dark:text-purple-400">
                          <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                        <span className="truncate text-[11px] sm:text-xs">
                          RBAC Route &amp; Mutation Guard
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-600 sm:text-[10px] dark:text-emerald-400">
                        Enforced
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200/80 bg-neutral-100/50 p-2 transition-all duration-200 hover:border-blue-500/40 hover:bg-neutral-100 sm:p-2.5 dark:border-neutral-800/80 dark:bg-neutral-900/50 dark:hover:border-blue-400/40">
                      <span className="flex min-w-0 items-center gap-2 font-medium text-neutral-900 dark:text-neutral-200">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 shadow-xs sm:h-7 sm:w-7 dark:text-blue-400">
                          <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </div>
                        <span className="truncate text-[11px] sm:text-xs">
                          Runtime Zod Contract Validation
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-600 sm:text-[10px] dark:text-emerald-400">
                        Enforced
                      </span>
                    </div>
                  </div>

                  {/* Interactive Instant Architect Inquiries Terminal */}
                  <div className="mt-5 border-t border-neutral-200/70 pt-4 sm:mt-6 sm:pt-5 dark:border-neutral-800">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="flex items-center gap-1.5 text-xs font-extrabold text-neutral-900 dark:text-white">
                        <Terminal className="h-3.5 w-3.5 shrink-0 text-cyan-500 sm:h-4 sm:w-4" />
                        <span>Instant Architecture Inquiries:</span>
                      </span>
                      <span className="font-mono text-[9.5px] font-semibold text-cyan-600 sm:text-[10px] dark:text-cyan-400">
                        Click to query
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-2">
                      {architectPrompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleTriggerArchitect(prompt)}
                          className="group w-full cursor-pointer rounded-xl border border-neutral-200/80 bg-white/70 p-2 text-left text-[11.5px] font-semibold text-neutral-800 shadow-xs transition-all duration-150 hover:-translate-x-1 hover:border-cyan-500/40 hover:bg-neutral-50 sm:p-2.5 sm:text-xs dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-200 dark:hover:bg-neutral-800/80"
                        >
                          <div className="flex items-start gap-1.5">
                            <span className="mt-0.5 shrink-0 text-cyan-500 transition-transform group-hover:scale-125">
                              ⚡
                            </span>
                            <span className="leading-snug">{prompt.q}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Typing simulation console */}
                    {isTypingArchitect && (
                      <div className="mt-3 animate-pulse rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2.5 font-mono text-[11px] text-cyan-700 sm:p-3 sm:text-xs dark:text-cyan-300">
                        &gt; [KERNEL_SOCKET] Fetching cryptographic architecture RFC spec...
                      </div>
                    )}

                    {activeArchitectAnswer && !isTypingArchitect && (
                      <motion.div
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative mt-3 overflow-hidden rounded-2xl border border-cyan-500/40 bg-neutral-950 p-3 font-mono text-xs text-neutral-200 shadow-2xl sm:p-3.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-neutral-800 pb-2 text-[10px]">
                          <span className="flex shrink-0 items-center gap-1 font-bold text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Verified Specification</span>
                          </span>
                          <span className="max-w-full truncate font-mono text-[9px] text-neutral-500 sm:text-[10px]">
                            {activeArchitectAnswer.hash}
                          </span>
                        </div>
                        <div className="mt-2 text-[10.5px] leading-relaxed break-words text-slate-300 sm:text-[11px]">
                          {activeArchitectAnswer.a}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* 1-Click Action Buttons */}
                <div className="mt-5 flex flex-col gap-2.5 border-t border-neutral-200/70 pt-4 sm:mt-6 dark:border-neutral-800">
                  <Button
                    type="button"
                    onClick={handleCopySpec}
                    variant="outline"
                    size="sm"
                    className="w-full cursor-pointer gap-2 border-neutral-300 bg-neutral-100 py-2 text-[11.5px] font-bold text-neutral-800 shadow-xs transition-all hover:bg-neutral-200 active:scale-95 sm:py-2.5 sm:text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                  >
                    {copiedSpec ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600 sm:h-4 sm:w-4 dark:text-emerald-400" />
                        <span className="truncate">Copied RFC Spec to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-neutral-500 sm:h-4 sm:w-4" />
                        <span className="truncate">Copy Architectural RFC-089</span>
                      </>
                    )}
                  </Button>

                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-3 py-2 text-center text-[11.5px] font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-cyan-400 hover:shadow-xl active:scale-95 sm:px-4 sm:py-2.5 sm:text-xs"
                  >
                    <Laptop className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                    <span className="truncate">Launch Live Interactive Sandbox</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  </Link>
                </div>
              </SpatialCard>
            </div>
          </div>

          {/* Right Column: Spatial Accordion Question Cards */}
          {/* order-1 on mobile so questions appear first */}
          <div
            id="faq-accordion-list"
            className="order-1 space-y-4 lg:order-2 lg:col-span-7 xl:col-span-8"
          >
            {filteredFaqs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-neutral-300 bg-white/50 p-6 text-center backdrop-blur-xl sm:p-10 dark:border-neutral-700 dark:bg-neutral-900/50">
                <HelpCircle className="mx-auto h-12 w-12 text-neutral-400" />
                <h4 className="mt-4 text-base font-bold text-neutral-900 dark:text-white">
                  No Direct Specifications Found
                </h4>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  We couldn&apos;t find an indexed specification for &ldquo;{searchQuery}&rdquo;.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="border-neutral-300 bg-white text-xs font-bold text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    Reset Filter Search
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
                  <motion.div
                    key={faq.id}
                    layout
                    className={cn(
                      "group relative overflow-hidden rounded-2xl border transition-all duration-300",
                      isOpen
                        ? "border-blue-500/50 bg-white shadow-2xl shadow-blue-500/10 dark:border-blue-400/50 dark:bg-neutral-900"
                        : "border-neutral-200/90 bg-white/85 shadow-sm backdrop-blur-xl hover:-translate-y-1 hover:border-neutral-300 hover:shadow-xl hover:shadow-blue-500/5 dark:border-neutral-800/90 dark:bg-neutral-900/80 dark:hover:border-neutral-700"
                    )}
                  >
                    {/* Category-Specific Glowing Left Accent Stripe */}
                    <div
                      className={cn(
                        "absolute top-0 bottom-0 left-0 w-[4px] rounded-l-2xl bg-gradient-to-b transition-all duration-300",
                        faq.stripeGradient,
                        isOpen
                          ? "opacity-100 shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                          : "opacity-40 group-hover:opacity-100"
                      )}
                      aria-hidden="true"
                    />

                    {/* Specular Top Rim Light */}
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20"
                      aria-hidden="true"
                    />

                    {/* Question Button Header */}
                    <button
                      type="button"
                      id={headingId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggleItem(index)}
                      className="group focus-visible:ring-foreground/20 flex w-full cursor-pointer items-start justify-between gap-2.5 p-3.5 text-left focus-visible:ring-2 focus-visible:outline-hidden sm:gap-4 sm:p-5 md:p-6"
                    >
                      <div className="min-w-0 flex-1 space-y-2 pr-1 pl-1 sm:space-y-2.5 sm:pr-2 sm:pl-2">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[9.5px] font-bold tracking-wider uppercase shadow-2xs sm:gap-1.5 sm:px-2.5 sm:text-[10px]",
                              faq.badgeStyle
                            )}
                          >
                            <TopicIcon className="h-3 w-3 shrink-0" />
                            <span className="truncate">{faq.categoryLabel}</span>
                          </span>
                          <span className="shrink-0 rounded-md border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold text-neutral-600 sm:px-2 sm:text-[10px] dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400">
                            SPEC-0{index + 1}
                          </span>
                        </div>

                        <h3
                          className={cn(
                            "text-sm leading-snug font-extrabold break-words transition-colors min-[360px]:text-[15px] sm:text-lg",
                            isOpen
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-neutral-900 group-hover:text-blue-600 dark:text-neutral-100 dark:group-hover:text-blue-400"
                          )}
                        >
                          <HighlightedText text={faq.question} query={searchQuery} />
                        </h3>
                      </div>

                      {/* 3D Action Chevron Button */}
                      <div
                        className={cn(
                          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 sm:h-9 sm:w-9",
                          isOpen
                            ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                            : "border-neutral-200 bg-neutral-100 text-neutral-500 group-hover:border-neutral-300 group-hover:bg-neutral-200 group-hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400 dark:group-hover:bg-neutral-700 dark:group-hover:text-white"
                        )}
                      >
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 transition-transform duration-300 sm:h-4 sm:w-4",
                            isOpen && "rotate-180",
                            shouldReduceMotion && "transition-none"
                          )}
                        />
                      </div>
                    </button>

                    {/* Expandable Region with Spring Physics */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={panelId}
                          role="region"
                          aria-labelledby={headingId}
                          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                          animate={
                            shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }
                          }
                          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className="border-t border-neutral-200/80 px-3.5 pt-3 pb-4.5 pl-4 sm:px-6 sm:pt-4 sm:pb-6 sm:pl-8 dark:border-neutral-800">
                            {/* Answer Body */}
                            <p className="text-xs leading-relaxed break-words text-neutral-700 min-[360px]:text-sm sm:text-base dark:text-neutral-300">
                              <HighlightedText text={faq.answer} query={searchQuery} />
                            </p>

                            {/* Verified Architectural Rule Callout Window (macOS Terminal Style) */}
                            <div className="relative mt-3.5 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-3 text-neutral-200 shadow-2xl sm:mt-5 sm:p-4.5">
                              {/* macOS Window Top Bar */}
                              <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-2 sm:pb-3">
                                <div
                                  className="flex min-w-0 items-center gap-1.5 sm:gap-2"
                                  aria-hidden="true"
                                >
                                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#ff5f56] shadow-xs sm:h-3 sm:w-3" />
                                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#ffbd2e] shadow-xs sm:h-3 sm:w-3" />
                                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#27c93f] shadow-xs sm:h-3 sm:w-3" />
                                  <span className="ml-1 truncate font-mono text-[9px] font-bold text-neutral-400 sm:ml-2 sm:text-[10px]">
                                    <span className="hidden sm:inline">
                                      RULE BLUEPRINT &bull; {faq.proofBadge}
                                    </span>
                                    <span className="sm:hidden">{faq.proofBadge}</span>
                                  </span>
                                </div>
                                <span className="flex shrink-0 items-center gap-1 font-mono text-[9.5px] font-bold text-emerald-400 sm:text-[11px]">
                                  <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                  <span className="hidden sm:inline">VERIFIED SPEC</span>
                                  <span className="sm:hidden">VERIFIED</span>
                                </span>
                              </div>

                              <div className="mt-2.5 text-[11.5px] font-bold text-white sm:mt-3.5 sm:text-xs">
                                {faq.proofTitle}
                              </div>
                              <div className="mt-1 text-[11px] leading-relaxed break-words text-neutral-400 sm:text-xs">
                                {faq.proofDetail}
                              </div>

                              {/* Code Snippet Box with Syntax Highlighting & Simulation Trigger */}
                              {faq.codeSnippet && (
                                <div className="relative mt-3 overflow-hidden rounded-xl border border-neutral-800/90 bg-neutral-900/90 p-2.5 sm:mt-3.5 sm:p-3.5">
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                                    <span className="min-w-0 truncate font-mono text-[9px] font-bold tracking-wider text-cyan-400 uppercase sm:text-[10px]">
                                      <span className="hidden min-[420px]:inline">
                                        SERVER-SIDE CONSTRAINT (TS/PRISMA):
                                      </span>
                                      <span className="min-[420px]:hidden">CONSTRAINT (TS):</span>
                                    </span>
                                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                                      {faq.simulationOutput && (
                                        <button
                                          type="button"
                                          onClick={(e) => handleRunSimulation(faq.id, e)}
                                          aria-label={
                                            isSimulating
                                              ? "Hide architecture simulation"
                                              : "Run architecture simulation"
                                          }
                                          className="flex cursor-pointer items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 font-mono text-[9.5px] font-bold text-emerald-400 transition-all hover:bg-emerald-500/20 active:scale-95 sm:gap-1.5 sm:px-2.5 sm:text-[10px]"
                                        >
                                          <Play className="h-2.5 w-2.5 fill-current sm:h-3 sm:w-3" />
                                          <span>{isSimulating ? "Hide Test" : "Run Test"}</span>
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={(e) =>
                                          handleCopyCode(faq.codeSnippet || "", faq.id, e)
                                        }
                                        className="flex cursor-pointer items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1 text-neutral-300 transition-colors hover:bg-neutral-700 hover:text-white"
                                        aria-label={
                                          copiedSnippetId === faq.id
                                            ? "Copied code snippet to clipboard"
                                            : "Copy code snippet"
                                        }
                                        title="Copy code snippet"
                                      >
                                        {copiedSnippetId === faq.id ? (
                                          <Check className="h-3 w-3 text-emerald-400 sm:h-3.5 sm:w-3.5" />
                                        ) : (
                                          <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                        )}
                                      </button>
                                    </div>
                                  </div>

                                  <div className="max-w-full overflow-x-auto pt-2 sm:pt-2.5">
                                    <SyntaxCodeBlock code={faq.codeSnippet} />
                                  </div>

                                  {/* Simulated execution output drawer */}
                                  <AnimatePresence>
                                    {isSimulating && faq.simulationOutput && (
                                      <motion.div
                                        initial={
                                          shouldReduceMotion ? false : { opacity: 0, height: 0 }
                                        }
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="mt-3 overflow-hidden rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-2.5 font-mono text-[9.5px] text-emerald-400 shadow-inner sm:p-3 sm:text-[10px]"
                                      >
                                        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5 border-b border-emerald-500/30 pb-1 text-[8.5px] font-bold tracking-wider text-emerald-300 uppercase sm:text-[9px]">
                                          <span className="truncate">KERNEL SIMULATION</span>
                                          <span className="shrink-0 rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-300">
                                            HTTP 200 OK (0.8ms)
                                          </span>
                                        </div>
                                        <pre className="max-w-full overflow-x-auto font-mono text-[9.5px] leading-relaxed break-words whitespace-pre-wrap sm:text-[10px] sm:whitespace-pre">
                                          {faq.simulationOutput}
                                        </pre>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )}

                              {/* Action Link if applicable */}
                              {faq.actionLink && (
                                <div className="mt-3.5 border-t border-neutral-800 pt-2.5 sm:mt-4 sm:pt-3">
                                  <Link
                                    href={faq.actionLink.href}
                                    className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-cyan-400 hover:text-cyan-300 hover:underline sm:text-xs"
                                  >
                                    <span>{faq.actionLink.label}</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  </Link>
                                </div>
                              )}
                            </div>

                            {/* Footer Action Bar: Helpful Counter & Feedback */}
                            <div className="mt-4 flex flex-col items-start justify-between gap-2.5 border-t border-neutral-200/80 pt-3.5 text-xs sm:mt-5 sm:flex-row sm:items-center sm:gap-3 sm:pt-4 dark:border-neutral-800">
                              <span className="text-[11.5px] font-medium text-neutral-500 sm:text-xs dark:text-neutral-400">
                                Was this engineering explanation clear?
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleVote(faq.id, e)}
                                aria-pressed={Boolean(isVoted)}
                                aria-label={
                                  isVoted
                                    ? "Marked explanation as helpful"
                                    : "Mark explanation as helpful"
                                }
                                className={cn(
                                  "flex w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all duration-150 active:scale-95 sm:w-auto sm:px-3.5",
                                  isVoted
                                    ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "border-neutral-300 bg-neutral-100/80 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-200/70 dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                )}
                              >
                                <ThumbsUp
                                  className={cn(
                                    "h-3.5 w-3.5",
                                    isVoted && "fill-current text-emerald-600 dark:text-emerald-400"
                                  )}
                                />
                                <span>{isVoted ? "Marked Helpful" : "Helpful"}</span>
                                <span className="font-mono text-[11px] opacity-75">
                                  ({currentHelpful})
                                </span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </Container>
    </section>
  );
};
