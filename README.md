# ASCEND

A dark cyberpunk skill-tree app for real-life self-improvement. Unlock skills, complete lessons, log time, and earn XP to level up — like an RPG for your actual life.

---

## What It Is

ASCEND turns self-improvement into a game. Every skill you want to build exists as a node on a scrollable map. You spend XP to unlock nodes, complete structured lessons inside each one, and log real time spent practising. Earn enough XP and you level up.

There is no social feed, no guilt-trip notifications, and no subscription. Everything runs in your browser. Your progress is saved locally.

---

## Features

### Skill Tree
A 4200px wide interactive canvas split into 9 zones — Physical, Mental, Intellectual, Financial, Academic, Craft, Economics, Culture, Trading. 59 skill nodes with prerequisite chains. Click any node to see its description, unlock it with XP, and access its lessons.

### Lessons
Each unlocked node has 5 structured lessons. Every lesson includes:
- A real-world "why it matters" hook
- A full explanation
- 5–7 bullet-point key facts
- An optional concrete example
- A 3-question quiz that must be passed to earn XP

Difficulty: easy / medium / hard. XP rewards scale accordingly.

### Spaced Repetition Review
Every completed lesson enters a review schedule (1 → 3 → 7 → 21 → 60 days). The REVIEW tab shows what's due; answer the lesson's quiz from memory — pass and it returns later, fail and it comes back tomorrow. This is how the app makes knowledge permanent instead of forgotten. A badge on the nav shows your due count.

### Mastery Exams
Complete all 5 lessons of a node and a 10-question randomized exam unlocks (80% to pass, different questions each attempt, no feedback until submission). Mastering a node requires both the XP investment **and** a passed exam — the mastered badge is a real credential of knowledge.

### Time Tracker
Log real time spent on Learning, Fitness, Music, Productivity, or Other. Start a live timer or add manual sessions. Each session earns XP proportional to effort (Learning/Music: 4 XP/min, Fitness: 3, Productivity: 2, Other: 1, all divided by 10).

### SkillSprint
35 curated 2-hour structured learning sessions across 8 categories. Each sprint has 6 steps with clear instructions and action prompts. Work through them sequentially or jump to any step. Focus Mode provides a full-screen distraction-free view with a per-step countdown timer. Completing a sprint awards XP once.

Sprint categories: Productivity, Communication, Finance, Fitness, Tech, Mental, Social, Creative.

### Stats
XP line chart over time. Time-logged bar chart by category.

### XP and Levelling
XP is earned by completing lessons, finishing sprints, and logging time. Level-up thresholds grow exponentially (`100 × 1.35^(level-1)` XP per level). Available XP = total earned minus total spent on node unlocks.

### Synergy Nodes
Certain high-level nodes give an XP discount when unlocked if you have already unlocked their peer nodes, reflecting real-world knowledge synergies (e.g. unlocking rhetoric_writing is cheaper if you have ancient_philosophy and world_cultures).

---

## Stack

- **React 19 + TypeScript + Vite 8** — frontend only, no backend
- **Zustand 5** — all state, persisted to localStorage under key `ascend-v2`
- **Framer Motion 12** — all animations
- **Canvas 2D** — skill tree rendering, minimap, stat charts
- **Google Fonts** — Orbitron (headings), Inter (body)
- **Inline styles only** — no CSS framework, no Tailwind

---

## Getting Started

```bash
git clone <repo-url>
cd ascend
npm install
npm run dev
```

Open `http://localhost:5173`.

```bash
npm run build        # production build → dist/
npm run preview      # preview the production build
npx tsc -b           # type-check without bundling
```

---

## Project Structure

```
src/
  components/     All UI components
  data/           Static content (nodes, lessons, sprints)
  store/          Zustand store — all state and actions in one file
  hooks/          useCanvas — pan/zoom/inertia for the skill tree
```

Full architectural documentation for developers is in `CLAUDE.md`.

---

## Content

| Area | Count |
|---|---|
| Skill nodes | 59 (all with lessons) |
| Total lessons | 285 |
| Quiz questions | ~930 |
| SkillSprint plans | 35 |

---

## Resetting Progress

Dashboard → scroll to DANGER ZONE → confirm twice. This wipes all XP, unlocked nodes, completed lessons, time entries, streaks, and sprint progress from localStorage.

## Backing Up Progress

Dashboard → DATA BACKUP → EXPORT DATA downloads your full progress as a JSON file. IMPORT DATA restores it. Do this periodically — clearing browser data wipes localStorage and everything with it.

---

## License

Private project.
