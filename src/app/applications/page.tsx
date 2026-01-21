'use client';

import { useState, useEffect } from 'react';
import { ApplicationService } from '@/services/application.service';
import { Application, ApplicationStatus, PaginatedResponse } from '@/types';
import { JobSeekerRoute } from '@/components/auth/protected-route';

interface ApplicationsPageState {
  applications: Application[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function ApplicationsPage() {
  const [state, setState] = useState<ApplicationsPageState>({
    applications: [],
    loading: true,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
  });

  useEffect(() => {
    loadApplications(1);
  }, []);

  const loadApplications = async (page: number = 1) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response: PaginatedResponse<Application> = await ApplicationService.getMyApplications({
        page,
        limit: state.pagination.limit,
      });

      setState(prev => ({
        ...prev,
        applications: response.data,
        pagination: response.meta,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to load applications. Please try again.',
        loading: false,
      }));
    }
  };

  const handlePageChange = (page: number) => {
    loadApplications(page);
  };

  const getStatusColor = (status: ApplicationStatus) => {
    const colorMap = {
      [ApplicationStatus.APPLIED]: 'bg-blue-100 text-blue-800',
      [ApplicationStatus.REVIEWED]: 'bg-yellow-100 text-yellow-800',
      [ApplicationStatus.SHORTLISTED]: 'bg-purple-100 text-purple-800',
      [ApplicationStatus.ACCEPTED]: 'bg-green-100 text-green-800',
      [ApplicationStatus.REJECTED]: 'bg-red-100 text-red-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: ApplicationStatus) => {
    const textMap = {
      [ApplicationStatus.APPLIED]: 'Applied',
      [ApplicationStatus.REVIEWED]: 'Under Review',
      [ApplicationStatus.SHORTLISTED]: 'Shortlisted',
      [ApplicationStatus.ACCEPTED]: 'Accepted',
      [ApplicationStatus.REJECTED]: 'Rejected',
    };
    return textMap[status] || status;
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.APPLIED:
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case ApplicationStatus.REVIEWED:
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
      case ApplicationStatus.SHORTLISTED:
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case ApplicationStatus.ACCEPTED:
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case ApplicationStatus.REJECTED:
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <JobSeekerRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
            <p className="text-gray-600">
              Track the status of your job applications and stay updated on your progress.
            </p>
          </div>

          {/* Content */}
          {state.loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading applications...</span>
            </div>
          ) : state.error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 mb-4">{state.error}</p>
              <button
                onClick={() => loadApplications(state.pagination.page)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : state.applications.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't applied to any jobs yet. Start browsing opportunities and submit your first application.
              </p>
              <a
                href="/jobs"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
              >
                Browse Jobs
              </a>
            </div>
          ) : (
            <>
              {/* Applications List */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Applications ({state.pagination.total})
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {state.applications.map((application) => (
                    <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              <a 
                                href={`/jobs/${application.jobId}`}
                                className="hover:text-blue-600 transition-colors"
                              >
                                {application.job?.title || 'Job Title'}
                              </a>
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              {getStatusIcon(application.status)}
                              <span className="ml-1">{getStatusText(application.status)}</span>
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-3">
                            {application.job?.company?.profile?.companyName || 'Company Name'}
                          </p>
                          
                          {application.coverLetter && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter:</p>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {application.coverLetter}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span>Applied: {new Date(application.appliedAt).toLocaleDateString()}</span>
                            {application.reviewedAt && (
                              <span>Reviewed: {new Date(application.reviewedAt).toLocaleDateString()}</span>
                            )}
                            <span>Last Updated: {new Date(application.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="ml-6 flex flex-col items-end gap-2">
                          <a
                            href={`/jobs/${application.jobId}`}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                          >
                            View Job →
                          </a>
                          {application.resumeUrl && (
                            <a
                              href={application.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
                            >
                              View Resume →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {state.pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(state.pagination.page - 1)}
                      disabled={!state.pagination.hasPrev}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(5, state.pagination.totalPages) }, (_, i) => {
                      const page = Math.max(1, state.pagination.page - 2) + i;
                      if (page > state.pagination.totalPages) return null;
                      
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            page === state.pagination.page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(state.pagination.page + 1)}
                      disabled={!state.pagination.hasNext}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </JobSeekerRoute>
  );
}