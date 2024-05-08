const splitStringIntoChunks = (longString: string, numChunks: number): string[] => {
    const chunkSize = Math.ceil(longString.length / numChunks);
    const chunks: string[] = [];

    for (let i = 0; i < longString.length; i += chunkSize) {
        chunks.push(longString.slice(i, i + chunkSize));
    }

    console.warn(chunks[0].length);
    return chunks;
}

export default splitStringIntoChunks;