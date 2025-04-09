<script lang="ts">
  import Button from "./Button.svelte";
  
  export let title: string;
  export let buttons: any[] = [];
  export let activeId: string | null = null;
  export let toggleActive: (id: any) => void;
  export let deselectBtn: () => void;
</script>

<div class="mb-4">
  <div class="text-white/60 text-[10px] uppercase mb-1 text-center">
    {title}
  </div>
  
  <div class="flex flex-col gap-2">
    {#each buttons as { src, alt, id, enabled = true, tooltip }}
      <div class="relative group">
        <Button
          {src}
          {alt}
          active={activeId === id}
          toggleActive={() => toggleActive(id)}
          deselectBtn={deselectBtn}
          disabled={!enabled}
          className="bg-black border-white/30 hover:border-white w-10 h-10"
        />
        <div class="absolute left-full ml-2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {tooltip}
        </div>
        
        {#if activeId === id}
          <div class="absolute right-full mr-2 h-full flex items-center">
            <div class="h-2/3 w-0.5 bg-white animate-pulse"></div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  @keyframes pulse {
    0%, 100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }
  
  :global(.animate-pulse) {
    animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style> 