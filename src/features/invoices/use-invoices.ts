"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInvoices,
  getInvoiceStats,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  updateInvoiceStatus,
  recordPayment,
  deleteInvoice,
} from "./api";
import type {
  ListInvoicesParams,
  CreateInvoicePayload,
  UpdateInvoicePayload,
  RecordPaymentPayload,
  InvoiceStatusType,
} from "./types";

export const invoiceKeys = {
  all: ["invoices"] as const,
  lists: () => [...invoiceKeys.all, "list"] as const,
  list: (orgId?: string, params?: ListInvoicesParams) =>
    [...invoiceKeys.lists(), orgId, params] as const,
  stats: (orgId?: string) => [...invoiceKeys.all, "stats", orgId] as const,
  details: () => [...invoiceKeys.all, "detail"] as const,
  detail: (orgId?: string, id?: string) => [...invoiceKeys.details(), orgId, id] as const,
};

export function useInvoices(params?: ListInvoicesParams, organizationId?: string) {
  return useQuery({
    queryKey: invoiceKeys.list(organizationId, params),
    queryFn: () => getInvoices(params, organizationId),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useInvoiceStats(organizationId?: string) {
  return useQuery({
    queryKey: invoiceKeys.stats(organizationId),
    queryFn: () => getInvoiceStats(organizationId),
    staleTime: 1000 * 30,
  });
}

export function useInvoice(id: string, organizationId?: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(organizationId, id),
    queryFn: () => getInvoiceById(id, organizationId),
    enabled: Boolean(id),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      organizationId,
    }: {
      payload: CreateInvoicePayload;
      organizationId?: string;
    }) => createInvoice(payload, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
      organizationId,
    }: {
      id: string;
      payload: UpdateInvoicePayload;
      organizationId?: string;
    }) => updateInvoice(id, payload, organizationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      queryClient.invalidateQueries({
        queryKey: invoiceKeys.detail(variables.organizationId, variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      organizationId,
    }: {
      id: string;
      status: InvoiceStatusType;
      organizationId?: string;
    }) => updateInvoiceStatus(id, status, organizationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      queryClient.invalidateQueries({
        queryKey: invoiceKeys.detail(variables.organizationId, variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
      organizationId,
    }: {
      id: string;
      payload: RecordPaymentPayload;
      organizationId?: string;
    }) => recordPayment(id, payload, organizationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      queryClient.invalidateQueries({
        queryKey: invoiceKeys.detail(variables.organizationId, variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, organizationId }: { id: string; organizationId?: string }) =>
      deleteInvoice(id, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
