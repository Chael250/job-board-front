'use client';

import React, { useState } from 'react';

interface BulkJobActionsProps {
  selectedCount: number;
  selectedJobIds: string[];
  onBulkAction: (action: 'activate' | 'deactivate', jobIds: string[], reason?: string) => void;
  onClearSelection: () => void;
}

export function BulkJobActions({ 
  selectedCount, 
  selectedJobIds, 
  onBulkAction, 
  onClearSelection 
}: BulkJobActionsProps) {
  const [showConfirmation, setShowConfirmation] = useState<'activate' | 'deactivate' | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBulkAction = (action: 'activate' | 'deactivate') => {
    setShowConfirmation(action);
  };

  const handleConfirmedAction = async () => {
    if (!showConfirmation) return;
    
    try {
      setLoading(true);
      await onBulkAction(showConfirmation, selectedJobIds, reason);
      setShowConfirmation(null);
      setReason('');
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(null);
    setReason('');
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-secondary-700">
            {selectedCount} job{selectedCount !== 1 ? 's' : ''} selected
          </span>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleBulkAction('activate')}
              disabled={selectedCount === 0}
              className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Activate Selected
            </button>
            
            <button
              onClick={() => handleBulkAction('deactivate')}
              disabled={selectedCount === 0}
              className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Deactivate Selected
            </button>
          </div>
        </div>
        
        <button
          onClick={onClearSelection}
          className="text-sm text-secondary-600 hover:text-secondary-800"
        >
          Clear Selection
        </button>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-secondary-900 mb-4">
              Confirm Bulk {showConfirmation === 'activate' ? 'Activation' : 'Deactivation'}
            </h3>
            <p className="text-sm text-secondary-600 mb-4">
              Are you sure you want to {showConfirmation} {selectedCount} job{selectedCount !== 1 ? 's' : ''}? 
              {showConfirmation === 'deactivate' && ' This will make them unavailable to job seekers.'}
              {showConfirmation === 'activate' && ' This will make them visible to job seekers.'}
            </p>
            
            <div className="mb-4">
              <label htmlFor="bulk-reason" className="block text-sm font-medium text-secondary-700 mb-1">
                Reason (optional)
              </label>
              <textarea
                id="bulk-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder={`Enter reason for bulk ${showConfirmation}...`}
              />
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 bg-secondary-100 text-secondary-700 text-sm font-medium rounded-md hover:bg-secondary-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmedAction}
                disabled={loading}
                className={`px-4 py-2 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  showConfirmation === 'activate'
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                }`}
              >
                {loading 
                  ? `${showConfirmation === 'activate' ? 'Activating' : 'Deactivating'}...` 
                  : `${showConfirmation === 'activate' ? 'Activate' : 'Deactivate'} ${selectedCount} Job${selectedCount !== 1 ? 's' : ''}`
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}