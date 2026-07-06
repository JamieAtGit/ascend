export interface SprintStep {
  id: string;
  title: string;
  duration: number; // minutes
  instruction: string;
  tip?: string;
  actionPrompt?: string; // what the user physically does
}

export interface SkillSprint {
  id: string;
  title: string;
  category: SprintCategory;
  tagline: string;
  totalMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xpReward: number;
  color: string;
  icon: string;
  steps: SprintStep[];
}

export type SprintCategory =
  | 'Productivity'
  | 'Communication'
  | 'Finance'
  | 'Fitness'
  | 'Tech'
  | 'Mental'
  | 'Social'
  | 'Creative';

export const CATEGORY_COLOR: Record<SprintCategory, string> = {
  Productivity: '#5FFF3D',
  Communication: '#33F3FF',
  Finance: '#00C8A0',
  Fitness: '#FF6666',
  Tech: '#8833FF',
  Mental: '#FFA333',
  Social: '#FF5592',
  Creative: '#FFB800',
};

export const SKILL_SPRINTS: SkillSprint[] = [
  // ─── PRODUCTIVITY ───────────────────────────────────────────────
  {
    id: 'deep_work',
    title: 'Deep Work Fundamentals',
    category: 'Productivity',
    tagline: 'Enter a flow state on demand',
    totalMinutes: 120,
    difficulty: 'beginner',
    xpReward: 80,
    color: '#5FFF3D',
    icon: '⬡',
    steps: [
      {
        id: 'dw1',
        title: 'Understand What Deep Work Actually Is',
        duration: 15,
        instruction: 'Deep work is cognitively demanding, distraction-free focus on a task that creates real value. Cal Newport defines it as "professional activities performed in a state of distraction-free concentration that push your cognitive capabilities to their limit." The opposite — shallow work — is easy, replicable, and produces little unique value. Most people spend 60–80% of their day on shallow work without realising it.',
        tip: 'Shallow work includes: email, meetings, social media, admin. None of it compounds.',
        actionPrompt: 'Write down your 3 most valuable cognitive tasks — the ones only YOU can do.',
      },
      {
        id: 'dw2',
        title: 'Audit Your Current Environment',
        duration: 10,
        instruction: 'Your environment is silently destroying your focus. Notifications, open browser tabs, background noise, a messy desk — these create micro-interruptions. Each context switch costs 23 minutes of recovery time. You are not distracted because you lack willpower; you are distracted because your environment is designed to distract you.',
        tip: 'Phone face-down still causes distraction. Phone in another room = 26% better performance (UCIrvine study).',
        actionPrompt: 'Count how many notification sources are active on your device right now. Then eliminate them for this session.',
      },
      {
        id: 'dw3',
        title: 'Choose Your Deep Work Ritual',
        duration: 15,
        instruction: 'Elite performers use rituals to trigger focus — the same location, time, sequence of actions signals your brain: "this is serious work time." Options: (1) Monastic — long unbroken blocks, multiple hours. (2) Bimodal — split your day, mornings for deep, afternoons shallow. (3) Rhythmic — same daily time slot, like 6–8am. (4) Journalistic — grab deep work windows wherever they appear. Choose what fits your life, not the ideal.',
        actionPrompt: 'Pick one mode. Write down exactly when tomorrow\'s first deep work block will happen (time + location).',
      },
      {
        id: 'dw4',
        title: 'Execute a 25-Minute Deep Work Block',
        duration: 30,
        instruction: 'You will now do a real deep work session. Before starting: (1) Write ONE task you will work on — no multitasking. (2) Set a 25-minute timer. (3) Close everything except what you need. (4) If a distraction impulse comes, write it down on paper and return to the task. Do not act on it. After the timer: 5-min break, then optionally repeat.',
        tip: 'The urge to check your phone is a feeling, not an obligation. Notice it, note it, ignore it.',
        actionPrompt: 'Start the timer now. Work on the ONE task you identified.',
      },
      {
        id: 'dw5',
        title: 'Build Your Shutdown Ritual',
        duration: 15,
        instruction: 'Zeigarnik effect: unclosed tasks haunt your working memory, sapping focus even when you\'re "done." A shutdown ritual tells your brain: every open loop is captured and handled. The ritual: review your to-do list, capture any unclosed items, write tomorrow\'s first task, say out loud "Shutdown complete." Newport does this every single workday without exception.',
        actionPrompt: 'Write out your shutdown ritual — max 4 steps. Make it repeatable in under 10 minutes.',
      },
      {
        id: 'dw6',
        title: 'Plan Your First Deep Work Week',
        duration: 15,
        instruction: 'Sustainable deep work is built in weeks, not days. Schedule 3–4 deep work blocks per day, 60–90 minutes each. Protect them as you would a meeting with your most important client. Track depth: rate each day 1–5 on how deeply you worked. Adjust blocks based on your natural energy peaks (most people peak 90 min after waking).',
        tip: 'Start with 1 hour per day. Trying to go from 0 to 4 hours immediately always fails.',
        actionPrompt: 'Open your calendar and block three 60-minute deep work sessions for this week. Do it now.',
      },
    ],
  },
  {
    id: 'time_blocking',
    title: 'Time Blocking Mastery',
    category: 'Productivity',
    tagline: 'Own your calendar, own your output',
    totalMinutes: 105,
    difficulty: 'beginner',
    xpReward: 70,
    color: '#5FFF3D',
    icon: '▦',
    steps: [
      {
        id: 'tb1',
        title: 'Why Your To-Do List Is Failing You',
        duration: 10,
        instruction: 'A to-do list is an intention. A time block is a commitment. Lists give you no signal about urgency, no sense of whether the items actually fit your day, and no built-in prioritisation. They grow endlessly and create anxiety. Time blocking forces brutal honesty: if it doesn\'t fit on the calendar, it doesn\'t happen. This is why CEOs, surgeons, and elite athletes all use calendar-first systems.',
        actionPrompt: 'Look at yesterday. How much of your to-do list did you complete? Be honest.',
      },
      {
        id: 'tb2',
        title: 'Categorise Your Work Types',
        duration: 15,
        instruction: 'Before blocking time, understand what types of work you have. (1) Deep cognitive work — requires focus, produces value. (2) Administrative — email, scheduling, logistics. (3) Creative — ideation, writing, designing. (4) Collaborative — calls, meetings, feedback. (5) Maintenance — exercise, sleep, meals. Each type needs different conditions and energy levels. Mixing them destroys efficiency.',
        actionPrompt: 'List your top 5 recurring tasks. Assign each to one of the 5 types above.',
      },
      {
        id: 'tb3',
        title: 'Map Your Energy Curve',
        duration: 10,
        instruction: 'Your energy fluctuates in 90-minute ultradian rhythms throughout the day. Most people have a peak 90 minutes after waking, a post-lunch dip around 1–3pm, and a secondary peak late afternoon. Deep work must go in your peak windows. Admin and shallow work belong in your troughs. Ignoring your energy curve means doing your hardest work when your brain is at its worst.',
        tip: 'Caffeine delays the peak — don\'t caffeinate immediately on waking if you want to track your natural rhythms.',
        actionPrompt: 'Write down: when are you sharpest? When do you feel sluggish? Plan your blocks around this.',
      },
      {
        id: 'tb4',
        title: 'Build Tomorrow\'s Block Schedule',
        duration: 30,
        instruction: 'Now design tomorrow\'s ideal day using 30–90 minute blocks. Rules: (1) Every hour must be assigned — even "admin" or "break." (2) Put your #1 most important task in your first energy peak. (3) Batch all admin into one 30–60 min block. (4) Add a buffer block in the afternoon (things always overrun). (5) Schedule a hard stop time. Leave 15 minutes at the end for your shutdown ritual.',
        actionPrompt: 'Write out tomorrow\'s full block schedule, from wake to sleep. Every hour accounted for.',
      },
      {
        id: 'tb5',
        title: 'The Weekly Review',
        duration: 20,
        instruction: 'Time blocking only works long-term if you review. Every Sunday (or Friday afternoon), do a 20-minute review: (1) What blocks did you actually stick to? (2) Which tasks repeatedly get pushed? (3) What\'s next week\'s #1 outcome? (4) Are your commitments aligned with your actual priorities? The review is where you get smarter. Without it you keep repeating the same weeks.',
        actionPrompt: 'Set a recurring 20-minute calendar event: "Weekly Review — Sunday 7pm" or equivalent.',
      },
      {
        id: 'tb6',
        title: 'Handle Disruptions Without Breaking the System',
        duration: 20,
        instruction: 'Blocks will get disrupted — urgent requests, technical issues, family. The mistake is abandoning the system when this happens. Instead: have a "disruption protocol." If a block is broken: (1) Capture what interrupted you. (2) Re-block the disrupted task later that day or tomorrow. (3) Never let two consecutive days lose a deep work block. Systems don\'t survive perfection — they survive recovery.',
        tip: '"I missed yesterday" should trigger a protocol, not guilt. Guilt is just wasted energy.',
        actionPrompt: 'Write your personal disruption protocol in 3 steps. What do you do when your block gets broken?',
      },
    ],
  },

  // ─── COMMUNICATION ───────────────────────────────────────────────
  {
    id: 'public_speaking',
    title: 'Public Speaking Fast-Track',
    category: 'Communication',
    tagline: 'Speak with confidence in any room',
    totalMinutes: 120,
    difficulty: 'beginner',
    xpReward: 85,
    color: '#33F3FF',
    icon: '◉',
    steps: [
      {
        id: 'ps1',
        title: 'Reframe Nerves as Fuel',
        duration: 10,
        instruction: 'Anxiety and excitement produce identical physiological responses — elevated heart rate, heightened alertness, adrenaline. The difference is the story you tell yourself. Research by Alison Wood Brooks (Harvard) shows people who say "I\'m excited" before speaking perform measurably better than those who try to calm down. Your nerves are not a problem — they\'re performance energy. Use them.',
        tip: 'Before your next presentation, say out loud: "I\'m excited." Not "I\'m calm." Excitement is accurate and useful.',
        actionPrompt: 'Stand up. Take 3 deep breaths. Say: "My nerves are making me sharp right now."',
      },
      {
        id: 'ps2',
        title: 'Master the Power of Pausing',
        duration: 15,
        instruction: 'The single most impactful speaking skill is the pause. Beginners fill silence with "um," "uh," "like" — these signal uncertainty. Confident speakers use deliberate pauses: after key points (lets them land), before answering (shows thought), to control pacing. Martin Luther King, Obama, every great orator uses silence as punctuation. A 2-second pause feels like an eternity to you but sounds commanding to the audience.',
        actionPrompt: 'Speak for 60 seconds about anything. Record yourself. Count your filler words.',
      },
      {
        id: 'ps3',
        title: 'Structure Any Talk in 3 Minutes',
        duration: 20,
        instruction: 'Great talks have one structure: (1) Hook — startling fact, story, or question (30 sec). (2) Problem — what pain does your audience feel (1 min). (3) Solution — your key idea, simply stated (2 min). (4) Evidence — one story or example that proves it (2 min). (5) Call to action — exactly what you want them to do (30 sec). This works for a 5-minute talk or a 45-minute keynote. Scale the evidence section.',
        actionPrompt: 'Pick any topic you know. Write a 3-minute talk structure using the 5-part framework above.',
      },
      {
        id: 'ps4',
        title: 'Deliver a 2-Minute Impromptu Talk',
        duration: 25,
        instruction: 'The PREP method works for any impromptu speaking situation. Point — state your position clearly. Reason — give one solid reason. Example — tell a specific, vivid story that proves it. Point — restate your position to close. Practice this now: pick one of these topics: (a) "What skill has changed your life?" (b) "What would you tell your 18-year-old self?" (c) "What\'s wrong with how most people spend their mornings?" Stand up. Record yourself.',
        tip: 'Don\'t read notes. Don\'t edit while speaking. Just deliver. You can evaluate after.',
        actionPrompt: 'Record a 2-minute PREP talk on one of the three topics. Then watch it back once.',
      },
      {
        id: 'ps5',
        title: 'Fix Your Body Language',
        duration: 20,
        instruction: 'Body language communicates before you say a word. Key rules: (1) Plant your feet — swaying and shifting signals insecurity. (2) Hands visible — hidden hands reduce trust. (3) Eye contact 3–5 seconds per person, not a scan. (4) Open chest — arms crossed = defensive. (5) Slow down movement — pacing and fidgeting are nervous energy leaks. Amy Cuddy\'s research: 2 minutes in a "power pose" before speaking measurably reduces cortisol and increases testosterone.',
        actionPrompt: 'Stand in a strong position: feet shoulder-width, hands relaxed at sides or in front, chest open. Hold for 2 minutes.',
      },
      {
        id: 'ps6',
        title: 'Build a 30-Day Speaking Practice',
        duration: 30,
        instruction: 'The only way to improve is repetition. Your 30-day plan: Week 1 — Record 60-second talks daily on random topics. Week 2 — Join a conversation and practice pausing instead of filler words. Week 3 — Give one prepared 3-minute talk to a real person. Week 4 — Volunteer to speak in any group setting: class, meeting, club. Toastmasters is free and the fastest structured environment to improve.',
        tip: 'The speaker you admire didn\'t wake up confident. They racked up reps until failure stopped being scary.',
        actionPrompt: 'Write the name of one person you will practice speaking to this week. Text them now to arrange it.',
      },
    ],
  },
  {
    id: 'negotiation',
    title: 'Negotiation Essentials',
    category: 'Communication',
    tagline: 'Get more of what you want, every time',
    totalMinutes: 110,
    difficulty: 'intermediate',
    xpReward: 90,
    color: '#33F3FF',
    icon: '⟺',
    steps: [
      {
        id: 'neg1',
        title: 'Understand What Negotiation Actually Is',
        duration: 10,
        instruction: 'Negotiation is not conflict — it\'s collaborative problem-solving. Most people avoid it because they fear confrontation or rejection. But refusing to negotiate costs real money: the average person who negotiates their salary earns $1 million more over a career than someone who doesn\'t (Carnegie Mellon research). Every price, term, and condition is a starting position, not a fact.',
        actionPrompt: 'Think of one situation in the last 3 months where you could have negotiated but didn\'t. What stopped you?',
      },
      {
        id: 'neg2',
        title: 'The Power of Silence and Anchoring',
        duration: 20,
        instruction: 'Two techniques immediately elevate your negotiating: (1) Anchor first — the first number stated disproportionately shapes the final outcome (anchoring bias). Always make the first offer when you can, and make it ambitious. (2) Use silence — after making a request or offer, go completely silent. Most people panic and fill silence by conceding. The person who speaks first after an offer usually loses ground.',
        tip: 'A good anchor should make the other party wince slightly but not walk away.',
        actionPrompt: 'Practice: ask someone for a favour or trade, make your request, then stay silent for 10 full seconds after.',
      },
      {
        id: 'neg3',
        title: 'The Mirroring Technique (FBI Method)',
        duration: 20,
        instruction: 'Former FBI negotiator Chris Voss identified mirroring as one of the most powerful rapport and information tools. Mirroring: repeat the last 1–3 words of what someone said, as a question. "I need this done by Friday." → "By Friday?" They elaborate. You listen. This triggers them to keep talking, reveals their real interests, and makes them feel heard — without you giving anything away.',
        actionPrompt: 'In your next conversation, use mirroring 3 times. Notice how the other person responds.',
      },
      {
        id: 'neg4',
        title: 'Identify BATNA and ZOPA',
        duration: 20,
        instruction: 'BATNA (Best Alternative to Negotiated Agreement): what happens if this negotiation fails? Your BATNA is your real power — the stronger your BATNA, the less you need this deal. ZOPA (Zone of Possible Agreement): the range where both parties can say yes. Map both before any important negotiation. If your BATNA is strong, be willing to walk away. Walking away is often the most powerful move in any negotiation.',
        actionPrompt: 'Pick a real upcoming negotiation (salary, price, agreement). Write your BATNA and estimated ZOPA.',
      },
      {
        id: 'neg5',
        title: 'The Tactical Empathy Framework',
        duration: 20,
        instruction: 'People make decisions emotionally, then justify logically. Before making your case, label the other party\'s emotions: "It seems like you\'re concerned about..." / "It sounds like the timeline is the main issue..." Labelling defuses negative emotion and builds trust. Then ask: "How am I supposed to do that?" instead of "No" — forces them to solve your problem. Voss calls this "getting to no" — let them feel in control.',
        tip: '"No" is not failure. "No" is the start of the real negotiation.',
        actionPrompt: 'Write 3 tactical empathy phrases you could use in your next negotiation.',
      },
      {
        id: 'neg6',
        title: 'Script a Real Negotiation',
        duration: 20,
        instruction: 'Preparation separates amateurs from professionals. For any high-stakes negotiation: (1) Research — know the market, their constraints, their interests. (2) Set your ambitious target, your realistic goal, and your walk-away point. (3) Prepare your anchor. (4) Prepare 3 empathy labels. (5) Know your BATNA cold. (6) Practice saying the number out loud — people who never say their target number out loud choke in the moment.',
        actionPrompt: 'Script a negotiation you\'ll have in the next 30 days. Write it out including anchor, empathy labels, and walk-away point.',
      },
    ],
  },

  // ─── FINANCE ────────────────────────────────────────────────────
  {
    id: 'personal_finance_101',
    title: 'Personal Finance 101',
    category: 'Finance',
    tagline: 'Take full control of your money',
    totalMinutes: 120,
    difficulty: 'beginner',
    xpReward: 85,
    color: '#00C8A0',
    icon: '◈',
    steps: [
      {
        id: 'pf1',
        title: 'The Wealth Equation Nobody Teaches You',
        duration: 15,
        instruction: 'Wealth = (Income − Expenses) × Returns over Time. This is the entire equation. Most financial advice targets income (earn more) and ignores the other two variables. But expenses are controllable immediately, and returns are the most powerful lever over decades (compound interest). The average UK 22-year-old who invests £200/month at 8% annual return will have £935,000 by age 62. The one who starts at 32 will have £430,000. Time is the only thing you cannot buy back.',
        actionPrompt: 'Write your current monthly: Income, Fixed Expenses, Variable Expenses, Savings amount.',
      },
      {
        id: 'pf2',
        title: 'Build Your First Budget in 30 Minutes',
        duration: 25,
        instruction: 'Use the 50/30/20 rule as a starting framework: 50% Needs (rent, food, utilities, transport), 30% Wants (entertainment, eating out, subscriptions), 20% Savings and investments. If your numbers don\'t match, don\'t panic — just see where you actually are. Most people find they\'re spending 15–25% on wants they don\'t even enjoy. The goal is awareness first, then optimisation. Track every pound for 30 days to get accurate data.',
        tip: 'The budget will feel uncomfortable the first time. That discomfort is clarity.',
        actionPrompt: 'Open your last 3 months of bank statements. Categorise every transaction into Needs/Wants/Savings.',
      },
      {
        id: 'pf3',
        title: 'The Emergency Fund First',
        duration: 15,
        instruction: 'Before investing a single penny, you need a 3–6 month emergency fund. Why: without it, any unexpected expense (job loss, medical, car) forces you to take on high-interest debt or liquidate investments at the worst time. The fund must be in a separate, easily accessible account — ideally a high-interest instant-access savings account. This is your financial oxygen mask. Put it on first.',
        actionPrompt: 'Calculate your monthly essential expenses × 3. That\'s your emergency fund target. How close are you?',
      },
      {
        id: 'pf4',
        title: 'Destroy High-Interest Debt',
        duration: 15,
        instruction: 'Any debt above 6–7% annual interest is a guaranteed negative investment — no market consistently beats paying off a 20% credit card. The avalanche method: list all debts, pay minimums on all, throw every extra pound at the highest-interest debt first. This minimises total interest paid. The snowball method (smallest balance first) is psychologically easier but mathematically worse. Use avalanche unless you need quick wins to stay motivated.',
        tip: 'A £3,000 credit card at 22% APR costs you £660/year in interest alone. That\'s a holiday.',
        actionPrompt: 'List every debt you have: balance, interest rate, minimum payment. Sort by interest rate, highest first.',
      },
      {
        id: 'pf5',
        title: 'Investing Basics: Where Your Money Actually Grows',
        duration: 30,
        instruction: 'After your emergency fund and high-interest debt are handled, invest. For UK residents: max your Stocks & Shares ISA first (£20k annual allowance, all gains tax-free). Then workplace pension (employer matching is free money — always take it). For the investment itself: low-cost index funds tracking global markets (e.g. FTSE All-World) outperform 90%+ of actively managed funds over 10+ years. Set it up automated, monthly, and do not check it daily.',
        tip: 'Vanguard, iShares, and Fidelity offer ISAs with funds from 0.07–0.22% annual fees. Anything above 1% is robbery.',
        actionPrompt: 'Open your employer pension portal and confirm you\'re getting full employer matching. If not, increase your contribution.',
      },
      {
        id: 'pf6',
        title: 'Automate Everything',
        duration: 20,
        instruction: 'The best financial system runs without willpower. Set up on payday: (1) Auto-transfer to emergency fund until full. (2) Auto-transfer to ISA/investment account. (3) Auto-transfer to sinking funds (holiday, car repair, etc). What remains is guilt-free spending money. You will never "forget" to save. You will never be tempted to spend the savings. This is how every wealthy person actually operates — not through discipline, but through systems.',
        actionPrompt: 'Set up one standing order today. Even £50/month to a savings account. Do it in the next 10 minutes.',
      },
    ],
  },

  // ─── FITNESS ────────────────────────────────────────────────────
  {
    id: 'strength_basics',
    title: 'Strength Training Fundamentals',
    category: 'Fitness',
    tagline: 'Build real strength from zero',
    totalMinutes: 115,
    difficulty: 'beginner',
    xpReward: 75,
    color: '#FF6666',
    icon: '◆',
    steps: [
      {
        id: 'st1',
        title: 'Why Strength Training Changes Everything',
        duration: 10,
        instruction: 'Strength training is the single highest-ROI physical activity for health, longevity, and aesthetics. It increases muscle mass (which burns calories at rest), increases bone density (reduces fracture risk by 40%), improves insulin sensitivity, reduces depression symptoms comparably to antidepressants in studies, and is the strongest known intervention for maintaining quality of life into old age. Cardio is good. Strength is non-negotiable.',
        actionPrompt: 'Write down one specific physical outcome you want from training. Be precise: not "get fit" — "add 5kg of muscle" or "deadlift my bodyweight."',
      },
      {
        id: 'st2',
        title: 'The Big 5 Movements',
        duration: 20,
        instruction: 'All effective strength training centres on 5 compound movements: (1) Squat — entire lower body + core. (2) Hip hinge / Deadlift — posterior chain, back, glutes. (3) Horizontal push — push-up / bench press, chest, shoulders, triceps. (4) Horizontal pull — row, back, biceps. (5) Vertical pull — pull-up / lat pulldown. These 5 movements train your entire body. Everything else is accessory work. A 3-day programme built around these 5 is all you need to build significant strength.',
        tip: 'Bodyweight versions of all 5 exist. You do not need a gym to start.',
        actionPrompt: 'Test yourself: how many good-form push-ups and bodyweight squats can you do right now? Record it.',
      },
      {
        id: 'st3',
        title: 'Progressive Overload: The Only Principle That Matters',
        duration: 15,
        instruction: 'Your muscles grow when forced to do slightly more work than last time. This is progressive overload — the fundamental law of strength training. Every session, aim to add reps or weight compared to last session. If you did 3×8 push-ups last week, do 3×9 this week. Most beginners plateau because they do the same workout with the same weight indefinitely. Track every session. Numbers don\'t lie, and progress feels incredible.',
        actionPrompt: 'Create a simple log: exercise, sets, reps, weight. You will fill this in after every single session.',
      },
      {
        id: 'st4',
        title: 'Form Before Weight — Always',
        duration: 20,
        instruction: 'The most common injury in strength training is ego-lifting: adding weight before mastering form. Injury sidelines you for weeks or permanently. Key form principles: neutral spine on all loads, full range of motion (quarter-reps build nothing), controlled descent (negative is where growth happens), braced core on all compound lifts. Learn the squat pattern with a broomstick before adding weight. It is not embarrassing — it is intelligent.',
        tip: 'Record yourself from the side on compound lifts. What you feel and what you see are always different.',
        actionPrompt: 'Spend 10 minutes practising a perfect squat or push-up form from a video guide. Record it. Watch it back.',
      },
      {
        id: 'st5',
        title: 'Nutrition for Strength',
        duration: 20,
        instruction: 'You cannot out-train a bad diet. For strength: (1) Protein: 1.6–2.2g per kg bodyweight per day — the most important variable. (2) Caloric surplus to build muscle (250–500 kcal over maintenance). (3) Carbohydrates fuel performance — don\'t fear them. (4) Sleep: muscle is built during recovery, not during training. 7–9 hours is not optional. (5) Creatine monohydrate: the single most well-researched supplement. 5g/day, no loading phase needed.',
        tip: '80kg person needs ~130–175g protein/day. A chicken breast has ~30g. Do the maths.',
        actionPrompt: 'Calculate your bodyweight × 1.8. That\'s your daily protein target in grams. Track your protein intake today.',
      },
      {
        id: 'st6',
        title: 'Design Your First 8-Week Programme',
        duration: 30,
        instruction: 'A beginner full-body programme 3×/week (Mon/Wed/Fri): A1: Squat 3×8, A2: Push (push-up/bench) 3×8, A3: Row 3×8. B1: Hip hinge 3×8, B2: Overhead press 3×8, B3: Pull-up/lat pulldown 3×8. Alternate A and B each session. Add reps until you reach 3×12, then add weight and drop back to 3×8. This is better than 90% of programmes in any commercial gym.',
        tip: 'The best programme is the one you actually do. Consistent mediocre effort beats perfect sporadic effort every time.',
        actionPrompt: 'Write your programme in your training log. Write the first session date in your calendar right now.',
      },
    ],
  },

  // ─── TECH ───────────────────────────────────────────────────────
  {
    id: 'python_basics',
    title: 'Python for Total Beginners',
    category: 'Tech',
    tagline: 'Write real code in 2 hours',
    totalMinutes: 120,
    difficulty: 'beginner',
    xpReward: 90,
    color: '#8833FF',
    icon: '{}',
    steps: [
      {
        id: 'py1',
        title: 'What Python Is and Why It Dominates',
        duration: 10,
        instruction: 'Python is the world\'s most popular programming language and the first language you should learn. It reads like English, runs immediately, and powers: data science, AI/ML, web backends, automation, scripting, and research. Google, Netflix, Instagram, and NASA all use Python. You don\'t need to install anything — use repl.it or Google Colab to run Python in your browser right now.',
        actionPrompt: 'Open replit.com, create a new Python repl. You\'re ready.',
      },
      {
        id: 'py2',
        title: 'Variables, Types, and Print',
        duration: 20,
        instruction: 'A variable is a labelled box that stores a value. Python has 4 basic types: int (whole numbers), float (decimals), str (text, in quotes), bool (True/False). Try: name = "Alex" / age = 22 / height = 1.82 / is_student = True / print(f"My name is {name} and I am {age} years old"). The f-string (f"...") lets you embed variables directly in text. print() outputs to the console. These 4 concepts underpin 80% of all code.',
        actionPrompt: 'Type and run these 5 lines in your repl. Change the values to your own name and age.',
      },
      {
        id: 'py3',
        title: 'Lists, Loops, and If Statements',
        duration: 25,
        instruction: 'Lists store multiple items: skills = ["Python", "Excel", "Communication"]. Loops repeat code: for skill in skills: print(skill). If statements branch logic: if age >= 18: print("Adult") else: print("Minor"). Combine them: for skill in skills: if "Python" in skill: print("Found it!"). These 3 constructs — lists, loops, conditionals — are the foundation of all programming logic.',
        tip: 'Python uses indentation (4 spaces) instead of brackets. Indentation errors are the #1 beginner mistake.',
        actionPrompt: 'Create a list of 5 things you want to learn. Write a for loop that prints each one.',
      },
      {
        id: 'py4',
        title: 'Functions: Reusable Code Blocks',
        duration: 20,
        instruction: 'A function is a named block of code you can call multiple times. def greet(name): return f"Hello, {name}!" / print(greet("Alex")) / print(greet("Sam")). Functions take inputs (parameters) and return outputs. They prevent repetition — write once, call anywhere. The rule: if you\'re writing the same code more than twice, make it a function.',
        actionPrompt: 'Write a function called calculate_xp that takes minutes and returns minutes × 4. Test it with 3 different inputs.',
      },
      {
        id: 'py5',
        title: 'Build a Real Mini Project',
        duration: 30,
        instruction: 'Build a habit tracker CLI. It should: (1) Store habits in a list. (2) Let the user add a habit via input(). (3) Display all habits with a loop. (4) Let the user mark one complete. Starter code to get you going: habits = [] / new_habit = input("Enter a habit: ") / habits.append(new_habit). Build the rest yourself. Don\'t copy-paste — type every line. Struggling through it is where the learning happens.',
        tip: 'Google is not cheating. Professional developers use documentation constantly. Learn to search effectively.',
        actionPrompt: 'Build the habit tracker. You have 30 minutes. Start now.',
      },
      {
        id: 'py6',
        title: 'Your Python Learning Roadmap',
        duration: 15,
        instruction: 'You now have foundations. The path forward: Week 1–2: CS50P (Harvard\'s free Python course, 10 hours, best beginner resource online). Month 1: Build 5 small projects — a calculator, a number guessing game, a weather CLI using an API. Month 2: Pick a direction — data science (pandas, matplotlib), web (Flask, Django), automation (selenium, pyautogui). The learners who improve fastest build things, not just consume tutorials.',
        tip: 'At 1 hour/day, you can be employably productive in Python within 6 months.',
        actionPrompt: 'Bookmark cs50.harvard.edu/python and set a calendar reminder for tomorrow to start lesson 1.',
      },
    ],
  },

  // ─── MENTAL ─────────────────────────────────────────────────────
  {
    id: 'mindfulness',
    title: 'Mindfulness & Meditation',
    category: 'Mental',
    tagline: 'Train your attention like a muscle',
    totalMinutes: 105,
    difficulty: 'beginner',
    xpReward: 65,
    color: '#FFA333',
    icon: '◎',
    steps: [
      {
        id: 'mm1',
        title: 'What Mindfulness Actually Is',
        duration: 10,
        instruction: 'Mindfulness is the practice of directing your attention deliberately to the present moment without judgement. It is not emptying your mind (impossible), not relaxation (a side effect), not spiritual (though it can be). It is an attention skill. Your mind wanders ~47% of waking hours (Harvard study) — and mind-wandering is strongly correlated with unhappiness, regardless of what you\'re doing. Mindfulness trains you to notice the wandering and return. That\'s the entire skill.',
        actionPrompt: 'Set a timer for 2 minutes. Focus on the sensation of breathing. Each time your mind wanders, simply return to breath. Count how many times you had to return.',
      },
      {
        id: 'mm2',
        title: 'The Science of Why It Works',
        duration: 15,
        instruction: '8 weeks of mindfulness practice produces measurable changes: prefrontal cortex thickening (rational thinking), amygdala reduction (stress reactivity), increased gray matter density in the hippocampus (learning and memory). Meta-analyses of 200+ studies show mindfulness reduces anxiety, depression, and chronic pain comparably to medication in some populations. It changes the physical structure of the brain in 8 weeks. Nothing else does this.',
        actionPrompt: 'Rate your current baseline: stress (1–10), focus quality (1–10), emotional reactivity (1–10). Revisit in 30 days.',
      },
      {
        id: 'mm3',
        title: 'The Basic Breath Meditation (Do It Now)',
        duration: 20,
        instruction: 'Sit comfortably. Close or soften your eyes. Bring attention to your breathing — the physical sensation at the nostrils, chest, or belly. You don\'t control the breath; you observe it. When thoughts arise (they will), notice them without engaging, and gently return to the breath. Every return is a rep. A session with 50 mind-wanders and 50 returns is a good session — not a failed one. Do this for 10 minutes right now.',
        actionPrompt: 'Set a 10-minute timer. Sit comfortably. Do the breath meditation. Start now.',
      },
      {
        id: 'mm4',
        title: 'Body Scan: Releasing Physical Tension',
        duration: 20,
        instruction: 'Most stress lives in the body unnoticed until it becomes pain or illness. The body scan: lie or sit comfortably. Bring attention slowly from the top of your head to your toes, noticing sensation without trying to change it. Tight jaw, clenched shoulders, held belly — most people are chronically tense in 3–5 areas without realising it. Noticing is enough. You can\'t relax what you can\'t feel.',
        actionPrompt: 'Do a 5-minute body scan. Where is your tension right now? Breathe into those areas for 30 seconds each.',
      },
      {
        id: 'mm5',
        title: 'Mindfulness in Daily Life',
        duration: 20,
        instruction: 'Formal meditation is a gym for your attention. Informal practice is the sport. Integrate mindfulness into: eating (phone away, notice flavours), walking (feel each step, observe surroundings), conversations (give full attention, notice impulse to interrupt), transitions (between tasks, one breath before starting the next). These micro-practices compound. A person who meditates 10 minutes and is present for 2 hours of daily life has more training than someone who meditates 30 minutes and checks their phone 80 times.',
        actionPrompt: 'Choose one daily activity (morning coffee, commute, lunch). Commit to doing it in full presence for the next 7 days.',
      },
      {
        id: 'mm6',
        title: 'Design Your Sustainable Practice',
        duration: 20,
        instruction: 'The most common mistake is overcommitting: "I\'ll meditate 30 minutes every morning." Then missing 2 days and quitting. Science shows 10 minutes daily beats 70 minutes weekly for brain change. Best practice: same time, same place, same duration. Morning is optimal (trains attention before the world fragments it). Use a simple app: Insight Timer is free. Don\'t buy anything expensive — a timer and a quiet spot are enough.',
        tip: 'After 30 days of 10 minutes/day, extend to 15. Build the streak, then lengthen.',
        actionPrompt: 'Set a recurring alarm: "10-min meditation" for tomorrow at your preferred time. It should go off every day.',
      },
    ],
  },
  {
    id: 'emotional_intelligence',
    title: 'Emotional Intelligence',
    category: 'Mental',
    tagline: 'Master your emotions, lead people',
    totalMinutes: 115,
    difficulty: 'intermediate',
    xpReward: 80,
    color: '#FFA333',
    icon: '◑',
    steps: [
      {
        id: 'ei1',
        title: 'The 4 Domains of EQ',
        duration: 15,
        instruction: 'Daniel Goleman\'s model: (1) Self-awareness — recognising your emotions and their triggers. (2) Self-regulation — managing your emotional responses. (3) Social awareness — reading others\' emotions accurately. (4) Relationship management — using emotional insight to influence and connect. IQ predicts performance up to a threshold; above that threshold, EQ predicts success more strongly. The most promotable, most effective, most trusted people consistently have high EQ — and it\'s trainable.',
        actionPrompt: 'Honestly rate yourself 1–10 on each of the 4 domains. Which is your weakest?',
      },
      {
        id: 'ei2',
        title: 'Name It to Tame It',
        duration: 20,
        instruction: 'When you label an emotion precisely, its intensity drops. "Angry" is vague. "Frustrated because I feel unheard" is precise — and that precision activates the rational prefrontal cortex, reducing amygdala reactivity (neuroimaging confirms this). Build your emotional vocabulary beyond the 6 basic emotions. Expand to: resentment, anticipation, melancholy, overwhelm, indignation, wistfulness. The finer your vocabulary, the more control you have.',
        actionPrompt: 'Think of a recent difficult emotion. Write a precise description of it: what type, what triggered it, what you actually felt in your body.',
      },
      {
        id: 'ei3',
        title: 'The 90-Second Rule',
        duration: 15,
        instruction: 'Neuroscientist Jill Bolte Taylor discovered that the physiological spike of any emotion lasts approximately 90 seconds from trigger. After that, the emotion is over — unless you mentally re-trigger it. Every time you rehearse an angry thought, you restart the 90-second cycle. This means: prolonged emotional states are a choice, not a chemical inevitability. You can choose to not re-engage. But you must first notice when you\'re re-triggering.',
        actionPrompt: 'Next time you feel a strong emotion, set a timer for 90 seconds. Observe the sensation without adding thoughts to it.',
      },
      {
        id: 'ei4',
        title: 'Reading Others: Micro-expressions and Subtext',
        duration: 20,
        instruction: 'Social awareness means reading people accurately. Key signals: (1) Micro-expressions — involuntary expressions lasting 1/25 second before masking. (2) Incongruence — when words and tone/body language conflict, trust the body. (3) Baseline — know how someone normally behaves to detect deviation. (4) Emotional leakage — tension in jaw, furrowed brow, closed posture, leg movement. Most people project their own emotional state onto others. EQ requires curiosity, not projection.',
        actionPrompt: 'In your next conversation, focus entirely on the other person\'s non-verbal signals. What are they communicating beyond their words?',
      },
      {
        id: 'ei5',
        title: 'Handling Difficult People',
        duration: 25,
        instruction: 'Difficult people usually signal unmet needs: for respect, autonomy, understanding, or security. Your response protocol: (1) Regulate yourself first — you cannot reason clearly from an activated state. (2) Acknowledge their emotion without agreeing with their position: "I can see this is frustrating." (3) Ask: "Help me understand what would make this work." (4) Give them a "face-saving" way to change position — don\'t corner. (5) Know when to disengage. Some conflicts are not yours to solve.',
        actionPrompt: 'Think of a difficult person in your life. What unmet need might be driving their behaviour? Write it out.',
      },
      {
        id: 'ei6',
        title: 'Build Your EQ Daily Practice',
        duration: 20,
        instruction: 'EQ grows through reflection, not information. Daily practice: (1) Evening review: what triggered you today? Did you respond or react? (2) Relationship audit: who did you affect positively or negatively today? (3) Gratitude — genuine gratitude reduces self-centredness and expands social awareness. Weekly: review a difficult interaction. How could you have handled it with higher EQ? This is the entire practice. It takes 10 minutes/day and compounds over years.',
        actionPrompt: 'Write a brief evening review for today. One trigger, your response, and what you\'d do differently.',
      },
    ],
  },

  // ─── SOCIAL ─────────────────────────────────────────────────────
  {
    id: 'confidence_builder',
    title: 'Building Genuine Confidence',
    category: 'Social',
    tagline: 'Stop performing, start owning your presence',
    totalMinutes: 110,
    difficulty: 'beginner',
    xpReward: 80,
    color: '#FF5592',
    icon: '◈',
    steps: [
      {
        id: 'cb1',
        title: 'What Confidence Actually Is',
        duration: 10,
        instruction: 'Confidence is not the absence of fear — it\'s the decision to act despite it. It is not fixed, genetic, or dependent on external validation. It is a skill built through a cycle: take action → observe outcome → update beliefs about capability. Most people get the model backwards: they wait to feel confident before acting. This is exactly wrong. The action must precede the feeling. Confidence is the scar tissue of repeated action.',
        actionPrompt: 'Write one area where you consistently hold back waiting to "feel ready." How long have you been waiting?',
      },
      {
        id: 'cb2',
        title: 'The Confidence-Competence Loop',
        duration: 15,
        instruction: 'Confidence and competence reinforce each other in a cycle. Competence builds real confidence because you have actual evidence of capability. The fastest way to build genuine confidence is to build genuine skill. Fake it till you make it works briefly for initial courage — but real confidence requires evidence. This is why people who focus on personal growth (learning, building, creating) naturally become more confident — they accumulate evidence of their own capability.',
        actionPrompt: 'Identify 1 skill that, if genuinely improved, would make you meaningfully more confident in a key area of your life.',
      },
      {
        id: 'cb3',
        title: 'Silence the Inner Critic',
        duration: 20,
        instruction: 'The inner critic is a fear mechanism evolved to prevent social rejection. It catastrophises: "Everyone will notice," "They\'ll think I\'m stupid," "I\'ll embarrass myself." Challenge the thought: (1) Is this thought factually true? (2) What\'s the realistic worst case? (3) Could I handle that? (4) What\'s the best case I\'m ignoring? Cognitive Behavioural Therapy research shows this thought-challenging process, practised consistently, rewires the default response over weeks.',
        tip: 'The inner critic\'s survival statistic is 0%. It\'s never actually kept you safe from real danger.',
        actionPrompt: 'Write one catastrophic self-talk thought. Now answer the 4 questions above for it.',
      },
      {
        id: 'cb4',
        title: 'Exposure: The Only Thing That Works',
        duration: 20,
        instruction: 'Avoidance amplifies fear. Exposure extinguishes it. This is the mechanism behind CBT for anxiety and why exposure therapy has an 80–90% success rate for phobias. Confidence with strangers? Talk to 3 strangers today. Confidence speaking up? Say something in every group conversation this week. Confidence with uncertainty? Do one uncomfortable thing per day. The exposure must be graduated — challenging, not crushing. Start at the edge of your comfort zone, not beyond it.',
        actionPrompt: 'Design a 7-day exposure ladder: 7 social/confidence challenges, in increasing difficulty. Day 1 should feel uncomfortable but doable.',
      },
      {
        id: 'cb5',
        title: 'Posture, Voice, Presence',
        duration: 20,
        instruction: 'Physical signals change your internal state. Studies show: adopting expansive posture for 2 minutes before a challenge measurably shifts hormonal profile (cortisol down, testosterone up). Speak at your natural lowest comfortable pitch — most people speak higher when nervous (signals threat). Maintain eye contact longer than feels natural — breaking eye contact first signals submission. Walk with purpose and pace. Dress intentionally — what you wear affects how others treat you and how you perceive yourself.',
        actionPrompt: 'For the next 3 hours: stand/sit fully upright, maintain eye contact, and do not apologise unless you\'ve actually done something wrong.',
      },
      {
        id: 'cb6',
        title: 'A 30-Day Confidence Protocol',
        duration: 25,
        instruction: 'Daily protocol: (1) Morning: 1 thing you\'ll do that challenges you today. (2) Evening: write what you did and what you learned. Track your wins — not outcomes, but decisions to act despite discomfort. Weekly: do one thing that terrifies you a little. Monthly: look back at your list. You will not recognise the person who was afraid of these things. This is how confidence is built. Not by reading about it. By accumulating evidence that you can handle things.',
        tip: '"Feel the fear and do it anyway" is not a motivational poster. It is a neurological retraining protocol.',
        actionPrompt: 'Commit to the 30-day protocol. Write tomorrow\'s challenge now.',
      },
    ],
  },

  // ─── CREATIVE ───────────────────────────────────────────────────
  {
    id: 'speed_reading',
    title: 'Speed Reading That Actually Works',
    category: 'Productivity',
    tagline: 'Read 2× faster without losing retention',
    totalMinutes: 100,
    difficulty: 'beginner',
    xpReward: 65,
    color: '#5FFF3D',
    icon: '▷',
    steps: [
      {
        id: 'sr1',
        title: 'Why Most Reading Is Slow',
        duration: 10,
        instruction: 'Average reading speed: 200–250 words per minute. Capable adult speed: 400–500 wpm with training. The bottlenecks: (1) Subvocalisation — silently "saying" every word in your head limits you to speech speed. (2) Regression — re-reading sentences due to lack of focus. (3) Narrow fixation — your eyes can process more than one word per fixation. Eliminating these three habits doubles your speed without loss of comprehension. True "speed reading" at 1000+ wpm involves comprehension trade-offs, but 400–500 wpm is fully attainable.',
        actionPrompt: 'Time yourself reading 500 words of any article. That\'s your baseline WPM. Write it down.',
      },
      {
        id: 'sr2',
        title: 'Use a Visual Pacer',
        duration: 15,
        instruction: 'The simplest speed improvement: use your finger or a pen as a pacer, moving it smoothly below each line as you read. Your eyes naturally follow movement — this reduces regression (re-reading) and forces forward momentum. Research shows using a pacer immediately improves speed 10–30%. Move the pacer slightly faster than comfortable. Your comprehension will adapt. This works for both physical books and screens.',
        actionPrompt: 'Read 2 pages of any book using the pacer technique. Compare how it feels to normal reading.',
      },
      {
        id: 'sr3',
        title: 'Reduce Subvocalisation',
        duration: 20,
        instruction: 'Subvocalisation is the primary speed limiter. You\'ve been doing it since you learned to read. To reduce it: (1) Hum a monotone note while reading — occupies the vocalisation mechanism. (2) Count 1-2-3-4 while reading. (3) Force your pacer to move faster than you can subvocalise. You won\'t eliminate subvocalisation entirely — it correlates with deep comprehension. But you can reduce it for less complex material.',
        actionPrompt: 'Try the humming technique for 5 minutes. Notice the speed increase.',
      },
      {
        id: 'sr4',
        title: 'Chunk and Group Words',
        duration: 20,
        instruction: 'Your peripheral vision can process 2–4 words simultaneously. Most readers focus on each word individually. Chunking: train yourself to take in groups of 2–3 words per fixation. Practice: place your focus at the second word of each line (not the first) and read forward. Your peripheral vision handles the beginning and end of lines. This technique, practised over 2–4 weeks, yields 50–100 wpm gains.',
        actionPrompt: 'Read a paragraph using chunking — 2 words per fixation. It will feel awkward. That is correct.',
      },
      {
        id: 'sr5',
        title: 'Strategic Reading: Not Everything Deserves Full Attention',
        duration: 20,
        instruction: 'Mortimer Adler\'s 4 levels of reading: (1) Inspectional — skim structure: table of contents, headings, first/last paragraphs. Gets the map before the journey. (2) Analytical — engaged reading with annotations and questions. (3) Syntopical — reading multiple books on one topic simultaneously. Most books only need inspectional reading. Most articles only need their first and last paragraphs. Read with a question: "What do I actually need from this?"',
        actionPrompt: 'Inspect a book or report you\'ve been meaning to read: skim structure, read intro and conclusion only. How much time did it save?',
      },
      {
        id: 'sr6',
        title: 'Retention: The Point of Reading',
        duration: 15,
        instruction: 'Reading speed means nothing if you forget everything. The Feynman Technique for retention: after reading a section, close the material and explain it to yourself in simple terms. Where you can\'t explain it simply, you don\'t understand it yet. Also: spaced repetition — review notes at 1 day, 7 days, 30 days. Build a system: digital notes in Notion or Obsidian with key ideas from every book. The goal is a searchable external brain.',
        actionPrompt: 'Write a 5-sentence summary of what you\'ve learned in this sprint so far, without looking back.',
      },
    ],
  },
  {
    id: 'creative_writing',
    title: 'Creative Writing Fundamentals',
    category: 'Creative',
    tagline: 'Tell stories that people can\'t put down',
    totalMinutes: 120,
    difficulty: 'beginner',
    xpReward: 75,
    color: '#FFB800',
    icon: '✦',
    steps: [
      {
        id: 'cw1',
        title: 'The Only Rule of Good Writing',
        duration: 10,
        instruction: 'Good writing creates a vivid experience in the reader\'s mind. That\'s it. Every other rule — show don\'t tell, kill your darlings, active voice, concrete details — serves this one goal. Bad writing is abstract, vague, and general. Good writing is specific, concrete, and sensory. "She was angry" is bad. "She set down the mug so carefully that the coffee barely moved" is good. The reader feels it.',
        actionPrompt: 'Write 3 sentences describing something in your room. Now rewrite them to be twice as specific.',
      },
      {
        id: 'cw2',
        title: 'Show, Don\'t Tell — With Examples',
        duration: 20,
        instruction: 'Telling: "John was nervous." Showing: "John checked his phone three times in the elevator. On the second floor, he stepped out, realised it wasn\'t his floor, and stepped back in." Showing works because it trusts the reader\'s intelligence and makes them participate in the story. Telling explains; showing demonstrates. One technique: when you\'ve written a "tell" sentence, ask "What specific action, image, or detail proves this?"',
        actionPrompt: 'Convert these tells into shows: "She was happy." "He was rich." "The room was messy." Write your versions.',
      },
      {
        id: 'cw3',
        title: 'Character: Want + Wound',
        duration: 20,
        instruction: 'Every compelling character has two things: what they want (external goal) and what they need (internal wound they can\'t yet face). Example: a character wants to become a famous musician (want) but needs to accept their father\'s disappointment in them (wound). The tension between want and need drives character development. Characters who get what they want without changing are boring. Characters who must change to get what they need are compelling.',
        actionPrompt: 'Create a character. Write their want and their wound. Then write a paragraph where these two things conflict.',
      },
      {
        id: 'cw4',
        title: 'Story Structure: The Change Arc',
        duration: 20,
        instruction: 'All stories are about change. The basic arc: (1) Status quo — character in their ordinary world. (2) Inciting incident — something disrupts it. (3) Rising tension — character tries and fails to restore equilibrium. (4) Crisis — everything appears lost. (5) Climax — character changes or acts differently. (6) Resolution — new equilibrium. This applies to a 500-word flash fiction piece or a 500-page novel. The scale changes; the arc doesn\'t.',
        actionPrompt: 'Plot a short story in 6 bullet points using the arc. Use the character you created in the previous step.',
      },
      {
        id: 'cw5',
        title: 'Write Without Censoring',
        duration: 30,
        instruction: 'The biggest block in writing is internal censorship — judging sentences before they\'re finished. The solution is to separate the drafting brain from the editing brain. Set a 20-minute timer. Write continuously without stopping to edit or reread. Write badly if needed. A bad page exists and can be improved; a blank page cannot. Hemingway: "The first draft of anything is shit." The goal of a first draft is to exist.',
        tip: 'Every great novel was once a terrible first draft.',
        actionPrompt: 'Set a 20-minute timer. Write the first scene of your story using your arc. Do not edit. Go.',
      },
      {
        id: 'cw6',
        title: 'Edit for Precision',
        duration: 20,
        instruction: 'Editing is writing\'s highest skill. The key edits: (1) Cut every word that doesn\'t earn its place. (2) Replace weak verbs (was, were, had) with strong specific verbs. (3) Delete adverbs — they\'re usually signs of a weak verb. ("ran quickly" → "sprinted"). (4) Vary sentence length — short sentences punch; long sentences flow. (5) Read aloud — your ear catches what your eye misses. A reader doesn\'t feel editing. They only feel the result.',
        actionPrompt: 'Take one paragraph from your scene. Edit it using all 5 rules. Count how many words you cut.',
      },
    ],
  },

  // ─── COMMUNICATION (additional) ─────────────────────────────────
  {
    id: 'active_listening',
    title: 'Active Listening',
    category: 'Communication',
    tagline: 'The skill that transforms every relationship',
    totalMinutes: 90,
    difficulty: 'beginner',
    xpReward: 60,
    color: '#33F3FF',
    icon: '◌',
    steps: [
      {
        id: 'al1',
        title: 'Why Nobody Feels Heard',
        duration: 10,
        instruction: 'Studies show we remember only 25–50% of what we hear. In conversations, most people are not listening — they\'re waiting to speak, planning their response, or filtering what they hear through their existing beliefs. This is the default. The person who actually listens is rare, powerful, and magnetic. The skill is not about being quiet while someone talks. It is about genuinely prioritising their meaning over your response.',
        actionPrompt: 'In your next conversation, catch yourself formulating a response while the other person is still speaking. Just notice it.',
      },
      {
        id: 'al2',
        title: 'The LADDER Framework',
        duration: 15,
        instruction: 'Look (face the speaker, make eye contact). Ask (genuine questions about what they said, not changing subject). Don\'t interrupt (including the "helpful" kind — finishing sentences). Don\'t change subject. Emotions (acknowledge them: "that sounds genuinely frustrating"). Respond (when they\'ve finished). This framework feels unnatural at first because it\'s the opposite of most conversations. The discomfort is the signal that it\'s working.',
        actionPrompt: 'Use LADDER in the next substantive conversation you have today.',
      },
      {
        id: 'al3',
        title: 'Reflecting and Paraphrasing',
        duration: 20,
        instruction: 'After someone shares something, reflect back the essence before responding. "What I\'m hearing is..." / "So it sounds like you\'re feeling..." / "If I understand correctly, the main issue is..." This does two things: proves you were listening (extremely rare, instantly builds trust), and clarifies understanding (you may be wrong — the correction is valuable). Don\'t parrot the exact words. Synthesise the meaning.',
        actionPrompt: 'In the next conversation, reflect back what someone says before adding your own perspective.',
      },
      {
        id: 'al4',
        title: 'Ask Better Questions',
        duration: 20,
        instruction: 'Closed questions: "Did you enjoy it?" → "Yes/No." Open questions: "What surprised you most about it?" → reveals thinking, feeling, perspective. The best listeners ask "what" and "how" questions, not "why" questions (which feel accusatory). Power question: "What else?" — asked after someone gives their first answer, surfaces their real thinking. Most people give their polished surface answer first. "What else?" gets to the real one.',
        actionPrompt: 'Write 5 "what" or "how" questions about a topic a friend cares about. Use them this week.',
      },
      {
        id: 'al5',
        title: 'Listening Without Fixing',
        duration: 15,
        instruction: 'When someone shares a problem, the instinct is to solve it. This often backfires. They usually want to feel understood before they want advice — and often don\'t want advice at all. The listening intervention: when someone shares a problem, resist the fix. Instead: "That sounds really hard" / "How are you feeling about it?" Ask: "Would it help to think through it together, or do you mostly just need to vent?" That one question is one of the most useful in any relationship.',
        actionPrompt: 'The next time someone shares a problem, ask: "Do you want me to help think through it or do you mainly need to vent?"',
      },
      {
        id: 'al6',
        title: 'Practise in 10 Intentional Conversations',
        duration: 10,
        instruction: 'Listening is a contact sport — you improve only through reps. Your 10-conversation challenge: In the next 10 conversations, your only goal is to understand the other person more deeply than they expect. Ask one extra question. Reflect once. Resist fixing. Notice what changes in how people respond to you. The person who truly listens becomes someone others seek out. In a world of noise, real attention is a gift.',
        actionPrompt: 'Write the name of 3 people you\'ll deliberately practise with this week.',
      },
    ],
  },
];

export const SPRINT_CATEGORIES: SprintCategory[] = [
  'Productivity', 'Communication', 'Finance', 'Fitness', 'Tech', 'Mental', 'Social', 'Creative',
];
