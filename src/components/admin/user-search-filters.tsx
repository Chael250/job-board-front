'use client';

import React, { useState } from 'react';
import { UserRole } from '@/types';
import { UserSearchParams } from '@/services/admin.service';

interface UserSearchFiltersProps {
  onSearch: (params: Partial<UserSearchParams>) => void;
  loading?: boolean;
}

export function UserSearchFilters({ onSearch, loading }: UserSearchFiltersProps) {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [isActive, setIsActive] = useState<boolean | ''>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'email' | 'role'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params: Partial<UserSearchParams> = {
      search: search.trim() || undefined,
      role: role || undefined,
      isActive: isActive === '' ? undefined : isActive,
      sortBy,
      sortOrder,
    };

    onSearch(params);
  };

  const handleReset = () => {
    setSearch('');
    setRole('');
    setIsActive('');
    setSortBy('createdAt');
    setSortOrder('DESC');
    
    onSearch({
      search: undefined,
      role: undefined,
      isActive: undefined,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-secondary-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Email, name, or company..."
            className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-secondary-700 mb-1">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole | '')}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Roles</option>
            <option value={UserRole.ADMIN}>Admin</option>
            <option value={UserRole.COMPANY}>Company</option>
            <option value={UserRole.JOB_SEEKER}>Job Seeker</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-secondary-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={isActive === '' ? '' : isActive.toString()}
            onChange={(e) => setIsActive(e.target.value === '' ? '' : e.target.value === 'true')}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Suspended</option>
          </select>
        </div>

        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-secondary-700 mb-1">
            Sort By
          </label>
          <div className="flex space-x-2">
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'email' | 'role')}
              className="flex-1 px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="createdAt">Created Date</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'ASC' | 'DESC')}
              className="px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="DESC">Desc</option>
              <option value="ASC">Asc</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        
        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="px-4 py-2 bg-secondary-100 text-secondary-700 text-sm font-medium rounded-md hover:bg-secondary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
      </div>
    </form>
  );
}