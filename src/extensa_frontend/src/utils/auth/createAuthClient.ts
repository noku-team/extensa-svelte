import { AuthClient } from '@dfinity/auth-client'

const createAuthClient = (): Promise<AuthClient> =>
	AuthClient.create({
		idleOptions: {
			disableIdle: true,
			disableDefaultIdleCallback: true,
		},
	})

export default createAuthClient
