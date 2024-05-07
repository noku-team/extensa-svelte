// import type { Identity } from '@dfinity/agent';
// import mapCanisterId from '../../mapCanisterId';
// import { createCanister } from '../geoareas';

// export interface FetchGeoareasParams {
//     identity: Identity;
//     canisterId: string;
//     geoareaId: bigint;
//     projectId: bigint;
// }

// export const executeDeleteGeoarea = async ({
//     identity,
//     canisterId,
//     geoareaId,
//     projectId,
// }: FetchGeoareasParams): Promise<bigint | undefined> => {
//     const {
//         canister: {  },
//     } = await createCanister({ identity, canisterId: mapCanisterId(canisterId) })

//     const receipt = await remove_project(
//         geoareaId,
//         projectId
//     );

//     if ('Ok' in receipt) return receipt.Ok;
//     else if ('Err' in receipt) throw new Error(Object.keys(receipt.Err).join(','));
// }

// export default executeDeleteGeoarea;
