// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8433EC',
          50: '#F3EAFE',
          100: '#E5D3FC',
          500: '#8433EC',
          600: '#6A22C4',
          700: '#5A1BA8',
        },
        secondary: {
          DEFAULT: '#6A22C4',
        },
        accent: {
          DEFAULT: '#B48CF0',
        },
        success: {
          DEFAULT: '#22C55E',
          50: '#EAFBF1',
        },
        warning: {
          DEFAULT: '#F59E0B',
          50: '#FEF6E7',
        },
        danger: {
          DEFAULT: '#EF4444',
          50: '#FDECEC',
        },
        surface: '#FAF8FE',
        card: '#FFFFFF',
        border: '#ECE3FA',
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(132, 51, 236, 0.05), 0 4px 12px -2px rgba(132, 51, 236, 0.08)',
        soft: '0 1px 3px 0 rgba(132, 51, 236, 0.06)',
        elevated: '0 8px 24px -4px rgba(132, 51, 236, 0.16)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}