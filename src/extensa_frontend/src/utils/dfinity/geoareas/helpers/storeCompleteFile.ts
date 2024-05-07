import type { Identity } from "@dfinity/agent";
import promiseWithProgress from "../../../promises/promiseAllWithProgress";
import splitStringIntoChunks from "../../../splitStringIntoChunks";
import executeStoreFileChunk from "../methods/storeFileChunk";

export interface StoreCompleteFileParams {
    identity: Identity;
    canisterId: string;
}

export interface StoreChunkOptions {
    file: string;
    numberOfChunks: number;
    fileId: bigint;
}

interface StoreCompleteFileOptions {
    callbackForProgress: (progress: number) => void;
}

const storeCompleteFile = async (dfinityOptions: StoreCompleteFileParams, storeChunkOptions: StoreChunkOptions, options: StoreCompleteFileOptions) => {
    const { identity, canisterId } = dfinityOptions;
    const { callbackForProgress } = options;
    const {
        file,
        numberOfChunks,
        fileId,
    } = storeChunkOptions;

    const chunks = splitStringIntoChunks(file, numberOfChunks);

    const promises = chunks.map((chunk, index) => {
        const indexBN = BigInt(index);
        return executeStoreFileChunk({
            identity,
            canisterId,
            fileId: fileId,
            index: indexBN,
            value: chunk,
        });
    });

    const promisesWithProgress = promises.map((promise, index) => promiseWithProgress(promise, callbackForProgress, index + 1, numberOfChunks));

    const errors: { error: string, index: number }[] = [];
    const response = await Promise.allSettled(promisesWithProgress);
    response.map((res, index) => {
        if (res.status === 'rejected') errors.push({ error: res.reason, index });
    });

    if (errors.length) {
        throw new Error(errors.map(({ error, index }) => `Error at index ${index}: ${error}`).join(', '));
    }
    return fileId;
};

export default storeCompleteFile;