'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth.context';
import { UserRole } from '@/types/auth';
import { getDashboardRoute } from '@/lib/auth-utils';
import { Loading } from '@/components/ui/loading';

interface AuthRedirectProps {
  /**
   * Where to redirect authenticated users
   * If not provided, will redirect to role-appropriate dashboard
   */
  authenticatedRedirect?: string;
  
  /**
   * Where to redirect unauthenticated users
   */
  unauthenticatedRedirect?: string;
  
  /**
   * Specific roles that should be redirected
   */
  redirectRoles?: UserRole[];
  
  /**
   * Custom redirect logic
   */
  customRedirect?: (user: any, isAuthenticated: boolean) => string | null;
  
  /**
   * Content to show while redirecting
   */
  children?: React.ReactNode;
}

export function AuthRedirect({
  authenticatedRedirect,
  unauthenticatedRedirect = '/auth/login',
  redirectRoles,
  customRedirect,
  children,
}: AuthRedirectProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    let redirectTo: string | null = null;

    // Custom redirect logic takes precedence
    if (customRedirect) {
      redirectTo = customRedirect(user, isAuthenticated);
    } else if (!isAuthenticated) {
      // Redirect unauthenticated users
      redirectTo = unauthenticatedRedirect;
    } else if (isAuthenticated && user) {
      // Handle authenticated users
      if (redirectRoles && redirectRoles.includes(user.role)) {
        // Redirect specific roles
        redirectTo = authenticatedRedirect || getDashboardRoute(user);
      } else if (authenticatedRedirect && !redirectRoles) {
        // Redirect all authenticated users if no role filter
        redirectTo = authenticatedRedirect;
      }
    }

    if (redirectTo) {
      router.push(redirectTo);
    }
  }, [
    isAuthenticated,
    isLoading,
    user,
    authenticatedRedirect,
    unauthenticatedRedirect,
    redirectRoles,
    customRedirect,
    router,
  ]);

  // Show loading or custom content while redirecting
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <Loading size="lg" />
          <p className="mt-4 text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children || (
        <div className="min-h-screen flex items-center justify-center bg-secondary-50">
          <div className="text-center">
            <Loading size="lg" />
            <p className="mt-4 text-secondary-600">Redirecting...</p>
          </div>
        </div>
      )}
    </>
  );
}

// Specific redirect components for common use cases

/**
 * Redirects authenticated users to their dashboard
 * Useful for login/register pages
 */
export function RedirectIfAuthenticated({ children }: { children?: React.ReactNode }) {
  return (
    <AuthRedirect
      customRedirect={(user: any, isAuthenticated: boolean) => {
        if (isAuthenticated && user) {
          return getDashboardRoute(user);
        }
        return null;
      }}
    >
      {children}
    </AuthRedirect>
  );
}

/**
 * Redirects unauthenticated users to login
 * Useful for protected pages
 */
export function RedirectIfUnauthenticated({ 
  redirectTo = '/auth/login',
  children 
}: { 
  redirectTo?: string;
  children?: React.ReactNode;
}) {
  return (
    <AuthRedirect
      unauthenticatedRedirect={redirectTo}
      customRedirect={(user: any, isAuthenticated: boolean) => {
        if (!isAuthenticated) {
          return redirectTo;
        }
        return null;
      }}
    >
      {children}
    </AuthRedirect>
  );
}

/**
 * Redirects users based on their role
 */
export function RoleBasedRedirect({
  roleRedirects,
  defaultRedirect = '/',
  children,
}: {
  roleRedirects: Record<UserRole, string>;
  defaultRedirect?: string;
  children?: React.ReactNode;
}) {
  return (
    <AuthRedirect
      customRedirect={(user: any, isAuthenticated: boolean) => {
        if (isAuthenticated && user && user.role && roleRedirects[user.role as UserRole]) {
          return roleRedirects[user.role as UserRole];
        }
        if (isAuthenticated) {
          return defaultRedirect;
        }
        return '/auth/login';
      }}
    >
      {children}
    </AuthRedirect>
  );
}