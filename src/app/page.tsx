'use client';

import { AuthStatus } from '@/components/auth/auth-status';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-900 mb-6">
            Find Your Dream Job
          </h1>
          <p className="text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
            Connect with top companies and discover opportunities that match your skills and aspirations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Browse Jobs
            </button>
            <button className="border border-primary-600 text-primary-600 hover:bg-primary-50 px-8 py-3 rounded-lg font-semibold transition-colors">
              Post a Job
            </button>
          </div>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary-200">
            <h3 className="text-xl font-semibold text-secondary-900 mb-3">
              For Job Seekers
            </h3>
            <p className="text-secondary-600">
              Browse thousands of job opportunities from top companies and apply with just a few clicks.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary-200">
            <h3 className="text-xl font-semibold text-secondary-900 mb-3">
              For Companies
            </h3>
            <p className="text-secondary-600">
              Post job listings, review applications, and find the perfect candidates for your team.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary-200">
            <h3 className="text-xl font-semibold text-secondary-900 mb-3">
              Secure & Reliable
            </h3>
            <p className="text-secondary-600">
              Your data is protected with enterprise-grade security and privacy measures.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}