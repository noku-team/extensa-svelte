import type { Identity } from '@dfinity/agent';
import type { XYZ } from '../../../../../../declarations/extensa_backend/extensa_backend.did';
import CustomError, { ErrorType } from '../../../../errors/CustomError';
import mapCanisterId from '../../mapCanisterId';
import { createCanister } from '../geoareas';

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
    try {
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
        else if ('Err' in receipt) throw new Error(Object.keys(receipt.Err).join(','));
    } catch (e: any) {
        throw new CustomError((e as Error).message, ErrorType.CREATE_PROJECT);
    }

}

export default executeAddProject;
