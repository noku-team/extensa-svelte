import type { Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import type { Readable } from "svelte/store";
import { writable } from "svelte/store";
import { AUTH_SESSION_DURATION } from "../constants/ttl";
import { UI } from "../jsm";
import getIdentityProviderUrl from "../utils/dfinity/getIdentityProvider";
import { clearProjects } from "../utils/indexedDB/getSaveEmpty";
import loadWebGLUserData from "../utils/loadWebGLUserData";

export interface AuthStoreData {
    identity: Identity | undefined | null;
}

const createAuthClient = (): Promise<AuthClient> =>
    AuthClient.create({
        idleOptions: {
            disableIdle: true,
            disableDefaultIdleCallback: true,
        },
    });

let authClient: AuthClient | undefined | null;

export interface AuthStore extends Readable<AuthStoreData> {
    sync: () => Promise<void>;
    signIn: (onError: (error?: string) => void) => Promise<void>;
    mockLogin: () => Promise<void>;
    signOut: () => Promise<void>;
}

const initAuthStore = (): AuthStore => {
    const { subscribe, set, update } = writable<AuthStoreData>({
        identity: undefined,
    });

    return {
        subscribe,
        sync: async () => {
            authClient = authClient ?? (await createAuthClient());
            const isAuthenticated = await authClient?.isAuthenticated();

            if (isAuthenticated) {
                const principal = authClient?.getIdentity()?.getPrincipal()?.toString();
                loadWebGLUserData(principal);
            }

            set({
                identity: isAuthenticated ? authClient?.getIdentity() : null,
            });
        },
        mockLogin: async () => {
            update((state: AuthStoreData) => {
                const mockedUser = "test";
                loadWebGLUserData(mockedUser);

                return {
                    ...state,
                    identity: {
                        getPrincipal: () => mockedUser,
                    } as any
                }
            });
        },
        signIn: async (onError: (error?: string) => void) => {
            authClient = authClient ?? (await createAuthClient());

            // if (!isTestnet())
            // 	loginParams.derivationOrigin =
            // 		"https://qi7am-naaaa-aaaam-ab46a-cai.icp0.io";

            await authClient?.login({
                identityProvider: getIdentityProviderUrl(),
                maxTimeToLive: AUTH_SESSION_DURATION,
                onSuccess: () => {
                    update((state: AuthStoreData) => {
                        const principal = authClient?.getIdentity()?.getPrincipal()?.toString();
                        loadWebGLUserData(principal);

                        return {
                            ...state,
                            identity: authClient?.getIdentity(),
                        }
                    });
                },
                onError,
            });
        },

        signOut: async () => {
            const client: AuthClient = authClient ?? (await createAuthClient());

            // Clear all cached projects from the indexedDB.
            await clearProjects();

            await client.logout();

            UI.p.popup_account.f.button_logout();


            // We currently do not have issue because the all screen is reloaded after sign-out.
            // But, if we wouldn't, then agent-js auth client would not be able to process next sign-in if object would be still in memory with previous partial information. That's why we reset it.
            // This fix a "sign in -> sign out -> sign in again" flow without window reload.
            authClient = null;

            update((state: AuthStoreData) => ({
                ...state,
                identity: null,
            }));
        },
    };
};

export const authStore = initAuthStore();

export const authRemainingTimeStore = writable<number | undefined>(undefined);
