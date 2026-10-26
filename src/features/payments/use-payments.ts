"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useResolvedOrgId, invoiceKeys } from "@/features/invoices/use-invoices";
import {
  getPublicInvoice,
  createCheckoutSession,
  settleSandboxPayment,
  generatePaymentToken,
  getPaymentSettings,
  updatePaymentSettings,
  getPaymentTransactions,
} from "./api";
import type { ListTransactionsParams, UpdatePaymentSettingsPayload } from "./types";

export const paymentKeys = {
  all: ["payments"] as const,
  publicInvoice: (token: string) => [...paymentKeys.all, "public-invoice", token] as const,
  settings: (orgId?: string) => [...paymentKeys.all, "settings", orgId] as const,
  transactions: (orgId?: string, params?: ListTransactionsParams) =>
    [...paymentKeys.all, "transactions", orgId, params] as const,
};

/**
 * Public Hook: Load client invoice statement by token
 */
export function usePublicInvoice(token: string) {
  return useQuery({
    queryKey: paymentKeys.publicInvoice(token),
    queryFn: () => getPublicInvoice(token),
    enabled: Boolean(token),
    staleTime: 1000 * 10,
    retry: 1,
  });
}

/**
 * Public Hook: Settle payment via instant sandbox mode
 */
export function useSettleSandboxPayment(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethod?: string) => settleSandboxPayment(token, paymentMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.publicInvoice(token) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

/**
 * Public Hook: Create Stripe checkout redirect session
 */
export function useCreateCheckoutSession(token: string) {
  return useMutation({
    mutationFn: (data?: Record<string, unknown>) => createCheckoutSession(token, data),
  });
}

/**
 * Tenant Hook: Generate or retrieve payment URL token for an invoice
 */
export function useGeneratePaymentToken(explicitOrgId?: string) {
  const resolvedOrgId = useResolvedOrgId();
  const organizationId = explicitOrgId || resolvedOrgId;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invoiceId: string) => generatePaymentToken(invoiceId, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
  });
}

/**
 * Tenant Hook: Load organization payment settings
 */
export function usePaymentSettings(explicitOrgId?: string) {
  const resolvedOrgId = useResolvedOrgId();
  const organizationId = explicitOrgId || resolvedOrgId;

  return useQuery({
    queryKey: paymentKeys.settings(organizationId),
    queryFn: () => getPaymentSettings(organizationId),
    enabled: Boolean(organizationId),
    staleTime: 1000 * 60,
  });
}

/**
 * Tenant Hook: Update organization payment settings
 */
export function useUpdatePaymentSettings(explicitOrgId?: string) {
  const resolvedOrgId = useResolvedOrgId();
  const organizationId = explicitOrgId || resolvedOrgId;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePaymentSettingsPayload) =>
      updatePaymentSettings(payload, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.settings(organizationId) });
    },
  });
}

/**
 * Tenant Hook: Transaction ledger history
 */
export function usePaymentTransactions(params?: ListTransactionsParams, explicitOrgId?: string) {
  const resolvedOrgId = useResolvedOrgId();
  const organizationId = explicitOrgId || resolvedOrgId;

  return useQuery({
    queryKey: paymentKeys.transactions(organizationId, params),
    queryFn: () => getPaymentTransactions(params, organizationId),
    enabled: Boolean(organizationId),
    staleTime: 1000 * 30,
  });
}
