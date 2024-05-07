import type { Identity } from "@dfinity/agent";
import promiseWithProgress from "../../../promises/promiseAllWithProgress";
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

    const promisesWithProgress = promises.map((promise, index) => promiseWithProgress(promise, callbackForProgress, index + 1, numChunks));

    const results = await Promise.allSettled(promisesWithProgress);

    const finalFile = (results ?? []).reduce((acc, result) => {
        if (result.status === 'fulfilled' && typeof result.value === 'string') {
            return acc + result.value; // Accumula il contenuto dei chunk
        } else {
            return acc; // Continua senza aggiungere nulla se c'è un errore
        }
    }, '');

    return finalFile;
};

export default downloadFileChunks;
