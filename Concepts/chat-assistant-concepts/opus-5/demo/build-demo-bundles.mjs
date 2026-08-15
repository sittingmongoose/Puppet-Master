/* Generates the demo corpus and the two browser bundles this workspace loads.
 *
 *   demo/demoData.json            -> the corpus itself, re-emitted from here
 *   demo/demoData.bundle.js       -> window.PMX_DEMO_DATA       (that corpus, verbatim)
 *   demo/demoDataExtension.js     -> window.PMX_DEMO_EXTENSION  (our additive layer)
 *
 * Bundles exist because fetch() cannot read a sibling file over file:// in Chromium.
 *
 * demoData.json used to be read-only here and frozen at its supplied 349,661 bytes. That freeze is
 * retired by explicit decision, because two elements of DEMO_SCENARIO_MANIFEST.json are facts about
 * the corpus rather than facts an overlay can state honestly: the eighteen `history_rows` ARE the
 * thread titles, and `user_request` IS the opening message of thread-01. Both are written into the
 * corpus below by transforms that are idempotent — titles are assigned from a constant list by
 * position, and the request message is upserted by id — so running this generator over its own
 * previous output produces the same bytes. Determinism replaced the byte freeze as the property
 * worth checking: run it twice and hash both times.
 *
 * Run:  node demo/build-demo-bundles.mjs        (from the opus-5 folder)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const base = JSON.parse(readFileSync(join(here, 'demoData.json'), 'utf8'));

/* Deterministic PRNG so regenerating the bundle never churns the diff. */
let seed = 0x2f6e2b1;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const pick = (a) => a[Math.floor(rnd() * a.length)];

const iso = (ms) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z');

/* ---------------------------------------------------------------- scenario manifest
 *
 * DEMO_SCENARIO_MANIFEST.json (`pm.chat_assistant_demo_scenario.v2`) is the canonical demo
 * contract. It calls itself portable — "adapt file paths and wording to the workspace without
 * reducing behavioral coverage" — so paths below are this workspace's real files. Names, titles,
 * todos, warnings and the completion block are NOT paths: they are copy, and every string in this
 * block is character-for-character what the manifest declares. They live in one constant so that a
 * later edit cannot drift a copy string without touching the place that says it is copy, and so the
 * coverage report at the bottom can string-match the built corpus against them rather than assert
 * that they landed. */
const MANIFEST = {
  /* `user_request`. It opens thread-01, which is the thread every other manifest element hangs on. */
  userRequest: 'Audit the provider settings and Assistant Chat controls, improve multi-account routing and access warnings, preserve Slint portability, test every theme, and produce an implementation handoff without editing PMConcept7.',
  /* `goal.title`. The six `goal.phases` are authored on T01_GOAL below. */
  goalTitle: 'Redesign provider controls and Chat access flow',
  /* `history_rows`, in the manifest's order. There are eighteen of them and eighteen threads in the
   * built corpus — fifteen supplied plus the three authored here — so the rows land one per thread
   * in thread order. Anything else would either drop rows or invent threads to hold them. */
  historyRows: [
    'Settings redesign bakeoff',
    'Usage feature review',
    'Planning Wizard audit',
    'PRD Builder source intake',
    'Provider multi-account routing',
    'Claude CLI profile isolation',
    'Antigravity CLI headless update',
    'Free models catalog refresh',
    'Models.dev capability sync',
    'Context Lens motion study',
    'Compact Now and branching',
    'MCP July specification review',
    'Memory degradation audit',
    'Persona context-footprint audit',
    'Crew capacity planning',
    'Worktree collision recovery',
    'Slint 1.17.1 port notes',
    'Assistant Chat visual testing'
  ],
  /* `todos`. The manifest names them and says nothing about state, so the states are chosen here. */
  todos: [
    'Audit the current model and account picker',
    'Map requested and effective provider routes',
    'Design pinned-history geometry',
    'Implement the four access profiles',
    'Add cache and attachment route warnings',
    'Add the left artifact workspace',
    'Run theme, width, keyboard, and reduced-motion tests',
    'Write the implementation-impact handoff'
  ],
  /* `warnings`. Each one is the consequence sentence of a decision record below. */
  warnings: [
    'Switching provider will replay the conversation without the current provider cache.',
    'The selected model cannot inspect video natively; PM can extract frames or use the configured vision route.',
    'Remaining included usage is unlikely to finish eight specialists; run two at a time and reserve capacity for synthesis.'
  ],
  /* `completion`. `elapsed` is the manifest's own string; the seconds beside it are derived from it
   * rather than invented, so a card cannot show one clock contradicting the other. */
  completion: {
    resultSummary: 'Updated the provider selector and access flow, preserved thread-local state, verified responsive pinning, and produced four inspectable artifacts.',
    verification: 'All targeted interaction probes passed',
    elapsed: '1m 34s',
    elapsedSeconds: 94,
    workedSeconds: 71
  }
};

/* The manifest's `history_rows` are thread TITLES, which makes them corpus facts. Assigning by
 * position is what keeps this idempotent: re-running over a previous output rewrites each title
 * with the value it already has. The three threads authored further down take the last three rows. */
base.threads.forEach((t, i) => {
  if (i < MANIFEST.historyRows.length) t.title = MANIFEST.historyRows[i];
});

/* The eighteen rows are one body of work, so they belong to one project. thread-01 was the sole
 * member of a project called `Tastebook` — left over from the supplied corpus, and already odd once
 * its title became `Settings redesign bakeoff`. It also had a consequence beyond coherence:
 * PMXThreadOps.related() projects same-project threads, so the thread the whole demo runs on had NO
 * related threads at all, and the `threadops` suite has been failing on it. */
base.threads.forEach((t) => {
  if (!t.deleted && t.project === 'Tastebook') t.project = 'Puppet Master';
});

/* `user_request` is the opening user message of thread-01. It is upserted by id so a second run
 * replaces the message it wrote instead of prepending another copy, and its runtime is written out
 * literally rather than drawn from runtime(): a single rnd() call here would shift every later
 * random draw and churn the whole extension for no behavioural gain. */
const T01_REQUEST = {
  id: 't01-m0000',
  role: 'user',
  body: MANIFEST.userRequest,
  sentAt: '2026-07-29T12:58:00Z',
  runtime: {
    provider: 'Anthropic', model: 'Opus 5', persona: 'Product designer',
    mode: 'Plan', effort: 'High',
    workedSeconds: 12, totalElapsedSeconds: 26,
    tokenCount: 1180, contextUsed: 4020, contextLimit: 128000,
    estimatedCost: 0.01
  },
  eligibleForEdit: false,
  collapsedByDefault: false
};
{
  const t01 = base.threads.find((t) => t.id === 'thread-01');
  const at = t01.messages.findIndex((m) => m.id === T01_REQUEST.id);
  if (at >= 0) t01.messages[at] = T01_REQUEST;
  else t01.messages.unshift(T01_REQUEST);
}

const RUNTIMES = [
  { provider: 'Anthropic', model: 'Opus 5', persona: 'Product designer' },
  { provider: 'OpenAI', model: 'GPT-5.6 Pro', persona: 'Systems reviewer' },
  { provider: 'Alibaba', model: 'Qwen 3.8', persona: 'Interface engineer' },
  { provider: 'Moonshot', model: 'Kimi K3', persona: 'Research analyst' }
];

function runtime(i, { diverge = false } = {}) {
  const r = RUNTIMES[i % RUNTIMES.length];
  const worked = 12 + Math.floor(rnd() * 80);
  return {
    provider: r.provider, model: r.model, persona: r.persona,
    mode: rnd() > 0.75 ? 'Plan' : 'Agent',
    effort: rnd() > 0.5 ? 'High' : 'Medium',
    workedSeconds: worked,
    /* The supplied data has worked === totalElapsed on all 400 messages, so the
     * "Total elapsed when different" row in More Info could never render. Diverge here. */
    totalElapsedSeconds: diverge ? worked + 40 + Math.floor(rnd() * 300) : worked,
    tokenCount: 900 + Math.floor(rnd() * 7000),
    contextUsed: 4000 + Math.floor(rnd() * 60000),
    contextLimit: 128000,
    estimatedCost: Number((0.01 + rnd() * 0.05).toFixed(2))
  };
}

/* ---------------------------------------------------------------- prose pools */

const USER_LINES = [
  'That is close, but the second half drifts from what I actually asked for.',
  'Can you walk me back through why you picked that ordering?',
  'Hold on, I want to change scope before you go further.',
  'I was wrong earlier about the retention rule. Ignore what I said.',
  'What happens if someone opens this on a narrow window?',
  'Does that still hold when the thread gets really long?',
  'Show me the part that decides which messages get dropped.',
  'I would rather keep it simple even if we lose a little precision.',
  'That answers the first question but not the second one.',
  'Let us park the migration and finish the read path first.',
  'Which of those two is cheaper to reverse if we get it wrong?',
  'Good. Now what breaks if the provider changes mid-run?',
  'I keep forgetting the difference between those two states.',
  'Can we make the failure mode louder? Silent degradation worries me.',
  'Fine, but I do not want another settings toggle for this.',
  'Where does that value actually get written down?',
  'Try it the other way and tell me if it reads better.',
  'That is the behavior I wanted, thank you.'
];

const ASSISTANT_LINES = [
  'The ordering came from wanting the cheapest check to fail first, so a bad run stops before it costs anything.',
  'It holds for long threads because the index is built over stored history rather than what happens to be rendered.',
  'Narrow windows are the harder case. The surrounding chrome takes a fixed share, so the readable column shrinks faster than the window does.',
  'Two of those states differ only in whether recovery was attempted, which is why they are easy to confuse.',
  'Reversing that is cheap. The other one writes a record that later steps depend on, so undoing it means a replan.',
  'If the provider changes mid-run the turn keeps its original identity and records both the requested and effective model.',
  'I would rather make the failure loud too. Quiet degradation is how this class of bug survives review.',
  'That value is written once when the turn terminates, and every later surface reads the same record rather than recomputing.',
  'Reading it the other way is better. The subject arrives before the qualification instead of after it.',
  'The read path is independent, so parking the migration costs nothing except a slightly awkward name for a while.',
  'You are right that the second half drifted. I was answering a narrower question than the one you asked.',
  'Dropping messages is decided by the shaping pass, not the renderer, so what you see and what the model sees can differ on purpose.',
  'No new toggle. It can key off the setting that already exists for the surrounding behavior.',
  'That is a fair simplification. The precision we lose only matters in a case we do not currently support.',
  'The distinction matters most when something is blocked, because only one of the two carries a next safe action.'
];

/* ---------------------------------------------------------------- long messages */

const LONG = {
  retention: `Here is the full picture on retention, since the short answer was misleading.

There are three separate clocks and we kept conflating them. The first is how long a thread stays in the rendered list, which is purely a view concern and resets whenever the workspace reloads. The second is how long stored history survives on disk, which is what people usually mean when they ask this question. The third is how long a run's evidence bundle is kept, which is shorter than both and is the one that actually bites.

The reason the third clock is short is that evidence bundles carry captured payloads: request bodies, tool output, screenshots. Keeping those around indefinitely turns a modest project into something unmanageable within a couple of weeks of heavy use. So they are pruned aggressively and only the references survive.

What that means in practice is that an old turn will still show you what it did and how long it took, but the deep artifacts behind it may already be gone. The surface has to be honest about that rather than showing a dead link. When the payload is gone we should say so plainly and offer to re-run rather than pretending the detail is one click away.

I checked the current setting and the effective retention window nine days, which is shorter than most people assume when they first read the settings page.`,

  lantern: `Let me lay out what I found, because the answer is not the one either of us expected.

I traced the failure back through three layers. The symptom was a stalled run, but the stall was downstream of the real problem. What actually happened is that the parent dispatched four children, one of them needed a clarification, and the escalation arrived while the parent was already in a terminal state. So the question had nowhere to go.

The child did the right thing. It entered a waiting state, sent the need and its origin upward, and stopped. The parent had already decided it was finished. Nothing crashed, nothing logged an error, and the run just sat there looking busy.

The fix is not to make children ask the user directly. That would solve the stall and create a much worse problem, because then two surfaces could be asking for input at once and neither would know about the other. The fix is that a parent cannot reach a terminal state while a child is still waiting on it.

I have not written the guard yet because I want to agree on where it lives first. My instinct is that it belongs in the scheduler rather than the parent, since the scheduler already knows about every child.

For the record, the run I was tracing is the one tagged blue lantern checkpoint, which is where the timing is easiest to see.`,

  canonical: `This is the part that trips everyone up, so I want to be precise about the two different views of history.

There is the canonical stored history, which is every message exactly as it was written, and there is the effective shaped history, which is what the model actually receives after Context Lens has done its work. These are not the same thing and they must never be conflated.

When a human searches, they are searching canonical history. Muting a message does not make it unfindable. That would be a trap, because you would mute something in the morning, search for it in the afternoon, and conclude it had been deleted. So muted, focused, and subcompacted messages all remain findable, and results may disclose which state they are in.

When the agent retrieves history, it reads the effective shaped view. Muted content is excluded, focused content is prioritized, and a subcompacted region comes back as a local summary with handles that can rehydrate the source if the model needs the detail.

The one case that needs care is a search hit inside a subcompacted range. The result must resolve to the canonical source history rather than the summary, and the summary and its sources must not both appear as unrelated duplicate results. Selecting that result also must not silently change the shaping state, because the user did not ask to unshape anything.

The short version is that human search reads canonical source history and agent retrieval reads the shaped view.`,

  narrow: `I spent the morning on the narrow-width problem and I think we have been measuring the wrong thing.

We keep talking about the window width, but the number that matters is the readable column after everything else has taken its share. At the minimum width the surrounding chrome, the history rail, and the composer take a fixed amount, and what is left for actual prose is much smaller than the window suggests. That is why the interface feels cramped at a width that sounds generous on paper.

The second problem compounds the first. Execution telemetry, nested cards, task state, and metadata all render at roughly the same visual weight as the conversation. When the column is wide there is enough room for that to feel dense but navigable. When the column is narrow every one of those surfaces wraps, and wrapping multiplies vertical cost. A card that took three lines takes seven, and suddenly two turns fill the viewport.

So the fix is not a smaller font. It is deciding what does not need to be present at full weight by default. Most of the machinery answers a question the reader is not currently asking. It needs to be reachable, not resident.

The third thing I noticed is that boxes inside boxes are the specific pattern that fails worst. Each nesting level adds padding on both sides and a border, and at a narrow width those costs are a meaningful fraction of the available column.`,

  blocked: `The run is blocked and I want to be exact about why, because the summary line is not enough to act on.

The cause is that the verifier for the migration step is unavailable. Not slow, not failing, actually unreachable. The affected scope is the three tasks that depend on schema confirmation; everything else in the goal is untouched and could continue.

I attempted recovery twice. The first attempt retried with a longer timeout on the assumption it was load. The second attempt tried the fallback verifier. Both returned the same unreachable result, which is what convinced me this is not transient.

Autonomous recovery stopped there deliberately. The next thing to try would be proceeding without verification, and this goal is marked as requiring strong certification, so finishing degraded is not something I am allowed to decide on my own.

The next safe action is either to point the step at a different verifier, or to explicitly downgrade the certification requirement for this run. Both are reversible. I have left the other tasks paused rather than letting them run ahead, because two of them write records that would be awkward to unwind if you choose the second option.`
};

/* ---------------------------------------------------------------- generation */

const patchThreads = [];
const newThreads = [];

/* 1. Extend the long thread so unloaded-history search is genuinely exercised.
 *    The supplied thread-09 has 120 stored with 50 visible. Take it to ~700. */
const t09 = base.threads.find((t) => t.id === 'thread-09');
const t09Start = new Date(t09.messages[0].sentAt).getTime();
const extraT09 = [];
const T09_ADD = 580;
for (let i = 0; i < T09_ADD; i++) {
  const isUser = i % 2 === 0;
  const at = t09Start - (T09_ADD - i) * 95000;
  const idx = 2000 + i;
  extraT09.push({
    id: `t09-m${String(idx).padStart(4, '0')}`,
    role: isUser ? 'user' : 'assistant',
    body: isUser ? pick(USER_LINES) : pick(ASSISTANT_LINES),
    sentAt: iso(at),
    runtime: runtime(i, { diverge: i % 17 === 0 }),
    eligibleForEdit: false,
    collapsedByDefault: false
  });
}
/* One long, collapsed message deep in unloaded territory: proves search reaches
 * BOTH unrendered history AND hidden text inside a collapsed message. */
extraT09[40] = {
  id: 't09-m2040',
  role: 'assistant',
  body: LONG.canonical,
  sentAt: iso(t09Start - (T09_ADD - 40) * 95000),
  runtime: runtime(1, { diverge: true }),
  eligibleForEdit: false,
  collapsedByDefault: true
};
patchThreads.push({ id: 'thread-09', appendAt: 0, appendMessages: extraT09, initialVisibleMessageCount: 50 });

/* 2. Long messages across both roles, several threads. Each carries its distinctive
 *    phrase in the last third so hidden-content search is testable. */
patchThreads.push({
  id: 'thread-01',
  replaceMessageBody: [
    { id: 't01-m0014', body: LONG.retention, collapsedByDefault: true, runtime: { totalElapsedSeconds: 240, workedSeconds: 94 } },
    { id: 't01-m0005', body: LONG.narrow, collapsedByDefault: true }
  ]
});
patchThreads.push({
  id: 'thread-03',
  replaceMessageBody: [
    { id: 't03-m0005', body: LONG.lantern, collapsedByDefault: true }
  ]
});
patchThreads.push({
  id: 'thread-14',
  replaceMessageBody: [
    { id: 't14-m0018', body: LONG.blocked, collapsedByDefault: true, runtime: { workedSeconds: 412, totalElapsedSeconds: 1890 } }
  ]
});

/* Extra long turns spread across other threads so collapse is not a one-thread trick. */
[['thread-05', 't05-m0012'], ['thread-10', 't10-m0010'], ['thread-15', 't15-m0008'],
 ['thread-06', 't06-m0014'], ['thread-11', 't11-m0016'], ['thread-02', 't02-m0012']]
  .forEach(([tid, mid], n) => {
    const body = [LONG.narrow, LONG.canonical, LONG.retention, LONG.lantern, LONG.blocked][n % 5];
    patchThreads.push({ id: tid, replaceMessageBody: [{ id: mid, body, collapsedByDefault: true }] });
  });

/* 3. States with zero coverage in the supplied data. */

/* An archived thread — every supplied thread has archived:false. */
const archivedMsgs = [];
for (let i = 0; i < 22; i++) {
  archivedMsgs.push({
    id: `t16-m${String(i).padStart(4, '0')}`,
    role: i % 2 === 0 ? 'user' : 'assistant',
    body: i % 2 === 0 ? pick(USER_LINES) : pick(ASSISTANT_LINES),
    sentAt: iso(Date.UTC(2026, 6, 14, 9, 0, 0) + i * 240000),
    runtime: runtime(i),
    eligibleForEdit: i === 20,
    collapsedByDefault: false
  });
}
newThreads.push({
  /* The last three manifest `history_rows` belong to the three threads authored here, which is
   * what makes the eighteen rows land one per thread with none left over. */
  id: 'thread-16', title: MANIFEST.historyRows[15], project: 'Puppet Master',
  pinned: false, archived: true, threadState: 'idle',
  updatedAt: iso(Date.UTC(2026, 6, 14, 10, 30, 0)),
  initialVisibleMessageCount: 50, messages: archivedMsgs,
  activeGoal: null, todo: null, subagentGroups: [], diffGroups: [],
  questionnaires: [], artifacts: [], browserSessions: [], draftState: null,
  scriptedReplyCursor: 0, scriptedReplyIds: ['reply-01'], tags: ['archived', 'worktree']
});

/* A Goal with nothing else attached — the "Goal only" test state has no supplied example. */
const goalOnlyMsgs = [];
for (let i = 0; i < 24; i++) {
  goalOnlyMsgs.push({
    id: `t17-m${String(i).padStart(4, '0')}`,
    role: i % 2 === 0 ? 'user' : 'assistant',
    body: i % 2 === 0 ? pick(USER_LINES) : pick(ASSISTANT_LINES),
    sentAt: iso(Date.UTC(2026, 7, 13, 11, 0, 0) + i * 300000),
    runtime: runtime(i, { diverge: i % 6 === 0 }),
    eligibleForEdit: i === 22,
    collapsedByDefault: false
  });
}
newThreads.push({
  id: 'thread-17', title: MANIFEST.historyRows[16], project: 'Puppet Master',
  pinned: false, archived: false, threadState: 'running',
  updatedAt: iso(Date.UTC(2026, 7, 13, 13, 0, 0)),
  initialVisibleMessageCount: 50, messages: goalOnlyMsgs,
  activeGoal: {
    /* Retargeted with the title so the Goal-only thread is about the thing its row names. Only the
     * subject moved; the state, the permission flags and the two clocks are untouched, because
     * those are what this thread exists to demonstrate. */
    id: 'goal-slint-port',
    title: 'Port the access controls to Slint 1.17.1',
    objective: 'Keep every access surface inside the Slint 1.17.1 envelope without losing the measured height transition.',
    status: 'running', workedSeconds: 640, totalElapsedSeconds: 980,
    canEdit: true, canPause: true, canResume: false, canStop: true, canClear: true,
    expanded: false
  },
  todo: null, subagentGroups: [], diffGroups: [],
  questionnaires: [], artifacts: [], browserSessions: [], draftState: null,
  scriptedReplyCursor: 0, scriptedReplyIds: ['reply-02'], tags: ['goal', 'slint']
});

/* A replan-after-edit scenario, plus a deleted diff file and a completed browser session. */
const replanMsgs = [];
for (let i = 0; i < 26; i++) {
  replanMsgs.push({
    id: `t18-m${String(i).padStart(4, '0')}`,
    role: i % 2 === 0 ? 'user' : 'assistant',
    body: i === 18 ? LONG.blocked : (i % 2 === 0 ? pick(USER_LINES) : pick(ASSISTANT_LINES)),
    sentAt: iso(Date.UTC(2026, 7, 14, 8, 0, 0) + i * 280000),
    runtime: runtime(i, { diverge: i % 5 === 0 }),
    eligibleForEdit: i === 24,
    collapsedByDefault: i === 18
  });
}
newThreads.push({
  id: 'thread-18', title: MANIFEST.historyRows[17], project: 'Puppet Master',
  pinned: false, archived: false, threadState: 'running',
  updatedAt: iso(Date.UTC(2026, 7, 14, 10, 0, 0)),
  initialVisibleMessageCount: 50, messages: replanMsgs,
  activeGoal: {
    id: 'goal-visual-sweep',
    title: 'Re-run the visual sweep after the scope change',
    objective: 'Re-run the width and theme sweep after the mid-run scope change.',
    status: 'replanning', workedSeconds: 300, totalElapsedSeconds: 760,
    canEdit: true, canPause: true, canResume: false, canStop: true, canClear: true,
    expanded: true,
    replan: {
      reason: 'The objective was materially edited while three tasks were already running.',
      impact: 'Two tasks were superseded, one is unchanged, and one new task was added.',
      pausedScheduling: true
    },
    progress: { complete: 2, total: 6, subgoalsActive: 1 }
  },
  todo: {
    /* Retargeted alongside the thread title. The six items and their four states — complete,
     * replanned, pending and cancelled — are the point of this list and none of them moved. */
    id: 'todo-visual-sweep',
    items: [
      { id: 'r1', label: 'Read the current capture list', state: 'complete' },
      { id: 'r2', label: 'Confirm the revised width set', state: 'complete' },
      { id: 'r3', label: 'Rewrite the capture step', state: 'replanned' },
      { id: 'r4', label: 'Re-run the affected captures', state: 'pending' },
      { id: 'r5', label: 'Compare against the reference frames', state: 'pending' },
      { id: 'r6', label: 'Remove the retired capture path', state: 'cancelled' }
    ]
  },
  subagentGroups: [],
  diffGroups: [{
    id: 'diff-visual-sweep', label: 'Visual sweep',
    files: [
      { path: 'tools/drive.mjs', added: 64, removed: 12, status: 'edited' },
      { path: 'tools/legacy-capture.mjs', added: 0, removed: 148, status: 'deleted' },
      { path: 'tools/sweep-widths.mjs', added: 91, removed: 0, status: 'created' }
    ]
  }],
  questionnaires: [], artifacts: [],
  browserSessions: [{
    id: 'browser-sweep-check', title: 'Width sweep reference',
    status: 'complete', openTarget: 'editor tab',
    currentPage: 'Width sweep reference, 975 px column',
    pagesVisited: 9, screenshots: 3
  }],
  draftState: null,
  scriptedReplyCursor: 0, scriptedReplyIds: ['reply-03'], tags: ['replan', 'diff', 'browser']
});

/* Per-question skipped state has no field in the supplied schema. Seed one so the
 * questionnaire surface can demonstrate skip-and-revisit from stored data. */
patchThreads.push({
  id: 'thread-12',
  questionnaireSkipSeed: { questionnaireIndex: 0, skippedQuestionIds: ['l2'] }
});

/* Completion state. The supplied schema has no per-thread "finished" field, and
 * threadState: 'idle' does NOT mean finished — it means nothing is running, which
 * is also true of a thread that never started. Without an explicit signal a
 * completed thread and an untouched one are indistinguishable in the history rail,
 * so the status symbol would be lying by omission.
 *
 * These four are the idle threads whose titles describe delivered work. The rest
 * stay idle, which is the honest reading of them. */
for (const id of ['thread-02', 'thread-04', 'thread-13', 'thread-15']) {
  patchThreads.push({ id, completed: true });
}

/* ---------------------------------------------------------------- packet fixture layer
 *
 * Every record below closes a specific census gap measured against the cumulative packet. The
 * supplied demoData.json is never modified — these are additive patches, and where a supplied field
 * already exists with a different shape a NEW SIBLING field is added rather than mutating it.
 *
 * The states are authored here rather than injected by the Director because a state that only exists
 * after a script runs cannot be reviewed by opening the workspace, and cannot be asserted by a probe
 * that has not run the script. The store folds these into `view[threadId]` on first access.
 */

/* Eight Todos, verbatim from the manifest's `todos`. The largest supplied list is seven, so the
 * "8 Todos" requirement had no data behind it and the eight names it wanted were not in the corpus
 * at all.
 *
 * The manifest names the items and says nothing about their states, so the mix is authored here:
 * four done, one active, two pending and one BLOCKED, because a blocked item is the one that makes
 * the completion count interesting and because every todo state has to stay renderable from stored
 * data. The blocked one is the test sweep, which is the item the port collision actually stops —
 * the sweep needs 4173 and the Usage concept's visual-test server is already holding it. */
const T01_TODO = {
  id: 'todo-provider-settings',
  title: 'Provider settings refresh',
  items: [
    { id: 'g1', text: MANIFEST.todos[0], state: 'done' },
    { id: 'g2', text: MANIFEST.todos[1], state: 'done' },
    { id: 'g3', text: MANIFEST.todos[2], state: 'done' },
    { id: 'g4', text: MANIFEST.todos[3], state: 'done' },
    { id: 'g5', text: MANIFEST.todos[4], state: 'active' },
    { id: 'g6', text: MANIFEST.todos[5], state: 'pending' },
    { id: 'g7', text: MANIFEST.todos[6], state: 'blocked',
      blockedReason: 'Port 4173 is held by the Usage concept visual-test server, so the sweep cannot start.' },
    { id: 'g8', text: MANIFEST.todos[7], state: 'pending' }
  ]
};

/* The manifest's three named subagents, plus the extras that keep every agent state renderable.
 *
 * The first three ARE the manifest's `subagents`: the names are its copy, the routes are its
 * `route` values, and `stateSequence` is its `state_sequence` in order. A sequence is not a single
 * state — recording the trail is what lets a work cluster show that a failure was RECOVERED rather
 * than only that the agent is fine now — so `state` is the last entry of the trail and the trail is
 * the evidence behind it.
 *
 * Routes stay in the `<Account label> · <Model>` form PMXRoute produces, and the account labels are
 * the real ones from shared/route.js: a route naming an account the catalogue does not hold is a
 * route nobody could select. Kimi K3 belongs to `Moonshot — Trial` there, not to the
 * `Moonshot — Research` this file used to invent. `Fable` is the one exception. The manifest names
 * it as a bare route, this workspace's catalogue has no Fable account to qualify it with, and
 * inventing one would put a fictional account in a fixture whose whole subject is provider routing,
 * so it is carried exactly as the manifest writes it.
 *
 * Agents four through ten each exist for one reason: they carry a CURRENT state the manifest's
 * three do not. All three of those end completed, so running, queued, blocked, stopped, retried,
 * failed and retrying would otherwise have no record to render. */
const T01_AGENTS = {
  id: 'sg-research',
  title: 'Provider and access specialists',
  agents: [
    { id: 'ag-1', name: 'Interface systems auditor', role: 'Auditor', state: 'completed',
      route: 'Fable', workedSeconds: 240,
      stateSequence: ['queued', 'running', 'completed'],
      resultRef: 'Audited the picker, the access rows and the pinned-history geometry.' },
    { id: 'ag-2', name: 'Provider adapter researcher', role: 'Researcher', state: 'completed',
      route: 'Moonshot — Trial · Kimi K3', workedSeconds: 186,
      stateSequence: ['running', 'completed'],
      resultRef: 'Compared four provider adapters for a Fast tier and a vision route.' },
    { id: 'ag-3', name: 'Slint and test reviewer', role: 'Reviewer', state: 'completed',
      route: 'Alibaba — Cloud · Qwen 3.8', workedSeconds: 302, attempts: 2,
      stateSequence: ['queued', 'running', 'failed', 'retrying', 'completed'],
      failedReason: 'The first attempt asked for a capability bag the adapter does not expose.',
      resultRef: 'Confirmed the Slint 1.17.1 envelope on the second attempt.' },
    { id: 'ag-4', name: 'Access profile drafter', role: 'Writer', state: 'running',
      route: 'OpenAI — Team · GPT-5.6 Pro', workedSeconds: 132,
      resultRef: null },
    { id: 'ag-5', name: 'Handoff writer', role: 'Writer', state: 'queued',
      route: 'Anthropic — Personal · Sonnet 5', workedSeconds: 0,
      resultRef: null },
    { id: 'ag-6', name: 'Visual sweep runner', role: 'Verifier', state: 'blocked',
      route: 'Anthropic — Work · Haiku 4.5', workedSeconds: 44,
      blockedReason: 'Port 4173 is held by the Usage concept visual-test server.', resultRef: null },
    { id: 'ag-7', name: 'Screenshot pass', role: 'Capture', state: 'stopped',
      route: 'Google — Lab · Gemini 3 Ultra', workedSeconds: 18,
      resultRef: null },
    /* This trail ends on `retried` rather than on `completed` because `state` and the last entry of
     * `stateSequence` are the same fact stated twice, and a record that ends its trail somewhere
     * other than where it says it stands is a record a renderer has to choose between. */
    { id: 'ag-8', name: 'Allowance checker', role: 'Reader', state: 'retried',
      route: 'Anthropic — Work · Opus 5', workedSeconds: 96, attempts: 2,
      stateSequence: ['running', 'failed', 'retrying', 'retried'],
      resultRef: 'Usage endpoint answered on the second attempt.' },
    /* `failed` and `retrying` need records of their own: a trail that ends completed shows a
     * recovery in the past, not a failure standing now or a recovery still in flight. */
    { id: 'ag-9', name: 'Capability bag reader', role: 'Reader', state: 'failed',
      route: 'Moonshot — Trial · Kimi K3', workedSeconds: 61,
      failedReason: 'The adapter returned no capability bag for the requested model.',
      attempts: 1, resultRef: null },
    { id: 'ag-10', name: 'Capture retry', role: 'Capture', state: 'retrying',
      route: 'Google — Lab · Gemini 3 Ultra', workedSeconds: 12, attempts: 2,
      retryOf: 'ag-7', resultRef: null }
  ]
};

/* The manifest's three questions, plus the freeform the controller would otherwise never see.
 *
 * q1, q2 and q3 are the manifest's `questions` — ids, prompts, kinds, options and order — and q2
 * carries its `skippable: true`. Skip in this workspace is service-held state (PMXQuestionnaire
 * keys it in a `skipped` map) and the Skip control is offered on every non-final question, so
 * `skippable` is descriptive rather than load-bearing; `required: false` is the field that makes a
 * skip survive validate(), so q2 carries both and neither can contradict the other.
 *
 * q4 is not in the manifest. It is kept because the manifest declares no freeform question at all,
 * and dropping it would leave the controller's third input kind with no authored data — the exact
 * form of coverage reduction the manifest's own portability clause forbids. */
const T01_QUESTIONNAIRE = {
  id: 'qn-thread01-settings',
  createdAt: '2026-08-07T09:12:00Z',
  currentQuestionIndex: 0,
  questions: [
    /* q1 carries a WRITE-IN row. Reference 02_stable_paged_questionnaire.mov makes the last option of
     * a single-select a pencil row that becomes a text field, and the answer typed there survives
     * paging away and back. No supplied question allowed one, so the questionnaire's write-in path
     * was unreachable and `validate()` would have called a typed answer a stale option. */
    { id: 'q1', prompt: 'Where should provider and account policy be managed?', kind: 'single select',
      required: true, writeIn: true, writeInLabel: 'Something else',
      options: [
        'Settings owns policy; Chat chooses the current route',
        'Chat owns everything',
        'Split policy between both surfaces'
      ] },
    { id: 'q2', prompt: 'When a model switch will lose provider cache, what should PM emphasize first?',
      kind: 'single select', required: false, skippable: true,
      options: [
        'Continue here',
        'Branch with the new model',
        'Start a clean chat',
        'Ask every time'
      ] },
    { id: 'q3', prompt: 'Which artifact states must the concept demonstrate?', kind: 'multi select',
      required: false,
      options: ['Multi-file diff', 'Rendered preview', 'Test report', 'Provider-flow document'] },
    { id: 'q4', prompt: 'Anything the screen must never do?', kind: 'freeform', required: false }
  ]
};

/* An ordered Goal lifecycle. The supplied goals carry a status but no transition history, so
 * "start, pause, resume, replan, blocked, complete" could not be shown as a sequence. */
const T01_GOAL = {
  id: 'goal-provider-settings',
  /* `goal.title`, verbatim. The file used to carry a title of its own invention, so the one title
   * the manifest fixes was the one title the demo did not show. */
  title: MANIFEST.goalTitle,
  objective: 'Make every account state visible and every route change consequence explicit.',
  status: 'complete',
  /* Both clocks are the manifest's `completion.elapsed` read as what it says: ninety-four seconds
   * of wall time, seventy-one of them attributed. They used to read 4210 and 5640, which is the same
   * string parsed as one hour thirty-four — a run that worked for seventy minutes cannot report
   * "1m 34s" on the card beside it. */
  workedSeconds: MANIFEST.completion.workedSeconds,
  totalElapsedSeconds: MANIFEST.completion.elapsedSeconds,
  canEdit: true, canPause: false, canResume: false, canStop: false, canClear: true,
  expanded: false,
  /* The scenario manifest names six phases. `surfaces.phaseOf()` has always preferred an
   * authored `phases` list over the status/event fallbacks, but no supplied record carried one,
   * so that branch was dead and every concept rendered a status-derived phase instead. Each entry
   * carries its own state so a phase ladder can show what is done, current and not yet reached. */
  phases: [
    { label: 'Audit',     state: 'done' },
    { label: 'Research',  state: 'done' },
    { label: 'Prototype', state: 'done' },
    { label: 'Implement', state: 'done' },
    { label: 'Verify',    state: 'done' },
    { label: 'Handoff',   state: 'current' }
  ],
  phaseIndex: 5,
  events: [
    { at: '2026-08-07T09:20:00Z', phase: 'start' },
    { at: '2026-08-07T09:54:00Z', phase: 'pause' },
    { at: '2026-08-07T10:06:00Z', phase: 'resume' },
    { at: '2026-08-07T10:41:00Z', phase: 'replan' },
    { at: '2026-08-07T11:12:00Z', phase: 'blocked' },
    { at: '2026-08-07T12:34:00Z', phase: 'complete' }
  ],
  /* The manifest's `completion` block. `result_summary` and `verification` are its copy and
   * `elapsed` is its string; the receipt keeps the seconds beside them so a renderer can format its
   * own clock without contradicting the authored one. The artifact ids are the four the manifest's
   * `artifacts` list names, resolved to the ids this workspace's catalogue actually holds. */
  completion: {
    resultSummary: MANIFEST.completion.resultSummary,
    verification: MANIFEST.completion.verification,
    elapsed: MANIFEST.completion.elapsed
  },
  completionReceipt: {
    at: '2026-08-07T12:34:00Z',
    verified: true,
    resultSummary: MANIFEST.completion.resultSummary,
    verification: MANIFEST.completion.verification,
    elapsed: MANIFEST.completion.elapsed,
    artifacts: ['artifact-diff', 'artifact-preview', 'artifact-test', 'artifact-handoff'],
    elapsedSeconds: MANIFEST.completion.elapsedSeconds,
    workedSeconds: MANIFEST.completion.workedSeconds
  }
};

/* Six activity kinds with no supplied coverage. The browser-related labels use PM-native
 * vocabulary — BrowserWorkspace, Browser Action, BrowserPage, TestCapture — because the packet's
 * terminology correction forbids third-party test-runner names in PM-owned surfaces. */
const T01_ACTIVITY_STAGES = [
  /* Each stage now carries BOTH label forms. Reference `03_compact_execution_activity.mov`
   * (contact sheet @13s vs @30s, keyframe set c @36s) shows a group header that is a present
   * participle while the work runs and a past tense once it finishes — `Making 1 edit` becomes
   * `Made 1 create, 2 edits`, `Exploring 5 files` becomes `Explored 7 files`. The supplied prose
   * described only the finished line, so every concept rendered the past tense while still running.
   * `count`/`unit` exist so a renderer can rewrite the number in place instead of replacing the row. */
  /* `thought` leads the list because reference 03_compact_execution_activity.mov opens on
   * "Thinking for 4s" — reasoning is a peer group in the same stream, not a separate channel, and
   * the contract's `activity.thinking_summary` event had no stage kind to land on.
   *
   * It is also the ONE stage that deliberately keeps `detail` and takes no `rows`. The same
   * reference renders reasoning as flowing text; splitting a summary into a row list would invent a
   * structure the provider never gave us, and would imply the thinking was itemised work. */
  { id: 'st-thought', kind: 'thought', label: 'Thought for 4s', runningLabel: 'Thinking for 4s',
    count: 1, unit: 'summary',
    detail: 'Only the provider-exposed summary; no hidden reasoning is claimed.', durationMs: 4000,
    op: { verb: 'Reasoning', target: 'summary only', cache: 'not applicable', sources: 0, runtimeArtifact: null,
      input: '{ scope: "provider-exposed summary" }',
      why: 'Only the summary the provider exposed is shown; no hidden reasoning is claimed.' } },
  /* EVERY stage below this point carries its own `rows`, and that is the whole of the per-phase
   * disclosure the concepts are built on. Reference 03_compact_execution_activity.mov expands each
   * phase into its own sub-rows — "Exploring 5 files" opens into five `Read <path>` lines, and
   * "Importing from Figma" into `Processing Figma Design ...` lines — so a phase that expands to a
   * single `detail` sentence has nothing to disclose and the disclosure affordance is decorative.
   * Only `edit` and `generate` had rows, which is why six of the nine phases opened onto one line.
   *
   * Two rules the rows obey. Row COUNT equals the stage `count` whenever that count counts rows:
   * st-read says seven files and lists seven. Where the count is not a row count — st-search counts
   * matches, st-test counts checks — the rows are a representative handful and the count is left
   * alone, because thirty-one invented match rows would be thirty-one invented facts. Row TARGETS
   * are this workspace's real files and its real verification subjects; a fabricated path in a
   * fixture about auditing files is the one lie the surface cannot survive.
   *
   * `added`/`removed` are omitted where there is no delta. A read has no line count, and reporting
   * "+0 -0" for one would be a measurement nobody took. */
  { id: 'st-read', kind: 'read', label: 'Read 7 files', runningLabel: 'Reading 7 files',
    count: 7, unit: 'files',
    detail: 'shared/route.js, shared/access.js and five more', durationMs: 2400,
    op: { verb: 'Reading', target: '7 files', cache: 'warm', sources: 7, runtimeArtifact: null,
      input: '{ paths: ["shared/route.js", "shared/access.js", "+5 more"] }',
      why: 'The account rows had to be read before their states could be mapped to copy.' },
    rows: [
      { verb: 'Read', target: 'shared/route.js' },
      { verb: 'Read', target: 'shared/access.js' },
      { verb: 'Read', target: 'shared/approvals.js' },
      { verb: 'Read', target: 'shared/selectors.js' },
      { verb: 'Read', target: 'shared/opsawareness.js' },
      { verb: 'Read', target: 'shared/questionnaire.js' },
      { verb: 'Read', target: 'CONTRACT.md' }
    ] },
  /* Five rows under a count of thirty-one: the count is matches, the rows are the files the matches
   * landed in, and each of these five genuinely carries account-label copy today. */
  { id: 'st-search', kind: 'search', label: 'Searched the repository for account labels',
    runningLabel: 'Searching the repository for account labels',
    count: 31, unit: 'matches',
    detail: '31 matches across 9 files', durationMs: 1600,
    op: { verb: 'Searching', target: 'account labels', cache: 'miss', sources: 9, runtimeArtifact: null,
      input: '{ query: "account label", scope: "repository" }',
      why: 'Searched the repository because the label vocabulary was not documented anywhere.' },
    rows: [
      { verb: 'Searched', target: 'shared/route.js' },
      { verb: 'Searched', target: 'shared/surfaces.js' },
      { verb: 'Searched', target: 'shared/artifacts.js' },
      { verb: 'Searched', target: 'shared/store.js' },
      { verb: 'Searched', target: 'shared/spell.js' }
    ] },
  { id: 'st-web', kind: 'web', label: 'Fetched the provider status page',
    runningLabel: 'Fetching the provider status page',
    count: 1, unit: 'page',
    detail: 'One page, cached for the run', durationMs: 3100,
    op: { verb: 'Fetching', target: 'provider status page', cache: 'miss', sources: 1, runtimeArtifact: null,
      input: '{ url: "provider status page", freshness: "required" }',
      why: 'Fetched the page because a cached status could not support a readiness claim.' },
    rows: [
      { verb: 'Fetched', target: 'Provider status page for Anthropic — Work' }
    ] },
  { id: 'st-browser', kind: 'browser', label: 'Opened a BrowserPage in the BrowserWorkspace',
    runningLabel: 'Opening a BrowserPage in the BrowserWorkspace',
    count: 1, unit: 'page',
    detail: 'Browser Action: inspect the settings route', durationMs: 5200,
    op: { verb: 'Opening', target: 'BrowserPage in the BrowserWorkspace', cache: 'not applicable', sources: 1, runtimeArtifact: 'artifact-preview',
      input: '{ action: "inspect", route: "settings" }',
      why: 'Opened a page because the rendered route is the only honest check of the layout.' },
    rows: [
      { verb: 'Opened', target: 'stage.html — provider selector at 975 px' }
    ] },
  /* Five rows under a count of eighteen checks. The five are the interaction report's own passing
   * rows, so the activity phase and the test-report artifact name the same checks instead of
   * describing the same run in two different vocabularies. */
  { id: 'st-test', kind: 'test', label: 'Ran the interaction suite',
    runningLabel: 'Running the interaction suite',
    count: 18, unit: 'checks',
    detail: 'TestCapture retained for the failing case', durationMs: 8800,
    op: { verb: 'Running', target: 'interaction suite', cache: 'not applicable', sources: 18, runtimeArtifact: 'artifact-test',
      input: '{ suite: "interaction", widths: [520, 750, 1200] }',
      why: 'Ran the suite because a layout claim without a run is an opinion.' },
    rows: [
      { verb: 'Checked', target: 'Pinned history clears the transcript at 520' },
      { verb: 'Checked', target: 'Full pin demotes to compact under the floor' },
      { verb: 'Checked', target: 'Artifact opens left of the composer rectangle' },
      { verb: 'Checked', target: 'Composer draft survives a question flow' },
      { verb: 'Checked', target: 'History and artifact coexist at 1200' }
    ] },
  /* `edit` and `generate` had NO representative kind. The reference's densest rows are edits, and
   * each carries its own +added/-removed pair; ours only ever had a group-level total, so a
   * per-row delta could not be rendered by any concept. */
  { id: 'st-edit', kind: 'edit', label: 'Made 1 create, 2 edits',
    runningLabel: 'Making 1 create, 2 edits',
    count: 3, unit: 'changes',
    detail: '3 files touched', durationMs: 6400,
    op: { verb: 'Editing', target: '3 files', cache: 'not applicable', sources: 3, runtimeArtifact: 'artifact-diff',
      input: '{ files: 3, added: 184, removed: 67 }',
      why: 'Edited the selector and access modules because the route change had to reach both.' },
    rows: [
      { verb: 'Edited', target: 'shared/selectors.js', added: 92, removed: 18 },
      { verb: 'Created', target: 'shared/access.js', added: 61, removed: 0 },
      { verb: 'Edited', target: 'shared/route.js', added: 31, removed: 49 }
    ] },
  { id: 'st-generate', kind: 'generate', label: 'Generated 2 images',
    runningLabel: 'Generating assets',
    count: 2, unit: 'images',
    detail: 'Account row states, light and dark', durationMs: 4100,
    op: { verb: 'Generating', target: '2 images', cache: 'not applicable', sources: 2, runtimeArtifact: 'artifact-preview',
      input: '{ subjects: ["account rows light", "account rows dark"] }',
      why: 'Generated both themes because a single-theme asset cannot prove the contrast rule.' },
    rows: [
      { verb: 'Generated', target: 'account-rows-light.png', added: 0, removed: 0 },
      { verb: 'Generated', target: 'account-rows-dark.png', added: 0, removed: 0 }
    ] },
  { id: 'st-verify', kind: 'verify', label: 'Verified the rendered settings screen',
    runningLabel: 'Verifying the rendered settings screen',
    count: 1, unit: 'screen',
    detail: 'Matched the account list against the catalog', durationMs: 2700,
    op: { verb: 'Verifying', target: 'rendered settings screen', cache: 'not applicable', sources: 1, runtimeArtifact: 'artifact-test',
      input: '{ against: "account catalog" }',
      why: 'Verified against the catalog because the screen is only correct relative to it.' },
    rows: [
      { verb: 'Verified', target: 'Six account rows against the catalog in shared/route.js' }
    ] }
];

/* The port collisions.
 *
 * 4173 is DEMO_SCENARIO_MANIFEST.json's `resource_collision` exactly: requested 4173, occupied by
 * the Usage concept visual-test server, 4174 offered as the safe alternative. shared/demo.js and
 * shared/opsawareness.js already carry it; this fixture still had only the 3000/checkout record, so
 * the ops layer and the thread's own conflict list disagreed about which port this run contested.
 *
 * The 3000 record stays alongside it rather than being replaced. It is verbatim copy from the
 * earlier packet, deleting it to satisfy a later fixture would drop coverage the earlier packet
 * asked for, and shared/opsawareness.js models both ports as contested — a real machine has more
 * than one. Two records also let a concept show a conflict LIST rather than a single card. */
const T01_CONFLICTS = [
  {
    id: 'conf-port-4173',
    kind: 'port',
    port: 4173,
    summary: 'Port 4173 is used by the Usage concept visual-test server. Use 4174 instead?',
    owner: { threadId: 'thread-11', threadTitle: 'Usage concept visual-test server', worktree: 'main' },
    suggestedAlternative: 4174,
    actions: [
      { id: 'use-4174', label: 'Use 4174', primary: true },
      { id: 'details', label: 'Details' },
      { id: 'cancel', label: 'Cancel' }
    ]
  },
  {
    id: 'conf-port-3000',
    kind: 'port',
    port: 3000,
    summary: 'Port 3000 is used by the checkout redesign in another worktree. Use 3001 instead?',
    owner: { threadId: 'thread-07', threadTitle: 'Checkout redesign', worktree: 'feature/checkout' },
    suggestedAlternative: 3001,
    actions: [
      { id: 'use-3001', label: 'Use 3001', primary: true },
      { id: 'details', label: 'Details' },
      { id: 'cancel', label: 'Cancel' }
    ]
  }
];

/* Material warnings and a cross-project grant, with the packet's verbatim copy. */
const T01_DECISIONS = [
  {
    id: 'dec-provider-boundary',
    kind: 'warning', severity: 'material',
    cls: 'provider_boundary',
    question: 'Switch to Claude API?',
    scopeLine: 'This will resend the conversation through a different provider and restart the prompt cache.',
    actions: [
      { id: 'cancel', label: 'Cancel' },
      { id: 'branch', label: 'Branch' },
      { id: 'switch', label: 'Switch', primary: true },
      { id: 'details', label: 'Details' }
    ],
    details: {
      commands: [], files: [], servers: [], domains: ['Anthropic'],
      persistence: 'This thread and its future turns',
      saferAlternative: 'Branch the thread so the current conversation keeps its cache',
      receipts: ['provider_boundary', 'cache_loss']
    },
    status: 'pending', decidedAction: null
  },
  {
    id: 'dec-price-allowance',
    kind: 'warning', severity: 'material',
    cls: 'price_allowance_change',
    question: 'Continue on a paid allowance?',
    scopeLine: 'The included allowance for this account is spent · Further turns are billed',
    actions: [
      { id: 'cancel', label: 'Cancel' },
      { id: 'once', label: 'Allow once' },
      { id: 'session', label: 'Allow for session' },
      { id: 'details', label: 'Details' }
    ],
    details: {
      commands: [], files: [], servers: [], domains: [],
      persistence: 'Until the allowance resets',
      saferAlternative: 'Switch to an account with allowance remaining',
      receipts: ['price_allowance_change']
    },
    status: 'pending', decidedAction: null
  },
  {
    id: 'dec-cross-project',
    kind: 'grant', severity: 'material',
    cls: null,
    question: 'This task will read Project A and modify Project B.',
    scopeLine: 'Cross-project access · Read one project, write another',
    actions: [
      { id: 'cancel', label: 'Cancel' },
      { id: 'once', label: 'Allow once' },
      { id: 'goal', label: 'Allow for this Goal' },
      { id: 'settings', label: 'Open Settings' }
    ],
    details: {
      commands: [], files: ['Project A (read)', 'Project B (write)'], servers: [], domains: [],
      persistence: 'Allow for this Goal ends when the Goal ends',
      saferAlternative: 'Copy the needed file into Project B first',
      receipts: []
    },
    status: 'pending', decidedAction: null
  },
  /* The manifest's three `warnings`, verbatim, one per record. Each is a CONSEQUENCE sentence, so it
   * lands on `scopeLine` — the field whose whole job is to state the one thing that will happen —
   * and the question above it asks for the decision the sentence justifies.
   *
   * They are added rather than substituted. The provider-boundary record above carries the earlier
   * packet's own verbatim consequence line, and overwriting it with this one would trade one piece
   * of canonical copy for another instead of instantiating both. */
  {
    id: 'dec-cache-replay',
    kind: 'warning', severity: 'material',
    cls: 'conversation_replay',
    question: 'Switch the model on this thread?',
    scopeLine: MANIFEST.warnings[0],
    actions: [
      { id: 'cancel', label: 'Cancel' },
      { id: 'branch', label: 'Branch with the new model' },
      { id: 'switch', label: 'Switch', primary: true },
      { id: 'details', label: 'Details' }
    ],
    details: {
      commands: [], files: [], servers: [], domains: ['Anthropic', 'Moonshot'],
      persistence: 'This thread and its future turns',
      saferAlternative: 'Branch with the new model so this conversation keeps its cache',
      receipts: ['conversation_replay', 'cache_loss']
    },
    status: 'pending', decidedAction: null
  },
  {
    /* The attachment warning is the one T01_ATTACHMENTS exists to provoke: a QuickTime file on a
     * route with no native video. Extract frames and the vision route are the two honest ways
     * through, which is why the manifest's sentence names both instead of refusing the file. */
    id: 'dec-video-route',
    kind: 'warning', severity: 'material',
    cls: 'attachment_incompatibility',
    question: 'Read walkthrough.mov another way?',
    scopeLine: MANIFEST.warnings[1],
    actions: [
      { id: 'cancel', label: 'Cancel' },
      { id: 'extract-frames', label: 'Extract frames', primary: true },
      { id: 'vision-route', label: 'Use the vision route' },
      { id: 'details', label: 'Details' }
    ],
    details: {
      commands: [], files: ['walkthrough.mov'], servers: [], domains: [],
      persistence: 'This attachment on this turn',
      saferAlternative: 'Extract frames and send the frames instead',
      receipts: ['attachment_incompatibility']
    },
    status: 'pending', decidedAction: null
  },
  {
    /* The capacity warning has no consequence class, because nothing about the route changes: it is
     * advice about how much work the remaining allowance can carry. A classless warning is exactly
     * what PMXApprovals grades as `informational`, and no fixture record had that severity before,
     * so the informational treatment had nothing to render. */
    id: 'dec-capacity-reserve',
    kind: 'warning', severity: 'informational',
    cls: null,
    question: 'Start all eight specialists now?',
    scopeLine: MANIFEST.warnings[2],
    actions: [
      { id: 'cancel', label: 'Cancel' },
      { id: 'two-at-a-time', label: 'Run two at a time', primary: true },
      { id: 'details', label: 'Details' }
    ],
    details: {
      commands: [], files: [], servers: [], domains: [],
      persistence: 'This Goal',
      saferAlternative: 'Run two at a time and keep the rest queued',
      receipts: []
    },
    status: 'pending', decidedAction: null
  }
];

/* The unsupported attachment that drives the alternate-route offer. */
const T01_ATTACHMENTS = [
  { name: 'walkthrough.mov', mime: 'video/quicktime', bytes: 48210944 }
];

/* Back Seat Driver: Auto with real advice on thread-01, and a manual On elsewhere so both
 * treatments are visible without firing a trigger. */
const T01_BSD = {
  mode: 'auto',
  scope: 'thread',
  advice: [
    {
      id: 'adv-port-config',
      at: '2026-08-07T11:14:00Z',
      severity: 'caution',
      text: 'The port change was not reflected in the test config.',
      evidenceRefs: ['config/worktrees.json'],
      readOnly: true
    }
  ]
};

/* Offline queue plus the transport that explains it. The entry id IS the idempotency key, which is
 * what makes "replayed exactly once" checkable from the fixture. */
const T01_OUTBOX = [
  {
    id: 'obx-seed-0001',
    commandId: 'cmd.chat.send',
    payload: { threadId: 'thread-01', body: 'Confirm the port change landed in the test configuration.' },
    createdAt: '2026-08-07T11:20:00Z',
    attempts: 0,
    status: 'queued'
  }
];

/* Thread operations with no supplied coverage: an awaiting cross-thread request, a spawned child, a
 * branch and a restore point. */
const T01_THREADOPS = {
  requests: [
    {
      id: 'req-0001',
      sourceThreadId: 'thread-01',
      targetThreadId: 'thread-11',
      sender: 'Product designer',
      task: 'Confirm whether the checkout worktree still needs port 3000.',
      evidenceRefs: ['config/worktrees.json'],
      scope: 'read-only',
      budget: { turns: 2, seconds: 120 },
      createdAt: '2026-08-07T11:22:00Z',
      updatedAt: '2026-08-07T11:22:00Z',
      status: 'awaiting',
      resultRefs: []
    }
  ],
  spawned: [
    {
      id: 'spawn-0001',
      threadId: 'thread-01-child-1',
      relation: 'child',
      task: 'Survey every provider adapter for a Fast tier.',
      createdAt: '2026-08-07T10:44:00Z',
      state: 'running'
    }
  ],
  branches: [
    {
      id: 'branch-0001',
      threadId: 'thread-01-branch-1',
      branchedFrom: { threadId: 'thread-01', messageId: 't01-m0014' },
      inheritedRefs: [{ kind: 'artifact', id: 'artifact-diff', label: 'Assistant Chat change set' }],
      createdAt: '2026-08-07T10:58:00Z'
    }
  ],
  restorePoints: [
    {
      id: 'rp-0001',
      threadId: 'thread-01',
      messageId: 't01-m0014',
      createdAt: '2026-08-07T10:57:00Z',
      label: 'Before the scope change'
    }
  ],
  rewoundTo: null,
  redirect: null
};

/* The final verification message. The supplied corpus has no message carrying a verification
 * result with both elapsed and worked time, so the "final verification + elapsed" requirement had
 * nothing to render. */
const T01_FINAL = {
  id: 't01-m9001',
  role: 'assistant',
  /* The first line is the manifest's `completion.result_summary` verbatim, because the transcript is
   * where a reader looks for what the run concluded and a summary that lives only on a card is a
   * summary the conversation never states. */
  body: `${MANIFEST.completion.resultSummary}

Every account now shows its connection form and its setup state inline, and the model rows carry at most three facts each. The route change consequence copy is in place, including the provider boundary case which replays the conversation without the current provider cache.

One item is still blocked: the theme, width, keyboard and reduced-motion sweep needs port 4173, and the Usage concept visual-test server is holding it. I left the item blocked rather than moving a port another thread is serving on.`,
  sentAt: '2026-08-07T12:34:00Z',
  runtime: {
    provider: 'Anthropic', model: 'Opus 5', persona: 'Product designer',
    mode: 'Agent', effort: 'High',
    workedSeconds: MANIFEST.completion.workedSeconds,
    totalElapsedSeconds: MANIFEST.completion.elapsedSeconds,
    tokenCount: 6400, contextUsed: 7620, contextLimit: 128000,
    estimatedCost: 0.34,
    terminalAt: '2026-08-07T12:34:00Z', terminalReason: 'completed'
  },
  /* `verification` is the manifest's own verification string, and both clocks come from its
   * `elapsed`. The elapsed STRING is carried beside the seconds so a surface that prints the
   * authored form and one that formats the number cannot disagree. */
  verification: {
    result: 'passed',
    note: MANIFEST.completion.verification,
    resultSummary: MANIFEST.completion.resultSummary,
    elapsed: MANIFEST.completion.elapsed,
    elapsedSeconds: MANIFEST.completion.elapsedSeconds,
    workedSeconds: MANIFEST.completion.workedSeconds
  },
  eligibleForEdit: false,
  collapsedByDefault: false
};

patchThreads.push({
  id: 'thread-01',
  todo: T01_TODO,
  subagentGroups: [T01_AGENTS],
  questionnaires: [T01_QUESTIONNAIRE],
  activeGoal: T01_GOAL,
  activityStages: T01_ACTIVITY_STAGES,
  conflicts: T01_CONFLICTS,
  decisions: T01_DECISIONS,
  attachments: T01_ATTACHMENTS,
  bsd: T01_BSD,
  outboxSeed: T01_OUTBOX,
  syncSeed: { transport: 'offline', domain: 'live' },
  threadOps: T01_THREADOPS,
  /* The four forecast values stay as they are: shared/surfaces.js pins them for thread-01 because
   * the packet froze that example, and a seed that disagreed with the pin would be a number nothing
   * renders. `requiredRoles` is rewritten to the six distinct roles the group now holds, so the six
   * requested specialists and the six named roles are the same six.
   *
   * The manifest's capacity warning speaks of EIGHT specialists. That is deliberate and not a
   * mismatch to fix here: the warning is about an ask larger than this run's forecast, which is
   * exactly the situation it advises on — run two at a time and reserve capacity for synthesis. */
  capacitySeed: {
    requested: 6, recommendedConcurrent: 2, waves: 3,
    reason: 'provider allowance and verification reserve',
    requiredRoles: ['Auditor', 'Researcher', 'Reviewer', 'Writer', 'Verifier', 'Capture'],
    droppedRoles: []
  },
  appendAt: null,
  appendMessages: [T01_FINAL]
});

/* A second thread demonstrating manual Back Seat Driver On, so both the glow-free static treatment
 * and the Auto treatment are visible side by side in the gallery. */
patchThreads.push({
  id: 'thread-03',
  bsd: {
    mode: 'on',
    scope: 'thread',
    advice: [
      {
        id: 'adv-lantern-copy',
        at: '2026-08-06T15:02:00Z',
        severity: 'note',
        text: 'The lantern copy still says "workspace" where the rest of the screen says "project".',
        evidenceRefs: [],
        readOnly: true
      }
    ]
  }
});

const extension = {
  schemaVersion: 1,
  note: 'Additive layer over demo/demoData.json. Everything here is a patch or a whole new thread; the corpus itself carries only the manifest facts that ARE corpus facts, the thread titles and the opening request.',
  patchThreads,
  threads: newThreads,
  scriptedReplies: []
};

const banner = (name) => `/* GENERATED by demo/build-demo-bundles.mjs — do not hand-edit.\n * Exists because fetch() cannot read a sibling file over file:// in Chromium.\n */\n`;

/* Name the manifest the corpus came from. The scenario's questions, goal phases, todos, subagents,
 * warnings, artifacts and eighteen history rows are all instantiated here and were checkable one by
 * one — but `settings-provider-chat-redesign` itself appeared nowhere in the workspace, so nothing
 * linked the data to the document it was built from, and the only way to establish the link was to
 * re-derive it by matching strings. */
base.sourceScenario = {
  manifest: 'PM_Assistant_Chat_Dependency_Media_and_Work_Correction_2026-08-13/DEMO_SCENARIO_MANIFEST.json',
  scenario_id: 'settings-provider-chat-redesign',
  title: 'Provider settings and Chat access redesign',
  /* The one deliberate divergence, recorded where a reader of the corpus will meet it. */
  localised: 'DEMO_SCENARIO_MANIFEST diff_files names threads/provider-selector.js, ' +
    'threads/access-controls.css and verification/interaction-probes.mjs; none exists in this ' +
    'workspace, so shared/artifacts.js maps them onto shared/selectors.js, shared/access-controls.css ' +
    'and tests/interaction-probes.js, keeping the manifest line counts (92/18, 61/39, 31/10) exactly.'
};

/* Two spaces and no trailing newline is exactly how the supplied corpus was formatted, which is
 * checkable: re-serializing the untouched file this way reproduced it byte for byte. Keeping that
 * shape means the diff on this file only ever shows the lines the generator actually changed
 * instead of a 10,000-line reformat. */
writeFileSync(join(here, 'demoData.json'), JSON.stringify(base, null, 2));

writeFileSync(join(here, 'demoData.bundle.js'),
  banner() + 'window.PMX_DEMO_DATA = ' + JSON.stringify(base) + ';\n');
writeFileSync(join(here, 'demoDataExtension.js'),
  banner() + 'window.PMX_DEMO_EXTENSION = ' + JSON.stringify(extension) + ';\n');

/* Report actual numbers so the coverage claims in the reports are measured, not asserted. */
const merged = JSON.parse(JSON.stringify(base));
const byId = Object.fromEntries(merged.threads.map((t) => [t.id, t]));
for (const p of patchThreads) {
  const t = byId[p.id];
  if (!t) continue;
  if (p.replaceMessageBody) for (const r of p.replaceMessageBody) {
    const m = t.messages.find((x) => x.id === r.id);
    if (m) { m.body = r.body; if (r.collapsedByDefault != null) m.collapsedByDefault = r.collapsedByDefault; }
  }
  if (p.appendMessages) {
    const at = p.appendAt ?? t.messages.length;
    t.messages = [...t.messages.slice(0, at), ...p.appendMessages, ...t.messages.slice(at)];
  }
}
merged.threads.push(...newThreads);
const all = merged.threads.flatMap((t) => t.messages);
const over = (n) => all.filter((m) => m.body.length > n).length;
/* The packet keys are MEASURED from the merged corpus, not restated from the source above, so a
 * record that fails to land shows up as a number rather than as a passing claim. */
const patchById = Object.fromEntries(patchThreads.filter((p) => p.id).map((p) => [p.id, p]));
for (const [id, p] of Object.entries(patchById)) {
  const t = byId[id];
  if (!t) continue;
  for (const [k, v] of Object.entries(p)) {
    if (k === 'id' || k === 'appendMessages' || k === 'appendAt' || k === 'replaceMessageBody') continue;
    t[k] = v;
  }
}
const agentRecords = merged.threads.flatMap((t) => (t.subagentGroups || []).flatMap((sg) => sg.agents || []));
const activityKinds = [...new Set(merged.threads.flatMap((t) => (t.activityStages || []).map((s) => s.kind)))].sort();
const attachmentClasses = (() => {
  const seen = new Set();
  for (const t of merged.threads) for (const a of (t.attachments || [])) {
    if (/\.(mov|mp4)$/i.test(a.name)) seen.add('unsupported');
    else if (/\.(zip|pdf|m4a|xlsx)$/i.test(a.name)) seen.add('transformed');
    else seen.add('native');
  }
  return [...seen].sort();
})();

/* Manifest coverage, measured the way a reviewer would measure it: serialize the built corpus and
 * look for each declared string inside it. A constant that is defined above but never reaches a
 * record — the failure mode that left this fixture with 0 of 18 history rows and 0 of 8 todos while
 * every constant sat in the file — shows up here as a name in `missing`, not as a silent pass.
 * Comparison is done against the JSON-escaped form so a string containing a quote or a backslash is
 * looked for as it actually appears in the serialized corpus. */
const mergedText = JSON.stringify(merged);
const missing = [];
const present = (label, s) => {
  const found = mergedText.indexOf(JSON.stringify(s).slice(1, -1)) >= 0;
  if (!found) missing.push(label);
  return found;
};
const countPresent = (label, list) => list.filter((s, i) => present(`${label}[${i}]`, s)).length;
const manifestCoverage = {
  historyRows: `${countPresent('history_rows', MANIFEST.historyRows)}/18`,
  todos: `${countPresent('todos', MANIFEST.todos)}/8`,
  warnings: `${countPresent('warnings', MANIFEST.warnings)}/3`,
  subagents: `${countPresent('subagents', ['Interface systems auditor', 'Provider adapter researcher', 'Slint and test reviewer'])}/3`,
  subagentRoutes: `${countPresent('routes', ['Fable', 'Kimi K3', 'Qwen 3.8'])}/3`,
  goalPhases: `${countPresent('goal.phases', ['Audit', 'Research', 'Prototype', 'Implement', 'Verify', 'Handoff'])}/6`,
  goalTitle: present('goal.title', MANIFEST.goalTitle),
  userRequest: present('user_request', MANIFEST.userRequest),
  resultSummary: present('completion.result_summary', MANIFEST.completion.resultSummary),
  verification: present('completion.verification', MANIFEST.completion.verification),
  elapsed: present('completion.elapsed', MANIFEST.completion.elapsed),
  collision: present('resource_collision', 'Port 4173 is used by the Usage concept visual-test server. Use 4174 instead?'),
  missing
};

console.log(JSON.stringify({
  threads: merged.threads.length,
  messages: all.length,
  longestThread: Math.max(...merged.threads.map((t) => t.messages.length)),
  over1200: over(1200), over2500: over(2500), over5000: over(5000),
  medianLen: all.map((m) => m.body.length).sort((a, b) => a - b)[Math.floor(all.length / 2)],
  archivedThreads: merged.threads.filter((t) => t.archived).length,
  deletedDiffFiles: merged.threads.flatMap((t) => t.diffGroups || []).flatMap((g) => g.files).filter((f) => f.status === 'deleted').length,
  divergingRuntime: all.filter((m) => m.runtime && m.runtime.totalElapsedSeconds !== m.runtime.workedSeconds).length,

  todoMax: Math.max(...merged.threads.map((t) => (t.todo && t.todo.items ? t.todo.items.length : 0))),
  todoStates: [...new Set(merged.threads.flatMap((t) => ((t.todo && t.todo.items) || []).map((i) => i.state)))].sort(),
  agentRecords: agentRecords.length,
  agentRoutes: new Set(agentRecords.map((a) => a.route).filter(Boolean)).size,
  agentStates: [...new Set(agentRecords.map((a) => a.state))].sort(),
  agentStateSequences: agentRecords.filter((a) => a.stateSequence).length,
  activityKinds,
  /* Rows per stage, so "every phase discloses something" is a measurement rather than a claim. The
   * thought stage is expected to read 0 here and everything else is expected to be non-zero. */
  activityRows: Object.fromEntries((byId['thread-01'].activityStages || []).map((s) => [s.id, (s.rows || []).length])),
  conflicts: merged.threads.flatMap((t) => t.conflicts || []).length,
  decisions: merged.threads.flatMap((t) => t.decisions || []).length,
  attachmentClasses,
  bsdStates: [...new Set(merged.threads.map((t) => t.bsd && t.bsd.mode).filter(Boolean))].sort(),
  outboxEntries: merged.threads.flatMap((t) => t.outboxSeed || []).length,
  threadOpRecords: merged.threads.reduce((n, t) => {
    const o = t.threadOps || {};
    return n + (o.requests || []).length + (o.spawned || []).length + (o.branches || []).length + (o.restorePoints || []).length;
  }, 0),
  questionKinds: [...new Set(merged.threads.flatMap((t) => (t.questionnaires || []).flatMap((q) => (q.questions || []).map((x) => x.kind))))].sort(),
  skippableQuestions: merged.threads.flatMap((t) => (t.questionnaires || []).flatMap((q) => (q.questions || []))).filter((x) => x.skippable).length,
  goalPhaseEvents: [...new Set(merged.threads.flatMap((t) => ((t.activeGoal && t.activeGoal.events) || []).map((e) => e.phase)))],
  goalPhases: ((byId['thread-01'].activeGoal || {}).phases || []).map((p) => p.label),
  verificationMessages: all.filter((m) => m.verification).length,
  threadTitles: merged.threads.map((t) => t.title),
  manifest: manifestCoverage
}, null, 2));
