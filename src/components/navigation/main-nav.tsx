'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth.context';
import { UserRole } from '@/types/auth';
import { getUserDisplayName, formatUserRole } from '@/lib/auth-utils';
import { Loading } from '@/components/ui/loading';

interface NavItem {
  label: string;
  href: string;
  roles?: UserRole[];
  exact?: boolean;
}

const navigationItems: NavItem[] = [
  { label: 'Home', href: '/', exact: true },
  { label: 'Browse Jobs', href: '/jobs' },
  { label: 'Dashboard', href: '/dashboard', roles: [UserRole.JOB_SEEKER] },
  { label: 'My Applications', href: '/applications', roles: [UserRole.JOB_SEEKER] },
  { label: 'Company Dashboard', href: '/company/dashboard', roles: [UserRole.COMPANY] },
  { label: 'My Jobs', href: '/company/jobs', roles: [UserRole.COMPANY] },
  { label: 'Applications', href: '/company/applications', roles: [UserRole.COMPANY] },
  { label: 'Admin Dashboard', href: '/admin/dashboard', roles: [UserRole.ADMIN] },
  { label: 'User Management', href: '/admin/users', roles: [UserRole.ADMIN] },
  { label: 'Job Moderation', href: '/admin/jobs', roles: [UserRole.ADMIN] },
];

export function MainNavigation() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getVisibleNavItems = (): NavItem[] => {
    if (!isAuthenticated || !user) {
      return navigationItems.filter(item => !item.roles);
    }

    return navigationItems.filter(item => 
      !item.roles || item.roles.includes(user.role)
    );
  };

  const isActiveRoute = (href: string, exact?: boolean): boolean => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  const visibleNavItems = getVisibleNavItems();

  return (
    <nav className="bg-white shadow-sm border-b border-secondary-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <span className="text-xl font-bold text-secondary-900">Job Board</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActiveRoute(item.href, item.exact)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              <Loading size="sm" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-secondary-900">
                    {getUserDisplayName(user)}
                  </p>
                  <p className="text-xs text-secondary-600">
                    {formatUserRole(user.role)}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-secondary-100 hover:bg-secondary-200 text-secondary-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="text-secondary-600 hover:text-secondary-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-secondary-600 hover:text-secondary-900 focus:outline-none focus:text-secondary-900 p-2"
              aria-label="Toggle mobile menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-secondary-200 py-4">
            <div className="space-y-2">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActiveRoute(item.href, item.exact)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile User Menu */}
            <div className="mt-4 pt-4 border-t border-secondary-200">
              {isLoading ? (
                <div className="px-3 py-2">
                  <Loading size="sm" />
                </div>
              ) : isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="px-3 py-2">
                    <p className="text-base font-medium text-secondary-900">
                      {getUserDisplayName(user)}
                    </p>
                    <p className="text-sm text-secondary-600">
                      {formatUserRole(user.role)}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-md transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-md transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}