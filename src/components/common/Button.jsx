import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(({
  children, variant = 'primary', size = 'md', loading = false,
  disabled = false, icon: Icon, className = '', type = 'button', ...props
}, ref) => {
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg active:scale-[0.98]';

  const variants = {
    primary:   'bg-primary hover:bg-primary-dark text-white focus:ring-primary/40 shadow-sm',
    secondary: 'bg-bg-card hover:bg-bg-alt text-txt border border-bdr focus:ring-primary/20 shadow-sm',
    danger:    'bg-danger hover:bg-danger-dark text-white focus:ring-danger/30 shadow-sm',
    outline:   'border border-primary text-primary hover:bg-primary/10 focus:ring-primary/30',
    ghost:     'text-txt-muted hover:text-txt hover:bg-bg-alt focus:ring-bdr',
    success:   'bg-success hover:bg-success-dark text-white focus:ring-success/30 shadow-sm',
  };

  const sizes = {
    sm:  'text-xs px-2.5 py-1.5 gap-1.5',
    md:  'text-sm px-4   py-2.5 gap-2',
    lg:  'text-base px-5 py-3   gap-2.5',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon ? <Icon className="w-4 h-4 flex-shrink-0" /> : null}
      {children}
    </button>
  );
});
Button.displayName = 'Button';
