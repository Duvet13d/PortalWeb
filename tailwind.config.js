/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'accent-1': 'var(--color-accent-1)',
        'accent-2': 'var(--color-accent-2)',
        'primary': 'var(--color-primary)',
        'secondary': 'var(--color-secondary)',
        'text-primary': 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        'border-primary': 'var(--color-border)',
      },
      backgroundColor: {
        'primary': 'var(--color-primary)',
        'secondary': 'var(--color-secondary)',
      },
      textColor: {
        'primary': 'var(--color-text)',
        'secondary': 'var(--color-text-secondary)',
      },
      borderColor: {
        'primary': 'var(--color-border)',
      },
      fontFamily: {
        'heading': ['Dela Gothic One','MantouSans-Regular', 'cursive'],
        'body': ['IBM Plex Sans JP', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 