import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({ icon: Icon = PackageOpen, title = 'No records found', description = '', actionLabel, onAction, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 ${className}`}>
      <div className="w-12 h-12 border border-bdr flex items-center justify-center text-txt-muted mb-3"
           style={{ backgroundColor: 'var(--color-bg-alt)' }}>
        <Icon className="w-5 h-5 text-txt-light" />
      </div>
      <h3 className="text-xs font-semibold text-txt">{title}</h3>
      {description && <p className="text-xs text-txt-muted max-w-sm mt-1 mb-4 leading-relaxed">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
