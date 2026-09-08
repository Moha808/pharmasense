import React from 'react';

export function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
  noPadding = false,
  headerClassName = '',
  bodyClassName = ''
}) {
  return (
    <div
      className={`rounded-xl border border-bdr overflow-hidden transition-colors duration-200 ${className}`}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
      }}
    >
      {(title || subtitle || action) && (
        <div
          className={`px-5 py-3.5 border-b border-bdr flex items-center justify-between gap-4 ${headerClassName}`}
          style={{ backgroundColor: 'var(--color-bg-alt)' }}
        >
          <div className="min-w-0">
            {title && <h3 className="font-bold text-sm text-txt">{title}</h3>}
            {subtitle && <p className="text-[11px] text-txt-muted mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : `p-5 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
}
