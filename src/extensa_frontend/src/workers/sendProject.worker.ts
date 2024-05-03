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

const startToFetch = () => {
    worker.postMsg({
        msg: 'startSendProject',
        data: {},
    })
};

const emitResponse = (postMessageResponse: PostMessageDataResponseSendProject) => {
    const data: PostMessageDataResponseSendProject = { ...postMessageResponse }

    worker.postMsg({
        msg: 'syncSendProject',
        data,
    })
}

const syncSendProjects = async (params: BaseWorkerUtilsJobData<PostMessageDataRequestSendProject>) => {
    try {
        startToFetch();
        const { data, identity } = params;
        const { geoAreaCoords, geoAreaName, file } = data;

        const fileObj = JSON.parse(file);

        // mocked for now
        const projectType = "3D";
        const projectPosition = fileObj.position;
        const projectOrientation = fileObj.rotation;
        const projectSize = fileObj.scale;
        const projectName = fileObj.name;

        const response = await createGeoareaAndLoadProjectInside(
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
        );

        emitResponse({ accountIdentifier: params.identity.getPrincipal().toString(), fileId: response })
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
