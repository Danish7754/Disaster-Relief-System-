/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'from-green-400',
    'to-green-600',
    'from-blue-400',
    'to-blue-600',
    'from-purple-400',
    'to-purple-600',
    'bg-gradient-to-br',
  ],
}
