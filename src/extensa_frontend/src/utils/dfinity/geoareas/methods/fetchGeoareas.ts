import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import type { GeoArea } from '../../../../../../declarations/extensa_backend/extensa_backend.did';
import mapCanisterId from '../../mapCanisterId';
import { createCanister } from '../geoareas';

type IdentityType = [] | [[Principal, [] | [Uint8Array | number[]]]];

export interface FetchGeoareasParams {
	identity: Identity;
	canisterId: string;
	coords: {
		topLeft: {
			lat: number;
			lng: number;
		},
		bottomRight: {
			lat: number;
			lng: number;
		}
	}
}

export const executeFetchGeoareasByCoords = async ({
	identity,
	canisterId,
	coords,
}: FetchGeoareasParams): Promise<GeoArea[] | undefined> => {
	const {
		canister: { get_geoarea_by_coords },
	} = await createCanister({ identity, canisterId: mapCanisterId(canisterId) })

	const principal = identity?.getPrincipal();

	let _identity: IdentityType;

	// If the user is not logged in, we need to pass an empty identity
	if (!principal.isAnonymous()) _identity = [[principal, []]];
	else _identity = [];

	const receipt = await get_geoarea_by_coords(
		coords.topLeft.lng,
		coords.bottomRight.lng,
		coords.topLeft.lat,
		coords.bottomRight.lat,
		_identity,
	);

	const [geoareas] = receipt;
	// console.warn(`Formatted for visual BB: ${coords.topLeft.lng}, ${coords.topLeft.lat}, ${coords.bottomRight.lng}, ${coords.bottomRight.lat}`);
	// console.warn(`Formatted for Canister: ${coords.topLeft.lng}, ${coords.bottomRight.lng}, ${coords.topLeft.lat}, ${coords.bottomRight.lat}`);
	// console.warn('Geoareas Length', geoareas?.length);
	return geoareas;
}

export default executeFetchGeoareasByCoords
