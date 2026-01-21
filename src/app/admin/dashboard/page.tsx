'use client';

import React from 'react';
import { AdminRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/contexts/auth.context';
import { getUserDisplayName } from '@/lib/auth-utils';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <AdminRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-secondary-600">
            Welcome, {user ? getUserDisplayName(user) : 'Administrator'}. Manage users and moderate content.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              User Management
            </h3>
            <p className="text-secondary-600 mb-4">
              View and manage user accounts and permissions.
            </p>
            <a
              href="/admin/users"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Manage Users
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              Job Moderation
            </h3>
            <p className="text-secondary-600 mb-4">
              Review and moderate job listings for compliance.
            </p>
            <a
              href="/admin/jobs"
              className="inline-block bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Moderate Jobs
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              Audit Logs
            </h3>
            <p className="text-secondary-600 mb-4">
              View system audit logs and security events.
            </p>
            <a
              href="/admin/audit-logs"
              className="inline-block bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              View Logs
            </a>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}