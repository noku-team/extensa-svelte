<script>
	import { onMount } from "svelte";
	import { Route, Router } from "svelte-routing";
	import ExtensaHeader from "./lib/Header.svelte";
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
	<main>
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
	</main>
</Router>

<style>
</style>
