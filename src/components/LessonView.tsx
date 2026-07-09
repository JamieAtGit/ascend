import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAscendStore } from '../store/useAscendStore';
import { LESSONS, TIER_META, lessonTier } from '../data/lessons';
import { shuffleQuestion } from '../lib/shuffleQuiz';

type Phase = 'content' | 'quiz' | 'result';

const DIFF_COLOR = { easy: '#5FFF3D', medium: '#FFA333', hard: '#FF6666' };

export default function LessonView() {
  const activeLesson = useAscendStore((s) => s.activeLesson);
  const setActiveLesson = useAscendStore((s) => s.setActiveLesson);
  const completeLesson = useAscendStore((s) => s.completeLesson);
  const completedLessons = useAscendStore((s) => s.completedLessons);
  const startTimer = useAscendStore((s) => s.startTimer);
  const stopTimer = useAscendStore((s) => s.stopTimer);

  const lesson = LESSONS.find((l) => l.id === activeLesson) ?? null;
  const alreadyDone = lesson ? completedLessons.some((c) => c.lessonId === lesson.id) : false;

  const [phase, setPhase] = useState<Phase>('content');
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [warmupPick, setWarmupPick] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0); // bumped on retry so options reshuffle

  // Options are shuffled (correctIndex remapped) so the answer position isn't
  // predictable. Rebuilt per lesson and per attempt; stable across re-renders.
  const quiz = useMemo(
    () => (lesson ? lesson.quiz.map((q) => shuffleQuestion(q, `${lesson.id}:${attempt}`)) : []),
    [lesson?.id, attempt],
  );
  // Warm-up uses the first question's shuffled form so it matches the later quiz.
  const warmupQ = quiz[0];

  // Auto time-tracking: start a Learning timer when a lesson opens (unless one is
  // already running), stop it when the lesson closes. Time XP accrues automatically.
  const ourTimerStart = useRef<number | null>(null);
  useEffect(() => {
    if (!lesson) return;
    const state = useAscendStore.getState();
    if (!state.activeTimer) {
      startTimer('Learning', `Lesson: ${lesson.title}`);
      ourTimerStart.current = useAscendStore.getState().activeTimer?.startedAt ?? null;
    }
    return () => {
      const s = useAscendStore.getState();
      // Only stop the timer we started (user may have started/stopped their own since)
      if (ourTimerStart.current && s.activeTimer?.startedAt === ourTimerStart.current) {
        stopTimer();
      }
      ourTimerStart.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id]);

  const reset = () => {
    setPhase('content');
    setQIndex(0);
    setAnswers([]);
    setSelected(null);
    setRevealed(false);
    setWarmupPick(null);
    setAttempt((a) => a + 1); // reshuffle options on retry
  };

  const close = () => {
    reset();
    setActiveLesson(null);
  };

  if (!lesson) return null;

  const totalQ = quiz.length;
  const correctCount = quiz.filter((q, i) => answers[i] === q.correctIndex).length;
  const passed = correctCount / totalQ >= 0.6;

  const handleAnswer = (optIndex: number) => {
    if (revealed) return;
    setSelected(optIndex);
    setRevealed(true);
  };

  const handleNext = () => {
    const newAnswers = [...answers, selected ?? -1];
    setAnswers(newAnswers);
    setSelected(null);
    setRevealed(false);
    if (qIndex + 1 >= totalQ) {
      setPhase('result');
    } else {
      setQIndex(qIndex + 1);
    }
  };

  const handleClaim = () => {
    if (!alreadyDone) {
      completeLesson(lesson.id, lesson.nodeId, lesson.xpReward);
    }
    close();
  };

  const q = quiz[qIndex];
  const diffColor = DIFF_COLOR[lesson.difficulty];

  return (
    <AnimatePresence>
      <motion.div
        key="lesson-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.92)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 10,
        }}
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      >
        <motion.div
          key="lesson-panel"
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: '100%', maxWidth: 640,
            maxHeight: '88vh',
            background: 'rgba(4,4,8,0.99)',
            border: '1px solid #1a1a1a',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 0 80px rgba(0,0,0,0.95)',
          }}
        >
          {/* Top accent */}
          <div style={{ height: 1.5, background: `linear-gradient(90deg, transparent, ${diffColor} 40%, ${diffColor} 60%, transparent)`, flexShrink: 0 }} />

          {/* Header */}
          <div style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid #111',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                  {/* Academic tier badge — only shown for tiered (academic) nodes */}
                  {lesson.tier && (
                    <span style={{
                      fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.25em',
                      color: TIER_META[lessonTier(lesson)].color, padding: '3px 8px',
                      border: `1px solid ${TIER_META[lessonTier(lesson)].color}45`,
                      background: `${TIER_META[lessonTier(lesson)].color}0c`,
                    }}>
                      {TIER_META[lessonTier(lesson)].label}
                    </span>
                  )}
                  <span style={{
                    fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.3em',
                    color: diffColor, padding: '3px 8px',
                    border: `1px solid ${diffColor}30`,
                    background: `${diffColor}08`,
                  }}>
                    {lesson.difficulty.toUpperCase()}
                  </span>
                  <span style={{
                    fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.2em',
                    color: '#5FFF3D', opacity: 0.7,
                  }}>
                    {lesson.xpReward} XP REWARD
                  </span>
                  {alreadyDone && (
                    <span style={{
                      fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.2em',
                      color: '#5FFF3D', padding: '3px 8px',
                      border: '1px solid #39FF1430',
                    }}>
                      ✓ COMPLETED
                    </span>
                  )}
                </div>
                <h2 style={{
                  fontFamily: 'Orbitron, sans-serif', fontSize: 16, fontWeight: 900,
                  color: '#F0F0F0', letterSpacing: '0.06em', margin: 0,
                }}>
                  {lesson.title}
                </h2>
              </div>
              <button
                onClick={close}
                style={{
                  color: '#333', fontSize: 16,
                  fontFamily: 'Orbitron, sans-serif', padding: 4,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#EAEAEA')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#333')}
              >
                ✕
              </button>
            </div>

            {/* Phase progress dots */}
            <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
              {(['content', 'quiz', 'result'] as Phase[]).map((p) => (
                <div key={p} style={{
                  height: 2, flex: 1,
                  background: phase === p ? diffColor
                    : (phase === 'result' && p !== 'result') || (phase === 'quiz' && p === 'content')
                      ? `${diffColor}50` : '#1a1a1a',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
          </div>

          {/* Body — minHeight: 0 is required for flex-child scrolling (esp. mobile) */}
          <div style={{
            flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
            overscrollBehavior: 'contain',
          }}>
            <AnimatePresence mode="wait">

              {phase === 'content' && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                >
                  {(lesson as any).whyItMatters && (
                    <div style={{
                      padding: '12px 16px', marginBottom: 20,
                      background: `${diffColor}08`,
                      borderLeft: `2px solid ${diffColor}`,
                    }}>
                      <div style={{
                        fontFamily: 'Orbitron, sans-serif', fontSize: 6,
                        letterSpacing: '0.3em', color: diffColor, marginBottom: 6,
                        opacity: 0.8,
                      }}>
                        WHY THIS MATTERS
                      </div>
                      <p style={{
                        fontSize: 12, lineHeight: 1.7,
                        color: '#999', fontFamily: 'Inter, sans-serif', margin: 0,
                      }}>
                        {(lesson as any).whyItMatters}
                      </p>
                    </div>
                  )}

                  {/* Warm-up prediction — unscored active recall before reading.
                      Guessing first (even wrongly) measurably improves retention. */}
                  {warmupQ && (
                    <div style={{
                      padding: '14px 16px', marginBottom: 22,
                      background: '#08080f', border: '1px solid #1a1a2a',
                    }}>
                      <div style={{
                        fontFamily: 'Orbitron, sans-serif', fontSize: 6,
                        letterSpacing: '0.3em', color: '#8833FF', marginBottom: 8,
                      }}>
                        ⚡ WARM-UP — GUESS BEFORE YOU READ (UNSCORED)
                      </div>
                      <p style={{
                        fontSize: 12, lineHeight: 1.6, color: '#B0B0B0',
                        fontFamily: 'Inter, sans-serif', margin: '0 0 10px', fontWeight: 500,
                      }}>
                        {warmupQ.question}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {warmupQ.options.map((opt, i) => {
                          const picked = warmupPick === i;
                          const isCorrect = i === warmupQ.correctIndex;
                          const revealedWarmup = warmupPick !== null;
                          let color = '#555', border = '#15151f';
                          if (revealedWarmup) {
                            if (isCorrect) { color = '#5FFF3D'; border = '#5FFF3D40'; }
                            else if (picked) { color = '#FF6666'; border = '#FF666640'; }
                          }
                          return (
                            <button
                              key={i}
                              disabled={warmupPick !== null}
                              onClick={() => setWarmupPick(i)}
                              style={{
                                textAlign: 'left', padding: '8px 12px', fontSize: 11,
                                background: 'transparent', border: `1px solid ${border}`,
                                color, fontFamily: 'Inter, sans-serif',
                                cursor: warmupPick === null ? 'pointer' : 'default',
                                transition: 'all 0.15s',
                              }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {warmupPick !== null && (
                        <div style={{
                          marginTop: 10, fontSize: 10, fontFamily: 'Inter, sans-serif',
                          color: warmupPick === warmupQ.correctIndex ? '#5FFF3D' : '#FFA333',
                        }}>
                          {warmupPick === warmupQ.correctIndex
                            ? 'Good instinct — now read to understand why.'
                            : 'Wrong guesses prime memory better than no guess — the answer is below.'}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{
                    fontFamily: 'Orbitron, sans-serif', fontSize: 6,
                    letterSpacing: '0.3em', color: '#3a3a3a', marginBottom: 10,
                  }}>
                    OVERVIEW
                  </div>
                  <p style={{
                    fontSize: 13, lineHeight: 1.8, color: '#8C8C8C',
                    fontFamily: 'Inter, sans-serif', marginBottom: 24,
                  }}>
                    {lesson.explanation}
                  </p>

                  <div style={{ marginBottom: 24 }}>
                    <div style={{
                      fontFamily: 'Orbitron, sans-serif', fontSize: 7,
                      letterSpacing: '0.3em', color: '#333', marginBottom: 14,
                    }}>
                      KEY POINTS
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {lesson.bullets.map((b, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          <div style={{
                            width: 4, height: 4, borderRadius: '50%',
                            background: diffColor, flexShrink: 0, marginTop: 7,
                            boxShadow: `0 0 6px ${diffColor}`,
                          }} />
                          <span style={{
                            fontSize: 12, lineHeight: 1.7,
                            color: '#7A7A7A', fontFamily: 'Inter, sans-serif',
                          }}>
                            {b}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {lesson.example && (
                    <div style={{
                      padding: '14px 16px',
                      background: `${diffColor}06`,
                      border: `1px solid ${diffColor}20`,
                      marginBottom: 24,
                    }}>
                      <div style={{
                        fontFamily: 'Orbitron, sans-serif', fontSize: 7,
                        letterSpacing: '0.3em', color: diffColor, marginBottom: 8,
                        opacity: 0.7,
                      }}>
                        EXAMPLE
                      </div>
                      <p style={{
                        fontSize: 12, lineHeight: 1.7,
                        color: '#8C8C8C', fontFamily: 'Inter, sans-serif', margin: 0,
                        fontStyle: 'italic',
                      }}>
                        {lesson.example}
                      </p>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPhase('quiz')}
                    style={{
                      width: '100%', padding: '14px',
                      background: `${diffColor}10`,
                      border: `1px solid ${diffColor}50`,
                      color: diffColor, fontFamily: 'Orbitron, sans-serif',
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.25em',
                      cursor: 'pointer',
                      boxShadow: `0 0 20px ${diffColor}12`,
                      textShadow: `0 0 8px ${diffColor}60`,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${diffColor}18`;
                      e.currentTarget.style.boxShadow = `0 0 30px ${diffColor}25`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `${diffColor}10`;
                      e.currentTarget.style.boxShadow = `0 0 20px ${diffColor}12`;
                    }}
                  >
                    ▶ BEGIN ASSESSMENT
                  </motion.button>
                </motion.div>
              )}

              {phase === 'quiz' && (
                <motion.div
                  key={`quiz-${qIndex}`}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                >
                  <div style={{
                    fontFamily: 'Orbitron, sans-serif', fontSize: 7,
                    letterSpacing: '0.25em', color: '#333', marginBottom: 20,
                  }}>
                    QUESTION {qIndex + 1} / {totalQ}
                  </div>

                  <p style={{
                    fontSize: 14, lineHeight: 1.6, color: '#F0F0F0',
                    fontFamily: 'Inter, sans-serif', marginBottom: 24, fontWeight: 500,
                  }}>
                    {q.question}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                    {q.options.map((opt, i) => {
                      const isSelected = selected === i;
                      const isCorrect = i === q.correctIndex;
                      let bg = '#0a0a0e';
                      let borderColor = '#1e1e1e';
                      let textColor = '#666';
                      if (revealed) {
                        if (isCorrect) { bg = 'rgba(95,255,61,0.08)'; borderColor = '#5FFF3D50'; textColor = '#5FFF3D'; }
                        else if (isSelected) { bg = 'rgba(255,102,102,0.08)'; borderColor = '#FF666650'; textColor = '#FF6666'; }
                      } else if (isSelected) {
                        bg = `${diffColor}10`; borderColor = `${diffColor}50`; textColor = diffColor;
                      }
                      return (
                        <motion.button
                          key={i}
                          whileHover={!revealed ? { scale: 1.01 } : {}}
                          whileTap={!revealed ? { scale: 0.99 } : {}}
                          onClick={() => handleAnswer(i)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '12px 14px',
                            background: bg, border: `1px solid ${borderColor}`,
                            cursor: revealed ? 'default' : 'pointer',
                            transition: 'all 0.18s', textAlign: 'left',
                          }}
                        >
                          <span style={{
                            width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'Orbitron, sans-serif', fontSize: 8,
                            border: `1px solid ${borderColor}`,
                            color: textColor, flexShrink: 0,
                          }}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span style={{
                            fontSize: 12, lineHeight: 1.5,
                            color: textColor, fontFamily: 'Inter, sans-serif',
                          }}>
                            {opt}
                          </span>
                          {revealed && isCorrect && (
                            <span style={{ marginLeft: 'auto', color: '#5FFF3D', fontSize: 12 }}>✓</span>
                          )}
                          {revealed && isSelected && !isCorrect && (
                            <span style={{ marginLeft: 'auto', color: '#FF6666', fontSize: 12 }}>✗</span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Answer feedback — why the correct answer is correct */}
                  {revealed && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: '12px 16px', marginBottom: 16,
                        background: selected === q.correctIndex ? 'rgba(95,255,61,0.05)' : 'rgba(255,102,102,0.05)',
                        borderLeft: `2px solid ${selected === q.correctIndex ? '#5FFF3D' : '#FF6666'}`,
                      }}
                    >
                      <div style={{
                        fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.25em',
                        color: selected === q.correctIndex ? '#5FFF3D' : '#FF6666', marginBottom: 6,
                      }}>
                        {selected === q.correctIndex ? '✓ CORRECT' : '✗ NOT QUITE'}
                      </div>
                      <p style={{ fontSize: 11, lineHeight: 1.7, color: '#999', fontFamily: 'Inter, sans-serif', margin: 0 }}>
                        {selected !== q.correctIndex && (
                          <>The answer is <span style={{ color: '#5FFF3D' }}>{q.options[q.correctIndex]}</span>.{' '}</>
                        )}
                        {q.why ?? (selected !== q.correctIndex
                          ? 'Re-check the key points above — this one is covered there.'
                          : '')}
                      </p>
                    </motion.div>
                  )}

                  {revealed && (
                    <motion.button
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleNext}
                      style={{
                        width: '100%', padding: '13px',
                        background: `${diffColor}10`,
                        border: `1px solid ${diffColor}50`,
                        color: diffColor, fontFamily: 'Orbitron, sans-serif',
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.22em',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      {qIndex + 1 >= totalQ ? '▶ VIEW RESULTS' : '▶ NEXT QUESTION'}
                    </motion.button>
                  )}
                </motion.div>
              )}

              {phase === 'result' && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{
                    fontSize: 52, fontWeight: 900, fontFamily: 'Orbitron, sans-serif',
                    color: passed ? '#5FFF3D' : '#FF6666',
                    textShadow: `0 0 30px ${passed ? 'rgba(95,255,61,0.5)' : 'rgba(255,102,102,0.5)'}`,
                    marginBottom: 12,
                  }}>
                    {correctCount}/{totalQ}
                  </div>
                  <div style={{
                    fontFamily: 'Orbitron, sans-serif', fontSize: 9,
                    letterSpacing: '0.3em',
                    color: passed ? '#5FFF3D' : '#FF6666',
                    marginBottom: 24,
                  }}>
                    {passed ? '◆ ASSESSMENT PASSED' : '✗ ASSESSMENT FAILED — RETRY TO PASS'}
                  </div>

                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: 8,
                    marginBottom: 28, textAlign: 'left',
                  }}>
                    {quiz.map((q, i) => {
                      const correct = answers[i] === q.correctIndex;
                      return (
                        <div key={i} style={{
                          padding: '10px 14px',
                          background: correct ? 'rgba(95,255,61,0.04)' : 'rgba(255,102,102,0.04)',
                          border: `1px solid ${correct ? '#39FF1420' : '#FF444420'}`,
                          display: 'flex', alignItems: 'flex-start', gap: 10,
                        }}>
                          <span style={{ color: correct ? '#5FFF3D' : '#FF6666', fontSize: 12, flexShrink: 0 }}>
                            {correct ? '✓' : '✗'}
                          </span>
                          <div>
                            <div style={{ fontSize: 11, color: '#7A7A7A', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
                              {q.question}
                            </div>
                            {!correct && (
                              <div style={{ fontSize: 10, color: '#5FFF3D', marginTop: 3, fontFamily: 'Inter, sans-serif' }}>
                                Correct: {q.options[q.correctIndex]}
                              </div>
                            )}
                            {!correct && q.why && (
                              <div style={{ fontSize: 10, color: '#666', marginTop: 3, fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
                                {q.why}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {!passed && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={reset}
                        style={{
                          flex: 1, padding: '13px',
                          background: 'rgba(255,102,102,0.08)',
                          border: '1px solid rgba(255,102,102,0.35)',
                          color: '#FF6666', fontFamily: 'Orbitron, sans-serif',
                          fontSize: 9, fontWeight: 700, letterSpacing: '0.22em',
                          cursor: 'pointer',
                        }}
                      >
                        ↺ RETRY
                      </motion.button>
                    )}
                    {passed && !alreadyDone && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleClaim}
                        style={{
                          flex: 1, padding: '13px',
                          background: 'rgba(95,255,61,0.1)',
                          border: '1px solid rgba(95,255,61,0.5)',
                          color: '#5FFF3D', fontFamily: 'Orbitron, sans-serif',
                          fontSize: 9, fontWeight: 700, letterSpacing: '0.22em',
                          cursor: 'pointer',
                          textShadow: '0 0 8px rgba(95,255,61,0.6)',
                        }}
                      >
                        ◆ CLAIM {lesson.xpReward} XP
                      </motion.button>
                    )}
                    {(passed && alreadyDone) && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={close}
                        style={{
                          flex: 1, padding: '13px',
                          background: 'rgba(95,255,61,0.06)',
                          border: '1px solid rgba(95,255,61,0.25)',
                          color: '#5FFF3D', fontFamily: 'Orbitron, sans-serif',
                          fontSize: 9, letterSpacing: '0.22em',
                          cursor: 'pointer', opacity: 0.6,
                        }}
                      >
                        ✓ ALREADY CLAIMED — CLOSE
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={close}
                      style={{
                        padding: '13px 18px',
                        background: '#0a0a0e',
                        border: '1px solid #1e1e1e',
                        color: '#444', fontFamily: 'Orbitron, sans-serif',
                        fontSize: 9, letterSpacing: '0.22em',
                        cursor: 'pointer',
                      }}
                    >
                      CLOSE
                    </motion.button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
