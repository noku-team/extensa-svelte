import type { Identity } from "@dfinity/agent";
import promiseAllWithErrorsRetry from "../../../promises/promiseAllWithErrorsRetry";
import executeGetChunkByIndex from "../methods/getChunkByIndex";

type DownloadFileChunksOptions = {
    callbackForProgress: (progress: number) => void;
}

const downloadFileChunks = async (
    identity: Identity,
    canisterId: string,
    fileId: bigint,
    numChunks: number,
    options: DownloadFileChunksOptions): Promise<string> => {
    const promises = Array.from({ length: numChunks }, (_, index) =>
        executeGetChunkByIndex({
            fileId,
            index: BigInt(index),
            identity,
            canisterId
        })
    );

    const { callbackForProgress } = options;

    const results = await promiseAllWithErrorsRetry(promises, {
        progress: {
            useProgress: true,
            callbackForProgress,
            totalPromises: numChunks
        }
    });

    const finalFile = (results ?? []).reduce((acc, result) => acc + result, '');
    return finalFile;
};

export default downloadFileChunks;
