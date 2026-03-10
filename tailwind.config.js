/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand-purple-dark': '#6B21A8',
        'brand-purple': '#7C3AED',
        'note-reminder': '#FFF3E0',
        'note-personal': '#F3E5F5',
        'note-shopping': '#FCE4EC',
        'note-work': '#E8F5E9',
        'note-voice': '#E3F2FD',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
