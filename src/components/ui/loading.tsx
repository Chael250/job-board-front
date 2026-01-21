import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  variant?: 'spinner' | 'dots' | 'pulse';
}

export function Loading({ size = 'md', text, className = '', variant = 'spinner' }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const renderSpinner = () => (
    <div
      className={`animate-spin rounded-full border-2 border-primary-200 border-t-primary-600 ${sizeClasses[size]}`}
    />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      <div className={`bg-primary-600 rounded-full animate-bounce ${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'}`} style={{ animationDelay: '0ms' }} />
      <div className={`bg-primary-600 rounded-full animate-bounce ${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'}`} style={{ animationDelay: '150ms' }} />
      <div className={`bg-primary-600 rounded-full animate-bounce ${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'}`} style={{ animationDelay: '300ms' }} />
    </div>
  );

  const renderPulse = () => (
    <div className={`bg-primary-600 rounded-full animate-pulse ${sizeClasses[size]}`} />
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`} role="status" aria-label={text || 'Loading'}>
      {renderLoader()}
      {text && (
        <p className="mt-2 text-sm text-secondary-600">{text}</p>
      )}
    </div>
  );
}

export function LoadingPage({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <Loading size="lg" text={text} />
    </div>
  );
}

export function LoadingOverlay({ 
  isVisible, 
  text = 'Loading...', 
  className = '' 
}: { 
  isVisible: boolean; 
  text?: string; 
  className?: string; 
}) {
  if (!isVisible) return null;

  return (
    <div className={`absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 ${className}`}>
      <Loading size="lg" text={text} />
    </div>
  );
}

export function LoadingButton({ 
  isLoading, 
  children, 
  loadingText = 'Loading...', 
  className = '',
  disabled,
  ...props 
}: {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`relative ${className} ${isLoading ? 'cursor-not-allowed' : ''}`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loading size="sm" />
        </div>
      )}
      <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
        {isLoading ? loadingText : children}
      </span>
    </button>
  );
}