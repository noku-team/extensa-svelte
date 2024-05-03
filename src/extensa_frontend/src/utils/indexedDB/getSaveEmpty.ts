interface Project {
    id: string;
    data: string;
}

const DB_NAME = 'ExtensaProjectsDB';
const STORE_NAME = 'projects';

function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME);

        request.onerror = () => {
            reject(new Error('Failed to open database.'));
        };

        request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        };
    });
}

export async function saveProject(projectId: string, projectData: string): Promise<void> {
    const db = await openDatabase();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const project: Project = {
        id: projectId,
        data: projectData,
    };

    store.put(project);

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = () => {
            reject(new Error('Failed to save project.'));
        };
    });
}

export async function getProject(projectId: string): Promise<string | null> {
    const db = await openDatabase();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.get(projectId);

        request.onsuccess = () => {
            const project = request.result as Project;
            resolve(project ? project.data : null);
        };

        request.onerror = () => {
            reject(new Error('Failed to retrieve project.'));
        };
    });
}

export async function clearProjects(): Promise<void> {
    const db = await openDatabase();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    store.clear();

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = () => {
            reject(new Error('Failed to clear projects.'));
        };
    });
}