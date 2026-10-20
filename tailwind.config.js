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
        primary: {
          DEFAULT: '#006194',
          container: '#007bb9',
          fixed: '#cce5ff',
          'fixed-dim': '#93ccff',
        },
        'on-primary': '#ffffff',
        'on-primary-container': '#fdfcff',
        'on-primary-fixed': '#001d31',

        secondary: {
          DEFAULT: '#006c49',
          container: '#6cf8bb',
          'fixed-dim': '#4edea3',
        },
        'on-secondary': '#ffffff',
        'on-secondary-container': '#00714d',

        tertiary: {
          DEFAULT: '#825100',
          container: '#a36700',
          fixed: '#ffddb8',
          'fixed-dim': '#ffb95f',
        },
        'on-tertiary-fixed': '#2a1700',

        surface: {
          DEFAULT: '#faf8ff',
          dim: '#d2d9f4',
          bright: '#faf8ff',
          variant: '#dae2fd',
          container: '#eaedff',
          'container-low': '#f2f3ff',
          'container-lowest': '#ffffff',
          'container-high': '#e2e7ff',
          'container-highest': '#dae2fd',
        },
        'on-surface': '#131b2e',
        'on-surface-variant': '#3f4850',

        outline: {
          DEFAULT: '#707881',
          variant: '#bfc7d2',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        'on-error': '#ffffff',
        'on-error-container': '#93000a',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        headline: ['var(--font-space-grotesk)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
