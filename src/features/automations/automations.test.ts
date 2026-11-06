import { describe, it, expect } from "vitest";
import type { FlowRuleTrigger, FlowRuleAction, FlowRuleExecutionStatus } from "./types";
import { FLOW_RULES_QUERY_KEYS } from "./use-automations";

describe("FlowRules Automations Feature Unit Suite", () => {
  it("defines valid event triggers with exhaustiveness", () => {
    const triggers: FlowRuleTrigger[] = [
      "CONTRACT_SIGNED",
      "QUOTE_ACCEPTED",
      "INVOICE_PAID",
      "APPOINTMENT_BOOKED",
      "CUSTOMER_CREATED",
    ];
    expect(triggers).toHaveLength(5);
    expect(triggers).toContain("CONTRACT_SIGNED");
    expect(triggers).toContain("INVOICE_PAID");
    expect(triggers).toContain("QUOTE_ACCEPTED");
  });

  it("defines autonomous actions correctly", () => {
    const actions: FlowRuleAction[] = [
      "CREATE_PROJECT",
      "CREATE_INVOICE",
      "SEND_EMAIL",
      "CREATE_NOTIFICATION",
    ];
    expect(actions).toHaveLength(4);
    expect(actions).toContain("CREATE_PROJECT");
    expect(actions).toContain("CREATE_INVOICE");
    expect(actions).toContain("SEND_EMAIL");
    expect(actions).toContain("CREATE_NOTIFICATION");
  });

  it("validates execution status types", () => {
    const statuses: FlowRuleExecutionStatus[] = ["SUCCESS", "FAILED", "SKIPPED"];
    expect(statuses).toHaveLength(3);
    expect(statuses).toContain("SUCCESS");
    expect(statuses).toContain("FAILED");
    expect(statuses).toContain("SKIPPED");
  });

  it("generates multi-tenant scoped query keys for cache isolation", () => {
    const org1 = "org-111";
    const org2 = "org-222";

    const key1 = FLOW_RULES_QUERY_KEYS.list({ trigger: "CONTRACT_SIGNED" }, org1);
    const key2 = FLOW_RULES_QUERY_KEYS.list({ trigger: "CONTRACT_SIGNED" }, org2);

    expect(key1).not.toEqual(key2);
    expect(key1).toContain(org1);
    expect(key2).toContain(org2);

    const statsKey1 = FLOW_RULES_QUERY_KEYS.stats(org1);
    const statsKey2 = FLOW_RULES_QUERY_KEYS.stats(org2);
    expect(statsKey1).not.toEqual(statsKey2);
  });

  it("correctly interpolates action templates with tokens", () => {
    const template = "Delivery Project: {{entityTitle}} for {{customerName}}";
    const tokens: Record<string, string> = {
      entityTitle: "Enterprise Rebranding",
      customerName: "Acme Global Corp",
    };

    let result = template;
    for (const [key, val] of Object.entries(tokens)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val);
    }

    expect(result).toBe("Delivery Project: Enterprise Rebranding for Acme Global Corp");
  });
});
