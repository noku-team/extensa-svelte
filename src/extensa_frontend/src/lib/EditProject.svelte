<script lang="ts">
	import { sendProjectWorker } from "../actions/sendProject.action";
	import { authStore } from "../store/AuthStore";
	import { projectStore } from "../store/ProjectStore";
	import { spinnerStore } from "../store/SpinnerStore";
	import executeEditGeoarea from "../utils/dfinity/geoareas/methods/editGeoarea";
	import executeEditProject from "../utils/dfinity/geoareas/methods/editProject";
	import Modal from "./Modal.svelte";

	let showModal: boolean;

	const onModalClose = () => projectStore.setGeoAreaToEdit(null);
	$: showModal = !!$projectStore.geoAreaToEdit;

	const save = async () => {
		if (
			$projectStore?.geoAreaToEdit?.id &&
			$projectStore?.geoAreaToEdit.projectsList[0].id
		) {
			if ($authStore.identity && process.env.CANISTER_ID_EXTENSA_BACKEND) {
				spinnerStore.setLoading(true);
				await executeEditProject({
					identity: $authStore.identity,
					canisterId: process.env.CANISTER_ID_EXTENSA_BACKEND,
					geoareaId: BigInt($projectStore.geoAreaToEdit.id),
					projectId: $projectStore?.geoAreaToEdit.projectsList[0].id,
					type: $projectStore?.geoAreaToEdit.projectsList[0].type ?? "---",
					name: $projectStore?.geoAreaToEdit.projectsList[0].name,
					position: $projectStore?.geoAreaToEdit.projectsList[0].myPosition,
					orientation:
						$projectStore?.geoAreaToEdit.projectsList[0].myOrientation,
					size: $projectStore?.geoAreaToEdit.projectsList[0].mySize,
					fileId: $projectStore?.geoAreaToEdit.projectsList[0].file_id,
				});

				await executeEditGeoarea({
					identity: $authStore.identity,
					canisterId: process.env.CANISTER_ID_EXTENSA_BACKEND,
					id: BigInt($projectStore.geoAreaToEdit.id),
					name: $projectStore.geoAreaToEdit.geoAreaName,
					coords: $projectStore.geoAreaToEdit.myCoords,
				});

				spinnerStore.setLoading(false);
			}
		} else {
			sendProjectWorker.postMessage({
				msg: "executeSendProjectWorker",
				data: {
					file: JSON.stringify($projectStore.geoAreaToEdit?.projectsList[0]),
					geoAreaName: $projectStore.geoAreaToEdit?.geoAreaName,
					geoAreaCoords: $projectStore.geoAreaToEdit?.myCoords,
				},
			});
		}

		onModalClose();
	};
</script>

<Modal
	id="modal-edit-project"
	showModal={true}
	title="Edit project"
	onClose={onModalClose}
>
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
