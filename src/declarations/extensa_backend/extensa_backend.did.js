export const idlFactory = ({ IDL }) => {
  const Coords = IDL.Record({
    'alt' : IDL.Float64,
    'lat' : IDL.Float64,
    'lng' : IDL.Float64,
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : IDL.Text });
  const XYZ = IDL.Record({
    'x' : IDL.Float64,
    'y' : IDL.Float64,
    'z' : IDL.Float64,
  });
  const Result_1 = IDL.Variant({
    'Ok' : IDL.Tuple(IDL.Nat64, IDL.Nat32, IDL.Nat32),
    'Err' : IDL.Text,
  });
  const Chunk = IDL.Record({
    'id' : IDL.Nat64,
    'value' : IDL.Text,
    'hash' : IDL.Text,
  });
  const File = IDL.Record({
    'id' : IDL.Nat64,
    'updated_at' : IDL.Nat64,
    'owner' : IDL.Tuple(IDL.Principal, IDL.Opt(IDL.Vec(IDL.Nat8))),
    'created_at' : IDL.Nat64,
    'chunks' : IDL.Vec(IDL.Opt(IDL.Nat64)),
  });
  const Project = IDL.Record({
    'id' : IDL.Nat64,
    'myPosition' : XYZ,
    'name' : IDL.Text,
    'type' : IDL.Text,
    'mySize' : XYZ,
    'myOrientation' : XYZ,
    'file_id' : IDL.Nat64,
  });
  const GeoArea = IDL.Record({
    'id' : IDL.Nat64,
    'user' : IDL.Tuple(IDL.Principal, IDL.Opt(IDL.Vec(IDL.Nat8))),
    'projectsList' : IDL.Vec(Project),
    'geoAreaName' : IDL.Text,
    'myCoords' : Coords,
  });
  return IDL.Service({
    'add_geoarea' : IDL.Func([IDL.Text, Coords], [Result], []),
    'add_project' : IDL.Func(
        [IDL.Nat64, IDL.Text, IDL.Text, XYZ, XYZ, XYZ, IDL.Nat64],
        [Result],
        [],
      ),
    'allocate_new_file' : IDL.Func([IDL.Nat32], [Result_1], []),
    'edit_geoarea' : IDL.Func(
        [IDL.Nat64, IDL.Opt(IDL.Text), IDL.Opt(Coords)],
        [Result],
        [],
      ),
    'edit_project' : IDL.Func(
        [
          IDL.Nat64,
          IDL.Nat64,
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
          IDL.Opt(XYZ),
          IDL.Opt(XYZ),
          IDL.Opt(XYZ),
          IDL.Opt(IDL.Nat64),
        ],
        [Result],
        [],
      ),
    'get_chunk_by_id' : IDL.Func([IDL.Nat64], [IDL.Opt(Chunk)], ['query']),
    'get_chunk_by_index' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [IDL.Opt(Chunk)],
        ['query'],
      ),
    'get_file' : IDL.Func([IDL.Nat64], [IDL.Opt(File)], ['query']),
    'get_geoarea_by_coords' : IDL.Func(
        [
          IDL.Float64,
          IDL.Float64,
          IDL.Float64,
          IDL.Float64,
          IDL.Opt(IDL.Tuple(IDL.Principal, IDL.Opt(IDL.Vec(IDL.Nat8)))),
        ],
        [IDL.Opt(IDL.Vec(GeoArea))],
        ['query'],
      ),
    'get_geoarea_by_id' : IDL.Func([IDL.Nat64], [IDL.Opt(GeoArea)], ['query']),
    'get_geoarea_by_user' : IDL.Func(
        [IDL.Opt(IDL.Tuple(IDL.Principal, IDL.Opt(IDL.Vec(IDL.Nat8))))],
        [IDL.Opt(IDL.Vec(GeoArea))],
        ['query'],
      ),
    'remove_geoarea' : IDL.Func([IDL.Nat64], [Result], []),
    'remove_project' : IDL.Func([IDL.Nat64, IDL.Nat64], [Result], []),
    'store_chunk' : IDL.Func([IDL.Nat64, IDL.Nat64, IDL.Text], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
