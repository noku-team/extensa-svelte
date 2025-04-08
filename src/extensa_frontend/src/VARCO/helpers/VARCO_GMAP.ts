import * as THREE from 'three';
import { VARCO } from "./VARCO";

export class VARCOGMAP {
  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Inizializzazione dei metodi per Google Maps
    this.initGMapMethods();
  }

  private initGMapMethods(): void {
    /**
     * Inizializza una mappa Google
     * @param containerId ID del container HTML dove inserire la mappa
     * @param options Opzioni di configurazione della mappa
     * @param callback Funzione di callback dopo l'inizializzazione
     */
    VARCO.f.initGoogleMap = (
      containerId: string, 
      options?: google.maps.MapOptions, 
      callback?: (map: google.maps.Map) => void
    ): google.maps.Map | null => {
      const container = document.getElementById(containerId);
      
      if (!container) {
        console.error(`Container with ID ${containerId} not found`);
        return null;
      }
      
      const defaultOptions: google.maps.MapOptions = {
        center: { lat: 0, lng: 0 },
        zoom: 2,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      
      const mapOptions = { ...defaultOptions, ...options };
      const map = new google.maps.Map(container, mapOptions);
      
      if (callback) {
        callback(map);
      }
      
      return map;
    };

    /**
     * Aggiunge un marker sulla mappa
     * @param map Istanza della mappa Google
     * @param position Posizione del marker
     * @param options Opzioni del marker
     */
    VARCO.f.addMapMarker = (
      map: google.maps.Map, 
      position: google.maps.LatLngLiteral, 
      options?: google.maps.MarkerOptions
    ): google.maps.Marker => {
      const defaultOptions: google.maps.MarkerOptions = {
        position,
        map
      };
      
      const markerOptions = { ...defaultOptions, ...options };
      return new google.maps.Marker(markerOptions);
    };
  }
}

// Dichiarazione del namespace google per TypeScript
declare global {
  namespace google {
    namespace maps {
      class Map {
        constructor(container: HTMLElement, options?: MapOptions);
      }
      
      class Marker {
        constructor(options: MarkerOptions);
      }
      
      interface MapOptions {
        center?: LatLngLiteral;
        zoom?: number;
        mapTypeId?: string;
        [key: string]: any;
      }
      
      interface MarkerOptions {
        position?: LatLngLiteral;
        map?: Map;
        title?: string;
        icon?: string;
        [key: string]: any;
      }
      
      interface LatLngLiteral {
        lat: number;
        lng: number;
      }
      
      namespace MapTypeId {
        const ROADMAP: string;
        const SATELLITE: string;
        const HYBRID: string;
        const TERRAIN: string;
      }
    }
  }
}

// Inizializza il modulo GMAP
new VARCOGMAP(); 