<script lang="ts">
	import { VARCO } from "../VARCO/helpers/VARCO";
	import { EDITOR, MAP, PLY, UI } from "../jsm";
	import { authStore } from "../store/AuthStore";
	import { messageStore } from "../store/MessageStore";
	import { projectStore } from "../store/ProjectStore";
	import { spinnerStore } from "../store/SpinnerStore";
	import executeDeleteGeoarea from "../utils/dfinity/geoareas/methods/deleteGeoarea";
	import executeDeleteProject from "../utils/dfinity/geoareas/methods/deleteProject";
	import EyeOffIcon from "/images/UI/eye-off.png";
	import EyeIcon from "/images/UI/eye.png";
	import ShareIcon from "/images/UI/icons/share.png";
	import { onDestroy } from 'svelte';

	// Local state for minimization
	let isMinimized = false;

	const onEyeClick = async () => {
		EDITOR.f.loadProjectData();
		projectStore.set3DVisible(true);
	};

	const onEyeOffClick = () => {
		UI.p.previewProject.f.button_removeProject();
		projectStore.set3DVisible(false);
	};

	const onDelete = async () => {
		try {
			if (confirm("Are you sure you want to delete this project?")) {
				spinnerStore.setLoading(true);

				if (
					PLY.p?.selectedArea?.userData?.id &&
					process.env.CANISTER_ID_EXTENSA_BACKEND &&
					$authStore.identity &&
					$projectStore.project
				) {
					await executeDeleteProject({
						identity: $authStore.identity,
						canisterId: process.env.CANISTER_ID_EXTENSA_BACKEND,
						projectId: $projectStore.project?.userData.id,
						geoareaId: PLY.p.selectedArea.userData.id,
					});
					await executeDeleteGeoarea({
						identity: $authStore.identity,
						canisterId: process.env.CANISTER_ID_EXTENSA_BACKEND,
						geoareaId: PLY.p.selectedArea.userData.id,
					});

					EDITOR.f.deleteProject($projectStore.project);
					EDITOR.f.deleteGeoArea();
				} else {
					throw new Error();
				}
			}
		} catch (e) {
			messageStore.setMessage(
				"Oops! There was a problem removing the project. Please try again.",
				"error"
			);
			console.error(e);
		} finally {
			spinnerStore.setLoading(false);
		}
	};

	const onClose = () => {
		projectStore.setProject(null);

		UI.f.remove_menu_popups();

		EDITOR.f.deselectProjects();

		EDITOR.f.deselectGeoArea();

		if (UI.p.scene.OBJECTS.previewProject !== undefined)
			(VARCO.f as any).deleteElement(
				UI.p.scene,
				UI.p.scene.OBJECTS.previewProject
			);

		PLY.p.selectedProjectName = "";
		projectStore.setProject(null);
		PLY.p.selectedGeoAreaName = "";
	};

	const onShare = async () => {
		if (
			$projectStore.project &&
			$projectStore.project?.userData &&
			$projectStore.project?.userData?.linkedGeoArea &&
			$projectStore.project?.userData?.linkedGeoArea?.userData &&
			$projectStore.project?.userData?.linkedGeoArea?.userData?.myCoords
		) {
			const { lat, lng } =
				$projectStore.project?.userData?.linkedGeoArea?.userData.myCoords ?? {};
			const { angX, angY } = PLY.p.camera3DAxis.userData ?? {};
			const { zoomMap } = MAP.p ?? {};

			let url = `${window.location.origin}?lat=${lat}&lng=${lng}`;
			if (angX && angY) url += `&angX=${angX}&angY=${angY}`;
			if (zoomMap) url += `&zoom=${zoomMap}`;
			// add show project
			if ($projectStore?.project?.userData?.file_id) {
				url += `&project=${parseInt($projectStore.project.userData.file_id)}`;
			}

			await navigator.clipboard.writeText(url);
			messageStore.setMessage("Project link copied successfully", "success");
		} else {
			messageStore.setMessage(
				"Oops! There was a problem sharing the project. Please try again.",
				"error"
			);
		}
	};

	const isOwner = () => {
		return (
			$authStore.identity &&
			$projectStore.project &&
			$authStore.identity.getPrincipal().toString() ===
				$projectStore.project?.userData?.linkedGeoArea?.userData?.user?.[0]?.toString()
		);
	};

	function toggleMinimized() {
		isMinimized = !isMinimized;
	}
	
	// Drag functionality
	let isDragging = false;
	let startX = 0;
	let startY = 0;
	let currentX = 0;
	let currentY = 0;

	function startDrag(event: MouseEvent | TouchEvent) {
		isDragging = true;
		const element = event.currentTarget as HTMLElement;
		const rect = element.getBoundingClientRect();
		
		 // Ensure proper positioning before drag starts
		if (element.style.right !== 'auto') {
			element.style.right = 'auto';
			element.style.transform = 'none';
			element.style.left = `${rect.left}px`;
			element.style.top = `${rect.top}px`;
		}
		
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

		const element = document.querySelector('.project-details-panel') as HTMLElement;
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

		// Apply position directly without requestAnimationFrame for immediate response
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

	// Cleanup function
	onDestroy(() => {
		document.removeEventListener('mousemove', onDrag);
		document.removeEventListener('touchmove', onDrag);
		document.removeEventListener('mouseup', stopDrag);
		document.removeEventListener('touchend', stopDrag);
	});
</script>

{#if !!$projectStore.project}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="project-details-panel fixed right-6 top-20 z-[1000] bg-black/70 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-white/10 cursor-move {isMinimized ? 'minimized' : ''}"
		style="touch-action: none;"
		on:mousedown={startDrag}
		on:touchstart={startDrag}
	>
		<!-- Panel header with drag handle -->
		<div class="panel-header text-white text-xs font-semibold uppercase tracking-wider border-b border-white/20 pb-2 mb-3 text-center flex items-center justify-center gap-2">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
				<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
			</svg>
			<span class="panel-title">Progetto: {$projectStore.project?.name?.toUpperCase()}</span>
			
			<button 
				class="minimize-button ml-auto text-white/80 hover:text-white"
				on:click={toggleMinimized}
			>
				{#if isMinimized}
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

		<!-- Panel Content -->
		<div class="panel-content flex flex-col gap-3">
			<!-- Project info -->
			<div class="project-info text-center mb-2">
				<span class="text-white text-sm opacity-70">ID: {$projectStore.project.uuid}</span>
			</div>

			<!-- Action buttons -->
			<div class="action-buttons flex flex-col gap-2">
				<button
					disabled={$projectStore.project.notYetSaved}
					on:click={!$projectStore.project.is3DVisible
						? onEyeClick
						: onEyeOffClick}
					class="relative group flex items-center w-full p-2 rounded hover:bg-white/10 transition-colors text-white/80"
				>
					<img
						src={!$projectStore.project.is3DVisible ? EyeIcon : EyeOffIcon}
						alt="view/hide"
						class="w-5 h-5"
					/>
					<span class="text-white text-sm ml-3 text-left">
						{!$projectStore.project.is3DVisible ? "View project" : "Hide project"}
					</span>
				</button>

				<button
					class="relative group flex items-center w-full p-2 rounded hover:bg-white/10 transition-colors text-white/80"
					on:click={onShare}
				>
					<img src={ShareIcon} alt="share" class="w-5 h-5" />
					<span class="text-white text-sm ml-3 text-left">Condividi</span>
				</button>
				
				{#if $authStore.identity && isOwner()}
					<button
						class="relative group flex items-center w-full p-2 rounded hover:bg-white/10 transition-colors text-white/80"
						on:click={onDelete}
						disabled={$projectStore.sendProjectProgress > 0 ||
							$projectStore.loadProjectProgress > 0 ||
							!$projectStore.project?.userData?.id}
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							class="w-5 h-5"
						>
							<path
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M10.8 2.39999C10.3455 2.39999 9.92997 2.6568 9.72669 3.06334L8.85837 4.79999H4.80001C4.13726 4.79999 3.60001 5.33725 3.60001 5.99999C3.60001 6.66274 4.13726 7.19999 4.80001 7.19999L4.80001 19.2C4.80001 20.5255 5.87452 21.6 7.20001 21.6H16.8C18.1255 21.6 19.2 20.5255 19.2 19.2V7.19999C19.8627 7.19999 20.4 6.66274 20.4 5.99999C20.4 5.33725 19.8627 4.79999 19.2 4.79999H15.1416L14.2733 3.06334C14.0701 2.6568 13.6545 2.39999 13.2 2.39999H10.8ZM8.40001 9.59999C8.40001 8.93725 8.93726 8.39999 9.60001 8.39999C10.2627 8.39999 10.8 8.93725 10.8 9.59999V16.8C10.8 17.4627 10.2627 18 9.60001 18C8.93726 18 8.40001 17.4627 8.40001 16.8V9.59999ZM14.4 8.39999C13.7373 8.39999 13.2 8.93725 13.2 9.59999V16.8C13.2 17.4627 13.7373 18 14.4 18C15.0627 18 15.6 17.4627 15.6 16.8V9.59999C15.6 8.93725 15.0627 8.39999 14.4 8.39999Z"
								fill="currentColor"
							/>
						</svg>
						<span class="text-white text-sm ml-3 text-left">Elimina</span>
					</button>
				{/if}
				
				<button
					class="relative group flex items-center w-full p-2 rounded hover:bg-white/10 transition-colors text-white/80"
					on:click={onClose}
					disabled={$projectStore.sendProjectProgress > 0 ||
						$projectStore.loadProjectProgress > 0}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="w-5 h-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
					<span class="text-white text-sm ml-3 text-left">Chiudi</span>
				</button>
			</div>
		</div>
	</div>

	<!-- Only show the expand button when minimized -->
	{#if isMinimized}
		<button
			class="fixed right-6 top-20 z-[1001] bg-black/70 backdrop-blur-sm rounded-full p-2 shadow-lg border border-white/10 text-white"
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
	.project-details-panel {
		min-width: 250px;
		max-width: 320px;
		transition: all 0.3s ease;
		will-change: transform, left, top;
	}
	
	/* Disable transitions during dragging for smoother movement */
	.project-details-panel:active {
		transition: none !important;
	}
	
	/* Minimized panel styles */
	.project-details-panel.minimized {
		width: 42px;
		height: 42px;
		min-width: unset;
		padding: 8px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.project-details-panel.minimized .panel-content,
	.project-details-panel.minimized .panel-title {
		display: none;
	}
	
	.project-details-panel.minimized .panel-header {
		border: none;
		padding: 0;
		margin: 0;
	}
	
	.project-details-panel button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
