interface Project {
    id: string;
    data: string;
    expiresAt: number;
}

const DB_NAME = 'ExtensaProjectsDB';
const STORE_NAME = 'projects';

/**
 * Opens the indexedDB database and returns a promise that resolves to the IDBDatabase object.
 * @returns A promise that resolves to the IDBDatabase object.
 */
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

/**
 * Saves a project to the indexedDB.
 * 
 * @param projectId - The ID of the project.
 * @param projectData - The data of the project.
 * @param expirationHours - The number of hours until the project expires.
 * @returns A promise that resolves when the project is saved successfully, or rejects with an error if saving fails.
 */
export const saveProject = async (projectId: string, projectData: string, expirationHours: number): Promise<void> => {
    const db = await openDatabase();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const expiresAt = Date.now() + expirationHours * 60 * 60 * 1000;

    const project: Project = {
        id: projectId,
        data: projectData,
        expiresAt,
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

/**
 * Retrieves the data of a project from the indexedDB based on the provided project ID.
 * @param projectId - The ID of the project to retrieve.
 * @returns A promise that resolves with the project data as a string, or null if the project is not found.
 */
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

/**
 * Clears all projects from the indexedDB.
 * 
 * @returns A promise that resolves when the projects are cleared successfully, or rejects with an error if clearing fails.
 */
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

/**
 * Cleans up expired projects from the indexedDB.
 * Deletes projects from the object store if their expiration date has passed.
 * @returns A promise that resolves when the cleanup is complete.
 */
export const cleanupExpiredProjects = async (): Promise<void> => {
    const db = await openDatabase();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.openCursor();

    request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
            const project = cursor.value as Project;
            if (project.expiresAt < Date.now()) cursor.delete();
            cursor.continue();
        }
    };
}