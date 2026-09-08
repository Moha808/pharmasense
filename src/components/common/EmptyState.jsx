import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({ icon: Icon = PackageOpen, title = 'No records found', description = '', actionLabel, onAction, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 ${className}`}>
      <div className="w-14 h-14 rounded-2xl border border-bdr flex items-center justify-center text-txt-muted mb-4 shadow-sm"
           style={{ backgroundColor: 'var(--color-bg-alt)' }}>
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-sm font-bold text-txt">{title}</h3>
      {description && <p className="text-xs text-txt-muted max-w-sm mt-1 mb-5 leading-relaxed">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
