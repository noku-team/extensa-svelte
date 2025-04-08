import * as THREE from 'three';

// Constants for coordinate conversion
const EARTH_RADIUS = 6371000; // Earth's radius in meters
const DEG_TO_RAD = Math.PI / 180;

// Export the GeoCoordinates interface
export interface GeoCoordinates {
    latitude: number;
    longitude: number;
    altitude?: number;
}

/**
 * Converte coordinate geografiche (lat, lng) in coordinate cartesiane (x, z)
 * usando la proiezione di Mercatore
 */
export function geoToCartesian(coords: GeoCoordinates, origin: GeoCoordinates): THREE.Vector3 {
    // Convert to radians
    const lat1 = coords.latitude * DEG_TO_RAD;
    const lon1 = coords.longitude * DEG_TO_RAD;
    const lat2 = origin.latitude * DEG_TO_RAD;
    const lon2 = origin.longitude * DEG_TO_RAD;

    // Calculate differences
    const dLat = lat1 - lat2;
    const dLon = lon1 - lon2;

    // Calculate distances in meters
    const x = dLon * EARTH_RADIUS * Math.cos(lat2);
    const z = dLat * EARTH_RADIUS;

    return new THREE.Vector3(x, coords.altitude || 0, z);
}

/**
 * Converte coordinate cartesiane (x, z) in coordinate geografiche (lat, lng)
 */
export function cartesianToGeo(position: THREE.Vector3, origin: GeoCoordinates): GeoCoordinates {
    const lat2 = origin.latitude * DEG_TO_RAD;
    
    // Convert back to degrees
    const dLat = position.z / EARTH_RADIUS;
    const dLon = position.x / (EARTH_RADIUS * Math.cos(lat2));
    
    return {
        latitude: origin.latitude + (dLat / DEG_TO_RAD),
        longitude: origin.longitude + (dLon / DEG_TO_RAD),
        altitude: position.y
    };
}

/**
 * Crea una texture di mappa vuota con griglia
 */
export function createGridMapTexture(width: number = 1024, height: number = 1024): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d')!;
  
  // Sfondo bianco
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, width, height);
  
  // Disegna griglia
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  
  // Griglia principale
  const gridSize = 64;
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // Griglia secondaria (più scura)
  ctx.strokeStyle = '#bdbdbd';
  ctx.lineWidth = 2;
  
  const majorGridSize = gridSize * 4;
  for (let x = 0; x <= width; x += majorGridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  for (let y = 0; y <= height; y += majorGridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // Disegna sistema di riferimento al centro
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Assi
  ctx.strokeStyle = '#f44336'; // Rosso per asse X
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX - 100, centerY);
  ctx.lineTo(centerX + 100, centerY);
  ctx.stroke();
  
  ctx.strokeStyle = '#4caf50'; // Verde per asse Y/Z
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - 100);
  ctx.lineTo(centerX, centerY + 100);
  ctx.stroke();
  
  // Etichette
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('N', centerX, centerY - 120);
  ctx.fillText('E', centerX + 120, centerY);
  ctx.fillText('S', centerX, centerY + 120);
  ctx.fillText('W', centerX - 120, centerY);
  
  // Crea texture da canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  return texture;
}

/**
 * Crea un materiale per la mappa con la texture specificata
 */
export function createMapMaterial(texture: THREE.Texture): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
    roughness: 0.8,
    metalness: 0.2
  });
  
  // Imposta receiveShadow sul materiale creato
  material.needsUpdate = true;
  
  return material;
}

/**
 * Aggiunge un marker alla posizione specificata
 */
export function createMarker(position: THREE.Vector3, color: number = 0xff0000): THREE.Mesh {
  // Crea geometria conica per il marker
  const geometry = new THREE.ConeGeometry(0.2, 0.5, 16);
  geometry.rotateX(Math.PI);
  
  // Materiale del marker
  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.5,
    metalness: 0.2
  });
  
  // Crea mesh e posiziona
  const marker = new THREE.Mesh(geometry, material);
  marker.position.copy(position);
  marker.position.y += 0.25; // Alza leggermente il marker
  
  return marker;
} 