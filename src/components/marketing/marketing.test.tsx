import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeroSection } from "./hero-section";
import { CoreCapabilitiesSection } from "./core-capabilities-section";
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
    expect(getStartedLink).toHaveAttribute("href", "/login");

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

  it("renders ArchitectureTrustSection with true architectural facts", () => {
    render(<ArchitectureTrustSection />);
    expect(
      screen.getByRole("heading", { name: /Built with Engineering Discipline from Day One/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/Strict Multi-Tenant Isolation/i)).toBeInTheDocument();
    expect(screen.getByText(/Role-Based Access Control \(RBAC\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Decoupled API Boundary & Type Safety/i)).toBeInTheDocument();
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

  it("renders FinalCTASection with conversion actions", () => {
    render(<FinalCTASection />);
    expect(
      screen.getByRole("heading", { name: /Ready to Bring Operational Calm to Your Business\?/i })
    ).toBeInTheDocument();

    const getStartedLink = screen.getByRole("link", { name: /Get Started Free/i });
    expect(getStartedLink).toHaveAttribute("href", "/login");
  });

  it("renders Footer with navigation landmarks and verified architecture badge", () => {
    render(<Footer />);
    expect(screen.getByText(/Core Capabilities/i)).toBeInTheDocument();
    expect(screen.getByText(/Multi-Tenant Isolation/i)).toBeInTheDocument();
    expect(screen.getByText(/Verified Architecture/i)).toBeInTheDocument();
  });
});
