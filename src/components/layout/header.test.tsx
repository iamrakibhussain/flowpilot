import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Header } from "./header";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("Header Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the FlowPilot brand logo linking to home", () => {
    render(<Header />);
    const logoLink = screen.getByRole("link", { name: /FlowPilot Home/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute("href", "/");
  });

  it("renders desktop navigation links with correct destinations", () => {
    render(<Header />);
    const desktopNav = screen.getByRole("navigation", { name: /Primary Desktop Navigation/i });
    expect(desktopNav).toBeInTheDocument();

    const featuresLink = screen.getByRole("link", { name: /Features/i });
    expect(featuresLink).toHaveAttribute("href", "/#features");

    const architectureLink = screen.getByRole("link", { name: /Architecture/i });
    expect(architectureLink).toHaveAttribute("href", "/#architecture");

    const workspaceLink = screen.getByRole("link", { name: /Live Workspace/i });
    expect(workspaceLink).toHaveAttribute("href", "/dashboard");
  });

  it("renders authentication and CTA action buttons", () => {
    render(<Header />);
    const signInLinks = screen.getAllByRole("link", { name: /Sign In/i });
    expect(signInLinks.length).toBeGreaterThan(0);
    expect(signInLinks[0]).toHaveAttribute("href", "/login");

    const getStartedLinks = screen.getAllByRole("link", { name: /Get Started/i });
    expect(getStartedLinks.length).toBeGreaterThan(0);
    expect(getStartedLinks[0]).toHaveAttribute("href", "/login");
  });

  it("toggles the mobile menu on click and updates aria-expanded", () => {
    render(<Header />);
    const menuButton = screen.getByRole("button", { name: /Open navigation menu/i });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    act(() => {
      fireEvent.click(menuButton);
    });
    expect(screen.getByRole("button", { name: /Close navigation menu/i })).toHaveAttribute(
      "aria-expanded",
      "true"
    );

    act(() => {
      fireEvent.click(menuButton);
    });
    expect(screen.getByRole("button", { name: /Open navigation menu/i })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("closes the mobile menu when Escape key is pressed", () => {
    render(<Header />);
    const menuButton = screen.getByRole("button", { name: /Open navigation menu/i });
    act(() => {
      fireEvent.click(menuButton);
    });
    expect(menuButton).toHaveAttribute("aria-expanded", "true");

    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });
});
