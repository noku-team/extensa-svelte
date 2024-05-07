import type { PostMessageData, PostMessageDataActor } from './post-messages';

export interface PostMessageDataRequestLoadProject extends PostMessageDataActor {
	fileId: bigint;
}

export interface PostMessageDataResponseLoadProjects extends PostMessageData {
	balances: PostMessageDataRequestLoadProject[]
}

export type PostMessageDataResponseLoadProject = {
	accountIdentifier: string
	file: string;
	fileId: bigint;
}


export interface PostMessageDataReceiveProgressLoadProject extends PostMessageData {
	progress: number
}
