export type RecurringFrequency = "WEEKLY" | "BI_WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";

export type RecurringStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";

export interface RecurringItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount?: number;
}

export interface CurrentRetainerLog {
  cycleStartDate: string;
  cycleEndDate: string;
  hoursAllocated: number;
  hoursLogged: number;
  overageHours: number;
  hoursRemaining: number;
}

export interface RecurringScheduleListItem {
  id: string;
  organizationId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerCompany: string | null;
  title: string;
  frequency: RecurringFrequency;
  status: RecurringStatus;
  currency: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  items: RecurringItem[];
  isRetainer: boolean;
  retainerHours: number | null;
  overageHourlyRate: number | null;
  startDate: string;
  endDate: string | null;
  nextRunDate: string;
  lastRunDate: string | null;
  totalOccurrences: number;
  maxOccurrences: number | null;
  autoSendEmail: boolean;
  paymentDueDays: number;
  createdAt: string;
  updatedAt: string;
  invoicesCount?: number;
  currentRetainerLog?: CurrentRetainerLog | null;
}

export interface ScheduleInvoiceSummary {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  total: number;
  paidAt: string | null;
}

export interface ScheduleRetainerLogSummary {
  id: string;
  cycleStartDate: string;
  cycleEndDate: string;
  hoursAllocated: number;
  hoursLogged: number;
  overageHours: number;
  notes: string | null;
  createdAt: string;
}

export interface RecurringScheduleDetails extends RecurringScheduleListItem {
  invoices: ScheduleInvoiceSummary[];
  allRetainerLogs: ScheduleRetainerLogSummary[];
}

export interface RecurringStatsResponse {
  totalSchedules: number;
  activeSchedules: number;
  pausedSchedules: number;
  completedSchedules: number;
  activeRetainers: number;
  estimatedMRR: number;
  totalGeneratedInvoices: number;
}

export interface CreateRecurringScheduleInput {
  customerId: string;
  title: string;
  frequency: RecurringFrequency;
  currency?: string;
  taxRate?: number;
  items: RecurringItem[];
  isRetainer?: boolean;
  retainerHours?: number | null;
  overageHourlyRate?: number | null;
  startDate: string;
  endDate?: string | null;
  maxOccurrences?: number | null;
  autoSendEmail?: boolean;
  paymentDueDays?: number;
}

export interface UpdateRecurringScheduleInput {
  customerId?: string;
  title?: string;
  frequency?: RecurringFrequency;
  currency?: string;
  taxRate?: number;
  items?: RecurringItem[];
  isRetainer?: boolean;
  retainerHours?: number | null;
  overageHourlyRate?: number | null;
  startDate?: string;
  endDate?: string | null;
  maxOccurrences?: number | null;
  autoSendEmail?: boolean;
  paymentDueDays?: number;
  status?: RecurringStatus;
}

export interface LogRetainerHoursInput {
  hours: number;
  notes?: string | null;
  date?: string;
}

export interface ListRecurringSchedulesQuery {
  status?: RecurringStatus;
  customerId?: string;
  frequency?: RecurringFrequency;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListRecurringSchedulesResponse {
  data: RecurringScheduleListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
