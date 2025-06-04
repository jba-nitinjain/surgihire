/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#5DADE2',
        'brand-green': '#50C878',
        'dark-text': '#222222',
        'light-gray': {
          50: '#F8F9FA',
          100: '#e9ecef',
          200: '#ced4da'
        }
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      }
    },
  },
  plugins: [],
};