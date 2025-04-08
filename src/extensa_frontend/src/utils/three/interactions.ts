import * as THREE from 'three';
// Aggiungiamo dichiarazioni di tipo per i moduli
import type { TransformControls as TransformControlsType } from 'three/examples/jsm/controls/TransformControls.js';
import type { OrbitControls as OrbitControlsType } from 'three/examples/jsm/controls/OrbitControls.js';
// Importiamo per l'uso effettivo
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Definisco l'interfaccia per l'evento dragging-changed
interface DraggingChangedEvent extends THREE.Event {
  value: boolean;
}

/**
 * Configura i controlli di trasformazione
 */
export function setupTransformControls(
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  orbitControls: OrbitControls
): TransformControls {
  const transformControls = new TransformControls(camera, renderer.domElement);
  
  // Disabilita orbita mentre si modifica un oggetto
  // Utilizziamo any perché l'evento ha una struttura non standard
  transformControls.addEventListener('dragging-changed', (event: any) => {
    orbitControls.enabled = !event.value;
  });
  
  return transformControls;
}

/**
 * Calcola il punto di intersezione di un raggio con un piano
 */
export function getIntersectionPoint(
  event: MouseEvent,
  camera: THREE.Camera,
  plane: THREE.Mesh,
  domElement: HTMLElement
): THREE.Vector3 | null {
  // Calcolo posizione mouse normalizzata
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / domElement.clientHeight) * 2 + 1;
  
  // Raycast
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  
  // Calcolo intersezioni
  const intersects = raycaster.intersectObject(plane);
  
  if (intersects.length > 0) {
    return intersects[0].point;
  }
  
  return null;
}

/**
 * Trova l'oggetto selezionato dalla lista di modelli
 */
export function findSelectedObject(
  event: MouseEvent,
  camera: THREE.Camera,
  objects: THREE.Object3D[],
  domElement: HTMLElement
): THREE.Object3D | null {
  // Calcolo posizione mouse normalizzata
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / domElement.clientHeight) * 2 + 1;
  
  // Raycast
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  
  // Calcolo intersezioni
  const intersects = raycaster.intersectObjects(objects, true);
  
  if (intersects.length > 0) {
    return intersects[0].object;
  }
  
  return null;
}

/**
 * Definizione dell'interfaccia per i modelli
 */
interface ModelData {
  path: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}

/**
 * Salva la scena in formato JSON
 */
export function exportScene(models: ModelData[]): string {
  const scene = {
    models: models.map(model => ({
      path: model.path,
      position: {
        x: model.position.x,
        y: model.position.y,
        z: model.position.z
      },
      rotation: {
        x: model.rotation.x,
        y: model.rotation.y,
        z: model.rotation.z
      },
      scale: {
        x: model.scale.x,
        y: model.scale.y,
        z: model.scale.z
      }
    }))
  };
  
  return JSON.stringify(scene);
}

/**
 * Interfaccia per il formato della scena esportata
 */
interface SceneData {
  models: {
    path: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  }[];
}

/**
 * Carica la scena da formato JSON
 */
export function importScene(json: string): SceneData {
  try {
    return JSON.parse(json) as SceneData;
  } catch (error) {
    console.error('Errore nel parsing del JSON:', error);
    return { models: [] };
  }
} 