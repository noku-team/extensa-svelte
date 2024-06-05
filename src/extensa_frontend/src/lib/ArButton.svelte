<script>
	import { UI } from "../jsm";
	import Button from "./MapButtons/Button.svelte";
	import threeD from "/images/UI/icons/3d.png";

	let isActive = false;
</script>

<div
	class="fixed left-1/2 transform -translate-x-1/2 bottom-3 z-[1000] flex gap-3"
>
	<Button
		src={threeD}
		alt="3D"
		active={isActive}
		toggleActive={() => {
			isActive = !isActive;
			UI.p.menu_bottom.f.button_AR();
		}}
		imgClassName="w-7 h-7"
	/>
</div>
