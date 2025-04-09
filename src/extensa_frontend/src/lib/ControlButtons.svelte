<script lang="ts">
	import { UI } from "../jsm";
	import Button from "./MapButtons/Button.svelte";
	import THREESIXTY from "/images/UI/icons/360.png";
	import GIS from "/images/UI/icons/gis.png";
	import MAP from "/images/UI/icons/map.png";
	import SATELLITE from "/images/UI/icons/tree.png";

	type ActiveId = "GIS" | "satellite" | "map" | "threesixty";

	let activeId: ActiveId[] = ["map"];

	enum ButtonType {
		GIS = "GIS",
		satellite = "satellite",
		map = "map",
		threesixty = "threesixty",
	}
	
	// Tooltips for each button to make their function clear
	const tooltips = {
		[ButtonType.GIS]: "Vista GIS",
		[ButtonType.satellite]: "Vista satellite",
		[ButtonType.map]: "Vista mappa standard",
		[ButtonType.threesixty]: "Vista 360°",
	};
	
	$: buttons = [
		{
			src: GIS,
			alt: "GIS",
			id: ButtonType.GIS,
			enabled: true,
			tooltip: tooltips[ButtonType.GIS],
		},
		{
			src: SATELLITE,
			alt: "Satellite",
			id: ButtonType.satellite,
			enabled: true,
			tooltip: tooltips[ButtonType.satellite],
		},
		{
			src: MAP,
			alt: "Mappa",
			id: ButtonType.map,
			enabled: true,
			tooltip: tooltips[ButtonType.map],
		},
		{
			src: THREESIXTY,
			alt: "Vista 360°",
			id: ButtonType.threesixty,
			enabled: true,
			tooltip: tooltips[ButtonType.threesixty],
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

<div class="fixed right-6 bottom-36 z-[1000]">
	<div class="bg-black/70 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-white/10">
		<div class="flex flex-col gap-2">
			{#each buttons as { src, alt, id, enabled = true, tooltip }}
				<div class="relative group">
					<Button
						{src}
						{alt}
						active={activeId.includes(id)}
						toggleActive={() => toggleActive(id)}
						disabled={!enabled}
						className="bg-black border-white/30 hover:border-white w-10 !h-10 min-h-0 aspect-square"
						imgClassName="w-5 h-5"
					/>
					<div class="absolute right-full top-1/2 -translate-y-1/2 mr-4 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
						{tooltip}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	@keyframes pulse {
		0%, 100% {
			opacity: 0.5;
		}
		50% {
			opacity: 1;
		}
	}
	
	:global(.animate-pulse) {
		animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
	
	:global(.btn-primary) {
		@apply bg-white text-black border-white !important;
	}
	
	:global(.btn-neutral) {
		@apply bg-black text-white border-white/30 !important;
	}
</style>
