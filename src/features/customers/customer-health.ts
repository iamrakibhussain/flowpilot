import type { CustomerListItem, CustomerDetailResponse } from "./types";

export interface HealthSignal {
  label: string;
  type: "positive" | "neutral" | "warning";
}

export interface CustomerHealth {
  score: number;
  grade: "A+" | "A" | "B" | "C" | "D";
  tierLabel: string;
  velocityLabel: string;
  badgeStyle: string;
  ringColor: string;
  glowColor: string;
  signals: HealthSignal[];
}

/**
 * Computes an executive-grade Client Health & Relationship Velocity score (0 - 100)
 * grounded in real multi-tenant PostgreSQL operational metrics.
 */
export function calculateCustomerHealth(
  customer: CustomerListItem | CustomerDetailResponse
): CustomerHealth {
  const invoicedVal = Number(customer.totalInvoiced?.replace(/[^0-9.-]+/g, "")) || 0;
  const paidVal = Number(customer.totalPaid?.replace(/[^0-9.-]+/g, "")) || 0;
  const outstandingVal =
    "outstandingBalance" in customer && customer.outstandingBalance
      ? Number(customer.outstandingBalance.replace(/[^0-9.-]+/g, "")) || 0
      : Math.max(0, invoicedVal - paidVal);
  const appointmentsCount = customer.appointmentsCount ?? 0;
  const status = customer.status;
  const tags = (customer.tags ?? []).map((t) => t.toLowerCase());

  const signals: HealthSignal[] = [];

  // Handle Archived / Inactive clients
  if (status === "INACTIVE") {
    signals.push({ label: "Account Archived", type: "warning" });
    if (paidVal > 0) {
      signals.push({ label: `Historical LTV: ${customer.totalPaid}`, type: "neutral" });
    }
    return {
      score: 28,
      grade: "D",
      tierLabel: "Archived Record",
      velocityLabel: "Dormant",
      badgeStyle: "border-slate-200 bg-slate-100 text-slate-600",
      ringColor: "#94a3b8", // slate-400
      glowColor: "rgba(148, 163, 184, 0.2)",
      signals,
    };
  }

  // Handle Sales Leads / Prospects
  if (status === "LEAD") {
    let leadScore = 48;
    if (appointmentsCount > 0) {
      leadScore += 16;
      signals.push({ label: "Consultation Booked", type: "positive" });
    }
    if (customer.company) {
      leadScore += 6;
      signals.push({ label: "Corporate Account", type: "positive" });
    }
    if (tags.includes("vip") || tags.includes("enterprise")) {
      leadScore += 10;
      signals.push({ label: "High-Priority Prospect", type: "positive" });
    }

    const finalLeadScore = Math.min(78, leadScore);
    return {
      score: finalLeadScore,
      grade: finalLeadScore >= 70 ? "B" : "C",
      tierLabel: "Sales Prospect",
      velocityLabel: "Pipeline Nurturing",
      badgeStyle: "border-blue-200 bg-blue-50 text-blue-700",
      ringColor: "#3b82f6", // blue-500
      glowColor: "rgba(59, 130, 246, 0.25)",
      signals,
    };
  }

  // ACTIVE Operational Clients
  let baseScore = 65;

  // 1. Settlement & Financial Health (up to +20)
  if (invoicedVal > 0) {
    const settlementRatio = paidVal / invoicedVal;
    if (settlementRatio >= 0.95) {
      baseScore += 18;
      signals.push({ label: "100% Clean Ledger Settlement", type: "positive" });
    } else if (settlementRatio >= 0.7) {
      baseScore += 10;
      signals.push({ label: "Substantial Payment In-Flight", type: "neutral" });
    } else if (outstandingVal > 500) {
      baseScore -= 6;
      signals.push({ label: "Receivables Pending Follow-up", type: "warning" });
    }
  } else {
    signals.push({ label: "New Active Onboarding", type: "neutral" });
  }

  // 2. Engagement & Activity Frequency (up to +15)
  if (appointmentsCount >= 5) {
    baseScore += 15;
    signals.push({ label: "High Consultation Cadence (5+ Sessions)", type: "positive" });
  } else if (appointmentsCount >= 2) {
    baseScore += 8;
    signals.push({ label: "Recurring Consultations", type: "positive" });
  } else if (appointmentsCount === 1) {
    baseScore += 4;
    signals.push({ label: "Kickoff Session Completed", type: "positive" });
  }

  // 3. Strategic Tiers & LTV Impact (up to +10)
  if (paidVal >= 5000) {
    baseScore += 8;
    signals.push({ label: "Enterprise Volume ($5k+ Settled)", type: "positive" });
  } else if (paidVal >= 1000) {
    baseScore += 4;
    signals.push({ label: "Established Revenue Producer", type: "positive" });
  }

  if (tags.includes("vip") || tags.includes("enterprise") || tags.includes("retainer")) {
    baseScore += 4;
    signals.push({ label: "VIP Retainer Priority SLA", type: "positive" });
  }

  const finalScore = Math.max(50, Math.min(99, baseScore));

  let grade: "A+" | "A" | "B" | "C" = "B";
  let tierLabel = "Active Client";
  let velocityLabel = "Steady Pace";
  let badgeStyle = "border-emerald-200/90 bg-emerald-50/90 text-emerald-800";
  let ringColor = "#10b981"; // emerald-500
  let glowColor = "rgba(16, 185, 129, 0.25)";

  if (finalScore >= 92) {
    grade = "A+";
    tierLabel = "Prime Partner";
    velocityLabel = "High Velocity";
    badgeStyle = "border-purple-200/90 bg-purple-50/90 text-purple-800 shadow-purple-500/15";
    ringColor = "#8b5cf6"; // violet-500
    glowColor = "rgba(139, 92, 246, 0.3)";
  } else if (finalScore >= 82) {
    grade = "A";
    tierLabel = "Strong Engagement";
    velocityLabel = "Accelerating";
    badgeStyle = "border-emerald-200/90 bg-emerald-50/90 text-emerald-800 shadow-emerald-500/15";
    ringColor = "#10b981"; // emerald-500
    glowColor = "rgba(16, 185, 129, 0.25)";
  } else if (finalScore >= 70) {
    grade = "B";
    tierLabel = "Healthy Account";
    velocityLabel = "Consistent";
    badgeStyle = "border-blue-200/90 bg-blue-50/90 text-blue-800 shadow-blue-500/15";
    ringColor = "#3b82f6"; // blue-500
    glowColor = "rgba(59, 130, 246, 0.25)";
  }

  return {
    score: finalScore,
    grade,
    tierLabel,
    velocityLabel,
    badgeStyle,
    ringColor,
    glowColor,
    signals,
  };
}
