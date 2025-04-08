import * as THREE from 'three';

export interface RoomObject {
    id: string;
    type: 'wall' | 'window' | 'door' | 'furniture';
    mesh: THREE.Mesh;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
}

export function createWall(position: THREE.Vector3, rotation: THREE.Euler = new THREE.Euler()): RoomObject {
    const geometry = new THREE.BoxGeometry(0.2, 3, 4);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.7,
        metalness: 0.2
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.rotation.copy(rotation);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return {
        id: `wall-${Date.now()}`,
        type: 'wall',
        mesh,
        position: mesh.position.clone(),
        rotation: mesh.rotation.clone(),
        scale: mesh.scale.clone()
    };
}

export function createWindow(position: THREE.Vector3, rotation: THREE.Euler = new THREE.Euler()): RoomObject {
    const geometry = new THREE.BoxGeometry(1.5, 1.5, 0.1);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.7
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.rotation.copy(rotation);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return {
        id: `window-${Date.now()}`,
        type: 'window',
        mesh,
        position: mesh.position.clone(),
        rotation: mesh.rotation.clone(),
        scale: mesh.scale.clone()
    };
}

export function createDoor(position: THREE.Vector3, rotation: THREE.Euler = new THREE.Euler()): RoomObject {
    const geometry = new THREE.BoxGeometry(1, 2.1, 0.1);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.5,
        metalness: 0.1
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.rotation.copy(rotation);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return {
        id: `door-${Date.now()}`,
        type: 'door',
        mesh,
        position: mesh.position.clone(),
        rotation: mesh.rotation.clone(),
        scale: mesh.scale.clone()
    };
}

export function updateObjectPosition(object: RoomObject, newPosition: THREE.Vector3) {
    object.mesh.position.copy(newPosition);
    object.position.copy(newPosition);
}

export function updateObjectRotation(object: RoomObject, newRotation: THREE.Euler) {
    object.mesh.rotation.copy(newRotation);
    object.rotation.copy(newRotation);
}

export function updateObjectScale(object: RoomObject, newScale: THREE.Vector3) {
    object.mesh.scale.copy(newScale);
    object.scale.copy(newScale);
}

export function exportRoomObjects(objects: RoomObject[]): string {
    return JSON.stringify(objects.map(obj => ({
        id: obj.id,
        type: obj.type,
        position: obj.position.toArray(),
        rotation: obj.rotation.toArray(),
        scale: obj.scale.toArray()
    })));
}

export function importRoomObjects(json: string, scene: THREE.Scene): RoomObject[] {
    const data = JSON.parse(json);
    return data.map((obj: any) => {
        let roomObject: RoomObject;
        const position = new THREE.Vector3().fromArray(obj.position);
        const rotation = new THREE.Euler().fromArray(obj.rotation);
        
        switch (obj.type) {
            case 'wall':
                roomObject = createWall(position, rotation);
                break;
            case 'window':
                roomObject = createWindow(position, rotation);
                break;
            case 'door':
                roomObject = createDoor(position, rotation);
                break;
            default:
                throw new Error(`Unknown object type: ${obj.type}`);
        }
        
        scene.add(roomObject.mesh);
        return roomObject;
    });
} 