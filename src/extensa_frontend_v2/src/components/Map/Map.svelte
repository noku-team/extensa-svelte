<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  import { mapStore } from '../../store/mapStore';
  import type { MapState } from '../../types/map';
  import { MapType } from '../../types/map';
  import { TileManager } from './TileManager';
  import MapTypeSelector from './MapTypeSelector.svelte';

  let container: HTMLDivElement;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let controls: OrbitControls;
  let tileManager: TileManager;
  
  // Map parameters
  const TILE_SIZE = 256;
  const INITIAL_ZOOM = 15;
  const INITIAL_LAT = 46.0053515; // Lugano
  const INITIAL_LNG = 8.9554946;  // Lugano
  
  onMount(() => {
    console.log('Initializing map...');
    
    // Initialize Three.js scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    // Add debug helpers
    const axesHelper = new THREE.AxesHelper(10000);
    scene.add(axesHelper);
    
    // Add a reference grid
    const gridHelper = new THREE.GridHelper(10000, 100, 0xff0000, 0x444444);
    scene.add(gridHelper);
    
    // Add a reference point at 0,0,0
    const sphereGeometry = new THREE.SphereGeometry(50, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const originSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    originSphere.position.set(0, 0, 0);
    scene.add(originSphere);
    
    console.log("Debug helpers added to scene");

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Set initial camera position for Lugano
    const position = latLngToWorld(INITIAL_LAT, INITIAL_LNG);
    const initialHeight = 2000; // Reduced height for a closer view
    camera.position.set(position.x, initialHeight, position.z);
    camera.lookAt(position.x, 0, position.z);
    
    console.log('Initial position (lat/lng):', INITIAL_LAT, INITIAL_LNG);
    console.log('World position:', position);
    console.log('Camera position:', camera.position);
    console.log('Camera target:', new THREE.Vector3(position.x, 0, position.z));
    
    // Add a marker at the initial position
    const markerGeometry = new THREE.SphereGeometry(100, 32, 32);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Blue
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(position.x, 100, position.z); // Slightly above ground
    scene.add(marker);
    console.log('Added marker at initial position');
    
    // Initialize tile manager with initial map type
    tileManager = new TileManager(scene, TILE_SIZE, $mapStore.mapType);
    console.log('Tile manager initialized with map type:', $mapStore.mapType);
    
    // Debug: calcola le coordinate tile per Lugano
    const zoomLevel = 15;
    const n = Math.pow(2, zoomLevel);
    const luganoTileX = Math.floor((INITIAL_LNG + 180) / 360 * n);
    const luganoLatRad = INITIAL_LAT * Math.PI / 180;
    const luganoTileY = Math.floor((1 - Math.log(Math.tan(luganoLatRad) + 1 / Math.cos(luganoLatRad)) / Math.PI) / 2 * n);
    console.log(`DEBUG: Lugano should be at tile coordinates: zoom=${zoomLevel}, x=${luganoTileX}, y=${luganoTileY}`);
    
    // Aggiungi un marker visibile sulle coordinate tile che dovrebbero rappresentare Lugano
    const debugTilePosition = tileManager.calculateTileWorldPosition(luganoTileX, luganoTileY, zoomLevel);
    const debugMarkerGeometry = new THREE.SphereGeometry(200, 32, 32);
    const debugMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 }); // Verde
    const debugMarker = new THREE.Mesh(debugMarkerGeometry, debugMarkerMaterial);
    debugMarker.position.set(debugTilePosition.x, 100, debugTilePosition.y);
    scene.add(debugMarker);
    console.log('Added debug marker at tile position:', debugTilePosition);
    
    // Initialize controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.minDistance = 100;
    controls.maxDistance = 5000; // Reduced max distance
    controls.maxPolarAngle = Math.PI / 2; // Limit to top-down view
    controls.minPolarAngle = 0;           // Allow tilting for perspective
    controls.enableRotate = true;
    controls.rotateSpeed = 0.5;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.0;
    controls.enablePan = true;
    controls.panSpeed = 1.0;
    controls.target.set(position.x, 0, position.z); // Set target to Lugano
    
    console.log('Controls initialized');
    
    // Handle control changes to update the store
    controls.addEventListener('change', () => {
      // Convert camera position to lat/lng
      const worldPos = new THREE.Vector3();
      worldPos.copy(camera.position);
      worldPos.y = 0;
      
      const latLng = worldToLatLng(worldPos.x, worldPos.z);
      const zoom = 20 - (controls.getDistance() / 500);
      
      console.log('Camera moved to:', latLng, 'zoom:', zoom);
      
      // Update the store
      mapStore.update(state => ({
        ...state,
        center: {
          lat: latLng.lat,
          lng: latLng.lng
        },
        zoom: zoom
      }));
    });
    
    // Handle window resize
    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        console.log('Window resized');
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    animate();
    console.log('Map initialization complete');
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  onDestroy(() => {
    if (renderer) {
      renderer.dispose();
    }
    if (controls) {
      controls.dispose();
    }
  });

  function latLngToWorld(lat: number, lng: number): THREE.Vector3 {
    // Convert lat/lng to world coordinates
    const radius = 6378137; // Earth's radius in meters
    const x = radius * Math.cos(lat * Math.PI / 180) * Math.cos(lng * Math.PI / 180);
    const z = radius * Math.cos(lat * Math.PI / 180) * Math.sin(lng * Math.PI / 180);
    return new THREE.Vector3(x, 0, z);
  }
  
  function worldToLatLng(x: number, z: number): {lat: number, lng: number} {
    const radius = 6378137; // Earth's radius in meters
    const lng = Math.atan2(z, x) * 180 / Math.PI;
    const hyp = Math.sqrt(x * x + z * z);
    const lat = Math.acos(hyp / radius) * 180 / Math.PI;
    return { lat, lng };
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    const zoomLevel = Math.max(15, Math.min(19, Math.floor(20 - (controls.getDistance() / 500)))); // Limit zoom range
    
    if (tileManager) {
      tileManager.updateTiles(camera.position, zoomLevel);
    }
    
    renderer.render(scene, camera);
  }
</script>

<div class="map-container" bind:this={container} />
<MapTypeSelector />

<style>
  .map-container {
    width: 100%;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
  }
</style> 