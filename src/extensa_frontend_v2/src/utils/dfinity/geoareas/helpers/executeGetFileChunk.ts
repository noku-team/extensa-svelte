import type { Identity } from '@dfinity/agent'
import { Actor, HttpAgent } from '@dfinity/agent'
import { idlFactory } from '../../../../declarations/extensa_backend/extensa_backend.did'

interface ExecuteGetFileChunkParams {
    canisterId: string
    fileId: string
    chunkIndex: number
    identity: Identity
}

export default async function executeGetFileChunk({
    canisterId,
    fileId,
    chunkIndex,
    identity,
}: ExecuteGetFileChunkParams): Promise<Uint8Array> {
    const agent = new HttpAgent({ identity })
    const actor = Actor.createActor(idlFactory, {
        agent,
        canisterId,
    })

    const chunk = await actor.getFileChunk(fileId, chunkIndex)
    return chunk
} 