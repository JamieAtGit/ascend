import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SkillNode } from '../data/nodes';
import { CATEGORY_COLORS, CATEGORY_GLOW } from '../data/nodes';
import { useAscendStore } from '../store/useAscendStore';
import { LESSONS_BY_NODE, TIER_ORDER, TIER_META, lessonTier } from '../data/lessons';
import type { Difficulty, Lesson } from '../data/lessons';
import MasteryExam from './MasteryExam';

interface Props {
  node: SkillNode | null;
  onClose: () => void;
}

const DIFF_COLOR: Record<Difficulty, string> = {
  easy: '#5FFF3D',
  medium: '#FFA333',
  hard: '#FF6666',
};

type Tab = 'info' | 'lessons';

export default function NodePanel({ node, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('info');
  const [showExam, setShowExam] = useState(false);

  const getNodeStatus = useAscendStore((s) => s.getNodeStatus);
  const unlockNode = useAscendStore((s) => s.unlockNode);
  const investXP = useAscendStore((s) => s.investXP);
  const getAvailableXP = useAscendStore((s) => s.getAvailableXP);
  const spentXP = useAscendStore((s) => s.spentXP);
  const completedLessons = useAscendStore((s) => s.completedLessons);
  const setActiveLesson = useAscendStore((s) => s.setActiveLesson);
  const passedExams = useAscendStore((s) => s.passedExams);

  const status = node ? getNodeStatus(node.id) : 'locked';
  const available = getAvailableXP();
  const color = node ? CATEGORY_COLORS[node.category] : '#F0F0F0';
  const glow = node ? CATEGORY_GLOW[node.category] : 'transparent';
  const invested = node ? (spentXP[node.id] ?? 0) : 0;
  const masteryPct = node ? Math.min(invested / node.masteryThreshold, 1) : 0;
  const canAfford = node ? available >= node.xpCost : false;
  const isSynergy = node?.description.startsWith('SYNERGY');

  const lessons = node ? (LESSONS_BY_NODE[node.id] ?? []) : [];
  const completedSet = new Set(completedLessons.map((c) => c.lessonId));
  const lessonsDone = lessons.filter((l) => completedSet.has(l.id)).length;
  const allLessonsDone = lessons.length > 0 && lessonsDone === lessons.length;
  const examPassed = node ? passedExams.includes(node.id) : false;

  // Group lessons by academic tier. If a node's lessons span more than one tier
  // (e.g. Mathematics: Foundation→Degree), render the ladder with tier headers;
  // single-tier nodes render flat, unchanged.
  const tierGroups = TIER_ORDER
    .map((tier) => ({ tier, items: lessons.filter((l) => lessonTier(l) === tier) }))
    .filter((g) => g.items.length > 0);
  const isTiered = tierGroups.length > 1;

  const handleNodeChange = () => setTab('info');

  // One lesson row — reused by both the flat and tier-grouped layouts.
  const renderLessonBtn = (lesson: Lesson, displayNum: number) => {
    const done = completedSet.has(lesson.id);
    const dc = DIFF_COLOR[lesson.difficulty];
    return (
      <motion.button
        key={lesson.id}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={(e) => { e.stopPropagation(); setActiveLesson(lesson.id); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 12px',
          background: done ? `${color}05` : '#08080f',
          border: `1px solid ${done ? color + '20' : '#181820'}`,
          cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = color + '45';
          e.currentTarget.style.background = `${color}0c`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = done ? color + '20' : '#181820';
          e.currentTarget.style.background = done ? `${color}05` : '#08080f';
        }}
      >
        <div style={{
          width: 22, height: 22, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: done ? '#5FFF3D12' : '#0e0e18',
          border: `1px solid ${done ? '#5FFF3D30' : '#1e1e2a'}`,
        }}>
          {done
            ? <span style={{ color: '#5FFF3D', fontSize: 11 }}>✓</span>
            : <span style={{ color: '#333', fontSize: 8, fontFamily: 'Orbitron, sans-serif' }}>{String(displayNum).padStart(2, '0')}</span>}
        </div>
        <span style={{ flex: 1, fontSize: 11, lineHeight: 1.35, color: done ? '#4a4a4a' : '#9090a8', fontFamily: 'Inter, sans-serif' }}>
          {lesson.title}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
          <span style={{ fontSize: 7, color: dc, fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.1em' }}>
            {lesson.difficulty}
          </span>
          <span style={{ fontSize: 8, color: done ? '#2a4a2a' : '#5FFF3D', fontFamily: 'Orbitron, sans-serif', fontWeight: 700 }}>
            +{lesson.xpReward}
          </span>
        </div>
      </motion.button>
    );
  };

  return (
    <AnimatePresence>
      {node && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(1px)',
            }}
          />

          <motion.div
            key={`panel-${node.id}`}
            initial={{ opacity: 0, x: 32, filter: 'blur(6px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 32, filter: 'blur(4px)' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={handleNodeChange}
            style={{
              position: 'fixed',
              right: 'min(28px, 2vw)', top: '50%',
              transform: 'translateY(-50%)',
              width: 'min(340px, calc(100vw - 16px))', zIndex: 60,
              maxHeight: '86vh',
              background: 'rgba(4,4,7,0.99)',
              backdropFilter: 'blur(24px)',
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              boxShadow: `0 0 60px rgba(0,0,0,0.95), 0 0 30px ${glow.replace('0.4', '0.12')}`,
            }}
          >
            {/* Top accent */}
            <div style={{ height: 1.5, background: `linear-gradient(90deg, transparent 0%, ${color} 40%, ${color} 60%, transparent 100%)`, flexShrink: 0 }} />

            {/* Left strip */}
            <div style={{
              position: 'absolute', top: 1.5, left: 0, bottom: 1, width: 1,
              background: `linear-gradient(180deg, ${color}, transparent 50%, ${color})`,
              opacity: 0.5,
            }} />

            {/* Header */}
            <div style={{ padding: '20px 20px 0 22px', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{
                    fontFamily: 'Orbitron, sans-serif', fontSize: 7,
                    letterSpacing: '0.35em', color, opacity: 0.7, marginBottom: 6,
                  }}>
                    {node.category}{isSynergy ? ' // SYNERGY' : ''}
                  </div>
                  <h2 style={{
                    fontFamily: 'Orbitron, sans-serif', fontSize: 16,
                    fontWeight: 900, color: '#F0F0F0',
                    letterSpacing: '0.07em', lineHeight: 1.15,
                    textShadow: `0 0 24px ${color}40`, margin: 0,
                  }}>
                    {node.name}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  style={{ color: '#2e2e2e', fontSize: 16, padding: 4, fontFamily: 'Orbitron, sans-serif', transition: 'color 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#F0F0F0')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#2e2e2e')}
                >
                  ✕
                </button>
              </div>

              {/* Status badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '4px 10px', marginBottom: 16,
                border: `1px solid ${color}25`, background: `${color}06`,
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, boxShadow: `0 0 7px ${color}` }} />
                <span style={{ fontSize: 8, letterSpacing: '0.25em', color, fontFamily: 'Orbitron, sans-serif', fontWeight: 700 }}>
                  {status.toUpperCase()}
                </span>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 1, marginBottom: 0 }}>
                <TabBtn
                  label="INFO"
                  active={tab === 'info'}
                  color={color}
                  onClick={() => setTab('info')}
                />
                <TabBtn
                  label={`LESSONS${lessons.length > 0 ? ` (${lessonsDone}/${lessons.length})` : ''}`}
                  active={tab === 'lessons'}
                  color={color}
                  onClick={() => setTab('lessons')}
                  highlight={lessons.length > 0 && lessonsDone < lessons.length}
                />
              </div>
            </div>

            {/* Divider under tabs */}
            <div style={{ height: 1, background: '#111', flexShrink: 0 }} />

            {/* Tab content — minHeight: 0 required for flex-child scrolling on mobile */}
            <div style={{
              flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 20px 20px 22px',
              WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', overscrollBehavior: 'contain',
            }}>
              <AnimatePresence mode="wait">

                {tab === 'info' && (
                  <motion.div
                    key="info"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <p style={{
                      fontSize: 12, lineHeight: 1.7, color: '#666',
                      marginBottom: 20, fontFamily: 'Inter, sans-serif',
                      letterSpacing: '0.02em',
                    }}>
                      {node.description}
                    </p>

                    <div style={{ height: 1, background: '#111', marginBottom: 18 }} />

                    {/* Stats grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, marginBottom: 20 }}>
                      <DataCell label="UNLOCK_COST" value={`${node.xpCost} XP`} color={color} />
                      <DataCell label="MASTERY_CAP" value={`${node.masteryThreshold} XP`} color={color} />
                      <DataCell label="AVAILABLE" value={`${available} XP`} color={available >= node.xpCost ? '#5FFF3D' : '#FF6666'} />
                      <DataCell label="INVESTED" value={`${invested} XP`} color={color} />
                    </div>

                    {/* Mastery bar */}
                    {(status === 'unlocked' || status === 'mastered') && (
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                          <span style={{ fontSize: 7, letterSpacing: '0.25em', color: '#333', fontFamily: 'Orbitron, sans-serif' }}>
                            MASTERY_PROGRESS
                          </span>
                          <span style={{ fontSize: 7, color, fontFamily: 'Orbitron, sans-serif' }}>
                            {Math.round(masteryPct * 100)}%
                          </span>
                        </div>
                        <div style={{ height: 2, background: '#0e0e0e', overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${masteryPct * 100}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                            style={{
                              height: '100%',
                              background: `linear-gradient(90deg, ${color}60, ${color})`,
                              boxShadow: `0 0 6px ${color}`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Prerequisites */}
                    {node.requiredNodes.length > 0 && (
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 7, letterSpacing: '0.25em', color: '#333', fontFamily: 'Orbitron, sans-serif', marginBottom: 8 }}>
                          REQUIRES
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                          {node.requiredNodes.map((r) => (
                            <span key={r} style={{
                              fontSize: 8, letterSpacing: '0.1em', padding: '3px 8px',
                              border: '1px solid #1a1a1a', color: '#444',
                              fontFamily: 'Orbitron, sans-serif',
                            }}>
                              {r.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    {status === 'available' && (
                      <PanelButton
                        label={canAfford ? '▶ UNLOCK_NODE' : '⚠ INSUFFICIENT_XP'}
                        disabled={!canAfford}
                        color={color}
                        onClick={() => unlockNode(node.id)}
                      />
                    )}
                    {status === 'unlocked' && (
                      <>
                        <PanelButton
                          label={available >= 10 ? '▶ INVEST_XP (+10)' : '⚠ INSUFFICIENT_XP'}
                          disabled={available < 10}
                          color={color}
                          onClick={() => investXP(node.id, 10)}
                        />
                        {masteryPct >= 1 && lessons.length > 0 && !examPassed && (
                          <div style={{
                            marginTop: 8, padding: '8px 12px', textAlign: 'center',
                            border: '1px solid #FFA33330', background: '#FFA33308',
                            color: '#FFA333', fontSize: 7, letterSpacing: '0.18em',
                            fontFamily: 'Orbitron, sans-serif', lineHeight: 1.6,
                          }}>
                            XP THRESHOLD REACHED — PASS THE MASTERY EXAM TO MASTER THIS NODE
                          </div>
                        )}
                      </>
                    )}
                    {status === 'mastered' && (
                      <div style={{
                        textAlign: 'center', padding: '13px',
                        border: `1px solid ${color}30`, color,
                        fontSize: 9, letterSpacing: '0.3em',
                        fontFamily: 'Orbitron, sans-serif',
                        background: `${color}06`,
                        textShadow: `0 0 12px ${color}`,
                      }}>
                        ◆ MASTERED ◆
                      </div>
                    )}

                    {/* Lessons teaser if available */}
                    {lessons.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setTab('lessons')}
                        style={{
                          width: '100%', marginTop: 12,
                          padding: '10px 14px',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: `${color}06`,
                          border: `1px solid ${color}20`,
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `${color}10`;
                          e.currentTarget.style.borderColor = `${color}40`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = `${color}06`;
                          e.currentTarget.style.borderColor = `${color}20`;
                        }}
                      >
                        <span style={{ fontSize: 8, letterSpacing: '0.2em', color, fontFamily: 'Orbitron, sans-serif' }}>
                          ▶ VIEW LESSONS
                        </span>
                        <span style={{ fontSize: 8, color: '#5FFF3D', fontFamily: 'Orbitron, sans-serif', fontWeight: 700 }}>
                          {lessonsDone}/{lessons.length} DONE
                        </span>
                      </motion.button>
                    )}
                  </motion.div>
                )}

                {tab === 'lessons' && (
                  <motion.div
                    key="lessons"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    {lessons.length === 0 ? (
                      <div style={{
                        padding: '32px 0', textAlign: 'center',
                        fontFamily: 'Orbitron, sans-serif', fontSize: 8,
                        letterSpacing: '0.25em', color: '#222',
                      }}>
                        NO_LESSONS_AVAILABLE
                      </div>
                    ) : (
                      <>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          marginBottom: 14,
                        }}>
                          <div style={{ fontSize: 7, letterSpacing: '0.2em', color: '#333', fontFamily: 'Orbitron, sans-serif' }}>
                            {lessonsDone}/{lessons.length} COMPLETE
                          </div>
                          {/* Progress bar */}
                          <div style={{ flex: 1, height: 2, background: '#111', marginLeft: 12, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', background: `linear-gradient(90deg, ${color}60, ${color})`,
                              width: `${lessons.length > 0 ? (lessonsDone / lessons.length) * 100 : 0}%`,
                              transition: 'width 0.4s ease',
                            }} />
                          </div>
                        </div>

                        {isTiered ? (
                          /* Academic ladder: grouped by tier with headers */
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {(() => { let n = 0; return tierGroups.map((g) => {
                              const meta = TIER_META[g.tier];
                              const groupDone = g.items.filter((l) => completedSet.has(l.id)).length;
                              return (
                                <div key={g.tier}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <span style={{
                                      fontFamily: 'Orbitron, sans-serif', fontSize: 8, letterSpacing: '0.2em',
                                      color: meta.color, padding: '2px 7px', border: `1px solid ${meta.color}40`,
                                      background: `${meta.color}0c`,
                                    }}>
                                      {meta.label}
                                    </span>
                                    <span style={{ flex: 1, height: 1, background: `${meta.color}18` }} />
                                    <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 7, color: '#444' }}>
                                      {groupDone}/{g.items.length}
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    {g.items.map((lesson) => { n += 1; return renderLessonBtn(lesson, n); })}
                                  </div>
                                </div>
                              );
                            }); })()}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {lessons.map((lesson, i) => renderLessonBtn(lesson, i + 1))}
                          </div>
                        )}

                        {/* Mastery exam — unlocks when all lessons are done */}
                        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #111' }}>
                          <div style={{ fontSize: 7, letterSpacing: '0.2em', color: '#333', fontFamily: 'Orbitron, sans-serif', marginBottom: 8 }}>
                            MASTERY_EXAM
                          </div>
                          {examPassed ? (
                            <div style={{
                              textAlign: 'center', padding: '10px',
                              border: '1px solid #5FFF3D30', color: '#5FFF3D',
                              fontSize: 8, letterSpacing: '0.25em',
                              fontFamily: 'Orbitron, sans-serif',
                              background: '#5FFF3D08',
                            }}>
                              ✓ EXAM PASSED
                            </div>
                          ) : allLessonsDone ? (
                            <PanelButton
                              label="▶ TAKE MASTERY EXAM"
                              disabled={false}
                              color={color}
                              onClick={() => setShowExam(true)}
                            />
                          ) : (
                            <div style={{
                              padding: '10px 12px',
                              border: '1px solid #151515', color: '#333',
                              fontSize: 8, letterSpacing: '0.12em', lineHeight: 1.7,
                              fontFamily: 'Orbitron, sans-serif',
                            }}>
                              COMPLETE ALL {lessons.length} LESSONS TO UNLOCK · 10 RANDOM QUESTIONS · 80% TO PASS · REQUIRED FOR MASTERY
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Bottom accent */}
            <div style={{ height: 1, background: `linear-gradient(90deg, ${color}25, transparent)`, flexShrink: 0 }} />
          </motion.div>

          {showExam && (
            <MasteryExam node={node} onClose={() => setShowExam(false)} />
          )}
        </>
      )}
    </AnimatePresence>
  );
}

function TabBtn({ label, active, color, onClick, highlight }: {
  label: string; active: boolean; color: string; onClick: () => void; highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: '9px 8px',
        background: active ? `${color}10` : 'transparent',
        border: 'none',
        borderBottom: `2px solid ${active ? color : 'transparent'}`,
        color: active ? color : highlight ? '#666' : '#2e2e2e',
        fontFamily: 'Orbitron, sans-serif', fontSize: 7,
        letterSpacing: '0.2em', cursor: 'pointer',
        transition: 'all 0.18s',
        position: 'relative',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#888'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = highlight ? '#666' : '#2e2e2e'; }}
    >
      {label}
      {highlight && !active && (
        <span style={{
          position: 'absolute', top: 6, right: 8,
          width: 4, height: 4, borderRadius: '50%',
          background: color, boxShadow: `0 0 5px ${color}`,
        }} />
      )}
    </button>
  );
}

function DataCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ padding: '10px 12px', background: '#070709', border: '1px solid #111' }}>
      <div style={{ fontSize: 7, letterSpacing: '0.18em', color: '#2e2e2e', fontFamily: 'Orbitron, sans-serif', marginBottom: 5 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color, fontFamily: 'Orbitron, sans-serif', fontWeight: 700 }}>
        {value}
      </div>
    </div>
  );
}

function PanelButton({ label, disabled, color, onClick }: {
  label: string; disabled: boolean; color: string; onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={!disabled ? onClick : undefined}
      style={{
        width: '100%', padding: '13px',
        border: `1px solid ${disabled ? '#181818' : color + '50'}`,
        background: disabled ? '#060608' : `${color}08`,
        color: disabled ? '#2a2a2a' : color,
        fontFamily: 'Orbitron, sans-serif',
        fontSize: 9, fontWeight: 700, letterSpacing: '0.22em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        boxShadow: !disabled ? `0 0 20px ${color}10` : 'none',
        textShadow: !disabled ? `0 0 8px ${color}60` : 'none',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.boxShadow = `0 0 30px ${color}25`;
          e.currentTarget.style.borderColor = color;
          e.currentTarget.style.background = `${color}12`;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.boxShadow = `0 0 20px ${color}10`;
          e.currentTarget.style.borderColor = `${color}50`;
          e.currentTarget.style.background = `${color}08`;
        }
      }}
    >
      {label}
    </motion.button>
  );
}
