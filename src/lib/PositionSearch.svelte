<script lang="ts">
	import { UI } from "../jsm";
	import Modal from "./Modal.svelte";

	export let showModal: boolean;

	let searchText = "";

	const onModalClose = () => {
		searchText = "";
	};

	const onSearch = () => {
		UI.f.goToAddressCoords(searchText);
	};
</script>

<Modal bind:showModal title="Search location" onClose={onModalClose}>
	<div class="flex gap-3">
		<input
			bind:value={searchText}
			type="text"
			placeholder="Search here..."
			class="input input-bordered w-full"
		/>
		<button class="btn btn-primary" on:click={onSearch}>search</button>
	</div>
</Modal>
