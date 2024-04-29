import type { Identity } from '@dfinity/agent';
import type { GeoArea } from '../../../../../../declarations/extensa_backend/extensa_backend.did';
import mapCanisterId from '../../mapCanisterId';
import { createCanister } from '../geoareas';

export interface FetchGeoareasParams {
	identity?: Identity;
	canisterId: string;
	// other params for canister call
}

// [[key, { value }], [key, { value }], [key, { value }]]
export const executeFetchGeoareas = async ({
	identity,
	canisterId,
}: FetchGeoareasParams): Promise<GeoArea[] | undefined> => {
	const {
		canister: { get_geoarea_by_coords },
	} = await createCanister({ identity, canisterId: mapCanisterId(canisterId) })

	const principal = identity?.getPrincipal();
	console.warn('get_geoarea_by_user', identity?.getPrincipal().toText());
	const receipt = await get_geoarea_by_coords(2.3, 2.4, 3.4, 23.4, [[principal]]);
	// const receipt = await mint({
	// 	to: { owner, subaccount: toNullable(subaccount) },
	// 	token_id,
	// 	metadata,
	// })

	if ('Ok' in receipt) return receipt
	else if ('Err' in receipt) throw new Error(Object.keys(receipt.Err).join(','))
}

export default executeFetchGeoareas
