import { VARCO } from "./VARCO.js";

VARCO.p.DEVICES.VR = { enabled: false, isPlaying: false, xrFrame: false, referenceSpaceType: 'local' };

VARCO.p.DEVICES.XR = { enabled: false, isPlaying: false, xrFrame: false, referenceSpaceType: 'local' };

let renderer;

let camera;

async function onSessionStarted_AR(session) {

	session.addEventListener('end', onSessionEnded_AR);

	renderer.xr.setReferenceSpaceType('local');

	await renderer.xr.setSession(session);

	VARCO.p.DEVICES.XR.currentSession = session;

	// // // Inizializza il riferimento alla camera XR

	if (VARCO.p.DEVICES.XR.xrFrame) {

		VARCO.p.DEVICES.XR.currentSession.requestReferenceSpace(VARCO.p.DEVICES.XR.referenceSpaceType).then(function (referenceSpace) {

			VARCO.p.DEVICES.XR.xrReferenceSpace = referenceSpace;

			VARCO.p.DEVICES.XR.updateXRFrame = function (time, frame) {

				VARCO.p.DEVICES.XR.xrCamera = renderer.xr.getCamera().cameras;

				// Ottieni la posizione e la rotazione della camera XR

				VARCO.p.DEVICES.XR.xrPose = frame.getViewerPose(VARCO.p.DEVICES.XR.xrReferenceSpace);

				VARCO.p.DEVICES.XR.currentSession.requestAnimationFrame(VARCO.p.DEVICES.XR.updateXRFrame);

			};

			VARCO.p.DEVICES.XR.currentSession.requestAnimationFrame(VARCO.p.DEVICES.XR.updateXRFrame);

		});

	}

}


function onSessionEnded_AR(/*event*/) {

	VARCO.p.DEVICES.XR.currentSession.removeEventListener('end', onSessionEnded_AR);

	VARCO.p.DEVICES.XR.currentSession = null;

}


VARCO.f.clickButton_AR = function () {

	if (VARCO.p.DEVICES.XR.currentSession === null) {

		// alert( VARCO.p.DEVICES.XR.currentSession );

		VARCO.p.DEVICES.XR.isPlaying = true;

		navigator.xr.requestSession('immersive-ar', VARCO.p.DEVICES.XR.sessionInit).then(onSessionStarted_AR);

	} else {

		if (VARCO.p.DEVICES.XR.currentSession !== undefined) {

			VARCO.p.DEVICES.XR.currentSession.end();

			VARCO.p.DEVICES.XR.isPlaying = false;

			// alert( "EXIT AR" );

		} else {
			// alert( "device non AR" );

			VARCO.p.DEVICES.XR.enabled = false;

			VARCO.p.DEVICES.XR.isPlaying = false;
		}

	}

};



VARCO.f.init_AR = function (sceneRenderer, sceneCamera) {

	renderer = sceneRenderer;

	camera = sceneCamera;

	renderer.xr.enabled = true;

	if ('xr' in navigator) {
		navigator.xr.isSessionSupported('immersive-ar').then(

			function (supported) {

				if (supported !== true) {

					// alert('WEBXR NOT SUPORTED !!');

					VARCO.p.DEVICES.XR.enabled = false;

				} else {
					VARCO.p.DEVICES.XR.currentSession = null;

					// alert('WEBXR READY TO START !!');

					VARCO.p.DEVICES.XR.enabled = true;

					VARCO.p.DEVICES.XR.sessionInit = {};

				}

			}).catch(VARCO.p.DEVICES.XR.enabled = false);

	} else {

		if (window.isSecureContext === false) {

			// console.log('WEBXR NEEDS HTTPS'); // TODO Improve message

			VARCO.p.DEVICES.XR.enabled = false;
		} else {

			//console.log('again again WEBXR NOT AVAILABLE');

			VARCO.p.DEVICES.XR.enabled = false;

		}

	}

};



// -------------
// VR
// -------------

function onSessionStarted_VR(session) {

	session.addEventListener('end', onSessionEnded_VR);

	renderer.xr.setSession(session);

	VARCO.p.DEVICES.VR.currentSession = session;

}



function onSessionEnded_VR(/*event*/) {

	VARCO.p.DEVICES.VR.currentSession.removeEventListener('end', onSessionEnded_VR);

	VARCO.p.DEVICES.VR.currentSession = null;

}



VARCO.f.clickButton_VR = function () {

	if (VARCO.p.DEVICES.VR.currentSession === null) {

		// WebXR's requestReferenceSpace only works if the corresponding feature
		// was requested at session creation time. For simplicity, just ask for
		// the interesting ones as optional features, but be aware that the
		// requestReferenceSpace call will fail if it turns out to be unavailable.
		// ('local' is always available for immersive sessions and doesn't need to
		// be requested separately.)

		VARCO.p.DEVICES.VR.sessionInit = { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'] };

		navigator.xr.requestSession('immersive-vr', VARCO.p.DEVICES.VR.sessionInit).then(onSessionStarted_VR);

		VARCO.p.DEVICES.VR.isPlaying = true;

	} else {

		if (VARCO.p.DEVICES.VR.currentSession !== undefined) {

			VARCO.p.DEVICES.VR.currentSession.end();

			VARCO.p.DEVICES.VR.isPlaying = false;

			// alert( "EXIT VR" );

		} else {
			// alert( "device non VR" );

			VARCO.p.DEVICES.VR.enabled = false;

			VARCO.p.DEVICES.VR.isPlaying = false;
		}

	}

};



VARCO.f.init_VR = function (sceneRenderer) {

	renderer = sceneRenderer;

	renderer.xr.enabled = true;


	if ('xr' in navigator) {

		navigator.xr.isSessionSupported('immersive-vr').then(

			function (supported) {

				if (supported !== true) {

					//console.log('WEBVR NOT SUPORTED !!');

					VARCO.p.DEVICES.VR.enabled = false;

				} else {

					VARCO.p.DEVICES.VR.currentSession = null;

					// console.log('WEBVR READY TO START !!');

					VARCO.p.DEVICES.VR.enabled = true;

				}

			});

	} else {

		if (window.isSecureContext === false) {

			//console.log = 'WEBVR NEEDS HTTPS'; // TODO Improve message

			VARCO.p.DEVICES.VR.enabled = false;

		} else {

			//console.log = 'WEBVR NOT AVAILABLE';

			VARCO.p.DEVICES.VR.enabled = false;

		}

	}

};

