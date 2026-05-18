/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#F8F4EE', 50: '#FDFCFA', 100: '#F8F4EE', 200: '#EFE5D8', 300: '#E5D4C0' },
        nude: { DEFAULT: '#D8BFAA', 100: '#EDD9CB', 200: '#D8BFAA', 300: '#C9A88E', 400: '#BA9272' },
        brown: { DEFAULT: '#8B6F5A', light: '#B08968', dark: '#6B5044', darker: '#4A3628' },
        coffee: { DEFAULT: '#B08968', light: '#C9A882', dark: '#8B6F52' },
        warm: { white: '#FFFCF8', gray: '#9E8E80', muted: '#C4B0A0' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        display: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(139,111,90,0.08), 0 4px 6px -2px rgba(139,111,90,0.04)',
        'card': '0 4px 20px -4px rgba(139,111,90,0.12), 0 2px 8px -2px rgba(139,111,90,0.06)',
        'card-hover': '0 12px 40px -8px rgba(139,111,90,0.2), 0 4px 12px -4px rgba(139,111,90,0.1)',
        'glass': '0 8px 32px 0 rgba(139, 111, 90, 0.1)',
        'inner-soft': 'inset 0 2px 8px rgba(139,111,90,0.08)',
        'glow': '0 0 20px rgba(176,137,104,0.3)',
      },
      backdropBlur: { xs: '2px' },
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem', '4xl': '2rem' },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'mic-pulse': 'micPulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.7 } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        micPulse: { '0%,100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(176,137,104,0.4)' }, '50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 10px rgba(176,137,104,0)' } },
      },
      spacing: { '18': '4.5rem', '88': '22rem', '112': '28rem', '128': '32rem' },
      screens: { 'xs': '475px' },
      zIndex: { '60': '60', '70': '70', '80': '80', '90': '90', '100': '100' },
    },
  },
  plugins: [],
};
