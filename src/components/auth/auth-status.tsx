'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth.context';
import { getUserDisplayName, formatUserRole } from '@/lib/auth-utils';
import { Loading } from '@/components/ui/loading';

export function AuthStatus() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return <Loading size="sm" />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-secondary-600">Not authenticated</span>
        <a
          href="/auth/login"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="text-right">
        <p className="font-medium text-secondary-900">
          {getUserDisplayName(user)}
        </p>
        <p className="text-sm text-secondary-600">
          {formatUserRole(user.role)}
        </p>
      </div>
      <button
        onClick={logout}
        className="bg-secondary-200 hover:bg-secondary-300 text-secondary-800 px-4 py-2 rounded-lg font-medium transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}