import * as THREE from 'three';
import { VARCOClass } from "./VARCO";
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { ARButton } from 'three/addons/webxr/ARButton.js';

// Creazione dell'istanza singleton di VARCO
const VARCO = VARCOClass.getInstance();

interface XRDevice {
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
}

export class VARCOXR {
  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Inizializzazione delle proprietà XR
    this.initXRProperties();
    
    // Inizializzazione dei metodi per AR
    this.initARMethods();
    
    // Inizializzazione dei metodi per VR
    this.initVRMethods();
  }

  private initXRProperties(): void {
    // Inizializzazione delle proprietà di XR
    if (!VARCO.p.DEVICES.VR) {
      VARCO.p.DEVICES.VR = {
        enabled: false,
        isPlaying: false,
        xrFrame: false,
        referenceSpaceType: 'local' as XRReferenceSpaceType,
        controllers: [],
        controllerGrips: []
      };
    }

    if (!VARCO.p.DEVICES.AR) {
      VARCO.p.DEVICES.AR = {
        enabled: false,
        isPlaying: false,
        xrFrame: false,
        referenceSpaceType: 'local' as XRReferenceSpaceType
      };
    }
  }

  private initVRMethods(): void {
    /**
     * Crea un pulsante per attivare la modalità VR e configura la sessione VR
     * @param renderer Renderer THREE.js
     * @param options Opzioni aggiuntive per la sessione VR
     * @returns Elemento HTML del pulsante VR
     */
    VARCO.f.createVRButton = (
      renderer: THREE.WebGLRenderer,
      options?: {
        referenceSpaceType?: XRReferenceSpaceType;
        sessionInit?: XRSessionInit;
        onSessionStarted?: (session: XRSession) => void;
        onSessionEnded?: () => void;
      }
    ): HTMLElement => {
      // Configura le proprietà VR
      if (VARCO.p.DEVICES.VR) {
        VARCO.p.DEVICES.VR.referenceSpaceType = options?.referenceSpaceType || 'local';
        VARCO.p.DEVICES.VR.sessionInit = options?.sessionInit || {
          optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers']
        };
      }

      // Funzione di callback quando inizia la sessione VR
      const onSessionStarted = (session: XRSession): void => {
        if (VARCO.p.DEVICES.VR) {
          VARCO.p.DEVICES.VR.currentSession = session;
          VARCO.p.DEVICES.VR.isPlaying = true;
        }

        session.addEventListener('end', onSessionEnded);

        renderer.xr.setReferenceSpaceType(VARCO.p.DEVICES.VR?.referenceSpaceType || 'local');
        renderer.xr.setSession(session);

        // Callback personalizzata
        if (options?.onSessionStarted) {
          options.onSessionStarted(session);
        }
      };

      // Funzione di callback quando termina la sessione VR
      const onSessionEnded = (): void => {
        if (VARCO.p.DEVICES.VR) {
          VARCO.p.DEVICES.VR.currentSession = null;
          VARCO.p.DEVICES.VR.isPlaying = false;
        }

        // Callback personalizzata
        if (options?.onSessionEnded) {
          options.onSessionEnded();
        }
      };

      // Crea il pulsante VR
      const button = VRButton.createButton(renderer, {
        ...VARCO.p.DEVICES.VR?.sessionInit,
        onSessionStart: onSessionStarted,
        onSessionEnd: onSessionEnded
      });

      return button;
    };

    /**
     * Inizializza i controller VR
     * @param renderer Renderer THREE.js
     * @param scene Scena THREE.js dove aggiungere i controller
     * @param options Opzioni per i controller
     */
    VARCO.f.initVRControllers = (
      renderer: THREE.WebGLRenderer,
      scene: THREE.Scene,
      options?: {
        onSelectStart?: (event: any) => void;
        onSelectEnd?: (event: any) => void;
        controllerModels?: boolean;
      }
    ): void => {
      if (!VARCO.p.DEVICES.VR) return;

      // Crea la factory per i modelli dei controller
      if (options?.controllerModels !== false) {
        VARCO.p.DEVICES.VR.controllerFactory = new XRControllerModelFactory();
      }

      // Inizializza array per i controller se non esistono
      if (!VARCO.p.DEVICES.VR.controllers) {
        VARCO.p.DEVICES.VR.controllers = [];
      }

      if (!VARCO.p.DEVICES.VR.controllerGrips) {
        VARCO.p.DEVICES.VR.controllerGrips = [];
      }

      // Crea i controller (tipicamente due per VR)
      for (let i = 0; i < 2; i++) {
        // Controller principale
        const controller = renderer.xr.getController(i);
        
        if (options?.onSelectStart) {
          controller.addEventListener('selectstart', options.onSelectStart);
        }
        
        if (options?.onSelectEnd) {
          controller.addEventListener('selectend', options.onSelectEnd);
        }
        
        scene.add(controller);
        VARCO.p.DEVICES.VR.controllers.push(controller);

        // Controller grip (modello fisico del controller)
        if (options?.controllerModels !== false && VARCO.p.DEVICES.VR.controllerFactory) {
          const controllerGrip = renderer.xr.getControllerGrip(i);
          const model = VARCO.p.DEVICES.VR.controllerFactory.createControllerModel(controllerGrip);
          controllerGrip.add(model);
          scene.add(controllerGrip);
          VARCO.p.DEVICES.VR.controllerGrips.push(controllerGrip);
        }
      }
    };

    /**
     * Handler per gli eventi di animazione in VR
     * @param renderer Renderer THREE.js
     * @param callback Funzione di callback per l'animazione
     */
    VARCO.f.setupVRAnimation = (
      renderer: THREE.WebGLRenderer,
      callback: (time: number, frame: XRFrame) => void
    ): void => {
      if (!VARCO.p.DEVICES.VR) return;

      // Memorizza la callback di aggiornamento
      VARCO.p.DEVICES.VR.updateXRFrame = callback;

      // Configura l'animazione per la sessione XR
      renderer.setAnimationLoop((time: number, frame: XRFrame) => {
        if (frame) {
          if (VARCO.p.DEVICES.VR) {
            VARCO.p.DEVICES.VR.xrFrame = true;
          }

          // Ottiene la posa dell'utente nel reference space
          if (frame.session && VARCO.p.DEVICES.VR) {
            if (!VARCO.p.DEVICES.VR.xrReferenceSpace) {
              frame.session.requestReferenceSpace(VARCO.p.DEVICES.VR.referenceSpaceType)
                .then((referenceSpace) => {
                  if (VARCO.p.DEVICES.VR) {
                    VARCO.p.DEVICES.VR.xrReferenceSpace = referenceSpace;
                  }
                });
            } else {
              const pose = frame.getViewerPose(VARCO.p.DEVICES.VR.xrReferenceSpace);
              if (pose) {
                VARCO.p.DEVICES.VR.xrPose = pose;
              }
            }
          }
        } else {
          if (VARCO.p.DEVICES.VR) {
            VARCO.p.DEVICES.VR.xrFrame = false;
          }
        }

        // Chiama la callback dell'utente
        if (VARCO.p.DEVICES.VR && VARCO.p.DEVICES.VR.updateXRFrame) {
          VARCO.p.DEVICES.VR.updateXRFrame(time, frame);
        }
      });
    };
  }

  private initARMethods(): void {
    /**
     * Crea un pulsante per attivare la modalità AR e configura la sessione AR
     * @param renderer Renderer THREE.js
     * @param options Opzioni aggiuntive per la sessione AR
     * @returns Elemento HTML del pulsante AR
     */
    VARCO.f.createARButton = (
      renderer: THREE.WebGLRenderer,
      options?: {
        referenceSpaceType?: XRReferenceSpaceType;
        sessionInit?: XRSessionInit;
        onSessionStarted?: (session: XRSession) => void;
        onSessionEnded?: () => void;
      }
    ): HTMLElement => {
      // Configura le proprietà AR
      if (VARCO.p.DEVICES.AR) {
        VARCO.p.DEVICES.AR.referenceSpaceType = options?.referenceSpaceType || 'local';
        VARCO.p.DEVICES.AR.sessionInit = options?.sessionInit || {
          requiredFeatures: ['hit-test'],
          optionalFeatures: ['dom-overlay'],
          domOverlay: { root: document.body }
        };
      }

      // Funzione di callback quando inizia la sessione AR
      const onSessionStarted = (session: XRSession): void => {
        if (VARCO.p.DEVICES.AR) {
          VARCO.p.DEVICES.AR.currentSession = session;
          VARCO.p.DEVICES.AR.isPlaying = true;
        }

        session.addEventListener('end', onSessionEnded);

        renderer.xr.setReferenceSpaceType(VARCO.p.DEVICES.AR?.referenceSpaceType || 'local');
        renderer.xr.setSession(session);

        // Callback personalizzata
        if (options?.onSessionStarted) {
          options.onSessionStarted(session);
        }
      };

      // Funzione di callback quando termina la sessione AR
      const onSessionEnded = (): void => {
        if (VARCO.p.DEVICES.AR) {
          VARCO.p.DEVICES.AR.currentSession = null;
          VARCO.p.DEVICES.AR.isPlaying = false;
        }

        // Callback personalizzata
        if (options?.onSessionEnded) {
          options.onSessionEnded();
        }
      };

      // Crea il pulsante AR
      const button = ARButton.createButton(renderer, {
        ...VARCO.p.DEVICES.AR?.sessionInit,
        onSessionStart: onSessionStarted,
        onSessionEnd: onSessionEnded
      });

      return button;
    };

    /**
     * Handler per gli eventi di animazione in AR
     * @param renderer Renderer THREE.js
     * @param callback Funzione di callback per l'animazione
     */
    VARCO.f.setupARAnimation = (
      renderer: THREE.WebGLRenderer,
      callback: (time: number, frame: XRFrame) => void
    ): void => {
      if (!VARCO.p.DEVICES.AR) return;

      // Memorizza la callback di aggiornamento
      VARCO.p.DEVICES.AR.updateXRFrame = callback;

      // Configura l'animazione per la sessione XR
      renderer.setAnimationLoop((time: number, frame: XRFrame) => {
        if (frame) {
          if (VARCO.p.DEVICES.AR) {
            VARCO.p.DEVICES.AR.xrFrame = true;
          }

          // Ottiene la posa dell'utente nel reference space
          if (frame.session && VARCO.p.DEVICES.AR) {
            if (!VARCO.p.DEVICES.AR.xrReferenceSpace) {
              frame.session.requestReferenceSpace(VARCO.p.DEVICES.AR.referenceSpaceType)
                .then((referenceSpace) => {
                  if (VARCO.p.DEVICES.AR) {
                    VARCO.p.DEVICES.AR.xrReferenceSpace = referenceSpace;
                  }
                });
            } else {
              const pose = frame.getViewerPose(VARCO.p.DEVICES.AR.xrReferenceSpace);
              if (pose) {
                VARCO.p.DEVICES.AR.xrPose = pose;
              }
            }
          }
        } else {
          if (VARCO.p.DEVICES.AR) {
            VARCO.p.DEVICES.AR.xrFrame = false;
          }
        }

        // Chiama la callback dell'utente
        if (VARCO.p.DEVICES.AR && VARCO.p.DEVICES.AR.updateXRFrame) {
          VARCO.p.DEVICES.AR.updateXRFrame(time, frame);
        }
      });
    };
  }
}

// Estensione delle dichiarazioni di VARCO per i dispositivi XR
declare module "./VARCO" {
  interface VARCOClass {
    p: {
      DEVICES: {
        VR?: XRDevice;
        AR?: XRDevice;
      };
    };
  }
}

// Inizializza il modulo XR
new VARCOXR(); 