<script lang="ts">
	import { sendProjectWorker } from "../actions/sendProject.action";
	import { projectStore } from "../store/ProjectStore";
	import Modal from "./Modal.svelte";

	let showModal: boolean;

	const onModalClose = () => projectStore.setGeoAreaToEdit(null);
	$: showModal = !!$projectStore.geoAreaToEdit;

	const save = () => {
		sendProjectWorker.postMessage({
			msg: "executeSendProjectWorker",
			data: {
				file: JSON.stringify($projectStore.geoAreaToEdit?.projectsList[0]),
				geoAreaName: $projectStore.geoAreaToEdit?.geoAreaName,
				geoAreaCoords: $projectStore.geoAreaToEdit?.myCoords,
			},
		});
		onModalClose();
	};
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
	<button class="btn btn-primary" on:click={save}>Save</button>
</Modal>
