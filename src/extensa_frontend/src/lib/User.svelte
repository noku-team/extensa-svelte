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

<div class="flex justify-center items-center min-h-[60vh]">
	<div class="bg-black/80 border border-white/20 rounded-lg shadow-2xl p-8 max-w-md w-full backdrop-blur-sm">
		<div class="flex flex-col items-center">
			<div class="w-24 h-24 mb-6 bg-black p-3 rounded-full border border-white/20 flex items-center justify-center">
				<img src={ICP} alt="Internet Computer" class="w-full h-full object-contain" />
			</div>
			
			<h2 class="text-white text-2xl font-bold mb-2">Internet Identity</h2>
			<p class="text-white/70 text-center mb-8">Accedi con la tua Internet Identity per visualizzare più contenuti e utilizzare tutte le funzionalità di Extensa</p>
			
			<div class="w-full">
				{#if !$authStore.identity}
					<button 
						class="w-full bg-white hover:bg-white/90 text-black py-3 px-6 rounded-md transition-colors font-medium flex items-center justify-center gap-2"
						on:click={signIn}
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-1l1-1 1-1 .293-.293A6.001 6.001 0 0118 8zm-6-4a1 1 0 00-1 1v3a1 1 0 002 0V5a1 1 0 00-1-1z" clip-rule="evenodd" />
						</svg>
						Accedi
					</button>
				{:else}
					<div class="space-y-4">
						<div class="bg-white/5 p-3 rounded border border-white/10 text-white font-mono text-sm overflow-hidden overflow-ellipsis">
							{$authStore.identity?.getPrincipal()?.toString()}
						</div>
						<button 
							class="w-full bg-black hover:bg-white/10 text-white border border-white/30 py-3 px-6 rounded-md transition-colors font-medium"
							on:click={logout}
						>
							Disconnetti
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
</style>
