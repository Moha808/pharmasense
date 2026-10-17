import React from 'react';

export const Input = React.forwardRef(({
  label, error, helperText, leftIcon: LeftIcon, rightIcon: RightIcon,
  className = '', id, type = 'text', ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-txt mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-txt-muted">
            <LeftIcon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`
            block w-full border text-sm transition-colors duration-150
            ${LeftIcon ? 'pl-9' : 'pl-3.5'}
            ${RightIcon ? 'pr-9' : 'pr-3.5'}
            py-2
            ${error
              ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger/30'
              : 'border-bdr focus:border-primary focus:ring-1 focus:ring-primary/20'}
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          style={{
            backgroundColor: 'var(--color-bg-input)',
            color: 'var(--color-text)',
          }}
          {...props}
        />
        {RightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-txt-muted">
            {typeof RightIcon === 'function' ? <RightIcon className="h-4 w-4" /> : RightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-danger font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-txt-muted">{helperText}</p>}
    </div>
  );
});
Input.displayName = 'Input';
