/* eslint-disable no-global-assign */
/* eslint-disable no-case-declarations */
/* eslint-disable no-empty */
/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */
/* eslint-disable no-duplicate-case */

// UI MODULE
import { get } from 'svelte/store';
import * as THREE from 'three';
import { VARCO } from "../VARCO/helpers/VARCO.js";
import { authStore } from '../store/AuthStore';
import { projectStore } from '../store/ProjectStore';
import UISingleton from './extensa_ui.js';
import { MAP, PLY } from "./index.js";

import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'; // <<<<<<<<<<<<<<<<
import { SimplifyModifier } from 'three/addons/modifiers/SimplifyModifier.js'; // <<<<<<<<<<<<<<<<
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js'; // <<<<<<<<<<<<<<<<
import { loadProjectWorker } from '../actions/loadProject.action';
import { messageStore } from '../store/MessageStore';
import { spinnerStore } from '../store/SpinnerStore';
import { getProject } from '../utils/indexedDB/getSaveEmpty';
// import { MeshoptDecoder } from 'three/libs/meshopt_decoder.module'; // <<<<<<<<<<<<<<<<


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



	EDITOR.f.createGeoAreaHelpers = async (projectData) => {
		try {
			const geoAreaDatas = {
				projectsList: [projectData],
				geoAreaName: PLY.p.selectedArea.userData.geoAreaName,
				myCoords: PLY.p.selectedArea.userData.myCoords
			}
			projectStore.setGeoAreaToEdit(geoAreaDatas);
		} catch (e) {
			console.error(e);
		}
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
								"color": { "r": 0.0, "g": 0.0, "b": 0.5 },
								"transparent": true,
								"opacity": 0.8,
								"alphaTest": 0.5,
								"visible": true,
								"depthTest": false,
								"depthWrite": false
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
							"type": "addMesh",
							"prop": {
								"name": "boxAltitude",
								"type": "BoxGeometry",
								"parameters": { "width": 0.2, "height": 1.0, "depth": 0.2 },

								"MM3D": {

									"helper": {
										"edges": {
											"color": { "r": 0.0, "g": 0.0, "b": 0.0 }
										}
									},

									"scriptList": [
										{
											"loop": true,
											"function": function helper_altitude(p) {

												if (p.obj.parent.position.y > 0.0) {

													p.obj.position.y = (p.obj.parent.position.y * 0.5 * -1) + 0.1;

													p.obj.scale.y = p.obj.parent.position.y;

												} else {

													p.obj.position.x = 0;

													p.obj.position.y = 0;

													p.obj.position.z = 0;

													p.obj.scale.y = 0.01;

												}
											},
											"functionProp": {}
										}
									]
								}
							}
						},

						{
							"type": "addComplex",
							"prop": {
								"name": "myProject"
							}
						},

						{
							"type": "addComplex",
							"prop": {
								"name": "myProjectCloned"
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
		const auth = get(authStore);
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
								"visible": true,
								"depthTest": false,
								"depthWrite": false
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

				OBJ.userData.projectsList = [];

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
		console.log("createGeoArea");
	};




	EDITOR.f.selectProjectDown = function (p) {

		console.log('EDITOR.f.selectProjectDown');

		projectStore.setProject(null); // scrivi dato

	};



	EDITOR.f.selectProject = function (p) {
		console.log('EDITOR.f.selectProject');

		const auth = get(authStore);
		const principal = auth.identity?.getPrincipal()?.toString();

		if (principal) {

			// controlla se utente e' lo stesso proprietario dell'area e quindi del progetto //

			const _user = p.obj.parent.userData.linkedGeoArea.userData.user?.[0]?.toString() || p.obj.parent.userData.linkedGeoArea.userData.user?.toString();
			if (principal == _user) {

				EDITOR.f.deselectProjects();

				projectStore.setProject(p.obj.parent); // scrivi dato

				const { project: _selectedProject } = get(projectStore); // leggi dato

				console.log(_selectedProject.name);

				console.log('SELEZIONATO');

				// EDITOR.p.alreadySelected = true;

				if (PLY.p.selectedArea == undefined || PLY.p.selectedArea.uuid !== p.obj.parent.userData.linkedGeoArea.uuid) {

					EDITOR.f.deselectGeoArea();

					PLY.p.selectedArea = p.obj.parent.userData.linkedGeoArea;

					PLY.p.selectedArea.MATERIALS.geoAreaKernel_mat.color.r = 1.0;

					PLY.p.selectedArea.MATERIALS.geoAreaKernel_mat.color.g = 1.0;

					PLY.p.selectedArea.MATERIALS.geoAreaKernel_mat.color.b = 0.0;

				}


				p.obj.parent.MATERIALS.Kernel_Mesh_mat.color.r = 1.0;

				p.obj.parent.MATERIALS.Kernel_Mesh_mat.color.g = 1.0;

				p.obj.parent.MATERIALS.Kernel_Mesh_mat.color.b = 0.0;


				PLY.p.flagPlayerOn = false;

			}

		}


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

			// PLY.p.selectedProject = undefined;

			projectStore.setProject(null); // scrivi dato NULL

		}

	};



	EDITOR.f.selectGeoArea = function (p) {

		const auth = get(authStore);
		const principal = auth.identity?.getPrincipal()?.toString();

		if (principal) {
			if (principal == p.obj.parent.userData.user?.[0]?.toString()) {

				// diseleziona progetti in geoArea diversa da quella attuale
				const { project: _selectedProject } = get(projectStore); // leggi dato

				if (_selectedProject !== null) {

					if (p.obj.parent.uuid !== _selectedProject.userData.linkedGeoArea.uuid) {

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

			// rimuovi POI //
			for (var numA = 0; numA < UI.p.scene.OBJECTS.poi.children.length; numA += 1) {

				if (EDITOR.p.selectedArea.uuid == UI.p.scene.OBJECTS.poi.children[numA].userData.linkedObj.uuid) {

					VARCO.f.deleteElement(UI.p.scene.OBJECTS.poi, UI.p.scene.OBJECTS.poi.children[numA]);

				};

			};

			VARCO.f.deleteElement(PLY.p.scene3D.OBJECTS.geoArea, EDITOR.p.selectedArea);

			EDITOR.p.selectedArea = undefined;

		};

	};



	// INPUT - OUTPUT 

	EDITOR.f.loadProjectData = async function (overridedFile = "") {
		try {
			const { project: _selectedProject } = get(projectStore);

			if (_selectedProject !== null) {
				let finalFile = "";
				if (!overridedFile) {
					const fileId = _selectedProject?.userData?.file_id;
					if (fileId) {
						projectStore.setLoadProjectProgress(20);
						const cachedProject = await getProject(`project-${fileId.toString()}`);

						if (!cachedProject) {
							loadProjectWorker.postMessage({
								msg: "executeLoadProjectWorker",
								data: {
									fileId,
								},
							});
							return;
						} else {
							finalFile = cachedProject;
							projectStore.setLoadProjectProgress(100);
							setTimeout(() => {
								projectStore.setLoadProjectProgress(0);

							}, 1000);
						}
					}
				} else {
					finalFile = overridedFile;
				}


				const projectData = JSON.parse(finalFile);

				const geoArea = _selectedProject.userData.linkedGeoArea

				geoArea.OBJECTS.projects.children.forEach(
					function (child) {
						if (child.uuid == _selectedProject.uuid) {
							child.userData.isLoaded = true;
						}
					}
				);

				VARCO.f.addComplex(
					_selectedProject.OBJECTS.myProject,
					projectData,
					function (q) {

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

			}
		} catch (e) {
			console.error(e);
		} finally {
			spinnerStore.setLoading(false);
		}
	};



	EDITOR.f.saveProjectData = async function (user, PROJECTOBJ) {

		let projectData;

		switch (PROJECTOBJ.userData.type) {

			case '3d':

				console.log(PROJECTOBJ.OBJECTS[PROJECTOBJ.name])

				projectData = {
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
						"x": PROJECTOBJ.OBJECTS[PROJECTOBJ.name].position.x,
						"y": PROJECTOBJ.OBJECTS[PROJECTOBJ.name].position.y,
						"z": PROJECTOBJ.OBJECTS[PROJECTOBJ.name].position.z
					},
					"rotation": {
						"x": VARCO.f.rad2deg(PROJECTOBJ.OBJECTS[PROJECTOBJ.name].rotation.x),
						"y": VARCO.f.rad2deg(PROJECTOBJ.OBJECTS[PROJECTOBJ.name].rotation.y),
						"z": VARCO.f.rad2deg(PROJECTOBJ.OBJECTS[PROJECTOBJ.name].rotation.z)
					},
					"scale": {
						"x": PROJECTOBJ.OBJECTS[PROJECTOBJ.name].scale.x,
						"y": PROJECTOBJ.OBJECTS[PROJECTOBJ.name].scale.y,
						"z": PROJECTOBJ.OBJECTS[PROJECTOBJ.name].scale.z
					}
				};

				break;


			case 'glb':

				console.log(PROJECTOBJ)

				projectData = {
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
						"x": PROJECTOBJ.OBJECTS[PROJECTOBJ.name].position.x,
						"y": PROJECTOBJ.OBJECTS[PROJECTOBJ.name].position.y,
						"z": PROJECTOBJ.OBJECTS[PROJECTOBJ.name].position.z
					},
					"rotation": {
						"x": VARCO.f.rad2deg(PROJECTOBJ.OBJECTS[PROJECTOBJ.name].rotation.x),
						"y": VARCO.f.rad2deg(PROJECTOBJ.OBJECTS[PROJECTOBJ.name].rotation.y),
						"z": VARCO.f.rad2deg(PROJECTOBJ.OBJECTS[PROJECTOBJ.name].rotation.z)
					},
					"scale": {
						"x": PROJECTOBJ.OBJECTS[PROJECTOBJ.name].scale.x,
						"y": PROJECTOBJ.OBJECTS[PROJECTOBJ.name].scale.y,
						"z": PROJECTOBJ.OBJECTS[PROJECTOBJ.name].scale.z
					}
				};

				break;

			case 'image':

				console.log(PROJECTOBJ)

				projectData = {
					"name": PROJECTOBJ.name,
					"parameters": {
						"textureList": [
							{
								"name": PROJECTOBJ.name,
								"type": "base64",
								"url": PROJECTOBJ.userData.stringByte64
							}
						],
						"materialList": [
							{
								"name": PROJECTOBJ.name,
								"type": "MeshBasicMaterial",
								"parameters": {
									"textures": { "map": PROJECTOBJ.name },
									"side": "THREE.DoubleSide"
								}
							}
						],
						"elementList": [
							{
								"type": "addMesh",
								"prop": {
									"type": "PlaneGeometry",
									"name": PROJECTOBJ.name,
									"materialList": [PROJECTOBJ.name],
									"castShadow": true,
									"parameters": {
										"width": 1,
										"height": 1
									}
								}
							}
						]

					},
					"position": {
						"x": PROJECTOBJ.OBJECTS[PROJECTOBJ.name].position.x,
						"y": PROJECTOBJ.OBJECTS[PROJECTOBJ.name].position.y,
						"z": PROJECTOBJ.OBJECTS[PROJECTOBJ.name].position.z
					},
					"rotation": {
						"x": VARCO.f.rad2deg(PROJECTOBJ.OBJECTS[PROJECTOBJ.name].rotation.x),
						"y": VARCO.f.rad2deg(PROJECTOBJ.OBJECTS[PROJECTOBJ.name].rotation.y),
						"z": VARCO.f.rad2deg(PROJECTOBJ.OBJECTS[PROJECTOBJ.name].rotation.z)
					},
					"scale": {
						"x": PROJECTOBJ.OBJECTS[PROJECTOBJ.name].scale.x,
						"y": PROJECTOBJ.OBJECTS[PROJECTOBJ.name].scale.y,
						"z": PROJECTOBJ.OBJECTS[PROJECTOBJ.name].scale.z
					}

				};

				break;


			case 'video':

				console.log(PROJECTOBJ)

				projectData = {
					"name": PROJECTOBJ.name,
					"parameters": {
						"textureList": [
							{
								"name": PROJECTOBJ.name,
								"type": "videoBase64",
								"url": PROJECTOBJ.userData.stringByte64
							}
						],
						"materialList": [
							{
								"name": PROJECTOBJ.name,
								"type": "MeshBasicMaterial",
								"parameters": {
									"textures": { "map": PROJECTOBJ.name },
									"side": "THREE.DoubleSide"
								}
							}
						],
						"elementList": [
							{
								"type": "addMesh",
								"prop": {
									"type": "PlaneGeometry",
									"name": PROJECTOBJ.name,
									"materialList": [PROJECTOBJ.name],
									"castShadow": true,
									"parameters": {
										"width": 1,
										"height": 1
									}
								}
							}
						]

					},
					"position": {
						"x": PROJECTOBJ.OBJECTS[PROJECTOBJ.name].position.x,
						"y": PROJECTOBJ.OBJECTS[PROJECTOBJ.name].position.y,
						"z": PROJECTOBJ.OBJECTS[PROJECTOBJ.name].position.z
					},
					"rotation": {
						"x": VARCO.f.rad2deg(PROJECTOBJ.OBJECTS[PROJECTOBJ.name].rotation.x),
						"y": VARCO.f.rad2deg(PROJECTOBJ.OBJECTS[PROJECTOBJ.name].rotation.y),
						"z": VARCO.f.rad2deg(PROJECTOBJ.OBJECTS[PROJECTOBJ.name].rotation.z)
					},
					"scale": {
						"x": PROJECTOBJ.OBJECTS[PROJECTOBJ.name].scale.x,
						"y": PROJECTOBJ.OBJECTS[PROJECTOBJ.name].scale.y,
						"z": PROJECTOBJ.OBJECTS[PROJECTOBJ.name].scale.z
					}

				};

				break;

		}

		console.log(projectData)

		const textData = JSON.stringify(projectData);

	};



	EDITOR.f.saveSector = function (sectorData) {

		const textData = JSON.stringify(sectorData);

		const nameFile = 'SECTOR_DB/' + sectorData.sectorName + ".json";

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

			// const textData = JSON.stringify(geoAreaInfo);

			// const nameFile = 'USER_DB/' + PLY.p.selectedArea.userData.user + '/' + PLY.p.selectedArea.userData.geoAreaName + ".json";

			// TODO EDIT PROJECT HERE AND SEND TO BLOCKCHAIN
			// projectStore.setGeoAreaToEdit(geoAreaInfo);


		};


		// UI.p.menu_optimizer.f.button_save_gltf();

		const { project: _selectedProject } = get(projectStore); // leggi dato
		if (_selectedProject !== null) {
			UI.p.menu_optimizer.f.button_save_gltf();
		}
		// const { project: _selectedProject } = get(projectStore); // leggi dato

		// if (_selectedProject !== null) {

		// if (_selectedProject.OBJECTS.myProject.children.length > 0) {

		// // console.log( _selectedProject.userData.type );

		// if (_selectedProject.OBJECTS.myProjectCloned.children.length > 0) {

		// switch (_selectedProject.userData.type) {

		// case "3d":
		// EDITOR.f.exportGLTF(_selectedProject.OBJECTS.myProjectCloned.children[0]); // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

		// break;

		// case "glb":
		// EDITOR.f.exportGLB(_selectedProject.OBJECTS.myProjectCloned.children[0]); // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

		// break;

		// case "video":
		// EDITOR.f.exportVIDEO(_selectedProject.OBJECTS.myProjectCloned.children[0]); // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

		// break;

		// default:

		// EDITOR.f.exportGLTF(_selectedProject.OBJECTS.myProjectCloned.children[0]); // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

		// break;
		// };


		// } else {

		// switch (_selectedProject.userData.type) {

		// case "3d":
		// EDITOR.f.exportGLTF(_selectedProject.OBJECTS.myProject.children[0]); // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

		// break;

		// case "glb":
		// EDITOR.f.exportGLB(_selectedProject.OBJECTS.myProject.children[0]); // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

		// break;

		// case "video":
		// EDITOR.f.exportVIDEO(_selectedProject.OBJECTS.myProject.children[0]); // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

		// break;

		// default:

		// EDITOR.f.exportGLTF(_selectedProject.OBJECTS.myProject.children[0]); // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

		// break;

		// };

		// }

		// };

		// };

	};




	// EDITOR.f.DRAG_scale = function () {


	// }



	EDITOR.f.findSector = function (prop) {

		let coords;

		let lng, lat;


		if (prop.position !== undefined) { // vector xyz

			coords = MAP.f.getMapCoords(MAP.p.width, MAP.p.height, prop.position, MAP.p.actualCoords.alt);

			lng = coords.lng;

			lat = coords.lat;

		};


		if (prop.coords !== undefined) { // { lng: , lat:, alt: }

			lng = prop.coords.lng;

			lat = prop.coords.lat;

		};


		let sectorHV = PLY.p.geoMapSectors.actualSectHV = PLY.f.findGeoAreaSector(lng, lat, PLY.p.geoMapSectors.maxNumSectH, PLY.p.geoMapSectors.maxNumSectV);


		let stringH = PLY.f.fromNumToStringWithZero(sectorHV[0]);

		let stringV = PLY.f.fromNumToStringWithZero(sectorHV[1]);

		let sectorName = "Sect_" + stringH + "_" + stringV;

		// console.log( sectorName );

		return { "name": sectorName, "num": sectorHV };

	};



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
		try {
			spinnerStore.setLoading(true);
			function objectReady(PROJECTOBJ, projectName, type, infoJson) {
				try {
					console.log(PROJECTOBJ)

					PROJECTOBJ.name = projectName;

					if (type !== "json") {

						VARCO.f.setPropAndParameters(PROJECTOBJ, { "MM3D": {} });

						PROJECTOBJ.userData.data = p.data;

						PROJECTOBJ.userData.stringByte64 = stringByte64;

					} else {
						type = infoJson.userData.type;

						extension = infoJson.userData.extension;

						PROJECTOBJ.userData.fromJson = true;

					};


					PROJECTOBJ.userData.type = type;

					PROJECTOBJ.userData.fileName = projectName;

					PROJECTOBJ.userData.extension = extension;

					PROJECTOBJ.userData.myCoords = { 'lng': MAP.p.actualCoords.lng, 'lat': MAP.p.actualCoords.lat, 'alt': MAP.p.actualCoords.alt };


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

								};

							};

						},
						2000

					);

					// aggiungi ombre //

					PROJECTOBJ.traverse(

						function (child) {

							if (child.material !== undefined) {

								child.castShadow = true;

							}

						}

					);


					// CANCELLA E PREPARA NUOVO PROGETTO //

					EDITOR.f.deselectProjects();

					// ///////////////////////////////// //


					// inserisci nuovo progetto in area gia' esistente //
					if (PLY.p.selectedArea !== undefined) {

						EDITOR.f.createProject(

							PLY.p.selectedArea,

							{
								"type": type,
								"name": projectName,
								"url": "objects/" + projectName + "." + extension, // <<<<<<<<<<<<<<<
								"urlLowres": "",
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

								projectStore.setProject({ ...w.obj, notYetSaved: true, is3DVisible: true }); // scrivi dato

								if (PROJECTOBJ) {
									w.obj.userData.isLoaded = true;
									w.obj.OBJECTS.myProject.add(PROJECTOBJ);
									w.obj.OBJECTS.myProject.OBJECTS[PROJECTOBJ.name];
								};

								PLY.p.selectedArea.userData.projectsList.push(PROJECTOBJ);

							},
							{}

						);

					} else {

						// crea nuova area ed inserisci nuovo progetto //

						const geoAreaName = VARCO.f.generateUUID();
						const auth = get(authStore);
						const principal = auth.identity?.getPrincipal();


						EDITOR.f.createGeoArea(
							{
								"geoAreaName": geoAreaName,
								"sectorName": sectorName,
								"user": principal,
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
										"type": type,
										"name": projectName,
										"url": "objects/" + projectName + "." + extension,
										"urlLowres": "",
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

										// PLY.p.selectedProject = w.obj;

										projectStore.setProject({ ...w.obj, notYetSaved: true, is3DVisible: true }); // scrivi dato

										spinnerStore.setLoading(false);
										if (PROJECTOBJ) {
											w.obj.userData.isLoaded = true;
											w.obj.OBJECTS.myProject.add(PROJECTOBJ);
											w.obj.OBJECTS.myProject.OBJECTS[PROJECTOBJ.name];
										};

										// update user geoList //

										// UI.p.popup_login_data.p.data.geoareaList.push(
										// 	PLY.p.selectedArea
										// );

										PLY.p.selectedArea.userData.projectsList.push(PROJECTOBJ);

									},
									{}

								);

							},
							{}
						);

					};

					UI.p.menu_optimizer.f.open();
				} catch (e) {
					console.error(e);
					messageStore.setMessage('The uploaded file format is not supported. Please choose a valid file format.', 'error');
					spinnerStore.setLoading(false);
				}
			};



			const auth = get(authStore);

			const principal = auth.identity?.getPrincipal()?.toString();

			const projectName = p.name.split('.')[0];

			let extension = p.name.split('.')[1];

			const sectorName = EDITOR.f.findSector({ coords: { lng: MAP.p.actualCoords.lng, lat: MAP.p.actualCoords.lat } }).name;

			// creazione nome geoarea //

			const myPosition = MAP.f.getMapPosition(MAP.p.width, MAP.p.height, MAP.p.actualCoords.lng, MAP.p.actualCoords.lat, MAP.p.actualCoords.alt);


			let type, stringByte64, PROJECTOBJ;


			if (EDITOR.p.dragAndDrop) {

				switch (extension) {

					case "gltf":

						PROJECTOBJ = p.obj;

						stringByte64 = VARCO.f.arrayBufferToBase64(p.data);


						if (PLY.p.scene3D.OBJECTS[name] !== undefined) {

							name = name + '_due';

						};

						objectReady(PROJECTOBJ, projectName, '3d');


						break;

					case "glb":

						PROJECTOBJ = p.obj;

						stringByte64 = VARCO.f.arrayBufferToBase64(p.data);


						if (PLY.p.scene3D.OBJECTS[name] !== undefined) {

							name = name + '_due';

						};


						objectReady(PROJECTOBJ, projectName, 'glb');


						break;


					case "png":

						console.log(p);

						console.log(p.obj.width);

						VARCO.f.addComplex(
							PLY.p.scene3D,
							{
								"name": projectName,
								"parameters": {
									"textureList": [
										{
											"name": projectName,
											"type": "base64",
											"url": p.data
										}
									],
									"materialList": [
										{
											"name": projectName,
											"type": "MeshBasicMaterial",
											"parameters": {
												"textures": { "map": projectName },
												"side": "THREE.DoubleSide"
											}
										}
									],
									"elementList": [
										{
											"type": "addMesh",
											"prop": {
												"type": "PlaneGeometry",
												"name": projectName,
												"materialList": [projectName],
												"castShadow": true,
												"parameters": {
													"width": p.obj.width * 0.01,
													"height": p.obj.height * 0.01,
												}
											}
										}
									]

								},
								"position": {
									"x": 0.0,
									"y": p.obj.height * 0.01 * 0.5,
									"z": 0.0
								}

							},
							function (q) {

								PROJECTOBJ = q.obj;

								objectReady(PROJECTOBJ, projectName, 'image');

							},
							{}

						);

						break;


					case "jpg":

						console.log(p);

						console.log(p.obj.width);

						VARCO.f.addComplex(
							PLY.p.scene3D,
							{
								"name": projectName,
								"parameters": {
									"textureList": [
										{
											"name": projectName,
											"type": "base64",
											"url": p.data
										}
									],
									"materialList": [
										{
											"name": projectName,
											"type": "MeshBasicMaterial",
											"parameters": {
												"textures": { "map": projectName },
												"side": "THREE.DoubleSide"
											}
										}
									],
									"elementList": [
										{
											"type": "addMesh",
											"prop": {
												"type": "PlaneGeometry",
												"name": projectName,
												"materialList": [projectName],
												"castShadow": true,
												"parameters": {
													"width": p.obj.width * 0.01,
													"height": p.obj.height * 0.01,
												}
											}
										}
									]

								},
								"position": {
									"x": 0.0,
									"y": p.obj.height * 0.01 * 0.5,
									"z": 0.0
								}

							},
							function (q) {

								PROJECTOBJ = q.obj;

								objectReady(PROJECTOBJ, projectName, 'image');

							},

							{}

						);

						break;

					case "mp4":

						console.log(p);

						VARCO.f.addComplex(

							PLY.p.scene3D,

							{
								"name": projectName,
								"parameters": {
									"textureList": [
										{
											"name": projectName,
											"type": "videoBase64",
											"url": p.data
										}
									],
									"materialList": [
										{
											"name": projectName,
											"type": "MeshBasicMaterial",
											"parameters": {
												"textures": { "map": projectName },
												"side": "THREE.DoubleSide"
											}
										}
									],
									"elementList": [
										{
											"type": "addMesh",
											"prop": {
												"type": "PlaneGeometry",
												"name": projectName,
												"materialList": [projectName],
												"castShadow": true,
												"parameters": {
													"width": 4,
													"height": 2.5,
												}
											}
										}
									]

								},
								"position": {
									"x": 0.0,
									"y": 1.3,
									"z": 0.0
								}

							},
							function (q) {

								PROJECTOBJ = q.obj;

								objectReady(PROJECTOBJ, projectName, 'video');

							},
							{}

						);

						break;


					case "json":

						console.log(p);

						VARCO.f.addComplex(

							PLY.p.scene3D,

							p.obj,

							function (q) {

								PROJECTOBJ = q.obj;

								console.log(PROJECTOBJ);

								objectReady(PROJECTOBJ, projectName, 'json', p.obj);

							},
							{}
						)

						break;


				};

			};
		} catch (e) {
			console.error(e);
			messageStore.setMessage('The uploaded file format is not supported. Please choose a valid file format.', 'error');
			spinnerStore.setLoading(false);
		}
	};



	// /////////////////////////////// JJJ 


	// EDITOR.f.optimizerTextures( PLY.p.selectedProject.OBJECTS.myProject.children[ 0 ], 0.5, function(p){ console.log( p ) }, {} );

	EDITOR.f.optimizerTextures = function (SOURCEOBJ, valueTextures, callback, callbackprop) {

		let OBJ = SOURCEOBJ.clone();

		const { project: _selectedProject } = get(projectStore); // leggi dato

		OBJ.traverse(function (child) {

			if (child.isMesh) {

				child.material = child.material.clone();

			}

		});

		// const OBJ = cloneDeep(SOURCEOBJ);

		if (_selectedProject.OBJECTS.myProjectCloned.children.length > 0) {

			VARCO.f.deleteElement(_selectedProject.OBJECTS.myProjectCloned, _selectedProject.OBJECTS.myProjectCloned.children[0]);

		};

		_selectedProject.OBJECTS.myProjectCloned.OBJECTS[OBJ.name];

		_selectedProject.OBJECTS.myProjectCloned.add(OBJ);

		SOURCEOBJ.visible = false;

		OBJ.visible = true;

		const exporter = new GLTFExporter();

		const textureTypeList = [
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
		];

		let maxResizeWidth = 4096;

		let maxResizeHeight = 4096;

		let textureToResizeList = [];


		OBJ.traverse(

			function (child) {

				if (child.material !== undefined) {

					textureTypeList.forEach(

						function (textureType) {

							if (child.material[textureType] !== null && child.material[textureType] !== undefined) {

								child.material[textureType].flipY = true;

								child.material[textureType].name = child.material[textureType].name + '_' + textureType;

								textureToResizeList.push(
									{
										childOriginal: child,

										textureOriginal: child.material[textureType],

										materialOriginal: child.material,

										textureType: textureType

									}
								);

							};

						}

					);

				};

			}

		);


		console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');

		console.log(textureToResizeList);

		console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');


		let COUNTER = 0;

		let FlipY = true;

		console.log(textureToResizeList);

		let textureImage, type;

		function resizeTexture(textureToResizeList) {

			if (textureToResizeList[COUNTER].textureOriginal.image !== undefined) {

				textureImage = textureToResizeList[COUNTER].textureOriginal.image;

				type = 'image';

				FlipY = true;

			} else {

				textureImage = textureToResizeList[COUNTER].textureOriginal.source.data;

				type = 'embedded';

				FlipY = true;

			};


			textureToResizeList[COUNTER].textureImageOriginal = textureImage;


			const canvasOriginal = document.createElement('canvas');

			const ctxOriginal = canvasOriginal.getContext('2d');


			ctxOriginal.imageSmoothingEnabled = true;

			ctxOriginal.imageSmoothingQuality = 'high';

			canvasOriginal.width = textureImage.width;

			canvasOriginal.height = textureImage.height;


			// Flip the image
			ctxOriginal.save(); // Save the current state

			// Step 2: Translate the context to image width
			ctxOriginal.translate(0, textureImage.height);

			// Step 3: Scale the context horizontally by -1
			ctxOriginal.scale(1, -1);

			// Step 4: Draw the image at the translated point
			ctxOriginal.drawImage(textureImage, 0, 0, textureImage.width, textureImage.height, 0, 0, textureImage.width, textureImage.height);

			ctxOriginal.restore(); // Restore the context to its original state


			canvasOriginal.toBlob(

				function (blobPreviewOriginal) {

					// salva nello zip le immagini originali //
					//PLY.p.zipImage.file( "texturesOriginali/" + "image_" + COUNTER + ".png", blobPreviewOriginal, {binary:true} );

					const canvasLowres = document.createElement('canvas');

					const ctxLowres = canvasLowres.getContext('2d');

					ctxLowres.imageSmoothingEnabled = true;

					ctxLowres.imageSmoothingQuality = 'high';

					ctxLowres.willReadFrequently = true;


					// Flip the image
					ctxLowres.save(); // Save the current state

					let resizeWidth;

					let resizeHeight;

					// reduction of the textures //

					// dynamic smart reduction of the textures //
					const reductionSize = [8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096];


					let propValH = 1

					let propValV = 1


					if (textureImage.width > textureImage.height) {

						propValV = textureImage.height / textureImage.width;

					} else {

						propValH = textureImage.width / textureImage.height;

					};


					let textureSizeH = Math.floor(textureImage.width * propValH * valueTextures);

					let textureSizeV = Math.floor(textureImage.height * propValV * valueTextures);


					// width //
					for (var ws = 0; ws < reductionSize.length; ws++) {

						if (reductionSize[ws] < maxResizeWidth) {

							if (textureSizeH < reductionSize[ws]) {

								resizeWidth = reductionSize[ws];

								break;

							};

						} else {

							resizeWidth = maxResizeWidth;

							break;

						};

					};


					// height //
					for (var hs = 0; hs < reductionSize.length; hs++) {

						if (reductionSize[hs] < maxResizeHeight) {

							if (textureSizeV < reductionSize[hs]) {

								resizeHeight = reductionSize[hs];

								break;

							};

						} else {

							resizeHeight = maxResizeHeight;

							break;

						};

					};


					console.log(resizeWidth, resizeHeight);

					canvasLowres.width = resizeWidth;

					canvasLowres.height = resizeHeight;


					// Flip the image
					ctxLowres.save(); // Save the current state

					// Step 2: Translate the context to image width
					ctxLowres.translate(0, resizeHeight);

					// Step 3: Scale the context horizontally by -1
					ctxLowres.scale(1, -1);

					// Step 4: Draw the image at the translated point
					ctxLowres.drawImage(textureImage, 0, 0, textureImage.width, textureImage.height, 0, 0, resizeWidth, resizeHeight);

					ctxLowres.restore(); // Restore the context to its original state


					canvasLowres.toBlob(

						function (blobPreviewLowres) {

							textureToResizeList[COUNTER].textureImageCompressed = canvasLowres.toDataURL();

							textureToResizeList[COUNTER].textureCompressed = '';

							VARCO.f.addTexture(

								_selectedProject.OBJECTS.myProject,

								{
									"name": textureToResizeList[COUNTER].textureOriginal.name,
									"type": "base64",
									"url": textureToResizeList[COUNTER].textureImageCompressed,
									"parameters": {
										"encoding": "THREE.sRGBEncoding"
									}
								},

								function (pTexture) {

									textureToResizeList[COUNTER].childOriginal.material[textureToResizeList[COUNTER].textureType] = pTexture.obj;

									textureToResizeList[COUNTER].childOriginal.material[textureToResizeList[COUNTER].textureType].flipY = FlipY

									textureToResizeList[COUNTER].childOriginal.material.needsUpdate = true;

									COUNTER += 1;

									if (COUNTER < textureToResizeList.length) {

										resizeTexture(textureToResizeList);

									} else {

										if (callback !== undefined) {

											if (callbackprop == undefined) {

												callbackprop = {}

											};

											callbackprop.obj = textureToResizeList;

											callback(callbackprop);

										};

										return textureToResizeList;

									}

								}

							);

						}

					)

				}

			);

		};

		if (textureToResizeList.length > 0) {

			resizeTexture(textureToResizeList);

		} else {
			console.log('nessuna texture da ridimensionare');
		}

	};




	// EDITOR.f.optimizerGeometry( PLY.p.selectedProject.OBJECTS.myProject.children[ 0 ], 0.5, function(p){ console.log( p ) }, {} );

	EDITOR.f.optimizerGeometry = function (SOURCEOBJ, valueGeometry, callback, callbackprop) {

		const { project: _selectedProject } = get(projectStore); // leggi dato

		const simplifyModifier = new SimplifyModifier();

		if (_selectedProject.OBJECTS.myProjectCloned.children.length > 0) {

			VARCO.f.deleteElement(_selectedProject.OBJECTS.myProjectCloned, _selectedProject.OBJECTS.myProjectCloned.children[0]);

		};

		_selectedProject.OBJECTS.myProjectCloned.OBJECTS[SOURCEOBJ.name];

		SOURCEOBJ.traverse(

			function (child) {

				const simplifyChild = child.clone();

				if (child.geometry !== undefined) {

					const polygonCount = Math.floor(child.geometry.attributes.position.count * valueGeometry);

					const simplifiedGeometry = simplifyModifier.modify(child.geometry, polygonCount); // Riduce del 50%

					simplifyChild.geometry = simplifiedGeometry;

					simplifyChild.material = child.material.clone();

					simplifyChild.material.flatShading = true;

					_selectedProject.OBJECTS.myProjectCloned.add(simplifyChild);

					_selectedProject.OBJECTS.myProjectCloned.OBJECTS[simplifyChild.name] = simplifyChild;

				};

			}

		);


		_selectedProject.OBJECTS.myProject.visible = false;

		_selectedProject.OBJECTS.myProjectCloned.visible = true;


	};



	EDITOR.f.optimizerDrawCalls = function (SOURCEOBJ, valueGeometry, callback, callbackprop) {

		const { project: _selectedProject } = get(projectStore); // leggi dato

		if (_selectedProject.OBJECTS.myProjectCloned.children.length > 0) {

			VARCO.f.deleteElement(_selectedProject.OBJECTS.myProjectCloned, _selectedProject.OBJECTS.myProjectCloned.children[0]);

		};

		const geometryAttributesList = [];

		const geometriesUV = [];

		const geometries = [];

		const combinedGeometry = new THREE.BufferGeometry();

		SOURCEOBJ.traverse(

			function (child) {

				if (child.geometry !== undefined) {

					if (child.geometry.attributes.uv !== undefined) {

						geometriesUV.push(child.geometry.clone());

					} else {

						geometries.push(child.geometry.clone());

					}

				};

			}

		);


		// Unisci tutte le geometrie raccolte

		const material = new THREE.MeshStandardMaterial({ color: 0x777777 });

		if (geometriesUV.length > 0) {

			const mergedGeometryUV = BufferGeometryUtils.mergeGeometries(geometriesUV);

			const combinedMeshUV = new THREE.Mesh(mergedGeometryUV, material);

			mergedGeometryUV.computeBoundingSphere();

			combinedMeshUV.rotateX(VARCO.f.deg2rad(-90))

			combinedMeshUV.scale.x = -1

			_selectedProject.OBJECTS.myProjectCloned.add(combinedMeshUV);

		};

		if (geometries.length > 0) {

			const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries);

			const combinedMesh = new THREE.Mesh(mergedGeometry, material);

			mergedGeometry.computeBoundingSphere();

			combinedMesh.rotateX(VARCO.f.deg2rad(-90))

			combinedMesh.scale.x = -1

			_selectedProject.OBJECTS.myProjectCloned.add(combinedMesh);

		}

		_selectedProject.OBJECTS.myProject.visible = false;

		_selectedProject.OBJECTS.myProjectCloned.visible = true;


	};



	EDITOR.f.exportIMAGE = async function (PROJECTOBJ, GEOAREAOBJ) {
		console.log('EDITOR.f.exportIMAGE');

		console.log(PROJECTOBJ);

		const position = {
			"x": PROJECTOBJ.position.x,
			"y": PROJECTOBJ.position.y,
			"z": PROJECTOBJ.position.z
		};

		const rotation = {
			"x": VARCO.f.rad2deg(PROJECTOBJ.rotation.x),
			"y": VARCO.f.rad2deg(PROJECTOBJ.rotation.y),
			"z": VARCO.f.rad2deg(PROJECTOBJ.rotation.z)
		};

		const scale = {
			"x": PROJECTOBJ.scale.x,
			"y": PROJECTOBJ.scale.y,
			"z": PROJECTOBJ.scale.z
		}

		const propImageObject = {
			"name": PROJECTOBJ.name,
			"userData": { "type": "image", "extension": PROJECTOBJ.userData.extension },
			"parameters": {
				"textureList": [
					{
						"name": PROJECTOBJ.name,
						"type": "Base64",
						"url": PROJECTOBJ.TEXTURES[PROJECTOBJ.name].source.data.currentSrc
					}
				],
				"materialList": [
					{
						"name": PROJECTOBJ.name,
						"type": "MeshBasicMaterial",
						"parameters": {
							"textures": { "map": PROJECTOBJ.name },
							"side": "THREE.DoubleSide"
						}
					}
				],
				"elementList": [
					{
						"type": "addMesh",
						"prop": {
							"type": "PlaneGeometry",
							"name": PROJECTOBJ.name,
							"materialList": [PROJECTOBJ.name],
							"castShadow": true,
							"parameters": {
								"width": PROJECTOBJ.TEXTURES[PROJECTOBJ.name].source.data.width * 0.01,
								"height": PROJECTOBJ.TEXTURES[PROJECTOBJ.name].source.data.height * 0.01
							}
						}
					}
				]

			},
			"position": position,
			"rotation": rotation,
			"scale": scale

		};
		await EDITOR.f.createGeoAreaHelpers(propImageObject);
	};



	EDITOR.f.exportVIDEO = async function (PROJECTOBJ) {
		spinnerStore.setLoading(true);

		console.log('EDITOR.f.exportVIDEO');

		console.log(PROJECTOBJ);

		const position = {
			"x": PROJECTOBJ.position.x,
			"y": PROJECTOBJ.position.y,
			"z": PROJECTOBJ.position.z
		};

		const rotation = {
			"x": VARCO.f.rad2deg(PROJECTOBJ.rotation.x),
			"y": VARCO.f.rad2deg(PROJECTOBJ.rotation.y),
			"z": VARCO.f.rad2deg(PROJECTOBJ.rotation.z)
		};

		const scale = {
			"x": PROJECTOBJ.scale.x,
			"y": PROJECTOBJ.scale.y,
			"z": PROJECTOBJ.scale.z
		}

		const propVideoObject = {
			"name": PROJECTOBJ.name,
			"userData": { "type": "video", "extension": "mp4" },
			"parameters": {
				"textureList": [
					{
						"name": PROJECTOBJ.name,
						"type": "videoBase64",
						"url": PROJECTOBJ.TEXTURES[PROJECTOBJ.name].source.data.currentSrc
					}
				],
				"materialList": [
					{
						"name": PROJECTOBJ.name,
						"type": "MeshBasicMaterial",
						"parameters": {
							"textures": { "map": PROJECTOBJ.name },
							"side": "THREE.DoubleSide"
						}
					}
				],
				"elementList": [
					{
						"type": "addMesh",
						"prop": {
							"type": "PlaneGeometry",
							"name": PROJECTOBJ.name,
							"materialList": [PROJECTOBJ.name],
							"castShadow": true,
							"parameters": {
								"width": 4,
								"height": 2.5
							}
						}
					}
				]

			},
			"position": position,
			"rotation": rotation,
			"scale": scale

		};
		spinnerStore.setLoading(false);

		await EDITOR.f.createGeoAreaHelpers(projectData);
	};



	EDITOR.f.exportGLTF = function (PROJECTOBJ, GEOAREAOBJ) {
		spinnerStore.setLoading(true);
		console.log('EDITOR.f.exportGLTF');

		console.log(PROJECTOBJ);


		const position = {
			"x": PROJECTOBJ.position.x,
			"y": PROJECTOBJ.position.y,
			"z": PROJECTOBJ.position.z
		};

		const rotation = {
			"x": VARCO.f.rad2deg(PROJECTOBJ.rotation.x),
			"y": VARCO.f.rad2deg(PROJECTOBJ.rotation.y),
			"z": VARCO.f.rad2deg(PROJECTOBJ.rotation.z)
		};

		const scale = {
			"x": PROJECTOBJ.scale.x,
			"y": PROJECTOBJ.scale.y,
			"z": PROJECTOBJ.scale.z
		}


		const exporter = new GLTFExporter();


		// Funzione per convertire un ArrayBuffer in base64
		function arrayBufferToBase64(buffer) {
			let binary = '';
			const bytes = new Uint8Array(buffer);
			const len = bytes.byteLength;
			for (let i = 0; i < len; i++) {
				binary += String.fromCharCode(bytes[i]);
			}
			return window.btoa(binary);
		}


		// Instantiate a exporter
		const options = {

			binary: false,

			maxTextureSize: 4096,

			animations: PROJECTOBJ.animations,

			includeCustomExtensions: true

		};

		exporter.parse(

			PROJECTOBJ,

			async function (result) {

				// Converti l'oggetto scene in stringa JSON
				const sceneString = JSON.stringify(result);

				// Converti la stringa JSON in base64
				const base64 = window.btoa(unescape(encodeURIComponent(sceneString)));

				const projectData = {
					"name": PROJECTOBJ.name,
					"userData": { "type": "3d", "extension": "gltf" },
					"parameters": {
						"elementList": [
							{
								"type": "addFromFile",
								"prop": {
									"name": PROJECTOBJ.name,
									"parameters": {
										"type": "base64",
										"url": base64,
										"extension": PROJECTOBJ.userData.extension // "gltf"
									}
								}
							}
						]
					},
					"position": position,
					"rotation": rotation,
					"scale": scale

				};

				spinnerStore.setLoading(false);
				await EDITOR.f.createGeoAreaHelpers(projectData);
			}

		);

	};


	// EDITOR.f.exportJSON = function( PROJECTOBJ, GEOAREAOBJ ){

	// console.log( 'EDITOR.f.exportJSON' );

	// console.log( PROJECTOBJ );

	// console.log( GEOAREAOBJ );

	// }



	// EDITOR.f.exportGLB = function( OBJ, GEOAREAOBJ ){

	// console.log( 'EDITOR.f.exportGLB' );

	// const exporter = new GLTFExporter();

	// exporter.parse(
	// OBJ,
	// function (result) {
	// saveArrayBuffer(result, "scene.glb");
	// },
	// // called when there is an error in the generation
	// function ( error ) {

	// console.log( 'An error happened' );

	// }, 
	// { binary: true }
	// );

	// function saveArrayBuffer(buffer, filename) {

	// save(new Blob([buffer], { type: "application/octet-stream" }), filename);

	// }

	// const link = document.createElement("a");
	// link.style.display = "none";
	// document.body.appendChild(link); // Firefox workaround, see #6594

	// function save(blob, filename) {

	// link.href = URL.createObjectURL(blob);
	// link.download = filename;
	// link.click();
	// }


	// };



	// EDITOR.f.exportUSDZ = function( OBJ, GEOAREAOBJ ){

	// console.log( 'EDITOR.f.exportUSDZ' );

	// // USDZ
	// const exporter = new USDZExporter();

	// exporter.parse(
	// OBJ,
	// // called when the gltf has been generated
	// function ( arraybuffer ) {

	// console.log( arraybuffer );

	// const blob = new Blob( [ arraybuffer ], { type: 'application/octet-stream' } );

	// const link = document.getElementById( 'link' );

	// link.href = URL.createObjectURL( blob );

	// },
	// // called when there is an error in the generation
	// function ( error ) {

	// console.log( 'An error happened' );

	// },
	// {}
	// );


	// };


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
