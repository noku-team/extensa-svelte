import type { Identity } from "@dfinity/agent";
import executeGetChunkByIndex from "../methods/getChunkByIndex";

const downloadFileChunks = async (identity: Identity, canisterId: string, fileId: bigint, numChunks: bigint): Promise<string> => {
    if (numChunks > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("numChunks is too large to handle as a number safely.");

    const numChunksNumber = Number(numChunks);
    const promises = Array.from({ length: numChunksNumber }, (_, index) =>
        executeGetChunkByIndex({
            fileId,
            index: BigInt(index),
            identity,
            canisterId
        })
    );

    const results = await Promise.allSettled(promises);

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
