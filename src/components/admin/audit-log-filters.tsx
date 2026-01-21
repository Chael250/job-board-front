'use client';

import React, { useState } from 'react';
import { AuditLogFilters as AuditLogFiltersType } from '@/services/admin.service';

interface AuditLogFiltersProps {
  onSearch: (params: Partial<AuditLogFiltersType>) => void;
  loading?: boolean;
}

export function AuditLogFilters({ onSearch, loading }: AuditLogFiltersProps) {
  const [userId, setUserId] = useState('');
  const [action, setAction] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params: Partial<AuditLogFiltersType> = {
      userId: userId.trim() || undefined,
      action: action || undefined,
      resourceType: resourceType || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    onSearch(params);
  };

  const handleReset = () => {
    setUserId('');
    setAction('');
    setResourceType('');
    setStartDate('');
    setEndDate('');
    
    onSearch({
      userId: undefined,
      action: undefined,
      resourceType: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  const handleQuickFilter = (filter: 'today' | 'week' | 'month') => {
    const now = new Date();
    let start = new Date();
    
    switch (filter) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
    }
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(now.toISOString().split('T')[0]);
    
    onSearch({
      startDate: start.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-secondary-700 mb-1">
              User ID
            </label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID..."
              className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label htmlFor="action" className="block text-sm font-medium text-secondary-700 mb-1">
              Action
            </label>
            <select
              id="action"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Actions</option>
              <option value="USER_LOGIN">User Login</option>
              <option value="USER_LOGOUT">User Logout</option>
              <option value="USER_REGISTER">User Register</option>
              <option value="USER_SUSPENDED">User Suspended</option>
              <option value="USER_ACTIVATED">User Activated</option>
              <option value="USER_DELETED">User Deleted</option>
              <option value="JOB_CREATED">Job Created</option>
              <option value="JOB_UPDATED">Job Updated</option>
              <option value="JOB_DELETED">Job Deleted</option>
              <option value="JOB_MODERATED">Job Moderated</option>
              <option value="APPLICATION_CREATED">Application Created</option>
              <option value="APPLICATION_UPDATED">Application Updated</option>
              <option value="ADMIN_ACCESS">Admin Access</option>
              <option value="BULK_OPERATION">Bulk Operation</option>
              <option value="SECURITY_EVENT">Security Event</option>
            </select>
          </div>

          <div>
            <label htmlFor="resourceType" className="block text-sm font-medium text-secondary-700 mb-1">
              Resource Type
            </label>
            <select
              id="resourceType"
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Resources</option>
              <option value="USER">User</option>
              <option value="JOB">Job</option>
              <option value="APPLICATION">Application</option>
              <option value="FILE">File</option>
              <option value="SYSTEM">System</option>
            </select>
          </div>

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-secondary-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-secondary-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-secondary-700">Quick filters:</span>
            <button
              type="button"
              onClick={() => handleQuickFilter('today')}
              className="px-2 py-1 text-xs bg-secondary-100 text-secondary-700 rounded hover:bg-secondary-200"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleQuickFilter('week')}
              className="px-2 py-1 text-xs bg-secondary-100 text-secondary-700 rounded hover:bg-secondary-200"
            >
              Last 7 days
            </button>
            <button
              type="button"
              onClick={() => handleQuickFilter('month')}
              className="px-2 py-1 text-xs bg-secondary-100 text-secondary-700 rounded hover:bg-secondary-200"
            >
              Last 30 days
            </button>
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
        </div>
      </form>
    </div>
  );
}