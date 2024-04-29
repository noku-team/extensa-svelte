import { svelte } from '@sveltejs/vite-plugin-svelte';
import dotenv from "dotenv";
import { defineConfig } from 'vite';
import environment from "vite-plugin-environment";

dotenv.config();

console.warn(process.env.CANISTER_ID_EXTENSA_BACKEND);
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
      },
    },
  },
  define: {
    'process.env': process.env
  },
  plugins: [
    svelte(),
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
  ],
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
});
