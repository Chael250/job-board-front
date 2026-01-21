import React from 'react';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'inline' | 'card' | 'banner';
  className?: string;
}

export function ErrorDisplay({
  title = 'Error',
  message,
  onRetry,
  onDismiss,
  variant = 'inline',
  className = '',
}: ErrorDisplayProps) {
  const baseClasses = "flex items-start";
  
  const variantClasses = {
    inline: "p-4 bg-red-50 border border-red-200 rounded-md",
    card: "p-6 bg-white border border-red-200 rounded-lg shadow-sm",
    banner: "p-4 bg-red-50 border-l-4 border-red-400",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} role="alert">
      <div className="flex-shrink-0">
        <svg
          className="w-5 h-5 text-red-400"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      
      <div className="ml-3 flex-1">
        <h3 className="text-sm font-medium text-red-800">{title}</h3>
        <p className="mt-1 text-sm text-red-700">{message}</p>
        
        {(onRetry || onDismiss) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Try Again
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-sm text-red-600 hover:text-red-800 focus:outline-none focus:underline"
              >
                Dismiss
              </button>
            )}
          </div>
        )}
      </div>
      
      {onDismiss && (
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onDismiss}
            className="inline-flex text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-md p-1"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export function NetworkErrorDisplay({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      title="Connection Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      onRetry={onRetry}
      variant="card"
    />
  );
}

export function NotFoundErrorDisplay({ 
  resource = 'page',
  onGoHome 
}: { 
  resource?: string;
  onGoHome?: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-secondary-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-secondary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.881-6.08-2.33M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">
            {resource === 'page' ? 'Page Not Found' : `${resource} Not Found`}
          </h2>
          
          <p className="text-secondary-600 mb-6">
            The {resource} you're looking for doesn't exist or has been moved.
          </p>
          
          <button
            onClick={onGoHome || (() => window.location.href = '/')}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}