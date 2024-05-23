export enum ErrorType {
    CREATE_GEOAREA = 'CREATE_GEOAREA',
    DELETE_GEOAREA = 'DELETE_GEOAREA',
    UPDATE_GEOAREA = 'UPDATE_GEOAREA',
    GET_GEOAREA = 'GET_GEOAREA',
    CREATE_PROJECT = 'CREATE_PROJECT',
    DELETE_PROJECT = 'DELETE_PROJECT',
    UPDATE_PROJECT = 'UPDATE_PROJECT',
    GET_PROJECT = 'GET_PROJECT',
    ALLOCATE_NEW_FILE = 'ALLOCATE_NEW_FILE',
    STORE_FILE_CHUNK = 'STORE_FILE_CHUNK',
}

class CustomError extends Error {
    name: string;
    type: ErrorType;
    constructor(message: string, type: ErrorType) {
        super(message);
        this.name = 'CustomError';
        this.type = type;
    }


    getType() {
        return this.type;
    }
}

export default CustomError;