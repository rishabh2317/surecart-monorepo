import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // This makes 'Inter' the default font
        sans: ['Inter', 'sans-serif'],
      },
    
      colors: {
        // This adds our new Teal primary color
        teal: {
          '100': '#ccfbf1',
          '500': '#14b8a6',
          '600': '#0d9488',
        },
        slate: {
          '50': '#f8fafc',
          '100': '#f1f5f9',
          '200': '#e2e8f0',
          '300': '#cbd5e1',
          '500': '#64748b',
          '600': '#475569',
          '700': '#334155',
          '800': '#1e293b',
          '900': '#0f172a',
        },
      },
      borderRadius: {
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
      },
      typography: ({ theme }: { theme: any }) => ({
        slate: {
          css: {
            '--tw-prose-body': theme('colors.slate[800]'),
            '--tw-prose-headings': theme('colors.slate[900]'),
            '--tw-prose-links': theme('colors.teal[600]'),
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}
export default config