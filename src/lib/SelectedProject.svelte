<script lang="ts">
	import { VARCO } from "../VARCO/helpers/VARCO";
	import { EDITOR, PLY, UI } from "../jsm";
	import { projectStore } from "../store/ProjectStore";
	import Modal from "./Modal.svelte";
	import EyeOffIcon from "/images/UI/eye-off.png";
	import EyeIcon from "/images/UI/eye.png";

	let showModal = false;

	$: showModal = !!$projectStore.project;

	const onEyeClick = () => {
		EDITOR.f.loadProjectData();
		projectStore.set3DVisible(true);
	};
	const onEyeOffClick = () => {
		UI.p.previewProject.f.button_removeProject();
		projectStore.set3DVisible(false);
	};

	const onClose = () => {
		projectStore.setProject(null);

		UI.f.remove_menu_popups();

		EDITOR.f.deselectProjects();

		EDITOR.f.deselectGeoArea();

		if (UI.p.scene.OBJECTS.previewProject !== undefined)
			(VARCO.f as any).deleteElement(
				UI.p.scene,
				UI.p.scene.OBJECTS.previewProject
			);

		PLY.p.selectedProjectName = "";
		projectStore.setProject(null);
		PLY.p.selectedGeoAreaName = "";
	};
</script>

<Modal top bind:showModal title="Project" {onClose}>
	<div class="flex flex-col gap-3">
		<span class="font-semibold text-xl">{$projectStore.project?.name}</span>
		<div class="flex">
			{#if !$projectStore.is3DVisible}
				<img src={EyeIcon} alt="icon" on:click={onEyeClick} />
			{:else}
				<img src={EyeOffIcon} alt="eye-off" on:click={onEyeOffClick} />
			{/if}
		</div>
	</div>
</Modal>

<style></style>
