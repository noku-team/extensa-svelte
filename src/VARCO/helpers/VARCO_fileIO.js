/* eslint-disable no-cond-assign */
/* eslint-disable no-case-declarations */
/* eslint-disable no-undef */
/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */
// VARCO EVENTS MODULE:

import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { VARCO } from "./VARCO.js";

// ///////////////////////////////////////////////
// insert scripts for save and zip in the main document of the html page
var new_script = document.createElement('script');
new_script.setAttribute('src', '../libs/jszip/jszip.js');

document.head.appendChild(new_script);

var new_script = document.createElement('script');
new_script.setAttribute('src', '../libs/filesaverjs/FileSaver.js');

document.head.appendChild(new_script);
// ///////////////////////////////////////////////


// ///////////////////////////////////////////////
// 	 				DROP ZONE	 				//
// ///////////////////////////////////////////////

// VARCO.f.initDropZone( renderer.domElement );

VARCO.f.initDropZone = function (DIV, callback, callbackprop) {

	// Optional.   Show the copy icon when dragging over.  Seems to only work for chrome.
	DIV.addEventListener('dragover', function (e) {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';
	});

	// Get file data on drop
	DIV.addEventListener('drop', function (e) {
		e.stopPropagation();
		e.preventDefault();
		var files = e.dataTransfer.files; // Array of all files

		console.log(files);

		let fileType;

		let fileInfo;

		let loader;

		for (var i = 0, file; file = files[i]; i++) {

			if (file.type.match(/image.*/)) {
				fileType = "image"
				if (file.name.includes(".png")) {
					fileInfo = "image/png";
				}
				if (file.name.includes(".jpg")) {
					fileInfo = "image/jpg";
				}
			}

			if (file.type.match(/text.*/)) {
				fileType = "txt"
			}

			if (file.type.match(/json.*/)) {
				fileType = "json"
			}

			if (file.type.match(/audio.*/)) {
				fileType = "audio"
			}

			if (file.type.match(/video.*/)) {
				fileType = "video"
			}

			if (file.name.includes(".obj")) {
				fileType = "obj"
			}

			if (file.name.includes(".gltf")) {
				fileType = "gltf"
			};
			
			if ( file.name.includes(".glb") ){
				fileType = "glb"
			};

			if (file.name.includes(".zip")) {
				fileType = "zip"
			};

			console.log(file.type);
			console.log(fileType);

			let name = file.name;

			var reader = new FileReader();

			switch (fileType) {

				case "audio":

					reader.onload = function (e2) {

						// finished reading file data.
						var audio = document.createElement('audio');
						audio.src = e2.target.result;

						// audio.play();

						if (callback !== undefined) {
							if (callbackprop == undefined) {
								callbackprop = { obj: null, data: null }
							}
							callbackprop.obj = audio;
							callbackprop.name = name;
							callbackprop.info = fileInfo;
							callbackprop.data = audio.src;

							callback(callbackprop);
						}

					};

					reader.readAsDataURL(file); // start reading the file data.

					break;


				case "video":

					reader.onload = function (e2) {

						// finished reading file data.
						var video = document.createElement('video');
						video.src = e2.target.result;
						
						video.onload = function(){
							
							console.log( "go go go " )


							// let TEXTURE = new THREE.VideoTexture( video );

							if (callback !== undefined) {
								if (callbackprop == undefined) {
									callbackprop = { obj: null }
								}
								callbackprop.obj = video;
								callbackprop.name = name;
								callbackprop.data = video.src;

								callback(callbackprop);
							}

						};
						// TEXTURE.image.play();

					};

					reader.readAsDataURL(file); // start reading the file data.

					break;


				case "image":

					reader.onload = function (e2) {

						// finished reading file data.
						var img = document.createElement('img');
						img.src = e2.target.result;
						
						img.onload = function(){
							
							console.log( "go go go " )

							// let TEXTURE = new THREE.Texture();

							// TEXTURE.image = img;
							// TEXTURE.needsUpdate = true;
							// TEXTURE.name = name;

							if (callback !== undefined) {
								if (callbackprop == undefined) {
									callbackprop = { obj: null }
								}
								callbackprop.obj = img;
								callbackprop.name = name;
								callbackprop.data = img.src;

								callback(callbackprop);
							}
						
						}

					};

					reader.readAsDataURL(file); // start reading the file data.

					break;


				case "json":

					reader.onload = function (e2) {

						// finished reading file data.
						var txt = document.createElement('text');
						txt.innerText = event.target.result;
						const obj = JSON.parse(txt.innerText);

						if (callback !== undefined) {
							if (callbackprop == undefined) {
								callbackprop = { obj: null }
							}
							callbackprop.obj = obj;
							callbackprop.name = name;
							callbackprop.data = txt.innerText;

							callback(callbackprop);
						}

					};

					reader.readAsText(file);

					break;


				case "txt":

					reader.onload = function (e2) {

						// finished reading file data.
						var txt = document.createElement('text');
						txt.innerText = event.target.result;

						if (callback !== undefined) {
							if (callbackprop == undefined) {
								callbackprop = { obj: null }
							}
							callbackprop.obj = txt.innerText;
							callbackprop.name = name;
							callbackprop.data = txt.innerText;

							callback(callbackprop);
						}

					};

					reader.readAsText(file);

					break;


				case "obj":

					reader.addEventListener('load', async function (event) {

						var contents = event.target.result;
						var object = new OBJLoader().parse(contents);

						if (callback !== undefined) {
							if (callbackprop == undefined) {
								callbackprop = { obj: null }
							}
							callbackprop.obj = object;
							callbackprop.name = name;
							callbackprop.data = contents;

							callback(callbackprop);
						}

					}, false);

					reader.readAsText(file);

					break;


				case "gltf":

					reader.addEventListener(
						'load',
						async function (event) {

							var contents = event.target.result;
							var loader;

							loader = new GLTFLoader();

							// console.log( '/////////////////////' );
							// console.log( contents );

							// let stringByte64 = VARCO.f.arrayBufferToBase64( contents );

							// console.log( stringByte64 );
							// console.log( '/////////////////////' );

							// let newContents = VARCO.f.base64ToArrayBuffer( stringByte64 );

							loader.parse(contents, '', function (result) {

								var scene = result.scene;

								if (result.animations !== undefined) {
									scene.animations.push(...result.animations);
								}

								if (callback !== undefined) {
									if (callbackprop == undefined) {
										callbackprop = { obj: null }
									}
									callbackprop.obj = scene;
									callbackprop.name = name;
									callbackprop.data = contents;

									callback(callbackprop);
								}

							});

						},
						false
					);

					reader.readAsArrayBuffer(file);

					break;
					
					
				case "glb" :
	
					reader.addEventListener(
						'load', 
						async function ( event ) {

							var contents = event.target.result;
							
							loader = new GLTFLoader();
							
							const dracoLoader = new DRACOLoader();
							
							// if ( prop.parameters !== undefined ){
								
								// if ( prop.parameters.setDecoderPath !== undefined ){
									// dracoLoader.setDecoderPath( prop.parameters.setDecoderPath );
								// };
								
								// if ( prop.parameters.setDecoderConfig !== undefined ){
									// dracoLoader.setDecoderConfig( prop.parameters.setDecoderConfig );
								// };

								// loader.setDRACOLoader( dracoLoader );
								
							// };
							
							loader.setDRACOLoader( dracoLoader );
							
							
							loader.parse( contents, '', function ( result ) {

								var scene = result.scene;
			
								if ( result.animations !== undefined ){
									scene.animations.push( ...result.animations );
								}
					
								if ( callback !== undefined ){
									if ( callbackprop == undefined ){
										callbackprop = { obj: null }
									};
									callbackprop.obj = scene;
									callbackprop.name = name;
									callbackprop.data = contents;
									
									callback( callbackprop );
								};
								
							} );

						}, 
						false
					);
					
					reader.readAsArrayBuffer( file );
				
				break;


				case "zip":

					if (VARCO.p.zipData == undefined) {

						VARCO.f.initDataZIP();

					}


					VARCO.p.zipData.loadAsync(file).then(

						function (zip) {

							console.log(zip);

							if (callback !== undefined) {
								if (callbackprop == undefined) {
									callbackprop = {}
								}

								console.log(name);

								callbackprop.name = name;
								callbackprop.data = zip;
								callback(callbackprop);

							}

						}

					);

					break;

			}

		}
	});

};



VARCO.f.removeDropZone = function (DIV, callback, callbackprop) { // TO TEST TO TEST TO TEST

	DIV.removeEventListener('dragover');

	DIV.removeEventListener('drop');


	if (callback !== undefined) {

		if (callbackprop == undefined) {
			callbackprop = { obj: null }
		}

		callback(callbackprop);

	}

};


// ///////////////////////////////////////////////
// 	 				  ZIP   	 				//
// ///////////////////////////////////////////////


VARCO.f.initDataZIP = function () {

	VARCO.p.zipData = new JSZip();

	VARCO.p.zipList = [];

};


VARCO.f.writeDataIntoZIP = function (folderName, fileName, data, callback, callbackprop) {

	if (VARCO.p.zipData == undefined) {
		VARCO.f.initDataZIP();
	}

	let filetype;

	if (fileName.includes("json")) {
		filetype = "json";
	}

	if (fileName.includes("mp3")) {
		filetype = "audio";
	}

	if (fileName.includes("wav")) {
		filetype = "audio";
	}

	if (fileName.includes("mp4")) {
		filetype = "video";
	}

	if (fileName.includes("obj")) {
		filetype = "obj";
	}

	if (fileName.includes("gltf")) {
		filetype = "gltf";
	}

	if (fileName.includes("png") || fileName.includes("jpg") || fileName.includes("jpeg")) {
		filetype = "image";
	}

	switch (filetype) {

		case "json":

			var jsonString = JSON.stringify(data, null, 2);

			VARCO.p.zipData.file(folderName + fileName, jsonString);

			break;

		case "audio":

			var base64Audio = data;

			VARCO.p.zipData.file(folderName + fileName, base64Audio.substr(base64Audio.indexOf(',') + 1), { base64: true });


			break;

		case "video":

			var base64Video = data;

			VARCO.p.zipData.file(folderName + fileName, base64Video.substr(base64Video.indexOf(',') + 1), { base64: true });


			break;

		case "obj":

			var jsonString = JSON.stringify(data, null, 2);

			VARCO.p.zipData.file(folderName + fileName, data);

			break;

		case "gltf":

			VARCO.p.zipData.file(folderName + fileName, data);

			break;

		case "image":

			var base64Image = data;

			VARCO.p.zipData.file(folderName + fileName, base64Image.substr(base64Image.indexOf(',') + 1), { base64: true });

			break;

	}


	if (callback !== undefined) {
		if (callbackprop == undefined) {
			callbackprop = {}
		}
		callback(callbackprop);
	}


};


VARCO.f.readDataFromListZIP = function (zipList, zipListNum, callback, callbackprop) {

	let filename = zipList[zipListNum].name;
	let filetype = '';

	if (filename.includes("json")) {
		filetype = "json";
	}

	if (filename.includes("mp3")) {
		filetype = "audio";
	}

	if (filename.includes("wav")) {
		filetype = "audio";
	}

	if (filename.includes("mp4")) {
		filetype = "video";
	}

	if (filename.includes("obj")) {
		filetype = "obj";
	}

	if (filename.includes("gltf")) {
		filetype = "gltf";
	}

	if (filename.includes("png") || filename.includes("jpg") || filename.includes("jpeg")) {
		filetype = "image";
	}


	let object;


	switch (filetype) {

		case "json":

			console.log(zipList[zipListNum].data);

			// object =  JSON.parse( zipList[ zipListNum ].data );

			object = zipList[zipListNum].data;

			if (callback !== undefined) {
				if (callbackprop == undefined) {
					callbackprop = { obj: null }
				}
				callbackprop.filename = filename;
				callbackprop.type = 'json';
				callbackprop.obj = '';
				callbackprop.data = zipList[zipListNum].data;

				callback(callbackprop);
			}

			break;

		case "obj":

			object = new OBJLoader().parse(zipList[zipListNum].data);

			if (callback !== undefined) {
				if (callbackprop == undefined) {
					callbackprop = { obj: null }
				}
				callbackprop.filename = filename;
				callbackprop.type = 'obj';
				callbackprop.obj = object;
				callbackprop.data = zipList[zipListNum].data;

				callback(callbackprop);
			}


			break;

		case "gltf":

			loader = new GLTFLoader();
			loader.parse(
				zipList[zipListNum].data,
				'',
				function (result) {
					object = result.scene;

					if (result.animations !== undefined) {
						object.animations.push(...result.animations);
					}

				}
			);

			if (callback !== undefined) {
				if (callbackprop == undefined) {
					callbackprop = { obj: null }
				}
				callbackprop.filename = filename;
				callbackprop.type = 'gltf';
				callbackprop.obj = object;
				callbackprop.data = zipList[zipListNum].data;

				callback(callbackprop);
			}


			break;

		case "image":

			let image = new Image();
			image.src = zipList[zipListNum].data; // base64data
			image.onload = function () {

				if (callback !== undefined) {
					if (callbackprop == undefined) {
						callbackprop = { obj: null }
					}
					callbackprop.filename = filename;
					callbackprop.type = 'image';
					callbackprop.image = image;
					callbackprop.data = zipList[zipListNum].data;

					callback(callbackprop);
				}

			};

			break;

		case "audio":

			var audio = document.createElement('audio');
			audio.src = zipList[zipListNum].data;

			// audio.play();

			if (callback !== undefined) {
				if (callbackprop == undefined) {
					callbackprop = { obj: null, data: null }
				}
				callbackprop.filename = filename;
				callbackprop.type = 'audio';
				callbackprop.audio = audio;
				callbackprop.data = callbackprop.data = zipList[zipListNum].data;

				callback(callbackprop);
			}

			break;

		case "video":

			var video = document.createElement('video');
			video.src = zipList[zipListNum].data;

			if (callback !== undefined) {
				if (callbackprop == undefined) {
					callbackprop = { obj: null }
				}
				callbackprop.filename = filename;
				callbackprop.type = 'video';
				callbackprop.video = video;
				callbackprop.data = video.src;

				callback(callbackprop);
			}

			break;

		case "txt":

			break;

	}

};



// convert filedata of zip file into zipList ( array list );

VARCO.f.parserZIP = function (zip, callback, callbackprop) {

	// caricato il file ZIP , legge al suo interno ogni file presente
	let supportedFileFormat = false;
	let counter = 0;
	let isLoadedCounter = 0;
	let loader;
	let zipList = [];


	counter = Object.keys(zip.files).length;


	Object.keys(zip.files).forEach(
		function (filename) {

			supportedFileFormat = false;

			let filetype;

			let readerB;


			if (filename.includes("json")) {
				filetype = "json";
			}

			if (filename.includes("obj")) {
				filetype = "obj";
			}

			if (filename.includes("gltf")) {
				filetype = "gltf";
			}

			if (filename.includes("png") || filename.includes("jpg") || filename.includes("jpeg")) {
				filetype = "image";
			}

			switch (filetype) {

				case "image":

					supportedFileFormat = true;

					readerB = new FileReader();

					zip.files[filename].async('blob').then(

						function (fileData) {

							readerB.onloadend = function () {

								var base64data = readerB.result;

								zipList.push({ name: filename, data: base64data });

								isLoadedCounter = isLoadedCounter + 1;

								console.log(isLoadedCounter + " of " + counter);

								if (isLoadedCounter == counter) {
									if (callback !== undefined) {
										if (callbackprop == undefined) {
											callbackprop = { data: null }
										}
										callbackprop.fileName = filename;
										callbackprop.type = filetype;
										callbackprop.data = zipList;
										callback(callbackprop);

										return zipList;
									}
								}

							}

							readerB.readAsDataURL(fileData);

						}
					);

					break;

				case "json":

					supportedFileFormat = true;

					zip.files[filename].async('string').then(
						function (fileData) {

							if (zipList !== undefined) {
								zipList.push({ name: filename, data: JSON.parse(fileData) })
							}

							isLoadedCounter = isLoadedCounter + 1;

							console.log(isLoadedCounter + " of " + counter);

							if (isLoadedCounter == counter) {
								if (callback !== undefined) {
									if (callbackprop == undefined) {
										callbackprop = { data: null }
									}
									callbackprop.fileName = filename;
									callbackprop.type = filetype;
									callbackprop.data = zipList;
									callback(callbackprop);

									return zipList;
								}
							}

						}
					);

					break;

				case "obj":

					supportedFileFormat = true;

					zip.files[filename].async('string').then(

						function (fileData) {

							var object = new OBJLoader().parse(fileData)

							if (zipList !== undefined) {
								zipList.push({ name: filename, data: object })
							}

							isLoadedCounter = isLoadedCounter + 1;

							console.log(isLoadedCounter + " of " + counter);

							if (isLoadedCounter == counter) {
								if (callback !== undefined) {
									if (callbackprop == undefined) {
										callbackprop = { data: null }
									}
									callbackprop.fileName = filename;
									callbackprop.type = filetype;
									callbackprop.data = zipList;
									callback(callbackprop);

									return zipList;
								}
							}

						}

					);

					break;

				case "gltf":

					supportedFileFormat = true;

					readerB = new FileReader();

					zip.files[filename].async('blob').then(

						function (fileData) {

							readerB.addEventListener(

								'load',

								async function (event) {

									let gltfData = event.target.result;

									loader = new GLTFLoader();

									loader.parse(
										gltfData,
										'',
										function (result) {
											var scene = result.scene;

											if (result.animations !== undefined) {
												scene.animations.push(...result.animations);
											}

											if (zipList !== undefined) {
												zipList.push({ name: filename, data: scene })
											}

											isLoadedCounter = isLoadedCounter + 1;

											console.log(isLoadedCounter + " of " + counter);

											if (isLoadedCounter == counter) {

												if (callback !== undefined) {
													if (callbackprop == undefined) {
														callbackprop = { data: null }
													}
													callbackprop.fileName = filename;
													callbackprop.type = filetype;
													callbackprop.data = zipList;
													callback(callbackprop);

												}

											}

										}
									);

								},
								false
							);

							readerB.readAsArrayBuffer(fileData)

						}
					);

					break;

			}

			if (supportedFileFormat == false) {
				console.log(isLoadedCounter + " of " + counter);
				isLoadedCounter = isLoadedCounter + 1;
			}

		});

};




VARCO.f.saveZip = function (zip, fileName) {

	console.log("saveZip");

	zip.generateAsync({ type: "blob" })
		.then(function (content) {
			// see FileSaver.js
			saveAs(content, fileName);
		});

};




/* Export-Save text */
VARCO.f.saveInfo = function (text, filename) {

	var a = document.createElement('a');
	a.setAttribute('href', 'data:text/plain;charset=utf-u,' + encodeURIComponent(text));
	a.setAttribute('download', filename);
	a.click()

};




VARCO.f.fromFileToComplex = function (OBJ, prop) {

	let p = {
		maxTextureSize: 2048, // null 
		textureCompression: 0.5, // 0.0 - 1.0
		geometryCompression: 1.0, // 0.0 - 1.0
		elementList: [] // [ { name: "head", "textureSize" : { "width" : 128, "height" : 128 }, geometryCompression: 0.75 }, { ... } ... ]
	};

};
