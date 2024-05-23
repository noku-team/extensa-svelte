import type { Identity } from "@dfinity/agent";
import type { XYZ } from "../../../../../../declarations/extensa_backend/extensa_backend.did";
import CustomError, { ErrorType } from "../../../../errors/CustomError";
import executeAddGeoarea from "../methods/addGeoarea";
import executeAddProject from "../methods/addProject";
import executeAllocateNewFile from "../methods/allocateNewFiles";
import executeDeleteGeoarea from "../methods/deleteGeoarea";
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

type CreateGeoAreaOptions = {
    callbackForProgress: (progress: number) => void;
}

const createGeoareaAndLoadProjectInside = async (
    identity: Identity | null = null,
    file = "",
    geoarea: GeoareaOptions,
    project: ProjectOptions,
    options: CreateGeoAreaOptions = {} as CreateGeoAreaOptions
) => {
    if (!identity) return;
    if (!process.env.CANISTER_ID_EXTENSA_BACKEND) return;

    let geoareaId: bigint | undefined;

    try {
        // const file = "a".repeat(500 * 1024 * 1024);

        const { callbackForProgress } = options;

        const { geoAreaName = "", geoAreaCoords } = geoarea ?? {};
        const {
            projectPosition,
            projectOrientation,
            projectSize,
            projectType,
            projectName
        } = project ?? {};

        geoareaId = await executeAddGeoarea({
            identity,
            canisterId: process.env.CANISTER_ID_EXTENSA_BACKEND,
            name: geoAreaName,
            coords: geoAreaCoords,
        });

        const fileSize = file.length;

        const result = await executeAllocateNewFile({
            identity,
            canisterId: process.env.CANISTER_ID_EXTENSA_BACKEND,
            fileSize,
        });

        const { fileId, numberOfChunks } = result ?? {};

        if (numberOfChunks && fileId) {
            await storeCompleteFile(
                {
                    identity,
                    canisterId: process.env.CANISTER_ID_EXTENSA_BACKEND,
                },
                {
                    fileId,
                    numberOfChunks,
                    file,
                },
                { callbackForProgress }
            );
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
            return { addProjectResult: resultAddProject, geoareaId };
        }
    } catch (e) {
        const deleteGeoarea = async () => {
            if (geoareaId && process.env.CANISTER_ID_EXTENSA_BACKEND) {
                await executeDeleteGeoarea({
                    identity,
                    canisterId: process.env.CANISTER_ID_EXTENSA_BACKEND,
                    geoareaId,
                });
            }
        }

        console.error(e);
        // Error generated from an ICP API call
        if (e instanceof CustomError) {
            switch (e.getType()) {
                case ErrorType.CREATE_GEOAREA:
                    // No-ops
                    break;
                case ErrorType.CREATE_PROJECT:
                    // Delete geoarea
                    await deleteGeoarea();
                    break;
                case ErrorType.ALLOCATE_NEW_FILE:
                    await deleteGeoarea();
                    console.error("Error allocating new file");
                    break;
                case ErrorType.STORE_FILE_CHUNK:
                    await deleteGeoarea();
                    console.error("Error storing file chunk");
                    break;
            }
        }
    }
};

export default createGeoareaAndLoadProjectInside;