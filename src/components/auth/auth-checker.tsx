'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { Loading } from '@/components/ui/loading';

interface AuthCheckerProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLoading?: boolean;
}

/**
 * Component that ensures authentication state is properly initialized
 * before rendering children. Useful for preventing flash of unauthenticated content.
 */
export function AuthChecker({ 
  children, 
  fallback,
  showLoading = true 
}: AuthCheckerProps) {
  const { isLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // Add a small delay to prevent flash
      const timer = setTimeout(() => {
        setIsInitialized(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading || !isInitialized) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-secondary-50">
          <div className="text-center">
            <Loading size="lg" />
            <p className="mt-4 text-secondary-600">Initializing...</p>
          </div>
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
}

/**
 * Higher-order component version of AuthChecker
 */
export function withAuthChecker<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<AuthCheckerProps, 'children'> = {}
) {
  return function AuthCheckedComponent(props: P) {
    return (
      <AuthChecker {...options}>
        <Component {...props} />
      </AuthChecker>
    );
  };
}