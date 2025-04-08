import * as THREE from 'three';
import { VARCOClass } from "./VARCO";

// Creazione dell'istanza singleton di VARCO
const VARCO = VARCOClass.getInstance();

export class VARCOFileIO {
  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Inizializzazione dei metodi di I/O
    this.initFileMethods();
  }

  private initFileMethods(): void {
    /**
     * Salva un file sul dispositivo dell'utente
     * @param fileName Nome del file da salvare
     * @param data Dati da salvare
     * @param type Tipo di dati (es. 'text/plain', 'application/json')
     */
    VARCO.f.saveFile = (fileName: string, data: string | Blob, type: string = 'text/plain'): void => {
      let blob: Blob;
      
      if (typeof data === 'string') {
        blob = new Blob([data], { type });
      } else {
        blob = data;
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      a.href = url;
      a.download = fileName;
      a.click();
      
      URL.revokeObjectURL(url);
    };

    /**
     * Legge un file caricato dall'utente
     * @param fileInput Elemento input file
     * @param callback Funzione da chiamare con i dati letti
     * @param readAs Metodo di lettura ('text', 'arraybuffer', 'dataurl')
     */
    VARCO.f.readFile = (
      fileInput: HTMLInputElement | File, 
      callback: (data: string | ArrayBuffer | null, file?: File) => void, 
      readAs: 'text' | 'arraybuffer' | 'dataurl' = 'text'
    ): void => {
      let file: File | null = null;
      
      if (fileInput instanceof HTMLInputElement) {
        if (fileInput.files && fileInput.files.length > 0) {
          file = fileInput.files[0];
        }
      } else {
        file = fileInput;
      }
      
      if (!file) {
        console.error('No file selected');
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = () => {
        callback(reader.result, file as File);
      };
      
      reader.onerror = () => {
        console.error('Error reading file');
        callback(null);
      };
      
      switch (readAs) {
        case 'text':
          reader.readAsText(file);
          break;
        case 'arraybuffer':
          reader.readAsArrayBuffer(file);
          break;
        case 'dataurl':
          reader.readAsDataURL(file);
          break;
      }
    };

    /**
     * Legge più file caricati dall'utente
     * @param fileInput Elemento input file
     * @param callback Funzione da chiamare con i dati letti
     * @param readAs Metodo di lettura ('text', 'arraybuffer', 'dataurl')
     */
    VARCO.f.readFiles = (
      fileInput: HTMLInputElement, 
      callback: (dataList: Array<{ data: string | ArrayBuffer | null, file: File }>) => void, 
      readAs: 'text' | 'arraybuffer' | 'dataurl' = 'text'
    ): void => {
      const files = fileInput.files;
      
      if (!files || files.length === 0) {
        console.error('No files selected');
        return;
      }
      
      const results: Array<{ data: string | ArrayBuffer | null, file: File }> = [];
      let filesRead = 0;
      
      const checkAllFilesRead = () => {
        if (filesRead === files.length) {
          callback(results);
        }
      };
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        reader.onload = () => {
          results.push({ data: reader.result, file });
          filesRead++;
          checkAllFilesRead();
        };
        
        reader.onerror = () => {
          results.push({ data: null, file });
          filesRead++;
          checkAllFilesRead();
        };
        
        switch (readAs) {
          case 'text':
            reader.readAsText(file);
            break;
          case 'arraybuffer':
            reader.readAsArrayBuffer(file);
            break;
          case 'dataurl':
            reader.readAsDataURL(file);
            break;
        }
      }
    };

    /**
     * Esporta un oggetto 3D in un formato specifico
     * @param object Oggetto Three.js da esportare
     * @param format Formato di esportazione ('obj', 'gltf', ecc.)
     * @param options Opzioni aggiuntive
     */
    VARCO.f.exportObject3D = (object: THREE.Object3D, format: string, options?: any): void => {
      // Implementazione dell'esportazione basata sul formato
      console.log(`Exporting object to ${format} format`);
    };

    /**
     * Importa un file 3D e crea un oggetto Three.js
     * @param file File da importare
     * @param callback Funzione da chiamare con l'oggetto importato
     */
    VARCO.f.importObject3D = (file: File, callback: (object: THREE.Object3D | null) => void): void => {
      // Implementazione dell'importazione basata sul tipo di file
      console.log(`Importing 3D object from ${file.name}`);
    };
  }
}

// Inizializza il modulo FileIO
new VARCOFileIO(); 