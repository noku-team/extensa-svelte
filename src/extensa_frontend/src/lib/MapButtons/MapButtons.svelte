<script lang="ts">
	import { UI } from "../../jsm";
	import { EDITOR } from "../../jsm";
	import { authStore } from "../../store/AuthStore";
	import { controlStore } from "../../store/ControlStore";
	import { projectStore } from "../../store/ProjectStore";
	import { uiControlStore } from "../../store/UIControlStore";
	import Button from "./Button.svelte";
	import ButtonSection from "./ButtonSection.svelte";
	import WelcomeModal from "./WelcomeModal.svelte";
	import ImportModal from "./ImportModal.svelte";
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

	let showWelcomeModal = true;
	let showImportModal = false;

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
		// Aggiorniamo lo stato attraverso lo store per coordinare con altri componenti
		const currentActiveId = $uiControlStore.activeToolId;
		const newActiveId = currentActiveId === id ? null : id;
		const newActiveToolName = newActiveId ? toolNames[newActiveId] : null;
		
		uiControlStore.setActiveTool(newActiveId, newActiveToolName);

		if (id !== "Settings") {
			if (UI.p.scene.OBJECTS.menu_optimizer !== undefined) {
				UI.p.menu_optimizer.f.close();
			}
		}
		switch (id) {
			case "Drop":
				showImportModal = true;
				break;
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

	const handleCloseWelcomeModal = () => {
		showWelcomeModal = false;
	};

	const handleCloseImportModal = () => {
		showImportModal = false;
	};

	const handleImport = (file: File) => {
		controlStore.setIsDragAndDropActive(true);
		EDITOR.f.DROP_FILE(file);
		uiControlStore.setActiveTool(ButtonType.Drop, toolNames[ButtonType.Drop]);
		showImportModal = false;
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

	function toggleMinimized() {
		uiControlStore.toggleToolbarMinimized();
	}

	// Cleanup function
	onDestroy(() => {
		document.removeEventListener('mousemove', onDrag);
		document.removeEventListener('touchmove', onDrag);
		document.removeEventListener('mouseup', stopDrag);
		document.removeEventListener('touchend', stopDrag);
	});
</script>

{#if $authStore.identity}
	<!-- Welcome modal -->
	{#if showWelcomeModal}
		<WelcomeModal onClose={handleCloseWelcomeModal} />
	{/if}

	<!-- Import modal -->
	{#if showImportModal}
		<ImportModal onClose={handleCloseImportModal} onImport={handleImport} />
	{/if}

	<!-- Main toolbar on the left side -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="file-manager fixed left-6 top-1/2 transform -translate-y-1/2 z-[1000] bg-black/70 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-white/10 cursor-move {$uiControlStore.isToolbarMinimized ? 'minimized' : ''}"
		style="touch-action: none;"
		on:mousedown={startDrag}
		on:touchstart={startDrag}
	>
		<!-- Toolbar header with drag handle -->
		<div class="toolbar-header text-white text-xs font-semibold uppercase tracking-wider border-b border-white/20 pb-2 mb-3 text-center flex items-center justify-center gap-2">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
				<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
			</svg>
			<span class="toolbar-title">Gestione File</span>
			
			<button 
				class="minimize-button ml-auto text-white/80 hover:text-white"
				on:click={toggleMinimized}
			>
				{#if $uiControlStore.isToolbarMinimized}
					<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
					</svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
					</svg>
				{/if}
			</button>
		</div>

			<!-- File operations section -->
		<div class="file-operations flex flex-col gap-2">
			{#each fileButtons as { src, alt, id, enabled = true, tooltip }}
				<button 
					on:click={() => toggleActive(id)}
					class="relative group flex items-center w-full p-2 rounded hover:bg-white/10 transition-colors {$uiControlStore.activeToolId === id ? 'bg-white/20 text-white' : 'text-white/80'}"
					disabled={!enabled}
				>
					<img src={src} alt={alt} class="w-5 h-5" />
					<span class="text-white text-sm ml-3 text-left">{tooltip}</span>
				</button>
			{/each}
		</div>

		<!-- Transform tools section (visible when project is loaded) -->
		{#if $projectStore.project}
			<div class="transform-tools mt-4 pt-2 border-t border-white/20">
				<div class="text-white text-xs font-semibold mb-2">
					Trasforma
				</div>
				<div class="flex flex-col gap-2">
					{#each transformButtons as { src, alt, id, enabled = true, tooltip }}
						<button 
							on:click={() => toggleActive(id)}
							class="relative group flex items-center w-full p-2 rounded hover:bg-white/10 transition-colors {$uiControlStore.activeToolId === id ? 'bg-white/20 text-white' : 'text-white/80'}"
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
		<div class="settings mt-4 pt-2 border-t border-white/20">
			<div class="text-white text-xs font-semibold mb-2">
				Impostazioni
			</div>
			<div class="flex flex-col gap-2">
				{#each settingsButtons as { src, alt, id, enabled = true, tooltip }}
					<button 
						on:click={() => toggleActive(id)}
						class="relative group flex items-center w-full p-2 rounded hover:bg-white/10 transition-colors {$uiControlStore.activeToolId === id ? 'bg-white/20 text-white' : 'text-white/80'}"
						disabled={!enabled}
					>
						<img src={src} alt={alt} class="w-5 h-5" />
						<span class="text-white text-sm ml-3 text-left">{tooltip}</span>
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Only show the expand button when minimized -->
	{#if $uiControlStore.isToolbarMinimized}
		<button
			class="fixed left-6 top-1/2 transform -translate-y-1/2 z-[1001] bg-black/70 backdrop-blur-sm rounded-full p-2 shadow-lg border border-white/10 text-white"
			on:click={toggleMinimized}
		>
			<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
			</svg>
		</button>
	{/if}
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

	/* Minimized toolbar styles */
	.file-manager.minimized {
		width: 42px;
		padding: 8px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.file-manager.minimized .toolbar-title,
	.file-manager.minimized .file-operations span,
	.file-manager.minimized .transform-tools span,
	.file-manager.minimized .settings span,
	.file-manager.minimized .text-xs {
		display: none;
	}

	.file-manager.minimized button {
		padding: 8px;
		width: auto;
		justify-content: center;
	}

	.file-manager.minimized .toolbar-header {
		border: none;
		padding-bottom: 0;
		margin-bottom: 8px;
		justify-content: center;
	}
</style>
