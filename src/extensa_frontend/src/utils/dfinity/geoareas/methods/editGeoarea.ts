import type { Identity } from '@dfinity/agent';
import type { Coords } from '../../../../../../declarations/extensa_backend/extensa_backend.did';
import mapCanisterId from '../../mapCanisterId';
import { createCanister } from '../geoareas';

export interface FetchGeoareasParams {
    identity: Identity;
    canisterId: string;
    id: bigint;
    name: string;
    coords: Coords;
}

export const executeEditGeoarea = async ({
    identity,
    canisterId,
    id,
    name,
    coords
}: FetchGeoareasParams): Promise<bigint | undefined> => {
    const {
        canister: { edit_geoarea },
    } = await createCanister({ identity, canisterId: mapCanisterId(canisterId) });

    const receipt = await edit_geoarea(
        id,
        [name],
        [coords]
    );

    if ('Ok' in receipt) return receipt.Ok;
    else if ('Err' in receipt) throw new Error(Object.keys(receipt.Err).join(','));
}

export default executeEditGeoarea;
