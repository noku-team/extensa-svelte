<script lang="ts">
	import cx from "classnames";

	export let showModal: boolean;
	export let top = false;
	export let title: string;
	export let onClose: () => void;

	let dialog: HTMLDialogElement;
	$: if (dialog && showModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
	id="my_modal_3"
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
	<div class="modal-box">
		<form method="dialog">
			<button
				class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
				autofocus
				on:click={() => dialog.close()}>✕</button
			>
		</form>
		<h3 class="font-bold text-lg my-3">{title}</h3>
		<div class="h-auto">
			<slot />
		</div>
	</div>
</dialog>

<style>
</style>
