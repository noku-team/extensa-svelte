import type { Identity } from "@dfinity/agent";
import type { XYZ } from "../../../../../../declarations/extensa_backend/extensa_backend.did";
import executeAddGeoarea from "../methods/addGeoarea";
import executeAddProject from "../methods/addProject";
import executeAllocateNewFile from "../methods/allocateNewFiles";
import storeCompleteFile from "./storeCompleteFile";

type GeoareaOptions = {
    geoAreaName: string;
    geoAreaCoords: {
        lat: number;
        lng: number;
        alt: number;
    };
};

type ProjectOptions = {
    projectPosition: XYZ;
    projectOrientation: XYZ;
    projectSize: XYZ;
    projectType: string;
    projectName: string;
}

const createGeoareaAndLoadProjectInside = async (
    identity: Identity | null = null,
    file = "",
    geoarea: GeoareaOptions,
    project: ProjectOptions) => {
    if (!identity) return;
    if (!process.env.CANISTER_ID_EXTENSA_BACKEND) return;

    const { geoAreaName = "", geoAreaCoords } = geoarea ?? {};
    const {
        projectPosition,
        projectOrientation,
        projectSize,
        projectType,
        projectName
    } = project ?? {};

    const geoareaId = await executeAddGeoarea({
        identity,
        canisterId: process.env.CANISTER_ID_EXTENSA_BACKEND,
        name: geoAreaName,
        coords: geoAreaCoords,
    });

    const fileSize = file.length;
    // test file size for house 3d: 7485520
    const result = await executeAllocateNewFile({
        identity,
        canisterId: process.env.CANISTER_ID_EXTENSA_BACKEND,
        fileSize,
    });

    const { fileId, numberOfChunks } = result ?? {};

    if (numberOfChunks && fileId) {
        const resultStore = await storeCompleteFile(
            {
                identity,
                canisterId: process.env.CANISTER_ID_EXTENSA_BACKEND,
            },
            {
                fileId,
                numberOfChunks,
                file,
            }
        );
        console.warn("finished store file: ", resultStore);
    }

    if (fileId && geoareaId) {
        const resultAddProject = await executeAddProject({
            identity,
            canisterId: process.env.CANISTER_ID_EXTENSA_BACKEND,
            geoareaId,
            type: projectType,
            name: projectName,
            position: projectPosition,
            orientation: projectOrientation,
            size: projectSize,
            fileId,
        });
        console.warn(`+++ PROCEDURE FINISHED: ${resultAddProject} +++`);
        return resultAddProject;
    }
};

export default createGeoareaAndLoadProjectInside;