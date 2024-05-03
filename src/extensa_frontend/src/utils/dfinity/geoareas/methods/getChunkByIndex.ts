import type { Identity } from '@dfinity/agent';
import mapCanisterId from '../../mapCanisterId';
import { createCanister } from '../geoareas';

export interface FetchGeoareasParams {
    identity: Identity;
    canisterId: string;
    fileId: bigint;
    index: bigint;
}

export const executeGetChunkByIndex = async ({
    identity,
    canisterId,
    fileId,
    index,
}: FetchGeoareasParams): Promise<string> => {
    const {
        canister: { get_chunk_by_index },
    } = await createCanister({ identity, canisterId: mapCanisterId(canisterId) });

    const response = await get_chunk_by_index(
        fileId,
        index,
    );

    return response?.[0]?.value ?? "";
}

export default executeGetChunkByIndex;
