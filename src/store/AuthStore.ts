import type { Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import type { Readable } from "svelte/store";
import { writable } from "svelte/store";
import { VARCO } from "../VARCO/helpers/VARCO";
import { AUTH_SESSION_DURATION } from "../constants/ttl";
import { PLY, UI } from "../jsm/index.js";
import getIdentityProviderUrl from "../utils/getIdentityProvider";

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

            set({
                identity: isAuthenticated ? authClient?.getIdentity() : null,
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
                        if (principal) {
                            const accountToLoad = `USER_DB/${principal}.json`;
                            const _VARCO_F = VARCO.f as any;
                            _VARCO_F.loadJSON(
                                accountToLoad,
                                (logInData: any) => {
                                    if (UI.p.scene.OBJECTS.previewProject !== undefined) {
                                        _VARCO_F.deleteElement(UI.p.scene, UI.p.scene.OBJECTS.previewProject);
                                    }
                                    UI.p.popup_login_data.p.data = logInData;
                                    UI.p.menu_editor.f.open();
                                    PLY.p.geoMapSectors.oldSectHV = [0, 0];
                                },
                                () => alert('the account not exist')
                            );
                        }


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

            await client.logout();

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
