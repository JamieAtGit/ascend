# ASCEND — Project Brief for Claude

## What This Is
A dark cyberpunk skill-tree app built in React + Vite + TypeScript + Zustand + Framer Motion.
Users unlock nodes, complete lessons, log time, and earn XP to level up — like a real-life RPG for self-improvement.

## Stack
- **React 18 + TypeScript + Vite**
- **Zustand** with `persist` middleware (key: `'ascend-v2'`). `partialize` controls what's persisted.
- **Framer Motion** for all animations
- **Canvas 2D** for skill tree rendering, minimap, and charts
- **Google Fonts**: Orbitron (headings/labels), Inter (body)

## File Map
```
src/
  components/
    SkillTree.tsx       — main canvas (4200×850px), handles pan/zoom, renders nodes/edges/minimap
    NodePanel.tsx       — right-side slide-out panel for node details + lesson entry
    LessonView.tsx      — full-screen lesson overlay (explanation → quiz flow)
    Dashboard.tsx       — home screen with XP summary, quick stats, nav buttons
    AppNav.tsx          — bottom nav bar (Dashboard / Skill Tree / Time / Stats)
    XPBar.tsx           — top XP progress bar with level + streak badge
    MiniMap.tsx         — fixed bottom-right minimap (260×70px) for canvas navigation
    TimeTracker.tsx     — overlay for live timer + manual time logging
    ProgressDashboard.tsx — stats overlay with XP line chart + time bar chart
    XPEditor.tsx        — dev tool overlay for manually adjusting XP
  data/
    nodes.ts            — 37 nodes, CATEGORY_COLORS, CATEGORY_GLOW, SYNERGY_MAP
    lessons.ts          — all lessons (Lesson interface + LESSONS array + LESSONS_BY_NODE lookup)
  store/
    useAscendStore.ts   — Zustand store: XP, level, nodes, lessons, time, streak, overlays
  hooks/
    useCanvas.ts        — pan/zoom hook, exposes transform + setTransform
```

## Color System (10% brightened from original)
```
PHYSICAL:      #FF6666   (red)
MENTAL:        #8833FF   (purple)
INTELLECTUAL:  #33F3FF   (cyan)
FINANCIAL:     #5FFF3D   (green)
ACADEMIC:      #FFA333   (orange)
CRAFT:         #FF5592   (pink)
ECONOMICS:     #00C8A0   (teal)
CULTURE:       #FFB800   (gold)
TRADING:       #FF7A00   (orange-red)
```
Background is intentionally kept very dark (`#03030A`, `#060610` etc).

## Node Categories & Canvas Layout
Canvas is 4200×850px. Zone dividers at x: [430, 810, 1190, 1620, 2160, 2600, 3130, 3650].

| Zone | Category | Color | X range |
|------|----------|-------|---------|
| 1 | PHYSICAL | #FF6666 | 0–430 |
| 2 | MENTAL | #8833FF | 430–810 |
| 3 | INTELLECTUAL | #33F3FF | 810–1190 |
| 4 | FINANCIAL | #5FFF3D | 1190–1620 |
| 5 | ACADEMIC | #FFA333 | 1620–2160 |
| 6 | CRAFT | #FF5592 | 2160–2600 |
| 7 | ECONOMICS | #00C8A0 | 2600–3130 |
| 8 | CULTURE | #FFB800 | 3130–3650 |
| 9 | TRADING | #FF7A00 | 3650–4200 |

## Total Nodes: 37
### Existing (23)
strength, focus, discipline, nutrition, maths_basics, science_foundations, philosophy, english_writing, british_politics, saving, investing, budgeting, guitar, music_theory, cooking, learning, economics_basics, history, geography, biology, creative_writing, chemistry, physics

### New (14)
- **ECONOMICS**: macro_economics, micro_economics, global_markets, economic_history
- **CULTURE**: world_religions, classical_literature, ancient_philosophy, world_cultures, rhetoric_writing *(SYNERGY)*
- **TRADING**: markets_101, technical_analysis, trading_psychology, risk_management, day_trading_mastery *(SYNERGY)*

## Synergy Nodes
Completing synergy peer nodes gives an XP bonus on mastery:
- `rhetoric_writing`: peers = [ancient_philosophy, world_cultures], bonus = 10%
- `day_trading_mastery`: peers = [technical_analysis, trading_psychology, risk_management], bonus = 12%

## Lesson Interface
```typescript
interface Lesson {
  id: string;
  nodeId: string;
  order: number;
  title: string;
  xpReward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  whyItMatters?: string;   // 1-2 sentence real-world hook shown at top of lesson
  explanation: string;
  bullets: string[];
  example?: string;
  quiz: { id: string; question: string; options: string[]; correctIndex: number }[];
}
```

## Key Store State
```typescript
xp, level, unlockedNodes, masteredNodes, completedLessons,
xpHistory, timeEntries, activeTimer,
currentStreak, lastActiveDate,   // streak tracking
overlay: null | 'lesson' | 'time' | 'stats' | 'xpeditor' | 'minimap'
activeNode, activeLesson
```

## Store Key: `'ascend-v2'`
`resetAll()` wipes everything back to zero. Accessible via the DANGER_ZONE section in Dashboard.

## XP Rates (Time Tracker)
Learning: 4 XP/min, Music: 4, Fitness: 3, Productivity: 2, Other: 1 (divided by 10)

---

## ✅ What Was Done (this session)

1. **Reset button** — two-step confirmation in Dashboard.tsx (DANGER_ZONE section)
2. **Colors brightened ~10%** — all UI components updated (AppNav, Dashboard, NodePanel, TimeTracker, ProgressDashboard, XPBar, LessonView, XPEditor)
3. **14 new nodes** added to `src/data/nodes.ts` (ECONOMICS × 4, CULTURE × 5, TRADING × 5)
4. **Canvas expanded** 2600 → 4200px across SkillTree.tsx and NodeEdges.tsx
5. **MiniMap** — new `src/components/MiniMap.tsx`, clickable, navigates canvas, shows all 37 nodes
6. **Day streak tracking** — `currentStreak` + `lastActiveDate` in store, displayed in XPBar
7. **`whyItMatters` field** — added to Lesson interface, rendered in LessonView with colored callout
8. **Synergy map** — updated for rhetoric_writing and day_trading_mastery
9. **Dashboard node count** — needs updating from "/ 23" to "/ 37"

---

## 🔲 What's Still Pending

### CRITICAL — Lessons for new nodes
`src/data/lessons.ts` needs 70 new lessons appended (5 per node) for:
- ECONOMICS: `macro_economics`, `micro_economics`, `global_markets`, `economic_history`
- CULTURE: `world_religions`, `classical_literature`, `ancient_philosophy`, `world_cultures`, `rhetoric_writing`
- TRADING: `markets_101`, `technical_analysis`, `trading_psychology`, `risk_management`, `day_trading_mastery`

Insert before the closing `];` at line 1133.
Each lesson must have: id, nodeId, order, title, xpReward, difficulty, whyItMatters, explanation, bullets (5–7), example (optional), quiz (exactly 3 questions × 4 options).

### MINOR — Dashboard node count
In `src/components/Dashboard.tsx`, update hardcoded `/ 23` to `/ 37`.

### OPTIONAL — End-to-end test
Run `npm run dev` and verify all 9 zones render, minimap works, new nodes are clickable, lessons open correctly.

---

## Dev Commands
```bash
npm run dev       # start dev server (localhost:5173)
npx tsc --noEmit  # type-check without building
npm run build     # production build
```
