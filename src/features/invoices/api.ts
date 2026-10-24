import { apiClient } from "@/lib/api/client";
import type {
  InvoiceListItem,
  InvoiceStats,
  ListInvoicesParams,
  CreateInvoicePayload,
  UpdateInvoicePayload,
  RecordPaymentPayload,
  InvoiceStatusType,
} from "./types";

export interface ListInvoicesResponse {
  invoices: InvoiceListItem[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Fetch list of invoices with filters
 */
export async function getInvoices(
  params?: ListInvoicesParams,
  organizationId?: string
): Promise<ListInvoicesResponse> {
  const queryParams: Record<string, string | undefined> = {};
  if (params?.status) queryParams.status = params.status;
  if (params?.customerId) queryParams.customerId = params.customerId;
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.search) queryParams.search = params.search;
  if (params?.page) queryParams.page = String(params.page);
  if (params?.limit) queryParams.limit = String(params.limit);

  const response = await apiClient.get<ListInvoicesResponse>("/invoices", {
    params: queryParams,
    organizationId,
  });
  return response.data;
}

/**
 * Fetch aggregated invoice stats (Total Billed, Cash Collected, Receivables, Aging)
 */
export async function getInvoiceStats(organizationId?: string): Promise<InvoiceStats> {
  const response = await apiClient.get<InvoiceStats>("/invoices/stats", {
    organizationId,
  });
  return response.data;
}

/**
 * Fetch single invoice by ID
 */
export async function getInvoiceById(
  id: string,
  organizationId?: string
): Promise<InvoiceListItem> {
  const response = await apiClient.get<InvoiceListItem>(`/invoices/${id}`, {
    organizationId,
  });
  return response.data;
}

/**
 * Create a new invoice
 */
export async function createInvoice(
  payload: CreateInvoicePayload,
  organizationId?: string
): Promise<InvoiceListItem> {
  const response = await apiClient.post<InvoiceListItem>("/invoices", payload, {
    organizationId,
  });
  return response.data;
}

/**
 * Update an existing invoice
 */
export async function updateInvoice(
  id: string,
  payload: UpdateInvoicePayload,
  organizationId?: string
): Promise<InvoiceListItem> {
  const response = await apiClient.patch<InvoiceListItem>(`/invoices/${id}`, payload, {
    organizationId,
  });
  return response.data;
}

/**
 * Update status of an invoice
 */
export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatusType,
  organizationId?: string
): Promise<InvoiceListItem> {
  const response = await apiClient.patch<InvoiceListItem>(
    `/invoices/${id}/status`,
    { status },
    { organizationId }
  );
  return response.data;
}

/**
 * Record a payment on an invoice
 */
export async function recordPayment(
  id: string,
  payload: RecordPaymentPayload,
  organizationId?: string
): Promise<InvoiceListItem> {
  const response = await apiClient.post<InvoiceListItem>(
    `/invoices/${id}/record-payment`,
    payload,
    { organizationId }
  );
  return response.data;
}

/**
 * Delete an unpaid/cancelled invoice
 */
export async function deleteInvoice(id: string, organizationId?: string): Promise<void> {
  await apiClient.delete(`/invoices/${id}`, {
    organizationId,
  });
}
