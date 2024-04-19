<script>
	// @ts-nocheck

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
	import getDOMHeight from "../utils/dom/getDOMHeight.js";

	let renderer = null;
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
		app.appendChild(renderer.domElement);

		// //////////////////////////////////////////////////////
		// //////////////////////////////////////////////////////

		// check urlParams //

		let urlParams;
		(window.onpopstate = function () {
			var match,
				pl = /\+/g, // Regex for replacing addition symbol with a space
				search = /([^&=]+)=?([^&]*)/g,
				decode = function (s) {
					return decodeURIComponent(s.replace(pl, " "));
				},
				query = window.location.search.substring(1);

			urlParams = {};
			while ((match = search.exec(query)))
				urlParams[decode(match[1])] = decode(match[2]);
		})();

		VARCO.f.checkDevice();

		window.PLY = PLY;
		window.UI = UI;
		window.MAP = MAP;
		window.EDITOR = EDITOR;
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

		VARCO.f.initMouseEvents();
		VARCO.f.initTouchEvents();
		VARCO.f.initKeyboardEvents();
		VARCO.f.initGpsLocation();
		VARCO.f.initWebCamera("environment", 640, 480);

		VARCO.f.init_AR(renderer, PLY.p.camera3D);

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

		VARCO.f.removeMouseEvents();
		VARCO.f.removeTouchEvents();
	});
</script>

<div id="canvas"></div>

<style>
</style>
