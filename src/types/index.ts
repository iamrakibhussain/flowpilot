export type {
  ApiResponse,
  ApiErrorResponse,
  PaginationMeta,
  RequestOptions,
} from "@/lib/api/types";
export type {
  User,
  AuthSession,
  WorkspaceRole,
  OrganizationMembershipSummary,
} from "@/features/auth/types";
export type { Organization, OrganizationMember } from "@/features/organizations/types";

/**
 * Common sorting direction
 */
export type SortOrder = "asc" | "desc";

/**
 * Standard table / list filter parameters
 */
export interface BaseFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
}
