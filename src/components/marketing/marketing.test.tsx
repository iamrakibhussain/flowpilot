import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeroSection } from "./hero-section";
import { CoreCapabilitiesSection } from "./core-capabilities-section";
import { ProductPreviewSection } from "./product-preview-section";
import { WorkflowSection } from "./workflow-section";
import { BusinessBenefitsSection } from "./business-benefits-section";
import { ArchitectureTrustSection } from "./architecture-trust-section";
import { FAQSection } from "./faq-section";
import { FinalCTASection } from "./final-cta-section";
import { Footer } from "@/components/layout/footer";

// Mock next/image to render accessible element in unit tests
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { alt = "", src = "" } = props;
    return <span role="img" aria-label={String(alt)} data-src={String(src)} />;
  },
}));

describe("Marketing Components Suite", () => {
  it("renders HeroSection with headline and functional dual CTAs", () => {
    render(<HeroSection />);
    expect(
      screen.getByRole("heading", { name: /Run Your Client Operations/i })
    ).toBeInTheDocument();

    const getStartedLink = screen.getByRole("link", { name: /Get Started Free/i });
    expect(getStartedLink).toHaveAttribute("href", "/register");

    const liveWorkspaceLink = screen.getByRole("link", { name: /Explore Live Workspace/i });
    expect(liveWorkspaceLink).toHaveAttribute("href", "/dashboard");
  });

  it("renders CoreCapabilitiesSection with 4 operational pillars", () => {
    render(<CoreCapabilitiesSection />);
    expect(
      screen.getByRole("heading", { name: /Engineered for Every Stage of Service Delivery/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/Client Relationship Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Appointment Scheduling/i)).toBeInTheDocument();
    expect(screen.getByText(/Workspace & Team Governance/i)).toBeInTheDocument();
    expect(screen.getByText(/Invoicing & Billing/i)).toBeInTheDocument();
  });

  it("renders ProductPreviewSection with headline and interactive sandbox controls", () => {
    render(<ProductPreviewSection />);
    expect(
      screen.getByRole("heading", { name: /Experience the Calm Operational Shift/i })
    ).toBeInTheDocument();

    const schedulingTab = screen.getByRole("tab", { name: /Schedule & Buffers/i });
    const crmTab = screen.getByRole("tab", { name: /Client 360° Dossier/i });
    const invoicingTab = screen.getByRole("tab", { name: /Treasury & Invoices/i });
    const securityTab = screen.getByRole("tab", { name: /Tenant Boundary/i });

    expect(schedulingTab).toHaveAttribute("aria-selected", "true");
    expect(crmTab).toHaveAttribute("aria-selected", "false");
    expect(invoicingTab).toHaveAttribute("aria-selected", "false");
    expect(securityTab).toHaveAttribute("aria-selected", "false");

    // Switch tab
    fireEvent.click(crmTab);
    expect(crmTab).toHaveAttribute("aria-selected", "true");
    expect(schedulingTab).toHaveAttribute("aria-selected", "false");

    // Toggle reality mode to Chaos
    const chaosBtn = screen.getByRole("button", { name: /Fragmented Chaos/i });
    fireEvent.click(chaosBtn);
    expect(chaosBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("renders WorkflowSection with 4 progressive operational stages", () => {
    render(<WorkflowSection />);
    expect(
      screen.getByRole("heading", { name: /A Straightforward Workflow from Setup to Scale/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/Establish Your Business Workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/Configure Services & Staff Availability/i)).toBeInTheDocument();
    expect(screen.getByText(/Coordinate Appointments & Client Delivery/i)).toBeInTheDocument();
    expect(screen.getByText(/Issue Invoices & Reconcile Cash Flow/i)).toBeInTheDocument();
  });

  it("renders BusinessBenefitsSection with 4 measurable operational benefits", () => {
    render(<BusinessBenefitsSection />);
    expect(
      screen.getByRole("heading", { name: /Measurable Clarity for Owners and Operations Leads/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/Single Operational Source of Truth/i)).toBeInTheDocument();
    expect(screen.getByText(/Synchronized Team Capacity/i)).toBeInTheDocument();
    expect(screen.getByText(/Accelerated Cash Flow Cycle/i)).toBeInTheDocument();
    expect(screen.getByText(/Granular Operational Governance/i)).toBeInTheDocument();
  });

  it("renders ArchitectureTrustSection with true architectural facts and interactive pillars", () => {
    render(<ArchitectureTrustSection />);
    expect(
      screen.getByRole("heading", { name: /Built with Engineering Discipline from Day One/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/Strict Multi-Tenant Isolation/i)).toBeInTheDocument();
    expect(screen.getByText(/Role-Based Access Control \(RBAC\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Decoupled API Boundary & Type Safety/i)).toBeInTheDocument();
    expect(screen.getByText(/Data Sovereignty & Privacy Standards/i)).toBeInTheDocument();

    // Verify verified status strip (no fake RLS)
    expect(screen.getByText("Organization-Scoped Queries")).toBeInTheDocument();
    expect(screen.getByText("Server-Side Membership Checks")).toBeInTheDocument();

    // Test tenant switcher
    const meridianTenantBtn = screen.getByRole("button", { name: /Meridian Corp/i });
    fireEvent.click(meridianTenantBtn);
    expect(meridianTenantBtn).toHaveAttribute("aria-pressed", "true");

    // Test RBAC role switcher
    const memberRoleBtn = screen.getByRole("button", { name: /^member$/i });
    fireEvent.click(memberRoleBtn);
    expect(memberRoleBtn).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/RESTRICTED: Admin & Owner Only/i)).toBeInTheDocument();

    // Test API contract mode switcher
    const malformedPayloadBtn = screen.getByRole("button", { name: /Malformed Payload/i });
    fireEvent.click(malformedPayloadBtn);
    expect(malformedPayloadBtn).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/422 Unprocessable Entity/i)).toBeInTheDocument();
  });

  it("renders FAQSection and toggles accordion items on click", () => {
    render(<FAQSection />);
    const questionButton = screen.getByRole("button", {
      name: /How does multi-tenant workspace isolation protect our business data\?/i,
    });
    expect(questionButton).toBeInTheDocument();
    expect(questionButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(questionButton);
    expect(questionButton).toHaveAttribute("aria-expanded", "true");
  });

  it("renders FinalCTASection with conversion actions and workspace provisioning", () => {
    render(<FinalCTASection />);
    expect(
      screen.getByRole("heading", { name: /Ready to Bring Operational Calm to Your Business\?/i })
    ).toBeInTheDocument();

    const claimLink = screen.getByRole("link", { name: /Claim Your Workspace/i });
    expect(claimLink).toHaveAttribute("href", "/register?workspace=meridianagency");

    // Test preset chip selection
    const apexChip = screen.getByRole("button", { name: /Apex Studio/i });
    fireEvent.click(apexChip);
    expect(claimLink).toHaveAttribute("href", "/register?workspace=apexstudio");

    // Test secondary action
    const exploreDemoLink = screen.getByRole("link", { name: /Explore Live Workspace Demo/i });
    expect(exploreDemoLink).toHaveAttribute("href", "/dashboard");
  });

  it("renders Footer with navigation landmarks and verified architecture badge", () => {
    render(<Footer />);
    expect(screen.getByText(/Core Capabilities/i)).toBeInTheDocument();
    expect(screen.getByText(/Multi-Tenant Isolation/i)).toBeInTheDocument();
    expect(screen.getByText(/Verified Architecture/i)).toBeInTheDocument();
  });
});
