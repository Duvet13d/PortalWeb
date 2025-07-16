/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'accent-1': 'rgb(221, 0, 0)',
        'accent-2': 'rgb(252, 92, 18)',
      },
      fontFamily: {
        'heading': ['Dela Gothic One','MantouSans-Regular', 'cursive'],
        'body': ['IBM Plex Sans JP', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 