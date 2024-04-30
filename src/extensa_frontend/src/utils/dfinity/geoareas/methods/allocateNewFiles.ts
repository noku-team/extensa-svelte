import type { Identity } from '@dfinity/agent';
import mapCanisterId from '../../mapCanisterId';
import { createCanister } from '../geoareas';

export interface FetchGeoareasParams {
    identity: Identity;
    canisterId: string;
    fileSize: number;
}

export const executeAllocateNewFile = async ({
    identity,
    canisterId,
    fileSize,
}: FetchGeoareasParams): Promise<[bigint, number, number] | undefined> => {
    const {
        canister: { allocate_new_file },
    } = await createCanister({ identity, canisterId: mapCanisterId(canisterId) })

    const receipt = await allocate_new_file(
        fileSize,
    );

    if ('Ok' in receipt) return receipt.Ok;
    else if ('Err' in receipt) throw new Error(Object.keys(receipt.Err).join(','))
}

export default executeAllocateNewFile;
