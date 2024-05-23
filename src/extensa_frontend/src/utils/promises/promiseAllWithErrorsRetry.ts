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

    let errors: { error: any; index: number }[] = [];
    let result: T[] = new Array(promiseFunctions.length);
    let resolvedPromisesCounter = [0];

    const handlePromise = async (promiseFunction: () => Promise<T>, index: number) => {
        try {
            const promise = promiseFunction();
            let response = useProgress && callbackForProgress ?
                await promiseWithProgress(promise, callbackForProgress, totalPromises, resolvedPromisesCounter) :
                await promise;
            result[index] = response;
        } catch (error) {
            errors.push({ error, index });
        }
    };

    const activePromises = new Set<Promise<void>>();
    let currentPromiseIndex = 0;

    const launchNextPromise = () => {
        if (currentPromiseIndex < promiseFunctions.length) {
            const index = currentPromiseIndex++;
            const nextPromise = handlePromise(promiseFunctions[index], index);
            activePromises.add(nextPromise);
            nextPromise.then(() => {
                activePromises.delete(nextPromise);
                launchNextPromise();
            });
        }
    };

    // Initialize the pool of promises
    for (let i = 0; i < Math.min(chunksSize, promiseFunctions.length); i++) {
        launchNextPromise();
    }

    // Wait for all active promises to finish
    await Promise.all(activePromises);

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