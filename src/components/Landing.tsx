import { motion } from 'framer-motion';
import { useAscendStore } from '../store/useAscendStore';
import Particles from './Particles';
import CyberSigil from './CyberSigil';
import Scanlines from './Scanlines';
import FilmGrain from './FilmGrain';

const CATS = [
  { label: 'PHYSICAL', color: '#FF4444' },
  { label: 'MENTAL', color: '#6A00FF' },
  { label: 'INTELLECTUAL', color: '#00F0FF' },
  { label: 'FINANCIAL', color: '#39FF14' },
];

// Scattered ambient text labels placed around the page for atmosphere
const AMBIENT = [
  { text: 'SYS_ONLINE', x: '6%', y: '8%', color: '#39FF14' },
  { text: 'v1.0.0', x: '6%', y: '12%', color: '#333' },
  { text: 'PROTOCOL: ACTIVE', x: '72%', y: '9%', color: '#444' },
  { text: 'NODE_COUNT: 14', x: '72%', y: '13%', color: '#333' },
  { text: 'XP_ENGINE READY', x: '6%', y: '85%', color: '#444' },
  { text: '◈ SKILL_TREE LOADED', x: '6%', y: '89%', color: '#333' },
  { text: 'SYNC: 100%', x: '76%', y: '85%', color: '#444' },
  { text: 'DOMAINS: 4', x: '76%', y: '89%', color: '#333' },
];

function HUDCorners() {
  return (
    <>
      {/* Top-left */}
      <div style={{ position: 'absolute', top: 24, left: 24, width: 40, height: 40, zIndex: 20 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: 28, height: 1, background: '#EAEAEA', opacity: 0.25 }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 28, background: '#EAEAEA', opacity: 0.25 }} />
      </div>
      {/* Top-right */}
      <div style={{ position: 'absolute', top: 24, right: 24, width: 40, height: 40, zIndex: 20 }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 28, height: 1, background: '#EAEAEA', opacity: 0.25 }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: 1, height: 28, background: '#EAEAEA', opacity: 0.25 }} />
      </div>
      {/* Bottom-left */}
      <div style={{ position: 'absolute', bottom: 24, left: 24, width: 40, height: 40, zIndex: 20 }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 28, height: 1, background: '#EAEAEA', opacity: 0.25 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 1, height: 28, background: '#EAEAEA', opacity: 0.25 }} />
      </div>
      {/* Bottom-right */}
      <div style={{ position: 'absolute', bottom: 24, right: 24, width: 40, height: 40, zIndex: 20 }}>
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 1, background: '#EAEAEA', opacity: 0.25 }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 1, height: 28, background: '#EAEAEA', opacity: 0.25 }} />
      </div>
    </>
  );
}

export default function Landing() {
  const setView = useAscendStore((s) => s.setView);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      background: '#050505',
    }}>
      {/* Background layers — lowest to highest */}
      <Particles />

      {/* Primary sigil — full screen, very low opacity */}
      <CyberSigil style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07, zIndex: 1 }} />

      {/* Secondary rotated sigil — offset, for depth */}
      <div style={{ position: 'absolute', top: '-25%', right: '-20%', width: '80%', height: '80%', opacity: 0.035, zIndex: 1, transform: 'rotate(22deg)' }}>
        <CyberSigil style={{ width: '100%', height: '100%' }} />
      </div>
      <div style={{ position: 'absolute', bottom: '-20%', left: '-15%', width: '60%', height: '60%', opacity: 0.03, zIndex: 1, transform: 'rotate(-15deg)' }}>
        <CyberSigil style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Central radial glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(136,51,255,0.09) 0%, rgba(51,243,255,0.04) 40%, transparent 70%)',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Atmospheric overlays */}
      <FilmGrain />
      <Scanlines />

      {/* HUD corner brackets */}
      <HUDCorners />

      {/* Ambient scattered text */}
      {AMBIENT.map((a) => (
        <motion.div
          key={a.text}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1.2 }}
          style={{
            position: 'absolute', left: a.x, top: a.y,
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 8, letterSpacing: '0.2em',
            color: a.color, zIndex: 20,
            pointerEvents: 'none',
          }}
        >
          {a.text}
        </motion.div>
      ))}

      {/* Center content */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 10, gap: 0,
      }}>

        {/* System status line */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 8, letterSpacing: '0.4em',
            color: '#39FF14', marginBottom: 32,
            opacity: 0.7,
          }}
        >
          SYSTEM INITIALIZE // SELF-EVOLUTION PROTOCOL ACTIVE
        </motion.div>

        {/* Main logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ delay: 0.4, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 'clamp(60px, 9vw, 110px)',
            fontWeight: 900,
            letterSpacing: '0.3em',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #EAEAEA 25%, #C0C0C0 55%, #6A00FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            userSelect: 'none',
            lineHeight: 1,
            animation: 'flicker 12s infinite',
          }}
        >
          ASCEND
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            letterSpacing: '0.45em',
            color: '#555',
            textTransform: 'uppercase',
            marginTop: 14,
            marginBottom: 32,
          }}
        >
          BUILD YOURSELF LIKE A SYSTEM
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.0, duration: 0.9, ease: 'easeOut' }}
          style={{
            width: 380,
            height: 1,
            background: 'linear-gradient(90deg, transparent, #6A00FF 30%, #00F0FF 50%, #6A00FF 70%, transparent)',
            marginBottom: 36,
          }}
        />

        {/* Category pills */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          style={{ display: 'flex', gap: 6, marginBottom: 36, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          {CATS.map((c) => (
            <div key={c.label} style={{
              padding: '4px 12px',
              border: `1px solid ${c.color}28`,
              color: c.color,
              fontFamily: 'Orbitron, sans-serif',
              fontSize: 8,
              letterSpacing: '0.25em',
              background: `${c.color}06`,
            }}>
              {c.label}
            </div>
          ))}
        </motion.div>

        {/* Explanation text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          style={{
            textAlign: 'center',
            maxWidth: 460,
            marginBottom: 40,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            lineHeight: 1.7,
            color: '#666',
            letterSpacing: '0.04em',
          }}>
            Not a productivity app. A self-evolution framework.
            Track progression across four cognitive and physical domains.
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            lineHeight: 1.7,
            color: '#444',
            letterSpacing: '0.04em',
          }}>
            Log real-world actions → earn XP → unlock skill nodes.
            <br />
            Build the architecture of who you're becoming.
          </p>
        </motion.div>

        {/* CTA button */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 0.6 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setView('app')}
          style={{
            padding: '15px 60px',
            border: '1px solid rgba(51,243,255,0.3)',
            background: 'rgba(51,243,255,0.03)',
            color: '#00F0FF',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.35em',
            cursor: 'pointer',
            position: 'relative',
            transition: 'all 0.25s ease',
            marginBottom: 20,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(51,243,255,0.75)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(51,243,255,0.2), inset 0 0 20px rgba(51,243,255,0.04)';
            e.currentTarget.style.background = 'rgba(51,243,255,0.07)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(51,243,255,0.3)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.background = 'rgba(51,243,255,0.03)';
          }}
        >
          ENTER
        </motion.button>

        {/* Bottom micro-text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 8,
            letterSpacing: '0.35em',
            color: '#2e2e2e',
          }}
        >
          EVOLVE OR STAGNATE
        </motion.div>
      </div>

      {/* Vertical side text — left */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        style={{
          position: 'absolute',
          left: 24,
          top: '50%',
          transform: 'translateY(-50%) rotate(-90deg)',
          fontFamily: 'Orbitron, sans-serif',
          fontSize: 7,
          letterSpacing: '0.4em',
          color: '#252525',
          zIndex: 20,
          whiteSpace: 'nowrap',
        }}
      >
        SELF_EVOLUTION_ENGINE // v1.0
      </motion.div>

      {/* Vertical side text — right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        style={{
          position: 'absolute',
          right: 24,
          top: '50%',
          transform: 'translateY(-50%) rotate(90deg)',
          fontFamily: 'Orbitron, sans-serif',
          fontSize: 7,
          letterSpacing: '0.4em',
          color: '#252525',
          zIndex: 20,
          whiteSpace: 'nowrap',
        }}
      >
        ASCEND_PROTOCOL // BUILD_OR_DECAY
      </motion.div>
    </div>
  );
}
