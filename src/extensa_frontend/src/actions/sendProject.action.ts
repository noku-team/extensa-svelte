import { onDestroy, onMount } from "svelte";
import { messageStore } from "../store/MessageStore";
import { projectStore } from "../store/ProjectStore";
import type { PostMessageDataResponseSendProject } from "../types/workers/post-message.sendProject";
import type { PostMessageDataReceiveProgressSendProject, PostMessageDataResponseSync } from "../types/workers/post-message.sync";
import type { PostMessage } from "../types/workers/post-messages";

export type SendProjectCallback = (data: PostMessageDataResponseSendProject) => void

export const sendProjectWorker = new Worker(new URL('../workers/sendProject.worker', import.meta.url), { type: "module" });

const sendProjectCallback = (data: PostMessageDataResponseSendProject): void => {
  // Reset svelte store
  projectStore.setSendProjectProgress(0);
  projectStore.setNotYetSaved(false);

  if (data.fileId) {
    messageStore.setMessage(
      'Project sent successfully',
      'success',
    );
  } else {
    messageStore.setMessage(
      'Error sending project',
      'error',
    );
  }
};

const receiveProgress = (data: PostMessageDataReceiveProgressSendProject) => {
  const { progress } = data;
  projectStore.setSendProjectProgress(progress);
};

export const useSendProjectWorker = () => {
  onMount(() => {
    sendProjectWorker.onmessage = async ({ data }: MessageEvent<
      PostMessage<
        PostMessageDataResponseSendProject
        | PostMessageDataResponseSync
        | PostMessageDataReceiveProgressSendProject>
    >) => {
      const { msg } = data

      switch (msg) {
        case 'receiveProgressSendProject':
          receiveProgress(data.data as PostMessageDataReceiveProgressSendProject);
          return;
        case 'syncSendProject':
          sendProjectCallback?.(data.data as PostMessageDataResponseSendProject)
          return
        case 'syncStatus':
          return
        case 'syncErrorSendProject':
          console.error('syncErrorSendProject')
          return
      }
    }
  });

  onDestroy(() => {
    sendProjectWorker.onmessage = () => null;
    sendProjectWorker.terminate();
  });
};