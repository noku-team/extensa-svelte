<script>
	import { onMount } from "svelte";
	import { Route, Router } from "svelte-routing";
	import Header from "./lib/Header.svelte";
	import Message from "./lib/Message.svelte";
	import User from "./lib/User.svelte";
	import ThreeDViewer from './lib/ThreeDViewer.svelte';
	import Toolbar from './lib/Toolbar.svelte';
	import ControlPanel from './lib/ControlPanel.svelte';
	import { authStore } from "./store/AuthStore";
	import { spinnerStore } from "./store/SpinnerStore";

	export let url = "";

	let controlPanelOpen = false;
	let activeTool = 'view'; // view, place, transform
	let viewer;
	let activeModels = [];
	let selectedModel = null;
	let isLoading = false;
	let loadingMessage = '';

	function handleToolSelected(event) {
		const { tool } = event.detail;
		activeTool = tool;
		
		if (viewer) {
			viewer.setMode(tool);
		}
	}

	function toggleControlPanel() {
		controlPanelOpen = !controlPanelOpen;
	}
	
	function handleObjectSelected(event) {
		const { object } = event.detail;
		selectedModel = object;
	}
	
	function handleModelUploaded(event) {
		const { file, type } = event.detail;
		isLoading = true;
		loadingMessage = `Caricamento di ${file.name}...`;
		
		// Converti il file in URL
		const fileURL = URL.createObjectURL(file);
		
		// Aggiungi il modello alla mappa
		viewer.addModel(fileURL)
			.then(() => {
				isLoading = false;
			})
			.catch(error => {
				console.error('Errore nel caricamento del modello:', error);
				isLoading = false;
			});
	}
	
	function handleMapUploaded(event) {
		const { data } = event.detail;
		
		if (data === 'grid') {
			// Carica la mappa griglia
			viewer.loadMapTexture('grid');
		} else if (event.detail.file) {
			// Crea un URL per il file
			const fileURL = URL.createObjectURL(event.detail.file);
			// Carica la mappa personalizzata
			viewer.loadMapTexture(fileURL);
		}
	}
	
	function handleDeleteSelected() {
		if (viewer && selectedModel) {
			viewer.removeModel(selectedModel.id);
			selectedModel = null;
		}
	}
	
	function handlePlaceModel() {
		activeTool = 'place';
		if (viewer) {
			viewer.setMode('place');
		}
	}
	
	function handleModelsUpdated(event) {
		activeModels = event.detail.models;
	}
	
	function handleViewerReady() {
		// Carica una mappa griglia quando il visualizzatore è pronto
		viewer.loadMapTexture('grid');
	}
	
	function handleSaveProject() {
		alert('Progetto salvato!');
	}

	onMount(() => {
		// Persist auth on page refresh
		authStore.sync();
		
		// Gestori di eventi personalizzati
		document.addEventListener('selectModel', (event) => {
			if (viewer && event.detail && event.detail.model) {
				// Trova modello e seleziona
				console.log('Select model event:', event.detail.model);
			}
		});
		
		document.addEventListener('deleteModel', (event) => {
			if (viewer && event.detail && event.detail.model) {
				// Elimina modello
				console.log('Delete model event:', event.detail.model);
			}
		});
	});
</script>

<Router {url}>
	<Message />
	<main class="flex flex-col h-screen">
		<Header />
		
		<div class="flex-1 relative">
			<ThreeDViewer 
				bind:this={viewer}
				bind:mode={activeTool}
				on:objectSelected={handleObjectSelected}
				on:modelsUpdated={handleModelsUpdated}
				on:viewerReady={handleViewerReady}
			/>
			
			<Toolbar 
				on:toolSelected={handleToolSelected}
				on:modelUploaded={handleModelUploaded}
				on:mapUploaded={handleMapUploaded}
				on:deleteSelected={handleDeleteSelected}
				on:saveProject={handleSaveProject}
			/>
			
			<ControlPanel 
				isOpen={controlPanelOpen}
				activeModels={activeModels}
				selectedModel={selectedModel}
				on:close={() => controlPanelOpen = false}
				on:deleteModel={e => viewer.removeModel(e.detail.modelId)}
				on:selectModel={e => {
					const model = activeModels.find(m => m.id === e.detail.modelId);
					if (model) {
						selectedModel = model;
						handleObjectSelected({ detail: { object: model } });
					}
				}}
				on:toggleVisibility={e => {
					const model = activeModels.find(m => m.id === e.detail.modelId);
					if (model) {
						model.visible = !model.visible;
						model.object.visible = model.visible;
						activeModels = [...activeModels]; // Forza l'aggiornamento
					}
				}}
				on:placeModel={handlePlaceModel}
			/>
			
			<button 
				class="panel-toggle" 
				on:click={toggleControlPanel}
				title={controlPanelOpen ? 'Chiudi pannello' : 'Apri pannello'}
			>
				<svg viewBox="0 0 24 24" width="24" height="24">
					<path d={controlPanelOpen ? 
						'M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z' : 
						'M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z'} 
					/>
				</svg>
			</button>
			
			{#if isLoading}
				<div class="loading-overlay">
					<div class="loading-spinner"></div>
					<p>{loadingMessage}</p>
				</div>
			{/if}
		</div>
		
		<User />
	</main>
</Router>

<style>
	main {
		background-color: #f9f9f9;
	}
	
	.panel-toggle {
		position: fixed;
		top: 80px;
		right: 20px;
		background: white;
		border: none;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		cursor: pointer;
		z-index: 100;
		transition: transform 0.2s;
	}
	
	.panel-toggle:hover {
		transform: scale(1.1);
	}
	
	.panel-toggle svg {
		fill: #666;
	}
	
	.loading-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(255, 255, 255, 0.8);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}
	
	.loading-spinner {
		width: 50px;
		height: 50px;
		border: 5px solid rgba(0, 0, 0, 0.1);
		border-radius: 50%;
		border-top-color: #2196F3;
		animation: spin 1s ease-in-out infinite;
		margin-bottom: 20px;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
