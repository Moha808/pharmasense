import React from 'react';

export const Select = React.forwardRef(({
  label, error, helperText, options = [], className = '', id, children, ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-txt mb-1.5">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`
          block w-full border text-sm transition-colors duration-150
          px-3.5 py-2
          ${error
            ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger/30'
            : 'border-bdr focus:border-primary focus:ring-1 focus:ring-primary/20'}
          focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)' }}
        {...props}
      >
        {children || options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-danger font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-txt-muted">{helperText}</p>}
    </div>
  );
});
Select.displayName = 'Select';
