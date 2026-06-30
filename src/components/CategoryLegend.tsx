import { CATEGORY_COLORS } from '../data/nodes';

const CATEGORIES = [
  { key: 'PHYSICAL', label: 'PHYSICAL' },
  { key: 'MENTAL', label: 'MENTAL' },
  { key: 'INTELLECTUAL', label: 'INTELLECTUAL' },
  { key: 'FINANCIAL', label: 'FINANCIAL' },
] as const;

export default function CategoryLegend() {
  return (
    <div style={{
      position: 'fixed',
      top: 24,
      right: 32,
      zIndex: 40,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      pointerEvents: 'none',
    }}>
      {CATEGORIES.map(({ key, label }) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: CATEGORY_COLORS[key],
            boxShadow: `0 0 6px ${CATEGORY_COLORS[key]}`,
          }} />
          <span style={{
            fontSize: 8,
            letterSpacing: '0.25em',
            color: '#444',
            fontFamily: 'Orbitron, sans-serif',
          }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
