import { writable, type Readable } from "svelte/store";

export interface SpinnerStoreData {
    isLoading: boolean;
    message?: string;
}

export interface SpinnerStore extends Readable<SpinnerStoreData> {
    setLoading: (_isLoading: boolean, message?: string) => void;
}

const initSpinnerStore = (): SpinnerStore => {
    const { subscribe, set, update } = writable<SpinnerStoreData>({
        isLoading: false,
        message: "",
    });

    return {
        subscribe,
        setLoading: (_isLoading: boolean, message?: string) => {
            let _message = message;
            
            if (!_isLoading) _message = "";
            if (!message) _message = "";

            set({
                isLoading: _isLoading,
                message: _message,
            });
        }
    }
}

export const spinnerStore = initSpinnerStore();