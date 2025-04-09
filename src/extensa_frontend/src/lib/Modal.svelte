<script lang="ts">
	import cx from "classnames";

	export let showModal: boolean;
	export let top = false;
	export let id = "modal";
	export let title: string;
	export let onClose: () => void;

	let dialog: HTMLDialogElement;
	$: {
		if (dialog) {
			if (showModal) dialog.showModal();
			else dialog.close();
		}
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
	{id}
	class={cx("modal", {
		"modal-top": top,
	})}
	bind:this={dialog}
	on:close={() => {
		onClose();
		showModal = false;
	}}
	on:click|self={() => dialog.close()}
>
	<div class="modal-box bg-black border border-white/20 shadow-xl">
		<form method="dialog">
			<button
				class="absolute right-3 top-3 text-white/70 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
				autofocus
				on:click={() => dialog.close()}
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
				</svg>
			</button>
		</form>
		<h3 class="text-white text-xl font-semibold mb-4 pr-8">{title}</h3>
		<div class="text-white/90">
			<slot />
		</div>
	</div>
</dialog>

<style>
	.modal {
		@apply backdrop-blur-sm;
	}
	
	.modal-box {
		max-width: 32rem;
		--tw-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		--tw-shadow-colored: 0 25px 50px -12px var(--tw-shadow-color);
		box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
		width: 100%;
		border-radius: 0.5rem;
		padding: 1.5rem;
	}
</style>
