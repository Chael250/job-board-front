'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CompanyRoute } from '@/components/auth/protected-route';
import { JobList } from '@/components/jobs/job-list';
import { JobService } from '@/services/job.service';
import { Job, PaginatedResponse } from '@/types/job';

export default function CompanyJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const fetchJobs = async (page: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: PaginatedResponse<Job> = await JobService.getMyJobs({ page, limit: 10 });
      setJobs(response.data);
      setPagination(response.meta);
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = () => {
    router.push('/company/jobs/create');
  };

  const handleEditJob = (job: Job) => {
    router.push(`/company/jobs/${job.id}/edit`);
  };

  const handleCloseJob = async (job: Job) => {
    if (!confirm(`Are you sure you want to close the job "${job.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await JobService.closeJob(job.id);
      // Refresh the jobs list
      await fetchJobs(pagination.page);
    } catch (err: any) {
      console.error('Error closing job:', err);
      alert('Failed to close job. Please try again.');
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchJobs(newPage);
  };

  return (
    <CompanyRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Jobs</h1>
            <p className="text-gray-600">
              Manage your job listings and track their performance.
            </p>
          </div>
          <button
            onClick={handleCreateJob}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Job
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <div className="mt-2">
                  <button
                    onClick={() => fetchJobs(pagination.page)}
                    className="text-sm text-red-800 underline hover:text-red-900"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-6">
            <JobList
              jobs={jobs}
              onEdit={handleEditJob}
              onClose={handleCloseJob}
              isLoading={isLoading}
            />
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total jobs)
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CompanyRoute>
  );
}