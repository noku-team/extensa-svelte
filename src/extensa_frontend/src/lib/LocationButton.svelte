<script lang="ts">
	import { PLY, UI } from "../jsm";
	import Button from "./MapButtons/Button.svelte";
	import Sync from "./icons/Sync.svelte";
	import EYE from "/images/UI/icons/eye.png";
	import GPS from "/images/UI/icons/pin.png";

	export let toggleGpsView: () => void;
	// GPS
	// EYE
	type ActiveId = "GPS" | "EYE";

	// init 3d is visible
	const url = new URL(window.location.href);
	const params = new URLSearchParams(url.search);

	const isARActive = params.get("ar");
	const project = params.get("project");

	const isARBtnVisible = isARActive === "true" && !!project;

	let activeId: ActiveId[] = [];

	let iconColor: string = "#FFFFFF";

	enum ButtonType {
		GPS = "GPS",
		EYE = "EYE",
	}

	const buttons = [
		{
			src: GPS,
			alt: "GPS",
			id: ButtonType.GPS,
			enabled: true,
			tooltip: "Attiva localizzazione GPS",
		},
		{
			src: EYE,
			alt: "Vista 3D",
			id: ButtonType.EYE,
			enabled: true,
			tooltip: "Attiva vista 3D",
		},
	];

	const toggleActive = (id: ActiveId, toggleGps = true) => {
		if (activeId.includes(id)) {
			activeId = activeId.filter((activeId) => activeId !== id);
		} else activeId = activeId.concat(id);

		switch (id) {
			case "GPS":
				UI.p.menu_bottom.f.button_gps_popup_open();
				if (PLY.p.flagGPS) iconColor = "#4ADE80";
				else iconColor = "#FFFFFF";
				break;
			case "EYE":
				if (toggleGps) toggleGpsView();
				UI.p.menu_bottom.f.button_gpsView();
				break;
		}
	};

	if (isARBtnVisible) {
		setTimeout(() => {
			toggleActive("EYE", false);
		}, 500);
	}
</script>

<div class="fixed left-6 bottom-6 z-[1000] flex flex-col gap-3">
	<div class="bg-black/70 backdrop-blur-sm rounded-full p-2 shadow-lg border border-white/10 flex items-center justify-center">
		<Sync className="w-10 h-10" color={iconColor} />
	</div>
	
	<div class="bg-black/70 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-white/10">
		<div class="flex flex-col gap-2">
			{#each buttons as { src, alt, id, enabled = true, tooltip }}
				<div class="relative group">
					<Button
						{id}
						{src}
						{alt}
						active={activeId.includes(id)}
						toggleActive={() => toggleActive(id)}
						disabled={!enabled}
						className="bg-black border-white/30 hover:border-white w-10 !h-10 min-h-0 aspect-square"
						imgClassName="w-5 h-5"
					/>
					<div class="absolute left-full top-1/2 -translate-y-1/2 ml-4 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
						{tooltip}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	:global(.btn-primary) {
		@apply bg-white text-black border-white !important;
	}
	
	:global(.btn-neutral) {
		@apply bg-black text-white border-white/30 !important;
	}
</style>
