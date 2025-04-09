<script lang="ts">
	import { UI, PLY } from "../jsm";
	import Button from "./MapButtons/Button.svelte";

	type ActiveId = "tasto_updown" | "tasto_drag" | "tasto_rotazione";

	let activeId: ActiveId | null = "tasto_drag";

	enum ButtonType {
		tasto_updown = "tasto_updown",
		tasto_drag = "tasto_drag",
		tasto_rotazione = "tasto_rotazione",
	}

	// Tooltips for each button
	const tooltips = {
		[ButtonType.tasto_drag]: "Trascina vista",
		[ButtonType.tasto_rotazione]: "Ruota vista",
		[ButtonType.tasto_updown]: "Sposta su/giù",
	};

	$: buttons = [
		{
			icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
			</svg>`,
			alt: "Trascina",
			id: ButtonType.tasto_drag,
			enabled: true,
			tooltip: tooltips[ButtonType.tasto_drag],
		},
		{
			icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
			</svg>`,
			alt: "Ruota",
			id: ButtonType.tasto_rotazione,
			enabled: true,
			tooltip: tooltips[ButtonType.tasto_rotazione],
		},
		{
			icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
			</svg>`,
			alt: "Su/Giù",
			id: ButtonType.tasto_updown,
			enabled: true,
			tooltip: tooltips[ButtonType.tasto_updown],
		},
	];

	const toggleActive = (id: ActiveId) => {
		activeId = id;

		switch (id) {
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
	};
</script>

<div class="fixed right-6 bottom-6 z-[1000]">
	<div class="bg-black/70 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-white/10">
		<div class="text-white text-xs font-semibold uppercase tracking-wider pb-2 mb-2 text-center border-b border-white/20">
			Controlli Mappa
		</div>
		
		<div class="flex gap-2">
			{#each buttons as { icon, alt, id, enabled = true, tooltip }}
				<div class="relative group">
					<button
						on:click={() => toggleActive(id)}
						disabled={!enabled}
						class="btn w-14 h-14 min-h-0 aspect-square bg-black border-white/30 hover:border-white transition-all duration-200 {activeId === id ? 'btn-primary' : 'btn-neutral'}"
						aria-label={alt}
					>
						{@html icon}
					</button>
					<div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
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

	button :global(svg) {
		@apply w-6 h-6;
	}
</style>
