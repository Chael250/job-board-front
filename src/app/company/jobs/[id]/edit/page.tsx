'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CompanyRoute } from '@/components/auth/protected-route';
import { JobForm } from '@/components/jobs/job-form';
import { JobService } from '@/services/job.service';
import { Job, UpdateJobData } from '@/types/job';

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingJob, setIsLoadingJob] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobData = await JobService.getJobById(jobId);
        setJob(jobData);
      } catch (err: any) {
        console.error('Error fetching job:', err);
        setError('Failed to load job details. Please try again.');
      } finally {
        setIsLoadingJob(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const handleSubmit = async (jobData: UpdateJobData) => {
    setIsLoading(true);
    setError(null);

    try {
      await JobService.updateJob(jobId, jobData);
      router.push('/company/jobs');
    } catch (err: any) {
      console.error('Error updating job:', err);
      setError(err.response?.data?.error?.message || 'Failed to update job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/company/jobs');
  };

  if (isLoadingJob) {
    return (
      <CompanyRoute>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <div className="space-y-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CompanyRoute>
    );
  }

  if (error && !job) {
    return (
      <CompanyRoute>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-red-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading job</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/company/jobs')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Back to Jobs
              </button>
            </div>
          </div>
        </div>
      </CompanyRoute>
    );
  }

  return (
    <CompanyRoute>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Job</h1>
          <p className="text-gray-600">
            Update your job listing details.
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

        {job && (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <JobForm
              job={job}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </CompanyRoute>
  );
}