import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAscendStore, computeDueLessons } from '../store/useAscendStore';
import type { TimeCategory } from '../store/useAscendStore';
import { LESSON_BY_ID } from '../data/lessons';

const CAT_COLOR: Record<TimeCategory, string> = {
  Learning: '#33F3FF',
  Fitness: '#FF6666',
  Music: '#FF5592',
  Productivity: '#5FFF3D',
  Other: '#8833FF',
};

const CATEGORIES: TimeCategory[] = ['Learning', 'Fitness', 'Music', 'Productivity', 'Other'];

function drawLineChart(
  canvas: HTMLCanvasElement,
  data: { label: string; value: number }[]
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, w, h);

  const padL = 36, padR = 16, padT = 16, padB = 32;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;

  const maxVal = Math.max(...data.map((d) => d.value), 1);

  // Grid lines
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 4; i++) {
    const y = padT + chartH - (i / 4) * chartH;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + chartW, y);
    ctx.stroke();
    ctx.fillStyle = '#333';
    ctx.font = '7px Orbitron, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(String(Math.round((i / 4) * maxVal)), padL - 4, y + 3);
  }

  // X labels
  ctx.fillStyle = '#2a2a2a';
  ctx.font = '7px Orbitron, sans-serif';
  ctx.textAlign = 'center';
  data.forEach((d, i) => {
    const x = padL + (i / (data.length - 1 || 1)) * chartW;
    ctx.fillText(d.label, x, h - padB + 14);
  });

  if (data.length < 2) return;

  // Gradient fill
  const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
  grad.addColorStop(0, 'rgba(136,51,255,0.25)');
  grad.addColorStop(1, 'rgba(136,51,255,0)');

  ctx.beginPath();
  data.forEach((d, i) => {
    const x = padL + (i / (data.length - 1)) * chartW;
    const y = padT + chartH - (d.value / maxVal) * chartH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  // Close fill path
  const lastX = padL + chartW;
  const firstX = padL;
  ctx.lineTo(lastX, padT + chartH);
  ctx.lineTo(firstX, padT + chartH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = '#8833FF';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = '#8833FF';
  ctx.shadowBlur = 6;
  data.forEach((d, i) => {
    const x = padL + (i / (data.length - 1)) * chartW;
    const y = padT + chartH - (d.value / maxVal) * chartH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Dots
  data.forEach((d, i) => {
    const x = padL + (i / (data.length - 1)) * chartW;
    const y = padT + chartH - (d.value / maxVal) * chartH;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = d.value > 0 ? '#33F3FF' : '#222';
    ctx.shadowColor = '#33F3FF';
    ctx.shadowBlur = d.value > 0 ? 8 : 0;
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function drawBarChart(
  canvas: HTMLCanvasElement,
  data: { label: string; value: number; color: string }[]
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, w, h);

  const padL = 90, padR = 16, padT = 10, padB = 10;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  const barH = Math.min(18, (chartH / data.length) - 6);
  const rowH = chartH / data.length;

  data.forEach((d, i) => {
    const y = padT + i * rowH + (rowH - barH) / 2;
    const barW = (d.value / maxVal) * chartW;

    // Label
    ctx.fillStyle = '#444';
    ctx.font = '7px Orbitron, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(d.label, padL - 8, y + barH / 2 + 3);

    // Bar bg
    ctx.fillStyle = '#0e0e0e';
    ctx.fillRect(padL, y, chartW, barH);

    // Bar fill
    if (barW > 0) {
      const grad = ctx.createLinearGradient(padL, 0, padL + barW, 0);
      grad.addColorStop(0, d.color + '40');
      grad.addColorStop(1, d.color);
      ctx.fillStyle = grad;
      ctx.shadowColor = d.color;
      ctx.shadowBlur = 4;
      ctx.fillRect(padL, y, barW, barH);
      ctx.shadowBlur = 0;
    }

    // Value
    ctx.fillStyle = d.value > 0 ? d.color : '#333';
    ctx.font = '8px Orbitron, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${d.value}m`, padL + chartW + 6, y + barH / 2 + 3);
  });
}

export default function ProgressDashboard() {
  const overlay = useAscendStore((s) => s.overlay);
  const setOverlay = useAscendStore((s) => s.setOverlay);
  const xpHistory = useAscendStore((s) => s.xpHistory);
  const timeEntries = useAscendStore((s) => s.timeEntries);
  const completedLessons = useAscendStore((s) => s.completedLessons);
  const unlockedNodes = useAscendStore((s) => s.unlockedNodes);
  const masteredNodes = useAscendStore((s) => s.masteredNodes);
  const xp = useAscendStore((s) => s.xp);
  const level = useAscendStore((s) => s.level);
  const reviewStates = useAscendStore((s) => s.reviewStates);

  const lineRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLCanvasElement>(null);

  // Review analytics
  const reviewsPassed = xpHistory.filter((e) => e.label === 'REVIEW_PASS').length;
  const totalLapses = Object.values(reviewStates).reduce((s, r) => s + r.lapses, 0);
  const totalAttempts = reviewsPassed + totalLapses;
  const retentionPct = totalAttempts > 0 ? Math.round((reviewsPassed / totalAttempts) * 100) : null;
  const dueNow = computeDueLessons(completedLessons, reviewStates).length;

  // Knowledge strength: completed lessons bucketed by review stage
  const stageOf = (lessonId: string) => reviewStates[lessonId]?.stage ?? 0;
  const strengthBuckets = [
    { label: 'NEW', desc: 'not yet reviewed', color: '#555', count: completedLessons.filter((c) => stageOf(c.lessonId) === 0).length },
    { label: 'LEARNING', desc: 'stage 1–2', color: '#FFA333', count: completedLessons.filter((c) => { const s = stageOf(c.lessonId); return s >= 1 && s <= 2; }).length },
    { label: 'SOLID', desc: 'stage 3–4', color: '#33F3FF', count: completedLessons.filter((c) => { const s = stageOf(c.lessonId); return s >= 3 && s <= 4; }).length },
    { label: 'PERMANENT', desc: 'stage 5+', color: '#5FFF3D', count: completedLessons.filter((c) => stageOf(c.lessonId) >= 5).length },
  ];
  const maxBucket = Math.max(...strengthBuckets.map((b) => b.count), 1);

  // Leakiest lessons: most lapses
  const leakiest = Object.entries(reviewStates)
    .filter(([id, r]) => r.lapses > 0 && LESSON_BY_ID[id])
    .sort((a, b) => b[1].lapses - a[1].lapses)
    .slice(0, 3);

  // XP per day for last 7 days
  const xpByDay = (() => {
    const now = Date.now();
    return Array.from({ length: 7 }, (_, i) => {
      const dayStart = now - (6 - i) * 86400000;
      const dayEnd = dayStart + 86400000;
      const total = xpHistory
        .filter((e) => e.timestamp >= dayStart && e.timestamp < dayEnd)
        .reduce((sum, e) => sum + e.xp, 0);
      const d = new Date(dayStart);
      const label = d.toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 3).toUpperCase();
      return { label, value: total };
    });
  })();

  // Time per category
  const timeByCategory = CATEGORIES.map((cat) => ({
    label: cat,
    value: timeEntries.filter((e) => e.category === cat).reduce((sum, e) => sum + e.minutes, 0),
    color: CAT_COLOR[cat],
  }));

  const totalTime = timeEntries.reduce((sum, e) => sum + e.minutes, 0);

  useEffect(() => {
    if (overlay !== 'stats') return;
    const frame = requestAnimationFrame(() => {
      if (lineRef.current) drawLineChart(lineRef.current, xpByDay);
      if (barRef.current) drawBarChart(barRef.current, timeByCategory);
    });
    return () => cancelAnimationFrame(frame);
  });

  if (overlay !== 'stats') return null;

  return (
    <AnimatePresence>
      <motion.div
        key="stats-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 150,
          background: 'rgba(0,0,0,0.88)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onClick={(e) => { if (e.target === e.currentTarget) setOverlay(null); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: '100%', maxWidth: 600,
            maxHeight: '88vh',
            background: 'rgba(3,3,7,0.99)',
            border: '1px solid #1a1a1a',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 0 80px rgba(0,0,0,0.95)',
          }}
        >
          <div style={{ height: 1.5, background: 'linear-gradient(90deg, transparent, #8833FF 40%, #33F3FF 60%, transparent)', flexShrink: 0 }} />

          <div style={{
            padding: '20px 24px 16px', borderBottom: '1px solid #111',
            flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.35em', color: '#8833FF', marginBottom: 6 }}>
                ASCEND // PROGRESS_METRICS
              </div>
              <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 16, fontWeight: 900, color: '#F0F0F0', margin: 0, letterSpacing: '0.06em' }}>
                STATS
              </h2>
            </div>
            <button
              onClick={() => setOverlay(null)}
              style={{ color: '#333', fontSize: 16, fontFamily: 'Orbitron, sans-serif', padding: 4, transition: 'color 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F0F0F0')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#333')}
            >
              ✕
            </button>
          </div>

          <div style={{
            flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px',
            WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', overscrollBehavior: 'contain',
          }}>

            {/* Stat grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, marginBottom: 28 }}>
              <StatBox label="TOTAL_XP" value={xp.toLocaleString()} color="#8833FF" />
              <StatBox label="LEVEL" value={String(level).padStart(2, '0')} color="#33F3FF" />
              <StatBox label="NODES" value={`${unlockedNodes.length + masteredNodes.length}`} color="#5FFF3D" />
              <StatBox label="LESSONS" value={String(completedLessons.length)} color="#FF8C00" />
              <StatBox label="TIME_LOGGED" value={`${Math.floor(totalTime / 60)}h ${totalTime % 60}m`} color="#FF5592" />
              <StatBox label="XP_ENTRIES" value={String(xpHistory.length)} color="#8833FF" />
              <StatBox label="MASTERED" value={String(masteredNodes.length)} color="#33F3FF" />
              <StatBox label="SESSIONS" value={String(timeEntries.length)} color="#FF6666" />
            </div>

            {/* XP line chart */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.3em', color: '#333', marginBottom: 12 }}>
                XP_GAINED — LAST 7 DAYS
              </div>
              <div style={{ background: '#060610', border: '1px solid #111', padding: 4 }}>
                <canvas
                  ref={lineRef}
                  style={{ width: '100%', height: 120, display: 'block' }}
                />
              </div>
            </div>

            {/* Time bar chart */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.3em', color: '#333', marginBottom: 12 }}>
                TIME_LOGGED — BY CATEGORY (MINUTES)
              </div>
              <div style={{ background: '#060610', border: '1px solid #111', padding: 4 }}>
                <canvas
                  ref={barRef}
                  style={{ width: '100%', height: 140, display: 'block' }}
                />
              </div>
            </div>

            {/* Memory retention */}
            <div>
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.3em', color: '#333', marginBottom: 12 }}>
                MEMORY_RETENTION — SPACED REPETITION
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, marginBottom: 16 }}>
                <StatBox label="RETENTION" value={retentionPct !== null ? `${retentionPct}%` : '—'} color={retentionPct === null ? '#555' : retentionPct >= 85 ? '#5FFF3D' : retentionPct >= 70 ? '#FFA333' : '#FF6666'} />
                <StatBox label="REVIEWS_PASSED" value={String(reviewsPassed)} color="#8833FF" />
                <StatBox label="LAPSES" value={String(totalLapses)} color="#FF6666" />
                <StatBox label="DUE_NOW" value={String(dueNow)} color={dueNow > 0 ? '#33F3FF' : '#5FFF3D'} />
              </div>

              {/* Knowledge strength distribution */}
              {completedLessons.length > 0 && (
                <div style={{ background: '#060610', border: '1px solid #111', padding: '14px 16px', marginBottom: 16 }}>
                  <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 6, letterSpacing: '0.2em', color: '#2a2a2a', marginBottom: 10 }}>
                    KNOWLEDGE_STRENGTH — {completedLessons.length} LESSONS
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {strengthBuckets.map((b) => (
                      <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.1em',
                          color: b.color, width: 72, flexShrink: 0,
                        }}>
                          {b.label}
                        </span>
                        <div style={{ flex: 1, height: 10, background: '#0e0e0e', overflow: 'hidden' }}>
                          <div style={{
                            width: `${(b.count / maxBucket) * 100}%`, height: '100%',
                            background: `linear-gradient(90deg, ${b.color}40, ${b.color})`,
                            boxShadow: b.count > 0 ? `0 0 6px ${b.color}60` : 'none',
                            transition: 'width 0.4s',
                          }} />
                        </div>
                        <span style={{
                          fontFamily: 'Orbitron, sans-serif', fontSize: 8, color: b.count > 0 ? b.color : '#333',
                          width: 24, textAlign: 'right', flexShrink: 0,
                        }}>
                          {b.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Leakiest lessons */}
              {leakiest.length > 0 && (
                <div style={{ background: '#060610', border: '1px solid #111', padding: '14px 16px' }}>
                  <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 6, letterSpacing: '0.2em', color: '#2a2a2a', marginBottom: 10 }}>
                    LEAKIEST_LESSONS — MOST FAILED IN REVIEW
                  </div>
                  {leakiest.map(([id, r]) => (
                    <div key={id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '5px 0', borderBottom: '1px solid #0c0c0c',
                    }}>
                      <span style={{ fontSize: 10, color: '#666', fontFamily: 'Inter, sans-serif' }}>
                        {LESSON_BY_ID[id].title}
                      </span>
                      <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 8, color: '#FF6666', flexShrink: 0, marginLeft: 12 }}>
                        {r.lapses} LAPSE{r.lapses === 1 ? '' : 'S'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ padding: '12px 10px', background: '#080810', border: '1px solid #111' }}>
      <div style={{
        fontFamily: 'Orbitron, sans-serif', fontSize: 16, fontWeight: 900,
        color, lineHeight: 1, textShadow: `0 0 10px ${color}40`,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {value}
      </div>
      <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 6, letterSpacing: '0.18em', color: '#2a2a2a', marginTop: 5 }}>
        {label}
      </div>
    </div>
  );
}
