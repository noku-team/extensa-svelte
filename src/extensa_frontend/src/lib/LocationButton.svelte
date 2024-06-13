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

	let iconColor: string = "#222222";

	enum ButtonType {
		GPS = "GPS",
		EYE = "EYE",
	}

	$: buttons = [
		{
			src: GPS,
			alt: "Gps",
			id: ButtonType.GPS,
			enabled: true,
		},
		{
			src: EYE,
			alt: "Eye",
			id: ButtonType.EYE,
			enabled: true,
		},
	];

	const toggleActive = (id: ActiveId, toggleGps = true) => {
		if (activeId.includes(id)) {
			activeId = activeId.filter((activeId) => activeId !== id);
		} else activeId = activeId.concat(id);

		switch (id) {
			case "GPS":
				UI.p.menu_bottom.f.button_gps_popup_open();
				if (PLY.p.flagGPS) iconColor = "red";
				else iconColor = "#222222";
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

<div class="fixed left-2 bottom-3 z-[1000] flex flex-col gap-2">
	<Sync className="w-12 h-12" color={iconColor} />
	<div class="flex gap-1">
		{#each buttons as { src, alt, id, enabled = true }}
			<Button
				{id}
				{src}
				{alt}
				active={activeId.includes(id)}
				toggleActive={() => toggleActive(id)}
				disabled={!enabled}
				imgClassName="w-7 h-7"
			/>
		{/each}
	</div>
</div>
