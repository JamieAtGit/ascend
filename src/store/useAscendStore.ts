import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NODES } from '../data/nodes';
import { LESSONS_BY_NODE } from '../data/lessons';

export type TimeCategory = 'Learning' | 'Fitness' | 'Music' | 'Productivity' | 'Other';

export interface XPEntry {
  id: string;
  label: string;
  xp: number;
  timestamp: number;
}

export interface LessonCompletion {
  lessonId: string;
  nodeId: string;
  completedAt: number;
  xpEarned: number;
}

export interface TimeEntry {
  id: string;
  category: TimeCategory;
  minutes: number;
  label: string;
  timestamp: number;
  xpEarned: number;
}

export interface ActiveTimer {
  startedAt: number;
  category: TimeCategory;
  label: string;
}

export type OverlayView = 'time' | 'stats' | 'xpledger' | 'sprint' | 'review' | null;

// Spaced repetition: successful review count (stage) maps to next interval.
// Unreviewed completed lessons are due 1 day after completion.
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 21, 60];
const DAY_MS = 86400000;

export interface ReviewState {
  due: number;    // timestamp when next review is due
  stage: number;  // number of consecutive successful reviews
  lapses: number; // times the lesson was failed in review
}

// Pure helper: which completed lessons are due for review right now.
// Lessons never reviewed are due completedAt + 1 day.
export function computeDueLessons(
  completedLessons: LessonCompletion[],
  reviewStates: Record<string, ReviewState>,
  now: number = Date.now()
): string[] {
  return completedLessons
    .filter((c) => {
      const state = reviewStates[c.lessonId];
      const due = state ? state.due : c.completedAt + DAY_MS;
      return due <= now;
    })
    .map((c) => c.lessonId);
}

const TIME_XP_RATE: Record<TimeCategory, number> = {
  Learning: 4,
  Music: 4,
  Fitness: 3,
  Productivity: 2,
  Other: 1,
};

interface AscendState {
  xp: number;
  level: number;
  spentXP: Record<string, number>;
  unlockedNodes: string[];
  masteredNodes: string[];
  xpHistory: XPEntry[];
  completedLessons: LessonCompletion[];
  timeEntries: TimeEntry[];
  activeTimer: ActiveTimer | null;
  overlay: OverlayView;
  activeLesson: string | null;
  view: 'landing' | 'app';
  currentStreak: number;
  lastActiveDate: string | null;

  setView: (v: 'landing' | 'app') => void;
  setOverlay: (o: OverlayView) => void;
  setActiveLesson: (id: string | null) => void;
  resetAll: () => void;

  addXP: (amount: number, label: string) => void;
  removeXPEntry: (id: string) => void;

  unlockNode: (id: string) => void;
  investXP: (nodeId: string, amount: number) => void;

  completeLesson: (lessonId: string, nodeId: string, xpReward: number) => void;

  startTimer: (category: TimeCategory, label: string) => void;
  stopTimer: () => void;
  addManualTime: (category: TimeCategory, minutes: number, label: string) => void;

  getNodeStatus: (id: string) => 'locked' | 'available' | 'unlocked' | 'mastered';
  getAvailableXP: () => number;

  // Sprint
  completedSprints: string[];
  sprintProgress: Record<string, string[]>; // sprintId -> completed stepIds
  completeSprintStep: (sprintId: string, stepId: string) => void;
  completeSprint: (sprintId: string, xpReward: number) => void;
  clearSprintProgress: (sprintId: string) => void;

  // Spaced repetition review
  reviewStates: Record<string, ReviewState>; // lessonId -> state
  recordReview: (lessonId: string, allCorrect: boolean) => void;

  // Mastery exams
  passedExams: string[]; // nodeIds whose mastery exam has been passed
  passExam: (nodeId: string) => void;
}

// 1.35 growth keeps long-term levelling alive: all one-time content (~11.7k XP)
// reaches ~L13; an engaged year lands ~L14-15 with months-not-years per level after.
// (Was 1.5, which stalled around L10-11.)
export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.35, level - 1));
}

export function computeLevel(totalXP: number): number {
  let level = 1;
  let accumulated = 0;
  while (accumulated + xpForLevel(level) <= totalXP) {
    accumulated += xpForLevel(level);
    level++;
  }
  return level;
}

function mkId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const SYNERGY_MAP: Record<string, { peers: string[]; bonus: number }> = {
  discipline: { peers: ['consistency'], bonus: 0.1 },
  consistency: { peers: ['discipline', 'focus'], bonus: 0.1 },
  focus: { peers: ['discipline', 'consistency'], bonus: 0.1 },
  learning: { peers: ['creativity', 'problem_solving'], bonus: 0.08 },
  saving: { peers: ['investing'], bonus: 0.08 },
  rhetoric_writing: { peers: ['ancient_philosophy', 'world_cultures'], bonus: 0.1 },
  day_trading_mastery: { peers: ['technical_analysis', 'trading_psychology', 'risk_management'], bonus: 0.12 },
};

export const useAscendStore = create<AscendState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      spentXP: {},
      unlockedNodes: [],
      masteredNodes: [],
      xpHistory: [],
      completedLessons: [],
      timeEntries: [],
      activeTimer: null,
      overlay: null,
      activeLesson: null,
      view: 'landing',
      currentStreak: 0,
      lastActiveDate: null,
      completedSprints: [],
      sprintProgress: {},
      reviewStates: {},
      passedExams: [],

      setView: (v) => set({ view: v }),
      setOverlay: (o) => set({ overlay: o }),
      setActiveLesson: (id) => set({ activeLesson: id }),

      resetAll: () => set({
        xp: 0, level: 1,
        spentXP: {}, unlockedNodes: [], masteredNodes: [],
        xpHistory: [], completedLessons: [], timeEntries: [],
        activeTimer: null, currentStreak: 0, lastActiveDate: null,
        completedSprints: [], sprintProgress: {},
        reviewStates: {}, passedExams: [],
      }),

      completeSprintStep: (sprintId, stepId) =>
        set((state) => {
          const current = state.sprintProgress[sprintId] ?? [];
          if (current.includes(stepId)) return state;
          return { sprintProgress: { ...state.sprintProgress, [sprintId]: [...current, stepId] } };
        }),

      completeSprint: (sprintId, xpReward) => {
        const state = get();
        if (state.completedSprints.includes(sprintId)) return;
        const entry: XPEntry = { id: mkId(), label: `SPRINT_COMPLETE`, xp: xpReward, timestamp: Date.now() };
        const newXP = state.xp + xpReward;
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const newStreak = state.lastActiveDate === today
          ? state.currentStreak
          : state.lastActiveDate === yesterday ? state.currentStreak + 1 : 1;
        set({
          xp: newXP, level: computeLevel(newXP),
          xpHistory: [entry, ...state.xpHistory],
          completedSprints: [...state.completedSprints, sprintId],
          currentStreak: newStreak, lastActiveDate: today,
        });
      },

      clearSprintProgress: (sprintId) =>
        set((state) => {
          const { [sprintId]: _, ...rest } = state.sprintProgress;
          return { sprintProgress: rest };
        }),

      recordReview: (lessonId, allCorrect) => {
        const state = get();
        const prev = state.reviewStates[lessonId];
        const now = Date.now();
        if (allCorrect) {
          const stage = (prev?.stage ?? 0) + 1;
          const interval = REVIEW_INTERVALS_DAYS[Math.min(stage, REVIEW_INTERVALS_DAYS.length - 1)];
          // Later-stage recalls (21/60-day) are rarer and prove more retention — pay more
          const reviewXP = Math.min(5 + (stage - 1) * 2, 13);
          const xpEntry: XPEntry = { id: mkId(), label: 'REVIEW_PASS', xp: reviewXP, timestamp: now };
          const newXP = state.xp + reviewXP;
          set({
            reviewStates: {
              ...state.reviewStates,
              [lessonId]: { due: now + interval * DAY_MS, stage, lapses: prev?.lapses ?? 0 },
            },
            xp: newXP,
            level: computeLevel(newXP),
            xpHistory: [xpEntry, ...state.xpHistory],
          });
        } else {
          set({
            reviewStates: {
              ...state.reviewStates,
              [lessonId]: { due: now + DAY_MS, stage: 0, lapses: (prev?.lapses ?? 0) + 1 },
            },
          });
        }
      },

      passExam: (nodeId) => {
        const state = get();
        if (state.passedExams.includes(nodeId)) return;
        const node = NODES.find((n) => n.id === nodeId);
        if (!node) return;
        const bonusXP = Math.floor(node.xpCost / 2);
        const xpEntry: XPEntry = { id: mkId(), label: 'EXAM_PASS', xp: bonusXP, timestamp: Date.now() };
        const newXP = state.xp + bonusXP;
        const passedExams = [...state.passedExams, nodeId];
        // Exam pass can complete mastery if the XP investment is already there
        const invested = state.spentXP[nodeId] ?? 0;
        const nowMastered = state.unlockedNodes.includes(nodeId) && invested >= node.masteryThreshold;
        set({
          passedExams,
          xp: newXP,
          level: computeLevel(newXP),
          xpHistory: [xpEntry, ...state.xpHistory],
          masteredNodes: nowMastered
            ? [...new Set([...state.masteredNodes, nodeId])]
            : state.masteredNodes,
        });
      },

      addXP: (amount, label) =>
        set((state) => {
          const entry: XPEntry = { id: mkId(), label, xp: amount, timestamp: Date.now() };
          const newXP = state.xp + amount;
          const today = new Date().toDateString();
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          const newStreak = state.lastActiveDate === today
            ? state.currentStreak
            : state.lastActiveDate === yesterday
              ? state.currentStreak + 1
              : 1;
          return {
            xp: newXP,
            level: computeLevel(newXP),
            xpHistory: [entry, ...state.xpHistory],
            currentStreak: newStreak,
            lastActiveDate: today,
          };
        }),

      removeXPEntry: (id) =>
        set((state) => {
          const history = state.xpHistory.filter((e) => e.id !== id);
          const newXP = history.reduce((sum, e) => sum + e.xp, 0);
          return { xpHistory: history, xp: newXP, level: computeLevel(newXP) };
        }),

      completeLesson: (lessonId, nodeId, xpReward) => {
        const state = get();
        if (state.completedLessons.some((c) => c.lessonId === lessonId)) return;
        const entry: XPEntry = {
          id: mkId(), label: `LESSON_COMPLETE`, xp: xpReward, timestamp: Date.now(),
        };
        const completion: LessonCompletion = {
          lessonId, nodeId, completedAt: Date.now(), xpEarned: xpReward,
        };
        const newXP = state.xp + xpReward;
        set({
          xp: newXP,
          level: computeLevel(newXP),
          xpHistory: [entry, ...state.xpHistory],
          completedLessons: [...state.completedLessons, completion],
        });
      },

      startTimer: (category, label) =>
        set({ activeTimer: { startedAt: Date.now(), category, label } }),

      stopTimer: () => {
        const state = get();
        if (!state.activeTimer) return;
        const minutes = Math.round((Date.now() - state.activeTimer.startedAt) / 60000);
        if (minutes < 1) { set({ activeTimer: null }); return; }
        // Rate/4: Learning ≈ 1 XP/min — balanced against lessons (~25 XP for ~10 min of study)
        const xpEarned = Math.max(1, Math.floor(minutes * TIME_XP_RATE[state.activeTimer.category] / 4));
        const timeEntry: TimeEntry = {
          id: mkId(), category: state.activeTimer.category, minutes,
          label: state.activeTimer.label || state.activeTimer.category,
          timestamp: Date.now(), xpEarned,
        };
        const xpEntry: XPEntry = {
          id: mkId(), label: `${timeEntry.category}: ${timeEntry.label} (${minutes}min)`,
          xp: xpEarned, timestamp: Date.now(),
        };
        const newXP = state.xp + xpEarned;
        set({
          activeTimer: null,
          timeEntries: [timeEntry, ...state.timeEntries],
          xpHistory: [xpEntry, ...state.xpHistory],
          xp: newXP,
          level: computeLevel(newXP),
        });
      },

      addManualTime: (category, minutes, label) => {
        const state = get();
        if (minutes <= 0) return;
        const xpEarned = Math.max(1, Math.floor(minutes * TIME_XP_RATE[category] / 4));
        const timeEntry: TimeEntry = {
          id: mkId(), category, minutes,
          label: label || category, timestamp: Date.now(), xpEarned,
        };
        const xpEntry: XPEntry = {
          id: mkId(), label: `${category}: ${timeEntry.label} (${minutes}min)`,
          xp: xpEarned, timestamp: Date.now(),
        };
        const newXP = state.xp + xpEarned;
        set({
          timeEntries: [timeEntry, ...state.timeEntries],
          xpHistory: [xpEntry, ...state.xpHistory],
          xp: newXP,
          level: computeLevel(newXP),
        });
      },

      unlockNode: (id) => {
        const state = get();
        const node = NODES.find((n) => n.id === id);
        if (!node) return;
        if (state.getNodeStatus(id) !== 'available') return;
        if (state.getAvailableXP() < node.xpCost) return;

        let bonus = 0;
        const synergy = SYNERGY_MAP[id];
        if (synergy) {
          const activePeers = synergy.peers.filter(
            (p) => state.unlockedNodes.includes(p) || state.masteredNodes.includes(p)
          );
          if (activePeers.length > 0) bonus = Math.floor(node.xpCost * synergy.bonus * activePeers.length);
        }

        const totalCost = node.xpCost - bonus;
        set({
          unlockedNodes: [...state.unlockedNodes, id],
          spentXP: { ...state.spentXP, [id]: (state.spentXP[id] ?? 0) + totalCost },
        });
      },

      investXP: (nodeId, amount) => {
        const state = get();
        const node = NODES.find((n) => n.id === nodeId);
        if (!node || !state.unlockedNodes.includes(nodeId)) return;
        const invest = Math.min(amount, state.getAvailableXP());
        if (invest <= 0) return;

        const newSpentXP = { ...state.spentXP, [nodeId]: (state.spentXP[nodeId] ?? 0) + invest };
        // Mastery requires the XP threshold AND, for nodes with lessons, a passed mastery exam.
        // Nodes without lessons keep the XP-only rule.
        const hasLessons = (LESSONS_BY_NODE[nodeId]?.length ?? 0) > 0;
        const examOk = !hasLessons || state.passedExams.includes(nodeId);
        const isMastered = newSpentXP[nodeId] >= node.masteryThreshold && examOk;
        set({
          spentXP: newSpentXP,
          masteredNodes: isMastered
            ? [...new Set([...state.masteredNodes, nodeId])]
            : state.masteredNodes,
        });
      },

      getNodeStatus: (id) => {
        const state = get();
        if (state.masteredNodes.includes(id)) return 'mastered';
        if (state.unlockedNodes.includes(id)) return 'unlocked';
        const node = NODES.find((n) => n.id === id);
        if (!node) return 'locked';
        const prereqsMet = node.requiredNodes.every(
          (req) => state.unlockedNodes.includes(req) || state.masteredNodes.includes(req)
        );
        return prereqsMet ? 'available' : 'locked';
      },

      getAvailableXP: () => {
        const state = get();
        const totalSpent = Object.values(state.spentXP).reduce((a, b) => a + b, 0);
        return state.xp - totalSpent;
      },
    }),
    {
      name: 'ascend-v2',
      partialize: (state) => ({
        xp: state.xp,
        level: state.level,
        spentXP: state.spentXP,
        unlockedNodes: state.unlockedNodes,
        masteredNodes: state.masteredNodes,
        xpHistory: state.xpHistory,
        completedLessons: state.completedLessons,
        timeEntries: state.timeEntries,
        currentStreak: state.currentStreak,
        lastActiveDate: state.lastActiveDate,
        completedSprints: state.completedSprints,
        sprintProgress: state.sprintProgress,
        reviewStates: state.reviewStates,
        passedExams: state.passedExams,
      }),
    }
  )
);
