// VARCO COMPASS/GPS

import { VARCO } from "./VARCO.js";




// states:
// {
// "stepA" : [
// { "type" : "object", "parameter" : "position", "value" : { "y" : 100 } },
// { "type" : "object", "parameter" : "rotation", "value" : { "x" : 45, "y" : 180, "z" : 90 } },
// { "type" : "material", "parameter" : "color", "value" : { "r" : 1.0, "g" : 0.35, "b" : 0.2} }
// ],

// "stepB" : [
// { "type" : "object", "parameter" : "position", "value" : { "y" : 150 } },
// { "type" : "object", "parameter" : "rotation", "value" : { "x" : 45, "y" : 200 } }
// ],

// "stepC" : [
// { "type" : "object", "parameter" : "position", "value" : { "x" : 80, "y" : 0, "z" : 44 } },
// { "type" : "object", "parameter" : "rotation", "value" : { "x" : 0, "y" : 0, "z" : 0 } }
// ],

// "stepD" : [
// { "type" : "object", "parameter" : "position", "value" : { "x" : 0, "y" : 0, "z" : 0  } },
// { "type" : "object", "parameter" : "rotation", "value" : { "x" : 45, "y" : 180, "z" : 90 } },
// { "type" : "material", "parameter" : "color", "value" : { "r" : 1.0, "g" : 1.0, "b" : 1.0 } }
// ],

// }

// motions: {
// "motionciccio" : {
// "speed" : 1, 		// opzionale
// "loop" : true, 		// opzionale
// "toAllChildren" : true, // opzionale
// "stateList" : [
// { "name" : "stepA", "duration" : 210 },
// { "name" : "stepB", "duration" : 300 },
// { "name" : "stepC", "duration" : 50, "scriptList" : [] },
// { "name" : "stepD", "duration" : 600 }
// ]
// }
// }


VARCO.f.updateMotion = function (node, motionName, motionProp) {

	let OBJ;

	if (motionProp.stateNum == undefined) {

		if (node.MM3D.isPlayingMotion !== undefined) {
			if (node.MM3D.isPlayingMotion !== motionName) {

				for (var w = 0; w < motionProp.stateList.length; w++) {
					delete motionProp.stateList[w].actualTime;
					delete motionProp.stateList[w].endTime;
					delete motionProp.stateList[w].startTime;
					delete motionProp.stateList[w].startList;
					delete motionProp.stateList[w].targetList;
					delete node.MM3D.isPlayingMotion
				}

				node.MM3D.isPlayingMotion = motionName;

			}
		} else {
			node.MM3D.isPlayingMotion = motionName;

		}

		motionProp.stateNum = 0;
	}

	// copia delle proprieta' dello stato index stateNum dell'array della stateList del motion
	// --> stateNum = 0 --> { "name" : "stepA", "duration" : 210 }

	let motionStateProp = motionProp.stateList[motionProp.stateNum];

	// copia delle proprieta' dello stato
	// "stepA" : [
	// { "type" : "object", "parameter": "position", "value": { "y" : 100 } },
	// { "type" : "object", "parameter":"rotation", "value": { "x" : 45, "y" : 180, "z" : 90 } },
	// { "type" : "material", "parameter": "color", "value": { "r" : 1.0, "g" : 0.35, "b" : 0.2} }
	// ],

	let motionStateList = node.MM3D.states[motionStateProp.name];

	// init get value from initial state of the element

	if (motionStateProp.startTime == undefined) {

		if (motionProp.interpolation == undefined) {
			motionProp.interpolation = 1.0;
		}

		// time:
		motionStateProp.startTime = new Date().getTime();
		motionStateProp.endTime = new Date().getTime() + (motionStateProp.duration / motionProp.speed);

		// values:
		motionStateProp.startList = [];
		motionStateProp.targetList = [];
		motionStateProp.interpolation = {};

		let value;
		let targetValue;
		let propParametersList;
		let propValueList;

		for (var i = 0; i < motionStateList.length; i++) {

			switch (motionStateList[i].type) {

				case "transform":
					OBJ = node;
					break;

				case "texture":
					OBJ = node.material.map;
					break;

				case "material":
					OBJ = node.material
					break;

				case "userData":
					OBJ = node.userData;
					break;

				default:
					OBJ = node;

			}

			if (typeof motionStateList[i].value === 'object') {
				value = {};
				targetValue = {};
				propValueList = Object.keys(motionStateList[i].value);
				for (var j = 0; j < propValueList.length; j++) {
					value[propValueList[j]] = OBJ[motionStateList[i].parameter][propValueList[j]];
					if (motionStateList[i].parameter == "rotation") {
						targetValue[propValueList[j]] = VARCO.f.deg2rad(motionStateList[i].value[propValueList[j]]);
					} else {
						targetValue[propValueList[j]] = motionStateList[i].value[propValueList[j]];
					}
				}
			} else {
				value = OBJ[motionStateList[i].parameter];
				targetValue = motionStateList[i].value;

			}

			motionStateProp.startList.push( 	// valori di partenza
				{
					OBJ: OBJ,
					parameter: motionStateList[i].parameter,
					value: value
				}
			);

			motionStateProp.interpolation[motionStateList[i].parameter] = value;

			motionStateProp.targetList.push(  	// valori target
				{
					value: targetValue,
					scriptList: motionStateList[i].scriptList
				}
			);

		}

	}


	let perc;

	// update values:
	motionStateProp.actualTime = new Date().getTime();

	if (motionProp.speed > 0) {
		perc = (motionStateProp.actualTime - motionStateProp.startTime) / (motionStateProp.duration / Math.abs(motionProp.speed));
		// perc = ( motionStateProp.actualTime - motionStateProp.startTime ) / ( motionStateProp.duration / Math.abs( motionProp.speed ) );
	} else {
		perc = 1.0 - ((motionStateProp.actualTime - motionStateProp.startTime) / (motionStateProp.duration / Math.abs(motionProp.speed)));
	}



	if (perc > 1.0 || perc < 0.0) { // fine step motion			

		if (motionStateProp.scriptList !== undefined) { // do function when action is finished
			for (var w = 0; w < motionStateProp.scriptList.length; w++) {
				motionStateProp.scriptList[w].functionProp = { obj: node }
			}
			VARCO.f.doScriptList(motionStateProp.scriptList);
		}


		let propEndValueList;

		for (var i = 0; i < motionStateProp.targetList.length; i++) {

			if (typeof motionStateProp.targetList[i].value === 'object') {

				propEndValueList = Object.keys(motionStateList[i].value);

				for (var j = 0; j < propEndValueList.length; j++) {
					if (motionProp.speed > 0) {

						motionStateProp.startList[i].OBJ[motionStateProp.startList[i].parameter][propEndValueList[j]] = motionStateProp.startList[i].value[propEndValueList[j]] + ((motionStateProp.targetList[i].value[propEndValueList[j]] - motionStateProp.startList[i].value[propEndValueList[j]]) * perc);

					} else {

						motionStateProp.startList[i].OBJ[motionStateProp.startList[i].parameter][propEndValueList[j]] = motionStateProp.targetList[i].value[propEndValueList[j]] + ((motionStateProp.startList[i].value[propEndValueList[j]] - motionStateProp.targetList[i].value[propEndValueList[j]]) * perc);
					}
				}

			} else {

				motionStateProp.startList[i].OBJ[motionStateProp.startList[i].parameter] = motionStateProp.startList[i].value + ((motionStateProp.targetList[i].value - motionStateProp.startList[i].value) * perc);

			}

		}

		// next state or finish
		if (motionProp.speed > 0) {

			motionProp.stateNum += 1;
			motionStateProp.startTime = undefined;

			if (motionProp.stateNum > motionProp.stateList.length - 1) {

				if (motionProp.loop) {

					if (perc > 1.0) {
						perc = perc - 1.0;
					} else {
						perc = perc + 1.0;
					}

					motionProp.stateNum = 0;

				} else {

					if (perc > 1.0) {
						perc = 1.0;
					} else {
						perc = 0.0;
					}

					// togli motion dall'animazione
					for (var w = 0; w < node.MM3D.playMotionList.length; w++) {
						if (node.MM3D.playMotionList[w] === motionName) {
							node.MM3D.playMotionList.splice(w, 1);
							break;
						}
					}

					motionProp.stateNum = undefined;
					//motionStateProp.startTime = undefined;
					motionProp.interpolation = undefined;

				}

			}

		} else {

			motionProp.stateNum -= 1;
			motionStateProp.startTime = undefined;

			if (motionProp.stateNum < 0) {

				if (motionProp.loop) {

					if (perc > 1.0) {
						perc = perc - 1.0;
					} else {
						perc = perc + 1.0;
					}

					motionProp.stateNum = motionProp.stateList.length - 1;

				} else {

					if (perc > 1.0) {
						perc = 1.0;
					} else {
						perc = 0.0;
					}

					// togli motion dall'animazione
					for (var w = 0; w < node.MM3D.playMotionList.length; w++) {
						if (node.MM3D.playMotionList[w] === motionName) {
							node.MM3D.playMotionList.splice(w, 1);
							break;
						}
					}

					motionProp.stateNum = undefined;
					//motionStateProp.startTime = undefined;
					motionProp.interpolation = undefined;

				}
			}

		}

	} else {

		// calcoli interpolazione valori

		let propValueList;

		let targetVal;

		for (var i = 0; i < motionStateProp.targetList.length; i++) {

			if (typeof motionStateProp.targetList[i].value === 'object') {

				propValueList = Object.keys(motionStateList[i].value);


				if (motionStateProp.startList[i].OBJ.name == "tasto_2") {
					// console.log( propValueList );
				}

				for (var j = 0; j < propValueList.length; j++) {

					targetVal = motionStateProp.startList[i].value[propValueList[j]] + ((motionStateProp.targetList[i].value[propValueList[j]] - motionStateProp.startList[i].value[propValueList[j]]) * perc);

					motionStateProp.startList[i].OBJ[motionStateProp.startList[i].parameter][propValueList[j]] = VARCO.f.mathInterpolateTo(motionStateProp.startList[i].OBJ[motionStateProp.startList[i].parameter][propValueList[j]], targetVal, motionProp.interpolation);

				}

			} else {

				targetVal = motionStateProp.startList[i].value + ((motionStateProp.targetList[i].value - motionStateProp.startList[i].value) * perc);

				motionStateProp.startList[i].OBJ[motionStateProp.startList[i].parameter] = VARCO.f.mathInterpolateTo(motionStateProp.startList[i].OBJ[motionStateProp.startList[i].parameter], targetVal, motionProp.interpolation);

			}

		}

	}

};



VARCO.f.addStates = function (node, states) {

	// init states map

	if (node.MM3D == undefined) {
		node.MM3D = { states: {} };
	} else {
		if (node.MM3D.states == undefined) {
			node.MM3D.states = {};
		}
	}

	let propList = Object.keys(states);

	for (var i = 0; i < propList.length; i++) {
		if (node.MM3D.states[propList[i]] == undefined) {
			node.MM3D.states[propList[i]] = states[propList[i]]
		} else {
			//console.log( "stato = " +  propList[ i ] + " non inserito perche' gia' presente lo stesso nome" );
		}
	}

};



VARCO.f.addMotions = function (node, motions) {

	//console.log( "addMotions" )

	// init motions map

	if (node.MM3D == undefined) {
		node.MM3D = { motions: {} };
	} else {
		if (node.MM3D.motions == undefined) {
			node.MM3D.motions = {};
		}
	}

	let propList = Object.keys(motions);

	for (var i = 0; i < propList.length; i++) {
		if (node.MM3D.motions[propList[i]] == undefined) {
			node.MM3D.motions[propList[i]] = motions[propList[i]]
		} else {
			//console.log( "motions = " +  propList[ i ] + " non inserito perche' gia' presente lo stesso nome" );
		}
	}

};

// //////////////////////////////////////////////////////
// //////////////////////////////////////////////////////
