<script lang="ts">
  import { onMount } from 'svelte';
  
  export let onClose: () => void;
  let isOpen = true;
  
  onMount(() => {
    // Check if the user has already seen the welcome screen
    const hasSeenWelcome = localStorage.getItem('extensa_has_seen_welcome');
    if (hasSeenWelcome) {
      isOpen = false;
    } else {
      localStorage.setItem('extensa_has_seen_welcome', 'true');
    }
  });
  
  function handleClose() {
    isOpen = false;
    onClose();
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
    <div class="bg-black border border-white/20 rounded-lg max-w-md w-full p-6 shadow-xl">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-white text-xl font-semibold">Welcome to Extensa</h2>
        <button 
          class="text-white/70 hover:text-white transition-colors p-1" 
          on:click={handleClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div class="text-white/90 space-y-4 mb-6">
        <p>Thank you for using Extensa! Here's a quick guide to get started:</p>
        
        <div class="space-y-2">
          <div class="flex items-start gap-2">
            <div class="bg-white/10 p-1 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" />
              </svg>
            </div>
            <p class="text-sm">Import a 3D model using the "Import" button on the toolbar</p>
          </div>
          
          <div class="flex items-start gap-2">
            <div class="bg-white/10 p-1 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
              </svg>
            </div>
            <p class="text-sm">Use the transformation tools to position, rotate and scale your model</p>
          </div>
          
          <div class="flex items-start gap-2">
            <div class="bg-white/10 p-1 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
              </svg>
            </div>
            <p class="text-sm">Access advanced settings to customize your experience</p>
          </div>
        </div>
      </div>
      
      <div class="flex justify-end">
        <button 
          class="bg-white text-black px-4 py-2 rounded hover:bg-white/90 transition-colors"
          on:click={handleClose}
        >
          Get Started
        </button>
      </div>
    </div>
  </div>
{/if}