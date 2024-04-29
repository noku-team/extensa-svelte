import { VARCO } from "../VARCO/helpers/VARCO";
import { PLY, UI } from "../jsm";

const loadWebGLUserData = (principal?: string) => {
    if (principal) {
        const accountToLoad = `USER_DB/${principal}.json`;
        const _VARCO_F = VARCO.f as any;
        _VARCO_F.loadJSON(
            accountToLoad,
            (logInData: any) => {
                if (UI.p.scene.OBJECTS.previewProject !== undefined) {
                    _VARCO_F.deleteElement(UI.p.scene, UI.p.scene.OBJECTS.previewProject);
                }
                UI.p.popup_login_data.p.data = logInData;
                UI.p.menu_editor.f.open();
                PLY.p.geoMapSectors.oldSectHV = [0, 0];
            },
            () => alert('the account not exist')
        );
    }
};

export default loadWebGLUserData;