import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Chunk { 'id' : bigint, 'value' : string, 'hash' : string }
export interface Coords { 'alt' : number, 'lat' : number, 'lng' : number }
export interface File {
  'id' : bigint,
  'updated_at' : bigint,
  'owner' : [Principal, [] | [Uint8Array | number[]]],
  'created_at' : bigint,
  'chunks' : Array<[] | [bigint]>,
}
export interface GeoArea {
  'id' : bigint,
  'user' : [Principal, [] | [Uint8Array | number[]]],
  'projectsList' : Array<Project>,
  'geoAreaName' : string,
  'myCoords' : Coords,
}
export interface Project {
  'id' : bigint,
  'myPosition' : XYZ,
  'name' : string,
  'type' : string,
  'mySize' : XYZ,
  'myOrientation' : XYZ,
  'file_id' : bigint,
}
export type Result = { 'Ok' : bigint } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : [bigint, number, number] } |
  { 'Err' : string };
export interface XYZ { 'x' : number, 'y' : number, 'z' : number }
export interface _SERVICE {
  'add_geoarea' : ActorMethod<[string, Coords], Result>,
  'add_project' : ActorMethod<
    [bigint, string, string, XYZ, XYZ, XYZ, bigint],
    Result
  >,
  'allocate_new_file' : ActorMethod<[number], Result_1>,
  'edit_geoarea' : ActorMethod<[bigint, [] | [string], [] | [Coords]], Result>,
  'edit_project' : ActorMethod<
    [
      bigint,
      bigint,
      [] | [string],
      [] | [string],
      [] | [XYZ],
      [] | [XYZ],
      [] | [XYZ],
      [] | [bigint],
    ],
    Result
  >,
  'get_chunk_by_id' : ActorMethod<[bigint], [] | [Chunk]>,
  'get_chunk_by_index' : ActorMethod<[bigint, bigint], [] | [Chunk]>,
  'get_file' : ActorMethod<[bigint], [] | [File]>,
  'get_geoarea_by_coords' : ActorMethod<
    [
      number,
      number,
      number,
      number,
      [] | [[Principal, [] | [Uint8Array | number[]]]],
    ],
    [] | [Array<GeoArea>]
  >,
  'get_geoarea_by_id' : ActorMethod<[bigint], [] | [GeoArea]>,
  'get_geoarea_by_user' : ActorMethod<
    [[] | [[Principal, [] | [Uint8Array | number[]]]]],
    [] | [Array<GeoArea>]
  >,
  'remove_geoarea' : ActorMethod<[bigint], Result>,
  'remove_project' : ActorMethod<[bigint, bigint], Result>,
  'store_chunk' : ActorMethod<[bigint, bigint, string], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
