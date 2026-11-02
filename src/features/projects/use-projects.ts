"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspaceSession } from "@/features/organizations/use-workspace-session";
import {
  getProjects,
  getProjectStats,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  createTask,
  updateTask,
  deleteTask,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
} from "./api";
import type {
  ListProjectsParams,
  CreateProjectPayload,
  UpdateProjectPayload,
  CreateTaskPayload,
  UpdateTaskPayload,
  CreateChecklistPayload,
  UpdateChecklistPayload,
} from "./types";

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (orgId?: string, params?: ListProjectsParams) =>
    [...projectKeys.lists(), orgId, params] as const,
  stats: (orgId?: string) => [...projectKeys.all, "stats", orgId] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (orgId?: string, id?: string) => [...projectKeys.details(), orgId, id] as const,
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

export function useProjects(params?: ListProjectsParams, explicitOrgId?: string) {
  const resolvedOrgId = useResolvedOrgId();
  const organizationId = explicitOrgId || resolvedOrgId;

  return useQuery({
    queryKey: projectKeys.list(organizationId, params),
    queryFn: () => getProjects(params, organizationId),
    enabled: !!organizationId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useProjectStats(explicitOrgId?: string) {
  const resolvedOrgId = useResolvedOrgId();
  const organizationId = explicitOrgId || resolvedOrgId;

  return useQuery({
    queryKey: projectKeys.stats(organizationId),
    queryFn: () => getProjectStats(organizationId),
    enabled: !!organizationId,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useProject(id: string, explicitOrgId?: string) {
  const resolvedOrgId = useResolvedOrgId();
  const organizationId = explicitOrgId || resolvedOrgId;

  return useQuery({
    queryKey: projectKeys.detail(organizationId, id),
    queryFn: () => getProjectById(id, organizationId),
    enabled: !!organizationId && !!id,
    staleTime: 1000 * 15,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => createProject(payload, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.stats() });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProjectPayload }) =>
      updateProject(id, payload, organizationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.stats() });
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(organizationId, variables.id),
      });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: (id: string) => deleteProject(id, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.stats() });
    },
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(projectId, payload, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(organizationId, projectId),
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.stats() });
    },
  });
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: UpdateTaskPayload }) =>
      updateTask(projectId, taskId, payload, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(organizationId, projectId),
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.stats() });
    },
  });
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(projectId, taskId, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(organizationId, projectId),
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.stats() });
    },
  });
}

export function useCreateChecklistItem(projectId: string, taskId: string) {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: (payload: CreateChecklistPayload) =>
      createChecklistItem(projectId, taskId, payload, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(organizationId, projectId),
      });
    },
  });
}

export function useUpdateChecklistItem(projectId: string, taskId: string) {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: ({
      checklistId,
      payload,
    }: {
      checklistId: string;
      payload: UpdateChecklistPayload;
    }) => updateChecklistItem(projectId, taskId, checklistId, payload, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(organizationId, projectId),
      });
    },
  });
}

export function useDeleteChecklistItem(projectId: string, taskId: string) {
  const queryClient = useQueryClient();
  const organizationId = useResolvedOrgId();

  return useMutation({
    mutationFn: (checklistId: string) =>
      deleteChecklistItem(projectId, taskId, checklistId, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(organizationId, projectId),
      });
    },
  });
}
