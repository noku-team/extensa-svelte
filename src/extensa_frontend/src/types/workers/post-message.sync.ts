import type { PostMessageData } from './post-messages'
import type { SyncState } from './sync'

export interface PostMessageDataResponseSync extends PostMessageData {
	state: SyncState
}
