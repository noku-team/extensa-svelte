<script>
	import { onMount } from "svelte";
	import { Route, Router } from "svelte-routing";
	import ExtensaHeader from "./lib/Header.svelte";
	import Message from "./lib/Message.svelte";
	import User from "./lib/User.svelte";
	import WebGl from "./lib/WebGL.svelte";
	import { authStore } from "./store/AuthStore";

	export let url = "";

	onMount(() => {
		// Persist auth on page refresh
		authStore.sync();
	});
</script>

<Router {url}>
	<Message />
	<main class="font-inter">
		<div id="header">
			<ExtensaHeader />
		</div>
		<div id="body">
			<div>
				<Route path="/" component={WebGl} />
				<Route path="/login" component={User} />
			</div>
		</div>
		<div id="footer"></div>
		<div class="loading-overlay" class:active={true}>
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	</main>
</Router>

<style>
	.loading-overlay {
		display: none; /* Nasconde il layer di default */
		position: fixed; /* Posizionamento fisso rispetto alla viewport */
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background-color: rgba(
			63,
			55,
			55,
			0.5
		); /* Sfondo bianco semi-trasparente */
		z-index: 1000; /* Assicura che la schermata di loading sia sopra tutto */
	}
	.loading-overlay.active {
		display: flex; /* Mostra il layer quando attivo */
	}
</style>
