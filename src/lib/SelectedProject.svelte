<script lang="ts">
	import { VARCO } from "../VARCO/helpers/VARCO";
	import { EDITOR, PLY, UI } from "../jsm";
	import { projectStore } from "../store/ProjectStore";
	import EyeOffIcon from "/images/UI/eye-off.png";
	import EyeIcon from "/images/UI/eye.png";

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

{#if !!$projectStore.project}
	<div
		class="flex flex-col gap-3 fixed top-20 left-1/2 transform -translate-x-1/2 p-10 bg-neutral z-10 rounded-xl"
	>
		<div
			class="absolute top-4 right-4 cursor-pointer"
			on:click={onClose}
			role="button"
		>
			✕
		</div>
		<span class="font-semibold text-xl">{$projectStore.project?.name}</span>
		<div class="flex">
			{#if !$projectStore.is3DVisible}
				<img src={EyeIcon} alt="icon" on:click={onEyeClick} />
			{:else}
				<img src={EyeOffIcon} alt="eye-off" on:click={onEyeOffClick} />
			{/if}
		</div>
	</div>
{/if}

<style></style>
