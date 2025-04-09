<script>
	import { projectStore } from "../store/ProjectStore";
</script>

{#if $projectStore.sendProjectProgress > 0}
	<div
		class="fixed bottom-16 z-[1000] left-1/2 transform -translate-x-1/2 p-4 rounded-lg flex flex-col items-center gap-3 bg-black/80 backdrop-blur-sm border border-white/20 shadow-lg"
	>
		<span class="text-white text-sm tracking-wide">Invio progetto in corso</span>
		<div class="w-56 h-2 bg-white/10 rounded-full overflow-hidden">
			<div 
				class="h-full bg-white transition-all duration-300 ease-out" 
				style="width: {$projectStore.sendProjectProgress}%;"
			></div>
		</div>
		<span class="text-white/70 text-xs">{Math.floor($projectStore.sendProjectProgress)}%</span>
	</div>
{:else if $projectStore.loadProjectProgress > 0}
	<div
		class="fixed bottom-16 z-[1000] left-1/2 transform -translate-x-1/2 p-4 rounded-lg flex flex-col items-center gap-3 bg-black/80 backdrop-blur-sm border border-white/20 shadow-lg"
	>
		<span class="text-white text-sm tracking-wide">Caricamento progetto in corso</span>
		<div class="w-56 h-2 bg-white/10 rounded-full overflow-hidden">
			<div 
				class="h-full bg-white transition-all duration-300 ease-out" 
				style="width: {$projectStore.loadProjectProgress}%;"
			></div>
		</div>
		<span class="text-white/70 text-xs">{Math.floor($projectStore.loadProjectProgress)}%</span>
	</div>
{/if}

<style>
	.progress {
		transition: width 5s linear;
	}
</style>
