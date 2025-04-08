import type { Identity } from '@dfinity/agent'
import type { File } from '../../../../declarations/extensa_backend/extensa_backend.did'
import executeGetFileChunk from '../methods/getFileChunk'

interface ExecuteGetFileParams {
    callbackForProgress?: (progress: number) => void
}

export default async function executeGetFile(
    identity: Identity,
    canisterId: string,
    fileId: string,
    numberOfChunks: number,
    { callbackForProgress }: ExecuteGetFileParams = {}
): Promise<File> {
    const chunks: Uint8Array[] = []
    let downloadedChunks = 0

    for (let i = 0; i < numberOfChunks; i++) {
        const chunk = await executeGetFileChunk({
            canisterId,
            fileId,
            chunkIndex: i,
            identity,
        })

        chunks.push(chunk)
        downloadedChunks++

        if (callbackForProgress) {
            const progress = (downloadedChunks / numberOfChunks) * 100
            callbackForProgress(progress)
        }
    }

    return {
        id: fileId,
        chunks,
    }
} 