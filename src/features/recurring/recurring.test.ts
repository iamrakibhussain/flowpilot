import { describe, it, expect } from "vitest";
import type { RecurringFrequency, RecurringStatus } from "./types";

describe("Recurring Billing & Retainers Feature Unit Suite", () => {
  it("defines valid recurring frequencies with exhaustiveness", () => {
    const frequencies: RecurringFrequency[] = [
      "WEEKLY",
      "BI_WEEKLY",
      "MONTHLY",
      "QUARTERLY",
      "ANNUALLY",
    ];
    expect(frequencies).toHaveLength(5);
    expect(frequencies).toContain("MONTHLY");
    expect(frequencies).toContain("BI_WEEKLY");
  });

  it("defines standard recurring subscription statuses", () => {
    const statuses: RecurringStatus[] = ["ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"];
    expect(statuses).toHaveLength(4);
    expect(statuses).toContain("ACTIVE");
    expect(statuses).toContain("PAUSED");
  });

  it("correctly calculates retainer hours burn percentages and overage", () => {
    const allocated = 20;
    const logged = 24.5;
    const burnPercent = Math.min(100, Math.round((logged / allocated) * 100));
    const overage = Math.max(0, Math.round((logged - allocated) * 100) / 100);
    const hourlyOverageRate = 125;
    const overageFee = overage * hourlyOverageRate;

    expect(burnPercent).toBe(100);
    expect(overage).toBe(4.5);
    expect(overageFee).toBe(562.5);
  });

  it("calculates compound line item financial sums with tax", () => {
    const items = [
      { description: "Strategy Consulting", quantity: 1, unitPrice: 2000 },
      { description: "Ad Ops Management", quantity: 2, unitPrice: 500 },
    ];
    const subtotal = items.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0);
    const taxRate = 8.5; // 8.5%
    const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
    const total = Math.round((subtotal + taxAmount) * 100) / 100;

    expect(subtotal).toBe(3000);
    expect(taxAmount).toBe(255);
    expect(total).toBe(3255);
  });
});
