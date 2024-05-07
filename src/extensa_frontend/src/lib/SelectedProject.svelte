<script lang="ts">
	import { VARCO } from "../VARCO/helpers/VARCO";
	import { EDITOR, PLY, UI } from "../jsm";
	import { authStore } from "../store/AuthStore";
	import { projectStore } from "../store/ProjectStore";
	import EyeOffIcon from "/images/UI/eye-off.png";
	import EyeIcon from "/images/UI/eye.png";

	const onEyeClick = async () => {
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
		class="
		flex
		flex-col gap-3 fixed top-20 left-1/2 transform -translate-x-1/2 p-5 bg-base-100 z-10 rounded-xl justify-center items-center min-w-44 max-w-72 overflow-hidden"
	>
		{#if $authStore.identity}
			<div class="w-full flex justify-end">
				<button
					class="btn btn-circle cursor-pointer btn-sm"
					on:click={onClose}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/></svg
					>
				</button>
			</div>
		{/if}
		<span class="font-bold text-2xl truncate max-w-full"
			>{$projectStore.project?.name?.toUpperCase()}</span
		>
		<span>ID: {$projectStore.project.uuid}</span>
		<div class="flex">
			<button
				disabled={$projectStore.project.notYetSaved}
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
