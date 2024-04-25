<script lang="ts">
	import cx from "classnames";
	import { UI } from "../jsm";
	import Modal from "./Modal.svelte";

	export let showModal: boolean;

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
			const gMapsService = new window.google.maps.places.AutocompleteService();
			gMapsService.getQueryPredictions(
				{
					input: value,
				},
				(result) => {
					const formattedPlaces = (result ?? []).map((r) => r.description);
					autocompleteItems = formattedPlaces;
				}
			);
		} else {
			autocompleteItems = [];
		}
	};
</script>

<Modal bind:showModal title="Search location" onClose={onModalClose}>
	<div class="flex gap-3">
		<div class="dropdown flex-1">
			<input
				type="text"
				placeholder="Type your location here"
				class="input input-bordered flex-1 w-full"
				bind:value={searchText}
				on:input={autocomplete}
			/>
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			{#if autocompleteItems.length > 0}
				<ul
					tabindex="0"
					class="dropdown-content z-[1] menu shadow bg-base-100 w-full rounded-box e flex-nowrap overflow-auto"
				>
					{#each autocompleteItems as item}
						<li>
							<!-- svelte-ignore a11y-missing-attribute -->
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<a on:click|preventDefault={() => onItemClicked(item)}>{item}</a>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
		<button class="btn btn-primary" on:click={onSearch}>SEARCH</button>
	</div>
	<div
		class={cx({
			"h-56": autocompleteItems.length > 0,
		})}
	/>
</Modal>
