export type SyncState = 'idle' | 'in_progress' | 'error';

export interface SyncStatus {
    state: SyncState;
} 