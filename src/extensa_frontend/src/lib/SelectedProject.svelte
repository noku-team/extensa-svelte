<script lang="ts">
	import { EDITOR, UI } from "../jsm";
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

	// const onClose = () => {
	// 	projectStore.setProject(null);

	// 	UI.f.remove_menu_popups();

	// 	EDITOR.f.deselectProjects();

	// 	EDITOR.f.deselectGeoArea();

	// 	if (UI.p.scene.OBJECTS.previewProject !== undefined)
	// 		(VARCO.f as any).deleteElement(
	// 			UI.p.scene,
	// 			UI.p.scene.OBJECTS.previewProject
	// 		);

	// 	PLY.p.selectedProjectName = "";
	// 	projectStore.setProject(null);
	// 	PLY.p.selectedGeoAreaName = "";
	// };
</script>

{#if !!$projectStore.project}
	<div
		class="flex flex-col gap-3 fixed top-20 left-1/2 transform -translate-x-1/2 p-5 bg-base-100 z-10 rounded-xl justify-center items-center min-w-44"
	>
		<!-- <div
			class="absolute top-4 right-4 cursor-pointer"
			on:click={onClose}
			role="button"
		>
			✕
		</div> -->
		<span class="font-bold text-2xl"
			>{$projectStore.project?.name?.toUpperCase()}</span
		>
		<span>ID: {$projectStore.project.uuid}</span>
		<div class="flex">
			<button
				on:click={!$projectStore.project.is3DVisible
					? onEyeClick
					: onEyeOffClick}
				class="flex gap-2 items-center btn btn-primary"
			>
				<span
					>{!$projectStore.project.is3DVisible
						? "View project"
						: "Hide project"}</span
				>
				<img
					src={!$projectStore.project.is3DVisible ? EyeIcon : EyeOffIcon}
					alt="icon"
					class="cursor-pointer"
				/>
			</button>
		</div>
	</div>
{/if}

<style></style>
