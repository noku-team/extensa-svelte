const byteSize = (str: string) => new Blob([str]).size;

export default byteSize;