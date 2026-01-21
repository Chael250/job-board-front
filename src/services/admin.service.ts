import { apiClient } from '@/lib/api-client';
import { User, UserRole } from '@/types';

export interface AdminUserStats {
  total: number;
  active: number;
  suspended: number;
  byRole: Record<UserRole, number>;
}

export interface AdminJobStats {
  total: number;
  active: number;
  closed: number;
  byEmploymentType: Record<string, number>;
}

export interface AdminDashboardStats {
  users: AdminUserStats;
  jobs: AdminJobStats;
  recentActivity: {
    newUsersToday: number;
    newJobsToday: number;
    applicationsToday: number;
  };
}

export interface UserSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  sortBy?: 'createdAt' | 'email' | 'role';
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: {
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface PaginatedAuditLogs {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  employmentType: string;
  salaryMin?: number;
  salaryMax: number;
  salaryCurrency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  company: {
    id: string;
    email: string;
    profile: {
      companyName: string;
    };
  };
}

export interface JobFilters {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  employmentType?: string;
  isActive?: boolean;
  sortBy?: 'createdAt' | 'title' | 'location';
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedJobs {
  data: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ConfirmationRequest {
  confirmed: boolean;
  reason?: string;
}

export interface BulkUserOperation {
  userIds: string[];
  confirmed: boolean;
  reason?: string;
}

export interface BulkJobOperation {
  jobIds: string[];
  isActive: boolean;
  reason?: string;
}

export interface GlobalSearchResult {
  users: User[];
  jobs: Job[];
  total: number;
}

class AdminService {
  // Dashboard and Stats
  async getDashboardStats(): Promise<AdminDashboardStats> {
    return apiClient.get('/admin/dashboard');
  }

  async getUserStats(): Promise<AdminUserStats> {
    return apiClient.get('/admin/stats/users');
  }

  async getJobStats(): Promise<AdminJobStats> {
    return apiClient.get('/admin/stats/jobs');
  }

  async getActivityStats(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiClient.get(`/admin/stats/activity?${params.toString()}`);
  }

  // User Management
  async searchUsers(params: UserSearchParams = {}): Promise<PaginatedUsers> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return apiClient.get(`/admin/users?${searchParams.toString()}`);
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    return apiClient.get(`/admin/users/role/${role}`);
  }

  async getUserById(id: string): Promise<User> {
    return apiClient.get(`/admin/users/${id}`);
  }

  async suspendUser(id: string, confirmation: ConfirmationRequest): Promise<{ message: string; user: User }> {
    return apiClient.put(`/admin/users/${id}/suspend`, confirmation);
  }

  async activateUser(id: string): Promise<{ message: string; user: User }> {
    return apiClient.put(`/admin/users/${id}/activate`);
  }

  async deleteUser(id: string, confirmation: ConfirmationRequest): Promise<{ message: string }> {
    return apiClient.delete(`/admin/users/${id}`, { data: confirmation });
  }

  // Job Management
  async getAllJobs(filters: JobFilters = {}): Promise<PaginatedJobs> {
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return apiClient.get(`/admin/jobs?${searchParams.toString()}`);
  }

  async getJobById(id: string): Promise<Job> {
    return apiClient.get(`/admin/jobs/${id}`);
  }

  async moderateJob(id: string, isActive: boolean, reason?: string): Promise<{ message: string; job: Job }> {
    return apiClient.put(`/admin/jobs/${id}/moderate`, { isActive, reason });
  }

  async deleteJob(id: string, confirmation: ConfirmationRequest): Promise<{ message: string }> {
    return apiClient.delete(`/admin/jobs/${id}`, { data: confirmation });
  }

  // Audit Logs
  async getAuditLogs(filters: AuditLogFilters = {}): Promise<PaginatedAuditLogs> {
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return apiClient.get(`/admin/audit-logs?${searchParams.toString()}`);
  }

  async getSecurityEvents(page = 1, limit = 20, startDate?: string, endDate?: string): Promise<PaginatedAuditLogs> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiClient.get(`/admin/audit-logs/security?${params.toString()}`);
  }

  async getUserActivity(userId: string, page = 1, limit = 20, startDate?: string, endDate?: string): Promise<PaginatedAuditLogs> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiClient.get(`/admin/audit-logs/user/${userId}?${params.toString()}`);
  }

  async getResourceActivity(resourceType: string, resourceId: string, page = 1, limit = 20): Promise<PaginatedAuditLogs> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    return apiClient.get(`/admin/audit-logs/resource/${resourceType}/${resourceId}?${params.toString()}`);
  }

  // Global Search
  async globalSearch(query: string, page = 1, limit = 20): Promise<GlobalSearchResult> {
    const params = new URLSearchParams({ q: query, page: page.toString(), limit: limit.toString() });
    return apiClient.get(`/admin/search?${params.toString()}`);
  }

  // Bulk Operations
  async bulkSuspendUsers(operation: BulkUserOperation): Promise<any> {
    return apiClient.put('/admin/users/bulk/suspend', operation);
  }

  async bulkModerateJobs(operation: BulkJobOperation): Promise<any> {
    return apiClient.put('/admin/jobs/bulk/moderate', operation);
  }
}

export const adminService = new AdminService();
export default adminService;