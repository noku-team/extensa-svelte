import type { Identity } from '@dfinity/agent'
import type { File } from '../../../declarations/extensa_backend/extensa_backend.did'
import type { PostMessageDataRequestLoadProject, PostMessageDataResponseLoadProject } from '../types/workers/post-message.loadProject'
import type { PostMessage } from '../types/workers/post-messages'
import downloadFileChunks from '../utils/dfinity/geoareas/helpers/downloadFileChunks'
import executeGetFile from '../utils/dfinity/geoareas/methods/getFile'
import { BaseWorker } from './base.worker'

export interface BaseWorkerUtilsSyncParams {
    identity: Identity
}

type BaseWorkerUtilsJobData<T> = {
    data: T
} & BaseWorkerUtilsSyncParams

const worker = new BaseWorker();

const emitResponse = (postMessageResponse: PostMessageDataResponseLoadProject) => {
    const data: PostMessageDataResponseLoadProject = { ...postMessageResponse }

    worker.postMsg({
        msg: 'syncLoadProject',
        data,
    })
}

const emitProgress = (progress: number) => {
    worker.postMsg({
        msg: 'receiveProgressLoadProject',
        data: { progress },
    })
}

const syncLoadProjects = async (params: BaseWorkerUtilsJobData<PostMessageDataRequestLoadProject>) => {
    try {
        if (process.env.CANISTER_ID_EXTENSA_BACKEND) {
            emitProgress(1);
            const { data, identity } = params ?? {};
            const { fileId } = data ?? {};

            const [file] = await executeGetFile({
                canisterId: process.env.CANISTER_ID_EXTENSA_BACKEND ?? "",
                fileId,
                identity: identity,
            });

            const { id, chunks } = file ?? {} as File;
            const numberOfChunks = chunks.length;

            const finalFile = await downloadFileChunks(
                identity,
                process.env.CANISTER_ID_EXTENSA_BACKEND,
                id,
                numberOfChunks,
                {
                    callbackForProgress: (_progress: number) => {
                        worker.postMsg({
                            msg: 'receiveProgressLoadProject',
                            data: { progress: _progress },
                        })
                    }
                }
            );

            emitResponse({ accountIdentifier: params.identity.getPrincipal().toString(), file: finalFile, fileId })
        }
    } catch (err: unknown) {
        worker.postMsg({
            msg: 'syncErrorLoadProject',
            data: err,
        })

        throw err
    }
}

onmessage = async ({ data: dataMsg }: MessageEvent<PostMessage<PostMessageDataRequestLoadProject>>) => {
    const { msg, data } = dataMsg

    switch (msg) {
        case 'executeLoadProjectWorker':
            await worker.execute({
                job: syncLoadProjects,
                data,
            })

            return;
    }
}
