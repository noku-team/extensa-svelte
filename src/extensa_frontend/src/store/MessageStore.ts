
// messageStore.ts
import { writable } from 'svelte/store';

export interface MessageState {
    message: string | null;
    type: 'error' | 'warning' | 'success' | 'info' | null;
}

const initialState: MessageState = {
    message: null,
    type: null
};

const createMessageStore = () => {
    const { subscribe, set, update } = writable(initialState);

    return {
        subscribe,
        setMessage: (message: string | null, type: MessageState['type']) =>
            update(state => ({ ...state, message, type })),
        reset: () => set(initialState)
    };
};

export const messageStore = createMessageStore();