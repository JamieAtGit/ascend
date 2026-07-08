import { create } from 'zustand';

// Auth/sync UI state. NOT persisted — Supabase manages its own session storage.
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

export interface AuthUser {
  id: string;
  email: string;
}

// When both the device and the cloud have real progress, the user chooses.
export interface SyncConflict {
  remoteUpdatedAt: string; // ISO timestamp of the cloud save
  remoteState: Record<string, unknown>;
}

interface AuthState {
  user: AuthUser | null;
  syncStatus: SyncStatus;
  lastSyncedAt: number | null;
  syncError: string | null;
  conflict: SyncConflict | null;

  setUser: (u: AuthUser | null) => void;
  setSyncStatus: (s: SyncStatus, error?: string | null) => void;
  setLastSyncedAt: (t: number | null) => void;
  setConflict: (c: SyncConflict | null) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  syncStatus: 'idle',
  lastSyncedAt: null,
  syncError: null,
  conflict: null,

  setUser: (u) => set({ user: u }),
  setSyncStatus: (s, error = null) => set({ syncStatus: s, syncError: error }),
  setLastSyncedAt: (t) => set({ lastSyncedAt: t }),
  setConflict: (c) => set({ conflict: c }),
}));
