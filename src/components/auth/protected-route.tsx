'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth.context';
import { UserRole } from '@/types/auth';
import { getDashboardRoute } from '@/lib/auth-utils';
import { Loading } from '@/components/ui/loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole,
  allowedRoles,
  redirectTo,
  fallback,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated || !user) {
      const loginUrl = redirectTo || '/auth/login';
      router.push(loginUrl);
      return;
    }

    // Check role requirements
    const hasRequiredRole = requiredRole ? user.role === requiredRole : true;
    const hasAllowedRole = allowedRoles ? allowedRoles.includes(user.role) : true;

    if (!hasRequiredRole || !hasAllowedRole) {
      // Redirect to appropriate dashboard based on user role
      const dashboardRoute = getDashboardRoute(user);
      router.push(dashboardRoute);
      return;
    }
  }, [isAuthenticated, isLoading, user, requiredRole, allowedRoles, redirectTo, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <Loading size="lg" />
          <p className="mt-4 text-secondary-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <p className="text-secondary-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check role requirements
  const hasRequiredRole = requiredRole ? user.role === requiredRole : true;
  const hasAllowedRole = allowedRoles ? allowedRoles.includes(user.role) : true;

  if (!hasRequiredRole || !hasAllowedRole) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <p className="text-secondary-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// HOC version for easier use
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Specific role-based wrappers
export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN} {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function CompanyRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole={UserRole.COMPANY} {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function JobSeekerRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole={UserRole.JOB_SEEKER} {...props}>
      {children}
    </ProtectedRoute>
  );
}

// Multi-role wrapper
export function AuthenticatedRoute({ children, ...props }: Omit<ProtectedRouteProps, 'allowedRoles'>) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.COMPANY, UserRole.JOB_SEEKER]} {...props}>
      {children}
    </ProtectedRoute>
  );
}