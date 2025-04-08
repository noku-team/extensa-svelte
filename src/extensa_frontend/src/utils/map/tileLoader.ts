import * as THREE from 'three';

// Tipi di mappa supportati
export enum MapType {
  OSM = 'OSM',     // OpenStreetMap
  GM = 'GM',       // Google Maps
  BM = 'BM',       // Bing Maps
  GIS = 'GIS'      // GeoAdmin Switzerland
}

// Definizione di un tile
export interface MapTile {
  x: number;
  y: number;
  z: number;
  type: MapType;
}

// Definizione del livello di zoom
export interface ZoomLevel {
  H: number;       // Dimensione orizzontale in tiles
  V: number;       // Dimensione verticale in tiles
  zoom: number;    // Valore di zoom
  alt: number;     // Altitudine corrispondente a questo zoom
  zoomNum: number; // Numero intero di zoom
}

// Interfaccia per le coordinate geografiche
export interface GeoCoordinates {
  lng: number;
  lat: number;
  alt: number;
}

// Gestione dei tile di mappa
export class TileLoader {
  private scene: THREE.Scene;
  private tileGroup: THREE.Group;
  private mapType: MapType = MapType.OSM;
  private width: number = 40075016.686;  // Circonferenza della terra in metri
  private height: number = 40075016.686;
  private zoomMap: number = 1;
  private mapNumH: number = 2;  // Numero di tile orizzontali da caricare
  private mapNumV: number = 2;  // Numero di tile verticali da caricare
  private actualMapTiles: [number, number][] = []; // Tiles attualmente caricate [x, y]
  private zoomLevels: ZoomLevel[] = [];
  private textureLoader: THREE.TextureLoader;
  private timerStep: number = 1000; // ms
  private lastUpdateTime: number = 0;
  private tileLoadingQueue: Map<string, boolean> = new Map();
  private mapPlane?: THREE.Mesh;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.tileGroup = new THREE.Group();
    this.tileGroup.name = 'tilesList';
    this.tileGroup.rotation.x = -Math.PI / 2;
    this.scene.add(this.tileGroup);
    this.textureLoader = new THREE.TextureLoader();
    
    // Inizializza i livelli di zoom
    this.initZoomLevels();
  }
  
  // Inizializza i livelli di zoom come nell'esempio originale
  private initZoomLevels(): void {
    const fov = 60.0;
    this.zoomLevels = [
      { H: 1, V: 1, zoom: 0.0, alt: (this.width / (fov * 0.01)), zoomNum: 0 },
      { H: 2, V: 2, zoom: 0.25, alt: ((this.width / 2) / (fov * 0.01)), zoomNum: 1 },
      { H: 4, V: 4, zoom: 0.5, alt: ((this.width / 4) / (fov * 0.01)), zoomNum: 2 },
      { H: 8, V: 8, zoom: 1.0, alt: ((this.width / 8) / (fov * 0.01)), zoomNum: 3 },
      { H: 16, V: 16, zoom: 2.0, alt: ((this.width / 16) / (fov * 0.01)), zoomNum: 4 },
      { H: 32, V: 32, zoom: 4.0, alt: ((this.width / 32) / (fov * 0.01)), zoomNum: 5 },
      { H: 64, V: 64, zoom: 8.00, alt: ((this.width / 64) / (fov * 0.01)), zoomNum: 6 },
      { H: 128, V: 128, zoom: 16.00, alt: ((this.width / 128) / (fov * 0.01)), zoomNum: 7 },
      { H: 256, V: 256, zoom: 32.00, alt: ((this.width / 256) / (fov * 0.01)), zoomNum: 8 },
      { H: 512, V: 512, zoom: 70.00, alt: ((this.width / 512) / (fov * 0.01)), zoomNum: 9 },
      { H: 1024, V: 1024, zoom: 140.00, alt: ((this.width / 1024) / (fov * 0.01)), zoomNum: 10 },
      { H: 2048, V: 2048, zoom: 300.00, alt: ((this.width / 2048) / (fov * 0.01)), zoomNum: 11 },
      { H: 4096, V: 4096, zoom: 700.00, alt: ((this.width / 4096) / (fov * 0.01)), zoomNum: 12 },
      { H: 8192, V: 8192, zoom: 1500.00, alt: ((this.width / 8192) / (fov * 0.01)), zoomNum: 13 },
      { H: 16384, V: 16384, zoom: 2500.00, alt: ((this.width / 16384) / (fov * 0.01)), zoomNum: 14 },
      { H: 32768, V: 32768, zoom: 5000.00, alt: ((this.width / 32768) / (fov * 0.01)), zoomNum: 15 },
      { H: 65536, V: 65536, zoom: 9000.00, alt: ((this.width / 65536) / (fov * 0.01)), zoomNum: 16 },
      { H: 131072, V: 131072, zoom: 18000.00, alt: ((this.width / 131072) / (fov * 0.01)), zoomNum: 17 },
      { H: 262144, V: 262144, zoom: 36000.00, alt: ((this.width / 262144) / (fov * 0.01)), zoomNum: 18 },
      { H: 524288, V: 524288, zoom: 72000.00, alt: ((this.width / 524288) / (fov * 0.01)), zoomNum: 19 },
      { H: 262144, V: 262144, zoom: 36000.00, alt: 0.0, zoomNum: 20 }
    ];
  }
  
  // Imposta il piano di base della mappa
  public setMapPlane(width: number, height: number): void {
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      visible: true,
      transparent: true,
      opacity: 0.1
    });
    
    this.mapPlane = new THREE.Mesh(geometry, material);
    this.mapPlane.name = 'MapRif_mesh';
    this.mapPlane.rotation.x = -Math.PI / 2;
    this.mapPlane.receiveShadow = true;
    this.scene.add(this.mapPlane);
  }
  
  // Imposta il tipo di mappa
  public setMapType(type: MapType): void {
    this.mapType = type;
    this.clearAllTiles(); // Pulisci le tile esistenti
    this.actualMapTiles = []; // Resetta le tile caricate
  }
  
  // Costruisci l'URL della tile in base al tipo di mappa e coordinate
  private getTileUrl(x: number, y: number, zoom: number): string {
    switch(this.mapType) {
      case MapType.OSM:
        return `https://a.tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
      
      case MapType.GM:
        return `https://mt1.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${zoom}`;
      
      case MapType.BM:
        // Placeholder per Bing Maps - richiede API key
        return '';
      
      case MapType.GIS:
        return `https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/${zoom}/${x}/${y}.jpeg`;
      
      default:
        return '';
    }
  }
  
  // Aggiorna le tile in base alla posizione della camera
  public updateTiles(cameraPosition: THREE.Vector3, cameraDistance: number): void {
    const now = Date.now();
    
    // Limita la frequenza di aggiornamento
    if (now - this.lastUpdateTime < this.timerStep) {
      return;
    }
    this.lastUpdateTime = now;
    
    // Determina il livello di zoom in base alla distanza della camera
    let zoom = 0;
    for (let i = 0; i < this.zoomLevels.length - 1; i++) {
      if (cameraDistance < this.zoomLevels[i].alt && cameraDistance > this.zoomLevels[i + 1].alt) {
        zoom = this.zoomLevels[i].zoomNum + 1;
        if (zoom > 19) zoom = 19;
        if (zoom < 0) zoom = 0;
        break;
      }
    }
    
    this.zoomMap = zoom;
    
    // Intersezione con il piano della mappa per determinare la posizione
    if (!this.mapPlane) return;
    
    const raycaster = new THREE.Raycaster(
      cameraPosition, 
      new THREE.Vector3(0, -1, 0)
    );
    
    const intersects = raycaster.intersectObject(this.mapPlane);
    if (intersects.length === 0) return;
    
    const intersection = intersects[0];
    const uv = intersection.uv;
    
    if (!uv) return;
    
    // Calcola il settore della mappa
    const sectorX = Math.floor(this.zoomLevels[this.zoomMap].H * uv.x);
    const sectorY = Math.floor(this.zoomLevels[this.zoomMap].V * (1.0 - uv.y));
    
    // Genera la lista di tile da caricare
    const newTilesList: [number, number][] = [];
    for (let i = -this.mapNumH; i < this.mapNumH + 1; i++) {
      for (let k = -this.mapNumV; k < this.mapNumV + 1; k++) {
        newTilesList.push([sectorX + i, sectorY + k]);
      }
    }
    
    // Determina quali tile aggiungere e quali rimuovere
    const createTilesList: [number, number][] = [];
    const deleteTilesList: [number, number][] = [];
    
    // Trova le tile da eliminare
    for (const tile of this.actualMapTiles) {
      let exists = false;
      for (const newTile of newTilesList) {
        if (tile[0] === newTile[0] && tile[1] === newTile[1]) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        deleteTilesList.push(tile);
      }
    }
    
    // Trova le tile da creare
    for (const newTile of newTilesList) {
      let exists = false;
      for (const tile of this.actualMapTiles) {
        if (newTile[0] === tile[0] && newTile[1] === tile[1]) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        createTilesList.push(newTile);
      }
    }
    
    // Rimuovi le tile obsolete
    this.removeTiles(deleteTilesList);
    
    // Aggiungi le nuove tile
    for (const tile of createTilesList) {
      this.loadTile(tile[0], tile[1], this.zoomMap);
    }
    
    // Aggiorna la lista delle tile attive
    this.actualMapTiles = newTilesList;
  }
  
  // Carica una specifica tile
  private loadTile(x: number, y: number, zoom: number): void {
    // Controlla che le coordinate siano valide
    if (x < 0 || y < 0) return;
    if (x >= this.zoomLevels[zoom].H || y >= this.zoomLevels[zoom].V) return;
    
    const tileUrl = this.getTileUrl(x, y, zoom);
    if (!tileUrl) return;
    
    const tileKey = `tile_${zoom}_${x}_${y}`;
    
    // Evita caricamenti duplicati
    if (this.tileLoadingQueue.has(tileKey)) return;
    this.tileLoadingQueue.set(tileKey, true);
    
    // Calcola la posizione e la dimensione della tile
    const tileWidth = this.width / this.zoomLevels[zoom].H;
    const tileHeight = this.height / this.zoomLevels[zoom].V;
    const startX = (this.width / this.zoomLevels[zoom].H) * x;
    const startY = (this.height / this.zoomLevels[zoom].V) * y;
    
    // Posiziona il piano
    const posX = startX - (this.width * 0.5) + (tileWidth * 0.5);
    const posY = (startY - (this.height * 0.5) + (tileHeight * 0.5)) * -1;
    
    // Carica la texture
    this.textureLoader.load(
      tileUrl,
      (texture) => {
        // Crea il materiale
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          opacity: 0.0
        });
        
        // Crea la geometria e il mesh
        const geometry = new THREE.PlaneGeometry(tileWidth, tileHeight);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = tileKey;
        mesh.position.set(posX, 0, posY);
        
        // Aggiunge la tile al gruppo
        this.tileGroup.add(mesh);
        
        // Anima l'opacità per un effetto di fade-in
        this.animateTileOpacity(material);
        
        // Rimuovi dalla coda di caricamento
        this.tileLoadingQueue.delete(tileKey);
      },
      undefined,
      (error) => {
        console.error(`Errore caricamento tile: ${tileKey}`, error);
        this.tileLoadingQueue.delete(tileKey);
      }
    );
  }
  
  // Animazione per il fade-in delle tile
  private animateTileOpacity(material: THREE.Material): void {
    const startOpacity = 0.0;
    const targetOpacity = 1.0;
    const duration = 500; // ms
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (material instanceof THREE.MeshBasicMaterial) {
        material.opacity = startOpacity + (targetOpacity - startOpacity) * progress;
        
        if (progress >= 1) {
          material.transparent = material.opacity < 1.0;
          return;
        }
        
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }
  
  // Rimuove le tile specificate
  private removeTiles(tiles: [number, number][]): void {
    for (const tile of tiles) {
      const tileKey = `tile_${this.zoomMap}_${tile[0]}_${tile[1]}`;
      const tileObject = this.tileGroup.getObjectByName(tileKey);
      
      if (tileObject) {
        this.tileGroup.remove(tileObject);
        
        // Rilascia le risorse
        if (tileObject instanceof THREE.Mesh) {
          if (tileObject.geometry) {
            tileObject.geometry.dispose();
          }
          
          if (tileObject.material) {
            const materials = Array.isArray(tileObject.material) 
              ? tileObject.material 
              : [tileObject.material];
              
            for (const material of materials) {
              if (material.map) {
                material.map.dispose();
              }
              material.dispose();
            }
          }
        }
      }
    }
  }
  
  // Pulisce tutte le tile
  public clearAllTiles(): void {
    while (this.tileGroup.children.length > 0) {
      const child = this.tileGroup.children[0];
      this.tileGroup.remove(child);
      
      // Rilascia le risorse
      if (child instanceof THREE.Mesh) {
        if (child.geometry) {
          child.geometry.dispose();
        }
        
        if (child.material) {
          const materials = Array.isArray(child.material) 
            ? child.material 
            : [child.material];
            
          for (const material of materials) {
            if (material.map) {
              material.map.dispose();
            }
            material.dispose();
          }
        }
      }
    }
  }
  
  // Converte coordinate geografiche in posizione 3D sulla mappa
  public geoToPosition(coords: GeoCoordinates): THREE.Vector3 {
    // Implementazione semplificata - da sostituire con una proiezione reale
    const lonNorm = (coords.lng + 180) / 360; // Normalizza longitudine a [0,1]
    const latNorm = (90 - coords.lat) / 180;  // Normalizza latitudine a [0,1]
    
    const x = (lonNorm * this.width) - (this.width / 2);
    const z = ((latNorm * this.height) - (this.height / 2)) * -1;
    
    return new THREE.Vector3(x, coords.alt || 0, z);
  }
  
  // Converte posizione 3D in coordinate geografiche
  public positionToGeo(position: THREE.Vector3): GeoCoordinates {
    // Implementazione semplificata - da sostituire con una proiezione reale
    const lonNorm = (position.x + (this.width / 2)) / this.width;
    const latNorm = 1 - ((position.z * -1 + (this.height / 2)) / this.height);
    
    const lng = (lonNorm * 360) - 180;
    const lat = 90 - (latNorm * 180);
    
    return {
      lng,
      lat,
      alt: position.y
    };
  }
} 