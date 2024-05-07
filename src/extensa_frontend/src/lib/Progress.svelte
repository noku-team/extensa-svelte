<script>
	import { projectStore } from "../store/ProjectStore";
</script>

{#if $projectStore.sendProjectProgress > 0}
	<div
		class="bg-base-100 fixed bottom-[100px] z-[1000] left-1/2 transform -translate-x-1/2 p-3 rounded-xl flex flex-col items-center gap-2"
	>
		<span class="text-sm font-light"> Sending project... </span>
		<progress
			class="progress progress-primary w-56 extensa-progress"
			value={$projectStore.sendProjectProgress}
			max="100"
		></progress>
	</div>
{:else if $projectStore.loadProjectProgress > 0}
	<div
		class="bg-base-100 fixed bottom-[100px] z-[1000] left-1/2 transform -translate-x-1/2 p-3 rounded-xl flex flex-col items-center gap-2"
	>
		<span class="text-sm font-light"> Loading project... </span>
		<progress
			class="progress progress-primary w-56"
			value={$projectStore.loadProjectProgress}
			max="100"
		></progress>
	</div>
{/if}

<style>
	.progress {
		transition: width 5s linear;
	}
</style>
