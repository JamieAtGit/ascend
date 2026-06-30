import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAscendStore } from '../store/useAscendStore';

const QUICK_ACTIONS = [
  { label: 'GYM_SESSION', xp: 20, category: 'PHYSICAL' },
  { label: 'STUDY_BLOCK', xp: 15, category: 'INTELLECTUAL' },
  { label: 'DEEP_WORK', xp: 12, category: 'MENTAL' },
  { label: 'COLD_EXPOSURE', xp: 10, category: 'PHYSICAL' },
  { label: 'READING', xp: 8, category: 'INTELLECTUAL' },
  { label: 'JOURNAL', xp: 5, category: 'MENTAL' },
];

const CAT_COLOR: Record<string, string> = {
  PHYSICAL: '#FF4444',
  MENTAL: '#8833FF',
  INTELLECTUAL: '#00F0FF',
  FINANCIAL: '#5FFF3D',
};

interface FloatXP { id: number; xp: number }
let fId = 0;

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState({ label: '', xp: '' });
  const [floats, setFloats] = useState<FloatXP[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);
  const addXP = useAscendStore((s) => s.addXP);
  const resetAll = useAscendStore((s) => s.resetAll);
  const recentActions = useAscendStore((s) => s.xpHistory);
  const unlockedNodes = useAscendStore((s) => s.unlockedNodes);
  const masteredNodes = useAscendStore((s) => s.masteredNodes);
  const xp = useAscendStore((s) => s.xp);

  const fire = (label: string, amount: number) => {
    addXP(amount, label);
    const id = fId++;
    setFloats((p) => [...p, { id, xp: amount }]);
    setTimeout(() => setFloats((p) => p.filter((f) => f.id !== id)), 1600);
  };

  return (
    <>
      {/* Floating XP burst */}
      <div style={{ position: 'fixed', bottom: 96, left: 56, zIndex: 100, pointerEvents: 'none' }}>
        <AnimatePresence>
          {floats.map((f) => (
            <motion.div key={f.id}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -52 }}
              exit={{ opacity: 0, y: -80, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute',
                fontFamily: 'Orbitron, sans-serif',
                fontSize: 15, fontWeight: 900,
                color: '#5FFF3D',
                textShadow: '0 0 16px rgba(95,255,61,0.9), 0 0 40px rgba(95,255,61,0.4)',
                letterSpacing: '0.08em',
                whiteSpace: 'nowrap',
              }}
            >
              +{f.xp} XP
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Toggle tab — left edge */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', bottom: 32, left: 32, zIndex: 45,
          width: 44, height: 44,
          border: `1px solid ${open ? 'rgba(136,51,255,0.7)' : 'rgba(136,51,255,0.3)'}`,
          background: open ? 'rgba(136,51,255,0.12)' : 'rgba(4,4,8,0.94)',
          color: '#8833FF',
          fontFamily: 'Orbitron, sans-serif',
          fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(12px)',
          transition: 'all 0.2s',
          boxShadow: open ? '0 0 24px rgba(136,51,255,0.28)' : 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(136,51,255,0.7)';
          e.currentTarget.style.boxShadow = '0 0 24px rgba(136,51,255,0.28)';
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.borderColor = 'rgba(136,51,255,0.3)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        {open ? '✕' : '◈'}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="dash"
            initial={{ opacity: 0, x: -16, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -16, filter: 'blur(4px)' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              bottom: 88, left: 32,
              width: 300,
              maxHeight: '62vh',
              zIndex: 44,
              background: 'rgba(3,3,6,0.98)',
              backdropFilter: 'blur(24px)',
              overflow: 'hidden',
              boxShadow: '0 0 80px rgba(0,0,0,0.9), 0 0 40px rgba(136,51,255,0.08)',
            }}
          >
            {/* Top accent */}
            <div style={{ height: 1, background: 'linear-gradient(90deg, #8833FF, #00F0FF, #8833FF)' }} />

            {/* Side accent line */}
            <div style={{
              position: 'absolute', top: 1, left: 0, bottom: 1, width: 1,
              background: 'linear-gradient(180deg, #8833FF, transparent 40%, transparent 60%, #8833FF)',
              opacity: 0.4,
            }} />

            <div style={{ padding: '18px 20px 20px 22px', overflowY: 'auto', maxHeight: 'calc(62vh - 2px)' }}>
              {/* Header */}
              <div style={{ marginBottom: 18 }}>
                <div style={{
                  fontFamily: 'Orbitron, sans-serif', fontSize: 8,
                  letterSpacing: '0.35em', color: '#8833FF', marginBottom: 3,
                }}>
                  ASCEND // COMMAND INTERFACE
                </div>
                <div style={{
                  fontFamily: 'Orbitron, sans-serif', fontSize: 7,
                  letterSpacing: '0.2em', color: '#252525',
                }}>
                  TOTAL_XP: {xp} · NODES: {unlockedNodes.length + masteredNodes.length} / 23
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, marginBottom: 18 }}>
                <StatCell label="UNLOCKED" value={unlockedNodes.length} />
                <StatCell label="MASTERED" value={masteredNodes.length} />
              </div>

              {/* Section: log action */}
              <SectionLabel text="> LOG_ACTION" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 16 }}>
                {QUICK_ACTIONS.map((a) => (
                  <motion.button
                    key={a.label}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fire(a.label, a.xp)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 10px',
                      background: 'rgba(10,10,14,0.8)',
                      border: '1px solid #151515',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      const c = CAT_COLOR[a.category];
                      e.currentTarget.style.borderColor = `${c}35`;
                      e.currentTarget.style.background = `${c}07`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#151515';
                      e.currentTarget.style.background = 'rgba(10,10,14,0.8)';
                    }}
                  >
                    <span style={{
                      fontSize: 8, letterSpacing: '0.18em',
                      color: '#8C8C8C', fontFamily: 'Orbitron, sans-serif',
                    }}>
                      {a.label}
                    </span>
                    <span style={{
                      fontSize: 9, fontFamily: 'Orbitron, sans-serif', fontWeight: 700,
                      color: CAT_COLOR[a.category],
                      textShadow: `0 0 8px ${CAT_COLOR[a.category]}60`,
                    }}>
                      +{a.xp}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Custom input */}
              <SectionLabel text="> CUSTOM_INPUT" />
              <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
                <input
                  placeholder="action_name"
                  value={custom.label}
                  onChange={(e) => setCustom({ ...custom, label: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && custom.label && Number(custom.xp) > 0) {
                      fire(custom.label, Number(custom.xp));
                      setCustom({ label: '', xp: '' });
                    }
                  }}
                  style={{
                    flex: 1, background: '#060608',
                    border: '1px solid #1c1c1c',
                    color: '#F0F0F0', padding: '7px 10px',
                    fontSize: 10, fontFamily: 'Inter, monospace',
                    outline: 'none', transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#8833FF50'}
                  onBlur={(e) => e.target.style.borderColor = '#1c1c1c'}
                />
                <input
                  type="number"
                  placeholder="XP"
                  value={custom.xp}
                  onChange={(e) => setCustom({ ...custom, xp: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && custom.label && Number(custom.xp) > 0) {
                      fire(custom.label, Number(custom.xp));
                      setCustom({ label: '', xp: '' });
                    }
                  }}
                  style={{
                    width: 58, background: '#060608',
                    border: '1px solid #1c1c1c',
                    color: '#F0F0F0', padding: '7px 8px',
                    fontSize: 10, fontFamily: 'Inter, monospace',
                    outline: 'none', transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#8833FF50'}
                  onBlur={(e) => e.target.style.borderColor = '#1c1c1c'}
                />
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (custom.label && Number(custom.xp) > 0) {
                      fire(custom.label, Number(custom.xp));
                      setCustom({ label: '', xp: '' });
                    }
                  }}
                  style={{
                    padding: '7px 12px',
                    background: 'rgba(136,51,255,0.08)',
                    border: '1px solid rgba(136,51,255,0.35)',
                    color: '#8833FF',
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: 11, fontWeight: 700,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(136,51,255,0.18)';
                    e.currentTarget.style.boxShadow = '0 0 14px rgba(136,51,255,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(136,51,255,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  ▶
                </motion.button>
              </div>

              {/* Recent feed */}
              {recentActions.length > 0 && (
                <>
                  <SectionLabel text="> ACTIVITY_LOG" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {recentActions.slice(0, 6).map((a, i) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '5px 0',
                        borderBottom: '1px solid #0c0c0c',
                      }}>
                        <span style={{ fontSize: 9, color: '#575757', fontFamily: 'Inter, monospace' }}>
                          {a.label}
                        </span>
                        <span style={{
                          fontSize: 9, color: '#5FFF3D',
                          fontFamily: 'Orbitron, sans-serif', fontWeight: 700,
                          textShadow: '0 0 8px rgba(95,255,61,0.5)',
                        }}>
                          +{a.xp}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {/* Reset */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #111' }}>
                <SectionLabel text="> DANGER_ZONE" />
                <AnimatePresence mode="wait">
                  {!confirmReset ? (
                    <motion.button
                      key="reset-idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => setConfirmReset(true)}
                      style={{
                        width: '100%', padding: '8px 0',
                        background: 'transparent',
                        border: '1px solid #2a1010',
                        color: '#4a1a1a',
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: 8, letterSpacing: '0.2em',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,102,102,0.4)';
                        e.currentTarget.style.color = '#FF4444';
                        e.currentTarget.style.background = 'rgba(255,102,102,0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#2a1010';
                        e.currentTarget.style.color = '#4a1a1a';
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      RESET ALL DATA
                    </motion.button>
                  ) : (
                    <motion.div
                      key="reset-confirm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div style={{
                        fontFamily: 'Orbitron, sans-serif', fontSize: 8,
                        letterSpacing: '0.15em', color: '#FF4444',
                        textAlign: 'center', marginBottom: 8,
                        textShadow: '0 0 12px rgba(255,102,102,0.5)',
                      }}>
                        ⚠ THIS CANNOT BE UNDONE
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => {
                            resetAll();
                            setConfirmReset(false);
                            setOpen(false);
                          }}
                          style={{
                            flex: 1, padding: '8px 0',
                            background: 'rgba(255,102,102,0.12)',
                            border: '1px solid rgba(255,102,102,0.5)',
                            color: '#FF4444',
                            fontFamily: 'Orbitron, sans-serif',
                            fontSize: 8, letterSpacing: '0.15em',
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,102,102,0.22)';
                            e.currentTarget.style.boxShadow = '0 0 14px rgba(255,102,102,0.25)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,102,102,0.12)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          CONFIRM
                        </button>
                        <button
                          onClick={() => setConfirmReset(false)}
                          style={{
                            flex: 1, padding: '8px 0',
                            background: 'transparent',
                            border: '1px solid #222',
                            color: '#555',
                            fontFamily: 'Orbitron, sans-serif',
                            fontSize: 8, letterSpacing: '0.15em',
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#444';
                            e.currentTarget.style.color = '#888';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#222';
                            e.currentTarget.style.color = '#555';
                          }}
                        >
                          CANCEL
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom accent */}
            <div style={{ height: 1, background: 'linear-gradient(90deg, #8833FF, transparent)' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      fontFamily: 'Orbitron, sans-serif', fontSize: 7,
      letterSpacing: '0.2em', color: '#484848',
      marginBottom: 8,
    }}>
      {text}
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      padding: '10px 12px',
      background: '#080808',
      border: '1px solid #111',
    }}>
      <div style={{
        fontFamily: 'Orbitron, sans-serif', fontSize: 22,
        fontWeight: 900, color: '#F0F0F0', lineHeight: 1,
      }}>
        {String(value).padStart(2, '0')}
      </div>
      <div style={{
        fontFamily: 'Orbitron, sans-serif', fontSize: 6,
        letterSpacing: '0.2em', color: '#484848', marginTop: 4,
      }}>
        {label}
      </div>
    </div>
  );
}
