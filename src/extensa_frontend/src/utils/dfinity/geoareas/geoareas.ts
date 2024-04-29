import type { ActorSubclass, Agent, Identity } from '@dfinity/agent'
import { Principal } from '@dfinity/principal'
import { createAgentWrapper } from '../agent'
import isTestnet from '../isTestnet'

import type { _SERVICE } from '../../../../../declarations/extensa_backend/extensa_backend.did'
import { createActor } from '../../../../../declarations/extensa_backend/index'

interface Canister {
	identity?: Identity
	canisterId: Principal
	host?: string
}

export const createCanister = async ({
	identity,
	canisterId,
	host,
}: Canister): Promise<{
	canister: ActorSubclass<_SERVICE>
	agent: Agent
}> => {
	const agent = await createAgentWrapper({
		identity,
		host,
	});

	if (isTestnet()) await agent.fetchRootKey()

	const canister = createActor(canisterId, {
		agent,
	})

	return {
		canister,
		agent,
	}
}
