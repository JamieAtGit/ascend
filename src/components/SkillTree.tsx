import { useState } from 'react';
import { motion } from 'framer-motion';
import { NODES, CATEGORY_COLORS } from '../data/nodes';
import type { SkillNode } from '../data/nodes';
import { useCanvas } from '../hooks/useCanvas';
import SkillNodeComponent from './SkillNode';
import NodeEdges from './NodeEdges';
import NodePanel from './NodePanel';
import XPBar from './XPBar';
import Dashboard from './Dashboard';
import CyberSigil from './CyberSigil';
import Scanlines from './Scanlines';
import FilmGrain from './FilmGrain';
import AppNav from './AppNav';
import MiniMap from './MiniMap';

export const CANVAS_W = 4200;
export const CANVAS_H = 850;

const ZONE_LABELS = [
  { label: 'PHYSICAL',     x: 215,  y: 56, color: CATEGORY_COLORS.PHYSICAL },
  { label: 'MENTAL',       x: 620,  y: 56, color: CATEGORY_COLORS.MENTAL },
  { label: 'INTELLECTUAL', x: 1000, y: 56, color: CATEGORY_COLORS.INTELLECTUAL },
  { label: 'FINANCIAL',    x: 1405, y: 56, color: CATEGORY_COLORS.FINANCIAL },
  { label: 'ACADEMIC',     x: 1890, y: 56, color: CATEGORY_COLORS.ACADEMIC },
  { label: 'CRAFT',        x: 2375, y: 56, color: CATEGORY_COLORS.CRAFT },
  { label: 'ECONOMICS',    x: 2865, y: 56, color: CATEGORY_COLORS.ECONOMICS },
  { label: 'CULTURE',      x: 3390, y: 56, color: CATEGORY_COLORS.CULTURE },
  { label: 'TRADING',      x: 3925, y: 56, color: CATEGORY_COLORS.TRADING },
];

const ZONE_DIVIDERS = [430, 810, 1190, 1620, 2160, 2600, 3130, 3650];

const AMBIENT_NODES = [
  { text: '[X:180 Y:300]',  x: 90,   y: 295, color: '#1e1e1e' },
  { text: 'Ω:PHYS',         x: 90,   y: 480, color: '#1e1e1e' },
  { text: '[X:840 Y:310]',  x: 820,  y: 250, color: '#1e1e1e' },
  { text: 'SYNC►',          x: 1430, y: 150, color: '#1e1e1e' },
  { text: '[X:1420 Y:460]', x: 1430, y: 530, color: '#1e1e1e' },
  { text: 'Ω:ACAD',         x: 1670, y: 680, color: '#1e1e1e' },
  { text: '[X:2900 Y:390]', x: 2820, y: 660, color: '#1e1e1e' },
  { text: 'Ω:ECON',         x: 3070, y: 680, color: '#1e1e1e' },
  { text: '[X:4050 Y:350]', x: 4060, y: 650, color: '#1e1e1e' },
];

export default function SkillTree() {
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);

  const initScale = 0.62;
  const { transform, setTransform, isDragging, containerRef, onMouseDown, onMouseMove, onMouseUp, onTouchStart, onTouchMove, onTouchEnd, onWheel } = useCanvas({
    x: typeof window !== 'undefined' ? (window.innerWidth / 2) - (CANVAS_W * initScale / 2) : 0,
    y: typeof window !== 'undefined' ? (window.innerHeight / 2) - (CANVAS_H * initScale / 2) : 0,
    scale: initScale,
  });

  const handleMiniMapNavigate = (tx: number, ty: number) => {
    setTransform((t) => ({ ...t, x: tx, y: ty }));
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
      style={{
        width: '100%', height: '100%',
        background: '#050505',
        overflow: 'hidden', position: 'relative',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        // Browser handles no gestures here — pan/pinch are ours (mobile)
        touchAction: 'none',
      }}
    >
      <FilmGrain />
      <Scanlines />

      <CyberSigil style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        opacity: 0.045, pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{
        position: 'absolute', top: '-30%', right: '-25%',
        width: '90%', height: '90%',
        opacity: 0.02, zIndex: 0, transform: 'rotate(30deg)',
        pointerEvents: 'none',
      }}>
        <CyberSigil style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Edge vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.75) 100%)',
        pointerEvents: 'none', zIndex: 2,
      }} />

      {/* Pan/zoom canvas */}
      <motion.div
        animate={{ x: transform.x, y: transform.y, scale: transform.scale }}
        transition={{ type: 'tween', duration: 0 }}
        style={{
          position: 'absolute',
          width: CANVAS_W, height: CANVAS_H,
          transformOrigin: '0 0', zIndex: 1,
        }}
      >
        {/* Grid dot pattern */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }}>
          <defs>
            <pattern id="dots" width="36" height="36" patternUnits="userSpaceOnUse">
              <circle cx="18" cy="18" r="0.7" fill="#666" />
            </pattern>
            <pattern id="cross" width="180" height="180" patternUnits="userSpaceOnUse">
              <line x1="90" y1="80" x2="90" y2="100" stroke="#333" strokeWidth="0.4" />
              <line x1="80" y1="90" x2="100" y2="90" stroke="#333" strokeWidth="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
          <rect width="100%" height="100%" fill="url(#cross)" opacity="0.5" />
        </svg>

        {/* Zone vertical dividers */}
        {ZONE_DIVIDERS.map((x) => (
          <div key={x} style={{
            position: 'absolute', left: x, top: 40, bottom: 40, width: 1,
            background: 'linear-gradient(180deg, transparent, #1a1a1a 15%, #1a1a1a 85%, transparent)',
            pointerEvents: 'none',
          }} />
        ))}

        {/* Category zone labels */}
        {ZONE_LABELS.map((z) => (
          <div key={z.label} style={{
            position: 'absolute', left: z.x, top: z.y,
            transform: 'translateX(-50%)',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 8, letterSpacing: '0.4em',
            color: z.color, opacity: 0.4,
            whiteSpace: 'nowrap', pointerEvents: 'none',
          }}>
            {z.label}
          </div>
        ))}

        {/* Ambient coordinate labels */}
        {AMBIENT_NODES.map((a) => (
          <div key={a.text} style={{
            position: 'absolute', left: a.x, top: a.y,
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 7, letterSpacing: '0.15em',
            color: a.color, pointerEvents: 'none',
          }}>
            {a.text}
          </div>
        ))}

        <NodeEdges />

        {NODES.map((node) => (
          <SkillNodeComponent key={node.id} node={node} onClick={setSelectedNode} />
        ))}
      </motion.div>

      {/* Fixed UI */}
      <XPBar />
      <Dashboard />
      <MiniMap
        transform={transform}
        canvasW={CANVAS_W}
        canvasH={CANVAS_H}
        onNavigate={handleMiniMapNavigate}
      />
      <AppNav />

      {/* ASCEND brand — top left */}
      <div style={{ position: 'fixed', top: 20, left: 24, zIndex: 40, pointerEvents: 'none' }}>
        <div style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: 13, fontWeight: 900, letterSpacing: '0.32em',
          background: 'linear-gradient(135deg, #F0F0F0 0%, #D0D0D0 50%, #8833FF 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', userSelect: 'none',
          animation: 'flicker 18s infinite',
        }}>
          ASCEND
        </div>
        <div style={{
          fontFamily: 'Orbitron, sans-serif', fontSize: 6,
          letterSpacing: '0.3em', color: '#2a2a2a', marginTop: 3,
        }}>
          SELF-EVOLUTION PROTOCOL
        </div>
      </div>

      {/* Top-right HUD brackets */}
      <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 40, pointerEvents: 'none' }}>
        <div style={{ position: 'relative', width: 36, height: 36 }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 20, height: 1, background: '#F0F0F0', opacity: 0.22 }} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: 1, height: 20, background: '#F0F0F0', opacity: 0.22 }} />
        </div>
        <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 6, letterSpacing: '0.2em', color: '#2a2a2a', textAlign: 'right', marginTop: 2 }}>
          NODE_TREE_VIEW
        </div>
      </div>

      {/* Bottom right hint */}
      <div style={{
        position: 'fixed', bottom: 148, right: 28, zIndex: 40,
        pointerEvents: 'none', textAlign: 'right',
      }}>
        <div style={{ fontSize: 7, letterSpacing: '0.22em', color: '#212121', fontFamily: 'Orbitron, sans-serif' }}>
          DRAG · PINCH TO ZOOM · CLICK NODES
        </div>
      </div>

      <NodePanel node={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
}
