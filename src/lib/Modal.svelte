<script lang="ts">
	export let showModal: boolean;
	export let title: string;

	let dialog: HTMLDialogElement;
	$: if (dialog && showModal) dialog.showModal();
</script>

<dialog
	id="my_modal_3"
	class="modal"
	bind:this={dialog}
	on:close={() => (showModal = false)}
	on:click|self={() => dialog.close()}
>
	<div class="modal-box">
		<form method="dialog">
			<button
				class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
				autofocus
				on:click={() => dialog.close()}>✕</button
			>
		</form>
		<h3 class="font-bold text-lg my-3">{title}</h3>
		<div>
			<slot />
		</div>
	</div>
</dialog>

<style>
</style>
