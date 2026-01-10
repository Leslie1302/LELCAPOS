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
          50: '#e6f2ff',
          100: '#b3d9ff',
          200: '#80bfff',
          300: '#4da6ff',
          400: '#1a8cff',
          500: '#0073e6',
          600: '#0059b3',
          700: '#004080',
          800: '#00264d',
          900: '#000d1a',
        },
        secondary: {
          50: '#e6f9f5',
          100: '#b3ede0',
          200: '#80e0cb',
          300: '#4dd4b6',
          400: '#1ac8a1',
          500: '#00b188',
          600: '#008a6a',
          700: '#00634c',
          800: '#003c2e',
          900: '#001510',
        },
      },
    },
  },
  plugins: [],
}
