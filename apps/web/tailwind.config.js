/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-syne)', 'var(--font-inter)', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        midnight: {
          50: '#f0f0ff',
          100: '#e5e4ff',
          200: '#cdcbfe',
          300: '#a9a4fc',
          400: '#8073f8',
          500: '#5a4cf2',
          600: '#4330e7',
          700: '#3720cc',
          800: '#2e1ca6',
          900: '#261984',
          950: '#170e58',
        },
        surface: {
          primary: '#030311',
          secondary: '#0a0a1f',
          tertiary: '#111128',
          elevated: '#161630',
          card: 'rgba(22, 22, 48, 0.8)',
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7c3aed, #2563eb)',
        'gold-gradient': 'linear-gradient(135deg, #d97706, #fbbf24)',
        'dark-gradient': 'linear-gradient(180deg, #030311 0%, #0d1228 50%, #030311 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
      },
      boxShadow: {
        'brand': '0 4px 24px rgba(124, 58, 237, 0.4)',
        'brand-lg': '0 8px 40px rgba(124, 58, 237, 0.5)',
        'gold': '0 4px 24px rgba(251, 191, 36, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'card': '0 24px 64px rgba(0, 0, 0, 0.4)',
        'glow-brand': '0 0 40px rgba(139, 92, 246, 0.3)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
};
