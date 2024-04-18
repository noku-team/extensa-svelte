import EDITORSingleton from "./extensa_ed.js";
import MAPSingleton from "./extensa_map.js";
import PLYSingleton from "./extensa_ply.js";
import UISingleton from "./extensa_ui.js";

const UI = UISingleton.getInstance();
const EDITOR = EDITORSingleton.getInstance();
const PLY = PLYSingleton.getInstance();
const MAP = MAPSingleton.getInstance();

export { EDITOR, MAP, PLY, UI };

