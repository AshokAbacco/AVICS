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
          DEFAULT: '#0A4DB3',
          50: '#EAF1FB',
          100: '#D4E3F7',
          500: '#0A4DB3',
          600: '#093F92',
          700: '#073271',
        },
        secondary: {
          DEFAULT: '#2563EB',
        },
        accent: {
          DEFAULT: '#60A5FA',
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
        surface: '#F8FAFC',
        card: '#FFFFFF',
        border: '#E5E7EB',
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(15, 23, 42, 0.06)',
        soft: '0 1px 3px 0 rgba(15, 23, 42, 0.06)',
        elevated: '0 8px 24px -4px rgba(15, 23, 42, 0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
