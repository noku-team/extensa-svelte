import { writable } from 'svelte/store';
import { MapType, type MapState } from '../types/map';

// Initial state with Google Maps as default and Lugano as center
const initialState: MapState = {
  mapType: MapType.GOOGLE,
  zoomLevel: 15,
  center: {
    lat: 46.0037,
    lng: 8.9511
  },
  zoom: 15,
  bearing: 0,
  pitch: 0,
  loadedTiles: new Set<string>()
};

export const mapStore = writable<MapState>(initialState); 