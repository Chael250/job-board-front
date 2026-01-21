'use client';

import React from 'react';
import { User, UserRole } from '@/types';

interface UserListTableProps {
  users: User[];
  selectedUserIds: string[];
  onUserSelect: (userId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onUserAction: (action: 'suspend' | 'activate' | 'delete', userId: string) => void;
  onViewUser: (user: User) => void;
  loading?: boolean;
}

export function UserListTable({
  users,
  selectedUserIds,
  onUserSelect,
  onSelectAll,
  onUserAction,
  onViewUser,
  loading
}: UserListTableProps) {
  const allSelected = users.length > 0 && users.every(user => selectedUserIds.includes(user.id));
  const someSelected = selectedUserIds.length > 0 && !allSelected;

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

  const getUserDisplayName = (user: User) => {
    if (user.profile.companyName) {
      return user.profile.companyName;
    }
    return `${user.profile.firstName} ${user.profile.lastName}`;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="mt-2 text-secondary-600">Loading users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-secondary-600">No users found matching your criteria.</p>
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
            User
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
            Role
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
        {users.map((user) => (
          <tr key={user.id} className="hover:bg-secondary-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <input
                type="checkbox"
                checked={selectedUserIds.includes(user.id)}
                onChange={(e) => onUserSelect(user.id, e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                  <div className="h-10 w-10 rounded-full bg-secondary-200 flex items-center justify-center">
                    <span className="text-sm font-medium text-secondary-600">
                      {getUserDisplayName(user).charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-secondary-900">
                    {getUserDisplayName(user)}
                  </div>
                  <div className="text-sm text-secondary-500">
                    {user.email}
                  </div>
                  {user.profile.location && (
                    <div className="text-xs text-secondary-400">
                      {user.profile.location}
                    </div>
                  )}
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                {user.role.replace('_', ' ').toUpperCase()}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.isActive)}`}>
                {user.isActive ? 'Active' : 'Suspended'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
              {formatDate(user.createdAt)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onViewUser(user)}
                  className="text-primary-600 hover:text-primary-900"
                >
                  View
                </button>
                
                {user.role !== UserRole.ADMIN && (
                  <>
                    {user.isActive ? (
                      <button
                        onClick={() => onUserAction('suspend', user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => onUserAction('activate', user.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Activate
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                          onUserAction('delete', user.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}