import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, subtitle, children, size = 'md', showClose = true }) {
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm:   'max-w-md',
    md:   'max-w-lg',
    lg:   'max-w-2xl',
    xl:   'max-w-4xl',
    full: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 transition-opacity"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Modal panel — no rounded-2xl, use rounded-lg for a more professional/operational feel */}
        <div
          className={`relative overflow-hidden text-left shadow-modal transition-all w-full ${sizeClasses[size] || sizeClasses.md} border border-bdr`}
          style={{ backgroundColor: 'var(--color-bg-card)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showClose) && (
            <div
              className="flex items-center justify-between px-5 py-3.5 border-b border-bdr"
              style={{ backgroundColor: 'var(--color-bg-alt)' }}
            >
              <div>
                {title && <h3 className="text-sm font-semibold text-txt">{title}</h3>}
                {subtitle && <p className="text-xs text-txt-muted mt-0.5">{subtitle}</p>}
              </div>
              {showClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-txt-muted hover:text-txt transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          {/* Body */}
          <div className="px-5 py-5 max-h-[calc(85vh-80px)] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
