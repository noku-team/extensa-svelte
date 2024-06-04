<script lang="ts">
	import cx from "classnames";
	import { beforeUpdate } from "svelte";

	export let src: string;
	export let alt: string;
	export let active: boolean;
	export let disabled = false;
	export let toggleActive: () => void;
	export let deselectBtn: () => void = () => null;
	export let className = "";
	export let imgClassName = "";

	let wasDisabled = disabled;

	beforeUpdate(() => {
		if (wasDisabled !== disabled) {
			deselectBtn();
			wasDisabled = disabled;
		}
	});
</script>

<button
	on:click={toggleActive}
	{disabled}
	class={cx(
		"btn btn-square hover:bg-primary hover:border-primary",
		{
			"btn-primary": active,
			"btn-neutral": !active,
		},
		className
	)}
>
	<img
		{src}
		{alt}
		class={cx("w-1/2 h-1/2", imgClassName)}
		class:inverted-image={!active}
		class:disabled-image={disabled}
	/>
</button>

<style>
	.inverted-image {
		filter: invert(100%);
	}

	.disabled-image {
		filter: invert(30%);
	}
</style>
