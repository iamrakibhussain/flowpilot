import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button component", () => {
  it("renders with default label and variant", () => {
    render(<Button>Submit Request</Button>);
    const button = screen.getByRole("button", { name: /submit request/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-primary");
  });

  it("handles disabled state appropriately", () => {
    render(<Button disabled>Disabled Action</Button>);
    const button = screen.getByRole("button", { name: /disabled action/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:opacity-50");
  });

  it("indicates busy loading state with spinner and accessible attributes", () => {
    render(<Button isLoading>Processing</Button>);
    const button = screen.getByRole("button", { name: /processing/i });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
