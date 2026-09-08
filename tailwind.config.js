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
          DEFAULT: '#0D9488', // Medical Teal
          dark: '#14B8A6',    // Bright Teal for hover (repurposing 'dark' class for hover)
          light: '#042f2e',
        },
        secondary: {
          DEFAULT: '#22D3EE', // Cyan
          dark: '#06b6d4',
          light: '#164e63',
        },
        // CSS-variable-backed tokens – work in both light and dark
        bg: {
          DEFAULT: 'var(--color-bg)',
          card: 'var(--color-bg-card)',
          alt: 'var(--color-bg-alt)',
          input: 'var(--color-bg-input)',
        },
        txt: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
          light: 'var(--color-text-light)',
        },
        bdr: {
          DEFAULT: 'var(--color-border)',
        },
        danger: {
          DEFAULT: '#EF4444',
          dark: '#F87171',
          light: '#7f1d1d',
        },
        warning: {
          DEFAULT: '#F59E0B',
          dark: '#FBBF24',
          light: '#78350f',
        },
        success: {
          DEFAULT: '#22C55E',
          dark: '#4ADE80',
          light: '#14532d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'card-hover': '0 10px 30px rgba(20, 60, 65, 0.12)',
        'modal': '0 20px 60px -15px rgba(17, 45, 50, 0.25)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      }
    },
  },
  plugins: [],
}
