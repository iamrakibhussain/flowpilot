"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  rescheduleAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  checkAppointmentConflict,
  getServices,
  getStaffMembers,
} from "./api";
import type {
  ListAppointmentsParams,
  CreateAppointmentPayload,
  UpdateAppointmentPayload,
  RescheduleAppointmentPayload,
  CheckConflictPayload,
  AppointmentStatusType,
} from "./types";

export const appointmentKeys = {
  all: ["appointments"] as const,
  lists: () => [...appointmentKeys.all, "list"] as const,
  list: (orgId?: string, params?: ListAppointmentsParams) =>
    [...appointmentKeys.lists(), orgId, params] as const,
  details: () => [...appointmentKeys.all, "detail"] as const,
  detail: (orgId?: string, id?: string) => [...appointmentKeys.details(), orgId, id] as const,
  services: (orgId?: string, activeOnly?: boolean) => ["services", orgId, activeOnly] as const,
  staff: (orgId?: string) => ["staff", orgId] as const,
};

export function useAppointments(params?: ListAppointmentsParams, organizationId?: string) {
  return useQuery({
    queryKey: appointmentKeys.list(organizationId, params),
    queryFn: () => getAppointments(params, organizationId),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useAppointment(id: string, organizationId?: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(organizationId, id),
    queryFn: () => getAppointmentById(id, organizationId),
    enabled: Boolean(id),
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      organizationId,
    }: {
      payload: CreateAppointmentPayload;
      organizationId?: string;
    }) => createAppointment(payload, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
      organizationId,
    }: {
      id: string;
      payload: UpdateAppointmentPayload;
      organizationId?: string;
    }) => updateAppointment(id, payload, organizationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.detail(variables.organizationId, variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRescheduleAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
      organizationId,
    }: {
      id: string;
      payload: RescheduleAppointmentPayload;
      organizationId?: string;
    }) => rescheduleAppointment(id, payload, organizationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.detail(variables.organizationId, variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      notes,
      organizationId,
    }: {
      id: string;
      status: AppointmentStatusType;
      notes?: string;
      organizationId?: string;
    }) => updateAppointmentStatus(id, status, notes, organizationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.detail(variables.organizationId, variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      reason,
      organizationId,
    }: {
      id: string;
      reason?: string;
      organizationId?: string;
    }) => cancelAppointment(id, reason, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCheckConflict() {
  return useMutation({
    mutationFn: ({
      payload,
      organizationId,
    }: {
      payload: CheckConflictPayload;
      organizationId?: string;
    }) => checkAppointmentConflict(payload, organizationId),
  });
}

export function useServices(activeOnly = false, organizationId?: string) {
  return useQuery({
    queryKey: appointmentKeys.services(organizationId, activeOnly),
    queryFn: () => getServices(activeOnly, organizationId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useStaffMembers(organizationId?: string) {
  return useQuery({
    queryKey: appointmentKeys.staff(organizationId),
    queryFn: () => getStaffMembers(organizationId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
