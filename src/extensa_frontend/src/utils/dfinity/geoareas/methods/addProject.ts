import type { Identity } from '@dfinity/agent';
import mapCanisterId from '../../mapCanisterId';
import { createCanister } from '../geoareas';


export interface XYZ {
    x: number;
    y: number;
    z: number;
}

export interface FetchGeoareasParams {
    identity: Identity;
    canisterId: string;
    geoareaId: bigint;
    type: string;
    name: string;
    position: XYZ;
    orientation: XYZ;
    size: XYZ;
    fileId: bigint;
}

export const executeAddProject = async ({
    identity,
    canisterId,
    geoareaId,
    type,
    name,
    position,
    orientation,
    size,
    fileId,
}: FetchGeoareasParams): Promise<bigint | undefined> => {
    const {
        canister: { add_project },
    } = await createCanister({ identity, canisterId: mapCanisterId(canisterId) })

    const receipt = await add_project(
        geoareaId,
        type,
        name,
        position,
        orientation,
        size,
        fileId,
    );

    if ('Ok' in receipt) return receipt.Ok;
    else if ('Err' in receipt) throw new Error(Object.keys(receipt.Err).join(','))
}

export default executeAddProject;
