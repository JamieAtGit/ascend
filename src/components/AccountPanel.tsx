import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAscendStore } from '../store/useAscendStore';
import { useAuthStore } from '../store/useAuthStore';
import { supabase, isCloudConfigured } from '../lib/supabase';
import { applyRemoteState, resolveConflictKeepLocal, pushState, signOut } from '../lib/sync';

const ACCENT = '#8833FF';

function formatWhen(iso: string | number): string {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function Field({ label, type, value, onChange, autoComplete }: {
  label: string; type: string; value: string; onChange: (v: string) => void; autoComplete?: string;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.2em',
        color: '#484848', marginBottom: 6,
      }}>
        {label}
      </div>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '11px 14px', background: '#06060E',
          border: '1px solid #1a1a2a', borderRadius: 3,
          color: '#F0F0F0', fontSize: 14, fontFamily: 'Inter, sans-serif',
          outline: 'none', transition: 'border-color 0.15s',
        }}
        onFocus={(e) => (e.target.style.borderColor = `${ACCENT}60`)}
        onBlur={(e) => (e.target.style.borderColor = '#1a1a2a')}
      />
    </div>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async () => {
    if (!supabase || busy) return;
    setError(null);
    setNotice(null);
    if (!email.includes('@') || password.length < 6) {
      setError('Enter a valid email and a password of at least 6 characters.');
      return;
    }
    setBusy(true);
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else if (!data.session) setNotice('Account created — check your email for a confirmation link, then sign in.');
      // If email confirmation is disabled, the session starts immediately via onAuthStateChange.
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setBusy(false);
  };

  return (
    <div>
      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: 1, marginBottom: 20 }}>
        {(['signin', 'signup'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(null); setNotice(null); }}
            style={{
              flex: 1, padding: '10px 0',
              background: mode === m ? `${ACCENT}12` : 'transparent',
              border: 'none',
              borderBottom: `2px solid ${mode === m ? ACCENT : '#1a1a1a'}`,
              color: mode === m ? ACCENT : '#444',
              fontFamily: 'Orbitron, sans-serif', fontSize: 8, letterSpacing: '0.2em',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {m === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </button>
        ))}
      </div>

      <Field label="EMAIL" type="email" value={email} onChange={setEmail} autoComplete="email" />
      <Field
        label="PASSWORD" type="password" value={password} onChange={setPassword}
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
      />

      {error && (
        <div style={{
          padding: '10px 14px', marginBottom: 12,
          background: 'rgba(255,102,102,0.06)', border: '1px solid #FF666640',
          color: '#FF6666', fontSize: 11, fontFamily: 'Inter, sans-serif', lineHeight: 1.5,
        }}>
          {error}
        </div>
      )}
      {notice && (
        <div style={{
          padding: '10px 14px', marginBottom: 12,
          background: 'rgba(95,255,61,0.06)', border: '1px solid #5FFF3D40',
          color: '#5FFF3D', fontSize: 11, fontFamily: 'Inter, sans-serif', lineHeight: 1.5,
        }}>
          {notice}
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => void submit()}
        disabled={busy}
        style={{
          width: '100%', padding: '13px',
          background: `${ACCENT}12`, border: `1px solid ${ACCENT}60`,
          color: ACCENT, fontFamily: 'Orbitron, sans-serif',
          fontSize: 9, fontWeight: 700, letterSpacing: '0.25em',
          cursor: busy ? 'wait' : 'pointer',
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? 'WORKING…' : mode === 'signin' ? '▶ SIGN IN' : '▶ CREATE ACCOUNT'}
      </motion.button>

      <p style={{ fontSize: 10, color: '#3a3a3a', lineHeight: 1.7, marginTop: 16, fontFamily: 'Inter, sans-serif' }}>
        An account syncs your XP, lessons, streaks, and sprints to the cloud so progress
        follows you across devices. The app works fully without one — this is optional.
      </p>
    </div>
  );
}

function ConflictPrompt() {
  const conflict = useAuthStore((s) => s.conflict);
  const xp = useAscendStore((s) => s.xp);
  if (!conflict) return null;

  const remoteXP = (() => {
    const st = conflict.remoteState as { state?: { xp?: number } };
    return st.state?.xp ?? 0;
  })();

  return (
    <div style={{
      padding: '16px', marginBottom: 20,
      background: 'rgba(255,163,51,0.06)', border: '1px solid #FFA33350',
    }}>
      <div style={{
        fontFamily: 'Orbitron, sans-serif', fontSize: 8, letterSpacing: '0.2em',
        color: '#FFA333', marginBottom: 10,
      }}>
        ⚠ SYNC CONFLICT — CHOOSE A SAVE
      </div>
      <p style={{ fontSize: 11, color: '#999', lineHeight: 1.7, margin: '0 0 14px', fontFamily: 'Inter, sans-serif' }}>
        This device and the cloud both have progress and they differ.
        Cloud save: <span style={{ color: '#F0F0F0' }}>{remoteXP} XP</span>, updated {formatWhen(conflict.remoteUpdatedAt)}.
        This device: <span style={{ color: '#F0F0F0' }}>{xp} XP</span>. The one you don't pick is overwritten.
      </p>
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={() => applyRemoteState(conflict.remoteState)}
          style={{
            flex: 1, padding: '10px 0',
            background: 'rgba(51,243,255,0.08)', border: '1px solid #33F3FF50',
            color: '#33F3FF', fontFamily: 'Orbitron, sans-serif',
            fontSize: 8, letterSpacing: '0.15em', cursor: 'pointer',
          }}
        >
          USE CLOUD SAVE
        </button>
        <button
          onClick={() => void resolveConflictKeepLocal()}
          style={{
            flex: 1, padding: '10px 0',
            background: 'rgba(95,255,61,0.08)', border: '1px solid #5FFF3D50',
            color: '#5FFF3D', fontFamily: 'Orbitron, sans-serif',
            fontSize: 8, letterSpacing: '0.15em', cursor: 'pointer',
          }}
        >
          KEEP THIS DEVICE
        </button>
      </div>
    </div>
  );
}

function SignedIn() {
  const user = useAuthStore((s) => s.user)!;
  const syncStatus = useAuthStore((s) => s.syncStatus);
  const syncError = useAuthStore((s) => s.syncError);
  const lastSyncedAt = useAuthStore((s) => s.lastSyncedAt);
  const xp = useAscendStore((s) => s.xp);
  const level = useAscendStore((s) => s.level);

  const statusColor =
    syncStatus === 'synced' ? '#5FFF3D'
    : syncStatus === 'syncing' ? '#FFA333'
    : syncStatus === 'error' ? '#FF6666'
    : '#555';

  return (
    <div>
      <ConflictPrompt />

      {/* Identity */}
      <div style={{
        padding: '16px', marginBottom: 16,
        background: '#06060E', border: '1px solid #0e0e1a',
      }}>
        <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.2em', color: '#484848', marginBottom: 8 }}>
          SIGNED IN AS
        </div>
        <div style={{ color: '#F0F0F0', fontSize: 14, fontFamily: 'Inter, sans-serif', marginBottom: 12 }}>
          {user.email}
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 9, color: ACCENT }}>LVL {level}</span>
          <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 9, color: '#5FFF3D' }}>{xp.toLocaleString()} XP</span>
        </div>
      </div>

      {/* Sync status */}
      <div style={{
        padding: '16px', marginBottom: 20,
        background: '#06060E', border: '1px solid #0e0e1a',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.2em', color: '#484848', marginBottom: 6 }}>
            CLOUD SYNC
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: statusColor, boxShadow: `0 0 6px ${statusColor}`,
            }} />
            <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 9, letterSpacing: '0.1em', color: statusColor }}>
              {syncStatus.toUpperCase()}
            </span>
            {lastSyncedAt && syncStatus === 'synced' && (
              <span style={{ fontSize: 10, color: '#3a3a3a', fontFamily: 'Inter, sans-serif' }}>
                {formatWhen(lastSyncedAt)}
              </span>
            )}
          </div>
          {syncError && (
            <div style={{ fontSize: 10, color: '#FF6666', marginTop: 6, fontFamily: 'Inter, sans-serif' }}>
              {syncError}
            </div>
          )}
        </div>
        <button
          onClick={() => void pushState()}
          style={{
            padding: '8px 14px', background: 'transparent',
            border: `1px solid ${ACCENT}40`, color: ACCENT,
            fontFamily: 'Orbitron, sans-serif', fontSize: 8, letterSpacing: '0.15em',
            cursor: 'pointer', borderRadius: 2,
          }}
        >
          SYNC NOW
        </button>
      </div>

      <p style={{ fontSize: 10, color: '#3a3a3a', lineHeight: 1.7, marginBottom: 20, fontFamily: 'Inter, sans-serif' }}>
        Progress saves to the cloud automatically a few seconds after every change.
        Sign in on any device to continue where you left off.
      </p>

      <button
        onClick={() => void signOut()}
        style={{
          width: '100%', padding: '10px 0',
          background: 'transparent', border: '1px solid #2a1010',
          color: '#4a1a1a', fontFamily: 'Orbitron, sans-serif',
          fontSize: 8, letterSpacing: '0.2em', cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#FF666640';
          e.currentTarget.style.color = '#FF6666';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#2a1010';
          e.currentTarget.style.color = '#4a1a1a';
        }}
      >
        SIGN OUT
      </button>
    </div>
  );
}

function NotConfigured() {
  return (
    <div style={{
      padding: '16px', background: '#06060E', border: '1px solid #0e0e1a',
    }}>
      <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 8, letterSpacing: '0.2em', color: '#FFA333', marginBottom: 10 }}>
        CLOUD SYNC NOT CONFIGURED
      </div>
      <p style={{ fontSize: 11, color: '#777', lineHeight: 1.8, margin: 0, fontFamily: 'Inter, sans-serif' }}>
        Accounts need a (free) Supabase project. Setup takes ~10 minutes:
        <br /><br />
        1. Create a project at supabase.com<br />
        2. Run <span style={{ color: '#33F3FF' }}>supabase/schema.sql</span> in its SQL editor<br />
        3. Copy the project URL and anon key into <span style={{ color: '#33F3FF' }}>.env.local</span>{' '}
        (see <span style={{ color: '#33F3FF' }}>.env.example</span>)<br />
        4. Restart the dev server
        <br /><br />
        Until then the app runs fully local — use Dashboard → DATA BACKUP to move progress between devices manually.
      </p>
    </div>
  );
}

export default function AccountPanel() {
  const overlay = useAscendStore((s) => s.overlay);
  const setOverlay = useAscendStore((s) => s.setOverlay);
  const user = useAuthStore((s) => s.user);

  if (overlay !== 'account') return null;

  return (
    <AnimatePresence>
      <motion.div
        key="account-bg"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 150,
          background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 10,
        }}
        onClick={(e) => { if (e.target === e.currentTarget) setOverlay(null); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: '100%', maxWidth: 420, maxHeight: '88vh',
            background: 'rgba(3,3,7,0.99)', border: '1px solid #1a1a1a',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 0 80px rgba(0,0,0,0.95)',
          }}
        >
          <div style={{ height: 1.5, background: `linear-gradient(90deg, transparent, ${ACCENT} 40%, #33F3FF 60%, transparent)`, flexShrink: 0 }} />

          {/* Header */}
          <div style={{
            padding: '20px 24px 16px', borderBottom: '1px solid #111', flexShrink: 0,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.35em', color: ACCENT, marginBottom: 6 }}>
                ASCEND // IDENTITY
              </div>
              <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 16, fontWeight: 900, color: '#F0F0F0', margin: 0, letterSpacing: '0.06em' }}>
                ACCOUNT
              </h2>
            </div>
            <button
              onClick={() => setOverlay(null)}
              style={{ color: '#333', fontSize: 16, fontFamily: 'Orbitron, sans-serif', padding: 4, transition: 'color 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F0F0F0')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#333')}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div style={{
            flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px',
            WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', overscrollBehavior: 'contain',
          }}>
            {!isCloudConfigured ? <NotConfigured /> : user ? <SignedIn /> : <AuthForm />}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
