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
  parameters?: Record<string, any>;
  textureList?: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  materialList?: Array<{
    name: string;
    type: string;
    parameters?: Record<string, any>;
  }>;
  elementList?: Array<{
    name: string;
    type: string;
    parameters?: Record<string, any>;
  }>;
  physicConstraintsList?: Array<{
    name: string;
    type: string;
    parameters?: Record<string, any>;
  }>;
  physicMaterialsList?: Array<{
    name: string;
    type: string;
    parameters?: Record<string, any>;
  }>;
}

interface ComplexObjectGroup extends THREE.Group {
  OBJECTS: Record<string, THREE.Object3D>;
  MATERIALS: Record<string, THREE.Material>;
  TEXTURES: Record<string, THREE.Texture>;
  PHXCONSTRAINTS: Record<string, any>;
  PHXMATERIALS: Record<string, any>;
}

export class VARCOClass {
  public p: VarcoProperties;
  public f: Record<string, any>;
  public button: Record<string, any>;
  public scene?: THREE.Scene;

  constructor() {
    this.p = {
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
    this.f = {};
    this.button = {};

    // Inizializzazione dei metodi
    this.initMethods();
    
    // Esecuzione check dispositivo
    this.f.checkDevice();
    this.initializeComplexObjectMethods();
    this.initializeViewportMethods();
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
    this.f.addScene = (container: HTMLElement | string | null, options: {
      backgroundColor?: THREE.ColorRepresentation,
      fogColor?: THREE.ColorRepresentation,
      fogNear?: number,
      fogFar?: number,
      cameraFOV?: number,
      cameraNear?: number,
      cameraFar?: number,
      cameraPosition?: THREE.Vector3,
      rendererPixelRatio?: number,
      rendererClearColor?: THREE.ColorRepresentation,
      rendererSize?: { width: number, height: number }
    } = {}): { 
      scene: THREE.Scene, 
      camera: THREE.PerspectiveCamera, 
      renderer: THREE.WebGLRenderer,
      domElement: HTMLCanvasElement
    } => {
      // Gestione del container
      let containerElement: HTMLElement | null = null;
      
      if (typeof container === 'string') {
        // Se è una stringa, lo consideriamo come selector
        containerElement = document.querySelector(container);
      } else if (container instanceof HTMLElement) {
        // Se è già un elemento HTML
        containerElement = container;
      }
      
      if (!containerElement) {
        console.warn('VARCO.addScene: Container not found, creating a new div element');
        containerElement = document.createElement('div');
        containerElement.style.width = '100%';
        containerElement.style.height = '100%';
        document.body.appendChild(containerElement);
      }
      
      // Crea una nuova scena
      const scene = new THREE.Scene();
      this.scene = scene;
      
      // Imposta background e fog se specificati
      if (options.backgroundColor) {
        scene.background = new THREE.Color(options.backgroundColor);
      }
      
      if (options.fogColor) {
        scene.fog = new THREE.Fog(
          options.fogColor, 
          options.fogNear || 1, 
          options.fogFar || 1000
        );
      }
      
      // Determina le dimensioni del contenitore
      const containerWidth = options.rendererSize ? 
        options.rendererSize.width : 
        containerElement.clientWidth || window.innerWidth;
        
      const containerHeight = options.rendererSize ? 
        options.rendererSize.height : 
        containerElement.clientHeight || getDOMHeight(containerElement) || window.innerHeight;
      
      // Crea la camera
      const aspectRatio = containerWidth / containerHeight;
      
      const camera = new THREE.PerspectiveCamera(
        options.cameraFOV || 75,
        aspectRatio,
        options.cameraNear || 0.1,
        options.cameraFar || 1000
      );
      
      // Posiziona la camera
      if (options.cameraPosition) {
        camera.position.copy(options.cameraPosition);
      } else {
        camera.position.set(0, 1.6, 3);
      }
      
      // Crea il renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      
      if (options.rendererPixelRatio) {
        renderer.setPixelRatio(options.rendererPixelRatio);
      } else {
        renderer.setPixelRatio(window.devicePixelRatio);
      }
      
      if (options.rendererClearColor) {
        renderer.setClearColor(options.rendererClearColor);
      }
      
      renderer.setSize(containerWidth, containerHeight);
      
      // Prepara il canvas per Svelte
      const domElement = renderer.domElement;
      
      // Aggiungi il canvas al container solo se il container esiste nel DOM
      try {
        containerElement.appendChild(domElement);
      } catch (error) {
        console.warn('VARCO.addScene: Could not append canvas to container', error);
      }
      
      // Aggiunta gestione del resize della finestra
      const handleResize = () => {
        if (!options.rendererSize) {
          const width = containerElement?.clientWidth || window.innerWidth;
          const height = containerElement?.clientHeight || getDOMHeight(containerElement) || window.innerHeight;
          
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          
          renderer.setSize(width, height);
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      return { scene, camera, renderer, domElement };
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

      COMPLEX.OBJECTS = {};
      COMPLEX.MATERIALS = {};
      COMPLEX.TEXTURES = {};
      COMPLEX.PHXCONSTRAINTS = {};
      COMPLEX.PHXMATERIALS = {};

      if (prop.parameters === undefined) {
        prop.parameters = {};
      }

      this.f.setPropAndParameters(COMPLEX, prop.parameters);

      const complexObjectDone = () => {
        if (callBack !== undefined) {
          if (callBackProp !== undefined) {
            callBackProp.obj = COMPLEX;
            callBack(callBackProp);
          } else {
            callBack({ obj: COMPLEX });
          }
        }
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
        if (prop.textureList !== undefined) {
          totCounter = prop.textureList.length;
          prop.textureList.forEach((textureItem) => {
            if (textureItem.type === "standard") {
              this.f.loadStandardTexture(
                textureItem.url,
                (texture: THREE.Texture) => {
                  COMPLEX.TEXTURES[textureItem.name] = texture;
                  if (checkCounter(totCounter)) {
                    createMaterials();
                  }
                },
                (error: Error) => {
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
                textureItem.url,
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
        if (prop.materialList !== undefined) {
          totCounter = prop.materialList.length;
          prop.materialList.forEach((materialItem) => {
            const material = new (THREE as any)[materialItem.type]();
            if (materialItem.parameters !== undefined) {
              this.f.setPropAndParameters(material, materialItem.parameters);
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

      const createElements = () => {
        if (prop.elementList !== undefined) {
          totCounter = prop.elementList.length;
          prop.elementList.forEach((elementItem) => {
            const element = new (THREE as any)[elementItem.type]();
            if (elementItem.parameters !== undefined) {
              this.f.setPropAndParameters(element, elementItem.parameters);
            }
            COMPLEX.OBJECTS[elementItem.name] = element;
            if (checkCounter(totCounter)) {
              createPhysicContraints();
            }
          });
        } else {
          createPhysicContraints();
        }
      };

      const createPhysicContraints = () => {
        if (prop.physicConstraintsList !== undefined) {
          totCounter = prop.physicConstraintsList.length;
          prop.physicConstraintsList.forEach((constraintItem) => {
            const constraint = new (THREE as any)[constraintItem.type]();
            if (constraintItem.parameters !== undefined) {
              this.f.setPropAndParameters(constraint, constraintItem.parameters);
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
        if (prop.physicMaterialsList !== undefined) {
          totCounter = prop.physicMaterialsList.length;
          prop.physicMaterialsList.forEach((materialItem) => {
            const material = new (THREE as any)[materialItem.type]();
            if (materialItem.parameters !== undefined) {
              this.f.setPropAndParameters(material, materialItem.parameters);
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

      const deleteNodeToRemove = (node: THREE.Object3D) => {
        if (node.parent) {
          node.parent.remove(node);
        }
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
      };

      const updateAllNodeTraverse = (node: THREE.Object3D) => {
        if (node instanceof THREE.Mesh) {
          if (node.material) {
            if (Array.isArray(node.material)) {
              node.material.forEach(material => {
                if (material.needsUpdate) {
                  material.needsUpdate = false;
                }
              });
            } else if (node.material.needsUpdate) {
              node.material.needsUpdate = false;
            }
          }
        }
        node.children.forEach(child => updateAllNodeTraverse(child));
      };

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
}

// Esportazione di un'istanza singleton per mantenere la compatibilità
export const VARCO = new VARCOClass(); 