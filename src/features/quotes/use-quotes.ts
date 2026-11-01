"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import {
  getQuotes,
  getQuoteStats,
  getQuoteById,
  createQuote,
  updateQuote,
  deleteQuote,
  sendQuote,
  convertQuoteToInvoice,
  getPublicQuote,
  acceptPublicQuote,
  declinePublicQuote,
} from "./api";
import type {
  ListQuotesParams,
  CreateQuotePayload,
  UpdateQuotePayload,
  AcceptQuotePayload,
  DeclineQuotePayload,
} from "./types";

export const quoteKeys = {
  all: ["quotes"] as const,
  lists: () => [...quoteKeys.all, "list"] as const,
  list: (orgId?: string, params?: ListQuotesParams) =>
    [...quoteKeys.lists(), orgId, params] as const,
  stats: (orgId?: string) => [...quoteKeys.all, "stats", orgId] as const,
  details: () => [...quoteKeys.all, "detail"] as const,
  detail: (orgId?: string, id?: string) => [...quoteKeys.details(), orgId, id] as const,
  public: (token: string) => [...quoteKeys.all, "public", token] as const,
};

export function useResolvedOrgId(): string {
  const { organizationId } = useWorkspaceSession();
  if (organizationId) return organizationId;
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem("flowpilot_active_org");
    if (cached) return cached;
  }
  return "";
}

export function useQuotes(params?: ListQuotesParams, explicitOrgId?: string) {
  const resolvedOrgId = useResolvedOrgId();
  const organizationId = explicitOrgId || resolvedOrgId;

  return useQuery({
    queryKey: quoteKeys.list(organizationId, params),
    queryFn: () => getQuotes(params, organizationId),
    enabled: Boolean(organizationId),
    staleTime: 1000 * 30,
  });
}

export function useQuoteStats(explicitOrgId?: string) {
  const resolvedOrgId = useResolvedOrgId();
  const organizationId = explicitOrgId || resolvedOrgId;

  return useQuery({
    queryKey: quoteKeys.stats(organizationId),
    queryFn: () => getQuoteStats(organizationId),
    enabled: Boolean(organizationId),
    staleTime: 1000 * 30,
  });
}

export function useQuote(id?: string, explicitOrgId?: string) {
  const resolvedOrgId = useResolvedOrgId();
  const organizationId = explicitOrgId || resolvedOrgId;

  return useQuery({
    queryKey: quoteKeys.detail(organizationId, id),
    queryFn: () => getQuoteById(id!, organizationId),
    enabled: Boolean(organizationId && id),
    staleTime: 1000 * 30,
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: (payload: CreateQuotePayload) => createQuote(payload, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.all });
    },
  });
}

export function useUpdateQuote() {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateQuotePayload }) =>
      updateQuote(id, payload, organizationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.all });
      queryClient.invalidateQueries({
        queryKey: quoteKeys.detail(organizationId, variables.id),
      });
    },
  });
}

export function useDeleteQuote() {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: (id: string) => deleteQuote(id, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.all });
    },
  });
}

export function useSendQuote() {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: (id: string) => sendQuote(id, organizationId),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.all });
      queryClient.invalidateQueries({
        queryKey: quoteKeys.detail(organizationId, id),
      });
    },
  });
}

export function useConvertQuoteToInvoice() {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: (id: string) => convertQuoteToInvoice(id, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.all });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function usePublicQuote(token?: string) {
  return useQuery({
    queryKey: quoteKeys.public(token || ""),
    queryFn: () => getPublicQuote(token!),
    enabled: Boolean(token),
    staleTime: 1000 * 60,
  });
}

export function useAcceptPublicQuote(token?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AcceptQuotePayload) => acceptPublicQuote(token!, payload),
    onSuccess: () => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: quoteKeys.public(token) });
      }
    },
  });
}

export function useDeclinePublicQuote(token?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DeclineQuotePayload) => declinePublicQuote(token!, payload),
    onSuccess: () => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: quoteKeys.public(token) });
      }
    },
  });
}
