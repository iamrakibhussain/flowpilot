import { apiClient } from "@/lib/api/client";
import type {
  PublicInvoiceStatement,
  CheckoutSessionResult,
  PaymentSettings,
  UpdatePaymentSettingsPayload,
  PaymentTransaction,
  ListTransactionsParams,
  ListTransactionsResponse,
  PaymentTokenResponse,
} from "./types";

/**
 * Fetch public invoice statement for `/pay/[token]` (zero login)
 */
export async function getPublicInvoice(token: string): Promise<PublicInvoiceStatement> {
  const response = await apiClient.get<PublicInvoiceStatement>(`/payments/public/invoice/${token}`);
  return response.data;
}

/**
 * Initiate checkout session (Stripe redirect or Sandbox)
 */
export async function createCheckoutSession(
  token: string,
  payload?: Record<string, unknown>
): Promise<CheckoutSessionResult> {
  const response = await apiClient.post<CheckoutSessionResult>(
    `/payments/public/checkout/${token}`,
    payload || {}
  );
  return response.data;
}

/**
 * Verify and reconcile a Stripe checkout session upon redirect
 */
export async function verifyCheckoutSession(
  token: string,
  sessionId?: string
): Promise<{ success: boolean; alreadyPaid?: boolean; reconciled?: boolean; message?: string }> {
  const response = await apiClient.post<{
    success: boolean;
    alreadyPaid?: boolean;
    reconciled?: boolean;
    message?: string;
  }>(`/payments/public/verify-session/${token}`, { sessionId });
  return response.data;
}

/**
 * Instant sandbox payment simulation for testing with zero credentials
 */
export async function settleSandboxPayment(
  token: string,
  paymentMethod: string = "card_visa"
): Promise<{ success: boolean; invoiceNumber: string; transactionId: string }> {
  const response = await apiClient.post<{
    success: boolean;
    invoiceNumber: string;
    transactionId: string;
  }>(`/payments/public/sandbox-pay/${token}`, { paymentMethod });
  return response.data;
}

/**
 * Generate or get existing high-entropy payment link token for an invoice (Tenant protected)
 */
export async function generatePaymentToken(
  invoiceId: string,
  organizationId?: string
): Promise<PaymentTokenResponse> {
  const response = await apiClient.post<PaymentTokenResponse>(
    `/payments/invoices/${invoiceId}/token`,
    {},
    { organizationId }
  );
  return response.data;
}

/**
 * Get organization payment settings (Tenant protected)
 */
export async function getPaymentSettings(organizationId?: string): Promise<PaymentSettings> {
  const response = await apiClient.get<PaymentSettings>("/payments/settings", {
    organizationId,
  });
  return response.data;
}

/**
 * Update organization payment settings (Tenant protected)
 */
export async function updatePaymentSettings(
  payload: UpdatePaymentSettingsPayload,
  organizationId?: string
): Promise<PaymentSettings> {
  const response = await apiClient.patch<PaymentSettings>("/payments/settings", payload, {
    organizationId,
  });
  return response.data;
}

/**
 * List payment transaction ledger (Tenant protected)
 */
export async function getPaymentTransactions(
  params?: ListTransactionsParams,
  organizationId?: string
): Promise<ListTransactionsResponse> {
  const queryParams: Record<string, string | undefined> = {};
  if (params?.status) queryParams.status = params.status;
  if (params?.invoiceId) queryParams.invoiceId = params.invoiceId;
  if (params?.customerId) queryParams.customerId = params.customerId;
  if (params?.page) queryParams.page = String(params.page);
  if (params?.limit) queryParams.limit = String(params.limit);

  const response = await apiClient.get<PaymentTransaction[]>("/payments/transactions", {
    params: queryParams,
    organizationId,
  });

  return {
    transactions: response.data,
    total: response.meta?.totalCount ?? response.data.length,
    page: response.meta?.page || 1,
    limit: response.meta?.limit || 20,
  };
}
