import { useRef, useState, useCallback, useEffect } from 'react';

export interface Transform {
  x: number;
  y: number;
  scale: number;
}

const MIN_SCALE = 0.3;
const MAX_SCALE = 2.5;
const INERTIA_DECAY = 0.88;
const INERTIA_STOP = 0.3;

export function useCanvas(initialTransform: Transform) {
  const [transform, setTransform] = useState<Transform>(initialTransform);
  const [isDragging, setIsDragging] = useState(false);

  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const stopInertia = () => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
  };

  const startInertia = useCallback(() => {
    let vx = velocity.current.x;
    let vy = velocity.current.y;

    const tick = () => {
      vx *= INERTIA_DECAY;
      vy *= INERTIA_DECAY;
      if (Math.abs(vx) < INERTIA_STOP && Math.abs(vy) < INERTIA_STOP) return;
      setTransform((t) => ({ ...t, x: t.x + vx, y: t.y + vy }));
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-node]')) return;
    if (e.button !== 0) return;
    stopInertia();
    dragging.current = true;
    setIsDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
    velocity.current = { x: 0, y: 0 };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    // Smooth velocity with exponential moving average for natural feel
    velocity.current = {
      x: velocity.current.x * 0.6 + dx * 0.4,
      y: velocity.current.y * 0.6 + dy * 0.4,
    };
    lastPos.current = { x: e.clientX, y: e.clientY };
    setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
  }, []);

  const onMouseUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    startInertia();
  }, [startInertia]);

  // ── Touch: one-finger pan, two-finger pinch zoom ──────────────────────────
  // The container gets touchAction: 'none' so the browser never scrolls/zooms
  // the page — all gestures are ours. Taps on nodes still fire click normally.
  const touchState = useRef<{
    mode: 'none' | 'pan' | 'pinch';
    lastX: number; lastY: number;
    lastDist: number; lastMidX: number; lastMidY: number;
  }>({ mode: 'none', lastX: 0, lastY: 0, lastDist: 0, lastMidX: 0, lastMidY: 0 });

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    stopInertia();
    const ts = touchState.current;
    if (e.touches.length === 1) {
      // Starting on a node = potential tap; don't hijack it into a pan yet.
      if ((e.target as HTMLElement).closest('[data-node]')) { ts.mode = 'none'; return; }
      ts.mode = 'pan';
      ts.lastX = e.touches[0].clientX;
      ts.lastY = e.touches[0].clientY;
      velocity.current = { x: 0, y: 0 };
      setIsDragging(true);
    } else if (e.touches.length >= 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      ts.mode = 'pinch';
      ts.lastDist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      ts.lastMidX = (a.clientX + b.clientX) / 2;
      ts.lastMidY = (a.clientY + b.clientY) / 2;
      setIsDragging(true);
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const ts = touchState.current;
    const el = containerRef.current;
    if (!el) return;

    if (ts.mode === 'pan' && e.touches.length === 1) {
      const t = e.touches[0];
      const dx = t.clientX - ts.lastX;
      const dy = t.clientY - ts.lastY;
      velocity.current = {
        x: velocity.current.x * 0.6 + dx * 0.4,
        y: velocity.current.y * 0.6 + dy * 0.4,
      };
      ts.lastX = t.clientX;
      ts.lastY = t.clientY;
      setTransform((tr) => ({ ...tr, x: tr.x + dx, y: tr.y + dy }));
    } else if (ts.mode === 'pinch' && e.touches.length >= 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      const midX = (a.clientX + b.clientX) / 2;
      const midY = (a.clientY + b.clientY) / 2;
      const rect = el.getBoundingClientRect();
      const mx = midX - rect.left;
      const my = midY - rect.top;
      const factor = ts.lastDist > 0 ? dist / ts.lastDist : 1;
      const panDx = midX - ts.lastMidX;
      const panDy = midY - ts.lastMidY;

      setTransform((tr) => {
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, tr.scale * factor));
        const ratio = newScale / tr.scale;
        return {
          scale: newScale,
          x: mx - (mx - tr.x) * ratio + panDx,
          y: my - (my - tr.y) * ratio + panDy,
        };
      });

      ts.lastDist = dist;
      ts.lastMidX = midX;
      ts.lastMidY = midY;
    }
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const ts = touchState.current;
    if (e.touches.length === 0) {
      if (ts.mode === 'pan') startInertia();
      ts.mode = 'none';
      setIsDragging(false);
    } else if (e.touches.length === 1 && ts.mode === 'pinch') {
      // Dropped from pinch to one finger: continue as pan.
      ts.mode = 'pan';
      ts.lastX = e.touches[0].clientX;
      ts.lastY = e.touches[0].clientY;
      velocity.current = { x: 0, y: 0 };
    }
  }, [startInertia]);

  // Native non-passive wheel listener so preventDefault() is always respected
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Pinch-to-zoom on trackpad sends ctrlKey=true (macOS browser behaviour)
      // ctrl+scroll on mouse also sets ctrlKey — both mean zoom
      if (e.ctrlKey || e.metaKey) {
        const rect = el.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // Normalise: trackpad pinch gives pixel deltas, mouse gives line deltas
        const rawDelta = e.deltaMode === 1 ? e.deltaY * 15 : e.deltaY;
        const factor = Math.exp(-rawDelta * 0.004);

        setTransform((t) => {
          const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, t.scale * factor));
          const ratio = newScale / t.scale;
          return {
            scale: newScale,
            x: mx - (mx - t.x) * ratio,
            y: my - (my - t.y) * ratio,
          };
        });
      } else {
        // Two-finger trackpad pan (or regular scroll → pan vertically)
        // deltaMode 0 = pixel, 1 = line (~20px), 2 = page
        const mult = e.deltaMode === 1 ? 20 : e.deltaMode === 2 ? 300 : 1;
        stopInertia();
        setTransform((t) => ({
          ...t,
          x: t.x - e.deltaX * mult,
          y: t.y - e.deltaY * mult,
        }));
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => () => stopInertia(), []);

  return {
    transform,
    setTransform,
    isDragging,
    containerRef,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    // Keep onWheel as a no-op so the JSX prop doesn't break; real handler is the native listener
    onWheel: (e: React.WheelEvent) => e.preventDefault(),
  };
}
