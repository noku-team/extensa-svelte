<script>
	import { onMount } from "svelte";
	import { Route, Router } from "svelte-routing";
	import ExtensaHeader from "./lib/Header.svelte";
	import User from "./lib/User.svelte";
	import WebGl from "./lib/WebGL.svelte";
	import { authStore } from "./store/AuthStore";
	import { spinnerStore } from "./store/SpinnerStore";

	export let url = "";

	onMount(() => {
		// Persist auth on page refresh
		authStore.sync();
	});
</script>

<Router {url}>
	<main class="font-inter">
		<div id="header">
			<ExtensaHeader />
		</div>
		<div id="body">
			{#if $spinnerStore.isLoading}
				<div class="h-screen w-screen flex justify-center items-center bg-base-100 bg-opacity-10">
					<span class="loading loading-spinner loading-lg"></span>
				</div>
			{:else}
				<div>
					<Route path="/" component={WebGl} />
					<Route path="/login" component={User} />
				</div>
			{/if}
		</div>
		<div id="footer"></div>
	</main>
</Router>

<style>
</style>
