'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth.context';
import { UserRole } from '@/types/auth';
import { getUserDisplayName, formatUserRole } from '@/lib/auth-utils';
import { Loading } from '@/components/ui/loading';
import { useFocusManagement, useKeyboardNavigation } from '@/hooks/use-accessibility';

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
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const { trapFocus, restoreFocus } = useFocusManagement();
  const { isTabbing } = useKeyboardNavigation();

  // Handle mobile menu focus management
  useEffect(() => {
    if (isMobileMenuOpen && mobileMenuRef.current) {
      const cleanup = trapFocus(mobileMenuRef.current);
      return cleanup;
    }
  }, [isMobileMenuOpen, trapFocus]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        if (mobileMenuButtonRef.current) {
          restoreFocus(mobileMenuButtonRef.current);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen, restoreFocus]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !mobileMenuButtonRef.current?.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    if (mobileMenuButtonRef.current) {
      restoreFocus(mobileMenuButtonRef.current);
    }
  };

  const visibleNavItems = getVisibleNavItems();

  return (
    <nav 
      className="bg-white shadow-sm border-b border-secondary-200" 
      role="navigation" 
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md"
            aria-label="Job Board - Go to homepage"
          >
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg" aria-hidden="true">J</span>
            </div>
            <span className="text-xl font-bold text-secondary-900">Job Board</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8" role="menubar">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  isActiveRoute(item.href, item.exact)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                }`}
                aria-current={isActiveRoute(item.href, item.exact) ? 'page' : undefined}
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
                  className="bg-secondary-100 hover:bg-secondary-200 text-secondary-800 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
                  aria-label="Sign out of your account"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="text-secondary-600 hover:text-secondary-900 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              ref={mobileMenuButtonRef}
              onClick={toggleMobileMenu}
              className="text-secondary-600 hover:text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md p-2"
              aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
          <div 
            ref={mobileMenuRef}
            id="mobile-menu"
            className="md:hidden border-t border-secondary-200 py-4"
            role="menu"
            aria-label="Mobile navigation menu"
          >
            <div className="space-y-2" role="none">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  role="menuitem"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    isActiveRoute(item.href, item.exact)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
                  }`}
                  aria-current={isActiveRoute(item.href, item.exact) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile User Menu */}
            <div className="mt-4 pt-4 border-t border-secondary-200" role="none">
              {isLoading ? (
                <div className="px-3 py-2">
                  <Loading size="sm" />
                </div>
              ) : isAuthenticated && user ? (
                <div className="space-y-2" role="none">
                  <div className="px-3 py-2" role="none">
                    <p className="text-base font-medium text-secondary-900">
                      {getUserDisplayName(user)}
                    </p>
                    <p className="text-sm text-secondary-600">
                      {formatUserRole(user.role)}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    role="menuitem"
                    className="block w-full text-left px-3 py-2 text-base font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label="Sign out of your account"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2" role="none">
                  <Link
                    href="/auth/login"
                    onClick={closeMobileMenu}
                    role="menuitem"
                    className="block px-3 py-2 text-base font-medium text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={closeMobileMenu}
                    role="menuitem"
                    className="block px-3 py-2 text-base font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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