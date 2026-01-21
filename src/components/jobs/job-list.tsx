'use client';

import React from 'react';
import { Job, EmploymentType } from '@/types/job';

interface JobListProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onClose: (job: Job) => void;
  isLoading?: boolean;
}

export function JobList({ jobs, onEdit, onClose, isLoading = false }: JobListProps) {
  const formatSalary = (min?: number, max?: number, currency: string = 'USD') => {
    if (!min && !max) return 'Salary not specified';
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    } else if (min) {
      return `From ${formatter.format(min)}`;
    } else if (max) {
      return `Up to ${formatter.format(max)}`;
    }
  };

  const formatEmploymentType = (type: EmploymentType) => {
    switch (type) {
      case EmploymentType.FULL_TIME:
        return 'Full Time';
      case EmploymentType.PART_TIME:
        return 'Part Time';
      case EmploymentType.CONTRACT:
        return 'Contract';
      case EmploymentType.INTERNSHIP:
        return 'Internship';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M8 6v10a2 2 0 002 2h4a2 2 0 002-2V6" />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs posted</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating your first job listing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div key={job.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  job.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {job.isActive ? 'Active' : 'Closed'}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.location}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M8 6v10a2 2 0 002 2h4a2 2 0 002-2V6" />
                  </svg>
                  {formatEmploymentType(job.employmentType)}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                </span>
              </div>

              <p className="text-gray-700 mb-3 line-clamp-2">
                {job.description.length > 150 
                  ? `${job.description.substring(0, 150)}...` 
                  : job.description
                }
              </p>

              <div className="flex items-center text-xs text-gray-500 space-x-4">
                <span>Created: {formatDate(job.createdAt)}</span>
                <span>Updated: {formatDate(job.updatedAt)}</span>
                {job.closedAt && <span>Closed: {formatDate(job.closedAt)}</span>}
              </div>
            </div>

            <div className="flex flex-col space-y-2 ml-4">
              <button
                onClick={() => onEdit(job)}
                className="px-3 py-1 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Edit
              </button>
              
              <a
                href={`/company/jobs/${job.id}/applications`}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-center"
              >
                Applications
              </a>
              
              {job.isActive && (
                <button
                  onClick={() => onClose(job)}
                  className="px-3 py-1 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}