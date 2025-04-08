import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';

// Cache for loaded models
const modelCache = new Map<string, THREE.Object3D>();

/**
 * Loads a 3D model based on file extension
 */
export async function loadModel(url: string): Promise<THREE.Object3D> {
  // Check cache first
  if (modelCache.has(url)) {
    // Clone the cached model to avoid reference issues
    return modelCache.get(url)!.clone();
  }

  const fileExtension = url.split('.').pop()?.toLowerCase();
  let model: THREE.Object3D;

  try {
    switch (fileExtension) {
      case 'glb':
      case 'gltf':
        model = await loadGLTF(url);
        break;
      case 'fbx':
        model = await loadFBX(url);
        break;
      case 'obj':
        model = await loadOBJ(url);
        break;
      case 'dae':
        model = await loadCollada(url);
        break;
      default:
        throw new Error(`Unsupported file format: ${fileExtension}`);
    }

    // Add to cache
    modelCache.set(url, model.clone());
    
    return model;
  } catch (error) {
    console.error(`Error loading model ${url}:`, error);
    throw error;
  }
}

/**
 * Loads a GLTF/GLB model with DracoLoader support
 */
function loadGLTF(url: string): Promise<THREE.Object3D> {
  return new Promise((resolve, reject) => {
    // Initialize loaders
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    
    // Configure Draco loader
    dracoLoader.setDecoderPath('/draco/');
    gltfLoader.setDRACOLoader(dracoLoader);
    
    // Load the model
    gltfLoader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        
        // Enable shadows for all meshes
        model.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        
        resolve(model);
      },
      (xhr) => {
        // Progress callback
        console.log(`${url} ${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      (error) => {
        console.error('Error loading GLTF model:', error);
        reject(error);
      }
    );
  });
}

/**
 * Loads an FBX model
 */
function loadFBX(url: string): Promise<THREE.Object3D> {
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader();
    
    loader.load(
      url,
      (object) => {
        // Enable shadows for all meshes
        object.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        
        resolve(object);
      },
      (xhr) => {
        // Progress callback
        console.log(`${url} ${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      (error) => {
        console.error('Error loading FBX model:', error);
        reject(error);
      }
    );
  });
}

/**
 * Loads an OBJ model
 */
function loadOBJ(url: string): Promise<THREE.Object3D> {
  return new Promise((resolve, reject) => {
    const loader = new OBJLoader();
    
    loader.load(
      url,
      (object) => {
        // Enable shadows for all meshes
        object.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        
        resolve(object);
      },
      (xhr) => {
        // Progress callback
        console.log(`${url} ${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      (error) => {
        console.error('Error loading OBJ model:', error);
        reject(error);
      }
    );
  });
}

/**
 * Loads a Collada DAE model
 */
function loadCollada(url: string): Promise<THREE.Object3D> {
  return new Promise((resolve, reject) => {
    const loader = new ColladaLoader();
    
    loader.load(
      url,
      (collada) => {
        const model = collada.scene;
        
        // Enable shadows for all meshes
        model.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        
        resolve(model);
      },
      (xhr) => {
        // Progress callback
        console.log(`${url} ${(xhr.loaded / xhr.total) * 100}% loaded`);
      },
      (error) => {
        console.error('Error loading Collada model:', error);
        reject(error);
      }
    );
  });
}

/**
 * Gets the bounding box of a model
 */
export function getModelBoundingBox(model: THREE.Object3D): THREE.Box3 {
  const boundingBox = new THREE.Box3();
  
  // Calculate bounding box
  model.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      // Update the geometry's bounding box if needed
      if (!node.geometry.boundingBox) {
        node.geometry.computeBoundingBox();
      }
      
      // Create a bounding box for the current mesh
      const meshBoundingBox = node.geometry.boundingBox!.clone();
      // Transform the bounding box to world space
      meshBoundingBox.applyMatrix4(node.matrixWorld);
      // Expand the overall bounding box
      boundingBox.union(meshBoundingBox);
    }
  });
  
  return boundingBox;
}

/**
 * Centers a model at the origin
 */
export function centerModel(model: THREE.Object3D): void {
  const boundingBox = getModelBoundingBox(model);
  const center = new THREE.Vector3();
  
  // Calculate the center
  boundingBox.getCenter(center);
  
  // Move the model to center it at origin
  model.position.sub(center);
}

/**
 * Normalizes the scale of a model to fit within a unit cube
 */
export function normalizeModelScale(model: THREE.Object3D, targetSize: number = 1): void {
  const boundingBox = getModelBoundingBox(model);
  
  // Calculate the current size
  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  
  // Find the largest dimension
  const maxDimension = Math.max(size.x, size.y, size.z);
  
  // Calculate the scale factor
  const scaleFactor = targetSize / maxDimension;
  
  // Apply the scale
  model.scale.multiplyScalar(scaleFactor);
} 