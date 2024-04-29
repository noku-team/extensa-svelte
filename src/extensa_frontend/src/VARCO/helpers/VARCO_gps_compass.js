/* eslint-disable no-unused-vars */
/* eslint-disable no-redeclare */
import * as THREE from 'three';
import { VARCO } from "./VARCO.js";

// COMPASS //:

VARCO.p.DEVICES.COMPASS = {

	x: 0.0,

	y: 0.0,

	z: 0.0,

	quaternion: new THREE.Quaternion(),

	setQuaternion: new THREE.Quaternion(),

	flagGyroscopeIsAvaible: false

};



VARCO.f.handleOrientation = function (event) {

	VARCO.p.DEVICES.COMPASS.x = event.beta - 90.0;

	if (VARCO.p.DEVICES.isIOS) {

		VARCO.p.DEVICES.COMPASS.y = 360.0 - event.webkitCompassHeading;

	} else {

		VARCO.p.DEVICES.COMPASS.y = event.alpha + event.gamma;

	}


	VARCO.p.DEVICES.COMPASS.z = event.gamma;


	if (event.alpha !== undefined) {

		var zee = new THREE.Vector3(0, 0, 1);

		var euler = new THREE.Euler();

		var q0 = new THREE.Quaternion();

		var q1 = new THREE.Quaternion(- Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis


		if (VARCO.p.DEVICES.isIOS) {

			var alpha = VARCO.f.deg2rad((event.webkitCompassHeading * -1) - event.gamma)// Z

			var beta = VARCO.f.deg2rad(event.beta)// X'

			var gamma = VARCO.f.deg2rad(event.gamma)// Y''

			var orient = VARCO.f.deg2rad(window.orientation)// O

			euler.set(beta, alpha, - gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us

			VARCO.p.DEVICES.COMPASS.quaternion.setFromEuler(euler); // orient the device

			VARCO.p.DEVICES.COMPASS.quaternion.multiply(q1); // camera looks out the back of the device, not the top

			VARCO.p.DEVICES.COMPASS.quaternion.multiply(q0.setFromAxisAngle(zee, - orient)); // adjust for screen orientation


		} else {

			var alpha = VARCO.f.deg2rad(event.alpha)// Z

			var beta = VARCO.f.deg2rad(event.beta)// 'X'

			var gamma = VARCO.f.deg2rad(event.gamma)// 'Y'

			var orient = VARCO.f.deg2rad(window.orientation)// O

			euler.set(beta, alpha, - gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us

			VARCO.p.DEVICES.COMPASS.quaternion.setFromEuler(euler); // orient the device

			VARCO.p.DEVICES.COMPASS.quaternion.multiply(q1); // camera looks out the back of the device, not the top

			VARCO.p.DEVICES.COMPASS.quaternion.multiply(q0.setFromAxisAngle(zee, - orient)); // adjust for screen orientation

		}

	}

};



VARCO.f.handleMotion = function (event) {

};



VARCO.f.initDeviceOrientation = function () {

	if (DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === "function") {

		DeviceMotionEvent.requestPermission();

	}


	VARCO.p.DEVICES.COMPASS.flagGyroscopeIsAvaible = true;


	if (VARCO.p.DEVICES.isIOS) {

		window.addEventListener("devicemotion", VARCO.f.handleMotion);

		window.addEventListener("deviceorientation", VARCO.f.handleOrientation);

	} else {

		window.addEventListener("devicemotion", VARCO.f.handleMotion);

		window.addEventListener("deviceorientationabsolute", VARCO.f.handleOrientation, true);

	}

};



// //////////////////////////////////////////////////////
// //////////////////////////////////////////////////////

// GPS:

VARCO.p.DEVICES.GPS = {

	accuracy: 100000,
	altitudeAccuracy: 100000,
	speed: 0.0,
	lat: 0.0,
	lng: 0.0,
	altitude: 0.0,
	heading: 0.0,
	timestamp: '',
	message: '',

	options: {
		enableHighAccuracy: true,
		maximumAge: 4000, // should be default, just in case
		timeout: 1500
	},

	bestAccuracyOnly: true,
	accurancyMinDistance: 15.0,
	flagAltitudeFromMap: false

};



VARCO.f.initGpsLocation = function () {

	// coordinate // :
	if (!navigator.geolocation) {
		//alert( "gps in not supported" );

	} else {
		//alert( "gps in supported and try to activate" );

		navigator.geolocation.getCurrentPosition(

			function success(data) {

				VARCO.p.DEVICES.GPS.accuracy = data.coords.accuracy;

				VARCO.p.DEVICES.GPS.speed = data.coords.speed;

				VARCO.p.DEVICES.GPS.lat = data.coords.latitude;

				VARCO.p.DEVICES.GPS.lng = data.coords.longitude;

				VARCO.p.DEVICES.GPS.altitudeAccuracy = data.coords.altitudeAccuracy;

				VARCO.p.DEVICES.GPS.altitude = data.coords.altitude;

				VARCO.p.DEVICES.GPS.heading = data.coords.heading;

				VARCO.p.DEVICES.GPS.timestamp = data.timestamp;

				VARCO.p.DEVICES.GPS.message = "gps activated";

			},

			function error() {

				VARCO.p.DEVICES.GPS.message = "error gps";

			}

		);
	}

};



// ELEVATION MAP WORKS ONLY USING window.google MAP SERVICE

// VARCO.f.getOperStreetMapElevation();

VARCO.f.getOperStreetMapElevation = function (lat, lng) {

	const latitude = 40.7128; // Latitudine di esempio (New York)

	const longitude = -74.0060; // Longitudine di esempio (New York)

	const urlMessage = "https://api.open-elevation.com/api/v1/lookup?locations=41.161758,-8.583933"



	// // Funzione per ottenere l'altitudine data latitudine e longitudine
	// function getAltitude(latitude, longitude) {
	// // Endpoint dell'API di Open Elevation
	// const apiUrl = `https://api.open-elevation.com/api/v1/lookup?locations=${latitude},${longitude}`;

	// // Eseguire una richiesta fetch all'API
	// fetch(apiUrl)
	// .then(response => response.json())
	// .then(data => {
	// // Assicurarsi che i dati siano stati ricevuti correttamente
	// if (data && data.results && data.results.length > 0) {
	// const altitude = data.results[0].elevation;
	// console.log(`L'altitudine al punto (${latitude}, ${longitude}) è: ${altitude} metri`);
	// } else {
	// console.log("Non è stato possibile ottenere l'altitudine per la posizione specificata.");
	// }
	// })
	// .catch(error => {
	// console.error("Errore nell'ottenere l'altitudine:", error);
	// });
	// }

	// // Esempio di utilizzo della funzione
	// getAltitude(45.464211, 9.191383); // Latitudine e longitudine di Milano, Italia

};



VARCO.f.getMapElevation = function (newPosition) {

	// get elevation:

	const elevator = new window.google.maps.ElevationService();

	// Initiate the location request
	elevator.getElevationForLocations(
		{
			locations: [newPosition],
		}
	).then(
		({ results }) => {

			// Retrieve the first result

			if (results[0]) {

				VARCO.p.DEVICES.GPS.altitude = results[0].elevation;

			} else {
				console.error("No results found");
			}

		}).catch((e) =>

			console.error("Elevation service failed due to: " + e)

		);


};



VARCO.f.updateGPS = function () {

	navigator.geolocation.watchPosition(

		function success(data) {

			let checkCoords = false;

			// check the distance between two gps signals
			let gpsDiff = VARCO.f.lonLatDistance(

				{ lng: VARCO.p.DEVICES.GPS.lng, lat: VARCO.p.DEVICES.GPS.lat },

				{ lng: data.coords.latitude, lat: data.coords.latitude },

				"mt"

			);

			if (VARCO.p.DEVICES.GPS.bestAccuracyOnly) {

				if (VARCO.p.DEVICES.GPS.accuracy < VARCO.p.DEVICES.GPS.accurancyMinDistance) {

					checkCoords = true;

				} else {

					checkCoords = false;

				}

				if (gpsDiff > 3.0) {

					checkCoords = true;

				}

			} else {

				checkCoords = true;

			}


			// signal has got engouth quality , so update the gps data 
			if (checkCoords) {

				VARCO.p.DEVICES.GPS.accuracy = data.coords.accuracy;

				VARCO.p.DEVICES.GPS.speed = data.coords.speed;

				VARCO.p.DEVICES.GPS.lat = data.coords.latitude;

				VARCO.p.DEVICES.GPS.lng = data.coords.longitude;

				VARCO.p.DEVICES.GPS.altitudeAccuracy = data.coords.altitudeAccuracy;


				if (VARCO.p.DEVICES.GPS.flagAltitudeFromMap && VARCO.p.DEVICES.GPS.altitudeAccuracy > 10) {

					let newPosition = new window.google.maps.LatLng(
						{

							lat: VARCO.p.DEVICES.GPS.lat,

							lng: VARCO.p.DEVICES.GPS.lng

						}
					);

					VARCO.f.getMapElevation(newPosition);

				} else {

					VARCO.p.DEVICES.GPS.altitude = data.coords.altitude;
				}

				VARCO.p.DEVICES.GPS.heading = data.coords.heading;

				VARCO.p.DEVICES.GPS.timestamp = data.timestamp;

				VARCO.p.DEVICES.GPS.message = "gps data updated"

			} else {

				VARCO.p.DEVICES.GPS.message = "gps signal is not good enought"

			}

		},

		function error() {

			VARCO.p.DEVICES.GPS.message = "error gps";

		},

		VARCO.p.DEVICES.GPS.options

		// {
		// enableHighAccuracy : true,
		// maximumAge: 4000, // should be default, just in case
		// timeout: 1500
		// }

	);

};


// //////////////////////////////////////////////////////
// //////////////////////////////////////////////////////
