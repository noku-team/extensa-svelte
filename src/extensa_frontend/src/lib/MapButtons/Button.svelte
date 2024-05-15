<script lang="ts">
    import cx from "classnames";
    
	export let src: string;
	export let alt: string;
	export let active: boolean;
	export let toggleActive: () => void;
</script>

<button
	on:click={toggleActive}
	class={cx("btn btn-square", {
		"btn-primary": active,
		"btn-neutral": !active,
	})}
>
	<img {src} {alt} class="w-1/2 h-1/2" class:inverted-image={!active} />
</button>

<style>
	.inverted-image {
		filter: invert(100%);
	}
</style>
