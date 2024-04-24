import { writable, type Readable } from "svelte/store";
import type { GeoArea, Project } from "../types/project";

export interface ProjectStoreData {
    geoAreas: GeoArea[];
    project: Project | null;
}

export interface ProjectStore extends Readable<ProjectStoreData> {
    setGeoareas: (geoAreas: GeoArea[]) => void;
    setProject: (project: Project | null) => void;
    set3DVisible: (is3DVisible: boolean) => void;
    resetState: () => void;
}

const initState: ProjectStoreData = {
    geoAreas: [],
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
        setGeoareas: (geoAreas: GeoArea[]) => {
            update((state) => {
                return {
                    ...state,
                    geoAreas
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