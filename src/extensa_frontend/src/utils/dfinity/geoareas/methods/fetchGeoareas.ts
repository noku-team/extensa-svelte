import type { Identity } from '@dfinity/agent'
import type { GeoArea } from '../../../../../../declarations/extensa_backend/extensa_backend.did'
import mapCanisterId from '../../mapCanisterId'
import { createCanister } from '../geoareas'

export interface FetchGeoareasParams {
	identity: Identity
	canisterId: string
}

// [[key, { value }], [key, { value }], [key, { value }]]
export const executeFetchGeoareas = async ({
	identity,
	canisterId,
}: FetchGeoareasParams): Promise<GeoArea[] | undefined> => {
	console.warn(process.env.CANISTER_ID_EXTENSA_BACKEND);
	const {
		canister: { get_geoarea_by_user },
	} = await createCanister({ identity, canisterId: mapCanisterId(canisterId) })

	debugger;
	const receipt = await get_geoarea_by_user();
	// const receipt = await mint({
	// 	to: { owner, subaccount: toNullable(subaccount) },
	// 	token_id,
	// 	metadata,
	// })

	if ('Ok' in receipt) return receipt
	else if ('Err' in receipt) throw new Error(Object.keys(receipt.Err).join(','))
}

export default executeFetchGeoareas
