# 5.6 Pro — fixture schema contract (published by Wave 1A)

Audience: the Wave 2 Demo Data agent (sole owner of `data.js`) and every later agent that reads
fixtures from its own module file.

**The rule that makes this a contract, not a wish:** `app.js` is closed after Wave 1. Every field
below is read defensively — missing collection, missing field and empty array all render something
sensible. So the Demo Data agent can add these fields *incrementally* and each one lights up on its
own. Nothing here is required for the concept to boot.

Everything lives on `window.PM56_DATA` (`D` inside `app.js`). New feature-specific collections
(`goal`, `contextSources`) may instead be attached from the owning module — see
"Attaching a collection from a module" at the end.

---

## 0. Determinism (applies to every collection)

Every timestamp is a **fixed UTC ISO-8601 string**, never `Date.now()` and never a relative
literal. `data.js` currently uses `Date.now()`, which makes a stable screenshot baseline
impossible; every sibling concept uses fixed ISO strings for exactly that reason. Human-readable
relative labels (`updated:'2m ago'`) may stay as a *display* field, but they must sit alongside a
machine-sortable ISO field, and renderers sort on the ISO one.

`id` is stable, unique **across the whole file**, and never regenerated between loads.
Two collections must never share an object by reference (`data.js:136`/`:151` currently share one
`plainConversation` array between two threads, which makes message ids collide and leaks
`state.messageExpanded` across threads).

---

## 1. `changes[]` — file changes, with real diff content

```js
{
  id:'c1',
  path:'migrations/0043_tenant_created_index.sql',
  line:1,                       // first changed line; drives "open at line"
  summary:'Add tenant_id + created_at composite index',
  status:'modified',            // 'added' | 'modified' | 'deleted' | 'renamed'
  add:18, del:0,                // totals; activityDefs() sums these for the bar row
  oldPath:null,                 // required only when status==='renamed'
  language:'sql',               // hint for syntax colouring
  hunks:[                       // NEW — this is the field that kills the fake
    {
      header:'@@ -0,0 +1,18 @@',
      oldStart:0, oldLines:0, newStart:1, newLines:18,
      lines:[                   // ordered, one entry per rendered diff row
        {kind:'add',    old:null, new:1,  text:'CREATE INDEX CONCURRENTLY ...'},
        {kind:'del',    old:12,   new:null,text:'DROP INDEX events_created_idx;'},
        {kind:'ctx',    old:13,   new:2,  text:'-- unchanged context line'},
        {kind:'meta',   old:null, new:null,text:'\\ No newline at end of file'}
      ]
    }
  ]
}
```

`kind` is exactly one of `add | del | ctx | meta`. `old`/`new` are 1-based line numbers or `null`.
Renderers must not compute line numbers themselves — that is what produced the current fabrication
(`app.js` invents 18 lines and prints the same `CREATE INDEX` SQL for every path, regardless of
which file was clicked).

Target: 12 files, all four `status` values represented, at least one multi-hunk file, at least one
file with `add:0` (pure deletion).

---

## 2. `artifacts[]` — sortable, with payloads and a loading state

```js
{
  id:'plan-query', kind:'plan', title:'…', summary:'…',
  version:4,
  status:'ready',                   // 'ready' | 'stale' | 'error' | 'loading'
  updated:'2m ago',                 // display only
  updatedAt:'2026-08-24T11:42:19Z', // NEW — required; the sort key
  createdAt:'2026-08-24T09:10:00Z',
  payload:{ /* kind-specific body; see below */ },
  threadId:'query',                 // which thread produced it
  error:null                        // {reason, recoverable:true} when status==='error'
}
```

`updatedAt` is load-bearing: `mostRecentArtifact()` (app.js) sorts on it and falls back to
`D.artifacts[0]` only when **no** artifact has one. That fallback is why "most recent" is always
the plan today. `activityDefs().artifacts` counts `ready|stale|error|loading` from `status`, so
adding a `loading` artifact is all that is needed to make that state appear in the UI.

`payload` shapes by `kind`: `plan` → `{decision, sequence:[…], acceptance:[…], revisions:[…]}`;
`mermaid` → `{source}`; `dashboard`/`chart` → `{metric, series:[{label, value}]}`;
`data` → `{columns:[…], rows:[[…]]}`; `evidence` → `{gates:[{name, passed, total}], log:[…]}`.
Any `kind` may omit `payload`; the renderer keeps its current built-in body.

---

## 3. Per-message `runtime` — the real turn record

Every message already carries `id`, `role`, `type`, `body`/`title`/`detail` and an ISO `time`
that **no renderer reads**. Two additions:

```js
{
  id:'m-…', role:'assistant', type:'text', body:'…',
  sentAt:'2026-08-24T11:42:08Z',   // NEW — authoritative wall clock, ISO
  time:'2026-08-24T11:42:08Z',     // existing; keep in step with sentAt
  runtime:{                        // NEW — omit entirely on user messages
    provider:'Anthropic', account:'Work · anthropic-work',
    model:'Claude Sonnet 4.6', mode:'Agent', persona:'Product Manager',
    effort:'High', fast:true,
    startedAt:'2026-08-24T11:42:08Z', completedAt:'2026-08-24T11:42:19Z',
    durationMs:11200,
    tokens:{input:12840, output:1486, cached:65400},
    context:{used:83900, limit:131000, cacheHitPct:78},
    cost:{apiUsd:0.084, planUsd:0.031},
    terminal:'complete'            // 'complete'|'stopped'|'error'|'submitted'
  }
}
```

`msgClock()` currently *invents* a clock walking three minutes per message from 11:42, and
`renderMessageDetails()` prints sixteen constants that are identical for every message in every
thread. Both should read `sentAt` / `runtime` when present and keep today's behaviour as the
fallback, so a partially-populated fixture never shows blanks.

A value that is genuinely unknown must be `null` and render as **"not reported"** — never `0`,
never `—` where a number is expected. (Borrowed from u11's charting honesty rule.)

---

## 4. `contextSources[]` + `contextWindow` — the context ring's numbers

Currently every context figure in `app.js` is a literal.

```js
D.contextWindow = {
  limit:131000, used:83900, cached:65400, cacheHitPct:78,
  inputThisTurn:12840, outputThisTurn:1486,
  product:'Puppet Master Pro', connection:'anthropic-work',
  growth:[ {at:'2026-08-24T09:10:00Z', tokens:12400}, … ]   // ordered; ISO + integer
};

D.contextSources = [
  { id:'conversation', family:'Conversation', tokens:28526, pct:34,
    colour:'var(--accent)', detail:'…', supersededTokens:0 },
  …
];
```

`tokens` is an **integer count**, always present; `pct` is derived display sugar and may be
recomputed by the renderer (`Math.round(tokens/used*100)`) — where they disagree, `tokens` wins.
Segment colour is keyed to `family`, **never to the array index**, so a family keeps its colour
between threads. Six segments; the legend names the top three and rolls the rest into
"N smaller sources P%".

---

## 5. `goal` — one object, with phases

The concept has no goal model at all today ("Phase 2 of 4 · 68%" is literal display text in three
places). **Phases are our addition, not a port** — Codex's goal is a single objective string.

```js
D.goal = {
  id:'goal-query-perf',
  title:'Optimize analytics query performance',
  objective:'Reduce tenant-scoped analytics p95 below 100 ms without exceeding …',
  status:'active',            // planning|active|paused|blocked|budget_limited|complete|cleared
  plan:'plan-query',          // artifact id; the plan DOCUMENT is separate from the phase list
  currentPhaseId:'ph-proto',  // may move BACKWARD — never drive a monotonic stepper off it
  budget:{ used:42000, limit:100000 },   // ONE budget for the whole goal, never per-phase
  progress:{ completed:2, total:6, open:3 },  // three numbers: open !== total - completed
  phases:[ /* below */ ],
  replans:[ {at:'2026-08-24T10:05:00Z', note:'…', added:['ph-verify'], removed:[]} ],
  blocker:{ blockerClass:'policy', cause:'…', scope:'…', lastRecovery:'…',
            whyUnsafe:'…', nextSafeAction:'…' }   // structured, never a bare string
};

phase = {
  id:'ph-proto',
  title:'Prototype',                    // NO ordinal prefix — the renderer numbers them
  activeLabel:'Prototyping the index',  // present tense, shown while in_progress
  status:'in_progress',                 // pending|in_progress|completed|blocked|abandoned
  exitCriterion:'`cargo test analytics::` exits 0',  // binary and evaluator-verifiable
  evidence:[ {kind:'test_result', label:'42 passed', ref:'test-evidence'} ], // completed only
  blocker:null,
  startedAt:'2026-08-24T10:12:00Z', endedAt:null
};
```

Invariants the fixture must satisfy (a renderer is allowed to assume them):
- **Exactly one phase is `in_progress`.**
- No phase goes `pending → completed`; it passes through `in_progress`.
- `evidence` only on `completed` phases.
- Canonical six titles: `Audit · Research · Prototype · Implement · Verify · Handoff`.
- `evidence[].kind` ∈ `file | command_output | test_result | pr | artifact | runtime`.
- Blocked phases are excluded from any "unfinished work" count but stay visible, and are labelled
  **"stalled"** in human copy.

**Goal and todos are not linked.** The only join is a foreign key **on the todo**:
`todo.goalPhaseId` = the phase current when the todo was written. A phase never advances because
its todos are checked. Both surfaces must render alone (a goal with zero todos; todos with no goal).

---

## 6. `todos[]`, `subagents[]` — enum corrections

`todos[].status` must move to the canonical enum `pending | in_progress | completed | blocked |
skipped`. Today's raw `doing` / `next` are printed verbatim as user-facing copy.
`activityDefs()` already accepts **both** spellings, so the migration can happen in one step
without a renderer change.

```js
todo = { id, label, status, source:'Goal 2', goalPhaseId:'ph-proto'|null, blocker:null, updatedAt }
subagent = { id, name, model, status, current, elapsed, progress, blocker,
             route:'Anthropic · work', parentThreadId:'query',        // NEW, must resolve
             group:'analysis',                                        // NEW, 3 groups
             counts:{tools:14, files:3, tests:42} }                    // NEW, precomputed
```
`subagents[].status` ∈ `working | blocked | waiting | complete | failed`.

---

## 7. `activityDefs()` is derived — do not re-author it

`app.js` no longer holds five hand-written literals. `activityDefs()` computes `count`, `state`,
`tone`, `summary` and `detail` from `D.goal`, `D.todos`, `D.subagents`, `D.changes` and
`D.artifacts`, each field with a fallback. Consequences:

- Adding a subagent changes the bar count, the hover count, the panel count and the section count
  **at once**. There is no longer a second place to update.
- `state` stays in the vocabulary `styles.css` understands (`live` | `changed` | anything else =
  idle). `tone` (`working` | `blocked` | `done` | `idle`) is the richer signal for the Wave 2
  Activity Bar agent, which lights the **icons** instead of the `.state-mark` dot.
- The Goal row is the one entry still using a fallback constant, `GOAL_FALLBACK` in `app.js`,
  because `D.goal` does not exist yet. **The moment `D.goal` lands, the fallback stops being used**
  — `goalSummary()` prefers it automatically and reports `derived:true`.

---

## Attaching a collection from a module

Feature-specific collections belong to the feature module, not to `data.js` — that keeps the
Demo Data agent's file conflict-free. From `goals.js` / `context.js`:

```js
window.PM56_DATA.goal = { … };            // runs before app.js boots, so the first render sees it
window.PM56_DATA.contextSources = [ … ];
```

Module JS is concatenated after `data.js` and before `app.js`, so this is safe and needs no
re-render. Never mutate a collection at render time: `toggle-favorite` used to write
`D.models[].favorite` and survived Reset; favourites now live in `state.favorites`, and
`globalReset()` restores `D.models` / `D.artifacts` from a boot-time snapshot.

## Reading fixtures from a slot

Slot and action callbacks receive `ctx` with `state`, `D`, `M`, `clone`, `clamp`, `esc`, `uid`,
`icon`, `thread`, `model`, `activeThread`, `selectedModel`, `statusLabel`, `activityDefs` (a
**function**), `workStep`, `formatText`, `formatElapsed`, `msgIndex`, `msgClock`, `isNarrow`,
`isPhone`, and the mutators `renderApp`, `renderOverlays`, `toast`, `addReceipt`, `openEditor`,
`closeEditor`, `switchThread`, `mutateThread`, `appendMessage`, `openMenu`, `closeMenu`,
`setSubmenu`, `openDialog`, `closeDialog`, `copyText`, `savePrefs`, `extRender`.
Anything a slot emits inside a surface that survives the 2s work tick **must carry a stable
`data-k`** — see the registry header comment in `app.js`.
