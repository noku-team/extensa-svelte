import type { Identity } from '@dfinity/agent';
import CustomError, { ErrorType } from '../../../../errors/CustomError';
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
    try {
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
        else if ('Err' in receipt) throw new CustomError(Object.keys(receipt.Err).join(','), ErrorType.ALLOCATE_NEW_FILE);
    } catch (e: any) {
        throw new CustomError((e as Error).message, ErrorType.ALLOCATE_NEW_FILE);
    }
}

export default executeAllocateNewFile;
