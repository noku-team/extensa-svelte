/**
 * Wraps a promise with progress tracking.
 *
 * @template T - The type of the promise result.
 * @param {Promise<T>} promise - The promise to wrap.
 * @param {(progress: number) => void} onProgress - The callback function to be called with the progress value.
 * @param {number} totalPromises - The total number of promises to be resolved.
 * @param {number[]} resolvedPromisesCounter - An array with a single element acting as a reference counter for resolved promises.
 * @returns {Promise<T>} - A promise that resolves or rejects with the same result as the input promise.
 */
const promiseWithProgress = <T>(
    promise: Promise<T>,
    onProgress: (progress: number) => void,
    totalPromises: number,
    resolvedPromisesCounter: number[]
): Promise<T> => {
    return new Promise((resolve, reject) => {
        promise
            .then((result) => {
                resolvedPromisesCounter[0]++;
                const progressPercentage = Math.floor(100 * (resolvedPromisesCounter[0] / totalPromises));
                onProgress(progressPercentage);
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export default promiseWithProgress;