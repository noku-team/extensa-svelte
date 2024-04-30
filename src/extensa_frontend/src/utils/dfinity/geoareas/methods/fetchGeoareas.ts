import type { Identity } from '@dfinity/agent';
import type { GeoArea } from '../../../../../../declarations/extensa_backend/extensa_backend.did';
import mapCanisterId from '../../mapCanisterId';
import { createCanister } from '../geoareas';

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
	const receipt = await get_geoarea_by_coords(
		coords.topLeft.lng,
		coords.bottomRight.lng,
		coords.topLeft.lat,
		coords.bottomRight.lat,
		[[principal, []]]
	);

	const [geoareas] = receipt;
	return geoareas;
}

export default executeFetchGeoareasByCoords
