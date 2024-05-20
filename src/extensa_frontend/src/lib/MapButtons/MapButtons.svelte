<script lang="ts">
	import { PLY, UI } from "../../jsm";
	import { authStore } from "../../store/AuthStore";
	import { projectStore } from "../../store/ProjectStore";
	import Button from "./Button.svelte";
	import Drop from "/images/UI/buttons/Arhive_load.png";
	import Enlarge from "/images/UI/buttons/Center_pick_alt.png";
	import Folder from "/images/UI/buttons/Folder_alt.png";
	import Move from "/images/UI/buttons/Move.png";
	import Rotate from "/images/UI/buttons/circle_left.png";
	import Settings from "/images/UI/buttons/settings.png";

	type ActiveId = "Move" | "Drop" | "Enlarge" | "Rotate" | "Folder" | "Settings";

	let activeId: ActiveId | null = null;

	const buttons = [
		{ src: Drop, alt: "Drop", id: "Drop" },
		{ src: Folder, alt: "Folder", id: "Folder", disabled: true },
		{ src: Rotate, alt: "Rotate", id: "Rotate" },
		{ src: Move, alt: "Move", id: "Move" },
		{ src: Enlarge, alt: "Enlarge", id: "Enlarge" },
		{ src: Settings, alt: "Settings", id: "Settings" },
	];

	const toggleActive = (id: ActiveId) => {
		activeId = activeId === id ? null : id;

		switch (id) {
			case "Drop":
				UI.p.menu_editor.f.button_import();
				break;
			case "Folder":
				console.warn("Not implemented yet!");
				break;
			case "Enlarge":
				UI.p.menu_editor.f.SCALE();
				break;
			case "Rotate":
				UI.p.menu_editor.f.ROTATE();
				break;
			case "Move":
				UI.p.menu_editor.f.DRAG();
				break;
			case "Settings":
				UI.p.menu_editor.f.TOOLS();
				break;
		}
	};
</script>

{#if $authStore.identity}
	<div class="fixed left-2 top-1/2 transform -translate-y-1/2 z-[1000] flex flex-col gap-1">
		{#each buttons as { src, alt, id, disabled = false }}
			<Button
				{src}
				{alt}
				active={activeId === id}
				toggleActive={() => toggleActive(id)}
				deselectBtn={() => (activeId = null)}
				disabled={!disabled && !$projectStore.project && !PLY.p.selectedArea}
			/>
		{/each}
	</div>
{/if}