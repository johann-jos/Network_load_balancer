/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#071019',
        'ink-deep': '#040a10',
        panel: '#0b1720',
        'panel-raised': '#10212b',
        wire: '#8ee8ff',
        healthy: '#73e2ad',
        warning: '#f5c76f',
        danger: '#ff7d79',
        'text-lab': '#e8f1f5',
        'text-muted': '#8ba2ad',
        'line-lab': 'rgba(177, 221, 234, 0.16)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        headline: ['var(--font-space-grotesk)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      boxShadow: {
        'lab-panel': 'inset 0 1px 0 rgba(255, 255, 255, 0.045), 0 20px 60px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
};
