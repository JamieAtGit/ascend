export type NodeStatus = 'locked' | 'available' | 'unlocked' | 'mastered';
export type NodeCategory =
  | 'PHYSICAL'
  | 'MENTAL'
  | 'INTELLECTUAL'
  | 'FINANCIAL'
  | 'ACADEMIC'
  | 'CRAFT'
  | 'ECONOMICS'
  | 'CULTURE'
  | 'TRADING';

export interface SkillNode {
  id: string;
  name: string;
  category: NodeCategory;
  description: string;
  xpCost: number;
  masteryThreshold: number;
  requiredNodes: string[];
  position: { x: number; y: number };
}

export const NODES: SkillNode[] = [
  // ── PHYSICAL ────────────────────────────────────────────────────────────────
  {
    id: 'strength',
    name: 'STRENGTH',
    category: 'PHYSICAL',
    description: 'Forge raw power. Resistance training, progressive overload, and structural development.',
    xpCost: 80, masteryThreshold: 240,
    requiredNodes: [],
    position: { x: 180, y: 300 },
  },
  {
    id: 'endurance',
    name: 'ENDURANCE',
    category: 'PHYSICAL',
    description: 'Push past limits. Cardiovascular capacity, stamina, and metabolic conditioning.',
    xpCost: 80, masteryThreshold: 240,
    requiredNodes: [],
    position: { x: 180, y: 480 },
  },
  {
    id: 'mobility',
    name: 'MOBILITY',
    category: 'PHYSICAL',
    description: 'Fluid movement architecture. Flexibility, range of motion, injury prevention.',
    xpCost: 60, masteryThreshold: 180,
    requiredNodes: ['strength', 'endurance'],
    position: { x: 320, y: 390 },
  },

  // ── MENTAL ──────────────────────────────────────────────────────────────────
  {
    id: 'focus',
    name: 'FOCUS',
    category: 'MENTAL',
    description: 'Laser precision. Deep work, flow states, and single-task execution.',
    xpCost: 70, masteryThreshold: 210,
    requiredNodes: [],
    position: { x: 560, y: 220 },
  },
  {
    id: 'discipline',
    name: 'DISCIPLINE',
    category: 'MENTAL',
    description: 'Systematic execution. Habit architecture, schedule adherence, and delayed gratification.',
    xpCost: 90, masteryThreshold: 270,
    requiredNodes: [],
    position: { x: 560, y: 400 },
  },
  {
    id: 'consistency',
    name: 'CONSISTENCY',
    category: 'MENTAL',
    description: 'Compound momentum. Daily execution regardless of motivation or environment.',
    xpCost: 100, masteryThreshold: 300,
    requiredNodes: ['discipline'],
    position: { x: 700, y: 310 },
  },
  {
    id: 'elite_focus',
    name: 'ELITE FOCUS',
    category: 'MENTAL',
    description: 'SYNERGY NODE — Discipline + Consistency unlocks superhuman attention architecture.',
    xpCost: 150, masteryThreshold: 450,
    requiredNodes: ['discipline', 'consistency', 'focus'],
    position: { x: 840, y: 310 },
  },

  // ── INTELLECTUAL ────────────────────────────────────────────────────────────
  {
    id: 'learning',
    name: 'LEARNING',
    category: 'INTELLECTUAL',
    description: 'Rapid knowledge acquisition. Reading, retention systems, and mental model expansion.',
    xpCost: 75, masteryThreshold: 225,
    requiredNodes: [],
    position: { x: 940, y: 200 },
  },
  {
    id: 'problem_solving',
    name: 'PROBLEM SOLVING',
    category: 'INTELLECTUAL',
    description: 'Systematic deconstruction. First principles thinking, pattern recognition, and solution mapping.',
    xpCost: 85, masteryThreshold: 255,
    requiredNodes: ['learning'],
    position: { x: 1080, y: 340 },
  },
  {
    id: 'creativity',
    name: 'CREATIVITY',
    category: 'INTELLECTUAL',
    description: 'Divergent synthesis. Connecting distant ideas, generative thinking, novel output.',
    xpCost: 95, masteryThreshold: 285,
    requiredNodes: ['learning', 'problem_solving'],
    position: { x: 940, y: 480 },
  },
  {
    id: 'apex_mind',
    name: 'APEX MIND',
    category: 'INTELLECTUAL',
    description: 'SYNERGY NODE — The convergence of elite focus and intellectual mastery. Rare.',
    xpCost: 200, masteryThreshold: 600,
    requiredNodes: ['elite_focus', 'creativity'],
    position: { x: 1080, y: 480 },
  },

  // ── FINANCIAL ───────────────────────────────────────────────────────────────
  {
    id: 'saving',
    name: 'SAVING',
    category: 'FINANCIAL',
    description: 'Capital preservation. Spending optimisation and buffer architecture.',
    xpCost: 60, masteryThreshold: 180,
    requiredNodes: [],
    position: { x: 1280, y: 340 },
  },
  {
    id: 'investing',
    name: 'INVESTING',
    category: 'FINANCIAL',
    description: 'Capital deployment. Compound growth, risk management, asset allocation.',
    xpCost: 110, masteryThreshold: 330,
    requiredNodes: ['saving'],
    position: { x: 1420, y: 220 },
  },
  {
    id: 'income_growth',
    name: 'INCOME GROWTH',
    category: 'FINANCIAL',
    description: 'Revenue expansion. Skill monetisation, leverage, and income stream diversification.',
    xpCost: 130, masteryThreshold: 390,
    requiredNodes: ['saving', 'investing'],
    position: { x: 1420, y: 460 },
  },

  // ── ACADEMIC ────────────────────────────────────────────────────────────────
  {
    id: 'maths_basics',
    name: 'MATHEMATICS',
    category: 'ACADEMIC',
    description: 'Foundation of all quantitative reasoning. Numbers, algebra, geometry, and statistics.',
    xpCost: 70, masteryThreshold: 210,
    requiredNodes: [],
    position: { x: 1740, y: 260 },
  },
  {
    id: 'english_writing',
    name: 'ENGLISH WRITING',
    category: 'ACADEMIC',
    description: 'Command of language. Sentence structure, essay architecture, tone, and grammar.',
    xpCost: 70, masteryThreshold: 210,
    requiredNodes: [],
    position: { x: 1740, y: 510 },
  },
  {
    id: 'science_foundations',
    name: 'SCIENCE',
    category: 'ACADEMIC',
    description: 'Empirical reality. Scientific method, forces, atoms, cells, and energy.',
    xpCost: 80, masteryThreshold: 240,
    requiredNodes: ['maths_basics'],
    position: { x: 1900, y: 380 },
  },
  {
    id: 'philosophy',
    name: 'PHILOSOPHY',
    category: 'ACADEMIC',
    description: 'Systematic thinking. Logic, ethics, epistemology, and the deepest questions of existence.',
    xpCost: 90, masteryThreshold: 270,
    requiredNodes: ['science_foundations'],
    position: { x: 2060, y: 250 },
  },
  {
    id: 'british_politics',
    name: 'BRITISH POLITICS',
    category: 'ACADEMIC',
    description: 'Constitutional literacy. Parliament, parties, law-making, and rights.',
    xpCost: 90, masteryThreshold: 270,
    requiredNodes: ['english_writing'],
    position: { x: 2060, y: 500 },
  },

  // ── CRAFT ───────────────────────────────────────────────────────────────────
  {
    id: 'guitar',
    name: 'GUITAR',
    category: 'CRAFT',
    description: 'String mastery. Tuning, chord shapes, rhythm, and first songs.',
    xpCost: 60, masteryThreshold: 180,
    requiredNodes: [],
    position: { x: 2280, y: 250 },
  },
  {
    id: 'music_theory',
    name: 'MUSIC THEORY',
    category: 'CRAFT',
    description: 'The grammar of music. Notes, scales, chords, rhythm, and harmonic structure.',
    xpCost: 80, masteryThreshold: 240,
    requiredNodes: ['guitar'],
    position: { x: 2440, y: 370 },
  },
  {
    id: 'cooking',
    name: 'COOKING',
    category: 'CRAFT',
    description: 'Culinary intelligence. Technique, flavour principles, and meal architecture.',
    xpCost: 60, masteryThreshold: 180,
    requiredNodes: [],
    position: { x: 2280, y: 510 },
  },
  {
    id: 'nutrition',
    name: 'NUTRITION',
    category: 'CRAFT',
    description: 'Fuel science. Macros, micros, hydration, and metabolic strategy.',
    xpCost: 70, masteryThreshold: 210,
    requiredNodes: ['cooking'],
    position: { x: 2440, y: 510 },
  },

  // ── ECONOMICS ───────────────────────────────────────────────────────────────
  {
    id: 'macro_economics',
    name: 'MACROECONOMICS',
    category: 'ECONOMICS',
    description: 'The big picture. GDP, inflation, interest rates, and how national economies rise and fall.',
    xpCost: 80, masteryThreshold: 240,
    requiredNodes: [],
    position: { x: 2720, y: 270 },
  },
  {
    id: 'micro_economics',
    name: 'MICROECONOMICS',
    category: 'ECONOMICS',
    description: 'How individuals and firms make decisions. Supply, demand, pricing, and market dynamics.',
    xpCost: 80, masteryThreshold: 240,
    requiredNodes: [],
    position: { x: 2720, y: 520 },
  },
  {
    id: 'global_markets',
    name: 'GLOBAL MARKETS',
    category: 'ECONOMICS',
    description: 'World trade, currency exchange, international finance, and the forces that connect economies.',
    xpCost: 110, masteryThreshold: 330,
    requiredNodes: ['macro_economics', 'micro_economics'],
    position: { x: 2900, y: 390 },
  },
  {
    id: 'economic_history',
    name: 'ECONOMIC HISTORY',
    category: 'ECONOMICS',
    description: 'Crashes, booms, and the evolution of money. From the Great Depression to 2008 and beyond.',
    xpCost: 90, masteryThreshold: 270,
    requiredNodes: ['macro_economics'],
    position: { x: 3060, y: 260 },
  },

  // ── CULTURE ─────────────────────────────────────────────────────────────────
  {
    id: 'world_religions',
    name: 'WORLD RELIGIONS',
    category: 'CULTURE',
    description: 'The belief systems that shaped civilisation. Abrahamic faiths, Eastern traditions, and secular thought.',
    xpCost: 80, masteryThreshold: 240,
    requiredNodes: [],
    position: { x: 3200, y: 270 },
  },
  {
    id: 'classical_literature',
    name: 'CLASSIC LIT',
    category: 'CULTURE',
    description: 'The books that built the Western mind. Homer, Shakespeare, Dostoevsky, Orwell, and beyond.',
    xpCost: 80, masteryThreshold: 240,
    requiredNodes: [],
    position: { x: 3200, y: 510 },
  },
  {
    id: 'ancient_philosophy',
    name: 'ANCIENT PHILOSOPHY',
    category: 'CULTURE',
    description: 'Socrates, Stoicism, Plato, Aristotle, and the Eastern wisdom of Confucius and Laozi.',
    xpCost: 100, masteryThreshold: 300,
    requiredNodes: ['world_religions'],
    position: { x: 3380, y: 220 },
  },
  {
    id: 'world_cultures',
    name: 'WORLD CULTURES',
    category: 'CULTURE',
    description: 'Understanding humanity. How culture shapes behaviour, values, and society across civilisations.',
    xpCost: 90, masteryThreshold: 270,
    requiredNodes: ['classical_literature'],
    position: { x: 3380, y: 510 },
  },
  {
    id: 'rhetoric_writing',
    name: 'RHETORIC & WRITING',
    category: 'CULTURE',
    description: 'SYNERGY NODE — Master persuasion and prose. Ancient Greek rhetoric meets modern essay craft.',
    xpCost: 120, masteryThreshold: 360,
    requiredNodes: ['ancient_philosophy', 'world_cultures'],
    position: { x: 3540, y: 370 },
  },

  // ── PHYSICAL (additional) ───────────────────────────────────────────────────
  {
    id: 'sleep_science',
    name: 'SLEEP SCIENCE',
    category: 'PHYSICAL',
    description: 'The foundation of recovery. Circadian rhythms, sleep architecture, and performance restoration.',
    xpCost: 60, masteryThreshold: 180,
    requiredNodes: [],
    position: { x: 90, y: 160 },
  },
  {
    id: 'hiit_training',
    name: 'HIIT TRAINING',
    category: 'PHYSICAL',
    description: 'Maximum output in minimum time. High-intensity intervals for conditioning and fat loss.',
    xpCost: 70, masteryThreshold: 210,
    requiredNodes: ['endurance'],
    position: { x: 100, y: 590 },
  },

  // ── MENTAL (additional) ─────────────────────────────────────────────────────
  {
    id: 'resilience',
    name: 'RESILIENCE',
    category: 'MENTAL',
    description: 'Antifragility under pressure. Bouncing back stronger from setbacks, failure, and adversity.',
    xpCost: 80, masteryThreshold: 240,
    requiredNodes: ['discipline'],
    position: { x: 595, y: 560 },
  },
  {
    id: 'memory_techniques',
    name: 'MEMORY',
    category: 'MENTAL',
    description: 'Cognitive enhancement. Memory palaces, spaced repetition, and retention engineering.',
    xpCost: 75, masteryThreshold: 225,
    requiredNodes: ['focus'],
    position: { x: 700, y: 160 },
  },

  // ── INTELLECTUAL (additional) ────────────────────────────────────────────────
  {
    id: 'critical_thinking',
    name: 'CRITICAL THINKING',
    category: 'INTELLECTUAL',
    description: 'Logical rigour. Argument analysis, logical fallacies, bias detection, and evidence evaluation.',
    xpCost: 85, masteryThreshold: 255,
    requiredNodes: ['learning'],
    position: { x: 850, y: 370 },
  },

  // ── FINANCIAL (additional) ───────────────────────────────────────────────────
  {
    id: 'tax_basics',
    name: 'TAX BASICS',
    category: 'FINANCIAL',
    description: 'UK tax literacy. PAYE, self-assessment, ISAs, National Insurance, and legal optimisation.',
    xpCost: 75, masteryThreshold: 225,
    requiredNodes: ['saving'],
    position: { x: 1340, y: 490 },
  },
  {
    id: 'real_estate',
    name: 'REAL ESTATE',
    category: 'FINANCIAL',
    description: 'Property as an asset class. Buy-to-let fundamentals, leverage, yields, and the property ladder.',
    xpCost: 120, masteryThreshold: 360,
    requiredNodes: ['investing'],
    position: { x: 1510, y: 360 },
  },

  // ── ACADEMIC (additional) ────────────────────────────────────────────────────
  {
    id: 'psychology',
    name: 'PSYCHOLOGY',
    category: 'ACADEMIC',
    description: 'The science of mind and behaviour. Cognitive biases, motivation, personality, and social influence.',
    xpCost: 85, masteryThreshold: 255,
    requiredNodes: ['science_foundations'],
    position: { x: 1770, y: 430 },
  },

  // ── CRAFT (additional) ───────────────────────────────────────────────────────
  {
    id: 'photography',
    name: 'PHOTOGRAPHY',
    category: 'CRAFT',
    description: 'Visual storytelling. Composition rules, exposure triangle, light reading, and post-processing.',
    xpCost: 65, masteryThreshold: 195,
    requiredNodes: [],
    position: { x: 2325, y: 390 },
  },
  {
    id: 'coding_basics',
    name: 'CODING',
    category: 'CRAFT',
    description: 'Programming fundamentals. Logic, variables, loops, and building your first real project.',
    xpCost: 90, masteryThreshold: 270,
    requiredNodes: [],
    position: { x: 2510, y: 240 },
  },

  // ── ROUNDED-PERSON ADDITIONS (session 7) ────────────────────────────────────
  {
    id: 'first_aid',
    name: 'FIRST AID',
    category: 'PHYSICAL',
    description: 'Life-saving basics. CPR, choking, bleeding, burns, and keeping calm in emergencies.',
    xpCost: 60, masteryThreshold: 180,
    requiredNodes: [],
    position: { x: 300, y: 170 },
  },
  {
    id: 'ai_literacy',
    name: 'AI LITERACY',
    category: 'INTELLECTUAL',
    description: 'Understand and command AI. How LLMs work, prompting, limits, and using AI as leverage.',
    xpCost: 90, masteryThreshold: 270,
    requiredNodes: ['learning'],
    position: { x: 1000, y: 630 },
  },
  {
    id: 'statistics',
    name: 'STATISTICS',
    category: 'ACADEMIC',
    description: 'The grammar of evidence. Distributions, sampling, significance, and how numbers lie.',
    xpCost: 80, masteryThreshold: 240,
    requiredNodes: ['maths_basics'],
    position: { x: 1930, y: 170 },
  },
  {
    id: 'diy_repairs',
    name: 'DIY & REPAIRS',
    category: 'CRAFT',
    description: 'Practical self-reliance. Tools, walls, plumbing, electrics, and fixing instead of replacing.',
    xpCost: 60, masteryThreshold: 180,
    requiredNodes: [],
    position: { x: 2230, y: 660 },
  },
  {
    id: 'behavioural_economics',
    name: 'BEHAVIOURAL ECON',
    category: 'ECONOMICS',
    description: 'Why humans are predictably irrational. Nudges, biases in markets, and choice architecture.',
    xpCost: 90, masteryThreshold: 270,
    requiredNodes: ['micro_economics'],
    position: { x: 3050, y: 510 },
  },
  {
    id: 'art_history',
    name: 'ART HISTORY',
    category: 'CULTURE',
    description: 'Seeing like a civilisation. From cave paintings to modernism — why art looks the way it does.',
    xpCost: 80, masteryThreshold: 240,
    requiredNodes: [],
    position: { x: 3250, y: 660 },
  },

  // ── EXPANSION (session 9) ───────────────────────────────────────────────────
  {
    id: 'self_defence',
    name: 'SELF DEFENCE',
    category: 'PHYSICAL',
    description: 'Awareness, avoidance, and physical response. De-escalation first, capability when it fails.',
    xpCost: 70, masteryThreshold: 210,
    requiredNodes: ['strength'],
    position: { x: 350, y: 590 },
  },
  {
    id: 'language_learning',
    name: 'LANGUAGES',
    category: 'INTELLECTUAL',
    description: 'Acquire any language efficiently. Comprehensible input, spaced vocab, and speaking early.',
    xpCost: 85, masteryThreshold: 255,
    requiredNodes: ['learning'],
    position: { x: 1150, y: 200 },
  },
  {
    id: 'entrepreneurship',
    name: 'ENTREPRENEURSHIP',
    category: 'FINANCIAL',
    description: 'Build something people pay for. Validation, MVPs, unit economics, and the founder mindset.',
    xpCost: 110, masteryThreshold: 330,
    requiredNodes: ['saving'],
    position: { x: 1260, y: 180 },
  },
  {
    id: 'world_history',
    name: 'WORLD HISTORY',
    category: 'ACADEMIC',
    description: 'The grand narrative. Empires, revolutions, wars, and the forces that shaped the modern world.',
    xpCost: 85, masteryThreshold: 255,
    requiredNodes: [],
    position: { x: 1900, y: 620 },
  },
  {
    id: 'geopolitics',
    name: 'GEOPOLITICS',
    category: 'ECONOMICS',
    description: 'Why nations act as they do. Geography, power, energy, chokepoints, and grand strategy.',
    xpCost: 100, masteryThreshold: 300,
    requiredNodes: ['global_markets'],
    position: { x: 2870, y: 640 },
  },
  {
    id: 'crypto_fundamentals',
    name: 'CRYPTO',
    category: 'TRADING',
    description: 'Blockchains, Bitcoin, and digital assets. How they work, the real risks, and cutting through hype.',
    xpCost: 90, masteryThreshold: 270,
    requiredNodes: ['markets_101'],
    position: { x: 3760, y: 590 },
  },

  // ── TRADING ─────────────────────────────────────────────────────────────────
  {
    id: 'markets_101',
    name: 'MARKETS 101',
    category: 'TRADING',
    description: 'How financial markets actually work. Exchanges, assets, order types, and market structure.',
    xpCost: 80, masteryThreshold: 240,
    requiredNodes: [],
    position: { x: 3720, y: 310 },
  },
  {
    id: 'technical_analysis',
    name: 'TECHNICAL ANALYSIS',
    category: 'TRADING',
    description: 'Reading price charts. Candlesticks, moving averages, indicators, and pattern recognition.',
    xpCost: 100, masteryThreshold: 300,
    requiredNodes: ['markets_101'],
    position: { x: 3880, y: 220 },
  },
  {
    id: 'trading_psychology',
    name: 'TRADING PSYCHOLOGY',
    category: 'TRADING',
    description: 'The most important skill. Managing fear, greed, FOMO, and the discipline to follow your plan.',
    xpCost: 100, masteryThreshold: 300,
    requiredNodes: ['markets_101'],
    position: { x: 3880, y: 480 },
  },
  {
    id: 'risk_management',
    name: 'RISK MANAGEMENT',
    category: 'TRADING',
    description: 'The 1% rule, position sizing, stop losses, and the mathematics of staying in the game.',
    xpCost: 120, masteryThreshold: 360,
    requiredNodes: ['technical_analysis', 'trading_psychology'],
    position: { x: 4050, y: 350 },
  },
  {
    id: 'day_trading_mastery',
    name: 'DAY TRADING',
    category: 'TRADING',
    description: 'SYNERGY NODE — Technical skill + psychology + risk discipline. The complete active trader.',
    xpCost: 180, masteryThreshold: 540,
    requiredNodes: ['risk_management'],
    position: { x: 4180, y: 350 },
  },
];

export const CATEGORY_COLORS: Record<NodeCategory, string> = {
  PHYSICAL: '#FF6666',
  MENTAL: '#8833FF',
  INTELLECTUAL: '#33F3FF',
  FINANCIAL: '#5FFF3D',
  ACADEMIC: '#FFA333',
  CRAFT: '#FF5592',
  ECONOMICS: '#00C8A0',
  CULTURE: '#FFB800',
  TRADING: '#FF7A00',
};

export const CATEGORY_GLOW: Record<NodeCategory, string> = {
  PHYSICAL: 'rgba(255,102,102,0.4)',
  MENTAL: 'rgba(136,51,255,0.4)',
  INTELLECTUAL: 'rgba(51,243,255,0.4)',
  FINANCIAL: 'rgba(95,255,61,0.4)',
  ACADEMIC: 'rgba(255,163,51,0.4)',
  CRAFT: 'rgba(255,85,146,0.4)',
  ECONOMICS: 'rgba(0,200,160,0.4)',
  CULTURE: 'rgba(255,184,0,0.4)',
  TRADING: 'rgba(255,122,0,0.4)',
};
