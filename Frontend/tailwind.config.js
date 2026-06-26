/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'sans-serif'],
      },
      colors: {
        rplay: {
          fog: '#E9ECEF',
          field: '#EEF3ED'
        }
      }
    },
  },
  plugins: [],
}
