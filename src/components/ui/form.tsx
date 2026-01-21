import React, { forwardRef, useId } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ 
  label, 
  error, 
  required, 
  description, 
  children, 
  className = '' 
}: FormFieldProps) {
  const fieldId = useId();
  const errorId = useId();
  const descriptionId = useId();

  return (
    <div className={`space-y-1 ${className}`}>
      <label 
        htmlFor={fieldId} 
        className="block text-sm font-medium text-secondary-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">*</span>
        )}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-secondary-600">
          {description}
        </p>
      )}
      
      <div className="relative">
        {React.cloneElement(children as React.ReactElement<any>, {
          id: fieldId,
          'aria-invalid': error ? 'true' : 'false',
          'aria-describedby': [
            error ? errorId : null,
            description ? descriptionId : null,
          ].filter(Boolean).join(' ') || undefined,
          required,
        })}
      </div>
      
      {error && (
        <p 
          id={errorId} 
          className="text-sm text-red-600" 
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    const baseClasses = "block w-full px-3 py-2 border rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors";
    const errorClasses = error 
      ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500" 
      : "border-secondary-300 text-secondary-900";
    
    return (
      <input
        ref={ref}
        className={`${baseClasses} ${errorClasses} ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, ...props }, ref) => {
    const baseClasses = "block w-full px-3 py-2 border rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-vertical";
    const errorClasses = error 
      ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500" 
      : "border-secondary-300 text-secondary-900";
    
    return (
      <textarea
        ref={ref}
        className={`${baseClasses} ${errorClasses} ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, placeholder, children, ...props }, ref) => {
    const baseClasses = "block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white";
    const errorClasses = error 
      ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500" 
      : "border-secondary-300 text-secondary-900";
    
    return (
      <select
        ref={ref}
        className={`${baseClasses} ${errorClasses} ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className = '', ...props }, ref) => {
    const checkboxId = useId();
    const errorId = useId();
    const descriptionId = useId();
    
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex items-start">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className="h-4 w-4 text-primary-600 border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            aria-describedby={[
              error ? errorId : null,
              description ? descriptionId : null,
            ].filter(Boolean).join(' ') || undefined}
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          />
          <div className="ml-3">
            <label htmlFor={checkboxId} className="text-sm font-medium text-secondary-700">
              {label}
            </label>
            {description && (
              <p id={descriptionId} className="text-sm text-secondary-600">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {error && (
          <p 
            id={errorId} 
            className="text-sm text-red-600 ml-7" 
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

interface RadioGroupProps {
  name: string;
  label: string;
  options: Array<{ value: string; label: string; description?: string }>;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

export function RadioGroup({
  name,
  label,
  options,
  value,
  onChange,
  error,
  required,
  className = '',
}: RadioGroupProps) {
  const groupId = useId();
  const errorId = useId();

  return (
    <fieldset className={`space-y-3 ${className}`}>
      <legend className="text-sm font-medium text-secondary-700">
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">*</span>
        )}
      </legend>
      
      <div 
        role="radiogroup" 
        aria-labelledby={groupId}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        className="space-y-2"
      >
        {options.map((option) => {
          const optionId = `${name}-${option.value}`;
          return (
            <div key={option.value} className="flex items-start">
              <input
                id={optionId}
                name={name}
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange?.(e.target.value)}
                className="h-4 w-4 text-primary-600 border-secondary-300 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
              />
              <div className="ml-3">
                <label htmlFor={optionId} className="text-sm font-medium text-secondary-700">
                  {option.label}
                </label>
                {option.description && (
                  <p className="text-sm text-secondary-600">
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {error && (
        <p 
          id={errorId} 
          className="text-sm text-red-600" 
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </fieldset>
  );
}