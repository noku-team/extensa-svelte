import { AnonymousIdentity, type Identity } from '@dfinity/agent'
import type { PostMessageResponse } from '../types/workers/post-messages'
import type { SyncState } from '../types/workers/sync'
import { loadIdentity } from '../utils/auth/loadIdentity'

export interface WorkerParams<T> {
    job: (params: WorkerJobData<T>) => Promise<void>
    data: T
}

export type WorkerJobData<T> = {
    data: T
} & WorkerSyncParams

export interface WorkerSyncParams {
    identity: Identity
}

export class BaseWorker {
    private workerStatus: SyncState = 'idle'

    async execute<T>(params: WorkerParams<T>): Promise<void> {
        // If the worker is already executing a job, do not start a new one
        if (this.workerStatus !== 'idle') {
            return
        }

        let identity: Identity | undefined = await loadIdentity()

        if (!identity) identity = new AnonymousIdentity();

        await this.executeJob<T>({ identity, ...params })
    }

    private async executeJob<T>({ job, ...rest }: WorkerParams<T> & WorkerSyncParams): Promise<void> {
        this.setStatus('in_progress')

        try {
            await job({ ...rest })

            this.setStatus('idle')
        } catch (err: unknown) {
            console.error(err)

            this.setStatus('error')
        }
    }

    postMsg<T>(data: { msg: PostMessageResponse; data: T }) {
        if (this.isIdle()) {
            // The worker was stopped between the start of the execution and the actual completion of the job it runs.
            return
        }

        postMessage(data)
    }

    private isIdle(): boolean {
        return this.workerStatus === 'idle'
    }

    private setStatus(state: SyncState) {
        this.workerStatus = state
        postMessage({
            msg: 'syncStatus',
            data: {
                state,
            },
        })
    }
}