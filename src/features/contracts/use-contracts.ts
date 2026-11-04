import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
  sendContract,
  countersignContract,
  getPublicContract,
  signPublicContract,
  declinePublicContract,
} from "./api";
import type {
  ListContractsQuery,
  CreateContractInput,
  UpdateContractInput,
  CountersignContractInput,
  SignContractPublicInput,
} from "./types";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";

export const CONTRACT_QUERY_KEYS = {
  all: ["contracts"] as const,
  lists: () => [...CONTRACT_QUERY_KEYS.all, "list"] as const,
  list: (params?: ListContractsQuery, orgId?: string) =>
    [...CONTRACT_QUERY_KEYS.lists(), params, orgId] as const,
  details: () => [...CONTRACT_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string, orgId?: string) => [...CONTRACT_QUERY_KEYS.details(), id, orgId] as const,
  public: (token: string) => ["public-contract", token] as const,
};

export function useContracts(params?: ListContractsQuery) {
  const { organizationId, isAuthenticated } = useWorkspaceSession();
  return useQuery({
    queryKey: CONTRACT_QUERY_KEYS.list(params, organizationId),
    queryFn: () => getContracts(params, organizationId),
    enabled: Boolean(organizationId && isAuthenticated),
  });
}

export function useContract(id: string) {
  const { organizationId, isAuthenticated } = useWorkspaceSession();
  return useQuery({
    queryKey: CONTRACT_QUERY_KEYS.detail(id, organizationId),
    queryFn: () => getContractById(id, organizationId),
    enabled: Boolean(id) && Boolean(organizationId && isAuthenticated),
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: (payload: CreateContractInput) => createContract(payload, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_QUERY_KEYS.all });
    },
  });
}

export function useUpdateContract() {
  const queryClient = useQueryClient();
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateContractInput }) =>
      updateContract(id, payload, organizationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: CONTRACT_QUERY_KEYS.detail(variables.id, organizationId),
      });
    },
  });
}

export function useSendContract() {
  const queryClient = useQueryClient();
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: (id: string) => sendContract(id, organizationId),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: CONTRACT_QUERY_KEYS.detail(id, organizationId),
      });
    },
  });
}

export function useCountersignContract() {
  const queryClient = useQueryClient();
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CountersignContractInput }) =>
      countersignContract(id, payload, organizationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: CONTRACT_QUERY_KEYS.detail(variables.id, organizationId),
      });
    },
  });
}

export function useDeleteContract() {
  const queryClient = useQueryClient();
  const { organizationId } = useWorkspaceSession();

  return useMutation({
    mutationFn: (id: string) => deleteContract(id, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_QUERY_KEYS.all });
    },
  });
}

export function usePublicContract(token: string) {
  return useQuery({
    queryKey: CONTRACT_QUERY_KEYS.public(token),
    queryFn: () => getPublicContract(token),
    enabled: Boolean(token),
    retry: 1,
  });
}

export function useSignPublicContract(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SignContractPublicInput) => signPublicContract(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_QUERY_KEYS.public(token) });
    },
  });
}

export function useDeclinePublicContract(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => declinePublicContract(token, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_QUERY_KEYS.public(token) });
    },
  });
}
