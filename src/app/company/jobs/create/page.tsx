'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CompanyRoute } from '@/components/auth/protected-route';
import { JobForm } from '@/components/jobs/job-form';
import { JobService } from '@/services/job.service';
import { CreateJobData } from '@/types/job';

export default function CreateJobPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (jobData: CreateJobData) => {
    setIsLoading(true);
    setError(null);

    try {
      await JobService.createJob(jobData);
      router.push('/company/jobs');
    } catch (err: any) {
      console.error('Error creating job:', err);
      setError(err.response?.data?.error?.message || 'Failed to create job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/company/jobs');
  };

  return (
    <CompanyRoute>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Job</h1>
          <p className="text-gray-600">
            Post a new job listing to attract qualified candidates.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <JobForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </div>
    </CompanyRoute>
  );
}