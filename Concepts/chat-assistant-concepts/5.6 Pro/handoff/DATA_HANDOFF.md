# DATA_HANDOFF — what the Wave 2 Demo Data agent shipped, and who has to consume it

Owner of `data.js`: Wave 2 Demo Data (this document's author). `data.js` is now **229 KB**
(was 32,703 bytes) and holds 374 messages across 24 threads.

Everything below is **additive**. Nothing that rendered before this wave renders differently
because a field was removed or renamed — the two collections whose *values* changed
(`todos[].status`, `changes[].status`) were already accepted in both spellings by
`activityDefs()`, and every new field is ignored by every renderer that does not know about it.

---

## 0. Read this first: fields that are shipped but NOT YET CONSUMED

Each one is a live fake in a renderer I do not own. Adding the field was my half; reading it is
yours.

| Field | Renderer still faking it | Owner |
|---|---|---|
| `message.sentAt` | `msgClock()` (`app.js:489`) invents `11:42 + i*3` | Wave 3 Transcript (item 8), via the `messageMeta` slot |
| `message.runtime` | `renderMessageDetails()` (`app.js:501`) prints 16 constants identical for every message in every thread | Wave 3 Transcript (item 8) |
| `contextSources` / `contextWindow` / `contextByThread` / `compactionOutcomes` | every context number in `app.js:1191` and `app.js:1224` is a literal | Wave 3 Context (item 6) |
| `subagentGroups`, `subagents[].route/parentThreadId/counts` | four renderers each derive their own count | Wave 2 Activity Panel (item 1) / Activity Bar (item 7) |
| `artifacts[].payload` / `updatedAt` | `mostRecentArtifact()` already sorts on `updatedAt` (Wave 1A); the **payload bodies** are still hardcoded in the artifact editors | Wave 2 Activity Panel, Wave 5 |
| `operational` (worktrees, ports, tests, forecast, hosts) | worktree menu options are a literal at `app.js:1102` | Wave 3 Menus (item 5) |
| `scriptedReplies` | `handleSend()` (`app.js:1348`) appends one fixed paragraph | unassigned — see below |
| `drafts` | `state.draftHistory` is populated only from what the user sends in-session | unassigned |
| `warnings` | nothing surfaces them | unassigned |
| `questionFlows` / `questionQueueDepth` | `state.questionQueue` is a literal `2` — which is now **true**, because two flows really are queued | Wave 4 Decisions (item 15a) |
| `todos[].goalPhaseId` / `goalId` | the join to `D.goal` | Wave 2 Goals (item 2) |

### CLOSED (2026-08-25): `renderFileEditor` now reads `hunks`

This was the wave's one blocking escalation — `changes[].hunks` shipped correct but the renderer
could not be reached from `data.js`, from any module, or from any `EXT_SLOTS` entry.
**Wave1A-Platform resolved it** by making `renderFileEditor` read `c.hunks` directly (rather than
adding an `editorDoc` slot only one agent would ever use). `EXT_SLOTS` is unchanged.

Re-verified independently by this agent, not accepted on report:
- `verify_wave2_data.mjs` 28/2 -> **29 pass / 1 fail**; the diff assertion now reads real file
  content (`@@ -58,11 +58,15 @@` + the actual imports) and the crop paints 967 distinct colours.
- `spotcheck-diff-edges.mjs` covers the four edge cases: pure deletion (23 del rows, focus row off
  `old` numbering), rename (oldPath pill), pure addition (`added` -> "Created" via the
  dual-spelling label map), multi-hunk (2 code blocks). Row counts equal `lineCount + hunks`.
- `.diff-line.add` paints `rgb(92,214,155)`, `.diff-line.del` `rgb(255,108,125)`.
  `white-space: pre` is set locally on diff blocks, overriding the hardening layer's `pre-wrap`
  at `styles.css:419` which would otherwise wrap long lines and destroy gutter alignment.

**Consumers take note:** gutter numbers come from `l.old` / `l.new` and must never be computed
locally — local arithmetic is what produced the original fabrication.

---

## 1. Contract conflicts between the task brief and FIXTURE_SCHEMA.md — and how I resolved them

`FIXTURE_SCHEMA.md` was declared binding, so it wins every time. Where the brief asked for
something the schema has no equivalent for, I added it **beside** the schema field rather than
instead of it. There is exactly one shape per fact; nothing is duplicated under two names.

| # | Brief said | FIXTURE_SCHEMA said | Shipped |
|---|---|---|---|
| 1 | `hunks[].lines: [['+','text']]` (Fable's pair array) | `lines: [{kind, old, new, text}]` | **objects**, `kind ∈ add\|del\|ctx\|meta`, `old`/`new` 1-based or `null` |
| 2 | `changes[].status: created\|modified\|deleted\|renamed` | `added\|modified\|deleted\|renamed` | **`added`**; `labels.changeStatus` maps *both* spellings to "Created" so either input prints correct English |
| 3 | runtime `{workedSeconds, tokenCount, contextUsed, contextLimit, estimatedCost, terminalReason}` | runtime `{durationMs, tokens{}, context{}, cost{}, terminal}` | **nested**, plus the brief-only fields that have no nested equivalent: `workedSeconds`, `totalElapsedSeconds`, `queuedMs`, `tokens.total`, `cost.totalUsd`, `context.available`. **`terminalReason` is spelled `terminal`.** |
| 4 | `subagents[].route: {provider, account, model}` | `route: 'Anthropic · work'` (string) | **object** `{provider, account, model, modelId, label}` — a string cannot express a child running on a *different account of the same provider*, which is the point of the collection. `route.label` is the string form. |
| 5 | `contextWindow: {cachedTokens, cacheHitRate, availableTokens}` | `{cached, cacheHitPct, …}` | **schema names** (`cached`, `cacheHitPct`), plus `available` and `pct` |
| 6 | top-level `contextGrowth:[{at,tokens}]` | `contextWindow.growth` | **`contextWindow.growth`** (and per thread, `contextByThread[id].window.growth`) |
| 7 | `contextSources` authored in `data.js` | feature collections may be attached from `context.js` | **`data.js`** — the brief is explicit and Wave 3 had not started. **Wave 3 Context: extend it, do not re-declare it**, or your assignment will clobber six threads of fixture. |
| 8 | `mode ∈ ask\|agent\|debug\|plan\|deep_plan` | `mode:'Agent'` | **the closed enum**, with `labels.mode` for display. `deep_plan` must never reach the screen; use `D.labels.mode[m.runtime.mode]`. |
| 9 | author a `goal` collection | — | **not authored.** The brief's item 3 assigns it to the Wave 2 Goals agent in `goals.js`. `todos[].goalId` / `goalPhaseId` are the join and use the canonical phase ids `ph-audit`, `ph-research`, `ph-proto`, `ph-implement`, `ph-verify`, `ph-handoff`. |

---

## 2. Shapes, in the order a consumer needs them

### `changes[]` — 12 files, 19 hunks, 517 diff rows

```js
{ id, path, line, summary,
  status:'added'|'modified'|'deleted'|'renamed',
  oldPath,                 // non-null only when status === 'renamed'
  language,                // 'sql'|'rust'|'javascript'|'css'|'markdown'|'toml'
  threadId,                // which thread produced it
  add, del, lineCount,     // DERIVED from the hunks by countChange(); never hand-written
  hunks:[ { header:'@@ -12,6 +12,14 @@', oldStart, oldLines, newStart, newLines,
            lines:[ {kind:'add'|'del'|'ctx'|'meta', old:Number|null, new:Number|null, text} ] } ] }
```

`add`/`del` are computed from the hunks at load time, so a diff and its totals cannot disagree
the way the old literals did. **Do not compute line numbers in the renderer** — they are in the
data precisely because computing them is what produced the fabrication.

Coverage: all four statuses; a pure addition (`@@ -0,0 +1,18 @@`, `del:0`); a pure deletion
(`add:0`, with a `meta` "\\ No newline at end of file" row); five files with 2+ hunks;
`threads/provider-selector.js` at 124 rows so the editor must scroll. Three files reproduce the
correction packet's manifest counts exactly: `threads/provider-selector.js` **+92 −18**,
`threads/access-controls.css` **+61 −39**, `verification/interaction-probes.mjs` **+31 −10**.

### message `runtime` — on every assistant turn (190 of them)

```js
m = { id, role, type:'text', body, time, sentAt, long?, eligibleForEdit?,
      runtime:{ provider, account, model, modelId, mode, persona, effort, fast,
                startedAt, completedAt, durationMs, workedSeconds, totalElapsedSeconds, queuedMs,
                tokens:{input, output, cached, total},
                context:{used, limit, cacheHitPct, available},
                cost:{apiUsd, planUsd, totalUsd},
                terminal:'complete'|'stopped'|'error'|'submitted' } }
```

- `time === sentAt` always; `time` is kept only so nothing that already read it breaks.
- `runtime.context.used` **rises monotonically within a thread** — verified, 0 violations.
- `runtime` is omitted on user and system messages, by design.
- `eligibleForEdit:true` on exactly one message per thread: the **most recent user turn**
  (item 13's rule that Edit-and-branch is scoped to it). 24 of them, one per thread.
- `extra.route` in the builder switches the route mid-thread and every later turn inherits it.
  **Thread `route` changes model at turn 06**: `Claude Sonnet 4.6` → `Qwen 3.8`. That is the
  fixture for "a thread shows two different models".
- 5 distinct provider/model pairs; all five `mode` values appear.
- A genuinely unknown value is `null` (e.g. `chart-cost` payload `Cursor Auto → value:null`) and
  must render as **"not reported"**, never `0`.

### `contextByThread` — six threads, deliberately different

```js
D.contextByThread[threadId] = {
  threadId,
  sources:[ {id, family, colour, tokens, pct, supersededTokens, detail} ],   // 6, integer tokens
  window:{ limit, used, cached, cacheHitPct, available, pct,
           inputThisTurn, outputThisTurn, product, connection, model, account,
           costApiUsd, costPlanUsd,
           growth:[ {at:ISO, tokens:Integer} ] },
  compactionPreview:{ wouldRemove, wouldRetain, retains[], drops[], estimatedSeconds, reversible, note },
  limits:[ {id, label, used, resetAt, note} ]        // the u11 plan-limits block
}
D.contextSources / D.contextWindow / D.contextCompaction   // the ACTIVE thread (`query`) view
D.compactionOutcomes                                        // 7 outcomes for the Compact Now machine
```

Threads covered: `query` (64% of 131K), `plain` (prose-only, files/tools genuinely 0),
`subagents` (196K Opus window, 12,400 tokens of duplicate file reads — the one where compaction
pays), `debug` (200K, evidence-heavy), `context` (has muted-but-resident sources, and its
compaction preview is the one marked **`reversible:false`**), `no-models` (no route at all;
Compact Now correctly reports no gain).

`colour` is keyed on the family id, **never on the array index**, so a family keeps its colour
across threads. Six families: Conversation, Plans and specifications, Files and code, Tool and
browser evidence, System and provider, Attachments and images.

`compactionOutcomes` covers completed / no-gain / partial / deferred / timed-out / failed /
declined — u11's point that a Compact Now which always succeeds is a placeholder.

### `subagents[]` + `subagentGroups[]`

```js
subagent = { id, name, model, status, current, elapsed, progress, blocker,
             group:'analysis'|'concept-review'|'verification',
             parent,            // display TITLE (unchanged)
             parentThreadId,    // NEW — a real id in threads[]; the old `parent` named
                                //       three threads that did not exist
             route:{provider, account, model, modelId, label},
             counts:{tools, files, tests, tokens},
             startedAt, completedAt?, messages[],
             queued?:{position, reason, since}          // status 'queued'
             retry?:{attempt, of, lastError, nextAt, backoffMs}   // status 'retrying'
             failure?:{reason, recoverable, retryLabel, class}    // status 'failed'
             fallback?:{from, to, reason, at, userVisible, note}  // status 'fallback'
}
subagentGroup = { id, label, parentThreadId, summary, agentIds[],
                  counts:{total, working, complete, blocked, waiting, queued, failed, retrying, fallback} }
```

`counts` is precomputed per group so no renderer derives a fifth disagreeing number.
Group totals: analysis 5, concept-review 5, verification 4. Message counts per agent:
13,5,4,6,5,5,4,5,4,5,5,5,5,4 — minimum 4, one at 13.

### `todos[]` — 20

```js
{ id, order_index, label, status, statusLabel, source:'Goal N', goalId, goalPhaseId,
  dependencies:[todoId], blocker, note, updatedAt }
```

`status ∈ pending | in_progress | completed | blocked | skipped | verifying | replanned`.
**`statusLabel` exists on every record** and `D.labels.todoStatus` maps the enum, because
`renderActivitySection` (`app.js:844`) prints `x.status` verbatim in the right-hand column —
raw `in_progress` would be user-facing copy. That renderer is currently replaced by the Activity
Panel agent's `activityPanelBody` slot, so nothing raw reaches the screen today, but whoever
renders todos must use `statusLabel`, not `status`.

`goalId` is `null` on Goals 3 and 4, so "todos with no goal" is a real fixture. `activityDefs()`
already accepts `completed` / `in_progress` / `pending`; **`verifying` and `replanned` are in
none of its three state lists**, so a `verifying` todo counts as neither done nor open there.
Whoever owns the todo surface should decide whether `verifying` counts as active.

### `models[]` (14) + `accounts[]` (9)

Same five configured providers. Anthropic has three accounts, Alibaba two, z.ai two.
**`sonnet46` and `sonnet46-personal` are the same model on two accounts**, as are `qwen38` and
`qwen38-team` — which is why a row must be keyed on `provider:account` and never on the model
name. (That is also the root cause dramatised in the `debug` thread: a renderer cache keyed on
model name.)

`status` covers the whole enum, `statusLabel` is the display copy, `statusDetail` is the truthful
reason for the honest-gap pattern (a disabled row **with** a reason), and `needsAttention` is
`status !== 'ready' && status !== 'update-available'` — informational states do not count.
Five accounts need attention; `D.accountsNeedingAttention` is the derived list and the
`no-models` thread copy says **five**, not the old fictional two.
Every model carries `context` (its window limit) and `accountId`.

### `questions` / `questionFlows` (4)

`D.questions` is still the **flat array of the active flow**, unchanged in shape, because
`app.js` clones it into `state.questions` and the summary question reads `state.questions[0..2]`
by index. `D.questionFlows` carries all four (1 active, **2 queued**, 1 completed) and the active
flow's `questions` array **is** `D.questions` by reference, on purpose — two copies would drift.
`state.questionQueue`'s literal `2` is now true. `D.questionQueueDepth` derives it.

### `operational`, `warnings`, `scriptedReplies`, `drafts`

- `operational.worktrees` — 4, covering `unbound | bound-clean | bound-dirty | bound-conflict`,
  with ids that **match the four options `app.js:1102` already offers**, so the Wave 3 Menus
  agent can drive the top-bar selector straight off this. `feature/query-index` has
  `dirtyFiles:12` — that is what makes item 13's `Delete and remove worktree (has changes)`
  confirm copy true rather than decorative.
- `operational.ports` — 6 leases including the manifest's **4173 collision** and its reassignment
  to 4174 with a receipt.
- `operational.tests` — 6 suites; the reduced-motion one is genuinely **red**, kept visible.
- `operational.forecast` — window exhaustion and budget exhaustion reported **separately**,
  because budget exhaustion is not completion.
- `operational.hosts` — 5, one degraded and one offline.
- `warnings` — 7, `{severity, scope, title, detail, action:{label,id,value?}, dismissible}`.
- `scriptedReplies` — **22**, `{id, match:[keywords], mode, delayMs, chunkMs, chunks:[...],
  terminal, error?, followUp?}`. `sr-default` has `match:[]` and is the fallback. Covers
  `terminal:'stopped'` (a real Stop), `terminal:'error'`, and one deliberately slow entry
  (`sr-longrun`, 1400 ms per chunk) so the Stop button has something to interrupt.
- `drafts` — 8 across 6 threads, `{id, threadId, savedAt, body}`.

### `phaseRows` — 6 phases → all 14 step kinds

Keyed `[step.kind][step.id]`, unchanged shape (`{text, add?, del?, tag?, stream?}`). Six rows now
carry `stream:true` (was one), spread across `thought`, `web-search`, `web-fetch`, `artifact` and
`complete`, so the streamed-row treatment is exercised at the start, middle and end of the
sequence rather than only in Thinking.

### `labels` — the display-copy registry

`D.labels.{mode, effort, todoStatus, subagentStatus, changeStatus, artifactStatus, phaseStatus,
worktreeState, modelStatus, questionFlowState, terminal}`. **No raw underscored enum may reach
the screen.** `phaseStatus.blocked` deliberately reads **"Stalled"**, per the packet rule that
blocked is relabelled in human copy.

### `PM56_FEATURE_MANIFEST` — now derived

`counts` is a computed block (28 numbers) and the state lists are computed from the collections.
The five option-family sizes that live in `app.js`'s `renderDemoDialog()` are still stated as a
contract with a comment saying so, because `data.js` loads first and cannot measure them.

---

## 3. Determinism

`Date.now()` is gone (it survives only inside two comments explaining its removal). One fixed
epoch, `2026-08-24T09:00:00Z`; the fixture's "now" is epoch + 9h. Derived numbers come from an
FNV-1a hash of the record's own id, so they are stable across loads and different per record.
Two loads produce byte-identical fixtures, which is what a screenshot baseline needs.

## 4. The `plainConversation` aliasing bug

`data.js:136` and `:151` shared **one array object** between the `plain` and `new-message`
threads, so every message id existed in two threads. `state.messageExpanded` is a flat global id
map, so expanding a message in one expanded it in the other. Both threads now have their own
conversation with their own id prefix. Verified: **0 duplicate message ids across the whole file**
(374 thread messages + 71 subagent messages), and **no two threads share a messages array**.

## 5. Search phrases planted inside collapsed content

| Phrase | Where | Why it is hidden |
|---|---|---|
| `retention window nine days` | `archived-3` turn 07 | inside a `long:true` assistant body, in an **archived** thread |
| `blue lantern checkpoint` | `offline` turn 05 | inside a `long:true` assistant body |
| `canonical source history` | `bsd` turn 05 | inside a `long:true` assistant body |

`renderHistoryContent` (`app.js:431`) already searches `m.body || m.title || m.detail`, so all
three are findable while their text is behind the collapse fade.

---

# Chat Activity Bar (item 7) — what `activity-bar.js` reads
Owner: Wave 2 — Activity Bar. Appended after the Goals section; not a replacement for it.

## From the Goals module
`PM56_GOAL.render.compact(ctx)` is called verbatim inside the Goal hover card frame — **no goal
content is authored here**. Fallback chain if it is ever unavailable: `PM56_GOAL.summary()`
composition → app.js's derived `activityDefs().goal`. The Goal ICON is lit from
`summary().tone`, with two corrections agreed with the Goals agent: `paused` → idle, and
`budget_limited` → **attention (amber), not blocked (red)** — read off `summary().status`,
because budget exhaustion is a stop, not a fault. `stopped`/`cleared` → idle.
The head count comes from `activityDefs().goal.count`, which now agrees with
`PM56_GOAL.progress()` at 3/6 since the abandoned phase moved to `retiredPhases[]`.

## From `data.js` — Demo Data agent, please read the last bullet
- `todos[]`: `label`, `status`, `source`, `blocker`. Top 5 by urgency, then `+N more`.
- `subagents[]`: `name`, `model`, `status`, `current`, `elapsed`, `blocker`. Rows dispatch the
  existing `open-agent`, so **`id` must stay resolvable by `openEditor('thread-'+id)`**.
- `changes[]`: `path`, `line`, `add`, `del`, `status`, `summary`. The **bar button prints
  `+ΣADD −ΣDEL` over the whole collection**, so `add`/`del` must be numbers on *every* record or
  the total silently under-reports. Rows dispatch `open-change` with `data-path`.
- `artifacts[]`: `updatedAt` (ISO) is the sort key for "5 most recent"; undated records sort
  after every dated one and keep their array order among themselves. `kind`, `version`,
  `status`, and the display string `updated` are all used.
- **No status enum is hard-coded as a whitelist.** One `STATUS` table gives every known status a
  label, a tone and a glyph; anything unknown still renders (humanised label, idle tone) and —
  importantly — still appears in the footer histogram, which enumerates *every* status present
  so it always sums to the collection size. This was not academic: the fixture already carries
  `queued`, `retrying`, `fallback`, `verifying` and `replanned`, none of which are in
  FIXTURE_SCHEMA's enums, and the first hand-picked footer reported **10 of 14** subagents.
  Add whatever statuses the concept needs; tell me here only if you want a specific tone or
  glyph for one.

## What this module publishes (for anyone styling the bar)
Once per render, on elements `pmPatch` never touches, gated by `html[data-ab-ready]`:
- `<html>`: `data-ab-goal|todo|subagents|changes|artifacts` = `blocked|attention|working|changed|
  done|idle`.
- `<body>`: `--ab-ink-*`, `--ab-anim-*`, `--ab-shadow-*`, `--ab-stroke-*` per domain, plus
  `--ab-add` / `--ab-del` as quoted CSS `content` strings.
Do not write to these from another module.
