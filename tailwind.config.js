/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        'zen-blue': '#4f46e5',
        'zen-green': '#10b981',
        'zen-purple': '#8b5cf6',
      },
    },
  },
  plugins: [],
};