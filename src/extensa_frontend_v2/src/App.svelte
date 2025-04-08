<script lang="ts">
  import Map from './components/Map/Map.svelte';
  import ModelViewer from './components/ModelViewer/ModelViewer.svelte';
  import { modelStore } from './store/modelStore';
  import { mapStore } from './store/mapStore';
  import type { ModelState } from './types/model';
  import type { MapState } from './types/map';

  let showModelViewer = false;
  let currentModel: ModelState['currentModel'] | null = null;

  function handleModelSave(model: ModelState['currentModel']) {
    if (model) {
      modelStore.update(state => ({
        ...state,
        savedModels: [...state.savedModels, {
          id: Date.now().toString(),
          name: model.name || 'Unnamed Model',
          position: model.position,
          rotation: model.rotation,
          scale: model.scale
        }]
      }));
      showModelViewer = false;
      currentModel = null;
    }
  }

  function handleModelLoad(modelId: string) {
    modelStore.subscribe(state => {
      const model = state.savedModels.find(m => m.id === modelId);
      if (model) {
        currentModel = {
          id: model.id,
          name: model.name,
          position: model.position,
          rotation: model.rotation,
          scale: model.scale
        };
        showModelViewer = true;
      }
    });
  }
</script>

<main>
  <div class="app-container">
    <div class="map-container">
      <Map />
    </div>
    
    {#if showModelViewer}
      <div class="model-viewer-container">
        <ModelViewer {currentModel} on:save={handleModelSave} />
        <button class="close-button" on:click={() => showModelViewer = false}>×</button>
      </div>
    {/if}

    <div class="controls">
      <button class="add-model" on:click={() => showModelViewer = true}>
        Add Model
      </button>
      
      <div class="saved-models">
        <h3>Saved Models</h3>
        {#each $modelStore.savedModels as model}
          <div class="model-item" on:click={() => handleModelLoad(model.id)}>
            {model.name}
          </div>
        {/each}
      </div>
    </div>
  </div>
</main>

<style>
  .app-container {
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;
  }

  .map-container {
    width: 100%;
    height: 100%;
  }

  .model-viewer-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 80%;
    background: white;
    border-radius: 8px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
    z-index: 1000;
  }

  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    z-index: 1001;
  }

  .controls {
    position: absolute;
    top: 20px;
    right: 20px;
    background: white;
    padding: 10px;
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  .add-model {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 10px;
  }

  .saved-models {
    max-height: 200px;
    overflow-y: auto;
  }

  .model-item {
    padding: 8px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
  }

  .model-item:hover {
    background: #f5f5f5;
  }
</style> 