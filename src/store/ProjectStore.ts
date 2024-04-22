import { writable, type Readable } from "svelte/store";

interface Project {
    id: string;
    name: string;
    description: string;
	selectedProject: any;
}

export interface ProjectStoreData {
    project: Project | null;
    is3DVisible?: boolean;
}

export interface ProjectStore extends Readable<ProjectStoreData> {
    setProject: (project: Project | null) => void;
    set3DVisible: (is3DVisible: boolean) => void;
}

const initProjectStore = (): ProjectStore => {
    const { subscribe, set, update } = writable<ProjectStoreData>({
        project: null,
        is3DVisible: false
    });

    return {
        subscribe,
        setProject: (project: Project | null) => {
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