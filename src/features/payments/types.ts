export type TransactionStatusType = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export interface PublicInvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface PublicInvoiceStatement {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: "PAID" | "PENDING" | "OVERDUE" | "CANCELLED";
  subtotal: number;
  tax: number;
  total: number;
  paidAt: string | null;
  notes: string | null;
  items: PublicInvoiceItem[];
  customer: {
    name: string;
    email: string;
    company: string | null;
  };
  organization: {
    id: string;
    name: string;
    currency: string;
  };
  paymentSettings: {
    isStripeConnected: boolean;
    publishableKey?: string;
    isTestMode: boolean;
    defaultCurrency: string;
    acceptedMethods: string[];
  };
}

export interface CheckoutSessionResult {
  sessionId: string;
  checkoutUrl?: string;
  mode: "STRIPE" | "MOCK";
  amount: number;
  currency: string;
  invoiceNumber: string;
}

export interface PaymentSettings {
  id: string;
  organizationId: string;
  stripeAccountId?: string | null;
  stripeConnected: boolean;
  stripeChargesEnabled: boolean;
  stripePublishableKey: string;
  hasSecretKey: boolean;
  hasWebhookSecret: boolean;
  isTestMode: boolean;
  defaultCurrency: string;
  allowPartialPayments: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdatePaymentSettingsPayload {
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  isTestMode?: boolean;
  defaultCurrency?: string;
  allowPartialPayments?: boolean;
}

export interface PaymentTransaction {
  id: string;
  organizationId: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  status: TransactionStatusType;
  provider: string;
  gatewayReference?: string | null;
  paymentMethod?: string | null;
  failureReason?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

export interface ListTransactionsParams {
  status?: TransactionStatusType;
  invoiceId?: string;
  customerId?: string;
  page?: number;
  limit?: number;
}

export interface ListTransactionsResponse {
  transactions: PaymentTransaction[];
  total: number;
  page: number;
  limit: number;
}

export interface PaymentTokenResponse {
  token: string;
  paymentUrl: string;
}
