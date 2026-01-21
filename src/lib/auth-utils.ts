import { UserRole, User } from '@/types/auth';

/**
 * Check if user has required role
 */
export function hasRole(user: User | null, requiredRole: UserRole): boolean {
  return user?.role === requiredRole;
}

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(user: User | null, requiredRoles: UserRole[]): boolean {
  return user ? requiredRoles.includes(user.role) : false;
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, UserRole.ADMIN);
}

/**
 * Check if user is company
 */
export function isCompany(user: User | null): boolean {
  return hasRole(user, UserRole.COMPANY);
}

/**
 * Check if user is job seeker
 */
export function isJobSeeker(user: User | null): boolean {
  return hasRole(user, UserRole.JOB_SEEKER);
}

/**
 * Get dashboard route based on user role
 */
export function getDashboardRoute(user: User | null): string {
  if (!user) return '/';
  
  switch (user.role) {
    case UserRole.ADMIN:
      return '/admin/dashboard';
    case UserRole.COMPANY:
      return '/company/dashboard';
    case UserRole.JOB_SEEKER:
      return '/dashboard';
    default:
      return '/';
  }
}

/**
 * Get user display name
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest';
  
  const { firstName, lastName, companyName } = user.profile;
  
  if (user.role === UserRole.COMPANY && companyName) {
    return companyName;
  }
  
  return `${firstName} ${lastName}`.trim() || user.email;
}

/**
 * Check if user can access resource
 */
export function canAccessResource(
  user: User | null,
  resourceOwnerId: string,
  allowedRoles: UserRole[] = []
): boolean {
  if (!user) return false;
  
  // Admin can access everything
  if (isAdmin(user)) return true;
  
  // Check if user has required role
  if (allowedRoles.length > 0 && !hasAnyRole(user, allowedRoles)) {
    return false;
  }
  
  // Check if user owns the resource
  return user.id === resourceOwnerId;
}

/**
 * Format user role for display
 */
export function formatUserRole(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return 'Administrator';
    case UserRole.COMPANY:
      return 'Company';
    case UserRole.JOB_SEEKER:
      return 'Job Seeker';
    default:
      return 'Unknown';
  }
}