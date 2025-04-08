/** @type {import('tailwindcss').Config} */
import tailwindFont from '@tailwindcss/typography';
import daisyui from 'daisyui';

export default {
  content: ["./index.html", "./src/**/*.{svelte,js,ts}"], //for unused css
  plugins: [tailwindFont, daisyui],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter'],
      },
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        background: 'rgb(var(--color-background) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
      },
    },
  },
}