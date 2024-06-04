<script lang="ts">
	import { UI } from "../jsm";
	import Button from "./MapButtons/Button.svelte";
	import GIS from "/images/UI/button_GIS.png";
	import MAP from "/images/UI/button_GM.png";
	import SATELLITE from "/images/UI/button_OSM.png";
	import THREESIXTY from "/images/UI/button_stv.png";

	type ActiveId = "GIS" | "satellite" | "map" | "threesixty";

	let activeId: ActiveId[] = ["map"];

	enum ButtonType {
		GIS = "GIS",
		satellite = "satellite",
		map = "map",
		threesixty = "threesixty",
	}
	$: buttons = [
		{
			src: GIS,
			alt: "gis",
			id: ButtonType.GIS,
			enabled: true,
		},
		{
			src: SATELLITE,
			alt: "satellite",
			id: ButtonType.satellite,
			enabled: true,
		},
		{
			src: MAP,
			alt: "map",
			id: ButtonType.map,
			enabled: true,
		},
		{
			src: THREESIXTY,
			alt: "360",
			id: ButtonType.threesixty,
			enabled: true,
		},
	];

	const toggleActive = (id: ActiveId) => {
		if (id === "threesixty") {
			if (activeId.includes("threesixty")) {
				activeId = activeId.filter((item) => item !== "threesixty");
			} else activeId = activeId.concat(id);
		} else {
			if (activeId.includes("threesixty")) activeId = ["threesixty", id];
			else activeId = [id];
		}

		switch (id) {
			case "GIS":
				UI.p.menu_bottom.f.button_GIS();
				break;
			case "satellite":
				UI.p.menu_bottom.f.button_GM();
				break;
			case "map":
				UI.p.menu_bottom.f.button_OSM();
				break;
			case "threesixty":
				UI.p.menu_bottom.f.button_STV_desktop();
				break;
		}
	};
</script>

<div class="fixed right-2 top-[60%] z-[1000] flex flex-col gap-1">
	{#each buttons as { src, alt, id, enabled = true }}
		<Button
			{src}
			{alt}
			active={activeId.includes(id)}
			toggleActive={() => toggleActive(id)}
			disabled={!enabled}
		/>
	{/each}
</div>
