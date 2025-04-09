import { VARCOClass } from "../VARCO/helpers/VARCO";
import { MAP, PLY, UI } from "../jsm/index.js";

// Creazione dell'istanza singleton di VARCO
const VARCO = VARCOClass.getInstance();

const loadWebGLUserData = (principal?: string) => {
    if (principal) {
        const _VARCO_F = VARCOClass.f as any;
        if (UI.p.scene.OBJECTS.previewProject !== undefined) {
            _VARCO_F.deleteElement(UI.p.scene, UI.p.scene.OBJECTS.previewProject);
        }
        // UI.p.menu_editor.f.open();
        PLY.p.geoMapSectors.oldSectHV = [0, 0];
    }
};

export default loadWebGLUserData;