import { writable, type Readable } from "svelte/store";
import type { Group } from "three";

export interface ProjectStoreData {
    projects: Group[];
    project: Group | null;
    is3DVisible?: boolean;
}

export interface ProjectStore extends Readable<ProjectStoreData> {
    setProjects: (projects: Group[]) => void;
    setProject: (project: Group | null) => void;
    set3DVisible: (is3DVisible: boolean) => void;
    resetState: () => void;
}

const initState: ProjectStoreData = {
    projects: [],
    project: null,
    is3DVisible: false
};

const initProjectStore = (): ProjectStore => {
    const { subscribe, set, update } = writable<ProjectStoreData>(initState);

    return {
        subscribe,
        setProject: (project: Group | null) => {
            update((state) => {
                return {
                    ...state,
                    project
                };
            })
        },
        setProjects: (projects: Group[]) => {
            update((state) => {
                return {
                    ...state,
                    projects
                };
            });
        },
        set3DVisible: (is3DVisible: boolean) => {
            update((state) => {
                return {
                    ...state,
                    is3DVisible
                };
            });
        },
        resetState: () => (set(initState))
    }
}

export const projectStore = initProjectStore();