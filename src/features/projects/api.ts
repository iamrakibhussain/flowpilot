import { apiClient } from "@/lib/api/client";
import type {
  ProjectListItem,
  ProjectDetailResponse,
  ProjectStatsResponse,
  ListProjectsParams,
  CreateProjectPayload,
  UpdateProjectPayload,
  ProjectTaskDto,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskChecklistDto,
  CreateChecklistPayload,
  UpdateChecklistPayload,
} from "./types";

export interface ListProjectsResponse {
  projects: ProjectListItem[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Fetch projects list with filters
 */
export async function getProjects(
  params?: ListProjectsParams,
  organizationId?: string
): Promise<ListProjectsResponse> {
  const queryParams: Record<string, string | undefined> = {};
  if (params?.status) queryParams.status = params.status;
  if (params?.customerId) queryParams.customerId = params.customerId;
  if (params?.search) queryParams.search = params.search;
  if (params?.page) queryParams.page = String(params.page);
  if (params?.limit) queryParams.limit = String(params.limit);

  const response = await apiClient.get<ListProjectsResponse>("/projects", {
    params: queryParams,
    organizationId,
  });
  return response.data;
}

/**
 * Fetch aggregated project stats
 */
export async function getProjectStats(organizationId?: string): Promise<ProjectStatsResponse> {
  const response = await apiClient.get<ProjectStatsResponse>("/projects/stats", {
    organizationId,
  });
  return response.data;
}

/**
 * Fetch single project detail with tasks grouped by status
 */
export async function getProjectById(
  id: string,
  organizationId?: string
): Promise<ProjectDetailResponse> {
  const response = await apiClient.get<ProjectDetailResponse>(`/projects/${id}`, {
    organizationId,
  });
  return response.data;
}

/**
 * Create a new workspace project
 */
export async function createProject(
  payload: CreateProjectPayload,
  organizationId?: string
): Promise<ProjectDetailResponse> {
  const response = await apiClient.post<ProjectDetailResponse>("/projects", payload, {
    organizationId,
  });
  return response.data;
}

/**
 * Update an existing project
 */
export async function updateProject(
  id: string,
  payload: UpdateProjectPayload,
  organizationId?: string
): Promise<ProjectDetailResponse> {
  const response = await apiClient.patch<ProjectDetailResponse>(`/projects/${id}`, payload, {
    organizationId,
  });
  return response.data;
}

/**
 * Delete a project
 */
export async function deleteProject(
  id: string,
  organizationId?: string
): Promise<{ success: boolean }> {
  const response = await apiClient.delete<{ success: boolean }>(`/projects/${id}`, {
    organizationId,
  });
  return response.data;
}

/**
 * Create a new task in a project
 */
export async function createTask(
  projectId: string,
  payload: CreateTaskPayload,
  organizationId?: string
): Promise<ProjectTaskDto> {
  const response = await apiClient.post<ProjectTaskDto>(`/projects/${projectId}/tasks`, payload, {
    organizationId,
  });
  return response.data;
}

/**
 * Update a task (status, title, priority, sortOrder, assignee)
 */
export async function updateTask(
  projectId: string,
  taskId: string,
  payload: UpdateTaskPayload,
  organizationId?: string
): Promise<ProjectTaskDto> {
  const response = await apiClient.patch<ProjectTaskDto>(
    `/projects/${projectId}/tasks/${taskId}`,
    payload,
    { organizationId }
  );
  return response.data;
}

/**
 * Delete a task
 */
export async function deleteTask(
  projectId: string,
  taskId: string,
  organizationId?: string
): Promise<{ success: boolean }> {
  const response = await apiClient.delete<{ success: boolean }>(
    `/projects/${projectId}/tasks/${taskId}`,
    { organizationId }
  );
  return response.data;
}

/**
 * Create a checklist item
 */
export async function createChecklistItem(
  projectId: string,
  taskId: string,
  payload: CreateChecklistPayload,
  organizationId?: string
): Promise<TaskChecklistDto> {
  const response = await apiClient.post<TaskChecklistDto>(
    `/projects/${projectId}/tasks/${taskId}/checklists`,
    payload,
    { organizationId }
  );
  return response.data;
}

/**
 * Update a checklist item
 */
export async function updateChecklistItem(
  projectId: string,
  taskId: string,
  checklistId: string,
  payload: UpdateChecklistPayload,
  organizationId?: string
): Promise<TaskChecklistDto> {
  const response = await apiClient.patch<TaskChecklistDto>(
    `/projects/${projectId}/tasks/${taskId}/checklists/${checklistId}`,
    payload,
    { organizationId }
  );
  return response.data;
}

/**
 * Delete a checklist item
 */
export async function deleteChecklistItem(
  projectId: string,
  taskId: string,
  checklistId: string,
  organizationId?: string
): Promise<{ success: boolean }> {
  const response = await apiClient.delete<{ success: boolean }>(
    `/projects/${projectId}/tasks/${taskId}/checklists/${checklistId}`,
    { organizationId }
  );
  return response.data;
}
