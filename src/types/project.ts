import type { Group } from "three";

export interface Coordinates {
    lng: number;
    lat: number;
    alt: number;
}

export interface GeoAreaProject {
    type: string;
    name: string;
    url: string;
    urlLowres: string;
    myPosition: {
        x: number;
        y: number;
        z: number;
    };
    myOrientation: {
        x: number;
        y: number;
        z: number;
    };
    mySize: {
        x: number;
        y: number;
        z: number;
    };
    previewImage: string;
}

export interface GeoArea extends Group {
    user: string;
    geoAreaName: string;
    sectorName: string;
    myCoords: Coordinates;
    projectsList: GeoAreaProject[];
}
export interface Project extends Group {
    is3DVisible: boolean;
}