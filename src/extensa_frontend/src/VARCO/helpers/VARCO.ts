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

// Define interfaces
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
      throw new Error("Use VARCO.getInstance() instead of new.");
    }
    VARCOClass._initialized = true;
    
    // Initialize all methods
    this.initializeMethods();
    
    // Check device information
    this.f.checkDevice();
  }
  
  public static getInstance(): VARCOClass {
    if (!VARCOClass._instance) {
      VARCOClass._instance = new VARCOClass();
    }
    return VARCOClass._instance;
  }
  
  private initializeMethods(): void {
    // Utility methods
    this.f.objectClone = this.objectClone.bind(this);
    this.f.checkCollisionOBB = this.checkCollisionOBB.bind(this);
    this.f.generateUUID = this.generateUUID.bind(this);
    this.f.array_swap = this.array_swap.bind(this);
    this.f.array_move = this.array_move.bind(this);
    this.f.arrayBufferToBase64 = this.arrayBufferToBase64.bind(this);
    this.f.base64ToArrayBuffer = this.base64ToArrayBuffer.bind(this);
    this.f.checkDevice = this.checkDevice.bind(this);
    this.f.getInfoDevice = this.getInfoDevice.bind(this);
    
    // Math and coordinate transformation
    this.f.deg2rad = this.deg2rad.bind(this);
    this.f.rad2deg = this.rad2deg.bind(this);
    this.f.mathInterpolateTo = this.mathInterpolateTo.bind(this);
    this.f.findIndexOf = this.findIndexOf.bind(this);
    this.f.stringToFunction = this.stringToFunction.bind(this);
    this.f.stringToVariable = this.stringToVariable.bind(this);
    this.f.variableToString = this.variableToString.bind(this);
    this.f.valueToVariable = this.valueToVariable.bind(this);
    this.f.lonLatToPos = this.lonLatToPos.bind(this);
    this.f.posToLonLat = this.posToLonLat.bind(this);
    this.f.lonLatDistance = this.lonLatDistance.bind(this);
    this.f.fromCoordsToPosition = this.fromCoordsToPosition.bind(this);
    this.f.tilesToPixels = this.tilesToPixels.bind(this);
    this.f.ddToDms = this.ddToDms.bind(this);
    this.f.getDms = this.getDms.bind(this);
    this.f.dmsToDd = this.dmsToDd.bind(this);
    this.f.Wgs2Utm = this.Wgs2Utm.bind(this);
    this.f.Utm2Wgs = this.Utm2Wgs.bind(this);
    this.f.WGS84_pixelsToLonLat = this.WGS84_pixelsToLonLat.bind(this);
    this.f.WGS84_lonLatToPixels = this.WGS84_lonLatToPixels.bind(this);
    this.f.ip_local = this.ip_local.bind(this);
    
    // Viewport and UI methods
    this.f.adaptDivViewPort = this.adaptDivViewPort.bind(this);
    this.f.addAdaptive = this.addAdaptive.bind(this);
    this.f.updateAdaptive = this.updateAdaptive.bind(this);
    this.f.onMainWindowResize = this.onMainWindowResize.bind(this);
    this.f.setPropAndParameters = this.setPropAndParameters.bind(this);
    
    // Mouse events
    this.f.tellMouseDown = this.tellMouseDown.bind(this);
    this.f.tellMouseWheel = this.tellMouseWheel.bind(this);
    this.f.tellMouseWheel_FF = this.tellMouseWheel_FF.bind(this);
    this.f.tellMousePos = this.tellMousePos.bind(this);
    this.f.tellMouseUp = this.tellMouseUp.bind(this);
    this.f.tellDoubleClick = this.tellDoubleClick.bind(this);
    this.f.initMouseEvents = this.initMouseEvents.bind(this);
    this.f.removeMouseEvents = this.removeMouseEvents.bind(this);
    
    // Touch events
    this.f.tellTouchDown = this.tellTouchDown.bind(this);
    this.f.tellTouchUp = this.tellTouchUp.bind(this);
    this.f.tellTouchPos = this.tellTouchPos.bind(this);
    this.f.initTouchEvents = this.initTouchEvents.bind(this);
    this.f.removeTouchEvents = this.removeTouchEvents.bind(this);
    
    // Input handling
    this.f.gamepadHandler = this.gamepadHandler.bind(this);
    this.f.initGamePad = this.initGamePad.bind(this);
    this.f.initKeyboardEvents = this.initKeyboardEvents.bind(this);
    
    // 3D scene methods
    this.f.addFog = this.addFog.bind(this);
    this.f.addScene = this.addScene.bind(this);
    this.f.addLight = this.addLight.bind(this);
    this.f.addCamera = this.addCamera.bind(this);
    this.f.addGroup = this.addGroup.bind(this);
    this.f.addHelper = this.addHelper.bind(this);
    this.f.addFromFile = this.addFromFile.bind(this);
    this.f.setParameters = this.setParameters.bind(this);
    
    // Object loading
    this.f.objectLoader = this.objectLoader.bind(this);
    this.f.objectParser = this.objectParser.bind(this);
    
    // Texture handling
    this.f.setupTextureParameter = this.setupTextureParameter.bind(this);
    this.f.addTexture = this.addTexture.bind(this);
    this.f.loadStandardTexture = this.loadStandardTexture.bind(this);
    this.f.createBase64Texture = this.createBase64Texture.bind(this);
    this.f.createStringTexture = this.createStringTexture.bind(this);
    this.f.createCanvasTexture = this.createCanvasTexture.bind(this);
    this.f.createBase64VideoTexture = this.createBase64VideoTexture.bind(this);
    this.f.createVideoTexture = this.createVideoTexture.bind(this);
    this.f.playVideoTexture = this.playVideoTexture.bind(this);
    this.f.pauseVideoTexture = this.pauseVideoTexture.bind(this);
    this.f.stopVideoTexture = this.stopVideoTexture.bind(this);
    this.f.deleteVideoTexture = this.deleteVideoTexture.bind(this);
    this.f.stopAllVideoTextures = this.stopAllVideoTextures.bind(this);
    
    // Object creation
    this.f.addMaterial = this.addMaterial.bind(this);
    this.f.addMesh = this.addMesh.bind(this);
    this.f.addLine = this.addLine.bind(this);
    this.f.addSprite = this.addSprite.bind(this);
    this.f.addClone = this.addClone.bind(this);
    this.f.addComplex = this.addComplex.bind(this);
    this.f.addScript = this.addScript.bind(this);
    this.f.addEvent = this.addEvent.bind(this);
    
    // Loading and deletion
    this.f.loadComplex = this.loadComplex.bind(this);
    this.f.loadJSON = this.loadJSON.bind(this);
    this.f.deleteTexture = this.deleteTexture.bind(this);
    this.f.deleteMaterial = this.deleteMaterial.bind(this);
    this.f.deleteElement = this.deleteElement.bind(this);
    
    // Animations and updates
    this.f.playMotions = this.playMotions.bind(this);
    this.f.doScriptList = this.doScriptList.bind(this);
    this.f.updateEvent = this.updateEvent.bind(this);
    this.f.updateAll = this.updateAll.bind(this);
    this.f.checkIsInViewPort = this.checkIsInViewPort.bind(this);
    this.f.updateRefreshDevices = this.updateRefreshDevices.bind(this);
    this.f.render = this.render.bind(this);
    
    // Sound handling
    this.f.playSound = this.playSound.bind(this);
    this.f.pauseSound = this.pauseSound.bind(this);
    this.f.stopSound = this.stopSound.bind(this);
    this.f.stopAllSounds = this.stopAllSounds.bind(this);
    this.f.deleteSound = this.deleteSound.bind(this);
    
    // Utilities
    this.f.copyText = this.copyText.bind(this);
    this.f.sendMail = this.sendMail.bind(this);
    this.f.sendWhatsApp = this.sendWhatsApp.bind(this);
    this.f.sendTwitterApp = this.sendTwitterApp.bind(this);
    this.f.doVibration = this.doVibration.bind(this);
    this.f.openFullscreen = this.openFullscreen.bind(this);
    this.f.closeFullscreen = this.closeFullscreen.bind(this);
  }

  public objectClone(source: any): any {
    if (Object.prototype.toString.call(source) === '[object Array]') {
      const clone: any[] = [];
      for (let i = 0; i < source.length; i++) {
        clone[i] = this.objectClone(source[i]);
      }
      return clone;
    } else if (typeof source === "object" && source !== null) {
      const clone: Record<string, any> = {};
      for (const prop in source) {
        if (source.hasOwnProperty(prop)) {
          clone[prop] = this.objectClone(source[prop]);
        }
      }
      return clone;
    } else {
      return source;
    }
  }

  public checkCollisionOBB(objA: any, objB: any): { collision: boolean, objA?: any, objB?: any } {
    const results: { collision: boolean, objA?: any, objB?: any } = { collision: false };

    if (objA !== undefined && objB !== undefined) {
      if (objA.MM3D.OBB.object.intersectsOBB(objB.MM3D.OBB.object) === true) {
        results.collision = true;
        results.objA = objA;
        results.objB = objB;
      }
    }

    return results;
  }

  public generateUUID(): string {
    let d = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  public array_swap(arr: any[], i1: number, i2: number): void {
    const temp = arr[i1];
    arr[i1] = arr[i2];
    arr[i2] = temp;
  }

  public array_move(arr: any[], old_index: number, new_index: number): any[] {
    if (new_index >= arr.length) {
      let k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
  }

  public arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  public base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  public checkDevice(): void {
    // Check if the device is iOS
    this.p.DEVICES.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    // Check if the browser is Safari
    this.p.DEVICES.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // Check if the browser is Mobile
    this.p.DEVICES.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  public getInfoDevice(): {
    memory?: number;
    hardware?: number;
    connection?: any;
    browserName: string;
    fullVersion: string;
    majorVersion: number;
    OSName: string;
  } {
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

    // Get operating system
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
  }

  public deg2rad(angle: number): number {
    return angle * (Math.PI / 180);
  }

  public rad2deg(rad: number): number {
    return rad * (180 / Math.PI);
  }

  public mathInterpolateTo(valueStart: number, valueEnd: number, intPerc: number): number {
    return valueStart + (valueEnd - valueStart) * intPerc;
  }

  public findIndexOf<T>(item: T, array: T[]): number {
    return array.indexOf(item);
  }

  public stringToFunction(functionName: string): Function | null {
    const namespaces = functionName.split(".");
    const func = namespaces.pop();
    
    if (!func) return null;
    
    let context: any = window;
    for (let i = 0; i < namespaces.length; i++) {
      context = context[namespaces[i]];
      if (context === undefined) return null;
    }
    
    return context[func];
  }

  public stringToVariable(value: string, variable: string): void {
    const namespaces = variable.split(".");
    const varName = namespaces.pop();
    
    if (!varName) return;
    
    let context: any = window;
    for (let i = 0; i < namespaces.length; i++) {
      if (context[namespaces[i]] === undefined) {
        context[namespaces[i]] = {};
      }
      context = context[namespaces[i]];
    }
    
    context[varName] = value;
  }

  public variableToString(variable: any): string {
    return variable.toString();
  }

  public valueToVariable(value: any, variable: string): void {
    const namespaces = variable.split(".");
    const varName = namespaces.pop();
    
    if (!varName) return;
    
    let context: any = window;
    for (let i = 0; i < namespaces.length; i++) {
      if (context[namespaces[i]] === undefined) {
        context[namespaces[i]] = {};
      }
      context = context[namespaces[i]];
    }
    
    context[varName] = value;
  }

  public lonLatToPos(
    sizeH: number,
    sizeV: number,
    lonLatStart: { lng: number; lat: number },
    lonLatEnd: { lng: number; lat: number },
    lonLat: { lng: number; lat: number }
  ): { x: number; y: number } {
    // Calculate actual sizes in meters
    const realSizeH = this.lonLatDistance(lonLatStart, { lng: lonLatEnd.lng, lat: lonLatStart.lat }, "mt");
    const realSizeV = this.lonLatDistance(lonLatStart, { lat: lonLatEnd.lat, lng: lonLatStart.lng }, "mt");
    
    // Calculate relative positions
    const x = (this.lonLatDistance(lonLatStart, { lng: lonLat.lng, lat: lonLatStart.lat }, "mt") / realSizeH);
    const y = (this.lonLatDistance(lonLatStart, { lng: lonLatStart.lng, lat: lonLat.lat }, "mt") / realSizeV);
    
    return { x, y };
  }

  public posToLonLat(
    sizeH: number,
    sizeV: number,
    lonLatStart: { lng: number; lat: number },
    lonLatEnd: { lng: number; lat: number },
    pos: { x: number; y: number }
  ): { lng: number; lat: number } {
    // Calculate actual sizes in meters
    const realSizeH = this.lonLatDistance(lonLatStart, { lng: lonLatEnd.lng, lat: lonLatStart.lat }, "mt");
    const realSizeV = this.lonLatDistance(lonLatStart, { lat: lonLatEnd.lat, lng: lonLatStart.lng }, "mt");
    
    // Calculate coordinates
    const distanceH = pos.x * realSizeH;
    const distanceV = pos.y * realSizeV;
    
    // Calculate final coordinates
    const lng = lonLatStart.lng + (distanceH / realSizeH) * (lonLatEnd.lng - lonLatStart.lng);
    const lat = lonLatStart.lat + (distanceV / realSizeV) * (lonLatEnd.lat - lonLatStart.lat);
    
    return { lng, lat };
  }

  public lonLatDistance(
    lonLatStart: { lng: number; lat: number },
    lonLatEnd: { lng: number; lat: number },
    unit: string = "mt"
  ): number {
    const R = unit === "mt" ? 6371000 : 6371; // Earth radius in meters or km
    
    const dLat = this.deg2rad(lonLatEnd.lat - lonLatStart.lat);
    const dLon = this.deg2rad(lonLatEnd.lng - lonLatStart.lng);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lonLatStart.lat)) * Math.cos(this.deg2rad(lonLatEnd.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
  }

  public fromCoordsToPosition(p: {
    lon: number;
    lat: number;
    alt?: number;
    tileSizeX?: number;
    tileSizeY?: number;
    tileX?: number;
    tileY?: number;
    zoom?: number;
  }): { x: number; y: number; z?: number } {
    const zoom = p.zoom || 1;
    const tileSizeX = p.tileSizeX || 256;
    const tileSizeY = p.tileSizeY || 256;
    
    // Calculate tile position
    const tilePos = this.tilesToPixels(p.lon, p.lat, zoom);
    
    // Get local position on tile
    const localX = (tilePos.x - Math.floor(tilePos.x)) * tileSizeX;
    const localY = (tilePos.y - Math.floor(tilePos.y)) * tileSizeY;
    
    // Calculate final position
    const x = (p.tileX || 0) * tileSizeX + localX;
    const y = (p.tileY || 0) * tileSizeY + localY;
    
    // Include altitude if provided
    const result: { x: number; y: number; z?: number } = { x, y };
    if (p.alt !== undefined) {
      result.z = p.alt;
    }
    
    return result;
  }

  public tilesToPixels(
    lon: number,
    lat: number,
    zoom: number
  ): { x: number; y: number } {
    const n = Math.pow(2, zoom);
    const x = (lon + 180) / 360 * n;
    const lat_rad = this.deg2rad(lat);
    const y = (1 - Math.log(Math.tan(lat_rad) + 1 / Math.cos(lat_rad)) / Math.PI) / 2 * n;
    
    return { x, y };
  }

  public ddToDms(lat: number, lng: number): {
    latDeg: number;
    latMin: number;
    latSec: number;
    latDir: string;
    lngDeg: number;
    lngMin: number;
    lngSec: number;
    lngDir: string;
  } {
    // Latitude
    const latAbs = Math.abs(lat);
    const latDeg = Math.floor(latAbs);
    const latMin = Math.floor((latAbs - latDeg) * 60);
    const latSec = Math.floor(((latAbs - latDeg) * 60 - latMin) * 60);
    const latDir = lat >= 0 ? "N" : "S";
    
    // Longitude
    const lngAbs = Math.abs(lng);
    const lngDeg = Math.floor(lngAbs);
    const lngMin = Math.floor((lngAbs - lngDeg) * 60);
    const lngSec = Math.floor(((lngAbs - lngDeg) * 60 - lngMin) * 60);
    const lngDir = lng >= 0 ? "E" : "W";
    
    return {
      latDeg,
      latMin,
      latSec,
      latDir,
      lngDeg,
      lngMin,
      lngSec,
      lngDir
    };
  }

  public getDms(val: number): { deg: number; min: number; sec: number } {
    const valAbs = Math.abs(val);
    const deg = Math.floor(valAbs);
    const min = Math.floor((valAbs - deg) * 60);
    const sec = ((valAbs - deg) * 60 - min) * 60;
    
    return {
      deg,
      min,
      sec
    };
  }

  public dmsToDd(
    degree: number,
    minutes: number,
    seconds: number,
    directionH: string,
    directionV: string
  ): { lat: number; lng: number } {
    // Convert DMS to decimal degrees
    let lat = degree + minutes / 60 + seconds / 3600;
    let lng = degree + minutes / 60 + seconds / 3600;
    
    // Apply direction
    if (directionV === "S") lat = -lat;
    if (directionH === "W") lng = -lng;
    
    return { lat, lng };
  }

  public Wgs2Utm(
    lan1: number,
    fi: number
  ): { X: number; Y: number; zone: number; sn: string } {
    // WGS84 to UTM conversion
    // This is a simplified implementation
    const a = 6378137.0; // WGS84 semi-major axis
    const e = 0.081819191; // WGS84 eccentricity
    const k0 = 0.9996; // UTM scale factor
    const FE = 500000.0; // UTM false easting
    const FN = 0.0; // UTM false northing (northern hemisphere)
    
    // Convert decimal degrees to radians
    const lat = fi * Math.PI / 180;
    const lon = lan1 * Math.PI / 180;
    
    // Determine zone number
    const zone = Math.floor((lan1 + 180) / 6) + 1;
    
    // Determine central meridian
    const lon0 = (zone * 6 - 183) * Math.PI / 180;
    
    // Calculate easting and northing
    const N = a / Math.sqrt(1 - e * e * Math.sin(lat) * Math.sin(lat));
    const T = Math.tan(lat) * Math.tan(lat);
    const C = e * e / (1 - e * e) * Math.cos(lat) * Math.cos(lat);
    const A = Math.cos(lat) * (lon - lon0);
    
    const M = a * ((1 - e * e / 4 - 3 * e * e * e * e / 64 - 5 * e * e * e * e * e * e / 256) * lat
              - (3 * e * e / 8 + 3 * e * e * e * e / 32 + 45 * e * e * e * e * e * e / 1024) * Math.sin(2 * lat)
              + (15 * e * e * e * e / 256 + 45 * e * e * e * e * e * e / 1024) * Math.sin(4 * lat)
              - (35 * e * e * e * e * e * e / 3072) * Math.sin(6 * lat));
    
    const X = FE + k0 * N * (A + (1 - T + C) * A * A * A / 6 + (5 - 18 * T + T * T + 72 * C - 58) * A * A * A * A * A / 120);
    let Y = FN + k0 * (M + N * Math.tan(lat) * (A * A / 2 + (5 - T + 9 * C + 4 * C * C) * A * A * A * A / 24 + (61 - 58 * T + T * T + 600 * C - 330) * A * A * A * A * A * A / 720));
    
    // Southern hemisphere adjustment
    const sn = lat < 0 ? "S" : "N";
    if (sn === "S") Y += 10000000.0;
    
    return {
      X,
      Y,
      zone,
      sn
    };
  }

  public Utm2Wgs(
    X: number,
    Y: number,
    zone: number,
    sn: string
  ): { lon: number; lat: number } {
    // UTM to WGS84 conversion
    // This is a simplified implementation
    const a = 6378137.0; // WGS84 semi-major axis
    const e = 0.081819191; // WGS84 eccentricity
    const k0 = 0.9996; // UTM scale factor
    const FE = 500000.0; // UTM false easting
    const FN = sn === "S" ? 10000000.0 : 0.0; // UTM false northing
    
    // Determine central meridian
    const lon0 = (zone * 6 - 183) * Math.PI / 180;
    
    // Calculate latitude and longitude
    const x = X - FE;
    const y = Y - FN;
    
    const e1 = (1 - Math.sqrt(1 - e * e)) / (1 + Math.sqrt(1 - e * e));
    
    const M = y / k0;
    const mu = M / (a * (1 - e * e / 4 - 3 * e * e * e * e / 64 - 5 * e * e * e * e * e * e / 256));
    
    const lat = mu + (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * mu)
              + (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * mu)
              + (151 * e1 * e1 * e1 / 96) * Math.sin(6 * mu);
    
    const N1 = a / Math.sqrt(1 - e * e * Math.sin(lat) * Math.sin(lat));
    const T1 = Math.tan(lat) * Math.tan(lat);
    const C1 = e * e / (1 - e * e) * Math.cos(lat) * Math.cos(lat);
    const R1 = a * (1 - e * e) / Math.pow(1 - e * e * Math.sin(lat) * Math.sin(lat), 1.5);
    const D = x / (N1 * k0);
    
    const lon = lon0 + (D - (1 + 2 * T1 + C1) * D * D * D / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * e * e + 24 * T1 * T1) * D * D * D * D * D / 120) / Math.cos(lat);
    
    return {
      lon: lon * 180 / Math.PI,
      lat: lat * 180 / Math.PI
    };
  }

  public WGS84_pixelsToLonLat(
    x: number,
    y: number,
    mapWidth: number,
    mapHeight: number
  ): { lng: number; lat: number } {
    const lon = (x / mapWidth) * 360 - 180;
    const lat_rad = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / mapHeight)));
    const lat = this.rad2deg(lat_rad);
    
    return { lng: lon, lat: lat };
  }

  public WGS84_lonLatToPixels(
    lon: number,
    lat: number,
    mapWidth: number,
    mapHeight: number
  ): [number, number] {
    const mapPosX = mapWidth * ((lon + 180) / 360);
    const mapPosY = (((Math.log((Math.sin(this.deg2rad(lat)) + 1.0) / Math.cos(this.deg2rad(lat)))) + (Math.PI)) / (2 * Math.PI) * mapHeight);
    
    return [mapPosX, mapPosY];
  }

  public ip_local(): string[] | false {
    let ip: string[] | false = false;
    
    // Cross-browser compatibility
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
  }

  public adaptDivViewPort(viewportProp: {
    element: HTMLElement;
    width?: number;
    height?: number;
    position?: { x: number; y: number };
    scale?: { x: number; y: number };
    rotation?: { x: number; y: number; z: number };
  }): void {
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
  }

  public addAdaptive(node: THREE.Object3D, prop: {
    posV?: { x: number; y: number; z: number };
    rotV?: { x: number; y: number; z: number };
    scaleV?: { x: number; y: number; z: number };
  }): void {
    if (!(node as any).MM3D) {
      (node as any).MM3D = {};
    }
    
    (node as any).MM3D.adaptive = {
      posV: prop.posV || { x: 0, y: 0, z: 0 },
      rotV: prop.rotV || { x: 0, y: 0, z: 0 },
      scaleV: prop.scaleV || { x: 1, y: 1, z: 1 }
    };
  }

  public updateAdaptive(node: THREE.Object3D, view: { width: number; height: number }): void {
    if (!(node as any).MM3D || !(node as any).MM3D.adaptive) return;
    
    const adaptive = (node as any).MM3D.adaptive;
    
    if (adaptive.posV) {
      node.position.x = adaptive.posV.x * view.width;
      node.position.y = adaptive.posV.y * view.height;
      node.position.z = adaptive.posV.z;
    }
    
    if (adaptive.rotV) {
      node.rotation.x = this.deg2rad(adaptive.rotV.x);
      node.rotation.y = this.deg2rad(adaptive.rotV.y);
      node.rotation.z = this.deg2rad(adaptive.rotV.z);
    }
    
    if (adaptive.scaleV) {
      node.scale.x = adaptive.scaleV.x;
      node.scale.y = adaptive.scaleV.y;
      node.scale.z = adaptive.scaleV.z;
    }
  }

  public onMainWindowResize(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    view?: { width: number; height: number }
  ): void {
    const width = view ? view.width : window.innerWidth;
    const height = view ? view.height : window.innerHeight;
    
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    
    renderer.setSize(width, height);
    
    // Update all adaptive nodes in the scene
    scene.traverse((node: THREE.Object3D) => {
      this.updateAdaptive(node, { width, height });
    });
  }

  public setPropAndParameters(OBJ: any, prop: Record<string, any>, SCENE?: THREE.Scene): void {
    for (const key in prop) {
      if (key !== "type" && key !== "parameters") {
        if (key === "position" || key === "rotation" || key === "scale") {
          if (prop[key].x !== undefined) OBJ[key].x = prop[key].x;
          if (prop[key].y !== undefined) OBJ[key].y = prop[key].y;
          if (prop[key].z !== undefined) OBJ[key].z = prop[key].z;
        } else if (key === "lookAt" && SCENE) {
          const target = new THREE.Vector3(
            prop[key].x || 0,
            prop[key].y || 0,
            prop[key].z || 0
          );
          OBJ.lookAt(target);
        } else if (key === "name") {
          OBJ.name = prop[key];
        } else if (key !== "info") {
          OBJ[key] = prop[key];
        }
      }
    }

    // Handle parameters if they exist
    if (prop.parameters) {
      for (const key in prop.parameters) {
        if (key !== "position" && key !== "rotation" && key !== "scale" && key !== "lookAt") {
          OBJ[key] = prop.parameters[key];
        } else if (key === "position" || key === "rotation" || key === "scale") {
          if (prop.parameters[key].x !== undefined) OBJ[key].x = prop.parameters[key].x;
          if (prop.parameters[key].y !== undefined) OBJ[key].y = prop.parameters[key].y;
          if (prop.parameters[key].z !== undefined) OBJ[key].z = prop.parameters[key].z;
        } else if (key === "lookAt" && SCENE) {
          const target = new THREE.Vector3(
            prop.parameters[key].x || 0,
            prop.parameters[key].y || 0,
            prop.parameters[key].z || 0
          );
          OBJ.lookAt(target);
        }
      }
    }
  }

  public tellMouseDown(event: MouseEvent): void {
    if (!this.p.DEVICES.mouse) {
      this.p.DEVICES.mouse = {};
    }
    
    this.p.DEVICES.eventType = 'mousedown';
    this.p.DEVICES.mouse.position = {
      x: event.clientX,
      y: event.clientY
    };
    this.p.DEVICES.mouse.button = event.button;
    this.p.DEVICES.mouse.isDown = true;
  }

  public tellMouseWheel(event: WheelEvent): void {
    if (!this.p.DEVICES.mouse) {
      this.p.DEVICES.mouse = {};
    }
    
    this.p.DEVICES.eventType = 'mousewheel';
    this.p.DEVICES.mouse.position = {
      x: event.clientX,
      y: event.clientY
    };
    this.p.DEVICES.mouse.wheelDelta = -event.deltaY / 100;
  }

  public tellMouseWheel_FF(event: WheelEvent): void {
    if (!this.p.DEVICES.mouse) {
      this.p.DEVICES.mouse = {};
    }
    
    this.p.DEVICES.eventType = 'mousewheel';
    this.p.DEVICES.mouse.position = {
      x: event.clientX,
      y: event.clientY
    };
    this.p.DEVICES.mouse.wheelDelta = event.detail / 3;
  }

  public tellMousePos(event: MouseEvent): void {
    if (!this.p.DEVICES.mouse) {
      this.p.DEVICES.mouse = {};
    }
    
    this.p.DEVICES.eventType = 'mousemove';
    this.p.DEVICES.mouse.position = {
      x: event.clientX,
      y: event.clientY
    };
  }

  public tellMouseUp(event: MouseEvent): void {
    if (!this.p.DEVICES.mouse) {
      this.p.DEVICES.mouse = {};
    }
    
    this.p.DEVICES.eventType = 'mouseup';
    this.p.DEVICES.mouse.position = {
      x: event.clientX,
      y: event.clientY
    };
    this.p.DEVICES.mouse.button = event.button;
    this.p.DEVICES.mouse.isDown = false;
  }

  public tellDoubleClick(event: MouseEvent): void {
    if (!this.p.DEVICES.mouse) {
      this.p.DEVICES.mouse = {};
    }
    
    this.p.DEVICES.eventType = 'dblclick';
    this.p.DEVICES.mouse.position = {
      x: event.clientX,
      y: event.clientY
    };
    this.p.DEVICES.mouse.button = event.button;
  }

  public initMouseEvents(): void {
    document.addEventListener('mousedown', this.tellMouseDown.bind(this), false);
    document.addEventListener('mouseup', this.tellMouseUp.bind(this), false);
    document.addEventListener('mousemove', this.tellMousePos.bind(this), false);
    document.addEventListener('dblclick', this.tellDoubleClick.bind(this), false);
    
    // Different handling for Firefox and other browsers
    if (/Firefox/i.test(navigator.userAgent)) {
      document.addEventListener('DOMMouseScroll', this.tellMouseWheel_FF.bind(this), false);
    } else {
      document.addEventListener('wheel', this.tellMouseWheel.bind(this), false);
    }
    
    // Disable context menu for better mouse control
    document.addEventListener("contextmenu", function setContextMenuOff(e) {
      e.preventDefault();
      return false;
    }, false);
  }

  public removeMouseEvents(): void {
    document.removeEventListener('mousedown', this.tellMouseDown.bind(this), false);
    document.removeEventListener('mouseup', this.tellMouseUp.bind(this), false);
    document.removeEventListener('mousemove', this.tellMousePos.bind(this), false);
    document.removeEventListener('dblclick', this.tellDoubleClick.bind(this), false);
    
    if (/Firefox/i.test(navigator.userAgent)) {
      document.removeEventListener('DOMMouseScroll', this.tellMouseWheel_FF.bind(this), false);
    } else {
      document.removeEventListener('wheel', this.tellMouseWheel.bind(this), false);
    }
    
    window.removeEventListener("contextmenu", function setContextMenuOff(e) {
      e.preventDefault();
      return false;
    }, false);
  }

  public tellTouchDown(event: TouchEvent): void {
    event.preventDefault();
    
    if (!this.p.DEVICES.touch) {
      this.p.DEVICES.touch = {};
    }
    
    this.p.DEVICES.eventType = 'touchstart';
    
    if (event.touches.length === 1) {
      // Single touch
      this.p.DEVICES.touch.position = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
      this.p.DEVICES.touch.isDown = true;
    } else if (event.touches.length === 2) {
      // Two finger touch (pinch/zoom)
      this.p.DEVICES.touch.position = {
        x: (event.touches[0].clientX + event.touches[1].clientX) / 2,
        y: (event.touches[0].clientY + event.touches[1].clientY) / 2
      };
      this.p.DEVICES.touch.distance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY
      );
      this.p.DEVICES.touch.isDown = true;
      this.p.DEVICES.touch.isPinching = true;
    }
  }

  public tellTouchUp(event: TouchEvent): void {
    event.preventDefault();
    
    if (!this.p.DEVICES.touch) {
      this.p.DEVICES.touch = {};
    }
    
    this.p.DEVICES.eventType = 'touchend';
    
    // Reset touch state if all fingers are lifted
    if (event.touches.length === 0) {
      this.p.DEVICES.touch.isDown = false;
      this.p.DEVICES.touch.isPinching = false;
    } else if (event.touches.length === 1) {
      // One finger remains after lifting other finger
      this.p.DEVICES.touch.isPinching = false;
      this.p.DEVICES.touch.position = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
    }
  }

  public tellTouchPos(event: TouchEvent): void {
    event.preventDefault();
    
    if (!this.p.DEVICES.touch) {
      this.p.DEVICES.touch = {};
    }
    
    this.p.DEVICES.eventType = 'touchmove';
    
    if (event.touches.length === 1) {
      // Single touch
      this.p.DEVICES.touch.position = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
    } else if (event.touches.length === 2) {
      // Two finger touch (pinch/zoom)
      this.p.DEVICES.touch.position = {
        x: (event.touches[0].clientX + event.touches[1].clientX) / 2,
        y: (event.touches[0].clientY + event.touches[1].clientY) / 2
      };
      
      // Calculate the new distance between fingers
      const newDistance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY
      );
      
      // Calculate zoom delta
      if (this.p.DEVICES.touch.distance) {
        this.p.DEVICES.touch.zoomDelta = newDistance / this.p.DEVICES.touch.distance;
      }
      
      this.p.DEVICES.touch.distance = newDistance;
    }
  }

  public initTouchEvents(): void {
    document.addEventListener('touchstart', this.tellTouchDown.bind(this), { passive: false });
    document.addEventListener('touchend', this.tellTouchUp.bind(this), { passive: false });
    document.addEventListener('touchmove', this.tellTouchPos.bind(this), { passive: false });
  }

  public removeTouchEvents(): void {
    document.removeEventListener('touchstart', this.tellTouchDown.bind(this), false as any);
    document.removeEventListener('touchend', this.tellTouchUp.bind(this), false as any);
    document.removeEventListener('touchmove', this.tellTouchPos.bind(this), false as any);
  }

  public gamepadHandler(event: Event, connected: boolean): void {
    if (connected) {
      const gamepadEvent = event as GamepadEvent;
      this.p.DEVICES.gamepad = gamepadEvent.gamepad;
      console.log("Gamepad connected:", gamepadEvent.gamepad.id);
    } else {
      console.log("Gamepad disconnected");
      this.p.DEVICES.gamepad = null;
    }
  }

  public initGamePad(): void {
    window.addEventListener("gamepadconnected", (e) => this.gamepadHandler(e, true), false);
    window.addEventListener("gamepaddisconnected", (e) => this.gamepadHandler(e, false), false);
  }

  public initKeyboardEvents(): void {
    if (!this.p.DEVICES.keyboard) {
      this.p.DEVICES.keyboard = {
        keys: {},
        isDown: {}
      };
    }

    // Key down handler
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      this.p.DEVICES.eventType = 'keydown';
      this.p.DEVICES.keyboard.keys[event.code] = true;
      this.p.DEVICES.keyboard.isDown[event.code] = true;
      this.p.DEVICES.keyboard.lastKey = event.code;
    }, false);

    // Key up handler
    document.addEventListener('keyup', (event: KeyboardEvent) => {
      this.p.DEVICES.eventType = 'keyup';
      this.p.DEVICES.keyboard.keys[event.code] = false;
      this.p.DEVICES.keyboard.isDown[event.code] = false;
    }, false);
  }

  public addFog(SCENE: THREE.Scene, fog: {
    type: string;
    color?: THREE.ColorRepresentation;
    near?: number;
    far?: number;
    density?: number;
  }): void {
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
  }

  public addScene(prop: {
    name?: string;
    container?: string | HTMLElement;
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
  }, callBack?: (result: { obj: THREE.Scene }) => void, callBackProp?: any): { 
    scene: THREE.Scene; 
    camera: THREE.PerspectiveCamera; 
    renderer: THREE.WebGLRenderer;
    domElement: HTMLCanvasElement;
  } {
    // Create scene
    const scene = new THREE.Scene();
    this.scene = scene;

    if (prop.name) {
      scene.name = prop.name;
    }
    
    // Setup background and fog if specified
    if (prop.backgroundColor) {
      scene.background = new THREE.Color(prop.backgroundColor);
    }
    
    if (prop.fogColor) {
      scene.fog = new THREE.Fog(
        prop.fogColor, 
        prop.fogNear || 1, 
        prop.fogFar || 1000
      );
    }
    
    // Handle container
    let container: HTMLElement | null = null;
    
    if (prop.container) {
      if (typeof prop.container === 'string') {
        container = document.querySelector(prop.container);
      } else if (prop.container instanceof HTMLElement) {
        container = prop.container;
      }
    }
    
    if (!container) {
      container = document.createElement('div');
      container.style.width = '100%';
      container.style.height = '100%';
      document.body.appendChild(container);
    }
    
    // Get container dimensions
    const width = prop.rendererSize ? 
      prop.rendererSize.width : 
      container.clientWidth || window.innerWidth;
      
    const height = prop.rendererSize ? 
      prop.rendererSize.height : 
      container.clientHeight || getDOMHeight(container) || window.innerHeight;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      prop.cameraFOV || 75,
      width / height,
      prop.cameraNear || 0.1,
      prop.cameraFar || 1000
    );
    
    // Position camera at default position
    camera.position.set(0, 1.6, 3);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    if (prop.rendererPixelRatio) {
      renderer.setPixelRatio(prop.rendererPixelRatio);
    } else {
      renderer.setPixelRatio(window.devicePixelRatio);
    }
    
    if (prop.rendererClearColor) {
      renderer.setClearColor(prop.rendererClearColor);
    }
    
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    
    // Get canvas
    const domElement = renderer.domElement;
    
    // Add canvas to container
    container.appendChild(domElement);
    
    // Disable context menu
    domElement.addEventListener("contextmenu", (e: Event) => {
      e.preventDefault();
      return false;
    }, false);
    
    // Handle window resize
    const handleResize = () => {
      if (!prop.rendererSize) {
        const newWidth = container?.clientWidth || window.innerWidth;
        const newHeight = container?.clientHeight || getDOMHeight(container) || window.innerHeight;
        
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        
        renderer.setSize(newWidth, newHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Execute callback if provided
    if (callBack) {
      callBack({
        obj: scene
      });
    }
    
    // Return result
    return { 
      scene, 
      camera, 
      renderer, 
      domElement
    };
  }

  public addLight(SCENE: THREE.Scene, prop: {
    name?: string;
    type: string;
    parameters?: Record<string, any>;
    position?: { x?: number; y?: number; z?: number };
    rotation?: { x?: number; y?: number; z?: number };
    [key: string]: any;
  }, callBack?: (params: { obj: THREE.Light; info: any }) => void, callBackProp?: any): THREE.Light {
    // Create light of specified type
    const LIGHT = new (THREE as any)[prop.type]();

    // Set parameters if provided
    if (prop.parameters !== undefined) {
      this.setPropAndParameters(LIGHT, prop.parameters);

      // Handle shadow parameters
      if (prop.parameters.shadow !== undefined) {
        // Set up shadow properties for the light
        if (prop.parameters.shadow.bias !== undefined) {
          LIGHT.shadow.bias = prop.parameters.shadow.bias;
        }

        if (prop.parameters.shadow.mapSize !== undefined) {
          LIGHT.shadow.mapSize.width = prop.parameters.shadow.mapSize.width;
          LIGHT.shadow.mapSize.height = prop.parameters.shadow.mapSize.height;
        }

        if (prop.parameters.shadow.camera !== undefined) {
          LIGHT.shadow.camera.near = prop.parameters.shadow.camera.near;
          LIGHT.shadow.camera.far = prop.parameters.shadow.camera.far;
          
          if (prop.parameters.shadow.camera.top !== undefined) {
            LIGHT.shadow.camera.top = prop.parameters.shadow.camera.top;
            LIGHT.shadow.camera.bottom = prop.parameters.shadow.camera.bottom;
            LIGHT.shadow.camera.left = prop.parameters.shadow.camera.left;
            LIGHT.shadow.camera.right = prop.parameters.shadow.camera.right;
          }
          
          LIGHT.shadow.camera.updateProjectionMatrix();
        }
      }
    }

    // Set other properties
    this.setPropAndParameters(LIGHT, prop, SCENE);

    // Add to scene if provided
    if (SCENE !== undefined) {
      if ((SCENE as any).OBJECTS === undefined) {
        (SCENE as any).OBJECTS = {};
      }

      (SCENE as any).OBJECTS[LIGHT.name] = LIGHT;
      SCENE.add(LIGHT);
    }

    // Execute callback if provided
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

  public addCamera(SCENE: THREE.Scene, prop: {
    type: string;
    name?: string;
    parameters?: Record<string, any>;
    position?: { x?: number; y?: number; z?: number };
    rotation?: { x?: number; y?: number; z?: number };
    target?: { x?: number; y?: number; z?: number };
    lookAt?: { x?: number; y?: number; z?: number };
    [key: string]: any;
  }, callBack?: (params: { obj: THREE.Camera; info: any }) => void, callBackProp?: any): THREE.Camera {
    // Create camera of specified type
    let CAMERA: THREE.Camera;
    
    switch (prop.type) {
      case 'PerspectiveCamera':
        CAMERA = new THREE.PerspectiveCamera(
          prop.parameters?.fov || 75,
          prop.parameters?.aspect || 1,
          prop.parameters?.near || 0.1,
          prop.parameters?.far || 1000
        );
        break;
        
      case 'OrthographicCamera':
        CAMERA = new THREE.OrthographicCamera(
          prop.parameters?.left || -1,
          prop.parameters?.right || 1,
          prop.parameters?.top || 1,
          prop.parameters?.bottom || -1,
          prop.parameters?.near || 0.1,
          prop.parameters?.far || 1000
        );
        break;
        
      default:
        CAMERA = new THREE.PerspectiveCamera();
    }
    
    // Set name if provided
    if (prop.name) {
      CAMERA.name = prop.name;
    }
    
    // Set parameters if provided
    if (prop.parameters !== undefined) {
      this.setPropAndParameters(CAMERA, prop.parameters);
    }
    
    // Set other properties
    this.setPropAndParameters(CAMERA, prop, SCENE);
    
    // Add to scene if provided
    if (SCENE !== undefined) {
      if ((SCENE as any).OBJECTS === undefined) {
        (SCENE as any).OBJECTS = {};
      }
      
      (SCENE as any).OBJECTS[CAMERA.name] = CAMERA;
      SCENE.add(CAMERA);
    }
    
    // Execute callback if provided
    if (callBack !== undefined) {
      if (callBackProp !== undefined) {
        callBackProp.obj = CAMERA;
        callBack(callBackProp);
      } else {
        callBack({ obj: CAMERA, info: null });
      }
    }
    
    return CAMERA;
  }

  public addGroup(SCENE: THREE.Scene, prop: {
    name?: string;
    parameters?: Record<string, any>;
    position?: { x?: number; y?: number; z?: number };
    rotation?: { x?: number; y?: number; z?: number };
    [key: string]: any;
  }, callBack?: (params: { obj: THREE.Group; info: any }) => void, callBackProp?: any): THREE.Group {
    const GROUP = new THREE.Group();

    // Set parameters if provided
    if (prop.parameters !== undefined) {
      this.setPropAndParameters(GROUP, prop.parameters);
    }

    // Set other properties
    this.setPropAndParameters(GROUP, prop, SCENE);

    // Add to scene if provided
    if (SCENE !== undefined) {
      if ((SCENE as any).OBJECTS === undefined) {
        (SCENE as any).OBJECTS = {};
      }

      (SCENE as any).OBJECTS[GROUP.name] = GROUP;
      SCENE.add(GROUP);
    }

    // Execute callback if provided
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
    this.setPropAndParameters(HELPER, prop, SCENE);

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
    this.objectLoader(
      prop.url,
      (result: { obj: THREE.Object3D; info: any }) => {
        const obj = result.obj;
        
        // Set name if provided
        if (prop.name) {
          obj.name = prop.name;
        }
        
        // Apply parameters if provided
        if (prop.parameters) {
          this.setPropAndParameters(obj, prop.parameters);
        }
        
        // Apply other properties
        this.setPropAndParameters(obj, prop, SCENE);
        
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

  public setParameters(defaultParameters: Record<string, any>, newParameters: Record<string, any>): Record<string, any> {
    const result = { ...defaultParameters };
    
    if (newParameters) {
      Object.keys(newParameters).forEach(key => {
        result[key] = newParameters[key];
      });
    }
    
    return result;
  }

  public objectLoader(
    url: string,
    callBack?: (result: { obj: THREE.Object3D; info: any }) => void,
    callBackProp?: any
  ): void {
    const fileExtension = url.split('.').pop()?.toLowerCase();
    
    let loader;
    
    switch (fileExtension) {
      case 'gltf':
      case 'glb':
        loader = new GLTFLoader();
        
        // Configure DRACO loader if needed
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
  }

  public objectParser(
    url: string,
    callBack?: (result: { obj: THREE.Object3D; info: any }) => void,
    callBackProp?: any
  ): void {
    // Determine file extension
    const fileExtension = url.split('.').pop()?.toLowerCase();
    
    if (!fileExtension) {
      console.error('Invalid URL format - no file extension found');
      return;
    }
    
    // Create appropriate loader based on extension
    let loader;
    switch (fileExtension) {
      case 'json':
        // Handle JSON case
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
        // For all other file types, use objectLoader
        this.objectLoader(url, callBack, callBackProp);
        break;
    }
  }

  public setupTextureParameter(texture: THREE.Texture): THREE.Texture {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16;
    
    return texture;
  }

  public addTexture(
    SCENE: THREE.Scene | THREE.Object3D, 
    prop: {
      name: string;
      url: string;
      type?: string;
      parameters?: Record<string, any>;
    },
    callBack?: (result: { obj: THREE.Texture; info: any }) => void,
    callBackProp?: any
  ): void {
    // Default type is 'standard' if not specified
    const textureType = prop.type || 'standard';
    
    switch (textureType) {
      case 'standard':
        this.loadStandardTexture(
          prop.url,
          (texture: THREE.Texture) => {
            // Set texture name if provided
            texture.name = prop.name;
            
            // Apply parameters if provided
            if (prop.parameters) {
              this.setPropAndParameters(texture, prop.parameters);
            }
            
            // Add to target's textures if it's a complex object
            if ((SCENE as any).TEXTURES) {
              (SCENE as any).TEXTURES[prop.name] = texture;
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
        this.createBase64Texture(
          prop.url,
          (texture: THREE.Texture) => {
            // Set texture name if provided
            texture.name = prop.name;
            
            // Apply parameters if provided
            if (prop.parameters) {
              this.setPropAndParameters(texture, prop.parameters);
            }
            
            // Add to target's textures if it's a complex object
            if ((SCENE as any).TEXTURES) {
              (SCENE as any).TEXTURES[prop.name] = texture;
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
        this.createVideoTexture(
          prop.url as unknown as HTMLVideoElement, // Type cast as the method expects an HTML element
          (texture: THREE.VideoTexture) => {
            // Set texture name if provided
            texture.name = prop.name;
            
            // Apply parameters if provided
            if (prop.parameters) {
              this.setPropAndParameters(texture, prop.parameters);
            }
            
            // Add to target's textures if it's a complex object
            if ((SCENE as any).TEXTURES) {
              (SCENE as any).TEXTURES[prop.name] = texture;
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
        this.createStringTexture(
          prop.url,
          prop.parameters || {},
          (texture: THREE.CanvasTexture) => {
            // Set texture name if provided
            texture.name = prop.name;
            
            // Add to target's textures if it's a complex object
            if ((SCENE as any).TEXTURES) {
              (SCENE as any).TEXTURES[prop.name] = texture;
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
  }

  public loadStandardTexture(
    url: string,
    onLoad?: (texture: THREE.Texture) => void,
    onError?: (error: unknown) => void
  ): void {
    const loader = new THREE.TextureLoader();
    
    loader.load(
      url,
      (texture) => {
        const configuredTexture = this.setupTextureParameter(texture);
        if (onLoad) onLoad(configuredTexture);
      },
      undefined,
      (error) => {
        console.error('Error loading texture:', error);
        if (onError) onError(error);
      }
    );
  }

  public createBase64Texture(
    base64String: string,
    onLoad?: (texture: THREE.Texture) => void
  ): void {
    const image = new Image();
    image.src = base64String;
    
    image.onload = () => {
      const texture = new THREE.Texture(image);
      texture.needsUpdate = true;
      
      const configuredTexture = this.setupTextureParameter(texture);
      if (onLoad) onLoad(configuredTexture);
    };
  }

  public createStringTexture(
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
  ): void {
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
    const configuredTexture = this.setupTextureParameter(texture) as THREE.CanvasTexture;
    
    if (onLoad) onLoad(configuredTexture);
  }

  public createCanvasTexture(
    canvas: HTMLCanvasElement,
    onLoad?: (texture: THREE.CanvasTexture) => void
  ): void {
    const texture = new THREE.CanvasTexture(canvas);
    const configuredTexture = this.setupTextureParameter(texture) as THREE.CanvasTexture;
    
    if (onLoad) onLoad(configuredTexture);
  }

  public createBase64VideoTexture(
    base64String: string,
    onLoad?: (texture: THREE.VideoTexture) => void
  ): void {
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
      
      const configuredTexture = this.setupTextureParameter(texture) as THREE.VideoTexture;
      
      if (onLoad) onLoad(configuredTexture);
    };
  }

  public createVideoTexture(
    videoElement: HTMLVideoElement,
    onLoad?: (texture: THREE.VideoTexture) => void
  ): void {
    const texture = new THREE.VideoTexture(videoElement);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;
    
    const configuredTexture = this.setupTextureParameter(texture) as THREE.VideoTexture;
    
    if (onLoad) onLoad(configuredTexture);
  }

  public playVideoTexture(SCENE: THREE.Scene, name: string): void {
    if ((SCENE as any).TEXTURES && (SCENE as any).TEXTURES[name]) {
      const texture = (SCENE as any).TEXTURES[name];
      if (texture instanceof THREE.VideoTexture && texture.image instanceof HTMLVideoElement) {
        texture.image.play();
      }
    }
  }

  public pauseVideoTexture(SCENE: THREE.Scene, name: string): void {
    if ((SCENE as any).TEXTURES && (SCENE as any).TEXTURES[name]) {
      const texture = (SCENE as any).TEXTURES[name];
      if (texture instanceof THREE.VideoTexture && texture.image instanceof HTMLVideoElement) {
        texture.image.pause();
      }
    }
  }

  public stopVideoTexture(SCENE: THREE.Scene, name: string): void {
    if ((SCENE as any).TEXTURES && (SCENE as any).TEXTURES[name]) {
      const texture = (SCENE as any).TEXTURES[name];
      if (texture instanceof THREE.VideoTexture && texture.image instanceof HTMLVideoElement) {
        texture.image.pause();
        texture.image.currentTime = 0;
      }
    }
  }

  public deleteVideoTexture(SCENE: THREE.Scene, name: string): void {
    if ((SCENE as any).TEXTURES && (SCENE as any).TEXTURES[name]) {
      const texture = (SCENE as any).TEXTURES[name];
      if (texture instanceof THREE.VideoTexture && texture.image instanceof HTMLVideoElement) {
        texture.image.pause();
        texture.image.src = '';
        texture.image.load();
        texture.dispose();
        delete (SCENE as any).TEXTURES[name];
      }
    }
  }

  public stopAllVideoTextures(SCENE: THREE.Scene): void {
    if ((SCENE as any).TEXTURES) {
      for (const name in (SCENE as any).TEXTURES) {
        const texture = (SCENE as any).TEXTURES[name];
        if (texture instanceof THREE.VideoTexture && texture.image instanceof HTMLVideoElement) {
          texture.image.pause();
          texture.image.currentTime = 0;
        }
      }
    }
  }

  public addMaterial(SCENE: THREE.Scene, prop: {
    name: string;
    type: string;
    parameters?: Record<string, any>;
    [key: string]: any;
  }, callBack?: (params: { obj: THREE.Material; info: any }) => void, callBackProp?: any): THREE.Material {
    // Create material
    const material = new (THREE as any)[prop.type]();
    
    // Apply parameters
    if (prop.parameters !== undefined) {
      this.setPropAndParameters(material, prop.parameters);
      
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
    let geometry: THREE.BufferGeometry;
    
    if (prop.parameters?.geometry?.parameters) {
      // If geometry parameters are provided, use them to create the geometry
      geometry = new (THREE as any)[prop.type](
        ...(Array.isArray(prop.parameters.geometry.parameters) 
          ? prop.parameters.geometry.parameters 
          : [prop.parameters.geometry.parameters])
      );
    } else {
      // Create default geometry based on type
      switch (prop.type) {
        case 'BoxGeometry':
          geometry = new THREE.BoxGeometry(1, 1, 1);
          break;
        case 'SphereGeometry':
          geometry = new THREE.SphereGeometry(1, 32, 32);
          break;
        case 'PlaneGeometry':
          geometry = new THREE.PlaneGeometry(1, 1);
          break;
        case 'CylinderGeometry':
          geometry = new THREE.CylinderGeometry(1, 1, 1, 32);
          break;
        case 'ConeGeometry':
          geometry = new THREE.ConeGeometry(1, 1, 32);
          break;
        case 'TorusGeometry':
          geometry = new THREE.TorusGeometry(1, 0.4, 16, 32);
          break;
        default:
          // Try to create the geometry using the type directly
          try {
            geometry = new (THREE as any)[prop.type]();
          } catch (e) {
            console.error(`Unknown geometry type: ${prop.type}`);
            geometry = new THREE.BoxGeometry(1, 1, 1);
          }
      }
    }
    
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
    
    // Apply parameters if provided
    if (prop.parameters) {
      this.setPropAndParameters(mesh, prop.parameters);
    }
    
    // Apply other properties
    this.setPropAndParameters(mesh, prop, SCENE);
    
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
  }

  public addLine(SCENE: THREE.Scene, prop: {
    name?: string;
    type: string;
    points?: THREE.Vector3[];
    material?: string | THREE.Material;
    parameters?: Record<string, any>;
    position?: { x?: number; y?: number; z?: number };
    rotation?: { x?: number; y?: number; z?: number };
    scale?: { x?: number; y?: number; z?: number };
    [key: string]: any;
  }, callBack?: (params: { obj: THREE.Line; info: any }) => void, callBackProp?: any): THREE.Line {
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
    let line: THREE.Line;
    switch (prop.type) {
      case 'LineSegments':
        line = new THREE.LineSegments(geometry, material);
        break;
      case 'LineLoop':
        line = new THREE.LineLoop(geometry, material);
        break;
      default:
        line = new THREE.Line(geometry, material);
    }
    
    // Set name if provided
    if (prop.name) {
      line.name = prop.name;
    }
    
    // Apply parameters if provided
    if (prop.parameters) {
      this.setPropAndParameters(line, prop.parameters);
    }
    
    // Apply other properties
    this.setPropAndParameters(line, prop, SCENE);
    
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
  }

  public addSprite(SCENE: THREE.Scene, prop: {
    name?: string;
    material?: string | THREE.SpriteMaterial;
    parameters?: Record<string, any>;
    position?: { x?: number; y?: number; z?: number };
    scale?: { x?: number; y?: number; z?: number };
    [key: string]: any;
  }, callBack?: (params: { obj: THREE.Sprite; info: any }) => void, callBackProp?: any): THREE.Sprite {
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
    
    // Apply parameters if provided
    if (prop.parameters) {
      this.setPropAndParameters(sprite, prop.parameters);
    }
    
    // Apply other properties
    this.setPropAndParameters(sprite, prop, SCENE);
    
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
  }

  public addClone(sourceOBJ: THREE.Object3D, targetScene?: THREE.Scene, callBack?: (params: { obj: THREE.Object3D; info: any }) => void, callBackProp?: any): THREE.Object3D {
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
  }

  public addComplex(
    SCENE: THREE.Scene,
    prop: ComplexObjectProperties = {},
    callBack?: (result: { obj: ComplexObjectGroup }) => void,
    callBackProp?: any
  ): ComplexObjectGroup {
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
      this.setPropAndParameters(COMPLEX, prop.parameters, SCENE);

      // Add the complex object to the scene if provided
      if (SCENE) {
        SCENE.add(COMPLEX);
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
            this.loadStandardTexture(
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
            this.createBase64Texture(
              textureItem.url,
              (texture: THREE.Texture) => {
                COMPLEX.TEXTURES[textureItem.name] = texture;
                if (checkCounter(totCounter)) {
                  createMaterials();
                }
              }
            );
          } else if (textureItem.type === "video") {
            this.createVideoTexture(
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
            this.setPropAndParameters(material, materialItem.parameters);
            
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

    const createElements = () => {
      if (prop.parameters?.elementList !== undefined) {
        step = "elementList";
        counter = 0;
        totCounter = prop.parameters.elementList.length;
        
        if (totCounter > 0) {
          for (let i = 0; i < prop.parameters.elementList.length; i++) {
            const elementType = prop.parameters.elementList[i].type;
            const elementProp = prop.parameters.elementList[i].prop || {};
            
            // Choose the appropriate function based on element type
            let addFunction;
            
            switch (elementType) {
              case 'mesh':
              case 'Mesh':
                addFunction = this.addMesh.bind(this);
                break;
              case 'line':
              case 'Line':
              case 'LineLoop':
              case 'LineSegments':
                addFunction = this.addLine.bind(this);
                break;
              case 'sprite':
              case 'Sprite':
                addFunction = this.addSprite.bind(this);
                break;
              case 'group':
              case 'Group':
                addFunction = this.addGroup.bind(this);
                break;
              case 'light':
              case 'DirectionalLight':
              case 'PointLight':
              case 'SpotLight':
              case 'AmbientLight':
              case 'HemisphereLight':
                addFunction = this.addLight.bind(this);
                break;
              case 'camera':
              case 'PerspectiveCamera':
              case 'OrthographicCamera':
                addFunction = this.addCamera.bind(this);
                break;
              default:
                console.warn(`Unknown element type: ${elementType}`);
                addFunction = this.addMesh.bind(this);
            }
            
            // Call the appropriate function
            addFunction(
              COMPLEX,
              elementProp,
              () => {
                if (checkCounter(totCounter)) {
                  createPhysicContraints();
                }
              },
              {}
            );
          }
        } else {
          createPhysicContraints();
        }
      } else {
        createPhysicContraints();
      }
    };

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
            this.setPropAndParameters(constraint, constraintItem.parameters, SCENE);
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
            this.setPropAndParameters(material, materialItem.parameters, SCENE);
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
  }

  public addScript(
    node: THREE.Object3D, 
    prop: {
      name: string,
      function?: Function,
      functionProp?: Record<string, any>,
      parameters?: Record<string, any>
    }
  ): void {
    // Initialize the MM3D property if it doesn't exist
    if (!(node as any).MM3D) {
      (node as any).MM3D = { scriptList: [] };
    } else if (!(node as any).MM3D.scriptList) {
      (node as any).MM3D.scriptList = [];
    }
    
    // Add the object to functionProp if not specified
    if (!prop.functionProp) {
      prop.functionProp = { obj: node };
    } else {
      prop.functionProp.obj = node;
    }
    
    // Add the script to the list
    (node as any).MM3D.scriptList.push(prop);
  }

  public addEvent(
    node: THREE.Object3D, 
    prop: Record<string, any>
  ): void {
    // Initialize the MM3D property if it doesn't exist
    if (!(node as any).MM3D) {
      (node as any).MM3D = { events: {} };
    } else if (!(node as any).MM3D.events) {
      (node as any).MM3D.events = {};
    }
    
    (node as any).MM3D.events = prop;
  }

  public loadComplex(
    SCENE: THREE.Scene,
    url: string,
    prop?: Record<string, any>,
    callBack?: (result: { obj: ComplexObjectGroup }) => void,
    errorCallBack?: (error: Error) => void
  ): void {
    this.loadJSON(
      url,
      (data: any) => {
        // Merge provided properties with loaded data
        if (prop) {
          Object.keys(prop).forEach(key => {
            data[key] = prop[key];
          });
        }
        
        // Create the complex object with the data
        this.addComplex(
          SCENE,
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
  }

  public loadJSON(
    url: string,
    callBack?: (data: any, info: { info: string }) => void,
    errorCallBack?: (error: Error, info: { info: string }) => void
  ): void {
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
  }

  public deleteTexture(
    SCENE: THREE.Scene,
    TEXTURE: THREE.Texture | string,
    callBack?: Function,
    callBackProp?: any
  ): void {
    if (!TEXTURE) {
      return;
    }
    
    let textureName: string;
    let textureObj: THREE.Texture | null = null;
    
    if (typeof TEXTURE === 'string') {
      textureName = TEXTURE;
      textureObj = (SCENE as any)?.TEXTURES?.[textureName] || null;
    } else {
      textureName = TEXTURE.name;
      textureObj = TEXTURE;
    }
    
    // Remove texture from all materials in the scene
    if (SCENE) {
      SCENE.traverse((node: THREE.Object3D) => {
        if (node instanceof THREE.Mesh) {
          if (node.material) {
            this.removeTextureFromMaterial(node.material, textureName);
          }
        }
      });
    }
    
    // Dispose texture if found
    if (textureObj) {
      textureObj.dispose();
      
      // Remove from scene textures if exists
      if ((SCENE as any)?.TEXTURES?.[textureName]) {
        delete (SCENE as any).TEXTURES[textureName];
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
  }

  private removeTextureFromMaterial(material: THREE.Material, textureName: string): void {
    // Handle array of materials
    if (Array.isArray(material)) {
      material.forEach(mat => this.removeTextureFromMaterial(mat, textureName));
      return;
    }
    
    // Check each texture property on the material
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

  public deleteMaterial(
    SCENE: THREE.Scene,
    MATERIAL: THREE.Material | string,
    callBack?: Function,
    callBackProp?: any
  ): void {
    if (!MATERIAL) {
      return;
    }
    
    let materialName: string;
    let materialObj: THREE.Material | null = null;
    
    if (typeof MATERIAL === 'string') {
      materialName = MATERIAL;
      materialObj = (SCENE as any)?.MATERIALS?.[materialName] || null;
    } else {
      materialName = MATERIAL.name;
      materialObj = MATERIAL;
    }
    
    // Replace material in all meshes using it
    if (SCENE) {
      SCENE.traverse((node: THREE.Object3D) => {
        if (node instanceof THREE.Mesh) {
          if (node.material) {
            // Handle array of materials
            if (Array.isArray(node.material)) {
              const materialIndex = node.material.findIndex(m => 
                m === materialObj || (materialObj && m.name === materialObj.name)
              );
              if (materialIndex !== -1) {
                // Replace with default material
                node.material[materialIndex] = new THREE.MeshBasicMaterial();
              }
            } else if (node.material === materialObj || (materialObj && node.material.name === materialObj.name)) {
              // Replace with default material
              node.material = new THREE.MeshBasicMaterial();
            }
          }
        }
      });
    }
    
    // Dispose material if found
    if (materialObj) {
      materialObj.dispose();
      
      // Remove from scene materials if exists
      if ((SCENE as any)?.MATERIALS?.[materialName]) {
        delete (SCENE as any).MATERIALS[materialName];
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
  }

  public deleteElement(
    SCENE: THREE.Scene,
    OBJ: THREE.Object3D | string,
    prop?: any,
    callBack?: Function,
    callBackProp?: any
  ): void {
    if (!OBJ) {
      return;
    }
    
    let objName: string;
    let objToRemove: THREE.Object3D | null = null;
    
    if (typeof OBJ === 'string') {
      objName = OBJ;
      objToRemove = SCENE.getObjectByName(objName) || null;
    } else {
      objName = OBJ.name;
      objToRemove = OBJ;
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
      if (SCENE && (SCENE as any).OBJECTS && (SCENE as any).OBJECTS[objName]) {
        delete (SCENE as any).OBJECTS[objName];
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
  }

  public playMotions(
    node: THREE.Object3D,
    playMotionList: string[]
  ): void {
    if (!(node as any).MM3D || !(node as any).MM3D.MOTIONS) {
      return;
    }
    
    const motions = (node as any).MM3D.MOTIONS;
    
    playMotionList.forEach(motionName => {
      if (motions.list && motions.list[motionName] && motions.list[motionName].clipAction) {
        motions.list[motionName].clipAction.play();
      }
    });
  }

  public doScriptList(scriptList: Array<{
    name: string;
    function: Function;
    functionProp?: any;
  }>): void {
    if (!scriptList || !Array.isArray(scriptList)) {
      return;
    }
    
    scriptList.forEach(script => {
      if (script.function && typeof script.function === 'function') {
        if (script.functionProp) {
          script.function(script.functionProp);
        } else {
          script.function();
        }
      }
    });
  }

  public updateEvent(
    scene: THREE.Scene,
    camera: THREE.Camera,
    view: { width: number; height: number }
  ): void {
    // Get screen normalized mouse position
    if (this.p.DEVICES.mouse && this.p.DEVICES.mouse.position) {
      const normalizedScreenVector = new THREE.Vector2(
        (this.p.DEVICES.mouse.position.x / view.width) * 2 - 1,
        -(this.p.DEVICES.mouse.position.y / view.height) * 2 + 1
      );
      
      // Create list of clickable objects
      const clickableNodes: THREE.Object3D[] = [];
      
      scene.traverse((node: THREE.Object3D) => {
        if ((node as any).clickable === true) {
          clickableNodes.push(node);
        }
      });
      
      // Raycast against clickable objects
      if (clickableNodes.length > 0) {
        this.p.RAYCAST.setFromCamera(normalizedScreenVector, camera);
        const intersects = this.p.RAYCAST.intersectObjects(clickableNodes, true);
        
        // Process intersections
        for (const intersect of intersects) {
          const node = intersect.object;
          
          // Handle events based on device type
          if (this.p.DEVICES.eventType === 'mousedown' && (node as any).MM3D?.events?.onMouseDown) {
            (node as any).MM3D.events.onMouseDown({ 
              node, 
              distance: intersect.distance,
              event: this.p.DEVICES.mouse
            });
          } else if (this.p.DEVICES.eventType === 'mouseup' && (node as any).MM3D?.events?.onMouseUp) {
            (node as any).MM3D.events.onMouseUp({ 
              node, 
              distance: intersect.distance,
              event: this.p.DEVICES.mouse
            });
          } else if (this.p.DEVICES.eventType === 'touchstart' && (node as any).MM3D?.events?.onTouchStart) {
            (node as any).MM3D.events.onTouchStart({ 
              node, 
              distance: intersect.distance,
              event: this.p.DEVICES.touch
            });
          } else if (this.p.DEVICES.eventType === 'touchend' && (node as any).MM3D?.events?.onTouchEnd) {
            (node as any).MM3D.events.onTouchEnd({ 
              node, 
              distance: intersect.distance,
              event: this.p.DEVICES.touch
            });
          }
        }
      }
    }
  }

  public updateAll(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    viewport?: { width?: number; height?: number }
  ): void {
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
    this.updateEvent(scene, camera, {
      width: viewport?.width || window.innerWidth,
      height: viewport?.height || window.innerHeight
    });
    
    // Render the scene
    renderer.render(scene, camera);
  }

  public checkIsInViewPort(p: {
    position: THREE.Vector3;
    camera: THREE.Camera;
    padding?: number;
  }): boolean {
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
  }

  public updateRefreshDevices(): void {
    // Update gamepad state
    if (this.p.DEVICES.gamepad) {
      const gamepads = navigator.getGamepads();
      if (gamepads) {
        this.p.DEVICES.gamepad = gamepads[0]; // Update with current gamepad state
      }
    }
  }

  public render(layerList: Array<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
    clear?: boolean;
  }>): void {
    // Render each layer in sequence
    layerList.forEach(layer => {
      const renderer = layer.renderer;
      
      if (layer.clear === true) {
        renderer.clear();
      }
      
      renderer.render(layer.scene, layer.camera);
    });
  }

  public playSound(name: string): void {
    if (this.p.SOUNDS[name] && this.p.SOUNDS[name].audio) {
      // Reset to beginning if already playing
      this.p.SOUNDS[name].audio.currentTime = 0;
      
      // Start playing
      this.p.SOUNDS[name].audio.play()
        .catch(e => console.error('Error playing sound:', e));
    }
  }

  public pauseSound(name: string): void {
    if (this.p.SOUNDS[name] && this.p.SOUNDS[name].audio) {
      this.p.SOUNDS[name].audio.pause();
    }
  }

  public stopSound(name: string): void {
    if (this.p.SOUNDS[name] && this.p.SOUNDS[name].audio) {
      this.p.SOUNDS[name].audio.pause();
      this.p.SOUNDS[name].audio.currentTime = 0;
    }
  }

  public stopAllSounds(): void {
    for (const name in this.p.SOUNDS) {
      if (this.p.SOUNDS[name] && this.p.SOUNDS[name].audio) {
        this.p.SOUNDS[name].audio.pause();
        this.p.SOUNDS[name].audio.currentTime = 0;
      }
    }
  }

  public deleteSound(name: string): void {
    if (this.p.SOUNDS[name]) {
      if (this.p.SOUNDS[name].audio) {
        this.p.SOUNDS[name].audio.pause();
        this.p.SOUNDS[name].audio.src = '';
        this.p.SOUNDS[name].audio.load();
      }
      delete this.p.SOUNDS[name];
    }
  }

  public copyText(commonDir: string, name: string): void {
    const text = document.getElementById(name)?.innerText || '';
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => {
          console.log('Text copied to clipboard');
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  public sendMail(commonDir: string, name: string, sub: string, emailAddress: string): void {
    const text = document.getElementById(name)?.innerText || '';
    const subject = encodeURIComponent(sub);
    const body = encodeURIComponent(text);
    
    window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
  }

  public sendWhatsApp(commonDir: string, name: string): void {
    const text = document.getElementById(name)?.innerText || '';
    const encodedText = encodeURIComponent(text);
    
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  }

  public sendTwitterApp(commonDir: string, name: string): void {
    const text = document.getElementById(name)?.innerText || '';
    const encodedText = encodeURIComponent(text);
    
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
  }

  public doVibration(vibList: number[]): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(vibList);
    } else {
      console.warn('Vibration API not supported in this device/browser');
    }
  }

  public openFullscreen(): void {
    let elem = document.body;

    // Check if currently not in fullscreen mode
    const isNotFullScreen = 
      ((document as any).fullscreenElement === null || document.fullscreenElement === undefined) && 
      ((document as any).msFullscreenElement === null || (document as any).msFullscreenElement === undefined) && 
      (!(document as any).mozFullScreen) && 
      (!(document as any).webkitIsFullScreen);

    if (isNotFullScreen) {
      // Request fullscreen using standard and vendor prefixed methods
      if ((elem as any).requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        (elem as any).mozRequestFullScreen();
      } else if ((elem as any).webkitRequestFullScreen) {
        (elem as any).webkitRequestFullScreen((Element as any).ALLOW_KEYBOARD_INPUT);
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
    } else {
      // Exit fullscreen using standard and vendor prefixed methods
      if ((document as any).cancelFullScreen) {
        (document as any).cancelFullScreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).webkitCancelFullScreen) {
        (document as any).webkitCancelFullScreen();
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  public closeFullscreen(): void {
    // Exit fullscreen using standard and vendor prefixed methods
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).mozCancelFullScreen) { // Firefox
      (document as any).mozCancelFullScreen();
    } else if ((document as any).webkitExitFullscreen) { // Chrome, Safari and Opera
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) { // IE/Edge
      (document as any).msExitFullscreen();
    }
  }
} 