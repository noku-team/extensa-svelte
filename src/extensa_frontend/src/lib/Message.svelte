<script lang="ts">
	import { messageStore } from "../store/MessageStore";
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	
	// Define color styles based on message type
	const colors = {
		error: {
			bg: 'bg-red-900/40',
			border: 'border-red-500/50',
			icon: 'text-red-500'
		},
		warning: {
			bg: 'bg-yellow-900/40',
			border: 'border-yellow-500/50',
			icon: 'text-yellow-500'
		},
		success: {
			bg: 'bg-green-900/40',
			border: 'border-green-500/50',
			icon: 'text-green-500'
		},
		info: {
			bg: 'bg-blue-900/40',
			border: 'border-blue-500/50',
			icon: 'text-blue-500'
		}
	};
</script>

{#if $messageStore.message}
	<div
		role="alert"
		class="fixed top-16 right-4 max-w-sm z-[1000] pointer-events-none"
		in:fly={{ y: -20, duration: 300 }}
		out:fade={{ duration: 200 }}
	>
		<div 
			class="backdrop-blur-sm rounded-lg shadow-lg border overflow-hidden flex items-center p-0 pointer-events-auto {['error', 'warning', 'success', 'info'].includes($messageStore.type) ? 'bg-black/80' : ''} {$messageStore.type === 'error' ? 'border-red-500' : ''} {$messageStore.type === 'warning' ? 'border-yellow-500' : ''} {$messageStore.type === 'success' ? 'border-green-500' : ''} {$messageStore.type === 'info' ? 'border-blue-500' : ''}"
		>
			<div 
				class="w-1.5 h-full self-stretch" 
				class:bg-red-900={$messageStore.type === "error"}
				class:bg-yellow-900={$messageStore.type === "warning"}
				class:bg-green-900={$messageStore.type === "success"}
				class:bg-blue-900={$messageStore.type === "info"}
			></div>
			
			<div class="p-3 flex items-center gap-3">
				<div 
					class:text-red-500={$messageStore.type === "error"}
					class:text-yellow-500={$messageStore.type === "warning"}
					class:text-green-500={$messageStore.type === "success"}
					class:text-blue-500={$messageStore.type === "info"}
				>
					{#if $messageStore.type === "error"}
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
						</svg>
					{:else if $messageStore.type === "warning"}
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
						</svg>
					{:else if $messageStore.type === "success"}
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
						</svg>
					{:else if $messageStore.type === "info"}
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
						</svg>
					{/if}
				</div>
				
				<span class="text-white text-sm font-medium">{$messageStore.message}</span>
			</div>
		</div>
	</div>
{/if}
