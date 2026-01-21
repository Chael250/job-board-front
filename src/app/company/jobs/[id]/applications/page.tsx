'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CompanyRoute } from '@/components/auth/protected-route';
import { ApplicationList } from '@/components/applications/application-list';
import { ApplicationDetailModal } from '@/components/applications/application-detail-modal';
import { ApplicationService } from '@/services/application.service';
import { JobService } from '@/services/job.service';
import { Application, ApplicationStatus, ApplicationFilters, PaginatedResponse, Job } from '@/types';

export default function JobApplicationsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingJob, setIsLoadingJob] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [filters, setFilters] = useState<ApplicationFilters>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const fetchJob = async () => {
    try {
      const jobData = await JobService.getJobById(jobId);
      setJob(jobData);
    } catch (err: any) {
      console.error('Error fetching job:', err);
      setError('Failed to load job details. Please try again.');
    } finally {
      setIsLoadingJob(false);
    }
  };

  const fetchApplications = async (page: number = 1, currentFilters: ApplicationFilters = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: PaginatedResponse<Application> = await ApplicationService.getJobApplications(
        jobId,
        currentFilters,
        { page, limit: 10 }
      );
      setApplications(response.data);
      setPagination(response.meta);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJob();
      fetchApplications();
    }
  }, [jobId]);

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  const handleUpdateStatus = async (application: Application, status: ApplicationStatus) => {
    setIsUpdating(true);
    
    try {
      await ApplicationService.updateApplicationStatus(application.id, status);
      
      // Update the application in the list
      setApplications(prev => 
        prev.map(app => 
          app.id === application.id 
            ? { ...app, status, reviewedAt: new Date().toISOString() }
            : app
        )
      );
      
      // Update selected application if it's the same one
      if (selectedApplication?.id === application.id) {
        setSelectedApplication(prev => 
          prev ? { ...prev, status, reviewedAt: new Date().toISOString() } : null
        );
      }
      
      // Close modal after successful update
      if (isModalOpen) {
        setIsModalOpen(false);
        setSelectedApplication(null);
      }
    } catch (err: any) {
      console.error('Error updating application status:', err);
      alert('Failed to update application status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFilterChange = (newFilters: ApplicationFilters) => {
    setFilters(newFilters);
    fetchApplications(1, newFilters);
  };

  const handlePageChange = (newPage: number) => {
    fetchApplications(newPage, filters);
  };

  const handleBackToJobs = () => {
    router.push('/company/jobs');
  };

  if (isLoadingJob) {
    return (
      <CompanyRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CompanyRoute>
    );
  }

  if (error && !job) {
    return (
      <CompanyRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-red-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading job</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                onClick={handleBackToJobs}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Back to Jobs
              </button>
            </div>
          </div>
        </div>
      </CompanyRoute>
    );
  }

  return (
    <CompanyRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <button
              onClick={handleBackToJobs}
              className="text-primary-600 hover:text-primary-700 focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-gray-500">Back to Jobs</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Applications for "{job?.title}"
          </h1>
          <p className="text-gray-600">
            Review and manage applications for this job listing.
          </p>
        </div>

        {/* Job Summary */}
        {job && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    job.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {job.isActive ? 'Active' : 'Closed'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={filters.status || ''}
                onChange={(e) => handleFilterChange({ 
                  ...filters, 
                  status: e.target.value ? e.target.value as ApplicationStatus : undefined 
                })}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Statuses</option>
                <option value={ApplicationStatus.APPLIED}>Applied</option>
                <option value={ApplicationStatus.REVIEWED}>Reviewed</option>
                <option value={ApplicationStatus.SHORTLISTED}>Shortlisted</option>
                <option value={ApplicationStatus.ACCEPTED}>Accepted</option>
                <option value={ApplicationStatus.REJECTED}>Rejected</option>
              </select>
            </div>
            
            {(filters.status) && (
              <button
                onClick={() => handleFilterChange({})}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {error && job && (
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
                    onClick={() => fetchApplications(pagination.page, filters)}
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
            <ApplicationList
              applications={applications}
              onViewDetails={handleViewDetails}
              onUpdateStatus={handleUpdateStatus}
              isLoading={isLoading}
            />
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total applications)
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

        {/* Application Detail Modal */}
        <ApplicationDetailModal
          application={selectedApplication}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdateStatus={(status) => selectedApplication && handleUpdateStatus(selectedApplication, status)}
          isUpdating={isUpdating}
        />
      </div>
    </CompanyRoute>
  );
}