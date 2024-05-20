import { writable, type Readable } from "svelte/store";
import type { GeoArea, Project } from "../types/project";

export interface ProjectStoreData {
    geoAreas: GeoArea[];
    geoAreaToEdit: GeoArea | null;
    project: Project | null;
    selectedGeoarea: GeoArea | null;
    sendProjectProgress: number;
    loadProjectProgress: number;
}

export interface ProjectStore extends Readable<ProjectStoreData> {
    setGeoareas: (geoAreas: GeoArea[]) => void;
    setProject: (project: Project | null) => void;
    setSelectedGeoarea: (geoArea: GeoArea | null) => void;
    set3DVisible: (is3DVisible: boolean) => void;
    setFileId: (fileId?: bigint) => void;
    setProjectId: (projectId?: bigint) => void;
    setProjectUser: (projectUser: string) => void;
    setNotYetSaved: (isNotYetSaved: boolean) => void;
    setGeoAreaToEdit: (geoarea: GeoArea | null) => void;
    setSendProjectProgress: (progress: number) => void;
    setLoadProjectProgress: (progress: number) => void;
    resetState: () => void;

}

const initState: ProjectStoreData = {
    geoAreas: [],
    geoAreaToEdit: null,
    project: null,
    selectedGeoarea: null,
    sendProjectProgress: 0,
    loadProjectProgress: 0,
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
        setSelectedGeoarea: (geoArea: GeoArea | null) => {
            update((state) => {
                return {
                    ...state,
                    selectedGeoarea: geoArea
                };
            });
        },
        setGeoareas: (geoAreas: GeoArea[]) => {
            update((state) => {
                return {
                    ...state,
                    geoAreas
                };
            });
        },
        setProjectUser: (principal: string) => {
            update((state) => {
                if (state.project) state.project.userData.user[0] = principal;
                return state;
            });
        },
        setFileId: (fileId?: bigint) => {
            if (!fileId) return;
            update((state) => {
                if (state.project) state.project.userData.file_id = fileId;
                return state;
            });
        },
        setProjectId: (projectId?: bigint) => {
            if (!projectId) return;
            update((state) => {
                if (state.project) state.project.userData.id = projectId;
                return state;
            });
        },

        set3DVisible: (is3DVisible: boolean) => {
            update((state) => {
                if (state.project) state.project.is3DVisible = is3DVisible;
                return state;
            });
        },
        setNotYetSaved: (isNotYetSaved: boolean) => {
            update((state) => {
                if (state.project) state.project.notYetSaved = isNotYetSaved;
                return state;
            });
        },
        setGeoAreaToEdit: (geoarea: GeoArea | null) => {
            update((state) => {
                if (state.project) state.geoAreaToEdit = geoarea;
                return state;
            });
        },
        setSendProjectProgress: (progress: number) => {
            update((state) => {
                return {
                    ...state,
                    sendProjectProgress: progress
                };
            });
        },
        setLoadProjectProgress: (progress: number) => {
            update((state) => {
                return {
                    ...state,
                    loadProjectProgress: progress
                };
            });
        },
        resetState: () => (set(initState))
    }
}

export const projectStore = initProjectStore();