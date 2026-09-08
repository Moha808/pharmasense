import React from 'react';
import { useThemeStore } from '../../store/themeStore';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '', showLabel = false }) {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle dark mode"
      className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-txt-muted hover:text-txt ${className}`}
      style={{ ':hover': { backgroundColor: 'var(--color-bg-alt)' } }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-alt)'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
    >
      {isDark
        ? <Sun  className="w-5 h-5 text-warning" />
        : <Moon className="w-5 h-5 text-txt-muted" />}
      {showLabel && (
        <span className="text-xs font-semibold">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}
