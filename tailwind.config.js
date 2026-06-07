/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['DM Serif Display', 'serif'],
        body: ['Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          amber: '#f59e0b',
          red: '#ef4444',
          dark: '#0a0f1e',
          card: '#0f172a',
          border: '#1e293b',
          muted: '#64748b',
          text: '#e2e8f0',
        },
      },
    },
  },
  plugins: [],
}
