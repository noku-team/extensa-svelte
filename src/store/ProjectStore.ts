import { writable, type Readable } from "svelte/store";
import type { Group } from "three";

export interface ProjectStoreData {
    projects: Project[];
    project: Project | null;
}

export interface ProjectStore extends Readable<ProjectStoreData> {
    setProjects: (projects: Project[]) => void;
    setProject: (project: Project | null) => void;
    set3DVisible: (is3DVisible: boolean) => void;
    resetState: () => void;
}


interface Project extends Group {
    is3DVisible: boolean;
}

const initState: ProjectStoreData = {
    projects: [],
    project: null,
};

const initProjectStore = (): ProjectStore => {
    const { subscribe, set, update } = writable<ProjectStoreData>(initState);

    return {
        subscribe,
        setProject: (project: Project | null) => {
            update((state) => {
                return {
                    ...state,
                    project
                };
            })
        },
        setProjects: (projects: Project[]) => {
            update((state) => {
                return {
                    ...state,
                    projects
                };
            });
        },
        set3DVisible: (is3DVisible: boolean) => {
            update((state) => {
                if (state.project) state.project.is3DVisible = is3DVisible;
                return state;
            });
        },
        resetState: () => (set(initState))
    }
}

export const projectStore = initProjectStore();