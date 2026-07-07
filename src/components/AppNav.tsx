import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAscendStore, computeDueLessons } from '../store/useAscendStore';
import type { OverlayView } from '../store/useAscendStore';

interface NavItem {
  id: OverlayView | 'tree';
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'tree', label: 'SKILL TREE', icon: '◈' },
  { id: 'sprint', label: 'SPRINT', icon: '⚡' },
  { id: 'review', label: 'REVIEW', icon: '↻' },
  { id: 'time', label: 'TIME', icon: '◷' },
  { id: 'stats', label: 'STATS', icon: '▣' },
  { id: 'xpledger', label: 'XP LEDGER', icon: '⊞' },
];

export default function AppNav() {
  const overlay = useAscendStore((s) => s.overlay);
  const setOverlay = useAscendStore((s) => s.setOverlay);
  const activeTimer = useAscendStore((s) => s.activeTimer);
  const completedLessons = useAscendStore((s) => s.completedLessons);
  const reviewStates = useAscendStore((s) => s.reviewStates);

  const dueCount = useMemo(
    () => computeDueLessons(completedLessons, reviewStates).length,
    [completedLessons, reviewStates]
  );

  const active = overlay ?? 'tree';

  const handleClick = (id: NavItem['id']) => {
    if (id === 'tree') {
      setOverlay(null);
    } else {
      setOverlay(id as OverlayView);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 300,
      display: 'flex',
      gap: 1,
      background: 'rgba(2,2,5,0.98)',
      border: '1px solid #131313',
      borderBottom: 'none',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 -4px 40px rgba(0,0,0,0.7)',
    }}>
      {/* Top accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, #1e1e1e 20%, #1e1e1e 80%, transparent)',
      }} />

      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id;
        const isTimerRunning = item.id === 'time' && activeTimer;
        return (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleClick(item.id)}
            style={{
              position: 'relative',
              padding: '12px 28px 14px',
              background: isActive ? 'rgba(136,51,255,0.1)' : 'transparent',
              border: 'none',
              color: isActive ? '#F0F0F0' : '#404040',
              cursor: 'pointer',
              transition: 'all 0.18s',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 5,
              minWidth: 80,
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.color = '#777';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.color = '#404040';
            }}
          >
            {/* Active top bar */}
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                style={{
                  position: 'absolute', top: -1, left: 0, right: 0, height: 1,
                  background: 'linear-gradient(90deg, transparent, #8833FF, #33F3FF, transparent)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}

            {/* Timer pulse */}
            {isTimerRunning && (
              <div style={{
                position: 'absolute', top: 8, right: 8,
                width: 5, height: 5, borderRadius: '50%',
                background: '#FF5592',
                boxShadow: '0 0 6px #FF5592',
                animation: 'flicker 2s infinite',
              }} />
            )}

            {/* Review due badge */}
            {item.id === 'review' && dueCount > 0 && (
              <div style={{
                position: 'absolute', top: 5, right: 10,
                minWidth: 14, height: 14, borderRadius: 7,
                padding: '0 4px',
                background: '#8833FF',
                boxShadow: '0 0 8px #8833FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Orbitron, sans-serif', fontSize: 7,
                color: '#FFF', fontWeight: 700,
              }}>
                {dueCount > 99 ? '99+' : dueCount}
              </div>
            )}

            <span style={{ fontSize: 14, lineHeight: 1 }}>{item.icon}</span>
            <span style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: 6, letterSpacing: '0.2em',
              lineHeight: 1,
            }}>
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
