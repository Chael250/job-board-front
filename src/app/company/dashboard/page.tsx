'use client';

import React from 'react';
import Link from 'next/link';
import { CompanyRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/contexts/auth.context';
import { getUserDisplayName } from '@/lib/auth-utils';

export default function CompanyDashboard() {
  const { user } = useAuth();

  return (
    <CompanyRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Welcome, {user ? getUserDisplayName(user) : 'Company'}!
          </h1>
          <p className="text-secondary-600">
            Manage your job postings and review applications.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              Post a Job
            </h3>
            <p className="text-secondary-600 mb-4">
              Create a new job listing to attract candidates.
            </p>
            <Link
              href="/company/jobs/create"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Create Job
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              My Jobs
            </h3>
            <p className="text-secondary-600 mb-4">
              View and manage your active job listings.
            </p>
            <Link
              href="/company/jobs"
              className="inline-block bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              View Jobs
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              Applications
            </h3>
            <p className="text-secondary-600 mb-4">
              Review applications from job seekers.
            </p>
            <Link
              href="/company/applications"
              className="inline-block bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Review Applications
            </Link>
          </div>
        </div>
      </div>
    </CompanyRoute>
  );
}