'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth.context';
import { UserRole } from '@/types/auth';

interface UseProtectedRouteOptions {
  requiredRole?: UserRole;
  redirectTo?: string;
}

export function useProtectedRoute(options: UseProtectedRouteOptions = {}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const { requiredRole, redirectTo = '/auth/login' } = options;

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      // Redirect based on user role
      switch (user?.role) {
        case UserRole.ADMIN:
          router.push('/admin/dashboard');
          break;
        case UserRole.COMPANY:
          router.push('/company/dashboard');
          break;
        case UserRole.JOB_SEEKER:
          router.push('/dashboard');
          break;
        default:
          router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, redirectTo, router]);

  return {
    isAuthenticated,
    isLoading,
    user,
    hasRequiredRole: !requiredRole || user?.role === requiredRole,
  };
}