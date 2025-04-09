import { writable } from 'svelte/store';

interface UIControlState {
  activeToolId: string | null;
  activeToolName: string | null;
  isToolbarMinimized: boolean;
}

const createUIControlStore = () => {
  const { subscribe, update, set } = writable<UIControlState>({
    activeToolId: null,
    activeToolName: null,
    isToolbarMinimized: false,
  });

  return {
    subscribe,
    setActiveTool: (id: string | null, name: string | null) => update(state => ({ ...state, activeToolId: id, activeToolName: name })),
    toggleToolbarMinimized: () => update(state => ({ ...state, isToolbarMinimized: !state.isToolbarMinimized })),
    reset: () => set({ activeToolId: null, activeToolName: null, isToolbarMinimized: false }),
  };
};

export const uiControlStore = createUIControlStore();