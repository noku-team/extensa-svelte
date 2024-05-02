<script lang="ts">
	import * as THREE from "three";

	import { onDestroy, onMount } from "svelte";
	import { VARCO } from "../VARCO/helpers/VARCO.js";
	import "../VARCO/helpers/VARCO_UI.js";
	import "../VARCO/helpers/VARCO_fileIO.js";
	import "../VARCO/helpers/VARCO_gps_compass.js";
	import "../VARCO/helpers/VARCO_states_motions.js";
	import "../VARCO/helpers/VARCO_webcam.js";
	import "../VARCO/helpers/VARCO_xr.js";

	import { EDITOR, MAP, PLY, UI } from "../jsm/index.js";
	import { authStore } from "../store/AuthStore";
	import { spinnerStore } from "../store/SpinnerStore.js";
	import storeCompleteFile from "../utils/dfinity/geoareas/helpers/storeCompleteFile.js";
	import executeAddGeoarea from "../utils/dfinity/geoareas/methods/addGeoarea";
	import executeAddProject from "../utils/dfinity/geoareas/methods/addProject.js";
	import executeAllocateNewFile from "../utils/dfinity/geoareas/methods/allocateNewFiles.js";
	import getDOMHeight from "../utils/dom/getDOMHeight.js";
	import EditProject from "./EditProject.svelte";
	import SelectedProject from "./SelectedProject.svelte";

	let renderer: any = null;
	onMount(() => {
		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
		renderer.autoClear = false;
		renderer.setPixelRatio(window.devicePixelRatio);
		const height = getDOMHeight(window.innerHeight, 64);
		renderer.setSize(window.innerWidth, height);
		renderer.setClearColor(0x000000, 0);

		renderer.gammaInput = false;
		renderer.gammaOutput = false;
		renderer.gammaFactor = 0.0;

		renderer.xr.enabled = true;
		renderer.domElement.style.position = "absolute";
		renderer.domElement.style.zIndex = 10;
		renderer.localClippingEnabled = true;
		const app = document.getElementById("canvas");
		if (app) app.appendChild(renderer.domElement);

		// //////////////////////////////////////////////////////
		// //////////////////////////////////////////////////////

		// check urlParams //

		let urlParams;
		// @ts-ignore
		(window.onpopstate = function () {
			var match,
				pl = /\+/g, // Regex for replacing addition symbol with a space
				search = /([^&=]+)=?([^&]*)/g,
				decode = function (s: any) {
					return decodeURIComponent(s.replace(pl, " "));
				},
				query = window.location.search.substring(1);

			urlParams = {};
			while ((match = search.exec(query)))
				// @ts-ignore
				urlParams[decode(match[1])] = decode(match[2]);
		})();

		// @ts-ignore
		VARCO.f.checkDevice();

		// @ts-ignore
		window.PLY = PLY;
		// @ts-ignore
		window.UI = UI;
		// @ts-ignore
		window.MAP = MAP;
		// @ts-ignore
		window.EDITOR = EDITOR;
		// @ts-ignore
		window.renderer = renderer;

		// //////////////////////////////////////////////////////
		// //////////////////////////////////////////////////////

		UI.f.initScene();
		PLY.f.initSceneMAP();
		PLY.f.initSceneBKG();
		PLY.f.initScene3D();
		PLY.f.initSceneSTV();

		// //////////////////////////////////////////////////////
		// //////////////////////////////////////////////////////

		// DA CREARE MODULO VARCO_XR con gestione mani e controllers
		PLY.p.controllerA = renderer.xr.getController(0);
		PLY.p.controllerA.addEventListener("selectstart", UI.f.onSelectStart);
		PLY.p.controllerA.addEventListener("selectend", UI.f.onSelectEnd);
		PLY.p.scene3D.add(PLY.p.controllerA);

		// //////////////////////////////////////////////////////
		// //////////////////////////////////////////////////////
		// @ts-ignore
		VARCO.f.initMouseEvents();
		// @ts-ignore
		VARCO.f.initTouchEvents();
		// @ts-ignore
		VARCO.f.initKeyboardEvents();
		// @ts-ignore
		VARCO.f.initGpsLocation();
		// @ts-ignore
		VARCO.f.initWebCamera("environment", 640, 480);
		// @ts-ignore
		VARCO.f.init_AR(renderer, PLY.p.camera3D);
		// @ts-ignore
		VARCO.f.initDropZone(renderer.domElement, EDITOR.f.DROP_FILE, {});

		//VARCO.f.initDataZIP();

		// //////////////////////////////////////////////////////
		// //////////////////////////////////////////////////////

		window.addEventListener("resize", PLY.f.resizeScreen, false);

		document.body.addEventListener("mousedown", UI.f.clicked, false);
		document.body.addEventListener("mouseup", UI.f.clickedEnd, false);

		document.body.addEventListener("touchstart", UI.f.tapped, false);
		document.body.addEventListener("touchend", UI.f.tappedEnd, false);

		PLY.f.resizeScreen();

		// //////////////////////////////////////////////////////
		// //////////////////////////////////////////////////////

		PLY.p.clock = new THREE.Clock();

		const animate = () => renderer.setAnimationLoop(render);
		const render = () => PLY.f.UPDATE(renderer);

		animate();
	});

	onDestroy(() => {
		// Destroy webgl scene
		renderer.dispose();
		renderer = null;

		window.removeEventListener("resize", PLY.f.resizeScreen, false);
		document.body.removeEventListener("mousedown", UI.f.clicked, false);
		document.body.removeEventListener("mouseup", UI.f.clickedEnd, false);

		document.body.removeEventListener("touchstart", UI.f.tapped, false);
		document.body.removeEventListener("touchend", UI.f.tappedEnd, false);
		window.onpopstate = () => null;

		// @ts-ignore
		VARCO.f.removeMouseEvents();
		// @ts-ignore
		VARCO.f.removeTouchEvents();
	});

	const onProjectClick = async () => {
		try {
			if (!$authStore.identity) return;
			if (!process.env.CANISTER_ID_EXTENSA_BACKEND) return;

			spinnerStore.setLoading(true);

			const geoareaId = await executeAddGeoarea({
				identity: $authStore.identity,
				canisterId: process.env.CANISTER_ID_EXTENSA_BACKEND,
				name: "test",
				coords: {
					alt: 0,
					lat: 45.64481184394597,
					lng: 9.817726187892196,
				},
			});

			// test file size for house 3d: 7485520
			const result = await executeAllocateNewFile({
				identity: $authStore.identity,
				canisterId: process.env.CANISTER_ID_EXTENSA_BACKEND,
				fileSize: 7485520,
			});

			const { fileId, numberOfChunks } = result ?? {};

			if (numberOfChunks && fileId) {
				const testFile = await fetch("/USER_DB/test/contents/house.json");
				const fileJson = await testFile.json();
				const file = fileJson.parameters.elementList[0].prop.parameters.url;

				const resultStore = await storeCompleteFile(
					{
						identity: $authStore.identity,
						canisterId: process.env.CANISTER_ID_EXTENSA_BACKEND,
					},
					{
						fileId,
						numberOfChunks,
						file,
					}
				);
				console.warn("finished store file: ", resultStore);
			}

			if (fileId && geoareaId) {
				const resultAddProject = await executeAddProject({
					identity: $authStore.identity,
					canisterId: process.env.CANISTER_ID_EXTENSA_BACKEND,
					geoareaId,
					type: "---",
					name: "House",
					position: {
						x: -5.256669446825981,
						y: 0.025,
						z: 34.826631393283606,
					},
					orientation: { x: 0, y: 0, z: 0 },
					size: { x: 1, y: 1, z: 1 },
					fileId,
				});
				console.warn("resultAddProject: ", resultAddProject);
			}
		} catch (e) {
			console.error(e);
		} finally {
			spinnerStore.setLoading(false);
		}
	};
</script>

<div>
	<button
		class="btn btn-primary"
		on:click={onProjectClick}
		disabled={!$authStore.identity}
		>Click to create geoarea and house project inside!</button
	>
	<div id="canvas"></div>
	<SelectedProject />
	<EditProject />
</div>

<style>
</style>
