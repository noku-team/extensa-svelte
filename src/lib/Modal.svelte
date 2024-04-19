<script lang="ts">
	export let showModal: boolean;

	let dialog: HTMLDialogElement;
	$: if (dialog && showModal) dialog.showModal();
</script>

<dialog
	id="my_modal_1"
	class="modal"
	bind:this={dialog}
	on:close={() => (showModal = false)}
	on:click|self={() => dialog.close()}
>
	<div class="modal-box" on:click|stopPropagation>
		<slot name="header" />
		<hr class="my-4" />
		<slot />
		<hr class="my-2" />
		<button class="btn" autofocus on:click={() => dialog.close()}>
			close modal
		</button>
	</div>
</dialog>

<style>
</style>
