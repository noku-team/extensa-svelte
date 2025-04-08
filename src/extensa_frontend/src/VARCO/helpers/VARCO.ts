import * as THREE from 'three';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

// Importazioni loaders
import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { TDSLoader } from 'three/addons/loaders/TDSLoader.js';
import { USDZLoader } from 'three/addons/loaders/USDZLoader.js';

// Math
import { OBB } from 'three/addons/math/OBB.js';
import getDOMHeight from '../../utils/dom/getDOMHeight';

interface State {
  name: string;
  onEnter?: (state?: State) => void;
  onExit?: (state?: State) => void;
  update?: (delta: number) => void;
  transitions?: Array<{
    target: string;
    condition: () => boolean;
    onTransition?: () => void;
  }>;
  properties?: Record<string, any>;
}

interface Motion {
  name: string;
  start: number;
  end: number;
  fps: number;
  loop?: boolean;
  clipAction?: THREE.AnimationAction;
  clip?: THREE.AnimationClip;
}

interface Devices {
  gamepad: any | null;
  mouse: any | null;
  touch: any | null;
  keyboard: any | null;
  eventType: string | null;
  isIOS: boolean;
  isSafari: boolean;
  isMobile: boolean;
  WEBCAM?: {
    videoDeviceList: Array<[string, string]>;
    stream_height: number | undefined;
    stream_width: number | undefined;
  };
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
  VR?: {
    enabled: boolean;
    isPlaying: boolean;
    xrFrame: boolean;
    referenceSpaceType: XRReferenceSpaceType;
    currentSession?: XRSession | null;
    sessionInit?: XRSessionInit;
    xrReferenceSpace?: XRReferenceSpace;
    xrCamera?: THREE.Object3D[];
    xrPose?: XRViewerPose;
    updateXRFrame?: (time: number, frame: XRFrame) => void;
    controllers?: THREE.Group[];
    controllerGrips?: THREE.Group[];
    controllerFactory?: XRControllerModelFactory;
  };
  AR?: {
    enabled: boolean;
    isPlaying: boolean;
    xrFrame: boolean;
    referenceSpaceType: XRReferenceSpaceType;
    currentSession?: XRSession | null;
    sessionInit?: XRSessionInit;
    xrReferenceSpace?: XRReferenceSpace;
    xrCamera?: THREE.Object3D[];
    xrPose?: XRViewerPose;
    updateXRFrame?: (time: number, frame: XRFrame) => void;
  };
}

interface VarcoProperties {
  DEVICES: Devices;
  SOUNDS: Record<string, any>;
  RAYCAST: THREE.Raycaster;
  CLOCK: THREE.Clock;
  DELTAT: number;
  DELTA_STARTTIME: number;
  isVISIBLE: boolean;
  zipList: any[];
  STATES?: {
    current: State | null;
    previous: State | null;
    statesList: Record<string, State>;
    machine: any | null;
  };
  MOTIONS?: {
    mixer: THREE.AnimationMixer | null;
    list: Record<string, Motion>;
    clock: THREE.Clock;
  };
}

interface ComplexObject {
  OBJECTS: Record<string, THREE.Object3D>;
  MATERIALS: Record<string, THREE.Material>;
  TEXTURES: Record<string, THREE.Texture>;
  PHXCONSTRAINTS: Record<string, any>;
  PHXMATERIALS: Record<string, any>;
}

interface ComplexObjectProperties {
  name?: string;
  parameters?: {
    textureList?: Array<{
      name: string;
      url: string;
      type?: string;
    }>;
    materialList?: Array<{
      name: string;
      type: string;
      parameters?: Record<string, any>;
      prop?: Record<string, any>;
    }>;
    elementList?: Array<{
      name: string;
      type: string;
      parameters?: Record<string, any>;
      prop?: Record<string, any>;
    }>;
    physicConstraintsList?: Array<{
      name: string;
      type: string;
      parameters?: Record<string, any>;
      prop?: Record<string, any>;
    }>;
    physicMaterialsList?: Array<{
      name: string;
      type: string;
      parameters?: Record<string, any>;
      prop?: Record<string, any>;
    }>;
    [key: string]: any;
  };
}

interface ComplexObjectGroup extends THREE.Group {
  OBJECTS: Record<string, THREE.Object3D>;
  MATERIALS: Record<string, THREE.Material>;
  TEXTURES: Record<string, THREE.Texture>;
  PHXCONSTRAINTS: Record<string, any>;
  PHXMATERIALS: Record<string, any>;
}

export class VARCOClass {
  private static _instance: VARCOClass | null = null;
  private static _initialized: boolean = false;

  public p: VarcoProperties = {
    DEVICES: {
      gamepad: null,
      mouse: null,
      touch: null,
      keyboard: null,
      eventType: null,
      isIOS: false,
      isSafari: false,
      isMobile: false
    },
    SOUNDS: {},
    RAYCAST: new THREE.Raycaster(),
    CLOCK: new THREE.Clock(),
    DELTAT: 0,
    DELTA_STARTTIME: new Date().getTime(),
    isVISIBLE: true,
    zipList: []
  };
  public f: Record<string, any> = {};
  public button: Record<string, any> = {};
  public scene?: THREE.Scene;
  
  private constructor() {
    if (VARCOClass._initialized) {
      throw new Error("Use VARCOClass.getInstance() instead of new.");
    }
    VARCOClass._initialized = true;
    
    // Inizializzazione dei metodi
    this.initMethods();
    
    // Esecuzione check dispositivo
    this.f.checkDevice();
    this.initializeComplexObjectMethods();
    this.initializeViewportMethods();
    this.initializeAdditionalMethods();
  }

  public static getInstance(): VARCOClass {
    if (!VARCOClass._instance) {
      VARCOClass._instance = new VARCOClass();
    }
    return VARCOClass._instance;
  }

  private initMethods(): void {
    // Clonazione oggetti
    this.f.objectClone = (source: any): any => {
      if (Object.prototype.toString.call(source) === '[object Array]') {
        const clone: any[] = [];
        for (let i = 0; i < source.length; i++) {
          clone[i] = this.f.objectClone(source[i]);
        }
        return clone;
      } else if (typeof source === "object" && source !== null) {
        const clone: Record<string, any> = {};
        for (const prop in source) {
          if (source.hasOwnProperty(prop)) {
            clone[prop] = this.f.objectClone(source[prop]);
          }
        }
        return clone;
      } else {
        return source;
      }
    };

    // Controllo collisioni OBB
    this.f.checkCollisionOBB = (objA: any, objB: any): { collision: boolean, objA?: any, objB?: any } => {
      const results = { collision: false };

      if (objA !== undefined && objB !== undefined) {
        if (objA.MM3D.OBB.object.intersectsOBB(objB.MM3D.OBB.object) === true) {
          results.collision = true;
          (results as any).objA = objA;
          (results as any).objB = objB;
        }
      }

      return results;
    };

    // Generazione UUID
    this.f.generateUUID = (): string => {
      let d = new Date().getTime();
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    };

    // Scambio elementi array
    this.f.array_swap = (arr: any[], i1: number, i2: number): void => {
      const temp = arr[i1];
      arr[i1] = arr[i2];
      arr[i2] = temp;
    };

    // Spostamento elementi array
    this.f.array_move = (arr: any[], old_index: number, new_index: number): any[] => {
      if (new_index >= arr.length) {
        let k = new_index - arr.length + 1;
        while (k--) {
          arr.push(undefined);
        }
      }
      arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
      return arr;
    };

    // ArrayBuffer a Base64
    this.f.arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
    };

    // Base64 a ArrayBuffer
    this.f.base64ToArrayBuffer = (base64: string): ArrayBuffer => {
      const binary_string = window.atob(base64);
      const len = binary_string.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
      }
      return bytes.buffer;
    };

    // Controllo tipo dispositivo
    this.f.checkDevice = (): void => {
      // Controlla se il dispositivo è iOS
      this.p.DEVICES.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

      // Controlla se il browser è Safari
      this.p.DEVICES.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

      // Controlla se il browser è Mobile
      this.p.DEVICES.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    // Recupero informazioni dispositivo
    this.f.getInfoDevice = (): {
      memory?: number;
      hardware?: number;
      connection?: any;
      browserName: string;
      fullVersion: string;
      majorVersion: number;
      OSName: string;
    } => {
      const memory = (navigator as any).deviceMemory;
      const hardware = navigator.hardwareConcurrency;
      const connection = (navigator as any).connection;

      const nVer = navigator.appVersion;
      const nAgt = navigator.userAgent;
      let browserName = navigator.appName;
      let fullVersion = '' + parseFloat(navigator.appVersion);
      let majorVersion = parseInt(navigator.appVersion, 10);
      let nameOffset, verOffset, ix;

      // In Opera, the true version is after "OPR" or after "Version"
      if ((verOffset = nAgt.indexOf("OPR")) != -1) {
        browserName = "Opera";
        fullVersion = nAgt.substring(verOffset + 4);
        if ((verOffset = nAgt.indexOf("Version")) != -1)
          fullVersion = nAgt.substring(verOffset + 8);
      }
      // In MS Edge, the true version is after "Edg" in userAgent
      else if ((verOffset = nAgt.indexOf("Edg")) != -1) {
        browserName = "Microsoft Edge";
        fullVersion = nAgt.substring(verOffset + 4);
      }
      // In MSIE, the true version is after "MSIE" in userAgent
      else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
        browserName = "Microsoft Internet Explorer";
        fullVersion = nAgt.substring(verOffset + 5);
      }
      // In Chrome, the true version is after "Chrome" 
      else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
        browserName = "Chrome";
        fullVersion = nAgt.substring(verOffset + 7);
      }
      // In Safari, the true version is after "Safari" or after "Version" 
      else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
        browserName = "Safari";
        fullVersion = nAgt.substring(verOffset + 7);
        if ((verOffset = nAgt.indexOf("Version")) != -1)
          fullVersion = nAgt.substring(verOffset + 8);
      }
      // In Firefox, the true version is after "Firefox" 
      else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
        browserName = "Firefox";
        fullVersion = nAgt.substring(verOffset + 8);
      }
      // In most other browsers, "name/version" is at the end of userAgent 
      else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) <
        (verOffset = nAgt.lastIndexOf('/'))) {
        browserName = nAgt.substring(nameOffset, verOffset);
        fullVersion = nAgt.substring(verOffset + 1);
        if (browserName.toLowerCase() == browserName.toUpperCase()) {
          browserName = navigator.appName;
        }
      }
      
      // trim the fullVersion string at semicolon/space if present
      if ((ix = fullVersion.indexOf(";")) != -1)
        fullVersion = fullVersion.substring(0, ix);
      if ((ix = fullVersion.indexOf(" ")) != -1)
        fullVersion = fullVersion.substring(0, ix);

      majorVersion = parseInt('' + fullVersion, 10);
      if (isNaN(majorVersion)) {
        fullVersion = '' + parseFloat(navigator.appVersion);
        majorVersion = parseInt(navigator.appVersion, 10);
      }

      // sistema operativo
      let OSName = "Unknown OS";
      if (navigator.appVersion.indexOf("Win") != -1) OSName = "Windows";
      if (navigator.appVersion.indexOf("Mac") != -1) OSName = "MacOS";
      if (navigator.appVersion.indexOf("X11") != -1) OSName = "UNIX";
      if (navigator.appVersion.indexOf("Linux") != -1) OSName = "Linux";

      return {
        memory,
        hardware,
        connection,
        browserName,
        fullVersion,
        majorVersion,
        OSName
      };
    };

    // Aggiunta di altri metodi essenziali
    this.initializeRendererMethods();
    this.initializeEventMethods();
    this.initializeLoaderMethods();
    this.initializeUtilityMethods();
  }

  private initializeRendererMethods(): void {
    // Metodo per aggiungere una scena
    this.f.addScene = (properties: {
      name: string;
      // container?: string | HTMLElement;
      backgroundColor?: THREE.ColorRepresentation;
      fogColor?: THREE.ColorRepresentation;
      fogNear?: number;
      fogFar?: number;
      cameraFOV?: number;
      cameraNear?: number;
      cameraFar?: number;
      rendererPixelRatio?: number;
      rendererClearColor?: THREE.ColorRepresentation;
      rendererSize?: { width: number; height: number };
    }, 
    // callback?: (result: { obj: THREE.Scene }) => void,
    // callbackProp?: any
    ): { 
      scene: THREE.Scene; 
      // camera: THREE.PerspectiveCamera; 
      // renderer: THREE.WebGLRenderer;
      // domElement: HTMLCanvasElement;
    } => {
      // Create scene
      const scene = new THREE.Scene();
      this.scene = scene;

      if (properties.name) {
        this.scene.name = properties.name;
      }
      
      // Setup background and fog if specified
      if (properties.backgroundColor) {
        scene.background = new THREE.Color(properties.backgroundColor);
      }
      
      if (properties.fogColor) {
        scene.fog = new THREE.Fog(
          properties.fogColor, 
          properties.fogNear || 1, 
          properties.fogFar || 1000
        );
      }
      
      // Handle container
      // let container: HTMLElement | null = null;
      
      // if (properties.container) {
      //   if (typeof properties.container === 'string') {
      //     container = document.querySelector(properties.container);
      //   } else if (properties.container instanceof HTMLElement) {
      //     container = properties.container;
      //   }
      // }
      
      // if (!container) {
      //   container = document.createElement('div');
      //   container.style.width = '100%';
      //   container.style.height = '100%';
      //   document.body.appendChild(container);
      // }
      
      // // Get container dimensions
      // const width = properties.rendererSize ? 
      //   properties.rendererSize.width : 
      //   container.clientWidth || window.innerWidth;
        
      // const height = properties.rendererSize ? 
      //   properties.rendererSize.height : 
      //   container.clientHeight || getDOMHeight(container) || window.innerHeight;
      
      // Create camera
      // const camera = new THREE.PerspectiveCamera(
      //   properties.cameraFOV || 75,
      //   width / height,
      //   properties.cameraNear || 0.1,
      //   properties.cameraFar || 1000
      // );
      
      // // Position camera at default position
      // camera.position.set(0, 1.6, 3);
      
      // // Add ambient light
      // const ambientLight = new THREE.AmbientLight(0x404040);
      // scene.add(ambientLight);
      
      // // Create renderer
      // const renderer = new THREE.WebGLRenderer({ antialias: true });
      
      // if (properties.rendererPixelRatio) {
      //   renderer.setPixelRatio(properties.rendererPixelRatio);
      // } else {
      //   renderer.setPixelRatio(window.devicePixelRatio);
      // }
      
      // if (properties.rendererClearColor) {
      //   renderer.setClearColor(properties.rendererClearColor);
      // }
      
      // renderer.setSize(width, height);
      // renderer.shadowMap.enabled = true;
      
      // // Get canvas
      // const domElement = renderer.domElement;
      
      // // Add canvas to container
      // container.appendChild(domElement);
      
      // // Disable context menu
      // this.f.disableContextMenu(domElement);
      
      // // Handle window resize
      // const handleResize = () => {
      //   if (!properties.rendererSize) {
      //     const newWidth = container?.clientWidth || window.innerWidth;
      //     const newHeight = container?.clientHeight || getDOMHeight(container) || window.innerHeight;
          
      //     camera.aspect = newWidth / newHeight;
      //     camera.updateProjectionMatrix();
          
      //     renderer.setSize(newWidth, newHeight);
      //   }
      // };
      
      // window.addEventListener('resize', handleResize);
      
      // Execute callback if provided
      // if (callback) {
      //   callback({
      //     obj: scene
      //   });
      // }
      
      // Return result
      return { 
        scene, 
        // camera, 
        // renderer, 
        // domElement
      };
    };
    
    // Aggiunge una camera alla scena
    this.f.addCamera = (scene: THREE.Scene, prop: {
      type: string;
      name?: string;
      parameters?: Record<string, any>;
      position?: { x?: number; y?: number; z?: number };
      rotation?: { x?: number; y?: number; z?: number };
      target?: { x?: number; y?: number; z?: number };
      lookAt?: { x?: number; y?: number; z?: number };
      [key: string]: any;
    }, callBack?: (params: { obj: THREE.Camera; info: any }) => void, callBackProp?: any): THREE.Camera => {
      // Crea la camera del tipo specificato
      const camera = new (THREE as any)[prop.type]();
      
      // Imposta i parametri
      if (prop.parameters !== undefined) {
        this.f.setPropAndParameters(camera, prop.parameters);
      }
      
      // Imposta le altre proprietà
      this.f.setPropAndParameters(camera, prop, scene);
      
      // Esegui la callback se fornita
      if (callBack !== undefined) {
        callBack({
          obj: camera,
          info: callBackProp
        });
      }
      
      return camera;
    };
    
    // Imposta proprietà e parametri su un oggetto
    this.f.setPropAndParameters = (obj: any, prop: Record<string, any>, scene?: THREE.Scene): void => {
      for (const key in prop) {
        if (key !== "type" && key !== "parameters") {
          if (key === "position" || key === "rotation" || key === "scale") {
            if (prop[key].x !== undefined) obj[key].x = prop[key].x;
            if (prop[key].y !== undefined) obj[key].y = prop[key].y;
            if (prop[key].z !== undefined) obj[key].z = prop[key].z;
          } else if (key === "lookAt" && scene) {
            const target = new THREE.Vector3(
              prop[key].x || 0,
              prop[key].y || 0,
              prop[key].z || 0
            );
            obj.lookAt(target);
          } else if (key === "name") {
            obj.name = prop[key];
          } else if (key !== "info") {
            obj[key] = prop[key];
          }
        }
      }
    };
    
    // Render di un layer specifico
    this.f.renderLayer = (layerProp: {
      renderer: THREE.WebGLRenderer;
      scene: THREE.Scene;
      camera: THREE.Camera;
      clear?: boolean;
    }): void => {
      const renderer = layerProp.renderer;
      
      if (layerProp.clear === true) {
        renderer.clear();
      }
      
      renderer.render(layerProp.scene, layerProp.camera);
    };
  }

  private initializeEventMethods(): void {
    // Disabilita menu contestuale
    this.f.disableContextMenu = (element: HTMLElement): void => {
      element.addEventListener("contextmenu", (e: Event) => {
        e.preventDefault();
        return false;
      });
    };
    
    // Gestore del gamepad
    this.f.gamepadHandler = (event: Event, connected: boolean): void => {
      const gamepad = event as GamepadEvent;
      
      if (connected) {
        this.p.DEVICES.gamepad = gamepad.gamepad;
        console.log("Gamepad connected:", gamepad.gamepad.id);
      } else {
        console.log("Gamepad disconnected");
        this.p.DEVICES.gamepad = null;
      }
    };
    
    // Ottieni posizione mouse normalizzata
    this.f.getScreenNormalizedMouse = (
      camera: THREE.Camera,
      locH: number,
      locV: number,
      viewPort?: { width: number; height: number }
    ): THREE.Vector2 => {
      const width = viewPort ? viewPort.width : window.innerWidth;
      const height = viewPort ? viewPort.height : window.innerHeight;
      
      const mouseVector = new THREE.Vector2();
      mouseVector.x = (locH / width) * 2 - 1;
      mouseVector.y = -(locV / height) * 2 + 1;
      
      return mouseVector;
    };
    
    // Funzione per creare una lista di nodi cliccabili
    this.f.createNodeClickableList = (
      scene: THREE.Scene,
      filter?: (node: THREE.Object3D) => boolean
    ): THREE.Object3D[] => {
      const clickableNodes: THREE.Object3D[] = [];
      
      scene.traverse((node: THREE.Object3D) => {
        // Applica il filtro se fornito, altrimenti controlla solo la proprietà clickable
        if (filter ? filter(node) : (node as any).clickable === true) {
          clickableNodes.push(node);
        }
      });
      
      return clickableNodes;
    };
    
    // Versione aggiornata di checkTouchMouseEvents che utilizza createNodeClickableList
    this.f.checkTouchMouseEvents = (
      normalizedScreenVector: THREE.Vector2,
      scene: THREE.Scene,
      camera: THREE.Camera,
      view?: { width: number; height: number },
      filter?: (node: THREE.Object3D) => boolean
    ): Array<{ node: THREE.Object3D; distance: number }> => {
      this.p.RAYCAST.setFromCamera(normalizedScreenVector, camera);
      
      // Utilizza la nuova funzione createNodeClickableList
      const clickableNodes = this.f.createNodeClickableList(scene, filter);
      
      const intersects = this.p.RAYCAST.intersectObjects(clickableNodes, true);
      
      return intersects.map(intersect => ({
        node: intersect.object,
        distance: intersect.distance
      }));
    };
  }

  private initializeLoaderMethods(): void {
    // Caricamento di oggetti 3D
    this.f.objectLoader = (
      url: string,
      callBack?: (result: { obj: THREE.Object3D; info: any }) => void,
      callBackProp?: any
    ): void => {
      const fileExtension = url.split('.').pop()?.toLowerCase();
      
      let loader;
      
      switch (fileExtension) {
        case 'gltf':
        case 'glb':
          loader = new GLTFLoader();
          
          // Configurazione del loader DRACO se necessario
          const dracoLoader = new DRACOLoader();
          dracoLoader.setDecoderPath('three/examples/jsm/libs/draco/');
          loader.setDRACOLoader(dracoLoader);
          
          loader.load(url,
            (gltf) => {
              if (callBack) {
                callBack({
                  obj: gltf.scene,
                  info: callBackProp
                });
              }
            },
            (xhr) => {
              console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
              console.error('Error loading GLTF model', error);
            }
          );
          break;
          
        case 'obj':
          loader = new OBJLoader();
          loader.load(url,
            (obj) => {
              if (callBack) {
                callBack({
                  obj: obj,
                  info: callBackProp
                });
              }
            },
            (xhr) => {
              console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
              console.error('Error loading OBJ model', error);
            }
          );
          break;
          
        case 'fbx':
          loader = new FBXLoader();
          loader.load(url,
            (obj) => {
              if (callBack) {
                callBack({
                  obj: obj,
                  info: callBackProp
                });
              }
            },
            (xhr) => {
              console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
              console.error('Error loading FBX model', error);
            }
          );
          break;
          
        case 'dae':
          loader = new ColladaLoader();
          loader.load(url,
            (collada) => {
              if (callBack) {
                callBack({
                  obj: collada.scene,
                  info: callBackProp
                });
              }
            },
            (xhr) => {
              console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
              console.error('Error loading Collada model', error);
            }
          );
          break;
          
        case '3ds':
          loader = new TDSLoader();
          loader.load(url,
            (obj) => {
              if (callBack) {
                callBack({
                  obj: obj,
                  info: callBackProp
                });
              }
            },
            (xhr) => {
              console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
              console.error('Error loading 3DS model', error);
            }
          );
          break;
          
        case 'usdz':
          loader = new USDZLoader();
          loader.load(url,
            (obj) => {
              if (callBack) {
                callBack({
                  obj: obj,
                  info: callBackProp
                });
              }
            },
            (xhr) => {
              console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
              console.error('Error loading USDZ model', error);
            }
          );
          break;
          
        default:
          console.error('Unsupported file format:', fileExtension);
          return;
      }
    };
    
    // Add texture method - missing from TypeScript version
    this.f.addTexture = (
      target: THREE.Scene | THREE.Object3D, 
      prop: {
        name: string;
        url: string;
        type?: string;
        parameters?: Record<string, any>;
      },
      callBack?: (result: { obj: THREE.Texture; info: any }) => void,
      callBackProp?: any
    ): void => {
      let loader;
      
      // Default type is 'standard' if not specified
      const textureType = prop.type || 'standard';
      
      switch (textureType) {
        case 'standard':
          this.f.loadStandardTexture(
            prop.url,
            (texture: THREE.Texture) => {
              // Set texture name if provided
              texture.name = prop.name;
              
              // Apply parameters if provided
              if (prop.parameters) {
                this.f.setPropAndParameters(texture, prop.parameters);
              }
              
              // Add to target's textures if it's a complex object
              if ((target as any).TEXTURES) {
                (target as any).TEXTURES[prop.name] = texture;
              }
              
              // Execute callback if provided
              if (callBack) {
                callBack({
                  obj: texture,
                  info: callBackProp
                });
              }
            },
            (error: Error) => {
              console.error('Error loading texture:', error);
              if (callBack) {
                callBack({ obj: new THREE.Texture(), info: null });
              }
            }
          );
          break;
          
        case 'base64':
          this.f.createBase64Texture(
            prop.url,
            (texture: THREE.Texture) => {
              // Set texture name if provided
              texture.name = prop.name;
              
              // Apply parameters if provided
              if (prop.parameters) {
                this.f.setPropAndParameters(texture, prop.parameters);
              }
              
              // Add to target's textures if it's a complex object
              if ((target as any).TEXTURES) {
                (target as any).TEXTURES[prop.name] = texture;
              }
              
              // Execute callback if provided
              if (callBack) {
                callBack({
                  obj: texture,
                  info: callBackProp
                });
              }
            }
          );
          break;
          
        case 'video':
          this.f.createVideoTexture(
            prop.url as unknown as HTMLVideoElement, // Type cast as the method expects an HTML element
            (texture: THREE.VideoTexture) => {
              // Set texture name if provided
              texture.name = prop.name;
              
              // Apply parameters if provided
              if (prop.parameters) {
                this.f.setPropAndParameters(texture, prop.parameters);
              }
              
              // Add to target's textures if it's a complex object
              if ((target as any).TEXTURES) {
                (target as any).TEXTURES[prop.name] = texture;
              }
              
              // Execute callback if provided
              if (callBack) {
                callBack({
                  obj: texture,
                  info: callBackProp
                });
              }
            }
          );
          break;
          
        case 'string':
          this.f.createStringTexture(
            prop.url,
            prop.parameters,
            (texture: THREE.CanvasTexture) => {
              // Set texture name if provided
              texture.name = prop.name;
              
              // Add to target's textures if it's a complex object
              if ((target as any).TEXTURES) {
                (target as any).TEXTURES[prop.name] = texture;
              }
              
              // Execute callback if provided
              if (callBack) {
                callBack({
                  obj: texture,
                  info: callBackProp
                });
              }
            }
          );
          break;
          
        default:
          console.error('Unsupported texture type:', textureType);
          return;
      }
    };
    
    // Configurazione dei parametri della texture
    this.f.setupTextureParameter = (texture: THREE.Texture): THREE.Texture => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.anisotropy = 16;
      
      return texture;
    };
    
    // Caricamento texture standard
    this.f.loadStandardTexture = (
      url: string,
      onLoad?: (texture: THREE.Texture) => void,
      onError?: (error: unknown) => void
    ): void => {
      const loader = new THREE.TextureLoader();
      
      loader.load(
        url,
        (texture) => {
          const configuredTexture = this.f.setupTextureParameter(texture);
          if (onLoad) onLoad(configuredTexture);
        },
        undefined,
        (error) => {
          console.error('Error loading texture:', error);
          if (onError) onError(error);
        }
      );
    };
    
    // Creazione texture da stringa Base64
    this.f.createBase64Texture = (
      base64String: string,
      onLoad?: (texture: THREE.Texture) => void
    ): void => {
      const image = new Image();
      image.src = base64String;
      
      image.onload = () => {
        const texture = new THREE.Texture(image);
        texture.needsUpdate = true;
        
        const configuredTexture = this.f.setupTextureParameter(texture);
        if (onLoad) onLoad(configuredTexture);
      };
    };
    
    // Creazione texture da canvas
    this.f.createCanvasTexture = (
      canvas: HTMLCanvasElement,
      onLoad?: (texture: THREE.Texture) => void
    ): void => {
      const texture = new THREE.CanvasTexture(canvas);
      const configuredTexture = this.f.setupTextureParameter(texture);
      
      if (onLoad) onLoad(configuredTexture);
    };
    
    // Creazione texture da video
    this.f.createVideoTexture = (
      videoElement: HTMLVideoElement,
      onLoad?: (texture: THREE.VideoTexture) => void
    ): void => {
      const texture = new THREE.VideoTexture(videoElement);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBAFormat;
      
      const configuredTexture = this.f.setupTextureParameter(texture) as THREE.VideoTexture;
      
      if (onLoad) onLoad(configuredTexture);
    };

    // Parser degli oggetti
    this.f.objectParser = (
      url: string,
      callBack?: (result: { obj: THREE.Object3D; info: any }) => void,
      callBackProp?: any
    ): void => {
      // Determina l'estensione del file
      const fileExtension = url.split('.').pop()?.toLowerCase();
      
      if (!fileExtension) {
        console.error('Invalid URL format - no file extension found');
        return;
      }
      
      // Crea un loader appropriato in base all'estensione
      let loader;
      switch (fileExtension) {
        case 'json':
          // Caso per JSON
          fetch(url)
            .then(response => response.json())
            .then(data => {
              const object = new THREE.ObjectLoader().parse(data);
              if (callBack) {
                callBack({
                  obj: object,
                  info: callBackProp
                });
              }
            })
            .catch(error => {
              console.error('Error loading JSON:', error);
            });
          break;
          
        default:
          // Per tutti gli altri tipi di file, usa objectLoader
          this.f.objectLoader(url, callBack, callBackProp);
          break;
      }
    };

    // Aggiunge uno script a un nodo
    this.f.addScript = (
      node: THREE.Object3D, 
      prop: {
        name: string,
        function?: Function,
        functionProp?: Record<string, any>,
        parameters?: Record<string, any>
      }
    ): void => {
      // Inizializza la proprietà MM3D se non esiste
      if (!(node as any).MM3D) {
        (node as any).MM3D = { scriptList: [] };
      } else if (!(node as any).MM3D.scriptList) {
        (node as any).MM3D.scriptList = [];
      }
      
      // Aggiungi l'oggetto al functionProp se non è specificato
      if (!prop.functionProp) {
        prop.functionProp = { obj: node };
      } else {
        prop.functionProp.obj = node;
      }
      
      // Aggiungi lo script alla lista
      (node as any).MM3D.scriptList.push(prop);
    };
    
    // Aggiunge un evento a un nodo
    this.f.addEvent = (
      node: THREE.Object3D, 
      prop: Record<string, any>
    ): void => {
      // Inizializza la proprietà MM3D se non esiste
      if (!(node as any).MM3D) {
        (node as any).MM3D = { events: {} };
      } else if (!(node as any).MM3D.events) {
        (node as any).MM3D.events = {};
      }
      
      (node as any).MM3D.events = prop;
    };
    
    // Carica un oggetto complesso da un file JSON
    this.f.loadComplex = (
      scene: THREE.Scene,
      url: string,
      prop?: Record<string, any>,
      callBack?: (result: { obj: ComplexObjectGroup }) => void,
      errorCallBack?: (error: Error) => void
    ): void => {
      this.f.loadJSON(
        url,
        (data: any) => {
          // Unisci le proprietà fornite con i dati caricati
          if (prop) {
            Object.keys(prop).forEach(key => {
              data[key] = prop[key];
            });
          }
          
          // Crea l'oggetto complesso con i dati
          this.f.addComplex(
            scene,
            data,
            callBack,
            {}
          );
        },
        (error: Error) => {
          if (errorCallBack) {
            errorCallBack(error);
          } else {
            console.error('Error loading complex object:', error);
          }
        }
      );
    };
    
    // Carica un file JSON
    this.f.loadJSON = (
      url: string,
      callBack?: (data: any, info: { info: string }) => void,
      errorCallBack?: (error: Error, info: { info: string }) => void
    ): void => {
      if (!url) {
        console.error('URL undefined');
        return;
      }
      
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Request failed: ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          if (callBack) {
            callBack(data, { info: `Perfect! ${url}` });
          }
        })
        .catch(error => {
          if (errorCallBack) {
            errorCallBack(error, { info: `Network Error: Unable to fetch ${url}` });
          } else {
            console.error('Error loading JSON:', error);
          }
        });
    };
    
    // Elimina una texture
    this.f.deleteTexture = (
      scene: THREE.Scene,
      texture: THREE.Texture | string,
      callBack?: Function,
      callBackProp?: any
    ): void => {
      if (!texture) {
        return;
      }
      
      let textureName: string;
      
      if (typeof texture === 'string') {
        textureName = texture;
      } else {
        textureName = (texture as any).name;
      }
      
      // Implementa la logica per rimuovere la texture dalla scena
      if (scene) {
        scene.traverse((node: THREE.Object3D) => {
          if (node instanceof THREE.Mesh) {
            if (node.material) {
              // Gestisci sia array di materiali che materiale singolo
              if (Array.isArray(node.material)) {
                node.material.forEach(material => {
                  this.disposeTextureFromMaterial(material, textureName);
                });
              } else {
                this.disposeTextureFromMaterial(node.material, textureName);
              }
            }
          }
        });
      }
      
      // Esegui callback se fornita
      if (callBack) {
        if (callBackProp) {
          callBack(callBackProp);
        } else {
          callBack();
        }
      }
    };
  }

  private initializeComplexObjectMethods(): void {
    // Aggiunta di oggetti complessi alla scena
    this.f.addComplex = (
      scene: THREE.Scene,
      prop: ComplexObjectProperties = {},
      callBack?: (result: { obj: ComplexObjectGroup }) => void,
      callBackProp?: any
    ): ComplexObjectGroup => {
      const COMPLEX = new THREE.Group() as ComplexObjectGroup;
      let counter = 0;
      let totCounter = 0;
      let step = "textureList";
      const _this = this;

      COMPLEX.OBJECTS = {};
      COMPLEX.MATERIALS = {};
      COMPLEX.TEXTURES = {};
      COMPLEX.PHXCONSTRAINTS = {};
      COMPLEX.PHXMATERIALS = {};

      if (prop.parameters === undefined) {
        prop.parameters = {};
      }
      
      const complexObjectDone = () => {
        // Ensure all properties are set before proceeding
        this.f.setPropAndParameters(COMPLEX, prop.parameters, scene);

        // Add the complex object to the scene if provided
        if (scene) {
          scene.add(COMPLEX);
        }

        // Execute callback after all initialization is complete
        if (callBack !== undefined) {
          if (callBackProp !== undefined) {
            callBackProp.obj = COMPLEX;
            callBack(callBackProp);
          } else {
            callBack({ obj: COMPLEX });
          }
        }

        // Ensure the object is fully initialized before returning
        return COMPLEX;
      };

      const checkCounter = (p: number) => {
        counter++;
        if (counter === p) {
          counter = 0;
          return true;
        }
        return false;
      };

      const createTextures = () => {
        if (prop.parameters?.textureList !== undefined) {
          totCounter = prop.parameters.textureList.length;
          prop.parameters.textureList.forEach((textureItem: {
            name: string;
            url: string;
            type?: string;
          }) => {
            if (textureItem.type === "standard" || !textureItem.type) {
              this.f.loadStandardTexture(
                textureItem.url,
                (texture: THREE.Texture) => {
                  COMPLEX.TEXTURES[textureItem.name] = texture;
                  if (checkCounter(totCounter)) {
                    createMaterials();
                  }
                },
                (error: any) => {
                  console.error("Error loading texture:", error);
                  if (checkCounter(totCounter)) {
                    createMaterials();
                  }
                }
              );
            } else if (textureItem.type === "base64") {
              this.f.createBase64Texture(
                textureItem.url,
                (texture: THREE.Texture) => {
                  COMPLEX.TEXTURES[textureItem.name] = texture;
                  if (checkCounter(totCounter)) {
                    createMaterials();
                  }
                }
              );
            } else if (textureItem.type === "video") {
              this.f.createVideoTexture(
                textureItem.url as unknown as HTMLVideoElement,
                (texture: THREE.VideoTexture) => {
                  COMPLEX.TEXTURES[textureItem.name] = texture;
                  if (checkCounter(totCounter)) {
                    createMaterials();
                  }
                }
              );
            }
          });
        } else {
          createMaterials();
        }
      };

      const createMaterials = () => {
        if (prop.parameters?.materialList !== undefined) {
          totCounter = prop.parameters.materialList.length;
          prop.parameters.materialList.forEach((materialItem: {
            name: string;
            type: string;
            parameters?: Record<string, any>;
          }) => {
            const material = new (THREE as any)[materialItem.type]();
            if (materialItem.parameters !== undefined) {
              this.f.setPropAndParameters(material, materialItem.parameters);
              
              // Apply textures to material if specified
              if (materialItem.parameters.textures) {
                for (const textureKey in materialItem.parameters.textures) {
                  const textureName = materialItem.parameters.textures[textureKey];
                  if (COMPLEX.TEXTURES[textureName]) {
                    (material as any)[textureKey] = COMPLEX.TEXTURES[textureName];
                  }
                }
                material.needsUpdate = true;
              }
            }
            COMPLEX.MATERIALS[materialItem.name] = material;
            if (checkCounter(totCounter)) {
              createElements();
            }
          });
        } else {
          createElements();
        }
      };

      function createElements() {

        if (prop.parameters?.elementList !== undefined) {
    
          step = "elementList"
          counter = 0;
          totCounter = prop.parameters.elementList.length;
    
          if (totCounter > 0) {
            //COMPLEX.OBJECTS = {};
    
            for (var i = 0; i < prop.parameters.elementList.length; i++) {
              _this.f[prop.parameters.elementList[i].type](
                COMPLEX,
                prop.parameters.elementList[i]?.prop,
                checkCounter,
                {}
              );
            }
    
          }
    
        } else {
    
          createPhysicContraints();
    
        }
    
      }

      const createPhysicContraints = () => {
        if (prop.parameters?.physicConstraintsList !== undefined) {
          totCounter = prop.parameters.physicConstraintsList.length;
          prop.parameters.physicConstraintsList.forEach((constraintItem: {
            name: string;
            type: string;
            parameters?: Record<string, any>;
          }) => {
            const constraint = new (THREE as any)[constraintItem.type]();
            if (constraintItem.parameters !== undefined) {
              this.f.setPropAndParameters(constraint, constraintItem.parameters, scene);
            }
            COMPLEX.PHXCONSTRAINTS[constraintItem.name] = constraint;
            if (checkCounter(totCounter)) {
              createPhysicMaterials();
            }
          });
        } else {
          createPhysicMaterials();
        }
      };

      const createPhysicMaterials = () => {
        if (prop.parameters?.physicMaterialsList !== undefined) {
          totCounter = prop.parameters.physicMaterialsList.length;
          prop.parameters.physicMaterialsList.forEach((materialItem: {
            name: string;
            type: string;
            parameters?: Record<string, any>;
          }) => {
            const material = new (THREE as any)[materialItem.type]();
            if (materialItem.parameters !== undefined) {
              this.f.setPropAndParameters(material, materialItem.parameters, scene);
            }
            COMPLEX.PHXMATERIALS[materialItem.name] = material;
            if (checkCounter(totCounter)) {
              complexObjectDone();
            }
          });
        } else {
          complexObjectDone();
        }
      };

      // Start the initialization process
      createTextures();
      return COMPLEX;
    };

    // Creazione texture video da base64
    this.f.createBase64VideoTexture = (
      base64String: string,
      onLoad?: (texture: THREE.VideoTexture) => void
    ): void => {
      const video = document.createElement('video');
      video.src = base64String;
      video.loop = true;
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;

      video.onloadeddata = () => {
        const texture = new THREE.VideoTexture(video);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBAFormat;
        
        const configuredTexture = this.f.setupTextureParameter(texture) as THREE.VideoTexture;
        
        if (onLoad) onLoad(configuredTexture);
      };
    };

    // Creazione texture da stringa
    this.f.createStringTexture = (
      text: string,
      options: {
        font?: string;
        fontSize?: number;
        color?: string;
        backgroundColor?: string;
        width?: number;
        height?: number;
      } = {},
      onLoad?: (texture: THREE.CanvasTexture) => void
    ): void => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        console.error('Could not get canvas context');
        return;
      }

      const font = options.font || 'Arial';
      const fontSize = options.fontSize || 24;
      const color = options.color || '#000000';
      const backgroundColor = options.backgroundColor || '#FFFFFF';
      const width = options.width || 256;
      const height = options.height || 256;

      canvas.width = width;
      canvas.height = height;

      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, width, height);

      context.font = `${fontSize}px ${font}`;
      context.fillStyle = color;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, width / 2, height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      const configuredTexture = this.f.setupTextureParameter(texture) as THREE.CanvasTexture;
      
      if (onLoad) onLoad(configuredTexture);
    };
  }

  private initializeUtilityMethods(): void {
    // Converte coordinate WGS84 (longitudine/latitudine) in pixel
    this.f.WGS84_lonLatToPixels = (
      lon: number,
      lat: number,
      mapWidth: number,
      mapHeight: number
    ): [number, number] => {
      const mapPosX = mapWidth * ((lon + 180) / 360);
      const mapPosY = (((Math.log((Math.sin(this.f.deg2rad(lat)) + 1.0) / Math.cos(this.f.deg2rad(lat)))) + (Math.PI)) / (2 * Math.PI) * mapHeight);
      
      return [mapPosX, mapPosY];
    };
    
    // Ottiene l'indirizzo IP locale
    this.f.ip_local = (): string[] | false => {
      let ip: string[] | false = false;
      
      // Gestione compatibilità cross-browser
      const RTCPeerConnection = window.RTCPeerConnection || 
                              (window as any).mozRTCPeerConnection || 
                              (window as any).webkitRTCPeerConnection || 
                              false;
      
      if (RTCPeerConnection) {
        ip = [];
        const pc = new RTCPeerConnection({ iceServers: [] });
        const noop = () => {};
        
        pc.createDataChannel('');
        pc.createOffer(pc.setLocalDescription.bind(pc), noop);
        
        pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
          if (event && event.candidate && event.candidate.candidate) {
            const s = event.candidate.candidate.split('\n');
            if (ip !== false) {
              ip.push(s[0].split(' ')[4]);
            }
          }
        };
      }
      
      return ip;
    };
    
    // Conversione da pixel a coordinate WGS84
    this.f.WGS84_pixelsToLonLat = (
      x: number,
      y: number,
      mapWidth: number,
      mapHeight: number
    ): { lng: number; lat: number } => {
      const lon = (x / mapWidth) * 360 - 180;
      const lat_rad = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / mapHeight)));
      const lat = this.f.rad2deg(lat_rad);
      
      return { lng: lon, lat: lat };
    };
    
    // Conversione da coordinate a posizione
    this.f.lonLatToPos = (
      sizeH: number,
      sizeV: number,
      lonLatStart: { lng: number; lat: number },
      lonLatEnd: { lng: number; lat: number },
      lonLat: { lng: number; lat: number }
    ): { x: number; y: number } => {
      // Calcola le dimensioni reali in metri
      sizeH = this.f.lonLatDistance(lonLatStart, { lng: lonLatEnd.lng, lat: lonLatStart.lat }, "mt");
      sizeV = this.f.lonLatDistance(lonLatStart, { lat: lonLatEnd.lat, lng: lonLatStart.lng }, "mt");
      
      // Calcola le posizioni relative
      const x = (this.f.lonLatDistance(lonLatStart, { lng: lonLat.lng, lat: lonLatStart.lat }, "mt") / sizeH);
      const y = (this.f.lonLatDistance(lonLatStart, { lng: lonLatStart.lng, lat: lonLat.lat }, "mt") / sizeV);
      
      return { x, y };
    };
    
    // Conversione da posizione a coordinate
    this.f.posToLonLat = (
      sizeH: number,
      sizeV: number,
      lonLatStart: { lng: number; lat: number },
      lonLatEnd: { lng: number; lat: number },
      pos: { x: number; y: number }
    ): { lng: number; lat: number } => {
      // Calcola le dimensioni reali in metri
      const realSizeH = this.f.lonLatDistance(lonLatStart, { lng: lonLatEnd.lng, lat: lonLatStart.lat }, "mt");
      const realSizeV = this.f.lonLatDistance(lonLatStart, { lat: lonLatEnd.lat, lng: lonLatStart.lng }, "mt");
      
      // Calcola le coordinate
      const distanceH = pos.x * realSizeH;
      const distanceV = pos.y * realSizeV;
      
      // Calcola le coordinate finali
      const lng = lonLatStart.lng + (distanceH / realSizeH) * (lonLatEnd.lng - lonLatStart.lng);
      const lat = lonLatStart.lat + (distanceV / realSizeV) * (lonLatEnd.lat - lonLatStart.lat);
      
      return { lng, lat };
    };
    
    // Calcola la distanza tra due coordinate
    this.f.lonLatDistance = (
      lonLatStart: { lng: number; lat: number },
      lonLatEnd: { lng: number; lat: number },
      unit: string = "mt"
    ): number => {
      const R = unit === "mt" ? 6371000 : 6371; // Raggio della Terra in metri o km
      
      const dLat = this.f.deg2rad(lonLatEnd.lat - lonLatStart.lat);
      const dLon = this.f.deg2rad(lonLatEnd.lng - lonLatStart.lng);
      
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.f.deg2rad(lonLatStart.lat)) * Math.cos(this.f.deg2rad(lonLatEnd.lat)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      return distance;
    };
    
    // Conversione da coordinate a pixel per le tile
    this.f.tilesToPixels = (
      lon: number,
      lat: number,
      zoom: number
    ): { x: number; y: number } => {
      const n = Math.pow(2, zoom);
      const x = (lon + 180) / 360 * n;
      const lat_rad = this.f.deg2rad(lat);
      const y = (1 - Math.log(Math.tan(lat_rad) + 1 / Math.cos(lat_rad)) / Math.PI) / 2 * n;
      
      return { x, y };
    };
    
    // Conversione gradi a radianti
    this.f.deg2rad = (angle: number): number => {
      return angle * (Math.PI / 180);
    };
    
    // Conversione radianti a gradi
    this.f.rad2deg = (rad: number): number => {
      return rad * (180 / Math.PI);
    };
    
    // Interpolazione matematica
    this.f.mathInterpolateTo = (
      valueStart: number,
      valueEnd: number,
      intPerc: number
    ): number => {
      return valueStart + (valueEnd - valueStart) * intPerc;
    };
    
    // Trova l'indice di un elemento in un array
    this.f.findIndexOf = <T>(
      item: T,
      array: T[]
    ): number => {
      return array.indexOf(item);
    };
    
    // Converte una stringa in funzione
    this.f.stringToFunction = (
      functionName: string
    ): Function | null => {
      const namespaces = functionName.split(".");
      const func = namespaces.pop();
      
      if (!func) return null;
      
      let context: any = window;
      for (let i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
      }
      
      return context[func];
    };
    
    // Converte una stringa in variabile
    this.f.stringToVariable = (
      value: string,
      variable: string
    ): void => {
      const namespaces = variable.split(".");
      const varName = namespaces.pop();
      
      if (!varName) return;
      
      let context: any = window;
      for (let i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
      }
      
      context[varName] = value;
    };
    
    // Converte una variabile in stringa
    this.f.variableToString = (
      variable: any
    ): string => {
      return variable.toString();
    };
    
    // Converte un valore in variabile
    this.f.valueToVariable = (
      value: any,
      variable: string
    ): void => {
      const namespaces = variable.split(".");
      const varName = namespaces.pop();
      
      if (!varName) return;
      
      let context: any = window;
      for (let i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
      }
      
      context[varName] = value;
    };
  }

  private initializeViewportMethods(): void {
    // Adatta un div al viewport
    this.f.adaptDivViewPort = (
      viewportProp: {
        element: HTMLElement;
        width?: number;
        height?: number;
        position?: { x: number; y: number };
        scale?: { x: number; y: number };
        rotation?: { x: number; y: number; z: number };
      }
    ): void => {
      const element = viewportProp.element;
      
      if (viewportProp.width !== undefined) {
        element.style.width = `${viewportProp.width}px`;
      }
      
      if (viewportProp.height !== undefined) {
        element.style.height = `${viewportProp.height}px`;
      }
      
      if (viewportProp.position) {
        element.style.position = 'absolute';
        element.style.left = `${viewportProp.position.x}px`;
        element.style.top = `${viewportProp.position.y}px`;
      }
      
      if (viewportProp.scale) {
        element.style.transform = `scale(${viewportProp.scale.x}, ${viewportProp.scale.y})`;
      }
      
      if (viewportProp.rotation) {
        element.style.transform = `rotateX(${viewportProp.rotation.x}deg) rotateY(${viewportProp.rotation.y}deg) rotateZ(${viewportProp.rotation.z}deg)`;
      }
    };
    
    // Aggiunge proprietà adattive a un nodo
    this.f.addAdaptive = (
      node: THREE.Object3D,
      prop: {
        posV?: { x: number; y: number; z: number };
        rotV?: { x: number; y: number; z: number };
        scaleV?: { x: number; y: number; z: number };
      }
    ): void => {
      if (!(node as any).MM3D) {
        (node as any).MM3D = {};
      }
      
      (node as any).MM3D.adaptive = {
        posV: prop.posV || { x: 0, y: 0, z: 0 },
        rotV: prop.rotV || { x: 0, y: 0, z: 0 },
        scaleV: prop.scaleV || { x: 1, y: 1, z: 1 }
      };
    };
    
    // Aggiorna le proprietà adattive di un nodo
    this.f.updateAdaptive = (
      node: THREE.Object3D,
      view: { width: number; height: number }
    ): void => {
      if (!(node as any).MM3D || !(node as any).MM3D.adaptive) return;
      
      const adaptive = (node as any).MM3D.adaptive;
      
      if (adaptive.posV) {
        node.position.x = adaptive.posV.x * view.width;
        node.position.y = adaptive.posV.y * view.height;
        node.position.z = adaptive.posV.z;
      }
      
      if (adaptive.rotV) {
        node.rotation.x = this.f.deg2rad(adaptive.rotV.x);
        node.rotation.y = this.f.deg2rad(adaptive.rotV.y);
        node.rotation.z = this.f.deg2rad(adaptive.rotV.z);
      }
      
      if (adaptive.scaleV) {
        node.scale.x = adaptive.scaleV.x;
        node.scale.y = adaptive.scaleV.y;
        node.scale.z = adaptive.scaleV.z;
      }
    };
    
    // Gestisce il ridimensionamento della finestra principale
    this.f.onMainWindowResize = (
      renderer: THREE.WebGLRenderer,
      scene: THREE.Scene,
      camera: THREE.Camera,
      view?: { width: number; height: number }
    ): void => {
      const width = view ? view.width : window.innerWidth;
      const height = view ? view.height : window.innerHeight;
      
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
      
      renderer.setSize(width, height);
      
      // Aggiorna tutti i nodi adattivi nella scena
      scene.traverse((node: THREE.Object3D) => {
        this.f.updateAdaptive(node, { width, height });
      });
    };
  }

  // Metodo ausiliario per eliminare le texture dai materiali
  private disposeTextureFromMaterial(material: THREE.Material, textureName: string): void {
    const textureProperties = [
      'map', 'normalMap', 'bumpMap', 'emissiveMap', 'displacementMap',
      'specularMap', 'envMap', 'lightMap', 'aoMap', 'roughnessMap', 'metalnessMap'
    ];
    
    textureProperties.forEach(prop => {
      if ((material as any)[prop] && (material as any)[prop].name === textureName) {
        (material as any)[prop].dispose();
        (material as any)[prop] = null;
        material.needsUpdate = true;
      }
    });
  }

  private handleAddMesh(complex: ComplexObjectGroup, elementItem: any, scene: THREE.Scene, callback: () => void): void {
    const geometry = new (THREE as any)[elementItem.type](
      ...(elementItem.parameters.geometry.parameters || [])
    );
    
    const material = complex.MATERIALS[elementItem.parameters.material] || 
                    new THREE.MeshBasicMaterial();
    
    const mesh = new THREE.Mesh(geometry, material);
    
    if (elementItem.parameters) {
      this.f.setPropAndParameters(mesh, elementItem.parameters, scene);
    }
    
    complex.OBJECTS[elementItem.name] = mesh;
    complex.add(mesh);
    callback();
  }

  private handleAddLight(complex: ComplexObjectGroup, elementItem: any, scene: THREE.Scene, callback: () => void): void {
    const light = new (THREE as any)[elementItem.type](
      elementItem.parameters.color,
      elementItem.parameters.intensity,
      elementItem.parameters.distance,
      elementItem.parameters.angle,
      elementItem.parameters.penumbra,
      elementItem.parameters.decay
    );
    
    if (elementItem.parameters) {
      this.f.setPropAndParameters(light, elementItem.parameters, scene);
    }
    
    complex.OBJECTS[elementItem.name] = light;
    complex.add(light);
    callback();
  }

  private handleAddCamera(complex: ComplexObjectGroup, elementItem: any, scene: THREE.Scene, callback: () => void): void {
    const camera = new (THREE as any)[elementItem.type](
      elementItem.parameters.fov,
      elementItem.parameters.aspect,
      elementItem.parameters.near,
      elementItem.parameters.far
    );
    
    if (elementItem.parameters) {
      this.f.setPropAndParameters(camera, elementItem.parameters, scene);
    }
    
    complex.OBJECTS[elementItem.name] = camera;
    complex.add(camera);
    callback();
  }

  // Additional functions from VARCO.js
  
  public addLight(SCENE: THREE.Scene, prop: {
    name?: string;
    type: string;
    parameters?: Record<string, any>;
    position?: { x?: number; y?: number; z?: number };
    rotation?: { x?: number; y?: number; z?: number };
    [key: string]: any;
  }, callBack?: (params: { obj: THREE.Light; info: any }) => void, callBackProp?: any): THREE.Light {
    const LIGHT = new (THREE as any)[prop.type]();

    // parameters: // -----------------------------------------------------
    if (prop.parameters !== undefined) {
      this.f.setPropAndParameters(LIGHT, prop.parameters);

      if (prop.parameters.shadow !== undefined) {
        //Set up shadow properties for the light
        if (prop.parameters.shadow.bias !== undefined) {
          LIGHT.shadow.bias = prop.parameters.shadow.bias;
        }

        if (prop.parameters.shadow.mapSize !== undefined) {
          LIGHT.shadow.mapSize.width = prop.parameters.shadow.mapSize.width; // default
          LIGHT.shadow.mapSize.height = prop.parameters.shadow.mapSize.height; // default
        }

        if (prop.parameters.shadow.camera !== undefined) {
          LIGHT.shadow.camera.near = prop.parameters.shadow.camera.near; // default
          LIGHT.shadow.camera.far = prop.parameters.shadow.camera.far; // default
          LIGHT.shadow.camera.top = prop.parameters.shadow.camera.top; // default
          LIGHT.shadow.camera.bottom = prop.parameters.shadow.camera.bottom; // default
          LIGHT.shadow.camera.left = prop.parameters.shadow.camera.left; // default
          LIGHT.shadow.camera.right = prop.parameters.shadow.camera.right; // default
          LIGHT.shadow.camera.updateProjectionMatrix();
        }
      }
    }

    // property: // 
    this.f.setPropAndParameters(LIGHT, prop, SCENE);

    if (SCENE !== undefined) {
      if ((SCENE as any).OBJECTS === undefined) {
        (SCENE as any).OBJECTS = {};
      }

      (SCENE as any).OBJECTS[LIGHT.name] = LIGHT;
      SCENE.add(LIGHT);
    }

    if (callBack !== undefined) {
      if (callBackProp !== undefined) {
        callBackProp.obj = LIGHT;
        callBack(callBackProp);
      } else {
        callBack({ obj: LIGHT, info: null });
      }
    }

    return LIGHT;
  }

  public addGroup(SCENE: THREE.Scene, prop: {
    name?: string;
    parameters?: Record<string, any>;
    position?: { x?: number; y?: number; z?: number };
    rotation?: { x?: number; y?: number; z?: number };
    [key: string]: any;
  }, callBack?: (params: { obj: THREE.Group; info: any }) => void, callBackProp?: any): THREE.Group {
    const GROUP = new THREE.Group();

    // parameters: // -----------------------------------------------------
    if (prop.parameters !== undefined) {
      this.f.setPropAndParameters(GROUP, prop.parameters);
    }

    // property: // 
    this.f.setPropAndParameters(GROUP, prop, SCENE);

    if (SCENE !== undefined) {
      if ((SCENE as any).OBJECTS === undefined) {
        (SCENE as any).OBJECTS = {};
      }

      (SCENE as any).OBJECTS[GROUP.name] = GROUP;
      SCENE.add(GROUP);
    }

    if (callBack !== undefined) {
      if (callBackProp !== undefined) {
        callBackProp.obj = GROUP;
        callBack(callBackProp);
      } else {
        callBack({ obj: GROUP, info: null });
      }
    }

    return GROUP;
  }

  public addHelper(SCENE: THREE.Scene, prop: {
    name?: string;
    type?: string;
    obj?: THREE.Object3D;
    parameters?: Record<string, any>;
    position?: { x?: number; y?: number; z?: number };
    rotation?: { x?: number; y?: number; z?: number };
    [key: string]: any;
  }, callBack?: (params: { obj: THREE.Object3D; info: any }) => void, callBackProp?: any): THREE.Object3D {
    let HELPER: THREE.Object3D;

    if (prop.obj !== undefined) {
      switch (prop.obj.type) {
        case "Group":
          let axisSize = 1.0;

          if (prop.parameters !== undefined && prop.parameters.size !== undefined) {
            axisSize = prop.parameters.size;
          }

          HELPER = new THREE.AxesHelper(axisSize);
          if (prop.parameters !== undefined && prop.parameters.color !== undefined) {
            const color = new THREE.Color(prop.parameters.color.r, prop.parameters.color.g, prop.parameters.color.b);
            (HELPER as THREE.AxesHelper).setColors(
              color, // x-axis
              new THREE.Color(0, 1, 0), // y-axis (default green)
              new THREE.Color(0, 0, 1)  // z-axis (default blue)
            );
          }
          break;

        case "PerspectiveCamera":
        case "OrthographicCamera":
          HELPER = new THREE.CameraHelper(prop.obj as THREE.Camera);
          break;

        case "DirectionalLight":
          HELPER = new THREE.DirectionalLightHelper(prop.obj as THREE.DirectionalLight);

          if (prop.parameters !== undefined && prop.parameters.color !== undefined) {
            // DirectionalLightHelper doesn't have a direct material property
            // Update the helper with a new color
            (HELPER as THREE.DirectionalLightHelper).color = new THREE.Color(
              prop.parameters.color.r,
              prop.parameters.color.g,
              prop.parameters.color.b
            );
            // Need to call update() to apply the color change
            (HELPER as THREE.DirectionalLightHelper).update();
          }
          break;

        case "SpotLight":
          HELPER = new THREE.SpotLightHelper(prop.obj as THREE.SpotLight);
          if (prop.parameters !== undefined && prop.parameters.color !== undefined) {
            if (typeof prop.parameters.color === 'object' && 
                'r' in prop.parameters.color && 
                'g' in prop.parameters.color && 
                'b' in prop.parameters.color) {
              (HELPER as THREE.SpotLightHelper).color = new THREE.Color(
                prop.parameters.color.r,
                prop.parameters.color.g,
                prop.parameters.color.b
              );
            }
          }
          break;

        case "PointLight":
          let pointSphereSize = 1.0;

          if (prop.parameters !== undefined && prop.parameters.sphereSize !== undefined) {
            pointSphereSize = prop.parameters.sphereSize;
          }

          HELPER = new THREE.PointLightHelper(prop.obj as THREE.PointLight, pointSphereSize);

          if (prop.parameters !== undefined && prop.parameters.color !== undefined) {
            if (typeof prop.parameters.color === 'object' && 
                'r' in prop.parameters.color && 
                'g' in prop.parameters.color && 
                'b' in prop.parameters.color) {
              (HELPER as THREE.PointLightHelper).color = new THREE.Color(
                prop.parameters.color.r,
                prop.parameters.color.g,
                prop.parameters.color.b
              );
            }
          }
          break;

        default:
          HELPER = new THREE.Object3D();
          break;
      }
    } else if (prop.type !== undefined) {
      // Create helper directly from type
      switch (prop.type) {
        case "AxesHelper":
          let axisSize = 1.0;
          if (prop.parameters !== undefined && prop.parameters.size !== undefined) {
            axisSize = prop.parameters.size;
          }
          HELPER = new THREE.AxesHelper(axisSize);
          break;

        case "GridHelper":
          let gridSize = 10;
          let gridDivisions = 10;
          let gridColorCenterLine = 0x444444;
          let gridColorGrid = 0x888888;

          if (prop.parameters !== undefined) {
            if (prop.parameters.size !== undefined) gridSize = prop.parameters.size;
            if (prop.parameters.divisions !== undefined) gridDivisions = prop.parameters.divisions;
            if (prop.parameters.colorCenterLine !== undefined) gridColorCenterLine = prop.parameters.colorCenterLine;
            if (prop.parameters.colorGrid !== undefined) gridColorGrid = prop.parameters.colorGrid;
          }

          HELPER = new THREE.GridHelper(gridSize, gridDivisions, gridColorCenterLine, gridColorGrid);
          break;

        default:
          HELPER = new THREE.Object3D();
          break;
      }
    } else {
      HELPER = new THREE.Object3D();
    }

    // Set name
    if (prop.name !== undefined) {
      HELPER.name = prop.name;
    }

    // Set properties
    this.f.setPropAndParameters(HELPER, prop, SCENE);

    // Add to scene if provided
    if (SCENE !== undefined) {
      if ((SCENE as any).OBJECTS === undefined) {
        (SCENE as any).OBJECTS = {};
      }
      (SCENE as any).OBJECTS[HELPER.name] = HELPER;
      SCENE.add(HELPER);
    }

    // Execute callback if provided
    if (callBack !== undefined) {
      if (callBackProp !== undefined) {
        callBackProp.obj = HELPER;
        callBack(callBackProp);
      } else {
        callBack({ obj: HELPER, info: null });
      }
    }

    return HELPER;
  }

  public addFromFile(SCENE: THREE.Scene, prop: {
    name?: string;
    type?: string;
    url: string;
    parameters?: Record<string, any>;
    position?: { x?: number; y?: number; z?: number };
    rotation?: { x?: number; y?: number; z?: number };
    scale?: { x?: number; y?: number; z?: number };
    [key: string]: any;
  }, callBack?: (params: { obj: THREE.Object3D; info: any }) => void, callBackProp?: any): void {
    // Load the object
    this.f.objectLoader(
      prop.url,
      (result: { obj: THREE.Object3D; info: any }) => {
        const obj = result.obj;
        
        // Set name if provided
        if (prop.name) {
          obj.name = prop.name;
        }
        
        // Apply parameters if provided
        if (prop.parameters) {
          this.f.setPropAndParameters(obj, prop.parameters);
        }
        
        // Apply other properties
        this.f.setPropAndParameters(obj, prop, SCENE);
        
        // Add to scene if provided
        if (SCENE !== undefined) {
          if ((SCENE as any).OBJECTS === undefined) {
            (SCENE as any).OBJECTS = {};
          }
          (SCENE as any).OBJECTS[obj.name] = obj;
          SCENE.add(obj);
        }
        
        // Execute callback if provided
        if (callBack !== undefined) {
          if (callBackProp !== undefined) {
            callBackProp.obj = obj;
            callBack(callBackProp);
          } else {
            callBack({ obj, info: null });
          }
        }
      }
    );
  }

  // Add these methods to f object in the initialization
  private initializeAdditionalMethods(): void {
    // Add the methods to the f object
    this.f.addLight = this.addLight.bind(this);
    this.f.addGroup = this.addGroup.bind(this);
    this.f.addHelper = this.addHelper.bind(this);
    this.f.addFromFile = this.addFromFile.bind(this);
  }

  public addMesh(SCENE: THREE.Scene, prop: {
    name?: string;
    type: string;
    material?: string | THREE.Material;
    parameters?: Record<string, any>;
    position?: { x?: number; y?: number; z?: number };
    rotation?: { x?: number; y?: number; z?: number };
    scale?: { x?: number; y?: number; z?: number };
    [key: string]: any;
  }, callBack?: (params: { obj: THREE.Mesh; info: any }) => void, callBackProp?: any): THREE.Mesh {
    // Create geometry based on type
    const geometry = new (THREE as any)[prop.type](
      ...(prop.parameters?.geometry?.parameters || [])
    );
    
    // Get material
    let material: THREE.Material;
    
    if (typeof prop.material === 'string') {
      // If material is a string, try to find it in scene materials
      material = (SCENE as any)?.MATERIALS?.[prop.material] || new THREE.MeshBasicMaterial();
    } else if (prop.material instanceof THREE.Material) {
      // If material is already a THREE.Material instance
      material = prop.material;
    } else {
      // Default material
      material = new THREE.MeshBasicMaterial();
    }
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    
    // Set name if provided
    if (prop.name) {
      mesh.name = prop.name;
    }
    
    // Apply parameters
    if (prop.parameters) {
      this.f.setPropAndParameters(mesh, prop.parameters);
    }
    
    // Apply other properties
    this.f.setPropAndParameters(mesh, prop, SCENE);
    
    // Add to scene if provided
    if (SCENE !== undefined) {
      if ((SCENE as any).OBJECTS === undefined) {
        (SCENE as any).OBJECTS = {};
      }
      (SCENE as any).OBJECTS[mesh.name] = mesh;
      SCENE.add(mesh);
    }
    
    // Execute callback if provided
    if (callBack !== undefined) {
      if (callBackProp !== undefined) {
        callBackProp.obj = mesh;
        callBack(callBackProp);
      } else {
        callBack({ obj: mesh, info: null });
      }
    }
    
    return mesh;
  };

  public addLine = (SCENE: THREE.Scene, prop: {
    name?: string;
    type: string;
    points?: THREE.Vector3[];
    material?: string | THREE.Material;
    parameters?: Record<string, any>;
    position?: { x?: number; y?: number; z?: number };
    rotation?: { x?: number; y?: number; z?: number };
    scale?: { x?: number; y?: number; z?: number };
    [key: string]: any;
  }, callBack?: (params: { obj: THREE.Line; info: any }) => void, callBackProp?: any): THREE.Line => {
    // Create points if not provided
    const points = prop.points || [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1, 0)
    ];
    
    // Create geometry
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Get material
    let material: THREE.Material;
    
    if (typeof prop.material === 'string') {
      // If material is a string, try to find it in scene materials
      material = (SCENE as any)?.MATERIALS?.[prop.material] || new THREE.LineBasicMaterial();
    } else if (prop.material instanceof THREE.Material) {
      // If material is already a THREE.Material instance
      material = prop.material;
    } else {
      // Default material
      material = new THREE.LineBasicMaterial();
    }
    
    // Create line based on type
    const line = new (THREE as any)[prop.type](geometry, material);
    
    // Set name if provided
    if (prop.name) {
      line.name = prop.name;
    }
    
    // Apply parameters
    if (prop.parameters) {
      this.f.setPropAndParameters(line, prop.parameters);
    }
    
    // Apply other properties
    this.f.setPropAndParameters(line, prop, SCENE);
    
    // Add to scene if provided
    if (SCENE !== undefined) {
      if ((SCENE as any).OBJECTS === undefined) {
        (SCENE as any).OBJECTS = {};
      }
      (SCENE as any).OBJECTS[line.name] = line;
      SCENE.add(line);
    }
    
    // Execute callback if provided
    if (callBack !== undefined) {
      if (callBackProp !== undefined) {
        callBackProp.obj = line;
        callBack(callBackProp);
      } else {
        callBack({ obj: line, info: null });
      }
    }
    
    return line;
  };

  public addSprite = (SCENE: THREE.Scene, prop: {
    name?: string;
    material?: string | THREE.SpriteMaterial;
    parameters?: Record<string, any>;
    position?: { x?: number; y?: number; z?: number };
    scale?: { x?: number; y?: number; z?: number };
    [key: string]: any;
  }, callBack?: (params: { obj: THREE.Sprite; info: any }) => void, callBackProp?: any): THREE.Sprite => {
    // Get material
    let material: THREE.SpriteMaterial;
    
    if (typeof prop.material === 'string') {
      // If material is a string, try to find it in scene materials
      material = (SCENE as any)?.MATERIALS?.[prop.material] as THREE.SpriteMaterial || new THREE.SpriteMaterial();
    } else if (prop.material instanceof THREE.SpriteMaterial) {
      // If material is already a THREE.SpriteMaterial instance
      material = prop.material;
    } else {
      // Default material
      material = new THREE.SpriteMaterial();
    }
    
    // Create sprite
    const sprite = new THREE.Sprite(material);
    
    // Set name if provided
    if (prop.name) {
      sprite.name = prop.name;
    }
    
    // Apply parameters
    if (prop.parameters) {
      this.f.setPropAndParameters(sprite, prop.parameters);
    }
    
    // Apply other properties
    this.f.setPropAndParameters(sprite, prop, SCENE);
    
    // Add to scene if provided
    if (SCENE !== undefined) {
      if ((SCENE as any).OBJECTS === undefined) {
        (SCENE as any).OBJECTS = {};
      }
      (SCENE as any).OBJECTS[sprite.name] = sprite;
      SCENE.add(sprite);
    }
    
    // Execute callback if provided
    if (callBack !== undefined) {
      if (callBackProp !== undefined) {
        callBackProp.obj = sprite;
        callBack(callBackProp);
      } else {
        callBack({ obj: sprite, info: null });
      }
    }
    
    return sprite;
  };

  public addClone = (sourceOBJ: THREE.Object3D, targetScene?: THREE.Scene, callBack?: (params: { obj: THREE.Object3D; info: any }) => void, callBackProp?: any): THREE.Object3D => {
    // Clone the source object
    const clonedObj = sourceOBJ.clone();
    
    // Add to scene if provided
    if (targetScene !== undefined) {
      if ((targetScene as any).OBJECTS === undefined) {
        (targetScene as any).OBJECTS = {};
      }
      (targetScene as any).OBJECTS[clonedObj.name] = clonedObj;
      targetScene.add(clonedObj);
    }
    
    // Execute callback if provided
    if (callBack !== undefined) {
      if (callBackProp !== undefined) {
        callBackProp.obj = clonedObj;
        callBack(callBackProp);
      } else {
        callBack({ obj: clonedObj, info: null });
      }
    }
    
    return clonedObj;
  };

  public addFog = (SCENE: THREE.Scene, fog: {
    type: string;
    color?: THREE.ColorRepresentation;
    near?: number;
    far?: number;
    density?: number;
  }): void => {
    if (fog.type === 'Fog') {
      SCENE.fog = new THREE.Fog(
        fog.color !== undefined ? fog.color : 0xffffff, 
        fog.near !== undefined ? fog.near : 1, 
        fog.far !== undefined ? fog.far : 1000
      );
    } else if (fog.type === 'FogExp2') {
      SCENE.fog = new THREE.FogExp2(
        fog.color !== undefined ? fog.color : 0xffffff, 
        fog.density !== undefined ? fog.density : 0.00025
      );
    }
  };

  public addMaterial = (SCENE: THREE.Scene, prop: {
    name: string;
    type: string;
    parameters?: Record<string, any>;
    [key: string]: any;
  }, callBack?: (params: { obj: THREE.Material; info: any }) => void, callBackProp?: any): THREE.Material => {
    // Create material
    const material = new (THREE as any)[prop.type]();
    
    // Apply parameters
    if (prop.parameters !== undefined) {
      this.f.setPropAndParameters(material, prop.parameters);
      
      // Handle textures if defined in parameters
      if (prop.parameters.map && typeof prop.parameters.map === 'string') {
        material.map = (SCENE as any)?.TEXTURES?.[prop.parameters.map];
      }
      
      if (prop.parameters.normalMap && typeof prop.parameters.normalMap === 'string') {
        material.normalMap = (SCENE as any)?.TEXTURES?.[prop.parameters.normalMap];
      }

      if (prop.parameters.bumpMap && typeof prop.parameters.bumpMap === 'string') {
        material.bumpMap = (SCENE as any)?.TEXTURES?.[prop.parameters.bumpMap];
      }

      if (prop.parameters.displacementMap && typeof prop.parameters.displacementMap === 'string') {
        material.displacementMap = (SCENE as any)?.TEXTURES?.[prop.parameters.displacementMap];
      }

      if (prop.parameters.roughnessMap && typeof prop.parameters.roughnessMap === 'string') {
        material.roughnessMap = (SCENE as any)?.TEXTURES?.[prop.parameters.roughnessMap];
      }

      if (prop.parameters.metalnessMap && typeof prop.parameters.metalnessMap === 'string') {
        material.metalnessMap = (SCENE as any)?.TEXTURES?.[prop.parameters.metalnessMap];
      }

      if (prop.parameters.alphaMap && typeof prop.parameters.alphaMap === 'string') {
        material.alphaMap = (SCENE as any)?.TEXTURES?.[prop.parameters.alphaMap];
      }

      if (prop.parameters.emissiveMap && typeof prop.parameters.emissiveMap === 'string') {
        material.emissiveMap = (SCENE as any)?.TEXTURES?.[prop.parameters.emissiveMap];
      }

      if (prop.parameters.specularMap && typeof prop.parameters.specularMap === 'string') {
        material.specularMap = (SCENE as any)?.TEXTURES?.[prop.parameters.specularMap];
      }

      if (prop.parameters.lightMap && typeof prop.parameters.lightMap === 'string') {
        material.lightMap = (SCENE as any)?.TEXTURES?.[prop.parameters.lightMap];
      }
      
      material.needsUpdate = true;
    }
    
    // Set name
    material.name = prop.name;
    
    // Add to scene materials if scene is provided
    if (SCENE !== undefined) {
      if ((SCENE as any).MATERIALS === undefined) {
        (SCENE as any).MATERIALS = {};
      }
      (SCENE as any).MATERIALS[prop.name] = material;
    }
    
    // Execute callback if provided
    if (callBack !== undefined) {
      if (callBackProp !== undefined) {
        callBackProp.obj = material;
        callBack(callBackProp);
      } else {
        callBack({ obj: material, info: null });
      }
    }
    
    return material;
  };

  public deleteMaterial = (
    scene: THREE.Scene,
    material: THREE.Material | string,
    callBack?: Function,
    callBackProp?: any
  ): void => {
    if (!material) {
      return;
    }
    
    let materialName: string;
    
    if (typeof material === 'string') {
      materialName = material;
      material = (scene as any)?.MATERIALS?.[materialName];
    } else {
      materialName = material.name;
    }
    
    // First remove the material from any meshes using it
    if (scene) {
      scene.traverse((node: THREE.Object3D) => {
        if (node instanceof THREE.Mesh) {
          if (node.material) {
            // Handle array of materials
            if (Array.isArray(node.material)) {
              const materialIndex = node.material.findIndex(m => m === material || m.name === materialName);
              if (materialIndex !== -1) {
                // Replace with default material
                node.material[materialIndex] = new THREE.MeshBasicMaterial();
              }
            } else if (node.material === material || node.material.name === materialName) {
              // Replace with default material
              node.material = new THREE.MeshBasicMaterial();
            }
          }
        }
      });
    }
    
    // Dispose the material
    if (material instanceof THREE.Material) {
      material.dispose();
    }
    
    // Remove from scene materials
    if (scene && (scene as any).MATERIALS && (scene as any).MATERIALS[materialName]) {
      delete (scene as any).MATERIALS[materialName];
    }
    
    // Execute callback if provided
    if (callBack) {
      if (callBackProp) {
        callBack(callBackProp);
      } else {
        callBack();
      }
    }
  };

  public deleteElement = (
    scene: THREE.Scene,
    obj: THREE.Object3D | string,
    prop?: any,
    callBack?: Function,
    callBackProp?: any
  ): void => {
    if (!obj) {
      return;
    }
    
    let objName: string;
    let objToRemove: THREE.Object3D | null = null;
    
    if (typeof obj === 'string') {
      objName = obj;
      objToRemove = scene.getObjectByName(objName) || null;
    } else {
      objName = obj.name;
      objToRemove = obj;
    }
    
    if (objToRemove) {
      // Function to recursively remove a node and its children
      const deleteNodeToRemove = (node: THREE.Object3D) => {
        // Remove children first
        while (node.children.length > 0) {
          deleteNodeToRemove(node.children[0]);
        }
        
        // Dispose geometries and materials
        if (node instanceof THREE.Mesh) {
          if (node.geometry) {
            node.geometry.dispose();
          }
          
          if (node.material) {
            if (Array.isArray(node.material)) {
              node.material.forEach(material => material.dispose());
            } else {
              node.material.dispose();
            }
          }
        }
        
        // Remove from parent
        if (node.parent) {
          node.parent.remove(node);
        }
      };
      
      // Remove the object from scene
      deleteNodeToRemove(objToRemove);
      
      // Remove from scene objects
      if (scene && (scene as any).OBJECTS && (scene as any).OBJECTS[objName]) {
        delete (scene as any).OBJECTS[objName];
      }
    }
    
    // Execute callback if provided
    if (callBack) {
      if (callBackProp) {
        callBack(callBackProp);
      } else {
        callBack();
      }
    }
  };

  public playMotions = (
    node: THREE.Object3D,
    playMotionList: string[]
  ): void => {
    if (!(node as any).MM3D || !(node as any).MM3D.MOTIONS) {
      return;
    }
    
    const motions = (node as any).MM3D.MOTIONS;
    
    playMotionList.forEach(motionName => {
      if (motions.list && motions.list[motionName] && motions.list[motionName].clipAction) {
        motions.list[motionName].clipAction.play();
      }
    });
  };

  public updateEvent = (
    scene: THREE.Scene,
    camera: THREE.Camera,
    view: { width: number; height: number }
  ): void => {
    // Screen normalized mouse
    if (this.p.DEVICES.mouse && this.p.DEVICES.mouse.position) {
      const normalizedScreenVector = this.f.getScreenNormalizedMouse(
        camera,
        this.p.DEVICES.mouse.position.x,
        this.p.DEVICES.mouse.position.y,
        view
      );
      
      // Create list of clickable objects
      const clickableNodes: THREE.Object3D[] = [];
      
      scene.traverse((node: THREE.Object3D) => {
        if ((node as any).clickable) {
          clickableNodes.push(node);
        }
      });
      
      // Raycast
      if (clickableNodes.length > 0) {
        this.p.RAYCAST.setFromCamera(normalizedScreenVector, camera);
        const intersects = this.p.RAYCAST.intersectObjects(clickableNodes, true);
        
        // Process intersections
        // Additional event handling logic would go here
      }
    }
  };

  public updateAll = (
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    viewport?: { width?: number; height?: number }
  ): void => {
    // Calculate delta time
    this.p.DELTAT = this.p.CLOCK.getDelta();
    
    // Update all nodes in the scene
    const updateAllNodeTraverse = (node: THREE.Object3D) => {
      // Update node scripts if any
      if ((node as any).MM3D && (node as any).MM3D.scriptList) {
        (node as any).MM3D.scriptList.forEach((script: any) => {
          if (script.function) {
            script.function(script.functionProp);
          }
        });
      }
      
      // Update node states if any
      if ((node as any).MM3D && (node as any).MM3D.STATES && (node as any).MM3D.STATES.current) {
        const current = (node as any).MM3D.STATES.current;
        
        // Execute state update function if available
        if (current.update) {
          current.update(this.p.DELTAT);
        }
        
        // Check transitions
        if (current.transitions) {
          for (const transition of current.transitions) {
            if (transition.condition()) {
              // Perform transition to target state
              const targetState = (node as any).MM3D.STATES.statesList[transition.target];
              
              // Execute exit function of current state
              if (current.onExit) {
                current.onExit(targetState);
              }
              
              // Execute transition function if available
              if (transition.onTransition) {
                transition.onTransition();
              }
              
              // Execute enter function of target state
              if (targetState.onEnter) {
                targetState.onEnter(current);
              }
              
              // Update current state
              (node as any).MM3D.STATES.previous = current;
              (node as any).MM3D.STATES.current = targetState;
              
              break;
            }
          }
        }
      }
      
      // Update motions if any
      if ((node as any).MM3D && (node as any).MM3D.MOTIONS && (node as any).MM3D.MOTIONS.mixer) {
        (node as any).MM3D.MOTIONS.mixer.update(this.p.DELTAT);
      }
      
      // Process children
      for (let i = 0; i < node.children.length; i++) {
        updateAllNodeTraverse(node.children[i]);
      }
    };
    
    // Start traversal from the scene
    updateAllNodeTraverse(scene);
    
    // Update events (mouse, touch, etc.)
    this.f.updateEvent(scene, camera, {
      width: viewport?.width || window.innerWidth,
      height: viewport?.height || window.innerHeight
    });
    
    // Render the scene
    renderer.render(scene, camera);
  };

  public setParameters = (
    defaultParameters: Record<string, any>,
    newParameters: Record<string, any>
  ): Record<string, any> => {
    const result = { ...defaultParameters };
    
    if (newParameters) {
      Object.keys(newParameters).forEach(key => {
        result[key] = newParameters[key];
      });
    }
    
    return result;
  };

  public checkIsInViewPort = (p: {
    position: THREE.Vector3;
    camera: THREE.Camera;
    padding?: number;
  }): boolean => {
    // Default padding
    const padding = p.padding !== undefined ? p.padding : 0;
    
    // Convert 3D position to screen position
    const vector = p.position.clone();
    vector.project(p.camera);
    
    // Check if the point is inside the viewport (with padding)
    return (
      vector.x >= -1 - padding && 
      vector.x <= 1 + padding && 
      vector.y >= -1 - padding && 
      vector.y <= 1 + padding && 
      vector.z >= -1 && 
      vector.z <= 1
    );
  };

  public updateRefreshDevices = (): void => {
    // Update gamepad state
    if (this.p.DEVICES.gamepad) {
      const gamepads = navigator.getGamepads();
      if (gamepads) {
        this.p.DEVICES.gamepad = gamepads[0]; // Update with current gamepad state
      }
    }
  };

  public render = (layerList: Array<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
    clear?: boolean;
  }>): void => {
    // Render each layer in sequence
    layerList.forEach(layer => {
      this.f.renderLayer(layer);
    });
  };
} 