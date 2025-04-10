<script lang="ts">
	import { sendProjectWorker } from "../actions/sendProject.action";
	import { authStore } from "../store/AuthStore";
	import { messageStore } from "../store/MessageStore";
	import { projectStore } from "../store/ProjectStore";
	import { spinnerStore } from "../store/SpinnerStore";
	import executeEditGeoarea from "../utils/dfinity/geoareas/methods/editGeoarea";
	import executeEditProject from "../utils/dfinity/geoareas/methods/editProject";
	import Modal from "./Modal.svelte";

	let showModal: boolean;

	const onModalClose = () => projectStore.setGeoAreaToEdit(null);
	$: showModal = !!$projectStore.geoAreaToEdit;

	const save = async () => {
		try {
			const geoAreaCopy = $projectStore?.geoAreaToEdit ? { ...$projectStore.geoAreaToEdit } : {};
			if (
				geoAreaCopy?.id &&
				geoAreaCopy?.projectsList?.[0]?.id &&
				geoAreaCopy?.geoAreaName &&
				geoAreaCopy?.myCoords
			) {
				if ($authStore.identity && process.env.CANISTER_ID_EXTENSA_BACKEND) {
					projectStore.setGeoAreaToEdit(null);
					spinnerStore.setLoading(true);
						
					await executeEditProject({
						identity: $authStore.identity,
						canisterId: process.env.CANISTER_ID_EXTENSA_BACKEND,
						geoareaId: BigInt(geoAreaCopy.id),
						projectId: geoAreaCopy.projectsList[0].id,
						type: geoAreaCopy?.projectsList[0].type ?? "---",
						name: geoAreaCopy?.projectsList[0].name,
						position: geoAreaCopy?.projectsList[0].myPosition,
						orientation:
						geoAreaCopy?.projectsList[0].myOrientation,
						size: geoAreaCopy?.projectsList[0].mySize,
						fileId: geoAreaCopy?.projectsList[0].file_id,
					});

					await executeEditGeoarea({
						identity: $authStore.identity,
						canisterId: process.env.CANISTER_ID_EXTENSA_BACKEND,
						id: BigInt(geoAreaCopy.id),
						name: geoAreaCopy.geoAreaName,
						coords: geoAreaCopy.myCoords,
					});

					spinnerStore.setLoading(false);
					messageStore.setMessage("Project saved successfully", "success");
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
		} catch (e) {
			console.error("Error while saving project", e);
		} finally {
			spinnerStore.setLoading(false);
		}
	};
</script>

<Modal
	id="modal-edit-project"
	bind:showModal
	title="Edit Project"
	onClose={onModalClose}
>
	<div class="space-y-6">
		<div class="space-y-2">
			<div class="text-white/60 text-sm uppercase tracking-wider">Geographic Area Name</div>
			<div class="bg-white/5 p-3 rounded border border-white/10 text-white">
				{$projectStore.geoAreaToEdit?.geoAreaName || '-'}
			</div>
		</div>
		
		<div class="space-y-2">
			<div class="text-white/60 text-sm uppercase tracking-wider">Coordinates</div>
			<div class="grid grid-cols-2 gap-2">
				<div class="bg-white/5 p-3 rounded border border-white/10 text-white">
					<span class="text-white/60 mr-1">LAT:</span>
					<span>{$projectStore.geoAreaToEdit?.myCoords?.lat || '-'}</span>
				</div>
				<div class="bg-white/5 p-3 rounded border border-white/10 text-white">
					<span class="text-white/60 mr-1">LNG:</span> 
					<span>{$projectStore.geoAreaToEdit?.myCoords?.lng || '-'}</span>
				</div>
			</div>
		</div>
		
		<div class="flex justify-end pt-2">
			<button 
				class="bg-white hover:bg-white/90 text-black px-4 py-2 rounded-md transition-colors font-medium flex items-center gap-2" 
				on:click={save}
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
				</svg>
				Save Changes
			</button>
		</div>
	</div>
</Modal>
