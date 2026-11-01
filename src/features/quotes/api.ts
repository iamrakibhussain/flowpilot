import { apiClient } from "@/lib/api/client";
import type {
  QuoteListItem,
  QuoteDetailResponse,
  QuoteStats,
  ListQuotesParams,
  CreateQuotePayload,
  UpdateQuotePayload,
  AcceptQuotePayload,
  DeclineQuotePayload,
} from "./types";

export interface ListQuotesResponse {
  quotes: QuoteListItem[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Fetch list of quotes with filters
 */
export async function getQuotes(
  params?: ListQuotesParams,
  organizationId?: string
): Promise<ListQuotesResponse> {
  const queryParams: Record<string, string | undefined> = {};
  if (params?.status) queryParams.status = params.status;
  if (params?.customerId) queryParams.customerId = params.customerId;
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.search) queryParams.search = params.search;
  if (params?.page) queryParams.page = String(params.page);
  if (params?.limit) queryParams.limit = String(params.limit);

  const response = await apiClient.get<ListQuotesResponse>("/quotes", {
    params: queryParams,
    organizationId,
  });
  return response.data;
}

/**
 * Fetch aggregated quote stats
 */
export async function getQuoteStats(organizationId?: string): Promise<QuoteStats> {
  const response = await apiClient.get<QuoteStats>("/quotes/stats", {
    organizationId,
  });
  return response.data;
}

/**
 * Fetch single quote by ID
 */
export async function getQuoteById(
  id: string,
  organizationId?: string
): Promise<QuoteDetailResponse> {
  const response = await apiClient.get<QuoteDetailResponse>(`/quotes/${id}`, {
    organizationId,
  });
  return response.data;
}

/**
 * Create a new proposal / estimate
 */
export async function createQuote(
  payload: CreateQuotePayload,
  organizationId?: string
): Promise<QuoteDetailResponse> {
  const response = await apiClient.post<QuoteDetailResponse>("/quotes", payload, {
    organizationId,
  });
  return response.data;
}

/**
 * Update an existing proposal
 */
export async function updateQuote(
  id: string,
  payload: UpdateQuotePayload,
  organizationId?: string
): Promise<QuoteDetailResponse> {
  const response = await apiClient.patch<QuoteDetailResponse>(`/quotes/${id}`, payload, {
    organizationId,
  });
  return response.data;
}

/**
 * Delete a proposal
 */
export async function deleteQuote(id: string, organizationId?: string): Promise<void> {
  await apiClient.delete(`/quotes/${id}`, {
    organizationId,
  });
}

/**
 * Send proposal by email & generate public link
 */
export async function sendQuote(
  id: string,
  organizationId?: string
): Promise<{ success: boolean; publicUrl: string; deliveredTo: string }> {
  const response = await apiClient.post<{
    success: boolean;
    publicUrl: string;
    deliveredTo: string;
  }>(`/quotes/${id}/send`, {}, { organizationId });
  return response.data;
}

/**
 * 1-Click Convert accepted proposal to Invoice
 */
export async function convertQuoteToInvoice(
  id: string,
  organizationId?: string
): Promise<{ invoiceId: string; invoiceNumber: string }> {
  const response = await apiClient.post<{ invoiceId: string; invoiceNumber: string }>(
    `/quotes/${id}/convert-invoice`,
    {},
    { organizationId }
  );
  return response.data;
}

/**
 * PUBLIC: Fetch proposal by token
 */
export async function getPublicQuote(token: string): Promise<QuoteDetailResponse> {
  const response = await apiClient.get<QuoteDetailResponse>(`/public/quotes/${token}`);
  return response.data;
}

/**
 * PUBLIC: Accept proposal with digital signature
 */
export async function acceptPublicQuote(
  token: string,
  payload: AcceptQuotePayload
): Promise<{ success: boolean; quoteNumber: string; acceptedAt: string; autoInvoiceId?: string }> {
  const response = await apiClient.post<{
    success: boolean;
    quoteNumber: string;
    acceptedAt: string;
    autoInvoiceId?: string;
  }>(`/public/quotes/${token}/accept`, payload);
  return response.data;
}

/**
 * PUBLIC: Decline proposal
 */
export async function declinePublicQuote(
  token: string,
  payload: DeclineQuotePayload
): Promise<{ success: boolean; quoteNumber: string }> {
  const response = await apiClient.post<{ success: boolean; quoteNumber: string }>(
    `/public/quotes/${token}/decline`,
    payload
  );
  return response.data;
}
