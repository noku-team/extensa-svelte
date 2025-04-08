import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  kit: {
    adapter: adapter()
  },
  preprocess: vitePreprocess(),
  compilerOptions: {
    customElement: true
  }
}
