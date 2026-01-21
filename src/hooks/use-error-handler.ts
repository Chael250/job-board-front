import { useCallback } from 'react';
import { useToast } from '@/contexts/toast.context';

interface ApiError {
  response?: {
    status: number;
    data?: {
      error?: {
        message?: string;
        code?: string;
      };
    };
  };
  message?: string;
}

export function useErrorHandler() {
  const { error: showErrorToast } = useToast();

  const handleError = useCallback((error: ApiError | Error | unknown, context?: string) => {
    console.error('Error occurred:', error, context ? `Context: ${context}` : '');

    let title = 'An error occurred';
    let message = 'Something went wrong. Please try again.';

    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as ApiError;
      
      // Handle different HTTP status codes
      switch (apiError.response?.status) {
        case 400:
          title = 'Invalid Request';
          message = apiError.response.data?.error?.message || 'Please check your input and try again.';
          break;
        case 401:
          title = 'Authentication Required';
          message = 'Please log in to continue.';
          // Redirect to login page
          window.location.href = '/auth/login';
          return;
        case 403:
          title = 'Access Denied';
          message = 'You don\'t have permission to perform this action.';
          break;
        case 404:
          title = 'Not Found';
          message = 'The requested resource was not found.';
          break;
        case 409:
          title = 'Conflict';
          message = apiError.response.data?.error?.message || 'This action conflicts with existing data.';
          break;
        case 422:
          title = 'Validation Error';
          message = apiError.response.data?.error?.message || 'Please check your input and try again.';
          break;
        case 429:
          title = 'Too Many Requests';
          message = 'You\'re making too many requests. Please wait a moment and try again.';
          break;
        case 500:
          title = 'Server Error';
          message = 'A server error occurred. Please try again later.';
          break;
        case 502:
        case 503:
        case 504:
          title = 'Service Unavailable';
          message = 'The service is temporarily unavailable. Please try again later.';
          break;
        default:
          message = apiError.response?.data?.error?.message || apiError.message || message;
      }
    } else if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    // Add context to the title if provided
    if (context) {
      title = `${context}: ${title}`;
    }

    showErrorToast(title, message);
  }, [showErrorToast]);

  const handleNetworkError = useCallback(() => {
    showErrorToast(
      'Network Error',
      'Unable to connect to the server. Please check your internet connection.'
    );
  }, [showErrorToast]);

  const handleValidationError = useCallback((fieldErrors: Record<string, string[]>) => {
    const errorMessages = Object.entries(fieldErrors)
      .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
      .join('\n');
    
    showErrorToast('Validation Error', errorMessages);
  }, [showErrorToast]);

  return {
    handleError,
    handleNetworkError,
    handleValidationError,
  };
}