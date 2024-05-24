import promiseWithProgress from "./promiseAllWithProgress";

type PromiseAllWithErrorsRetryOptions = {
    progress?: {
        useProgress: boolean,
        callbackForProgress: (resolvedCount: number) => void,
        totalPromises: number
    },
    retry?: number,
    concurrency?: number
};

async function promiseAllWithErrorsRetry<T>(
    promiseFunctions: (() => Promise<T>)[],
    options: PromiseAllWithErrorsRetryOptions
): Promise<T[]> {
    const { progress, retry = 2, concurrency = 5 } = options ?? {};
    const { useProgress, callbackForProgress, totalPromises = promiseFunctions.length } = progress ?? {};

    const resolvedPromisesCounter = [0];
    let errors: { error: any; index: number }[] = [];
    let result: T[] = new Array(promiseFunctions.length);

    const executeConcurrently = async (startIndex: number) => {
        let index = startIndex;
        let inProgress = 0;

        return new Promise<void>((resolve) => {
            const executeNext = () => {
                if (index === promiseFunctions.length && inProgress === 0) {
                    resolve();
                    return;
                }

                while (inProgress < concurrency && index < promiseFunctions.length) {
                    const currentIndex = index;
                    inProgress++;

                    let promise = promiseFunctions[currentIndex]();
                    if (useProgress && callbackForProgress) {
                        promise = promiseWithProgress(promise, callbackForProgress, totalPromises, resolvedPromisesCounter);
                    }

                    promise
                        .then((value) => {
                            result[currentIndex] = value;
                        })
                        .catch((error) => {
                            errors.push({ error, index: currentIndex });
                        })
                        .finally(() => {
                            inProgress--;
                            executeNext();
                        });

                    index++;
                }
            };

            executeNext();
        });
    };

    await executeConcurrently(0);

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