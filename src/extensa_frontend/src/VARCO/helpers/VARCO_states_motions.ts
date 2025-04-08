import * as THREE from 'three';
import { VARCO } from "./VARCO";

// Interfacce per i tipi
interface AnimationClip {
  name: string;
  duration: number;
  tracks: any[];
  [key: string]: any;
}

interface Motion {
  name: string;
  start: number;
  end: number;
  fps: number;
  loop?: boolean;
  clipAction?: THREE.AnimationAction;
  clip?: AnimationClip;
}

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

export class VARCOStatesMotions {
  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Inizializzazione delle proprietà per stati e animazioni
    this.initStateMotionProperties();
    
    // Inizializzazione dei metodi per gestire stati
    this.initStateMethods();
    
    // Inizializzazione dei metodi per gestire animazioni
    this.initMotionMethods();
  }

  private initStateMotionProperties(): void {
    // Crea l'oggetto STATES se non esiste
    if (!VARCO.p.STATES) {
      VARCO.p.STATES = {
        current: null,
        previous: null,
        statesList: {},
        machine: null
      };
    }

    // Crea l'oggetto MOTIONS se non esiste
    if (!VARCO.p.MOTIONS) {
      VARCO.p.MOTIONS = {
        mixer: null,
        list: {},
        clock: new THREE.Clock()
      };
    }
  }

  private initStateMethods(): void {
    /**
     * Crea una nuova macchina a stati
     * @param initialState Stato iniziale
     * @param updateCallback Funzione da chiamare ad ogni aggiornamento
     * @returns L'oggetto macchina a stati
     */
    VARCO.f.createStateMachine = (
      initialState: string,
      updateCallback?: (delta: number) => void
    ): any => {
      const stateMachine = {
        states: {} as Record<string, State>,
        currentState: null as State | null,
        previousState: null as State | null,
        
        // Aggiunge uno stato alla macchina
        addState: function(state: State): void {
          this.states[state.name] = state;
        },
        
        // Passa a un nuovo stato
        changeState: function(stateName: string): boolean {
          if (!this.states[stateName]) {
            console.error(`State ${stateName} does not exist`);
            return false;
          }
          
          const nextState = this.states[stateName];
          
          // Esci dallo stato corrente
          if (this.currentState && this.currentState.onExit) {
            this.currentState.onExit(nextState);
          }
          
          // Aggiorna lo stato precedente
          this.previousState = this.currentState;
          
          // Imposta il nuovo stato corrente
          this.currentState = nextState;
          
          // Entra nel nuovo stato
          if (this.currentState.onEnter) {
            this.currentState.onEnter(this.previousState);
          }
          
          // Aggiorna i riferimenti in VARCO
          if (VARCO.p.STATES) {
            VARCO.p.STATES.current = this.currentState;
            VARCO.p.STATES.previous = this.previousState;
          }
          
          return true;
        },
        
        // Aggiorna la macchina a stati
        update: function(delta: number): void {
          // Controlla le transizioni
          if (this.currentState && this.currentState.transitions) {
            for (const transition of this.currentState.transitions) {
              if (transition.condition()) {
                if (transition.onTransition) {
                  transition.onTransition();
                }
                this.changeState(transition.target);
                break;
              }
            }
          }
          
          // Aggiorna lo stato corrente
          if (this.currentState && this.currentState.update) {
            this.currentState.update(delta);
          }
          
          // Chiamata alla callback esterna
          if (updateCallback) {
            updateCallback(delta);
          }
        },
        
        // Inizializza la macchina a stati
        init: function(): void {
          if (initialState && this.states[initialState]) {
            this.changeState(initialState);
          } else {
            console.error(`Initial state ${initialState} does not exist`);
          }
        }
      };
      
      // Assegna la macchina a VARCO per riferimenti globali
      if (VARCO.p.STATES) {
        VARCO.p.STATES.machine = stateMachine;
        VARCO.p.STATES.statesList = stateMachine.states;
      }
      
      return stateMachine;
    };

    /**
     * Crea un nuovo stato
     * @param name Nome dello stato
     * @param params Parametri dello stato
     * @returns Oggetto stato
     */
    VARCO.f.createState = (
      name: string,
      params?: {
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
    ): State => {
      const state: State = {
        name,
        onEnter: params?.onEnter,
        onExit: params?.onExit,
        update: params?.update,
        transitions: params?.transitions || [],
        properties: params?.properties || {}
      };
      
      // Aggiungi lo stato alla lista globale
      if (VARCO.p.STATES) {
        VARCO.p.STATES.statesList[name] = state;
      }
      
      return state;
    };
  }

  private initMotionMethods(): void {
    /**
     * Crea un mixer di animazioni per un oggetto 3D
     * @param object Oggetto 3D da animare
     * @returns Mixer di animazioni
     */
    VARCO.f.createAnimationMixer = (object: THREE.Object3D): THREE.AnimationMixer => {
      const mixer = new THREE.AnimationMixer(object);
      
      if (VARCO.p.MOTIONS) {
        VARCO.p.MOTIONS.mixer = mixer;
      }
      
      return mixer;
    };

    /**
     * Aggiunge un'animazione al mixer
     * @param name Nome dell'animazione
     * @param clip Clip dell'animazione
     * @param params Parametri aggiuntivi dell'animazione
     * @returns Oggetto animazione
     */
    VARCO.f.addAnimation = (
      name: string,
      clip: AnimationClip,
      params?: {
        loop?: boolean;
        start?: number;
        end?: number;
        fps?: number;
      }
    ): Motion => {
      if (!VARCO.p.MOTIONS || !VARCO.p.MOTIONS.mixer) {
        console.error('Animation mixer not initialized. Call createAnimationMixer first.');
        throw new Error('Animation mixer not initialized');
      }
      
      const motion: Motion = {
        name,
        start: params?.start || 0,
        end: params?.end || clip.duration,
        fps: params?.fps || 30,
        loop: params?.loop || false,
        clip
      };
      
      // Crea l'action per questa animazione
      motion.clipAction = VARCO.p.MOTIONS.mixer.clipAction(clip);
      
      // Configura l'action in base ai parametri
      if (motion.clipAction) {
        if (motion.loop) {
          motion.clipAction.setLoop(THREE.LoopRepeat, Infinity);
        } else {
          motion.clipAction.setLoop(THREE.LoopOnce, 1);
          motion.clipAction.clampWhenFinished = true;
        }
      }
      
      // Aggiungi l'animazione alla lista
      if (VARCO.p.MOTIONS) {
        VARCO.p.MOTIONS.list[name] = motion;
      }
      
      return motion;
    };

    /**
     * Riproduce un'animazione
     * @param name Nome dell'animazione da riprodurre
     * @param fadeIn Tempo di dissolvenza in entrata
     * @returns True se l'animazione è stata avviata, false altrimenti
     */
    VARCO.f.playAnimation = (name: string, fadeIn: number = 0.5): boolean => {
      if (!VARCO.p.MOTIONS || !VARCO.p.MOTIONS.list[name]) {
        console.error(`Animation ${name} not found`);
        return false;
      }
      
      const motion = VARCO.p.MOTIONS.list[name];
      
      if (motion.clipAction) {
        motion.clipAction.reset();
        motion.clipAction.fadeIn(fadeIn);
        motion.clipAction.play();
        return true;
      }
      
      return false;
    };

    /**
     * Ferma un'animazione
     * @param name Nome dell'animazione da fermare
     * @param fadeOut Tempo di dissolvenza in uscita
     * @returns True se l'animazione è stata fermata, false altrimenti
     */
    VARCO.f.stopAnimation = (name: string, fadeOut: number = 0.5): boolean => {
      if (!VARCO.p.MOTIONS || !VARCO.p.MOTIONS.list[name]) {
        console.error(`Animation ${name} not found`);
        return false;
      }
      
      const motion = VARCO.p.MOTIONS.list[name];
      
      if (motion.clipAction) {
        motion.clipAction.fadeOut(fadeOut);
        return true;
      }
      
      return false;
    };

    /**
     * Aggiorna tutte le animazioni in base al delta time
     * @param delta Tempo trascorso dall'ultimo aggiornamento
     */
    VARCO.f.updateAnimations = (delta?: number): void => {
      if (!VARCO.p.MOTIONS || !VARCO.p.MOTIONS.mixer) {
        return;
      }
      
      const deltaTime = delta || VARCO.p.MOTIONS.clock.getDelta();
      VARCO.p.MOTIONS.mixer.update(deltaTime);
    };
  }
}

// Estensione delle dichiarazioni di VARCO per states e motions
declare module "./VARCO" {
  interface VARCOClass {
    p: {
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
    };
  }
}

// Inizializza il modulo Stati e Movimenti
new VARCOStatesMotions(); 