import * as THREE from 'three';

/**
 * Configures default Three.js settings to be used throughout the application
 */
export function initThree(): void {
    // Configure Three.js default settings that are safe to modify
    THREE.ColorManagement.enabled = true;
    
    // Set default material settings for prototypes that can be safely modified
    THREE.MeshStandardMaterial.prototype.envMapIntensity = 1.0;
    THREE.MeshStandardMaterial.prototype.roughness = 0.7;
    THREE.MeshStandardMaterial.prototype.metalness = 0.2;
    
    // Set default texture settings
    THREE.TextureLoader.prototype.crossOrigin = '';
}

/**
 * Creates a WebGLRenderer with default settings
 */
export function createRenderer(parameters?: THREE.WebGLRendererParameters): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer(parameters);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    return renderer;
}

/**
 * Creates a DirectionalLight with default settings
 */
export function createDirectionalLight(color: THREE.ColorRepresentation = 0xffffff, intensity: number = 1): THREE.DirectionalLight {
    const light = new THREE.DirectionalLight(color, intensity);
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 50;
    return light;
}

/**
 * Creates a PerspectiveCamera with default settings
 */
export function createCamera(fov: number = 45, aspect: number = 1, near: number = 0.1, far: number = 1000): THREE.PerspectiveCamera {
    return new THREE.PerspectiveCamera(fov, aspect, near, far);
} 