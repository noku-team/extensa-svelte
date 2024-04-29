import * as THREE from "three";
import getDOMHeight from "../utils/dom/getDOMHeight";

// Renderer singleton
const RENDERERSingleton = (function () {
	let instance;
	function createInstance() {
		return createRenderer();
	}
	return {
		getInstance: function () {
			if (!instance) instance = createInstance();
			return instance;
		},
	};
})();


const createRenderer = () => {
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    });

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

    return renderer;
};

export default RENDERERSingleton;