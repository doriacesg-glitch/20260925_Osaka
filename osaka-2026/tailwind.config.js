/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f5efe4',
        sage: {
          DEFAULT: '#a7b89a',
          deep: '#7a8c6d',
        },
        ink: '#3b3a36',
        washi: {
          pink: '#e8c7c1',
          blue: '#b8cbd6',
        },
      },
      fontFamily: {
        hand: ['"Zen Kurenaido"', '"Klee One"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
