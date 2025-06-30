/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // AQUI ESTÁ A MUDANÇA: Adicionamos a 'safelist'
  safelist: [
    {
      pattern: /bg-(background|card|primary|secondary)/,
      variants: ['hover'],
    },
    {
      pattern: /text-(primary|secondary|text-primary|muted)/,
      variants: ['hover'],
    },
    {
      pattern: /border-(border|primary)/,
    },
  ],
  theme: {
    extend: {
      colors: {
        background: '#1E1E1E',
        card: '#303030',
        border: '#4a4a4a',
        primary: {
          DEFAULT: '#A8FF36',
          foreground: '#1E1E1E'
        },
        secondary: {
          DEFAULT: '#FF16FA',
          foreground: '#FFFFFF'
        },
        text: {
          primary: '#EDEDED',
          muted: '#888888'
        }
      }
    },
  },
  plugins: [],
}