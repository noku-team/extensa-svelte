import type { Identity } from '@dfinity/agent';
import mapCanisterId from '../../mapCanisterId';
import { createCanister } from '../geoareas';

export interface FetchGeoareasParams {
    identity: Identity;
    canisterId: string;
    fileId: bigint;
    index: bigint;
    value: string;
}

export const executeStoreFileChunk = async ({
    identity,
    canisterId,
    fileId,
    index,
    value,
}: FetchGeoareasParams): Promise<bigint | undefined> => {
    const {
        canister: { store_chunk },
    } = await createCanister({ identity, canisterId: mapCanisterId(canisterId) });

    const receipt = await store_chunk(
        fileId,
        index,
        value,
    );

    if ('Ok' in receipt) return receipt.Ok;
    else if ('Err' in receipt) throw new Error(Object.keys(receipt.Err).join(','))
}

export default executeStoreFileChunk;
