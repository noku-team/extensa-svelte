import * as THREE from 'three';
import { VARCOClass } from "./VARCO";

// Creazione dell'istanza singleton di VARCO
const VARCO = VARCOClass.getInstance();

// Interfacce per i parametri
interface ButtonTextParameters {
  string: string;
  width: number;
  height: number;
  fontSize: string;
  fontType: string;
  textAlign: string;
  textBaseline: string;
  textPosition: THREE.Vector2;
  shadowEnabled: boolean;
  shadowBlur: number;
  shadowColor: THREE.Color;
  shadowOffset: THREE.Vector2;
  color: THREE.Color;
  backDropColor: string;
}

interface ButtonParameters {
  string: string;
  enabled: boolean;
  width: number;
  height: number;
  variable: string | null;
  value: any | null;
  textures: {
    standard: string;
    clicked: string;
    rollover: string;
    disabled: string;
  };
  events: {
    [key: string]: {
      scriptList: Array<{
        function: Function;
        functionProp: Record<string, any>;
      }>;
    };
  };
  textParameters?: ButtonTextParameters;
}

interface ButtonProperties {
  name: string;
  parameters?: Partial<ButtonParameters>;
  MM3D?: {
    events?: {
      mousedown?: { scriptList: Array<any> };
      mouseup?: { scriptList: Array<any> };
      mousemove?: { scriptList: Array<any> };
      dblclick?: { scriptList: Array<any> };
      touchstart?: { scriptList: Array<any> };
      touchend?: { scriptList: Array<any> };
    };
    coordSystem?: string;
    adaptive?: {
      posH?: {
        x: number;
        y: number;
        z: number;
      };
      posV?: {
        x: number;
        y: number;
        z: number;
      };
    };
  };
}

export class VARCOUI {
  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Inizializzazione dei metodi UI
    this.initButtonMethods();
  }

  private initButtonMethods(): void {
    /**
     * Aggiunge un bottone alla scena
     * @param SCENE Scena THREE.js a cui aggiungere il bottone
     * @param prop Proprietà del bottone
     * @param callBack Funzione di callback dopo l'inizializzazione
     * @param callBackProp Proprietà della callback
     */
    VARCO.f.addButton = (
      SCENE: THREE.Scene, 
      prop: ButtonProperties, 
      callBack?: (p: { obj: THREE.Object3D }) => void, 
      callBackProp?: any
    ): void => {
      console.log("addButton");

      // Parametri di default
      let parameters: ButtonParameters = {
        string: "BUTTON",
        enabled: true,
        width: 100,
        height: 25,
        variable: null,
        value: null,
        textures: {
          standard: "../common/ui/tasto_medio_standard.png",
          clicked: "../common/ui/tasto_medio_clicked.png",
          rollover: "../common/ui/tasto_medio_rollover.png",
          disabled: "../common/ui/tasto_medio_standard.png"
        },
        events: {
          "mousedown": {
            "scriptList": [
              {
                "function": function (p: { obj: THREE.Object3D & { material: THREE.MeshBasicMaterial | THREE.MeshStandardMaterial, parent: any } }) {
                  p.obj.material.map = p.obj.parent.TEXTURES.clicked;
                  p.obj.material.needsUpdate = true;
                },
                "functionProp": {}
              }
            ]
          },
          "mouseup": {
            "scriptList": [
              {
                "function": function (p: { obj: THREE.Object3D & { material: THREE.MeshBasicMaterial | THREE.MeshStandardMaterial, parent: any } }) {
                  p.obj.material.map = p.obj.parent.TEXTURES.standard;
                  p.obj.material.needsUpdate = true;
                },
                "functionProp": {}
              }
            ]
          },
          "dblclick": {
            "scriptList": [
              {
                "function": function (p: { obj: THREE.Object3D & { material: THREE.MeshBasicMaterial | THREE.MeshStandardMaterial, parent: any } }) {
                  p.obj.material.map = p.obj.parent.TEXTURES.standard;
                  p.obj.material.needsUpdate = true;
                },
                "functionProp": {}
              }
            ]
          },
          "touchstart": {
            "scriptList": [
              {
                "function": function (p: { obj: THREE.Object3D & { material: THREE.MeshBasicMaterial | THREE.MeshStandardMaterial, parent: any } }) {
                  p.obj.material.map = p.obj.parent.TEXTURES.clicked;
                  p.obj.material.needsUpdate = true;
                },
                "functionProp": {}
              }
            ]
          },
          "touchend": {
            "scriptList": [
              {
                "function": function (p: { obj: THREE.Object3D & { material: THREE.MeshBasicMaterial | THREE.MeshStandardMaterial, parent: any } }) {
                  p.obj.material.map = p.obj.parent.TEXTURES.standard;
                  p.obj.material.needsUpdate = true;
                },
                "functionProp": {}
              }
            ]
          }
        }
      };

      // Merge parametri custom con default
      if (prop.parameters !== undefined) {
        parameters = this.setParameters(parameters, prop.parameters);
      }

      // Parametri di default per il testo
      let textParameters: ButtonTextParameters = {
        string: parameters.string,
        width: parameters.width,
        height: parameters.height,
        fontSize: '12pt',
        fontType: 'Verdana',
        textAlign: "center",
        textBaseline: "middle",
        textPosition: new THREE.Vector2(parameters.width * 0.5, parameters.height * 0.5),
        shadowEnabled: false,
        shadowBlur: 4,
        shadowColor: new THREE.Color(0, 0, 0),
        shadowOffset: new THREE.Vector2(2, 2),
        color: new THREE.Color(0, 0, 0),
        backDropColor: 'transparent'
      };

      // Merge parametri del testo custom con default
      if (prop.parameters !== undefined && prop.parameters.textParameters !== undefined) {
        textParameters = this.setParameters(textParameters, prop.parameters.textParameters);
      }

      // Gestione degli eventi custom
      if (prop.MM3D !== undefined && prop.MM3D.events !== undefined) {
        if (prop.MM3D.events.mousedown !== undefined && parameters.events.mousedown) {
          parameters.events.mousedown.scriptList = parameters.events.mousedown.scriptList.concat(prop.MM3D.events.mousedown.scriptList);
        }

        if (prop.MM3D.events.mouseup !== undefined && parameters.events.mouseup) {
          parameters.events.mouseup.scriptList = parameters.events.mouseup.scriptList.concat(prop.MM3D.events.mouseup.scriptList);
        }

        if (prop.MM3D.events.mousemove !== undefined && parameters.events.mousemove) {
          parameters.events.mousemove.scriptList = parameters.events.mousemove.scriptList.concat(prop.MM3D.events.mousemove.scriptList);
        }

        if (prop.MM3D.events.touchstart !== undefined && parameters.events.touchstart) {
          parameters.events.touchstart.scriptList = parameters.events.touchstart.scriptList.concat(prop.MM3D.events.touchstart.scriptList);
        }

        if (prop.MM3D.events.touchend !== undefined && parameters.events.touchend) {
          parameters.events.touchend.scriptList = parameters.events.touchend.scriptList.concat(prop.MM3D.events.touchend.scriptList);
        }
      }

      // Qui andrebbe implementata la logica di creazione del bottone
      // Questo è solo un template di base
      const createButton = (): THREE.Object3D => {
        // Creazione del bottone (placeholder)
        const buttonGeometry = new THREE.PlaneGeometry(parameters.width, parameters.height);
        const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);
        
        // Aggiunta alla scena
        SCENE.add(buttonMesh);
        
        return buttonMesh;
      };

      // Creazione del bottone
      const buttonObject = createButton();
      
      // Chiamata alla callback se presente
      if (callBack) {
        callBack({ obj: buttonObject });
      }
    };
  }

  /**
   * Unisce parametri custom con default
   * @param parameters Parametri di default
   * @param customParameters Parametri personalizzati
   * @returns Parametri uniti
   */
  private setParameters<T>(parameters: T, customParameters: Partial<T>): T {
    for (const key in customParameters) {
      if (
        typeof (parameters as any)[key] === 'object' && 
        (parameters as any)[key] !== null &&
        !Array.isArray((parameters as any)[key]) &&
        typeof customParameters[key] === 'object' &&
        customParameters[key] !== null &&
        !Array.isArray(customParameters[key])
      ) {
        (parameters as any)[key] = this.setParameters((parameters as any)[key], customParameters[key] as any);
      } else {
        (parameters as any)[key] = customParameters[key];
      }
    }
    return parameters;
  }
}

// Inizializza il modulo UI
new VARCOUI(); 