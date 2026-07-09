import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAscendStore, computeDueLessons, REVIEW_INTERVALS_DAYS } from '../store/useAscendStore';
import { LESSON_BY_ID } from '../data/lessons';
import type { Lesson } from '../data/lessons';
import { NODES, CATEGORY_COLORS } from '../data/nodes';
import { shuffleQuestion } from '../lib/shuffleQuiz';

function nodeColor(nodeId: string): string {
  const node = NODES.find((n) => n.id === nodeId);
  return node ? CATEGORY_COLORS[node.category] : '#8833FF';
}

function nodeName(nodeId: string): string {
  return NODES.find((n) => n.id === nodeId)?.name ?? nodeId;
}

// Quiz session for one lesson: all questions answered from memory, then graded.
function ReviewSession({ lesson, onDone }: { lesson: Lesson; onDone: (allCorrect: boolean) => void }) {
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  // Options shuffled so the answer position isn't predictable; stable per review.
  const quiz = useMemo(
    () => lesson.quiz.map((q, i) => shuffleQuestion(q, `review:${lesson.id}:${i}`)),
    [lesson.id],
  );

  const color = nodeColor(lesson.nodeId);
  const question = quiz[qIndex];
  const isLast = qIndex === quiz.length - 1;

  const handleConfirm = () => {
    if (selected === null) return;
    setRevealed(true);
  };

  const handleNext = () => {
    const newAnswers = [...answers, selected!];
    if (isLast) {
      const allCorrect = newAnswers.every((a, i) => a === quiz[i].correctIndex);
      onDone(allCorrect);
    } else {
      setAnswers(newAnswers);
      setSelected(null);
      setRevealed(false);
      setQIndex(qIndex + 1);
    }
  };

  return (
    <div>
      <div style={{
        fontFamily: 'Orbitron, sans-serif', fontSize: 8, letterSpacing: '0.2em',
        color, marginBottom: 6,
      }}>
        {nodeName(lesson.nodeId)} · QUESTION {qIndex + 1} / {lesson.quiz.length}
      </div>
      <h2 style={{
        fontFamily: 'Orbitron, sans-serif', fontSize: 15, color: '#F0F0F0',
        margin: '0 0 20px', lineHeight: 1.4,
      }}>
        {question.question}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {question.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === question.correctIndex;
          let border = '#151525';
          let bg = '#06060E';
          let textColor = '#999';
          if (revealed) {
            if (isCorrect) { border = '#5FFF3D'; bg = '#5FFF3D10'; textColor = '#5FFF3D'; }
            else if (isSelected) { border = '#FF6666'; bg = '#FF666610'; textColor = '#FF6666'; }
          } else if (isSelected) {
            border = color; bg = `${color}10`; textColor = '#F0F0F0';
          }
          return (
            <button
              key={i}
              disabled={revealed}
              onClick={() => setSelected(i)}
              style={{
                textAlign: 'left', padding: '12px 16px',
                background: bg, border: `1px solid ${border}`,
                color: textColor, fontSize: 13, fontFamily: 'Inter, sans-serif',
                cursor: revealed ? 'default' : 'pointer', borderRadius: 3,
                transition: 'all 0.15s', lineHeight: 1.5,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Why explanation after reveal */}
      {revealed && question.why && (
        <div style={{
          marginTop: 14, padding: '10px 14px',
          background: '#08080f', borderLeft: `2px solid ${color}`,
          fontSize: 11, lineHeight: 1.7, color: '#999', fontFamily: 'Inter, sans-serif',
        }}>
          {question.why}
        </div>
      )}

      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
        {!revealed ? (
          <button
            onClick={handleConfirm}
            disabled={selected === null}
            style={{
              padding: '10px 28px',
              background: selected !== null ? `${color}15` : 'transparent',
              border: `1px solid ${selected !== null ? color : '#222'}`,
              color: selected !== null ? color : '#333',
              fontFamily: 'Orbitron, sans-serif', fontSize: 10, letterSpacing: '0.15em',
              cursor: selected !== null ? 'pointer' : 'default', borderRadius: 2,
            }}
          >
            CONFIRM
          </button>
        ) : (
          <button
            onClick={handleNext}
            style={{
              padding: '10px 28px',
              background: `${color}15`, border: `1px solid ${color}`,
              color, fontFamily: 'Orbitron, sans-serif', fontSize: 10, letterSpacing: '0.15em',
              cursor: 'pointer', borderRadius: 2,
            }}
          >
            {isLast ? 'FINISH' : 'NEXT →'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ReviewQueue() {
  const overlay = useAscendStore((s) => s.overlay);
  const completedLessons = useAscendStore((s) => s.completedLessons);
  const reviewStates = useAscendStore((s) => s.reviewStates);
  const recordReview = useAscendStore((s) => s.recordReview);

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ lessonId: string; pass: boolean; xp: number } | null>(null);

  // Mirrors recordReview's reward: next pass pays 5 + current stage × 2, capped at 13
  const nextPassXP = (lessonId: string) =>
    Math.min(5 + (reviewStates[lessonId]?.stage ?? 0) * 2, 13);

  const isOpen = overlay === 'review';

  const dueLessonIds = useMemo(
    () => (isOpen ? computeDueLessons(completedLessons, reviewStates).filter((id) => LESSON_BY_ID[id]) : []),
    [isOpen, completedLessons, reviewStates]
  );

  const activeLesson = activeLessonId ? LESSON_BY_ID[activeLessonId] : null;

  const handleSessionDone = (allCorrect: boolean) => {
    if (activeLessonId) {
      const xp = allCorrect ? nextPassXP(activeLessonId) : 0;
      recordReview(activeLessonId, allCorrect);
      setLastResult({ lessonId: activeLessonId, pass: allCorrect, xp });
    }
    setActiveLessonId(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="review-overlay"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: '#03030A', overflowY: 'auto',
            padding: '28px 20px 100px',
          }}
        >
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            {activeLesson ? (
              <>
                <button
                  onClick={() => setActiveLessonId(null)}
                  style={{
                    background: 'transparent', border: 'none', color: '#444',
                    fontFamily: 'Orbitron, sans-serif', fontSize: 8, letterSpacing: '0.2em',
                    cursor: 'pointer', padding: 0, marginBottom: 24,
                  }}
                >
                  ← BACK TO QUEUE
                </button>
                <ReviewSession key={activeLesson.id} lesson={activeLesson} onDone={handleSessionDone} />
              </>
            ) : (
              <>
                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{
                    fontFamily: 'Orbitron, sans-serif', fontSize: 8, letterSpacing: '0.25em',
                    color: '#8833FF', marginBottom: 8,
                  }}>
                    SPACED REPETITION
                  </div>
                  <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 22, color: '#F0F0F0', margin: '0 0 8px' }}>
                    Review Queue
                  </h1>
                  <p style={{ color: '#555', fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                    Answer from memory. Pass a review and it returns later ({REVIEW_INTERVALS_DAYS.join(' → ')} days).
                    Fail and it comes back tomorrow. This is how knowledge becomes permanent.
                  </p>
                </div>

                {/* Result flash */}
                <AnimatePresence>
                  {lastResult && (
                    <motion.div
                      key={lastResult.lessonId + String(lastResult.pass)}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        border: `1px solid ${lastResult.pass ? '#5FFF3D55' : '#FF666655'}`,
                        background: lastResult.pass ? '#5FFF3D10' : '#FF666610',
                        borderRadius: 3, padding: '12px 16px', marginBottom: 20,
                        fontFamily: 'Orbitron, sans-serif', fontSize: 9, letterSpacing: '0.12em',
                        color: lastResult.pass ? '#5FFF3D' : '#FF6666',
                      }}
                    >
                      {lastResult.pass
                        ? `PASSED — "${LESSON_BY_ID[lastResult.lessonId]?.title}" +${lastResult.xp} XP · next review scheduled`
                        : `MISSED — "${LESSON_BY_ID[lastResult.lessonId]?.title}" returns tomorrow`}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Queue */}
                {dueLessonIds.length === 0 ? (
                  <div style={{
                    textAlign: 'center', padding: '80px 0', color: '#333',
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 12 }}>✓</div>
                    <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 11, letterSpacing: '0.15em', color: '#5FFF3D', marginBottom: 8 }}>
                      QUEUE CLEAR
                    </div>
                    <div style={{ fontSize: 12, color: '#444' }}>
                      {completedLessons.length === 0
                        ? 'Complete lessons in the skill tree — they\'ll appear here for review the next day.'
                        : 'Nothing due right now. Reviews unlock as their intervals expire.'}
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{
                      fontFamily: 'Orbitron, sans-serif', fontSize: 8, letterSpacing: '0.2em',
                      color: '#484848', marginBottom: 10,
                    }}>
                      {dueLessonIds.length} DUE
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {dueLessonIds.map((id) => {
                        const lesson = LESSON_BY_ID[id];
                        const color = nodeColor(lesson.nodeId);
                        const state = reviewStates[id];
                        return (
                          <motion.button
                            key={id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { setLastResult(null); setActiveLessonId(id); }}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              gap: 12, padding: '14px 16px', textAlign: 'left',
                              background: '#06060E', border: '1px solid #0e0e1a',
                              cursor: 'pointer', borderRadius: 3, transition: 'border-color 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${color}44`; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#0e0e1a'; }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div style={{
                                fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.15em',
                                color, marginBottom: 4,
                              }}>
                                {nodeName(lesson.nodeId)}
                              </div>
                              <div style={{ color: '#D0D0D0', fontSize: 13 }}>{lesson.title}</div>
                            </div>
                            <div style={{
                              fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.1em',
                              color: '#333', flexShrink: 0, textAlign: 'right',
                            }}>
                              {state ? `STAGE ${state.stage}` : 'FIRST REVIEW'}
                              <div style={{ color: '#5FFF3D', marginTop: 3 }}>+{nextPassXP(id)} XP</div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
