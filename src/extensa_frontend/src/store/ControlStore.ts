import { writable, type Readable } from "svelte/store";

export interface ControlStoreData {
    isDragAndDropActive: boolean;
}

export interface ControlStore extends Readable<ControlStoreData> {
    setIsDragAndDropActive: (_isDragAndDropActive: boolean) => void;
    toggleDragAndDropActive: () => void;
}

const initControlStore = (): ControlStore => {
    const { subscribe, set, update } = writable<ControlStoreData>({
        isDragAndDropActive: false
    });

    return {
        subscribe,
        setIsDragAndDropActive: (_isDragAndDropActive = false) => {
            set({
                isDragAndDropActive: _isDragAndDropActive,
            });
        },
        toggleDragAndDropActive: () => {
            update((state) => ({
                ...state,
                isDragAndDropActive: !state.isDragAndDropActive
            }));
        }
    }
}

export const controlStore = initControlStore();