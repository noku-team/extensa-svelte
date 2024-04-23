import { writable, type Readable } from "svelte/store";
import type { Group } from "three";

export interface ProjectStoreData {
    project: Group | null;
    is3DVisible?: boolean;
}

export interface ProjectStore extends Readable<ProjectStoreData> {
    setProject: (project: Group | null) => void;
    set3DVisible: (is3DVisible: boolean) => void;
}

const initProjectStore = (): ProjectStore => {
    const { subscribe, set, update } = writable<ProjectStoreData>({
        project: null,
        is3DVisible: false
    });

    return {
        subscribe,
        setProject: (project: Group | null) => {
            set({ project });
        },
        set3DVisible: (is3DVisible: boolean) => {
            update((state) => {
                return {
                    ...state,
                    is3DVisible
                };
            });
        }

    }
}

export const projectStore = initProjectStore();