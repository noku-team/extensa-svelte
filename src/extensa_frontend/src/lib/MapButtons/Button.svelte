<script lang="ts">
	import cx from "classnames";
	import { beforeUpdate } from "svelte";

	export let id: string | undefined = undefined;
	export let src: string;
	export let alt: string;
	export let isSquare = true;
	export let active: boolean;
	export let disabled = false;
	export let toggleActive: () => void;
	export let deselectBtn: (_id?: string) => void = () => null;
	export let className = "";
	export let imgClassName = "";

	let wasDisabled = disabled;

	beforeUpdate(() => {
		if (wasDisabled !== disabled) {
			deselectBtn(id);
			wasDisabled = disabled;
		}
	});
</script>

<button
	on:click={toggleActive}
	{disabled}
	class={cx(
		"btn transition-all duration-200 ease-in-out",
		{
			"btn-primary": active,
			"btn-neutral": !active,
			"btn-square": isSquare,
		},
		className
	)}
	aria-label={alt}
>
	{#if src}
		<img
			{src}
			{alt}
			class={cx("w-1/2 h-1/2 transition-all duration-200", imgClassName)}
			class:inverted-image={!active}
			class:disabled-image={disabled}
		/>
	{:else}
		<slot />
	{/if}
</button>

<style>
	.inverted-image {
		filter: invert(100%);
	}

	.disabled-image {
		opacity: 0.4;
		filter: grayscale(100%) invert(30%);
	}
	
	button {
		position: relative;
		overflow: hidden;
	}
	
	button::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%);
		pointer-events: none;
	}
	
	button:active::after {
		background: rgba(0,0,0,0.1);
	}
</style>
