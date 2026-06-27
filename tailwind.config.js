/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./assets/js/**/*.js"],
  theme: {
    extend: {
      colors: {
        brand: '#D4F011',
        dark: '#0f0f0f',
        surface: '#1a1a1a',
        surface2: '#252525',
        gray: {
          500: '#94a3b8',
          600: '#cbd5e1'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
