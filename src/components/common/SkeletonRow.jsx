import React from 'react';

export function SkeletonRow({ columns = 5 }) {
  return (
    <tr className="animate-pulse border-b border-bdr">
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="py-4 px-4">
          <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'var(--color-bg-alt)' }} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-bg-card rounded-xl border border-bdr p-5 shadow-card animate-pulse">
      <div className="flex justify-between items-center mb-3">
        <div className="h-3.5 rounded w-1/3" style={{ backgroundColor: 'var(--color-bg-alt)' }} />
        <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: 'var(--color-bg-alt)' }} />
      </div>
      <div className="h-7 rounded w-1/2 mb-2" style={{ backgroundColor: 'var(--color-bg-alt)' }} />
      <div className="h-3 rounded w-2/3" style={{ backgroundColor: 'var(--color-bg-alt)' }} />
    </div>
  );
}

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <div className={`${sizes[size] || sizes.md} border-2 border-primary/20 border-t-primary rounded-full animate-spin`} />
    </div>
  );
}
