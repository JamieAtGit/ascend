import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { SkillNode as SkillNodeType } from '../data/nodes';
import { CATEGORY_COLORS } from '../data/nodes';
import { useAscendStore } from '../store/useAscendStore';
import { LESSONS_BY_NODE } from '../data/lessons';

interface Props {
  node: SkillNodeType;
  onClick: (node: SkillNodeType) => void;
}

// Flat-top hexagon on 0 0 100 100 viewbox (pointed sides)
const HEX = "50,4 93.3,27 93.3,73 50,96 6.7,73 6.7,27";
const HEX_INNER = "50,14 83,32 83,68 50,86 17,68 17,32";

export default function SkillNode({ node, onClick }: Props) {
  const getNodeStatus = useAscendStore((s) => s.getNodeStatus);
  const spentXP = useAscendStore((s) => s.spentXP);
  const [hovered, setHovered] = useState(false);
  const [unlockBurst, setUnlockBurst] = useState(false);
  const prevStatus = useRef<string>('');

  const status = getNodeStatus(node.id);
  const color = CATEGORY_COLORS[node.category];
  const invested = spentXP[node.id] ?? 0;
  const masteryPct = Math.min(invested / node.masteryThreshold, 1);
  const isSynergy = node.description.startsWith('SYNERGY');
  const size = isSynergy ? 108 : 90;
  const lessonCount = (LESSONS_BY_NODE[node.id] ?? []).length;

  // Detect unlock transition and trigger burst
  useEffect(() => {
    if (prevStatus.current === 'available' && status === 'unlocked') {
      setUnlockBurst(true);
      const t = setTimeout(() => setUnlockBurst(false), 1400);
      return () => clearTimeout(t);
    }
    prevStatus.current = status;
  }, [status]);

  // Fill color — hex interior
  const bgFill =
    status === 'locked' ? 'rgba(10,10,12,0.98)'
    : status === 'available' ? 'rgba(18,16,28,0.97)'
    : status === 'unlocked' ? 'rgba(6,16,30,0.98)'
    : 'rgba(4,18,10,0.98)';

  // Border / stroke
  const strokeColor =
    status === 'locked' ? '#2c2c2c'
    : status === 'available' ? (hovered ? color : '#4a4a5a')
    : color;

  const strokeW =
    status === 'available' && hovered ? 2.5
    : status === 'unlocked' || status === 'mastered' ? 1.8
    : 1;

  // Name text color — significantly brighter than before
  const nameColor =
    status === 'locked' ? '#4a4a4a'
    : status === 'available' ? (hovered ? color : '#b0b0c0')
    : '#EAEAEA';

  const xpColor = status === 'locked' ? '#303030' : '#555';

  const dotColor =
    status === 'locked' ? '#2a2a2a'
    : status === 'available' ? '#666'
    : color;

  // Glow intensity
  const glowOpacity = hovered && status !== 'locked' ? 0.35
    : status === 'mastered' ? 0.2
    : status === 'unlocked' ? 0.1
    : 0;

  const glowWidth = hovered ? 16 : 8;

  const filterId = `glow-node-${node.id}`;

  return (
    <motion.div
      data-node="true"
      animate={{ scale: unlockBurst ? 1.12 : hovered && status !== 'locked' ? 1.07 : 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={() => status !== 'locked' && onClick(node)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
        transform: 'translate(-50%, -50%)',
        width: size,
        height: size,
        cursor: status === 'locked' ? 'default' : 'pointer',
        zIndex: hovered || unlockBurst ? 20 : 1,
      }}
    >
      {/* Synergy outer rotating ring */}
      {isSynergy && (
        <div style={{
          position: 'absolute',
          inset: -14,
          borderRadius: '50%',
          border: `1px solid ${color}`,
          opacity: hovered ? 0.45 : 0.15,
          animation: 'spin 14s linear infinite',
          transition: 'opacity 0.3s',
          pointerEvents: 'none',
        }} />
      )}

      {/* SVG — hex shape */}
      <svg
        viewBox="0 0 100 100"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
      >
        <defs>
          <filter id={filterId} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Bloom glow behind hex */}
        {glowOpacity > 0 && (
          <polygon
            points={HEX}
            fill="none"
            stroke={color}
            strokeWidth={glowWidth}
            opacity={glowOpacity}
            filter={`url(#${filterId})`}
            style={{ transition: 'opacity 0.25s, stroke-width 0.25s' }}
          />
        )}

        {/* Main hex fill */}
        <polygon
          points={HEX}
          fill={bgFill}
          stroke={strokeColor}
          strokeWidth={strokeW}
          style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
        />

        {/* Inner decorative hex ring */}
        {status !== 'locked' && (
          <polygon
            points={HEX_INNER}
            fill="none"
            stroke={color}
            strokeWidth={0.5}
            opacity={hovered ? 0.45 : 0.18}
            style={{ transition: 'opacity 0.2s' }}
          />
        )}

        {/* Mastery volume fill */}
        {(status === 'unlocked' || status === 'mastered') && masteryPct > 0 && (
          <polygon
            points={HEX}
            fill={color}
            opacity={masteryPct * 0.14}
          />
        )}

        {/* Synergy spoke markers */}
        {isSynergy && [0, 60, 120, 180, 240, 300].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <line key={deg}
              x1={50 + Math.cos(rad) * 44} y1={50 + Math.sin(rad) * 44}
              x2={50 + Math.cos(rad) * 54} y2={50 + Math.sin(rad) * 54}
              stroke={color} strokeWidth={1} opacity={hovered ? 0.6 : 0.3}
              style={{ transition: 'opacity 0.2s' }}
            />
          );
        })}

        {/* Unlock burst — radiating circles */}
        {unlockBurst && [0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            cx="50" cy="50"
            initial={{ r: 12, opacity: 0.9 }}
            animate={{ r: 90 + i * 20, opacity: 0 }}
            transition={{ duration: 0.9 + i * 0.18, ease: 'easeOut', delay: i * 0.12 }}
            fill="none"
            stroke={color}
            strokeWidth={1.5 - i * 0.4}
          />
        ))}
      </svg>

      {/* Text content */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 4, pointerEvents: 'none',
        padding: '0 12px',
      }}>
        {/* Status dot */}
        <div style={{
          width: 5, height: 5, borderRadius: '50%',
          background: dotColor,
          boxShadow: status !== 'locked' ? `0 0 8px ${color}, 0 0 3px ${color}` : 'none',
          transition: 'background 0.2s, box-shadow 0.2s',
          flexShrink: 0,
        }} />

        {/* Node name — much lighter/brighter than before */}
        <div style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: isSynergy ? 7.5 : 8.5,
          fontWeight: 700,
          color: nameColor,
          textAlign: 'center',
          lineHeight: 1.25,
          letterSpacing: '0.06em',
          textShadow: hovered && status !== 'locked'
            ? `0 0 14px ${color}, 0 0 6px ${color}`
            : status === 'mastered' ? `0 0 8px ${color}` : 'none',
          transition: 'color 0.2s, text-shadow 0.2s',
        }}>
          {node.name}
        </div>

        {/* XP cost */}
        <div style={{
          fontSize: 7, letterSpacing: '0.12em',
          color: xpColor,
          fontFamily: 'Inter, sans-serif', fontWeight: 500,
          transition: 'color 0.2s',
        }}>
          {status === 'mastered' ? '◆ MASTERED' : `${node.xpCost} XP`}
        </div>

        {/* Lesson badge */}
        {lessonCount > 0 && (
          <div style={{
            fontSize: 6, letterSpacing: '0.08em',
            color: status === 'locked' ? '#252525' : color,
            fontFamily: 'Orbitron, sans-serif',
            opacity: status === 'locked' ? 0.4 : 0.75,
            transition: 'color 0.2s, opacity 0.2s',
          }}>
            {lessonCount} LESSONS
          </div>
        )}
      </div>

      {/* Available pulse ring */}
      {status === 'available' && hovered && (
        <motion.div
          animate={{ scale: [1, 1.55], opacity: [0.5, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut' }}
          style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: `1px solid ${color}`,
            pointerEvents: 'none',
          }}
        />
      )}
    </motion.div>
  );
}
