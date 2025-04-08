import './app.css';
import App from "./App.svelte";
import { initThree } from './utils/three/initThree';

// Initialize Three.js global configurations
initThree();

const app = new App({
    target: document.getElementById('app')!,
});

export default app;
