export type PostMessageRequest =
	| 'nnsStartIdleTimer'
	| 'nnsStopIdleTimer'
	| 'nnsStartMetricsTimer'
	| 'nnsStopMetricsTimer'
	| 'nnsStartCyclesTimer'
	| 'nnsStopCyclesTimer'
	| 'nnsStartTransactionsTimer'
	| 'nnsStopTransactionsTimer'
	| 'nnsStartSendProjectsTimer'
	| 'nnsStopSendProjectsTimer'
	| 'executeSendProjectWorker'
	| 'executeLoadProjectWorker'
	| 'startLoadProject'
	| 'syncLoadProject'
	| 'syncErrorLoadProject'
	| 'receiveProgressSendProject'

export type PostMessageResponse =
	| 'startLoadProject'
	| 'nnsSignOut'
	| 'nnsSyncMetrics'
	| 'nnsSyncCanister'
	| 'nnsDelegationRemainingTime'
	| 'nnsSyncTransactions'
	| 'nnsSyncErrorTransactions'
	| 'syncSendProject'
	| 'syncErrorSendProject'
	| 'syncStatus'
	| 'syncLoadProject'
	| 'syncErrorLoadProject'
	| 'syncStatus'
	| 'receiveProgressSendProject'

export interface PostMessage<T extends PostMessageData> {
	msg: PostMessageRequest | PostMessageResponse
	data: T
}

export type PostMessageData = object

export interface PostMessageDataActor extends PostMessageData {
	host?: string
	fetchRootKey: boolean
}
