'use client';

import React, { useState, useEffect } from 'react';
import { Job, adminService, PaginatedAuditLogs } from '@/services/admin.service';

interface JobDetailModalProps {
  job: Job;
  onClose: () => void;
  onJobAction: (action: 'activate' | 'deactivate' | 'delete', jobId: string) => void;
  onJobUpdated: () => void;
}

export function JobDetailModal({ job, onClose, onJobAction, onJobUpdated }: JobDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');
  const [jobActivity, setJobActivity] = useState<PaginatedAuditLogs | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [reason, setReason] = useState('');
  const [showConfirmation, setShowConfirmation] = useState<'deactivate' | 'delete' | null>(null);

  useEffect(() => {
    if (activeTab === 'activity') {
      fetchJobActivity();
    }
  }, [activeTab, job.id]);

  const fetchJobActivity = async () => {
    try {
      setLoadingActivity(true);
      const activity = await adminService.getResourceActivity('JOB', job.id, 1, 10);
      setJobActivity(activity);
    } catch (error) {
      console.error('Failed to fetch job activity:', error);
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (action === 'deactivate' || action === 'delete') {
      setShowConfirmation(action);
      return;
    }
    
    onJobAction(action, job.id);
    onClose();
  };

  const handleConfirmedAction = async (action: 'deactivate' | 'delete') => {
    onJobAction(action, job.id);
    setShowConfirmation(null);
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatEmploymentType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatSalary = () => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <h2 className="text-xl font-semibold text-secondary-900">
            Job Details
          </h2>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-secondary-200">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'details'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'activity'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-secondary-500 hover:text-secondary-700'
            }`}
          >
            Activity Log
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">
                      {job.title}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEmploymentTypeBadgeColor(job.employmentType)}`}>
                        {formatEmploymentType(job.employmentType)}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        job.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {job.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-secondary-600">{job.location}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-secondary-900 mb-3">Company Information</h4>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-xs font-medium text-secondary-500">Company Name</dt>
                        <dd className="text-sm text-secondary-900">{job.company.profile.companyName}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-secondary-500">Company Email</dt>
                        <dd className="text-sm text-secondary-900">{job.company.email}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-secondary-500">Company ID</dt>
                        <dd className="text-sm text-secondary-900 font-mono">{job.company.id}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-secondary-900 mb-3">Job Information</h4>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-xs font-medium text-secondary-500">Job ID</dt>
                        <dd className="text-sm text-secondary-900 font-mono">{job.id}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-secondary-500">Salary Range</dt>
                        <dd className="text-sm text-secondary-900">{formatSalary()}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-secondary-500">Created</dt>
                        <dd className="text-sm text-secondary-900">{formatDate(job.createdAt)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-secondary-500">Last Updated</dt>
                        <dd className="text-sm text-secondary-900">{formatDate(job.updatedAt)}</dd>
                      </div>
                      {job.closedAt && (
                        <div>
                          <dt className="text-xs font-medium text-secondary-500">Closed</dt>
                          <dd className="text-sm text-secondary-900">{formatDate(job.closedAt)}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-secondary-900 mb-3">Job Description</h4>
                  <div className="bg-secondary-50 rounded-lg p-4">
                    <p className="text-sm text-secondary-700 whitespace-pre-wrap">
                      {job.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div>
              <h4 className="text-sm font-medium text-secondary-900 mb-4">Recent Activity</h4>
              {loadingActivity ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                  <p className="mt-2 text-sm text-secondary-600">Loading activity...</p>
                </div>
              ) : jobActivity && jobActivity.data.length > 0 ? (
                <div className="space-y-3">
                  {jobActivity.data.map((log) => (
                    <div key={log.id} className="border border-secondary-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-secondary-900">
                          {log.action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className="text-xs text-secondary-500">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                      {log.user && (
                        <div className="text-sm text-secondary-600 mb-1">
                          By: {log.user.profile.firstName} {log.user.profile.lastName} ({log.user.email})
                        </div>
                      )}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-2 text-xs text-secondary-500">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-secondary-600">No recent activity found.</p>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-200">
          <div className="flex items-center justify-end space-x-3">
            {job.isActive ? (
              <button
                onClick={() => handleAction('deactivate')}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Deactivate Job
              </button>
            ) : (
              <button
                onClick={() => handleAction('activate')}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Activate Job
              </button>
            )}
            
            <button
              onClick={() => handleAction('delete')}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Job
            </button>
          </div>
        </div>

        {showConfirmation && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-secondary-900 mb-4">
                Confirm {showConfirmation === 'deactivate' ? 'Deactivation' : 'Deletion'}
              </h3>
              <p className="text-sm text-secondary-600 mb-4">
                Are you sure you want to {showConfirmation} this job? 
                {showConfirmation === 'delete' && ' This action cannot be undone.'}
              </p>
              
              <div className="mb-4">
                <label htmlFor="reason" className="block text-sm font-medium text-secondary-700 mb-1">
                  Reason (optional)
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter reason for this action..."
                />
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmation(null)}
                  className="px-4 py-2 bg-secondary-100 text-secondary-700 text-sm font-medium rounded-md hover:bg-secondary-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmedAction(showConfirmation)}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                >
                  {showConfirmation === 'deactivate' ? 'Deactivate' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}