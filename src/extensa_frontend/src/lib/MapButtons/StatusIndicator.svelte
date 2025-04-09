<script lang="ts">
  export let activeToolName: string | null = null;
  export let projectLoaded: boolean = false;
</script>

<div class="fixed top-4 left-6 z-[1001]">
  <div class="bg-black/70 backdrop-blur-sm rounded-lg py-2 px-4 shadow-lg border border-white/10 flex items-center gap-3">
    {#if projectLoaded}
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