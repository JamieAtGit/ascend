import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAscendStore } from '../store/useAscendStore';
import {
  SKILL_SPRINTS, SPRINT_CATEGORIES, CATEGORY_COLOR,
  type SkillSprint, type SprintCategory, type SprintStep,
} from '../data/skillSprints';

// ─── Helpers ────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ─── Step Timer ─────────────────────────────────────────────────

function StepTimer({ durationMinutes, onDone }: { durationMinutes: number; onDone: () => void }) {
  const total = durationMinutes * 60;
  const [remaining, setRemaining] = useState(total);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) { clearInterval(intervalRef.current!); setRunning(false); onDone(); return 0; }
          return r - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const pct = ((total - remaining) / total) * 100;
  const color = remaining < 60 ? '#FF6666' : remaining < total * 0.3 ? '#FFA333' : '#33F3FF';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', width: 56, height: 56 }}>
        <svg width={56} height={56} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={28} cy={28} r={22} fill="none" stroke="#111" strokeWidth={4} />
          <circle
            cx={28} cy={28} r={22} fill="none"
            stroke={color} strokeWidth={4}
            strokeDasharray={`${2 * Math.PI * 22}`}
            strokeDashoffset={`${2 * Math.PI * 22 * (1 - pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
          />
        </svg>
        <span style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Orbitron, sans-serif', fontSize: 9, color,
        }}>
          {formatTime(remaining)}
        </span>
      </div>
      <button
        onClick={() => { if (remaining === 0) { setRemaining(total); setRunning(false); } else setRunning((r) => !r); }}
        style={{
          padding: '6px 14px', border: `1px solid ${color}`, background: 'transparent',
          color, fontFamily: 'Orbitron, sans-serif', fontSize: 9, letterSpacing: '0.15em',
          cursor: 'pointer', borderRadius: 2,
        }}
      >
        {remaining === 0 ? 'RESET' : running ? 'PAUSE' : remaining === total ? 'START' : 'RESUME'}
      </button>
    </div>
  );
}

// ─── Focus Mode ─────────────────────────────────────────────────

function FocusMode({
  sprint, step, stepIndex, totalSteps, onNext, onExit,
}: {
  sprint: SkillSprint; step: SprintStep; stepIndex: number;
  totalSteps: number; onNext: () => void; onExit: () => void;
}) {
  const [timerDone, setTimerDone] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: '#010108',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      {/* Exit */}
      <button onClick={onExit} style={{
        position: 'absolute', top: 20, right: 24,
        background: 'transparent', border: '1px solid #1a1a1a', color: '#444',
        fontFamily: 'Orbitron, sans-serif', fontSize: 9, letterSpacing: '0.15em',
        padding: '6px 14px', cursor: 'pointer', borderRadius: 2,
      }}>
        EXIT FOCUS
      </button>

      {/* Step indicator */}
      <div style={{ marginBottom: 32, display: 'flex', gap: 6 }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} style={{
            width: i === stepIndex ? 20 : 6, height: 6, borderRadius: 3,
            background: i < stepIndex ? sprint.color : i === stepIndex ? sprint.color : '#1a1a1a',
            transition: 'all 0.3s',
            boxShadow: i === stepIndex ? `0 0 8px ${sprint.color}` : undefined,
          }} />
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 660, width: '100%', textAlign: 'center' }}>
        <div style={{
          fontFamily: 'Orbitron, sans-serif', fontSize: 9, letterSpacing: '0.2em',
          color: sprint.color, marginBottom: 12,
        }}>
          STEP {stepIndex + 1} OF {totalSteps} · {step.duration} MIN
        </div>

        <h2 style={{
          fontFamily: 'Orbitron, sans-serif', fontSize: 20, color: '#F0F0F0',
          margin: '0 0 28px', lineHeight: 1.3,
        }}>
          {step.title}
        </h2>

        <p style={{
          color: '#A0A0A0', fontSize: 15, lineHeight: 1.8, marginBottom: 24, textAlign: 'left',
        }}>
          {step.instruction}
        </p>

        {step.actionPrompt && (
          <div style={{
            background: `${sprint.color}0D`, border: `1px solid ${sprint.color}33`,
            borderRadius: 4, padding: '14px 18px', marginBottom: 24, textAlign: 'left',
          }}>
            <div style={{
              fontFamily: 'Orbitron, sans-serif', fontSize: 8, letterSpacing: '0.2em',
              color: sprint.color, marginBottom: 6,
            }}>ACTION</div>
            <p style={{ color: '#D0D0D0', fontSize: 13, margin: 0, lineHeight: 1.7 }}>
              {step.actionPrompt}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <StepTimer durationMinutes={step.duration} onDone={() => setTimerDone(true)} />
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            style={{
              padding: '10px 28px',
              background: timerDone ? sprint.color : 'transparent',
              border: `1px solid ${sprint.color}`,
              color: timerDone ? '#000' : sprint.color,
              fontFamily: 'Orbitron, sans-serif', fontSize: 10, letterSpacing: '0.15em',
              cursor: 'pointer', borderRadius: 2, transition: 'all 0.2s',
            }}
          >
            {stepIndex + 1 >= totalSteps ? 'COMPLETE SPRINT' : 'NEXT STEP →'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Sprint Plan View ────────────────────────────────────────────

function SprintPlanView({
  sprint, onBack,
}: {
  sprint: SkillSprint; onBack: () => void;
}) {
  const completeSprintStep = useAscendStore((s) => s.completeSprintStep);
  const completeSprint = useAscendStore((s) => s.completeSprint);
  const clearSprintProgress = useAscendStore((s) => s.clearSprintProgress);
  const sprintProgress = useAscendStore((s) => s.sprintProgress);
  const completedSprints = useAscendStore((s) => s.completedSprints);

  const completedSteps = sprintProgress[sprint.id] ?? [];
  const isCompleted = completedSprints.includes(sprint.id);
  const progressPct = Math.round((completedSteps.length / sprint.steps.length) * 100);

  const [focusStep, setFocusStep] = useState<number | null>(null);
  const [showComplete, setShowComplete] = useState(false);

  const handleStepToggle = (stepId: string) => {
    completeSprintStep(sprint.id, stepId);
  };

  const handleFocusNext = () => {
    if (focusStep === null) return;
    const step = sprint.steps[focusStep];
    completeSprintStep(sprint.id, step.id);

    if (focusStep + 1 >= sprint.steps.length) {
      setFocusStep(null);
      if (!isCompleted) {
        completeSprint(sprint.id, sprint.xpReward);
        setShowComplete(true);
      }
    } else {
      setFocusStep(focusStep + 1);
    }
  };

  const handleCheckAllDone = () => {
    if (completedSteps.length >= sprint.steps.length && !isCompleted) {
      completeSprint(sprint.id, sprint.xpReward);
      setShowComplete(true);
    }
  };

  useEffect(() => {
    if (!isCompleted && completedSteps.length >= sprint.steps.length) {
      handleCheckAllDone();
    }
  }, [completedSteps.length]);

  return (
    <>
      <AnimatePresence>
        {focusStep !== null && (
          <FocusMode
            sprint={sprint}
            step={sprint.steps[focusStep]}
            stepIndex={focusStep}
            totalSteps={sprint.steps.length}
            onNext={handleFocusNext}
            onExit={() => setFocusStep(null)}
          />
        )}
      </AnimatePresence>

      <div style={{ maxWidth: 740, margin: '0 auto', padding: '0 0 100px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <button onClick={onBack} style={{
            background: 'transparent', border: 'none', color: '#444',
            fontFamily: 'Orbitron, sans-serif', fontSize: 8, letterSpacing: '0.2em',
            cursor: 'pointer', padding: 0, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            ← ALL SKILLS
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{
                fontFamily: 'Orbitron, sans-serif', fontSize: 8, letterSpacing: '0.2em',
                color: sprint.color, marginBottom: 8,
              }}>
                {sprint.category.toUpperCase()} · {sprint.totalMinutes} MIN · {sprint.difficulty.toUpperCase()}
              </div>
              <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 22, color: '#F0F0F0', margin: '0 0 6px' }}>
                {sprint.title}
              </h1>
              <p style={{ color: '#666', fontSize: 13, margin: 0 }}>{sprint.tagline}</p>
            </div>
            <div style={{
              background: `${sprint.color}15`, border: `1px solid ${sprint.color}33`,
              borderRadius: 4, padding: '10px 18px', textAlign: 'center', minWidth: 80, flexShrink: 0,
            }}>
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 16, color: sprint.color }}>{sprint.xpReward}</div>
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.15em', color: '#444', marginTop: 2 }}>XP</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 8, letterSpacing: '0.15em', color: '#444' }}>
                PROGRESS
              </span>
              <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 8, letterSpacing: '0.15em', color: sprint.color }}>
                {progressPct}%
              </span>
            </div>
            <div style={{ height: 4, background: '#0a0a0a', borderRadius: 2, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5 }}
                style={{ height: '100%', background: sprint.color, borderRadius: 2, boxShadow: `0 0 8px ${sprint.color}` }}
              />
            </div>
          </div>
        </div>

        {/* Focus Mode Start */}
        {!isCompleted && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              const firstIncomplete = sprint.steps.findIndex(s => !completedSteps.includes(s.id));
              setFocusStep(firstIncomplete >= 0 ? firstIncomplete : 0);
            }}
            style={{
              width: '100%', padding: '14px 0', marginBottom: 28,
              background: `${sprint.color}15`, border: `1px solid ${sprint.color}55`,
              color: sprint.color, fontFamily: 'Orbitron, sans-serif', fontSize: 10,
              letterSpacing: '0.2em', cursor: 'pointer', borderRadius: 3,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            <span style={{ fontSize: 14 }}>◉</span>
            {completedSteps.length > 0 ? 'CONTINUE IN FOCUS MODE' : 'START FOCUS MODE'}
          </motion.button>
        )}

        {/* Completion banner */}
        <AnimatePresence>
          {(isCompleted || showComplete) && (
            <motion.div
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
              style={{
                background: `${sprint.color}15`, border: `1px solid ${sprint.color}55`,
                borderRadius: 4, padding: '16px 20px', marginBottom: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{
                  fontFamily: 'Orbitron, sans-serif', fontSize: 10, letterSpacing: '0.15em',
                  color: sprint.color, marginBottom: 4,
                }}>
                  SPRINT COMPLETE — +{sprint.xpReward} XP AWARDED
                </div>
                <p style={{ color: '#888', fontSize: 12, margin: 0 }}>
                  You can revisit any step below as a reference.
                </p>
              </div>
              <span style={{ fontSize: 24, color: sprint.color }}>✓</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sprint.steps.map((step, index) => (
            <StepItem
              key={step.id}
              step={step}
              index={index}
              color={sprint.color}
              done={completedSteps.includes(step.id)}
              onToggle={() => handleStepToggle(step.id)}
              onFocus={() => setFocusStep(index)}
            />
          ))}
        </div>

        {/* Reset */}
        {!isCompleted && completedSteps.length > 0 && (
          <button
            onClick={() => clearSprintProgress(sprint.id)}
            style={{
              marginTop: 24, background: 'transparent', border: '1px solid #1a1a1a',
              color: '#333', fontFamily: 'Orbitron, sans-serif', fontSize: 8,
              letterSpacing: '0.15em', padding: '8px 16px', cursor: 'pointer', borderRadius: 2,
            }}
          >
            RESET PROGRESS
          </button>
        )}
      </div>
    </>
  );
}

// ─── Step Item ───────────────────────────────────────────────────

function StepItem({ step, index, color, done, onToggle, onFocus }: {
  step: SprintStep; index: number; color: string;
  done: boolean; onToggle: () => void; onFocus: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{
        background: done ? `${color}08` : '#06060E',
        border: `1px solid ${done ? color + '33' : '#0e0e1a'}`,
        borderRadius: 3, overflow: 'hidden',
      }}
    >
      {/* Step header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Checkbox */}
        <div
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          style={{
            width: 20, height: 20, borderRadius: 2, flexShrink: 0,
            border: `1.5px solid ${done ? color : '#222'}`,
            background: done ? color : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: done ? `0 0 8px ${color}66` : undefined,
          }}
        >
          {done && <span style={{ fontSize: 10, color: '#000', fontWeight: 700 }}>✓</span>}
        </div>

        {/* Step number */}
        <div style={{
          fontFamily: 'Orbitron, sans-serif', fontSize: 9, color: '#333',
          minWidth: 18, textAlign: 'center',
        }}>
          {index + 1}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color: done ? '#888' : '#D0D0D0', fontSize: 13,
            textDecoration: done ? 'line-through' : 'none',
          }}>
            {step.title}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{
            fontFamily: 'Orbitron, sans-serif', fontSize: 8, color: '#333',
            letterSpacing: '0.1em',
          }}>
            {step.duration}m
          </span>
          <span style={{ color: '#333', fontSize: 10 }}>
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 16px 16px 52px', borderTop: '1px solid #0e0e1a' }}>
              <p style={{ color: '#888', fontSize: 13, lineHeight: 1.8, margin: '14px 0 12px' }}>
                {step.instruction}
              </p>
              {step.tip && (
                <div style={{
                  background: '#08080f', border: '1px solid #151515',
                  borderRadius: 3, padding: '10px 14px', marginBottom: 10,
                }}>
                  <span style={{
                    fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.15em',
                    color: '#555',
                  }}>
                    TIP:{' '}
                  </span>
                  <span style={{ color: '#666', fontSize: 12 }}>{step.tip}</span>
                </div>
              )}
              {step.actionPrompt && (
                <div style={{
                  background: `${color}0A`, border: `1px solid ${color}22`,
                  borderRadius: 3, padding: '10px 14px',
                }}>
                  <div style={{
                    fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.15em',
                    color, marginBottom: 4,
                  }}>
                    ACTION
                  </div>
                  <p style={{ color: '#B0B0B0', fontSize: 12, margin: 0, lineHeight: 1.7 }}>
                    {step.actionPrompt}
                  </p>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  onClick={onFocus}
                  style={{
                    padding: '6px 14px', border: `1px solid ${color}44`,
                    background: 'transparent', color,
                    fontFamily: 'Orbitron, sans-serif', fontSize: 8, letterSpacing: '0.12em',
                    cursor: 'pointer', borderRadius: 2,
                  }}
                >
                  FOCUS MODE
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Sprint Home ─────────────────────────────────────────────────

function SprintHome({ onSelect }: { onSelect: (s: SkillSprint) => void }) {
  const [activeCategory, setActiveCategory] = useState<SprintCategory | 'All'>('All');
  const [search, setSearch] = useState('');
  const completedSprints = useAscendStore((s) => s.completedSprints);
  const sprintProgress = useAscendStore((s) => s.sprintProgress);

  const filtered = SKILL_SPRINTS.filter((s) => {
    const catMatch = activeCategory === 'All' || s.category === activeCategory;
    const searchMatch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 0 100px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontFamily: 'Orbitron, sans-serif', fontSize: 8, letterSpacing: '0.25em',
          color: '#8833FF', marginBottom: 8,
        }}>
          SKILL SPRINT
        </div>
        <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 24, color: '#F0F0F0', margin: '0 0 8px' }}>
          Learn Any Skill in 2 Hours
        </h1>
        <p style={{ color: '#555', fontSize: 13, margin: 0 }}>
          Structured sessions for real improvement. Start within 10 seconds.
        </p>
      </div>

      {/* Stats strip */}
      <div style={{
        display: 'flex', gap: 2, marginBottom: 28,
      }}>
        {[
          { label: 'SPRINTS', value: SKILL_SPRINTS.length.toString() },
          { label: 'COMPLETED', value: completedSprints.length.toString() },
          { label: 'IN PROGRESS', value: Object.keys(sprintProgress).filter(id => !completedSprints.includes(id) && (sprintProgress[id]?.length ?? 0) > 0).length.toString() },
        ].map((stat) => (
          <div key={stat.label} style={{
            flex: 1, padding: '12px 16px',
            background: '#06060E', border: '1px solid #0e0e1a', borderRadius: 3,
          }}>
            <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 16, color: '#D0D0D0' }}>{stat.value}</div>
            <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.15em', color: '#333', marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search skills..."
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '10px 14px', background: '#06060E',
          border: '1px solid #0e0e1a', borderRadius: 3,
          color: '#D0D0D0', fontSize: 13, fontFamily: 'Inter, sans-serif',
          outline: 'none', marginBottom: 16,
        }}
      />

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
        {(['All', ...SPRINT_CATEGORIES] as const).map((cat) => {
          const active = activeCategory === cat;
          const color = cat === 'All' ? '#555' : CATEGORY_COLOR[cat];
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '5px 12px',
                background: active ? `${color}20` : 'transparent',
                border: `1px solid ${active ? color : '#111'}`,
                color: active ? color : '#444',
                fontFamily: 'Orbitron, sans-serif', fontSize: 8, letterSpacing: '0.12em',
                cursor: 'pointer', borderRadius: 2, transition: 'all 0.15s',
              }}
            >
              {cat.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
        gap: 8,
      }}>
        {filtered.map((sprint) => {
          const done = completedSprints.includes(sprint.id);
          const stepsCompleted = sprintProgress[sprint.id]?.length ?? 0;
          const inProgress = !done && stepsCompleted > 0;
          const pct = Math.round((stepsCompleted / sprint.steps.length) * 100);

          return (
            <motion.div
              key={sprint.id}
              whileHover={{ y: -2, borderColor: sprint.color + '44' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(sprint)}
              style={{
                background: '#06060E',
                border: `1px solid ${done ? sprint.color + '33' : '#0e0e1a'}`,
                borderRadius: 4, padding: '18px 16px',
                cursor: 'pointer', transition: 'all 0.15s',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Glow for completed */}
              {done && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                  background: `linear-gradient(90deg, transparent, ${sprint.color}66, transparent)`,
                }} />
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 20, lineHeight: 1 }}>{sprint.icon}</span>
                {done ? (
                  <span style={{
                    fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.12em',
                    color: sprint.color, background: `${sprint.color}15`,
                    border: `1px solid ${sprint.color}33`, padding: '2px 7px', borderRadius: 2,
                  }}>DONE</span>
                ) : inProgress ? (
                  <span style={{
                    fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.12em',
                    color: '#FFA333', background: '#FFA33315',
                    border: '1px solid #FFA33333', padding: '2px 7px', borderRadius: 2,
                  }}>{pct}%</span>
                ) : null}
              </div>

              <div style={{
                fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.15em',
                color: CATEGORY_COLOR[sprint.category], marginBottom: 6,
              }}>
                {sprint.category.toUpperCase()}
              </div>

              <div style={{ color: '#D0D0D0', fontSize: 13, fontWeight: 500, marginBottom: 4, lineHeight: 1.3 }}>
                {sprint.title}
              </div>
              <div style={{ color: '#444', fontSize: 11, marginBottom: 12 }}>{sprint.tagline}</div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 7, color: '#333' }}>
                    {sprint.totalMinutes}MIN
                  </span>
                  <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 7, color: '#333' }}>
                    {sprint.steps.length} STEPS
                  </span>
                </div>
                <span style={{
                  fontFamily: 'Orbitron, sans-serif', fontSize: 8, color: sprint.color,
                }}>
                  +{sprint.xpReward} XP
                </span>
              </div>

              {inProgress && (
                <div style={{ marginTop: 10, height: 2, background: '#0a0a0a', borderRadius: 1, overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`, height: '100%',
                    background: sprint.color, borderRadius: 1,
                  }} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#333' }}>
          <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 10, marginBottom: 8 }}>NO RESULTS</div>
          <div style={{ fontSize: 12 }}>Try a different search or category</div>
        </div>
      )}
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────

export default function SkillSprint() {
  const overlay = useAscendStore((s) => s.overlay);
  const [selectedSprint, setSelectedSprint] = useState<SkillSprint | null>(null);

  const isOpen = overlay === 'sprint';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="sprint-overlay"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: '#03030A',
            overflowY: 'auto',
            padding: '28px 20px 0',
          }}
        >
          {selectedSprint ? (
            <SprintPlanView sprint={selectedSprint} onBack={() => setSelectedSprint(null)} />
          ) : (
            <SprintHome onSelect={setSelectedSprint} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
