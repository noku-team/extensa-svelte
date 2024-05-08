import promiseWithProgress from "./promiseAllWithProgress";

type PromiseAllWithErrorsRetryOptions = {
    progress?: {
        useProgress: boolean,
        callbackForProgress: (resolvedCount: number) => void,
        totalPromises: number
    },
    retry?: number,
    chunksSize?: number
};

async function promiseAllWithErrorsRetry<T>(
    promiseFunctions: (() => Promise<T>)[],
    options: PromiseAllWithErrorsRetryOptions
): Promise<T[]> {
    const { progress, retry = 2, chunksSize = 5 } = options ?? {};
    const { useProgress, callbackForProgress, totalPromises = promiseFunctions.length } = progress ?? {};

    const resolvedPromisesCounter = [0];
    let errors: { error: any; index: number }[] = [];
    let result: T[] = new Array(promiseFunctions.length);

    const executeChunk = async (chunk: (() => Promise<T>)[], startIndex: number) => {
        let promises = chunk.map(func => func());

        if (useProgress && callbackForProgress) {
            promises = promises.map(promise => promiseWithProgress(promise, callbackForProgress, totalPromises, resolvedPromisesCounter));
        }

        const responses = await Promise.allSettled(promises);
        responses.forEach((response, index) => {
            if (response.status === 'fulfilled') {
                result[startIndex + index] = response.value;
            } else {
                errors.push({ error: response.reason, index: startIndex + index });
            }
        });
    };

    // Handle chunking
    if (chunksSize) {
        for (let i = 0; i < promiseFunctions.length; i += chunksSize) {
            const chunk = promiseFunctions.slice(i, i + chunksSize);
            await executeChunk(chunk, i);
        }
    } else {
        await executeChunk(promiseFunctions, 0);
    }

    // Retry logic for errors
    if (errors.length > 0 && retry > 0) {
        const retryPromises = errors.map(({ index }) => promiseFunctions[index]);
        const retryResults = await promiseAllWithErrorsRetry(retryPromises.map(func => () => func()), {
            ...options,
            retry: retry - 1
        });
        errors.forEach((err, idx) => {
            result[err.index] = retryResults[idx];
        });
    } else if (errors.length > 0) {
        throw new Error(errors.map(err => `Error at index ${err.index}: ${err.error}`).join(', '));
    }

    return result;
}

export default promiseAllWithErrorsRetry;