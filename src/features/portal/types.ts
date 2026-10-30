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

