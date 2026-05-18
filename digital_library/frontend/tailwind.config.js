/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1F77D9',
        secondary: '#34A853',
        danger: '#D33B27',
        dark: {
          bg: '#202124',
          surface: '#2D2E31',
          text: '#E8EAED',
        },
        light: {
          bg: '#F8F9FA',
          text: '#202124',
        }
      },
      fontFamily: {
        sans: ['system-ui', 'Segoe UI', 'Roboto', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  darkMode: 'class',
  plugins: [],
}
