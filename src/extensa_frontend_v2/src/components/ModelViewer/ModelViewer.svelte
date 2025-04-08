<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
  import { modelStore } from '../../store/modelStore';
  import type { ModelState } from '../../types/model';

  let container: HTMLDivElement;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let controls: OrbitControls;
  let currentModel: THREE.Group | null = null;
  let loader: GLTFLoader;
  
  onMount(() => {
    initScene();
    initControls();
    initLoader();
    animate();
  });

  onDestroy(() => {
    if (renderer) {
      renderer.dispose();
    }
    if (controls) {
      controls.dispose();
    }
    if (currentModel) {
      scene.remove(currentModel);
    }
  });

  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);
  }
  
  function initControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 100;
  }

  function initLoader() {
    loader = new GLTFLoader();
  }

  async function loadModel(file: File) {
    if (currentModel) {
      scene.remove(currentModel);
    }

    try {
      const url = URL.createObjectURL(file);
      const gltf = await loader.loadAsync(url);
      currentModel = gltf.scene;

      // Center and scale the model
      const box = new THREE.Box3().setFromObject(currentModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 5 / maxDim;

      currentModel.position.sub(center);
      currentModel.scale.setScalar(scale);
      currentModel.position.y = -box.min.y * scale;

      scene.add(currentModel);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error loading model:', error);
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  // Handle file input
  function handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      loadModel(input.files[0]);
    }
  }
</script>

<div class="model-viewer" bind:this={container}>
  <input type="file" accept=".glb,.gltf" on:change={handleFileInput} />
</div>

<style>
  .model-viewer {
    width: 100%;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
  }

  input[type="file"] {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 100;
  }
</style> 