/* eslint-disable no-unused-vars */
/* eslint-disable no-loss-of-precision */
// MAP MODULE

import * as THREE from 'three';
import { VARCO } from "../VARCO/helpers/VARCO.js";
const MAPSingleton = (function () {
	let instance;
	function createInstance() {
		return createMAP();
	}
	return {
		getInstance: function () {
			if (!instance) instance = createInstance();
			return instance;
		},
	};
})();


const createMAP = () => {
	let MAP = {

		p: {
			actualCoords: { lng: 8.9511, lat: 46.0037, alt: 0.0 },
			actualMapAltitude: 1000.0,
			position: { x: 0.0, y: 3450.0, z: 0.0 },
			type: 'map'

		},

		f: {}

	};


	// ----------------------------------------------------------- //

	MAP.f.clickOnMap = function (p) {

		console.log("clickOnMap");

	};


	MAP.f.from3dTo2d = function (x, y, z, camera, width, height) {

		let p = new THREE.Vector3(x, y, z);
		let vector = p.project(camera);

		vector.x = (vector.x + 1) / 2 * width;
		vector.y = -(vector.y - 1) / 2 * height;

		return vector;

	};


	MAP.f.mapFrom3Dto2D = function (OBJ, camera, width, height) {

		let vetWorldPos = new THREE.Vector3();
		OBJ.getWorldPosition(vetWorldPos);

		let vetPos = MAP.f.from3dTo2d(
			vetWorldPos.x,
			vetWorldPos.y,
			vetWorldPos.z,
			camera,
			width,
			height
		);

		vetPos.x = vetPos.x - (width * 0.5);
		vetPos.y = (height * 0.5) - vetPos.y;

		return vetPos;
	};


	MAP.f.getMapUnit = function (width, earthCirc, value) {

		let unitValue = width / earthCirc;

		return unitValue

	};


	MAP.f.getMapUVPosition = function (width, height, UV) { // ??? // da controllare

		let mapPosX = UV.x * width;
		let mapPosY = UV.y * height;

		return { "x": mapPosX, "y": mapPosY };

	};


	MAP.f.getMapPosition = function (width, height, lng, lat, alt) {

		let posXY = VARCO.f.WGS84_lonLatToPixels(lng, lat, width, height);
		let mapPosX = posXY[0] - (width * 0.5);
		let mapPosZ = (posXY[1] - (height * 0.5)) * -1

		return { "x": mapPosX, "y": alt, "z": mapPosZ };

	};


	MAP.f.getMapCoords = function (width, height, vetPos, alt) {

		let lnglat = VARCO.f.WGS84_pixelsToLonLat(vetPos.x, vetPos.z, width, height);

		return { "lng": lnglat[0], "lat": lnglat[1], "alt": alt };

	};


	MAP.f.setMapCoords = function (lng, lat, alt, enabledZoomChanges) {

		if (enabledZoomChanges !== undefined) {

			MAP.p.enabledZoomChanges = enabledZoomChanges;

		}

		let posXZ = MAP.f.getMapPosition(MAP.p.width, MAP.p.height, lng, lat, alt);

		MAP.p.OBJ.OBJECTS.cameraMapAxis.position.x = posXZ.x;

		MAP.p.OBJ.OBJECTS.cameraMapAxis.position.y = alt;

		MAP.p.OBJ.OBJECTS.cameraMapAxis.position.z = posXZ.z;

	};





	MAP.f.getMapEphemeridis = function (lng, lat, inputDate) {

		const d = new Date();

		let year;
		let month;
		let day;
		let hour;
		let minute;
		let seconds;
		let rot;
		let orbitRot;

		let altitudeOffset = 0;
		let azimuthOffset = 0;

		if (inputDate !== undefined) {
			year = inputDate.year;
			month = inputDate.month;
			day = inputDate.day;
			hour = inputDate.hour;
			minute = inputDate.minute;
		} else {
			year = d.getFullYear();
			month = d.getMonth();
			day = d.getDate();
			hour = d.getHours();
			minute = d.getMinutes();
			seconds = d.getSeconds();
		}


		let actualDate = { year: year, month: month, day: day, hours: (hour - 1), minutes: minute, seconds: seconds };

		$const.tlong = lng; // 9.682499019503672; // longitude
		$const.glat = lat; // 45.85401843809073; // latitude

		$processor.init();

		// sun, mercury, venus, moon, mars, jupiter, saturn, uranus, neptune, pluto, chiron, sirius
		let sunInfo = $moshier.body.sun;
		let moonInfo = $moshier.body.moon;
		let marsInfo = $moshier.body.mars;
		let mercuryInfo = $moshier.body.mercury;
		let jupiterInfo = $moshier.body.jupiter;
		let saturnInfo = $moshier.body.saturn;
		let neptuneInfo = $moshier.body.neptune;
		let uranusInfo = $moshier.body.uranus;

		$processor.calc(actualDate, sunInfo);
		$processor.calc(actualDate, moonInfo);
		$processor.calc(actualDate, marsInfo);
		$processor.calc(actualDate, mercuryInfo);
		$processor.calc(actualDate, jupiterInfo);
		$processor.calc(actualDate, saturnInfo);
		$processor.calc(actualDate, neptuneInfo);
		$processor.calc(actualDate, uranusInfo);

		sunInfo.angles = { x: sunInfo.position.altaz.topocentric.alt + altitudeOffset, y: (-sunInfo.position.altaz.topocentric.azimuth + azimuthOffset) };
		moonInfo.angles = { x: moonInfo.position.altaz.topocentric.alt + altitudeOffset, y: (-moonInfo.position.altaz.topocentric.azimuth + azimuthOffset) };
		marsInfo.angles = { x: marsInfo.position.altaz.topocentric.alt + altitudeOffset, y: (-marsInfo.position.altaz.topocentric.azimuth + azimuthOffset) };
		mercuryInfo.angles = { x: mercuryInfo.position.altaz.topocentric.alt + altitudeOffset, y: mercuryInfo.position.altaz.topocentric.azimuth + azimuthOffset };
		jupiterInfo.angles = { x: jupiterInfo.position.altaz.topocentric.alt + altitudeOffset, y: jupiterInfo.position.altaz.topocentric.azimuth + azimuthOffset };
		saturnInfo.angles = { x: saturnInfo.position.altaz.topocentric.alt + altitudeOffset, y: saturnInfo.position.altaz.topocentric.azimuth + azimuthOffset };
		neptuneInfo.angles = { x: neptuneInfo.position.altaz.topocentric.alt + altitudeOffset, y: neptuneInfo.position.altaz.topocentric.azimuth + azimuthOffset };
		uranusInfo.angles = { x: uranusInfo.position.altaz.topocentric.alt + altitudeOffset, y: uranusInfo.position.altaz.topocentric.azimuth + azimuthOffset };

		return { sun: sunInfo, moon: moonInfo, mars: marsInfo, mercury: mercuryInfo, jupiter: jupiterInfo, saturn: saturnInfo, uranus: uranusInfo };

	};

	// ----------------------------------------------------------- //








	MAP.f.cleanMap = function () {

		let deleteTilesList = [];
		let sectorName;

		for (let k = 0; k < MAP.p.OBJ.OBJECTS.tilesList.children.length; k++) {
			let flagExist = false;
			for (let i = 0; i < MAP.p.actualMapTiles.length; i++) {
				let sectorName = "set_" + MAP.p.zoomMap + "_" + MAP.p.actualMapTiles[i][0] + "_" + MAP.p.actualMapTiles[i][1]
				if (MAP.p.OBJ.OBJECTS.tilesList.children[k].name == sectorName) {
					flagExist = true;
					break;
				}
			}
			if (flagExist == false) {
				deleteTilesList.push(MAP.p.OBJ.OBJECTS.tilesList.children[k])
			}
		}

		for (let i = 0; i < deleteTilesList.length; i++) {

			// VARCO.f.removeElement( deleteTilesList[ i ] );

			VARCO.f.deleteElement(deleteTilesList[i].parent, deleteTilesList[i]);

		}

	};



	MAP.f.updateMap = function () {

		console.log("updateMap");

		const createTileMap = function (sectorName, urlTile, startX, startY, sizeX, sizeY, numMaxTiles) {

			VARCO.f.addComplex(

				MAP.p.OBJ.OBJECTS.tilesList,

				{
					"name": sectorName,
					"parameters": {
						"textureList": [
							{
								"name": "actualSector_txt",
								"url": urlTile
							}
						],
						"materialList": [
							{
								"name": "actualSector_mat",
								"type": "MeshBasicMaterial",
								"parameters": {
									"transparent": true,
									"opacity": 0.0,
									"textures": { "map": "actualSector_txt" },
									"depthTest": false,
									"depthWrite": false
								}
							}
						],
						"elementList": [
							{
								"type": "addMesh",
								"prop": {
									"type": "PlaneGeometry",
									"name": "sectorMesh",
									"materialList": ["actualSector_mat"],
									"userData": {
										"rifName": sectorName
									},
									"parameters": {
										"width": sizeX,
										"height": sizeY,

									},

									"renderOrder": 20,

									"MM3D": {

										"states": {
											"start": [
												{ "type": "material", "parameter": "opacity", "value": 0.0 }
											],
											"end": [
												{ "type": "material", "parameter": "opacity", "value": MAP.p.opacity }
											]
										},

										"motions": {
											"tilefadeIn": {
												"speed": 1, 		// opzionale
												"loop": false, 		// opzionale
												"toAllChildren": false, // opzionale
												"stateList": [
													{
														"name": "start",
														"duration": 1
													},
													{
														"name": "end",
														"duration": 500,
														"scriptList": [
															{
																"name": "resertTransparentTile",
																"function": function resetTransparentTile(q) {
																	q.obj.material.transparent = false;
																}
															}
														]
													},
													{
														"name": "end",
														"duration": 200
													}
												]
											}
										},

										"playMotionList": ["tilefadeIn"]

									}
								}
							}
						]
					},

					"position": {
						"x": startX - (MAP.p.width * 0.5) + (sizeX * 0.5),
						"y": (startY - (MAP.p.height * 0.5) + (sizeY * 0.5)) * -1,
						"z": 0.0
					}

				},
				function initTile(p) {
					p.obj.visible = true;
				}

			)

		};


		// loop check

		if (MAP.p.intersects !== undefined) {

			if (MAP.p.intersects.length > 0) {

				const numH = MAP.p.mapNumH;
				const numV = MAP.p.mapNumV;

				let sectorName;
				let newTilesList = [];
				let createTilesList = [];
				let deleteTilesList = [];

				for (let i = -numH; i < numH + 1; i++) {
					for (let k = -numV; k < numV + 1; k++) {
						newTilesList.push([MAP.p.newMapSector[0] + i, MAP.p.newMapSector[1] + k]);
					}
				}

				for (let i = 0; i < MAP.p.actualMapTiles.length; i++) {
					let flagExist = false;
					for (let k = 0; k < newTilesList.length; k++) {
						if (MAP.p.actualMapTiles[i][0] == newTilesList[k][0]) {
							if (MAP.p.actualMapTiles[i][1] == newTilesList[k][1]) {
								flagExist = true;
								break;
							}
						}
					}
					if (flagExist == false) {
						deleteTilesList.push(MAP.p.actualMapTiles[i])
					}
				}

				for (let i = 0; i < newTilesList.length; i++) {
					let flagExist = false;
					for (let k = 0; k < MAP.p.actualMapTiles.length; k++) {
						if (newTilesList[i][0] == MAP.p.actualMapTiles[k][0]) {
							if (newTilesList[i][1] == MAP.p.actualMapTiles[k][1]) {
								flagExist = true;
								break;
							}
						}
					}
					if (flagExist == false) {
						createTilesList.push(newTilesList[i])
					}
				}


				MAP.p.counter = 0;

				let urlTile;

				for (let i = 0; i < createTilesList.length; i++) {

					if (createTilesList[i][0] > -1 && createTilesList[i][1] > -1) {
						if (createTilesList[i][0] < MAP.p.zoomList[MAP.p.zoomMap].H && createTilesList[i][1] < MAP.p.zoomList[MAP.p.zoomMap].V) {

							switch (MAP.p.mapType) {
								case 'OSM':
									urlTile = "https://a.tile.openstreetmap.org/" + MAP.p.zoomMap + "/" + createTilesList[i][0] + "/" + createTilesList[i][1] + ".png"

									break;

								case 'GM':
									urlTile = "https://mt1.google.com/vt/lyrs=y&x=" + createTilesList[i][0] + "&y=" + createTilesList[i][1] + "&z=" + MAP.p.zoomMap;

									break;

								case 'BM':

									break;

								case 'GIS':

									urlTile = "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/" + 3857 + "/" + MAP.p.zoomMap + "/" + createTilesList[i][0] + "/" + createTilesList[i][1] + ".jpeg"

									break;

							}

							let startY = (MAP.p.height / MAP.p.zoomList[MAP.p.zoomMap].V) * createTilesList[i][1];
							let sizeY = (MAP.p.height / MAP.p.zoomList[MAP.p.zoomMap].V);
							let startX = (MAP.p.width / MAP.p.zoomList[MAP.p.zoomMap].H) * createTilesList[i][0];
							let sizeX = (MAP.p.width / MAP.p.zoomList[MAP.p.zoomMap].H);

							sectorName = "set_" + MAP.p.zoomMap + "_" + createTilesList[i][0] + "_" + createTilesList[i][1];

							createTileMap(sectorName, urlTile, startX, startY, sizeX, sizeY, createTilesList.length);

						}
					}

				}


				if (MAP.p.actualZoomMap == MAP.p.zoomMap) {
					// console.log( "DELETE SAME ZOOMLEVEL"  );
					for (let i = 0; i < deleteTilesList.length; i++) {
						sectorName = "set_" + MAP.p.zoomMap + "_" + deleteTilesList[i][0] + "_" + deleteTilesList[i][1]

						if (MAP.p.OBJ.OBJECTS.tilesList.OBJECTS[sectorName] !== undefined) {
							VARCO.f.deleteElement(MAP.p.OBJ.OBJECTS.tilesList.OBJECTS[sectorName].parent, MAP.p.OBJ.OBJECTS.tilesList.OBJECTS[sectorName]);
						}

					}
				}

				MAP.p.actualMapTiles = newTilesList;

			}

		}

	};



	MAP.f.loopMap = function (lng, lat) {

		// init main variables
		// let DATA = MAP.p.OBJ.userData.map;
		let U;
		let V;

		let pos = MAP.f.getMapPosition(MAP.p.width, MAP.p.height, MAP.p.actualCoords.lng, MAP.p.actualCoords.lat, MAP.p.actualMapAltitude);

		// update the time every frames
		MAP.p.timer = new Date().getTime();

		// reset timer to slowdown the cleanMap and wait the user find the right zoom level 
		if (VARCO.p.DEVICES.mouse.zoom !== 0 || VARCO.p.DEVICES.touch.zoom !== 0) {
			MAP.p.startTimer = MAP.p.timer;
		}

		// check camera3d view //
		let valueZ;
		let worldVetPos = new THREE.Vector3(pos.x, pos.y, pos.z);
		let worldVetDir = new THREE.Vector3();

		// DATA.rayCaster.set( worldVetPos, worldVetDir );	
		MAP.p.rayCaster.set(worldVetPos, new THREE.Vector3(0, -1, 0));
		MAP.p.intersects = MAP.p.rayCaster.intersectObjects([MAP.p.OBJ.OBJECTS.MapRif_mesh], false);
		MAP.p.newMapSector = [0, 0];

		if (MAP.p.intersects.length > 0) {

			MAP.p.cameraDistance = MAP.p.intersects[0].distance;

			// find the zoomLevel on the map
			for (let i = 0; i < MAP.p.zoomList.length - 1; i++) {
				if (MAP.p.cameraDistance < MAP.p.zoomList[i].alt && MAP.p.cameraDistance > MAP.p.zoomList[i + 1].alt) {
					MAP.p.zoomMap = MAP.p.zoomList[i].zoomNum + 1;
					if (MAP.p.zoomMap > 19) {
						MAP.p.zoomMap = 19;
					}
					if (MAP.p.zoomMap < 0) {
						MAP.p.zoomMap = 0;
					}
					break;
				} else {
					MAP.p.zoomMap = 0;
				}
			}


			// find the sector of the actual zoomLevel
			U = MAP.p.intersects[0].uv.x;
			V = (1.0 - MAP.p.intersects[0].uv.y);

			MAP.p.newMapSector[0] = Math.floor(MAP.p.zoomList[MAP.p.zoomMap].H * U);
			MAP.p.newMapSector[1] = Math.floor(MAP.p.zoomList[MAP.p.zoomMap].V * V);
			MAP.p.newMapSectorName = "sect_" + MAP.p.zoomMap + "_" + MAP.p.newMapSector[0] + "_" + MAP.p.newMapSector[1];

			if (MAP.p.enabledZoomChanges) {

				if (VARCO.p.DEVICES.mouse.clickDown == false && VARCO.p.DEVICES.touch.clickDown == false) {

					if (MAP.p.actualMapSectorName !== MAP.p.newMapSectorName) {
						// delay before to change tiles ( to reduce tiles map downloads )
						if ((MAP.p.timer - MAP.p.startTimer) > (MAP.p.timerStep * 0.2)) {
							MAP.p.actualMapSectorName = MAP.p.newMapSectorName;
							MAP.p.startTimer = MAP.p.timer;
							MAP.f.updateMap();
						}
					} else {

						// clean the map when user stop to move to refresh the memory
						if ((MAP.p.timer - MAP.p.startTimer) > MAP.p.timerStep) {
							if (MAP.p.actualZoomMap !== MAP.p.zoomMap) {

								// console.log( "DELETE DIFFERENT ZOOMLEVEL"  );

								MAP.p.actualZoomMap = MAP.p.zoomMap;
								MAP.f.cleanMap();
							}
						}

					}

					if (MAP.p.actualMapType !== MAP.p.mapType) {

						console.log('change map')

						MAP.p.actualMapType = MAP.p.mapType;
						MAP.p.startTimer = MAP.p.timer;
						MAP.f.updateMap();

					}
				}

			}
		}
	};



	MAP.f.addMap = function (SCENE, mapProp, callBack, callBackProp) {

		if (mapProp == undefined) {
			mapProp = {}
		}

		if (mapProp.MM3D == undefined) {
			mapProp.MM3D = {};
		}


		let parameters = {
			actualCoords: { lng: MAP.p.actualCoords.lng, lat: MAP.p.actualCoords.lat, alt: 750 },
			earthCirc: 40075016.686, // in mt
			unit: 1,
			timer: new Date().getTime(),
			startTimer: new Date().getTime(),
			timerStep: 1000,
			width: 40075016.686,
			height: 40075016.686,
			fov: 60.0,
			mapType: "GIS", // "GM", // "OSM"
			opacity: 1,
			zoomMap: 1,
			mapNumH: 20,
			mapNumV: 20,
			actualMapTiles: [],
			actualMapSectorName: "",
			enabledZoomChanges: true,
			eventList: [],
			angX: 90.0,
			rayCaster: new THREE.Raycaster(),
			events: {}
		};

		let cameraPosition = { x: 0.0, y: 0.0, z: 0.0 };

		if (mapProp.parameters !== undefined) {
			let parameterList = Object.keys(parameters);

			for (let i = 0; i < parameterList.length; i++) {
				if (mapProp.parameters[parameterList[i]] !== undefined) {
					parameters[parameterList[i]] = mapProp.parameters[parameterList[i]];
				}
			}
		}


		// 

		MAP.p = parameters;

		//


		parameters.zoomList = [
			{ H: 1, V: 1, zoom: 0.0, alt: (parameters.width / (parameters.fov * 0.01)), zoomNum: 0 },
			{ H: 2, V: 2, zoom: 0.25, alt: ((parameters.width / 2) / (parameters.fov * 0.01)), zoomNum: 1 },
			{ H: 4, V: 4, zoom: 0.5, alt: ((parameters.width / 4) / (parameters.fov * 0.01)), zoomNum: 2 },
			{ H: 8, V: 8, zoom: 1.0, alt: ((parameters.width / 8) / (parameters.fov * 0.01)), zoomNum: 3 },
			{ H: 16, V: 16, zoom: 2.0, alt: ((parameters.width / 16) / (parameters.fov * 0.01)), zoomNum: 4 },
			{ H: 32, V: 32, zoom: 4.0, alt: ((parameters.width / 32) / (parameters.fov * 0.01)), zoomNum: 5 },
			{ H: 64, V: 64, zoom: 8.00, alt: ((parameters.width / 64) / (parameters.fov * 0.01)), zoomNum: 6 },
			{ H: 128, V: 128, zoom: 16.00, alt: ((parameters.width / 128) / (parameters.fov * 0.01)), zoomNum: 7 },
			{ H: 256, V: 256, zoom: 32.00, alt: ((parameters.width / 256) / (parameters.fov * 0.01)), zoomNum: 8 },
			{ H: 512, V: 512, zoom: 70.00, alt: ((parameters.width / 512) / (parameters.fov * 0.01)), zoomNum: 9 },
			{ H: 1024, V: 1024, zoom: 140.00, alt: ((parameters.width / 1024) / (parameters.fov * 0.01)), zoomNum: 10 },
			{ H: 2048, V: 2048, zoom: 300.00, alt: ((parameters.width / 2048) / (parameters.fov * 0.01)), zoomNum: 11 },
			{ H: 4096, V: 4096, zoom: 700.00, alt: ((parameters.width / 4096) / (parameters.fov * 0.01)), zoomNum: 12 },
			{ H: 8192, V: 8192, zoom: 1500.00, alt: ((parameters.width / 8192) / (parameters.fov * 0.01)), zoomNum: 13 },
			{ H: 16384, V: 16384, zoom: 2500.00, alt: ((parameters.width / 16384) / (parameters.fov * 0.01)), zoomNum: 14 },
			{ H: 32768, V: 32768, zoom: 5000.00, alt: ((parameters.width / 32768) / (parameters.fov * 0.01)), zoomNum: 15 },
			{ H: 65536, V: 65536, zoom: 9000.00, alt: ((parameters.width / 65536) / (parameters.fov * 0.01)), zoomNum: 16 },
			{ H: 131072, V: 131072, zoom: 18000.00, alt: ((parameters.width / 131072) / (parameters.fov * 0.01)), zoomNum: 17 },
			{ H: 262144, V: 262144, zoom: 36000.00, alt: ((parameters.width / 262144) / (parameters.fov * 0.01)), zoomNum: 18 },
			{ H: 524288, V: 524288, zoom: 72000.00, alt: ((parameters.width / 524288) / (parameters.fov * 0.01)), zoomNum: 19 },
			{ H: 262144, V: 262144, zoom: 36000.00, alt: 0.0, zoomNum: 20 }
		];



		cameraPosition = MAP.f.getMapPosition(
			MAP.p.width,
			MAP.p.height,
			MAP.p.actualCoords.lng,
			MAP.p.actualCoords.lat,
			MAP.p.actualMapAltitude
		);



		// let userData = {
		// "map" : parameters
		// };

		// if (mapProp.userData !== undefined) {
		// 	let userDataList = Object.keys(userData);
		// 	for (let i = 0; i < userDataList.length; i++) {
		// 		userData[userDataList[i]] = mapProp.userData[userDataList[i]];
		// 	}
		// }

		let textureList = [
			{
				"name": "MapRif_txt",
				"url": 'images/grey.png'
			}
		];

		let materialList = [
			{
				"name": "MapRif_mat",
				"type": "MeshBasicMaterial",
				"parameters": {
					"color": { "r": 1.0, "g": 1.0, "b": 1.0 },
					"textures": { "map": "MapRif_txt" },
					"transparent": false,
					"visible": false
				}
			}
		];

		let eventList = {


		};

		if (mapProp.MM3D.events !== undefined) {
			eventList = eventList.concat(mapProp.MM3D.events);
		}

		let elementList = [

			{
				"type": "addMesh",
				"prop": {
					"name": "MapRif_mesh",
					"type": "PlaneGeometry",
					"materialList": ["MapRif_mat"],
					"parameters": {
						"width": MAP.p.width,
						"height": MAP.p.height
					},
					"rotation": {
						"x": -90,
						"y": 0.0,
						"z": 0.0
					},
					"MM3D": {
						"events": parameters.events
					}

				}
			},

			{
				"type": "addComplex",
				"prop": {
					"name": "tilesList",
					"rotation": {
						"x": -90,
						"y": 0.0,
						"z": 0.0
					}
				}
			},

			{
				"type": "addComplex",
				"prop": {
					"name": "geoNftList",
					"rotation": {
						"x": 0.0,
						"y": 0.0,
						"z": 0.0
					}
				}
			},

			{
				"type": "addComplex",
				"prop": {
					"name": "elementList",
					"rotation": {
						"x": 0.0,
						"y": 0.0,
						"z": 0.0
					}
				}
			},

			{
				"type": "addComplex",
				"prop": {
					"name": "cameraMapAxis",
					"rotation": { "x": 0.0, "y": 0.0, "z": 0.0 },
					"position": cameraPosition
				}
			}
		];

		let scriptList = [
			{
				"name": "updateLoop",
				"loop": true,
				"function": function (p) {
					MAP.f.loopMap(MAP.p.actualCoords.lng, MAP.p.actualCoords.lat, MAP.p.enabledZoomChanges);
				},
				"functionProp": {}
			}
		];

		if (mapProp.MM3D.scriptList !== undefined) {
			scriptList = scriptList.concat(mapProp.MM3D.scriptList);
		}

		mapProp.parameters = {};

		mapProp.parameters.textureList = textureList;
		mapProp.parameters.materialList = materialList;
		mapProp.parameters.elementList = elementList;
		mapProp.MM3D.scriptList = scriptList;

		VARCO.f.addComplex(
			SCENE,
			mapProp,
			function initMap(p) {

				MAP.p.OBJ = p.obj;

				let duration = 10 // milliseconds

				MAP.f.setMapCoords(MAP.p.actualCoords.lng, MAP.p.actualCoords.lat, MAP.p.actualMapAltitude);

				if (callBack !== undefined) {
					if (callBackProp == undefined) {
						callBackProp = {};
					}
					callBackProp.p = p.obj;
					callBack(callBackProp);
				}

			},
			{}
		);

	};
	return MAP;
};



export default MAPSingleton;