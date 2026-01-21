'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { JobService } from '@/services/job.service';
import { ApplicationService } from '@/services/application.service';
import { Job, EmploymentType, CreateApplicationData } from '@/types';
import { useAuth } from '@/contexts/auth.context';

interface JobDetailsPageState {
  job: Job | null;
  loading: boolean;
  error: string | null;
  applying: boolean;
  hasApplied: boolean;
  checkingApplication: boolean;
  showApplicationForm: boolean;
  applicationData: {
    coverLetter: string;
    resumeUrl: string;
  };
}

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const jobId = params.id as string;

  const [state, setState] = useState<JobDetailsPageState>({
    job: null,
    loading: true,
    error: null,
    applying: false,
    hasApplied: false,
    checkingApplication: false,
    showApplicationForm: false,
    applicationData: {
      coverLetter: '',
      resumeUrl: '',
    },
  });

  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'job_seeker' && jobId) {
      checkExistingApplication();
    }
  }, [isAuthenticated, user, jobId]);

  const loadJob = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const job = await JobService.getJobById(jobId);
      setState(prev => ({ ...prev, job, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to load job details. Please try again.',
        loading: false,
      }));
    }
  };

  const checkExistingApplication = async () => {
    setState(prev => ({ ...prev, checkingApplication: true }));
    
    try {
      const hasApplied = await ApplicationService.checkExistingApplication(jobId);
      setState(prev => ({ ...prev, hasApplied, checkingApplication: false }));
    } catch (error) {
      setState(prev => ({ ...prev, checkingApplication: false }));
    }
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'job_seeker') {
      alert('Only job seekers can apply for jobs.');
      return;
    }

    setState(prev => ({ ...prev, showApplicationForm: true }));
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setState(prev => ({ ...prev, applying: true }));

    try {
      const applicationData: CreateApplicationData = {
        jobId,
        coverLetter: state.applicationData.coverLetter.trim() || undefined,
        resumeUrl: state.applicationData.resumeUrl.trim() || undefined,
      };

      await ApplicationService.submitApplication(applicationData);
      
      setState(prev => ({
        ...prev,
        applying: false,
        hasApplied: true,
        showApplicationForm: false,
        applicationData: { coverLetter: '', resumeUrl: '' },
      }));

      alert('Application submitted successfully!');
    } catch (error: any) {
      setState(prev => ({ ...prev, applying: false }));
      
      const errorMessage = error?.message || 'Failed to submit application. Please try again.';
      alert(errorMessage);
    }
  };

  const formatSalary = (min?: number, max?: number, currency: string = 'USD') => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${currency} ${min.toLocaleString()}+`;
    if (max) return `Up to ${currency} ${max.toLocaleString()}`;
    return 'Salary not specified';
  };

  const formatEmploymentType = (type: EmploymentType) => {
    const typeMap = {
      [EmploymentType.FULL_TIME]: 'Full Time',
      [EmploymentType.PART_TIME]: 'Part Time',
      [EmploymentType.CONTRACT]: 'Contract',
      [EmploymentType.INTERNSHIP]: 'Internship',
    };
    return typeMap[type] || type;
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading job details...</span>
      </div>
    );
  }

  if (state.error || !state.job) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <p className="text-red-600 mb-4">{state.error || 'Job not found'}</p>
          <button
            onClick={() => router.push('/jobs')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const { job } = state;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Jobs
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {/* Job Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
                <div className="flex flex-wrap gap-6 text-gray-600">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                    </svg>
                    {job.company?.profile?.companyName || 'Company Name'}
                  </div>
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V8m8 0V6a2 2 0 00-2-2H10a2 2 0 00-2 2v2" />
                    </svg>
                    {formatEmploymentType(job.employmentType)}
                  </div>
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                  <span className="text-sm text-gray-500">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Job Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
                <div className="prose max-w-none text-gray-700">
                  {job.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              {job.requirements && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                  <div className="prose max-w-none text-gray-700">
                    {job.requirements.split('\n').map((requirement, index) => (
                      <p key={index} className="mb-4">
                        {requirement}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Apply for this job</h3>
              
              {state.checkingApplication ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : state.hasApplied ? (
                <div className="text-center py-4">
                  <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-4">
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Application Submitted
                  </div>
                  <p className="text-gray-600 mb-4">
                    You have already applied for this position. You can track your application status in your dashboard.
                  </p>
                  <a
                    href="/applications"
                    className="inline-block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View My Applications
                  </a>
                </div>
              ) : !state.showApplicationForm ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-6">
                    Ready to take the next step in your career? Apply now and let your skills shine.
                  </p>
                  <button
                    onClick={handleApplyClick}
                    className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Apply Now
                  </button>
                  {!isAuthenticated && (
                    <p className="text-sm text-gray-500 mt-2">
                      You'll need to sign in to apply for this job.
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleApplicationSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter (Optional)
                    </label>
                    <textarea
                      value={state.applicationData.coverLetter}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        applicationData: { ...prev.applicationData, coverLetter: e.target.value }
                      }))}
                      placeholder="Tell us why you're interested in this position..."
                      rows={6}
                      maxLength={2000}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {state.applicationData.coverLetter.length}/2000 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resume URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={state.applicationData.resumeUrl}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        applicationData: { ...prev.applicationData, resumeUrl: e.target.value }
                      }))}
                      placeholder="https://example.com/my-resume.pdf"
                      maxLength={500}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Link to your online resume or portfolio
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setState(prev => ({ ...prev, showApplicationForm: false }))}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={state.applying}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {state.applying ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              )}

              {/* Company Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">About the Company</h4>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{job.company?.profile?.companyName || 'Company Name'}</p>
                  {job.company?.profile?.companyDescription && (
                    <p className="mt-2">{job.company.profile.companyDescription}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}