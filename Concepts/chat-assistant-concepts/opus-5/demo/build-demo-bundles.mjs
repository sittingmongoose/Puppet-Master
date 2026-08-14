/* Generates the two browser bundles this workspace loads.
 *
 *   demo/demoData.bundle.js       -> window.PMX_DEMO_DATA       (the supplied dataset, verbatim)
 *   demo/demoDataExtension.js     -> window.PMX_DEMO_EXTENSION  (our additive layer)
 *
 * Bundles exist because fetch() cannot read a sibling file over file:// in Chromium.
 * The supplied demoData.json is only ever READ here. It is never rewritten.
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
  id: 'thread-16', title: 'Export format decision', project: 'Tastebook',
  pinned: false, archived: true, threadState: 'idle',
  updatedAt: iso(Date.UTC(2026, 6, 14, 10, 30, 0)),
  initialVisibleMessageCount: 50, messages: archivedMsgs,
  activeGoal: null, todo: null, subagentGroups: [], diffGroups: [],
  questionnaires: [], artifacts: [], browserSessions: [], draftState: null,
  scriptedReplyCursor: 0, scriptedReplyIds: ['reply-01'], tags: ['archived', 'export']
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
  id: 'thread-17', title: 'Rename the worktree flow', project: 'Puppet Master',
  pinned: false, archived: false, threadState: 'running',
  updatedAt: iso(Date.UTC(2026, 7, 13, 13, 0, 0)),
  initialVisibleMessageCount: 50, messages: goalOnlyMsgs,
  activeGoal: {
    id: 'goal-worktree-rename',
    title: 'Rename the worktree flow end to end',
    objective: 'Rename the worktree concept consistently across the interface without breaking saved selections.',
    status: 'running', workedSeconds: 640, totalElapsedSeconds: 980,
    canEdit: true, canPause: true, canResume: false, canStop: true, canClear: true,
    expanded: false
  },
  todo: null, subagentGroups: [], diffGroups: [],
  questionnaires: [], artifacts: [], browserSessions: [], draftState: null,
  scriptedReplyCursor: 0, scriptedReplyIds: ['reply-02'], tags: ['goal']
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
  id: 'thread-18', title: 'Scope change mid-run', project: 'Puppet Master',
  pinned: false, archived: false, threadState: 'running',
  updatedAt: iso(Date.UTC(2026, 7, 14, 10, 0, 0)),
  initialVisibleMessageCount: 50, messages: replanMsgs,
  activeGoal: {
    id: 'goal-scope-change',
    title: 'Apply the revised import rules',
    objective: 'Apply the revised import rules after the mid-run scope change.',
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
    id: 'todo-scope-change',
    items: [
      { id: 'r1', label: 'Read the current import rules', state: 'complete' },
      { id: 'r2', label: 'Confirm the revised boundaries', state: 'complete' },
      { id: 'r3', label: 'Rewrite the mapping step', state: 'replanned' },
      { id: 'r4', label: 'Re-run the affected imports', state: 'pending' },
      { id: 'r5', label: 'Verify against the sample set', state: 'pending' },
      { id: 'r6', label: 'Remove the retired path', state: 'cancelled' }
    ]
  },
  subagentGroups: [],
  diffGroups: [{
    id: 'diff-scope-change', label: 'Import rules',
    files: [
      { path: 'src/import/rules.ts', added: 64, removed: 12, status: 'edited' },
      { path: 'src/import/legacy-map.ts', added: 0, removed: 148, status: 'deleted' },
      { path: 'src/import/boundaries.ts', added: 91, removed: 0, status: 'created' }
    ]
  }],
  questionnaires: [], artifacts: [],
  browserSessions: [{
    id: 'browser-import-check', title: 'Import rule reference',
    status: 'complete', openTarget: 'editor tab',
    currentPage: 'Import rule reference, section four',
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

/* Eight Todos. The largest supplied list is seven, so the "8 Todos" requirement had no data behind
 * it. The state mix is deliberate: four done, one active, two pending and one BLOCKED, because a
 * blocked item is the one that makes the completion count interesting. */
const T01_TODO = {
  id: 'todo-provider-settings',
  title: 'Provider settings refresh',
  items: [
    { id: 'g1', text: 'Read the current provider settings screen', state: 'done' },
    { id: 'g2', text: 'List every account and its connection form', state: 'done' },
    { id: 'g3', text: 'Map the setup states to visible copy', state: 'done' },
    { id: 'g4', text: 'Draft the account group header', state: 'done' },
    { id: 'g5', text: 'Rework the model rows to three facts', state: 'active' },
    { id: 'g6', text: 'Wire the effort and speed submenus', state: 'pending' },
    { id: 'g7', text: 'Write the route-change consequence copy', state: 'pending' },
    { id: 'g8', text: 'Confirm the port change in the test config', state: 'blocked' }
  ]
};

/* Three subagents on three DIFFERENT routes, which is what makes "different routes" demonstrable
 * rather than a claim. Every agent record gains a `route` string of the form
 * `<Account label> · <Model>`; the group covers running, queued, blocked, completed, stopped and
 * retried so a work cluster has every state to render. */
const T01_AGENTS = {
  id: 'sg-research',
  title: 'Provider research',
  agents: [
    { id: 'ag-1', name: 'Settings reader', role: 'Reader', state: 'completed',
      route: 'Anthropic — Work · Opus 5', workedSeconds: 240,
      resultRef: 'Read all six account records and their connection forms.' },
    { id: 'ag-2', name: 'Adapter surveyor', role: 'Surveyor', state: 'running',
      route: 'OpenAI — Team · GPT-5.6 Pro', workedSeconds: 132,
      resultRef: null },
    { id: 'ag-3', name: 'Copy reviewer', role: 'Reviewer', state: 'queued',
      route: 'Anthropic — Personal · Sonnet 5', workedSeconds: 0,
      resultRef: null },
    { id: 'ag-4', name: 'Config verifier', role: 'Verifier', state: 'blocked',
      route: 'Anthropic — Work · Haiku 4.5', workedSeconds: 44,
      blockedReason: 'The test configuration still names port 3000.', resultRef: null },
    { id: 'ag-5', name: 'Screenshot pass', role: 'Capture', state: 'stopped',
      route: 'Google — Lab · Gemini 3 Ultra', workedSeconds: 18,
      resultRef: null },
    { id: 'ag-6', name: 'Allowance checker', role: 'Reader', state: 'retried',
      route: 'Alibaba — Cloud · Qwen 3.8', workedSeconds: 96, attempts: 2,
      /* The manifest's third subagent is specified as a SEQUENCE, not a single state. Recording the
       * trail it walked is what lets a work cluster show that a failure was recovered rather than
       * only that the agent is now fine. */
      stateSequence: ['queued', 'running', 'failed', 'retrying', 'completed'],
      resultRef: 'Usage endpoint answered on the second attempt.' },
    /* `failed` and `retrying` had no representative at all: the set stopped at `retried`, which is
     * the outcome, so neither the failure itself nor an in-flight recovery could be rendered. */
    { id: 'ag-7', name: 'Slint port reviewer', role: 'Reviewer', state: 'failed',
      route: 'Moonshot — Research · Kimi K3', workedSeconds: 61,
      failedReason: 'The adapter returned no capability bag for the requested model.',
      attempts: 1, resultRef: null },
    { id: 'ag-8', name: 'Capture retry', role: 'Capture', state: 'retrying',
      route: 'Google — Lab · Gemini 3 Ultra', workedSeconds: 12, attempts: 2,
      retryOf: 'ag-7', resultRef: null }
  ]
};

/* A three-question flow whose kinds are single select, multi select and freeform, so every input
 * type in the questionnaire controller is exercised from authored data. */
const T01_QUESTIONNAIRE = {
  id: 'qn-thread01-settings',
  createdAt: '2026-08-07T09:12:00Z',
  currentQuestionIndex: 0,
  questions: [
    /* p1 carries a WRITE-IN row. Reference 02_stable_paged_questionnaire.mov makes the last option of
     * a single-select a pencil row that becomes a text field, and the answer typed there survives
     * paging away and back. No supplied question allowed one, so the questionnaire's write-in path
     * was unreachable and `validate()` would have called a typed answer a stale option. */
    { id: 'p1', prompt: 'Which account should the settings screen open on?', kind: 'single select',
      required: true, writeIn: true, writeInLabel: 'Something else',
      options: ['The account in use', 'The first ready account', 'The last account opened'] },
    { id: 'p2', prompt: 'Which setup states must the screen show inline?', kind: 'multi select',
      required: false, options: ['Sign-in required', 'Command line tool missing', 'Update available', 'Usage unavailable'] },
    { id: 'p3', prompt: 'Anything the screen must never do?', kind: 'freeform', required: false }
  ]
};

/* An ordered Goal lifecycle. The supplied goals carry a status but no transition history, so
 * "start, pause, resume, replan, blocked, complete" could not be shown as a sequence. */
const T01_GOAL = {
  id: 'goal-provider-settings',
  title: 'Refresh the provider settings screen',
  objective: 'Make every account state visible and every route change consequence explicit.',
  status: 'complete',
  workedSeconds: 4210,
  totalElapsedSeconds: 5640,
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
  completionReceipt: {
    at: '2026-08-07T12:34:00Z',
    verified: true,
    artifacts: ['artifact-diff', 'artifact-test-report', 'artifact-context'],
    elapsedSeconds: 5640,
    workedSeconds: 4210
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
   * the contract's `activity.thinking_summary` event had no stage kind to land on. */
  { id: 'st-thought', kind: 'thought', label: 'Thought for 4s', runningLabel: 'Thinking for 4s',
    count: 1, unit: 'summary',
    detail: 'Only the provider-exposed summary; no hidden reasoning is claimed.', durationMs: 4000,
    op: { verb: 'Reasoning', target: 'summary only', cache: 'not applicable', sources: 0, runtimeArtifact: null,
      input: '{ scope: "provider-exposed summary" }',
      why: 'Only the summary the provider exposed is shown; no hidden reasoning is claimed.' } },
  { id: 'st-read', kind: 'read', label: 'Read 7 files', runningLabel: 'Reading 7 files',
    count: 7, unit: 'files',
    detail: 'shared/route.js, shared/access.js and five more', durationMs: 2400,
    op: { verb: 'Reading', target: '7 files', cache: 'warm', sources: 7, runtimeArtifact: null,
      input: '{ paths: ["shared/route.js", "shared/access.js", "+5 more"] }',
      why: 'The account rows had to be read before their states could be mapped to copy.' } },
  { id: 'st-search', kind: 'search', label: 'Searched the repository for account labels',
    runningLabel: 'Searching the repository for account labels',
    count: 31, unit: 'matches',
    detail: '31 matches across 9 files', durationMs: 1600,
    op: { verb: 'Searching', target: 'account labels', cache: 'miss', sources: 9, runtimeArtifact: null,
      input: '{ query: "account label", scope: "repository" }',
      why: 'Searched the repository because the label vocabulary was not documented anywhere.' } },
  { id: 'st-web', kind: 'web', label: 'Fetched the provider status page',
    runningLabel: 'Fetching the provider status page',
    count: 1, unit: 'page',
    detail: 'One page, cached for the run', durationMs: 3100,
    op: { verb: 'Fetching', target: 'provider status page', cache: 'miss', sources: 1, runtimeArtifact: null,
      input: '{ url: "provider status page", freshness: "required" }',
      why: 'Fetched the page because a cached status could not support a readiness claim.' } },
  { id: 'st-browser', kind: 'browser', label: 'Opened a BrowserPage in the BrowserWorkspace',
    runningLabel: 'Opening a BrowserPage in the BrowserWorkspace',
    count: 1, unit: 'page',
    detail: 'Browser Action: inspect the settings route', durationMs: 5200,
    op: { verb: 'Opening', target: 'BrowserPage in the BrowserWorkspace', cache: 'not applicable', sources: 1, runtimeArtifact: 'artifact-preview',
      input: '{ action: "inspect", route: "settings" }',
      why: 'Opened a page because the rendered route is the only honest check of the layout.' } },
  { id: 'st-test', kind: 'test', label: 'Ran the interaction suite',
    runningLabel: 'Running the interaction suite',
    count: 18, unit: 'checks',
    detail: 'TestCapture retained for the failing case', durationMs: 8800,
    op: { verb: 'Running', target: 'interaction suite', cache: 'not applicable', sources: 18, runtimeArtifact: 'artifact-test',
      input: '{ suite: "interaction", widths: [520, 750, 1200] }',
      why: 'Ran the suite because a layout claim without a run is an opinion.' } },
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
      why: 'Verified against the catalog because the screen is only correct relative to it.' } }
];

/* The port collision, verbatim. */
const T01_CONFLICTS = [
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
  body: `The provider settings screen is updated and verified.

Every account now shows its connection form and its setup state inline, and the model rows carry at most three facts each. The route change consequence copy is in place, including the provider boundary case which restarts the prompt cache.

One item is still blocked: the test configuration names port 3000, which the checkout redesign owns in another worktree. I left it blocked rather than editing a config another thread is using.`,
  sentAt: '2026-08-07T12:34:00Z',
  runtime: {
    provider: 'Anthropic', model: 'Opus 5', persona: 'Product designer',
    mode: 'Agent', effort: 'High',
    workedSeconds: 4210, totalElapsedSeconds: 5640,
    tokenCount: 6400, contextUsed: 7620, contextLimit: 128000,
    estimatedCost: 0.34,
    terminalAt: '2026-08-07T12:34:00Z', terminalReason: 'completed'
  },
  verification: {
    result: 'passed',
    note: 'Updated provider settings screen renders correctly',
    elapsedSeconds: 5640,
    workedSeconds: 4210
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
  capacitySeed: {
    requested: 6, recommendedConcurrent: 2, waves: 3,
    reason: 'provider allowance and verification reserve',
    requiredRoles: ['Reader', 'Surveyor', 'Reviewer', 'Verifier', 'Capture', 'Reader'],
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
  note: 'Additive layer over the supplied demoData.json. The supplied file is never modified.',
  patchThreads,
  threads: newThreads,
  scriptedReplies: []
};

const banner = (name) => `/* GENERATED by demo/build-demo-bundles.mjs — do not hand-edit.\n * Exists because fetch() cannot read a sibling file over file:// in Chromium.\n */\n`;

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
  agentRoutes: new Set(agentRecords.map((a) => a.route).filter(Boolean)).size,
  agentStates: [...new Set(agentRecords.map((a) => a.state))].sort(),
  activityKinds,
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
  goalPhases: [...new Set(merged.threads.flatMap((t) => ((t.activeGoal && t.activeGoal.events) || []).map((e) => e.phase)))],
  verificationMessages: all.filter((m) => m.verification).length
}, null, 2));
