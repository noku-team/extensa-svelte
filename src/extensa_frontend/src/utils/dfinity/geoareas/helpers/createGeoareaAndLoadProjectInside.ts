import type { Identity } from "@dfinity/agent";
import executeAddGeoarea from "../methods/addGeoarea";
import executeAddProject from "../methods/addProject";
import executeAllocateNewFile from "../methods/allocateNewFiles";
import storeCompleteFile from "./storeCompleteFile";

type Options = {
    geoAreaName: string;
    fileSize: number;
};

const createGeoareaAndLoadProjectInside = async (identity: Identity | null = null, options: Options) => {
    if (!identity) return;
    if (!process.env.CANISTER_ID_EXTENSA_BACKEND) return;

    const { geoAreaName = "", fileSize = 0 } = options ?? {};

    const geoareaId = await executeAddGeoarea({
        identity,
        canisterId: process.env.CANISTER_ID_EXTENSA_BACKEND,
        name: geoAreaName,
        coords: {
            alt: 0,
            lat: 45.64481184394597,
            lng: 9.817726187892196,
        },
    });

    // test file size for house 3d: 7485520
    const result = await executeAllocateNewFile({
        identity,
        canisterId: process.env.CANISTER_ID_EXTENSA_BACKEND,
        fileSize: 7485520,
    });

    const { fileId, numberOfChunks } = result ?? {};

    if (numberOfChunks && fileId) {
        const testFile = await fetch("/USER_DB/test/contents/house.json");
        const fileJson = await testFile.json();
        const file = fileJson.parameters.elementList[0].prop.parameters.url;

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
            type: "---",
            name: "House",
            position: {
                x: -5.256669446825981,
                y: 0.025,
                z: 34.826631393283606,
            },
            orientation: { x: 0, y: 0, z: 0 },
            size: { x: 1, y: 1, z: 1 },
            fileId,
        });
        console.warn("resultAddProject: ", resultAddProject);
    }
};

export default createGeoareaAndLoadProjectInside;