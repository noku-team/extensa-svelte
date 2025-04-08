export interface PostMessageDataRequestLoadProject {
    fileId: string;
}

export interface PostMessageDataResponseLoadProject {
    accountIdentifier: string;
    file: File;
    fileId: string;
}

export interface PostMessageDataProgressLoadProject {
    progress: number;
} 