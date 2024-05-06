import type { Identity } from '@dfinity/agent';
import type { XYZ } from '../../../../../../declarations/extensa_backend/extensa_backend.did';
import mapCanisterId from '../../mapCanisterId';
import { createCanister } from '../geoareas';

export interface FetchGeoareasParams {
    identity: Identity;
    canisterId: string;
    geoareaId: bigint;
    projectId: bigint;
    type?: string;
    name?: string;
    position?: XYZ;
    orientation?: XYZ;
    size?: XYZ;
    fileId?: bigint;
}

interface Project2Edit {
    type?: string;
    name?: string;
    position?: XYZ;
    orientation?: XYZ;
    size?: XYZ;
    fileId?: bigint;
}

export const executeEditProject = async ({
    identity,
    canisterId,
    geoareaId,
    projectId,
    type,
    name,
    position,
    orientation,
    size,
    fileId,
}: FetchGeoareasParams): Promise<bigint | undefined> => {
    const {
        canister: { edit_project },
    } = await createCanister({ identity, canisterId: mapCanisterId(canisterId) });

    const editedProject = {} as Project2Edit;
    if (type) editedProject['type'] = type;
    if (name) editedProject['name'] = name;
    if (position) editedProject['position'] = position;
    if (orientation) editedProject['orientation'] = orientation;
    if (size) editedProject['size'] = size;
    if (fileId) editedProject['fileId'] = fileId;

    const receipt = await edit_project(
        geoareaId,
        projectId,
        editedProject?.type ? [editedProject?.type] : [],
        editedProject?.name ? [editedProject?.name] : [],
        editedProject?.position ? [editedProject?.position] : [],
        editedProject?.orientation ? [editedProject?.orientation] : [],
        editedProject?.size ? [editedProject?.size] : [],
        editedProject?.fileId ? [editedProject?.fileId] : []
    );

    if ('Ok' in receipt) return receipt.Ok;
    else if ('Err' in receipt) throw new Error(Object.keys(receipt.Err).join(','));
}

export default executeEditProject;
