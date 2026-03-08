/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#FF7A00' },
        secondary: { DEFAULT: '#0f172a' }
      },
      borderRadius: {
        xl: '1rem'
      }
    }
  },
  plugins: []
}
