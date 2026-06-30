import { useRef, useEffect, useCallback } from 'react';
import { NODES, CATEGORY_COLORS } from '../data/nodes';
import type { Transform } from '../hooks/useCanvas';

const MM_W = 260;
const MM_H = 70;

interface Zone {
  label: string;
  x1: number;
  x2: number;
  color: string;
}

const ZONES: Zone[] = [
  { label: 'PHYS', x1: 0,    x2: 430,  color: '#FF6666' },
  { label: 'MENT', x1: 430,  x2: 810,  color: '#8833FF' },
  { label: 'INT',  x1: 810,  x2: 1190, color: '#33F3FF' },
  { label: 'FIN',  x1: 1190, x2: 1620, color: '#5FFF3D' },
  { label: 'ACAD', x1: 1620, x2: 2160, color: '#FFA333' },
  { label: 'CRFT', x1: 2160, x2: 2600, color: '#FF5592' },
  { label: 'ECON', x1: 2600, x2: 3130, color: '#00C8A0' },
  { label: 'CULT', x1: 3130, x2: 3650, color: '#FFB800' },
  { label: 'TRAD', x1: 3650, x2: 4200, color: '#FF7A00' },
];

interface Props {
  transform: Transform;
  canvasW: number;
  canvasH: number;
  onNavigate: (tx: number, ty: number) => void;
}

export default function MiniMap({ transform, canvasW, canvasH, onNavigate }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const scaleX = MM_W / canvasW;
  const scaleY = MM_H / canvasH;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, MM_W, MM_H);

    // Background
    ctx.fillStyle = 'rgba(3,3,6,0.98)';
    ctx.fillRect(0, 0, MM_W, MM_H);

    // Zone bands
    ZONES.forEach((z) => {
      const x = z.x1 * scaleX;
      const w = (z.x2 - z.x1) * scaleX;
      ctx.fillStyle = z.color + '12';
      ctx.fillRect(x, 0, w, MM_H);

      // Divider line
      ctx.strokeStyle = z.color + '30';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, MM_H);
      ctx.stroke();

      // Zone label
      ctx.font = '5px Orbitron, sans-serif';
      ctx.fillStyle = z.color + '70';
      ctx.textAlign = 'center';
      ctx.fillText(z.label, x + w / 2, 8);
    });

    // Node dots
    NODES.forEach((node) => {
      const nx = node.position.x * scaleX;
      const ny = node.position.y * scaleY;
      const color = CATEGORY_COLORS[node.category];
      ctx.beginPath();
      ctx.arc(nx, ny, 2, 0, Math.PI * 2);
      ctx.fillStyle = color + 'CC';
      ctx.fill();
    });

    // Viewport rectangle
    const vw = (window.innerWidth / transform.scale) * scaleX;
    const vh = (window.innerHeight / transform.scale) * scaleY;
    const vx = (-transform.x / transform.scale) * scaleX;
    const vy = (-transform.y / transform.scale) * scaleY;

    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(vx, vy, vw, vh);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(vx, vy, vw, vh);
  }, [transform, scaleX, scaleY]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Convert minimap coords → canvas coords → new transform
    const canvasX = mx / scaleX;
    const canvasY = my / scaleY;
    const newX = -(canvasX * transform.scale) + window.innerWidth / 2;
    const newY = -(canvasY * transform.scale) + window.innerHeight / 2;
    onNavigate(newX, newY);
  }, [scaleX, scaleY, transform.scale, onNavigate]);

  return (
    <div style={{
      position: 'fixed',
      bottom: 68,
      right: 20,
      zIndex: 42,
      background: 'rgba(3,3,6,0.96)',
      border: '1px solid #1e1e1e',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 0 30px rgba(0,0,0,0.7)',
      overflow: 'hidden',
    }}>
      {/* Top accent */}
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, #8833FF, #33F3FF, #FF7A00)',
        opacity: 0.5,
      }} />

      <div style={{ padding: '6px 8px 2px' }}>
        <div style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: 5, letterSpacing: '0.3em', color: '#2a2a2a',
          marginBottom: 4,
        }}>
          MINIMAP // 37 NODES
        </div>
        <canvas
          ref={canvasRef}
          width={MM_W}
          height={MM_H}
          onClick={handleClick}
          style={{ display: 'block', cursor: 'crosshair' }}
        />
      </div>
    </div>
  );
}
