<script>
	import { Link } from "svelte-routing";
	import { authStore } from "../store/AuthStore";
	import ExtensaLogo from "/images/UI/Logo_Extensa_2.png";
	import ProfilePicture from "/images/UI/profile.png";
	import ICP from "/images/blockchain/ICP.png";

	const signIn = async () => {
		await authStore.signIn((err) => console.error(err));
	};

	const logout = async () => {
		await authStore.signOut();
	};
</script>

<div class="navbar bg-base-100">
	<div class="navbar-start">
		<div class="dropdown" style="z-index: 11">
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
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<ul
				tabindex="0"
				class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
			>
				<!-- svelte-ignore a11y-missing-attribute -->
				<li><Link to="/">Homepage</Link></li>
				<!-- svelte-ignore a11y-missing-attribute -->
				<li><Link to="/login">Login</Link></li>
			</ul>
		</div>
	</div>
	<div class="navbar-center">
		<!-- svelte-ignore a11y-missing-attribute -->
		<a class="btn btn-ghost text-xl">
			<img src={ExtensaLogo} alt="Extensa Logo" class="h-10" />
		</a>
	</div>
	<div class="navbar-end">
		<div class="dropdown dropdown-end" style="z-index: 11">
			<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
				<div class="w-10 rounded-full">
					<img alt="Tailwind CSS Navbar component" src={ProfilePicture} />
				</div>
			</div>
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<ul
				tabindex="0"
				class="menu menu-sm dropdown-content mt-3 z-[1] p-5 shadow bg-base-100 rounded-box w-80"
			>
				{#if $authStore.identity}
					<div class="flex flex-col mb-5">
						<span class="text-lg font-semibold">Your principal: </span>
						<span>{$authStore.identity?.getPrincipal()?.toString()}</span>
					</div>
				{/if}
				<li>
					{#if !$authStore.identity}
						<button
							class="btn btn-primary btn-sm flex justify-center items-center"
							on:click={signIn}
						>
							<img src={ICP} alt="ICP" width="30" />
							<span>Login</span>
						</button>
					{:else}
						<button class="btn btn-primary btn-sm" on:click={logout}
							>Logout</button
						>
					{/if}
				</li>
			</ul>
		</div>
	</div>
</div>

<style>
</style>
