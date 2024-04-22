// @ts-nocheck
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-global-assign */
/* eslint-disable no-case-declarations */
// MODULE
import * as THREE from 'three';
// Instantiate a loader

import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { TDSLoader } from 'three/addons/loaders/TDSLoader.js';
import { USDZLoader } from 'three/addons/loaders/USDZLoader.js';

// Math
import { OBB } from 'three/addons/math/OBB.js';
import getDOMHeight from '../../utils/dom/getDOMHeight';


let VARCO = {
	p: {
		DEVICES: {
			gamepad: null,
			mouse: null,
			touch: null,
			keyboard: null,
			eventType: null,
			isIOS: false,
			isSafari: false

		},
		SOUNDS: {},

		RAYCAST: new THREE.Raycaster(),
		CLOCK: new THREE.Clock(),

		DELTAT: 0,
		DELTA_STARTTIME: new Date().getTime(),
		isVISIBLE: true,

		zipList: []
	},
	f: {},
	button: {}
};

VARCO.f.objectClone = function (source) {
	if (Object.prototype.toString.call(source) === '[object Array]') {
		var clone = [];
		for (var i = 0; i < source.length; i++) {
			clone[i] = VARCO.f.objectClone(source[i]);
		}
		return clone;
	} else if (typeof (source) == "object") {
		var clone = {};
		for (var prop in source) {
			if (source.hasOwnProperty(prop)) {
				clone[prop] = VARCO.f.objectClone(source[prop]);
			}
		}
		return clone;
	} else {
		return source;
	}
};



VARCO.f.checkCollisionOBB = function (objA, objB) {

	let results = { collision: false };

	if (objA !== undefined && objB !== undefined) {

		if (objA.MM3D.OBB.object.intersectsOBB(objB.MM3D.OBB.object) === true) {

			results.collision = true

			results.objA = objA;

			results.objB = objB;

		}
	}

	return results

};




VARCO.f.array_swap = function (arr, i1, i2) {
	// Step 1
	let temp = arr[i1];

	// Step 2
	arr[i1] = arr[i2];

	// Step 3
	arr[i2] = temp;

};



// returns [2, 1, 3]
// console.log(array_move([1, 2, 3], 0, 1)); 

VARCO.f.array_move = function (arr, old_index, new_index) {

	if (new_index >= arr.length) {

		var k = new_index - arr.length + 1;

		while (k--) {

			arr.push(undefined);

		}

	}

	arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);

	return arr;
};




VARCO.f.arrayBufferToBase64 = function (buffer) {
	var binary = '';
	var bytes = new Uint8Array(buffer);
	var len = bytes.byteLength;
	for (var i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return window.btoa(binary);
}



VARCO.f.base64ToArrayBuffer = function (base64) {
	var binary_string = window.atob(base64);
	var len = binary_string.length;
	var bytes = new Uint8Array(len);
	for (var i = 0; i < len; i++) {
		bytes[i] = binary_string.charCodeAt(i);
	}
	return bytes.buffer;
}



// JavaScript program to get the function
// name/values dynamically

VARCO.f.checkDevice = function () {

	// Controlla se il dispositivo è iOS
	VARCO.p.DEVICES.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

	// Controlla se il browser è Safari
	VARCO.p.DEVICES.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

	// Controlla se il browser è Mobile
	VARCO.p.DEVICES.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

};



VARCO.f.checkDevice();



VARCO.f.getInfoDevice = function () {

	const memory = navigator.deviceMemory;
	const hardware = navigator.hardwareConcurrency;
	const connection = navigator.connection;

	let nVer = navigator.appVersion;
	let nAgt = navigator.userAgent;
	let browserName = navigator.appName;
	let fullVersion = '' + parseFloat(navigator.appVersion);
	let majorVersion = parseInt(navigator.appVersion, 10);
	let nameOffset, verOffset, ix;

	// In Opera, the true version is after "OPR" or after "Version"
	if ((verOffset = nAgt.indexOf("OPR")) != -1) {
		browserName = "Opera";
		fullVersion = nAgt.substring(verOffset + 4);
		if ((verOffset = nAgt.indexOf("Version")) != -1)
			fullVersion = nAgt.substring(verOffset + 8);
	}
	// In MS Edge, the true version is after "Edg" in userAgent
	else if ((verOffset = nAgt.indexOf("Edg")) != -1) {
		browserName = "Microsoft Edge";
		fullVersion = nAgt.substring(verOffset + 4);
	}
	// In MSIE, the true version is after "MSIE" in userAgent
	else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
		browserName = "Microsoft Internet Explorer";
		fullVersion = nAgt.substring(verOffset + 5);
	}
	// In Chrome, the true version is after "Chrome" 
	else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
		browserName = "Chrome";
		fullVersion = nAgt.substring(verOffset + 7);
	}
	// In Safari, the true version is after "Safari" or after "Version" 
	else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
		browserName = "Safari";
		fullVersion = nAgt.substring(verOffset + 7);
		if ((verOffset = nAgt.indexOf("Version")) != -1)
			fullVersion = nAgt.substring(verOffset + 8);
	}
	// In Firefox, the true version is after "Firefox" 
	else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
		browserName = "Firefox";
		fullVersion = nAgt.substring(verOffset + 8);
	}
	// In most other browsers, "name/version" is at the end of userAgent 
	else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) <
		(verOffset = nAgt.lastIndexOf('/'))) {
		browserName = nAgt.substring(nameOffset, verOffset);
		fullVersion = nAgt.substring(verOffset + 1);
		if (browserName.toLowerCase() == browserName.toUpperCase()) {
			browserName = navigator.appName;
		}
	}
	// trim the fullVersion string at semicolon/space if present
	if ((ix = fullVersion.indexOf(";")) != -1)
		fullVersion = fullVersion.substring(0, ix);
	if ((ix = fullVersion.indexOf(" ")) != -1)
		fullVersion = fullVersion.substring(0, ix);

	majorVersion = parseInt('' + fullVersion, 10);
	if (isNaN(majorVersion)) {
		fullVersion = '' + parseFloat(navigator.appVersion);
		majorVersion = parseInt(navigator.appVersion, 10);
	}

	VARCO.p.DEVICES.systemInfo = {
		memory: memory,
		hardware: hardware,
		connection: connection,
		appVersion: nVer,
		agent: nAgt,
		browser: browserName,
		fullVersion: fullVersion,
		majorVersion: majorVersion
	};

};



VARCO.f.getInfoDevice();



VARCO.f.deg2rad = function (angle) {

	return (angle / 180) * Math.PI;

};



VARCO.f.rad2deg = function (rad) {

	return rad / Math.PI * 180;

};



VARCO.f.mathInterpolateTo = function (valueStart, valueEnd, intPerc) {

	let step = ((valueEnd - valueStart)) * intPerc;

	let newValue = (valueStart + step);

	return newValue;

};



VARCO.f.findIndexOf = function (item, array) {

	var num = -1;

	for (num = 0; num < array.length; num += 1) {

		if (array[num] === item) {
			break;

		}

	}

	return num

};



VARCO.f.stringToFunction = function (functionName) {

	let context = window;

	let namespaces = functionName.split(".");

	let func = namespaces.pop();

	let value;

	if (namespaces.length > 0) {

		for (var i = 0; i < namespaces.length; i++) {

			if (context[namespaces[i]] !== undefined) {

				context = context[namespaces[i]];

			}

		}

		value = context[func];

	} else {

		value = context[functionName];

	}

	return value;

};



VARCO.f.stringToVariable = function (value, variable) {

	// let context = window; // normal js

	let context = window;

	let namespaces = variable.split(".");

	let func = namespaces.pop();

	if (namespaces.length > 0) {

		for (var i = 0; i < namespaces.length; i++) {

			if (context[namespaces[i]] !== undefined) {

				context = context[namespaces[i]];

			}

		}

	}

	context[func] = value;

	return context;

};



VARCO.f.variableToString = function (variable) {

	// let context = window; // normal js

	let context = window;

	let value;

	if (variable !== undefined) {

		let namespaces = variable.split(".");

		let func = namespaces.pop();

		value = undefined;

		if (namespaces.length > 0) {

			for (var i = 0; i < namespaces.length; i++) {

				if (context[namespaces[i]] !== undefined) {


					context = context[namespaces[i]];

					value = context[func];

				}

			}

		} else {

			value = context[variable];

		}

	}

	return value;

};



VARCO.f.valueToVariable = function (value, variable) {

	// var context = window; // normal js

	let context = window;

	let namespaces = variable.split(".");

	let func = namespaces.pop();

	let valueVar = undefined;

	if (namespaces.length > 0) {

		for (var i = 0; i < namespaces.length; i++) {

			if (context[namespaces[i]] !== undefined) {

				context = context[namespaces[i]];

			}
		}

		context[func] = value;

	} else {

		context[variable] = value;

	}

	return context;

};



// //////////// ///////// ///////////////
// //////////// ///////// ///////////////
// //////////// ///////// ///////////////

// GEOLOCATION FUNCTIONS

VARCO.f.lonLatToPos = function (sizeH, sizeV, lonLatStart, lonLatEnd, lonLat) {

	if (sizeH === -1) {
		sizeH = VARCO.f.lonLatDistance(lonLatStart, { lng: lonLatEnd.lng, lat: lonLatStart.lat }, "mt");
	}


	if (sizeV === -1) {
		sizeV = VARCO.f.lonLatDistance(lonLatStart, { lat: lonLatEnd.lat, lng: lonLatStart.lng }, "mt");
	}


	var diffLon = lonLatEnd.lng - lonLatStart.lng;

	var diffLat = lonLatEnd.lat - lonLatStart.lat;


	var U = (lonLat.lng - lonLatStart.lng) / diffLon;

	var V = (lonLat.lat - lonLatStart.lat) / diffLat;


	var X = U * sizeH;

	var Z = V * sizeV;


	return { x: X, y: lonLat.alt, z: Z };

};



VARCO.f.posToLonLat = function (sizeH, sizeV, lonLatStart, lonLatEnd, pos) {

	if (sizeH === -1) {

		sizeH = MM3D.f.lonLatDistance(lonLatStart, { lng: lonLatEnd.lng, lat: lonLatStart.lat }, "mt");

	}


	if (sizeV === -1) {

		sizeV = MM3D.f.lonLatDistance(lonLatStart, { lat: lonLatEnd.lat, lng: lonLatStart.lng }, "mt");

	}


	var diffLon = lonLatEnd.lng - lonLatStart.lng;

	var diffLat = lonLatStart.lat - lonLatEnd.lat;


	var U = pos.x / sizeH;

	var V = pos.z / sizeV;


	var lng = lonLatStart.lng + (diffLon * U);

	var lat = lonLatStart.lat - (diffLat * V);


	return { lng: lng, lat: lat, alt: pos.y };

};



VARCO.f.lonLatDistance = function (lonLatStart, lonLatEnd, unit) {

	var p = 0.017453292519943295;    // Math.PI / 180

	var c = Math.cos;

	var a = 0.5 - c((lonLatEnd.lat - lonLatStart.lat) * p) / 2 + c(lonLatStart.lat * p) * c(lonLatEnd.lat * p) * (1 - c((lonLatEnd.lng - lonLatStart.lng) * p)) / 2;

	var dist = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km

	var newDist;


	switch (unit) {

		case "cm":

			newDist = dist * 100000;

			break;

		case "dm":

			newDist = dist * 10000;

			break;

		case "mt":

			newDist = dist * 1000;

			break;

		case "km":

			newDist = dist;

			break;
	}


	return newDist;

};



VARCO.f.fromCoordsToPosition = function (p) {

	let vtPos;
	let coords_dd;
	let alt = p.coords.alt;

	if (p.coords.type == "DMT") {

		let lng = MM3D.f.dmsToDd(
			p.coords.lng.degrees,
			p.coords.lng.minutes,
			p.coords.lng.seconds,
			"E",
			"N"
		);

		let lat = MM3D.f.dmsToDd(
			p.coords.lat.degrees,
			p.coords.lat.minutes,
			p.coords.lat.seconds,
			"E",
			"N"
		);

		coords_dd = { type: "DD", alt: alt, lng: lng, lat: lat };


	} else {

		coords_dd = { type: "DD", alt: alt, lng: p.coords.lng, lat: p.coords.lat };

	}

	vtPos = VARCO.f.lonLatToPos(
		p.size.h,
		p.size.v,
		p.lonLatA,
		p.lonLatB,
		{
			lng: coords_dd.lng,
			lat: coords_dd.lat,
			alt: coords_dd.alt
		}
	);


	return { pos: vtPos, coords_dd: coords_dd };

};



VARCO.f.tilesToPixels = function (lon, lat, zoom) {

	const C = 40075016.686; // earth circ
	const tileSize = 256;

	let Stile = C * Math.cos(lat) / Math.pos(2, (zoom));
	let Spx = Stile / tileSize;

};



// This function returns the coordinate
// conversion string in DD to DMS.
VARCO.f.ddToDms = function (lat, lng) {

	var lat = lat;
	var lng = lng;
	var latResult, lngResult, dmsResult;

	lat = parseFloat(lat);
	lng = parseFloat(lng);
	latResult = (lat >= 0) ? 'N' : 'S';

	// Call to getDms(lat) function for the coordinates of Latitude in DMS.
	// The result is stored in latResult variable.

	latResult += MM3D.f.getDms(lat);
	lngResult = (lng >= 0) ? 'E' : 'W';

	// Call to getDms(lng) function for the coordinates of Longitude in DMS.
	// The result is stored in lngResult variable.

	lngResult += MM3D.f.getDms(lng);

	// Joining both variables and separate them with a space.

	dmsResult = latResult + ' ' + lngResult;

	// Return the resultant string
	return;
}



VARCO.f.getDms = function (val) {

	var valDeg, valMin, valSec, result;
	val = Math.abs(val);

	valDeg = Math.floor(val);
	result = valDeg + "º";

	valMin = Math.floor((val - valDeg) * 60);
	result += valMin + "'";

	valSec = Math.round((val - valDeg - valMin / 60) * 3600 * 1000) / 1000;
	result += valSec + '"';

	return result;
}



VARCO.f.dmsToDd = function (degree, minutes, seconds, directionH, directionV) {

	var value = degree + (minutes / 60.0) + (seconds / 3600.0);

	if (directionH == "S" || directionV == "W") {
		dd = dd * -1;
	}

	return value;

}



VARCO.f.Wgs2Utm = function (lan1, fi) {

	var a = 6378137.000;
	var b = 6356752.314;
	var f = (a - b) / a;
	var e2 = Math.sqrt((Math.pow(a, 2) - Math.pow(b, 2)) / Math.pow(b, 2));
	var e = Math.sqrt((Math.pow(a, 2) - Math.pow(b, 2)) / Math.pow(a, 2));

	var zone;
	var lan0;

	if (lan1 > 0) {
		var zone = 30 + Math.ceil(lan1 / 6);
		lan0 = Math.floor(lan1 / 6) * 6 + 3;
	} else {
		var zone = 30 - Math.floor(Math.abs(lan1) / 6);
		lan0 = -Math.floor(Math.abs(lan1) / 6) * 6 - 3;
	}

	//-----------------------------------------------

	var lan = lan1 - lan0;
	lan = lan * Math.PI / 180;
	fi = fi * Math.PI / 180;

	var N = a / Math.pow(1 - Math.pow(e, 2) * Math.pow(Math.sin(fi), 2), 0.5);
	var M = a * (1 - Math.pow(e, 2)) / Math.pow((1 - (Math.pow(e, 2) * Math.pow(Math.sin(fi), 2))), (3 / 2));
	var t = Math.tan(fi);
	var p = N / M;

	//----------------------------------------------

	var k0 = 0.9996;
	var term1 = Math.pow(lan, 2) * p * Math.pow(Math.cos(fi), 2) / 2;
	var term2 = Math.pow(lan, 4) * Math.pow(Math.cos(fi), 4) * (4 * Math.pow(p, 3) * (1 - 6 * Math.pow(t, 2)) + Math.pow(p, 2) * (1 + 24 * Math.pow(t, 2)) - 4 * p * Math.pow(t, 2)) / 24;
	var term3 = Math.pow(lan, 6) * Math.pow(Math.cos(fi), 6) * (61 - 148 * Math.pow(t, 2) + 16 * Math.pow(t, 4)) / 720;
	var Kutm = k0 * (term1 + term2 + term3);

	//----------------------------------------------

	term1 = Math.pow(lan, 2) * p * Math.pow(Math.cos(fi), 2) * (p - Math.pow(t, 2)) / 6;
	term2 = Math.pow(lan, 4) * Math.pow(Math.cos(fi), 4) * (4 * Math.pow(p, 3) * (1 - 6 * Math.pow(t, 2)) + Math.pow(p, 2) * (1 + 8 * Math.pow(t, 2)) - Math.pow(p, 2) * Math.pow(t, 2) + Math.pow(t, 4)) / 120;
	term3 = Math.pow(lan, 6) * Math.pow(Math.cos(fi), 6) * (61 - 479 * Math.pow(t, 2) + 179 * Math.pow(t, 4) - Math.pow(t, 6)) / 5040;

	var Xutm = 500000 + k0 * lan * N * Math.cos(fi) * (1 + term1 + term2 + term3);

	//----------------------------------------------

	var A0 = 1 - 0.25 * Math.pow(e, 2) - 3 / 64 * Math.pow(e, 4) - 5 / 256 * Math.pow(e, 6);
	var A2 = 3 / 8 * (Math.pow(e, 2) + 0.25 * Math.pow(e, 4) + 15 / 128 * Math.pow(e, 6));
	var A4 = 15 / 256 * (Math.pow(e, 4) + 0.75 * Math.pow(e, 6));
	var A6 = 35 / 3072 * Math.pow(e, 6);
	var sfi = a * (A0 * fi - A2 * Math.sin(2 * fi) + A4 * Math.sin(4 * fi) - A6 * Math.sin(6 * fi));

	//----------------------------------------------

	term1 = Math.pow(lan, 2) * N * Math.sin(fi) * Math.cos(fi) / 2;
	term2 = Math.pow(lan, 4) * N * Math.sin(fi) * Math.pow(Math.cos(fi), 3) * (4 * Math.pow(p, 2) + p - Math.pow(t, 2)) / 24;
	term3 = Math.pow(lan, 6) * N * Math.sin(fi) * Math.pow(Math.cos(fi), 5) * (8 * Math.pow(p, 4) * (11 - 24 * Math.pow(t, 2)) - 28 * Math.pow(p, 3) * (1 - 6 * Math.pow(t, 2)) + Math.pow(p, 2) * (1 - 32 * Math.pow(t, 2)) - p * 2 * Math.pow(t, 2) + Math.pow(t, 4));

	var term4 = Math.pow(lan, 8) * N * Math.sin(fi) * Math.pow(Math.cos(fi), 7) * (1385 - 3111 * Math.pow(t, 2) + 543 * Math.pow(t, 4) - Math.pow(t, 6));
	var Yutm = k0 * (sfi + term1 + term2 + term3 + term4);
	var sn = 'N';

	if (fi < 0) {
		Yutm = 10000000 + Yutm;
		sn = 'S';
	}

	return Xutm.toString().concat(" ; " + Yutm.toString() + " " + zone.toString() + sn);

}



VARCO.f.Utm2Wgs = function (X, Y, zone, sn) {

	if (sn == 'S') {
		Y = Y - 10000000;
	}

	X = X - 500000;

	var sa = 6378137.000000;
	var sb = 6356752.314245;
	var e = Math.pow(Math.pow(sa, 2) - Math.pow(sb, 2), 0.5) / sa;
	var e2 = Math.pow(Math.pow(sa, 2) - Math.pow(sb, 2), 0.5) / sb;
	var e2cuadrada = Math.pow(e2, 2);
	var c = Math.pow(sa, 2) / sb;

	var S = ((zone * 6) - 183);
	var lat = Y / (6366197.724 * 0.9996);
	var v = (c * 0.9996) / Math.pow(1 + (e2cuadrada * Math.pow(Math.cos(lat), 2)), 0.5);
	var a = X / v;
	var a1 = Math.sin(2 * lat);
	var a2 = a1 * Math.pow(Math.cos(lat), 2);
	var j2 = lat + (a1 / 2);
	var j4 = ((3 * j2) + a2) / 4;
	var j6 = ((5 * j4) + (a2 * Math.pow(Math.cos(lat), 2))) / 3;
	var alfa = (3 / 4) * e2cuadrada;
	var beta = (5 / 3) * Math.pow(alfa, 2);
	var gama = (35 / 27) * Math.pow(alfa, 3);
	var Bm = 0.9996 * c * (lat - alfa * j2 + beta * j4 - gama * j6);
	var b = (Y - Bm) / v;
	var Epsi = ((e2cuadrada * Math.pow(a, 2)) / 2) * Math.pow(Math.cos(lat), 2);
	var Eps = a * (1 - (Epsi / 3));
	var nab = (b * (1 - Epsi)) + lat;
	var senoheps = (Math.exp(Eps) - Math.exp(-Eps)) / 2;
	var Delt = Math.atan(senoheps / Math.cos(nab));
	var TaO = Math.atan(Math.cos(Delt) * Math.tan(nab));
	var longitude = (Delt * (180 / Math.PI)) + S;
	var latitude = (lat + (1 + e2cuadrada * Math.pow(Math.cos(lat), 2) - (3 / 2) * e2cuadrada * Math.sin(lat) * Math.cos(lat) * (TaO - lat)) * (TaO - lat)) * (180 / Math.PI);

	return longitude.toString().concat(" ; " + latitude.toString());
}

// -----------------------------------------------



VARCO.f.WGS84_pixelsToLonLat = function (x, y, mapWidth, mapHeight) {

	let lon_deg = x / mapWidth * 360.0
	let lat_rad = Math.atan(Math.sinh(Math.PI * ((2 * y / mapHeight) * -1)))
	let lat_deg = VARCO.f.rad2deg(lat_rad)

	return [lon_deg, lat_deg]
};



VARCO.f.WGS84_lonLatToPixels = function (lon, lat, mapWidth, mapHeight) {

	let mapPosX = mapWidth * ((lon + 180) / 360);
	let mapPosY = (((Math.log((Math.sin(VARCO.f.deg2rad(lat)) + 1.0) / Math.cos(VARCO.f.deg2rad(lat)))) + (Math.PI)) / (2 * Math.PI) * mapHeight)

	return [mapPosX, mapPosY]
}



VARCO.f.ip_local = function () {
	var ip = false;
	window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection || false;

	if (window.RTCPeerConnection) {
		ip = [];
		var pc = new RTCPeerConnection({ iceServers: [] }), noop = function () { };
		pc.createDataChannel('');
		pc.createOffer(pc.setLocalDescription.bind(pc), noop);
		pc.onicecandidate = function (event) {
			if (event && event.candidate && event.candidate.candidate) {
				var s = event.candidate.candidate.split('\n');
				ip.push(s[0].split(' ')[4]);
			}
		}
	}

	return ip;
}



// let viewPort = {
// name : "viewTest",
// left: '50%',
// bottom: '20%',
// width: '50%',
// height: '50%'
// };

VARCO.f.adaptDivViewPort = function (viewportProp) {

	// viewport
	let thenum,
		viewport;

	if (viewportProp == undefined) {

		viewportProp = {
			name: "default",
			left: 0,
			bottom: 0,
			width: "100%",
			height: "100%"
		};

	}


	viewport = {
		name: viewportProp.name,
		left: 1,
		bottom: 1,
		width: 1,
		height: 1
	};

	if (typeof viewportProp.width === "string") {
		if (viewportProp.width.includes('%')) {
			thenum = parseInt(viewportProp.width.match(/\d+/)[0]) * 0.01;
			viewport.width = Math.floor(window.innerWidth * thenum);
		} else {
			thenum = Math.floor(parseInt(viewportProp.match(/\d+/)[0]));
			viewport.width = Math.floor(thenum);
		}
	} else {
		viewport.width = Math.floor(viewportProp.width);
	}

	if (typeof viewportProp.height === "string") {
		if (viewportProp.height.includes('%')) {
			thenum = parseInt(viewportProp.height.match(/\d+/)[0]) * 0.01;
			viewport.height = Math.floor(window.innerHeight * thenum);
		} else {
			thenum = Math.floor(parseInt(viewportProp.height.match(/\d+/)[0]));
			viewport.height = Math.floor(thenum);
		}
	} else {
		viewport.height = Math.floor(viewportProp.height);
	}

	if (typeof viewportProp.left === "string") {

		if (viewportProp.left.includes('%')) {
			thenum = parseInt(viewportProp.left.match(/\d+/)[0]) * 0.01;
			viewport.left = Math.floor(window.innerWidth * thenum);
		} else {
			thenum = Math.floor(parseInt(viewportProp.left.match(/\d+/)[0]));
			viewport.left = Math.floor(thenum);
		}
	} else {
		viewport.left = viewportProp.left;
	}


	if (typeof viewportProp.bottom === "string") {
		if (viewportProp.bottom.includes('%')) {
			thenum = parseInt(viewportProp.bottom.match(/\d+/)[0]) * 0.01;
			viewport.bottom = Math.floor((window.innerHeight * thenum));
		} else {
			thenum = parseInt(viewportProp.bottom.left.match(/\d+/)[0]);
			viewport.bottom = Math.floor(thenum);
		}
	} else {
		viewport.bottom = Math.floor(viewportProp.bottom);
	}

	return viewport;

};





VARCO.f.addAdaptive = function (node, prop) {

	if (prop !== undefined) {

		if (node.MM3D == undefined) {

			node.MM3D = { adaptive: prop };

		} else {

			node.MM3D.adaptive = prop;

		}

	}

};



VARCO.f.updateAdaptive = function (node, view) {

	let prop,
		propH,
		propV,
		offsetX,
		offsetY,
		offsetZ;

	if (node.MM3D.adaptive.offsetH === undefined) {

		node.MM3D.adaptive.offsetH = { x: 0.0, y: 0.0, z: 0.0 };


	}

	if (node.MM3D.adaptive.offsetV === undefined) {

		node.MM3D.adaptive.offsetV = { x: 0.0, y: 0.0, z: 0.0 };

	}


	if (view.width > view.height) {

		offsetX = node.MM3D.adaptive.offsetH.x

		offsetY = node.MM3D.adaptive.offsetH.y

		offsetZ = node.MM3D.adaptive.offsetH.z

	} else {

		offsetX = node.MM3D.adaptive.offsetV.x

		offsetY = node.MM3D.adaptive.offsetV.y

		offsetZ = node.MM3D.adaptive.offsetV.z

	}


	if (window.innerWidth > window.innerHeight) {

		if (node.MM3D.coordSystem == "percent") {

			if (node.MM3D.adaptive.posH !== undefined) {

				node.position.x = ((node.MM3D.adaptive.posH.x * 2) - 1.0) * (view.width * 0.5) + offsetX;

				node.position.y = (1.0 - (node.MM3D.adaptive.posH.y * 2)) * (view.height * 0.5) + offsetY;

				node.position.z = node.MM3D.adaptive.posV.z + offsetZ;

				//console.log( node.position );

			}

		} else {

			if (node.MM3D.adaptive.posH !== undefined) {

				node.position.x = node.MM3D.adaptive.posH.x + offsetX;

				node.position.y = node.MM3D.adaptive.posH.y + offsetY;

				node.position.z = node.MM3D.adaptive.posH.z + offsetZ;

				//console.log( node.position );

			}

		}

		if (node.MM3D.adaptive.rotH !== undefined) {

			node.rotation.x = MM3D.f.deg2rad(node.MM3D.adaptive.rotH.x);

			node.rotation.y = MM3D.f.deg2rad(node.MM3D.adaptive.rotH.y);

			node.rotation.z = MM3D.f.deg2rad(node.MM3D.adaptive.rotH.z);

		}


		if (node.MM3D.adaptive.sizH !== undefined) {

			if (node.MM3D.adaptive.sizH.scaleFactor == undefined) {

				node.scale.x = node.MM3D.adaptive.sizH.x;

				node.scale.y = node.MM3D.adaptive.sizH.y;

				node.scale.z = node.MM3D.adaptive.sizH.z;

			} else {

				node.scale.x = window.innerHeight / node.MM3D.adaptive.sizH.scaleFactor * node.MM3D.adaptive.sizH.x;

				node.scale.y = window.innerHeight / node.MM3D.adaptive.sizH.scaleFactor * node.MM3D.adaptive.sizH.y;

				node.scale.z = window.innerHeight / node.MM3D.adaptive.sizH.scaleFactor * node.MM3D.adaptive.sizH.z;

			}

		}

	} else {

		if (node.MM3D.coordSystem == "percent") {

			if (node.MM3D.adaptive.posV !== undefined) {

				node.position.x = ((node.MM3D.adaptive.posV.x * 2) - 1.0) * (view.width * 0.5) + offsetX;

				node.position.y = (1.0 - (node.MM3D.adaptive.posV.y * 2)) * (view.height * 0.5) + offsetY;

				node.position.z = node.MM3D.adaptive.posV.z + offsetZ;

			}

		} else {

			if (node.MM3D.adaptive.posV !== undefined) {

				node.position.x = node.MM3D.adaptive.posV.x + offsetX;

				node.position.y = node.MM3D.adaptive.posV.y + offsetY;

				node.position.z = node.MM3D.adaptive.posV.z + offsetZ;

			}

		}

		if (node.MM3D.adaptive.rotV !== undefined) {

			node.rotation.x = VARCO.f.deg2rad(node.MM3D.adaptive.rotV.x);

			node.rotation.y = VARCO.f.deg2rad(node.MM3D.adaptive.rotV.y);

			node.rotation.z = VARCO.f.deg2rad(node.MM3D.adaptive.rotV.z);

		}

		if (node.MM3D.adaptive.sizV !== undefined) {

			if (node.MM3D.adaptive.sizV.scaleFactor == undefined) {

				node.scale.x = node.MM3D.adaptive.sizV.x;

				node.scale.y = node.MM3D.adaptive.sizV.y;

				node.scale.z = node.MM3D.adaptive.sizV.z;

			} else {

				node.scale.x = window.innerWidth / node.MM3D.adaptive.sizV.scaleFactor * node.MM3D.adaptive.sizV.x;

				node.scale.y = window.innerWidth / node.MM3D.adaptive.sizV.scaleFactor * node.MM3D.adaptive.sizV.x;

				node.scale.z = window.innerWidth / node.MM3D.adaptive.sizV.scaleFactor * node.MM3D.adaptive.sizV.x;

			}

		}

	}

};


VARCO.f.onMainWindowResize = function (renderer, scene, camera, view) {
	const height = getDOMHeight(window.innerHeight, 64);


	let viewPort;

	let screenWidth = window.innerWidth; // view.width;

	let screenHeight = window.innerHeight; // view.height;

	if (view !== undefined) {
		const viewHeight = getDOMHeight(view.height, 64);


		screenWidth = view.width;

		screenHeight = viewHeight;

	} else {
		view = {
			width: screenWidth,
			height
		};

	}

	//console.log( view );


	renderer.setSize(window.innerWidth, height);

	if (camera !== undefined) {

		if (camera.type === "PerspectiveCamera") {

			camera.aspect = screenWidth / height;

			camera.updateProjectionMatrix();

		} else {

			camera.left = screenWidth / -2;

			camera.right = screenWidth / 2;

			camera.top = height / 2;

			camera.bottom = height / -2;

			camera.updateProjectionMatrix();

		}

		scene.traverse(

			function (node) {

				// adatta l'adaptive alla nuova risoluzione

				if (node.MM3D !== undefined) {

					if (node.MM3D.adaptive !== undefined) {

						//console.log( node );

						VARCO.f.updateAdaptive(node, view);

					}

				}

			}

		);

	}

};



VARCO.f.setPropAndParameters = function (OBJ, prop, SCENE) {

	let propList = Object.keys(prop);

	let propFunList;


	for (var i = 0; i < propList.length; i++) {

		if (propList[i] !== "MM3D" && propList[i] !== "shadow" && propList[i] !== "obj" && propList[i] !== "type" && propList[i] !== "parameters" && propList[i] !== "materialList") {

			if (OBJ[propList[i]] !== undefined) {

				switch (typeof prop[propList[i]]) {

					case 'string':

						if (prop[propList[i]].includes("THREE")) {

							let namespaces = prop[propList[i]].split(".");

							OBJ[propList[i]] = THREE[namespaces[1]];

						} else {

							OBJ[propList[i]] = prop[propList[i]];

						}

						break;

					case 'object':

						// prametri per vettori 2 o 3

						if (typeof prop[propList[i]] === 'object') {

							if (propList[i] == "rotation") {

								propFunList = Object.keys(prop[propList[i]]);

								for (var j = 0; j < propFunList.length; j++) {

									OBJ[propList[i]][propFunList[j]] = VARCO.f.deg2rad(prop[propList[i]][propFunList[j]]);

								}

							} else {

								propFunList = Object.keys(prop[propList[i]]);

								for (var j = 0; j < propFunList.length; j++) {

									OBJ[propList[i]][propFunList[j]] = prop[propList[i]][propFunList[j]];

								}

							}

						}

						break;

					default:

						OBJ[propList[i]] = prop[propList[i]];

				}


			} else {

				console.error('property ' + propList[i] + ' NOT exist for this element ');

			}

		}

	}


	if (OBJ.MM3D == undefined) {
		OBJ.MM3D = {}
	}


	// add extra functions:

	if (prop.MM3D !== undefined) {

		// SCRIPTS multipli x OGGETTO
		if (prop.MM3D.scriptList !== undefined) {
			for (var i = 0; i < prop.MM3D.scriptList.length; i++) {
				VARCO.f.addScript(OBJ, prop.MM3D.scriptList[i]);
			}
		}

		// EVENTI MOUSE E TOUCH x MESH
		if (prop.MM3D.events !== undefined) {
			VARCO.f.addEvent(OBJ, prop.MM3D.events);
		}

		// STATI
		if (prop.MM3D.states !== undefined) {
			VARCO.f.addStates(OBJ, prop.MM3D.states);
		}

		// MOTIONS
		if (prop.MM3D.motions !== undefined) {
			VARCO.f.addMotions(OBJ, prop.MM3D.motions);
		}

		// ACTIVE-MOTIONS
		if (prop.MM3D.playMotionList !== undefined) {
			VARCO.f.playMotions(OBJ, prop.MM3D.playMotionList);
		}

		// COORDSYSTEM
		if (prop.MM3D.coordSystem !== undefined) {
			if (OBJ.MM3D == undefined) {
				OBJ.MM3D = {};
			}
			OBJ.MM3D.coordSystem = prop.MM3D.coordSystem;
		}

		// ADAPTIVE
		if (prop.MM3D.adaptive !== undefined) {
			VARCO.f.addAdaptive(OBJ, prop.MM3D.adaptive);
		}

		// PARTICLESYSTEM
		if (prop.MM3D.particleSystem !== undefined) {
			VARCO.f.addParticleSystem(OBJ, prop.MM3D.particleSystem);
		}

		//  THREEJS animation
		if (prop.MM3D.threeJsAnimation !== undefined) {
			OBJ.MM3D.threeJsAnimation = prop.MM3D.threeJsAnimation
		}

		// ANIMATIONS
		if (prop.MM3D.animationsManager !== undefined) {
			VARCO.f.addAnimationManager(OBJ, prop.MM3D.animationsManager);
		}

		// PHYSIC - RIGIDBODY
		if (prop.MM3D.physic !== undefined) {
			prop.MM3D.physic.obj = OBJ;
			VARCO.f.addRigidBody(SCENE, prop.MM3D.physic);
		}

		// COLLISION BOX OBB //
		if (prop.MM3D.OBB !== undefined) {
			if (OBJ.geometry !== undefined) {
				const size = new THREE.Vector3(OBJ.geometry.parameters.width, OBJ.geometry.parameters.height, OBJ.geometry.parameters.depth);
				OBJ.geometry.userData.obb = new OBB();
				OBJ.geometry.userData.obb.halfSize.copy(size).multiplyScalar(0.5);
				OBJ.MM3D.OBB = {
					object: new OBB(),
					detailed: prop.MM3D.OBB.detailed
				};
			}
		}

		// CAMERA HIDE
		if (prop.MM3D.hideWithCamera !== undefined) {
			OBJ.MM3D.hideWithCamera = prop.MM3D.hideWithCamera;
		}

		// HELPER EDGES //
		if (prop.MM3D.helper !== undefined) {

			if (prop.MM3D.helper.edges !== undefined) {

				if (OBJ.geometry !== undefined) {

					const edges = new THREE.EdgesGeometry(OBJ.geometry);

					const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));

					if (prop.MM3D.helper.edges.color !== undefined) {

						line.material.color.r = prop.MM3D.helper.edges.color.r;

						line.material.color.g = prop.MM3D.helper.edges.color.g;

						line.material.color.b = prop.MM3D.helper.edges.color.b;

					}

					OBJ.add(line);

				}

			}

		}


		// ANIMATIONS
		// to copy the right code


		if (prop.MM3D.isReadyScriptList !== undefined) {
			for (var i = 0; i < prop.MM3D.isReadyScriptList.length; i++) {
				VARCO.f.addScript(OBJ, prop.MM3D.isReadyScriptList[i]);
			}

		}

	}


	// if( OBJ.animations !== undefined && OBJ.animations.length > 0 ){
	// const animations = OBJ.animations;
	// OBJ.MM3D.MIXER = {};
	// OBJ.traverse( function ( node ) {
	// if ( node.isSkinnedMesh ) {
	// node.frustumCulled = false;
	// }
	// } 

	// );

	// OBJ.MM3D.MIXER = new THREE.AnimationMixer( OBJ );
	// const action = OBJ.MM3D.MIXER.clipAction( OBJ.animations[ 0 ] );
	// action.play();
	// };


	if (prop.MM3D !== undefined) {

		let newOBJ;

	}

};


VARCO.f.tellMouseDown = function (event) {

	VARCO.p.DEVICES.mouse.clickDown = true;
	VARCO.p.DEVICES.mouse.startTimer = new Date().getTime();
	VARCO.p.DEVICES.mouse.clickDuration = 0;

	if (event.buttons == undefined) {
		VARCO.p.DEVICES.mouse.buttonNum = event.which;
	} else {
		VARCO.p.DEVICES.mouse.buttonNum = event.buttons;
	}

	VARCO.p.DEVICES.eventType = "mousedown";

};

VARCO.f.tellMouseWheel = function (event) {

	VARCO.p.DEVICES.mouse.zoom = 0;

	if (event.wheelDelta > 0) {
		VARCO.p.DEVICES.mouse.zoom = +1;
	}

	if (event.wheelDelta < 0) {
		VARCO.p.DEVICES.mouse.zoom = -1;
	}

	VARCO.p.DEVICES.eventType = "mousewheel";

};

VARCO.f.tellMouseWheel_FF = function (event) {

	VARCO.p.DEVICES.mouse.zoom = 0;

	if (event.detail > 0) {
		VARCO.p.DEVICES.mouse.zoom = -1;
	}

	if (event.detail < 0) {
		VARCO.p.DEVICES.mouse.zoom = +1;
	}

	VARCO.p.DEVICES.eventType = "mousewheel";

};

VARCO.f.tellMousePos = function (event) {

	event.preventDefault();
	VARCO.p.DEVICES.mouse.diffH = event.clientX - VARCO.p.DEVICES.mouse.locH;
	VARCO.p.DEVICES.mouse.diffV = event.clientY - VARCO.p.DEVICES.mouse.locV;

	VARCO.p.DEVICES.mouse.locH = event.clientX;
	VARCO.p.DEVICES.mouse.locV = event.clientY;
	VARCO.p.DEVICES.eventType = "mousemove";

};

VARCO.f.tellMouseUp = function (event) {

	event.preventDefault();
	VARCO.p.DEVICES.mouse.clickDown = false;
	VARCO.p.DEVICES.mouse.clickDuration = new Date().getTime() - VARCO.p.DEVICES.mouse.startTimer;
	VARCO.p.DEVICES.eventType = "mouseup";

};

VARCO.f.tellDoubleClick = function (event) {

	event.preventDefault();
	VARCO.p.DEVICES.mouse.clickDown = false;
	VARCO.p.DEVICES.mouse.clickDuration = 0;
	VARCO.p.DEVICES.eventType = "dblclick";

};


VARCO.f.initMouseEvents = function () {

	VARCO.p.DEVICES.mouse = {
		locH: null,
		locV: null,
		diffH: 0,
		diffV: 0,
		zoom: 0,
		clickDown: false,
		buttonNum: null,
		startTimer: new Date().getTime(),
		clickDuration: 0,
		viewPortList: []
	};


	window.addEventListener('mousemove', VARCO.f.tellMousePos, false);
	window.addEventListener('mousedown', VARCO.f.tellMouseDown, false);
	window.addEventListener('mouseup', VARCO.f.tellMouseUp, false);
	window.addEventListener('mousewheel', VARCO.f.tellMouseWheel, false);
	window.addEventListener('DOMMouseScroll', VARCO.f.tellMouseWheel_FF, false);
	window.addEventListener('dblclick', VARCO.f.tellDoubleClick, false);

	window.addEventListener("contextmenu", function setContextMenuOff(e) {
		e.preventDefault();
	}, false);

};

VARCO.f.removeMouseEvents = function () {

	VARCO.p.DEVICES.mouse = {
		locH: null,
		locV: null,
		diffH: 0,
		diffV: 0,
		zoom: 0,
		clickDown: false,
		buttonNum: null,
		startTimer: new Date().getTime(),
		clickDuration: 0,
		viewPortList: []
	};


	// function tellMouseDown(event) {

	// VARCO.p.DEVICES.mouse.clickDown = true;
	// VARCO.p.DEVICES.mouse.startTimer = new Date().getTime();
	// VARCO.p.DEVICES.mouse.clickDuration = 0;

	// if (event.buttons == undefined) {
	// VARCO.p.DEVICES.mouse.buttonNum = event.which;
	// } else {
	// VARCO.p.DEVICES.mouse.buttonNum = event.buttons;
	// }

	// VARCO.p.DEVICES.eventType = "mousedown";

	// }

	// function tellMouseWheel(event) {

	// VARCO.p.DEVICES.mouse.zoom = 0;

	// if (event.wheelDelta > 0) {
	// VARCO.p.DEVICES.mouse.zoom = +1;
	// }

	// if (event.wheelDelta < 0) {
	// VARCO.p.DEVICES.mouse.zoom = -1;
	// }

	// VARCO.p.DEVICES.eventType = "mousewheel";

	// }

	// function tellMouseWheel_FF(event) {

	// VARCO.p.DEVICES.mouse.zoom = 0;

	// if (event.detail > 0) {
	// VARCO.p.DEVICES.mouse.zoom = -1;
	// }

	// if (event.detail < 0) {
	// VARCO.p.DEVICES.mouse.zoom = +1;
	// }

	// VARCO.p.DEVICES.eventType = "mousewheel";

	// }

	// function tellMousePos(event) {

	// event.preventDefault();
	// VARCO.p.DEVICES.mouse.diffH = event.clientX - VARCO.p.DEVICES.mouse.locH;
	// VARCO.p.DEVICES.mouse.diffV = event.clientY - VARCO.p.DEVICES.mouse.locV;

	// VARCO.p.DEVICES.mouse.locH = event.clientX;
	// VARCO.p.DEVICES.mouse.locV = event.clientY;
	// VARCO.p.DEVICES.eventType = "mousemove";

	// }

	// function tellMouseUp(event) {

	// event.preventDefault();
	// VARCO.p.DEVICES.mouse.clickDown = false;
	// VARCO.p.DEVICES.mouse.clickDuration = new Date().getTime() - VARCO.p.DEVICES.mouse.startTimer;
	// VARCO.p.DEVICES.eventType = "mouseup";

	// }

	// function tellDoubleClick(event) {

	// event.preventDefault();
	// VARCO.p.DEVICES.mouse.clickDown = false;
	// VARCO.p.DEVICES.mouse.clickDuration = 0;
	// VARCO.p.DEVICES.eventType = "dblclick";

	// }

	window.removeEventListener('mousemove', VARCO.f.tellMousePos, false);
	window.removeEventListener('mousedown', VARCO.f.tellMouseDown, false);
	window.removeEventListener('mouseup', VARCO.f.tellMouseUp, false);
	window.removeEventListener('mousewheel', VARCO.f.tellMouseWheel, false);
	window.removeEventListener('DOMMouseScroll', VARCO.f.tellMouseWheel_FF, false);
	window.removeEventListener('dblclick', VARCO.f.tellDoubleClick, false);

	window.removeEventListener("contextmenu", function setContextMenuOff(e) {
		e.preventDefault();
	}, false);

};





VARCO.f.tellTouchDown = function (event) {

	event.preventDefault();

	VARCO.p.DEVICES.touch.clickDown = true;
	VARCO.p.DEVICES.touch.startTimer = new Date().getTime();
	VARCO.p.DEVICES.touch.buttonNum = event.touches.length;
	VARCO.p.DEVICES.touch.locH = event.touches[0].pageX;
	VARCO.p.DEVICES.touch.locV = event.touches[0].pageY;
	VARCO.p.DEVICES.touch.listLoc = [];

	for (var i = 0; i < event.touches.length; ++i) {

		VARCO.p.DEVICES.touch.listLoc.push(
			{
				locH: event.touches[i].pageX,
				locV: event.touches[i].pageY,
				diffH: 0,
				diffV: 0
			}
		);

	}

	VARCO.p.DEVICES.eventType = "touchstart";

}

VARCO.f.tellTouchUp = function (event) {

	event.preventDefault();

	VARCO.p.DEVICES.touch.clickDown = false;
	VARCO.p.DEVICES.touch.clickDuration = new Date().getTime() - VARCO.p.DEVICES.touch.startTimer;
	VARCO.p.DEVICES.touch.buttonNum = event.touches.length;
	VARCO.p.DEVICES.touch.locH = event.changedTouches[0].pageX;
	VARCO.p.DEVICES.touch.locV = event.changedTouches[0].pageY;
	VARCO.p.DEVICES.touch.diffH = 0;
	VARCO.p.DEVICES.touch.diffV = 0;
	VARCO.p.DEVICES.touch.listLoc = [];

	for (var i = 0; i < event.touches.length; ++i) {

		VARCO.p.DEVICES.touch.listLoc.push(
			{
				locH: event.touches[i].pageX,
				locV: event.touches[i].pageY,
				diffH: 0,
				diffV: 0
			}
		);

	}

	VARCO.p.DEVICES.eventType = "touchend";

}

VARCO.f.tellTouchPos = function (event) {

	event.preventDefault();

	for (var i = 0; i < event.touches.length; ++i) {

		VARCO.p.DEVICES.touch.listLoc[i].diffH = event.touches[i].pageX - VARCO.p.DEVICES.touch.listLoc[i].locH;
		VARCO.p.DEVICES.touch.listLoc[i].diffV = event.touches[i].pageY - VARCO.p.DEVICES.touch.listLoc[i].locV;
		VARCO.p.DEVICES.touch.listLoc[i].locH = event.touches[i].pageX;
		VARCO.p.DEVICES.touch.listLoc[i].locV = event.touches[i].pageY;

	}

	// drag //
	if (VARCO.p.DEVICES.touch.listLoc.length == 1) {

		VARCO.p.DEVICES.touch.eventDragTouch = false;
		VARCO.p.DEVICES.touch.oldZoomDistance = undefined;
		VARCO.p.DEVICES.touch.diffH = event.touches[0].pageX - VARCO.p.DEVICES.touch.locH;
		VARCO.p.DEVICES.touch.diffV = event.touches[0].pageY - VARCO.p.DEVICES.touch.locV;
		VARCO.p.DEVICES.touch.locH = event.touches[0].pageX;
		VARCO.p.DEVICES.touch.locV = event.touches[0].pageY;
		VARCO.p.DEVICES.eventType = "touchmove";
		VARCO.p.DEVICES.touch.clickDown = true;

	}

	// zoom //
	if (VARCO.p.DEVICES.touch.listLoc.length == 2) {

		let vetA = new THREE.Vector3(VARCO.p.DEVICES.touch.listLoc[0].locH, VARCO.p.DEVICES.touch.listLoc[0].locV, 0);
		let vetB = new THREE.Vector3(VARCO.p.DEVICES.touch.listLoc[1].locH, VARCO.p.DEVICES.touch.listLoc[1].locV, 0);
		let zoomDistance = vetB.distanceTo(vetA);

		VARCO.p.DEVICES.touch.diffH = event.touches[0].pageX - VARCO.p.DEVICES.touch.listLoc[0].locH; // VARCO.p.DEVICES.touch.locH;
		VARCO.p.DEVICES.touch.diffV = event.touches[0].pageY - VARCO.p.DEVICES.touch.listLoc[0].locV; // VARCO.p.DEVICES.touch.locV;
		VARCO.p.DEVICES.touch.locH = event.touches[0].pageX;
		VARCO.p.DEVICES.touch.locV = event.touches[0].pageY;
		VARCO.p.DEVICES.eventType = "touchmove";
		VARCO.p.DEVICES.touch.clickDown = true;

		console.log(VARCO.p.DEVICES.touch.listLoc[0].diffH + " , " + VARCO.p.DEVICES.touch.listLoc[0].diffV);

		if (VARCO.p.DEVICES.touch.oldZoomDistance == undefined) {
			VARCO.p.DEVICES.touch.oldZoomDistance = zoomDistance;
		}

		if (Math.abs(VARCO.p.DEVICES.touch.oldZoomDistance - zoomDistance) > 3) {
			VARCO.p.DEVICES.touch.zoom = Math.sign(VARCO.p.DEVICES.touch.oldZoomDistance - zoomDistance);
			VARCO.p.DEVICES.eventType = "touchzoom";
			VARCO.p.DEVICES.touch.clickDown = false;
			VARCO.p.DEVICES.touch.diffH = 0;
			VARCO.p.DEVICES.touch.diffV = 0;
			VARCO.p.DEVICES.touch.locH = 0;
			VARCO.p.DEVICES.touch.locV = 0;
		}

		VARCO.p.DEVICES.touch.oldZoomDistance = zoomDistance;

	}

}

VARCO.f.initTouchEvents = function () {

	VARCO.p.DEVICES.touch = {
		locH: null,
		locV: null,
		diffH: 0,
		diffV: 0,
		zoom: 0,
		clickDown: false,
		listLoc: [],
		startTimer: new Date().getTime(),
		clickDuration: 0,
		isMultyTouch: false
	};


	window.addEventListener('touchmove', VARCO.f.tellTouchPos, { passive: false });
	window.addEventListener('touchstart', VARCO.f.tellTouchDown, { passive: false }); // { passive: false } );
	window.addEventListener('touchend', VARCO.f.tellTouchUp, { passive: false }); //{ passive: false });
	//window.addEventListener('touchzoom', tellTouchUp, { passive: false } ); //{ passive: false });

};


VARCO.f.removeTouchEvents = function () {

	VARCO.p.DEVICES.touch = {
		locH: null,
		locV: null,
		diffH: 0,
		diffV: 0,
		zoom: 0,
		clickDown: false,
		listLoc: [],
		startTimer: new Date().getTime(),
		clickDuration: 0,
		isMultyTouch: false
	};

	// function tellTouchDown(event) {

	// event.preventDefault();

	// VARCO.p.DEVICES.touch.clickDown = true;
	// VARCO.p.DEVICES.touch.startTimer = new Date().getTime();
	// VARCO.p.DEVICES.touch.buttonNum = event.touches.length;
	// VARCO.p.DEVICES.touch.locH = event.touches[0].pageX;
	// VARCO.p.DEVICES.touch.locV = event.touches[0].pageY;
	// VARCO.p.DEVICES.touch.listLoc = [];

	// for (var i = 0; i < event.touches.length; ++i) {

	// VARCO.p.DEVICES.touch.listLoc.push(
	// {
	// locH: event.touches[i].pageX,
	// locV: event.touches[i].pageY,
	// diffH: 0,
	// diffV: 0
	// }
	// );

	// }

	// VARCO.p.DEVICES.eventType = "touchstart";

	// }

	// function tellTouchUp(event) {

	// event.preventDefault();

	// VARCO.p.DEVICES.touch.clickDown = false;
	// VARCO.p.DEVICES.touch.clickDuration = new Date().getTime() - VARCO.p.DEVICES.touch.startTimer;
	// VARCO.p.DEVICES.touch.buttonNum = event.touches.length;
	// VARCO.p.DEVICES.touch.locH = event.changedTouches[0].pageX;
	// VARCO.p.DEVICES.touch.locV = event.changedTouches[0].pageY;
	// VARCO.p.DEVICES.touch.diffH = 0;
	// VARCO.p.DEVICES.touch.diffV = 0;
	// VARCO.p.DEVICES.touch.listLoc = [];

	// for (var i = 0; i < event.touches.length; ++i) {

	// VARCO.p.DEVICES.touch.listLoc.push(
	// {
	// locH: event.touches[i].pageX,
	// locV: event.touches[i].pageY,
	// diffH: 0,
	// diffV: 0
	// }
	// );

	// }

	// VARCO.p.DEVICES.eventType = "touchend";

	// }

	// function tellTouchPos(event) {

	// event.preventDefault();

	// for (var i = 0; i < event.touches.length; ++i) {

	// VARCO.p.DEVICES.touch.listLoc[i].diffH = event.touches[i].pageX - VARCO.p.DEVICES.touch.listLoc[i].locH;
	// VARCO.p.DEVICES.touch.listLoc[i].diffV = event.touches[i].pageY - VARCO.p.DEVICES.touch.listLoc[i].locV;
	// VARCO.p.DEVICES.touch.listLoc[i].locH = event.touches[i].pageX;
	// VARCO.p.DEVICES.touch.listLoc[i].locV = event.touches[i].pageY;

	// }

	// // drag //
	// if (VARCO.p.DEVICES.touch.listLoc.length == 1) {

	// VARCO.p.DEVICES.touch.eventDragTouch = false;
	// VARCO.p.DEVICES.touch.oldZoomDistance = undefined;
	// VARCO.p.DEVICES.touch.diffH = event.touches[0].pageX - VARCO.p.DEVICES.touch.locH;
	// VARCO.p.DEVICES.touch.diffV = event.touches[0].pageY - VARCO.p.DEVICES.touch.locV;
	// VARCO.p.DEVICES.touch.locH = event.touches[0].pageX;
	// VARCO.p.DEVICES.touch.locV = event.touches[0].pageY;
	// VARCO.p.DEVICES.eventType = "touchmove";
	// VARCO.p.DEVICES.touch.clickDown = true;

	// }

	// // zoom //
	// if (VARCO.p.DEVICES.touch.listLoc.length == 2) {

	// let vetA = new THREE.Vector3(VARCO.p.DEVICES.touch.listLoc[0].locH, VARCO.p.DEVICES.touch.listLoc[0].locV, 0);
	// let vetB = new THREE.Vector3(VARCO.p.DEVICES.touch.listLoc[1].locH, VARCO.p.DEVICES.touch.listLoc[1].locV, 0);
	// let zoomDistance = vetB.distanceTo(vetA);

	// VARCO.p.DEVICES.touch.diffH = event.touches[0].pageX - VARCO.p.DEVICES.touch.listLoc[0].locH; // VARCO.p.DEVICES.touch.locH;
	// VARCO.p.DEVICES.touch.diffV = event.touches[0].pageY - VARCO.p.DEVICES.touch.listLoc[0].locV; // VARCO.p.DEVICES.touch.locV;
	// VARCO.p.DEVICES.touch.locH = event.touches[0].pageX;
	// VARCO.p.DEVICES.touch.locV = event.touches[0].pageY;
	// VARCO.p.DEVICES.eventType = "touchmove";
	// VARCO.p.DEVICES.touch.clickDown = true;

	// console.log(VARCO.p.DEVICES.touch.listLoc[0].diffH + " , " + VARCO.p.DEVICES.touch.listLoc[0].diffV);

	// if (VARCO.p.DEVICES.touch.oldZoomDistance == undefined) {
	// VARCO.p.DEVICES.touch.oldZoomDistance = zoomDistance;
	// }

	// if (Math.abs(VARCO.p.DEVICES.touch.oldZoomDistance - zoomDistance) > 3) {
	// VARCO.p.DEVICES.touch.zoom = Math.sign(VARCO.p.DEVICES.touch.oldZoomDistance - zoomDistance);
	// VARCO.p.DEVICES.eventType = "touchzoom";
	// VARCO.p.DEVICES.touch.clickDown = false;
	// VARCO.p.DEVICES.touch.diffH = 0;
	// VARCO.p.DEVICES.touch.diffV = 0;
	// VARCO.p.DEVICES.touch.locH = 0;
	// VARCO.p.DEVICES.touch.locV = 0;
	// }

	// VARCO.p.DEVICES.touch.oldZoomDistance = zoomDistance;

	// }

	// }

	window.removeEventListener('touchmove', VARCO.f.tellTouchPos, { passive: false });
	window.removeEventListener('touchstart', VARCO.f.tellTouchDown, { passive: false }); // { passive: false } );
	window.removeEventListener('touchend', VARCO.f.tellTouchUp, { passive: false }); //{ passive: false });
	//window.addEventListener('touchzoom', tellTouchUp, { passive: false } ); //{ passive: false });

};



VARCO.f.initGamePad = function () {

	// GAMEPAD:

	VARCO.p.DEVICES.gamepads = {};

	function gamepadHandler(event, connected) {
		const gamepad = event.gamepad;
		// Note:
		// gamepad === navigator.getGamepads()[gamepad.index]

		if (connected) {
			VARCO.p.DEVICES.gamepads[gamepad.index] = gamepad;
			console.log(VARCO.p.DEVICES.gamepad);
		} else {
			delete VARCO.p.DEVICES.gamepads[gamepad.index];
		}
	}

	window.addEventListener("gamepadconnected", (e) => {
		gamepadHandler(e, true);
	},
		false,
	);

	window.addEventListener("gamepaddisconnected", (e) => {
		gamepadHandler(e, false);
	},
		false,
	);

};



// VARCO.f.initKeyboardEvents();

// VARCO.p.DEVICES.keyboard.onkeydown.doScriptList = [
// {
// "button" : [ 38 ],
// "functionSrc" : "console.log('button key UP -> 38' );",
// "functionProp" : {}
// },
// {
// "button" : [ 32 ],
// "functionSrc" : "console.log('button key JUMP -> 32' );",
// "functionProp" : {}
// },
// {
// "button" : [ 40 ],
// "functionSrc" : "console.log('button key DOWN -> 40' );",
// "functionProp" : {}
// },
// {
// "button" : [ 90, 88 ],
// "functionSrc" : "console.log('button DOUBLEKEYS -> 90 + 88' );",
// "functionProp" : {}
// },

// ];


VARCO.f.initKeyboardEvents = function () {

	VARCO.p.DEVICES.keyboard = {
		onkeydown: { doScriptList: [] },
		onkeyup: { doScriptList: [] },
		keyDownList: [],
		keyPressed: null,
		keyReleased: null

	};

	onkeydown = function (event) {

		VARCO.p.DEVICES.keyboard.keyReleased = null;

		let keyDown = (event.keyCode);

		let flagIsItNew = VARCO.p.DEVICES.keyboard.keyDownList.indexOf(keyDown);

		if (flagIsItNew === -1) {

			VARCO.p.DEVICES.keyboard.keyDownList.push(keyDown);

			VARCO.p.DEVICES.keyboard.type = "onkeydown";

			VARCO.p.DEVICES.keyboard.keyPressed = keyDown;

			console.log(VARCO.p.DEVICES.keyboard.keyPressed);

			for (var i = 0; i < VARCO.p.DEVICES.keyboard.onkeydown.doScriptList.length; i++) {

				let counter = 0;

				let totCounter = VARCO.p.DEVICES.keyboard.onkeydown.doScriptList[i].keyDownList.length;

				for (var j = 0; j < VARCO.p.DEVICES.keyboard.onkeydown.doScriptList[i].keyDownList.length; j++) {

					if (VARCO.p.DEVICES.keyboard.keyDownList.includes(VARCO.p.DEVICES.keyboard.onkeydown.doScriptList[i].keyDownList[j])) {

						counter = counter + 1;

					}

				}

				if (counter == totCounter) {

					VARCO.f.doScriptList(VARCO.p.DEVICES.keyboard.onkeydown.doScriptList[i].scriptList);

				}

			}

		}

	};

	onkeyup = function (event) {

		VARCO.p.DEVICES.keyboard.keyPressed = null;

		var keyUp = (event.keyCode);

		const flagIsItOld = VARCO.p.DEVICES.keyboard.keyDownList.indexOf(keyUp) !== -1;


		if (flagIsItOld !== -1) {

			var index = VARCO.f.findIndexOf(keyUp, VARCO.p.DEVICES.keyboard.keyDownList);

			if (index !== -1) {

				VARCO.p.DEVICES.keyboard.keyDownList.splice(index, 1);

				VARCO.p.DEVICES.keyboard.type = "onkeyup";

				VARCO.p.DEVICES.keyboard.keyReleased = keyUp;

				for (var i = 0; i < VARCO.p.DEVICES.keyboard.onkeyup.doScriptList.length; i++) {

					let counter = 0;

					let totCounter = VARCO.p.DEVICES.keyboard.onkeyup.doScriptList[i].keyDownList.length;

					for (var j = 0; j < VARCO.p.DEVICES.keyboard.onkeyup.doScriptList[i].keyDownList.length; j++) {

						if (VARCO.p.DEVICES.keyboard.keyDownList.includes(VARCO.p.DEVICES.keyboard.onkeyup.doScriptList[i].keyDownList[j])) {

							counter = counter + 1;

						}

					}

					if (counter == totCounter) {

						VARCO.f.doScriptList(VARCO.p.DEVICES.keyboard.onkeyup.doScriptList[i].scriptList);

					}

				}

			}

		}

	};

};


// //////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////


VARCO.f.addFog = function (SCENE, fog) {

	// SCENE.fog = new THREE[ fog.type ]();
	SCENE.fog = new THREE.Fog();

	if (fog.density !== undefined) {
		SCENE.fog.density = fog.density;
	}

	if (fog.near !== undefined) {
		SCENE.fog.near = fog.near;
	}

	if (fog.far !== undefined) {
		SCENE.fog.far = fog.far;
	}

	if (fog.color !== undefined) {
		SCENE.fog.color.r = fog.color.r;
		SCENE.fog.color.g = fog.color.g;
		SCENE.fog.color.b = fog.color.b;
	}

};



VARCO.f.addScene = function (prop, callBack, callBackProp) {

	let SCENE = new THREE.Scene();

	SCENE.MM3D = {};

	SCENE.TEXTURES = {};

	SCENE.MATERIALS = {};

	SCENE.OBJECTS = {};

	SCENE.PHXCONSTRAINTS = {};

	SCENE.PHXMATERIALS = {};


	if (prop !== undefined) {

		if (prop.name !== undefined) {
			SCENE.name = prop.name;
		}

		if (prop.parameters !== undefined) {

			if (prop.parameters.environment !== undefined) {

				SCENE.environment = prop.parameters.environment;
				SCENE.environment.mapping = THREE.EquirectangularReflectionMapping;

			}

			if (prop.parameters.background !== undefined) {

				if (prop.parameters.background.color !== undefined) {

					SCENE.background = new THREE.Color();
					SCENE.background.r = prop.parameters.background.color.r;
					SCENE.background.g = prop.parameters.background.color.g;
					SCENE.background.b = prop.parameters.background.color.b;
				}

				if (prop.parameters.background.texture !== undefined && prop.parameters.background.texture !== null) {

					SCENE.background = prop.parameters.background.texture;
					SCENE.background.mapping = THREE.EquirectangularReflectionMapping;

				}
			}

			if (prop.parameters.backgroundBlurriness !== undefined) {
				SCENE.backgroundBlurriness = prop.parameters.backgroundBlurriness;
			}

			if (prop.parameters.backgroundIntensity !== undefined) {
				SCENE.backgroundIntensity = prop.parameters.backgroundIntensity;
			}

			if (prop.parameters.color !== undefined) {

				SCENE.color.r = prop.parameters.color.r;
				SCENE.color.g = prop.parameters.color.g;
				SCENE.color.b = prop.parameters.color.b;

			}

			// FOG:

			if (prop.parameters.fog !== undefined) {

				VARCO.f.addFog(SCENE, prop.parameters.fog);

			}

		}

	}


	if (callBack !== undefined) {

		if (callBackProp !== undefined) {

			callBackProp.obj = SCENE;

			callBack(callBackProp);

		} else {

			callBack({ obj: SCENE });

		}

	}

};



// //////////// ///////// ///////////////
// //////////// ///////// ///////////////
// //////////// ///////// ///////////////

// MM3D.f.addLight(
// SCENE,
// {
// "name" : "SunLight",
// "type" : "DirectionalLight",
// "parameters" : {
// "color" : { "r" : 1, "g" : 0, "b" : 1 },
// "intensity" : 0.9
// },
// "position" : { "x" : -5, "y" : 10, "z" : 10 }

// },
// function( p ),
// { "info" : "e luce fù" }
// )

VARCO.f.addLight = function (SCENE, prop, callBack, callBackProp) {

	const LIGHT = new THREE[prop.type]();

	// parameters: // -----------------------------------------------------

	if (prop.parameters !== undefined) {

		VARCO.f.setPropAndParameters(LIGHT, prop.parameters);

		if (prop.parameters.shadow !== undefined) {

			//Set up shadow properties for the light
			if (prop.parameters.shadow.bias !== undefined) {
				LIGHT.shadow.bias = prop.parameters.shadow.bias;
			}

			if (prop.parameters.shadow.mapSize !== undefined) {
				LIGHT.shadow.mapSize.width = prop.parameters.shadow.mapSize.width; // default
				LIGHT.shadow.mapSize.height = prop.parameters.shadow.mapSize.height; // default
			}

			if (prop.parameters.shadow.camera !== undefined) {
				LIGHT.shadow.camera.near = prop.parameters.shadow.camera.near; // default
				LIGHT.shadow.camera.far = prop.parameters.shadow.camera.far; // default
				LIGHT.shadow.camera.top = prop.parameters.shadow.camera.top; // default
				LIGHT.shadow.camera.bottom = prop.parameters.shadow.camera.bottom; // default
				LIGHT.shadow.camera.left = prop.parameters.shadow.camera.left; // default
				LIGHT.shadow.camera.right = prop.parameters.shadow.camera.right; // default
				LIGHT.shadow.camera.updateProjectionMatrix();
			}

		}

	}

	// // -----------------------------------------------------
	// property: // 

	VARCO.f.setPropAndParameters(LIGHT, prop, SCENE);

	// // -----------------------------------------------------
	// // -----------------------------------------------------


	if (SCENE !== undefined) {

		if (SCENE.OBJECTS == undefined) {
			SCENE.OBJECTS = {};
		}

		SCENE.OBJECTS[LIGHT.name] = LIGHT;

		SCENE.add(LIGHT);

	}

	if (callBack !== undefined) {

		if (callBackProp !== undefined) {
			callBackProp.obj = LIGHT;
			callBack(callBackProp);

		} else {
			callBack({ obj: LIGHT });

		}

	}


	return LIGHT;

};




// //////////// ///////// ///////////////
// //////////// ///////// ///////////////
// //////////// ///////// ///////////////

// MM3D.f.addCamera(
// SCENE,
// {
// "name" : "camera3d",
// "type" : "PerspectiveCamera",
// "parameters" : {
// "fov" : 65.0,
// "aspect" : ( window.innerWidth / window.innerHeight ),
// "near" : 0.01, 
// "far" : 200
// },
// "position" : { "x" : -5, "y" : 10, "z" : 10 }

// },
// function( p ){
// console.log( p.obj );
// console.log( p.info );
// },
// { "info" : "camera...azione !" }
// );


VARCO.f.addCamera = function (SCENE, prop, callBack, callBackProp) {

	const CAMERA = new THREE[prop.type]();

	// parameters: // -----------------------------------------------------

	if (prop.parameters !== undefined) {

		VARCO.f.setPropAndParameters(CAMERA, prop.parameters);

	}

	// // -----------------------------------------------------
	// property: // 

	VARCO.f.setPropAndParameters(CAMERA, prop, SCENE);

	// // -----------------------------------------------------
	// // -----------------------------------------------------


	if (SCENE !== undefined) {

		if (SCENE.OBJECTS == undefined) {

			SCENE.OBJECTS = {};

		}

		SCENE.OBJECTS[CAMERA.name] = CAMERA;

		SCENE.add(CAMERA);

	}

	if (callBack !== undefined) {

		if (callBackProp !== undefined) {

			callBackProp.obj = CAMERA;
			callBack(callBackProp);

		} else {

			callBack({ obj: CAMERA });

		}

	}


	CAMERA.MM3D = {};

	return CAMERA;

};



VARCO.f.addGroup = function (SCENE, prop, callBack, callBackProp) {

	const GROUP = new THREE.Group();

	// parameters: // -----------------------------------------------------

	if (prop.parameters !== undefined) {

		VARCO.f.setPropAndParameters(GROUP, prop.parameters);

	}

	// // -----------------------------------------------------
	// property: // 

	VARCO.f.setPropAndParameters(GROUP, prop, SCENE);

	// // -----------------------------------------------------
	// // -----------------------------------------------------


	if (SCENE !== undefined) {

		if (SCENE.OBJECTS == undefined) {

			SCENE.OBJECTS = {};

		}

		SCENE.OBJECTS[GROUP.name] = GROUP;

		SCENE.add(GROUP);

	}

	if (callBack !== undefined) {

		if (callBackProp !== undefined) {

			callBackProp.obj = GROUP;

			callBack(callBackProp);

		} else {

			callBack({ obj: GROUP });

		}

	}

	return GROUP;

};



// //////////// ///////// ///////////////
// //////////// ///////// ///////////////
// //////////// ///////// ///////////////

// MM3D.f.addHelper( 
// scene,
// { 
// "name" : "helpMe", 
// "type" : "AxesHelper", 
// "parameters" : { 
// "size" : 3,
// "color" : { "r" : 1.0, "g": 0.0, "b": 0.0 }
// },
// "position" : { "x" : 0.0, "y": 1.0, "z": 0.0 }
// },
// function( p ){
// console.log( p.obj );
// console.log( p.info );
// },
// { "info" : "Help me !" }
// );


// MM3D.f.addHelper( 
// undefined, 
// { 
// "name" : "helpObj", 
// "obj" : cube,
// "parameters" : {
// "color" : { "r" : 0.0, "g": 1.0, "b": 0.0 }
// }
// },
// function( p ){
// console.log( p.obj );
// console.log( p.info );
// },
// { "info" : "Help me !" }
// );


// OR:


// just add prop.helper : { .. same as previus examples ..} in your element


VARCO.f.addHelper = function (SCENE, prop, callBack, callBackProp) {

	let HELPER;
	let type;

	if (prop.obj !== undefined) {

		switch (prop.obj.type) {

			case "Group":

				let axisSize = 1.0;

				if (prop.parameters !== undefined) {
					axisSize = prop.parameters.size;
				}

				HELPER = new THREE.AxesHelper(axisSize);

				if (prop.parameters !== undefined) {
					if (prop.parameters.color !== undefined) {
						HELPER.setColors(new THREE.Color(prop.parameters.color.r, prop.parameters.color.g, prop.parameters.color.b));
					}
				}

				break;

			case "PerspectiveCamera":

				HELPER = new THREE.CameraHelper(prop.obj);

				break;

			case "OrthographicCamera":

				HELPER = new THREE.CameraHelper(prop.obj);

				break;

			case "DirectionalLight":

				HELPER = new THREE.DirectionalLightHelper(prop.obj);

				if (prop.parameters !== undefined) {

					if (prop.parameters.color !== undefined) {
						HELPER.material.color.r = prop.parameters.color.r;
						HELPER.material.color.g = prop.parameters.color.g;
						HELPER.material.color.b = prop.parameters.color.n;
					}

				}

				break;

			case "SpotLight":

				HELPER = new THREE.SpotLightHelper(prop.obj);

				if (prop.parameters !== undefined) {

					if (prop.parameters.color !== undefined) {
						HELPER.color.r = prop.parameters.color.r;
						HELPER.color.g = prop.parameters.color.g;
						HELPER.color.b = prop.parameters.color.b;
					}

				}

				break;

			case "PointLight":

				let pointSphereSize = 1.0;

				if (prop.parameters !== undefined) {
					pointSphereSize = prop.parameters.sphereSize;
				}

				HELPER = new THREE.PointLightHelper(prop.obj, pointSphereSize);

				if (prop.parameters !== undefined) {

					if (prop.parameters.color !== undefined) {
						HELPER.color.r = prop.parameters.color.r;
						HELPER.color.g = prop.parameters.color.g;
						HELPER.color.b = prop.parameters.color.b;
					}

				}

				break;

			case "HemisphereLightHelper":

				let HemiSphereSize = 1.0;

				if (prop.parameters !== undefined) {
					HemiSphereSize = prop.parameters.sphereSize;
				}

				HELPER = new THREE.HemisphereLightHelper(prop.obj, HemiSphereSize);

				if (prop.parameters !== undefined) {

					if (prop.parameters.color !== undefined) {
						HELPER.color.r = prop.parameters.color.r;
						HELPER.color.g = prop.parameters.color.g;
						HELPER.color.b = prop.parameters.color.b;
					}

				}

				break;

			case "skinnedMesh":

				HELPER = new THREE.SkeletonHelper(prop.obj);

				break;

			case "Mesh":

				if (prop.obj.geometry.type == "PlaneGeometry") {

					HELPER = new THREE.PlaneHelper(prop.obj);

				} else {

					HELPER = new THREE.BoxHelper(prop.obj);

				}


				if (prop.parameters !== undefined) {

					if (prop.parameters.color !== undefined) {
						HELPER.material.color.r = prop.parameters.color.r;
						HELPER.material.color.g = prop.parameters.color.g;
						HELPER.material.color.b = prop.parameters.color.n;
					}

				}


				break;

		}

		prop.obj.add(HELPER);

	} else {

		if (prop.type !== undefined) {

			if (prop.type == "AxesHelper") {

				let size = 1.0;

				if (prop.parameters !== undefined) {
					size = prop.parameters.size;
				}

				HELPER = new THREE.AxesHelper(size);

				if (prop.parameters !== undefined) {

					if (prop.parameters.color !== undefined) {
						HELPER.setColors(new THREE.Color(prop.parameters.color.r, prop.parameters.color.g, prop.parameters.color.b));
					}

				}

			}

			if (prop.type == "ArrowHelper") {

				HELPER = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1, 0xffffff);

				let Arrow_length = 1.0;
				let Arrow_headLength = 0.2 * Arrow_length;
				let Arrow_headWidth = 0.2 * Arrow_length;

				if (prop.parameters !== undefined) {

					if (prop.parameters.dir !== undefined) {
						HELPER.setDirection(new THREE.Vector3(prop.parameters.dir.x, prop.parameters.dir.y, prop.parameters.dir.z));
					}

					if (prop.parameters.length !== undefined) {
						Arrow_length = prop.parameters.length;
					}

					if (prop.parameters.headLength !== undefined) {
						Arrow_headLength = prop.parameters.headLength;
					}

					if (prop.parameters.headWidth !== undefined) {
						Arrow_headWidth = prop.parameters.headWidth;
					}

					HELPER.setLength(Arrow_length, Arrow_headLength, Arrow_headWidth);

					if (prop.parameters.color !== undefined) {
						HELPER.setColor(new THREE.Color(prop.parameters.color.r, prop.parameters.color.g, prop.parameters.color.b));
					}

				}

			}

			if (prop.type == "GridHelper") {

				let size = 10;
				let divisions = 10;
				let colorCenterLine = new THREE.Color(0.2, 0.2, 0.2);
				let colorGrid = new THREE.Color(0.3, 0.3, 0.3);

				if (prop.parameters !== undefined) {

					if (prop.parameters.size !== undefined) {
						size = prop.parameters.size;
					}

					if (prop.parameters.divisions !== undefined) {
						divisions = prop.parameters.divisions;
					}

					if (prop.parameters.colorCenterLine !== undefined) {
						colorCenterLine = new THREE.Color(prop.parameters.colorCenterLine.r, prop.parameters.colorCenterLine.g, prop.parameters.colorCenterLine.b);
					}

					if (prop.parameters.colorGrid !== undefined) {
						colorGrid = new THREE.Color(prop.parameters.colorGrid.r, prop.parameters.colorGrid.g, prop.parameters.colorGrid.b);
					}

				}

				HELPER = new THREE.GridHelper(size, divisions, colorCenterLine, colorGrid);

			}

			if (prop.type == "PolarGridHelper") {

				let radius = 10;
				let sectors = 16;
				let rings = 8;
				let polarDivisions = 64;
				let color1 = new THREE.Color(0.2, 0.2, 0.2);
				let color2 = new THREE.Color(0.7, 0.7, 0.7);

				if (prop.parameters !== undefined) {

					if (prop.parameters.radius !== undefined) {
						radius = prop.parameters.radius;
					}

					if (prop.parameters.sectors !== undefined) {
						sectors = prop.parameters.sectors;
					}

					if (prop.parameters.rings !== undefined) {
						rings = prop.parameters.rings;
					}

					if (prop.parameters.divisions !== undefined) {
						polarDivisions = prop.parameters.divisions;
					}

					if (prop.parameters.color1 !== undefined) {
						color1 = new THREE.Color(prop.parameters.color1.r, prop.parameters.color1.g, prop.parameters.color1.b);
					}

					if (prop.parameters.color2 !== undefined) {
						color2 = new THREE.Color(prop.parameters.color2.r, prop.parameters.color2.g, prop.parameters.color2.b);
					}

				}

				HELPER = new THREE.PolarGridHelper(gridSize, gridDivisions, colorCenterLine, colorGrid);

			}

		}

	}

	// // -----------------------------------------------------
	// property: // 

	VARCO.f.setPropAndParameters(HELPER, prop, SCENE);

	// // -----------------------------------------------------
	// // -----------------------------------------------------


	if (SCENE !== undefined) {

		if (SCENE.OBJECTS == undefined) {
			SCENE.OBJECTS = {};
		}

		SCENE.OBJECTS[HELPER.name] = HELPER;
		SCENE.add(HELPER);

	}

	if (callBack !== undefined) {

		if (callBackProp !== undefined) {

			callBackProp.obj = HELPER;
			callBack(callBackProp);

		} else {

			callBack({ obj: HELPER });

		}

	}

	HELPER.MM3D = {};

	return HELPER;

};






// //////////// ///////// ///////////////
// //////////// ///////// ///////////////
// //////////// ///////// ///////////////

// MM3D.f.addFromFile(
// scene,
// {
// "name" : "oggettone3d",
// "parameters" : {
// "url" : ".\libs\three.js\examples\models\gltf\DamagedHelmet\glTF\DamagedHelmet.gltf",
// "materialList" : [ 
// { 
// "name" : "node_damagedHelmet_-6514",
// "material" : {
// "name" : "helmet_top_mat",
// "type" : "MeshStandardMaterial",
// "parameters" : {
// "color" : { "r": 0.5, "g": 1.0, "b": 1.0 },
// "metalness" : 0.75,
// "roughness" : 0.3,
// "transparent" : true,
// "opacity" : 0.8,
// "bumpScale" : 0.3
// }
// }
// }
// ]
// },
// "position" : { "x" : 2.0, "y": 1.0, "z": 0.0 },
// },

// function( p ){
// console.log( p.obj );
// console.log( p.info );

// obj3d = p.obj;

// },

// { "info" : "oggetto oggettino delle mie brame!" }
// );


// VARCO.f.addFromFile(
// SCENE,
// {
// "name" : "oggettone3d",
// "parameters" : {
// "url" : "models/gltf/duck/duck.gltf",
// "MTLLoader" : {
// "setDecoderPath" : "/examples/jsm/libs/draco/",
// "setDecoderConfig" : { "type": "js" }
// }
// },
// "position" : { "x" : 2.0, "y": 1.0, "z": 0.0 }

// }

// );



VARCO.f.addFromFile = function (SCENE, prop, callBack, callBackProp) {

	// Load a glTF resource

	console.log("addFromFile");

	let OBJ;

	function objectLoader(url, callBack, callBackProp) {

		// console.log( objectLoader );

		loader.load(
			// resource URL

			url, //'models/gltf/duck/duck.gltf',

			// called when the resource is loaded

			function (GROUP) {

				OBJ = GROUP.scene;


				if (GROUP.animations.length > 0) {

					const animations = GROUP.animations;

					// OBJ.MM3D.mixer = new THREE.AnimationMixer( OBJ );

					let idleAction // = OBJ.userData.mixer.clipAction( animations[ 0 ] );

					// idleAction.play();

					prop.MM3D = {
						threeJsAnimation: {
							mixer: new THREE.AnimationMixer(OBJ),
							animations: animations,
							action: idleAction,
							GROUP: GROUP
						}
					}

				}

				console.log()

				if (prop.parameters.materialList !== undefined) {

					for (var i = 0; i < prop.parameters.materialList.length; i++) {

						OBJ.traverse(function (node) {

							if (prop.parameters.materialList[i].name == node.name) {

								if (typeof prop.parameters.materialList[i].material == "string") {

									if (SCENE !== undefined) {

										if (SCENE.MATERIALS !== undefined) {

											if (SCENE.MATERIALS[prop.parameters.materialList[i].material] !== undefined) {
												node.material = SCENE.MATERIALS[prop.parameters.materialList[i]];
											}

											node.material.needsUpdate = true;

										}

									}

								} else {

									if (OBJ.MATERIALS == undefined) {
										OBJ.MATERIALS = {};
									}

									VARCO.f.addMaterial(

										OBJ,

										prop.parameters.materialList[i].material,

										function (p) {
											node.material = p.obj;
											node.material.needsUpdate = true;

										}

									);

								}

							}

						});

					}

				}

				VARCO.f.setPropAndParameters(OBJ, prop, SCENE);


				if (SCENE !== undefined) {

					if (SCENE.OBJECTS == undefined) {
						SCENE.OBJECTS = {};
					}

					SCENE.OBJECTS[OBJ.name] = OBJ;
					SCENE.add(OBJ);

				}


				if (callBack !== undefined) {

					if (callBackProp !== undefined) {

						callBackProp.obj = OBJ;

						callBack(callBackProp);

					} else {

						callBackProp = { obj: OBJ };

					}

					callBack(callBackProp);

				}

			},

			// called while loading is progressing
			function (xhr) {
				//console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

			},

			// called when loading has errors
			function (error) {
				//console.log( 'An error happened' );
			}

		);

	}



	function objectParser(url, callBack, callBackProp) {

		console.log("objectParser");

		loader.parse(

			url, '',

			function (GROUP) {

				OBJ = GROUP.scene;

				if (GROUP.animations.length > 0) {

					const animations = GROUP.animations;

					// OBJ.MM3D.mixer = new THREE.AnimationMixer( OBJ );

					let idleAction // = OBJ.userData.mixer.clipAction( animations[ 0 ] );

					// idleAction.play();

					prop.MM3D = {
						threeJsAnimation: {
							mixer: new THREE.AnimationMixer(OBJ),
							animations: animations,
							action: idleAction,
							GROUP: GROUP
						}
					}

				}

				if (prop.parameters.materialList !== undefined) {

					for (var i = 0; i < prop.parameters.materialList.length; i++) {

						OBJ.traverse(function (node) {

							if (prop.parameters.materialList[i].name == node.name) {

								if (typeof prop.parameters.materialList[i].material == "string") {

									if (OBJ.MATERIALS !== undefined) {

										if (OBJ.MATERIALS[prop.parameters.materialList[i].material] !== undefined) {
											node.material = OBJ.MATERIALS[prop.parameters.materialList[i].material];
										}

										node.material.needsUpdate = true;

									}

								} else {

									VARCO.f.addMaterial(

										OBJ,

										prop.parameters.materialList[i].material,

										function (p) {

											node.material = p.obj;
											node.material.needsUpdate = true;

										}

									);

								}

							}

						});

					}

				}

				VARCO.f.setPropAndParameters(OBJ, prop, SCENE);


				if (SCENE !== undefined) {

					if (SCENE.OBJECTS == undefined) {
						SCENE.OBJECTS = {};
					}

					SCENE.OBJECTS[OBJ.name] = OBJ;
					SCENE.add(OBJ);

				}

				if (callBack !== undefined) {

					if (callBackProp !== undefined) {

						callBackProp.obj = OBJ;

						callBack(callBackProp);

					} else {

						callBackProp = { obj: OBJ };

					}

					callBack(callBackProp);

				}

			}

		);

	}


	let loader;
	let loaderMat;
	let type;

	if (prop.parameters.extension !== undefined) {
		type = prop.parameters.extension;
	} else {
		type = prop.parameters.url.substr(prop.parameters.url.lastIndexOf('.') + 1);
	}

	//console.log( type );

	switch (type) {

		case "glb":
			loader = new GLTFLoader();

			const dracoLoader = new DRACOLoader();

			if (prop.parameters !== undefined) {

				if (prop.parameters.setDecoderPath !== undefined) {
					dracoLoader.setDecoderPath(prop.parameters.setDecoderPath);
				}

				if (prop.parameters.setDecoderConfig !== undefined) {
					dracoLoader.setDecoderConfig(prop.parameters.setDecoderConfig);
				}

				loader.setDRACOLoader(dracoLoader);

			}

			objectLoader(prop.parameters.url, callBack, callBackProp)

			break;


		case "gltf":
			loader = new GLTFLoader();

			if (prop.parameters.type == 'base64') {

				let newContents = VARCO.f.base64ToArrayBuffer(prop.parameters.url);

				objectParser(newContents, callBack, callBackProp);

			} else {
				objectLoader(prop.parameters.url, callBack, callBackProp);

			}

			break;


		case "obj":
			loader = new OBJLoader();

			if (prop.parameters !== undefined) {

				if (prop.parameters.setPath !== undefined) {
					loader.setPath = prop.parameters.setPath;
				}

				if (prop.parameters.MTLLoader !== undefined) {

					loaderMat = new MTLLoader();

					if (prop.parameters.MTLLoader.setPath !== undefined) {
						loaderMat.loader.setPath = prop.parameters.MTLLoader.setPath;
					}

					loaderMat.load(prop.parameters.MTLLoader.url, function (materials) {
						materials.preload();
						loader.setMaterials(materials)
						objectLoader(prop.parameters.url, callBack, callBackProp);
					});

				} else {

					objectLoader(prop.parameters.url, callBack, callBackProp);

				}

			}

			break;


		case "dae":
			loader = new ColladaLoader();
			objectLoader(prop.parameters.url, callBack, callBackProp);

			break;


		case "usdz":
			loader = new USDZLoader();
			objectLoader(prop.parameters.url, callBack, callBackProp);

			break;


		case "fbx":
			loader = new FBXLoader();
			objectLoader(prop.parameters.url, callBack, callBackProp);

			break;


		case "3ds":
			loader = new TDSLoader();

			if (prop.parameters !== undefined) {
				if (prop.parameters.setResourcePath !== undefined) {
					loader.setResourcePath = prop.parameters.setResourcePath;
				}
			}

			objectLoader(prop.parameters.url, callBack, callBackProp);

			break;

		case "json":

			alert("oggetto complesso");

			break;


	}

};



VARCO.f.setParameters = function (defaultParameters, newPrameters) {

	let parametersList = Object.keys(defaultParameters);

	for (var i = 0; i < parametersList.length; i++) {

		if (newPrameters[parametersList[i]] !== null && newPrameters[parametersList[i]] !== undefined) {

			if (typeof newPrameters[parametersList[i]] == 'object') {

				let propList = Object.keys(newPrameters[parametersList[i]]);

				for (var j = 0; j < propList.length; j++) {

					defaultParameters[parametersList[i]][propList[j]] = newPrameters[parametersList[i]][propList[j]];

				}

			}

			if (typeof newPrameters[parametersList[i]] == 'string') {

				if (newPrameters[parametersList[i]].includes('THREE')) {

					let namespaces = newPrameters[parametersList[i]].split(".");

					defaultParameters[parametersList[i]] = THREE[namespaces[1]];

					defaultParameters[parametersList[i]] = newPrameters[parametersList[i]];

				} else {

					defaultParameters[parametersList[i]] = newPrameters[parametersList[i]];

				}

			}

			if (typeof newPrameters[parametersList[i]] == 'number') {

				defaultParameters[parametersList[i]] = newPrameters[parametersList[i]];

			}

			if (typeof newPrameters[parametersList[i]] == 'boolean') {

				defaultParameters[parametersList[i]] = newPrameters[parametersList[i]];

			}

		}

	}

	return defaultParameters;

};

// VARCO.f.addTexture(
// PLY.p.scene3d,
// {
// "name" : "gianfiaba",
// "url" : "images/sky.jpg",
// "parameters" : {
// "mapping" : "THREE.UVMapping",
// "wrapS" : "THREE.RepeatWrapping",
// "wrapT" : "THREE.RepeatWrapping",
// "magFilter" : "THREE.NearestFilter",
// "minFilter" : "THREE.NearestMipmapNearestFilter",
// "format" : "THREE.AlphaFormat",
// "type" : "THREE.UnsignedByteType",
// "anisotropy" : 1,
// "encoding" : "THREE.LinearEncoding",
// "offset": { "x": 0.0, "y": 0.0 },
// "repeat": { "x": 1.0, "y": 1.0 },
// "rotation" : 20.0,
// "center" : { "x": 0.5, "y": 0.5 },
// "flipY" : true
// }
// },
// function( { "info" : "pippo" } ){
// alert( p.info  )
// }

// );

// VARCO.f.addTexture(
// PLY.p.scene3d,
// {
// "name" : "pluto",
// "url" : "images/sky.jpg"
// },
// function( { "info" : "pippo" } ){
// alert( p.info  )
// }

// );


VARCO.f.addTexture = function (SCENE, prop, callBack, callBackProp) {

	let setupTextureParameter = function (texture) {

		texture.name = prop.name;

		if (prop.parameters !== undefined) {

			let propList = Object.keys(prop.parameters);

			for (var i = 0; i < propList.length; i++) {

				// controlla se il parametro scritto dall'utente e' presente anche nell'oggetto texture di Threejs
				// se si continua ad assegnare i parametri

				if (texture[propList[i]] !== undefined) {

					switch (typeof prop.parameters[propList[i]]) {

						case 'string':

							// se e' un comando di threejs come ad esempio THREE.RepeatWrapping ...

							if (prop.parameters[propList[i]].includes("THREE")) {

								let namespaces = prop.parameters[propList[i]].split(".");

								texture[propList[i]] = THREE[namespaces[1]];

							} else { // se e' una stringa come ad esempio "Pippo" che equivale al nome

								texture[propList[i]] = prop.parameters[propList[i]];

							}

							break;

						case 'object':

							if (typeof prop.parameters[propList[i]] === 'object') {

								let propFunList = Object.keys(prop.parameters[propList[i]]);

								for (var j = 0; j < propFunList.length; j++) {

									texture[propList[i]][propFunList[j]] = prop.parameters[propList[i]][propFunList[j]];

								}

							}

							break;

						default:

							texture[propList[i]] = prop.parameters[propList[i]];

					}

				}

			}

		}


		if (SCENE !== undefined) {

			if (SCENE.TEXTURES == undefined) {

				SCENE.TEXTURES = {};

			}

			SCENE.TEXTURES[texture.name] = texture;

		}

		if (callBack !== undefined) {

			if (callBackProp !== undefined) {

				callBackProp.obj = texture;

				callBack(callBackProp);

			} else {

				callBack({ obj: texture });

			}

		}

	};


	// instantiate a loader
	let loader

	let TEXTURE;


	let loadStandardTexture = function () {

		loader = new THREE.TextureLoader();

		loader.load(
			// resource URL
			prop.url,

			// onLoad callback
			function callbackTexture(texture) {

				setupTextureParameter(texture);

			},

			// onProgress callback currently not supported
			undefined,

			// onError callback
			function callbackTextureError(err) {

				console.error('An error happened.');

			}
		);

	};


	let createBase64Texture = function () {

		console.log("createBase64Texture");

		TEXTURE = new THREE.Texture();

		if (prop.url !== undefined) {

			var image = new Image();

			// image.src = 'data:image/png;base64,' + prop.base64Data;

			image.src = prop.url;

			image.onload = function () {

				TEXTURE.image = image;

				TEXTURE.needsUpdate = true;

				console.log("texture base64 caricata");

				setupTextureParameter(TEXTURE);

			};

		}

	};


	let createStringTexture = function () {

		let parameters = {
			string: "",
			width: 256,
			height: 16,
			fontSize: '12pt',
			fontType: 'Verdana',
			textAlign: "center",
			textBaseline: "middle",
			textPosition: new THREE.Vector2(128, 8),
			shadowEnabled: false,
			shadowBlur: 4,
			shadowColor: new THREE.Color(0, 0, 0),
			shadowOffset: new THREE.Vector2(2, 2),
			color: new THREE.Color(1, 0, 0),
			backDropColor: new THREE.Color(1, 0, 0),
		};

		if (prop == undefined) {
			prop = {};
		}

		if (prop.parameters !== undefined) {
			parameters = VARCO.f.setParameters(parameters, prop.parameters);
		}

		// canvas:
		var canvas = document.createElement('canvas');
		canvas.id = name;

		canvas.width = parameters.width;
		canvas.height = parameters.height;

		var ctx = canvas.getContext("2d");

		if (parameters.textAlign == "center") {
			parameters.textPosition.x = parameters.width * 0.5;
			parameters.textPosition.y = parameters.height * 0.5;

		}

		// background:
		let alpha = 0;

		if (parameters.backDropColor == 'transparent') {
			ctx.fillStyle = 'transparent'
		} else {
			ctx.fillStyle = "rgb(" + Math.floor(parameters.backDropColor.r * 255) + "," + Math.floor(parameters.backDropColor.g * 255) + "," + Math.floor(parameters.backDropColor.b * 255) + ")";
		}

		ctx.fillRect(0, 0, parameters.width, parameters.height);

		// text:
		ctx.font = parameters.fontSize + " " + parameters.fontType;
		ctx.fillStyle = "rgb(" + Math.floor(parameters.color.r * 255) + "," + Math.floor(parameters.color.g * 255) + "," + Math.floor(parameters.color.b * 255) + ")";
		ctx.textAlign = parameters.textAlign;
		ctx.textBaseline = parameters.textBaseline;

		// shadow:
		if (parameters.shadowEnabled) {
			ctx.shadowBlur = parameters.shadowBlur
			ctx.shadowColor = "rgb(" + Math.floor(parameters.shadowColor.r * 255) + "," + Math.floor(parameters.shadowColor.g * 255) + "," + Math.floor(parameters.shadowColor.b * 255) + ")";
			ctx.shadowOffsetX = parameters.shadowOffset.x
			ctx.shadowOffsetY = parameters.shadowOffset.y

		}

		ctx.fillText(parameters.string, parameters.textPosition.x, parameters.textPosition.y);

		// canvas texture
		TEXTURE = new THREE.CanvasTexture(canvas);

		if (prop.name !== undefined) {
			name = prop.name;
			TEXTURE.name = name;
		}

		setupTextureParameter(TEXTURE);

		return TEXTURE;

	};



	let createCanvasTexture = function () {

		let parameters = {
			canvas: null
		};

		if (prop == undefined) {
			prop = {};
		}

		if (prop.parameters !== undefined) {
			parameters = VARCO.f.setParameters(parameters, prop.parameters);
		}

		// canvas texture
		TEXTURE = new THREE.CanvasTexture(parameters.canvas);

		if (prop.name !== undefined) {
			name = prop.name;
			TEXTURE.name = name;
		}

		setupTextureParameter(TEXTURE);

		return TEXTURE;

	};



	let createVideoTexture = function () {

		// console.log( "addVideoTexture" );

		let TEXTURE = undefined,
			videoParameters = {
				name: "videoTexture",
				url: "",
				loop: false,
				autoplay: false,
				volume: 1.0,
				speed: 1.0,
				type: "map",
				muted: true
			};

		videoParameters = VARCO.f.setParameters(videoParameters, prop);

		let videoElement = document.createElement('video');
		videoElement.id = videoParameters.name;
		videoElement.src = videoParameters.url;
		videoElement.setAttribute('webkit-playsinline', 'webkit-playsinline');
		videoElement.setAttribute('playsinline', 'playsinline');
		videoElement.load();
		videoElement.volume = videoParameters.volume;
		videoElement.loop = videoParameters.loop;
		videoElement.autoplay = videoParameters.autoplay;
		videoElement.muted = videoParameters.muted;
		videoElement.speed = videoParameters.speed;

		if (prop.parameters == undefined) {
			prop.parameters = {};
		}

		prop.parameters.minFilter = THREE.LinearFilter;
		prop.parameters.magFilter = THREE.LinearFilter;
		prop.parameters.format = THREE.RGBAFormat;

		TEXTURE = new THREE.VideoTexture(videoElement);

		if (prop.name !== undefined) {
			name = prop.name;
			TEXTURE.name = name;
		}

		setupTextureParameter(TEXTURE);

		return TEXTURE;

	};


	switch (prop.type) {

		case "imageUrl":

			loadStandardTexture();

			break;

		case "base64":

			createBase64Texture();

			break;

		case "matrixData":

			break;

		case "canvas":

			createCanvasTexture();

			break;

		case "string":

			createStringTexture();

			break;

		case "video":

			createVideoTexture();

			break;

		default:

			loadStandardTexture();

			break;

	}

};




VARCO.f.playVideoTexture = function (SCENE, name) {

	SCENE.TEXTURES[name].image.play();

};


VARCO.f.pauseVideoTexture = function (SCENE, name) {

	SCENE.TEXTURES[name].image.pause();

};


VARCO.f.stopVideoTexture = function (SCENE, name) {

	SCENE.TEXTURES[name].image.pause();
	SCENE.TEXTURES[name].image.currentTime = 0.0;

};


VARCO.f.deleteVideoTexture = function (SCENE, name) {

	SCENE.TEXTURES[name].image.pause();
	SCENE.TEXTURES[name].image.removeAttribute('src'); // empty source
	SCENE.TEXTURES[name].image.remove();
	SCENE.TEXTURES[name].dispose();

	delete SCENE.TEXTURES[name]

}


VARCO.f.stopAllVideoTextures = function (SCENE) {

	var propList = Object.keys(SCENE.TEXTURES);

	for (var num = 0, len = propList.length; num < len; num++) {
		if (SCENE.TEXTURES[propList[num]] !== undefined) {
			VARCO.f.stopVideoTexture(SCENE, propList[num]);
			SCENE.TEXTURES[propList[num]].isPlaying = false;
		}
	}

};


// VARCO.f.addMaterial(
// sceneOrNode,
// {
// "name" : "gianfiaba_mat",
// "type" : "MeshStandardMaterial",
// "parameters" : {
// "color" : { "r": 0.5, "g": 1.0, "b": 1.0 },
// "metalness" : 0.75,
// "roughness" : 0.3,
// "transparent" : true,
// "opacity" : 0.8,
// "textures" : { "map" : "metalTexture", "envMap" : "reflectionsSky" }
// }
// },
// function( p ){
// alert( p.info  )
// },
// { "info" : "goodpoint" }

// );


VARCO.f.addMaterial = function (SCENE, prop, callBack, callBackProp) {


	if (prop.type == undefined) {

		console.error('the TYPE of the material property NOT exist ');

	} else {

		console.log(prop.type)

		const MATERIAL = new THREE[prop.type];

		MATERIAL.name = prop.name;

		if (prop.parameters !== undefined) {

			let propList = Object.keys(prop.parameters);

			for (var i = 0; i < propList.length; i++) {

				// controlla se il parametro scritto dall'utente e' textures
				// se si continua ad associare la texture al materiale

				switch (propList[i]) {

					case "textures":

						let propListTextures = Object.keys(prop.parameters[propList[i]]);

						for (var j = 0; j < propListTextures.length; j++) {

							if (typeof prop.parameters[propList[i]][propListTextures[j]] == 'string') {

								if (SCENE !== undefined) {

									if (SCENE.TEXTURES[prop.parameters[propList[i]][propListTextures[j]]] !== undefined) {

										MATERIAL[propListTextures[j]] = SCENE.TEXTURES[prop.parameters[propList[i]][propListTextures[j]]];

									} else {

										console.error('textures ' + prop.parameters[propList[i]][propListTextures[j]] + ' doesn t exist in scene ' + SCENE.name);

									}

								} else {

									console.error('SCENE is undefined');

								}

							} else {

								if (typeof prop.parameters[propList[i]][propListTextures[j]] == 'object') {

									if (prop.parameters[propList[i]][propListTextures[j]].isTexture) {

										MATERIAL[propListTextures[j]] = prop.parameters[propList[i]][propListTextures[j]]; // isTextures

									} else {

										console.error('property ' + prop.name + ' in not a texture object ');

									}

								}

							}

						}

						break;


					default:

						// controlla se il parametro scritto dall'utente e' presente anche nell'oggetto texture di Threejs
						// se si continua ad assegnare i parametri

						if (MATERIAL[propList[i]] !== undefined) {

							switch (typeof prop.parameters[propList[i]]) {

								case 'string':

									if (prop.parameters[propList[i]].includes('THREE')) {

										let namespaces = prop.parameters[propList[i]].split(".");

										//console.log( namespaces[ 1 ] )

										MATERIAL[propList[i]] = THREE[namespaces[1]];

									} else {

										MATERIAL[propList[i]] = prop.parameters[propList[i]];

									}

									break;

								case 'object':

									// prametri per vettori 2 o 3 o ( rgb )

									if (typeof prop.parameters[propList[i]] === 'object') {

										let propFunList = Object.keys(prop.parameters[propList[i]]);

										for (var j = 0; j < propFunList.length; j++) {

											MATERIAL[propList[i]][propFunList[j]] = prop.parameters[propList[i]][propFunList[j]];

										}

									}

									break;


								default:

									MATERIAL[propList[i]] = prop.parameters[propList[i]];

							}

						}
				}

			}

		}

		if (SCENE !== undefined) {

			if (SCENE.MATERIALS == undefined) {

				SCENE.MATERIALS = {};

			}

		}

		SCENE.MATERIALS[MATERIAL.name] = MATERIAL;

		if (callBack !== undefined) {

			if (callBackProp !== undefined) {

				callBackProp.obj = MATERIAL;

				callBack(callBackProp);

			} else {

				callBack({ obj: MATERIAL });

			}

		}

		return MATERIAL;

	}

};





// MM3D.f.addMesh(
// sceneOrNode,
// {
// "name" : "gianfiaba_mesh",
// "type" : "BoxGeometry",

// "parameters" : {
// "width" : 0.5,
// "height" : 1,
// "depth" : 2
// }

// "materialList" : [ 		// one or more than material, using geometry layers

// [ "faceA_mat", "faceB_mat", "faceC_mat", "faceD_mat", "faceE_mat", "faceF_mat" ], 	// face/part of a meshGroup material --> Example: box geometry has got 6 parts

// // OR : 

// [ 
// {
// "type" : "MeshStandardMaterial", 	// create material runtime for face/part meshGroup
// "name" : "faceA_mat",
// "parameters" : {
// "color" : { "r": 1.0, "g": 0.0, "b": 0.0 }
// }
// },
// {
// "type" : "MeshStandardMaterial", 	
// "name" : "faceB_mat",
// "parameters" : {
// "color" : { "r": 1.0, "g": 1.0, "b": 0.0 }
// }
// }, 
// {
// "type" : "MeshStandardMaterial", 	
// "name" : "faceC_mat",
// "parameters" : {
// "color" : { "r": 0.0, "g": 1.0, "b": 0.0 }
// }
// },
// {
// "type" : "MeshStandardMaterial", 	
// "name" : "faceD_mat",
// "parameters" : {
// "color" : { "r": 0.0, "g": 1.0, "b": 1.0 }
// }
// },
// {
// "type" : "MeshStandardMaterial", 	
// "name" : "faceE_mat",
// "parameters" : {
// "color" : { "r": 0.0, "g": 1.0, "b": 0.0 }
// }
// },
// {
// "type" : "MeshStandardMaterial", 	
// "name" : "faceF_mat",
// "parameters" : {
// "color" : { "r": 0.5, "g": 1.0, "b": 0.5 }
// }
// }
// ],

// {
// "type" : "MeshBasicMaterial", 	// create material runtime
// "name" : "pota_he_mat",
// "parameters" : {
// "color" : { "r": 1.0, "g": 0.75, "b": 0.0 }
// }
// }, 

// "ciccioMat"		// ready material from sceneOfNode.MATERIALS[ "ciccioMat" ]
// ],

// "position" : { "x": 0.5, "y": 1.0, "z": 1.0 },
// "rotation" :  { "x": 55, "y": 10.0, "z": -10.0 },
// "visible" : true

// },

// function( p ){
// console.log( p.obj  )
// }

// );

VARCO.f.addMesh = function (SCENE, prop, callBack, callBackProp) {


	// GEOMETRY:

	const propList = Object.keys(prop.parameters);

	let GEOMETRY;

	let MESH;

	let paramList;

	let defaultMaterial = new THREE.MeshBasicMaterial();


	switch (prop.type) {

		case "PlaneGeometry":    // (width : Float, height : Float, [param:Integer widthSegments], heightSegments : Integer)

			paramList = {
				width: 1,
				height: 1,
				widthSegments: 1,
				heightSegments: 1
			};

			for (var i = 0; i < propList.length; i++) {
				if (paramList[propList[i]] !== undefined) {
					paramList[propList[i]] = prop.parameters[propList[i]];
				}
			}

			GEOMETRY = new THREE.PlaneGeometry(paramList.width, paramList.height, paramList.widthSegments, paramList.heightSegments);

			break;


		case "CircleGeometry":     // (radius : Float, segments : Integer, thetaStart : Float, thetaLength : Float)

			paramList = {
				radius: 1,
				segments: 32,
				thetaStart: 0,
				thetaLength: VARCO.f.deg2rad(360.0)
			};

			for (var i = 0; i < propList.length; i++) {
				if (paramList[propList[i]] !== undefined) {
					paramList[propList[i]] = prop.parameters[propList[i]];
				}
			}

			GEOMETRY = new THREE.CircleGeometry(paramList.radius, paramList.segments, paramList.thetaStart, paramList.thetaLength);

			break;


		case "BoxGeometry":		// (width : Float, height : Float, depth : Float, widthSegments : Integer, heightSegments : Integer, depthSegments : Integer)

			paramList = {
				width: 1,
				height: 1,
				depth: 1,
				widthSegments: 1,
				heightSegments: 1,
				depthSegments: 1
			};

			for (var i = 0; i < propList.length; i++) {
				if (paramList[propList[i]] !== undefined) {
					paramList[propList[i]] = prop.parameters[propList[i]];
				}
			}

			GEOMETRY = new THREE.BoxGeometry(paramList.width, paramList.height, paramList.depth, paramList.widthSegments, paramList.heightSegments, paramList.depthSegments);

			break;

		case "SphereGeometry":		// (radius : Float, widthSegments : Integer, heightSegments : Integer, phiStart : Float, phiLength : Float, thetaStart : Float, thetaLength : Float)

			paramList = {
				radius: 1,
				widthSegments: 32,
				heightSegments: 16,
				phiStart: VARCO.f.deg2rad(0.0),
				phiLength: VARCO.f.deg2rad(360.0),
				thetaStart: VARCO.f.deg2rad(0.0),
				thetaLength: VARCO.f.deg2rad(180.0)
			};

			for (var i = 0; i < propList.length; i++) {
				if (paramList[propList[i]] !== undefined) {
					paramList[propList[i]] = prop.parameters[propList[i]];
				}
			}

			GEOMETRY = new THREE.SphereGeometry(paramList.radius, paramList.widthSegments, paramList.heightSegments, paramList.phiStart, paramList.phiLength, paramList.thetaStart, paramList.thetaLength);

			break;

		case "CylinderGeometry":	// (radiusTop : Float, radiusBottom : Float, height : Float, radialSegments : Integer, heightSegments : Integer, openEnded : Boolean, thetaStart : Float, thetaLength : Float)

			break;

		case "ConeGeometry":

			break;

		case "DodecahedronGeometry":

			break;

		case "IcosahedronGeometry":

			break;

		case "OctahedronGeometry":

			break;

		case "PolyhedronGeometry":

			break;

		case "TetrahedronGeometry":

			break;

		case "EdgesGeometry":

			break;

		case "ExtrudeGeometry":

			break;

		case "LatheGeometry":

			break;

		case "RingGeometry":

			break;

		case "ShapeGeometry":

			break;

		case "TorusGeometry":

			break;

		case "TubeGeometry":

			break;

		case "TorusKnotGeometry":

			break;

		case "WireframeGeometry":

			break;

		case "CapsuleGeometry":

			break;


	}



	// MATERIALLIST:

	let newArrayMat = []

	let newMaterialList = [];

	let newMat;

	if (prop.materialList !== undefined) {

		if (prop.materialList.length > 1) {

			MESH = new THREE.Group();

		}

		for (var i = 0; i < prop.materialList.length; i++) {

			switch (typeof prop.materialList[i]) {

				case "array":

					if (Array.isArray(prop.materialList[i])) {

						newArrayMat = [];

						// materialList = [ [ mat, mat, mat ] ] ==> one material per face/group of the mesh

						for (var j = 0; j < prop.materialList[i].length; j++) {

							switch (typeof prop.materialList[i][j]) {

								case "string":

									if (SCENE !== undefined) {

										if (SCENE.MATERIALS[prop.materialList[i][j]] !== undefined) {

											newArrayMat.push(SCENE.MATERIALS[prop.materialList[i][j]]);

										} else {

											console.error('material not exist in SCENE.MATERIALS');

										}

									} else {

										console.error('SCENE is undefined');

									}

									break;

								case "object":

									if (prop.materialList[i].isMaterial) {

										newArrayMat.push(prop.materialList[i][j]);

									} else {

										newMat = VARCO.f.addMaterial(SCENE, prop.materialList[i][j]);

										newArrayMat.push(newMat);

									}

									break;

							}

						}


						newMaterialList.push(newArrayMat); // multilayer material with more than one geometry


					} else {

						// if is an object already material 

						if (prop.materialList[i].isMaterial) {

							newMaterialList.push(prop.materialList[i]);

						} else {

							// if is an object with material properties, create new material

							newMat = VARCO.f.addMaterial(SCENE, prop.materialList[i]);

							newMaterialList.push(newMat);

						}

					}

					break;


				case "string":

					// console.log( prop.materialList[ i ] );

					if (SCENE.MATERIALS[prop.materialList[i]] !== undefined) {

						newMaterialList.push(SCENE.MATERIALS[prop.materialList[i]]);

					} else {

						newMaterialList.push(defaultMaterial);

						console.error("material " + prop.materialList[i] + " not exist ");

					}

					break;

				case "object":

					// console.log( prop.materialList[ i ] );

					if (Array.isArray(prop.materialList[i])) {

						newArrayMat = [];

						for (var j = 0; j < prop.materialList[i].length; j++) {

							switch (typeof prop.materialList[i][j]) {

								case "string":

									if (SCENE !== undefined) {

										if (SCENE.MATERIALS[prop.materialList[i][j]] !== undefined) {

											newArrayMat.push(SCENE.MATERIALS[prop.materialList[i][j]]);

										} else {

											console.error('material not exist in SCENE.MATERIALS');

										}

									} else {

										console.error('SCENE is undefined');

									}

									break;

								case "object":

									if (prop.materialList[i].isMaterial) {

										newArrayMat.push(prop.materialList[i][j]);

									} else {

										newMat = VARCO.f.addMaterial(SCENE, prop.materialList[i][j]);

										newArrayMat.push(newMat);

									}

									break;

							}

						}


						newMaterialList.push(newArrayMat);	// array material per single face/part of the mesh


					} else {

						if (prop.materialList[i].isMaterial) {

							newMaterialList.push(prop.materialList[i]);

						} else {

							newMat = VARCO.f.addMaterial(SCENE, prop.materialList[i]);

							newMaterialList.push(newMat);

						}

					}

					break;

			}

		}

	} else {

		// default material only:

		newMaterialList = defaultMaterial;

	}

	if (MESH !== undefined) {

		for (var i = 0; i < newMaterialList.length; i++) {

			MESH.add(new THREE.Mesh(GEOMETRY, newMaterialList[i]));

		}

	} else {

		MESH = new THREE.Mesh(GEOMETRY, newMaterialList[0]);

	}


	// property: // -----------------------------------------------------

	VARCO.f.setPropAndParameters(MESH, prop, SCENE);


	// if ( prop.helper !== undefined ){

	// if ( prop.helper.edges !== undefined ){

	// console.log( prop.helper.edges );

	// const edges = new THREE.EdgesGeometry( GEOMETRY ); 

	// const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) );

	// if ( prop.helper.edges.color !== undefined ){

	// line.material.color.r = prop.helper.edges.color.r;

	// line.material.color.g = prop.helper.edges.color.g;

	// line.material.color.b = prop.helper.edges.color.b;

	// };

	// console.log( line );

	// MESH.add( line );

	// };

	// };


	if (SCENE !== undefined) {

		if (SCENE.OBJECTS == undefined) {

			SCENE.OBJECTS = {};

		}

		SCENE.OBJECTS[MESH.name] = MESH;

		SCENE.add(MESH);

	}

	if (callBack !== undefined) {

		if (callBackProp !== undefined) {

			callBackProp.obj = MESH;

			callBack(callBackProp);

		} else {

			callBack({ obj: MESH });

		}

	}

	return MESH;

};




VARCO.f.addLine = function (SCENE, prop, callBack, callBackProp) {


	// GEOMETRY:

	const propList = Object.keys(prop.parameters);

	let GEOMETRY;

	let LINE;

	let paramList;

	let defaultMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });


	switch (prop.type) {

		case "Line":

			paramList = {
				propList: []
			};

			for (var i = 0; i < propList.length; i++) {
				if (paramList[propList[i]] !== undefined) {
					paramList[propList[i]] = prop.parameters[propList[i]];
				}
			}

			GEOMETRY = new THREE.BufferGeometry().setFromPoints(prop.parameters.pointList);

			break;


		case "CircleGeometry":

			break;


		case "BoxGeometry":

			break;


	}



	// MATERIALLIST:

	let newArrayMat = []

	let newMaterialList = [];

	let newMat;

	if (prop.materialList !== undefined) {

		switch (typeof prop.materialList[0]) {

			case "string":

				// console.log( prop.materialList[ i ] );

				if (SCENE.MATERIALS[prop.materialList[0]] !== undefined) {

					newMaterialList.push(SCENE.MATERIALS[prop.materialList[0]]);

				} else {

					newMaterialList.push(defaultMaterial);

					console.error("material " + prop.materialList[0] + " not exist ");

				}

				break;

			case "object":

				// console.log( prop.materialList[ i ] );

				if (prop.materialList[0].isMaterial) {

					newMaterialList.push(prop.materialList[0]);

				} else {

					newMat = VARCO.f.addMaterial(SCENE, prop.materialList[0]);

					newMaterialList.push(newMat);

				}


				break;

		}


	} else {

		// default material only:

		newMaterialList = defaultMaterial;

	}


	LINE = new THREE.Line(GEOMETRY, newMaterialList[0]);


	// property: // -----------------------------------------------------

	VARCO.f.setPropAndParameters(LINE, prop, SCENE);


	if (SCENE !== undefined) {

		if (SCENE.OBJECTS == undefined) {

			SCENE.OBJECTS = {};

		}

		SCENE.OBJECTS[LINE.name] = LINE;

		SCENE.add(LINE);

	}

	if (callBack !== undefined) {

		if (callBackProp !== undefined) {

			callBackProp.obj = LINE;

			callBack(callBackProp);

		} else {

			callBack({ obj: LINE });

		}

	}

	return LINE;

};




VARCO.f.addSprite = function (SCENE, prop, callBack, callBackProp) {


	// SPRITE:

	if (prop !== undefined) {
		if (prop.parameters == undefined) {
			prop.parameters = {};
		}
	} else {
		prop = { parameters: {} };
	}


	const propList = Object.keys(prop.parameters);

	let SPRITE;

	let defaultMaterial = new THREE.SpriteMaterial();

	let parameters = {
		center: { x: 0.5, y: 0.5 }
	};

	for (var i = 0; i < propList.length; i++) {
		if (parameters[propList[i]] !== undefined) {
			parameters[propList[i]] = prop.parameters[propList[i]];
		}
	}


	// MATERIALLIST:

	let newArrayMat = []

	let newMaterialList = [];

	let newMat;

	if (prop.materialList !== undefined) {

		if (prop.materialList.length > 1) {

			MESH = new THREE.Group();

		}

		switch (typeof prop.materialList[0]) {

			case "string":

				// console.log( prop.materialList[ 0 ] );

				if (SCENE.MATERIALS[prop.materialList[0]] !== undefined) {

					newMaterialList.push(SCENE.MATERIALS[prop.materialList[0]]);

				} else {

					newMaterialList.push(defaultMaterial);

					console.error("material " + prop.materialList[0] + " not exist ");

				}

				break;

			case "object":

				// console.log( prop.materialList[ 0 ] );

				if (prop.materialList[0].isMaterial) {

					newMaterialList.push(prop.materialList[0]);

				} else {

					newMat = VARCO.f.addMaterial(SCENE, prop.materialList[0]);

					newMaterialList.push(newMat);

				}

				break;

		}


	} else {

		// default material only:

		newMaterialList = defaultMaterial;

	}


	SPRITE = new THREE.Sprite(newMaterialList[0]);

	// property: // -----------------------------------------------------

	VARCO.f.setPropAndParameters(SPRITE, prop, SCENE);


	if (SCENE !== undefined) {

		if (SCENE.OBJECTS == undefined) {

			SCENE.OBJECTS = {};

		}

		SCENE.OBJECTS[SPRITE.name] = SPRITE;

		SCENE.add(SPRITE);

	}

	if (callBack !== undefined) {

		if (callBackProp !== undefined) {

			callBackProp.obj = SPRITE;

			callBack(callBackProp);

		} else {

			callBack({ obj: SPRITE });

		}

	}

	return SPRITE;

};





// const addFromFile = function( p ){

// };


VARCO.f.addClone = function (sourceOBJ, targetScene, callBack, callBackProp) {

	let newClonedObject = sourceOBJ.clone();

	targetScene.add(newClonedObject);

	VARCO.f.setPropAndParameters(newClonedObject, {});

	if (callBack !== undefined) {
		if (callBackProp !== undefined) {
			callBackProp.obj = COMPLEX;
			callBack(callBackProp);
		} else {
			callBack({ obj: COMPLEX });
		}
	}

	return newClonedObject;

}





VARCO.f.addComplex = function (SCENE, prop, callBack, callBackProp) {

	const COMPLEX = new THREE.Group();
	let counter = 0;
	let totCounter = 0;
	let step = "textureList";

	COMPLEX.OBJECTS = {};
	COMPLEX.MATERIALS = {};
	COMPLEX.TEXTURES = {};
	COMPLEX.PHXCONSTRAINTS = {};
	COMPLEX.PHXMATERIALS = {};


	if (prop == undefined) {
		prop = {};
	}

	if (prop.parameters == undefined) {
		prop.parameters = {}
	}

	if (prop.script) {
		var new_script = document.createElement('script');
		new_script.setAttribute('src', prop.script);
		document.head.appendChild(new_script);
	}

	function complexObjectDone() {

		VARCO.f.setPropAndParameters(COMPLEX, prop, SCENE);

		if (SCENE !== undefined) {
			if (SCENE.OBJECTS == undefined) {
				SCENE.OBJECTS = {};
			}
			SCENE.OBJECTS[COMPLEX.name] = COMPLEX;
			SCENE.add(COMPLEX);
		}

		//console.log( "FINE" );

		if (callBack !== undefined) {
			if (callBackProp !== undefined) {
				callBackProp.obj = COMPLEX;
				callBack(callBackProp);
			} else {
				callBack({ obj: COMPLEX });
			}
		}

	}


	function checkCounter(p) {

		counter = counter + 1;

		if (counter > prop.parameters[step].length - 1) {

			if (step == "physicConstraintList") {
				complexObjectDone();
			}

			if (step == "elementList") {
				createPhysicContraints();
			}

			if (step == "materialList") {
				createElements();
			}

			if (step == "textureList") {
				createMaterials();
			}

		}

	}


	function createTextures() {

		// console.log( prop );

		if (prop.parameters.textureList !== undefined) {

			counter = 0;
			totCounter = prop.parameters.textureList.length;
			//COMPLEX.TEXTURES = {};

			for (var i = 0; i < prop.parameters.textureList.length; i++) {

				VARCO.f.addTexture(
					COMPLEX,
					prop.parameters.textureList[i],
					checkCounter,
					{}
				);

				if (prop.parameters.textureList[i].text !== undefined) { // string words

					VARCO.f.addCanvasTexture(
						COMPLEX,
						prop.parameters.textureList[i],
						checkCounter,
						{}

					);

				}


				if (prop.parameters.textureList[i].data !== undefined) { // data array


				}


				if (prop.parameters.textureList[i].src !== undefined) { // source data src


				}

			}

		} else {

			createMaterials()

		}

	}


	function createMaterials() {

		if (prop.parameters.materialList !== undefined) {
			step = "materialList"
			counter = 0;
			totCounter = prop.parameters.materialList.length;

			if (totCounter > 0) {
				//COMPLEX.MATERIALS = {};

				for (var i = 0; i < prop.parameters.materialList.length; i++) {
					VARCO.f.addMaterial(
						COMPLEX,
						prop.parameters.materialList[i],
						checkCounter,
						{}
					);
				}

			}

		} else {

			createElements();

		}

	}



	function createElements() {

		if (prop.parameters.elementList !== undefined) {

			step = "elementList"
			counter = 0;
			totCounter = prop.parameters.elementList.length;

			if (totCounter > 0) {
				//COMPLEX.OBJECTS = {};

				for (var i = 0; i < prop.parameters.elementList.length; i++) {
					VARCO.f[prop.parameters.elementList[i].type](
						COMPLEX,
						prop.parameters.elementList[i].prop,
						checkCounter,
						{}
					);
				}

			}

		} else {

			createPhysicContraints();

		}

	}



	function createPhysicContraints() {

		if (prop.parameters.physicConstraintList !== undefined) {

			step = "physicConstraintList"
			counter = 0;
			totCounter = prop.parameters.physicConstraintList.length;

			if (totCounter > 0) {
				// COMPLEX.PHXCONSTRAINTS = {};

				for (var i = 0; i < prop.parameters.physicConstraintList.length; i++) {

					VARCO.f.addConstraint(
						COMPLEX,
						prop.parameters.physicConstraintList[i],
						checkCounter,
						{}
					);

				}

			}

		} else {

			complexObjectDone()

		}

	}

	createTextures();

};



VARCO.f.addScript = function (node, prop) {

	if (node.MM3D == undefined) {
		node.MM3D = { scriptList: [] };
	} else {
		if (node.MM3D.scriptList == undefined) {
			node.MM3D.scriptList = [];
		}
	}


	if (prop.functionProp == undefined) {
		prop.functionProp = { obj: node };
	} else {
		prop.functionProp.obj = node;
	}


	// let flagExist = false;

	// function checkExist( item ){
	// if ( item.name == prop.name ){
	// flagExist = true;
	// }
	// };

	// node.MM3D.scriptList.forEach( checkExist );

	// if ( flagExist == false){

	node.MM3D.scriptList.push(prop);

	// } else {
	// //console.log( "script " + prop.name + " gia' presente" );
	// }

};



VARCO.f.addEvent = function (node, prop) {

	if (node.MM3D == undefined) {
		node.MM3D = { events: {} };

	} else {

		if (node.MM3D.events == undefined) {
			node.MM3D.events = {};
		}
	}

	node.MM3D.events = prop;

};





VARCO.f.loadComplex = function (SCENE, url, prop, callBack, errorCallBack) {

	console.log('loadComplex');

	console.log(url);

	VARCO.f.loadJSON(
		url,
		function (data) {

			if (prop !== undefined) {
				let propList = Object.keys(prop);
				propList.forEach(function (newProp) {
					data[newProp] = prop[newProp]
				});
			}

			console.log(data);

			VARCO.f.addComplex(
				SCENE,
				data,
				callBack,
				{}
			)

		},
		function (error) {
			errorCallBack();
		}
	)

}





VARCO.f.loadJSON = function (url, callBack, errorCallBack) {

	if (url !== undefined) {

		const request = new XMLHttpRequest();

		request.open("GET", url, true);
		request.setRequestHeader("Content-type", "application/json");

		request.onload = () => {
			if (request.status === 200) {
				try {
					const data = JSON.parse(request.responseText);
					if (callBack !== undefined) callBack(data, { info: "Perfect! " + url });

				} catch (e) {
					if (!e instanceof SyntaxError) {
						console.error(e);
					}
				}
			} else {
				if (errorCallBack !== undefined) errorCallBack(new Error(request.statusText), { info: "Request Failed: " + request.statusText + " --> " + url });
			}
		};

		request.onerror = function () {
			if (errorCallBack !== undefined) {
				errorCallBack(new Error("Network Error"), { info: "Network Error: Unable to fetch " + url });
			}
		};

		request.send();
	}
};







// ///////////////////////////////////////////

VARCO.f.deleteTexture = function (SCENE, TEXTURE, callBack, callBackProp) {

	if (TEXTURE !== undefined) {

		let textureName;

		switch (typeof TEXTURE) {

			case "string":
				textureName = TEXTURE;
				break;

			case "object":
				textureName = TEXTURE.name;
				break;

			default:
				textureName = TEXTURE.name;
				break;
		}

		if (SCENE !== undefined) {

			// texture is the name of the TEXTURE

			if (SCENE.TEXTURES !== undefined) {

				if (SCENE.TEXTURES[textureName] !== undefined) {

					SCENE.TEXTURES[textureName].dispose();

					delete SCENE.TEXTURES[textureName];

				}
			}

		} else {

			TEXTURE.dispose();

			TEXTURE = undefined;

		}

	} else {

		console.log("texture inesistente");

	}


	if (callBack !== undefined) {

		if (callBackProp !== undefined) {
			callBack(callBackProp);
		} else {
			callBack();
		}

	}


};



VARCO.f.deleteMaterial = function (SCENE, MATERIAL, callBack, callBackProp) {

	let materialName;

	switch (typeof MATERIAL) {

		case "string":
			materialName = MATERIAL;
			break;

		case "object":
			materialName = MATERIAL.name;
			MATERIAL.dispose();
			break;

		default:
			materialName = MATERIAL.name;
			MATERIAL.dispose();
	}

	if (SCENE !== undefined) {

		// materialName is the name of the MATERIAL
		SCENE.traverse(

			function (node) {

				if (node.MATERIALS !== undefined) {
					if (node.MATERIALS[materialName] !== undefined) {
						node.MATERIALS[materialName].dispose();
						delete node.MATERIALS[materialName];
					}
				}

			}

		);

	}


	if (callBack !== undefined) {

		if (callBackProp !== undefined) {
			callBack(callBackProp);
		} else {
			callBack();
		}

	}

};



VARCO.f.deleteElement = function (SCENE, OBJ, prop, callBack, callBackProp) {

	let textureTypeList;

	//if ( OBJ !== undefined ){

	if (OBJ.MM3D !== undefined) {

		let textureTypeList = [
			"map",
			"emissiveMap",
			"bumpMap",
			"displacementMap",
			"specularMap",
			"envMap",
			"normalMap",
			"lightMap",
			"aoMap",
			"alphaMap",
			"metalnessMap",
			"roughnessMap",
			"transmissionMap",
			"gradientMap",
			"clearcoatMap",
			"clearcoatNormalMap",
			"clearcoatRoughnessMap"
		],
			flagTexture = true,
			flagGeometry = true,
			flagMaterial = true;


		if (prop !== undefined) {

			if (prop.texture !== undefined) {
				flagTexture = prop.texture;
			}

			if (prop.materials !== undefined) {
				flagMaterial = prop.material;
			}

			if (prop.geometry !== undefined) {
				flagGeometry = prop.geometry;
			}

		}


		OBJ.traverse(function (node) {

			if (node.MM3D !== undefined) {

				// elimino oggetto dalla fisica
				if (node.MM3D.RGDBODY !== undefined) {
					// VARCO.f.deleteCannonPhysic( SCENE, node.MM3D.RGDBODY );  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

				}

				// elimino geometria dalla memoria
				if (node.geometry !== undefined) {
					node.geometry.dispose();

				}

				// elimino oggetto helper
				if (node.MM3D.helper !== undefined) {
					VARCO.f.deleteObject(SCENE, node.MM3D.helper);

				}

				// elimino possibile document legato al field
				const fieldCanvas = document.getElementById("searchField_" + node.uuid);

				if (fieldCanvas !== undefined && fieldCanvas !== null) {
					fieldCanvas.remove(); // Removes the div with the '"searchField_" + node.uuid ' id
				}

				if (node.material !== undefined) {

					// elimino la TEXTURE se textureFlag e' presente TRUE
					if (flagTexture) {

						// controllo l'eventuale lista di materiali ed elimino textures presenti
						if (node.material.length !== undefined) {

							for (var numMat = 0, lenMat = node.material.length; numMat < lenMat; numMat++) {

								for (var numTxt = 0, lenTxt = textureTypeList.length; numTxt < lenTxt; numTxt++) {

									if (node.material[numMat][textureTypeList[numTxt]] !== null && node.material[numMat][textureTypeList[numTxt]] !== undefined) {
										var textureName = node.material[numMat][textureTypeList[numTxt]].name;

										if (SCENE.TEXTURES !== undefined) {
											VARCO.f.deleteTexture(SCENE, textureName);

										}

										node.material[numMat][textureTypeList[numTxt]].dispose();

									}

								}

							}

						} else {

							// elimino textures presenti
							for (var numTxt = 0, lenTxt = textureTypeList.length; numTxt < lenTxt; numTxt++) {

								if (node.material[textureTypeList[numTxt]] !== null && node.material[textureTypeList[numTxt]] !== undefined) {
									// console.log( node.material[textureTypeList[numTxt]] );
									var textureName = node.material[textureTypeList[numTxt]].name;

									if (SCENE !== undefined) {
										if (SCENE.TEXTURES !== undefined) {

											VARCO.f.deleteTexture(SCENE, textureName);

										}
									}

									node.material[textureTypeList[numTxt]].dispose();

								}

							}

						}

					}

					// elimino la MATERIAL se materialFlag e' presente TRUE
					if (flagMaterial) {

						// elimino lista di maeriali
						if (node.material.length !== undefined) {

							for (var numMat = 0, lenMat = node.material.length; numMat < lenMat; numMat++) {

								if (node.material[numMat] !== null && node.material[numMat] !== undefined) {
									var materialName = node.material[numMat].name;

									if (OBJ.MATERIALS !== undefined) {
										VARCO.f.deleteMaterial(OBJ, materialName);

									}

									node.material[numMat].dispose();

								}

							}

						} else {

							// elimino unico materiale
							var materialName = node.material.name;

							//if (SCENE !== undefined) {
							if (OBJ.MATERIALS !== undefined) {
								VARCO.f.deleteMaterial(OBJ, materialName); // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

							}
							// } else {

							// if (node.MM3D.originalComplex !== undefined) {

							// if (node.MM3D.originalComplex.MATERIALS !== undefined) {

							// if (node.MM3D.originalComplex.MATERIALS[materialName] !== undefined) {
							// VARCO.f.deleteMaterial(node.MM3D.originalComplex, materialName);

							// }

							// };

							// };

							// };

							node.material.dispose();

						}

					}

				}


				// if ( node.SOUNDS !== undefined ){

				// propList = Object.keys( node.SOUNDS );
				// for( let num = 0; num < propList.lenght; num +=1 ){
				// console.log( "cancello sound " + propList[ num ] );
				// MM3D.deleteSound( SCENE, propList[ num ] )

				// }


			}

		});


		if (OBJ.parent !== null && OBJ.parent !== undefined) {
			OBJ.parent.remove(OBJ);

		}

		if (SCENE !== undefined) {

			SCENE.traverse(

				function deleteNodeToRemove(node) {

					if (node.OBJECTS !== undefined) {
						let propList = Object.keys(node.OBJECTS);

						for (var i = 0; i < propList.length; i += 1) {

							if (node.OBJECTS[propList[i]].uuid == OBJ.uuid) {

								delete node.OBJECTS[propList[i]];

								break;

							}

						}

					}

				}

			);

			// delete physic RGDBODY
			if (OBJ.MM3D.RGDBODY !== undefined) {

				VARCO.f.deleteRigidBody(SCENE, OBJ);

			}

			SCENE.remove(OBJ);

		}

	} else {
		console.log("OBJ doesn't have Varco's attributes");

	}

	//};


	if (callBack !== undefined) {

		if (callBackProp !== undefined) {
			callBack(callBackProp);
		} else {
			callBack();
		}

	}


};



VARCO.f.playMotions = function (node, playMotionList) {

	//console.log( "addMotions" )

	// init motions map

	if (node.MM3D == undefined) {
		node.MM3D = { playMotionList: [] };
	} else {
		if (node.MM3D.playMotions == undefined) {
			node.MM3D.playMotionList = [];
		}
	}


	for (var i = 0; i < playMotionList.length; i++) {
		node.MM3D.playMotionList.push(playMotionList[i])
	}

};




VARCO.f.doScriptList = function (scriptList) {

	for (var i = 0; i < scriptList.length; i++) {

		const scriptProp = scriptList[i];

		if (scriptProp.type == "MM3D") {
			VARCO.f[scriptProp.functionName](scriptProp.functionProp);
		} else {
			if (scriptProp.function == undefined) {
				if (scriptProp.functionSrc !== undefined) {
					scriptProp.function = new Function('p', scriptProp.functionSrc)
				} else {
					scriptProp.function = VARCO.f.stringToFunction(scriptProp.functionName);
				}
			}

			scriptProp.function(scriptProp.functionProp);

		}

	}

};





// VARCO.f.updateGPS = function(){

// navigator.geolocation.watchPosition(

// function success( data ){

// let gpsDiff = VARCO.f.lonLatDistance( 
// { lng: VARCO.p.DEVICES.GPS.lng , lat: VARCO.p.DEVICES.GPS.lat }, 
// { lng: data.coords.latitude , lat: data.coords.latitude }, 
// "mt"	
// );

// if ( gpsDiff > 3.0 ){
// if ( VARCO.p.DEVICES.GPS.accuracy > data.coords.accuracy ){
// VARCO.p.DEVICES.GPS.updateCoords = true;
// VARCO.p.DEVICES.GPS.accuracy = data.coords.accuracy;

// } else {
// VARCO.p.DEVICES.GPS.updateCoords = false;

// };

// };

// }, 

// function error(){
// VARCO.p.DEVICES.GPS.message = "error gps";
// },

// {
// enableHighAccuracy : true,
// maximumAge: 4000, // should be default, just in case
// timeout: 1500
// }

// );

// };





VARCO.f.updateEvent = function (scene, camera, view) {


	let getScreenNormalizedMouse = function (camera, locH, locV, viewPort) {

		let normaizedScreenVector = undefined;
		let viewPortActive = undefined;
		let view = {
			name: "fullBrowserScreen",
			left: 0.0,
			bottom: 0.0,
			width: window.innerWidth,
			height: window.innerHeight
		};

		if (viewPort != undefined) {
			view = {
				name: viewPort.name,
				x: viewPort.left,
				y: viewPort.bottom,
				width: viewPort.width,
				height: viewPort.height
			};
		}

		if (camera !== undefined) {

			if (locH >= view.x && locH <= (view.x + view.width)) {
				if (locV >= window.innerHeight - (view.y + view.height) && locV <= (window.innerHeight - view.y)) {

					switch (camera.type) {

						case "PerspectiveCamera":
							normaizedScreenVector = new THREE.Vector2();
							normaizedScreenVector.x = ((locH - view.x) / view.width) * 2 - 1;
							normaizedScreenVector.y = -((locV - (window.innerHeight - (view.y + view.height))) / view.height) * 2 + 1;

							break;

						case "OrthographicCamera":
							normaizedScreenVector = new THREE.Vector2();
							normaizedScreenVector.x = 2 * ((locH - view.x) / view.width) - 1;
							normaizedScreenVector.y = 1 - 2 * ((locV - (window.innerHeight - (view.y + view.height))) / view.height);

							break;

					}

				}
			}

		} else {
			// ...

		}

		return normaizedScreenVector;

	};


	let checkTouchMouseEvents = function (normaizedScreenVector, scene, camera, view) {

		if (scene.MM3D == undefined) {

			scene.MM3D = { updateEvents: { clickableList: [], raycaster: new THREE.Raycaster() } };
			scene.traverse(function createNodeClickableList(node) {

				if (node.MM3D !== undefined) {
					if (node.MM3D.events !== undefined) {
						scene.MM3D.updateEvents.clickableList.push(node);
					}
				}

			}
			);

		} else {

			if (scene.MM3D.updateEvents == undefined) {
				scene.MM3D.updateEvents = { clickableList: [] };
			} else {
				scene.MM3D.updateEvents.clickableList = [];
			}

			scene.traverse(function createNodeClickableList(node) {

				if (node.MM3D !== undefined) {
					if (node.MM3D.events !== undefined) {
						scene.MM3D.updateEvents.clickableList.push(node);
					}
				}

			}
			);

		}


		VARCO.p.RAYCAST.setFromCamera(normaizedScreenVector, camera);

		VARCO.p.RAYCAST.params.Line.threshold = 0.001;

		let cursorIntersect = VARCO.p.RAYCAST.intersectObjects(scene.MM3D.updateEvents.clickableList, true);

		if (VARCO.p.DEVICES.eventType !== null) {

			let intersect = VARCO.p.RAYCAST.intersectObjects(scene.MM3D.updateEvents.clickableList, true);

			// console.log( scene.name )
			// console.log( scene.MM3D.updateEvents.clickableList )
			// console.log( '####################' )

			let eventList;

			// ################################################
			// trova errore doppio intersect

			let flagRemove;

			for (let i = 0; i < intersect.length; ++i) {

				flagRemove = null;

				let objToCheck = intersect[i].object.uuid;

				for (let j = 0; j < intersect.length; ++j) {

					if (j !== i) {

						if (objToCheck == intersect[j].object.uuid) {

							flagRemove = j;

						}

					}

				}

				if (flagRemove !== null) {

					intersect.splice(flagRemove, 1)

					i = 0;

				}

			}

			// ################################################


			for (let i = 0; i < intersect.length; ++i) {

				// console.log( intersect[ i ] );

				intersect[i].view = view; // inserisce la VIEW nei risultati del raycast

				if (intersect[i].object.isMesh) {

					if (intersect[i].object.MM3D !== undefined) {

						if (intersect[i].object.MM3D.events !== undefined) {

							// console.log( intersect[ i ].object.name )

							if (intersect[i].object.visible == true) {

								if (intersect[i].object.MM3D.events[VARCO.p.DEVICES.eventType] !== undefined) {

									if (intersect[i].object.MM3D.events[VARCO.p.DEVICES.eventType].feedback) { // feedback puntatre del mouse
										document.body.style.cursor = 'pointer';
										VARCO.p.DEVICES.mouse.mouseFeedback = true
									}

									if (intersect[i].object.MM3D.events[VARCO.p.DEVICES.eventType].button !== undefined) {

										if (VARCO.p.DEVICES.mouse.buttonNum == intersect[i].object.MM3D.events[VARCO.p.DEVICES.eventType].button) {

											if (intersect[i].object.MM3D.events[VARCO.p.DEVICES.eventType].scriptList[j].functionProp == undefined) {
												intersect[i].object.MM3D.events[VARCO.p.DEVICES.eventType].scriptList[j].functionProp = {};
											}

											for (let j = 0; j < intersect[i].object.MM3D.events[VARCO.p.DEVICES.eventType].scriptList.length; ++j) {
												intersect[i].object.MM3D.events[VARCO.p.DEVICES.eventType].scriptList[j].functionProp.obj = intersect[i].object;
												intersect[i].object.MM3D.events[VARCO.p.DEVICES.eventType].scriptList[j].functionProp.results = intersect[i];
												intersect[i].object.MM3D.events[VARCO.p.DEVICES.eventType].scriptList[j].functionProp.view = view;
											}

											intersect[i].object.MM3D.events[VARCO.p.DEVICES.eventType].functionProp = { results: intersect[i] };
											VARCO.f.doScriptList(intersect[i].object.MM3D.events[VARCO.p.DEVICES.eventType].scriptList);

										}

									} else {

										for (let j = 0; j < intersect[i].object.MM3D.events[VARCO.p.DEVICES.eventType].scriptList.length; ++j) {

											if (intersect[i].object.MM3D.events[VARCO.p.DEVICES.eventType].scriptList[j].functionProp == undefined) {
												intersect[i].object.MM3D.events[VARCO.p.DEVICES.eventType].scriptList[j].functionProp = {};
											}

											intersect[i].object.MM3D.events[VARCO.p.DEVICES.eventType].scriptList[j].functionProp.obj = intersect[i].object;
											intersect[i].object.MM3D.events[VARCO.p.DEVICES.eventType].scriptList[j].functionProp.results = intersect[i];
											intersect[i].object.MM3D.events[VARCO.p.DEVICES.eventType].scriptList[j].functionProp.view = view;
										}

										intersect[i].object.MM3D.events[VARCO.p.DEVICES.eventType].functionProp = { results: intersect[i] };
										VARCO.f.doScriptList(intersect[i].object.MM3D.events[VARCO.p.DEVICES.eventType].scriptList);

									}

								}

							}

						}

					}

				}

			}

		}

	};

	// mouse events

	let type;

	if (VARCO.p.DEVICES.eventType == 'mousedown' || VARCO.p.DEVICES.eventType == 'mouseup' || VARCO.p.DEVICES.eventType == 'mousemove' || VARCO.p.DEVICES.eventType == 'mousewheel' || VARCO.p.DEVICES.eventType == 'dblclick') {
		type = 'mouse';
	}

	// touch events

	if (VARCO.p.DEVICES.eventType == 'touchstart' || VARCO.p.DEVICES.eventType == 'touchend' || VARCO.p.DEVICES.eventType == 'touchmove' || VARCO.p.DEVICES.eventType == 'touchzoom') {
		type = 'touch';
	}

	if (type == "mouse") {

		let normaizedScreenVector = getScreenNormalizedMouse(camera, VARCO.p.DEVICES.mouse.locH, VARCO.p.DEVICES.mouse.locV, view);

		if (normaizedScreenVector !== undefined) {
			checkTouchMouseEvents(normaizedScreenVector, scene, camera, view);
		} else {

		}

	}


	if (type == "touch") {

		if (VARCO.p.DEVICES.touch.listLoc.length > 0) {

			for (let i = 0; i < VARCO.p.DEVICES.touch.listLoc.length; ++i) {

				let normaizedScreenVector = getScreenNormalizedMouse(camera, VARCO.p.DEVICES.touch.listLoc[i].locH, VARCO.p.DEVICES.touch.listLoc[i].locV, view);

				if (normaizedScreenVector !== undefined) {
					checkTouchMouseEvents(normaizedScreenVector, scene, camera, view);
				} else {


				}

			}

			if (VARCO.p.DEVICES.touch.listLoc.length > 1) {
				VARCO.p.DEVICES.touch.isMultyTouch = true;
			}

		} else {

			let normaizedScreenVector = getScreenNormalizedMouse(camera, VARCO.p.DEVICES.touch.locH, VARCO.p.DEVICES.touch.locV, view);

			if (normaizedScreenVector !== undefined) {
				checkTouchMouseEvents(normaizedScreenVector, scene, camera, view);
			} else {


			}

		}

	}


};



VARCO.f.updateAll = function (renderer, scene, camera, viewport) {

	const view = VARCO.f.adaptDivViewPort(viewport);

	if (VARCO.p.DEVICES.eventType !== null) {

		VARCO.f.updateEvent(scene, camera, view);

	}


	if (scene !== undefined) {

		scene.traverse(

			function updateAllNodeTraverse(node) {

				if (node.MM3D !== undefined) {

					// elements self behaviour script: 
					if (node.MM3D.hideWithCamera !== undefined) {

						if (camera.name == node.MM3D.hideWithCamera) {

							node.visible = false;

						} else {

							node.visible = true;

						}

					}


					if (node.MM3D.scriptList !== undefined) {

						VARCO.f.doScriptList(node.MM3D.scriptList);


						// remove only no loop scripts:

						let numScript = 0;

						let totScript = node.MM3D.scriptList.length - 1;

						do {

							const scriptProp = node.MM3D.scriptList[numScript];

							totScript = node.MM3D.scriptList.length;

							if (scriptProp !== undefined) {

								if (scriptProp.loop !== true) {

									node.MM3D.scriptList.splice(numScript, 1);

									numScript = 0;

									totScript = node.MM3D.scriptList.length;

								} else {

									numScript = numScript + 1;

								}
							} else {

								numScript = numScript + 1;

							}


						} while (numScript < totScript);

					}


					// particle system : 

					if (node.MM3D.particleSystem !== undefined) {

						VARCO.f.updateParticleSystem(node, node.MM3D.particleSystem);

					}


					// elements motion : 

					if (node.MM3D.playMotionList !== undefined) {

						for (var i = 0; i < node.MM3D.playMotionList.length; i++) {

							if (node.MM3D.motions !== undefined) {
								VARCO.f.updateMotion(node, node.MM3D.playMotionList[i], node.MM3D.motions[node.MM3D.playMotionList[i]]);
							}

						}

						if (node.MM3D.playMotionList.length == 0) {
							delete node.MM3D.playMotionList
						}

					}


					// elements threejs animation :
					if (node.MM3D.threeJsAnimation !== undefined) {

						const dt = VARCO.p.CLOCK.getDelta();

						node.MM3D.threeJsAnimation.mixer.update(dt);

					}


					// elements animation : 

					if (node.MM3D.animationsManager !== undefined) {

						if (node.MM3D.animationsManager.playAnimationList == undefined) {

							node.MM3D.animationsManager.playAnimationList = [];

						}

						if (node.MM3D.animationsManager.play) {

							VARCO.f.updateAnimationManager(node);

						}

					}


					// elements physic : 

					if (node.MM3D.RGDBODY !== undefined) {

						if (node.MM3D.RGDBODY.linkToRGDBodyPosition) {

							node.position.x = node.MM3D.RGDBODY.position.x;

							node.position.y = node.MM3D.RGDBODY.position.y;

							node.position.z = node.MM3D.RGDBODY.position.z;
						}

						if (node.MM3D.RGDBODY.linkToRGDBodyRotation) {

							node.quaternion.copy(node.MM3D.RGDBODY.quaternion);

						}


						// importante per simulazione senza "esplosioni fisica" :

						if (node.MM3D.RGDBODY.isMovablePhysic) {

							node.MM3D.RGDBODY.updateConvexPolyhedronRepresentation = true;

							node.MM3D.RGDBODY.updateMassProperties();

						}

					}


					// element OBB :

					if (node.MM3D.OBB) {

						node.updateMatrix();

						node.updateMatrixWorld();

						node.MM3D.OBB.object.copy(node.geometry.userData.obb);

						node.MM3D.OBB.object.applyMatrix4(node.matrixWorld);

					}

				}

				// physic update:

				if (node.PHYSIC !== undefined) {

					// node.PHYSIC.step( ( VARCO.p.CLOCK.getDelta() * 1.0 ) );

					if (VARCO.p.isVISIBLE) {

						const deltaTime = (VARCO.p.DELTAT) / 30;

						if (deltaTime > 0) {

							node.PHYSIC.step((1 / 60, deltaTime));

						}

						// VARCO.p.DELTA_STARTTIME = new Date().getTime();

					}

				}

			}

		);

	}

};


// p : {
// left: 0 
// right: 600
// top: 100
// bottom: 500
// }

VARCO.f.checkIsInViewPort = function (p) {

	if (VARCO.p.DEVICES.mouse.locH >= p.left && VARCO.p.DEVICES.mouse.locH <= p.right) {

		if (VARCO.p.DEVICES.mouse.locV >= p.top && VARCO.p.DEVICES.mouse.locV <= p.bottom) {

			return true;

		} else {

			return false;

		}

	} else {

		return false;

	}

};



VARCO.f.updateRefreshDevices = function () {

	// reset all:

	VARCO.p.DELTAT = (new Date().getTime() - VARCO.p.DELTA_STARTTIME) / 60;
	VARCO.p.DELTA_STARTTIME = new Date().getTime();


	if (VARCO.p.DEVICES.mouse !== null) {
		if (VARCO.p.DEVICES.mouse.clickDown == false) {
			VARCO.p.DEVICES.mouse.buttonNum = null;
			VARCO.p.DEVICES.mouse.clickDuration = 0;
		}
		VARCO.p.DEVICES.mouse.diffH = 0;
		VARCO.p.DEVICES.mouse.diffV = 0;
		VARCO.p.DEVICES.mouse.zoom = 0;
		VARCO.p.DEVICES.mouse.viewPortList = [];
	}

	if (VARCO.p.DEVICES.touch !== null) {
		if (VARCO.p.DEVICES.touch.clickDown == false) {
			VARCO.p.DEVICES.touch.buttonNum = null;
			VARCO.p.DEVICES.touch.clickDuration = 0;
		} else {

			if (VARCO.p.DEVICES.touch.listLoc.length < 2) {
				VARCO.p.DEVICES.touch.isMultyTouch = false;
			} else {
				VARCO.p.DEVICES.touch.isMultyTouch = true;
			}

		}
		VARCO.p.DEVICES.touch.diffH = 0;
		VARCO.p.DEVICES.touch.diffV = 0;
		VARCO.p.DEVICES.touch.zoom = 0;
	}



	if (VARCO.p.DEVICES.keyboard !== null) {
		// VARCO.p.DEVICES.keyboard.keyPressed = null;
		VARCO.p.DEVICES.keyboard.keyReleased = null;
		// VARCO.p.DEVICES.keyboard.keyList = [];
	}

	VARCO.p.DEVICES.eventType = null;

};



VARCO.f.render = function (layerList) {

	// mouse feedback //:
	if (VARCO.p.DEVICES.mouse !== null) {
		if (VARCO.p.DEVICES.mouse.mouseFeedback) {
			VARCO.p.DEVICES.mouse.mouseFeedback = false;
			document.body.style.cursor = 'default';
			VARCO.p.cursorOn = true;
		}
	}

	// GAMEPAD //:
	if (VARCO.p.DEVICES.gamepads) {
		if (VARCO.p.DEVICES.gamepads[0] !== undefined) {

			VARCO.p.DEVICES.gamepads[0] = navigator.getGamepads()[0];

			if (VARCO.p.DEVICES.gamepads[0].buttons[0].value > 0 || VARCO.p.DEVICES.gamepads[0].buttons[0].pressed) {
				console.log('0')
			} else if (VARCO.p.DEVICES.gamepads[0].buttons[1].value > 0 || VARCO.p.DEVICES.gamepads[0].buttons[1].pressed) {
				console.log('1')
			} else if (VARCO.p.DEVICES.gamepads[0].buttons[2].value > 0 || VARCO.p.DEVICES.gamepads[0].buttons[2].pressed) {
				console.log('2')
			} else if (VARCO.p.DEVICES.gamepads[0].buttons[3].value > 0 || VARCO.p.DEVICES.gamepads[0].buttons[3].pressed) {
				console.log('3')
			}

		}
	}


	function renderLayer(layerProp) {

		let viewPort = VARCO.f.adaptDivViewPort(layerProp[3]);

		VARCO.f.updateAll(layerProp[0], layerProp[1], layerProp[2], viewPort);

		layerProp[0].setViewport(viewPort.left, viewPort.bottom, viewPort.width, viewPort.height);
		layerProp[0].setScissor(viewPort.left, viewPort.bottom, viewPort.width, viewPort.height);
		layerProp[0].setScissorTest(true);

		layerProp[0].render(layerProp[1], layerProp[2]);
		layerProp[0].clearDepth()



	}

	layerList.forEach(renderLayer); // inizia ciclio di rendering

	VARCO.f.updateRefreshDevices();

};



VARCO.f.playSound = function (name) {

	let playPromise = VARCO.p.SOUNDS[name].play();

	if (playPromise !== undefined) {
		playPromise.then(_ => {

			VARCO.p.SOUNDS[name].play();
			VARCO.p.SOUNDS[name].isPlaying = true;

		})
			.catch(error => {
				// Auto-play was prevented
				// Show paused UI.

				//console.log( "audio playPromise problem " + name );

			});
	}

};


VARCO.f.pauseSound = function (name) {

	VARCO.p.SOUNDS[name].pause();
	VARCO.p.SOUNDS[name].isPlaying = false;
	VARCO.p.SOUNDS[name].pause();

}


VARCO.f.stopSound = function (name) {

	//console.log( name );

	VARCO.p.SOUNDS[name].pause();
	VARCO.p.SOUNDS[name].isPlaying = false;
	VARCO.p.SOUNDS[name].currentTime = 0;
	VARCO.p.SOUNDS[name].pause();

}


VARCO.f.stopAllSounds = function () {

	var propList = Object.keys(VARCO.p.SOUNDS);

	//console.log( propList );

	for (var num = 0, len = propList.length; num < len; num++) {
		if (VARCO.p.SOUNDS[propList[num]] !== undefined) {
			VARCO.f.stopSound(propList[num]);
		}
	}

};


VARCO.f.deleteSound = function (name) {

	if (VARCO.p.SOUNDS[name] !== undefined) {
		VARCO.f.stopSound(SCENE, name);
		VARCO.p.SOUNDS[name].src = '';
		delete VARCO.p.SOUNDS[name];
	}

};

// /////////////////////////////////////


VARCO.f.copyText = function (commonDir, name) {

	// const text = commonDir + "index_preview_loda.html?ID=" + name;

	const text = commonDir + name;

	let input = document.createElement('textarea');
	input.innerHTML = text;
	document.body.appendChild(input);
	// input.select();

	if (VARCO.p.IOSDEVICE == true) {
		input.setSelectionRange(0, input.value.length);
	} else {
		input.select();
	}

	let result = document.execCommand('copy');
	document.body.removeChild(input);
	return result;

};



VARCO.f.sendMail = function (commonDir, name, sub, emailAddress) {

	let emailTo = "";

	if (emailAddress !== undefined) {
		emailTo = emailAddress;
	}

	const emailCC = "";
	const emailSub = sub;// "Hivearium - Hivemind Metaverse";

	// const text = commonDir + "index_preview_loda.html?ID=" + name

	const text = commonDir + name

	let url = "mailto:" + emailTo + '?cc=' + emailCC + '&subject=' + emailSub + '&body=' + text

	window.open(url);

};



VARCO.f.sendWhatsApp = function (commonDir, name) {

	//const text = commonDir + "index_preview_loda.html?ID=" + name

	const text = commonDir + name

	var url = new URL("https://api.whatsapp.com/send/?text=" + text)

	// let url = 

	window.open(url);

};



VARCO.f.sendTwitterApp = function (commonDir, name) {

	//const text = commonDir + "index_preview_loda.html?ID=" + name

	const text = commonDir + name

	let url = "https://twitter.com/intent/tweet?url=" + text

	window.open(url);

};



VARCO.f.doVibration = function (vibList) {

	if ('vibrate' in navigator) {
		navigator.vibrate(vibList);
	} else {
		alert("no vibration")
	}

};



// //////////// /////////// ///////////////
// ////////////  UTILITIES  ///////////////
// //////////// /////////// ///////////////

VARCO.f.openFullscreen = function () {

	let elem = document.body;

	// ## The below if statement seems to work better ## if ((document.fullScreenElement && document.fullScreenElement !== null) || (document.msfullscreenElement && document.msfullscreenElement !== null) || (!document.mozFullScreen && !document.webkitIsFullScreen)) {
	if ((document.fullScreenElement !== undefined && document.fullScreenElement === null) || (document.msFullscreenElement !== undefined && document.msFullscreenElement === null) || (document.mozFullScreen !== undefined && !document.mozFullScreen) || (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen)) {

		if (elem.requestFullScreen) {
			elem.requestFullScreen();

		} else if (elem.mozRequestFullScreen) {
			elem.mozRequestFullScreen();

		} else if (elem.webkitRequestFullScreen) {
			elem.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);

		} else if (elem.msRequestFullscreen) {
			elem.msRequestFullscreen();

		}

	} else {

		if (document.cancelFullScreen) {
			document.cancelFullScreen();

		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();

		} else if (document.webkitCancelFullScreen) {
			document.webkitCancelFullScreen();

		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();

		}

	}

};


/* Close fullscreen */
VARCO.f.closeFullscreen = function () {

	if (document.exitFullscreen) {
		document.exitFullscreen();

	} else if (document.mozCancelFullScreen) { /* Firefox */
		document.mozCancelFullScreen();

	} else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
		document.webkitExitFullscreen();

	} else if (document.msExitFullscreen) { /* IE/Edge */
		document.msExitFullscreen();

	}

};

export { VARCO };
