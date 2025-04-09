<script lang="ts">
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
    import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
    import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
    import { spinnerStore } from '../../store/SpinnerStore';
    import { messageStore } from '../../store/MessageStore';

    export let onClose: () => void;
    export let onImport: (data: any) => void;

    let fileInput: HTMLInputElement;
    let dropZone: HTMLElement;
    let isDragging = false;

    function handleFileSelect() {
        fileInput.click();
    }

    function handleDragEnter(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        isDragging = true;
    }

    function handleDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        isDragging = true;
    }

    function handleDragLeave(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        isDragging = false;
    }

    async function handleDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        isDragging = false;
        
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return;
        
        await processFile(files[0]);
    }

    async function handleFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        await processFile(input.files[0]);
    }

    async function processFile(file: File) {
        try {
            spinnerStore.setLoading(true);
            let fileType: string | undefined;
            let fileInfo: string | undefined;

            // Determina il tipo di file
            if (file.type.match(/image.*/)) {
                fileType = "image";
                if (file.name.includes(".png")) {
                    fileInfo = "image/png";
                }
                if (file.name.includes(".jpg")) {
                    fileInfo = "image/jpg";
                }
            } else if (file.type.match(/text.*/)) {
                fileType = "txt";
            } else if (file.type.match(/json.*/)) {
                fileType = "json";
            } else if (file.type.match(/audio.*/)) {
                fileType = "audio";
            } else if (file.type.match(/video.*/)) {
                fileType = "video";
            } else if (file.name.includes(".obj")) {
                fileType = "obj";
            } else if (file.name.includes(".gltf")) {
                fileType = "gltf";
            } else if (file.name.includes(".glb")) {
                fileType = "glb";
            } else if (file.name.includes(".zip")) {
                fileType = "zip";
            }

            if (!fileType) {
                messageStore.setMessage('Formato file non supportato', 'error');
                spinnerStore.setLoading(false);
                return;
            }

            const reader = new FileReader();

            // Gestione dei diversi tipi di file
            switch (fileType) {
                case "image":
                    reader.onload = function(e) {
                        const img = document.createElement('img');
                        img.src = e.target?.result as string;
                        img.onload = function() {
                            onImport({
                                obj: img,
                                name: file.name,
                                data: img.src
                            });
                            spinnerStore.setLoading(false);
                        };
                    };
                    reader.readAsDataURL(file);
                    break;

                case "video":
                    reader.onload = function(e) {
                        const video = document.createElement('video');
                        video.src = e.target?.result as string;
                        onImport({
                            obj: video,
                            name: file.name,
                            data: video.src
                        });
                        spinnerStore.setLoading(false);
                    };
                    reader.readAsDataURL(file);
                    break;

                case "obj":
                    reader.onload = function(e) {
                        const contents = e.target?.result as string;
                        const object = new OBJLoader().parse(contents);
                        onImport({
                            obj: object,
                            name: file.name,
                            data: contents
                        });
                        spinnerStore.setLoading(false);
                    };
                    reader.readAsText(file);
                    break;

                case "gltf":
                case "glb":
                    reader.onload = async function(e) {
                        const contents = e.target?.result;
                        const loader = new GLTFLoader();
                        if (fileType === "glb") {
                            const dracoLoader = new DRACOLoader();
                            loader.setDRACOLoader(dracoLoader);
                        }
                        
                        loader.parse(contents as ArrayBuffer, '', function(result) {
                            const scene = result.scene;
                            if (result.animations) {
                                scene.animations.push(...result.animations);
                            }
                            onImport({
                                obj: scene,
                                name: file.name,
                                data: contents
                            });
                            spinnerStore.setLoading(false);
                        });
                    };
                    reader.readAsArrayBuffer(file);
                    break;

                default:
                    messageStore.setMessage('Formato file non supportato', 'error');
                    spinnerStore.setLoading(false);
                    break;
            }
        } catch (error) {
            console.error('Errore durante il caricamento del file:', error);
            messageStore.setMessage('Errore durante il caricamento del file', 'error');
            spinnerStore.setLoading(false);
        }
    }
</script>

<div class="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm">
    <div class="bg-black border border-white/30 rounded-lg shadow-2xl w-full max-w-lg p-6 animate-fadeIn">
        <div class="flex justify-between items-center mb-4 border-b border-white/20 pb-3">
            <h2 class="text-white text-xl font-bold">Importa un modello 3D</h2>
            <button on:click={onClose} class="text-white/60 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <div class="text-white/90 mb-6 space-y-4">
            <p>Puoi importare i tuoi modelli 3D nei seguenti formati:</p>
            
            <ul class="list-disc pl-5 space-y-1">
                <li>OBJ (.obj)</li>
                <li>FBX (.fbx)</li>
                <li>glTF (.gltf, .glb)</li>
                <li>STL (.stl)</li>
                <li>PLY (.ply)</li>
            </ul>
            
            <!-- Drop zone area -->
            <div 
                bind:this={dropZone}
                on:dragenter={handleDragEnter}
                on:dragover={handleDragOver}
                on:dragleave={handleDragLeave}
                on:drop={handleDrop}
                class="{isDragging ? 'bg-white/10 border-white/40' : 'bg-white/5 border-white/10'} p-6 rounded-md border-2 border-dashed transition-colors text-center cursor-pointer"
            >
                <div class="flex flex-col items-center justify-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-white/70">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <p class="font-medium">Trascina qui i tuoi file o</p>
                    <button 
                        on:click={handleFileSelect}
                        class="px-4 py-2 rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                        Seleziona File
                    </button>
                </div>
            </div>
            
            <div class="bg-white/5 p-3 rounded-md border border-white/10">
                <p class="text-sm flex items-start">
                    <span class="inline-block mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-white">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                    </span>
                    Per risultati ottimali, assicurati che il tuo modello sia orientato correttamente e abbia una dimensione appropriata.
                </p>
            </div>
        </div>
        
        <div class="flex gap-3 justify-end">
            <button 
                on:click={onClose}
                class="px-4 py-2 rounded-md border border-white/20 text-white hover:bg-white/10 transition-colors"
            >
                Annulla
            </button>
        </div>
    </div>
</div>

<!-- Input file nascosto -->
<input 
    type="file" 
    bind:this={fileInput}
    on:change={handleFileChange}
    accept=".obj,.fbx,.gltf,.glb,.stl,.ply,.png,.jpg,.jpeg,.mp4"
    class="hidden"
/>

<style>
    .animate-fadeIn {
        animation: fadeIn 0.2s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
</style>