<script lang="ts">
	import { authStore } from "../store/AuthStore";
	import ICP from "/images/blockchain/ICP.png";

	const signIn = async () => {
		await authStore.signIn((err) => console.error(err));
	};

	const logout = async () => {
		await authStore.signOut();
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
				{#if !$authStore.identity}
					<button class="btn btn-primary" on:click={signIn}>Login</button>
				{:else}
					<button class="btn btn-primary" on:click={logout}>Logout</button>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
</style>
