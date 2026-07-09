import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { SkillNode } from '../data/nodes';
import { CATEGORY_COLORS } from '../data/nodes';
import { LESSONS_BY_NODE } from '../data/lessons';
import type { QuizQuestion } from '../data/lessons';
import { useAscendStore } from '../store/useAscendStore';
import { shuffleQuestion } from '../lib/shuffleQuiz';

const EXAM_SIZE = 10;
const PASS_THRESHOLD = 0.8;

function drawQuestions(nodeId: string): QuizQuestion[] {
  const pool = (LESSONS_BY_NODE[nodeId] ?? []).flatMap((l) => l.quiz);
  // Fisher-Yates shuffle, then take up to EXAM_SIZE
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Also shuffle each question's OPTIONS so the answer position isn't predictable.
  return shuffled.slice(0, EXAM_SIZE).map((q, i) => shuffleQuestion(q, `exam:${i}:${Math.random()}`));
}

interface Props {
  node: SkillNode;
  onClose: () => void;
}

export default function MasteryExam({ node, onClose }: Props) {
  const passExam = useAscendStore((s) => s.passExam);
  const color = CATEGORY_COLORS[node.category];

  const questions = useMemo(() => drawQuestions(node.id), [node.id]);
  const passNeeded = Math.ceil(questions.length * PASS_THRESHOLD);

  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [passed, setPassed] = useState(false);

  const question = questions[qIndex];

  const handleAnswer = () => {
    if (selected === null) return;
    const newCorrect = correctCount + (selected === question.correctIndex ? 1 : 0);
    if (qIndex + 1 >= questions.length) {
      const didPass = newCorrect >= passNeeded;
      setCorrectCount(newCorrect);
      setPassed(didPass);
      setFinished(true);
      if (didPass) passExam(node.id);
    } else {
      setCorrectCount(newCorrect);
      setSelected(null);
      setQIndex(qIndex + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 220,
        background: '#010108',
        display: 'flex', justifyContent: 'center',
        padding: '64px 20px 40px',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
      }}
    >
      <button onClick={onClose} style={{
        position: 'absolute', top: 20, right: 24,
        background: 'transparent', border: '1px solid #1a1a1a', color: '#444',
        fontFamily: 'Orbitron, sans-serif', fontSize: 9, letterSpacing: '0.15em',
        padding: '6px 14px', cursor: 'pointer', borderRadius: 2,
      }}>
        {finished ? 'CLOSE' : 'ABANDON EXAM'}
      </button>

      {/* margin auto = vertically centered when short, scrollable when tall */}
      <div style={{ maxWidth: 620, width: '100%', margin: 'auto 0' }}>
        {finished ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>{passed ? '◈' : '✕'}</div>
            <div style={{
              fontFamily: 'Orbitron, sans-serif', fontSize: 18, letterSpacing: '0.1em',
              color: passed ? color : '#FF6666', marginBottom: 12,
              textShadow: passed ? `0 0 20px ${color}88` : undefined,
            }}>
              {passed ? 'EXAM PASSED' : 'EXAM FAILED'}
            </div>
            <div style={{ color: '#888', fontSize: 14, marginBottom: 8 }}>
              {correctCount} / {questions.length} correct — {passNeeded} needed to pass
            </div>
            <p style={{ color: '#555', fontSize: 13, lineHeight: 1.7, maxWidth: 440, margin: '0 auto 28px' }}>
              {passed
                ? `You have proven your knowledge of ${node.name}. +${Math.floor(node.xpCost / 2)} XP bonus awarded. Mastery unlocks once your XP investment reaches the threshold.`
                : 'Review the lessons and try again. The exam draws different questions each attempt.'}
            </p>
            <button
              onClick={onClose}
              style={{
                padding: '12px 36px',
                background: passed ? `${color}15` : 'transparent',
                border: `1px solid ${passed ? color : '#333'}`,
                color: passed ? color : '#888',
                fontFamily: 'Orbitron, sans-serif', fontSize: 10, letterSpacing: '0.2em',
                cursor: 'pointer', borderRadius: 2,
              }}
            >
              {passed ? 'CONTINUE' : 'BACK TO LESSONS'}
            </button>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
              {questions.map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: i < qIndex ? color : i === qIndex ? `${color}66` : '#151525',
                }} />
              ))}
            </div>

            <div style={{
              fontFamily: 'Orbitron, sans-serif', fontSize: 8, letterSpacing: '0.2em',
              color, marginBottom: 8,
            }}>
              MASTERY EXAM · {node.name} · {qIndex + 1} / {questions.length}
            </div>

            <h2 style={{
              fontFamily: 'Orbitron, sans-serif', fontSize: 15, color: '#F0F0F0',
              margin: '0 0 22px', lineHeight: 1.4,
            }}>
              {question.question}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {question.options.map((opt, i) => {
                const isSelected = selected === i;
                return (
                  <button
                    key={i}
                    onClick={() => setSelected(i)}
                    style={{
                      textAlign: 'left', padding: '12px 16px',
                      background: isSelected ? `${color}10` : '#06060E',
                      border: `1px solid ${isSelected ? color : '#151525'}`,
                      color: isSelected ? '#F0F0F0' : '#999',
                      fontSize: 13, fontFamily: 'Inter, sans-serif',
                      cursor: 'pointer', borderRadius: 3,
                      transition: 'all 0.15s', lineHeight: 1.5,
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleAnswer}
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
                {qIndex + 1 >= questions.length ? 'SUBMIT EXAM' : 'NEXT →'}
              </button>
            </div>

            {/* No feedback during exam — it's a test, not practice */}
            <div style={{
              marginTop: 20, textAlign: 'center',
              fontFamily: 'Orbitron, sans-serif', fontSize: 7, letterSpacing: '0.15em', color: '#333',
            }}>
              NO FEEDBACK UNTIL SUBMISSION · {passNeeded}/{questions.length} REQUIRED TO PASS
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
