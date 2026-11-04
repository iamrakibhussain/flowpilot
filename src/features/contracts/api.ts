import { apiClient } from "@/lib/api/client";
import type {
  ContractItem,
  ListContractsQuery,
  ListContractsResponse,
  CreateContractInput,
  UpdateContractInput,
  CountersignContractInput,
  PublicContractStatement,
  SignContractPublicInput,
} from "./types";

/**
 * Fetch paginated contracts
 */
export async function getContracts(
  params?: ListContractsQuery,
  organizationId?: string
): Promise<ListContractsResponse> {
  const queryParams: Record<string, string | undefined> = {};
  if (params?.status) queryParams.status = params.status;
  if (params?.customerId) queryParams.customerId = params.customerId;
  if (params?.quoteId) queryParams.quoteId = params.quoteId;
  if (params?.projectId) queryParams.projectId = params.projectId;
  if (params?.search) queryParams.search = params.search;
  if (params?.page) queryParams.page = String(params.page);
  if (params?.limit) queryParams.limit = String(params.limit);

  const response = await apiClient.get<ListContractsResponse>("/contracts", {
    params: queryParams,
    organizationId,
  });
  return response.data;
}

/**
 * Fetch single contract by ID
 */
export async function getContractById(id: string, organizationId?: string): Promise<ContractItem> {
  const response = await apiClient.get<ContractItem>(`/contracts/${id}`, {
    organizationId,
  });
  return response.data;
}

/**
 * Create a new draft contract
 */
export async function createContract(
  payload: CreateContractInput,
  organizationId?: string
): Promise<ContractItem> {
  const response = await apiClient.post<ContractItem>("/contracts", payload, {
    organizationId,
  });
  return response.data;
}

/**
 * Update an existing draft contract
 */
export async function updateContract(
  id: string,
  payload: UpdateContractInput,
  organizationId?: string
): Promise<ContractItem> {
  const response = await apiClient.patch<ContractItem>(`/contracts/${id}`, payload, {
    organizationId,
  });
  return response.data;
}

/**
 * Dispatch contract for signature
 */
export async function sendContract(
  id: string,
  organizationId?: string
): Promise<{ contract: ContractItem; signingUrl: string }> {
  const response = await apiClient.post<{ contract: ContractItem; signingUrl: string }>(
    `/contracts/${id}/send`,
    {},
    { organizationId }
  );
  return response.data;
}

/**
 * Countersign contract
 */
export async function countersignContract(
  id: string,
  payload: CountersignContractInput,
  organizationId?: string
): Promise<ContractItem> {
  const response = await apiClient.post<ContractItem>(`/contracts/${id}/countersign`, payload, {
    organizationId,
  });
  return response.data;
}

/**
 * Delete a draft contract
 */
export async function deleteContract(
  id: string,
  organizationId?: string
): Promise<{ success: boolean }> {
  const response = await apiClient.delete<{ success: boolean }>(`/contracts/${id}`, {
    organizationId,
  });
  return response.data;
}

// --- Public Unauthenticated API Client calls ---

/**
 * Get public contract statement by token
 */
export async function getPublicContract(token: string): Promise<PublicContractStatement> {
  const response = await apiClient.get<PublicContractStatement>(`/public/contracts/${token}`);
  return response.data;
}

/**
 * Sign contract publicly
 */
export async function signPublicContract(
  token: string,
  payload: SignContractPublicInput
): Promise<{ success: boolean; contractId: string; status: string; contentChecksum: string }> {
  const response = await apiClient.post<{
    success: boolean;
    contractId: string;
    status: string;
    contentChecksum: string;
  }>(`/public/contracts/${token}/sign`, payload);
  return response.data;
}

/**
 * Decline contract publicly
 */
export async function declinePublicContract(
  token: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    `/public/contracts/${token}/decline`,
    { reason }
  );
  return response.data;
}
