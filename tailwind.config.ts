import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        vintage: {
          cream: '#F5F0E8',
          sepia: '#D4C5B9',
          brown: '#8B7355',
          dark: '#5C4A3A',
        },
      },
      fontFamily: {
        handwritten: ['Caveat', 'cursive'],
        serif: ['Crimson Text', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
