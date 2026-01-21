'use client';

import React from 'react';
import { Job } from '@/services/admin.service';

interface JobListTableProps {
  jobs: Job[];
  selectedJobIds: string[];
  onJobSelect: (jobId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onJobAction: (action: 'activate' | 'deactivate' | 'delete', jobId: string) => void;
  onViewJob: (job: Job) => void;
  loading?: boolean;
}

export function JobListTable({
  jobs,
  selectedJobIds,
  onJobSelect,
  onSelectAll,
  onJobAction,
  onViewJob,
  loading
}: JobListTableProps) {
  const allSelected = jobs.length > 0 && jobs.every(job => selectedJobIds.includes(job.id));
  const someSelected = selectedJobIds.length > 0 && !allSelected;

  const getEmploymentTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'full_time':
        return 'bg-blue-100 text-blue-800';
      case 'part_time':
        return 'bg-green-100 text-green-800';
      case 'contract':
        return 'bg-yellow-100 text-yellow-800';
      case 'internship':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatEmploymentType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatSalary = (job: Job) => {
    if (!job.salaryMin && !job.salaryMax) return 'Not specified';
    
    const currency = job.salaryCurrency || 'USD';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    if (job.salaryMin && job.salaryMax) {
      return `${formatter.format(job.salaryMin)} - ${formatter.format(job.salaryMax)}`;
    } else if (job.salaryMax) {
      return `Up to ${formatter.format(job.salaryMax)}`;
    } else if (job.salaryMin) {
      return `From ${formatter.format(job.salaryMin)}`;
    }
    
    return 'Not specified';
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="mt-2 text-secondary-600">Loading jobs...</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-secondary-600">No jobs found matching your criteria.</p>
      </div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-secondary-200">
      <thead className="bg-secondary-50">
        <tr>
          <th className="px-6 py-3 text-left">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) input.indeterminate = someSelected;
              }}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
            />
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
            Job Details
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
            Company
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
            Type
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
            Salary
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
            Created
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-secondary-200">
        {jobs.map((job) => (
          <tr key={job.id} className="hover:bg-secondary-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <input
                type="checkbox"
                checked={selectedJobIds.includes(job.id)}
                onChange={(e) => onJobSelect(job.id, e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
            </td>
            <td className="px-6 py-4">
              <div className="max-w-xs">
                <div className="text-sm font-medium text-secondary-900 truncate">
                  {job.title}
                </div>
                <div className="text-sm text-secondary-500 truncate">
                  {job.location}
                </div>
                <div className="text-xs text-secondary-400 line-clamp-2">
                  {job.description.substring(0, 100)}...
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-secondary-900">
                {job.company.profile.companyName}
              </div>
              <div className="text-sm text-secondary-500">
                {job.company.email}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEmploymentTypeBadgeColor(job.employmentType)}`}>
                {formatEmploymentType(job.employmentType)}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
              {formatSalary(job)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(job.isActive)}`}>
                {job.isActive ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
              {formatDate(job.createdAt)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onViewJob(job)}
                  className="text-primary-600 hover:text-primary-900"
                >
                  View
                </button>
                
                {job.isActive ? (
                  <button
                    onClick={() => onJobAction('deactivate', job.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => onJobAction('activate', job.id)}
                    className="text-green-600 hover:text-green-900"
                  >
                    Activate
                  </button>
                )}
                
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
                      onJobAction('delete', job.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}