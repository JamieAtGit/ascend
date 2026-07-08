import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAscendStore } from '../store/useAscendStore';
import type { TimeCategory } from '../store/useAscendStore';

const CATEGORIES: TimeCategory[] = ['Learning', 'Fitness', 'Music', 'Productivity', 'Other'];

const CAT_COLOR: Record<TimeCategory, string> = {
  Learning: '#33F3FF',
  Fitness: '#FF6666',
  Music: '#FF5592',
  Productivity: '#5FFF3D',
  Other: '#8833FF',
};

const XP_RATES: Record<TimeCategory, number> = {
  Learning: 4, Music: 4, Fitness: 3, Productivity: 2, Other: 1,
};

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${(m % 60).toString().padStart(2, '0')}m ${(s % 60).toString().padStart(2, '0')}s`;
  return `${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

export default function TimeTracker() {
  const overlay = useAscendStore((s) => s.overlay);
  const setOverlay = useAscendStore((s) => s.setOverlay);
  const activeTimer = useAscendStore((s) => s.activeTimer);
  const timeEntries = useAscendStore((s) => s.timeEntries);
  const startTimer = useAscendStore((s) => s.startTimer);
  const stopTimer = useAscendStore((s) => s.stopTimer);
  const addManualTime = useAscendStore((s) => s.addManualTime);

  const [elapsed, setElapsed] = useState(0);
  const [timerCat, setTimerCat] = useState<TimeCategory>('Learning');
  const [timerLabel, setTimerLabel] = useState('');

  const [manualCat, setManualCat] = useState<TimeCategory>('Learning');
  const [manualMins, setManualMins] = useState('');
  const [manualLabel, setManualLabel] = useState('');

  useEffect(() => {
    if (!activeTimer) { setElapsed(0); return; }
    const tick = () => setElapsed(Date.now() - activeTimer.startedAt);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeTimer]);

  const isOpen = overlay === 'time';
  if (!isOpen) return null;

  const previewXP = activeTimer
    ? Math.max(1, Math.floor((elapsed / 60000) * XP_RATES[activeTimer.category] / 4))
    : 0;

  const handleStart = () => {
    startTimer(timerCat, timerLabel || timerCat);
  };

  const handleManualAdd = () => {
    const mins = parseInt(manualMins, 10);
    if (!mins || mins <= 0) return;
    addManualTime(manualCat, mins, manualLabel || manualCat);
    setManualMins('');
    setManualLabel('');
  };

  return (
    <AnimatePresence>
      <motion.div
        key="time-bg"
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
            width: '100%', maxWidth: 520,
            maxHeight: '88vh',
            background: 'rgba(3,3,7,0.99)',
            border: '1px solid #1a1a1a',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 0 80px rgba(0,0,0,0.95)',
          }}
        >
          {/* Header accent */}
          <div style={{ height: 1.5, background: 'linear-gradient(90deg, transparent, #FF5592 40%, #FF5592 60%, transparent)', flexShrink: 0 }} />

          <div style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid #111',
            flexShrink: 0,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.35em', color: '#FF5592', marginBottom: 6 }}>
                ASCEND // TIME_TRACKER
              </div>
              <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 16, fontWeight: 900, color: '#F0F0F0', margin: 0, letterSpacing: '0.06em' }}>
                LOG TIME
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

          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

            {/* LIVE TIMER */}
            <SectionLabel text="> LIVE_TIMER" />
            <div style={{
              padding: '20px',
              background: '#080810',
              border: '1px solid #131320',
              marginBottom: 20,
            }}>
              {activeTimer ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <div style={{
                      fontFamily: 'Orbitron, sans-serif', fontSize: 38, fontWeight: 900,
                      color: CAT_COLOR[activeTimer.category],
                      textShadow: `0 0 20px ${CAT_COLOR[activeTimer.category]}60`,
                      letterSpacing: '0.05em',
                    }}>
                      {formatElapsed(elapsed)}
                    </div>
                    <div style={{
                      fontFamily: 'Orbitron, sans-serif', fontSize: 8, letterSpacing: '0.3em',
                      color: CAT_COLOR[activeTimer.category], marginTop: 8, opacity: 0.7,
                    }}>
                      {activeTimer.category.toUpperCase()} · {activeTimer.label}
                    </div>
                    <div style={{
                      fontFamily: 'Orbitron, sans-serif', fontSize: 9, letterSpacing: '0.2em',
                      color: '#5FFF3D', marginTop: 6,
                    }}>
                      ~{previewXP} XP earned
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={stopTimer}
                    style={{
                      width: '100%', padding: '12px',
                      background: 'rgba(255,102,102,0.1)',
                      border: '1px solid rgba(255,102,102,0.5)',
                      color: '#FF6666', fontFamily: 'Orbitron, sans-serif',
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.22em',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    ■ STOP & LOG
                  </motion.button>
                </>
              ) : (
                <>
                  <CategorySelector value={timerCat} onChange={setTimerCat} />
                  <input
                    placeholder="session label (optional)"
                    value={timerLabel}
                    onChange={(e) => setTimerLabel(e.target.value)}
                    style={{
                      width: '100%', background: '#060608',
                      border: '1px solid #1c1c1c', color: '#F0F0F0',
                      padding: '8px 12px', fontSize: 11,
                      fontFamily: 'Inter, monospace', outline: 'none',
                      marginTop: 10, marginBottom: 12,
                      transition: 'border-color 0.15s', boxSizing: 'border-box',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#FF559250')}
                    onBlur={(e) => (e.target.style.borderColor = '#1c1c1c')}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStart}
                    style={{
                      width: '100%', padding: '12px',
                      background: 'rgba(255,85,146,0.1)',
                      border: '1px solid rgba(255,85,146,0.5)',
                      color: '#FF5592', fontFamily: 'Orbitron, sans-serif',
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.22em',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    ▶ START TIMER
                  </motion.button>
                </>
              )}
            </div>

            {/* MANUAL ENTRY */}
            <SectionLabel text="> MANUAL_ENTRY" />
            <div style={{
              padding: '16px 18px',
              background: '#080810',
              border: '1px solid #131320',
              marginBottom: 20,
            }}>
              <CategorySelector value={manualCat} onChange={setManualCat} />
              <div style={{ display: 'flex', gap: 6, marginTop: 10, marginBottom: 10 }}>
                <input
                  placeholder="label"
                  value={manualLabel}
                  onChange={(e) => setManualLabel(e.target.value)}
                  style={{
                    flex: 1, background: '#060608',
                    border: '1px solid #1c1c1c', color: '#F0F0F0',
                    padding: '8px 10px', fontSize: 11,
                    fontFamily: 'Inter, monospace', outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#FF559250')}
                  onBlur={(e) => (e.target.style.borderColor = '#1c1c1c')}
                />
                <input
                  type="number"
                  placeholder="mins"
                  value={manualMins}
                  onChange={(e) => setManualMins(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
                  style={{
                    width: 64, background: '#060608',
                    border: '1px solid #1c1c1c', color: '#F0F0F0',
                    padding: '8px 10px', fontSize: 11,
                    fontFamily: 'Inter, monospace', outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#FF559250')}
                  onBlur={(e) => (e.target.style.borderColor = '#1c1c1c')}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleManualAdd}
                  style={{
                    padding: '8px 14px',
                    background: 'rgba(255,85,146,0.08)',
                    border: '1px solid rgba(255,85,146,0.35)',
                    color: '#FF5592', fontFamily: 'Orbitron, sans-serif',
                    fontSize: 11, cursor: 'pointer',
                  }}
                >
                  +
                </motion.button>
              </div>
              {manualMins && parseInt(manualMins) > 0 && (
                <div style={{
                  fontSize: 9, fontFamily: 'Orbitron, sans-serif',
                  color: '#5FFF3D', opacity: 0.7, letterSpacing: '0.2em',
                }}>
                  ≈ {Math.max(1, Math.floor(parseInt(manualMins) * XP_RATES[manualCat] / 4))} XP
                </div>
              )}
            </div>

            {/* RECENT SESSIONS */}
            {timeEntries.length > 0 && (
              <>
                <SectionLabel text="> RECENT_SESSIONS" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {timeEntries.slice(0, 8).map((e) => (
                    <div key={e.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 0', borderBottom: '1px solid #0d0d0d',
                    }}>
                      <div style={{
                        width: 3, height: 28, flexShrink: 0,
                        background: CAT_COLOR[e.category],
                        boxShadow: `0 0 4px ${CAT_COLOR[e.category]}`,
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, color: '#666', fontFamily: 'Inter, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {e.label}
                        </div>
                        <div style={{ fontSize: 8, color: '#333', fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.15em', marginTop: 2 }}>
                          {e.category} · {e.minutes}min
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: '#5FFF3D', fontFamily: 'Orbitron, sans-serif', fontWeight: 700, flexShrink: 0 }}>
                        +{e.xpEarned} XP
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      fontFamily: 'Orbitron, sans-serif', fontSize: 7,
      letterSpacing: '0.2em', color: '#333', marginBottom: 10,
    }}>
      {text}
    </div>
  );
}

function CategorySelector({ value, onChange }: { value: TimeCategory; onChange: (c: TimeCategory) => void }) {
  return (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
      {CATEGORIES.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          style={{
            padding: '5px 10px',
            background: value === c ? `${CAT_COLOR[c]}12` : 'transparent',
            border: `1px solid ${value === c ? CAT_COLOR[c] + '60' : '#1e1e1e'}`,
            color: value === c ? CAT_COLOR[c] : '#444',
            fontFamily: 'Orbitron, sans-serif', fontSize: 7,
            letterSpacing: '0.15em', cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {c.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
