export interface ModelState {
  currentModel: {
    id: string | null;
    name: string | null;
    position: {
      x: number;
      y: number;
      z: number;
    };
    rotation: {
      x: number;
      y: number;
      z: number;
    };
    scale: {
      x: number;
      y: number;
      z: number;
    };
  };
  isEditing: boolean;
  savedModels: SavedModel[];
}

export interface SavedModel {
  id: string;
  name: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  scale: {
    x: number;
    y: number;
    z: number;
  };
}

export interface ModelControls {
  enableRotation: boolean;
  enableScale: boolean;
  enablePosition: boolean;
  minScale: number;
  maxScale: number;
} 