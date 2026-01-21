'use client';

import React, { useState, useEffect } from 'react';
import { AdminRoute } from '@/components/auth/protected-route';
import { adminService, AuditLogFilters, PaginatedAuditLogs, AuditLog } from '@/services/admin.service';
import { AuditLogTable } from '@/components/admin/audit-log-table';
import { AuditLogFilters as AuditLogFiltersComponent } from '@/components/admin/audit-log-filters';
import { Loading } from '@/components/ui/loading';

export default function AdminAuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<PaginatedAuditLogs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<AuditLogFilters>({
    page: 1,
    limit: 20,
  });

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminService.getAuditLogs(searchParams);
      setAuditLogs(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [searchParams]);

  const handleSearch = (newParams: Partial<AuditLogFilters>) => {
    setSearchParams(prev => ({
      ...prev,
      ...newParams,
      page: 1, // Reset to first page on new search
    }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
  };

  if (loading && !auditLogs) {
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
            Audit Logs
          </h1>
          <p className="text-secondary-600">
            View system audit logs and security events for compliance and monitoring.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-secondary-200">
          <div className="p-6 border-b border-secondary-200">
            <AuditLogFiltersComponent
              onSearch={handleSearch}
              loading={loading}
            />
          </div>

          <div className="overflow-x-auto">
            {auditLogs && (
              <AuditLogTable
                auditLogs={auditLogs.data}
                loading={loading}
              />
            )}
          </div>

          {auditLogs && auditLogs.totalPages > 1 && (
            <div className="p-6 border-t border-secondary-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-secondary-600">
                  Showing {((auditLogs.page - 1) * auditLogs.limit) + 1} to {Math.min(auditLogs.page * auditLogs.limit, auditLogs.total)} of {auditLogs.total} logs
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(auditLogs.page - 1)}
                    disabled={auditLogs.page <= 1}
                    className="px-3 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-md hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, auditLogs.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, auditLogs.page - 2) + i;
                      if (pageNum > auditLogs.totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            pageNum === auditLogs.page
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
                    onClick={() => handlePageChange(auditLogs.page + 1)}
                    disabled={auditLogs.page >= auditLogs.totalPages}
                    className="px-3 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-md hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminRoute>
  );
}