<script lang="ts">
	export let src: string;
	export let alt: string;
</script>

<button class="btn btn-neutral btn-square">
	<img {src} {alt} class="w-1/2 h-1/2 inverted-image" />
</button>

<style>
	.inverted-image {
		filter: invert(100%);
	}
</style>
