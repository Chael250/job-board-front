import { apiClient } from '@/lib/api-client';
import { Application, CreateApplicationData, ApplicationFilters, PaginationParams, PaginatedResponse } from '@/types';

export class ApplicationService {
  private static readonly BASE_URL = '/applications';

  /**
   * Submit a new job application
   */
  static async submitApplication(applicationData: CreateApplicationData): Promise<Application> {
    return await apiClient.post<Application>(this.BASE_URL, applicationData);
  }

  /**
   * Get current user's applications
   */
  static async getMyApplications(
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Application>> {
    const params = new URLSearchParams();
    
    if (pagination.page) params.append('page', pagination.page.toString());
    if (pagination.limit) params.append('limit', pagination.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.BASE_URL}?${queryString}` : this.BASE_URL;
    
    return await apiClient.get<PaginatedResponse<Application>>(url);
  }

  /**
   * Get a specific application by ID
   */
  static async getApplicationById(id: string): Promise<Application> {
    return await apiClient.get<Application>(`${this.BASE_URL}/${id}`);
  }

  /**
   * Check if user has already applied to a job
   */
  static async checkExistingApplication(jobId: string): Promise<boolean> {
    try {
      const applications = await this.getMyApplications({ limit: 100 });
      return applications.data.some(app => app.jobId === jobId);
    } catch (error) {
      // If we can't check, assume no application exists
      return false;
    }
  }
}