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
    },
  },
}