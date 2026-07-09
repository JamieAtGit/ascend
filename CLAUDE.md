# ASCEND — Complete Project Reference for Claude

## What This Is

A dark cyberpunk skill-tree progressive-web app built entirely in React + Vite + TypeScript. Users unlock skill nodes on a giant scrollable canvas, complete structured lessons, log time, run 2-hour "SkillSprint" sessions, and earn XP to level up — like a real-life RPG for self-improvement. No backend. No auth. No database. Everything runs in the browser with Zustand persisted to localStorage.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript + Vite 8 |
| State | Zustand 5 with `persist` middleware |
| Animations | Framer Motion 12 |
| Canvas rendering | Vanilla Canvas 2D (inside React) |
| Fonts | Orbitron (headings/labels), Inter (body) — Google Fonts via index.html |
| Styling | Inline styles only — no CSS framework, no Tailwind, no CSS modules |
| Linting | oxlint |
| Build | tsc + vite build |

**No backend. No API calls. No auth. No database.** All data is hardcoded in `src/data/` and all user state lives in `localStorage` under the key `'ascend-v2'`.

---

## Dev Commands

```bash
npm run dev          # start dev server → http://localhost:5173
npx tsc -b           # type-check (run this before considering anything "done")
npm run build        # production build → dist/ (runs tsc -b first)
npm run preview      # preview production build locally
```

⚠️ **Do NOT use `npx tsc --noEmit` to verify** — this repo uses a solution-style tsconfig with project references, so plain `--noEmit` checks nothing and silently passes. Use `npx tsc -b` or `npm run build`.

---

## Complete File Map

```
src/
  main.tsx                    — React root mount, nothing special
  App.tsx                     — Root component; switches between Landing and app views
  App.css                     — Minimal global styles + @keyframes (flicker, pulse, etc.)
  index.css                   — CSS reset, Google Fonts import

  components/
    AppNav.tsx                — Bottom nav bar (6 tabs). z-index: 300 (intentionally above all overlays). Shows due-review count badge
    Dashboard.tsx             — Home screen: XP summary, level, streak, node count, DANGER_ZONE reset
    SkillTree.tsx             — Main canvas (4200×850px). Pan/zoom/inertia. Renders all nodes, edges, zone labels, minimap, XPBar, Dashboard, AppNav
    SkillNode.tsx             — Single node rendered inside canvas (positioned absolutely within the 4200×850 div)
    NodeEdges.tsx             — SVG overlay that draws all edges between nodes (prerequisite connections)
    NodePanel.tsx             — Right-side slide-out panel on node click: info tab + lessons tab
    LessonView.tsx            — Full-screen lesson overlay: explanation → quiz flow, awards XP on completion
    XPBar.tsx                 — Fixed top-center XP bar with level badge + streak indicator
    MiniMap.tsx               — Fixed bottom-right minimap (260×70px), clickable for canvas navigation
    TimeTracker.tsx           — Overlay for live timer + manual time entry, awards XP on stop
    ProgressDashboard.tsx     — Stats overlay: XP line chart + time bar chart (Canvas 2D)
    XPEditor.tsx              — Dev tool overlay for manually adjusting XP entries
    SkillSprint.tsx           — SkillSprint feature (standalone full-screen overlay): home → plan view → focus mode
    ReviewQueue.tsx           — Spaced repetition overlay (overlay === 'review'): due lessons → quiz from memory → reschedule
    AccountPanel.tsx          — Account overlay (overlay === 'account'): sign in/up, sync status, conflict resolution
    MasteryExam.tsx           — Full-screen exam (z-index 220): 10 random questions from a node's lessons, 80% to pass
    Landing.tsx               — Landing page shown on first load (view === 'landing')
    CyberSigil.tsx            — Decorative SVG sigil on landing/dashboard
    FilmGrain.tsx             — CSS animated film grain overlay for aesthetic
    Scanlines.tsx             — CSS scanlines overlay for CRT aesthetic
    Particles.tsx             — Animated floating particles background
    CategoryLegend.tsx        — Zone/category colour legend shown in Dashboard

  data/
    nodes.ts                  — All 65 SkillNode definitions + CATEGORY_COLORS + CATEGORY_GLOW
    lessons.ts                — All lessons (Lesson interface + LESSONS array + LESSONS_BY_NODE lookup)
    skillSprints.ts           — All 35 SkillSprint definitions + CATEGORY_COLOR + SPRINT_CATEGORIES

  store/
    useAscendStore.ts         — Single Zustand store: ALL app state and actions
    useAuthStore.ts           — Small non-persisted store: auth user, sync status, sync conflict

  lib/
    supabase.ts               — Supabase client from VITE_SUPABASE_URL/_ANON_KEY env; null when unconfigured
    sync.ts                   — Cloud sync engine: push/pull the persist blob, conflict detection, auth events

  hooks/
    useCanvas.ts              — Pan/zoom hook with inertia. Returns: transform, setTransform, isDragging, containerRef, event handlers
```

---

## Rendering Architecture

```
App.tsx
  └── if view === 'landing': <Landing />
  └── else:
        ├── <SkillTree />           ← contains the canvas + AppNav + XPBar + Dashboard
        ├── <TimeTracker />         ← fixed overlay, shown when overlay === 'time'
        ├── <ProgressDashboard />   ← fixed overlay, shown when overlay === 'stats'
        ├── <XPEditor />            ← fixed overlay, shown when overlay === 'xpledger'
        ├── <SkillSprint />         ← fixed overlay, shown when overlay === 'sprint'
        ├── <ReviewQueue />         ← fixed overlay, shown when overlay === 'review'
        └── {activeLesson && <LessonView />}   ← shown when activeLesson !== null

MasteryExam is NOT mounted in App.tsx — it is rendered by NodePanel when the user starts an exam.

### Code Splitting (session 6)

- All six overlays (LessonView, TimeTracker, ProgressDashboard, XPEditor, SkillSprint, ReviewQueue) are `React.lazy` in App.tsx, wrapped in one `<Suspense fallback={null}>`
- `skillSprints.ts` (~116KB) is split out of the main bundle. **Do not statically import it from any main-chunk component** — Dashboard fetches the active sprint title via dynamic `import('../data/skillSprints')` in an effect for exactly this reason
- `lessons.ts` intentionally stays in the main chunk: the store (`investXP` mastery check), NodePanel, and Dashboard need it synchronously at startup — splitting it would require async plumbing for little gain
- Result: main chunk stays lean; sprint data + overlays load on demand
- `lib/sync.ts` (and with it supabase-js, ~200KB) loads via dynamic import from App's mount effect — NEVER statically import lib/sync or lib/supabase from a main-chunk component. Bonus: with no env vars set, Vite constant-folds the client to null and tree-shakes supabase-js out entirely.

### Mobile Support (session 11)

- **Touch canvas**: `useCanvas` has full touch handlers — one-finger pan (with inertia), two-finger pinch zoom (anchored between fingers), pinch→pan handoff. SkillTree container sets `touchAction: 'none'` so the browser never scrolls the page; taps on `[data-node]` elements are left alone so node clicks work.
- **`useIsMobile()` hook** (`hooks/useIsMobile.ts`): matchMedia `(max-width: 640px)` — the single breakpoint, matching the CSS media query in index.css.
- **AppNav on mobile**: icon-only tabs (labels hidden), each tab flex-1 across the full width. Desktop keeps labels.
- **iOS input zoom**: index.css forces `font-size: 16px !important` on inputs below 640px (inputs under 16px trigger iOS auto-zoom on focus). Inline font sizes on inputs are overridden intentionally.
- **Centered fixed overlays** (LessonView, Stats, TimeTracker, XPEditor, Account): outer padding 10 so panels never touch screen edges; scrolling bodies need `minHeight: 0` (see session 8 note).
- **Full-screen flex-centered views** (MasteryExam, Sprint FocusMode): converted to `overflowY: auto` + `margin: auto` centering so long content scrolls instead of clipping. New full-screen views must NOT use plain `alignItems: center` without this pattern.
- **MiniMap**: returns null below 640px. **Dashboard toggle**: bottom 88 on mobile (above the nav). **XPBar**: 12 segments on mobile vs 20. **NodePanel**: `width: min(340px, calc(100vw - 16px))`.

### Cloud Sync Architecture (session 10)

- **Backend: Supabase** (auth + Postgres). No custom server. Schema in `supabase/schema.sql`: one `user_state` row per user (user_id PK, state jsonb, updated_at), RLS policies restrict every operation to `auth.uid() = user_id`.
- **Config**: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in `.env.local` (see `.env.example`). Unconfigured → `supabase` is null, AccountPanel shows setup instructions, app runs local-only.
- **Sync model — cloud save-file**: the zustand-persist blob (localStorage `ascend-v2`, shape `{state, version}`) is the unit of sync; same format as Dashboard export/import.
  - Signed in + any store change → debounced 3s push (string-compare vs last push skips no-ops)
  - On login: no cloud row → seed from local; local virgin (xp=0, no lessons/time) → adopt cloud silently; both have differing progress → conflict stored in useAuthStore, AccountPanel renders USE CLOUD SAVE / KEEP THIS DEVICE
  - `applyRemoteState` uses `useAscendStore.setState(parsed.state)`; persist middleware writes localStorage automatically
  - Sign-out pushes pending changes first, then unsubscribes
- **useAuthStore** (not persisted): `user`, `syncStatus` (idle/syncing/synced/error), `lastSyncedAt`, `conflict`. Supabase manages its own session in localStorage.
- **initSync()** is idempotent, called once via dynamic import in App's mount effect; `onAuthStateChange` drives everything.
```

All overlays use `position: fixed; inset: 0` and are controlled by `overlay` state in the store.

### Z-Index Hierarchy (CRITICAL — do not break this)

| Element | z-index | Notes |
|---|---|---|
| SkillTree canvas content | 1–10 | Nodes, edges |
| XPBar | 40 | Top-center |
| SkillSprint / ReviewQueue overlays | 50 | Full-screen |
| TimeTracker/ProgressDashboard/XPEditor overlays | ~50 | Full-screen |
| LessonView | ~60 | Full-screen |
| Sprint FocusMode | 200 | Above sprint content, below AppNav |
| MasteryExam | 220 | Above NodePanel, below AppNav |
| AppNav | **300** | ALWAYS on top — intentionally highest so nav is always clickable even when overlays are open |

**Important:** AppNav must always be >= any overlay's z-index so the user can always navigate away. The 300 value was deliberately set to prevent overlays from trapping users.

---

## State — useAscendStore.ts

Store key: `'ascend-v2'` (localStorage). All user-facing data persists.

### Full State Shape

```typescript
// XP and levelling
xp: number                        // total XP ever earned
level: number                     // derived from xp via computeLevel()
spentXP: Record<string, number>   // nodeId → amount spent (for unlocking/investing)

// Skill tree progress
unlockedNodes: string[]           // nodeIds that are unlocked (spent xpCost but not yet mastered)
masteredNodes: string[]           // nodeIds that are mastered (invested >= masteryThreshold)

// History
xpHistory: XPEntry[]              // every XP gain event {id, label, xp, timestamp}
completedLessons: LessonCompletion[]  // {lessonId, nodeId, completedAt, xpEarned}
timeEntries: TimeEntry[]          // logged time sessions

// Active state
activeTimer: ActiveTimer | null   // {startedAt, category, label} or null
overlay: OverlayView              // 'time' | 'stats' | 'xpledger' | 'sprint' | null
activeLesson: string | null       // lesson id currently being viewed
view: 'landing' | 'app'          // controls Landing vs full app

// Streaks
currentStreak: number
lastActiveDate: string | null     // "Mon Jan 06 2025" format (toDateString())

// Sprint
completedSprints: string[]                    // sprintIds fully completed
sprintProgress: Record<string, string[]>      // sprintId → completed stepIds

// Spaced repetition (lesson-level SRS)
reviewStates: Record<string, ReviewState>     // lessonId → {due, stage, lapses}
// Unreviewed completed lessons are due completedAt + 1 day (derived, not stored)

// Mastery exams
passedExams: string[]                         // nodeIds whose 10-question exam was passed
```

### Spaced Repetition System

- Intervals: `REVIEW_INTERVALS_DAYS = [1, 3, 7, 21, 60]` (exported from store)
- A completed lesson enters review 1 day after completion (derived from `completedAt`, no write needed)
- `recordReview(lessonId, allCorrect)`: pass → stage+1, due = now + interval[min(stage, 4)] days, +5 XP; fail → stage=0, due = tomorrow, lapses+1, no XP
- `computeDueLessons(completedLessons, reviewStates, now?)` — pure exported helper; used by ReviewQueue, AppNav badge, Dashboard Today panel
- Review = answering the lesson's 3 quiz questions from memory; all 3 correct = pass

### Mastery Exam System

- Exam unlocks in NodePanel's LESSONS tab when all the node's lessons are complete
- 10 random questions drawn (Fisher-Yates) from the node's quiz pool; 80% (8/10) to pass; no feedback until submission
- `passExam(nodeId)`: awards `xpCost / 2` bonus XP, adds to `passedExams`, and masters the node if `spentXP >= masteryThreshold`
- **Mastery rule (in `investXP` and `passExam`)**: nodes WITH lessons require XP threshold AND passed exam; nodes WITHOUT lessons need only XP (all 59 nodes currently have lessons). Already-mastered nodes are grandfathered (never removed from `masteredNodes`)

### Key Derived Values

```typescript
getAvailableXP()      // xp - sum(all spentXP values) — the XP pool available to spend on nodes
getNodeStatus(id)     // 'locked' | 'available' | 'unlocked' | 'mastered'
xpForLevel(level)     // XP needed to complete that level: Math.floor(100 * 1.35^(level-1))
computeLevel(totalXP) // derives current level from total XP
```

### XP Economy (audited, session 6 — keep balanced when adding content)

- One-time content XP: 285 lessons + 59 exams + 35 sprints = **~14,595 XP**
- Full tree mastery costs **15,810 XP** (sum of masteryThresholds; unlock spend counts toward mastery)
- Design intent: content covers ~92% of full mastery; reviews + time tracking close the gap
- Level curve is **1.35×** (was 1.5×): all content ≈ L13, an engaged year ≈ L14-15. Don't steepen it back.
- Review XP scales with stage: `min(5 + (stage-1)*2, 13)` — later-stage recalls pay more. Mirrored in ReviewQueue UI (`nextPassXP`), keep in sync with `recordReview`.
- When adding a node: masteryThreshold = 3 × xpCost (convention), and add 5 lessons so content income keeps pace with costs.

### XP Rates (Time Tracker)

```typescript
Learning: 4 XP/min
Music:    4 XP/min
Fitness:  3 XP/min
Productivity: 2 XP/min
Other:    1 XP/min
// All divided by 10 when calculating: Math.floor(minutes * rate / 10)
```

### Synergy Map (in store)

Unlocking synergy peers gives an XP discount when unlocking the synergy node:
```typescript
discipline:         peers: ['consistency'], bonus: 0.1
consistency:        peers: ['discipline', 'focus'], bonus: 0.1
focus:              peers: ['discipline', 'consistency'], bonus: 0.1
learning:           peers: ['creativity', 'problem_solving'], bonus: 0.08
saving:             peers: ['investing'], bonus: 0.08
rhetoric_writing:   peers: ['ancient_philosophy', 'world_cultures'], bonus: 0.1
day_trading_mastery: peers: ['technical_analysis', 'trading_psychology', 'risk_management'], bonus: 0.12
```

### OverlayView Type

```typescript
type OverlayView = 'time' | 'stats' | 'xpledger' | 'sprint' | 'review' | 'account' | null;
```
Setting overlay to `null` returns to the skill tree view. `setOverlay(null)` is called when 'tree' nav tab is pressed.

---

## Data Structures

### SkillNode (src/data/nodes.ts)

```typescript
interface SkillNode {
  id: string;              // unique slug e.g. 'strength', 'day_trading_mastery'
  name: string;            // display name e.g. 'STRENGTH'
  category: NodeCategory;  // one of 9 categories (see below)
  description: string;     // shown in NodePanel info tab
  xpCost: number;          // XP required to unlock
  masteryThreshold: number; // total XP invested to master (always 3× xpCost conventionally)
  requiredNodes: string[]; // prerequisite node ids (must be unlocked/mastered first)
  position: { x: number; y: number }; // pixel position on 4200×850 canvas
}
```

### Lesson (src/data/lessons.ts)

```typescript
interface Lesson {
  id: string;              // unique e.g. 'math-1', 'dt-5'
  nodeId: string;          // which node this lesson belongs to
  order: number;           // 1-based sort order within the node
  title: string;
  xpReward: number;        // XP earned on completion
  difficulty: 'easy' | 'medium' | 'hard';
  whyItMatters?: string;   // optional 1-2 sentence hook shown at top
  explanation: string;     // main lesson text
  bullets: string[];       // 5-7 key points
  example?: string;        // optional concrete example
  quiz: QuizQuestion[];    // 3-6 questions, 4 options each, ordered easy→hard. New convention: 6 questions with `why` on each (see maths_basics)
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];       // always exactly 4
  correctIndex: number;    // 0-3
  why?: string;            // shown after answering — explains the correct answer.
                           // Present on maths_basics (flagship); add to all new/expanded quizzes.
}

type LessonTier = 'foundation' | 'gcse' | 'alevel' | 'degree';  // UK academic ladder
// Lesson.tier?: LessonTier — absent = 'foundation'. Exports: TIER_ORDER, TIER_META
// (label/short/color per tier), lessonTier(l) helper.
```

`LESSONS_BY_NODE` is a pre-built lookup: `Record<string, Lesson[]>` where lessons are sorted by `order`.

### SkillSprint (src/data/skillSprints.ts)

```typescript
interface SkillSprint {
  id: string;
  title: string;
  category: SprintCategory;
  tagline: string;
  totalMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xpReward: number;         // awarded once on full completion (one-time, not repeatable)
  color: string;            // hex, matches category color
  icon: string;             // single character or symbol
  steps: SprintStep[];      // typically 6 steps
}

interface SprintStep {
  id: string;
  title: string;
  duration: number;         // minutes
  instruction: string;      // the main lesson content
  tip?: string;             // optional callout
  actionPrompt?: string;    // what the user physically does
}
```

---

## Color System

All colors are 10% brighter than the original design spec.

```typescript
// Node category colors (CATEGORY_COLORS in nodes.ts)
PHYSICAL:      '#FF6666'   red
MENTAL:        '#8833FF'   purple
INTELLECTUAL:  '#33F3FF'   cyan
FINANCIAL:     '#5FFF3D'   green
ACADEMIC:      '#FFA333'   orange
CRAFT:         '#FF5592'   pink
ECONOMICS:     '#00C8A0'   teal
CULTURE:       '#FFB800'   gold
TRADING:       '#FF7A00'   orange-red

// Sprint category colors (CATEGORY_COLOR in skillSprints.ts)
Productivity:  '#5FFF3D'
Communication: '#33F3FF'
Finance:       '#00C8A0'
Fitness:       '#FF6666'
Tech:          '#8833FF'
Mental:        '#FFA333'
Social:        '#FF5592'
Creative:      '#FFB800'
```

Background: `#03030A` (near-black, almost pure black with a blue tint). UI surfaces: `#06060E`, `#08080f`.

---

## Canvas Layout — All 65 Nodes

Canvas dimensions: **4200 × 850 px**. Zone dividers at x: `[430, 810, 1190, 1620, 2160, 2600, 3130, 3650]`.

### Zone 1 — PHYSICAL (x: 0–430, color: #FF6666)
| id | name | xpCost | prereqs | position |
|---|---|---|---|---|
| strength | STRENGTH | 80 | — | 180, 300 |
| endurance | ENDURANCE | 80 | — | 180, 480 |
| mobility | MOBILITY | 60 | strength, endurance | 320, 390 |
| sleep_science | SLEEP SCIENCE | 60 | — | 90, 160 |
| hiit_training | HIIT TRAINING | 70 | endurance | 100, 590 |
| first_aid | FIRST AID | 60 | — | 300, 170 |
| self_defence | SELF DEFENCE | 70 | strength | 350, 590 |

### Zone 2 — MENTAL (x: 430–810, color: #8833FF)
| id | name | xpCost | prereqs | position |
|---|---|---|---|---|
| focus | FOCUS | 70 | — | 560, 220 |
| discipline | DISCIPLINE | 90 | — | 560, 400 |
| consistency | CONSISTENCY | 100 | discipline | 700, 310 |
| elite_focus | ELITE FOCUS *(synergy)* | 150 | discipline, consistency, focus | 840, 310 |
| resilience | RESILIENCE | 80 | discipline | 595, 560 |
| memory_techniques | MEMORY | 75 | focus | 700, 160 |

### Zone 3 — INTELLECTUAL (x: 810–1190, color: #33F3FF)
| id | name | xpCost | prereqs | position |
|---|---|---|---|---|
| learning | LEARNING | 75 | — | 940, 200 |
| problem_solving | PROBLEM SOLVING | 85 | learning | 1080, 340 |
| creativity | CREATIVITY | 95 | learning, problem_solving | 940, 480 |
| apex_mind | APEX MIND *(synergy)* | 200 | elite_focus, creativity | 1080, 480 |
| critical_thinking | CRITICAL THINKING | 85 | learning | 850, 370 |
| ai_literacy | AI LITERACY | 90 | learning | 1000, 630 |
| language_learning | LANGUAGES | 85 | learning | 1150, 200 |

### Zone 4 — FINANCIAL (x: 1190–1620, color: #5FFF3D)
| id | name | xpCost | prereqs | position |
|---|---|---|---|---|
| saving | SAVING | 60 | — | 1280, 340 |
| investing | INVESTING | 110 | saving | 1420, 220 |
| income_growth | INCOME GROWTH | 130 | saving, investing | 1420, 460 |
| tax_basics | TAX BASICS | 75 | saving | 1340, 490 |
| real_estate | REAL ESTATE | 120 | investing | 1510, 360 |
| entrepreneurship | ENTREPRENEURSHIP | 110 | saving | 1260, 180 |

### Zone 5 — ACADEMIC (x: 1620–2160, color: #FFA333)
| id | name | xpCost | prereqs | position |
|---|---|---|---|---|
| maths_basics | MATHEMATICS | 70 | — | 1740, 260 |
| english_writing | ENGLISH WRITING | 70 | — | 1740, 510 |
| science_foundations | SCIENCE | 80 | maths_basics | 1900, 380 |
| philosophy | PHILOSOPHY | 90 | science_foundations | 2060, 250 |
| british_politics | BRITISH POLITICS | 90 | english_writing | 2060, 500 |
| psychology | PSYCHOLOGY | 85 | science_foundations | 1770, 430 |
| statistics | STATISTICS | 80 | maths_basics | 1930, 170 |
| world_history | WORLD HISTORY | 85 | — | 1900, 620 |

### Zone 6 — CRAFT (x: 2160–2600, color: #FF5592)
| id | name | xpCost | prereqs | position |
|---|---|---|---|---|
| guitar | GUITAR | 60 | — | 2280, 250 |
| music_theory | MUSIC THEORY | 80 | guitar | 2440, 370 |
| cooking | COOKING | 60 | — | 2280, 510 |
| nutrition | NUTRITION | 70 | cooking | 2440, 510 |
| photography | PHOTOGRAPHY | 65 | — | 2325, 390 |
| coding_basics | CODING | 90 | — | 2510, 240 |
| diy_repairs | DIY & REPAIRS | 60 | — | 2230, 660 |

### Zone 7 — ECONOMICS (x: 2600–3130, color: #00C8A0)
| id | name | xpCost | prereqs | position |
|---|---|---|---|---|
| macro_economics | MACROECONOMICS | 80 | — | 2720, 270 |
| micro_economics | MICROECONOMICS | 80 | — | 2720, 520 |
| global_markets | GLOBAL MARKETS | 110 | macro_economics, micro_economics | 2900, 390 |
| economic_history | ECONOMIC HISTORY | 90 | macro_economics | 3060, 260 |
| behavioural_economics | BEHAVIOURAL ECON | 90 | micro_economics | 3050, 510 |
| geopolitics | GEOPOLITICS | 100 | global_markets | 2870, 640 |

### Zone 8 — CULTURE (x: 3130–3650, color: #FFB800)
| id | name | xpCost | prereqs | position |
|---|---|---|---|---|
| world_religions | WORLD RELIGIONS | 80 | — | 3200, 270 |
| classical_literature | CLASSIC LIT | 80 | — | 3200, 510 |
| ancient_philosophy | ANCIENT PHILOSOPHY | 100 | world_religions | 3380, 220 |
| world_cultures | WORLD CULTURES | 90 | classical_literature | 3380, 510 |
| rhetoric_writing | RHETORIC & WRITING *(synergy)* | 120 | ancient_philosophy, world_cultures | 3540, 370 |
| art_history | ART HISTORY | 80 | — | 3250, 660 |

### Zone 9 — TRADING (x: 3650–4200, color: #FF7A00)
| id | name | xpCost | prereqs | position |
|---|---|---|---|---|
| markets_101 | MARKETS 101 | 80 | — | 3720, 310 |
| technical_analysis | TECHNICAL ANALYSIS | 100 | markets_101 | 3880, 220 |
| trading_psychology | TRADING PSYCHOLOGY | 100 | markets_101 | 3880, 480 |
| risk_management | RISK MANAGEMENT | 120 | technical_analysis, trading_psychology | 4050, 350 |
| day_trading_mastery | DAY TRADING *(synergy)* | 180 | risk_management | 4180, 350 |
| crypto_fundamentals | CRYPTO | 90 | markets_101 | 3760, 590 |

**Total nodes: 65. Dashboard displays `/ 65`.**

---

## Lessons — Node Coverage

**All 65 nodes have exactly 5 lessons — 315 lessons total (~1,080 quiz questions).** Legacy lessons have 3 quiz questions; the new convention (session 8) is **6 questions per quiz, ordered easy→hard, each with a `why` explanation** — `maths_basics` is the flagship example. Expand other nodes to this standard over time. Any quiz size works: the mastery exam draws 10 from whatever pool exists.

Lesson id prefixes by node (for adding more): str, end (endurance), focus, disc, cons (consistency), learn, save, math, eng, sci, phil, pol, guitar, mtheory, cook, nut, sleep, hiit, res (resilience), mem, ct (critical_thinking), tax, re (real_estate), psych, photo, code, mob (mobility), prob (problem_solving), creat, inv (investing), inc (income_growth), ef (elite_focus), apex, fa (first_aid), ai (ai_literacy), stat (statistics), diy (diy_repairs), behav (behavioural_economics), art (art_history), wh (world_history), ent (entrepreneurship), lang (language_learning), sd (self_defence), cr (crypto_fundamentals), geo (geopolitics), bio (human_biology), mh (mental_health), law (everyday_law), astro (astronomy), enc (energy_climate), mus (music_history), plus full-slug prefixes for economics/culture/trading nodes (e.g. `macro_economics` lessons use ids like `macro-1`... check the file).

---

## SkillSprint Feature

**35 pre-built sprint plans** across 8 categories. Each sprint has 6 steps with `instruction`, `tip?`, and `actionPrompt?`. XP is awarded **once** when all steps are completed (completedSprints prevents double-awarding).

### Current Sprints

| id | title | category | XP |
|---|---|---|---|
| deep_work | Deep Work Fundamentals | Productivity | 80 |
| time_blocking | Time Blocking Mastery | Productivity | 70 |
| speed_reading | Speed Reading That Actually Works | Productivity | 65 |
| note_taking | Note-Taking That Actually Works | Productivity | 60 |
| meta_learning | Meta-Learning: Learn Anything Faster | Productivity | 85 |
| public_speaking | Public Speaking Fast-Track | Communication | 85 |
| negotiation | Negotiation Essentials | Communication | 90 |
| active_listening | Active Listening | Communication | 60 |
| storytelling | The Art of Storytelling | Communication | 75 |
| sales_essentials | Sales & Persuasion Essentials | Communication | 85 |
| personal_finance_101 | Personal Finance 101 | Finance | 85 |
| investing_101 | Investing for Beginners | Finance | 85 |
| strength_basics | Strength Training Fundamentals | Fitness | 75 |
| nutrition_101 | Nutrition 101 | Fitness | 70 |
| python_basics | Python for Total Beginners | Tech | 90 |
| data_analysis | Data Analysis Basics | Tech | 85 |
| mindfulness | Mindfulness & Meditation | Mental | 65 |
| emotional_intelligence | Emotional Intelligence | Mental | 80 |
| stoicism | Practical Stoicism | Mental | 70 |
| habit_engineering | Habit Engineering | Mental | 75 |
| confidence_builder | Building Genuine Confidence | Social | 80 |
| networking | Strategic Networking | Social | 75 |
| career_accelerator | Career Accelerator | Social | 80 |
| creative_writing | Creative Writing Fundamentals | Creative | 75 |
| design_thinking | Design Thinking | Creative | 80 |
| digital_security | Digital Security & Privacy | Tech | 80 |
| ai_tools | AI Tools Mastery | Tech | 85 |
| difficult_conversations | Difficult Conversations | Communication | 85 |
| deep_relationships | Deep Relationships | Social | 75 |
| chess_fundamentals | Chess in Two Hours | Creative | 75 |
| everyday_cooking | Everyday Cooking Confidence | Fitness | 75 |
| body_language | Body Language Decoded | Communication | 70 |
| first_5k | Couch to Your First 5K | Fitness | 70 |
| declutter_minimalism | Declutter Your Life | Productivity | 70 |
| personal_brand | Personal Brand & Online Presence | Social | 75 |

### Sprint UI Flow

1. `SprintHome` — grid of all sprints with category filter + search
2. `SprintPlanView` — step list with checkboxes, progress bar, "Start Focus Mode" button
3. `FocusMode` — full-screen (z-index 200) with per-step countdown timer

Sprint progress persists via `sprintProgress` (step-level) and `completedSprints` (sprint-level) in Zustand.

---

## AppNav — Tab Routing

| Tab | id | Action |
|---|---|---|
| SKILL TREE | 'tree' | `setOverlay(null)` |
| SPRINT | 'sprint' | `setOverlay('sprint')` |
| REVIEW | 'review' | `setOverlay('review')` — shows purple badge with due-review count |
| TIME | 'time' | `setOverlay('time')` |
| STATS | 'stats' | `setOverlay('stats')` |
| XP LEDGER | 'xpledger' | `setOverlay('xpledger')` |

AppNav z-index is **300** — higher than all overlays so navigation is always accessible.

## Dashboard Extras

- **TODAY panel** — daily loop: due reviews (→ review overlay), next suggested lesson (first incomplete lesson of an unlocked node, opens directly via `setActiveLesson`), active sprint (→ sprint overlay)
- **DATA_BACKUP section** — Export downloads localStorage `ascend-v2` as JSON; Import validates zustand persist shape (`{state, version}`), writes localStorage, reloads page

---

## Styling Conventions

- **All styles are inline** (`style={{ ... }}`). No CSS classes except in `App.css` and `index.css`.
- `fontFamily: 'Orbitron, sans-serif'` for all headings, labels, numbers.
- `fontFamily: 'Inter, sans-serif'` (default body, not always explicit) for longer text.
- `fontSize` in pixels on inline styles.
- Colors defined locally or pulled from `CATEGORY_COLORS` / `CATEGORY_GLOW`.
- Framer Motion used via `<motion.div>`, `<motion.button>`, `<AnimatePresence>`.
- No CSS variables. No Tailwind.

---

## Known Constraints and Gotchas

1. **No backend** — adding features that need a server (AI generation, user accounts, Stripe) requires creating a backend from scratch. Currently there is none.
2. **Inline styles** — all styling is inline. Do not add Tailwind or CSS classes unless refactoring the whole component.
3. **AppNav z-index 300** — never lower this below the highest overlay z-index or users will get trapped in overlays.
4. **LESSONS_BY_NODE** — this is a pre-computed lookup at the bottom of `lessons.ts`. Adding lessons to `LESSONS` automatically includes them. Do not manually edit `LESSONS_BY_NODE`.
5. **Store persistence** — only fields listed in `partialize` are persisted. If adding new state that should survive refresh, add it to `partialize`.
6. **Sprint XP** — `completeSprint` checks `completedSprints.includes(sprintId)` before awarding XP. Sprints are one-time completions.
7. **Canvas coordinates** — node `position.x` must be within the correct zone's x-range (see zone table). Adding a node to a zone with wrong x will visually place it in the wrong zone.
8. **Node unlock logic** — `getNodeStatus` checks: mastered > unlocked > (prereqs met → available) > locked. `unlockNode` silently returns if status is not 'available'.
9. **`resetAll()`** — in Dashboard's DANGER_ZONE section, two-step confirmation required. Wipes all XP, nodes, lessons, streaks, and sprints.

---

## Adding Content — Quick Reference

### Add a new node
1. Add to `NODES` array in `src/data/nodes.ts` with correct zone x-position
2. Update Dashboard `/ 65` count to reflect new total
3. Optionally add lessons for it in `src/data/lessons.ts`

### Add new lessons to an existing node
Insert before the `];` at the end of the `LESSONS` array in `src/data/lessons.ts`. Use the next available id prefix for that node (e.g. if node has `mem-1` to `mem-5`, add `mem-6`). Set `order` to the next number.

### Add a new sprint
Add to `SKILL_SPRINTS` array in `src/data/skillSprints.ts`. Use a unique `id`. No other changes needed — the UI auto-renders all sprints.

### Add a new overlay/tab
1. Add the new value to `OverlayView` type in `useAscendStore.ts`
2. Add the nav item to `NAV_ITEMS` in `AppNav.tsx`
3. Create the component
4. Mount it in `App.tsx` (alongside `<TimeTracker />`, `<ProgressDashboard />`, etc.)

---

## What Was Built (Session History)

### Session 1
- Landing page, SkillTree canvas, NodePanel, LessonView, Dashboard, AppNav, XPBar, TimeTracker, ProgressDashboard

### Session 2
- Reset button (two-step confirm) in Dashboard
- Colors brightened ~10% across all components
- 14 new nodes: ECONOMICS ×4, CULTURE ×5, TRADING ×5
- Canvas expanded from 2600 → 4200px
- MiniMap component (clickable, navigates canvas)
- Day streak tracking (currentStreak + lastActiveDate in store, shown in XPBar)
- `whyItMatters` field on Lesson interface, rendered in LessonView
- Synergy map for rhetoric_writing and day_trading_mastery

### Session 3
- 70 lessons added for the 14 new nodes (5 per node, full quiz content)
- CLAUDE.md initial version

### Session 4 (SkillSprint + expansion)
- SkillSprint feature: new overlay, 13 initial sprint plans, Focus Mode with countdown timer
- `'sprint'` added to OverlayView type
- Sprint state added to store (completedSprints, sprintProgress, 3 actions)
- Sprint tab added to AppNav
- AppNav z-index bumped from 48 → 300 (bug fix: nav was hidden behind sprint overlay)
- 10 new skill tree nodes: sleep_science, hiit_training, resilience, memory_techniques, critical_thinking, tax_basics, real_estate, psychology, photography, coding_basics
- 50 new lessons for those 10 nodes
- 8 more sprint topics added (total 21)
- Dashboard node count updated to / 47

### Session 5 (Learning engine)
- **Spaced repetition** — ReviewQueue overlay, `'review'` OverlayView, `reviewStates` + `recordReview` in store, `computeDueLessons` helper, intervals 1/3/7/21/60 days, +5 XP per passed review, due-count badge on nav
- **Mastery exams** — MasteryExam component, `passedExams` + `passExam` in store, exam button in NodePanel lessons tab; mastery for lesson-bearing nodes now requires XP threshold AND exam pass; exam pass awards xpCost/2 bonus XP
- **Data export/import** — DATA_BACKUP section in Dashboard, JSON download/restore of localStorage
- **Today panel** — Dashboard section: due reviews, next lesson, active sprint with direct navigation
- **35 lessons** for the previously uncovered nodes: mobility, problem_solving, creativity, investing, income_growth, elite_focus, apex_mind
- **10 lessons** for endurance and consistency (discovered uncovered — docs had been wrong)
- **4 new sprints**: meta_learning, habit_engineering, sales_essentials, career_accelerator (total 25)
- Full coverage reached: 47/47 nodes, 225 lessons

### Session 6 (Economy, analytics, performance)
- **XP economy audit**: content XP ~11.7k vs 12.8k full-mastery cost (91% coverage — by design, kept). Level curve softened 1.5× → 1.35× so long-term levelling stays alive. Review XP now scales with stage: min(5 + (stage-1)×2, 13)
- **Memory retention analytics** in ProgressDashboard (Stats overlay): retention % (colour-coded), reviews passed, lapses, due-now count, knowledge-strength distribution (NEW/LEARNING/SOLID/PERMANENT buckets by review stage), leakiest lessons (top 3 by lapses)
- **Code splitting**: overlays lazy-loaded, skillSprints.ts split from main bundle (1,013KB → 846KB main), Dashboard uses dynamic import for sprint title

### Session 7 (Rounded-person content)
- 6 new nodes (total 53): first_aid, ai_literacy, statistics, diy_repairs, behavioural_economics, art_history
- 30 new lessons (total 255) — all 53 nodes have 5 lessons; prefixes fa/ai/stat/diy/behav/art
- 6 new sprints (total 31): digital_security, ai_tools, difficult_conversations, deep_relationships, chess_fundamentals, everyday_cooking
- Dashboard count → / 53; economy re-audited: content ~13,191 XP vs 14,190 full mastery (93%)

### Session 8 (Lesson experience + mobile fixes)
- **Mobile scroll bug fixed**: `flex: 1; overflowY: auto` children inside flex columns need `minHeight: 0` or they clip instead of scroll (worst on iOS). Fixed in LessonView, NodePanel, ProgressDashboard + added `WebkitOverflowScrolling/touchAction/overscrollBehavior`. ANY new flex-column overlay with a scrolling body needs `minHeight: 0`.
- **Answer explanations**: `why?: string` on QuizQuestion; feedback panel after each answer in LessonView (✓ CORRECT / ✗ NOT QUITE + correct answer + why), why also in results list and ReviewQueue reveals
- **Warm-up prediction**: unscored quiz[0] guess at the top of the reading stage (testing effect)
- **Auto time-tracking**: LessonView starts a Learning timer on open (if none running) and stops it on close — only stops the timer it started (matched by startedAt)
- **Time XP rebalanced**: divisor /10 → /4 (Learning ≈ 1 XP/min); TimeTracker display math updated in 2 places
- **Quiz depth (flagship)**: maths_basics expanded to 6 questions per lesson, easy→hard, all with why (30 questions, was 15). This is the template for progressively deepening every node.

### Academic Tier System (session 13)

- **`tier?: LessonTier`** on Lesson: `'foundation' | 'gcse' | 'alevel' | 'degree'` (UK ladder). Absent = foundation. `lessonTier(l)` resolves it; `TIER_ORDER` and `TIER_META` (label + colour per tier) exported from lessons.ts.
- **NodePanel UI**: `tierGroups` partitions a node's lessons by tier. If >1 tier present (`isTiered`), the lessons tab renders the **academic ladder** — tier headers (FOUNDATION green / GCSE cyan / A-LEVEL orange / DEGREE pink) with per-tier progress, continuous lesson numbering. Single-tier nodes render flat, unchanged. The lesson button is extracted to `renderLessonBtn(lesson, displayNum)`.
- **LessonView**: shows the tier badge in the header (only when `lesson.tier` is set).
- **FLAGSHIP: Mathematics** is the complete four-tier ladder — Foundation (math-1,2), GCSE (math-3,4,5,6,7), A-Level (math-8 differentiation, 9 integration, 10 sequences/series/functions), Degree (math-11 proof/logic, 12 linear algebra, 13 limits/analysis). 13 lessons, ~65 questions.
- **ROLLOUT PLAN** — extend the ladder to these applicable academic nodes (skill/practice nodes like strength/discipline/guitar stay flat, untiered): maths_basics ✅, science_foundations ✅, human_biology ✅, world_history ✅, philosophy ✅, psychology ✅ (all 10-lesson 4-tier ladders); then statistics, english_writing, economics nodes, astronomy, energy_climate, ancient_philosophy, classical_literature, geography-type nodes. Pattern per node: tag existing 5 lessons with tiers, then ADD A-Level and Degree lessons (5 Q each, all with `why`). Verify with `npm run build` after each — lessons.ts is large and past edits have corrupted it mid-file.

### Session 9 (Rounded-person expansion II)
- 6 new nodes (total 59): self_defence, language_learning, entrepreneurship, world_history, geopolitics, crypto_fundamentals
- 30 new lessons (total 285, ~930 questions) — ALL new lessons follow the new convention: 5 progressive questions each, every question with `why`
- 4 new sprints (total 35): body_language, first_5k, declutter_minimalism, personal_brand
- Dashboard → / 59; economy: content ~14,595 XP vs 15,810 mastery (92%)

### Session 12 (Expansion III)
- 6 new nodes (total 65): human_biology, mental_health, everyday_law, astronomy, energy_climate, music_history
- 30 new lessons (total 315, ~1,080 questions) — all with 5 progressive questions + why each
- Dashboard → / 65; economy re-audited (~92%)
- NOTE: an errored Edit had corrupted lessons.ts mid-file (truncated bio-1, missing `];`); repaired by replacing the broken fragment through the lookup code with the full lesson set. Always verify `npm run build` after large lesson edits.

### Session 13 (Academic tier system + Maths ladder)
- Added `tier` to Lesson (foundation/gcse/alevel/degree) + TIER_META/TIER_ORDER/lessonTier
- NodePanel groups tiered nodes into an academic-ladder UI (headers + per-tier progress); LessonView shows a tier badge
- Mathematics built into a full 4-tier ladder: 8 new lessons (math-6..13) through GCSE→A-Level→Degree (differentiation, integration, series, proof, linear algebra, analysis). Total lessons 323, ~1,120 questions
- Rollout plan documented for remaining academic nodes (see Academic Tier System section)

### Session 14 (Science ladders)
- science_foundations → full ladder (sci-6..10: electricity, bonding, genetics/evolution [A-Level], quantum/relativity, thermodynamics [Degree])
- human_biology → full ladder (bio-6..10: genetics, evolution, enzymes [A-Level], molecular biology, homeostasis [Degree])
- Total lessons 333, ~1,170 questions

### Session 18 (PWA + deploy)
- `vite-plugin-pwa` added: manifest, service worker (Workbox, autoUpdate), full offline precache (~1.6 MiB), Google Fonts runtime-cached. Config in vite.config.ts.
- Icons: `scripts/icon-source.svg` → PNGs via `scripts/gen-icons.mjs` (`npm run gen-icons`, uses sharp devDep) → public/pwa-192, pwa-512 (+maskable), apple-touch-icon(180). index.html has iOS meta tags (apple-mobile-web-app-*, theme-color, viewport-fit=cover).
- Deploy configs: `vercel.json` + `netlify.toml` (build npm run build, output dist, SPA rewrites, immutable asset caching, no-cache on sw.js). README has install + deploy instructions.
- Not yet deployed to a live host (needs user's Vercel/Netlify account); everything is deploy-ready and verified via `npm run preview`.

### Session 17 (Store versioning + migrations)
- persist config now has `version: PERSIST_VERSION` (1), `migrate`, defensive `merge`, and `onRehydrateStorage` error logging
- `persistedDefaults()` is the single source of truth for persisted shape; `coercePersisted(raw)` heals partial/corrupt/legacy saves (missing fields → defaults, wrong types → replaced) without losing valid progress; `migrateState(persisted, fromVersion)` handles version upgrades
- **When you change a persisted field's shape/meaning**: bump PERSIST_VERSION and add a case in migrateState BEFORE the final coerce. Adding a new field only needs it added to persistedDefaults() + coercePersisted() + partialize.
- Verified: legacy saves preserve xp/streak/progress and default new fields; corrupt/garbage data heals to a valid shape; valid saves round-trip unchanged

### Session 16 (Quiz-integrity fix)
- **Answer-position leak fixed**: authored quizzes had ~80% of correct answers at index 1, so "always pick B" scored 80%. New `lib/shuffleQuiz.ts` (`shuffleQuestion(q, salt)`) shuffles options with a seeded PRNG and remaps correctIndex + keeps `why` attached. Applied in LessonView (memoized per lesson+attempt; warm-up + results use the shuffled quiz), MasteryExam (each drawn question shuffled), ReviewQueue (shuffled per review). Correct-answer position now ~25% each.
- IMPORTANT: authored data still has the skew — never rely on correctIndex position; always render through shuffleQuestion. When writing new questions, position doesn't matter (shuffled at render), but vary it anyway for safety.

### Session 15 (Humanities ladders)
- world_history → ladder (wh-6..10): sources, causation, interpretations [A-Level]; historiography, discipline/method [Degree] — shifts from what-happened to how-we-know
- philosophy → ladder (phil-6..10): metaphysics, political philosophy, philosophy of religion [A-Level]; philosophy of mind/consciousness, metaethics/traditions [Degree]
- psychology → ladder (psych-6..10): research methods, memory, approaches [A-Level]; biopsychology, statistics/replication crisis [Degree]
- Total lessons 348, ~1,245 questions; 63 tiered lessons across 6 nodes

### Session 10 (Accounts + backend)
- **Supabase backend**: `supabase/schema.sql` (user_state table + RLS), `.env.example`, `.env` gitignored
- **New files**: `lib/supabase.ts`, `lib/sync.ts`, `store/useAuthStore.ts`, `components/AccountPanel.tsx`
- **ACCOUNT nav tab** (7 tabs now), `'account'` OverlayView
- Email/password auth, auto-sync (3s debounce), login pull with virgin-device adoption and two-button conflict resolution
- Bundle: supabase-js confined to the lazy sync chunk; tree-shaken to zero when env unconfigured

### Session 11 (Mobile support)
- Touch pan/pinch for the skill tree canvas (was mouse-only — unusable on phones)
- Icon-only AppNav on mobile (7 labelled tabs overflowed phone widths)
- iOS input-zoom fix, tap-highlight removal, overlay edge padding, scrollable MasteryExam/FocusMode
- MiniMap hidden on mobile; Dashboard toggle lifted above nav; XPBar/NodePanel/Dashboard panel responsive widths
- New: hooks/useIsMobile.ts
