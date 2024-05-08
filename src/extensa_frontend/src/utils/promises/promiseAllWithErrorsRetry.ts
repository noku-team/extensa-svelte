import promiseWithProgress from "./promiseAllWithProgress";

type PromiseAllWithErrorsRetryOptions = {
    progress?: {
        useProgress: boolean,
        callbackForProgress: (resolvedCount: number) => void,
        totalPromises: number
    },
    retry?: number,
    divideInPromisesChunksOf?: number
};

/**
 * Executes an array of promises with error handling and retry functionality.
 *
 * @template T - The type of the resolved value of each promise.
 * @param {Promise<T>[]} promises - An array of promises to execute.
 * @param {PromiseAllWithErrorsRetryOptions} options - Options for controlling the behavior of the function.
 * @returns {Promise<T[]>} - A promise that resolves to an array of resolved values from the input promises.
 * @throws {Error} - If there are errors in the execution of the promises and the retry attempts are exhausted.
 */
async function promiseAllWithErrorsRetry<T>(
    promises: Promise<T>[],
    options: PromiseAllWithErrorsRetryOptions
): Promise<T[]> {
    const { progress, retry = 2, divideInPromisesChunksOf = 5 } = options ?? {};
    const { useProgress, callbackForProgress, totalPromises } = progress ?? {};

    const resolvedPromisesCounter = [0];
    let modifiedPromises = promises;

    if (useProgress && callbackForProgress && totalPromises) {
        modifiedPromises = promises.map((promise) => {
            return promiseWithProgress(promise, callbackForProgress, totalPromises, resolvedPromisesCounter);
        });
    }

    const result: T[] = [];
    const errors: { error: any; index: number }[] = [];

    if (divideInPromisesChunksOf) {
        // Divide promises into chunks
        for (let i = 0; i < modifiedPromises.length; i += divideInPromisesChunksOf) {
            // Get a chunk of promises
            const chunk = modifiedPromises.slice(i, i + divideInPromisesChunksOf);
            // Execute promises in the chunk and wait for all to settle
            const responses = await Promise.allSettled(chunk);

            responses.forEach((response, index) => {
                if (response.status === 'fulfilled') result[i + index] = response.value;
                else errors.push({ error: response.reason, index: i + index });
            });
        }
    } else {
        // Execute all promises and wait for all to settle
        const responses = await Promise.allSettled(modifiedPromises);

        responses.forEach((response, index) => {
            if (response.status === 'fulfilled') result[index] = response.value;
            else errors.push({ error: response.reason, index });
        });
    }


    if (errors.length > 0 && retry > 0) {
        // Retry only the failed promises
        const retries = errors.map(({ index: errorIndex }) => promises[errorIndex]);
        const retryResults = await promiseAllWithErrorsRetry(retries, {
            ...options,
            retry: retry - 1
        });
        // Insert retried results back into their original positions
        errors.forEach((err, idx) => {
            result[err.index] = retryResults[idx];
        });
    } else if (errors.length > 0) {
        throw new Error(errors.map(err => `Error at index ${err.index}: ${err.error}`).join(', '));
    }

    return result;
}

export default promiseAllWithErrorsRetry;