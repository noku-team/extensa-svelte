// VARCO WEBCAM


import { VARCO } from "./VARCO.js";

// //////////////////////////////////////////////////////
// //////////////////////////////////////////////////////

VARCO.p.DEVICES.WEBCAM = {

	videoDeviceList: [],

	stream_height: undefined,

	stream_width: undefined

};



VARCO.f.webcamStreamingStop = function () {

	video.pause();

	video.src = "";

	video.srcObject.getTracks()[0].stop();

};



// cameraType = 'environment' or 'user'
// VARCO.f.initWebCamera( 'environment', 640, 480 );

VARCO.f.initWebCamera = function (cameraType, width, height) {

	VARCO.p.DEVICES.WEBCAM.videoDeviceList = [];

	if (VARCO.p.DEVICES.isIOS && VARCO.p.DEVICES.isSafari) {

		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

			const constraints = { video: { width: 640, height: 480, facingMode: cameraType } };

			// actual width & height of the camera video
			VARCO.p.DEVICES.WEBCAM.stream_width = 640;

			VARCO.p.DEVICES.WEBCAM.stream_height = 480;

			navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {

				// apply the stream to the video element used in the texture
				video.srcObject = stream;

				video.play();

			}).catch(function (error) {

				console.error('Unable to access the camera/webcam.', error);

			});

			navigator.mediaDevices.enumerateDevices().then(

				function (devices) {

					devices.forEach(

						function (device) {

							if (device.kind === "videoinput") {

								VARCO.p.DEVICES.WEBCAM.videoDeviceList.push([device.label, device.deviceId]);

							}

						}
					);
				}

			);

		} else {

			console.error('MediaDevices interface not available.');

		}

	} else {

		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

			navigator.mediaDevices.enumerateDevices().then(

				function (devices) {

					devices.forEach(

						function (device) {

							if (device.kind === "videoinput") {
								VARCO.p.DEVICES.WEBCAM.videoDeviceList.push([device.label, device.deviceId]);
							}

						}

					);

					const constraints = { video: { width: width, height: height, facingMode: cameraType } };

					navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {

						// apply the stream to the video element used in the texture

						video.srcObject = stream;

						video.play();

						let stream_settings = stream.getVideoTracks()[0].getSettings();

						// actual width & height of the camera video

						VARCO.p.DEVICES.WEBCAM.stream_width = width;

						VARCO.p.DEVICES.WEBCAM.stream_height = height;

					}).catch(function (error) {

						console.error('Unable to access the camera/webcam.', error);

					});

				}

			);

		} else {

			console.error('MediaDevices interface not available.');

		}

	}

};