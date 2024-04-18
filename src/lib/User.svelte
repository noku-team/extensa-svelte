<script lang="ts">
	import { authStore } from "../store/AuthStore";
	import ICP from "/images/blockchain/ICP.png";

	const signIn = async () => {
		await authStore.signIn((err) => console.error(err));
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
				<button class="btn btn-primary" on:click={signIn}
					>Login</button
				>
			</div>
		</div>
	</div>
</div>

<style>
</style>
