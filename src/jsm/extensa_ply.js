// @ts-nocheck
/* eslint-disable no-dupe-keys */
/* eslint-disable no-case-declarations */
/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */
// UI MODULE
import { get } from 'svelte/store';
import * as THREE from 'three';
import { VARCO } from "../VARCO/helpers/VARCO.js";
import RENDERERSingleton from '../functions/renderer.js';
import { projectStore } from '../store/ProjectStore';
import getDOMHeight from '../utils/dom/getDOMHeight.js';
import { EDITOR, MAP, UI } from "./index.js";


const renderer = RENDERERSingleton.getInstance();

const PLYSingleton = (function () {
	let instance;
	function createInstance() {
		return createPLY();
	}
	return {
		getInstance: function () {
			if (!instance) instance = createInstance();
			return instance;
		},
	};
})();



const createPLY = () => {
	const PLY = {

		p: {

			userName: 'admin',
			password: 'admin',

			flagPlayerOn: true,
			flagAutoSelectGeoArea: true,

			flagSTVOn: false,
			flagDesktop: true,
			flagGPS: false,
			flag3D: false,
			flagCOMPASS: false,
			flagDoubleTouch: false,

			action: 'drag',

			flagGPS_pointsCloud: false,
			calibrationGPS_list: [],
			calibrationGPS_maxNumber: 5,
			qualityGPS: -1,

			flagGPS_altitude: false,
			tripodHeight: 1.75,
			geoAreaSize: 50.0,

			SECTORDB: {},

			geoMapSectors: {
				maxNumSectH: 20000,
				maxNumSectV: 10000,
				actualSectHV: [0, 0],
				oldSectHV: [0, 0],
				sectNumH: 1, // 1 + 1 + 1
				sectNumV: 1, // 1 + 1 + 1
				lonLatA: { lng: -180.0, lat: 90.0 },
				lonLatB: { lng: 180.0, lat: -90.0 }
			},

			splitScreenValue: 0.4,

			ui: {
				size: {
					name: 'UI',
					position: 'absolute',
					left: 0,
					right: window.innerWidth,
					top: 0,
					bottom: window.innerHeight,
					zIndex: 5
				}
			},

			map: {
				canvas: document.getElementById("map"),
				size: {
					name: 'MAP',
					position: 'absolute',
					left: 0,
					right: window.innerWidth,
					top: 0,
					bottom: window.innerHeight,
					zIndex: 5
				}
			},

			pano: {
				canvas: document.getElementById("pano"),
				coords: { "lat": 46.0053515, "lng": 8.9554946 },
				lonLatA: { lng: 0.0, lat: 0.0 },
				lonLatB: { lng: 0.0, lat: 0.0 },
				dimensionOffset: { x: 0.01, z: 0.01 },
				tripodHeight: 2.4,
				angX: 0.0,
				angY: 0.0,
				maxAngX: 80,
				minAngX: -80,
				zoom: 1.5,
				minZoom: 1.5,
				maxZoom: 3.5,
				info: {},

				size: {
					name: 'PANO',
					position: 'absolute',
					left: 0,
					right: 1,
					top: 0,
					bottom: 1,
					zIndex: 5
				}
			}

		},
		f: {}

	};

	// //////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////



	// //////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////

	// RENDERER - RESIZE AND ADAPTING:

	PLY.f.resizeScreen = function () {

		let splistScreenDimension = window.innerHeight * PLY.p.splitScreenValue;

		console.log(splistScreenDimension)

		if (PLY.p.flagSTVOn) {

			if (PLY.p.flagDesktop) {

				PLY.p.pano.size = {
					name: 'PANO',
					position: 'absolute',
					left: (window.innerWidth - 800),
					right: window.innerWidth,
					top: 0,
					bottom: 800,
					zIndex: 5
				};

				PLY.p.map.size = {
					name: 'MAP',
					position: 'absolute',
					left: 0,
					right: (window.innerWidth - 800),
					top: 0,
					bottom: window.innerHeight,
					zIndex: 5
				};

				PLY.p.ui.size = {
					name: 'UI',
					position: 'absolute',
					left: 0,
					right: (window.innerWidth - 800),
					top: 0,
					bottom: window.innerHeight,
					zIndex: 5
				};

			} else {

				PLY.p.pano.size = {
					name: 'PANO',
					position: 'absolute',
					left: 0,
					right: window.innerWidth,
					top: 0.0,
					bottom: window.innerWidth,
					zIndex: 5
				};

				PLY.p.map.size = {
					name: 'MAP',
					position: 'absolute',
					left: 0,
					right: window.innerWidth,
					top: window.innerWidth,
					bottom: window.innerHeight,
					zIndex: 5
				};

				PLY.p.ui.size = {
					name: 'UI',
					position: 'absolute',
					left: 0,
					right: window.innerWidth,
					top: window.innerWidth,
					bottom: window.innerHeight,
					zIndex: 5
				};

			}

		} else {

			if (PLY.p.flagDesktop) {

				PLY.p.pano.size = {
					name: 'PANO',
					position: 'absolute',
					left: window.innerWidth - 1,
					right: window.innerWidth,
					top: 0,
					bottom: 1,
					zIndex: 5
				};

				PLY.p.map.size = {
					name: 'MAP',
					position: 'absolute',
					left: 0,
					right: window.innerWidth,
					top: 0,
					bottom: window.innerHeight,
					zIndex: 5
				};

				PLY.p.ui.size = {
					name: 'UI',
					position: 'absolute',
					left: 0,
					right: window.innerWidth,
					top: 0,
					bottom: window.innerHeight,
					zIndex: 5
				};


			} else {

				PLY.p.pano.size = {
					name: 'PANO',
					position: 'absolute',
					left: 0,
					right: 1,
					top: 0,
					bottom: 1,
					zIndex: 5
				};

				PLY.p.map.size = {
					name: 'MAP',
					position: 'absolute',
					left: 0,
					right: window.innerWidth,
					top: 0,
					bottom: window.innerHeight,
					zIndex: 5
				};

				PLY.p.ui.size = {
					name: 'UI',
					position: 'absolute',
					left: 0,
					right: window.innerWidth,
					top: 0.0,
					bottom: window.innerHeight,
					zIndex: 5
				};

			}

		}

		PLY.p.ui.viewPort = PLY.f.resizeViewPort(
			undefined,
			PLY.p.ui.size
		);

		PLY.p.pano.viewPort = PLY.f.resizeViewPort(
			PLY.p.pano.canvas,
			PLY.p.pano.size
		);

		PLY.p.map.viewPort = PLY.f.resizeViewPort(
			undefined,
			PLY.p.map.size
		);

		VARCO.f.onMainWindowResize(renderer, PLY.p.sceneBKG, PLY.p.cameraBKG, PLY.p.map.viewPort);
		VARCO.f.onMainWindowResize(renderer, PLY.p.sceneMAP, PLY.p.cameraMAP, PLY.p.map.viewPort);
		VARCO.f.onMainWindowResize(renderer, PLY.p.scene3D, PLY.p.camera3D, PLY.p.map.viewPort);
		VARCO.f.onMainWindowResize(renderer, PLY.p.scene3D, PLY.p.cameraSTV, PLY.p.pano.viewPort);
		VARCO.f.onMainWindowResize(renderer, UI.p.scene, UI.p.camera, PLY.p.ui.viewPort);

	};

	// //////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////



	// //////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////

	// INIT START 

	PLY.f.GPS_update = function () {

		console.log("PLY.f.GPS_update")

		VARCO.f.updateGPS();


		let alt = 0.0;

		let qualityGPS = 0;

		let lng = 0.0;

		let lat = 0.0;

		let weightCounter = 0;

		let automatic_flagGPS;

		let worstValueNum = 0;

		let bestValueNum = 0;

		let gpsPointValue = {};


		if (PLY.p.calibrationGPS_maxNumber == 1) {

			PLY.p.calibrationGPS_list = [];

		}


		if (VARCO.p.DEVICES.GPS.accuracy < 100) {

			qualityGPS = 1;

			if (VARCO.p.DEVICES.GPS.accuracy < 50) {

				qualityGPS = 2;

				if (VARCO.p.DEVICES.GPS.accuracy < 20) {

					qualityGPS = 3;

					if (VARCO.p.DEVICES.GPS.accuracy < 10) {

						qualityGPS = 4;

					}

				}

			}

		} else {

			qualityGPS = 0

		}


		if (qualityGPS > PLY.p.qualityGPS) {

			PLY.p.qualityGPS = qualityGPS;

		}


		gpsPointValue = { lng: VARCO.p.DEVICES.GPS.lng, lat: VARCO.p.DEVICES.GPS.lat, accuracy: VARCO.p.DEVICES.GPS.accuracy };


		if (VARCO.p.DEVICES.GPS.accuracy < 100) {

			if (PLY.p.calibrationGPS_list.length > PLY.p.calibrationGPS_maxNumber) {

				for (var num = 1; num < PLY.p.calibrationGPS_list.length; num += 1) {

					if (PLY.p.calibrationGPS_list[num - 1].accuracy < PLY.p.calibrationGPS_list[num].accuracy) {

						worstValueNum = num;

					}

					if (PLY.p.calibrationGPS_list[num - 1].accuracy > PLY.p.calibrationGPS_list[num].accuracy) {

						bestValueNum = num;

					}

				}

				if (gpsPointValue.accuracy <= PLY.p.calibrationGPS_list[worstValueNum].accuracy) {

					PLY.p.calibrationGPS_list.splice(worstValueNum, 1);

					PLY.p.calibrationGPS_list.push(gpsPointValue);

				}

			} else {

				PLY.p.calibrationGPS_list.push(gpsPointValue);

			}

			PLY.p.calibrationGPS_list.forEach(

				function (gpsData) {

					lng = lng + (gpsData.lng);

					lat = lat + (gpsData.lat);

				}
			);

			MAP.p.actualCoords.lng = lng / PLY.p.calibrationGPS_list.length;

			MAP.p.actualCoords.lat = lat / PLY.p.calibrationGPS_list.length;

		} else {

			console.log("segnale assente");

		}

	};


	// //////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////



	// //////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////

	// functions extra


	PLY.f.deg2rad = function (angle) {

		return (angle / 180) * Math.PI;

	};

	// //////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////


	// //////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////

	// STREETVIEW:

	//EXTENSA.f.resizePANO(
	// {
	// name : 'PANO',
	// position : 'absolute',
	// left : window.innerWidth - 600,
	// top : 0,
	// width : 600,
	// height : 600,
	// zIndex : 5
	// }
	//)

	PLY.f.resizeViewPort = function (canvas, p) {

		// update CANVAS dello Street View

		let height = getDOMHeight(p.bottom - p.top);

		if (canvas !== undefined) {
			canvas.style.position = p.position;
			canvas.style.left = p.left + 'px';
			canvas.style.top = p.top + 'px';
			canvas.style.width = (p.right - p.left) + 'px';
			canvas.style.height = height + 'px';
			canvas.style.zIndex = p.zIndex;
		}


		// update viewport di rendering
		return {
			name: p.name,
			left: p.left,
			bottom: window.innerHeight - p.bottom,
			width: (p.right - p.left),
			height
		};

	};



	PLY.f.initPANO = function () {
		window.panorama.addListener("pano_changed", () => {

			if (PLY.p.idtimeout !== undefined) {

				clearTimeout(PLY.p.idtimeout);

				PLY.p.idtimeout = undefined;

			}


			PLY.p.idtimeout = setTimeout(

				function () {

					PLY.p.pano.info = {

						panoID: window.panorama.location.pano,

						description: window.panorama.location.description,

						shortDescription: window.panorama.location.shortDescription,

						streetViewDataProviders: window.panorama.streetViewDataProviders,

						imageDate: window.panorama.get('image_date'),

						IP: 0 // PLY.f.ip_local()

					};


					let alt = 0.0;

					MAP.p.actualCoords.lng = window.panorama.getPosition().lng();

					MAP.p.actualCoords.lat = window.panorama.getPosition().lat();

					let posXZ = MAP.f.getMapPosition(MAP.p.width, MAP.p.height, MAP.p.actualCoords.lng, MAP.p.actualCoords.lat, alt);

					PLY.p.cameraSTVAxis.position.x = posXZ.x;

					PLY.p.cameraSTVAxis.position.y = alt;

					PLY.p.cameraSTVAxis.position.z = posXZ.z;

					if (PLY.p.flagSTVOn) {

						PLY.p.camera3DAxis.position.x = posXZ.x;

						PLY.p.camera3DAxis.position.y = alt;

						PLY.p.camera3DAxis.position.z = posXZ.z;

					}

				},
				500
			);

		});

	};

	// //////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////



	// //////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////

	// CODE LOOP :

	PLY.f.GEOAREA_MANAGER = function () {
		let dist;
		let distMin = 1000;
		let distMax = PLY.p.geoAreaSize;
		let geoNum = -1;
		let prjNum = -1;
		let counter = 0;
		let GEOAREAOBJ;
		let PROJECTOBJ;
		let vetPrjPos = new THREE.Vector3();

		// controlla la distanza con i progetti attivi nella geoarea piu' vicina:

		if (EDITOR.p.STATE == false) {

			for (var numG = 0; numG < PLY.p.scene3D.OBJECTS.geoArea.children.length; numG += 1) {

				GEOAREAOBJ = PLY.p.scene3D.OBJECTS.geoArea.children[numG];

				for (var numP = 0; numP < GEOAREAOBJ.OBJECTS.projects.children.length; numP += 1) {

					PROJECTOBJ = GEOAREAOBJ.OBJECTS.projects.children[numP];

					PROJECTOBJ.getWorldPosition(vetPrjPos);

					dist = PLY.p.camera3DAxis.position.distanceTo(vetPrjPos);


					if (dist < distMax) {

						if (distMin > dist) {

							distMin = dist;

							geoNum = numG;

							prjNum = numP;

						}

					}

				}

			}


			if (prjNum !== -1 && geoNum !== -1) {

				GEOAREAOBJ = PLY.p.scene3D.OBJECTS.geoArea.children[geoNum];

				PROJECTOBJ = PLY.p.scene3D.OBJECTS.geoArea.children[geoNum].OBJECTS.projects.children[prjNum];

				const { project: _selectedProject } = get(projectStore); // leggi dato

				// For mmare3d: Use _selectedProject as PLY.p.selectedProject
				if (_selectedProject !== null) {

					if (PROJECTOBJ.name !== _selectedProject.name) {

						// PLY.p.selectedProject = PROJECTOBJ;

						PLY.p.selectedProjectName = PROJECTOBJ.userData.name;

						// Update svelte project store
						projectStore.setProject(PROJECTOBJ); // scrivi dato

						PLY.p.selectedGeoAreaName = GEOAREAOBJ.userData.name;

						// UI.p.previewProject.f.open(GEOAREAOBJ, PROJECTOBJ)

					}

				} else {

					// PLY.p.selectedProject = PROJECTOBJ;

					PLY.p.selectedProjectName = PROJECTOBJ.userData.name;

					projectStore.setProject(PROJECTOBJ); // scrivi dato

					PLY.p.selectedGeoAreaName = GEOAREAOBJ.userData.name;

					// UI.p.previewProject.f.open(GEOAREAOBJ, PROJECTOBJ)

				}

			} else {

				if (UI.p.scene.OBJECTS.previewProject !== undefined) {

					VARCO.f.deleteElement(UI.p.scene, UI.p.scene.OBJECTS.previewProject);

				}

				// PLY.p.selectedProject = undefined;

				PLY.p.selectedProjectName = '';

				projectStore.setProject(null); // scrivi dato NULL

				PLY.p.selectedGeoAreaName = '';

			}

		}

	};



	PLY.f.fromNumToStringWithZero = function (num) {

		let stringNum = '';

		if (num < 10000) {
			stringNum = '0' + num;
		} else {
			if (num < 1000) {
				stringNum = '00' + num;
			} else {
				if (num < 100) {
					stringNum = '000' + num;
				} else {
					if (num < 10) {
						stringNum = '0000' + num;
					} else {
						stringNum = '' + num;
					}
				}
			}
		}

		return stringNum;

	};



	PLY.f.SECTOR_MANAGER = function () {


		PLY.p.geoMapSectors.actualSectHV = PLY.f.findGeoAreaSector(MAP.p.actualCoords.lng, MAP.p.actualCoords.lat, PLY.p.geoMapSectors.maxNumSectH, PLY.p.geoMapSectors.maxNumSectV);


		if (PLY.p.geoMapSectors.actualSectHV[0] !== PLY.p.geoMapSectors.oldSectHV[0] || PLY.p.geoMapSectors.actualSectHV[1] !== PLY.p.geoMapSectors.oldSectHV[1]) {

			PLY.p.geoMapSectors.oldSectHV = PLY.p.geoMapSectors.actualSectHV;

			let sectorList = [];

			let startY = PLY.p.geoMapSectors.sectNumV * -3;

			let endY = PLY.p.geoMapSectors.sectNumV + 3;

			let startX = PLY.p.geoMapSectors.sectNumH * -3;

			let endX = PLY.p.geoMapSectors.sectNumH + 3;


			for (var numY = startY; numY < endY; numY += 1) {

				let sectV = PLY.p.geoMapSectors.actualSectHV[1] + numY;

				let stringV = PLY.f.fromNumToStringWithZero(sectV);

				for (var numX = startX; numX < endX; numX += 1) {

					let sectH = PLY.p.geoMapSectors.actualSectHV[0] + numX;

					let stringH = PLY.f.fromNumToStringWithZero(sectH);

					sectorList.push("Sect_" + stringH + "_" + stringV);

				}
			}

			// cancella vecchie geoAree //
			let numGeoAreaToDelete = [];

			for (var num = 0; num < PLY.p.scene3D.OBJECTS.geoArea.children.length; num += 1) {
				numGeoAreaToDelete.push(PLY.p.scene3D.OBJECTS.geoArea.children[num]);
			}

			for (var num = 0; num < numGeoAreaToDelete.length; num += 1) {
				VARCO.f.deleteElement(PLY.p.scene3D.OBJECTS.geoArea, numGeoAreaToDelete[num]);
			}


			// cancella vecchi POI geoAree //
			numGeoAreaToDelete = [];

			for (var num = 0; num < UI.p.scene.OBJECTS.poi.children.length; num += 1) {
				numGeoAreaToDelete.push(UI.p.scene.OBJECTS.poi.children[num]);
			}

			for (var num = 0; num < numGeoAreaToDelete.length; num += 1) {
				VARCO.f.deleteElement(UI.p.scene.OBJECTS.poi, numGeoAreaToDelete[num]);
			}

			if (UI.p.popup_login_data.p.data == undefined) {

				PLY.p.selectedArea = undefined;

				// PLY.p.selectedProject = undefined;

				PLY.p.selectedProjectName = undefined;

				projectStore.setProject(null); // scrivi dato NULL

			}

			numGeoAreaToDelete = undefined;


			// carica il settore //

			// TODO load all JSON sectors here
			for (var num = 0; num < sectorList.length; num += 1) {

				VARCO.f.loadJSON(

					'SECTOR_DB/' + sectorList[num] + '.json',

					function init_sectorData(sectorData) {

						console.log(sectorData);

						// carica geoaree del settore //
						for (var i = 0; i < sectorData.geoareaList.length; i += 1) {
							VARCO.f.loadJSON(

								'USER_DB/' + sectorData.geoareaList[i].user + '/geoArea/' + sectorData.geoareaList[i].geoAreaName + '.json', // path x geoarea

								function init_geoData(geoData) {

									// CREATE GEOAREA CIRCLES //
									EDITOR.f.createGeoArea(

										geoData,

										function initDataOfGeoArea(q) {

											let GEOAREAOBJ = q.obj;

											for (var j = 0; j < geoData.projectsList.length; j += 1) {

												// CREATE PROJECTS CIRCLES //
												EDITOR.f.createProject(

													GEOAREAOBJ,

													geoData.projectsList[j],

													function () {

													},

													{}

												);
												// /////////////////////// //

											}

										},

										{}
									);
									// /////////////////////// //

								}

							)

						}

					},

					function error_data() {

						console.log('no sector founded');

					}

				);

			}

		}

	};



	PLY.f.COMPASS_MANAGER = function () {

		PLY.p.COMPASS.position.x = PLY.p.camera3DAxis.position.x;

		PLY.p.COMPASS.position.y = MAP.p.actualCoords.alt;

		PLY.p.COMPASS.position.z = PLY.p.camera3DAxis.position.z;


		PLY.p.COMPASS.OBJECTS.arrow.quaternion.copy(PLY.p.camera3DAxis.quaternion);

		PLY.p.COMPASS.OBJECTS.arrow.rotateX(VARCO.f.deg2rad(-90));


		// keep scale visible //

		if (MAP.p.actualMapAltitude > 40.0) {

			PLY.p.COMPASS.scale.x = MAP.p.actualMapAltitude * 0.025;

			PLY.p.COMPASS.scale.y = 1;

			PLY.p.COMPASS.scale.z = MAP.p.actualMapAltitude * 0.025;

		} else {

			PLY.p.COMPASS.scale.x = 1;

			PLY.p.COMPASS.scale.y = 1;

			PLY.p.COMPASS.scale.z = 1;

		}

	};



	PLY.f.RENDERER = function (renderer) {

		PLY.p.actualTimer = PLY.p.clock.getDelta(); // delta t in milliseconds

		if (renderer.xr.isPresenting) {

			PLY.p.camera3DAxis.rotation.x = PLY.p.camera3DAxis.rotation.y = PLY.p.camera3DAxis.rotation.z = 0.0;

			PLY.p.camera3DAxis.rotateY(VARCO.f.deg2rad(PLY.p.AR_direction));

			PLY.p.camera3DAxis.position.y = MAP.p.actualCoords.alt + PLY.p.tripodHeight;


			VARCO.f.render(
				[
					[renderer, PLY.p.scene3D, PLY.p.camera3D, undefined]
				]
			);

		} else {

			VARCO.f.render(
				[
					[renderer, PLY.p.sceneBKG, PLY.p.cameraBKG, PLY.p.map.viewPort],
					[renderer, PLY.p.sceneMAP, PLY.p.cameraMAP, PLY.p.map.viewPort],
					[renderer, PLY.p.scene3D, PLY.p.camera3D, PLY.p.map.viewPort],
					[renderer, PLY.p.scene3D, PLY.p.cameraSTV, PLY.p.pano.viewPort],
					[renderer, UI.p.scene, UI.p.camera, PLY.p.ui.viewPort]
				]
			);

		}

	};



	PLY.f.UPDATE = function (renderer) {

		let oldPosX = 0;

		let oldPosY = 0;

		let oldPosZ = 0;


		let flagIsInViewPortMap = VARCO.f.checkIsInViewPort(

			PLY.p.map.size

		);

		let flagIsInViewPortPano = VARCO.f.checkIsInViewPort(

			PLY.p.pano.size

		);

		// mouse / keyboard shortcuts //

		if (VARCO.p.DEVICES.keyboard.keyPressed == 32) { // deselect all

			UI.f.remove_menu_popups();

			EDITOR.f.deselectProjects();

			EDITOR.f.deselectGeoArea();

			if (UI.p.scene.OBJECTS.previewProject !== undefined) {

				VARCO.f.deleteElement(UI.p.scene, UI.p.scene.OBJECTS.previewProject);

			};

			const { project: _selectedProject } = get(projectStore); // leggi dato

			console.log(_selectedProject);

			PLY.p.selectedProjectName = '';
			projectStore.setProject(null); // scrivi dato NULL
			PLY.p.selectedGeoAreaName = '';

		}


		if (VARCO.p.DEVICES.keyboard.keyPressed == 18) {

			if (VARCO.p.DEVICES.mouse.buttonNum == 1) {

				PLY.p.action = 'drag';

			}

			if (VARCO.p.DEVICES.mouse.buttonNum == 2) {

				PLY.p.action = 'rotation';

			}

			if (VARCO.p.DEVICES.mouse.buttonNum == 3) {

				PLY.p.action = 'position';

			}

		}

		// ///////////////////////////////////////

		// STREET VIEW STV	

		if (flagIsInViewPortPano) {

			if (MAP.p.OBJ !== undefined && PLY.p.flagPlayerOn) {

				let flagActive = false;

				if (VARCO.p.DEVICES.mouse.clickDown) {

					if (VARCO.p.DEVICES.mouse.locV < (window.innerHeight - 200)) {

						flagActive = true;

					}

				}


				if (VARCO.p.DEVICES.touch.clickDown) {

					if (VARCO.p.DEVICES.touch.locV < (window.innerHeight - 200)) {

						flagActive = true;

					}

				}

			}


			// mouse && touch //

			if (VARCO.p.DEVICES.mouse.clickDown) {

				PLY.p.cameraSTVAxis.userData.angX += VARCO.p.DEVICES.mouse.diffV * 0.4 * -1;

				PLY.p.cameraSTVAxis.userData.angY += VARCO.p.DEVICES.mouse.diffH * 0.4 * -1;

			} else {

				PLY.p.cameraSTVAxis.userData.angX += VARCO.p.DEVICES.touch.diffV * 0.4 * -1;

				PLY.p.cameraSTVAxis.userData.angY += VARCO.p.DEVICES.touch.diffH * 0.4 * -1;

			}


			if (PLY.p.camera3DAxis.userData.orbitRadius < 8.0) {

				PLY.p.camera3DAxis.userData.minAngX = -189.0;

				PLY.p.camera3DAxis.userData.maxAngX = 189.0;

			} else {

				PLY.p.camera3DAxis.userData.minAngX = 0.25;

				PLY.p.camera3DAxis.userData.maxAngX = 189.0;

			}

			if (PLY.p.cameraSTVAxis.userData.angX < PLY.p.cameraSTVAxis.userData.minAngX) {

				PLY.p.cameraSTVAxis.userData.angX = PLY.p.cameraSTVAxis.userData.minAngX;

			}

			if (PLY.p.cameraSTVAxis.userData.angX > PLY.p.cameraSTVAxis.userData.maxAngX) {

				PLY.p.cameraSTVAxis.userData.angX = PLY.p.cameraSTVAxis.userData.maxAngX;

			}

			if (PLY.p.cameraSTVAxis.userData.angY < 0.0) {

				PLY.p.cameraSTVAxis.userData.angY = PLY.p.cameraSTVAxis.userData.angY + 360.0;

			}

			if (PLY.p.cameraSTVAxis.userData.angY > 360.0) {

				PLY.p.cameraSTVAxis.userData.angY = PLY.p.cameraSTVAxis.userData.angY - 360.0;

			}


			if (window.window.panorama !== undefined) {

				window.panorama.setPov({ heading: PLY.p.cameraSTVAxis.userData.angY, pitch: - PLY.p.cameraSTVAxis.userData.angX });


				PLY.p.pano.zoom = PLY.p.pano.zoom + (VARCO.p.DEVICES.mouse.zoom * 0.1 * -1);

				if (PLY.p.pano.zoom < PLY.p.pano.minZoom) {

					PLY.p.pano.zoom = PLY.p.pano.minZoom;

				}

				if (PLY.p.pano.zoom > PLY.p.pano.maxZoom) {

					PLY.p.pano.zoom = PLY.p.pano.maxZoom;

				}

				window.panorama.setZoom(PLY.p.pano.zoom);

				PLY.p.cameraSTVAxis.userData.fov = Math.atan(Math.pow(2, 1 - PLY.p.pano.zoom)) * 360 / Math.PI;

			}

		}



		if (flagIsInViewPortMap) {

			if (MAP.p.OBJ !== undefined && PLY.p.flagPlayerOn) {

				// mouse && touch //

				switch (PLY.p.action) {

					case 'position':

						let speedY;

						if (VARCO.p.DEVICES.mouse.clickDown) {

							speedY = VARCO.p.DEVICES.mouse.diffV * (PLY.p.camera3DAxis.userData.orbitRadius + 15.0) * 0.001 * 1;

							MAP.p.actualCoords.alt += speedY;

						}

						if (VARCO.p.DEVICES.touch.clickDown) {

							speedY = VARCO.p.DEVICES.touch.diffV * (PLY.p.camera3DAxis.userData.orbitRadius + 15.0) * 0.001 * 1;

							MAP.p.actualCoords.alt += speedY;

						}

						if (MAP.p.actualCoords.alt < 0.0) {

							MAP.p.actualCoords.alt = 0.0;

						}


						break;


					case 'rotation':

						if (VARCO.p.DEVICES.mouse.clickDown) {

							PLY.p.camera3DAxis.userData.angX += VARCO.p.DEVICES.mouse.diffV * 0.2;

							PLY.p.camera3DAxis.userData.angY += VARCO.p.DEVICES.mouse.diffH * 0.2;

						}

						if (VARCO.p.DEVICES.touch.clickDown) {

							if (PLY.p.flagDoubleTouch == false) {

								PLY.p.camera3DAxis.userData.angX += VARCO.p.DEVICES.touch.diffV * 0.2;

								PLY.p.camera3DAxis.userData.angY += VARCO.p.DEVICES.touch.diffH * 0.2;

							}

						}

						break;


					case 'drag':

						let speedX;

						let speedZ;

						if (VARCO.p.DEVICES.mouse.clickDown) {
							// debugger;
							speedX = VARCO.p.DEVICES.mouse.diffH * (PLY.p.camera3DAxis.userData.orbitRadius + 15.0) * 0.001 * -1;

							speedZ = VARCO.p.DEVICES.mouse.diffV * (PLY.p.camera3DAxis.userData.orbitRadius + 15.0) * 0.001 * -1;
							PLY.p.camera3DAxis.translateX(speedX);
							PLY.p.camera3DAxis.translateZ(speedZ);

						}

						if (VARCO.p.DEVICES.touch.clickDown) {

							if (PLY.p.flagDoubleTouch == false) {

								speedX = VARCO.p.DEVICES.touch.diffH * (PLY.p.camera3DAxis.userData.orbitRadius + 15.0) * 0.001 * -1;

								speedZ = VARCO.p.DEVICES.touch.diffV * (PLY.p.camera3DAxis.userData.orbitRadius + 15.0) * 0.001 * -1;

								PLY.p.camera3DAxis.translateX(speedX);

								PLY.p.camera3DAxis.translateZ(speedZ);

							}

						}


						break;

				}


				if (VARCO.p.DEVICES.mouse.zoom !== 0) {

					PLY.p.camera3DAxis.userData.orbitRadiusInt += VARCO.p.DEVICES.mouse.zoom * PLY.p.camera3DAxis.userData.orbitRadiusInt * 0.1;

					// MAP.p.actualMapAltitude = PLY.p.camera3DAxis.userData.orbitRadiusInt;

				}

				if (VARCO.p.DEVICES.touch.listLoc.length < 2) {

					PLY.p.flagDoubleTouch = false;

				}

				if (VARCO.p.DEVICES.touch.zoom !== 0) {

					PLY.p.camera3DAxis.userData.orbitRadiusInt += VARCO.p.DEVICES.touch.zoom * PLY.p.camera3DAxis.userData.orbitRadiusInt * 0.1;

					// MAP.p.actualMapAltitude = PLY.p.camera3DAxis.userData.orbitRadiusInt;

					PLY.p.flagDoubleTouch = true;

				}


				// update lonLat and map

				if (PLY.p.flagGPS == false) {

					MAP.p.actualCoords.lng = MAP.f.getMapCoords(MAP.p.width, MAP.p.height, PLY.p.camera3DAxis.position).lng;

					MAP.p.actualCoords.lat = MAP.f.getMapCoords(MAP.p.width, MAP.p.height, PLY.p.camera3DAxis.position).lat;

					MAP.f.setMapCoords(MAP.p.actualCoords.lng, MAP.p.actualCoords.lat, MAP.p.actualMapAltitude);

				}

				// angX angY limits

				if (PLY.p.camera3DAxis.userData.angX < PLY.p.camera3DAxis.userData.minAngX) {

					PLY.p.camera3DAxis.userData.angX = PLY.p.camera3DAxis.userData.minAngX;

				}

				if (PLY.p.camera3DAxis.userData.angX > PLY.p.camera3DAxis.userData.maxAngX) {

					PLY.p.camera3DAxis.userData.angX = PLY.p.camera3DAxis.userData.maxAngX;

				}

				if (PLY.p.camera3DAxis.userData.angY < 0.0) {

					PLY.p.camera3DAxis.userData.angY = PLY.p.camera3DAxis.userData.angY + 360.0;

				}

				if (PLY.p.camera3DAxis.userData.angY > 360.0) {

					PLY.p.camera3DAxis.userData.angY = PLY.p.camera3DAxis.userData.angY - 360.0;

				}

				// ///////////////////////////////////////

			}

		}


		if (PLY.p.flagGPS) {

			// let alt = 0.0;

			let posXZ = MAP.f.getMapPosition(MAP.p.width, MAP.p.height, MAP.p.actualCoords.lng, MAP.p.actualCoords.lat, MAP.p.actualCoords.alt);

			PLY.p.camera3DAxis.position.x = posXZ.x;

			PLY.p.camera3DAxis.position.z = posXZ.z;

			PLY.p.camera3D.position.x = 0;

			PLY.p.camera3D.position.y = 0;

			PLY.p.camera3D.position.z = 0;

		}


		// /////////////// //

		if (PLY.p.flagCOMPASS) {

			PLY.p.camera3DAxis.OBJECTS.camera3D.rotation.x = PLY.p.camera3DAxis.OBJECTS.camera3D.rotation.y = PLY.p.camera3DAxis.OBJECTS.camera3D.rotation.z = 0.0;

			PLY.p.camera3DAxis.OBJECTS.camera3D.quaternion.copy(VARCO.p.DEVICES.COMPASS.quaternion);


			// offset rotation // 

			PLY.p.camera3DAxis.rotation.x = PLY.p.camera3DAxis.rotation.y = PLY.p.camera3DAxis.rotation.z = 0.0;

			PLY.p.camera3DAxis.rotateY(VARCO.f.deg2rad(PLY.p.camera3DAxis.userData.angY));


			if (VARCO.p.DEVICES.isIOS) {

				PLY.p.AR_direction = VARCO.p.DEVICES.COMPASS.y + PLY.p.camera3DAxis.userData.angY;

			} else {

				PLY.p.AR_direction = VARCO.p.DEVICES.COMPASS.y + PLY.p.camera3DAxis.userData.angY;

			}

		} else {

			PLY.p.camera3DAxis.rotation.x = 0;

			PLY.p.camera3DAxis.rotation.y = 0;

			PLY.p.camera3DAxis.rotation.z = 0;

			PLY.p.camera3DAxis.rotateY(VARCO.f.deg2rad(-PLY.p.camera3DAxis.userData.angY));


			PLY.p.camera3D.rotation.x = 0;

			PLY.p.camera3D.rotation.y = 0;

			PLY.p.camera3D.rotation.z = 0;

			PLY.p.camera3D.position.x = 0;

			PLY.p.camera3D.position.y = 0;

			PLY.p.camera3D.position.z = 0;

			PLY.p.camera3D.rotateX(VARCO.f.deg2rad(-PLY.p.camera3DAxis.userData.angX));

			PLY.p.camera3D.translateZ(PLY.p.camera3DAxis.userData.orbitRadius);

		}


		// ///////////////////////////////////////

		// UPDATE 3D CAMERA TRANSFORMATIONS // //

		PLY.p.camera3DAxis.userData.orbitRadius = VARCO.f.mathInterpolateTo(PLY.p.camera3DAxis.userData.orbitRadius, PLY.p.camera3DAxis.userData.orbitRadiusInt, 0.25);

		PLY.p.camera3DAxis.position.y = MAP.p.actualCoords.alt + PLY.p.tripodHeight;


		PLY.p.camera3D.fov = PLY.p.camera3DAxis.userData.fov;

		PLY.p.camera3D.updateProjectionMatrix();

		// ///////////////////////////////////////

		// ///////////////////////////////////////

		// UPDATE MAP // /////////////////

		let vetCamPos = new THREE.Vector3();

		let quatCamRot = new THREE.Quaternion();

		PLY.p.camera3D.getWorldPosition(vetCamPos);

		PLY.p.camera3D.getWorldQuaternion(quatCamRot);

		PLY.p.cameraMapAxis.position.x = vetCamPos.x;

		PLY.p.cameraMapAxis.position.y = vetCamPos.y;

		PLY.p.cameraMapAxis.position.z = vetCamPos.z;


		PLY.p.cameraMapAxis.quaternion.copy(quatCamRot);


		MAP.p.actualMapAltitude = PLY.p.camera3DAxis.userData.orbitRadiusInt;


		PLY.p.cameraMAP.fov = PLY.p.camera3D.fov;

		PLY.p.cameraMAP.updateProjectionMatrix();

		// ///////////////////////////////////////

		// ///////////////////////////////////////

		// UPDATE STV CAMERA TRANSFORMATIONS // //

		PLY.p.cameraSTVAxis.rotation.x = 0;

		PLY.p.cameraSTVAxis.rotation.y = 0;

		PLY.p.cameraSTVAxis.rotation.z = 0;

		PLY.p.cameraSTVAxis.rotateY(VARCO.f.deg2rad(-PLY.p.cameraSTVAxis.userData.angY));

		PLY.p.cameraSTVAxis.position.y = 2.4; // altezza media StreetView

		PLY.p.cameraSTV.rotation.x = 0;

		PLY.p.cameraSTV.rotation.y = 0;

		PLY.p.cameraSTV.rotation.z = 0;

		PLY.p.cameraSTV.rotateX(VARCO.f.deg2rad(-PLY.p.cameraSTVAxis.userData.angX));

		PLY.p.cameraSTV.fov = PLY.p.cameraSTVAxis.userData.fov;

		PLY.p.cameraSTV.updateProjectionMatrix();

		// ///////////////////////////////////////

		// ///////////////////////////////////////

		// UPDATE COMPASS //

		// compass object position on ground //

		if (PLY.p.COMPASS !== undefined) {

			PLY.f.COMPASS_MANAGER();

		}

		// ///////////////////////////////////////

		// ///////////////////////////////////////

		// CHECK sector , geoMap ,  project  //

		if (PLY.p.selectedArea == undefined) {

			PLY.f.SECTOR_MANAGER();

		}


		PLY.f.GEOAREA_MANAGER();


		if (VARCO.p.DEVICES.mouse.clickDown == false && PLY.p.flagPlayerOn == false) {

			PLY.p.flagPlayerOn = true;

		}


		// RENDERER :

		PLY.f.RENDERER(renderer);

	};


	// //////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////

	// PLY.f.selectPreviewProject = function( geoAreaOBJ, projectOBJ ){

	// console.log( "selectPreviewProject" );

	// PLY.p.selectedProjectName = projectOBJ.userData.name;

	// PLY.p.selectedGeoAreaName = geoAreaOBJ.userData.name;

	// // UI.p.previewProject.f.open( geoAreaOBJ, projectOBJ );

	// };


	// //////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////



	// //////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////

	// DATA FROM DB:

	PLY.f.findGeoAreaSector = function (lng, lat, maxNumSectH, maxNumSectV) {

		let UH = ((lng + 180.0) / 360);

		let UV = 1.0 - ((lat + 90.0) / 180);

		let sectH = Math.floor(maxNumSectH * UH);

		let sectV = Math.floor(maxNumSectV * UV);

		return [sectH, sectV]

	};



	PLY.f.parseData = function (dbData) {

		const propList = Object.keys(dbData);

		for (var i = 0; i < propList.length; i += 1) {

			PLY.f.createGeoArea(

				dbData[propList[i]].myCoords.lng,

				dbData[propList[i]].myCoords.lat,

				true,

				dbData[propList[i]],

				function initDataOfGeoArea(q) {

					q.obj.userData = dbData[propList[i]];

				},

				{}

			);

		}

		// save info in dowload folder:

		// let textDB = JSON.stringify( PLY.p.SECTORDB );

		// VARCO.f.saveInfo(textDB, "DBSECTOR.json");

	};


	// //////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////



	// //////////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////////

	// SCENES:

	PLY.f.initScene3D = function (p) {

		// pano

		VARCO.f.addScene(
			{
				"name": "scene3D"
			},
			function initScene(p) {
				PLY.p.scene3D = p.obj;

				// environment textures //

				VARCO.f.addTexture(
					PLY.p.scene3D,
					{
						"name": "environment",
						"url": "images/reflection.jpeg"
					},
					function (t) {
						PLY.p.scene3D.environment = t.obj;
						PLY.p.scene3D.environment.mapping = THREE.EquirectangularReflectionMapping;
					}
				)

				// equirectangular

			}

		);

		VARCO.f.addComplex(

			PLY.p.scene3D,

			{
				"name": "geoArea"
			}

		);


		VARCO.f.addComplex(

			PLY.p.scene3D,

			{
				"name": "camera3DAxis",
				"userData": {
					"angX": 90.0,
					"angXInt": 90.0,
					"angY": 0.0,
					"angYInt": 0.0,
					"orbitRadius": 2000.0,
					"orbitRadiusInt": 2000.0,
					"fov": 70.0,
					"minAngX": 1.0,
					"maxAngX": 89.0
				},

				"parameters": {
					"elementList": [

						{
							"type": "addCamera",
							"prop": {
								"name": "camera3D",
								"type": "PerspectiveCamera",
								"rotation": { "x": 0.0, "y": 0.0, "z": 0.0 },
								"position": { "x": 0.0, "y": PLY.p.tripodHeight, "z": 0.0 },
								"parameters": { "near": 0.1, "far": 2000000, "fov": 70.0 }
							}
						},

						{
							"type": "addLight",
							"prop": {
								"type": "DirectionalLight",
								"name": "ShadowLight",
								"castShadow": true,
								"parameters": {
									"intensity": 1.0,
									"shadow": {
										"bias": 0.0001,
										"mapSize": {
											"width": 1024,
											"height": 1024
										},
										"camera": {
											"top": 10,
											"bottom": -10,
											"left": -10,
											"right": 10,
											"near": 0.5,
											"far": 500
										}
									}
								},
								"castShadow": true,
								"position": {
									"x": 0.0,
									"y": 5.0,
									"z": 6.0
								}
							}
						}
					]
				}
			},

			function (p) {

				PLY.p.camera3DAxis = p.obj;

				PLY.p.camera3D = PLY.p.camera3DAxis.OBJECTS.camera3D;

			},
			{}

		);


		VARCO.f.addComplex(

			PLY.p.scene3D,

			{
				"name": "COMPASS",
				"visible": true,

				"parameters": {

					"textureList": [
						{
							"name": "compass_txt",
							"url": "images/UI/compass.png"
						},
						{
							"name": "arrow_txt",
							"url": "images/UI/compass_arrow.png"
						}
					],

					"materialList": [
						{
							"type": "MeshBasicMaterial",
							"name": "compass_mat",
							"parameters": {
								"color": { "r": 1.0, "g": 1.0, "b": 1.0 },
								"transparent": true,
								"alphaTest": 0.5,
								"depthTest": false,
								"depthWrite": false,
								"opacity": 0.6,
								"textures": { "map": "compass_txt" }
							}
						},

						{
							"type": "MeshBasicMaterial",
							"name": "arrow_mat",
							"parameters": {
								"color": { "r": 1.0, "g": 1.0, "b": 1.0 },
								"transparent": true,
								"alphaTest": 0.5,
								"depthTest": false,
								"depthWrite": false,
								"opacity": 0.6,
								"textures": { "map": "arrow_txt" }
							}
						}
					],

					"elementList": [
						{
							"type": "addMesh",
							"prop": {
								"name": "compass",
								"type": "CircleGeometry",
								"materialList": ["compass_mat"],
								"renderOrder": 40,
								"rotation": {
									"x": -90.0,
									"y": 0.0,
									"z": 0.0
								},
								"position": {
									"x": 0,
									"y": 0,
									"z": 0
								},
								"parameters": {
									"radius": 3,
									"height": 15
								}
							}
						},

						{
							"type": "addMesh",
							"prop": {
								"name": "arrow",
								"type": "PlaneGeometry",
								"materialList": ["arrow_mat"],
								"renderOrder": 50,
								"rotation": {
									"x": -90.0,
									"y": 0.0,
									"z": 0.0
								},
								"position": {
									"x": 0,
									"y": 0.1,
									"z": 0.0
								},
								"parameters": {
									"width": 5,
									"height": 5
								}
							}
						}
					]

				},
				"position": {
					"x": 0.0,
					"y": 0.0,
					"z": 0.0
				},

				"MM3D": {
					"hideWithCamera": "cameraSTV"
				}

			},

			function (p) {
				PLY.p.COMPASS = p.obj;

				VARCO.f.addComplex(

					PLY.p.scene3D,

					{
						"name": "ALTITUDEBOX",
						"visible": true,

						"parameters": {

							"elementList": [

								{
									"type": "addMesh",
									"prop": {
										"name": "boxAltitude",
										"type": "BoxGeometry",
										"parameters": { "width": 4, "height": 1.0, "depth": 4 },

										"MM3D": {

											"helper": {
												"edges": {
													"color": { "r": 0.0, "g": 0.0, "b": 0.0 }
												}
											}
										}
									}
								}
							]

						},
						"position": {
							"x": 0.0,
							"y": 0.5,
							"z": 0.0
						},

						"MM3D": {

							"hideWithCamera": "cameraSTV",

							"scriptList": [

								{
									"loop": true,
									"function": function boxAltitudeLoop(p) {

										if (PLY.p.flagCOMPASS || PLY.p.camera3DAxis.userData.orbitRadius < 3.0) {

											p.obj.position.x = 0;

											p.obj.position.y = 0;

											p.obj.position.z = 0;

										} else {

											if (MAP.p.actualCoords.alt > 0.0) {

												p.obj.position.x = PLY.p.COMPASS.position.x;

												p.obj.position.y = (MAP.p.actualCoords.alt * 0.5) - 0.1;

												p.obj.position.z = PLY.p.COMPASS.position.z;

												p.obj.scale.y = MAP.p.actualCoords.alt;

											} else {

												p.obj.position.x = 0;

												p.obj.position.y = 0;

												p.obj.position.z = 0;

											}

										}

									},
									"functionProp": {}
								}

							]
						}

					},

					function (p) {
						PLY.p.ALTITUDEBOX = p.obj;
					},
					{}

				);
			},
			{}

		);

	};



	PLY.f.initSceneSTV = function (p) {

		VARCO.f.addComplex(

			PLY.p.scene3D,

			{
				"name": "cameraSTVAxis",
				"userData": {
					"angX": 0.0,
					"angY": 0.0,
					"fov": 89.0,
					"minAngX": -89.0,
					"maxAngX": 89.0
				},

				"parameters": {

					"materialList": [
						{
							"type": "ShadowMaterial",
							"name": "groundSTV",
							"parameters": {
								"transparent": true,
								"opacity": 0.6
							}
						}
					],
					"elementList": [

						{
							"type": "addCamera",
							"prop": {
								"name": "cameraSTV",
								"type": "PerspectiveCamera",
								"rotation": { "x": 0.0, "y": 0.0, "z": 0.0 },
								"position": { "x": 0.0, "y": 2.3, "z": 0.0 },
								"parameters": { "near": 0.1, "far": 1000, "fov": 89.0 }
							}
						},

						{
							"type": "addMesh",
							"prop": {
								"name": "groundSTV",
								"type": "PlaneGeometry",
								"materialList": ["groundSTV"],
								"parameters": {
									"width": 200,
									"height": 200
								},
								"rotation": { "x": -90.0, "y": 0.0, "z": 0.0 },
								"position": { "x": 0.0, "y": 0.0, "z": 0.0 },
								// "receiveShadow" : true,
								"MM3D": {
									"events": {

										"mousemove": {
											"scriptList": [
												{
													"function": function (p) {

														PLY.p.STREETVIEW_MARKER.position.x = p.results.point.x;

														PLY.p.STREETVIEW_MARKER.position.y = p.results.point.y + 0.05;

														PLY.p.STREETVIEW_MARKER.position.z = p.results.point.z;

													},
													"functionProp": {}
												}
											]
										},

										"dblclick": {
											"scriptList": [
												{
													"function": function (p) {

														let coords = MAP.f.getMapCoords(MAP.p.width, MAP.p.height, p.results.point, MAP.p.actualCoords.alt);

														const newPosition = new window.google.maps.LatLng(
															{

																lat: coords.lat,

																lng: coords.lng

															}
														);

														window.panorama.setPosition(newPosition);

													},
													"functionProp": {}
												}
											]
										}
									}
								}
							}
						}
					]
				}
			},

			function (p) {

				PLY.p.cameraSTVAxis = p.obj;

				PLY.p.cameraSTV = PLY.p.cameraSTVAxis.OBJECTS.cameraSTV;

			},
			{}

		);


		VARCO.f.addComplex(

			PLY.p.scene3D,

			{
				"name": "streetView_arrow",
				"visible": false,
				"parameters": {
					"textureList": [
						{
							"name": "streetView_arrow",
							"url": "images/UI/arrow.png"
						}
					],
					"materialList": [
						{
							"type": "MeshBasicMaterial",
							"name": "streetView_arrow",
							"parameters": {
								"textures": { "map": "streetView_arrow" }
							}
						}
					],
					"elementList": [

						{
							"type": "addMesh",
							"prop": {
								"name": "streetView_arrow",
								"type": "PlaneGeometry",
								"materialList": ["streetView_arrow"],
								"parameters": {
									"width": 5,
									"height": 5
								},
								"rotation": { "x": -90.0, "y": 0.0, "z": 0.0 },
								"position": { "x": 0.0, "y": 0.0, "z": 0.0 },
								"receiveShadow": true

							}

						}

					]
				},
				"MM3D": {
					"scriptList": [
						{
							"loop": true,
							"function": function (p) {

								if (PLY.p.flagSTVOn) {

									p.obj.position.x = PLY.p.cameraSTVAxis.position.x;

									p.obj.position.y = MAP.p.actualCoords.alt;

									p.obj.position.z = PLY.p.cameraSTVAxis.position.z;

									p.obj.quaternion.copy(PLY.p.cameraSTVAxis.quaternion);

								} else {

									p.obj.position.x = 0;

									p.obj.position.y = 0;

									p.obj.position.z = 0;

								}

							}
						}
					],

					"hideWithCamera": "cameraSTV"
				}
			},

			function (p) {

				PLY.p.STV_Arrow_OBJ = p.obj;

			},
			{}

		);


		VARCO.f.addComplex(

			PLY.p.scene3D,

			{
				"name": "STREETVIEW_MARKER",
				"visible": true,

				"parameters": {

					"elementList": [

						{
							"type": "addMesh",
							"prop": {
								"name": "streertViewMarker",
								"type": "CircleGeometry",
								"parameters": { "radius": 0.5 },
								"rotation": { "x": -90.0, "y": 0.0, "z": 0.0 },
								"MM3D": {
									"helper": {
										"edges": {
											"color": { "r": 0.0, "g": 0.0, "b": 0.0 }
										}
									}
								}
							}
						}
					]

				},
				"position": {
					"x": 0.0,
					"y": 0.01,
					"z": 0.0
				},
				"MM3D": {

					"hideWithCamera": "camera3D"

				}
			},

			function (p) {
				PLY.p.STREETVIEW_MARKER = p.obj;
			},
			{}

		);

		// trovare modo migliore per inizializzarlo //

		PLY.p.idtimeout = setTimeout(

			function () {

				PLY.f.initPANO();

			},
			2000
		);

	};



	PLY.f.initSceneMAP = function (p) {


		// pano

		VARCO.f.addScene(
			{
				"name": "sceneMAP"
			},
			function initScene(p) {
				PLY.p.sceneMAP = p.obj;
			}

		);


		VARCO.f.addComplex(

			PLY.p.sceneMAP,

			{
				"name": "cameraMapAxis",

				"parameters": {
					"elementList": [
						{
							"type": "addCamera",
							"prop": {
								"name": "cameraMAP",
								"type": "PerspectiveCamera",
								"rotation": { "x": 0.0, "y": 0.0, "z": 0.0 },
								"position": { "x": 0.0, "y": 0.0, "z": 0.0 },
								"parameters": { "near": 0.1, "far": 2000000, "fov": 70.0 }
							}
						}
					]
				}

			},

			function (p) {

				PLY.p.cameraMapAxis = p.obj;

				PLY.p.cameraMAP = PLY.p.cameraMapAxis.OBJECTS.cameraMAP;

			},
			{}

		);


		// //////////////////////////////////////////////////////
		// //////////////////////////////////////////////////////

		// MAPPA //

		PLY.p.addMap('OSM');

	};


	PLY.p.addMap = function (type) {

		MAP.f.addMap(
			PLY.p.sceneMAP,
			{
				parameters: {
					actualCoords: { lng: MAP.p.actualCoords.lng, lat: MAP.p.actualCoords.lat, alt: 0 },
					mapType: type,
					mapNumH: 3,
					mapNumV: 3,
					width: 40075016.686,
					height: 40075016.686,
					events: {

						"mousedown": {
							"scriptList": [
								{
									"functionName": "PLY.f.MAP_mouseTouchDown",
									"functionProp": {}
								}
							]
						},

						"mouseup": {
							"scriptList": [
								{
									"functionName": "PLY.f.MAP_mouseTouchUp",
									"functionProp": {}
								}
							]
						},

						"mousemove": {
							"scriptList": [
								{
									"functionName": "PLY.f.MAP_mouseTouchMove",
									"functionProp": {}
								}
							]
						},

						"touchstart": {
							"scriptList": [
								{
									"functionName": "PLY.f.MAP_mouseTouchDown",
									"functionProp": {}
								}
							]
						},

						"touchend": {
							"scriptList": [
								{
									"functionName": "PLY.f.MAP_mouseTouchUp",
									"functionProp": {}
								}
							]
						},

						"touchmove": {
							"scriptList": [
								{
									"functionName": "PLY.f.MAP_mouseTouchMove",
									"functionProp": {}
								}
							]
						},


						"dblclick": {
							"scriptList": [
								{
									"functionName": "PLY.f.MAP_mouseDoubleClick",
									"functionProp": {}
								}
							]
						}
					}
				}
			},
			function (p) {

				// init scene camera //

				let cameraPosition = MAP.f.getMapPosition(MAP.p.width, MAP.p.height, MAP.p.actualCoords.lng, MAP.p.actualCoords.lat, MAP.p.actualCoords.alt);

				PLY.p.camera3DAxis.position.x = cameraPosition.x;

				PLY.p.camera3DAxis.position.y = cameraPosition.y;

				PLY.p.camera3DAxis.position.z = cameraPosition.z;


				let vetCamPos = new THREE.Vector3();

				PLY.p.camera3DAxis.OBJECTS.camera3D.getWorldPosition(vetCamPos);


				MAP.p.OBJ.OBJECTS.cameraMapAxis.position.x = vetCamPos.x;

				MAP.p.OBJ.OBJECTS.cameraMapAxis.position.z = vetCamPos.z;

				MAP.p.actualMapAltitude = vetCamPos.y;

			},
			{}
		);

	};


	PLY.f.initSceneBKG = function (p) {

		// sfondo BKG webcam

		VARCO.f.addScene(
			{
				"name": "sceneBKG"
			},
			function initScene(p) {
				PLY.p.sceneBKG = p.obj;
			}
		);


		VARCO.f.addCamera(
			PLY.p.sceneBKG,
			{
				"name": "cameraBKG",
				"type": "OrthographicCamera",
				"position": { "x": 0.0, "y": 0.0, "z": 0 }
			},
			function initCameraUI(p) {
				PLY.p.cameraBKG = p.obj;
			}
		);


		VARCO.f.addComplex(
			PLY.p.sceneBKG,
			{
				"name": "sfondoBKG",
				"position": {
					"x": 0.0,
					"y": 0.0,
					"z": 0.0
				},
				"parameters": {
					"textureList": [
						{
							"name": "sfondoBKG_txt",
							"url": "images/grey.png"
						}
					],
					"materialList": [
						{
							"type": "MeshBasicMaterial",
							"name": "sfondoBKG_mat",
							"parameters": {
								"textures": { "map": "sfondoBKG_txt" },
								"color": { "r": 1.0, "g": 1.0, "b": 1.0 },
								"visible": false
							}
						},

						{
							"type": "MeshBasicMaterial",
							"name": "sfondo_mat",
							"parameters": {
								"color": { "r": 0.0, "g": 0.0, "b": 0.0 },
								"visible": true
							}
						}
					],
					"elementList": [
						{
							"type": "addMesh",
							"prop": {
								"type": "PlaneGeometry",
								"name": "sfondoBKG_mesh",
								"materialList": ["sfondoBKG_mat"],
								"parameters": {
									"width": 1,
									"height": 1
								},

								"MM3D": {
									"scriptList": [
										{
											"name": "webcamMeshLoop",
											"function": function webcamMeshLoop(p) {

												const propScale = 1.1;
												let img_scale_x, img_scale_y;

												if (VARCO.p.DEVICES.isSafari) {
													VARCO.p.DEVICES.WEBCAM.stream_width = 640;
													VARCO.p.DEVICES.WEBCAM.stream_height = 480;
												}

												let imageProp = VARCO.p.DEVICES.WEBCAM.stream_width / VARCO.p.DEVICES.WEBCAM.stream_height;

												//console.log( imageProp );

												if (VARCO.p.DEVICES.isSafari) {
													if (window.innerWidth < window.innerHeight) {

														imageProp = VARCO.p.DEVICES.WEBCAM.stream_height / VARCO.p.DEVICES.WEBCAM.stream_width;
														img_scale_x = window.innerHeight * imageProp;
														img_scale_y = window.innerHeight;

													} else {

														imageProp = VARCO.p.DEVICES.WEBCAM.stream_width / VARCO.p.DEVICES.WEBCAM.stream_height;
														img_scale_x = window.innerWidth * imageProp;
														img_scale_y = window.innerWidth;

													}

												} else {

													if (window.innerWidth < window.innerHeight) {

														imageProp = VARCO.p.DEVICES.WEBCAM.stream_height / VARCO.p.DEVICES.WEBCAM.stream_width;
														img_scale_x = window.innerHeight * imageProp;
														img_scale_y = window.innerHeight;

													} else {

														imageProp = VARCO.p.DEVICES.WEBCAM.stream_width / VARCO.p.DEVICES.WEBCAM.stream_height;
														img_scale_x = window.innerWidth * imageProp;
														img_scale_y = window.innerWidth;

													}

												}

												p.obj.scale.x = img_scale_x * propScale * 1.8;
												p.obj.scale.y = img_scale_y * propScale * 1.8;

											},
											"functionProp": {},
											"loop": true
										}
									]
								}

							}
						},

						{
							"type": "addMesh",
							"prop": {
								"type": "PlaneGeometry",
								"name": "sfondo_mesh",
								"materialList": ["sfondo_mat"],
								"parameters": {
									"width": 1,
									"height": 1
								},

								"MM3D": {
									"scriptList": [
										{
											"name": "sfondo_Loop",
											"function": function sfondo_Loop(p) {

												p.obj.scale.x = window.innerWidth;

												p.obj.scale.y = window.innerHeight;

											},
											"functionProp": {},
											"loop": true
										}
									]
								}

							}
						}
					]
				},
				"position": {
					"x": 0.0,
					"y": 0.0,
					"z": -50.0
				},
				"scale": {
					"x": 1,
					"y": 1,
					"z": 1
				}

			},
			function initSfondoBKG(p) {
				PLY.p.sfondoBKG = p.obj;
			}

		);

	};


	// //////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////



	// //////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////

	// INIT START 

	PLY.f.startAllDeviceFunctions = function () {

		document.body.removeEventListener('touchend', PLY.f.tappedEnd);

		document.body.removeEventListener('mouseup', PLY.f.clickedEnd);

		// init compass and gps
		VARCO.f.initDeviceOrientation();

		VARCO.f.initGpsLocation();


		PLY.p.actualLng = VARCO.p.DEVICES.GPS.lng;

		PLY.p.actualLat = VARCO.p.DEVICES.GPS.lat;

		PLY.p.actualAltitude = VARCO.p.DEVICES.GPS.alt;


		if (PLY.p.actualAltitude == undefined) {

			PLY.p.actualAltitude = PLY.p.elementAlt + PLY.p.tripodHeight;

		}


		// UPDATE GPS EVERY 1 SECONDS //
		PLY.p.gpsInterval = setInterval(

			function () {

				if (PLY.p.flagGPS) {

					PLY.f.GPS_update();

				}

			},
			1000

		);

		// init webcame
		PLY.p.webCamTexture = new THREE.VideoTexture(video);

		PLY.p.sfondoBKG.OBJECTS.sfondoBKG_mesh.material.map = PLY.p.webCamTexture;

		PLY.p.sfondoBKG.OBJECTS.sfondoBKG_mesh.needsUpdate = true;

		PLY.p.flagWebCamera = true;

	};


	// //////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////



	// //////////////////////////////////////////////////////
	// //////////////////////////////////////////////////////

	// GROUND MAP MOUSE AND TOUCH ON MAP //

	PLY.f.MAP_mouseTouchDown = function (p) {

	};



	PLY.f.MAP_mouseTouchUp = function (p) {

	};



	PLY.f.MAP_mouseTouchMove = function (p) {

		PLY.p.STREETVIEW_MARKER.position.x = p.results.point.x;

		PLY.p.STREETVIEW_MARKER.position.y = p.results.point.y + 0.05;

		PLY.p.STREETVIEW_MARKER.position.z = p.results.point.z;

	};



	PLY.f.MAP_mouseDoubleClick = function (p) {

		console.log("doubleClick");

		// let alt = 0.0;

		let coords

		if (PLY.p.flagSTVOn) {

			coords = MAP.f.getMapCoords(MAP.p.width, MAP.p.height, p.results.point, MAP.p.actualCoords.alt);

			const newPosition = new window.google.maps.LatLng(
				{

					lat: coords.lat,

					lng: coords.lng

				}
			);

			window.panorama.setPosition(newPosition);

			MAP.p.actualCoords.lng = coords.lng;

			MAP.p.actualCoords.lat = coords.lat;

			PLY.p.camera3DAxis.position.x = p.results.point.x;

			PLY.p.camera3DAxis.position.z = p.results.point.z;

		} else {

			coords = MAP.f.getMapCoords(MAP.p.width, MAP.p.height, p.results.point, MAP.p.actualCoords.alt);

			MAP.p.actualCoords.lng = coords.lng;

			MAP.p.actualCoords.lat = coords.lat;

			PLY.p.camera3DAxis.position.x = p.results.point.x;

			PLY.p.camera3DAxis.position.z = p.results.point.z;

		}

	};
	return PLY;
}

export default PLYSingleton;