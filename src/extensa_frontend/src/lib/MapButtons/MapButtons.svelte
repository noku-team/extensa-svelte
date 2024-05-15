<script lang="ts">
	import { UI } from "../../jsm";
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
			case "Move":
				console.log("Move");
				break;
			case "Drop":
				UI.p.menu_area_button_dragAndDrop();
				break;
			case "Enlarge":
				console.log("Enlarge");
				break;
			case "Rotate":
				console.log("Rotate");
				break;
			case "Folder":
				console.log("Folder");
				break;
			case "Settings":
				console.log("Settings");
				break;
		}
	};
</script>

<div
	class="fixed left-24 top-1/2 transform -translate-y-1/2 z-[1000] flex flex-col gap-1"
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
	/>
	<Button
		src={Enlarge}
		alt="Enlarge"
		active={activeId === "Enlarge"}
		toggleActive={() => toggleActive("Enlarge")}
	/>
	<Button
		src={Rotate}
		alt="Rotate"
		active={activeId === "Rotate"}
		toggleActive={() => toggleActive("Rotate")}
	/>
	<Button
		src={Move}
		alt="Move"
		active={activeId === "Move"}
		toggleActive={() => toggleActive("Move")}
	/>
	<Button
		src={Settings}
		alt="Settings"
		active={activeId === "Settings"}
		toggleActive={() => toggleActive("Settings")}
	/>
</div>
