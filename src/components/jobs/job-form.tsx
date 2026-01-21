'use client';

import React, { useState } from 'react';
import { Job, CreateJobData, UpdateJobData, EmploymentType } from '@/types/job';

interface JobFormProps {
  job?: Job;
  onSubmit: (data: CreateJobData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function JobForm({ job, onSubmit, onCancel, isLoading = false }: JobFormProps) {
  const [formData, setFormData] = useState<CreateJobData>({
    title: job?.title || '',
    description: job?.description || '',
    requirements: job?.requirements || '',
    location: job?.location || '',
    employmentType: job?.employmentType || EmploymentType.FULL_TIME,
    salaryMin: job?.salaryMin || undefined,
    salaryMax: job?.salaryMax || undefined,
    salaryCurrency: job?.salaryCurrency || 'USD',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5 || formData.title.length > 255) {
      newErrors.title = 'Title must be between 5 and 255 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50 || formData.description.length > 5000) {
      newErrors.description = 'Description must be between 50 and 5000 characters';
    }

    if (formData.requirements && formData.requirements.length > 5000) {
      newErrors.requirements = 'Requirements must not exceed 5000 characters';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (formData.location.length < 2 || formData.location.length > 255) {
      newErrors.location = 'Location must be between 2 and 255 characters';
    }

    if (formData.salaryMin && formData.salaryMax && formData.salaryMin > formData.salaryMax) {
      newErrors.salaryMax = 'Maximum salary must be greater than minimum salary';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting job form:', error);
    }
  };

  const handleInputChange = (field: keyof CreateJobData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Job Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g. Senior Software Engineer"
          disabled={isLoading}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location *
        </label>
        <input
          type="text"
          id="location"
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.location ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g. San Francisco, CA"
          disabled={isLoading}
        />
        {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
      </div>

      <div>
        <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-1">
          Employment Type *
        </label>
        <select
          id="employmentType"
          value={formData.employmentType}
          onChange={(e) => handleInputChange('employmentType', e.target.value as EmploymentType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          disabled={isLoading}
        >
          <option value={EmploymentType.FULL_TIME}>Full Time</option>
          <option value={EmploymentType.PART_TIME}>Part Time</option>
          <option value={EmploymentType.CONTRACT}>Contract</option>
          <option value={EmploymentType.INTERNSHIP}>Internship</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="salaryMin" className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Salary
          </label>
          <input
            type="number"
            id="salaryMin"
            value={formData.salaryMin || ''}
            onChange={(e) => handleInputChange('salaryMin', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="50000"
            min="0"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="salaryMax" className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Salary
          </label>
          <input
            type="number"
            id="salaryMax"
            value={formData.salaryMax || ''}
            onChange={(e) => handleInputChange('salaryMax', e.target.value ? parseInt(e.target.value) : undefined)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.salaryMax ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="100000"
            min="0"
            disabled={isLoading}
          />
          {errors.salaryMax && <p className="mt-1 text-sm text-red-600">{errors.salaryMax}</p>}
        </div>
        <div>
          <label htmlFor="salaryCurrency" className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            id="salaryCurrency"
            value={formData.salaryCurrency}
            onChange={(e) => handleInputChange('salaryCurrency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            disabled={isLoading}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Job Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={6}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Describe the role, responsibilities, and what you're looking for..."
          disabled={isLoading}
        />
        <p className="mt-1 text-sm text-gray-500">
          {formData.description.length}/5000 characters (minimum 50)
        </p>
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      <div>
        <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
          Requirements
        </label>
        <textarea
          id="requirements"
          value={formData.requirements}
          onChange={(e) => handleInputChange('requirements', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            errors.requirements ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="List the skills, experience, and qualifications required..."
          disabled={isLoading}
        />
        <p className="mt-1 text-sm text-gray-500">
          {formData.requirements?.length || 0}/5000 characters
        </p>
        {errors.requirements && <p className="mt-1 text-sm text-red-600">{errors.requirements}</p>}
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : job ? 'Update Job' : 'Create Job'}
        </button>
      </div>
    </form>
  );
}