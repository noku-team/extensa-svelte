/* eslint-disable no-global-assign */
/* eslint-disable no-case-declarations */
/* eslint-disable no-empty */
/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */
/* eslint-disable no-duplicate-case */

// @ts-nocheck

// EDITOR MODULE
import { get } from 'svelte/store';
import * as THREE from 'three';
// Importiamo direttamente l'istanza singleton di VARCO
import { VARCOClass } from "../VARCO/helpers/VARCO";
import { authStore } from '../store/AuthStore';
import { projectStore } from '../store/ProjectStore';
import UISingleton from './extensa_ui.js';
import { MAP, PLY } from "./index.js";

import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { SimplifyModifier } from 'three/addons/modifiers/SimplifyModifier.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { loadProjectWorker } from '../actions/loadProject.action';
import { controlStore } from '../store/ControlStore';
import { messageStore } from '../store/MessageStore';
import { spinnerStore } from '../store/SpinnerStore';
import { getProject } from '../utils/indexedDB/getSaveEmpty';
import RENDERERSingleton from '../functions/renderer.js';

let UI = UISingleton.getInstance();

const renderer = RENDERERSingleton.getInstance();

// Creazione dell'istanza singleton di VARCO
const VARCO = VARCOClass.getInstance();

function createEditor() {
	let EDITOR = null;
	
	try {
		EDITOR = {
			p: {
				action: '',
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
				};
				await projectStore.setGeoAreaToEdit(geoAreaDatas);
			} catch (e) {
				console.error('Error in createGeoAreaHelpers:', e);
				throw e;
			}
		};

		EDITOR.f.loop = function () {
			try {
				switch (EDITOR.p.action) {
					case '':
						break;
					default:
						break;
				}
			} catch (e) {
				console.error(e);
			}
		};

		EDITOR.f.createProject = function (GEOAREAOBJ, prop, callback, callbackprop) {
			try {
				console.log("createProject");
				prop.linkedGeoArea = GEOAREAOBJ;
				const _OBJ = {
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
									"alphaTest": 1,
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
							}
						]
					}
				};

				VARCO.f.addComplex(
					GEOAREAOBJ.OBJECTS.projects,
					_OBJ,
					function (p) {
						try {
							const url = new URL(window.location.href);
							const params = new URLSearchParams(url.search);
							const projectId = params.get('project');

							if (!!projectId && p.obj?.userData?.file_id) {
								if (parseInt(p.obj.userData.file_id) === parseInt(projectId)) {
									projectStore.setProject(p.obj);
									EDITOR.f.loadProjectData();
									projectStore.set3DVisible(true);
								}
							}

							if (callback !== undefined) {
								if (callbackprop === undefined) {
									callbackprop = {};
								}
								callbackprop.obj = p.obj;
								callback(callbackprop);
							}
						} catch (e) {
							console.error(e);
						}
					},
					{}
				);
			} catch (e) {
				console.error(e);
			}
		};

		EDITOR.f.createGeoArea = function (prop, callback, callbackprop) {
			const auth = get(authStore);
			const principal = auth.identity?.getPrincipal()?.toString();
			let colorGeoArea = { r: 0.0, g: 0.0, b: 0.0 };

			if (principal) {
				if (principal == prop.user?.[0]?.toString()) {
					colorGeoArea = { r: 1.0, g: 0.0, b: 0.0 };
				}
			};

			let myPosition = MAP.f.getMapPosition(MAP.p.width, MAP.p.height, prop.myCoords.lng, prop.myCoords.lat, prop.myCoords.alt);

			VARCO.f.addComplex(
				PLY.p.scene3D.OBJECTS.geoArea,
				{
					"name": prop.geoAreaName,
					"userData": prop,
					"parameters": {
						"materialList": [
							{
								// area
								"type": "MeshBasicMaterial",
								"name": "geoAreaKernel_mat",
								"parameters": {
									"color": { "r": 0.5, "g": 0.5, "b": 0.5 },
									"transparent": true,
									"opacity": 0.8,
									"alphaTest": 1, // fully transparent = 1
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

				EDITOR.f.deselectProjects();

				projectStore.setProject(p.obj.parent); // scrivi dato

				const { project: _selectedProject } = get(projectStore); // leggi dato

				console.log(`SELEZIONATO: ${_selectedProject.name}`);

				if (PLY.p.selectedArea == undefined || PLY.p.selectedArea.uuid !== p.obj.parent.userData.linkedGeoArea.uuid) {
					EDITOR.f.deselectGeoArea();

					PLY.p.selectedArea = p.obj.parent.userData.linkedGeoArea;

					PLY.p.selectedArea.MATERIALS.geoAreaKernel_mat.color.r = 1.0;
					PLY.p.selectedArea.MATERIALS.geoAreaKernel_mat.color.g = 1.0;
					PLY.p.selectedArea.MATERIALS.geoAreaKernel_mat.color.b = 0.0;

					projectStore.setSelectedGeoarea(PLY.p.selectedArea);
				}

				p.obj.parent.MATERIALS.Kernel_Mesh_mat.color.r = 1.0;
				p.obj.parent.MATERIALS.Kernel_Mesh_mat.color.g = 1.0;
				p.obj.parent.MATERIALS.Kernel_Mesh_mat.color.b = 0.0;

				PLY.p.flagPlayerOn = false;
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
				projectStore.setProject(null); // scrivi dato NULL
			}
		};

		EDITOR.f.selectGeoArea = function (p) {
			const auth = get(authStore);
			const principal = auth.identity?.getPrincipal()?.toString();

			if (principal) {
				console.log(" OK principal ");

				if (principal === (p.obj.parent.userData.user?.[0]?.toString() || p.obj.parent.userData?.user?.toString())) {
					console.log(" OK principal bis ");

					// diseleziona progetti in geoArea diversa da quella attuale
					const { project: _selectedProject } = get(projectStore); // leggi dato

					if (_selectedProject !== null) {
						if (p.obj.parent.uuid !== _selectedProject.userData.linkedGeoArea.uuid) {
							EDITOR.f.deselectProjects();
						}
					}

					EDITOR.f.deselectGeoArea();

					PLY.p.selectedArea = p.obj.parent;

					console.log(" OK selectedArea ");
					console.log(PLY.p.selectedArea);

					PLY.p.selectedArea.MATERIALS.geoAreaKernel_mat.color.r = 1.0;
					PLY.p.selectedArea.MATERIALS.geoAreaKernel_mat.color.g = 1.0;
					PLY.p.selectedArea.MATERIALS.geoAreaKernel_mat.color.b = 0.0;

					projectStore.setSelectedGeoarea(PLY.p.selectedArea);
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
			projectStore.setSelectedGeoarea(PLY.p.selectedArea);
		};

		EDITOR.f.editGeoArea = function () {

		};

		EDITOR.f.deleteGeoArea = function () {
			if (PLY.p.selectedArea !== undefined) {
				// rimuovi POI //
				for (var numA = 0; numA < UI.p.scene.OBJECTS.poi.children.length; numA += 1) {
					if (PLY.p.selectedArea?.uuid == UI.p.scene.OBJECTS.poi.children[numA].userData.linkedObj?.uuid) {
						VARCO.f.deleteElement(UI.p.scene.OBJECTS.poi, UI.p.scene.OBJECTS.poi.children[numA]);
						break;
					};
				};
				VARCO.f.deleteElement(PLY.p.scene3D.OBJECTS.geoArea, PLY.p.selectedArea);
				PLY.p.selectedArea = undefined;
				projectStore.setSelectedGeoarea(PLY.p.selectedArea);
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
							projectStore.setLoadProjectProgress(1);
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
									child.material.transparent = true;
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
			let projectData = null;
			
			try {
				switch (PROJECTOBJ.userData.type) {
					case '3d': {
						projectData = await handle3DProject(PROJECTOBJ);
						break;
					}
					case 'glb': {
						projectData = await handleGLBProject(PROJECTOBJ);
						break;
					}
					case 'image': {
						projectData = await handleImageProject(PROJECTOBJ);
						break;
					}
					case 'video': {
						projectData = await handleVideoProject(PROJECTOBJ);
						break;
					}
					case 'json': {
						projectData = await handleJSONProject(PROJECTOBJ);
						break;
					}
					default: {
						throw new Error('Unsupported project type');
					}
				}
				
				if (projectData) {
					await EDITOR.f.createGeoAreaHelpers(projectData);
				}
			} catch (e) {
				console.error('Error in saveProjectData:', e);
				messageStore.setMessage('The uploaded file format is not supported. Please choose a valid file format.', 'error');
			} finally {
				spinnerStore.setLoading(false);
			}
		};

		// Helper functions for saveProjectData
		async function handle3DProject(PROJECTOBJ) {
			return {
				name: PROJECTOBJ.name,
				parameters: {
					elementList: [{
						type: "addFromFile",
						prop: {
							name: PROJECTOBJ.name,
							parameters: {
								type: "base64",
								url: PROJECTOBJ.userData.stringByte64,
								extension: PROJECTOBJ.userData.extension
							}
						}
					}]
				}
			};
		}

		async function handleGLBProject(PROJECTOBJ) {
			return {
				name: PROJECTOBJ.name,
				parameters: {
					elementList: [{
						type: "addFromFile",
						prop: {
							name: PROJECTOBJ.name,
							parameters: {
								type: "base64",
								url: PROJECTOBJ.userData.stringByte64,
								extension: PROJECTOBJ.userData.extension
							}
						}
					}]
				}
			};
		}

		async function handleImageProject(PROJECTOBJ) {
			return {
				name: PROJECTOBJ.name,
				parameters: {
					textureList: [{
						name: PROJECTOBJ.name,
						type: "base64",
						url: PROJECTOBJ.userData.stringByte64
					}]
				}
			};
		}

		async function handleVideoProject(PROJECTOBJ) {
			return {
				name: PROJECTOBJ.name,
				parameters: {
					textureList: [{
						name: PROJECTOBJ.name,
						type: "videoBase64",
						url: PROJECTOBJ.userData.stringByte64
					}]
				}
			};
		}

		async function handleJSONProject(PROJECTOBJ) {
			return new Promise((resolve, reject) => {
				try {
					VARCO.f.addComplex(
						PLY.p.scene3D,
						PROJECTOBJ.obj,
						function(q) {
							resolve({
								name: q.obj.name,
								type: 'json',
								data: q.obj
							});
						},
						{}
					);
				} catch (e) {
					reject(e);
				}
			});
		}

		EDITOR.f.optimizerTextures = function (SOURCEOBJ, valueTextures, callback, callbackprop) {
			let OBJ = SOURCEOBJ.clone();
			const { project: _selectedProject } = get(projectStore);

			OBJ.traverse(function (child) {
				if (child.isMesh) {
					child.material = child.material.clone();
				}
			});

			if (_selectedProject.OBJECTS.myProjectCloned.children.length > 0) {
				VARCO.f.deleteElement(_selectedProject.OBJECTS.myProjectCloned, _selectedProject.OBJECTS.myProjectCloned.children[0]);
			}

			_selectedProject.OBJECTS.myProjectCloned.OBJECTS[OBJ.name] = OBJ;
			_selectedProject.OBJECTS.myProjectCloned.add(OBJ);
			SOURCEOBJ.visible = false;
			OBJ.visible = true;

			const textureTypeList = [
				"map", "emissiveMap", "bumpMap", "displacementMap", "specularMap",
				"envMap", "normalMap", "lightMap", "aoMap", "alphaMap",
				"metalnessMap", "roughnessMap", "transmissionMap", "gradientMap",
				"clearcoatMap", "clearcoatNormalMap", "clearcoatRoughnessMap"
			];

			let maxResizeWidth = 4096;
			let maxResizeHeight = 4096;
			let textureToResizeList = [];

			OBJ.traverse(function (child) {
				if (child.material !== undefined) {
					textureTypeList.forEach(function (textureType) {
						if (child.material[textureType] !== null && child.material[textureType] !== undefined) {
							child.material[textureType].flipY = true;
							child.material[textureType].name = child.material[textureType].name + '_' + textureType;
							textureToResizeList.push({
								childOriginal: child,
								textureOriginal: child.material[textureType],
								materialOriginal: child.material,
								textureType: textureType
							});
						}
					});
				}
			});

			let COUNTER = 0;
			let FlipY = true;
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
				}

				textureToResizeList[COUNTER].textureImageOriginal = textureImage;

				const canvasOriginal = document.createElement('canvas');
				const ctxOriginal = canvasOriginal.getContext('2d');

				ctxOriginal.imageSmoothingEnabled = true;
				ctxOriginal.imageSmoothingQuality = 'high';
				canvasOriginal.width = textureImage.width;
				canvasOriginal.height = textureImage.height;

				ctxOriginal.save();
				ctxOriginal.translate(0, textureImage.height);
				ctxOriginal.scale(1, -1);
				ctxOriginal.drawImage(textureImage, 0, 0, textureImage.width, textureImage.height, 0, 0, textureImage.width, textureImage.height);
				ctxOriginal.restore();

				canvasOriginal.toBlob(function (blobPreviewOriginal) {
					const canvasLowres = document.createElement('canvas');
					const ctxLowres = canvasLowres.getContext('2d');

					ctxLowres.imageSmoothingEnabled = true;
					ctxLowres.imageSmoothingQuality = 'high';
					ctxLowres.willReadFrequently = true;

					let resizeWidth;
					let resizeHeight;

					const reductionSize = [8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096];
					let propValH = 1;
					let propValV = 1;

					if (textureImage.width > textureImage.height) {
						propValV = textureImage.height / textureImage.width;
					} else {
						propValH = textureImage.width / textureImage.height;
					}

					let textureSizeH = Math.floor(textureImage.width * propValH * valueTextures);
					let textureSizeV = Math.floor(textureImage.height * propValV * valueTextures);

					for (var ws = 0; ws < reductionSize.length; ws++) {
						if (reductionSize[ws] < maxResizeWidth) {
							if (textureSizeH < reductionSize[ws]) {
								resizeWidth = reductionSize[ws];
								break;
							}
						} else {
							resizeWidth = maxResizeWidth;
							break;
						}
					}

					for (var hs = 0; hs < reductionSize.length; hs++) {
						if (reductionSize[hs] < maxResizeHeight) {
							if (textureSizeV < reductionSize[hs]) {
								resizeHeight = reductionSize[hs];
								break;
							}
						} else {
							resizeHeight = maxResizeHeight;
							break;
						}
					}

					canvasLowres.width = resizeWidth;
					canvasLowres.height = resizeHeight;

					ctxLowres.save();
					ctxLowres.translate(0, resizeHeight);
					ctxLowres.scale(1, -1);
					ctxLowres.drawImage(textureImage, 0, 0, textureImage.width, textureImage.height, 0, 0, resizeWidth, resizeHeight);
					ctxLowres.restore();

					canvasLowres.toBlob(function (blobPreviewLowres) {
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
								textureToResizeList[COUNTER].childOriginal.material[textureToResizeList[COUNTER].textureType].flipY = FlipY;
								textureToResizeList[COUNTER].childOriginal.material.needsUpdate = true;
								COUNTER += 1;
								if (COUNTER < textureToResizeList.length) {
									resizeTexture(textureToResizeList);
								} else {
									if (callback !== undefined) {
										if (callbackprop === undefined) {
											callbackprop = {};
										}
										callbackprop.obj = textureToResizeList;
										callback(callbackprop);
									}
									return textureToResizeList;
								}
							}
						);
					});
				});
			}

			if (textureToResizeList.length > 0) {
				resizeTexture(textureToResizeList);
			} else {
				console.log('nessuna texture da ridimensionare');
			}
		};

		EDITOR.f.optimizerGeometry = function (SOURCEOBJ, valueGeometry, callback, callbackprop) {
			const { project: _selectedProject } = get(projectStore); // leggi dato

			const simplifyModifier = new SimplifyModifier();

			if (_selectedProject.OBJECTS.myProjectCloned.children.length > 0) {
				VARCO.f.deleteElement(_selectedProject.OBJECTS.myProjectCloned, _selectedProject.OBJECTS.myProjectCloned.children[0]);
			}

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
					}
				}
			);

			_selectedProject.OBJECTS.myProject.visible = false;
			_selectedProject.OBJECTS.myProjectCloned.visible = true;
		};

		EDITOR.f.optimizerDrawCalls = function (SOURCEOBJ, valueGeometry, callback, callbackprop) {
			const { project: _selectedProject } = get(projectStore); // leggi dato

			if (_selectedProject.OBJECTS.myProjectCloned.children.length > 0) {
				VARCO.f.deleteElement(_selectedProject.OBJECTS.myProjectCloned, _selectedProject.OBJECTS.myProjectCloned.children[0]);
			}

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
								"transparent": true,
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
			await EDITOR.f.createGeoAreaHelpers(propVideoObject);
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

		EDITOR.f.deleteProject = function (PROJECTOBJ) {
			const AREAOBJ = PROJECTOBJ.userData.linkedGeoArea;
			for (var num = 0; num < AREAOBJ.OBJECTS.projects.children.length; num += 1) {
				if (PROJECTOBJ.uuid == AREAOBJ.OBJECTS.projects.children[num].uuid) {
					// rimuovi AREA //    
					VARCO.f.deleteElement(AREAOBJ.OBJECTS.projects, AREAOBJ.OBJECTS.projects.children[num]);
					projectStore.setProject(null);
					// scrivere qui' codice per togliere progetto ( PROJECTOBJ ) dalla BLOCKCHAIN    
					//    
					//
					//
					break;
				}
			};
		};

		EDITOR.f.deleteArea = function (AREAOBJ) {
			for (var num = 0; num < PLY.p.scene3D.OBJECTS.geoArea.children.length; num += 1) {
				if (AREAOBJ.uuid == PLY.p.scene3D.OBJECTS.geoArea.children[num].uuid) {
					// rimuovi POI //    for (var numA = 0; numA < UI.p.scene.OBJECTS.poi.children.length; numA += 1) {
					if (AREAOBJ.uuid == UI.p.scene.OBJECTS.poi.children[numA].userData.linkedObj.uuid) {
						VARCO.f.deleteElement(UI.p.scene.OBJECTS.poi, UI.p.scene.OBJECTS.poi.children[numA]);
					};
				};

				// rimuovi AREA //    VARCO.f.deleteElement(PLY.p.scene3D.OBJECTS.geoArea, PLY.p.scene3D.OBJECTS.geoArea.children[ num ]);
				PLY.p.selectedArea = undefined;
				projectStore.setSelectedGeoarea(PLY.p.selectedArea);
				// scrivere qui' codice per togliere la geoarea AREAOBJ dalla BLOCKCHAIN
				//
				//
				//
				break;
			}
		};

		EDITOR.f.exportGLB = function (PROJECTOBJ, GEOAREAOBJ) {
			spinnerStore.setLoading(true);

			console.log('EDITOR.f.exportGLB');

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
											"url": PROJECTOBJ.userData.stringByte64,
											"extension": "gltf"
										}
									}
								}
							]
						},
						"position": position,
						"rotation": rotation,
						"scale": scale
					};

					console.log(projectData)

					spinnerStore.setLoading(false);
					await EDITOR.f.createGeoAreaHelpers(projectData);
				}
			);
		};

	} catch (e) {
		console.error('Error in createEditor:', e);
		EDITOR = null;
	}

	return EDITOR;
}

const EDITORSingleton = (function () {
	let instance;
	
	function createInstance() {
		return createEditor();
	}
	
	return {
		getInstance: function () {
			if (!instance) {
				instance = createInstance();
			}
			return instance;
		}
	};
})();

export default EDITORSingleton;
