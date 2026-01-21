'use client';

import React, { useState } from 'react';

interface BulkUserActionsProps {
  selectedCount: number;
  selectedUserIds: string[];
  onBulkAction: (action: 'suspend', userIds: string[], reason?: string) => void;
  onClearSelection: () => void;
}

export function BulkUserActions({ 
  selectedCount, 
  selectedUserIds, 
  onBulkAction, 
  onClearSelection 
}: BulkUserActionsProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBulkSuspend = () => {
    setShowConfirmation(true);
  };

  const handleConfirmedAction = async () => {
    try {
      setLoading(true);
      await onBulkAction('suspend', selectedUserIds, reason);
      setShowConfirmation(false);
      setReason('');
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setReason('');
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-secondary-700">
            {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
          </span>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleBulkSuspend}
              disabled={selectedCount === 0}
              className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suspend Selected
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
              Confirm Bulk Suspension
            </h3>
            <p className="text-sm text-secondary-600 mb-4">
              Are you sure you want to suspend {selectedCount} user{selectedCount !== 1 ? 's' : ''}? 
              This action will prevent them from accessing their accounts.
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
                placeholder="Enter reason for bulk suspension..."
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
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Suspending...' : `Suspend ${selectedCount} User${selectedCount !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}