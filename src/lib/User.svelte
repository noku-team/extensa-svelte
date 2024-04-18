<script lang="ts">
	import { AuthClient } from "@dfinity/auth-client";
	import { AUTH_SESSION_DURATION } from "../constants/ttl";
	import getIdentityProviderUrl from "../utils/getIdentityProvider";
	import logWithTimestamp from "../utils/logWithTimestamp";
	import ICP from "/images/blockchain/ICP.svg";

	let authClient: AuthClient | undefined | null;

	const createAuthClient = (): Promise<AuthClient> =>
		AuthClient.create({
			idleOptions: {
				disableIdle: true,
				disableDefaultIdleCallback: true,
			},
		});

	const internetIdentityLogin = async () => {
		authClient = authClient ?? (await createAuthClient());

		const loginParams: {
			identityProvider?: string | URL;
			maxTimeToLive?: bigint;
			derivationOrigin?: string | URL;
			windowOpenerFeatures?: string;
			onSuccess?: (() => void) | (() => Promise<void>);
			onError?:
				| ((error?: string) => void)
				| ((error?: string) => Promise<string>);
		} = {
			identityProvider: getIdentityProviderUrl(),
			maxTimeToLive: AUTH_SESSION_DURATION,
			onSuccess: () => {
				const identity = authClient?.getIdentity();
				// setIdentity(identity);
			},
			onError: (e) => console.error(e),
		};

		// if (!isTestnet())
		// 	loginParams.derivationOrigin =
		// 		"https://qi7am-naaaa-aaaam-ab46a-cai.icp0.io";
		await authClient?.login(loginParams);
	};

	const internetIdentityLogout = async () => {
		logWithTimestamp(authClient);
		const client: AuthClient = authClient ?? (await createAuthClient());
		await client.logout();

		authClient = null;

		// setIdentity(null);
	};

	const internetIdentitySync = async () => {
		authClient = authClient ?? (await createAuthClient());
		const isAuthenticated = await authClient.isAuthenticated();
		// setIdentity(isAuthenticated ? authClient.getIdentity() : null);
	};
</script>

<div class="flex justify-center">
	<div class="card w-96 bg-base-100 shadow-xl mt-10">
		<figure>
			<img src={ICP} alt="ICP" />
		</figure>
		<div class="card-body">
			<h2 class="card-title">Internet Identity</h2>
			<p>Login with your Internet Identity to see more contents</p>
			<div class="card-actions justify-end">
				<button class="btn btn-primary" on:click={internetIdentityLogin}
					>Login</button
				>
			</div>
		</div>
	</div>
</div>

<style>
</style>
