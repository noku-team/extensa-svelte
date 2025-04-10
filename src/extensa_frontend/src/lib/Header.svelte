<script lang="ts">
	import cx from "classnames";
	import { useRouter } from "svelte-routing";
	import { authStore } from "../store/AuthStore";
	import PositionSearch from "./PositionSearch.svelte";
	import ProfilePicture from "/images/UI/profile.png";
	import ICP from "/images/blockchain/ICP.png";
	import ExtensaLogo from "/images/logo_white.png";

	let currentRoute = "";

	const signIn = async () => {
		// await authStore.mockLogin();
		await authStore.signIn((err) => console.error(err));
	};
	const logout = async () => await authStore.signOut();

	const router = useRouter();

	router.activeRoute.subscribe((route) => {
		currentRoute = route?.route?.path || "";
	});

	// Search modal
	let showModal = false;
	const toggleModal = () => {
		showModal = true;
	};
</script>

<!-- <div class="dropdown" style="z-index: 11">
	<div tabindex="0" role="button" class="btn btn-ghost btn-circle">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-5 w-5"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 6h16M4 12h16M4 18h7"
			/></svg
		>
	</div>
	<ul
		tabindex="0"
		class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
	>
		<li><Link to="/">Homepage</Link></li>
		<li><Link to="/login">Login</Link></li>
	</ul>
</div> -->

<div class="navbar bg-black/90 backdrop-blur-sm border-b border-white/10 shadow-md sticky top-0 z-50">
	<div class="navbar-start">
		<div></div>
	</div>
	<div class="navbar-center">
		<!-- svelte-ignore a11y-missing-attribute -->
		<a class="flex items-center">
			<img src={ExtensaLogo} alt="Extensa Logo" class="h-10" />
		</a>
	</div>
	<div class="navbar-end">
		{#if currentRoute === "/"}
			<button class="btn btn-ghost btn-circle text-white hover:bg-white/10 transition-colors mr-2" on:click={toggleModal}>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</button>
		{/if}
		
		<div class="dropdown dropdown-end" style="z-index: 11">
			<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar p-1 border border-white/20">
				<div class="w-10 rounded-full overflow-hidden bg-black">
					<img
						alt="Profile"
						src={ProfilePicture}
						class={cx({
							"grayscale opacity-50": !$authStore.identity,
							"hover:opacity-90 transition-opacity": true
						})}
					/>
				</div>
			</div>
			
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<ul tabindex="0" class="menu dropdown-content mt-3 z-[1] shadow-lg rounded-lg overflow-hidden bg-black/90 backdrop-blur-sm border border-white/10 w-80">
				<div class="p-5">
					{#if $authStore.identity}
						<div class="space-y-1 mb-5">
							<span class="text-white/60 text-sm uppercase tracking-wider">Your principal:</span>
							<div class="bg-white/5 p-2 rounded border border-white/10 text-white text-sm font-mono overflow-hidden overflow-ellipsis">
								{$authStore.identity?.getPrincipal()?.toString()}
							</div>
						</div>
					{/if}
					
					<div>
						{#if !$authStore.identity}
							<button
								class="bg-white hover:bg-white/90 text-black py-2 px-4 rounded w-full transition-colors flex justify-center items-center gap-2"
								on:click={signIn}
							>
								<img src={ICP} alt="ICP" width="24" height="24" />
								<span class="font-medium">Sign In</span>
							</button>
						{:else}
							<button 
								class="bg-black hover:bg-white/10 text-white border border-white/30 py-2 px-4 rounded w-full transition-colors"
								on:click={logout}
							>
								Sign Out
							</button>
						{/if}
					</div>
				</div>
			</ul>
		</div>
	</div>
	<PositionSearch bind:showModal />
</div>

<style>
	/* No additional styles needed - using Tailwind */
</style>
