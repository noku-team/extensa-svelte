import { onDestroy, onMount } from "svelte";
import { spinnerStore } from "../store/SpinnerStore";
import type { PostMessageDataResponseSendProject } from "../types/workers/post-message.sendProject";
import type { PostMessageDataResponseSync } from "../types/workers/post-message.sync";
import type { PostMessage } from "../types/workers/post-messages";

export type SendProjectCallback = (data: PostMessageDataResponseSendProject) => void

export const sendProjectWorker = new Worker(new URL('../workers/sendProject.worker', import.meta.url), { type: "module" });

const sendProjectCallback = (data: PostMessageDataResponseSendProject): void => {
  console.warn("Finished sending project with file ID:", data.fileId);
  spinnerStore.setLoading(false);
};

export const useSendProjectWorker = () => {
  onMount(() => {
    sendProjectWorker.onmessage = async ({ data }: MessageEvent<PostMessage<PostMessageDataResponseSendProject | PostMessageDataResponseSync>>) => {
      const { msg } = data

      switch (msg) {
        case 'startSendProject':
          spinnerStore.setLoading(true);
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