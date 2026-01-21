'use client';

import React, { useState } from 'react';
import { JobFilters } from '@/services/admin.service';

interface JobSearchFiltersProps {
  onSearch: (params: Partial<JobFilters>) => void;
  loading?: boolean;
}

export function JobSearchFilters({ onSearch, loading }: JobSearchFiltersProps) {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean | ''>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'title' | 'location'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params: Partial<JobFilters> = {
      search: search.trim() || undefined,
      location: location.trim() || undefined,
      employmentType: employmentType || undefined,
      isActive: isActive === '' ? undefined : isActive,
      sortBy,
      sortOrder,
    };

    onSearch(params);
  };

  const handleReset = () => {
    setSearch('');
    setLocation('');
    setEmploymentType('');
    setIsActive('');
    setSortBy('createdAt');
    setSortOrder('DESC');
    
    onSearch({
      search: undefined,
      location: undefined,
      employmentType: undefined,
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
            placeholder="Job title, description, or company..."
            className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-secondary-700 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, state, or remote..."
            className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label htmlFor="employmentType" className="block text-sm font-medium text-secondary-700 mb-1">
            Employment Type
          </label>
          <select
            id="employmentType"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Types</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
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
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-secondary-700 mb-1">
              Sort By
            </label>
            <div className="flex space-x-2">
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'title' | 'location')}
                className="px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="createdAt">Created Date</option>
                <option value="title">Job Title</option>
                <option value="location">Location</option>
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

        <div className="flex items-end space-x-3">
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
      </div>
    </form>
  );
}