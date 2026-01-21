'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { adminService, PaginatedAuditLogs } from '@/services/admin.service';

interface UserDetailModalProps {
  user: User;
  onClose: () => void;
  onUserAction: (action: 'suspend' | 'activate' | 'delete', userId: string) => void;
  onUserUpdated: () => void;
}

export function UserDetailModal({ user, onClose, onUserAction, onUserUpdated }: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');
  const [userActivity, setUserActivity] = useState<PaginatedAuditLogs | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [reason, setReason] = useState('');
  const [showConfirmation, setShowConfirmation] = useState<'suspend' | 'delete' | null>(null);

  useEffect(() => {
    if (activeTab === 'activity') {
      fetchUserActivity();
    }
  }, [activeTab, user.id]);

  const fetchUserActivity = async () => {
    try {
      setLoadingActivity(true);
      const activity = await adminService.getUserActivity(user.id, 1, 10);
      setUserActivity(activity);
    } catch (error) {
      console.error('Failed to fetch user activity:', error);
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleAction = async (action: 'suspend' | 'activate' | 'delete') => {
    if (action === 'suspend' || action === 'delete') {
      setShowConfirmation(action);
      return;
    }
    
    onUserAction(action, user.id);
    onClose();
  };

  const handleConfirmedAction = async (action: 'suspend' | 'delete') => {
    onUserAction(action, user.id);
    setShowConfirmation(null);
    onClose();
  };

  const getUserDisplayName = () => {
    if (user.profile.companyName) {
      return user.profile.companyName;
    }
    return `${user.profile.firstName} ${user.profile.lastName}`;
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

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800';
      case UserRole.COMPANY:
        return 'bg-blue-100 text-blue-800';
      case UserRole.JOB_SEEKER:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <h2 className="text-xl font-semibold text-secondary-900">
            User Details
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
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-secondary-200 flex items-center justify-center">
                  <span className="text-xl font-medium text-secondary-600">
                    {getUserDisplayName().charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-secondary-900">
                    {getUserDisplayName()}
                  </h3>
                  <p className="text-secondary-600">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-secondary-900 mb-3">Personal Information</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-xs font-medium text-secondary-500">First Name</dt>
                      <dd className="text-sm text-secondary-900">{user.profile.firstName}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-secondary-500">Last Name</dt>
                      <dd className="text-sm text-secondary-900">{user.profile.lastName}</dd>
                    </div>
                    {user.profile.phone && (
                      <div>
                        <dt className="text-xs font-medium text-secondary-500">Phone</dt>
                        <dd className="text-sm text-secondary-900">{user.profile.phone}</dd>
                      </div>
                    )}
                    {user.profile.location && (
                      <div>
                        <dt className="text-xs font-medium text-secondary-500">Location</dt>
                        <dd className="text-sm text-secondary-900">{user.profile.location}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-secondary-900 mb-3">Account Information</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-xs font-medium text-secondary-500">User ID</dt>
                      <dd className="text-sm text-secondary-900 font-mono">{user.id}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-secondary-500">Created</dt>
                      <dd className="text-sm text-secondary-900">{formatDate(user.createdAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-secondary-500">Last Updated</dt>
                      <dd className="text-sm text-secondary-900">{formatDate(user.updatedAt)}</dd>
                    </div>
                    {user.profile.resumeUrl && (
                      <div>
                        <dt className="text-xs font-medium text-secondary-500">Resume</dt>
                        <dd className="text-sm text-secondary-900">
                          <a
                            href={user.profile.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-800"
                          >
                            View Resume
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {user.role === UserRole.COMPANY && (
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-secondary-900 mb-3">Company Information</h4>
                    <dl className="space-y-2">
                      {user.profile.companyName && (
                        <div>
                          <dt className="text-xs font-medium text-secondary-500">Company Name</dt>
                          <dd className="text-sm text-secondary-900">{user.profile.companyName}</dd>
                        </div>
                      )}
                      {user.profile.companyDescription && (
                        <div>
                          <dt className="text-xs font-medium text-secondary-500">Company Description</dt>
                          <dd className="text-sm text-secondary-900">{user.profile.companyDescription}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}
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
              ) : userActivity && userActivity.data.length > 0 ? (
                <div className="space-y-3">
                  {userActivity.data.map((log) => (
                    <div key={log.id} className="border border-secondary-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-secondary-900">
                          {log.action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className="text-xs text-secondary-500">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                      <div className="text-sm text-secondary-600">
                        Resource: {log.resourceType}
                        {log.resourceId && ` (${log.resourceId})`}
                      </div>
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

        {user.role !== UserRole.ADMIN && (
          <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-200">
            <div className="flex items-center justify-end space-x-3">
              {user.isActive ? (
                <button
                  onClick={() => handleAction('suspend')}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Suspend User
                </button>
              ) : (
                <button
                  onClick={() => handleAction('activate')}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Activate User
                </button>
              )}
              
              <button
                onClick={() => handleAction('delete')}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete User
              </button>
            </div>
          </div>
        )}

        {showConfirmation && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-secondary-900 mb-4">
                Confirm {showConfirmation === 'suspend' ? 'Suspension' : 'Deletion'}
              </h3>
              <p className="text-sm text-secondary-600 mb-4">
                Are you sure you want to {showConfirmation} this user? 
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
                  {showConfirmation === 'suspend' ? 'Suspend' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}