<script lang="ts">
	import { UI } from "../../jsm";
	import { authStore } from "../../store/AuthStore";
	import { controlStore } from "../../store/ControlStore";
	import { projectStore } from "../../store/ProjectStore";
	import Button from "./Button.svelte";
	import ButtonSection from "./ButtonSection.svelte";
	import StatusIndicator from "./StatusIndicator.svelte";
	import WelcomeModal from "./WelcomeModal.svelte";
	import Drop from "/images/UI/buttons/Arhive_load.png";
	import Enlarge from "/images/UI/buttons/Center_pick_alt.png";
	import Folder from "/images/UI/buttons/Folder_alt.png";
	import Move from "/images/UI/buttons/Move.png";
	import Rotate from "/images/UI/buttons/circle_left.png";
	import Settings from "/images/UI/buttons/settings.png";
	import { onMount, onDestroy } from 'svelte';

	type ActiveId =
		| "Move"
		| "Drop"
		| "Enlarge"
		| "Rotate"
		| "Folder"
		| "Settings";

	let activeId: ActiveId | null = null;
	let activeToolName: string | null = null;
	let showWelcomeModal = true;

	enum ButtonType {
		Drop = "Drop",
		Folder = "Folder",
		Rotate = "Rotate",
		Move = "Move",
		Enlarge = "Enlarge",
		Settings = "Settings",
	}

	// Tooltips for each button to make their function clear
	const tooltips = {
		[ButtonType.Drop]: "Importa un modello 3D",
		[ButtonType.Folder]: "Apri cartella",
		[ButtonType.Rotate]: "Ruota modello",
		[ButtonType.Move]: "Sposta modello",
		[ButtonType.Enlarge]: "Ridimensiona modello",
		[ButtonType.Settings]: "Impostazioni",
	};

	// Human-readable names for status indicator
	const toolNames = {
		[ButtonType.Drop]: "Importazione",
		[ButtonType.Folder]: "Browser file",
		[ButtonType.Rotate]: "Rotazione",
		[ButtonType.Move]: "Spostamento",
		[ButtonType.Enlarge]: "Ridimensionamento",
		[ButtonType.Settings]: "Impostazioni",
	};

	$: fileButtons = [
		{
			src: Drop,
			alt: "Importa modello",
			id: ButtonType.Drop,
			enabled: !$projectStore.project,
			tooltip: tooltips[ButtonType.Drop],
		},
		{
			src: Folder,
			alt: "Cartella",
			id: ButtonType.Folder,
			enabled: false,
			tooltip: tooltips[ButtonType.Folder],
		}
	];

	$: transformButtons = [
		{
			src: Rotate,
			alt: "Ruota",
			id: ButtonType.Rotate,
			enabled: !!$projectStore.project,
			tooltip: tooltips[ButtonType.Rotate],
		},
		{
			src: Move,
			alt: "Sposta",
			id: ButtonType.Move,
			enabled: !!$projectStore.project,
			tooltip: tooltips[ButtonType.Move],
		},
		{
			src: Enlarge,
			alt: "Ridimensiona",
			id: ButtonType.Enlarge,
			enabled: !!$projectStore.project,
			tooltip: tooltips[ButtonType.Enlarge],
		},
	];

	$: settingsButtons = [
		{
			src: Settings,
			alt: "Impostazioni",
			id: ButtonType.Settings,
			enabled: !!$projectStore.project,
			tooltip: tooltips[ButtonType.Settings],
		},
	];

	const toggleActive = (id: ActiveId) => {
		activeId = activeId === id ? null : id;
		activeToolName = activeId ? toolNames[activeId] : null;

		if (id !== "Settings") {
			if (UI.p.scene.OBJECTS.menu_optimizer !== undefined) {
				UI.p.menu_optimizer.f.close();
			}
		}
		switch (id) {
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
				if (UI.p.scene.OBJECTS.menu_optimizer !== undefined) {
					UI.p.menu_optimizer.f.close();
				} else UI.p.menu_editor.f.TOOLS();
				break;
		}
	};

	const onDragAndDrop = () => {
		UI.p.menu_editor.f.button_import();
		activeToolName = toolNames[ButtonType.Drop];
	};

	const handleCloseWelcomeModal = () => {
		showWelcomeModal = false;
	};

	let isDragging = false;
	let startX = 0;
	let startY = 0;
	let currentX = 0;
	let currentY = 0;

	function startDrag(event: MouseEvent | TouchEvent) {
		isDragging = true;
		const element = event.currentTarget as HTMLElement;
		const rect = element.getBoundingClientRect();
		
		if (event instanceof MouseEvent) {
			startX = event.clientX - rect.left;
			startY = event.clientY - rect.top;
		} else {
			startX = event.touches[0].clientX - rect.left;
			startY = event.touches[0].clientY - rect.top;
		}

		document.addEventListener('mousemove', onDrag);
		document.addEventListener('touchmove', onDrag);
		document.addEventListener('mouseup', stopDrag);
		document.addEventListener('touchend', stopDrag);
	}

	function onDrag(event: MouseEvent | TouchEvent) {
		if (!isDragging) return;

		const element = document.querySelector('.file-manager') as HTMLElement;
		if (!element) return;

		if (event instanceof MouseEvent) {
			currentX = event.clientX - startX;
			currentY = event.clientY - startY;
		} else {
			currentX = event.touches[0].clientX - startX;
			currentY = event.touches[0].clientY - startY;
		}

		// Limit movement to screen bounds
		const rect = element.getBoundingClientRect();
		const maxX = window.innerWidth - rect.width;
		const maxY = window.innerHeight - rect.height;

		currentX = Math.max(0, Math.min(currentX, maxX));
		currentY = Math.max(0, Math.min(currentY, maxY));

		element.style.left = `${currentX}px`;
		element.style.top = `${currentY}px`;
		element.style.transform = 'none';
	}

	function stopDrag() {
		isDragging = false;
		document.removeEventListener('mousemove', onDrag);
		document.removeEventListener('touchmove', onDrag);
		document.removeEventListener('mouseup', stopDrag);
		document.removeEventListener('touchend', stopDrag);
	}
</script>

{#if $authStore.identity}
	<!-- Welcome modal -->
	{#if showWelcomeModal}
		<WelcomeModal onClose={handleCloseWelcomeModal} />
	{/if}

	<!-- Main toolbar on the left side -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="file-manager fixed left-6 top-1/2 transform -translate-y-1/2 z-[1000] bg-black/70 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-white/10 cursor-move"
		style="touch-action: none;"
		on:mousedown={startDrag}
		on:touchstart={startDrag}
	>
		<!-- Toolbar header with drag handle -->
		<div class="text-white text-xs font-semibold uppercase tracking-wider border-b border-white/20 pb-2 mb-3 text-center flex items-center justify-center gap-2">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
				<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
			</svg>
			Gestione File
		</div>

		<!-- Status Indicator -->
		<div class="mb-3 pb-3 border-b border-white/20">
			<div class="flex items-center gap-3">
				{#if $projectStore.project}
					<div class="w-2 h-2 rounded-full bg-green-400"></div>
					<div class="text-white text-xs">
						{#if activeToolName}
							<span class="font-semibold">{activeToolName}</span>
						{:else}
							Progetto caricato
						{/if}
					</div>
				{:else}
					<div class="w-2 h-2 rounded-full bg-blue-400"></div>
					<div class="text-white text-xs">Pronto per importare</div>
				{/if}
			</div>
		</div>

		<!-- File operations section -->
		<div class="flex flex-col gap-2">
			{#each fileButtons as { src, alt, id, enabled = true, tooltip }}
				<button 
					on:click={() => toggleActive(id)}
					class="relative group flex items-center w-full p-2 rounded hover:bg-white/10 transition-colors {activeId === id ? 'bg-white/20 text-white' : 'text-white/80'}"
					disabled={!enabled}
				>
					<img src={src} alt={alt} class="w-5 h-5" />
					<span class="text-white text-sm ml-3 text-left">{tooltip}</span>
				</button>
			{/each}
		</div>

		<!-- Transform tools section (visible when project is loaded) -->
		{#if $projectStore.project}
			<div class="mt-4 pt-2 border-t border-white/20">
				<div class="text-white text-xs font-semibold mb-2">
					Trasforma
				</div>
				<div class="flex flex-col gap-2">
					{#each transformButtons as { src, alt, id, enabled = true, tooltip }}
						<button 
							on:click={() => toggleActive(id)}
							class="relative group flex items-center w-full p-2 rounded hover:bg-white/10 transition-colors {activeId === id ? 'bg-white/20 text-white' : 'text-white/80'}"
							disabled={!enabled}
						>
							<img src={src} alt={alt} class="w-5 h-5" />
							<span class="text-white text-sm ml-3 text-left">{tooltip}</span>
						</button>
					{/each}
				</div>
			</div>
		{/if}
		
		<!-- Settings section -->
		<div class="mt-4 pt-2 border-t border-white/20">
			<div class="text-white text-xs font-semibold mb-2">
				Impostazioni
			</div>
			<div class="flex flex-col gap-2">
				{#each settingsButtons as { src, alt, id, enabled = true, tooltip }}
					<button 
						on:click={() => toggleActive(id)}
						class="relative group flex items-center w-full p-2 rounded hover:bg-white/10 transition-colors {activeId === id ? 'bg-white/20 text-white' : 'text-white/80'}"
						disabled={!enabled}
					>
						<img src={src} alt={alt} class="w-5 h-5" />
						<span class="text-white text-sm ml-3 text-left">{tooltip}</span>
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	/* High-tech, minimal styling */
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
	
	:global(.hover\:bg-tertiary:hover) {
		background-color: rgba(255, 255, 255, 0.9);
		color: black;
	}
	
	:global(.hover\:border-tertiary:hover) {
		border-color: white;
	}
</style>
