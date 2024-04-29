// VARCO-MM3D PHYSIC

import * as THREE from 'three';
import { VARCO } from "./VARCO.js";

// VARCO.f.addButton(
// PLY.p.sceneUI,
// {
// "name" : "tastone",
// "parameters" : {
// "enabled" : true,
// "string" : "change value",
// //"variable" : "PLY.p.variabileTasto", // prende una variabile e la scrive nel tasto
// //"value" : 222, // tiene premuto il tasto se la variabile equivale al valore "value"
// "width" : 250
// },
// "MM3D" : {
// "events" : {
// "mouseup" : {
// "scriptList" : [
// {
// "functionName" : "PLY.f.tastoDown_onOff",
// "functionProp" : {}
// }
// ]
// }
// },
// "coordSystem" : "percent",
// "adaptive": {
// "posH" : {
// "x" : 0.6,
// "y" : 0.6,
// "z" : 10
// },
// "posV" : {
// "x" : 0.6,
// "y" : 0.6,
// "z" : 10
// }
// }
// }

// },
// function initTastone ( p ){

// PLY.p.tastone = p.obj;

// PLY.f.resizeScreen();

// }
// );

VARCO.f.addButton = function (SCENE, prop, callBack, callBackProp) {

	console.log("addButton");

	let parameters = {

		string: "BUTTON",
		enabled: true,
		width: 100,
		height: 25,
		variable: null,
		value: null,

		textures: {
			standard: "../common/ui/tasto_medio_standard.png",
			clicked: "../common/ui/tasto_medio_clicked.png",
			rollover: "../common/ui/tasto_medio_rollover.png",
			disabled: "../common/ui/tasto_medio_standard.png"
		},

		events: {

			"mousedown": {
				"scriptList": [
					{
						"function": function (p) {
							p.obj.material.map = p.obj.parent.TEXTURES.clicked;
							p.obj.material.needsUpdate = true;
						},
						"functionProp": {}
					}
				]
			},

			"mouseup": {
				"scriptList": [
					{
						"function": function (p) {
							p.obj.material.map = p.obj.parent.TEXTURES.standard;
							p.obj.material.needsUpdate = true;
						},
						"functionProp": {}
					}
				]
			},

			"dblclick": {
				"scriptList": [
					{
						"function": function (p) {
							p.obj.material.map = p.obj.parent.TEXTURES.standard;
							p.obj.material.needsUpdate = true;
						},
						"functionProp": {}
					}
				]
			},

			"touchstart": {
				"scriptList": [
					{
						"function": function (p) {
							p.obj.material.map = p.obj.parent.TEXTURES.clicked;
							p.obj.material.needsUpdate = true;
						},
						"functionProp": {}
					}
				]
			},

			"touchend": {
				"scriptList": [
					{
						"function": function (p) {
							p.obj.material.map = p.obj.parent.TEXTURES.standard;
							p.obj.material.needsUpdate = true;
						},
						"functionProp": {}
					}
				]
			}
		}

	};


	if (prop.parameters !== undefined) {
		parameters = VARCO.f.setParameters(parameters, prop.parameters);
	}


	let textParameters = {
		string: parameters.string,
		width: parameters.width,
		height: parameters.height,
		fontSize: '12pt',
		fontType: 'Verdana',
		textAlign: "center",
		textBaseline: "middle",
		textPosition: new THREE.Vector2(parameters.width * 0.5, parameters.height * 0.5),
		shadowEnabled: false,
		shadowBlur: 4,
		shadowColor: new THREE.Color(0, 0, 0),
		shadowOffset: new THREE.Vector2(2, 2),
		color: new THREE.Color(0, 0, 0),
		backDropColor: 'transparent'
	};


	if (prop == undefined) {
		prop = {};
	}

	if (prop.parameters !== undefined) {
		if (prop.parameters.textParameters !== undefined) {
			textParameters = VARCO.f.setParameters(textParameters, prop.parameters.textParameters);
		}
	}

	if (prop.MM3D !== undefined) {

		if (prop.MM3D.events !== undefined) {

			if (prop.MM3D.events.mousedown !== undefined) {

				parameters.events.mousedown.scriptList = parameters.events.mousedown.scriptList.concat(prop.MM3D.events.mousedown.scriptList)

			}

			if (prop.MM3D.events.mouseup !== undefined) {

				parameters.events.mouseup.scriptList = parameters.events.mouseup.scriptList.concat(prop.MM3D.events.mouseup.scriptList)

			}

			if (prop.MM3D.events.mousemove !== undefined) {

				parameters.events.mousemove.scriptList = parameters.events.mousemove.scriptList.concat(prop.MM3D.events.mousemove.scriptList)

			}

			if (prop.MM3D.events.touchstart !== undefined) {

				parameters.events.touchstart.scriptList = parameters.events.touchstart.scriptList.concat(prop.MM3D.events.touchstart.scriptList)

			}

			if (prop.MM3D.events.touchend !== undefined) {

				parameters.events.touchend.scriptList = parameters.events.touchend.scriptList.concat(prop.MM3D.events.touchend.scriptList)

			}

			if (prop.MM3D.events.touchmove !== undefined) {

				parameters.events.touchmove.scriptList = parameters.events.touchmove.scriptList.concat(prop.MM3D.events.touchmove.scriptList)

			}

		}

	}

	let textureList = [

		{
			"type": "string",
			"name": "text",
			"parameters": textParameters
		},

		{
			"type": "imageUrl",
			"name": "standard",
			"url": parameters.textures.standard
		},
		{
			"type": "imageUrl",
			"name": "clicked",
			"url": parameters.textures.clicked
		},
		{
			"type": "imageUrl",
			"name": "rollover",
			"url": parameters.textures.rollover
		},
		{
			"type": "imageUrl",
			"name": "disabled",
			"url": parameters.textures.disabled
		}

	];


	let materialList = [

		{
			"type": "MeshBasicMaterial",
			"name": "text",
			"parameters": {
				"color": { "r": 1.0, "g": 1.0, "b": 1.0 },
				"textures": { "map": "text" },
				"transparent": true
			}
		},

		{
			"type": "MeshBasicMaterial",
			"name": "BaseButton",
			"parameters": {
				"color": { "r": 1.0, "g": 1.0, "b": 1.0 },
				"textures": { "map": "standard" }
			}
		}

	];


	let elementList = [

		{
			"type": "addMesh",
			"prop": {
				"type": "PlaneGeometry",
				"name": "textButton",
				"materialList": ["text"],
				"parameters": {
					"width": parameters.width,
					"height": parameters.height
				},
				"position": {
					"x": 0.0,
					"y": 0.0,
					"z": 1.0
				},

				"MM3D": {
					"scriptList": [
						{
							"loop": true,

							"function": function (p) {

								if (parameters.enabled == false) {

									if (p.obj.parent.MATERIALS.BaseButton !== undefined) {

										p.obj.parent.MATERIALS.BaseButton.map = p.obj.parent.TEXTURES.disabled;

										p.obj.parent.MATERIALS.BaseButton.needsUpdate = true;

									}

								} else {

									if (parameters.variable !== null && parameters.variable !== undefined) {

										if (parameters.value !== null && parameters.value !== undefined) {

											// clicca in automatico il tasto se la variabile e' uguale al valore

											let checkString = VARCO.f.variableToString(parameters.variable);

											if (checkString == parameters.value) {

												if (p.obj.parent.MATERIALS.BaseButton !== undefined) {

													p.obj.parent.MATERIALS.BaseButton.map = p.obj.parent.TEXTURES.clicked;

													p.obj.parent.MATERIALS.BaseButton.needsUpdate = true;

												}

											} else {

												if (VARCO.p.DEVICES.mouse.clickDown == false && VARCO.p.DEVICES.touch.clickDown == false) {

													if (p.obj.parent.MATERIALS.BaseButton !== undefined) {

														p.obj.parent.MATERIALS.BaseButton.map = p.obj.parent.TEXTURES.standard;

														p.obj.parent.MATERIALS.BaseButton.needsUpdate = true;

													}

												}

											}


										} else {

											// aggiorna la stringa del tasto con i contenuti di una variabile

											VARCO.f.deleteTexture(

												p.obj.parent,

												p.obj.parent.TEXTURES.text,

												function (q) {

													textParameters.string = VARCO.f.variableToString(parameters.variable);

													p.obj.parent.MATERIALS.text.map.dispose();

													p.obj.parent.MATERIALS.text.needsUpdate = true;

													VARCO.f.addTexture(
														p.obj.parent,
														{
															"type": "string",
															"name": "text",
															"parameters": textParameters
														},
														function (w) {

															p.obj.parent.MATERIALS.text.map = w.obj;

															p.obj.parent.MATERIALS.text.needsUpdate = true;

														}
													)
												}
											);

										}
									}
								}
							}
						}
					]

				}
			}
		},

		{
			"type": "addMesh",
			"prop": {
				"type": "PlaneGeometry",
				"name": "BaseButton",
				"materialList": ["BaseButton"],
				"parameters": {
					"width": parameters.width,
					"height": parameters.height
				},
				"MM3D": {
					"events": parameters.events
				}
			}
		}

	];


	prop.parameters = {
		"textureList": textureList,
		"materialList": materialList,
		"elementList": elementList
	};

	VARCO.f.addComplex(
		SCENE,
		prop,
		callBack,
		callBackProp
	);

};






// VARCO.f.addField(
// PLY.p.sceneUI,
// {
// "name" : "fieldEditabileB",
// "parameters" : {
// "enabled" : true,
// "edit" : true,
// "isNumber" : true,
// "variable" : "PLY.p.variabileTasto",
// "width" : 128
// },
// "MM3D" : {
// "coordSystem" : "percent",
// "adaptive": {
// "posH" : {
// "x" : 0.6,
// "y" : 0.3,
// "z" : 10
// },
// "offsetH" : {
// "x" : 260,
// "y" : -50.0,
// "z" : 10
// },
// "posV" : {
// "x" : 0.6,
// "y" : 0.3,
// "z" : 10
// },
// "offsetV" : {
// "x" : 260,
// "y" : -50.0,
// "z" : 10
// }
// }
// }

// },
// function initTastone ( p ){

// PLY.p.fieldtwo = p.obj;

// PLY.f.resizeScreen();

// }
// )

VARCO.f.addField = function (SCENE, prop, callBack, callBackProp) {

	let parameters = {

		enabled: true,

		string: '',

		edit: false,
		isNumber: false,
		isDegree: false,
		trunc: 2,
		width: 100,
		height: 25,
		variable: null,
		value: null,

		transparent: false,

		textures: {
			standard: "../common/ui/field_piccolo.png",
			selected: "../common/ui/field_piccolo.png",
			disabled: "../common/ui/field_piccolo.png"
		}

	};


	if (prop.parameters !== undefined) {
		parameters = VARCO.f.setParameters(parameters, prop.parameters);
	}


	if (parameters.transparent) {
		parameters.opacity = 0.0;
	} else {
		parameters.opacity = 1.0;
	}


	let textParameters = {
		string: parameters.string,
		width: parameters.width,
		height: parameters.height,
		fontSize: '12pt',
		fontType: 'Verdana',
		textAlign: "center",
		textBaseline: "middle",
		textPosition: new THREE.Vector2(parameters.width * 0.5, parameters.height * 0.5),
		shadowEnabled: false,
		shadowBlur: 4,
		shadowColor: new THREE.Color(0, 0, 0),
		shadowOffset: new THREE.Vector2(2, 2),
		color: new THREE.Color(1, 1, 1),
		backDropColor: 'transparent'
	};


	if (prop == undefined) {
		prop = {};
	}

	if (prop.parameters !== undefined) {
		if (prop.parameters.textParameters !== undefined) {
			textParameters = VARCO.f.setParameters(textParameters, prop.parameters.textParameters);
		}
	}

	switch (textParameters.textAlign) {

		case "left":
			textParameters.textPosition = new THREE.Vector2(3, parameters.height * 0.5);

			break;

		case "right":
			textParameters.textPosition = new THREE.Vector2(parameters.width - 3, parameters.height * 0.5);

			break;

		case "center":
			textParameters.textPosition = new THREE.Vector2(parameters.width * 0.5, parameters.height * 0.5);

			break;

	}


	let textureList = [

		{
			"type": "string",
			"name": "text",
			"parameters": textParameters
		},
		{
			"type": "imageUrl",
			"name": "standard",
			"url": parameters.textures.standard
		},
		{
			"type": "imageUrl",
			"name": "selected",
			"url": parameters.textures.selected
		},
		{
			"type": "imageUrl",
			"name": "disabled",
			"url": parameters.textures.disabled
		}

	];

	let materialList = [

		{
			"type": "MeshBasicMaterial",
			"name": "text",
			"parameters": {
				"color": { "r": 1.0, "g": 1.0, "b": 1.0 },
				"textures": { "map": "text" },
				"transparent": true
			}
		},

		{
			"type": "MeshBasicMaterial",
			"name": "BaseField",
			"parameters": {
				"color": { "r": 1.0, "g": 1.0, "b": 1.0 },
				"textures": { "map": "standard" },
				"transparent": parameters.transparent,
				"opacity": parameters.opacity
			}
		}

	];


	let elementList = [

		{
			"type": "addMesh",
			"prop": {
				"type": "PlaneGeometry",
				"name": "textField",
				"materialList": ["text"],
				"parameters": {
					"width": parameters.width,
					"height": parameters.height
				},
				"position": {
					"x": 0.0,
					"y": 0.0,
					"z": 1.0
				},

				"MM3D": {
					"events": {
						"mouseup": {
							"scriptList": [
								{
									"function": function (p) {

										// se e' editabile seleziona il searchField di input:

										let fieldCanvas = document.getElementById("searchField_" + p.obj.uuid)

										if (fieldCanvas !== null) {

											fieldCanvas.focus();

										}

									},
									"functionProp": {}
								}
							]
						}

					},

					"scriptList": [
						{
							"loop": true,

							"function": function (p) {

								// crea canvas testo se non esiste gia':
								let fieldCanvas = document.getElementById("searchField_" + p.obj.uuid);

								let stringFromCanvas;

								if (fieldCanvas == undefined || fieldCanvas == null) {

									fieldCanvas = document.createElement('input');

									fieldCanvas.id = "searchField_" + p.obj.uuid;

									fieldCanvas.width = parameters.width

									fieldCanvas.height = parameters.height;

									fieldCanvas.style.zIndex = 0;

									fieldCanvas.style.textAlign = textParameters.textAlign;

									fieldCanvas.style.position = 'absolute';

									fieldCanvas.style.left = "-9999px";

									fieldCanvas.style.display = 'block'

									fieldCanvas.addEventListener('focus', function () {

										p.obj.parent.MATERIALS.BaseField.color.r = 1.0;
										p.obj.parent.MATERIALS.BaseField.color.g = 1.0;
										p.obj.parent.MATERIALS.BaseField.color.b = 0.0;

										p.obj.userData.isFocused = true;

									});

									fieldCanvas.addEventListener('blur', function () {

										p.obj.parent.MATERIALS.BaseField.color.r = 1.0;
										p.obj.parent.MATERIALS.BaseField.color.g = 1.0;
										p.obj.parent.MATERIALS.BaseField.color.b = 1.0;

										p.obj.userData.isFocused = false;

									});

									document.body.appendChild(fieldCanvas);

								}


								if (parameters.enabled == false) {

									p.obj.parent.MATERIALS.BaseField.map = p.obj.parent.TEXTURES.disabled;

									p.obj.parent.MATERIALS.BaseField.needsUpdate = true;

								} else {

									if (parameters.edit) {

										if (p.obj.userData.isFocused) {

											if (parameters.isNumber) {

												if (fieldCanvas.value !== "-") {

													stringFromCanvas = Number(fieldCanvas.value)

													// if ( parameters.isDegree ){

													// stringFromCanvas = VARCO.f.deg2rad( stringFromCanvas );

													// };

													if (Number.isInteger(stringFromCanvas) == false) {

														stringFromCanvas = stringFromCanvas.toFixed(parameters.trunc);

													}

													if (isNaN(stringFromCanvas)) {

														stringFromCanvas = 0;

														fieldCanvas.value = 0;

													}

												} else {

													stringFromCanvas = fieldCanvas.value;

												}

											} else {

												stringFromCanvas = fieldCanvas.value;

											}


											// aggiorna la stringa del tasto con i contenuti di una variabile

											if (parameters.variable !== null && parameters.variable !== undefined) {

												if (parameters.isDegree) {

													stringFromCanvas = VARCO.f.deg2rad(stringFromCanvas);

												}

												VARCO.f.valueToVariable(stringFromCanvas, parameters.variable);

											}

										} else {

											if (parameters.variable !== null && parameters.variable !== undefined) {

												if (parameters.isNumber) {

													fieldCanvas.value = Number(VARCO.f.variableToString(parameters.variable));

													if (parameters.isDegree) {

														fieldCanvas.value = VARCO.f.rad2deg(fieldCanvas.value);

													}

													if (Number.isInteger(fieldCanvas.value) == false) {

														fieldCanvas.value = Number(fieldCanvas.value).toFixed(parameters.trunc);

													}

												} else {

													fieldCanvas.value = VARCO.f.variableToString(parameters.variable);

												}

											}

										}

									}


									if (parameters.variable !== null && parameters.variable !== undefined) {

										// aggiorna la stringa del tasto con i contenuti di una variabile

										if (parameters.isNumber) {

											stringFromCanvas = Number(fieldCanvas.value);

											if (Number.isInteger(stringFromCanvas) == false) {

												stringFromCanvas = stringFromCanvas.toFixed(parameters.trunc);

											}

										} else {

											stringFromCanvas = fieldCanvas.value;

										}


										VARCO.f.deleteTexture(

											p.obj.parent,

											p.obj.parent.TEXTURES.text,

											function (q) {

												textParameters.string = stringFromCanvas, //VARCO.f.variableToString( parameters.variable );

													p.obj.parent.MATERIALS.text.map.dispose();

												p.obj.parent.MATERIALS.text.needsUpdate = true;

												VARCO.f.addTexture(
													p.obj.parent,
													{
														"type": "string",
														"name": "text",
														"parameters": textParameters
													},
													function (w) {

														p.obj.parent.MATERIALS.text.map = w.obj;

														p.obj.parent.MATERIALS.text.needsUpdate = true;

													}
												)
											}
										);

									}
								}

							}
						}
					]

				}
			}
		},

		{
			"type": "addMesh",
			"prop": {
				"type": "PlaneGeometry",
				"name": "BaseField",
				"materialList": ["BaseField"],
				"parameters": {
					"width": parameters.width,
					"height": parameters.height
				},
				"MM3D": {
					"events": parameters.events
				}
			}
		}

	];

	prop.parameters = {
		"textureList": textureList,
		"materialList": materialList,
		"elementList": elementList
	};

	VARCO.f.addComplex(
		SCENE,
		prop,
		callBack,
		callBackProp
	);

};




// VARCO.f.addSlider( 
// PLY.p.sceneUI,
// {
// "name" : "slider",
// "parameters" : {
// "width" : 10,
// "height" : 80,
// "inverse" : false,
// "min" : -50,
// "trunc" : 4,
// "max" : 75,
// "value" : 23,
// "variable" : "PLY.p.variabileTasto"
// },
// },
// function initTastone ( p ){

// PLY.p.fieldtwo = p.obj;

// PLY.f.resizeScreen();

// }, 
// {}
// );


VARCO.f.addSlider = function (SCENE, prop, callBack, callBackProp) {


	let parameters = {

		width: 100,
		height: 10,

		marker_width: 10,
		marker_height: 10,

		trunc: 2,
		inverse: false,

		min: 0.0,
		max: 100.0,
		variable: null,
		value: 50.0,

		textures: {
			marker: "../common/ui/slider_marker.png",
			sliderH: "../common/ui/slider_horizontal.png",
			sliderV: "../common/ui/slider_vertical.png"
		}
	};


	if (prop.parameters !== undefined) {
		parameters = VARCO.f.setParameters(parameters, prop.parameters);
	}

	console.log(parameters)


	if (prop == undefined) {
		prop = {};
	}


	let textureList = [

		{
			"type": "imageUrl",
			"name": "sliderH",
			"url": parameters.textures.sliderH
		},

		{
			"type": "imageUrl",
			"name": "sliderV",
			"url": parameters.textures.sliderV
		},

		{
			"type": "imageUrl",
			"name": "marker",
			"url": parameters.textures.marker
		}

	];


	let materialList = [

		{
			"type": "MeshBasicMaterial",
			"name": "slider",
			"parameters": {
				"color": { "r": 1.0, "g": 1.0, "b": 1.0 },
				"textures": { "map": "sliderH" }
			}
		},

		{
			"type": "MeshBasicMaterial",
			"name": "marker",
			"parameters": {
				"color": { "r": 1.0, "g": 1.0, "b": 1.0 },
				"textures": { "map": "marker" },
				"transparent": true
			}
		}

	];


	// controlla dimensione slider:

	let rotation;

	if (parameters.width > parameters.height) {

		// orizzontale
		materialList[0].parameters.textures.map = "sliderH";
		parameters.isHorizontal = true;

	} else {

		// verticale
		materialList[0].parameters.textures.map = "sliderV";
		parameters.isHorizontal = false;

	}


	let elementList = [

		{
			"type": "addMesh",
			"prop": {
				"type": "PlaneGeometry",
				"name": "slider",
				"materialList": ["slider"],
				"parameters": {
					"width": parameters.width,
					"height": parameters.height
				},
				"position": {
					"x": 0.0,
					"y": 0.0,
					"z": 0.0
				},

				"MM3D": {
					"events": {

						"mousedown": {
							"scriptList": [
								{
									"function": function (p) {

										if (parameters.isHorizontal) {

											let X = p.results.uv.x;

											if (parameters.inverse) {

												X = 1.0 - p.results.uv.x;

											}

											parameters.value = parameters.min + ((parameters.max - parameters.min) * X);

										} else {

											let Y = p.results.uv.y;

											if (parameters.inverse) {

												Y = 1.0 - p.results.uv.y;

											}

											parameters.value = parameters.min + ((parameters.max - parameters.min) * Y);

										}

										if (parameters.variable !== null && parameters.variable !== undefined) {

											if (Number.isInteger(parameters.value) == false) {
												parameters.value = parameters.value.toFixed(parameters.trunc);
											}

											VARCO.f.valueToVariable(parameters.value, parameters.variable);

										}

									},
									"functionProp": {}
								}
							]
						},

						"mouseup": {
							"scriptList": [
								{
									"function": function (p) {

										if (parameters.isHorizontal) {

											let X = p.results.uv.x;

											if (parameters.inverse) {

												X = 1.0 - p.results.uv.x;

											}

											parameters.value = parameters.min + ((parameters.max - parameters.min) * X);

										} else {

											let Y = p.results.uv.y;

											if (parameters.inverse) {

												Y = 1.0 - p.results.uv.y;

											}

											parameters.value = parameters.min + ((parameters.max - parameters.min) * Y);

										}

										if (parameters.variable !== null && parameters.variable !== undefined) {

											if (Number.isInteger(parameters.value) == false) {
												parameters.value = parameters.value.toFixed(parameters.trunc);
											}

											VARCO.f.valueToVariable((parameters.value), parameters.variable);

										}

									},
									"functionProp": {}
								}
							]
						},

						"mousemove": {
							"scriptList": [
								{
									"function": function (p) {

										if (VARCO.p.DEVICES.mouse.clickDown) {

											if (parameters.isHorizontal) {

												let X = p.results.uv.x;

												if (parameters.inverse) {

													X = 1.0 - p.results.uv.x;

												}

												parameters.value = parameters.min + ((parameters.max - parameters.min) * X);

											} else {

												let Y = p.results.uv.y;

												if (parameters.inverse) {

													Y = 1.0 - p.results.uv.y;

												}

												parameters.value = parameters.min + ((parameters.max - parameters.min) * Y);

											}

											if (parameters.variable !== null && parameters.variable !== undefined) {

												if (Number.isInteger(parameters.value) == false) {
													parameters.value = parameters.value.toFixed(parameters.trunc);
												}

												VARCO.f.valueToVariable((parameters.value), parameters.variable);

											}

										}

									},
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
				"type": "PlaneGeometry",
				"name": "marker",
				"materialList": ["marker"],
				"parameters": {
					"width": parameters.marker_width,
					"height": parameters.marker_height
				},
				"position": {
					"x": 0.0,
					"y": 0.0,
					"z": 1.0
				},
				"MM3D": {
					"scriptList": [
						{
							"loop": true,

							"function": function (p) {

								let value, new_value, dir;

								if (parameters.variable !== null && parameters.variable !== undefined) {

									value = Number(VARCO.f.variableToString(parameters.variable))

									if (Number.isInteger(value) == false) {
										value = value.toFixed(parameters.trunc);
									}

								} else {

									value = (parameters.value)

									if (Number.isInteger(value) == false) {
										value = value.toFixed(parameters.trunc);
									}

								}

								if (value > parameters.max) {

									value = parameters.max;

								}

								if (value < parameters.min) {

									value = parameters.min;

								}


								if (parameters.inverse) {

									new_value = 1.0 - value;

									dir = -1;

								} else {

									new_value = value;

									dir = 1;

								}


								if (parameters.isHorizontal) {

									p.obj.position.x = (parameters.width * ((new_value - parameters.min) / (parameters.max - parameters.min))) - (parameters.width * 0.5) // + ( parameters.marker_width * dir );

								} else {

									p.obj.position.y = (parameters.height * ((new_value - parameters.min) / (parameters.max - parameters.min))) + (parameters.height * 0.5) // + ( parameters.marker_height * dir );

								}

								p.obj.parent.userData.value = new_value;

							}
						}
					]
				}
			}
		}

	];

	prop.parameters = {
		"textureList": textureList,
		"materialList": materialList,
		"elementList": elementList
	};

	if (prop.userData == undefined) {
		prop.userData = { value: 0.0 };
	}

	VARCO.f.addComplex(
		SCENE,
		prop,
		callBack,
		callBackProp
	);

};




// VARCO.f.addList(
// PLY.p.sceneUI,
// {
// "name" : "lista",
// "parameters" : {
// "list" : [  "pippo", "pelo", "cacca", "bue" , "sti", "cazzi", "estremas", "razio", "zio", "povco", "pluto", "minnie", "gioan", "bala" ],
// "buttonsVariable" : "PLY.p.nameSelectedIntheList",
// "min" : 0,
// "max" : 10
// },
// "MM3D" : {
// "coordSystem" : "percent",
// "adaptive": {
// "posH" : {
// "x" : 0.5,
// "y" : 0.5,
// "z" : 10
// },
// "offsetH" : {
// "x" : 0.0,
// "y" : 0.0,
// "z" : 10
// },
// "posV" : {
// "x" : 0.5,
// "y" : 0.5,
// "z" : 10
// },
// "offsetH" : {
// "x" : 0.0,
// "y" : 0.0,
// "z" : 10
// }
// }
// }
// }

// )


VARCO.f.addList = function (SCENE, prop, callBack, callBackProp) {

	let parameters = {
		list: [],
		offsetStart: 0,
		maxNumVisible: 10,
		buttonsVariable: undefined,
		variable: undefined,
		width: 100,
		height: 10
	};

	if (prop.parameters !== undefined) {
		parameters = VARCO.f.setParameters(parameters, prop.parameters);
	}

	if (parameters.variable !== undefined) {
		parameters.list = VARCO.f.variableToString(parameters.variable);
	}

	prop.userData = { "itemNum": 0 };

	let materialList = [
		{
			"type": "MeshBasicMaterial",
			"name": "backdroplist",
			"parameters": {
				"color": { "r": 0.25, "g": 0.25, "b": 0.25 }
			}
		}
	]

	let elementList = [

		{
			"type": "addMesh",
			"prop": {
				"type": "PlaneGeometry",
				"name": "backdrop",
				"materialList": ["backdroplist"],
				"parameters": {
					"width": parameters.width + 20,
					"height": ((parameters.maxNumVisible + 1) * (parameters.height)) + (parameters.height)

				},
				"position": {
					"x": 0.0,
					"y": 0.0,
					"z": 0.0
				}
			}
		},

		{
			"type": "addSlider",
			"prop": {
				"name": "slider",
				"parameters": {
					"width": 10,
					"height": ((parameters.maxNumVisible + 1) * (parameters.height)),
					"inverse": true,
					"min": 1,
					"max": parameters.maxNumVisible,
					"value": 0
				},
				"position": {
					"x": (parameters.width * 0.5) + 7,
					"y": 0.0,
					"z": 2.0
				}
			}
		}
	];


	let counter = 0;

	if (parameters.list.length > 0) {

		parameters.list.forEach(
			function (ele) {

				console.log(parameters)

				elementList.push(
					{
						"type": "addButton",
						"prop": {
							"name": "list_" + counter,
							"userData": { "val": counter, "enabled": true },
							"parameters": {
								"enabled": true,
								"string": ele,
								"variable": parameters.buttonsVariable,
								"value": counter,
								"width": parameters.width,
								"height": parameters.height,
								"textParameters": {
									"fontSize": "10px"
								}
							},
							"position": {
								"x": 0,
								"y": (((parameters.maxNumVisible) * (parameters.height) * 0.5) - (parameters.height * 0.5)) + (counter * (parameters.height) * -1),
								"z": 0
							},
							"MM3D": {
								"events": {
									"mouseup": {
										"scriptList": [
											{
												"function": function (p) {
													if (p.obj.parent.userData.enabled) {
														const LIST = p.obj.parent.parent;
														LIST.userData.itemNum = p.obj.parent.userData.val;
													}
												},
												"functionProp": {}
											}
										]
									}
								},
								"scriptList": [
									{
										"loop": true,
										"function": function (p) {

											let counter = p.obj.userData.val;
											let offset = p.obj.parent.OBJECTS.slider.userData.value;

											p.obj.position.y = (((parameters.maxNumVisible) * (parameters.height) * 0.5) - (parameters.height * 0.5)) + (counter * (parameters.height) * -1) - ((offset) * (parameters.height + 1));

											if (p.obj.position.y < ((parameters.maxNumVisible) * (parameters.height) * -0.5)) {
												p.obj.visible = false;
												p.obj.userData.enabled = false;
											} else {
												if (p.obj.position.y > ((parameters.maxNumVisible) * (parameters.height) * 0.5)) {
													p.obj.visible = false;
													p.obj.userData.enabled = false;
												} else {
													p.obj.visible = true;
													p.obj.userData.enabled = true;
												}
											}

										}
									}

								]
							}
						}
					}
				);

				counter += 1;

			}
		);

	}


	// console.log( elementList );

	// external events for buttons

	if (prop.MM3D == undefined) {
		prop.MM3D = {};
	}

	// da sistemare
	if (prop.MM3D.events !== undefined) {

		elementList.forEach(
			function (butt) {

				if (butt.prop.MM3D !== undefined) {

					if (butt.prop.MM3D.events !== undefined) {

						if (butt.prop.MM3D.events.mouseup !== undefined) {

							if (prop.MM3D.events.mouseup !== undefined) {

								butt.prop.MM3D.events.mouseup.scriptList = butt.prop.MM3D.events.mouseup.scriptList.concat(prop.MM3D.events.mouseup.scriptList);

							}

						}

					}

				}

			}
		)
	}

	prop.parameters = {
		"materialList": materialList,
		"elementList": elementList
	};


	VARCO.f.addComplex(
		SCENE,
		prop,
		callBack,
		callBackProp
	);


};


VARCO.f.addText = function () {

};


VARCO.f.addColorPicker = function () {

};

