import type { QuizQuestion } from '../data/lessons';

// The authored quizzes have their correct answer at a fixed position far too
// often (historically ~80% at index 1), so "always pick B" beats them. This
// shuffles each question's options and remaps correctIndex so the right answer
// and its explanation stay attached to the right text — making quizzes a real test.

export interface ShuffledQuestion extends QuizQuestion {
  // options/correctIndex are the shuffled versions; everything else is unchanged.
}

// Small seeded PRNG (mulberry32) so a given question shuffles the same way
// within one attempt (stable across re-renders) but differs between attempts.
function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Returns a new question with options shuffled and correctIndex remapped.
// `salt` (e.g. an attempt id) varies the order between attempts; omit for a
// stable per-question order keyed only on the question id.
export function shuffleQuestion(q: QuizQuestion, salt: number | string = 0): ShuffledQuestion {
  const rand = seededRandom(hashString(q.id + ':' + salt));
  // Pair each option with its original index, Fisher-Yates shuffle, then find
  // where the original correct answer landed.
  const paired = q.options.map((opt, i) => ({ opt, i }));
  for (let i = paired.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [paired[i], paired[j]] = [paired[j], paired[i]];
  }
  const options = paired.map((p) => p.opt);
  const correctIndex = paired.findIndex((p) => p.i === q.correctIndex);
  return { ...q, options, correctIndex };
}
