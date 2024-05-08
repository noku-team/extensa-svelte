/*
    SECTION 1: Imports
*/

use candid::{CandidType, Decode, Deserialize, Encode, Principal};
use hex;
use ic_cdk::api;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::storable::Bound;
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap, StableCell, Storable};
use sha2::{Digest, Sha256}; // Importing Digest and SHA256
use std::borrow::Cow;
use std::cell::RefCell; // For converting the hash to a hexadecimal representation

/*
    SECTION 2: Types & Structs Definition
*/

type Subaccount = [u8; 32];
type Account = (Principal, Option<Subaccount>); //unused at the moment
type ChunkId = u64;
type FileId = u64;
type Coordinate = f64;
type GeoAreaId = u64;
type ProjectId = u64;

#[derive(CandidType, Deserialize)]
struct Chunk {
    id: ChunkId,
    hash: String,
    value: String,
}

#[derive(CandidType, Deserialize)]
struct File {
    id: FileId,
    chunks: Vec<Option<ChunkId>>,
    created_at: u64,
    updated_at: u64,
    owner: Account,
}

#[derive(CandidType, Deserialize, Copy, Clone)]
struct Coords {
    lng: Coordinate,
    lat: Coordinate,
    alt: Coordinate,
}

#[derive(CandidType, Deserialize, Copy, Clone)]
struct XYZ {
    x: f64,
    y: f64,
    z: f64,
}

#[derive(CandidType, Deserialize, Clone)]
struct Project {
    r#type: String,
    name: String,
    myPosition: XYZ,
    myOrientation: XYZ,
    mySize: XYZ,
    file_id: FileId,
    //internal
    id: ProjectId,
}

#[derive(CandidType, Deserialize)]
struct GeoArea {
    user: Account,
    geoAreaName: String,
    myCoords: Coords,
    projectsList: Vec<Project>,
    // internal
    id: GeoAreaId,
}

/*
    SECTION 3: CONSTANTS & GLOBALS
*/

// NOTE: ensure that all memory ids are unique and
// do not change across upgrades!
const FILES_MEM_ID: MemoryId = MemoryId::new(0);
const CHUNKS_MEM_ID: MemoryId = MemoryId::new(1);
const LAST_FILE_ID_MEM_ID: MemoryId = MemoryId::new(2);
const LAST_CHUNK_ID_MEM_ID: MemoryId = MemoryId::new(3);
const GEOAREAS_MEM_ID: MemoryId = MemoryId::new(4);
const LAST_GEOAREA_ID_MEM_ID: MemoryId = MemoryId::new(5);
const LAST_PROJECT_ID_MEM_ID: MemoryId = MemoryId::new(6);

const MAX_CHUNK_LENGTH: u32 = (2 * 1024 * 1024) - (100 * 1024);
const MAX_FILE_LENGTH: u32 = 1 * 1024 * 1024 * 1024;

/// The maximum size, in bytes, of the type when serialized.
const MAX_STORABLE_CHUNK_SIZE: u32 = 2 * 1024 * 1024; //2MB
const MAX_STORABLE_FILE_SIZE: u32 = 1024 * 100;
const MAX_STORABLE_GEOAREA_SIZE: u32 = 1024 * 100;

/*
    SECTION 4: SERIALIZATION
*/

impl Storable for Chunk {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: MAX_STORABLE_CHUNK_SIZE,
        is_fixed_size: false,
    };
}

impl Storable for File {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: MAX_STORABLE_FILE_SIZE,
        is_fixed_size: false,
    };
}

impl Storable for GeoArea {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: MAX_STORABLE_GEOAREA_SIZE,
        is_fixed_size: false,
    };
}

/*
    SECTION 5: STABLE STRUCTURES DEFINITION
*/

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
  // The memory manager is used for simulating multiple memories. Given a `MemoryId` it can
  // return a memory that can be used by stable structures.
  static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
      RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

  static FILES_MAP: RefCell<StableBTreeMap<FileId, File, Memory>> = RefCell::new(
      StableBTreeMap::init(
          MEMORY_MANAGER.with(|m| m.borrow().get(FILES_MEM_ID)),
      )
  );

  static CHUNKS_MAP: RefCell<StableBTreeMap<ChunkId, Chunk, Memory>> = RefCell::new(
    StableBTreeMap::init(
        MEMORY_MANAGER.with(|m| m.borrow().get(CHUNKS_MEM_ID)),
    )
  );

  static LAST_FILE_ID_CELL: RefCell<StableCell<FileId, Memory>> = RefCell::new(
    StableCell::init(
        MEMORY_MANAGER.with(|m| m.borrow().get(LAST_FILE_ID_MEM_ID)),
        0,
    ).expect("Failed to init LAST_FILE_ID_CELL")
  );

  static LAST_CHUNK_ID_CELL: RefCell<StableCell<ChunkId, Memory>> = RefCell::new(
    StableCell::init(
        MEMORY_MANAGER.with(|m| m.borrow().get(LAST_CHUNK_ID_MEM_ID)),
        0,
    ).expect("Failed to init LAST_CHUNK_ID_CELL")
  );

  static GEOAREAS_MAP: RefCell<StableBTreeMap<GeoAreaId, GeoArea, Memory>> = RefCell::new(
    StableBTreeMap::init(
        MEMORY_MANAGER.with(|m| m.borrow().get(GEOAREAS_MEM_ID)),
    )
  );

  static LAST_GEOAREA_ID_CELL: RefCell<StableCell<GeoAreaId, Memory>> = RefCell::new(
    StableCell::init(
        MEMORY_MANAGER.with(|m| m.borrow().get(LAST_GEOAREA_ID_MEM_ID)),
        0,
    ).expect("Failed to init LAST_GEOAREA_ID_CELL")
  );

  static LAST_PROJECT_ID_CELL: RefCell<StableCell<ProjectId, Memory>> = RefCell::new(
    StableCell::init(
        MEMORY_MANAGER.with(|m| m.borrow().get(LAST_PROJECT_ID_MEM_ID)),
        0,
    ).expect("Failed to init LAST_PROJECT_ID_CELL")
  );
}

/*
    SECTION 6: FUNCTIONS
*/

/*
    SECTION 6.1: EXPORTED FUNCTIONS
*/

#[ic_cdk::update]
fn add_geoarea(name: String, coords: Coords) -> Result<GeoAreaId, String> {
    match authenticate_call(None) {
        Ok(caller) => {
            let geoarea_id = create_new_geoarea(name, caller, coords);
            Ok(geoarea_id)
        }
        Err(error_message) => Err(error_message),
    }
}

#[ic_cdk::update]
fn edit_geoarea(id: GeoAreaId, name: Option<String>, coords: Option<Coords>) -> Result<GeoAreaId, String> {
    match authenticate_call(None) {
        Err(error_message) => Err(error_message),
        Ok(caller) => {
            let geoarea_result = get_geoarea_by_id(id);
            match geoarea_result {
                None => Err(String::from("Geoarea not found.")),
                Some(mut geoarea) => {
                    if compare_accounts(caller, geoarea.user) {
                        if let Some(new_name) = name {
                            geoarea.geoAreaName = new_name;
                        }
                        if let Some(new_coords) = coords {
                            geoarea.myCoords = new_coords;
                        }

                        GEOAREAS_MAP.with(|p| p.borrow_mut().insert(id, geoarea));
                        return Ok(id);
                    }
                    Err(String::from("Caller is not owner of this element."))
                }
            }
        }
    }
}

#[ic_cdk::query]
fn get_geoarea_by_id(id: GeoAreaId) -> Option<GeoArea> {
    GEOAREAS_MAP.with(|p| p.borrow().get(&id))
}

#[ic_cdk::query]
fn get_geoarea_by_coords(lng_1: Coordinate, lng_2: Coordinate, lat_1: Coordinate, lat_2: Coordinate, user: Option<Account>) -> Option<Vec<GeoArea>> {
    let mut matching_values = Vec::new();
    GEOAREAS_MAP.with(|p| {
        p.borrow().iter().for_each(|(_key, geoarea)| {
            if is_inside_coordinates(geoarea.myCoords.lng, lng_1, lng_2) && is_inside_coordinates(geoarea.myCoords.lat, lat_1, lat_2) {
                if let Some(user_to_search) = user {
                    if compare_accounts(user_to_search, geoarea.user) {
                        matching_values.push(geoarea);
                    }
                } else {
                    matching_values.push(geoarea);
                }
            }
        })
    });
    Some(matching_values)
}

#[ic_cdk::query]
fn get_geoarea_by_user(user: Option<Account>) -> Option<Vec<GeoArea>> {
    let user_to_search = match user {
        Some(user_value) => user_value,
        None => match authenticate_call(None) {
            Ok(caller) => caller,
            Err(_error_message) => (Principal::anonymous(), None),
        },
    };

    let mut matching_values = Vec::new();
    GEOAREAS_MAP.with(|p| {
        p.borrow().iter().for_each(|(_key, geoarea)| {
            if compare_accounts(user_to_search, geoarea.user) {
                matching_values.push(geoarea);
            }
        })
    });
    Some(matching_values)
}

#[ic_cdk::update]
fn add_project(geoarea_id: GeoAreaId, r#type: String, name: String, position: XYZ, orientation: XYZ, size: XYZ, file_id: FileId) -> Result<ProjectId, String> {
    match authenticate_call(None) {
        Err(error_message) => Err(error_message),
        Ok(caller) => {
            let geoarea_result = get_geoarea_by_id(geoarea_id);
            match geoarea_result {
                None => Err(String::from("Geoarea not found.")),
                Some(mut geoarea) => {
                    if compare_accounts(caller, geoarea.user) == false {
                        return Err(String::from("Caller is not owner of this element."));
                    }

                    let project_id = get_new_project_id();

                    let new_project = Project {
                        r#type: r#type.clone(),
                        name: name.clone(),
                        myPosition: position,
                        myOrientation: orientation,
                        mySize: size,
                        id: project_id,
                        file_id,
                    };

                    geoarea.projectsList = add_or_replace_project_to_list(geoarea.projectsList, new_project);

                    GEOAREAS_MAP.with(|p| p.borrow_mut().insert(geoarea_id, geoarea));
                    Ok(project_id)

                }
            }
        }
    }
}

#[ic_cdk::update]
fn edit_project(
    geoarea_id: GeoAreaId,
    project_id: ProjectId,
    r#type: Option<String>,
    name: Option<String>,
    position: Option<XYZ>,
    orientation: Option<XYZ>,
    size: Option<XYZ>,
    file_id: Option<FileId>,
) -> Result<ProjectId, String> {
    match authenticate_call(None) {
        Err(error_message) => Err(error_message),
        Ok(caller) => {
            let geoarea_result = get_geoarea_by_id(geoarea_id);
            match geoarea_result {
                None => Err(String::from("Geoarea not found.")),
                Some(mut geoarea) => {
                    if compare_accounts(caller, geoarea.user) == false {
                        return Err(String::from("Caller is not owner of this element."));
                    }

                    match geoarea.projectsList.iter().find(|&x| x.id == project_id) {
                        None => return Err(String::from("Project not found.")),
                        Some(previous_project) => {
                            let mut edited_project = previous_project.clone();

                            if let Some(new_type) = r#type {
                                edited_project.r#type = new_type.to_string();
                            }
                            if let Some(new_name) = name {
                                edited_project.name = new_name.to_string();
                            }
                            if let Some(new_position) = position {
                                edited_project.myPosition = new_position.clone();
                            }
                            if let Some(new_orientation) = orientation {
                                edited_project.myOrientation = new_orientation.clone();
                            }
                            if let Some(new_size) = size {
                                edited_project.mySize = new_size.clone();
                            }
                            if let Some(new_file_id) = file_id {
                                edited_project.file_id = new_file_id.clone();
                            }

                            geoarea.projectsList = add_or_replace_project_to_list(geoarea.projectsList, edited_project);

                            GEOAREAS_MAP.with(|p| p.borrow_mut().insert(geoarea_id, geoarea));
                            Ok(project_id)

                        }
                    }
                }
            }
        }
    }
}

#[ic_cdk::update]
fn remove_geoarea(geoarea_id: GeoAreaId) -> Result<GeoAreaId, String> {
    match authenticate_call(None) {
        Err(error_message) => Err(error_message),
        Ok(caller) => {
            let geoarea_result = get_geoarea_by_id(geoarea_id);
            match geoarea_result {
                None => Err(String::from("Geoarea not found.")),
                Some(geoarea) => {
                    if compare_accounts(caller, geoarea.user) == false {
                        return Err(String::from("Caller is not owner of this element."));
                    }
                    GEOAREAS_MAP.with(|p| p.borrow_mut().remove(&geoarea_id));
                    Ok(geoarea_id)

                }
            }
        }
    }
}

#[ic_cdk::update]
fn remove_project(geoarea_id: GeoAreaId, project_id: ProjectId) -> Result<ProjectId, String> {
    match authenticate_call(None) {
        Err(error_message) => Err(error_message),
        Ok(caller) => {
            let geoarea_result = get_geoarea_by_id(geoarea_id);
            match geoarea_result {
                None => Err(String::from("Geoarea not found.")),
                Some(mut geoarea) => {
                    if compare_accounts(caller, geoarea.user) == false {
                        return Err(String::from("Caller is not owner of this element."));
                    }

                    geoarea.projectsList = remove_project_from_list(geoarea.projectsList, project_id);

                    GEOAREAS_MAP.with(|p| p.borrow_mut().insert(geoarea_id, geoarea));
                    Ok(project_id)

                }
            }
        }
    }
}

/// Allocates a new file with the specified size. This function is a core operation within the system, responsible for
/// initializing a new file entry, dividing it into manageable chunks, and associating it with the caller as the file's owner.
/// 
/// # Arguments
/// 
/// * `file_size` - The size of the file to be allocated, expressed in bytes. It determines the total storage capacity required
///   for the file's data.
/// 
/// # Returns
/// 
/// Returns a tuple containing the following information about the newly allocated file:
/// 
/// * `file_id` - A unique identifier assigned to the file upon creation, facilitating its retrieval and manipulation.
/// * `number_of_chunks` - The total number of chunks the file is divided into. This value depends on the size of the file
///   and the predetermined maximum chunk size (`MAX_CHUNK_LENGTH`).
/// * `MAX_CHUNK_LENGTH` - The maximum size allowed for each chunk. Chunks are used to manage the file's data in smaller,
///   more manageable portions.
/// 
/// # Errors
/// 
/// If the specified `file_size` exceeds the maximum allowed file length (`MAX_FILE_LENGTH`), the function returns an error
/// indicating that the file size is too large for allocation.
/// 
/// If the authentication process fails, the function returns an error with the provided error message. Authentication
/// is crucial to ensure that only authorized users can allocate new files.
#[ic_cdk::update]
fn allocate_new_file(file_size: u32) -> Result<(FileId, u32, u32), String> {
    if file_size > MAX_FILE_LENGTH {
        return Err(String::from("File too big."));
    }

    match authenticate_call(None) {
        Ok(caller) => {
            let file_id = get_new_file_id();
            let number_of_chunks = (file_size / MAX_CHUNK_LENGTH) + 1;
            let mut chunks = Vec::new();

            for _ in 0..number_of_chunks {
                chunks.push(None);
            }

            FILES_MAP.with(|p| {
                p.borrow_mut().insert(
                    file_id,
                    File {
                        id: file_id,
                        chunks,
                        created_at: api::time(),
                        updated_at: api::time(),
                        owner: caller,
                    },
                )
            });
            Ok((file_id, number_of_chunks, MAX_CHUNK_LENGTH))
        }
        Err(error_message) => Err(error_message),
    }
}

#[ic_cdk::query]
fn get_file(file_id: FileId) -> Option<File> {
    FILES_MAP.with(|p| p.borrow().get(&file_id))
}

#[ic_cdk::query]
fn get_chunk_by_id(chunk_id: ChunkId) -> Option<Chunk> {
    CHUNKS_MAP.with(|p| p.borrow().get(&chunk_id))
}

#[ic_cdk::query]
fn get_chunk_by_index(file_id: FileId, index: usize) -> Option<Chunk> {
    let file_result = get_file(file_id);
    match file_result {
        None => None,
        Some(file) => {
            if index >= file.chunks.len() {
                return None;
            } else {
                let chunk_id_result = file.chunks[index];
                match chunk_id_result {
                    None => None,
                    Some(chunk_id) => get_chunk_by_id(chunk_id),
                }
            }
        }
    }
}

/// Stores a data chunk in a specified file on the blockchain.
///
/// This update call modifies the state on the blockchain by attempting to add a new data
/// chunk to a specified file, identified by its `file_id`. The chunk is only added if the
/// caller is authenticated and authorized to modify the file, the file exists, and the
/// specified chunk index is valid and not already occupied.
///
/// # Arguments
/// * `file_id` - A `FileId` representing the unique identifier of the file to which the chunk
///   is to be added.
/// * `index` - The index position in the file where the chunk is to be stored. This must be
///   within the current size bounds of the file's chunk array.
/// * `value` - A `String` representing the content of the chunk to be stored.
///
/// # Returns
/// A `Result` that contains:
/// * `Ok(ChunkId)` - On success, returns the unique identifier (`ChunkId`) of the newly stored chunk.
/// * `Err(String)` - On failure, returns an error message indicating the reason for the failure,
///   such as authentication issues, file not found, ownership mismatch, index out of bounds, or
///   attempting to overwrite an existing chunk.
///
/// # Errors
/// * "File not found." - If no file corresponds to the provided `file_id`.
/// * "Caller is not owner of this element." - If the caller does not own the file.
/// * "This chunk is outside the file size." - If the specified index is outside the current chunk array bounds.
/// * "Chunks cannot be overwritten." - If a chunk already exists at the specified index.
#[ic_cdk::update]
fn store_chunk(file_id: FileId, index: usize, value: String) -> Result<ChunkId, String> {
    match authenticate_call(None) {
        Err(error_message) => Err(error_message),
        Ok(caller) => match get_file(file_id) {
            None => return Err(String::from("File not found.")),
            Some(mut file) => {
                if compare_accounts(caller, file.owner) == false {
                    return Err(String::from("Caller is not owner of this element."));
                }

                if index >= file.chunks.len() {
                    return Err(String::from("This chunk is outside the file size."));
                }

                match file.chunks[index] {
                    Some(_chunk_id) => Err(String::from("Chunks cannot be overwritten.")),
                    None => {
                        let chunk_id = get_new_chunk_id();
                        CHUNKS_MAP.with(|p| {
                            p.borrow_mut().insert(
                                chunk_id,
                                Chunk {
                                    id: chunk_id,
                                    value: value.to_string(),
                                    hash: calculate_chunk_hash(value),
                                },
                            )
                        });

                        file.chunks[index] = Some(chunk_id);
                        FILES_MAP.with(|p| p.borrow_mut().insert(file_id, file));

                        return Ok(chunk_id);
                    }
                }
            }
        },
    }
}

/*
    SECTION 6.2: INTERNAL FUNCTIONS
*/

fn authenticate_call(subaccount: Option<Subaccount>) -> Result<Account, String> {
    let caller = ic_cdk::caller();
    // The anonymous principal is not allowed to interact with canister.
    if caller == Principal::anonymous() {
        // enable this instruction to debug without identity
        Ok((caller, subaccount))
        // Err(String::from(
        //     "Anonymous principal not allowed to make calls.",
        // ))
    } else {
        Ok((caller, subaccount))
    }
}

fn get_new_file_id() -> FileId {
    // Increment the counter and return the updated value
    LAST_FILE_ID_CELL.with(|cell| {
        let mut current_value = cell.borrow().get().clone(); // Get the current value
        current_value += 1; // Increment the value
        cell.borrow_mut().set(current_value).unwrap(); // Store the new value
        current_value // Return the updated value
    })
}

fn get_new_chunk_id() -> ChunkId {
    // Increment the counter and return the updated value
    LAST_CHUNK_ID_CELL.with(|cell| {
        let mut current_value = cell.borrow().get().clone(); // Get the current value
        current_value += 1; // Increment the value
        cell.borrow_mut().set(current_value).unwrap(); // Store the new value
        current_value // Return the updated value
    })
}

fn calculate_chunk_hash(input: String) -> String {
    // Create a new SHA-256 hasher
    let mut hasher = Sha256::new();

    // Input the string into the hasher
    hasher.update(input.as_bytes());

    // Compute the hash and convert it to a hexadecimal string
    let hash_result = hasher.finalize();
    hex::encode(hash_result) // Return the hash in hexadecimal
}

fn get_new_geoarea_id() -> GeoAreaId {
    // Increment the counter and return the updated value
    LAST_GEOAREA_ID_CELL.with(|cell| {
        let mut current_value = cell.borrow().get().clone(); // Get the current value
        current_value += 1; // Increment the value
        cell.borrow_mut().set(current_value).unwrap(); // Store the new value
        current_value // Return the updated value
    })
}

fn get_new_project_id() -> ProjectId {
    // Increment the counter and return the updated value
    LAST_PROJECT_ID_CELL.with(|cell| {
        let mut current_value = cell.borrow().get().clone(); // Get the current value
        current_value += 1; // Increment the value
        cell.borrow_mut().set(current_value).unwrap(); // Store the new value
        current_value // Return the updated value
    })
}

fn create_new_geoarea(name: String, user: Account, coords: Coords) -> GeoAreaId {
    let geoarea_id = get_new_geoarea_id();
    GEOAREAS_MAP.with(|p| {
        p.borrow_mut().insert(
            geoarea_id,
            GeoArea {
                id: geoarea_id,
                geoAreaName: name,
                user,
                myCoords: coords,
                projectsList: Vec::new(),
            },
        )
    });
    geoarea_id
}

fn add_or_replace_project_to_list(mut project_list:Vec<Project>, project: Project) -> Vec<Project> {
    project_list.retain(|x| x.id != project.id);
    project_list.push(project);
    project_list
}

fn remove_project_from_list(mut project_list:Vec<Project>, project_id: ProjectId) -> Vec<Project> {
    project_list.retain(|x| x.id != project_id);
    project_list
}

fn compare_accounts(a: Account, b: Account) -> bool {
    if a.0 == b.0 && a.1 == b.1 {
        return true;
    }
    return false;
}

fn is_inside_coordinates(coord: Coordinate, coord_limit_1: Coordinate, coord_limit_2: Coordinate) -> bool {
    if coord_limit_1 > coord_limit_2 {
        if coord <= coord_limit_1 && coord >= coord_limit_2 {
            return true;
        }
    } else if coord_limit_1 < coord_limit_2 {
        if coord >= coord_limit_1 && coord <= coord_limit_2 {
            return true;
        }
    }
    coord == coord_limit_1
}

/*
    SECTION 7: EXTRA
*/

// Enable Candid export
ic_cdk::export_candid!();