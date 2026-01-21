'use client';

import React from 'react';
import { Application, ApplicationStatus } from '@/types/application';

interface ApplicationDetailModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (status: ApplicationStatus) => void;
  isUpdating?: boolean;
}

export function ApplicationDetailModal({ 
  application, 
  isOpen, 
  onClose, 
  onUpdateStatus,
  isUpdating = false
}: ApplicationDetailModalProps) {
  if (!isOpen || !application) return null;

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusActions = () => {
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

  const statusInfo = formatStatus(application.status);
  const statusActions = getStatusActions();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Application Details
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Applicant Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Applicant Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Name</p>
                      <p className="text-sm text-gray-900">
                        {application.jobSeeker?.profile.firstName} {application.jobSeeker?.profile.lastName}
                      </p>
                    </div>
                    {application.jobSeeker?.profile.phone && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Phone</p>
                        <p className="text-sm text-gray-900">{application.jobSeeker.profile.phone}</p>
                      </div>
                    )}
                    {application.jobSeeker?.profile.location && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Location</p>
                        <p className="text-sm text-gray-900">{application.jobSeeker.profile.location}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-700">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Job Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Position</p>
                  <p className="text-sm text-gray-900">{application.job?.title}</p>
                </div>
              </div>

              {/* Cover Letter */}
              {application.coverLetter && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Cover Letter</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{application.coverLetter}</p>
                  </div>
                </div>
              )}

              {/* Resume */}
              {application.jobSeeker?.profile.resumeUrl && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Resume</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <a
                      href={application.jobSeeker.profile.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Resume
                    </a>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Timeline</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Applied:</span>
                      <span className="text-gray-900">{formatDate(application.appliedAt)}</span>
                    </div>
                    {application.reviewedAt && (
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">Last Updated:</span>
                        <span className="text-gray-900">{formatDate(application.reviewedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <div className="flex space-x-2">
              {statusActions.map((action) => (
                <button
                  key={action.status}
                  onClick={() => onUpdateStatus(action.status)}
                  disabled={isUpdating}
                  className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
                >
                  {isUpdating ? 'Updating...' : action.text}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}