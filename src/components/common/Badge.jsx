import React from 'react';

export function Badge({ children, variant = 'neutral', size = 'md', className = '', dot = false }) {
  const variants = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    danger:  'bg-danger/10  text-danger  border-danger/20',
    info:    'bg-blue-100   text-blue-700 border-blue-200',
    purple:  'bg-purple-100 text-purple-700 border-purple-200',
    neutral: 'border-bdr text-txt-muted',
  };

  const neutralStyle = variant === 'neutral' ? { backgroundColor: 'var(--color-bg-alt)' } : {};

  const sizes = { sm: 'text-[10px] px-1.5 py-0.5', md: 'text-xs px-2.5 py-1', lg: 'text-sm px-3 py-1.5' };

  const dotColors = {
    primary: 'bg-primary', success: 'bg-success', warning: 'bg-warning',
    danger: 'bg-danger', info: 'bg-blue-500', purple: 'bg-purple-500', neutral: 'bg-txt-muted',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}
      style={neutralStyle}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.neutral}`} />}
      {children}
    </span>
  );
}
