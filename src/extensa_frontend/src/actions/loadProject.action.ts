import { onDestroy, onMount } from "svelte";
import { EDITOR } from "../jsm";
import { projectStore } from "../store/ProjectStore";
import { spinnerStore } from "../store/SpinnerStore";
import type { PostMessageDataReceiveProgressLoadProject, PostMessageDataResponseLoadProject } from "../types/workers/post-message.loadProject";
import type { PostMessageDataResponseSync } from "../types/workers/post-message.sync";
import type { PostMessage } from "../types/workers/post-messages";
import { saveProject } from "../utils/indexedDB/getSaveEmpty";

export type LoadProjectCallback = (data: PostMessageDataResponseLoadProject) => void

export const loadProjectWorker = new Worker(new URL('../workers/loadProject.worker', import.meta.url), { type: "module" });

const loadProjectCallback = async (data: PostMessageDataResponseLoadProject): Promise<void> => {
  const { file = "", fileId } = data ?? {};
  await saveProject(`project-${fileId.toString()}`, file, 2);

  await EDITOR.f.loadProjectData(file);
  projectStore.setLoadProjectProgress(0);
};

const receiveProgress = (data: PostMessageDataReceiveProgressLoadProject) => {
  const { progress } = data;
  projectStore.setLoadProjectProgress(progress);
};


export const useLoadProjectWorker = () => {
  onMount(async () => {
    loadProjectWorker.onmessage = async ({ data }:
      MessageEvent<
        PostMessage<
          PostMessageDataResponseLoadProject |
          PostMessageDataResponseSync |
          PostMessageDataReceiveProgressLoadProject
        >
      >) => {
      const { msg } = data

      switch (msg) {
        case 'receiveProgressLoadProject':
          receiveProgress(data.data as PostMessageDataReceiveProgressLoadProject);
          return;
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