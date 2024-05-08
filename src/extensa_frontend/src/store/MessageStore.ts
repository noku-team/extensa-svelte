import { writable } from 'svelte/store';

export type MessageType = 'info' | 'error' | 'success' | 'warning' | '';

export interface MessageStoreData {
    message: string;
    type: MessageType;
    setMessage: (message: string, type: MessageType) => void;
}

const initStore = {
    message: '',
    type: '' as MessageType,
}

const createMessageStore = () => {
    const { subscribe, set } = writable<{ message: string; type: MessageType }>(initStore);

    const setMessage = (message: string, type: MessageType) => {
        set({ message, type });

        // Automatically reset the message after 3000 milliseconds
        setTimeout(() => {
            set({ message: '', type: '' });
        }, 3000);
    }

    return {
        subscribe,
        setMessage
    };
};

export const messageStore = createMessageStore();