'use client';

import React from 'react';
import { JobSeekerRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/contexts/auth.context';
import { getUserDisplayName } from '@/lib/auth-utils';

export default function JobSeekerDashboard() {
  const { user } = useAuth();

  return (
    <JobSeekerRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Welcome back, {user ? getUserDisplayName(user) : 'Job Seeker'}!
          </h1>
          <p className="text-secondary-600">
            Find your next opportunity and track your applications.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              Browse Jobs
            </h3>
            <p className="text-secondary-600 mb-4">
              Discover new job opportunities that match your skills.
            </p>
            <a 
              href="/jobs"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              View Jobs
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              My Applications
            </h3>
            <p className="text-secondary-600 mb-4">
              Track the status of your job applications.
            </p>
            <a 
              href="/applications"
              className="inline-block bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              View Applications
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              Profile
            </h3>
            <p className="text-secondary-600 mb-4">
              Update your profile and upload your resume.
            </p>
            <button className="bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </JobSeekerRoute>
  );
}