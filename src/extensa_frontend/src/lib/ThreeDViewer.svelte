<script lang="ts">
  import { onMount, createEventDispatcher, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
  import { loadModel, getModelBoundingBox } from '../utils/three/modelLoader';
  import { createRenderer, createCamera, createDirectionalLight } from '../utils/three/initThree';
  import { setupTransformControls, getIntersectionPoint, findSelectedObject, exportScene, importScene } from '../utils/three/interactions';
  import { createGridMapTexture, createMapMaterial, createMarker, geoToCartesian } from '../utils/map/customMap';
  import type { GeoCoordinates } from '../utils/map/customMap';
  import { TileLoader, MapType } from '../utils/map/tileLoader';

  const dispatch = createEventDispatcher();
  
  // DOM elements
  let container: HTMLElement;
  
  // Three.js instances
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let orbitControls: OrbitControls;
  let transformControls: TransformControls;
  let mapPlane: THREE.Mesh;
  let raycaster: THREE.Raycaster;
  let tileLoader: TileLoader | null = null;
  
  // State
  let selectedModel: any = null;
  let models: any[] = [];
  let currentMode: 'view' | 'place' | 'transform' = 'view';
  let showLoadingIndicator = false;
  
  // Map settings
  let mapOrigin: GeoCoordinates = {
    latitude: 45.4642,
    longitude: 9.1900
  };
  
  // Setup functions
  function setupScene() {
    // Initialize Three.js scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // Camera
    const aspectRatio = container.clientWidth / container.clientHeight;
    camera = createCamera(45, aspectRatio, 0.1, 1000) as THREE.PerspectiveCamera;
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    
    // Renderer
    renderer = createRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = createDirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);
    
    // Controls
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.1;
    
    // Transform controls
    transformControls = setupTransformControls(camera, renderer, orbitControls);
    scene.add(transformControls);
    
    // Map plane with custom grid texture
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const gridTexture = createGridMapTexture();
    const planeMaterial = createMapMaterial(gridTexture);
    mapPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    mapPlane.rotation.x = -Math.PI / 2;
    mapPlane.receiveShadow = true;
    scene.add(mapPlane);
    
    // Add test marker at center
    addMapMarker(new THREE.Vector3(0, 0, 0), 0xff0000);
    
    // Event listeners
    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
    
    // Start render loop
    animate();
    
    // Notify that viewer is ready
    dispatch('viewerReady');
  }
  
  // Export functions for parent component
  export function setMode(mode: 'view' | 'place' | 'transform') {
    currentMode = mode;
    updateTransformControls();
  }
  
  export function clearSelection() {
    if (selectedModel) {
      selectedModel = null;
      if (transformControls) {
        transformControls.detach();
      }
    }
  }
  
  export async function addModel(path: string): Promise<any> {
    showLoadingIndicator = true;
    try {
      const modelObject = await loadModel(path);
      scene.add(modelObject);
      
      // Position on map
      if (selectedModel) {
        modelObject.position.copy(selectedModel.position);
      } else {
        modelObject.position.set(0, 0, 0);
      }
      
      // Scale model appropriately
      const boundingBox = getModelBoundingBox(modelObject);
      const maxDimension = Math.max(
        boundingBox.max.x - boundingBox.min.x,
        boundingBox.max.y - boundingBox.min.y,
        boundingBox.max.z - boundingBox.min.z
      );
      
      const scaleFactor = 2 / maxDimension;
      modelObject.scale.set(scaleFactor, scaleFactor, scaleFactor);
      
      // Center model
      modelObject.position.y = boundingBox.max.y * scaleFactor / 2;
      
      // Add to active models
      const modelData = {
        id: `model_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        path,
        object: modelObject,
        position: modelObject.position.clone(),
        rotation: modelObject.rotation.clone(),
        scale: modelObject.scale.clone(),
        visible: true
      };
      models = [...models, modelData];
      
      // Notify parent about models update
      dispatch('modelsUpdated', { models });
      
      return modelData;
    } catch (error) {
      console.error('Failed to load model:', error);
      showLoadingIndicator = false;
      return null;
    } finally {
      showLoadingIndicator = false;
    }
  }
  
  export function removeSelectedModel() {
    if (selectedModel) {
      // Remove from scene
      scene.remove(selectedModel.object);
      
      // Remove from active models
      models = models.filter(model => model.id !== selectedModel.id);
      
      // Clear selection
      clearSelection();
      
      // Notify parent about models update
      dispatch('modelsUpdated', { models });
      
      return true;
    }
    return false;
  }
  
  export function getActiveModels() {
    return models.map(model => ({
      path: model.path,
      position: model.object.position.clone(),
      rotation: model.object.rotation.clone(),
      scale: model.object.scale.clone()
    }));
  }
  
  export function loadMapTexture(type: 'OSM' | 'GM' | 'GIS' | 'BM' | 'grid') {
    if (type === 'grid') {
      // Usa la mappa griglia predefinita
      tileLoader?.setMapType(MapType.OSM);
    } else {
      // Imposta il tipo di mappa
      switch (type) {
        case 'OSM':
          tileLoader?.setMapType(MapType.OSM);
          break;
        case 'GM':
          tileLoader?.setMapType(MapType.GM);
          break;
        case 'GIS':
          tileLoader?.setMapType(MapType.GIS);
          break;
        case 'BM':
          tileLoader?.setMapType(MapType.BM);
          break;
      }
    }
  }
  
  export function addGeolocatedModel(path: string, coords: GeoCoordinates) {
    if (!coords || !coords.latitude || !coords.longitude) {
      console.error('Invalid coordinates provided');
      return;
    }
    
    // Converti coordinate geografiche in posizione sulla mappa
    const position = geoToCartesian(coords, mapOrigin);
    
    // Crea un vettore Three.js
    const pos = new THREE.Vector3(position.x, 0, position.z);
    
    // Aggiungi modello in quella posizione
    return addModel(path).then(modelData => {
      modelData.object.position.copy(pos);
      modelData.position = pos.clone();
      dispatch('modelsUpdated', { models });
      return modelData;
    });
  }
  
  export function addMapMarker(position: THREE.Vector3, color: number = 0xff0000): THREE.Mesh {
    const marker = createMarker(position, color);
    scene.add(marker);
    return marker;
  }

  onMount(() => {
    if (container) {
      setupScene();
      
      // Aggiungi un marker di test al centro della mappa
      addMapMarker(new THREE.Vector3(0, 0, 0), 0x2196f3);
      
      animate();
      
      // Aggiungi evento di ridimensionamento
      window.addEventListener('resize', onWindowResize);
    }
  });
  
  function animate() {
    requestAnimationFrame(animate);
    orbitControls.update();
    renderer.render(scene, camera);
  }
  
  function onMouseDown(event: MouseEvent) {
    // Handle by mode
    if (currentMode === 'place' && models.length > 0) {
      // Get intersection point with map
      const point = getIntersectionPoint(event, camera, mapPlane, container);
      if (point) {
        dispatch('placeModel', { position: point });
      }
      return;
    }
    
    // For view and transform mode, select objects
    const objectsToCheck = scene.children.filter(obj => 
      obj !== mapPlane && models.some(model => model.object === obj)
    );
    
    const selectedObj = findSelectedObject(event, camera, objectsToCheck, container);
    
    if (selectedObj) {
      // Find the root model object
      let rootObject = selectedObj;
      while (rootObject.parent && rootObject.parent !== scene) {
        rootObject = rootObject.parent;
      }
      
      // Check if it's one of our models
      const modelData = models.find(model => model.object === rootObject);
      if (modelData) {
        selectObject(rootObject);
      }
    } else {
      clearSelection();
    }
  }
  
  function selectObject(object: THREE.Object3D) {
    selectedModel = models.find(model => model.object === object);
    updateTransformControls();
    
    // Notify parent
    dispatch('objectSelected', { 
      object: selectedModel,
      modelData: selectedModel
    });
  }
  
  function updateTransformControls() {
    transformControls.detach();
    
    if (selectedModel && currentMode === 'transform') {
      transformControls.attach(selectedModel.object);
    }
  }
  
  function onWindowResize() {
    handleResize();
  }
  
  function handleResize() {
    if (renderer && camera) {
      const perspectiveCamera = camera as THREE.PerspectiveCamera;
      perspectiveCamera.aspect = window.innerWidth / window.innerHeight;
      perspectiveCamera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }
  
  function onKeyDown(event: KeyboardEvent) {
    switch (event.key.toLowerCase()) {
      case 'delete':
      case 'backspace':
        if (selectedModel) {
          removeSelectedModel();
        }
        break;
      case 'escape':
        clearSelection();
        break;
    }
  }
  
  onDestroy(() => {
    // Clean up resources and event listeners
    window.removeEventListener('resize', onWindowResize);
    window.removeEventListener('keydown', onKeyDown);
    container.removeEventListener('mousedown', onMouseDown);
    
    if (renderer) {
      renderer.dispose();
    }
  });
</script>

<div class="three-container" bind:this={container}>
  {#if showLoadingIndicator}
    <div class="loading-indicator">
      <div class="spinner"></div>
      <p>Caricamento modello...</p>
    </div>
  {/if}
</div>

<style>
  .three-container {
    width: 100%;
    height: 100%;
    position: relative;
    background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
  }
  
  .loading-indicator {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 1rem 2rem;
    border-radius: 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #ffffff;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style> 