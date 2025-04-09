<script lang="ts">
	import { UI } from "../../jsm";
	import { EDITOR } from "../../jsm";
	import { authStore } from "../../store/AuthStore";
	import { controlStore } from "../../store/ControlStore";
	import { projectStore } from "../../store/ProjectStore";
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
	let isToolbarMinimized = false;
	let activeToolId: ActiveId | null = null;
	let activeToolName: string | null = null;

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
		 // Update local active tool state
		activeToolId = activeToolId === id ? null : id;
		activeToolName = activeToolId ? toolNames[activeToolId] : null;

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
		activeToolId = ButtonType.Drop;
		activeToolName = toolNames[ButtonType.Drop];
		showImportModal = false;
	};

	let isDragging = false;
	let startX = 0;
	let startY = 0;

	// Coordinate di posizionamento tramite transform
	let translateX = 0;
	let translateY = 0;

	// Posizione iniziale (può essere impostata da CSS)
	let initialX = 0;
	let initialY = 0;
	let initialPositionSet = false;

	function startDrag(event: MouseEvent | TouchEvent) {
		isDragging = true;
		const element = event.currentTarget as HTMLElement;

		// Se è la prima volta che iniziamo il drag, salviamo la posizione iniziale
		if (!initialPositionSet) {
			const rect = element.getBoundingClientRect();
			initialX = rect.left;
			initialY = rect.top;
			translateX = initialX;
			translateY = initialY;
			initialPositionSet = true;

			// Impostiamo i valori iniziali solo la prima volta
			element.style.left = '0';
			element.style.top = '0';
			element.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
		}

		// Rimuoviamo qualsiasi transizione durante il drag
		element.style.transition = 'none';

		// Calcoliamo l'offset del mouse rispetto all'elemento
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

		let clientX, clientY;
		if (event instanceof MouseEvent) {
			clientX = event.clientX;
			clientY = event.clientY;
		} else {
			clientX = event.touches[0].clientX;
			clientY = event.touches[0].clientY;
		}

		// Calcola la nuova posizione
		translateX = clientX - startX;
		translateY = clientY - startY;

		// Limit movement to screen bounds
		const maxX = window.innerWidth - element.offsetWidth;
		const maxY = window.innerHeight - element.offsetHeight;

		translateX = Math.max(0, Math.min(translateX, maxX));
		translateY = Math.max(0, Math.min(translateY, maxY));

		// Applica la trasformazione direttamente
		element.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
	}

	function stopDrag() {
		isDragging = false;

		// Non facciamo alcun cambiamento alla trasformazione - manteniamo le stesse coordinate
		document.removeEventListener('mousemove', onDrag);
		document.removeEventListener('touchmove', onDrag);
		document.removeEventListener('mouseup', stopDrag);
		document.removeEventListener('touchend', stopDrag);
	}

	function toggleMinimized() {
		isToolbarMinimized = !isToolbarMinimized;
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
		class="file-manager fixed left-6 top-1/2 transform -translate-y-1/2 z-[1000] bg-black/70 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-white/10 cursor-move {isToolbarMinimized ? 'minimized' : ''}"
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
				{#if isToolbarMinimized}
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
			<div class="section-header text-white text-xs font-semibold mb-2">
				File
			</div>
			<div class="section-content {isToolbarMinimized ? 'hidden' : ''}">
				{#each fileButtons as { src, alt, id, enabled = true, tooltip }}
					<button 
						on:click={() => toggleActive(id)}
						class="relative group flex items-center w-full p-2 rounded hover:bg-white/10 transition-colors {activeToolId === id ? 'bg-white/20 text-white' : 'text-white/80'}"
						disabled={!enabled}
					>
						<img src={src} alt={alt} class="w-5 h-5" />
						<span class="text-white text-sm ml-3 text-left">{tooltip}</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- Transform tools section (visible when project is loaded) -->
		{#if $projectStore.project}
			<div class="transform-tools mt-4 pt-2 border-t border-white/20">
				<div class="section-header text-white text-xs font-semibold mb-2">
					Trasforma
				</div>
				<div class="section-content {isToolbarMinimized ? 'hidden' : ''}">
					{#each transformButtons as { src, alt, id, enabled = true, tooltip }}
						<button 
							on:click={() => toggleActive(id)}
							class="relative group flex items-center w-full p-2 rounded hover:bg-white/10 transition-colors {activeToolId === id ? 'bg-white/20 text-white' : 'text-white/80'}"
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
			<div class="section-header text-white text-xs font-semibold mb-2">
				Impostazioni
			</div>
			<div class="section-content {isToolbarMinimized ? 'hidden' : ''}">
				{#each settingsButtons as { src, alt, id, enabled = true, tooltip }}
					<button 
						on:click={() => toggleActive(id)}
						class="relative group flex items-center w-full p-2 rounded hover:bg-white/10 transition-colors {activeToolId === id ? 'bg-white/20 text-white' : 'text-white/80'}"
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

	/* Minimized toolbar styles */
	.file-manager {
		width: 250px;
		position: fixed;
		/* Rimuoviamo left/top dalla posizione iniziale, useranno solo transform */
		will-change: transform;
	}
	
	/* Transizioni solo per i contenuti, non per la posizione */
	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		transition: all 0.2s ease;
	}
	
	.section-content {
		transition: height 0.3s ease, opacity 0.3s ease, padding 0.3s ease, margin 0.3s ease;
	}

	.file-manager.minimized .section-header {
		margin-bottom: 0;
	}

	.file-manager.minimized .section-content {
		height: 0;
		overflow: hidden;
		padding: 0;
		margin: 0;
	}

	.file-manager.minimized .border-t {
		margin-top: 8px;
		padding-top: 8px;
	}
</style>
