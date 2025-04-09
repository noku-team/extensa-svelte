<script lang="ts">
	import cx from "classnames";
	import { UI } from "../jsm";
	import Modal from "./Modal.svelte";

	export let showModal: boolean;

	type GMapsResult = {
		description: string;
	};

	let searchText = "";
	let autocompleteItems: string[] = [];

	const onModalClose = () => {
		searchText = "";
	};

	const onSearch = () => {
		UI.f.goToAddressCoords(searchText);
	};

	const onItemClicked = (item: string) => {
		searchText = item;
	};

	const autocomplete = (e: any) => {
		const { value } = e.target as HTMLInputElement;

		if (value) {
			const gMapsService = new (
				window as any
			).google.maps.places.AutocompleteService();
			gMapsService.getQueryPredictions(
				{
					input: value,
				},
				(result: GMapsResult[]) => {
					const formattedPlaces = (result ?? []).map((r) => r.description);
					autocompleteItems = formattedPlaces;
				}
			);
		} else {
			autocompleteItems = [];
		}
	};
</script>

<Modal
	id="modal-position-search"
	bind:showModal
	title="Cerca posizione"
	onClose={onModalClose}
>
	<div class="flex flex-col">
		<div class="relative flex-1">
			<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</div>
			
			<input
				type="text"
				placeholder="Inserisci la posizione da cercare"
				class="bg-white/5 border border-white/20 focus:border-white/50 focus:outline-none text-white w-full py-3 pl-10 pr-16 rounded-md transition-colors"
				bind:value={searchText}
				on:input={autocomplete}
			/>
			
			<button 
				class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white text-black px-3 py-1 rounded font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
				on:click={onSearch} 
				disabled={!searchText}
			>
				Cerca
			</button>
		</div>
		
		<!-- Autocomplete dropdown -->
		{#if autocompleteItems.length > 0}
			<div class="mt-2 bg-black/90 border border-white/20 rounded-md max-h-56 overflow-y-auto">
				<ul class="py-1">
					{#each autocompleteItems as item}
						<li>
							<!-- svelte-ignore a11y-missing-attribute -->
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<a 
								on:click|preventDefault={() => onItemClicked(item)}
								class="block px-4 py-2 text-white hover:bg-white/10 cursor-pointer truncate text-sm transition-colors"
							>
								{item}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</Modal>
