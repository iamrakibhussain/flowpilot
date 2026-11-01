export type QuoteStatusType = "DRAFT" | "SENT" | "VIEWED" | "ACCEPTED" | "DECLINED" | "EXPIRED";

export interface QuoteItem {
  id: string;
  serviceId: string | null;
  serviceName?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  sortOrder: number;
}

export interface QuoteListItem {
  id: string;
  organizationId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerCompany: string | null;
  customerPhone: string | null;
  quoteNumber: string;
  title: string;
  status: QuoteStatusType;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountType: "FIXED" | "PERCENT" | string;
  discountAmount: number;
  totalAmount: number;
  issuedAt: string;
  expiresAt: string | null;
  viewedAt: string | null;
  acceptedAt: string | null;
  declinedAt: string | null;
  signerName: string | null;
  signerEmail: string | null;
  convertedInvoiceId: string | null;
  convertedInvoiceNumber?: string | null;
  itemsCount: number;
  items: QuoteItem[];
  publicToken?: string | null;
  isExpired: boolean;
}

export interface QuoteDetailResponse extends QuoteListItem {
  introduction: string | null;
  terms: string | null;
  notes: string | null;
  signatureData: string | null;
  clientNotes: string | null;
  signerIp: string | null;
  organization: {
    id: string;
    name: string;
    slug: string;
    brandColor: string | null;
    logoUrl?: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    address: string | null;
    currency: string;
  };
}

export interface QuoteStats {
  totalEstimatedValue: number;
  acceptedValue: number;
  pendingReviewValue: number;
  acceptanceRate: number;
  counts: {
    total: number;
    draft: number;
    sent: number;
    viewed: number;
    accepted: number;
    declined: number;
    expired: number;
  };
}

export interface ListQuotesParams {
  status?: QuoteStatusType;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface QuoteItemPayload {
  serviceId?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  sortOrder?: number;
}

export interface CreateQuotePayload {
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerCompany?: string;
  title?: string;
  introduction?: string | null;
  items: QuoteItemPayload[];
  taxRate?: number;
  discountType?: "FIXED" | "PERCENT";
  discountAmount?: number;
  expiresAt?: string | null;
  terms?: string | null;
  notes?: string | null;
  status?: QuoteStatusType;
}

export interface UpdateQuotePayload {
  customerId?: string;
  title?: string;
  introduction?: string | null;
  items?: QuoteItemPayload[];
  taxRate?: number;
  discountType?: "FIXED" | "PERCENT";
  discountAmount?: number;
  expiresAt?: string | null;
  terms?: string | null;
  notes?: string | null;
  status?: QuoteStatusType;
}

export interface AcceptQuotePayload {
  signerName: string;
  signerEmail?: string | null;
  signatureData: string;
  clientNotes?: string | null;
}

export interface DeclineQuotePayload {
  reason?: string | null;
}
