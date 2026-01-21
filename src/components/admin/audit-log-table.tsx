'use client';

import React, { useState } from 'react';
import { AuditLog } from '@/services/admin.service';

interface AuditLogTableProps {
  auditLogs: AuditLog[];
  loading?: boolean;
}

export function AuditLogTable({ auditLogs, loading }: AuditLogTableProps) {
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('LOGIN') || action.includes('REGISTER')) {
      return 'bg-green-100 text-green-800';
    }
    if (action.includes('SUSPENDED') || action.includes('DELETED') || action.includes('SECURITY')) {
      return 'bg-red-100 text-red-800';
    }
    if (action.includes('CREATED') || action.includes('ACTIVATED')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (action.includes('UPDATED') || action.includes('MODERATED')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (action.includes('ADMIN')) {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-secondary-100 text-secondary-800';
  };

  const getResourceTypeBadgeColor = (resourceType: string) => {
    switch (resourceType) {
      case 'USER':
        return 'bg-blue-100 text-blue-800';
      case 'JOB':
        return 'bg-green-100 text-green-800';
      case 'APPLICATION':
        return 'bg-yellow-100 text-yellow-800';
      case 'FILE':
        return 'bg-purple-100 text-purple-800';
      case 'SYSTEM':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const toggleExpanded = (logId: string) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="mt-2 text-secondary-600">Loading audit logs...</p>
      </div>
    );
  }

  if (auditLogs.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-secondary-600">No audit logs found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-secondary-200">
        <thead className="bg-secondary-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Timestamp
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Action
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Resource
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
              IP Address
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Details
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-secondary-200">
          {auditLogs.map((log) => (
            <React.Fragment key={log.id}>
              <tr className="hover:bg-secondary-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                  {formatDate(log.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {log.user ? (
                    <div>
                      <div className="text-sm font-medium text-secondary-900">
                        {log.user.profile.firstName} {log.user.profile.lastName}
                      </div>
                      <div className="text-sm text-secondary-500">
                        {log.user.email}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-secondary-500">
                      System
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionBadgeColor(log.action)}`}>
                    {formatAction(log.action)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getResourceTypeBadgeColor(log.resourceType)}`}>
                      {log.resourceType}
                    </span>
                    {log.resourceId && (
                      <span className="text-xs text-secondary-500 font-mono">
                        {log.resourceId.substring(0, 8)}...
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 font-mono">
                  {log.ipAddress || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                  {log.details && Object.keys(log.details).length > 0 ? (
                    <button
                      onClick={() => toggleExpanded(log.id)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      {expandedLog === log.id ? 'Hide' : 'Show'} Details
                    </button>
                  ) : (
                    <span className="text-secondary-400">No details</span>
                  )}
                </td>
              </tr>
              
              {expandedLog === log.id && log.details && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 bg-secondary-50">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-secondary-900">Event Details</h4>
                      <div className="bg-white rounded border p-3">
                        <pre className="text-xs text-secondary-700 whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                      
                      {log.userAgent && (
                        <div>
                          <h5 className="text-xs font-medium text-secondary-700 mb-1">User Agent</h5>
                          <p className="text-xs text-secondary-600 bg-white rounded border p-2 font-mono">
                            {log.userAgent}
                          </p>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}