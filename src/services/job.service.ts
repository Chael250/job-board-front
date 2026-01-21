import { apiClient } from '@/lib/api-client';
import { Job, JobFilters, PaginationParams, PaginatedResponse, CreateJobData, UpdateJobData } from '@/types/job';

export class JobService {
  private static readonly BASE_URL = '/jobs';

  /**
   * Get paginated job listings with optional filters
   */
  static async getJobs(
    filters: JobFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Job>> {
    const params = new URLSearchParams();
    
    // Add pagination params
    if (pagination.page) params.append('page', pagination.page.toString());
    if (pagination.limit) params.append('limit', pagination.limit.toString());
    
    // Add filter params
    if (filters.location) params.append('location', filters.location);
    if (filters.employmentType) params.append('employmentType', filters.employmentType);
    if (filters.salaryMin) params.append('salaryMin', filters.salaryMin.toString());
    if (filters.salaryMax) params.append('salaryMax', filters.salaryMax.toString());
    if (filters.keywords) params.append('keywords', filters.keywords);

    const queryString = params.toString();
    const url = queryString ? `${this.BASE_URL}?${queryString}` : this.BASE_URL;
    
    return await apiClient.get<PaginatedResponse<Job>>(url);
  }

  /**
   * Get a single job by ID
   */
  static async getJobById(id: string): Promise<Job> {
    return await apiClient.get<Job>(`${this.BASE_URL}/${id}`);
  }

  /**
   * Search jobs with text query
   */
  static async searchJobs(
    query: string,
    filters: Omit<JobFilters, 'keywords'> = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<Job>> {
    return this.getJobs({ ...filters, keywords: query }, pagination);
  }

  // Company-specific methods

  /**
   * Create a new job (company only)
   */
  static async createJob(jobData: CreateJobData): Promise<Job> {
    return await apiClient.post<Job>(this.BASE_URL, jobData);
  }

  /**
   * Update an existing job (company only)
   */
  static async updateJob(id: string, jobData: UpdateJobData): Promise<Job> {
    return await apiClient.put<Job>(`${this.BASE_URL}/${id}`, jobData);
  }

  /**
   * Close a job (company only)
   */
  static async closeJob(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/${id}`);
  }

  /**
   * Get company's own jobs
   */
  static async getMyJobs(pagination: PaginationParams = {}): Promise<PaginatedResponse<Job>> {
    const params = new URLSearchParams();
    
    if (pagination.page) params.append('page', pagination.page.toString());
    if (pagination.limit) params.append('limit', pagination.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.BASE_URL}/company/my-jobs?${queryString}` : `${this.BASE_URL}/company/my-jobs`;
    
    return await apiClient.get<PaginatedResponse<Job>>(url);
  }
}