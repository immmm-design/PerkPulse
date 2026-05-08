import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:     '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-md':'0 4px 12px -2px rgba(0,0,0,0.08), 0 2px 6px -3px rgba(0,0,0,0.05)',
        wallet:   '0 8px 32px -8px rgba(0,0,0,0.24), 0 4px 16px -4px rgba(0,0,0,0.12)',
      },
      animation: {
        progress: 'progress-in 0.6s ease-out both',
      },
      keyframes: {
        'progress-in': {
          from: { width: '0%' },
        },
      },
    },
  },
  plugins: [],
}

export default config
