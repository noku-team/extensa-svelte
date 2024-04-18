/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';

export default {
  content: ["./index.html", "./src/**/*.{svelte,js,ts}"], //for unused css
  plugins: [daisyui],
}