/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'primary': {
          50: '#e6f0fc',
          100: '#cce0f9',
          200: '#99c2f3',
          300: '#66a3ed',
          400: '#3385e7',
          500: '#0066e1',
          600: '#0052b4', // Tennessee blue
          700: '#003e87',
          800: '#00295a',
          900: '#00152d',
        },
        'secondary': {
          50: '#fde8e8',
          100: '#fbd1d1',
          200: '#f7a3a3',
          300: '#f37575',
          400: '#ef4747',
          500: '#eb1919', // Tennessee red
          600: '#bc1414',
          700: '#8d0f0f',
          800: '#5e0a0a',
          900: '#2f0505',
        },
        'accent': {
          50: '#fef9e7',
          100: '#fdf3cf',
          200: '#fbe79f',
          300: '#f9db6f',
          400: '#f7cf3f',
          500: '#f5c30f', // Tennessee gold
          600: '#c49c0c',
          700: '#937509',
          800: '#624e06',
          900: '#312703',
        }
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}