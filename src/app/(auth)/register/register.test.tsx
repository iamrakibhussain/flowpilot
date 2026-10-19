import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RegisterPage from "./page";
import * as authApi from "@/features/auth/api";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock auth API
vi.mock("@/features/auth/api", () => ({
  registerUser: vi.fn(),
}));

describe("RegisterPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all registration inputs, headings and security badges", () => {
    render(<RegisterPage />);

    expect(
      screen.getByRole("heading", { name: /Create your business workspace/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Business Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Organization \/ Workspace Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Create Workspace & Get Started/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sign in to your account/i })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("displays validation errors when submitting an empty form", async () => {
    render(<RegisterPage />);
    const submitBtn = screen.getByRole("button", { name: /Create Workspace & Get Started/i });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Full name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Business email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Workspace name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
      expect(
        screen.getByText(/You must accept the Terms of Service and Privacy Policy/i)
      ).toBeInTheDocument();
    });
  });

  it("shows real-time slug preview as user types organization name", async () => {
    render(<RegisterPage />);

    const orgInput = screen.getByLabelText(/Organization \/ Workspace Name/i);
    fireEvent.change(orgInput, { target: { value: "Apex Global Operations" } });

    await waitFor(() => {
      expect(screen.getByText(/flowpilot\.app\/apex-global-operations/i)).toBeInTheDocument();
    });
  });

  it("shows validation error when passwords do not match", async () => {
    render(<RegisterPage />);

    const passwordInput = screen.getByLabelText(/^Password/i);
    const confirmInput = screen.getByLabelText(/^Confirm Password/i);

    fireEvent.change(passwordInput, { target: { value: "ValidPass123!" } });
    fireEvent.change(confirmInput, { target: { value: "DifferentPass999!" } });

    const submitBtn = screen.getByRole("button", { name: /Create Workspace & Get Started/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("submits valid form data and transitions to success view", async () => {
    vi.mocked(authApi.registerUser).mockResolvedValueOnce({
      user: {
        id: "usr_123",
        email: "alex@company.com",
        name: "Alex Morgan",
      },
      activeOrganizationId: "org_123",
      memberships: [
        {
          organizationId: "org_123",
          organizationName: "Apex Operations",
          role: "OWNER",
        },
      ],
    });

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: "Alex Morgan" } });
    fireEvent.change(screen.getByLabelText(/Business Email/i), {
      target: { value: "alex@company.com" },
    });
    fireEvent.change(screen.getByLabelText(/Organization \/ Workspace Name/i), {
      target: { value: "Apex Operations" },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: "SecurePass123!" },
    });
    fireEvent.change(screen.getByLabelText(/^Confirm Password/i), {
      target: { value: "SecurePass123!" },
    });
    fireEvent.click(screen.getByRole("checkbox"));

    const submitBtn = screen.getByRole("button", { name: /Create Workspace & Get Started/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authApi.registerUser).toHaveBeenCalledWith({
        name: "Alex Morgan",
        email: "alex@company.com",
        password: "SecurePass123!",
        organizationName: "Apex Operations",
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/Workspace Provisioned!/i)).toBeInTheDocument();
      expect(screen.getByText(/Apex Operations/i)).toBeInTheDocument();
    });
  });
});
