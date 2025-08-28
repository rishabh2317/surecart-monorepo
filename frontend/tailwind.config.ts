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