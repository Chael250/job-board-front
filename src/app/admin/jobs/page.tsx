'use client';

import React, { useState, useEffect } from 'react';
import { AdminRoute } from '@/components/auth/protected-route';
import { adminService, JobFilters, PaginatedJobs, Job } from '@/services/admin.service';
import { JobListTable } from '@/components/admin/job-list-table';
import { JobSearchFilters } from '@/components/admin/job-search-filters';
import { JobDetailModal } from '@/components/admin/job-detail-modal';
import { BulkJobActions } from '@/components/admin/bulk-job-actions';
import { Loading } from '@/components/ui/loading';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<PaginatedJobs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useState<JobFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminService.getAllJobs(searchParams);
      setJobs(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchParams]);

  const handleSearch = (newParams: Partial<JobFilters>) => {
    setSearchParams(prev => ({
      ...prev,
      ...newParams,
      page: 1, // Reset to first page on new search
    }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
  };

  const handleJobSelect = (jobId: string, selected: boolean) => {
    setSelectedJobIds(prev => 
      selected 
        ? [...prev, jobId]
        : prev.filter(id => id !== jobId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected && jobs) {
      setSelectedJobIds(jobs.data.map(job => job.id));
    } else {
      setSelectedJobIds([]);
    }
  };

  const handleJobAction = async (action: 'activate' | 'deactivate' | 'delete', jobId: string) => {
    try {
      if (action === 'activate') {
        await adminService.moderateJob(jobId, true);
      } else if (action === 'deactivate') {
        await adminService.moderateJob(jobId, false);
      } else if (action === 'delete') {
        await adminService.deleteJob(jobId, { confirmed: true });
      }
      
      // Refresh the job list
      await fetchJobs();
      
      // Clear selection if job was selected
      setSelectedJobIds(prev => prev.filter(id => id !== jobId));
    } catch (err: any) {
      setError(err.message || `Failed to ${action} job`);
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate', jobIds: string[], reason?: string) => {
    try {
      await adminService.bulkModerateJobs({
        jobIds,
        isActive: action === 'activate',
        reason,
      });
      
      // Refresh the job list
      await fetchJobs();
      
      // Clear selection
      setSelectedJobIds([]);
    } catch (err: any) {
      setError(err.message || 'Failed to perform bulk action');
    }
  };

  if (loading && !jobs) {
    return (
      <AdminRoute>
        <div className="container mx-auto px-4 py-8">
          <Loading />
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Job Moderation
          </h1>
          <p className="text-secondary-600">
            Review and moderate job listings for compliance and quality.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-secondary-200">
          <div className="p-6 border-b border-secondary-200">
            <JobSearchFilters
              onSearch={handleSearch}
              loading={loading}
            />
          </div>

          {selectedJobIds.length > 0 && (
            <div className="p-4 bg-secondary-50 border-b border-secondary-200">
              <BulkJobActions
                selectedCount={selectedJobIds.length}
                onBulkAction={handleBulkAction}
                selectedJobIds={selectedJobIds}
                onClearSelection={() => setSelectedJobIds([])}
              />
            </div>
          )}

          <div className="overflow-x-auto">
            {jobs && (
              <JobListTable
                jobs={jobs.data}
                selectedJobIds={selectedJobIds}
                onJobSelect={handleJobSelect}
                onSelectAll={handleSelectAll}
                onJobAction={handleJobAction}
                onViewJob={setSelectedJob}
                loading={loading}
              />
            )}
          </div>

          {jobs && jobs.totalPages > 1 && (
            <div className="p-6 border-t border-secondary-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-secondary-600">
                  Showing {((jobs.page - 1) * jobs.limit) + 1} to {Math.min(jobs.page * jobs.limit, jobs.total)} of {jobs.total} jobs
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(jobs.page - 1)}
                    disabled={jobs.page <= 1}
                    className="px-3 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-md hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, jobs.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, jobs.page - 2) + i;
                      if (pageNum > jobs.totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            pageNum === jobs.page
                              ? 'bg-primary-600 text-white'
                              : 'text-secondary-700 bg-white border border-secondary-300 hover:bg-secondary-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(jobs.page + 1)}
                    disabled={jobs.page >= jobs.totalPages}
                    className="px-3 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-md hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedJob && (
          <JobDetailModal
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
            onJobAction={handleJobAction}
            onJobUpdated={fetchJobs}
          />
        )}
      </div>
    </AdminRoute>
  );
}