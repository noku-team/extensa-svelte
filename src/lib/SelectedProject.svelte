<script>
	import { projectStore } from "../store/ProjectStore";
	import Modal from "./Modal.svelte";

	let showModal = false;

	$: showModal = !!$projectStore.project;
</script>

<Modal
	bind:showModal
	title="Search location"
	onClose={() => projectStore.setProject(null)}
>
	<div class="flex gap-3">
		seleced project: {$projectStore.project?.name}
	</div>
</Modal>

<style></style>
