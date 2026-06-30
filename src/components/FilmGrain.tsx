import { useEffect, useRef } from 'react';

export default function FilmGrain() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 320;
    const H = 320;
    canvas.width = W;
    canvas.height = H;

    let frame: number;
    let tick = 0;

    const draw = () => {
      tick++;
      // Update every 3 frames — fast enough to feel alive, cheap enough to run smoothly
      if (tick % 3 === 0) {
        const img = ctx.createImageData(W, H);
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
          const v = (Math.random() * 255) | 0;
          d[i] = d[i + 1] = d[i + 2] = v;
          d[i + 3] = (Math.random() * 18) | 0;
        }
        ctx.putImageData(img, 0, 0);
      }
      frame = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9989,
        opacity: 0.55,
        mixBlendMode: 'overlay',
        imageRendering: 'pixelated',
      }}
    />
  );
}
