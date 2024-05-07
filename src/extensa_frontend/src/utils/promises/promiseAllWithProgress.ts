/**
 * Wraps a promise with progress tracking.
 *
 * @template T - The type of the promise result.
 * @param {Promise<T>} promise - The promise to wrap.
 * @param {(progress: number) => void} onProgress - The callback function to be called with the progress value.
 * @param {number} [totalPromises=0] - The total number of promises to be resolved.
 * @returns {Promise<T>} - A promise that resolves or rejects with the same result as the input promise.
 */
const promiseWithProgress = <T>(promise: Promise<T>, onProgress: (progress: number) => void, progress = 0, totalPromises = 0): Promise<T> => {
    return new Promise((resolve, reject) => {
        promise
            .then((result) => {
                const progressPercentage = Math.floor(100 * (progress / totalPromises));
                onProgress(progressPercentage);
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export default promiseWithProgress;