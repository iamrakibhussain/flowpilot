import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./empty-state";
import { Button } from "@/components/ui/button";

describe("EmptyState feedback component", () => {
  it("renders title and description properly", () => {
    render(
      <EmptyState
        title="No Appointments Found"
        description="There are currently no scheduled appointments for this period."
      />
    );
    expect(screen.getByRole("heading", { name: /no appointments found/i })).toBeInTheDocument();
    expect(screen.getByText(/no scheduled appointments for this period/i)).toBeInTheDocument();
  });

  it("renders custom action when supplied", () => {
    render(<EmptyState title="No Invoices" action={<Button>Create First Invoice</Button>} />);
    expect(screen.getByRole("button", { name: /create first invoice/i })).toBeInTheDocument();
  });
});
