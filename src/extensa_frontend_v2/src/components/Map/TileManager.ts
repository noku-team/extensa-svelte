import * as THREE from 'three';
import { MapType } from '../../types/map';

export class TileManager {
  private scene: THREE.Scene;
  private tileSize: number;
  private loadedTiles: Map<string, THREE.Mesh>;
  private tileQueue: Set<string>;
  private maxZoom: number;
  private minZoom: number;
  private currentMapType: MapType;
  private textureLoader: THREE.TextureLoader;
  private loadingErrorTiles: Set<string>;
  private firstUpdate: boolean = true;
  private textureCache: Map<string, THREE.Texture>;
  private lastCameraPosition: THREE.Vector3;
  private lastZoom: number;
  private readonly CAMERA_MOVEMENT_THRESHOLD = 1000;
  private readonly ZOOM_CHANGE_THRESHOLD = 0.1; // Ridotto per un zoom più fluido
  private readonly TILE_LOAD_RADIUS = 3;
  private readonly TILE_UNLOAD_RADIUS = 5;

  // Costanti per il calcolo delle coordinate
  private readonly EARTH_CIRCUMFERENCE = 40075016.686;
  private readonly TILE_SIZE = 256;

  constructor(scene: THREE.Scene, tileSize: number, initialMapType: MapType = MapType.OSM) {
    this.scene = scene;
    this.tileSize = tileSize;
    this.loadedTiles = new Map();
    this.tileQueue = new Set();
    this.loadingErrorTiles = new Set();
    this.textureCache = new Map();
    this.maxZoom = 19;
    this.minZoom = 0;
    this.currentMapType = initialMapType;
    this.textureLoader = new THREE.TextureLoader();
    this.textureLoader.crossOrigin = 'anonymous';
    this.lastCameraPosition = new THREE.Vector3();
    this.lastZoom = 0;
  }

  public setMapType(mapType: MapType): void {
    console.log(`Changing map type to: ${mapType}`);
    if (this.currentMapType !== mapType) {
      this.currentMapType = mapType;
      // Clear all existing tiles
      this.clearAllTiles();
    }
  }

  public getCurrentMapType(): MapType {
    return this.currentMapType;
  }

  private clearAllTiles(): void {
    for (const [_, mesh] of this.loadedTiles) {
      this.scene.remove(mesh);
    }
    this.loadedTiles.clear();
    this.tileQueue.clear();
    this.loadingErrorTiles.clear();
  }

  public updateTiles(cameraPosition: THREE.Vector3, zoom: number): void {
    const cameraMoved = this.lastCameraPosition.distanceTo(cameraPosition) > this.CAMERA_MOVEMENT_THRESHOLD;
    const zoomChanged = Math.abs(this.lastZoom - zoom) > this.ZOOM_CHANGE_THRESHOLD;

    if (!cameraMoved && !zoomChanged && !this.firstUpdate) {
      return;
    }

    this.lastCameraPosition.copy(cameraPosition);
    this.lastZoom = zoom;

    if (this.firstUpdate) {
      this.clearAllTiles();
      this.firstUpdate = false;
    }

    const visibleTiles = this.calculateVisibleTiles(cameraPosition, zoom);
    this.loadVisibleTiles(visibleTiles, zoom);
  }

  private calculateVisibleTiles(cameraPosition: THREE.Vector3, zoom: number): Set<string> {
    const visibleTiles = new Set<string>();
    const n = Math.pow(2, zoom);
    
    // Calcola le coordinate della tile centrale
    const metersPerTile = this.EARTH_CIRCUMFERENCE / n;
    const tileX = Math.floor((cameraPosition.x + this.EARTH_CIRCUMFERENCE/2) / metersPerTile);
    const tileY = Math.floor((cameraPosition.z + this.EARTH_CIRCUMFERENCE/2) / metersPerTile);
    
    // Assicurati che le coordinate delle tile siano valide
    const validTileX = Math.max(0, Math.min(n - 1, tileX));
    const validTileY = Math.max(0, Math.min(n - 1, tileY));
    
    // Carica le tile in un'area quadrata attorno alla tile centrale
    for (let x = validTileX - this.TILE_LOAD_RADIUS; x <= validTileX + this.TILE_LOAD_RADIUS; x++) {
      for (let y = validTileY - this.TILE_LOAD_RADIUS; y <= validTileY + this.TILE_LOAD_RADIUS; y++) {
        if (x >= 0 && x < n && y >= 0 && y < n) {
          visibleTiles.add(`${zoom}_${x}_${y}`);
        }
      }
    }
    
    return visibleTiles;
  }

  private async loadVisibleTiles(visibleTiles: Set<string>, zoom: number): Promise<void> {
    const tilesToLoad = Array.from(visibleTiles)
      .filter(tileId => !this.loadedTiles.has(tileId) && !this.tileQueue.has(tileId));

    // Carica le tile in batch più piccoli
    const batchSize = 2;
    for (let i = 0; i < tilesToLoad.length; i += batchSize) {
      const batch = tilesToLoad.slice(i, i + batchSize);
      const loadPromises = batch.map(tileId => {
        this.tileQueue.add(tileId);
        return this.loadTileWithRetry(tileId, zoom)
          .finally(() => this.tileQueue.delete(tileId));
      });
      
      await Promise.all(loadPromises);
    }

    // Rimuovi solo le tile molto lontane
    this.removeDistantTiles(visibleTiles);
  }

  private removeDistantTiles(visibleTiles: Set<string>): void {
    const tilesToRemove = new Set<string>();
    
    for (const [tileId, mesh] of this.loadedTiles) {
      if (!visibleTiles.has(tileId)) {
        const [zoom, x, y] = tileId.split('_').map(Number);
        const n = Math.pow(2, zoom);
        const tileX = Math.floor((this.lastCameraPosition.x + this.EARTH_CIRCUMFERENCE/2) / (this.EARTH_CIRCUMFERENCE / n));
        const tileY = Math.floor((this.lastCameraPosition.z + this.EARTH_CIRCUMFERENCE/2) / (this.EARTH_CIRCUMFERENCE / n));
        
        const distance = Math.max(Math.abs(x - tileX), Math.abs(y - tileY));
        if (distance > this.TILE_UNLOAD_RADIUS) {
          tilesToRemove.add(tileId);
          this.scene.remove(mesh);
        }
      }
    }
    
    for (const tileId of tilesToRemove) {
      this.loadedTiles.delete(tileId);
    }
  }

  private async loadTileWithRetry(tileId: string, zoom: number, retryCount = 0): Promise<void> {
    const maxRetries = 3;
    try {
      await this.loadTile(tileId, zoom);
      this.loadingErrorTiles.delete(tileId);
    } catch (err) {
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return this.loadTileWithRetry(tileId, zoom, retryCount + 1);
      } else {
        this.loadingErrorTiles.add(tileId);
        throw err;
      }
    }
  }

  private async loadTile(tileId: string, zoom: number): Promise<void> {
    const [tileZoom, x, y] = tileId.split('_').map(Number);
    
    try {
      const cacheKey = `${this.currentMapType}_${tileZoom}_${x}_${y}`;
      let texture = this.textureCache.get(cacheKey);

      if (!texture) {
        texture = await this.loadTileTexture(tileZoom, x, y);
        this.textureCache.set(cacheKey, texture);
      }

      const metersPerTile = this.EARTH_CIRCUMFERENCE / Math.pow(2, zoom);
      const geometry = new THREE.PlaneGeometry(metersPerTile, metersPerTile);
      const material = new THREE.MeshStandardMaterial({ 
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        roughness: 0.8,
        metalness: 0.2
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      const position = this.getTileWorldPosition(x, y, tileZoom);
      
      mesh.position.set(position.x, 0, position.y);
      mesh.rotation.x = -Math.PI / 2;
      
      this.scene.add(mesh);
      this.loadedTiles.set(tileId, mesh);
      
    } catch (error) {
      console.error(`Error loading tile ${tileId}:`, error);
      throw error;
    }
  }

  private getTileWorldPosition(x: number, y: number, zoom: number): THREE.Vector2 {
    const n = Math.pow(2, zoom);
    const metersPerTile = this.EARTH_CIRCUMFERENCE / n;
    
    // Calcola le coordinate mondiali della tile
    // Assicurati che le coordinate siano allineate correttamente
    const x3d = (x * metersPerTile) - (this.EARTH_CIRCUMFERENCE / 2);
    const z3d = (y * metersPerTile) - (this.EARTH_CIRCUMFERENCE / 2);
    
    return new THREE.Vector2(x3d, z3d);
  }

  private getTileUrl(zoom: number, x: number, y: number): string {
    switch (this.currentMapType) {
      case MapType.OSM:
        // OpenStreetMap
        const subdomains = ['a', 'b', 'c'];
        const subdomain = subdomains[Math.floor(Math.random() * subdomains.length)];
        return `https://${subdomain}.tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
      
      case MapType.GOOGLE:
      default:
        // Google Maps satellite imagery come default
        // lyrs=s: satellite only, lyrs=y: satellite + labels
        return `https://mt1.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${zoom}`;
    }
  }

  private async loadTileTexture(zoom: number, x: number, y: number): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      const url = this.getTileUrl(zoom, x, y);
      console.log(`Loading tile texture from URL: ${url}`);
      
      this.textureLoader.load(
        url,
        (texture) => {
          console.log(`Successfully loaded texture for tile ${zoom}/${x}/${y}`);
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          resolve(texture);
        },
        (progress) => {
          console.log(`Loading progress for tile ${zoom}/${x}/${y}: ${Math.round(progress.loaded / progress.total * 100)}%`);
        },
        (error) => {
          console.error(`Error loading tile texture ${zoom}/${x}/${y} from ${url}:`, error);
          // Create fallback texture (checkerboard pattern)
          console.log(`Creating fallback texture for ${zoom}/${x}/${y}`);
          const fallbackTexture = this.createFallbackTexture();
          resolve(fallbackTexture);
        }
      );
    });
  }

  private createFallbackTexture(): THREE.Texture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#FF00FF'; // Magenta
      context.fillRect(0, 0, size, size);
      
      // Draw tile coordinates
      context.fillStyle = 'white';
      context.font = 'bold 24px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('Missing Tile', size/2, size/2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    return texture;
  }

  // Convert tile coordinates to a quadkey for Bing Maps
  private quadKey(x: number, y: number, zoom: number): string {
    let quadKey = '';
    for (let i = zoom; i > 0; i--) {
      let digit = 0;
      const mask = 1 << (i - 1);
      if ((x & mask) !== 0) {
        digit += 1;
      }
      if ((y & mask) !== 0) {
        digit += 2;
      }
      quadKey += digit;
    }
    return quadKey;
  }

  public calculateTileWorldPosition(x: number, y: number, zoom: number): THREE.Vector2 {
    return this.getTileWorldPosition(x, y, zoom);
  }
}