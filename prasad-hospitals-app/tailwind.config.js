/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E6FBA',
          hover: '#1A5FA3',
        },
        success: '#16A34A',
        star: '#EAB308',
        surface: '#F8FAFC',
        muted: '#64748B',
        disabled: '#CBD5E1',
      },
    },
  },
  plugins: [],
}
