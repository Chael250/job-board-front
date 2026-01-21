'use client';

import React, { useState, useEffect } from 'react';
import { CompanyRoute } from '@/components/auth/protected-route';
import { ApplicationList } from '@/components/applications/application-list';
import { ApplicationDetailModal } from '@/components/applications/application-detail-modal';
import { ApplicationService } from '@/services/application.service';
import { Application, ApplicationStatus, ApplicationFilters, PaginatedResponse } from '@/types';

export default function CompanyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const fetchApplications = async (page: number = 1, currentFilters: ApplicationFilters = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: PaginatedResponse<Application> = await ApplicationService.getCompanyApplications(
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
    fetchApplications();
  }, []);

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

  return (
    <CompanyRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Applications</h1>
          <p className="text-gray-600">
            Review and manage applications for your job listings.
          </p>
        </div>

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