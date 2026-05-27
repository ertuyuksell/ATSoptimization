/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef5ff',
          100: '#d9e7ff',
          200: '#b7d1ff',
          300: '#8bb4ff',
          400: '#5b8df8',
          500: '#3a6ff0',
          600: '#2553d6',
          700: '#1f43ac',
          800: '#1e3a87',
          900: '#1d3463',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [],
};
