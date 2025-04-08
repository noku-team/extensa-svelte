import { AuthClient } from '@dfinity/auth-client';
import type { Identity } from '@dfinity/agent';

export async function loadIdentity(): Promise<Identity | undefined> {
    try {
        const authClient = await AuthClient.create();
        const isAuthenticated = await authClient.isAuthenticated();

        if (isAuthenticated) {
            return authClient.getIdentity();
        }

        return undefined;
    } catch (err) {
        console.error('Failed to load identity:', err);
        return undefined;
    }
} 