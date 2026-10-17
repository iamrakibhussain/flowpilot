import * as React from "react";
import { HeroSection } from "@/components/marketing/hero-section";
import { ProductPreviewSection } from "@/components/marketing/product-preview-section";
import { CoreCapabilitiesSection } from "@/components/marketing/core-capabilities-section";
import { WorkflowSection } from "@/components/marketing/workflow-section";
import { BusinessBenefitsSection } from "@/components/marketing/business-benefits-section";
import { ArchitectureTrustSection } from "@/components/marketing/architecture-trust-section";
import { FAQSection } from "@/components/marketing/faq-section";
import { FinalCTASection } from "@/components/marketing/final-cta-section";
import { AuroraBackground } from "@/components/ui/aurora-background";

export const metadata = {
  title: "FlowPilot — The Calm Business Operations Platform",
  description:
    "Unify client CRM, appointment scheduling, team capacity, and business invoicing into one structured platform for agencies, consultancies, and service teams.",
};

export default function HomePage() {
  return (
    <div className="relative flex flex-col">
      {/* Subtle React Bits Light Aurora Background across the entire homepage */}
      <AuroraBackground />

      {/* 1. Hero: Clear Value Proposition & Dual CTAs (Sole Primary Cockpit Visual) */}
      <HeroSection />

      {/* 2. Core Capabilities: CRM, Scheduling, Workspaces, and Invoicing (Bento Grid) */}
      <CoreCapabilitiesSection />

      {/* 3. How FlowPilot Works: 4-Step Progressive Timeline */}
      <WorkflowSection />

      {/* 4. Product Experience Preview: Deep Interactive Sandbox */}
      <ProductPreviewSection />

      {/* 5. Business Benefits: Measurable Operational Clarity in an Impact Grid */}
      <BusinessBenefitsSection />

      {/* 6. Architecture & Trust: Multi-Tenant Isolation, RBAC, and Type Safety */}
      <ArchitectureTrustSection />

      {/* 7. FAQ: Transparent Product & Architecture Answers */}
      <FAQSection />

      {/* 8. Final Call to Action Banner */}
      <FinalCTASection />
    </div>
  );
}
