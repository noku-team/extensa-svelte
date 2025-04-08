import { writable } from 'svelte/store';

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
  savedModels: Array<{
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
  }>;
}

const initialState: ModelState = {
  currentModel: {
    id: null,
    name: null,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
  },
  isEditing: false,
  savedModels: []
};

export const modelStore = writable<ModelState>(initialState); 