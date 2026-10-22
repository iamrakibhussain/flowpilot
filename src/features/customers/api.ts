import { apiClient } from "@/lib/api/client";
import type {
  CustomerListResponse,
  CustomerDetailResponse,
  CustomerListItem,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  CustomersFilterParams,
  CustomerNoteEntry,
} from "./types";

/**
 * Fetch paginated customers with search & filter parameters
 */
export async function getCustomers(
  params: CustomersFilterParams = {},
  organizationId?: string
): Promise<CustomerListResponse> {
  const queryParams: Record<string, string | number | undefined> = {};
  if (params.search && params.search.trim()) queryParams.search = params.search.trim();
  if (params.status && params.status !== "ALL") queryParams.status = params.status;
  if (params.tag && params.tag.trim()) queryParams.tag = params.tag.trim();
  if (params.page) queryParams.page = params.page;
  if (params.limit) queryParams.limit = params.limit;
  if (params.sortBy) queryParams.sortBy = params.sortBy;
  if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

  const response = await apiClient.get<CustomerListResponse>("/customers", {
    params: queryParams,
    organizationId,
  });
  return response.data;
}

/**
 * Fetch 360-degree customer profile with appointment and invoice relations
 */
export async function getCustomerById(
  id: string,
  organizationId?: string
): Promise<CustomerDetailResponse> {
  const response = await apiClient.get<CustomerDetailResponse>(`/customers/${id}`, {
    organizationId,
  });
  return response.data;
}

/**
 * Create a new customer record in PostgreSQL
 */
export async function createCustomer(
  payload: CreateCustomerPayload,
  organizationId?: string
): Promise<CustomerListItem> {
  const response = await apiClient.post<CustomerListItem>("/customers", payload, {
    organizationId,
  });
  return response.data;
}

/**
 * Update an existing customer record
 */
export async function updateCustomer(
  id: string,
  payload: UpdateCustomerPayload,
  organizationId?: string
): Promise<CustomerListItem> {
  const response = await apiClient.patch<CustomerListItem>(`/customers/${id}`, payload, {
    organizationId,
  });
  return response.data;
}

/**
 * Archive a customer record
 */
export async function archiveCustomer(
  id: string,
  organizationId?: string
): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>(`/customers/${id}`, {
    organizationId,
  });
  return response.data;
}

/**
 * Reactivate an archived customer record
 */
export async function reactivateCustomer(
  id: string,
  organizationId?: string
): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    `/customers/${id}/reactivate`,
    {},
    { organizationId }
  );
  return response.data;
}

/**
 * Append an internal operational note to customer profile
 */
export async function addCustomerNote(
  id: string,
  content: string,
  organizationId?: string
): Promise<CustomerNoteEntry[]> {
  const response = await apiClient.post<{ notes: CustomerNoteEntry[] }>(
    `/customers/${id}/notes`,
    { content },
    { organizationId }
  );
  return response.data.notes;
}
