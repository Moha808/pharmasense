/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D9488',
          dark: '#0F8578',   // darker for hover (not brighter — more professional)
          light: '#042f2e',
        },
        secondary: {
          DEFAULT: '#22D3EE',
          dark: '#06b6d4',
          light: '#164e63',
        },
        // CSS-variable-backed tokens
        bg: {
          DEFAULT: 'var(--color-bg)',
          card:    'var(--color-bg-card)',
          alt:     'var(--color-bg-alt)',
          input:   'var(--color-bg-input)',
          sidebar: 'var(--color-bg-sidebar)',
        },
        txt: {
          DEFAULT: 'var(--color-text)',
          muted:   'var(--color-text-muted)',
          light:   'var(--color-text-light)',
        },
        bdr: {
          DEFAULT: 'var(--color-border)',
        },
        danger: {
          DEFAULT: '#EF4444',
          dark:    '#DC2626',
          light:   '#7f1d1d',
        },
        warning: {
          DEFAULT: '#F59E0B',
          dark:    '#D97706',
          light:   '#78350f',
        },
        success: {
          DEFAULT: '#22C55E',
          dark:    '#16A34A',
          light:   '#14532d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card':       'var(--shadow-card)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.25)',
        'modal':      'var(--shadow-modal)',
      },
      borderRadius: {
        // Intentionally NOT overriding 'xl' (12px) and '2xl' (16px) —
        // we'll use 'lg' (8px) as the new standard in components.
      },
    },
  },
  plugins: [],
}
