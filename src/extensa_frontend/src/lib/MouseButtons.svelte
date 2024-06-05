<script lang="ts">
	import { UI } from "../jsm";
	import Button from "./MapButtons/Button.svelte";
	import MouseDrag from "/images/UI/tasto_drag.png";
	import MouseRotate from "/images/UI/tasto_rotazione.png";
	import MouseUpDown from "/images/UI/tasto_updown.png";

	// tasto_updown
	// tasto_drag
	// tasto_rotazione
	type ActiveId = "tasto_updown" | "tasto_drag" | "tasto_rotazione";

	let activeId: ActiveId | null = "tasto_drag";

	enum ButtonType {
		tasto_updown = "tasto_updown",
		tasto_drag = "tasto_drag",
		tasto_rotazione = "tasto_rotazione",
	}

	$: buttons = [
		{
			src: MouseDrag,
			alt: "Folder",
			id: ButtonType.tasto_drag,
			enabled: true,
		},
		{
			src: MouseRotate,
			alt: "Move",
			id: ButtonType.tasto_rotazione,
			enabled: true,
		},
		{
			src: MouseUpDown,
			alt: "Drop",
			id: ButtonType.tasto_updown,
			enabled: true,
		},
	];

	const toggleActive = (id: ActiveId) => {
		activeId = id;

		switch (id) {
			case "tasto_updown":
				UI.p.menu_bottom.f.button_posizione();
				break;
			case "tasto_drag":
				UI.p.menu_bottom.f.button_drag();
				break;
			case "tasto_rotazione":
				UI.p.menu_bottom.f.button_rotazione();
				break;
		}
	};
</script>

<div class="fixed right-2 bottom-2 z-[1000] flex gap-3">
	{#each buttons as { src, alt, id, enabled = true }}
		<Button
			{src}
			{alt}
			active={activeId === id}
			toggleActive={() => toggleActive(id)}
			deselectBtn={() => (activeId = null)}
			disabled={!enabled}
			className="bg-transparent border-0 w-auto h-16 hover:bg-transparent"
			imgClassName="h-16 w-auto"
		/>
	{/each}
</div>
