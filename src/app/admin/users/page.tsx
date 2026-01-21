'use client';

import React, { useState, useEffect } from 'react';
import { AdminRoute } from '@/components/auth/protected-route';
import { adminService, UserSearchParams, PaginatedUsers } from '@/services/admin.service';
import { User, UserRole } from '@/types';
import { UserListTable } from '@/components/admin/user-list-table';
import { UserSearchFilters } from '@/components/admin/user-search-filters';
import { UserDetailModal } from '@/components/admin/user-detail-modal';
import { BulkUserActions } from '@/components/admin/bulk-user-actions';
import { Loading } from '@/components/ui/loading';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PaginatedUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useState<UserSearchParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminService.searchUsers(searchParams);
      setUsers(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchParams]);

  const handleSearch = (newParams: Partial<UserSearchParams>) => {
    setSearchParams(prev => ({
      ...prev,
      ...newParams,
      page: 1, // Reset to first page on new search
    }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
  };

  const handleUserSelect = (userId: string, selected: boolean) => {
    setSelectedUserIds(prev => 
      selected 
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected && users) {
      setSelectedUserIds(users.data.map(user => user.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleUserAction = async (action: 'suspend' | 'activate' | 'delete', userId: string) => {
    try {
      if (action === 'suspend') {
        await adminService.suspendUser(userId, { confirmed: true });
      } else if (action === 'activate') {
        await adminService.activateUser(userId);
      } else if (action === 'delete') {
        await adminService.deleteUser(userId, { confirmed: true });
      }
      
      // Refresh the user list
      await fetchUsers();
      
      // Clear selection if user was selected
      setSelectedUserIds(prev => prev.filter(id => id !== userId));
    } catch (err: any) {
      setError(err.message || `Failed to ${action} user`);
    }
  };

  const handleBulkAction = async (action: 'suspend', userIds: string[], reason?: string) => {
    try {
      await adminService.bulkSuspendUsers({
        userIds,
        confirmed: true,
        reason,
      });
      
      // Refresh the user list
      await fetchUsers();
      
      // Clear selection
      setSelectedUserIds([]);
    } catch (err: any) {
      setError(err.message || 'Failed to perform bulk action');
    }
  };

  if (loading && !users) {
    return (
      <AdminRoute>
        <div className="container mx-auto px-4 py-8">
          <Loading />
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            User Management
          </h1>
          <p className="text-secondary-600">
            Manage user accounts, roles, and permissions.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-secondary-200">
          <div className="p-6 border-b border-secondary-200">
            <UserSearchFilters
              onSearch={handleSearch}
              loading={loading}
            />
          </div>

          {selectedUserIds.length > 0 && (
            <div className="p-4 bg-secondary-50 border-b border-secondary-200">
              <BulkUserActions
                selectedCount={selectedUserIds.length}
                onBulkAction={handleBulkAction}
                selectedUserIds={selectedUserIds}
                onClearSelection={() => setSelectedUserIds([])}
              />
            </div>
          )}

          <div className="overflow-x-auto">
            {users && (
              <UserListTable
                users={users.data}
                selectedUserIds={selectedUserIds}
                onUserSelect={handleUserSelect}
                onSelectAll={handleSelectAll}
                onUserAction={handleUserAction}
                onViewUser={setSelectedUser}
                loading={loading}
              />
            )}
          </div>

          {users && users.totalPages > 1 && (
            <div className="p-6 border-t border-secondary-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-secondary-600">
                  Showing {((users.page - 1) * users.limit) + 1} to {Math.min(users.page * users.limit, users.total)} of {users.total} users
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(users.page - 1)}
                    disabled={users.page <= 1}
                    className="px-3 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-md hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, users.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, users.page - 2) + i;
                      if (pageNum > users.totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            pageNum === users.page
                              ? 'bg-primary-600 text-white'
                              : 'text-secondary-700 bg-white border border-secondary-300 hover:bg-secondary-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(users.page + 1)}
                    disabled={users.page >= users.totalPages}
                    className="px-3 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-md hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedUser && (
          <UserDetailModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onUserAction={handleUserAction}
            onUserUpdated={fetchUsers}
          />
        )}
      </div>
    </AdminRoute>
  );
}