<script>
	import { UI } from "../jsm";
	import Button from "./MapButtons/Button.svelte";

	let isActive = false;
</script>

<div
	class="fixed left-1/2 transform -translate-x-1/2 bottom-3 z-[1000] flex gap-3"
>
	<Button
		active={isActive}
		isSquare={false}
		toggleActive={() => {
			isActive = !isActive;
			UI.p.menu_bottom.f.button_AR();
		}}>View in AR</Button
	>
</div>
