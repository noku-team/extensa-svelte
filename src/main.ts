import './app.css';
import App from "./App.svelte";
export * from './lib/Clock.svelte';
export * from './lib/Header.svelte';
export * from './lib/MyCounter.svelte';

const app = new App({
    target: document.getElementById('app')!,
})

export default app
