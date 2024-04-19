import { writable, type Readable } from "svelte/store";

interface Project {
    id: string;
    name: string;
    description: string;
}

export interface ProjectStoreData {
    project: Project | null;
}

export interface ProjectStore extends Readable<ProjectStoreData> {
    setProject: (project: Project | null) => void;
}

const initProjectStore = (): ProjectStore => {
    const { subscribe, set } = writable<ProjectStoreData>({
        project: null,
    });

    return {
        subscribe,
        setProject: (project: Project | null) => {
            set({ project });
        }
    }
}

export const projectStore = initProjectStore();