export default function Scanlines() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9990, overflow: 'hidden' }}>
      {/* Static scanlines — very fine horizontal bands */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.07) 0px, rgba(0,0,0,0.07) 1px, transparent 1px, transparent 4px)',
      }} />
      {/* Slow moving scan highlight */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        height: 120,
        background: 'linear-gradient(180deg, transparent, rgba(0,240,255,0.018), transparent)',
        animation: 'scanmove 10s linear infinite',
      }} />
    </div>
  );
}
