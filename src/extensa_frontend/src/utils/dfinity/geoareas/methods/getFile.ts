import type { Identity } from '@dfinity/agent';
import type { File } from '../../../../../../declarations/extensa_backend/extensa_backend.did';
import mapCanisterId from '../../mapCanisterId';
import { createCanister } from '../geoareas';

export interface FetchGeoareasParams {
    identity: Identity;
    canisterId: string;
    fileId: bigint;
}

export const executeGetFile = async ({
    identity,
    canisterId,
    fileId,
}: FetchGeoareasParams): Promise<[] | [File]> => {
    const {
        canister: { get_file },
    } = await createCanister({ identity, canisterId: mapCanisterId(canisterId) })

    const principal = identity?.getPrincipal();
    const file = await get_file(
        fileId,
    );

    return file;
}

export default executeGetFile
