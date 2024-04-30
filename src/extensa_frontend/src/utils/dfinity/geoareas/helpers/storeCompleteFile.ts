import type { Identity } from "@dfinity/agent";
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

const storeCompleteFile = async (dfinityOptions: StoreCompleteFileParams, storeChunkOptions: StoreChunkOptions) => {
    const { identity, canisterId } = dfinityOptions;
    const {
        file,
        numberOfChunks,
        fileId,
    } = storeChunkOptions;

    const chunks = splitStringIntoChunks(file, numberOfChunks);

    const promises = chunks.map((chunk, index) => {
        const indexBN = BigInt(index);
        executeStoreFileChunk({
            identity,
            canisterId,
            fileId: fileId,
            index: indexBN,
            value: chunk,
        });
    });

    const errors: { error: string, index: number }[] = [];
    const response = await Promise.allSettled(promises);
    response.map((res, index) => {
        if (res.status === 'rejected') errors.push({ error: res.reason, index });
    });

    if (errors.length) {
        throw new Error(errors.map(({ error, index }) => `Error at index ${index}: ${error}`).join(', '));
    }
    return fileId;
};

export default storeCompleteFile;