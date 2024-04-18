<script>
	import { Route, Router } from "svelte-routing";
	import ExtensaHeader from "./lib/Header.svelte";
	import User from "./lib/User.svelte";
	import WebGl from "./lib/WebGL.svelte";

	export let url = "";
</script>

<Router {url}>
	<main>
		<div id="header">
			<ExtensaHeader />
		</div>
		<div id="body">
			<div>
				<Route path="/">
					<WebGl />
				</Route>
				<Route path="/login">
					<User />
				</Route>
			</div>
		</div>
		<div id="footer"></div>
	</main>
</Router>

<style>
</style>
