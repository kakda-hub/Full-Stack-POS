/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Kantumruy Pro', 'Inter', 'system-ui', 'sans-serif'],
        receipt: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
