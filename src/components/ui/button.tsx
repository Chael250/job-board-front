import React, { forwardRef } from 'react';
import { Loading } from './loading';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '',
    disabled,
    ...props
  }, ref) => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variantClasses = {
      primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
      secondary: "bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus:ring-secondary-500",
      outline: "border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 focus:ring-secondary-500",
      ghost: "text-secondary-700 hover:bg-secondary-100 focus:ring-secondary-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    };
    
    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };
    
    const widthClasses = fullWidth ? "w-full" : "";
    
    const isDisabled = disabled || isLoading;
    
    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${className}`}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {isLoading && (
          <Loading 
            size="sm" 
            className="mr-2" 
            variant="spinner"
          />
        )}
        
        {!isLoading && leftIcon && (
          <span className="mr-2" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        
        <span>
          {isLoading && loadingText ? loadingText : children}
        </span>
        
        {!isLoading && rightIcon && (
          <span className="ml-2" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string; // Required for accessibility
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({
    icon,
    label,
    variant = 'ghost',
    size = 'md',
    isLoading = false,
    className = '',
    disabled,
    ...props
  }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variantClasses = {
      primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
      secondary: "bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus:ring-secondary-500",
      outline: "border border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50 focus:ring-secondary-500",
      ghost: "text-secondary-700 hover:bg-secondary-100 focus:ring-secondary-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    };
    
    const sizeClasses = {
      sm: "p-1.5",
      md: "p-2",
      lg: "p-3",
    };
    
    const iconSizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };
    
    const isDisabled = disabled || isLoading;
    
    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-label={label}
        title={label}
        {...props}
      >
        {isLoading ? (
          <Loading size="sm" variant="spinner" />
        ) : (
          <span className={iconSizeClasses[size]} aria-hidden="true">
            {icon}
          </span>
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function ButtonGroup({ 
  children, 
  orientation = 'horizontal', 
  className = '' 
}: ButtonGroupProps) {
  const orientationClasses = {
    horizontal: "flex flex-row",
    vertical: "flex flex-col",
  };
  
  return (
    <div 
      className={`${orientationClasses[orientation]} ${className}`}
      role="group"
    >
      {children}
    </div>
  );
}