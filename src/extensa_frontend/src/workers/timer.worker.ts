import type { PostMessageResponse } from '../types/workers/post-messages'
import type { SyncState } from '../types/workers/sync'
// import { loadIdentity } from "$lib/utils/auth.utils";
import type { Identity } from '@dfinity/agent'
import { loadIdentity } from '../utils/auth/loadIdentity'

export interface TimerWorkerParams<T> {
	job: (params: TimerWorkerJobData<T>) => Promise<void>
	data: T
}
export type TimerWorkerJobData<T> = {
	data: T
} & TimerWorkerSyncParams

export interface TimerWorkerSyncParams {
	identity: Identity
}

export class TimerWorker {
	private timer: NodeJS.Timeout | undefined = undefined
	private timerStatus: SyncState = 'idle'

	async start<T>({ interval, ...rest }: TimerWorkerParams<T> & { interval: number }): Promise<void> {
		// This worker has already been started
		if (this.timer !== undefined) {
			return
		}

		// const identity: Identity | undefined = await loadIdentity();
		const identity: Identity | undefined = await loadIdentity()

		if (!identity) {
			// We do nothing if no identity
			console.error('Attempted to initiate a worker without an authenticated identity.')
			return
		}

		const execute = async () => await this.executeJob<T>({ identity, ...rest })

		// We sync the cycles now but also schedule the update after wards
		await execute()

		this.timer = setInterval(execute, interval)
	}

	private async executeJob<T>({ job, ...rest }: TimerWorkerParams<T> & TimerWorkerSyncParams): Promise<void> {
		// Avoid to sync if already in progress - do not duplicate calls - or if there was a previous error
		if (this.timerStatus !== 'idle') {
			return
		}

		this.setStatus('in_progress')

		try {
			await job({ ...rest })

			this.setStatus('idle')
		} catch (err: unknown) {
			console.error(err)

			// Once the status becomes "error", the job will no longer be called and the status will remain "error"
			this.setStatus('error')

			// Because it will no longer be called, we can stop it too
			this.stop()
		}
	}

	stop() {
		this.stopTimer()
		this.setStatus('idle')
	}

	postMsg<T>(data: { msg: PostMessageResponse; data: T }) {
		if (this.isIdle()) {
			// The worker was stopped between the start of the execution and the actual completion of the job it runs.
			return
		}

		postMessage(data)
	}

	private stopTimer() {
		if (!this.timer) {
			return
		}

		clearInterval(this.timer)
		this.timer = undefined
	}

	private isIdle(): boolean {
		return this.timerStatus === 'idle'
	}

	private setStatus(state: SyncState) {
		this.timerStatus = state
		postMessage({
			msg: 'syncStatus',
			data: {
				state,
			},
		})
	}
}
