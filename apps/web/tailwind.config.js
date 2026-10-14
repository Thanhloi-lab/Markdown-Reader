/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        md: {
          bg: {
            primary: 'var(--md-bg-primary)',
            secondary: 'var(--md-bg-secondary)',
            sidebar: 'var(--md-bg-sidebar)',
            code: 'var(--md-bg-code)',
            hover: 'var(--md-bg-hover)',
            active: 'var(--md-bg-active)'
          },
          border: {
            DEFAULT: 'var(--md-border)',
            muted: 'var(--md-border-muted)'
          },
          text: {
            primary: 'var(--md-text-primary)',
            secondary: 'var(--md-text-secondary)',
            muted: 'var(--md-text-muted)',
            heading: 'var(--md-text-heading)'
          },
          accent: {
            DEFAULT: 'var(--md-accent)',
            hover: 'var(--md-accent-hover)',
            foreground: 'var(--md-accent-foreground)'
          }
        }
      }
    },
  },
  plugins: [],
}
