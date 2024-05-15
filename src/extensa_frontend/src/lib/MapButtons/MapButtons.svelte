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

	type ActiveId =
		| "Move"
		| "Drop"
		| "Enlarge"
		| "Rotate"
		| "Folder"
		| "Settings";
	let activeId: ActiveId | null = null;

	const toggleActive = (id: ActiveId) => {
		if (activeId === id) activeId = null;
		else activeId = id;

		switch (id) {
			case "Drop":
				UI.p.menu_editor.f.button_import();
				break;
			case "Folder":
				console.warn("Not implemented yet!");
				break;
			case "Enlarge":
				UI.p.menu_editor.f.DRAG();
				break;
			case "Rotate":
				UI.p.menu_editor.f.ROTATE();
				break;
			case "Move":
				UI.p.menu_editor.f.SCALE();
				break;
			case "Settings":
				UI.p.menu_editor.f.TOOLS();
				break;
		}
	};
</script>

{#if $authStore.identity}
	<div
		class="fixed left-2 top-1/2 transform -translate-y-1/2 z-[1000] flex flex-col gap-1"
	>
		<Button
			src={Drop}
			alt="Drop"
			active={activeId === "Drop"}
			toggleActive={() => toggleActive("Drop")}
		/>
		<Button
			src={Folder}
			alt="Folder"
			active={activeId === "Folder"}
			toggleActive={() => toggleActive("Folder")}
			disabled
		/>
		<Button
			disabled={!$projectStore.project && !PLY.p.selectedArea}
			src={Rotate}
			alt="Rotate"
			active={activeId === "Rotate"}
			toggleActive={() => toggleActive("Rotate")}
		/>
		<Button
			disabled={!$projectStore.project && !PLY.p.selectedArea}
			src={Move}
			alt="Move"
			active={activeId === "Move"}
			toggleActive={() => toggleActive("Move")}
		/>
		<Button
			disabled={!$projectStore.project && !PLY.p.selectedArea}
			src={Enlarge}
			alt="Enlarge"
			active={activeId === "Enlarge"}
			toggleActive={() => toggleActive("Enlarge")}
		/>
		<Button
			disabled={!$projectStore.project && !PLY.p.selectedArea}
			src={Settings}
			alt="Settings"
			active={activeId === "Settings"}
			toggleActive={() => toggleActive("Settings")}
		/>
	</div>
{/if}
