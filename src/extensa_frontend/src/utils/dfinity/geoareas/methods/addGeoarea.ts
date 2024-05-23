import type { Identity } from '@dfinity/agent';
import type { Coords } from '../../../../../../declarations/extensa_backend/extensa_backend.did';
import CustomError, { ErrorType } from '../../../../errors/CustomError';
import mapCanisterId from '../../mapCanisterId';
import { createCanister } from '../geoareas';

export interface FetchGeoareasParams {
    identity: Identity;
    canisterId: string;
    name: string;
    coords: Coords;
}

export const executeAddGeoarea = async ({
    identity,
    canisterId,
    name,
    coords
}: FetchGeoareasParams): Promise<bigint | undefined> => {
    try {
        const {
            canister: { add_geoarea },
        } = await createCanister({ identity, canisterId: mapCanisterId(canisterId) })

        const receipt = await add_geoarea(
            name,
            coords
        );

        if ('Ok' in receipt) return receipt.Ok;
        else if ('Err' in receipt) throw new CustomError(Object.keys(receipt.Err).join(','), ErrorType.CREATE_GEOAREA);
    } catch (e: any) {
        throw new CustomError((e as Error).message, ErrorType.CREATE_GEOAREA);
    }
}

export default executeAddGeoarea;
