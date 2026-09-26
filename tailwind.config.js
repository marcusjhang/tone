/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#fbfaf8',
        ink: {
          DEFAULT: '#1b1b1f',
          muted: '#5b5b66',
        },
        brand: {
          DEFAULT: '#c8553d',
          dark: '#9d3f2d',
          soft: '#f4e3dd',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '42rem',
      },
    },
  },
  plugins: [],
}
