/* eslint-disable no-unused-vars */
// UI MODULE

import * as THREE from 'three';
import { VARCO } from "../VARCO/helpers/VARCO.js";
import { EDITOR, MAP, PLY } from "./index.js";

const UISingleton = (function () {
	let instance;
	function createInstance() {
		return createUI();
	}
	return {
		getInstance: function () {
			if (!instance) instance = createInstance();
			return instance;
		},
	};
})();


const createUI = () => {
	const UI = {

		p: {
			address: '',
			loggedIn: false,
			myData: {}
		},

		f: {}

	};


	UI.f.initScene = function (p) {

		// pano

		VARCO.f.addScene(

			{
				"name": "scene"
			},

			function ui_scene_ready(p) {
				UI.p.scene = p.obj;

				// environment textures //

				VARCO.f.addTexture(
					UI.p.scene,
					{
						"name": "environment",
						"url": "images/reflection.jpeg"
					},
					function ui_texture_scene_ready(t) {
						UI.p.scene.environment = t.obj;
						UI.p.scene.environment.mapping = THREE.EquirectangularReflectionMapping;
					}
				)

				// equirectangular

				VARCO.f.loadComplex(
					UI.p.scene,
					'json/menu_player_3d.json',
					undefined,
					function init_menu_player_3d(p) {

						p.obj.scale.x = 0.5;

						p.obj.scale.y = 0.5;

						p.obj.scale.z = 0.5;

						PLY.f.resizeScreen();
					}
				);

			},

			{}

		);


		VARCO.f.addCamera(

			UI.p.scene,

			{
				"type": "OrthographicCamera",
				"name": "camera",
				"position": {
					"x": 0.0,
					"y": 0.0,
					"z": 100.0
				}
			},

			function ui_camera_ready(p) {

				UI.p.camera = p.obj;

			},

			{}

		);


		VARCO.f.addComplex(

			UI.p.scene,

			{
				"name": "menu"
			},

			function ui_complex_menu_ready(p) {

				UI.p.MENUOBJ = p.obj;

			},

			{}

		);


		VARCO.f.addComplex(

			UI.p.scene,

			{
				"name": "poi"
			}

		);


		// open title menu
		UI.p.menu_top.f.open();

		// open bottom main menu
		UI.p.menu_bottom.f.open();

	};



	UI.f.goToAddressCoords = function (location = "") {

		console.log("UI.f.goToAddressCoords " + location);

		var geocoder = new window.google.maps.Geocoder();

		geocoder.geocode({ 'address': location }, function (results, status) {

			if (status == window.google.maps.GeocoderStatus.OK) {

				var latitude = results[0].geometry.location.lat();

				var longitude = results[0].geometry.location.lng();

				// update map

				MAP.p.actualCoords.lng = longitude;

				MAP.p.actualCoords.lat = latitude;

				MAP.f.setMapCoords(MAP.p.actualCoords.lng, MAP.p.actualCoords.lat, MAP.p.actualCoords.alt);

				let posXZ = MAP.f.getMapPosition(MAP.p.width, MAP.p.height, MAP.p.actualCoords.lng, MAP.p.actualCoords.lat, MAP.p.actualCoords.alt);


				PLY.p.camera3DAxis.position.x = posXZ.x;

				PLY.p.camera3DAxis.position.y = MAP.p.actualCoords.alt;

				PLY.p.camera3DAxis.position.z = posXZ.z;

				// update map	

			}

		}

		);

	};



	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //

	// MENU and POPUP //

	// "menu_account_OBJ", "menu_top_OBJ", "menu_bottom_OBJ", 

	UI.f.remove_menu_popups = function () {

		let deleteList = [];

		UI.p.scene.OBJECTS.menu.children.forEach(
			function (child) {
				deleteList.push(child);
			}
		);

		deleteList.forEach(
			function (child) {
				VARCO.f.deleteElement(UI.p.scene.OBJECTS.menu, child);
			}
		);

	};

	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //



	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //

	// POPUP PREVIEW PROJECTS

	UI.p.previewProject = {
		f: {},
		p: {}
	};



	UI.p.previewProject.f.open = function (GEOAREAOBJ, PROJECTOBJ) {

		if (UI.p.scene.OBJECTS.previewProject !== undefined) {

			VARCO.f.deleteElement(UI.p.scene, UI.p.scene.OBJECTS.previewProject);

		}


		UI.f.remove_menu_popups();

		VARCO.f.loadComplex(

			UI.p.scene,

			'json/previewProject.json',

			undefined,

			function init_previewProject(q) {

				console.log(PROJECTOBJ.name);

				UI.p.previewProject.p.infoArea = GEOAREAOBJ.userData;

				UI.p.previewProject.p.infoProject = PROJECTOBJ.userData;

				PLY.f.resizeScreen();

			}

		);

	};



	UI.p.previewProject.f.close = function () {

		console.log("UI.p.previewProject.f.close");

		UI.f.remove_menu_popups();

	};



	UI.p.previewProject.f.button_loadProject = function (p) {

		console.log("button_loadProject");

		EDITOR.f.loadProjectData();

	};



	UI.f.previewProjectFeedBackLoop = function (p) {

		if (PLY.p.selectedProject !== undefined) {

			if (PLY.p.selectedProject.userData.isLoaded) {

				if (UI.p.scene.OBJECTS.previewProject !== undefined) {

					UI.p.scene.OBJECTS.previewProject.OBJECTS.button_removeProject.visible = true;

					UI.p.scene.OBJECTS.previewProject.OBJECTS.button_loadProject.visible = false;

				}

			} else {

				if (UI.p.scene.OBJECTS.previewProject !== undefined) {

					UI.p.scene.OBJECTS.previewProject.OBJECTS.button_removeProject.visible = false;

					UI.p.scene.OBJECTS.previewProject.OBJECTS.button_loadProject.visible = true;

				}

			}

		} else {
			console.log();
		}

	};



	UI.p.previewProject.f.button_removeProject = function (p) {

		console.log("button_removeProject");

		p.obj.userData.pressed = false;

		if (PLY.p.selectedProject.OBJECTS.myProject.children.length > 0) {

			VARCO.f.deleteElement(PLY.p.selectedProject.OBJECTS.myProject, PLY.p.selectedProject.OBJECTS.myProject.children[0]);

			PLY.p.selectedProject.userData.isLoaded = false;

		}
	};


	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //



	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //

	// MENU TOP

	UI.p.menu_top = {
		f: {},
		p: {}
	};



	UI.p.menu_top.f.open = function () {

		VARCO.f.loadComplex(
			UI.p.scene,
			'json/menu_top.json',
			undefined,
			function init_menu_top(p) {
				PLY.f.resizeScreen();
			}
		);

	};



	UI.p.menu_top.f.menu_account = function () {

		console.log("UI.p.menu_top.f.menu_account");

		if (UI.p.popup_login_data.p.data !== undefined) { // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

			if (UI.p.scene.OBJECTS.menu.OBJECTS.popup_account !== undefined) {

				VARCO.f.deleteElement(UI.p.scene.OBJECTS.menu, UI.p.scene.OBJECTS.menu.OBJECTS.popup_account);

			} else {

				UI.f.remove_menu_popups();

				VARCO.f.loadComplex(
					UI.p.scene.OBJECTS.menu,
					'json/popup_account.json',
					undefined,
					function init_popup_account(p) {
						PLY.f.resizeScreen();
					}
				);

			}

		} else {

			if (UI.p.scene.OBJECTS.menu.OBJECTS.popup_login !== undefined) {

				VARCO.f.deleteElement(UI.p.scene.OBJECTS.menu, UI.p.scene.OBJECTS.menu.OBJECTS.popup_login);

			} else {

				UI.f.remove_menu_popups();

				VARCO.f.loadComplex(
					UI.p.scene.OBJECTS.menu,
					'json/popup_login.json',
					undefined,
					function init_popup_login(p) {
						PLY.f.resizeScreen();
					}
				);

			}

		}

	};



	UI.p.menu_top.f.loop = function (p) {

		p.obj.scale.x = window.innerWidth;

	};

	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //



	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //

	// POPUP LOGIN

	UI.p.popup_login = {
		p: {},
		f: {}
	};



	UI.p.popup_login.f.button_login_data = function () {

		console.log("UI.p.popup_login.f.popup_login_data");

		if (UI.p.scene.OBJECTS.menu.OBJECTS.popup_login_data !== undefined) {

			VARCO.f.deleteElement(UI.p.scene.OBJECTS.menu, UI.p.scene.OBJECTS.menu.OBJECTS.popup_login_data);

		} else {

			UI.f.remove_menu_popups();

			VARCO.f.loadComplex(
				UI.p.scene.OBJECTS.menu,
				'json/popup_login_data.json',
				undefined,
				function init_popup_login_data(p) {
					PLY.f.resizeScreen();
				}
			);

		}

	};



	UI.p.popup_login.f.button_register = function () {

		console.log("UI.p.popup_login.f.button_register");

		if (UI.p.scene.OBJECTS.menu.OBJECTS.popup_register !== undefined) {

			VARCO.f.deleteElement(UI.p.scene.OBJECTS.menu, UI.p.scene.OBJECTS.menu.OBJECTS.popup_register);

		} else {

			UI.f.remove_menu_popups();

			VARCO.f.loadComplex(
				UI.p.scene.OBJECTS.menu,
				'json/popup_register.json',
				undefined,
				function init_popup_register(p) {
					PLY.f.resizeScreen();
				}
			);

		}

	};


	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //



	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //

	// POPUP LOGIN INSERT DATA

	UI.p.popup_login_data = {
		p: {
			user: '',
			password: '',
			data: undefined
		},
		f: {}
	};



	// TODO bring this function in svelte after the login is done
	UI.p.popup_login_data.f.button_login_ok = function () {

		UI.f.remove_menu_popups();

		const accountToLoad = 'USER_DB/' + UI.p.popup_login_data.p.user + '.json';

		VARCO.f.loadJSON(

			accountToLoad,

			function init_sectorData(logInData) {

				// refresh preview object //

				if (UI.p.scene.OBJECTS.previewProject !== undefined) {

					VARCO.f.deleteElement(UI.p.scene, UI.p.scene.OBJECTS.previewProject);

				}

				UI.p.popup_login_data.p.data = logInData;

				UI.p.menu_editor.f.open();

				PLY.p.geoMapSectors.oldSectHV = [0, 0];

			},

			function error_login() {

				alert('the account not exist')

			}

		);

	};


	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //



	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //

	// POPUP REGISTER

	UI.p.popup_register = {
		p: {
			name: '',
			surname: '',
			wallet: '',
			email: '',
			user: '',
			password: '',
			conf_password: ''
		},
		f: {}
	};



	UI.p.popup_register.f.button_register_ok = function () {

		console.log('UI.p.popup_register.f.button_register_ok');

		if (UI.p.popup_register.p.password !== '') {

			if (UI.p.popup_register.p.password == UI.p.popup_register.p.conf_password) {

				UI.f.remove_menu_popups();

				// auto login // 
				UI.p.popup_login_data.p.user = UI.p.popup_register.p.user;
				UI.p.popup_login_data.p.password = UI.p.popup_register.p.password;
				// ////////// //

				console.log('registered');

				const userProp = {
					"user": UI.p.popup_register.p.user,
					"name": UI.p.popup_register.p.name,
					"surname": UI.p.popup_register.p.surname,
					"wallet": UI.p.popup_register.p.wallet,
					"email": UI.p.popup_register.p.email,
					"geoareaList": []
				};

				EDITOR.f.saveUserData(userProp);

			} else {

				alert('error in your passwrod');

			}

		}

	};



	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //



	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //

	// POPUP ACCOUNT

	UI.p.popup_account = {
		p: {},
		f: {}
	};



	UI.p.popup_account.f.button_account = function () {

		console.log('UI.p.popup_account.f.button_account');

		if (UI.p.scene.OBJECTS.menu.OBJECTS.popup_account_data !== undefined) {

			VARCO.f.deleteElement(UI.p.scene.OBJECTS.menu, UI.p.scene.OBJECTS.menu.OBJECTS.popup_account_data);

		} else {

			UI.f.remove_menu_popups();

			VARCO.f.loadComplex(
				UI.p.scene.OBJECTS.menu,
				'json/popup_account_data.json',
				undefined,
				function init_popup_account_data(p) {
					PLY.f.resizeScreen();
				}
			);

		}

	};



	UI.p.popup_account.f.button_logout = function () {

		console.log('UI.p.popup_account.f.button_logout"');

		UI.f.remove_menu_popups();

		UI.p.popup_login_data.p.data = undefined;

		UI.p.menu_editor.f.close();

		EDITOR.f.deselectProjects();

		EDITOR.f.deselectGeoArea();

		PLY.p.geoMapSectors.oldSectHV = [0, 0];

		EDITOR.p.STATE = false; // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<

	};


	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //




	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //

	// POPUP ACCOUNT DATA

	UI.p.popup_account_data = {
		p: {},
		f: {}
	};


	UI.p.popup_account_data.f.open = function () {

		console.log('UI.p.popup_account.f.button_account');

		UI.f.remove_menu_popups();

		VARCO.f.loadComplex(
			UI.p.scene.OBJECTS.menu,
			'json/popup_account_data.json',
			undefined,
			function init_popup_account_data(p) {
				PLY.f.resizeScreen();
			}
		);

	};


	UI.p.popup_account_data.f.close = function () {

		console.log('UI.p.popup_account_data.f.button_close');

		UI.f.remove_menu_popups();

	};


	UI.p.popup_account_data.f.update = function () {

		console.log('UI.p.popup_account_data.f.update');

	};

	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //



	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //

	// EDITOR //


	UI.p.menu_editor = {
		f: {},
		p: {}
	}


	UI.p.menu_editor.f.open = function () {

		if (UI.p.scene.OBJECTS.menu_editor == undefined) {

			UI.f.remove_menu_popups();

			VARCO.f.loadComplex(
				UI.p.scene,
				'json/menu_editor.json',
				undefined,
				function init_menu_editor(p) {
					PLY.f.resizeScreen();

					EDITOR.p.STATE = true; // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<

				}
			);

		}

	};


	UI.p.menu_editor.f.close = function () {

		if (UI.p.scene.OBJECTS.menu_editor !== undefined) {

			VARCO.f.deleteElement(UI.p.scene, UI.p.scene.OBJECTS.menu_editor);

		}

	};


	UI.p.menu_editor.f.button_import = function () {

		if (EDITOR.p.dragAndDrop) {
			EDITOR.p.dragAndDrop = false;
		} else {
			EDITOR.p.dragAndDrop = true;
		}

	};


	UI.p.menu_editor.f.feedback = function (p) {

		if (EDITOR.p.dragAndDrop) {

			p.obj.OBJECTS.button_import.material.color.r = 1.0;
			p.obj.OBJECTS.button_import.material.color.g = 1.0;
			p.obj.OBJECTS.button_import.material.color.b = 0.0;

		} else {

			p.obj.OBJECTS.button_import.material.color.r = 1.0;
			p.obj.OBJECTS.button_import.material.color.g = 1.0;
			p.obj.OBJECTS.button_import.material.color.b = 1.0;

		}

	};

	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //



	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //

	// POPUP OPTIONS

	UI.p.popup_options = {
		f: {},
		p: {}
	}

	UI.p.popup_options.f.button_gpsPoints = function () {

		if (PLY.p.calibrationGPS_maxNumber == 1) {

			PLY.p.calibrationGPS_maxNumber = 5;

			PLY.p.calibrationGPS_list = [];

		} else {

			PLY.p.calibrationGPS_maxNumber = 1;

			PLY.p.calibrationGPS_list = [];

		}

	};

	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //



	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //

	// POPUP SEARCH

	UI.p.menu_top.f.openSearch = function () {

		console.log("UI.p.menu_top.f.openSearch");

		if (UI.p.scene.OBJECTS.menu.OBJECTS.search !== undefined) {

			VARCO.f.deleteElement(UI.p.scene.OBJECTS.menu, UI.p.scene.OBJECTS.menu.OBJECTS.search);

		} else {

			UI.f.remove_menu_popups();

			VARCO.f.loadComplex(
				UI.p.scene.OBJECTS.menu,
				'json/search.json',
				undefined,
				function init_search(p) {
					PLY.f.resizeScreen();
				}
			);

		}

	};


	UI.p.menu_top.f.closeSearch = function () {

		console.log("UI.p.menu_top.f.closeSearch");

		UI.f.remove_menu_popups();

	};


	UI.p.menu_top.f.search_ok = function () {

		console.log("UI.p.menu_top.f.search_ok");

		UI.f.remove_menu_popups();

		UI.f.goToAddressCoords();

	};


	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //


	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //

	// MENU BOTTOM

	UI.p.menu_bottom = {
		f: {},
		p: {
			popup_list: []
		}
	};


	UI.p.menu_bottom.f.button_GIS = function (p) {

		VARCO.f.deleteElement(PLY.p.sceneMAP, MAP.p.OBJ);

		PLY.p.addMap('GIS');

	};


	UI.p.menu_bottom.f.button_GM = function (p) {

		VARCO.f.deleteElement(PLY.p.sceneMAP, MAP.p.OBJ);

		PLY.p.addMap('GM');

	};


	UI.p.menu_bottom.f.button_OSM = function (p) {

		VARCO.f.deleteElement(PLY.p.sceneMAP, MAP.p.OBJ);

		PLY.p.addMap('OSM');

	};


	UI.p.menu_bottom.f.open = function () {

		VARCO.f.loadComplex(
			UI.p.scene,
			'json/menu_bottom.json',
			undefined,
			function init_menu_bottom(p) {
				UI.p.menu_bottom_OBJ = p.obj;
				PLY.f.resizeScreen();
			}
		);

	};


	UI.p.menu_bottom.f.loop = function (p) {

		p.obj.scale.x = window.innerWidth;

	};


	UI.p.menu_bottom.f.button_menu_area = function (p) {

		console.log("UI.p.menu_bottom.f.button_menu_area");

		if (UI.p.menu_area_OBJ !== undefined) {

			VARCO.f.deleteElement(UI.p.scene, UI.p.menu_area_OBJ);

			UI.p.menu_area_OBJ = undefined;

		} else {

			VARCO.f.loadComplex(
				UI.p.scene,
				'json/menu_area.json',
				undefined,
				function init_popup_area(p) {
					UI.p.menu_area_OBJ = p.obj;
					PLY.f.resizeScreen();
				}
			);

		}
	};



	UI.p.menu_bottom.f.button_posizione = function () {

		console.log("UI.p.menu_bottom.f.button_posizione");

		if (PLY.p.flagCOMPASS) {
			console.log();
		} else {

			if (UI.p.slider_icon_OBJ !== undefined) {

				VARCO.f.deleteElement(UI.p.scene, UI.p.slider_icon_OBJ);

				UI.p.slider_icon_OBJ = undefined;

				PLY.p.action = '';

			} else {

				PLY.p.action = 'position';

				VARCO.f.loadComplex(
					UI.p.scene,
					'json/slider_building.json',
					undefined,
					function init_slider_icon(p) {
						UI.p.slider_icon_OBJ = p.obj;
						PLY.f.resizeScreen();
					}
				);

			}

		}

	};


	UI.p.menu_bottom.f.button_rotazione = function () {

		console.log("UI.p.menu_bottom.f.button_rotazione");

		if (UI.p.slider_icon_OBJ !== undefined) {

			VARCO.f.deleteElement(UI.p.scene, UI.p.slider_icon_OBJ);

			UI.p.slider_icon_OBJ = undefined;

		}

		PLY.p.action = 'rotation';

	};


	UI.p.menu_bottom.f.button_drag = function () {

		console.log("UI.p.menu_bottom.f.button_rotazione");

		if (UI.p.slider_icon_OBJ !== undefined) {

			VARCO.f.deleteElement(UI.p.scene, UI.p.slider_icon_OBJ);

			UI.p.slider_icon_OBJ = undefined;

		}

		PLY.p.flagGPS = false;

		PLY.p.action = 'drag';

	};




	UI.p.menu_bottom.f.button_gpsView = function () {

		console.log("UI.p.menu_bottom.f.button_gpsView");

		if (MAP.p.OBJ.OBJECTS.tilesList.visible) {

			// switch on camera //

			PLY.p.sfondoBKG.MATERIALS.sfondoBKG_mat.visible = true;

			PLY.p.sfondoBKG.MATERIALS.sfondo_mat.visible = false;

			UI.p.menu_bottom_OBJ.OBJECTS.button_AR.visible = true;

			MAP.p.OBJ.OBJECTS.tilesList.visible = false;


			// MAP.p.actualCoords.alt = PLY.p.tripodHeight;

			PLY.p.camera3DAxis.userData.angX = 0.0;

			PLY.p.camera3DAxis.userData.angY = 0.0;

			PLY.p.camera3DAxis.userData.orbitRadius = 0.001;

			PLY.p.camera3DAxis.userData.orbitRadiusInt = 0.001;

			PLY.p.camera3DAxis.userData.minAngX = -189.0;


			PLY.p.camera3DAxis.OBJECTS.camera3D.position.x = 0.0;

			PLY.p.camera3DAxis.OBJECTS.camera3D.position.y = PLY.p.tripodHeight;

			PLY.p.camera3DAxis.OBJECTS.camera3D.position.z = 0.0;


			PLY.p.COMPASS.scale.x = 1.0;

			PLY.p.COMPASS.scale.y = 1.0;

			PLY.p.COMPASS.scale.z = 1.0;


			PLY.p.flagCOMPASS = true;

		} else {

			console.log("torna alla mappa");

			UI.p.menu_bottom_OBJ.OBJECTS.button_AR.visible = false;

			PLY.p.camera3DAxis.userData.angY = 0.0;

			// switch on camera //

			PLY.p.sfondoBKG.MATERIALS.sfondoBKG_mat.visible = false;

			PLY.p.sfondoBKG.MATERIALS.sfondo_mat.visible = true;

			UI.p.menu_bottom_OBJ.OBJECTS.button_AR.visible = false;

			MAP.p.OBJ.OBJECTS.tilesList.visible = true;


			PLY.p.camera3DAxis.userData.angY = 0.0;

			PLY.p.camera3DAxis.userData.angX = 30.0;

			PLY.p.camera3DAxis.userData.orbitRadius = 50;

			PLY.p.camera3DAxis.userData.orbitRadiusInt = 50;

			MAP.p.actualMapAltitude = 50;

			PLY.p.flagCOMPASS = false;


		}

	};



	UI.p.menu_bottom.f.checkAntennaStatusLoop = function (p) {

		console.log("checkAntennaStatusLoop")

		switch (PLY.p.qualityGPS) {

			case 0:

				p.obj.material.color.r = 1.0;
				p.obj.material.color.g = 0.0;
				p.obj.material.color.b = 0.0;

				break;

			case 1:

				p.obj.material.color.r = 1.0;
				p.obj.material.color.g = 0.3;
				p.obj.material.color.b = 0.0;

				break;

			case 2:

				p.obj.material.color.r = 0.8;
				p.obj.material.color.g = 0.8;
				p.obj.material.color.b = 0.0;

				break;

			case 3:

				p.obj.material.color.r = 0.3;
				p.obj.material.color.g = 0.8;
				p.obj.material.color.b = 0.0;

				break;

			case 4:

				p.obj.material.color.r = 0.0;
				p.obj.material.color.g = 1.0;
				p.obj.material.color.b = 0.0;

				break;

			default:

				p.obj.material.color.r = 0.3;
				p.obj.material.color.g = 0.3;
				p.obj.material.color.b = 0.3;

				break;


		}

	};



	UI.p.menu_bottom.f.button_gps_popup_open = function (p) {

		if (PLY.p.flagGPS) {

			PLY.p.flagGPS = false;

			PLY.p.qualityGPS = -1;

		} else {

			PLY.p.flagGPS = true;

			PLY.p.action = '';

			PLY.p.qualityGPS = 0;

		}

		PLY.p.calibrationGPS_list = [];

	};



	UI.p.menu_bottom.f.button_3dView = function (p) {

		console.log("UI.p.menu_bottom.f.button_3dView");

		if (PLY.p.flag3D == false) {

			PLY.p.camera3DAxis.MM3D.states = {
				"start": [
					{ "type": "userData", "parameter": "angX", "value": PLY.p.camera3DAxis.userData.angX }
				],

				"end": [
					{ "type": "userData", "parameter": "angX", "value": 0.5 },
					{ "type": "userData", "parameter": "orbitRadius", "value": 5.0 }
				]
			};

			PLY.p.camera3DAxis.MM3D.motions = {
				"landingToGeoArea": {
					"loop": false,
					"speed": 1.0,
					"stateList":
						[
							{
								"name": "start",
								"duration": 1
							},
							{
								"name": "end",
								"duration": 1000,
								"scriptList": [
									{
										"function": function (p) {

											// switch on camera //

											PLY.p.sfondoBKG.MATERIALS.sfondoBKG_mat.visible = false;

											MAP.p.OBJ.OBJECTS.tilesList.visible = true;

											PLY.p.sfondoBKG.MATERIALS.sfondo_mat.visible = true;

											UI.p.menu_bottom_OBJ.OBJECTS.button_AR.visible = true;


											PLY.p.flag3D = true;


											PLY.p.camera3DAxis.userData.minAngX = -189.0;

											PLY.p.camera3DAxis.userData.angX = 20.0;

											PLY.p.camera3DAxis.userData.orbitRadius = 5.0;

											PLY.p.camera3DAxis.userData.orbitRadiusInt = 5.0;

											UI.f.remove_menu_popups();

										}
									}
								]
							}
						]

				}

			};

			PLY.p.camera3DAxis.MM3D.playMotionList = ["landingToGeoArea"];

		} else {

			UI.p.menu_bottom_OBJ.OBJECTS.button_AR.visible = false;

			PLY.p.camera3DAxis.MM3D.states = {
				"start": [
					{ "type": "userData", "parameter": "angX", "value": PLY.p.camera3DAxis.userData.angX }
				],

				"end": [
					{ "type": "userData", "parameter": "angX", "value": 90.0 },
					{ "type": "userData", "parameter": "orbitRadius", "value": 200.0 }
				]
			};

			PLY.p.camera3DAxis.MM3D.motions = {
				"takeoff": {
					"loop": false,
					"speed": 1.0,
					"stateList":
						[
							{
								"name": "start",
								"duration": 1,
								"scriptList": [
									{
										"function": function (p) {

											// switch on camera //

											PLY.p.sfondoBKG.MATERIALS.sfondoBKG_mat.visible = false;

											MAP.p.OBJ.OBJECTS.tilesList.visible = true;

											PLY.p.sfondoBKG.MATERIALS.sfondo_mat.visible = true;

											UI.p.menu_bottom_OBJ.OBJECTS.button_AR.visible = false;

											PLY.p.camera3DAxis.userData.minAngX = 1.0;

											PLY.p.flag3D = false

										}
									}
								]
							},
							{
								"name": "end",
								"duration": 1000,
								"scriptList": [
									{
										"function": function (p) {


											PLY.p.camera3DAxis.userData.orbitRadius = 200.0;

											PLY.p.camera3DAxis.userData.orbitRadiusInt = 200.0;


											PLY.p.flag3D = false

										}
									}
								]
							}
						]

				}

			};

			PLY.p.camera3DAxis.MM3D.playMotionList = ["takeoff"];

		}

	};



	UI.p.menu_bottom.f.button_STV_desktop = function () {

		console.log("UI.p.menu_bottom.f.button_STV_desktop");

		MAP.p.OBJ.OBJECTS.tilesList.visible = true;

		if (PLY.p.flagSTVOn !== true) {

			PLY.p.flagSTVOn = true;

			PLY.p.flagDesktop = true;

			UI.f.remove_menu_popups();

			const newPosition = new window.google.maps.LatLng(
				{

					lat: MAP.p.actualCoords.lat,

					lng: MAP.p.actualCoords.lng

				}
			);

			window.panorama.setPosition(newPosition);

			PLY.f.resizeScreen();

		} else {

			PLY.p.flagSTVOn = false;

			PLY.p.flagDesktop = true;

			UI.f.remove_menu_popups();

			const newPosition = new window.google.maps.LatLng(
				{

					lat: MAP.p.actualCoords.lat,

					lng: MAP.p.actualCoords.lng

				}
			);

			window.panorama.setPosition(newPosition);

			PLY.f.resizeScreen();

		}


	};




	UI.p.menu_bottom.f.button_STV_touch = function () {

		console.log("UI.p.menu_bottom.f.button_STV_touch");

		MAP.p.OBJ.OBJECTS.tilesList.visible = true;

		if (PLY.p.flagSTVOn !== true) {

			PLY.p.flagSTVOn = true;

			PLY.p.flagDesktop = false;

			UI.f.remove_menu_popups();

			const newPosition = new window.google.maps.LatLng(
				{

					lat: MAP.p.actualCoords.lat,

					lng: MAP.p.actualCoords.lng

				}
			);

			window.panorama.setPosition(newPosition);

			PLY.f.resizeScreen();

		} else {

			PLY.p.flagSTVOn = false;

			PLY.p.flagDesktop = false;

			UI.f.remove_menu_popups();

			const newPosition = new window.google.maps.LatLng(
				{

					lat: MAP.p.actualCoords.lat,

					lng: MAP.p.actualCoords.lng

				}
			);

			window.panorama.setPosition(newPosition);

			PLY.f.resizeScreen();

		}

	};



	UI.p.menu_bottom.f.button_AR = function () {

		console.log("UI.p.menu_bottom.f.button_AR");

		if (VARCO.p.DEVICES.isIOS) {

			if (VARCO.p.DEVICES.isSafari) {

				if (PLY.p.selectedProjectName !== '') {

					let nomeFileOpera = PLY.p.selectedProjectName;

					const anchor = document.createElement('a');
					anchor.setAttribute('rel', 'ar');
					anchor.appendChild(document.createElement('img'));
					anchor.setAttribute('href', 'objects/' + nomeFileOpera + '.usdz');
					anchor.click();

				} else {

					alert('move closer to the project you want to watch in AR');
				}

			} else {

				alert("use Safari browser pls");

			}

		} else {

			PLY.p.flagCOMPASS = false;

			MAP.p.OBJ.OBJECTS.tilesList.visible = false;

			VARCO.f.webcamStreamingStop();

			VARCO.f.clickButton_AR();

		}

	};


	// menu bottom feedback

	UI.p.menu_bottom.f.feedBack_rot_pos_drag = function (p) {

		p.obj.OBJECTS.button_drag.material.color.r = 1.0;
		p.obj.OBJECTS.button_drag.material.color.g = 1.0;
		p.obj.OBJECTS.button_drag.material.color.b = 1.0;

		p.obj.OBJECTS.button_rotazione.material.color.r = 1.0;
		p.obj.OBJECTS.button_rotazione.material.color.g = 1.0;
		p.obj.OBJECTS.button_rotazione.material.color.b = 1.0;

		p.obj.OBJECTS.button_posizione.material.color.r = 1.0;
		p.obj.OBJECTS.button_posizione.material.color.g = 1.0;
		p.obj.OBJECTS.button_posizione.material.color.b = 1.0;

		switch (PLY.p.action) {

			case 'position':

				p.obj.OBJECTS.button_posizione.material.color.r = 1.0;
				p.obj.OBJECTS.button_posizione.material.color.g = 1.0;
				p.obj.OBJECTS.button_posizione.material.color.b = 0.0;

				break;

			case 'rotation':

				p.obj.OBJECTS.button_rotazione.material.color.r = 1.0;
				p.obj.OBJECTS.button_rotazione.material.color.g = 1.0;
				p.obj.OBJECTS.button_rotazione.material.color.b = 0.0;

				break;

			case 'drag':

				p.obj.OBJECTS.button_drag.material.color.r = 1.0;
				p.obj.OBJECTS.button_drag.material.color.g = 1.0;
				p.obj.OBJECTS.button_drag.material.color.b = 0.0;

				break;
		}



		if (PLY.p.flagSTVOn) {
			p.obj.OBJECTS.button_STV.material.color.r = 1.0;
			p.obj.OBJECTS.button_STV.material.color.g = 1.0;
			p.obj.OBJECTS.button_STV.material.color.b = 0.0;
		} else {
			p.obj.OBJECTS.button_STV.material.color.r = 1.0;
			p.obj.OBJECTS.button_STV.material.color.g = 1.0;
			p.obj.OBJECTS.button_STV.material.color.b = 1.0;
		}




		p.obj.OBJECTS.button_GM.material.color.r = 1.0;
		p.obj.OBJECTS.button_GM.material.color.g = 1.0;
		p.obj.OBJECTS.button_GM.material.color.b = 1.0;

		p.obj.OBJECTS.button_GIS.material.color.r = 1.0;
		p.obj.OBJECTS.button_GIS.material.color.g = 1.0;
		p.obj.OBJECTS.button_GIS.material.color.b = 1.0;

		p.obj.OBJECTS.button_OSM.material.color.r = 1.0;
		p.obj.OBJECTS.button_OSM.material.color.g = 1.0;
		p.obj.OBJECTS.button_OSM.material.color.b = 1.0;


		if (MAP.p.mapType == 'OSM') {

			p.obj.OBJECTS.button_OSM.material.color.r = 1.0;
			p.obj.OBJECTS.button_OSM.material.color.g = 1.0;
			p.obj.OBJECTS.button_OSM.material.color.b = 0.0;

		}


		if (MAP.p.mapType == 'GIS') {

			p.obj.OBJECTS.button_GIS.material.color.r = 1.0;
			p.obj.OBJECTS.button_GIS.material.color.g = 1.0;
			p.obj.OBJECTS.button_GIS.material.color.b = 0.0;

		}

		if (MAP.p.mapType == 'GM') {

			p.obj.OBJECTS.button_GM.material.color.r = 1.0;
			p.obj.OBJECTS.button_GM.material.color.g = 1.0;
			p.obj.OBJECTS.button_GM.material.color.b = 0.0;

		}


	};


	UI.p.menu_bottom.f.feedBack_menu_bottom = function (p) {

		if (PLY.p.flagCOMPASS) {
			p.obj.OBJECTS.button_view_in_3d.material.color.r = 1.0;
			p.obj.OBJECTS.button_view_in_3d.material.color.g = 1.0;
			p.obj.OBJECTS.button_view_in_3d.material.color.b = 0.0;
		} else {
			p.obj.OBJECTS.button_view_in_3d.material.color.r = 1.0;
			p.obj.OBJECTS.button_view_in_3d.material.color.g = 1.0;
			p.obj.OBJECTS.button_view_in_3d.material.color.b = 1.0;

		}

		if (PLY.p.flagGPS) {
			p.obj.OBJECTS.button_gps.material.color.r = 1.0;
			p.obj.OBJECTS.button_gps.material.color.g = 1.0;
			p.obj.OBJECTS.button_gps.material.color.b = 0.0;
		} else {
			p.obj.OBJECTS.button_gps.material.color.r = 1.0;
			p.obj.OBJECTS.button_gps.material.color.g = 1.0;
			p.obj.OBJECTS.button_gps.material.color.b = 1.0;
		}

	};

	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //



	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //

	// MENU ACCOUNT

	UI.p.menu_area_button_area = function () {

		console.log("UI.p.menu_area_button_area");

		EDITOR.f.deselectGeoArea();

		EDITOR.f.createGeoArea(
			false,
			function (p) {
				PLY.p.selectedArea = p.obj;
			},
			{}
		);

	};



	UI.p.menu_area_button_dragAndDrop = function () {

		console.log("UI.p.menu_area_button_dragAndDrop");

		if (UI.p.scene.OBJECTS.menu_area.OBJECTS.dragAndDrop.visible) {
			UI.p.scene.OBJECTS.menu_area.OBJECTS.dragAndDrop.visible = false;
			EDITOR.p.dragAndDrop = false;
		} else {
			UI.p.scene.OBJECTS.menu_area.OBJECTS.dragAndDrop.visible = true;
			EDITOR.p.dragAndDrop = true;
		}

	};


	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //

	// MENU SEARCH

	UI.p.menu_search = {
		f: {},
		p: {
			popup_list: []
		}
	};



	UI.p.menu_search.f.open = function () {

		VARCO.f.loadComplex(
			UI.p.scene,
			'json/popup_menu_search.json',
			undefined,
			function init_popup_menu_search(p) {
				UI.p.menu_search_OBJ = p.obj;
				PLY.f.resizeScreen();
			}
		);

	};

	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //


	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //

	// POI 2D MANAGER

	UI.f.clickOn_POI_geoArea = function (p) {

		let geoAreaObj = p.results.object.parent.userData.linkedObj;

		PLY.p.camera3DAxis.MM3D.states = {
			"start": [
				{ "type": "object", "parameter": "position", "value": { "x": PLY.p.camera3DAxis.position.x, "y": PLY.p.camera3DAxis.position.y, "z": PLY.p.camera3DAxis.position.z } }
			],

			"end": [
				{ "type": "object", "parameter": "position", "value": { "x": geoAreaObj.position.x, "y": geoAreaObj.position.y, "z": geoAreaObj.position.z } },
				{ "type": "userData", "parameter": "angX", "value": 25.0 },
				{ "type": "userData", "parameter": "orbitRadius", "value": 25.0 },
				{ "type": "userData", "parameter": "orbitRadiusInt", "value": 25.0 }
			]
		};

		PLY.p.camera3DAxis.MM3D.motions = {
			"landingToGeoArea": {
				"loop": false,
				"speed": 1.0,
				"stateList":
					[
						{
							"name": "start",
							"duration": 1
						},
						{
							"name": "end",
							"duration": 4000,
							"scriptList": [
								{
									"function": function (p) {

										// switch on camera //

										PLY.p.camera3DAxis.position.x = geoAreaObj.position.x;

										PLY.p.camera3DAxis.position.y = geoAreaObj.position.y;

										PLY.p.camera3DAxis.position.z = geoAreaObj.position.z;

										PLY.p.camera3DAxis.userData.angX = 25.0;

										PLY.p.camera3DAxis.userData.orbitRadius = 25.0;

										PLY.p.camera3DAxis.userData.orbitRadiusInt = 25.0;

										UI.f.remove_menu_popups();

									}
								}
							]
						}
					]

			}

		};

		PLY.p.camera3DAxis.MM3D.playMotionList = ["landingToGeoArea"];

	};


	UI.f.createGeoArea_POI = function (OBJ) {

		VARCO.f.addComplex(

			UI.p.scene.OBJECTS.poi,

			{
				"name": OBJ.name, //prop.geoAreaName,
				"userData": {
					"linkedObj": OBJ
				},
				"parameters": {

					"textureList": [
						{
							"name": "icona",
							"url": "images/UI/icona_poi_geoarea.png"
						}
					],

					"materialList": [
						{
							"type": "MeshBasicMaterial",
							"name": "icona",
							"parameters": {
								"textures": { "map": "icona" },
								"transparent": true
							}
						},
					],

					"elementList": [
						{
							"type": "addMesh",

							"prop": {

								"type": "PlaneGeometry",

								"name": "icona",

								"materialList": [
									"icona"
								],

								"parameters": {
									"width": 50,
									"height": 50
								},

								"position": {
									"x": 0.0,
									"y": 0.0,
									"z": 0.0
								},

								"MM3D": {

									"scriptList": [
										{
											"loop": true,
											"function": function LOOP_iconaPOI_geoarea(q) {

												if (MAP.p.zoomMap < 16) {
													q.obj.visible = true;
												} else {
													q.obj.visible = false;
												}

												let iconaPos = MAP.f.mapFrom3Dto2D(q.obj.parent.userData.linkedObj, PLY.p.camera3D, PLY.p.map.viewPort.width, PLY.p.map.viewPort.height);

												q.obj.parent.position.x = iconaPos.x;

												q.obj.parent.position.y = iconaPos.y;

											},
											"functionProp": {}
										}
									],

									"events": {
										"mouseup": {
											"scriptList": [
												{
													"functionName": "UI.f.clickOn_POI_geoArea",
													"functionProp": {}
												}
											]
										},
										"touchend": {
											"scriptList": [
												{
													"functionName": "UI.f.clickOn_POI_geoArea",
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

			function (k) {
				OBJ = k.obj;
			},
			{}
		);

	};

	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //



	// ///////////////////////////////////////////////// //
	// ///////////////////////////////////////////////// //

	// POI 2D MANAGER

	UI.p.slider_building = {
		f: {},
		p: {}
	}


	UI.p.slider_building.f.mousedown = function (p) {

		PLY.p.tripodHeight = p.results.uv.y * 300; // 10 piani, circa 300 mt 

	};

	UI.p.slider_building.f.mouseup = function (p) {

		PLY.p.tripodHeight = (1.0 - p.results.uv.y) * 300; // 10 piani, circa 300 mt 

	};

	UI.p.slider_building.f.mousemove = function (p) {

		if (VARCO.p.DEVICES.mouse.clickdown) {

			PLY.p.tripodHeight = (1.0 - p.results.uv.y) * 300; // 10 piani, circa 300 mt 

		}

	};

	UI.p.slider_building.f.touchstart = function (p) {

		PLY.p.tripodHeight = (1.0 - p.results.uv.y) * 300; // 10 piani, circa 300 mt 

	};

	UI.p.slider_building.f.touchend = function (p) {

		PLY.p.tripodHeight = (1.0 - p.results.uv.y) * 300; // 10 piani, circa 300 mt 

	};

	UI.p.slider_building.f.touchmove = function (p) {

		PLY.p.tripodHeight = (1.0 - p.results.uv.y) * 300; // 10 piani, circa 300 mt 

	};

	UI.p.slider_building.f.loop = function (p) {

	};



	UI.f.tapped = function (e) {

		document.body.removeEventListener('touchstart', PLY.f.tapped);

		document.body.removeEventListener('mousedown', PLY.f.clicked);

	};



	UI.f.tappedEnd = function (e) {

		e.preventDefault();

		PLY.f.startAllDeviceFunctions();

	};



	UI.f.clicked = function (e) {

		document.body.removeEventListener('mousedown', PLY.f.clicked);

		document.body.removeEventListener('touchstart', PLY.f.tapped);

	};



	UI.f.clickedEnd = function (e) {

		e.preventDefault();

		PLY.f.startAllDeviceFunctions();

	};



	UI.f.onSelectStart = function (e) {

	};



	UI.f.onSelectEnd = function (e) {


		if (VARCO.p.DEVICES.XR.isPlaying) {

			VARCO.f.clickButton_AR();

		}


		// MAP.p.OBJ.OBJECTS.tilesList.visible = false;

		PLY.p.camera3DAxis.rotation.x = PLY.p.camera3DAxis.rotation.y = PLY.p.camera3DAxis.rotation.z = 0.0;

		PLY.p.calibrationGPS_list = [];


		let worldPos = new THREE.Vector3();

		PLY.p.camera3D.getWorldPosition(worldPos);

		PLY.p.camera3DAxis.position.x = worldPos.x;

		PLY.p.camera3DAxis.position.z = worldPos.z;


		PLY.p.camera3D.position.x = 0.0;

		PLY.p.camera3D.position.y = 0.0;

		PLY.p.camera3D.position.z = 0.0;

		PLY.p.camera3D.rotation.x = PLY.p.camera3D.rotation.y = PLY.p.camera3D.rotation.z = 0.0;


		// PLY.p.flagGPS = true;

		PLY.p.flagCOMPASS = true;


		setTimeout(

			function () {

				VARCO.f.initWebCamera('environment', 640, 480);

				PLY.p.flagWebCamera = true;

			},
			1000

		);


	};

	return UI;
};


export default UISingleton;