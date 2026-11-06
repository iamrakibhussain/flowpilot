export interface PortalOrganization {
  id: string;
  name: string;
  slug: string;
  brandColor: string | null;
  logoUrl: string | null;
  tagline: string | null;
  customDomain: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  currency: string;
  timezone: string;
  minNoticeHours: number;
  cancellationHours: number;
  bookingEnabled: boolean;
}

export interface PortalCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  createdAt: string;
}

export interface PortalAppointment {
  id: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  status: "CONFIRMED" | "COMPLETED" | "CANCELLED" | "PENDING";
  type: "VIDEO" | "IN_PERSON" | "PHONE";
  location: string | null;
  notes: string | null;
  depositPaid: boolean;
  depositAmount: string | null;
  service: {
    id: string;
    name: string;
    price: string | number;
    durationMinutes: number;
  } | null;
  staffMember: {
    id: string;
    name: string;
    roleTitle: string;
    initials: string;
    avatarBg: string;
  } | null;
}

export interface PortalInvoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: "PAID" | "PENDING" | "OVERDUE" | "CANCELLED";
  subtotal: string | number;
  tax: string | number;
  total: string | number;
  paidAt: string | null;
  notes: string | null;
  paymentToken: string | null;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: string | number;
    amount: string | number;
  }>;
  transactions: Array<{
    id: string;
    amount: string | number;
    status: string;
    paidAt: string | null;
    provider: string;
  }>;
}

export interface PortalQuoteSummary {
  id: string;
  quoteNumber: string;
  title: string;
  status: "DRAFT" | "SENT" | "VIEWED" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  issuedAt: string;
  expiresAt: string | null;
  acceptedAt: string | null;
  declinedAt: string | null;
  notes: string | null;
  itemsCount: number;
}

export interface PortalProjectSummary {
  id: string;
  name: string;
  description: string | null;
  status: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  color: string;
  startDate: string | null;
  targetDate: string | null;
  completedAt: string | null;
  budget: number | null;
  currency: string;
  tasksCount: number;
  completedTasksCount: number;
  progressPercentage: number;
}

export interface PortalContract {
  id: string;
  contractNumber: string;
  title: string;
  content: string;
  status: "DRAFT" | "PENDING_SIGNATURE" | "VIEWED" | "SIGNED" | "COUNTERSIGNED" | "DECLINED" | "VOIDED";
  issuedAt: string;
  expiresAt: string | null;
  viewedAt: string | null;
  signedAt: string | null;
  signerName: string | null;
  signerEmail: string | null;
  signatureData: string | null;
  signatureType: "CANVAS" | "TYPED" | null;
  contentChecksum: string | null;
  countersignedAt: string | null;
  countersignerName: string | null;
  quoteId: string | null;
  projectId: string | null;
}

export interface PortalNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface PortalTimeSlot {
  startTime: string;
  endTime: string;
  staffMemberId?: string;
  staffName?: string;
}

export interface SignPortalContractInput {
  signerName: string;
  signerEmail: string;
  signatureData: string;
  signatureType: "CANVAS" | "TYPED";
  clientNotes?: string | null;
}

export interface AcceptPortalQuoteInput {
  signerName: string;
  signerEmail?: string;
  signatureData?: string | null;
  clientNotes?: string | null;
}

export interface PortalDashboardData {
  organization: PortalOrganization;
  customer: PortalCustomer;
  appointments: {
    upcoming: PortalAppointment[];
    past: PortalAppointment[];
    total: number;
  };
  invoices: {
    list: PortalInvoice[];
    metrics: {
      totalBilled: string;
      totalPaid: string;
      totalOutstanding: string;
      count: number;
    };
  };
  quotes?: {
    list: PortalQuoteSummary[];
    metrics: {
      totalProposals: number;
      pendingCount: number;
      acceptedCount: number;
      totalValue: string;
    };
  };
  projects?: {
    list: PortalProjectSummary[];
    metrics: {
      totalProjects: number;
      activeCount: number;
      completedCount: number;
    };
  };
  contracts?: {
    list: PortalContract[];
    metrics: {
      totalContracts: number;
      pendingCount: number;
      signedCount: number;
    };
  };
}

export interface RequestPortalLinkInput {
  email: string;
  organizationSlug: string;
}

export interface VerifyPortalTokenInput {
  organizationSlug: string;
  token?: string;
  code?: string;
}

export interface RescheduleAppointmentInput {
  newScheduledAt: string;
}

export interface CancelAppointmentInput {
  reason: string;
}

export interface UpdatePortalProfileInput {
  name?: string;
  phone?: string | null;
  company?: string | null;
}
