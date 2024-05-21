import type { Identity } from '@dfinity/agent'
import type { PostMessageDataRequestSendProject, PostMessageDataResponseSendProject } from '../types/workers/post-message.sendProject'
import type { PostMessage } from '../types/workers/post-messages'
import createGeoareaAndLoadProjectInside from '../utils/dfinity/geoareas/helpers/createGeoareaAndLoadProjectInside'
import { BaseWorker } from './base.worker'

export interface BaseWorkerUtilsSyncParams {
    identity: Identity
}

type BaseWorkerUtilsJobData<T> = {
    data: T
} & BaseWorkerUtilsSyncParams

const worker = new BaseWorker();

const emitResponse = (postMessageResponse: PostMessageDataResponseSendProject) => {
    const data: PostMessageDataResponseSendProject = { ...postMessageResponse }

    worker.postMsg({
        msg: 'syncSendProject',
        data,
    })
};

const emitProgress = (progress: number) => {
    worker.postMsg({
        msg: 'receiveProgressSendProject',
        data: { progress },
    })
}

const syncSendProjects = async (params: BaseWorkerUtilsJobData<PostMessageDataRequestSendProject>) => {
    try {
        emitProgress(1);
        const { data, identity } = params ?? {};
        const { geoAreaCoords, geoAreaName, file } = data ?? {};

        const fileObj = JSON.parse(file);

        // mocked for now
        const projectType = "3D";
        const projectPosition = fileObj.position || fileObj.myPosition;
        const projectOrientation = fileObj.rotation || fileObj.myOrientation;
        const projectSize = fileObj.scale || fileObj.mySize;
        const projectName = fileObj.name;

        const { addProjectResult, geoareaId } = await createGeoareaAndLoadProjectInside(
            identity,
            file,
            {
                geoAreaName,
                geoAreaCoords
            },
            {
                projectPosition,
                projectOrientation,
                projectSize,
                projectType,
                projectName
            },
            {
                callbackForProgress: (_progress: number) => {
                    worker.postMsg({
                        msg: 'receiveProgressSendProject',
                        data: { progress: _progress },
                    })
                }
            }
        ) ?? {};

        emitResponse({
            accountIdentifier: params.identity.getPrincipal().toString(),
            fileId: addProjectResult,
            geoareaId
        })
    } catch (err: unknown) {
        worker.postMsg({
            msg: 'syncErrorSendProject',
            data: err,
        })

        throw err
    }
}

onmessage = async ({ data: dataMsg }: MessageEvent<PostMessage<PostMessageDataRequestSendProject>>) => {
    const { msg, data } = dataMsg

    switch (msg) {
        case 'executeSendProjectWorker':
            await worker.execute({
                job: syncSendProjects,
                data,
            })

            return;
    }
}
