<script>
  import { createEventDispatcher } from 'svelte';
  
  export let isOpen = false;
  export let activeModels = [];
  export let selectedModel = null;
  
  const dispatch = createEventDispatcher();
  
  function handleDeleteModel(modelId) {
    dispatch('deleteModel', { modelId });
  }
  
  function handleSelectModel(modelId) {
    dispatch('selectModel', { modelId });
  }
  
  function handleToggleVisibility(modelId) {
    dispatch('toggleVisibility', { modelId });
  }
  
  function handlePlaceModel() {
    dispatch('placeModel');
  }
  
  function formatCoords(position) {
    if (!position) return 'N/A';
    return `(${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)})`;
  }
  
  function getModelName(path) {
    if (!path) return 'Modello';
    const parts = path.split('/');
    return parts[parts.length - 1].split('.')[0];
  }
</script>

<div class="control-panel" class:open={isOpen}>
  <div class="panel-header">
    <h2>Pannello di Controllo</h2>
    <button class="close-button" on:click={() => dispatch('close')}>
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
      </svg>
    </button>
  </div>
  
  <div class="panel-content">
    <div class="section">
      <h3>Modelli Caricati ({activeModels.length})</h3>
      
      {#if activeModels.length === 0}
        <p class="empty-state">Nessun modello caricato</p>
      {:else}
        <ul class="model-list">
          {#each activeModels as model (model.id)}
            <li 
              class="model-item" 
              class:selected={selectedModel && selectedModel.id === model.id}
              on:click={() => handleSelectModel(model.id)}
            >
              <div class="model-info">
                <span class="model-name">{getModelName(model.path)}</span>
                <span class="model-position">Pos: {formatCoords(model.position)}</span>
              </div>
              
              <div class="model-actions">
                <button 
                  class="model-action visibility-toggle" 
                  class:visible={model.visible !== false}
                  on:click|stopPropagation={() => handleToggleVisibility(model.id)}
                  title={model.visible !== false ? 'Nascondi' : 'Mostra'}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d={model.visible !== false 
                      ? "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                      : "M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"}
                    />
                  </svg>
                </button>
                
                <button 
                  class="model-action delete-button" 
                  on:click|stopPropagation={() => handleDeleteModel(model.id)}
                  title="Elimina"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                </button>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    
    {#if selectedModel}
      <div class="section">
        <h3>Modello Selezionato</h3>
        <div class="selected-model-details">
          <div class="detail-row">
            <span class="detail-label">Nome:</span>
            <span class="detail-value">{getModelName(selectedModel.path)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Posizione:</span>
            <span class="detail-value">{formatCoords(selectedModel.position)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Scala:</span>
            <span class="detail-value">{formatCoords(selectedModel.scale)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Rotazione:</span>
            <span class="detail-value">{formatCoords(selectedModel.rotation)}</span>
          </div>
        </div>
      </div>
    {/if}
    
    <div class="section">
      <h3>Azioni</h3>
      <div class="button-group">
        <button class="action-button" on:click={handlePlaceModel}>
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          Posiziona Modello
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .control-panel {
    position: fixed;
    top: 80px;
    right: -320px;
    width: 320px;
    height: calc(100vh - 100px);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 12px 0 0 12px;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    z-index: 10;
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-right: none;
    overflow: hidden;
  }

  .control-panel.open {
    right: 0;
  }

  .panel-header {
    padding: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .panel-header h2 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
  }

  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    transition: background 0.2s;
  }

  .close-button:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .close-button svg {
    fill: #666;
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .section {
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .section h3 {
    margin: 0 0 12px 0;
    font-size: 1rem;
    font-weight: 500;
    color: #333;
  }

  .empty-state {
    color: #666;
    font-style: italic;
    margin: 10px 0;
    font-size: 0.9rem;
  }

  .model-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .model-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-radius: 6px;
    background: #f5f5f5;
    cursor: pointer;
    transition: all 0.2s;
  }

  .model-item:hover {
    background: #efefef;
  }

  .model-item.selected {
    background: rgba(33, 150, 243, 0.1);
    border: 1px solid rgba(33, 150, 243, 0.3);
  }

  .model-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .model-name {
    font-weight: 500;
    font-size: 0.9rem;
  }

  .model-position {
    font-size: 0.8rem;
    color: #666;
  }

  .model-actions {
    display: flex;
    gap: 6px;
  }

  .model-action {
    background: none;
    border: none;
    padding: 5px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .model-action:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .model-action svg {
    fill: #666;
  }

  .visibility-toggle.visible svg {
    fill: #2196F3;
  }

  .delete-button:hover svg {
    fill: #f44336;
  }

  .selected-model-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .detail-row {
    display: flex;
    font-size: 0.9rem;
  }

  .detail-label {
    width: 80px;
    font-weight: 500;
    color: #666;
  }

  .detail-value {
    color: #333;
  }

  .button-group {
    display: flex;
    gap: 10px;
  }

  .action-button {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #2196F3;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s;
  }

  .action-button:hover {
    background: #1976D2;
  }

  .action-button svg {
    fill: currentColor;
  }
</style> 