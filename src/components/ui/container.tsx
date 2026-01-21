import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  as?: React.ElementType;
}

export function Container({ 
  children, 
  size = 'lg', 
  className = '', 
  as: Component = 'div' 
}: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <Component className={`mx-auto px-4 sm:px-6 lg:px-8 ${sizeClasses[size]} ${className}`}>
      {children}
    </Component>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  className?: string;
}

export function PageHeader({ 
  title, 
  description, 
  actions, 
  breadcrumbs, 
  className = '' 
}: PageHeaderProps) {
  return (
    <div className={`bg-white border-b border-secondary-200 ${className}`}>
      <Container>
        <div className="py-6 sm:py-8">
          {breadcrumbs && (
            <nav className="mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && (
                      <svg
                        className="w-4 h-4 text-secondary-400 mx-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {crumb.href ? (
                      <a
                        href={crumb.href}
                        className="text-secondary-600 hover:text-secondary-900 transition-colors"
                      >
                        {crumb.label}
                      </a>
                    ) : (
                      <span className="text-secondary-900 font-medium">
                        {crumb.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 truncate">
                {title}
              </h1>
              {description && (
                <p className="mt-2 text-secondary-600 max-w-3xl">
                  {description}
                </p>
              )}
            </div>
            
            {actions && (
              <div className="flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({ 
  children, 
  className = '', 
  padding = 'md', 
  hover = false 
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClasses = hover 
    ? 'hover:shadow-lg transition-shadow duration-200' 
    : '';

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-secondary-200 ${paddingClasses[padding]} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
}

interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Grid({ 
  children, 
  cols = 1, 
  gap = 'md', 
  className = '' 
}: GridProps) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
    12: 'grid-cols-12',
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  return (
    <div className={`grid ${colClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}

interface StackProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  spacing?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  className?: string;
}

export function Stack({ 
  children, 
  direction = 'column', 
  spacing = 'md', 
  align = 'stretch', 
  justify = 'start', 
  className = '' 
}: StackProps) {
  const directionClasses = {
    row: 'flex-row',
    column: 'flex-col',
  };

  const spacingClasses = {
    row: {
      sm: 'space-x-2',
      md: 'space-x-4',
      lg: 'space-x-6',
    },
    column: {
      sm: 'space-y-2',
      md: 'space-y-4',
      lg: 'space-y-6',
    },
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  return (
    <div 
      className={`flex ${directionClasses[direction]} ${spacingClasses[direction][spacing]} ${alignClasses[align]} ${justifyClasses[justify]} ${className}`}
    >
      {children}
    </div>
  );
}