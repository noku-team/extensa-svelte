export enum MapType {
    OSM = 'OSM',
    GOOGLE = 'GM',
    BING = 'BM',
    SWISS = 'GIS'
}

export interface MapState {
    mapType: MapType;
    zoomLevel: number;
    center: {
        lat: number;
        lng: number;
    };
    zoom: number;
    bearing: number;
    pitch: number;
    loadedTiles: Set<string>;
}

export interface Tile {
  x: number;
  y: number;
  z: number;
  url: string;
}

export interface MapControls {
  enableRotation: boolean;
  enableZoom: boolean;
  enablePan: boolean;
  minZoom: number;
  maxZoom: number;
} 