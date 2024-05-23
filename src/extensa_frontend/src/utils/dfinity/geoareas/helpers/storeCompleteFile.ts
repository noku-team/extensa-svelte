import type { Identity } from "@dfinity/agent";
import CustomError, { ErrorType } from "../../../../errors/CustomError";
import promiseAllWithErrorsRetry from "../../../promises/promiseAllWithErrorsRetry";
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
    try {
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
            return () => executeStoreFileChunk({
                identity,
                canisterId,
                fileId: fileId,
                index: indexBN,
                value: chunk,
            });
        });

        await promiseAllWithErrorsRetry(promises, {
            progress: {
                useProgress: true,
                callbackForProgress,
                totalPromises: numberOfChunks,
            },
            retry: 2,
        });

        return fileId;
    } catch (e: any) {
        console.error(e);
        throw new CustomError((e as Error).message, ErrorType.STORE_FILE_CHUNK)
    }
};

export default storeCompleteFile;