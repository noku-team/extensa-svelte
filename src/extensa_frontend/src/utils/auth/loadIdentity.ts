import type { Identity } from '@dfinity/agent'
import createAuthClient from './createAuthClient'


export const loadIdentity = async (): Promise<Identity | undefined> => {
	const authClient = await createAuthClient()
	const authenticated = await authClient.isAuthenticated()

	// Not authenticated therefore we provide no identity as a result
	if (!authenticated) {
		return undefined
	}

	return authClient.getIdentity()
}
