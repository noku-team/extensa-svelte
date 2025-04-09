<script>
	import { UI } from "../jsm";
	import Button from "./MapButtons/Button.svelte";

	let isActive = false;
</script>

<div class="fixed left-1/2 transform -translate-x-1/2 bottom-6 z-[1000]">
	<Button
		active={isActive}
		isSquare={false}
		toggleActive={() => {
			isActive = !isActive;
			UI.p.menu_bottom.f.button_AR();
		}}
		className="bg-black/70 backdrop-blur-sm border border-white/30 hover:border-white py-2 px-6 rounded-full shadow-lg"
	>
		<div class="flex items-center gap-2">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5 fill-current">
				<path d="M12 8a4 4 0 00-4 4 4 4 0 004 4 4 4 0 004-4 4 4 0 00-4-4zm0 6a2 2 0 01-2-2 2 2 0 012-2 2 2 0 012 2 2 2 0 01-2 2z"></path>
				<path d="M11.42 2.88C7.26 3.39 4 7.03 4 11.42c0 3.05 1.59 5.72 3.97 7.23l2.47-4.43A5.94 5.94 0 018 11.42c0-3.16 2.35-5.77 5.42-6.13l-2-2.41zM16.03 3.6L12 7.79l-2.41-2a1 1 0 00-1.37.15 1 1 0 00.15 1.37l2.74 2.28L5.04 17 4 15.78a1 1 0 00-1.37 0 1 1 0 000 1.37l2 1.66a.5.5 0 00.54.08A6.94 6.94 0 0011.31 22l.11-.01c4.39-.52 7.58-4.35 7.58-8.8 0-3.16-1.74-5.92-4.33-7.3l1.37-1.37a1 1 0 00-1.37-1.37L12 4.83 9.41 2.8a1 1 0 00-1.38.18 1 1 0 00.18 1.37L10.62 6 16.36 1a1 1 0 00.03-1.41 1 1 0 00-1.41.01l1.05 4z"></path>
			</svg>
			<span class="font-medium text-white">Visualizza in AR</span>
		</div>
	</Button>
</div>

<style>
	:global(.btn-primary) {
		@apply bg-white text-black border-white !important;
	}
	
	:global(.btn-neutral) {
		@apply bg-black text-white border-white/30 !important;
	}
</style>
