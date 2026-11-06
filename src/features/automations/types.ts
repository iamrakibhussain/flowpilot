export type FlowRuleTrigger =
  "CONTRACT_SIGNED" | "QUOTE_ACCEPTED" | "INVOICE_PAID" | "APPOINTMENT_BOOKED" | "CUSTOMER_CREATED";

export type FlowRuleAction =
  "CREATE_PROJECT" | "CREATE_INVOICE" | "SEND_EMAIL" | "CREATE_NOTIFICATION";

export type FlowRuleExecutionStatus = "SUCCESS" | "FAILED" | "SKIPPED";

export interface FlowRuleConditions {
  minAmount?: number;
  maxAmount?: number;
  templateId?: string;
  serviceId?: string;
  statusEquals?: string;
  [key: string]: unknown;
}

export interface FlowRuleActionConfig {
  projectTitleTemplate?: string; // e.g. "Project: {{entityTitle}}"
  depositPercent?: number; // e.g. 50
  paymentDueDays?: number; // e.g. 14
  emailSubjectTemplate?: string;
  emailBodyTemplate?: string;
  notificationMessage?: string;
  assigneeId?: string;
  [key: string]: unknown;
}

export interface CreateFlowRuleInput {
  title: string;
  description?: string;
  trigger: FlowRuleTrigger;
  action: FlowRuleAction;
  conditions?: FlowRuleConditions;
  actionConfig?: FlowRuleActionConfig;
  isActive?: boolean;
}

export interface UpdateFlowRuleInput {
  title?: string;
  description?: string | null;
  trigger?: FlowRuleTrigger;
  action?: FlowRuleAction;
  conditions?: FlowRuleConditions;
  actionConfig?: FlowRuleActionConfig;
  isActive?: boolean;
}

export interface FlowRuleListItem {
  id: string;
  organizationId: string;
  title: string;
  description: string | null;
  trigger: FlowRuleTrigger;
  action: FlowRuleAction;
  isActive: boolean;
  conditions: FlowRuleConditions;
  actionConfig: FlowRuleActionConfig;
  lastTriggeredAt: string | null;
  executionCount: number;
  createdAt: string;
  updatedAt: string;
  latestExecution?: {
    status: FlowRuleExecutionStatus;
    executedAt: string;
    durationMs: number;
  } | null;
}

export interface FlowRuleExecutionItem {
  id: string;
  ruleId: string;
  ruleTitle?: string;
  organizationId: string;
  status: FlowRuleExecutionStatus;
  triggerEvent: string;
  entityId: string;
  executionDurationMs: number;
  errorMessage: string | null;
  logs: Record<string, unknown> | null;
  executedAt: string;
}

export interface FlowRuleStatsResponse {
  totalRules: number;
  activeRules: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
  estimatedHoursSaved: number;
}

export interface ListFlowRulesQuery {
  trigger?: FlowRuleTrigger;
  action?: FlowRuleAction;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TestFlowRuleInput {
  entityId?: string;
  customerId?: string;
  title?: string;
  amount?: number;
}

export interface TestFlowRuleResult {
  simulated: boolean;
  ruleId: string;
  matched: boolean;
  evaluationDetails: {
    ruleTitle: string;
    trigger: FlowRuleTrigger;
    action: FlowRuleAction;
    conditionsEvaluated: FlowRuleConditions;
    simulatedPayload: Record<string, unknown>;
  };
  simulatedActionLogs: Record<string, unknown>;
}
