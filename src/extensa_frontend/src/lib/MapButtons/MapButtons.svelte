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
</script>

{#if $authStore.identity}
	<!-- Welcome modal -->
	{#if showWelcomeModal}
		<WelcomeModal onClose={handleCloseWelcomeModal} />
	{/if}

	<!-- Status indicator at the top center of the screen -->
	<StatusIndicator 
		activeToolName={activeToolName} 
		projectLoaded={!!$projectStore.project} 
	/>

	<!-- Main toolbar on the right side -->
	<div
		class="fixed right-6 top-1/2 transform -translate-y-1/2 z-[1000] flex flex-col bg-black/70 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-white/10"
	>
		<!-- Toolbar header -->
		<div class="text-white text-xs font-semibold uppercase tracking-wider border-b border-white/20 pb-2 mb-3 text-center">
			Strumenti
		</div>
		
		<!-- File operations section -->
		<ButtonSection 
			title="File" 
			buttons={fileButtons} 
			{activeId}
			toggleActive={toggleActive}
			deselectBtn={() => (activeId = null)}
		/>
		
		<!-- Transform tools section (visible when project is loaded) -->
		{#if $projectStore.project}
			<ButtonSection 
				title="Trasforma" 
				buttons={transformButtons} 
				{activeId}
				toggleActive={toggleActive}
				deselectBtn={() => (activeId = null)}
			/>
		{/if}
		
		<!-- Settings section -->
		<ButtonSection 
			title="Altro" 
			buttons={settingsButtons} 
			{activeId}
			toggleActive={toggleActive}
			deselectBtn={() => (activeId = null)}
		/>
		
		<!-- Help/instructions at the bottom -->
		<div class="mt-2 pt-2 border-t border-white/20">
			<div class="text-white/60 text-[10px] text-center">
				Seleziona uno strumento per iniziare
			</div>
		</div>
	</div>
{/if}

<style>
	/* High-tech, minimal styling */
	:global(.btn-primary) {
		@apply bg-white text-black border-white !important;
	}
	
	:global(.btn-neutral) {
		@apply bg-black text-white border-white/30 !important;
	}
	
	:global(.hover\:bg-tertiary:hover) {
		@apply bg-white/90 text-black !important;
	}
	
	:global(.hover\:border-tertiary:hover) {
		@apply border-white !important;
	}
</style>
