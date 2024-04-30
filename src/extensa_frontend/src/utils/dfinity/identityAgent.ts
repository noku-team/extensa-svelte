import type {
	Agent,
	ApiQueryResponse,
	CallOptions,
	HttpAgent,
	Identity,
	QueryFields,
	ReadStateOptions,
	ReadStateResponse,
	SubmitResponse,
} from '@dfinity/agent';
import { AnonymousIdentity, IdentityInvalidError, } from '@dfinity/agent';
import type { JsonObject } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
import { isNullish } from '@dfinity/utils';

class IdentityAgentWrapper implements Agent {
	private identity: Identity | null
	private readonly wrappedAgent: HttpAgent

	constructor({ identity, wrappedAgent }: { identity: Identity; wrappedAgent: HttpAgent }) {
		this.identity = identity
		this.wrappedAgent = wrappedAgent
	}

	getValidIdentity(overrideIdentity?: Identity | undefined | null): Identity {
		const usedIdentity = overrideIdentity !== undefined ? overrideIdentity : this.identity
		if (isNullish(usedIdentity)) {
			throw new IdentityInvalidError(
				"This identity has expired due this application's security policy. Please refresh your authentication."
			)
		}
		return usedIdentity
	}

	get rootKey(): ArrayBuffer | null {
		return this.wrappedAgent.rootKey
	}

	async getPrincipal(): Promise<Principal> {
		return this.getValidIdentity().getPrincipal()
	}

	createReadStateRequest?(
		options: ReadStateOptions,
		identity?: Identity
		// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	): Promise<any> {
		return this.wrappedAgent.createReadStateRequest(options, this.getValidIdentity(identity))
	}

	readState(
		effectiveCanisterId: Principal | string,
		options: ReadStateOptions,
		identity?: Identity,
		// eslint-disable-next-line  @typescript-eslint/no-explicit-any
		request?: any
	): Promise<ReadStateResponse> {
		return this.wrappedAgent.readState(effectiveCanisterId, options, this.getValidIdentity(identity), request)
	}

	call(canisterId: Principal | string, fields: CallOptions, identity?: Identity): Promise<SubmitResponse> {
		return this.wrappedAgent.call(canisterId, fields, this.getValidIdentity(identity))
	}

	async status(): Promise<JsonObject> {
		return this.wrappedAgent.status()
	}

	async query(
		canisterId: Principal | string,
		options: QueryFields,
		identity?: Identity | Promise<Identity>
	): Promise<ApiQueryResponse> {
		return this.wrappedAgent.query(canisterId, options, this.getValidIdentity(await identity))
	}

	fetchRootKey(): Promise<ArrayBuffer> {
		return this.wrappedAgent.fetchRootKey()
	}

	invalidateIdentity?(): void {
		this.identity = null
	}

	replaceIdentity?(identity: Identity): void {
		this.identity = identity
	}
}

export const getAnonymousIdentity = (): Identity => new AnonymousIdentity();

export default IdentityAgentWrapper
