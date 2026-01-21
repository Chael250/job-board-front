'use client';

import React from 'react';
import { Application, ApplicationStatus } from '@/types/application';

interface ApplicationListProps {
  applications: Application[];
  onViewDetails: (application: Application) => void;
  onUpdateStatus: (application: Application, status: ApplicationStatus) => void;
  isLoading?: boolean;
}

export function ApplicationList({ 
  applications, 
  onViewDetails, 
  onUpdateStatus, 
  isLoading = false 
}: ApplicationListProps) {
  const formatStatus = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.APPLIED:
        return { text: 'Applied', color: 'bg-blue-100 text-blue-800' };
      case ApplicationStatus.REVIEWED:
        return { text: 'Reviewed', color: 'bg-yellow-100 text-yellow-800' };
      case ApplicationStatus.SHORTLISTED:
        return { text: 'Shortlisted', color: 'bg-purple-100 text-purple-800' };
      case ApplicationStatus.ACCEPTED:
        return { text: 'Accepted', color: 'bg-green-100 text-green-800' };
      case ApplicationStatus.REJECTED:
        return { text: 'Rejected', color: 'bg-red-100 text-red-800' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusActions = (application: Application) => {
    const actions = [];
    
    switch (application.status) {
      case ApplicationStatus.APPLIED:
        actions.push(
          { status: ApplicationStatus.REVIEWED, text: 'Mark as Reviewed', color: 'bg-yellow-600 hover:bg-yellow-700' },
          { status: ApplicationStatus.SHORTLISTED, text: 'Shortlist', color: 'bg-purple-600 hover:bg-purple-700' },
          { status: ApplicationStatus.REJECTED, text: 'Reject', color: 'bg-red-600 hover:bg-red-700' }
        );
        break;
      case ApplicationStatus.REVIEWED:
        actions.push(
          { status: ApplicationStatus.SHORTLISTED, text: 'Shortlist', color: 'bg-purple-600 hover:bg-purple-700' },
          { status: ApplicationStatus.REJECTED, text: 'Reject', color: 'bg-red-600 hover:bg-red-700' }
        );
        break;
      case ApplicationStatus.SHORTLISTED:
        actions.push(
          { status: ApplicationStatus.ACCEPTED, text: 'Accept', color: 'bg-green-600 hover:bg-green-700' },
          { status: ApplicationStatus.REJECTED, text: 'Reject', color: 'bg-red-600 hover:bg-red-700' }
        );
        break;
    }
    
    return actions;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="ml-4 space-y-2">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Applications will appear here when job seekers apply to your jobs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => {
        const statusInfo = formatStatus(application.status);
        const statusActions = getStatusActions(application);
        
        return (
          <div key={application.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {application.jobSeeker?.profile.firstName} {application.jobSeeker?.profile.lastName}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  <p className="font-medium">{application.job?.title}</p>
                  {application.jobSeeker?.profile.location && (
                    <p className="flex items-center mt-1">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {application.jobSeeker.profile.location}
                    </p>
                  )}
                  {application.jobSeeker?.profile.phone && (
                    <p className="flex items-center mt-1">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {application.jobSeeker.profile.phone}
                    </p>
                  )}
                </div>

                {application.coverLetter && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter:</p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {application.coverLetter.length > 200 
                        ? `${application.coverLetter.substring(0, 200)}...` 
                        : application.coverLetter
                      }
                    </p>
                  </div>
                )}

                <div className="flex items-center text-xs text-gray-500 space-x-4">
                  <span>Applied: {formatDate(application.appliedAt)}</span>
                  {application.reviewedAt && (
                    <span>Reviewed: {formatDate(application.reviewedAt)}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={() => onViewDetails(application)}
                  className="px-3 py-1 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  View Details
                </button>
                
                {application.jobSeeker?.profile.resumeUrl && (
                  <a
                    href={application.jobSeeker.profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-center"
                  >
                    View Resume
                  </a>
                )}

                {statusActions.map((action) => (
                  <button
                    key={action.status}
                    onClick={() => onUpdateStatus(application, action.status)}
                    className={`px-3 py-1 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${action.color}`}
                  >
                    {action.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}