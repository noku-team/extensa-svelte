<script lang="ts">
	import { UI, PLY } from "../jsm";
	import Button from "./MapButtons/Button.svelte";
	import THREESIXTY from "/images/UI/icons/360.png";
	import GIS from "/images/UI/icons/gis.png";
	import MAP from "/images/UI/icons/map.png";
	import SATELLITE from "/images/UI/icons/tree.png";
	import Sync from "./icons/Sync.svelte";
	import EYE from "/images/UI/icons/eye.png";
	import GPS from "/images/UI/icons/pin.png";

	// Map control types
	type ActiveId = "GIS" | "satellite" | "map" | "threesixty" | "GPS" | "EYE";
	let activeId: ActiveId[] = ["map"];

	enum ButtonType {
		GIS = "GIS",
		satellite = "satellite",
		map = "map",
		threesixty = "threesixty",
		GPS = "GPS",
		EYE = "EYE",
	}
	
	// Tooltips for each map button
	const tooltips = {
		[ButtonType.GIS]: "Vista GIS",
		[ButtonType.satellite]: "Vista satellite",
		[ButtonType.map]: "Vista mappa standard",
		[ButtonType.GPS]: "Attiva localizzazione GPS",
		[ButtonType.EYE]: "Attiva vista 3D",
		// [ButtonType.threesixty]: "Vista 360°",
	};
	
	// Map buttons configuration
	$: mapButtons = [
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
		// {
		// 	src: THREESIXTY,
		// 	alt: "Vista 360°",
		// 	id: ButtonType.threesixty,
		// 	enabled: true,
		// 	tooltip: tooltips[ButtonType.threesixty],
		// },
	];

	// Location buttons configuration
	$: locationButtons = [
		{
			src: GPS,
			alt: "GPS",
			id: ButtonType.GPS,
			enabled: true,
			tooltip: tooltips[ButtonType.GPS],
		},
		{
			src: EYE,
			alt: "Vista 3D",
			id: ButtonType.EYE,
			enabled: true,
			tooltip: tooltips[ButtonType.EYE],
		},
	];

	// Mouse control types
	type ModeId = "auto" | "tasto_updown" | "tasto_drag" | "tasto_rotazione";
	let mouseMode: ModeId = "auto";
	
	// Panel visibility states
	let isMapMenuOpen = false;
	let isMouseMenuOpen = false;
	let isLocationMenuOpen = false;

	// GPS state
	let iconColor: string = "#FFFFFF";

	// init 3d is visible
	const url = new URL(window.location.href);
	const params = new URLSearchParams(url.search);
	const isARActive = params.get("ar");
	const project = params.get("project");
	let isARBtnVisible = isARActive === "true" && !!project;

	// Mouse control modes configuration
	const mouseModes = {
		"auto": {
			label: "Auto",
			tooltip: "Comportamento automatico",
			icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
				</svg>`
		},
		"tasto_drag": {
			label: "Trascina",
			tooltip: "Trascina vista",
			icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
				</svg>`
		},
		"tasto_rotazione": {
			label: "Ruota",
			tooltip: "Ruota vista",
			icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
					<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
				</svg>`
		},
		"tasto_updown": {
			label: "Su/Giù",
			tooltip: "Sposta su/giù",
			icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
				</svg>`
		}
	};

	// Map control icon
	const mapControlIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
		<path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317.159.69.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
	</svg>`;

	// Toggle map type
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
			case "GPS":
				UI.p.menu_bottom.f.button_gps_popup_open();
				if (PLY.p.flagGPS) iconColor = "#4ADE80";
				else iconColor = "#FFFFFF";
				break;
			case "EYE":
				toggleGpsView();
				UI.p.menu_bottom.f.button_gpsView();
				break;
		}
	};

	// Set mouse control mode
	function setMouseMode(id: ModeId) {
		mouseMode = id;
		isMouseMenuOpen = false;

		switch (id) {
			case "auto":
				PLY.p.forceAction = false;
				break;
			case "tasto_updown":
				PLY.p.forceAction = true;
				PLY.p.action = 'position';
				break;
			case "tasto_drag":
				PLY.p.forceAction = true;
				PLY.p.action = 'drag';
				PLY.p.flagGPS = false;
				break;
			case "tasto_rotazione":
				PLY.p.forceAction = true;
				PLY.p.action = 'rotation';
				break;
		}
	}

	// Toggle settings menu
	function toggleSettingsMenu(event: MouseEvent) {
		event.stopPropagation();
		isLocationMenuOpen = !isLocationMenuOpen;
		if (isLocationMenuOpen) {
			isMouseMenuOpen = false;
		}
	}

	// Toggle mouse controls menu
	function toggleMouseMenu(event: MouseEvent) {
		event.stopPropagation();
		isMouseMenuOpen = !isMouseMenuOpen;
		if (isMouseMenuOpen) {
			isLocationMenuOpen = false;
		}
	}

	// Close all menus when clicking outside
	function closeMenus() {
		isMouseMenuOpen = false;
		isLocationMenuOpen = false;
	}

	// Prevent menu closing when clicking inside
	function preventClosing(event: MouseEvent) {
		event.stopPropagation();
	}

	// Toggle GPS view
	const toggleGpsView = () => {
		isARBtnVisible = !isARBtnVisible;
	};

	if (isARBtnVisible) {
		setTimeout(() => {
			toggleActive("EYE");
		}, 500);
	}
</script>

<svelte:window on:click={closeMenus} />

<div class="fixed right-6 bottom-6 z-[1000]">
	<div class="flex flex-col gap-3">
		<!-- Camera Control Button -->
		<div class="relative">
			<div class="bg-black/70 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-white/10">
				<button 
					on:click={toggleMouseMenu}
					class="btn w-14 h-14 min-h-0 aspect-square bg-black text-white border-white/30 hover:border-white transition-all duration-200 group relative"
					aria-label={mouseModes[mouseMode].label}
				>
					{@html mouseModes[mouseMode].icon}
					<div class="absolute right-full mr-4 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
						Controllo Camera
					</div>
				</button>
				
				<!-- Mouse Control Dropdown Menu -->
				{#if isMouseMenuOpen}
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<div 
						on:click={preventClosing}
						class="absolute bottom-full mb-2 right-0 bg-black/90 backdrop-blur-sm rounded-lg p-3 border border-white/20 shadow-lg w-48"
					>
						<div class="text-white text-xs font-semibold mb-3 text-center border-b border-white/20 pb-2">
							Controllo Camera
						</div>
						{#each Object.entries(mouseModes) as [id, mode]}
							<button 
								on:click={() => setMouseMode(id)}
								class="flex items-center gap-3 w-full p-2 rounded hover:bg-white/10 transition-colors {mouseMode === id ? 'bg-white/20 text-white' : 'text-white/80'} group relative"
							>
								<div class="w-5 h-5">{@html mode.icon}</div>
								<span class="text-sm">{mode.label}</span>
								<div class="absolute right-full mr-4 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
									{mode.tooltip}
								</div>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Settings Button -->
		<div class="relative">
			<div class="bg-black/70 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-white/10">
				<button 
					on:click={toggleSettingsMenu}
					class="btn w-14 h-14 min-h-0 aspect-square bg-black text-white border-white/30 hover:border-white transition-all duration-200 group relative"
					aria-label="Impostazioni"
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.213-1.281z" />
						<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					<div class="absolute right-full mr-4 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
						Impostazioni
					</div>
				</button>
				
				<!-- Settings Dropdown Menu -->
				{#if isLocationMenuOpen}
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<div 
						on:click={preventClosing}
						class="absolute bottom-full mb-2 right-0 bg-black/90 backdrop-blur-sm rounded-lg p-3 border border-white/20 shadow-lg w-48"
					>
						<div class="text-white text-xs font-semibold mb-3 text-center border-b border-white/20 pb-2">
							Impostazioni
						</div>
						<div class="flex flex-col gap-2">
							<!-- Map Type Selection -->
							<div class="text-white text-xs font-semibold mb-2">
								Tipo di Mappa
							</div>
							{#each mapButtons as { src, alt, id, enabled = true, tooltip }}
								<button 
									on:click={() => toggleActive(id)}
									class="relative group flex items-center w-full"
									disabled={!enabled}
								>
									<Button
										{src}
										{alt}
										active={activeId.includes(id)}
										toggleActive={() => toggleActive(id)}
										disabled={!enabled}
										className="bg-black border-white/30 hover:border-white w-10 !h-10 min-h-0 aspect-square"
										imgClassName="w-5 h-5"
									/>
									<span class="text-white text-sm ml-3 text-left">{tooltip}</span>
								</button>
							{/each}
							
							<!-- Location Controls -->
							<div class="text-white text-xs font-semibold mt-4 mb-2">
								Controllo Posizione
							</div>
							{#each locationButtons as { src, alt, id, enabled = true, tooltip }}
								<button 
									on:click={() => toggleActive(id)}
									class="relative group flex items-center w-full"
									disabled={!enabled}
								>
									<Button
										{src}
										{alt}
										active={activeId.includes(id)}
										toggleActive={() => toggleActive(id)}
										disabled={!enabled}
										className="bg-black border-white/30 hover:border-white w-10 !h-10 min-h-0 aspect-square"
										imgClassName="w-5 h-5"
									/>
									<span class="text-white text-sm ml-3 text-left">{tooltip}</span>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
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
		background-color: white;
		color: black;
		border-color: white;
	}
	
	:global(.btn-neutral) {
		background-color: black;
		color: white;
		border-color: rgba(255, 255, 255, 0.3);
	}
</style> 