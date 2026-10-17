import React from 'react';
import { Search, X } from 'lucide-react';

export function SearchInput({ value, onChange, onClear, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-txt-muted">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2 border border-bdr text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-colors"
        style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)' }}
      />
      {value && (
        <button
          type="button"
          onClick={() => { onChange(''); if (onClear) onClear(); }}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-txt-muted hover:text-txt"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
