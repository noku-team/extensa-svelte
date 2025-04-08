import * as THREE from 'three';
import { VARCO } from "./VARCO";

interface GeoPosition {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

interface DeviceOrientation {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
  absolute: boolean;
}

export class VARCOGpsCompass {
  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Inizializzazione delle proprietà e dei moduli GPS e compass
    this.initGpsCompassModule();
    this.initGpsMethods();
    this.initCompassMethods();
  }

  private initGpsCompassModule(): void {
    // Creazione dell'oggetto GPS/Compass nelle proprietà di VARCO
    if (!VARCO.p.DEVICES.LOCATION) {
      VARCO.p.DEVICES.LOCATION = {
        position: {
          latitude: 0,
          longitude: 0,
          altitude: 0,
          accuracy: 0,
          lastUpdate: 0
        },
        orientation: {
          alpha: 0,   // 0-360 gradi
          beta: 0,    // -180/+180 gradi
          gamma: 0,   // -90/+90 gradi
          accuracy: 0,
          lastUpdate: 0
        },
        watchId: null,
        isActive: false,
        hasPermission: false
      };
    }
  }

  private initGpsMethods(): void {
    /**
     * Chiede il permesso e inizia a tracciare la posizione GPS
     * @param callback Funzione da chiamare quando la posizione viene aggiornata
     * @param errorCallback Funzione da chiamare in caso di errore
     * @param options Opzioni per il tracciamento GPS
     */
    VARCO.f.startGPS = (
      callback?: (position: GeoPosition) => void,
      errorCallback?: (error: GeolocationPositionError) => void,
      options?: PositionOptions
    ): void => {
      if (!navigator.geolocation) {
        console.error('Geolocation is not supported by this browser');
        if (errorCallback) {
          const error = {
            code: 0,
            message: 'Geolocation is not supported by this browser',
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3
          } as GeolocationPositionError;
          errorCallback(error);
        }
        return;
      }

      const defaultOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      const geoOptions = { ...defaultOptions, ...options };

      // Success callback
      const onSuccess = (position: GeolocationPosition): void => {
        if (VARCO.p.DEVICES.LOCATION) {
          VARCO.p.DEVICES.LOCATION.position.latitude = position.coords.latitude;
          VARCO.p.DEVICES.LOCATION.position.longitude = position.coords.longitude;
          VARCO.p.DEVICES.LOCATION.position.altitude = position.coords.altitude || 0;
          VARCO.p.DEVICES.LOCATION.position.accuracy = position.coords.accuracy;
          VARCO.p.DEVICES.LOCATION.position.lastUpdate = position.timestamp;
          VARCO.p.DEVICES.LOCATION.hasPermission = true;
          VARCO.p.DEVICES.LOCATION.isActive = true;
        }

        if (callback) {
          callback(position as GeoPosition);
        }
      };

      // Error callback
      const onError = (error: GeolocationPositionError): void => {
        console.error('Error getting geolocation:', error.message);
        
        if (VARCO.p.DEVICES.LOCATION) {
          if (error.code === 1) { // PERMISSION_DENIED
            VARCO.p.DEVICES.LOCATION.hasPermission = false;
          }
          VARCO.p.DEVICES.LOCATION.isActive = false;
        }

        if (errorCallback) {
          errorCallback(error);
        }
      };

      // Avvia il tracciamento continuo
      if (VARCO.p.DEVICES.LOCATION) {
        // Se c'è già un tracciamento attivo, lo fermiamo
        if (VARCO.p.DEVICES.LOCATION.watchId !== null) {
          this.stopGPS();
        }

        VARCO.p.DEVICES.LOCATION.watchId = navigator.geolocation.watchPosition(
          onSuccess,
          onError,
          geoOptions
        );
      }
    };

    /**
     * Ferma il tracciamento GPS
     */
    VARCO.f.stopGPS = (): void => {
      if (VARCO.p.DEVICES.LOCATION && VARCO.p.DEVICES.LOCATION.watchId !== null) {
        navigator.geolocation.clearWatch(VARCO.p.DEVICES.LOCATION.watchId);
        VARCO.p.DEVICES.LOCATION.watchId = null;
        VARCO.p.DEVICES.LOCATION.isActive = false;
      }
    };

    /**
     * Ottiene la posizione GPS corrente una sola volta
     * @param callback Funzione da chiamare con la posizione
     * @param errorCallback Funzione da chiamare in caso di errore
     * @param options Opzioni per il GPS
     */
    VARCO.f.getCurrentPosition = (
      callback: (position: GeoPosition) => void,
      errorCallback?: (error: GeolocationPositionError) => void,
      options?: PositionOptions
    ): void => {
      if (!navigator.geolocation) {
        console.error('Geolocation is not supported by this browser');
        return;
      }

      const defaultOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: the5000,
        maximumAge: 0
      };

      const geoOptions = { ...defaultOptions, ...options };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (VARCO.p.DEVICES.LOCATION) {
            VARCO.p.DEVICES.LOCATION.position.latitude = position.coords.latitude;
            VARCO.p.DEVICES.LOCATION.position.longitude = position.coords.longitude;
            VARCO.p.DEVICES.LOCATION.position.altitude = position.coords.altitude || 0;
            VARCO.p.DEVICES.LOCATION.position.accuracy = position.coords.accuracy;
            VARCO.p.DEVICES.LOCATION.position.lastUpdate = position.timestamp;
            VARCO.p.DEVICES.LOCATION.hasPermission = true;
          }
          
          callback(position as GeoPosition);
        },
        errorCallback || ((error) => console.error('Error getting geolocation:', error.message)),
        geoOptions
      );
    };
  }

  private initCompassMethods(): void {
    /**
     * Inizializza e avvia il tracciamento della bussola (orientamento del dispositivo)
     * @param callback Funzione da chiamare quando l'orientamento cambia
     */
    VARCO.f.startCompass = (callback?: (orientation: DeviceOrientation) => void): void => {
      if (!window.DeviceOrientationEvent) {
        console.error('Device orientation is not supported by this browser');
        return;
      }

      const handleOrientation = (event: DeviceOrientationEvent): void => {
        if (VARCO.p.DEVICES.LOCATION) {
          VARCO.p.DEVICES.LOCATION.orientation.alpha = event.alpha || 0;
          VARCO.p.DEVICES.LOCATION.orientation.beta = event.beta || 0;
          VARCO.p.DEVICES.LOCATION.orientation.gamma = event.gamma || 0;
          VARCO.p.DEVICES.LOCATION.orientation.lastUpdate = Date.now();
        }

        if (callback) {
          callback(event as DeviceOrientation);
        }
      };

      // Richiede il permesso su iOS 13+
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any).requestPermission()
          .then((permissionState: string) => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation);
            } else {
              console.error('Permission to access device orientation was denied');
            }
          })
          .catch(console.error);
      } else {
        // Handle regular non-iOS 13+ case
        window.addEventListener('deviceorientation', handleOrientation);
      }
    };

    /**
     * Ferma il tracciamento della bussola
     */
    VARCO.f.stopCompass = (): void => {
      window.removeEventListener('deviceorientation', () => {});
    };

    /**
     * Calcola la distanza tra due coordinate GPS
     * @param lat1 Latitudine del primo punto
     * @param lon1 Longitudine del primo punto
     * @param lat2 Latitudine del secondo punto
     * @param lon2 Longitudine del secondo punto
     * @returns Distanza in metri
     */
    VARCO.f.calculateDistance = (
      lat1: number, 
      lon1: number, 
      lat2: number, 
      lon2: number
    ): number => {
      // Implementazione della formula di Haversine per calcolare la distanza
      const R = 6371e3; // raggio della Terra in metri
      const φ1 = lat1 * Math.PI / 180;
      const φ2 = lat2 * Math.PI / 180;
      const Δφ = (lat2 - lat1) * Math.PI / 180;
      const Δλ = (lon2 - lon1) * Math.PI / 180;

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c; // distanza in metri
    };
  }
}

// Estensione delle dichiarazioni di VARCO
declare module "./VARCO" {
  interface VARCOClass {
    p: {
      DEVICES: {
        LOCATION?: {
          position: {
            latitude: number;
            longitude: number;
            altitude: number;
            accuracy: number;
            lastUpdate: number;
          };
          orientation: {
            alpha: number;
            beta: number;
            gamma: number;
            accuracy: number;
            lastUpdate: number;
          };
          watchId: number | null;
          isActive: boolean;
          hasPermission: boolean;
        };
      };
    };
  }
}

// Inizializza il modulo GPS/Compass
new VARCOGpsCompass(); 