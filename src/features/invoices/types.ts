export type InvoiceStatusType = "PAID" | "PENDING" | "OVERDUE" | "CANCELLED";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceListItem {
  id: string;
  organizationId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerCompany: string | null;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatusType;
  subtotal: number;
  tax: number;
  total: number;
  paidAt: string | null;
  notes: string | null;
  itemsCount: number;
  items: InvoiceItem[];
  isOverdue: boolean;
  daysOverdue: number;
}

export interface InvoiceStats {
  totalBilled: number;
  cashCollected: number;
  pendingReceivables: number;
  overdueAmount: number;
  counts: {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
    cancelled: number;
  };
  aging: {
    current: number;
    days30: number;
    days60: number;
    days90Plus: number;
  };
}

export interface ListInvoicesParams {
  status?: InvoiceStatusType;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateInvoicePayload {
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  issueDate?: string;
  dueDate: string;
  status?: InvoiceStatusType;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  tax?: number;
  notes?: string;
}

export interface UpdateInvoicePayload {
  dueDate?: string;
  notes?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  tax?: number;
  status?: InvoiceStatusType;
}

export interface RecordPaymentPayload {
  paidAt?: string;
  paymentMethod?: string;
  referenceNotes?: string;
}
