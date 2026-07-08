import { supabase } from './supabase';
import { useAscendStore } from '../store/useAscendStore';
import { useAuthStore } from '../store/useAuthStore';

// Cloud sync = save-file model. The zustand-persist blob in localStorage
// ('ascend-v2', shape {state, version}) is pushed to one user_state row per
// user and pulled on login. Same format as the Dashboard export/import file.

const STORAGE_KEY = 'ascend-v2';
const PUSH_DEBOUNCE_MS = 3000;

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let lastPushedRaw: string | null = null;
let unsubscribeStore: (() => void) | null = null;
let initialized = false;

function readLocalRaw(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

// A device with no meaningful progress can safely adopt the cloud save.
function localIsVirgin(): boolean {
  const s = useAscendStore.getState();
  return s.xp === 0 && s.completedLessons.length === 0 && s.timeEntries.length === 0;
}

export async function pushState(): Promise<void> {
  if (!supabase) return;
  const auth = useAuthStore.getState();
  if (!auth.user) return;

  const raw = readLocalRaw();
  if (!raw || raw === lastPushedRaw) return;

  auth.setSyncStatus('syncing');
  const { error } = await supabase.from('user_state').upsert({
    user_id: auth.user.id,
    state: JSON.parse(raw),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    useAuthStore.getState().setSyncStatus('error', error.message);
  } else {
    lastPushedRaw = raw;
    const now = Date.now();
    useAuthStore.getState().setSyncStatus('synced');
    useAuthStore.getState().setLastSyncedAt(now);
  }
}

function schedulePush(): void {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => { void pushState(); }, PUSH_DEBOUNCE_MS);
}

// Replace local progress with a cloud save (zustand-persist blob shape).
export function applyRemoteState(remote: Record<string, unknown>): void {
  const state = (remote as { state?: Record<string, unknown> }).state;
  if (!state || typeof state !== 'object') return;
  // setState merges into the store; persist middleware writes localStorage.
  useAscendStore.setState(state as never);
  lastPushedRaw = readLocalRaw();
  useAuthStore.getState().setConflict(null);
  useAuthStore.getState().setSyncStatus('synced');
  useAuthStore.getState().setLastSyncedAt(Date.now());
}

// Keep the device version: overwrite the cloud with local state.
export async function resolveConflictKeepLocal(): Promise<void> {
  useAuthStore.getState().setConflict(null);
  lastPushedRaw = null; // force push even if strings match
  await pushState();
}

async function onSignedIn(userId: string): Promise<void> {
  if (!supabase) return;
  const auth = useAuthStore.getState();
  auth.setSyncStatus('syncing');

  const { data, error } = await supabase
    .from('user_state')
    .select('state, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    auth.setSyncStatus('error', error.message);
    return;
  }

  if (!data) {
    // First login from any device: seed the cloud with local state.
    lastPushedRaw = null;
    await pushState();
  } else if (localIsVirgin()) {
    // Fresh device: adopt the cloud save silently.
    applyRemoteState(data.state as Record<string, unknown>);
  } else {
    const localRaw = readLocalRaw();
    const remoteRaw = JSON.stringify(data.state);
    if (localRaw === remoteRaw) {
      lastPushedRaw = localRaw;
      auth.setSyncStatus('synced');
      auth.setLastSyncedAt(Date.now());
    } else {
      // Both sides have progress and they differ — the user decides.
      auth.setConflict({
        remoteUpdatedAt: data.updated_at as string,
        remoteState: data.state as Record<string, unknown>,
      });
      auth.setSyncStatus('idle');
    }
  }

  // Auto-push on future changes. The persist blob only changes for
  // persisted fields, and the string comparison in pushState skips no-ops.
  if (!unsubscribeStore) {
    unsubscribeStore = useAscendStore.subscribe(() => schedulePush());
  }
}

function onSignedOut(): void {
  if (unsubscribeStore) { unsubscribeStore(); unsubscribeStore = null; }
  if (pushTimer) { clearTimeout(pushTimer); pushTimer = null; }
  lastPushedRaw = null;
  const auth = useAuthStore.getState();
  auth.setUser(null);
  auth.setConflict(null);
  auth.setSyncStatus('idle');
  auth.setLastSyncedAt(null);
}

// Called once from App. Restores an existing session and wires auth events.
export function initSync(): void {
  if (initialized || !supabase) return;
  initialized = true;

  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      useAuthStore.getState().setUser({
        id: session.user.id,
        email: session.user.email ?? '',
      });
      void onSignedIn(session.user.id);
    } else {
      onSignedOut();
    }
  });
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  // Push any pending changes before leaving.
  await pushState();
  await supabase.auth.signOut();
}
