export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
export type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface TaskChecklistDto {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface ProjectTaskDto {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  sortOrder: number;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeEmail: string | null;
  checklists: TaskChecklistDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectListItem {
  id: string;
  organizationId: string;
  customerId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerCompany: string | null;
  quoteId: string | null;
  quoteTitle: string | null;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  targetDate: string | null;
  budget: number | null;
  currency: string;
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  overdueTasks: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetailResponse extends ProjectListItem {
  createdById: string | null;
  createdByName: string | null;
  tasksByStatus: Record<TaskStatus, ProjectTaskDto[]>;
}

export interface ProjectStatsResponse {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  planningProjects: number;
  onHoldProjects: number;
  totalTasks: number;
  completedTasksCount: number;
  overdueTasksCount: number;
  overallCompletionRate: number;
}

export interface ListProjectsParams {
  status?: ProjectStatus;
  customerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateProjectPayload {
  name: string;
  description?: string | null;
  customerId?: string | null;
  quoteId?: string | null;
  status?: ProjectStatus;
  startDate?: string | null;
  targetDate?: string | null;
  budget?: number | null;
  currency?: string;
  initialTasks?: {
    title: string;
    description?: string | null;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string | null;
  }[];
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string | null;
  customerId?: string | null;
  quoteId?: string | null;
  status?: ProjectStatus;
  startDate?: string | null;
  targetDate?: string | null;
  budget?: number | null;
  currency?: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
  sortOrder?: number;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
  sortOrder?: number;
}

export interface CreateChecklistPayload {
  title: string;
  sortOrder?: number;
}

export interface UpdateChecklistPayload {
  title?: string;
  isCompleted?: boolean;
  sortOrder?: number;
}
