/* eslint-disable no-global-assign */
/* eslint-disable no-case-declarations */
/* eslint-disable no-empty */
/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */
/* eslint-disable no-duplicate-case */
// UI MODULE
import * as THREE from 'three';
import { VARCO } from "../VARCO/helpers/VARCO.js";
import { authStore } from '../store/AuthStore';
import UISingleton from './extensa_ui.js';
import { MAP, PLY } from "./index.js";

let UI = UISingleton.getInstance();

const createEditor = () => {
	const EDITOR = {
		p: {
			action: '',
			dragAndDrop: false,
			STATE: false
		},
		f: {}

	};



	EDITOR.f.loop = function () {

		switch (EDITOR.action) {

			case '':

				break;

			case '':

				break;

			case '':

				break;

		}

	};



	EDITOR.f.updateSector = function () {

	};


	EDITOR.f.findSector = function (prop) {

		let coords;

		let lng, lat;


		if (prop.position !== undefined) { // vector xyz

			coords = MAP.f.getMapCoords(MAP.p.width, MAP.p.height, prop.position, MAP.p.actualCoords.alt);

			lng = coords.lng;

			lat = coords.lat;

		}


		if (prop.coords !== undefined) { // { lng: , lat:, alt: }

			lng = prop.coords.lng;

			lat = prop.coords.lat;

		}


		let sectorHV = PLY.p.geoMapSectors.actualSectHV = PLY.f.findGeoAreaSector(lng, lat, PLY.p.geoMapSectors.maxNumSectH, PLY.p.geoMapSectors.maxNumSectV);


		let stringH = PLY.f.fromNumToStringWithZero(sectorHV[0]);

		let stringV = PLY.f.fromNumToStringWithZero(sectorHV[1]);

		let sectorName = "Sect_" + stringH + "_" + stringV;

		// console.log( sectorName );

		return { "name": sectorName, "num": sectorHV };

	};




	EDITOR.f.createProject = function (GEOAREAOBJ, prop, callback, callbackprop) {

		console.log("createProject");

		prop.linkedGeoArea = GEOAREAOBJ;

		VARCO.f.addComplex(

			GEOAREAOBJ.OBJECTS.projects,

			{
				"name": prop.name,

				"userData": prop,

				"parameters": {

					"materialList": [

						{
							"type": "MeshBasicMaterial",
							"name": "Kernel_Mesh_mat",
							"parameters": {
								"color": { "r": 0.0, "g": 0.0, "b": 0.5 }
							}
						}

					],

					"elementList": [

						{
							"type": "addMesh",
							"prop": {
								"name": "Kernel_Mesh",
								"type": "CircleGeometry",
								"parameters": {
									"radius": 1.0
								},
								"materialList": ["Kernel_Mesh_mat"],
								"position": { "x": 0, "y": 0.1, "z": 0.0 },
								"rotation": { "x": -90, "y": 0.0, "z": 0.0 },

								"MM3D": {
									"helper": {
										"edges": {
											"color": { "r": 0.0, "g": 0.0, "b": 0.0 }
										}
									},

									"events": {
										"mousedown": {
											"scriptList": [
												{
													"functionName": "EDITOR.f.selectProjectDown",
													"functionProp": {}
												}
											]
										},
										"touchstart": {
											"scriptList": [
												{
													"functionName": "EDITOR.f.selectProjectDown",
													"functionProp": {}
												}
											]
										},
										"mouseup": {
											"scriptList": [
												{
													"functionName": "EDITOR.f.selectProject",
													"functionProp": {}
												}
											]
										},
										"touchend": {
											"scriptList": [
												{
													"functionName": "EDITOR.f.selectProject",
													"functionProp": {}
												}
											]
										}
									}
								}
							}
						},

						{
							"type": "addComplex",
							"prop": {
								"name": "myProject"
							}
						}

					]
				},

				"position": {
					"x": prop.myPosition.x,
					"y": 0.025,
					"z": prop.myPosition.z
				},

				"rotation": {
					"x": prop.myOrientation.x,
					"y": prop.myOrientation.y,
					"z": prop.myOrientation.z,
				},

				"scale": {
					"x": 1,
					"y": 1,
					"z": 1,
				}
			},

			function (p) {

				// check name
				let OBJ = p.obj;


				if (callback !== undefined) {

					if (callbackprop == undefined) {

						callbackprop = {}

					}

					callbackprop.obj = p.obj;

					callback(callbackprop);

				}

			},
			{}
		);

	};


	EDITOR.f.createGeoArea = function (prop, callback, callbackprop) {
		authStore.subscribe((auth) => {
			const principal = auth.identity?.getPrincipal()?.toString();
			let colorGeoArea = { r: 0.0, g: 0.0, b: 0.0 };

			if (principal) {
				colorGeoArea = { r: 1.0, g: 0.0, b: 0.0 };
			}

			let myPosition = MAP.f.getMapPosition(MAP.p.width, MAP.p.height, prop.myCoords.lng, prop.myCoords.lat, prop.myCoords.alt);

			VARCO.f.addComplex(

				PLY.p.scene3D.OBJECTS.geoArea,

				{
					"name": prop.geoAreaName,

					"userData": prop,

					"parameters": {

						"materialList": [

							{
								"type": "MeshBasicMaterial",
								"name": "geoAreaKernel_mat",
								"parameters": {
									"color": { "r": 0.5, "g": 0.5, "b": 0.5 },
									"transparent": true,
									"opacity": 0.8,
									"alphaTest": 0.5,
									"visible": true
								}
							},

							{
								"type": "MeshBasicMaterial",
								"name": "geoAreaIntensity_mat",
								"parameters": {
									"color": { "r": 1, "g": 1, "b": 1 },
									"transparent": true,
									"opacity": 0.55,
									"alphaTest": 0.5,
									"visible": false
								}
							},

							{
								"type": "MeshBasicMaterial",
								"name": "circleBase",
								"parameters": {
									"color": { "r": 0.0, "g": 0.0, "b": 0.5 },
									"transparent": true,
									"opacity": 0.5
								}
							}

						],

						"elementList": [

							{
								"type": "addMesh",
								"prop": {
									"name": "geoAreaKernel_Mesh",
									"type": "CircleGeometry",
									"parameters": {
										"radius": 2.5
									},
									"materialList": ["geoAreaKernel_mat"],
									"position": { "x": 0, "y": 0.1, "z": 0.0 },
									"rotation": { "x": -90, "y": 0.0, "z": 0.0 },

									"MM3D": {
										"helper": {
											"edges": {
												"color": colorGeoArea
											}
										},

										"events": {
											"mousedown": {
												"scriptList": [
													{
														"functionName": "EDITOR.f.selectGeoArea",
														"functionProp": {}
													}
												]
											},
											"touchstart": {
												"scriptList": [
													{
														"functionName": "EDITOR.f.selectGeoArea",
														"functionProp": {}
													}
												]
											}
										}

									}
								}
							},

							{
								"type": "addMesh",
								"prop": {
									"name": "geoAreaIntensity_Mesh",
									"type": "CircleGeometry",
									"parameters": {
										"radius": PLY.p.geoAreaSize
									},
									"materialList": ["geoAreaIntensity_mat"],
									"position": { "x": 0, "y": 0.0, "z": 0.0 },
									"rotation": { "x": -90, "y": 0.0, "z": 0.0 },

									"MM3D": {
										"helper": {
											"edges": {
												"color": colorGeoArea
											}
										}
									},

									"scale": {
										"x": 1,
										"y": 1,
										"z": 1
									}
								}
							},

							{
								"type": "addComplex",
								"prop": {
									"name": "projects"

								}
							}

						]
					},

					"position": {
						"x": myPosition.x,
						"y": myPosition.y,
						"z": myPosition.z
					},

					"rotation": {
						"x": 0,
						"y": 0,
						"z": 0
					},

					"scale": {
						"x": 1,
						"y": 1,
						"z": 1
					}
				},

				function (p) {

					// check name
					let OBJ = p.obj;

					// create MAP POI //

					UI.f.createGeoArea_POI(OBJ);

					if (callback !== undefined) {

						if (callbackprop == undefined) {

							callbackprop = {}

						}

						callbackprop.obj = p.obj;

						callback(callbackprop);

					}

				},
				{}
			);
		});
		console.log("createGeoArea");
	};




	EDITOR.f.selectProjectDown = function (p) {

		console.log('EDITOR.f.selectProjectDown');

	};



	EDITOR.f.selectProject = function (p) {

		authStore.subscribe((auth) => {
			const principal = auth.identity?.getPrincipal()?.toString();

			if (principal) {

				// controlla se utente e' lo stesso proprietario dell'area e quindi del progetto //

				if (principal == p.obj.parent.userData.linkedGeoArea.userData.user) {

					EDITOR.f.deselectProjects();

					PLY.p.selectedProject = p.obj.parent;

					console.log('SELEZIONATO');

					EDITOR.p.alreadySelected = true;

					if (PLY.p.selectedArea == undefined || PLY.p.selectedArea.uuid !== PLY.p.selectedProject.userData.linkedGeoArea.uuid) {

						EDITOR.f.deselectGeoArea();

						PLY.p.selectedArea = PLY.p.selectedProject.userData.linkedGeoArea;

						PLY.p.selectedArea.MATERIALS.geoAreaKernel_mat.color.r = 1.0;

						PLY.p.selectedArea.MATERIALS.geoAreaKernel_mat.color.g = 1.0;

						PLY.p.selectedArea.MATERIALS.geoAreaKernel_mat.color.b = 0.0;

					}


					PLY.p.selectedProject.MATERIALS.Kernel_Mesh_mat.color.r = 1.0;
					// TODO whats this for?

					PLY.p.selectedProject.MATERIALS.Kernel_Mesh_mat.color.g = 1.0;
					// TODO whats this for?

					PLY.p.selectedProject.MATERIALS.Kernel_Mesh_mat.color.b = 0.0;
					// TODO whats this for?

					PLY.p.selectedProjectName = PLY.p.selectedProject.userData.name;


					PLY.p.selectedGeoAreaName = PLY.p.selectedArea.userData.name;


					if (UI.p.scene.OBJECTS.previewProject == undefined) {

						console.warn('here',PLY.p.selectedProject);
						UI.p.scene.OBJECTS.previewProject = true;

						UI.p.previewProject.f.open(PLY.p.selectedArea, PLY.p.selectedProject);

					}

					PLY.p.flagPlayerOn = false;


				}

			}
		})

		console.log('EDITOR.f.selectProject');

	};



	EDITOR.f.deselectProjects = function (p) {

		if (PLY.p.selectedArea !== undefined) {

			if (PLY.p.selectedArea.OBJECTS.projects !== undefined) {

				for (var i = 0; i < PLY.p.selectedArea.OBJECTS.projects.children.length; i += 1) {

					PLY.p.selectedArea.OBJECTS.projects.children[i].MATERIALS.Kernel_Mesh_mat.color.r = 0.0;

					PLY.p.selectedArea.OBJECTS.projects.children[i].MATERIALS.Kernel_Mesh_mat.color.g = 0.0;

					PLY.p.selectedArea.OBJECTS.projects.children[i].MATERIALS.Kernel_Mesh_mat.color.b = 0.5;

					PLY.p.selectedArea.OBJECTS.projects.children[i].MATERIALS.Kernel_Mesh_mat.needsUpdate = true;

				}

			}

			PLY.p.selectedProject = undefined;

		}

	};



	EDITOR.f.selectGeoArea = function (p) {

		authStore.subscribe((auth) => {
			const principal = auth.identity?.getPrincipal()?.toString();

			if (principal) {
				if (principal == p.obj.parent.userData.user) {

					// diseleziona progetti in geoArea diversa da quella attuale
					if (PLY.p.selectedProject !== undefined) {

						if (p.obj.parent.uuid !== PLY.p.selectedProject.userData.linkedGeoArea.uuid) {

							EDITOR.f.deselectProjects();

						}

					}

					EDITOR.f.deselectGeoArea();

					PLY.p.selectedArea = p.obj.parent;

					PLY.p.selectedArea.MATERIALS.geoAreaKernel_mat.color.r = 1.0;

					PLY.p.selectedArea.MATERIALS.geoAreaKernel_mat.color.g = 1.0;

					PLY.p.selectedArea.MATERIALS.geoAreaKernel_mat.color.b = 0.0;


					PLY.p.flagPlayerOn = false;


					if (PLY.p.selectedArea.userData.movable && EDITOR.p.STATE == 'active') {

						EDITOR.p.action = 'dragGeoArea';

					}

				}

			}

		});


	};



	EDITOR.f.deselectGeoArea = function (p) {

		for (var i = 0; i < PLY.p.scene3D.OBJECTS.geoArea.children.length; i += 1) {

			PLY.p.scene3D.OBJECTS.geoArea.children[i].MATERIALS.geoAreaKernel_mat.color.r = 0.3;

			PLY.p.scene3D.OBJECTS.geoArea.children[i].MATERIALS.geoAreaKernel_mat.color.g = 0.3;

			PLY.p.scene3D.OBJECTS.geoArea.children[i].MATERIALS.geoAreaKernel_mat.color.b = 0.3;

			PLY.p.scene3D.OBJECTS.geoArea.children[i].MATERIALS.geoAreaKernel_mat.needsUpdate = true;

		}

		PLY.p.selectedArea = undefined;

	};



	EDITOR.f.editGeoArea = function () {

	};



	EDITOR.f.deleteGeoArea = function () {

		if (PLY.p.selectedArea !== undefined) {

			VARCO.f.deleteElement(PLY.p.scene3D.OBJECTS.geoArea, EDITOR.p.selectedArea);

			EDITOR.p.selectedArea = undefined;

		}

	};





	// INPUT - OUTPUT 

	EDITOR.f.loadProjectData = function () {


		let URL = UI.p.previewProject.p.infoProject.url;

		let PROJECTNAME = UI.p.previewProject.p.infoProject.name;

		let USER = UI.p.previewProject.p.infoArea.user;


		if (PLY.p.selectedProject !== undefined) {


			const projectFile = 'USER_DB/' + USER + '/contents/' + PROJECTNAME + '.json';


			VARCO.f.loadJSON(

				projectFile,

				function init_projectData(projectData) {


					UI.p.scene.OBJECTS.previewProject.OBJECTS.loadingProject.visible = true;

					PLY.p.selectedProject.userData.isLoaded = true;


					VARCO.f.addComplex(

						PLY.p.selectedProject.OBJECTS.myProject,

						projectData,

						function (q) {


							UI.p.scene.OBJECTS.previewProject.OBJECTS.loadingProject.visible = false;


							let idleAction;

							q.obj.traverse(function (child) {

								if (child.material !== undefined) {

									child.castShadow = true;

								}
							});


							setTimeout(

								function () {

									if (q.obj.MM3D.threeJsAnimation !== undefined) {

										for (var i = 0; i < q.obj.MM3D.threeJsAnimation.animations.length; i++) {

											idleAction = q.obj.MM3D.threeJsAnimation.mixer.clipAction(q.obj.MM3D.threeJsAnimation.animations[i]);

											idleAction.play();

										}

									}

								},

								2000

							);
						}
					);

				},

				function error_login() {

					// MOMENTANEO //
					// MOMENTANEO //
					// MOMENTANEO //

					UI.p.scene.OBJECTS.previewProject.OBJECTS.loadingProject.visible = true;

					PLY.p.selectedProject.userData.isLoaded = true;

					VARCO.f.addFromFile(

						PLY.p.selectedProject.OBJECTS.myProject,

						{
							"name": PLY.p.selectedProject.userData.name,
							"parameters": {
								"url": URL
							},
							"position": {
								"x": 0,
								"y": 0,
								"z": 0
							}
						},
						function ui_project_ready(q) {

							UI.p.scene.OBJECTS.previewProject.OBJECTS.loadingProject.visible = false;

							let idleAction;

							q.obj.traverse(function (child) {

								if (child.material !== undefined) {

									child.castShadow = true;

								}
							});

							setTimeout(

								function () {

									if (q.obj.MM3D.threeJsAnimation !== undefined) {

										for (var i = 0; i < q.obj.MM3D.threeJsAnimation.animations.length; i++) {

											idleAction = q.obj.MM3D.threeJsAnimation.mixer.clipAction(q.obj.MM3D.threeJsAnimation.animations[i]);

											idleAction.play();

										}

									}

								},

								2000

							);

						},
						{}
					);

					// MOMENTANEO //
					// MOMENTANEO //
					// MOMENTANEO //

				}

			);

		}

	};



	EDITOR.f.saveProjectData = function (user, PROJECTOBJ) {

		const projectData = {
			"name": PROJECTOBJ.name,
			"parameters": {
				"elementList": [
					{
						"type": "addFromFile",
						"prop": {
							"name": PROJECTOBJ.name,
							"parameters": {
								"type": "base64",
								"url": PROJECTOBJ.userData.stringByte64,
								"extension": PROJECTOBJ.userData.extension // "gltf"
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
			"rotation": {
				"x": 0.0,
				"y": 0.0,
				"z": 0.0
			},
			"scale": {
				"x": 1.0,
				"y": 1.0,
				"z": 1.0
			}
		};

		const textData = JSON.stringify(projectData);

		const nameFile = 'USER_DB/' + user + '/contents/' + projectData.name + '.json';

		VARCO.f.saveInfo(textData, nameFile);

	};



	EDITOR.f.saveSector = function (sectorData) {

		const textData = JSON.stringify(sectorData);

		const nameFile = 'SECTOR_DB/' + sectorData.sectorName + ".json";

		VARCO.f.saveInfo(textData, nameFile);

	};



	EDITOR.f.saveUserData = function (prop) {

		// save USERDATA // 
		// info in dowload folder:

		const textData = JSON.stringify(prop);

		const nameFile = 'USER_DB/' + prop.user + ".json";

		VARCO.f.saveInfo(textData, nameFile);

	};



	EDITOR.f.SAVE_GEOAREA = function () {

		if (PLY.p.selectedArea !== undefined) {

			let projectsList = [];

			for (var i = 0; i < PLY.p.selectedArea.OBJECTS.projects.children.length; i += 1) {

				projectsList.push(
					{
						"type": PLY.p.selectedArea.OBJECTS.projects.children[i].userData.type,
						"name": PLY.p.selectedArea.OBJECTS.projects.children[i].name,
						"url": PLY.p.selectedArea.OBJECTS.projects.children[i].userData.url,
						"urlLowres": PLY.p.selectedArea.OBJECTS.projects.children[i].userData.urlLowres,
						"myPosition": {
							"x": PLY.p.selectedArea.OBJECTS.projects.children[i].position.x,
							"y": PLY.p.selectedArea.OBJECTS.projects.children[i].position.y,
							"z": PLY.p.selectedArea.OBJECTS.projects.children[i].position.z
						},
						"myOrientation": {
							"x": VARCO.f.rad2deg(PLY.p.selectedArea.OBJECTS.projects.children[i].rotation.x),
							"y": VARCO.f.rad2deg(PLY.p.selectedArea.OBJECTS.projects.children[i].rotation.y),
							"z": VARCO.f.rad2deg(PLY.p.selectedArea.OBJECTS.projects.children[i].rotation.z)
						},
						"mySize": {
							"x": PLY.p.selectedArea.OBJECTS.projects.children[i].scale.x,
							"y": PLY.p.selectedArea.OBJECTS.projects.children[i].scale.y,
							"z": PLY.p.selectedArea.OBJECTS.projects.children[i].scale.z
						},
						"previewImage": PLY.p.selectedArea.OBJECTS.projects.children[i].userData.previewImage
					}
				)

			}

			const geoAreaInfo = {

				"id": PLY.p.selectedArea.userData.id,
				"user": PLY.p.selectedArea.userData.user,
				"geoAreaName": PLY.p.selectedArea.userData.geoAreaName,
				"sectorName": PLY.p.selectedArea.userData.sectorName,
				"myCoords": {
					"lng": PLY.p.selectedArea.userData.myCoords.lng,
					"lat": PLY.p.selectedArea.userData.myCoords.lat,
					"alt": PLY.p.selectedArea.userData.myCoords.alt,
				},
				"projectsList": projectsList

			};


			// save GEOAREA // 

			const textData = JSON.stringify(geoAreaInfo);

			const nameFile = 'USER_DB/' + PLY.p.selectedArea.userData.user + '/' + PLY.p.selectedArea.userData.geoAreaName + ".json";

			VARCO.f.saveInfo(textData, nameFile);



			// UPDATE USER DATA //

			let flagAddNewGeoArea = true;

			for (var i = 0; i < UI.p.popup_login_data.p.data.geoareaList.length; i += 1) {

				if (UI.p.popup_login_data.p.data.geoareaList[i].geoAreaName == PLY.p.selectedArea.userData.geoAreaName) {

					flagAddNewGeoArea = false;

					break;

				}

			}


			if (flagAddNewGeoArea) {

				UI.p.popup_login_data.p.data.geoareaList.push(
					{
						"geoAreaName": PLY.p.selectedArea.userData.geoAreaName,
						"myCoords": {
							"lng": PLY.p.selectedArea.userData.myCoords.lng,
							"lat": PLY.p.selectedArea.userData.myCoords.lat,
							"alt": PLY.p.selectedArea.userData.myCoords.alt
						}
					}
				);

			}


			EDITOR.f.saveUserData(UI.p.popup_login_data.p.data);

			// UPDATE USER DATA //



			// CHECK IF SECTOR EXIST //

			VARCO.f.loadJSON(

				'SECTOR_DB/' + PLY.p.selectedArea.userData.sectorName + '.json',
				function init_sectorData(sectorData) {

					// UPDATE SECTOR //
					let flagExist = false;

					for (var i = 0; i < sectorData.geoareaList.length; i += 1) {
						if (sectorData.geoareaList[i].user == PLY.p.selectedArea.userData.user) {
							if (sectorData.geoareaList[i].geoAreaName == PLY.p.selectedArea.userData.geoAreaName) {
								flagExist = true;
								break;
							}
						}
					}

					if (flagExist == false) {
						sectorData.geoareaList.push(
							{
								"user": PLY.p.selectedArea.userData.user,
								"geoAreaName": PLY.p.selectedArea.userData.geoAreaName
							}
						);
					}

					EDITOR.f.saveSector(sectorData);

				},
				function error_data() {

					// CREATE NEW SECTOR //

					const newSectorData = {
						"sectorName": PLY.p.selectedArea.userData.sectorName,
						"geoareaList": [
							{
								"user": PLY.p.selectedArea.userData.user,
								"geoAreaName": PLY.p.selectedArea.userData.geoAreaName
							}
						]
					};

					EDITOR.f.saveSector(newSectorData);

				}

			);

		}

	};




	EDITOR.f.DRAG_scale = function () {


	}



	EDITOR.f.checkDistanceOfEveryGeoArea = function () {

		// check distance with others geoArea //

		// update check only geoArea of the same sector //

		if (PLY.p.scene3D.OBJECTS.geoArea.children.length > 1) {

			PLY.p.scene3D.OBJECTS.geoArea.children[1].MATERIALS.geoAreaIntensity_mat.color.r = 0;

			PLY.p.scene3D.OBJECTS.geoArea.children[1].MATERIALS.geoAreaIntensity_mat.color.g = 1;

			PLY.p.scene3D.OBJECTS.geoArea.children[1].MATERIALS.geoAreaIntensity_mat.color.b = 1;

		}

		for (var i = 0; i < PLY.p.scene3D.OBJECTS.geoArea.children.length; i += 1) {

			PLY.p.scene3D.OBJECTS.geoArea.children[i].userData.priceBase = parseFloat(PLY.p.scene3D.OBJECTS.geoArea.children[i].userData.intensity) * 0.299;

			PLY.p.scene3D.OBJECTS.geoArea.children[i].userData.price = PLY.p.scene3D.OBJECTS.geoArea.children[i].userData.priceBase;

			let dist, distMin = 1000;

			let counter = 1;

			for (var j = 0; j < PLY.p.scene3D.OBJECTS.geoArea.children.length; j += 1) {

				if (i > j) {

					if (PLY.p.scene3D.OBJECTS.geoArea.children[i].userData.type == 'geoArea' && PLY.p.scene3D.OBJECTS.geoArea.children[j].userData.type == 'geoArea') {

						let intensity = parseFloat(PLY.p.scene3D.OBJECTS.geoArea.children[j].userData.intensity) + parseFloat(PLY.p.scene3D.OBJECTS.geoArea.children[i].userData.intensity);

						dist = PLY.p.scene3D.OBJECTS.geoArea.children[i].position.distanceTo(PLY.p.scene3D.OBJECTS.geoArea.children[j].position)


						if (dist < intensity) {

							counter = counter + 1;

							let priceQueue = PLY.p.scene3D.OBJECTS.geoArea.children[i].userData.priceBase * counter;

							let distPrice = (10 * (1 - dist / intensity));

							let totPrice = priceQueue * distPrice;


							PLY.p.scene3D.OBJECTS.geoArea.children[i].userData.price = totPrice;

							if (dist < distMin) {

								distMin = dist;

								PLY.p.scene3D.OBJECTS.geoArea.children[i].MATERIALS.geoAreaIntensity_mat.color.r = 1.0 - dist / intensity;

								PLY.p.scene3D.OBJECTS.geoArea.children[i].MATERIALS.geoAreaIntensity_mat.color.g = dist / intensity;

								PLY.p.scene3D.OBJECTS.geoArea.children[i].MATERIALS.geoAreaIntensity_mat.color.b = dist / intensity;

							}

						}

					}

				} else { }

			}

		}

	};



	EDITOR.f.DROP_FILE = function (p) {
		authStore.subscribe((auth) => {
			const principal = auth.identity?.getPrincipal()?.toString();
			const projectName = p.name.split('.')[0];

			const extension = p.name.split('.')[1];

			const sectorName = EDITOR.f.findSector({ coords: { lng: MAP.p.actualCoords.lng, lat: MAP.p.actualCoords.lat } }).name;

			// creazione nome geoarea //

			const myPosition = MAP.f.getMapPosition(MAP.p.width, MAP.p.height, MAP.p.actualCoords.lng, MAP.p.actualCoords.lat, MAP.p.actualCoords.alt);


			let type, stringByte64;



			if (EDITOR.p.dragAndDrop) {

				switch (extension) {

					case "gltf":

						let PROJECTOBJ = p.obj;


						stringByte64 = VARCO.f.arrayBufferToBase64(p.data);


						if (PLY.p.scene3D.OBJECTS[name] !== undefined) {

							name = name + '_due';

						}


						PROJECTOBJ.name = projectName;

						VARCO.f.setPropAndParameters(PROJECTOBJ, { "MM3D": {} });

						PROJECTOBJ.userData.type = 'gltf';

						PROJECTOBJ.userData.fileName = projectName;

						PROJECTOBJ.userData.extension = extension;

						PROJECTOBJ.userData.data = p.data;

						PROJECTOBJ.userData.stringByte64 = stringByte64;

						PROJECTOBJ.userData.myCoords = { 'lng': MAP.p.actualCoords.lng, 'lat': MAP.p.actualCoords.lat, 'alt': MAP.p.actualCoords.alt };



						// aggiungi ombre //

						PROJECTOBJ.traverse(

							function (child) {

								if (child.material !== undefined) {

									child.castShadow = true;

								}

							}

						);



						// start animation //

						setTimeout(

							function () {

								if (PROJECTOBJ.animations !== undefined) {

									PROJECTOBJ.MM3D = {

										threeJsAnimation: {

											mixer: new THREE.AnimationMixer(PROJECTOBJ),

											animations: PROJECTOBJ.animations

										}

									};

									let idleAction;

									for (var i = 0; i < PROJECTOBJ.animations.length; i++) {

										idleAction = PROJECTOBJ.MM3D.threeJsAnimation.mixer.clipAction(p.obj.animations[i]);

										idleAction.play();

									}

								}

							},
							2000

						);



						// DATI OGGETTO ORIGINALE DA SALVARE //

						EDITOR.f.saveProjectData(principal, PROJECTOBJ);

						// ///////////////////////////////// //



						// DATI OGGETTO ORIGINALE DA SALVARE //

						EDITOR.f.deselectProjects();

						// ///////////////////////////////// //



						// inserisci nuovo progetto in area gia' esistente //
						if (PLY.p.selectedArea !== undefined) {

							EDITOR.f.createProject(

								PLY.p.selectedArea,

								{
									"type": "---",
									"name": projectName,
									"url": "objects/" + projectName + ".gltf",
									"urlLowres": "puo' essere un path oppure un blob or una stringa , creata dal tool in automatico opera_fisica_preview.gltf",
									"myPosition": {
										"x": myPosition.x - PLY.p.selectedArea.position.x,
										"y": myPosition.y - PLY.p.selectedArea.position.y,
										"z": myPosition.z - PLY.p.selectedArea.position.z
									},
									"myOrientation": {
										"x": 0,
										"y": 0,
										"z": 0
									},
									"mySize": {
										"x": 1,
										"y": 1,
										"z": 1
									},
									"previewImage": ""
								},
								function (w) {

									// SHOW PROJECT //

									PLY.p.selectedProject = w.obj;

									if (PLY.p.selectedProject) {
										w.obj.userData.isLoaded = true;
										w.obj.OBJECTS.myProject.add(PROJECTOBJ);
										w.obj.OBJECTS.myProject.OBJECTS[PROJECTOBJ.name];
									}

								},
								{}

							);

						} else {

							// crea nuova area ed inserisci nuovo progetto //

							const geoAreaName = VARCO.f.generateUUID();

							EDITOR.f.createGeoArea(
								{
									"user": principal,
									"geoAreaName": geoAreaName,
									"sectorName": sectorName,
									"myCoords": {
										"lng": MAP.p.actualCoords.lng,
										"lat": MAP.p.actualCoords.lat,
										"alt": MAP.p.actualCoords.alt
									}
								},
								function (q) {

									// insert area in sector:

									PLY.p.selectedArea = q.obj;

									EDITOR.f.createProject(

										PLY.p.selectedArea,

										{
											"type": "---",
											"name": projectName,
											"url": "objects/" + projectName + ".gltf",
											"urlLowres": "puo' essere un path oppure un blob or una stringa , creata dal tool in automatico opera_fisica_preview.gltf",
											"myPosition": {
												"x": myPosition.x - PLY.p.selectedArea.position.x,
												"y": myPosition.y - PLY.p.selectedArea.position.y,
												"z": myPosition.z - PLY.p.selectedArea.position.z
											},
											"myOrientation": {
												"x": 0,
												"y": 0,
												"z": 0
											},
											"mySize": {
												"x": 1,
												"y": 1,
												"z": 1
											},
											"previewImage": ""
										},
										function (w) {

											// SHOW PROJECT //

											PLY.p.selectedProject = w.obj;

											if (PROJECTOBJ) {
												w.obj.userData.isLoaded = true;
												w.obj.OBJECTS.myProject.add(PROJECTOBJ);
												w.obj.OBJECTS.myProject.OBJECTS[PROJECTOBJ.name];
											}

											// update user geoList //

											UI.p.popup_login_data.p.data.geoareaList.push(

											);

										},
										{}

									);

								},
								{}
							);

						}

						break;


					case "png":

						// // console.log( p );

						// console.log( p.data.width );

						// VARCO.f.addComplex(
						// PLY.p.scene3D,
						// {
						// "name" : name,
						// "parameters" : {
						// "textureList" : [
						// {
						// "name" : name,
						// "type" : "base64",
						// "url" : p.data
						// }
						// ],
						// "materialList" : [
						// {
						// "name" : name,
						// "type" : "MeshBasicMaterial",
						// "parameters" : {
						// "textures" : { "map" : name },
						// "side" : "THREE.DoubleSide"
						// }
						// }
						// ],
						// "elementList" : [
						// {
						// "type" : "addMesh",
						// "prop" : {
						// "type" : "PlaneGeometry",
						// "name" : name,
						// "materialList" : [ name ],
						// "castShadow" : true,
						// "parameters" : {
						// "width" : 1,
						// "height" : 1
						// }
						// }
						// }
						// ]

						// },


						// },
						// function( p ){

						// p.obj.name = name;

						// let width = p.obj.TEXTURES[ name ].image.width * 0.001;

						// let height = p.obj.TEXTURES[ name ].image.height * 0.001;

						// p.obj.OBJECTS[ name ].scale.x = width;

						// p.obj.OBJECTS[ name ].scale.y = height;

						// p.obj.OBJECTS[ name ].position.y = ( height * 0.6 );


						// p.obj.userData.type = '3d';

						// p.obj.userData.fileName = name;

						// p.obj.userData.extension = extension;

						// p.obj.userData.data = p.data;

						// p.obj.userData.myCoords = { 'lng': MAP.p.actualCoords.lng, 'lat': MAP.p.actualCoords.lat , 'alt': 0.0 };


						// PLY.f.createGeoArea( 

						// MAP.p.actualCoords.lng,

						// MAP.p.actualCoords.lat,

						// true, 

						// undefined,

						// function( q ){

						// // insert area in sector:

						// PLY.p.selectedArea = q.obj;

						// p.obj.position.x = PLY.p.selectedArea.position.x;

						// p.obj.position.y = PLY.p.selectedArea.position.y;

						// p.obj.position.z = PLY.p.selectedArea.position.z;

						// p.obj.scale.x = 1.0;

						// p.obj.scale.y = 1.0;

						// p.obj.scale.z = 1.0;

						// PLY.p.selectedArea.userData.projectsList.push( { name: p.obj.name , uuid: p.obj.uuid } );

						// PLY.p.scene3D.add( p.obj );

						// PLY.p.scene3D.OBJECTS[ p.obj.name ];


						// if ( PLY.p.selectedArea.userData.locked ){

						// PLY.p.selectedArea.attach( p.obj );

						// };

						// },
						// {}

						// );

						// },
						// {}

						// );

						break;


					case "jpg":

						// console.log( p );

						break;

				}

			}
		});
	};

	return EDITOR;
};

const EDITORSingleton = (function () {
	let instance;
	function createInstance() {
		return createEditor();
	}
	return {
		getInstance: function () {
			if (!instance) instance = createInstance();
			return instance;
		},
	};
})();


// export default getEditorInstance;
export default EDITORSingleton;
