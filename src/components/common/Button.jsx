import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(({
  children, variant = 'primary', size = 'md', loading = false,
  disabled = false, icon: Icon, className = '', type = 'button', ...props
}, ref) => {
  // Base: no scale transform — professional tools don't "bounce"
  const base = 'inline-flex items-center justify-center font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed';

  const variants = {
    primary:   'bg-primary hover:bg-primary-dark text-white focus:ring-primary/40',
    secondary: 'text-txt border border-bdr hover:border-txt-light focus:ring-primary/20',
    danger:    'bg-danger hover:bg-danger-dark text-white focus:ring-danger/30',
    outline:   'border border-primary text-primary hover:bg-primary/10 focus:ring-primary/30',
    ghost:     'text-txt-muted hover:text-txt hover:bg-white/5 focus:ring-bdr',
    success:   'bg-success hover:bg-success-dark text-white focus:ring-success/30',
  };

  const secondaryStyle = variant === 'secondary'
    ? { backgroundColor: 'var(--color-bg-card)' }
    : {};

  const sizes = {
    sm:  'text-xs  px-2.5 py-1.5 gap-1.5',
    md:  'text-sm  px-3.5 py-2   gap-2',
    lg:  'text-sm  px-5   py-2.5 gap-2',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      style={secondaryStyle}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon ? <Icon className="w-4 h-4 flex-shrink-0" /> : null}
      {children}
    </button>
  );
});
Button.displayName = 'Button';
