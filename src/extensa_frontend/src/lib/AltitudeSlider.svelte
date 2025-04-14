<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { MAP } from '../jsm';

	export let min: number = 0;
	export let max: number = 1000;
	export let value: number = MAP.p?.actualCoords?.alt ?? 500;
	export let step: number = 10;

	const dispatch = createEventDispatcher();
	let isDragging = false;
	let sliderElement: HTMLDivElement;
	let rangeInput: HTMLInputElement;

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = parseFloat(target.value);
		if (MAP && MAP.p && MAP.p.actualCoords) {
			MAP.p.actualCoords.alt = value;
		}
		dispatch('input', { value });
	}

	function calculateValue(clientY: number): number {
		if (!sliderElement) return value;
		
		const rect = sliderElement.getBoundingClientRect();
		const height = rect.height;
		const relativeY = rect.bottom - clientY;
		const percentage = Math.max(0, Math.min(1, relativeY / height));
		return Math.round((percentage * (max - min) + min) / step) * step;
	}

	function startDrag(event: MouseEvent | TouchEvent) {
		event.preventDefault();
		isDragging = true;
		
		// Initial value set
		let newValue: number = value;
		if (event instanceof MouseEvent) {
			newValue = calculateValue(event.clientY);
		} else if (event.touches[0]) {
			newValue = calculateValue(event.touches[0].clientY);
		}
		
		value = newValue;
		
		// Update MAP coords
		if (MAP && MAP.p && MAP.p.actualCoords) {
			MAP.p.actualCoords.alt = value;
		}
		
		// Capture events
		window.addEventListener('mousemove', handleDrag);
		window.addEventListener('touchmove', handleDrag, { passive: false });
		window.addEventListener('mouseup', stopDrag);
		window.addEventListener('touchend', stopDrag);
	}

	function handleDrag(event: MouseEvent | TouchEvent) {
		if (!isDragging) return;
		event.preventDefault();
		
		let newValue: number = value;
		if (event instanceof MouseEvent) {
			newValue = calculateValue(event.clientY);
		} else if (event.touches[0]) {
			newValue = calculateValue(event.touches[0].clientY);
		}
		
		value = newValue;
		
		// Update MAP coords
		if (MAP && MAP.p && MAP.p.actualCoords) {
			MAP.p.actualCoords.alt = value;
		}
	}

	function stopDrag() {
		isDragging = false;
		window.removeEventListener('mousemove', handleDrag);
		window.removeEventListener('touchmove', handleDrag);
		window.removeEventListener('mouseup', stopDrag);
		window.removeEventListener('touchend', stopDrag);
	}

	// For smoother interaction
	let visualValue = value;
	$: {
		visualValue = value;
	}
	
	$: percentage = ((visualValue - min) / (max - min)) * 100;
	$: formattedValue = value.toFixed(0);
	
	// Clean up event listeners on destroy
	onMount(() => {
		return () => {
			window.removeEventListener('mousemove', handleDrag);
			window.removeEventListener('touchmove', handleDrag);
			window.removeEventListener('mouseup', stopDrag);
			window.removeEventListener('touchend', stopDrag);
		};
	});
</script>

<div class="relative flex flex-col items-center h-48 w-14 py-2">
	<div class="text-white text-xs uppercase tracking-wider font-medium mb-2">Alt</div>
	
	<!-- Value Display -->
	<div class="text-white text-xs font-mono mb-2">{formattedValue}m</div>
	
	<!-- Slider Container -->
	<div bind:this={sliderElement} class="relative h-full w-1 bg-white/20 rounded-full flex justify-center">
		<!-- Major Markings -->
		{#each [0, 25, 50, 75, 100] as percent}
			<div class="absolute w-5 flex items-center" style="bottom: {percent}%;">
				<div class="h-px w-2 bg-white/60"></div>
				<span class="absolute left-full ml-1 text-white/60 text-[8px] font-mono leading-none" style="min-width: 14px;">
					{Math.round(min + (max - min) * (percent / 100))}
				</span>
			</div>
		{/each}
		
		<!-- Minor Markings -->
		{#each [12.5, 37.5, 62.5, 87.5] as percent}
			<div class="absolute w-3" style="bottom: {percent}%;">
				<div class="h-px w-1 bg-white/40"></div>
			</div>
		{/each}
		
		<!-- Filled Track -->
		<div class="absolute bottom-0 w-full bg-white rounded-t-full" 
			 style="height: {percentage}%; transition: height 0.05s ease-out;">
		</div>
		
		<!-- Thumb Indicator - Now directly draggable -->
		<div 
			class="absolute w-5 h-5 bg-black border border-white/80 rounded-full transform -translate-x-1/2 left-1/2 cursor-grab {isDragging ? 'cursor-grabbing' : ''}"
			style="bottom: {percentage}%; margin-bottom: -10px; transition: all 0.05s ease-out;"
			on:mousedown={startDrag}
			on:touchstart={startDrag}
		>
			<div class="absolute inset-1 bg-black border border-white/30 rounded-full flex items-center justify-center">
				<div class="w-1 h-1 bg-white rounded-full"></div>
			</div>
		</div>
		
		<!-- Clickable Track Area - Click anywhere to jump -->
		<div 
			class="absolute h-full w-14 -left-6 cursor-pointer"
			on:mousedown={startDrag}
			on:touchstart={startDrag}
		>
			<!-- Hidden Input - Keep for compatibility and keyboard accessibility -->
			<input
				bind:this={rangeInput}
				type="range"
				id="altitude-slider"
				{min}
				{max}
				{step}
				bind:value={value}
				on:input={handleInput}
				class="vertical-slider"
			/>
		</div>
	</div>
</div>

<style>
	.vertical-slider {
		position: absolute;
		width: 100%;
		height: 100%;
		transform: rotate(270deg);
		transform-origin: center center;
		opacity: 0;
		z-index: 1;
	}
	
	/* Make the slider take up the entire height */
	input[type="range"] {
		height: 100%;
		width: 100%;
		-webkit-appearance: none; 
		appearance: none;
		background: transparent;
	}
	
	/* Hide the default slider thumb */
	input[type="range"]::-webkit-slider-thumb,
	input[type="range"]::-moz-range-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		background: transparent;
	}
</style> 