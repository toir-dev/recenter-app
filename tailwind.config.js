/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#6A8DFF',
        mint: '#8AD1C2',
        accent: '#E3C77B',
        surface: {
          light: '#F8FAFC',
          dark: '#0F172A',
        },
      },
    },
  },
  plugins: [],
};
