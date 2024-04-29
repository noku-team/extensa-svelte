import type { Agent, HttpAgent, Identity } from '@dfinity/agent'
import { createAgent, nonNullish } from '@dfinity/utils'
import IdentityAgentWrapper from './identityAgent'

type PrincipalAsText = string
let agents: Record<PrincipalAsText, HttpAgent> | undefined | null = undefined

export const createAgentWrapper = async ({ identity, host }: { identity: Identity; host?: string }): Promise<Agent> => {
	const principalAsText: string = identity.getPrincipal().toText()

	// e.g. a particular agent for anonymous call and another for signed-in identity
	if (agents?.[principalAsText] === undefined) {
		const agent = await createAgent({
			identity,
			...(host !== undefined && { host }),
		})

		agents = {
			...(nonNullish(agents) && agents),
			[principalAsText]: agent,
		}
	}

	return new IdentityAgentWrapper({
		identity,
		wrappedAgent: agents[principalAsText],
	})
}
