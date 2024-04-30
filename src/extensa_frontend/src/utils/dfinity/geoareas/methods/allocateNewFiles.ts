import type { Identity } from '@dfinity/agent';
import mapCanisterId from '../../mapCanisterId';
import { createCanister } from '../geoareas';

export interface FetchGeoareasParams {
    identity: Identity;
    canisterId: string;
    fileSize: number;
}

export interface AllocateNewFileResponse {
    fileId: bigint;
    numberOfChunks: number;
    maxChunkLength: number;
}

export const executeAllocateNewFile = async ({
    identity,
    canisterId,
    fileSize,
    // File Id, Number of Chunks, Max Chunk Length
}: FetchGeoareasParams): Promise<AllocateNewFileResponse | undefined> => {
    const {
        canister: { allocate_new_file },
    } = await createCanister({ identity, canisterId: mapCanisterId(canisterId) })

    const receipt = await allocate_new_file(
        fileSize,
    );

    if ('Ok' in receipt) {
        const [fileId, numberOfChunks, maxChunkLength] = receipt.Ok;
        return {
            fileId,
            numberOfChunks,
            maxChunkLength,
        };
    }
    else if ('Err' in receipt) throw new Error(Object.keys(receipt.Err).join(','));
}

export default executeAllocateNewFile;
