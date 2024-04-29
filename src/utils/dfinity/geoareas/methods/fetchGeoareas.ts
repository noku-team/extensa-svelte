import type { Identity } from '@dfinity/agent'
import { toNullable } from '@dfinity/utils'
import { Metadata, MintReceipt } from '../../../../../../declarations/avrvm_token/avrvm_token.did'
import mapCanisterId from '../../mapCanisterId'
import { createCanister } from '../geoareas'

export interface FetchGeoareasParams {
	identity: Identity
	canisterId: string
	token_id: bigint
	metadata: Array<[string, Metadata]>
}

// [[key, { value }], [key, { value }], [key, { value }]]
export const executeFetchGeoareas = async ({
	identity,
	canisterId,
	// Gold bar serial code
	token_id,
	metadata,
}: FetchGeoareasParams): Promise<MintReceipt> => {
	const {
		canister: { mint },
	} = await createCanister({ identity, canisterId: mapCanisterId(canisterId) })

	const receipt = await mint({
		to: { owner, subaccount: toNullable(subaccount) },
		token_id,
		metadata,
	})

	if ('Ok' in receipt) return receipt
	else if ('Err' in receipt) throw new Error(Object.keys(receipt.Err).join(','))
}

export default executeFetchGeoareas
