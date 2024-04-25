<script lang="ts">
	import { projectStore } from "../store/ProjectStore";
	import Modal from "./Modal.svelte";

	let showModal: boolean;

	const onModalClose = () => {
		projectStore.setGeoAreaToEdit(null);
	};

	$: {
		showModal = !!$projectStore.geoAreaToEdit;
	}
</script>

<Modal bind:showModal title="Edit project" onClose={onModalClose}>
	<div class="text-lg font-medium mb-1">Geoarea name</div>
	<div class="mb-2">{$projectStore.geoAreaToEdit?.geoAreaName}</div>
	<div>
		<div class="text-lg font-medium mb-1">Coordinates</div>
		<div class="mb-2">
			<span>LAT: {$projectStore.geoAreaToEdit?.myCoords?.lat}</span>
			<span>LNG: {$projectStore.geoAreaToEdit?.myCoords?.lng}</span>
		</div>
	</div>
    <button class="btn btn-primary">Save</button>
</Modal>
