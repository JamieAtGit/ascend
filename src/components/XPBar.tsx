import { motion } from 'framer-motion';
import { useAscendStore, xpForLevel } from '../store/useAscendStore';

export default function XPBar() {
  const xp = useAscendStore((s) => s.xp);
  const level = useAscendStore((s) => s.level);
  const getAvailableXP = useAscendStore((s) => s.getAvailableXP);
  const currentStreak = useAscendStore((s) => s.currentStreak);
  const available = getAvailableXP();

  let accumulated = 0;
  for (let l = 1; l < level; l++) accumulated += xpForLevel(l);
  const levelXP = xp - accumulated;
  const needed = xpForLevel(level);
  const pct = Math.min(levelXP / needed, 1);

  const segments = 20;
  const filled = Math.round(pct * segments);

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 40,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 7,
    }}>
      {/* Top readout line */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        fontFamily: 'Orbitron, sans-serif',
      }}>
        <span style={{ fontSize: 7, letterSpacing: '0.3em', color: '#444' }}>LVL</span>
        <span style={{
          fontSize: 20, fontWeight: 900, letterSpacing: '0.08em',
          color: '#F0F0F0',
          textShadow: '0 0 16px rgba(136,51,255,0.65)',
        }}>
          {String(level).padStart(2, '0')}
        </span>

        {/* Segmented bar */}
        <div style={{ display: 'flex', gap: 2 }}>
          {Array.from({ length: segments }, (_, i) => (
            <motion.div
              key={i}
              style={{
                width: 8,
                height: 3,
                background: i < filled
                  ? `linear-gradient(90deg, #8833FF, #33F3FF)`
                  : '#181818',
                boxShadow: i < filled && i === filled - 1
                  ? '0 0 8px rgba(51,243,255,0.9)'
                  : 'none',
                transition: 'background 0.4s',
              }}
            />
          ))}
        </div>

        <span style={{ fontSize: 8, letterSpacing: '0.2em', color: '#5FFF3D',
          textShadow: '0 0 10px rgba(95,255,61,0.55)',
        }}>
          {available}<span style={{ color: '#3a3a3a', marginLeft: 3 }}>XP</span>
        </span>

        {/* Streak badge */}
        {currentStreak >= 2 && (
          <span style={{
            fontSize: 7, letterSpacing: '0.12em',
            color: '#FF7A00',
            textShadow: '0 0 10px rgba(255,122,0,0.6)',
            fontFamily: 'Orbitron, sans-serif',
          }}>
            {currentStreak}d
          </span>
        )}
      </div>

      {/* Sub-label */}
      <div style={{
        fontSize: 7,
        letterSpacing: '0.25em',
        color: '#323232',
        fontFamily: 'Orbitron, sans-serif',
      }}>
        {levelXP} / {needed} · NEXT LEVEL
        {currentStreak >= 2 && (
          <span style={{ marginLeft: 12, color: '#FF7A0055' }}>
            ▲ {currentStreak} DAY STREAK
          </span>
        )}
      </div>
    </div>
  );
}
