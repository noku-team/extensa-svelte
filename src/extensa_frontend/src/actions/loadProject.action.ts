import { onDestroy, onMount } from "svelte";
import { EDITOR } from "../jsm";
import { spinnerStore } from "../store/SpinnerStore";
import type { PostMessageDataResponseLoadProject } from "../types/workers/post-message.loadProject";
import type { PostMessageDataResponseSync } from "../types/workers/post-message.sync";
import type { PostMessage } from "../types/workers/post-messages";
import { saveProject } from "../utils/indexedDB/getSaveEmpty";

export type LoadProjectCallback = (data: PostMessageDataResponseLoadProject) => void

export const loadProjectWorker = new Worker(new URL('../workers/loadProject.worker', import.meta.url), { type: "module" });

const loadProjectCallback = async (data: PostMessageDataResponseLoadProject): Promise<void> => {
  const { file = "", fileId } = data ?? {};
  await saveProject(`project-${fileId.toString()}`, file);

  await EDITOR.f.loadProjectData(file);
  spinnerStore.setLoading(false);
};

export const useLoadProjectWorker = () => {
  onMount(async () => {
    loadProjectWorker.onmessage = async ({ data }: MessageEvent<PostMessage<PostMessageDataResponseLoadProject | PostMessageDataResponseSync>>) => {
      const { msg } = data

      switch (msg) {
        case 'startLoadProject':
          spinnerStore.setLoading(true);
          return;
        case 'syncLoadProject':
          await loadProjectCallback?.(data.data as PostMessageDataResponseLoadProject)
          return
        case 'syncStatus':
          return
        case 'syncErrorLoadProject':
          console.error('syncErrorLoadProject')
          return
      }
    }
  });

  onDestroy(() => {
    loadProjectWorker.onmessage = () => null;
    loadProjectWorker.terminate();
  });
};