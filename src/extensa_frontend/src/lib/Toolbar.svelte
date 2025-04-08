<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  const tools = [
    { 
      id: 'view', 
      icon: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
      label: 'Vista'
    },
    { 
      id: 'place', 
      icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      label: 'Posiziona Modello'
    },
    { 
      id: 'transform', 
      icon: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
      label: 'Trasforma'
    },
    { 
      id: 'delete', 
      icon: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
      label: 'Elimina'
    },
    { 
      id: 'grid', 
      icon: 'M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z',
      label: 'Mappa Griglia'
    },
    { 
      id: 'upload', 
      icon: 'M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z',
      label: 'Carica Modello'
    },
    { 
      id: 'save', 
      icon: 'M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z',
      label: 'Salva'
    }
  ];
  
  let activeTool = 'view';
  let isFileInputVisible = false;
  let modelFile = null;
  let mapFile = null;
  
  function handleToolClick(toolId) {
    if (toolId === 'upload') {
      triggerFileUpload('model');
      return;
    }
    
    if (toolId === 'map') {
      triggerFileUpload('map');
      return;
    }
    
    if (toolId === 'grid') {
      dispatch('mapUploaded', { data: 'grid' });
      return;
    }
    
    if (toolId === 'delete') {
      dispatch('deleteSelected');
      return;
    }
    
    if (toolId === 'save') {
      dispatch('saveProject');
      return;
    }
    
    activeTool = toolId;
    dispatch('toolSelected', { tool: toolId });
  }
  
  function triggerFileUpload(type) {
    if (type === 'model') {
      document.getElementById('model-upload').click();
    } else if (type === 'map') {
      document.getElementById('map-upload').click();
    }
  }
  
  function handleModelFileSelected(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    dispatch('modelUploaded', { file, type: file.type });
    
    // Reset file input
    event.target.value = '';
  }
  
  function handleMapFileSelected(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      dispatch('mapUploaded', { file, data: e.target.result });
    };
    reader.readAsDataURL(file);
    
    // Reset file input
    event.target.value = '';
  }
</script>

<div class="toolbar">
  {#each tools as tool}
    <button
      class="tool-button"
      class:active={activeTool === tool.id}
      on:click={() => handleToolClick(tool.id)}
      aria-label={tool.label}
      title={tool.label}
    >
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path d={tool.icon} />
      </svg>
      <span class="tool-label">{tool.label}</span>
    </button>
  {/each}
  
  <input 
    type="file" 
    id="model-upload" 
    accept=".glb,.gltf,.fbx,.obj,.dae" 
    on:change={handleModelFileSelected} 
    style="display: none;"
  />
  
  <input 
    type="file" 
    id="map-upload" 
    accept=".jpg,.jpeg,.png" 
    on:change={handleMapFileSelected} 
    style="display: none;"
  />
</div>

<style>
  .toolbar {
    position: fixed;
    top: 80px;
    left: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    padding: 12px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.05);
    z-index: 10;
  }

  .tool-button {
    background: none;
    border: none;
    width: 100%;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #333;
    text-align: left;
  }

  .tool-button:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .tool-button.active {
    background: rgba(33, 150, 243, 0.1);
    color: #2196F3;
  }

  .tool-button svg {
    fill: currentColor;
    flex-shrink: 0;
  }

  .tool-label {
    font-size: 0.9rem;
    white-space: nowrap;
  }
</style> 