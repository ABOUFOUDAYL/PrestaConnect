/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fff1f2',
          100: '#ffe1e3',
          200: '#ffc8cb',
          300: '#ff9da3',
          400: '#fb6b72',
          500: '#e63946',
          600: '#d32f2f',
          700: '#b3242f',
          800: '#931f29',
          900: '#7a1d25',
          950: '#450b10',
        },
        secondary: {
          500: '#f97316',
          600: '#ea580c',
        },
      },
      fontFamily: {
        sans:  ['var(--font-dm-sans)', 'sans-serif'],
        title: ['var(--font-sora)', 'sans-serif'],
        mono:  ['var(--font-dm-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}