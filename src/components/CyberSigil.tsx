import type { CSSProperties } from 'react';

interface Props {
  style?: CSSProperties;
  variant?: 'full' | 'corner' | 'small';
}

export default function CyberSigil({ style, variant = 'full' }: Props) {
  if (variant === 'corner') {
    return (
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={style} fill="none">
        <g stroke="#EAEAEA" strokeWidth="0.6">
          <line x1="0" y1="80" x2="80" y2="0" />
          <line x1="0" y1="120" x2="120" y2="0" />
          <line x1="0" y1="60" x2="60" y2="0" />
          <polygon points="100,100 200,0 200,40 140,100 200,100 200,140 100,200 60,200 100,160 0,200 0,160 60,100 0,100 0,60" opacity="0.4" />
          <circle cx="100" cy="100" r="60" opacity="0.2" />
          <circle cx="100" cy="100" r="40" opacity="0.3" />
          <circle cx="100" cy="100" r="20" opacity="0.4" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <line key={i}
              x1={100 + Math.cos(a) * 42} y1={100 + Math.sin(a) * 42}
              x2={100 + Math.cos(a) * 58} y2={100 + Math.sin(a) * 58}
              opacity="0.5" />;
          })}
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 1200 800"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <g stroke="#EAEAEA" strokeWidth="0.4">
        {/* Primary cross axes */}
        <line x1="600" y1="0" x2="600" y2="800" opacity="0.5" />
        <line x1="0" y1="400" x2="1200" y2="400" opacity="0.5" />
        <line x1="0" y1="0" x2="1200" y2="800" opacity="0.2" />
        <line x1="1200" y1="0" x2="0" y2="800" opacity="0.2" />

        {/* Outer large circles */}
        <circle cx="600" cy="400" r="340" opacity="0.2" />
        <circle cx="600" cy="400" r="260" opacity="0.25" />
        <circle cx="600" cy="400" r="180" opacity="0.35" />
        <circle cx="600" cy="400" r="100" opacity="0.4" />
        <circle cx="600" cy="400" r="40" opacity="0.5" />

        {/* Outer diamond / square rotated */}
        <polygon points="600,80 920,400 600,720 280,400" opacity="0.3" />
        <polygon points="600,140 860,400 600,660 340,400" opacity="0.25" />

        {/* Inner sacred geometry */}
        <polygon points="600,220 730,310 682,460 518,460 470,310" opacity="0.35" />
        <polygon points="600,340 680,390 652,480 548,480 520,390" opacity="0.3" />

        {/* Fine radial lines from center */}
        {Array.from({ length: 36 }, (_, i) => {
          const a = (i / 36) * Math.PI * 2;
          const r1 = i % 3 === 0 ? 44 : 42;
          const r2 = i % 6 === 0 ? 345 : i % 3 === 0 ? 260 : 100;
          return (
            <line key={i}
              x1={600 + Math.cos(a) * r1} y1={400 + Math.sin(a) * r1}
              x2={600 + Math.cos(a) * r2} y2={400 + Math.sin(a) * r2}
              opacity={i % 6 === 0 ? 0.4 : i % 3 === 0 ? 0.2 : 0.1}
            />
          );
        })}

        {/* Tick marks on rings */}
        {[100, 180, 260].map((r) =>
          Array.from({ length: 48 }, (_, i) => {
            const a = (i / 48) * Math.PI * 2;
            const len = i % 8 === 0 ? 12 : i % 4 === 0 ? 7 : 4;
            return (
              <line key={`${r}-${i}`}
                x1={600 + Math.cos(a) * r} y1={400 + Math.sin(a) * r}
                x2={600 + Math.cos(a) * (r + len)} y2={400 + Math.sin(a) * (r + len)}
                opacity={0.4}
              />
            );
          })
        )}

        {/* Corner sigil clusters */}
        <g opacity="0.6">
          {/* Top-left */}
          <path d="M60,60 L120,60 L120,40 L180,40" />
          <path d="M60,60 L60,120 L40,120 L40,180" />
          <path d="M80,80 L160,80 L160,160 L80,160 Z" opacity="0.3" />
          <circle cx="120" cy="120" r="20" opacity="0.2" />
          <line x1="60" y1="90" x2="140" y2="90" opacity="0.2" />
          <line x1="90" y1="60" x2="90" y2="140" opacity="0.2" />

          {/* Top-right */}
          <path d="M1140,60 L1080,60 L1080,40 L1020,40" />
          <path d="M1140,60 L1140,120 L1160,120 L1160,180" />
          <path d="M1120,80 L1040,80 L1040,160 L1120,160 Z" opacity="0.3" />
          <circle cx="1080" cy="120" r="20" opacity="0.2" />

          {/* Bottom-left */}
          <path d="M60,740 L120,740 L120,760 L180,760" />
          <path d="M60,740 L60,680 L40,680 L40,620" />
          <path d="M80,720 L160,720 L160,640 L80,640 Z" opacity="0.3" />
          <circle cx="120" cy="680" r="20" opacity="0.2" />

          {/* Bottom-right */}
          <path d="M1140,740 L1080,740 L1080,760 L1020,760" />
          <path d="M1140,740 L1140,680 L1160,680 L1160,620" />
          <path d="M1120,720 L1040,720 L1040,640 L1120,640 Z" opacity="0.3" />
          <circle cx="1080" cy="680" r="20" opacity="0.2" />
        </g>

        {/* Horizontal data lines scattered */}
        <line x1="20" y1="320" x2="240" y2="320" opacity="0.3" />
        <line x1="20" y1="330" x2="200" y2="330" opacity="0.15" />
        <line x1="20" y1="340" x2="160" y2="340" opacity="0.08" />
        <line x1="960" y1="320" x2="1180" y2="320" opacity="0.3" />
        <line x1="1000" y1="330" x2="1180" y2="330" opacity="0.15" />
        <line x1="20" y1="470" x2="240" y2="470" opacity="0.3" />
        <line x1="960" y1="470" x2="1180" y2="470" opacity="0.3" />

        {/* Tribal arm extensions */}
        {[0, 60, 120, 180, 240, 300].map((deg) => {
          const a = (deg * Math.PI) / 180;
          const mx = 600 + Math.cos(a) * 263;
          const my = 400 + Math.sin(a) * 263;
          const ex = 600 + Math.cos(a) * 340;
          const ey = 400 + Math.sin(a) * 340;
          const px = mx + Math.cos(a + Math.PI / 2) * 20;
          const py = my + Math.sin(a + Math.PI / 2) * 20;
          const qx = mx + Math.cos(a - Math.PI / 2) * 20;
          const qy = my + Math.sin(a - Math.PI / 2) * 20;
          return (
            <g key={deg} opacity="0.35">
              <line x1={mx} y1={my} x2={ex} y2={ey} />
              <line x1={px} y1={py} x2={ex} y2={ey} />
              <line x1={qx} y1={qy} x2={ex} y2={ey} />
            </g>
          );
        })}

        {/* Binary / data text horizontal strips */}
        <line x1="240" y1="395" x2="420" y2="395" opacity="0.1" />
        <line x1="240" y1="400" x2="400" y2="400" opacity="0.15" />
        <line x1="240" y1="405" x2="380" y2="405" opacity="0.08" />
        <line x1="780" y1="395" x2="960" y2="395" opacity="0.1" />
        <line x1="800" y1="400" x2="960" y2="400" opacity="0.15" />
        <line x1="820" y1="405" x2="960" y2="405" opacity="0.08" />
      </g>
    </svg>
  );
}
