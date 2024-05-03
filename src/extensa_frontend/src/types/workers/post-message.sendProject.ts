import type { PostMessageData, PostMessageDataActor } from './post-messages';

export interface PostMessageDataRequestSendProject extends PostMessageDataActor {
	file: string;
	geoAreaName: string;
	geoAreaCoords: {
		lat: number
		lng: number
		alt: number
	}
}

export interface PostMessageDataResponseSendProjects extends PostMessageData {
	balances: PostMessageDataRequestSendProject[]
}

export type PostMessageDataResponseSendProject = {
	accountIdentifier: string
	fileId?: bigint
}
