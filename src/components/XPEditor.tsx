import { motion, AnimatePresence } from 'framer-motion';
import { useAscendStore } from '../store/useAscendStore';

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export default function XPEditor() {
  const overlay = useAscendStore((s) => s.overlay);
  const setOverlay = useAscendStore((s) => s.setOverlay);
  const xpHistory = useAscendStore((s) => s.xpHistory);
  const removeXPEntry = useAscendStore((s) => s.removeXPEntry);
  const xp = useAscendStore((s) => s.xp);

  if (overlay !== 'xpledger') return null;

  return (
    <AnimatePresence>
      <motion.div
        key="xped-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 150,
          background: 'rgba(0,0,0,0.88)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 10,
        }}
        onClick={(e) => { if (e.target === e.currentTarget) setOverlay(null); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: '100%', maxWidth: 500,
            maxHeight: '88vh',
            background: 'rgba(3,3,7,0.99)',
            border: '1px solid #1a1a1a',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 0 80px rgba(0,0,0,0.95)',
          }}
        >
          <div style={{ height: 1.5, background: 'linear-gradient(90deg, transparent, #5FFF3D 40%, #5FFF3D 60%, transparent)', flexShrink: 0 }} />

          <div style={{
            padding: '20px 24px 16px', borderBottom: '1px solid #111',
            flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.35em', color: '#5FFF3D', marginBottom: 6 }}>
                ASCEND // XP_LEDGER
              </div>
              <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 16, fontWeight: 900, color: '#F0F0F0', margin: 0, letterSpacing: '0.06em' }}>
                XP HISTORY
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontFamily: 'Orbitron, sans-serif', fontSize: 20, fontWeight: 900,
                color: '#5FFF3D', textShadow: '0 0 12px rgba(95,255,61,0.5)',
              }}>
                {xp.toLocaleString()}
              </div>
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.2em', color: '#2a2a2a', marginTop: 2 }}>
                TOTAL_XP
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
            {xpHistory.length === 0 ? (
              <div style={{
                padding: '40px 0', textAlign: 'center',
                fontFamily: 'Orbitron, sans-serif', fontSize: 8,
                letterSpacing: '0.3em', color: '#222',
              }}>
                NO_XP_ENTRIES
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {xpHistory.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 0',
                      borderBottom: '1px solid #0d0d0d',
                    }}
                  >
                    <div style={{
                      fontFamily: 'Orbitron, sans-serif', fontSize: 8,
                      color: '#2a2a2a', width: 24, flexShrink: 0, textAlign: 'right',
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 10, color: '#666',
                        fontFamily: 'Inter, monospace',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {entry.label}
                      </div>
                      <div style={{
                        fontSize: 8, color: '#2a2a2a',
                        fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.1em', marginTop: 2,
                      }}>
                        {formatDate(entry.timestamp)}
                      </div>
                    </div>
                    <div style={{
                      fontFamily: 'Orbitron, sans-serif', fontSize: 11, fontWeight: 700,
                      color: '#5FFF3D', textShadow: '0 0 8px rgba(95,255,61,0.4)',
                      flexShrink: 0,
                    }}>
                      +{entry.xp}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeXPEntry(entry.id)}
                      title="Remove this XP entry"
                      style={{
                        width: 24, height: 24,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'transparent',
                        border: '1px solid #1a1a1a',
                        color: '#2a2a2a', fontSize: 10,
                        cursor: 'pointer', flexShrink: 0,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#FF6666';
                        e.currentTarget.style.borderColor = '#FF666630';
                        e.currentTarget.style.background = 'rgba(255,102,102,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#2a2a2a';
                        e.currentTarget.style.borderColor = '#1a1a1a';
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      ✕
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div style={{
            padding: '14px 24px', borderTop: '1px solid #111',
            flexShrink: 0,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{
              fontFamily: 'Orbitron, sans-serif', fontSize: 7,
              letterSpacing: '0.2em', color: '#222',
            }}>
              {xpHistory.length} ENTRIES · CLICK ✕ TO REMOVE
            </div>
            <button
              onClick={() => setOverlay(null)}
              style={{
                padding: '8px 16px',
                background: '#0a0a10', border: '1px solid #1e1e1e',
                color: '#444', fontFamily: 'Orbitron, sans-serif',
                fontSize: 8, letterSpacing: '0.2em', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#F0F0F0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#444'; }}
            >
              CLOSE
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
