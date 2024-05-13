import type { Identity } from '@dfinity/agent';
import mapCanisterId from '../../mapCanisterId';
import { createCanister } from '../geoareas';

export interface FetchGeoareasParams {
    identity: Identity;
    canisterId: string;
    geoareaId: bigint;
}

export const executeDeleteGeoarea = async ({
    identity,
    canisterId,
    geoareaId,
}: FetchGeoareasParams): Promise<bigint | undefined> => {
    const {
        canister: { remove_geoarea },
    } = await createCanister({ identity, canisterId: mapCanisterId(canisterId) })

    const receipt = await remove_geoarea(geoareaId);

    if ('Ok' in receipt) return receipt.Ok;
    else if ('Err' in receipt) throw new Error(Object.keys(receipt.Err).join(','));
}

export default executeDeleteGeoarea;
