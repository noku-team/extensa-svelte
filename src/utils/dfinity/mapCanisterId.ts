import { Principal } from '@dfinity/principal'

export type CanisterId = Principal

const mapCanisterId = (canisterId: CanisterId | string): CanisterId =>
	typeof canisterId === 'string' ? Principal.fromText(canisterId) : canisterId

export default mapCanisterId
