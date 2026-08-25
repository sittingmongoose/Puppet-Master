# Wave 2 — Demo Data — work log

Owner: `data.js` **exclusively**. Nothing committed.
Audit invocation (Wave 1A/1B finding, confirmed): `node tests/audit.mjs reports/audit.json ./tests`.
Original file preserved at `scratchpad/waves/data.js.orig` (32,703 bytes).
Authoring buffer: `scratchpad/waves/dataparts/*.js` + `assemble.py` → concatenated into `data.js`.
`data.js` is the artifact of record; the parts exist only so a crash resumes instead of restarts.

## Sub-steps
0. [DONE] Read PLAN item 14, FIXTURE_SCHEMA.md, WAVE1A_LOG, WAVE1B_LOG; read every app.js
   consumer of every collection I own. Findings below.
1. [DONE] Part 00 — determinism (fixed epoch, FNV-1a `pick`), `labels` registry, ROUTES,
   `text`/`event`/`turns` builders, workSteps, phaseMeta, **phaseRows 6 -> 14 phases**
   (6 `stream:true` rows, was 1), phaseGroups.
2. [DONE] Part 20 — `changes` 3 -> **12** with real unified-diff hunks. 19 hunks, 517 diff rows.
   add/del are DERIVED from the hunks by `countChange()` so they cannot drift. Manifest counts
   reproduced exactly: provider-selector.js +92/-18, access-controls.css +61/-39,
   interaction-probes.mjs +31/-10. All four statuses; pure addition (`@@ -0,0 +1,18 @@`) and
   pure deletion (add:0) both present; 5 files with 2+ hunks; provider-selector.js is 124 rows.
3. [DONE] Part 30 — `artifacts` 13 -> **18**. ISO `updatedAt`/`createdAt`, `projectPath`,
   `openTarget`, kind-specific `payload` bodies, `loading` state that resolves
   (`render-forecast`), two recoverable `error` states with retry (`broken-viz`,
   `chart-latency`). `plan-query` stays at index 0 (app.js:878 reads `D.artifacts[0]`);
   `mostRecentArtifact()` now returns `render-forecast`, so "most recent" stops being the plan.
4. [DONE] Part 40 — `subagents` 5 -> **14** in 3 groups + a new `subagentGroups` collection with
   PRECOMPUTED per-group status counts. `route` object, resolvable `parentThreadId`, per-agent
   `counts`. All 8 statuses incl. queued/failed/retrying/fallback. Message counts
   13,5,4,6,5,5,4,5,4,5,5,5,5,4 — minimum 4, one at 13.
5. [DONE] Part 50 — `todos` 8 -> **20** on the canonical enum + verifying/replanned, with
   `statusLabel`, `order_index`, `dependencies[]`, `goalId`/`goalPhaseId`. Goals 3 and 4 have
   `goalId:null` so "todos with no goal" is a real fixture.
6. [DONE] Part 60 — `contextByThread` for **6 threads**, each genuinely different, plus the flat
   `contextSources`/`contextWindow`/`contextCompaction` active-thread view and 7
   `compactionOutcomes`. Integer tokens, colour keyed on family name not index, growth series,
   compaction preview (one of them `reversible:false`), u11 plan-limits block.
7. [DONE] Part 70 — `models` 6 -> **14** across **9 accounts**. Same model on two accounts twice
   (`sonnet46`/`sonnet46-personal`, `qwen38`/`qwen38-team`). All seven status values;
   `statusDetail` truthful reasons; `context` limits; `needsAttention` derived -> **5** accounts,
   which is what the `no-models` thread copy now says instead of the fictional two.
8. [DONE] Part 80 — `questionFlows` 1 -> **4** (1 active, **2 queued**, 1 completed), which makes
   app.js's `questionQueue:2` literal true. `D.questions` stays the flat active-flow array
   because app.js clones it and indexes `[0..2]`.
9. [DONE] Part 90 — `operational` (4 worktrees covering all 4 bind states, 6 port leases incl.
   the 4173/4174 collision, 6 test suites with one genuinely red, forecast, 5 hosts),
   `warnings` (7), `scriptedReplies` (**22**), `drafts` (8).
10. [DONE] Parts 91-94 — **24 threads, 374 messages, minimum 13, maximum 26**. `plain` is the
   long-history thread. 3 long USER messages (there were zero). Mid-thread model change in
   `route` (Sonnet 4.6 -> Qwen 3.8). `plainConversation` aliasing GONE: 0 duplicate ids across
   the file, no shared arrays. Three search phrases planted inside collapsed bodies.
11. [DONE] Part 99 — export + derived `PM56_FEATURE_MANIFEST` (28 computed counts; state lists
   derived from the collections).
12. [DONE] Verification — `verify_wave2_data.mjs` (Playwright + chromium-1234, file://, 1440x900).
   **28 pass / 2 fail.** Both failures are renderer gaps I do not own and have escalated; every
   data-side claim passes. Raw results in `shots2/results.json`, screenshots in `shots2/`.

## Gate runs
| after | build | audit |
|---|---|---|
| parts 00/20/99 first assembly | OK `ecff4eeb0c7d59c1` | 429/5 — **not mine**: all five were
  "Expected 5 sections, found 1", i.e. the concurrently-running Activity Panel agent's
  `activityPanelBody` slot mid-landing. |
| parts 30/40 | OK `182b7a957b27b8b9` | **434 pass / 0 fail / 0 console errors / 0 page errors** |

## Step 0 findings (read off app.js, not assumed)

**The two documents disagree, and FIXTURE_SCHEMA.md wins** (the task brief itself calls it
binding). Every conflict is listed in `DATA_HANDOFF.md` with the resolution.

1. `changes[].hunks[].lines` — brief says Fable's pair array `[' ','text']`; FIXTURE_SCHEMA says
   `{kind,old,new,text}` objects. **Object shape shipped.**
2. message `runtime` — brief lists flat `workedSeconds/tokenCount/contextUsed/estimatedCost/
   terminalReason`; FIXTURE_SCHEMA nests `tokens{}/context{}/cost{}` + `terminal`. **Nested shape
   shipped**, plus the brief-only fields that have no schema equivalent.
3. `contextSources` — FIXTURE_SCHEMA says feature collections may be attached from `context.js`;
   the brief orders them into `data.js`. **Shipped from data.js** (brief is explicit and the
   Wave 3 Context agent has not started).
4. `goal` — NOT authored here (brief item 3: the Wave 2 Goals agent owns it in `goals.js`).
   `todos[].goalPhaseId` is the join and is populated with the canonical six phase ids.

**Renderers that will still fake after this wave** (I own `data.js` only):
- `renderFileEditor` (`app.js:424-427`) still fabricates 18 lines of `CREATE INDEX` SQL for every
  path. It does not read `hunks`, and **there is no EXT slot for the editor doc** (`EXT_SLOTS` has
  no `editorDoc`/`fileEditor`), so no later agent can replace it without reopening `app.js`.
  This is a genuine hole in the Wave 1 plan — escalated in `DATA_HANDOFF.md`.
- `msgClock()` (`app.js:489`) still invents `11:42 + i*3`; `renderMessageDetails()` (`app.js:501`)
  still prints 16 constants. Both are reachable from the `messageMeta` slot, which the Wave 3
  Transcript agent owns — the `sentAt`/`runtime` fields are for them.
- `handleSend()` (`app.js:1348`) has a hardcoded reply; `scriptedReplies` is additive until a
  later agent consumes it.


## Step 12 — VERIFICATION (painted pixels, not bounding boxes)

Method: `document.elementFromPoint()` at the target centre, then a real painted-pixel read —
screenshot the crop, hand the PNG back to the page as a data URL, draw to a canvas,
`getImageData`, count DISTINCT colours (a solid placeholder box has a reasonable mean and
exactly one colour). No assertion rests on `getBoundingClientRect()` alone.

### PASS (28)
- **No thread renders fewer than 12 messages** — measured by counting `.transcript-inner > *`
  after switching to each of the 24 threads: min **13**, max **26** (`plain`, the long-history
  thread). Was 16 of 24 threads at two or fewer.
- **`plain` / `new-message` expand-state leak is gone** — expanded `plain-14` in `plain`,
  switched to `new-message`: `messageExpanded` holds only `plain-14`, zero of `new-message`'s
  ids collide, and the two threads share **zero** message ids.
- **Subagent list renders 14 rows with 9 distinct statuses painted** (working, stalled, blocked,
  waiting, complete, failed, queued, retrying, fallback). First row hit-tests to itself and its
  crop paints 487 distinct colours. Clicking row 7 opens **Browser Auditor**, i.e. that agent.
- **All 12 changed-file rows render**; clicking the provider-selector.js, access-controls.css and
  interaction-probes.mjs rows opens **three different paths** with **three different +N −M pills**
  — `+92 −18`, `+61 −39`, `+31 −10`, the packet manifest's exact numbers.
- **Model menu paints all 14 models in 5 provider groups and scrolls** (clientHeight 511 vs
  scrollHeight 740). Three display names appear twice — Claude Sonnet 4.6, Claude Opus 5,
  Qwen 3.8 — which is the multi-account fixture doing its job. Row 14 hit-tests to itself and
  paints 483 distinct colours.
- **Activity bar counts derive from the fixtures**: subagents **14**, changes **12**,
  artifacts **18**, todo **6/20**, goal **3/6** (the Goals agent's `D.goal` had landed by then).
- **All three planted search phrases are findable, and hidden**: `retention window nine days` ->
  Archived Usage Prototype, `blue lantern checkpoint` -> Offline Replay, `canonical source
  history` -> BSD Intervention, one thread row each. The `blue lantern` body is measured
  `long-fade` with scrollHeight 565 vs clientHeight 150 — genuinely behind the collapse.
- **Two themes** (basic-dark, friendly-light): zero horizontal overflow, activity panel 96 rows,
  transcript 17, working card present, activity bar 5 domains. Screenshots in `shots2/`.
- **9 working takes** (0,1,2,6,8,11,15,19,23) still render at work step 8 with the 14-phase
  `phaseRows`. Zero regressions.
- **Zero console errors, zero page errors** across the whole run.
- Two loads of `data.js` in a fresh Node context serialise **byte-identically** (399,978 chars) —
  the determinism fix is real, not just the absence of `Date.now()`.

### FAIL (2) — both are renderers I do not own

1. **`renderFileEditor` still prints the canned diff.** All three probed files show the same
   generated `-- surrounding source and migration context` filler. The row opens the right path
   and the right totals, but `app.js:424-427` never reads `hunks`. **There is no EXT slot for the
   editor**, so no later agent can fix it either. Escalated to Wave1A-Platform (owner of app.js)
   by message and written up in `DATA_HANDOFF.md`.
2. **Per-message model metadata is not rendered** — `metaNodes: 0`. The `route` thread genuinely
   carries two models (`Claude Sonnet 4.6` -> `Qwen 3.8`) and both are visible in the transcript,
   but via the route-change receipt copy rather than per-message `runtime`. `msgClock()` and
   `renderMessageDetails()` still ignore `sentAt`/`runtime`. That is Wave 3 Transcript's item 8,
   reachable through the `messageMeta` slot.

## Final gates
- `python3 build.py --check` **PASSES**; both deliverables byte-identical to each other and
  **11,914 CRLF / 0 bare LF** each.
- `node tests/audit.mjs reports/audit.json ./tests` -> **434 pass / 0 fail / 0 console errors /
  0 page errors**.
- `data.js` 32,703 -> **229,556 bytes** (7x). 374 thread messages + 71 subagent messages.
- Nothing committed.

## Referential integrity (checked in Node, all clean)
Every `parentThreadId`, artifact `threadId`, change `threadId`, draft `threadId`, question-flow
`threadId`, worktree `threadId`, todo `dependencies[]`, message `artifactId`, runtime `modelId`
and model `accountId` resolves to a real record. Every enum value used anywhere has an entry in
`D.labels`. No emoji (the only non-ASCII characters in the file are `·`, `—`, `’`, `…`, `→`, `−`),
and no `</script` sequence that would break the inlined build.

## Follow-up (2026-08-25) — escalation closed, re-verified independently

Wave1A-Platform took option 1 and made `renderFileEditor` read `c.hunks` directly. **I re-ran my
own `verify_wave2_data.mjs` rather than accepting their verification** — an implementer verifying
its own work is the exact failure mode this project keeps hitting.

**29 pass / 1 fail** (was 28/2). The diff assertion now passes on my script too:
- `codeHead` reads `@@ -58,11 +58,15 @@ | 58 import { configuredProviders } … | 59 - import
  { firstAccount } …` — the real file, not the filler.
- code-block crop paints **967** distinct colours (was 739 with the canned text).
- `grep -c "CREATE INDEX CONCURRENTLY" app.js` and `grep -c "surrounding source and migration
  context" app.js` are both **0**.

I additionally spot-checked the four EDGE cases Wave1A verified on their own work
(`spotcheck-diff-edges.mjs`), because those are where a hunk renderer usually breaks:

| file | fixture | rendered | verdict |
|---|---|---|---|
| `legacy_rollup.rs` (pure deletion) | `deleted` +0 −23, 1 hunk | pills `Deleted / line 1 / rust / +0 −23`, 23 del rows, **1** focus row | add/del/rowcount/focus all match |
| `docs/query-performance.md` (rename) | `renamed` +11 −5, oldPath `docs/perf-notes.md` | pill **"Renamed from docs/perf-notes.md"** present | matches |
| `0043_…index.sql` (pure addition) | `added` +18 −0 | pill reads **"Created"** — my dual-spelling `labels.changeStatus` doing its job | matches |
| `schema.rs` (multi-hunk) | `modified` +6 −4, **2** hunks | **2** `.code-block` elements, `2 hunks` pill | matches |

Row counts equal `lineCount + hunks` in every case (one `@@` header row per hunk). Painted
colours: add `rgb(92,214,155)`, del `rgb(255,108,125)`. `white-space` reads **`pre`** on the diff
blocks, so Wave1A's local override of the hardening layer's `pre-wrap` is live and gutters align.
Zero page/console errors. Screenshots: `shots2/edge-*.png`.

**Remaining fail is unchanged and not mine:** per-message model/time metadata (`metaNodes: 0`) —
Wave 3 Transcript, item 8, via the `messageMeta` slot. `sentAt`/`runtime` are ready for them.

## Deliverable size — measured, since Wave1A raised it
`data.js` 229,556 B is inlined twice, giving a **903 KB single-file deliverable / 246 KB gzipped**.
For comparison, the sibling concepts ship as directories: 5-6-sol 364 KB / 28 files,
Fable 651 KB / 68, qwen-3-8 917 KB / 60, grok-4-5 1,201 KB / 63, opus-5 3,040 KB / 99,
kimi-k3 **11,422 KB / 129** — and kimi-k3's own fixture is **285,743 B**, larger than mine.
So 5.6 Pro is mid-band on total payload and *below* the largest sibling fixture, while being the
only concept that ships as one file. Reported to the orchestrator as a number, not a worry;
no trimming done, because nothing measured says it is a problem.

## Follow-up 2 (2026-08-25) — coordinator rulings, and one more check

Both of my open questions were closed by the orchestrator:
- The 01:09 `goalEditor` slot was **the orchestrator itself**, not a rule-breaker — Wave 2 Goals hit
  the same class of gap I did (`renderGoalEditor()` had no slot) and asked rather than edited.
  Three writers touched `app.js`, all serialized. Standing rule: `app.js` / `styles.css` changes
  route through the orchestrator. I have no further need for either.
- **Size accepted, no trimming**, on the measurement above.

### Verified the orchestrator's `ACTIVE_STATES` / `RUNNING_STATES` widening against MY collection
It was driven by my finding, so it changes counts derived from `todos` and deserved a check rather
than an assumption (`spotcheck-todo-buckets.mjs`):

- `ACTIVE_STATES` now includes `verifying`, `replanned`; `RUNNING_STATES` includes `verifying`.
- Fixture: completed 6 · in_progress 2 · pending 5 · verifying 1 · blocked 3 · replanned 1 ·
  skipped 2 = 20.
- Buckets now sum to **6 done + 9 open + 3 blocked + 2 skipped = 20** — *every* todo lands in
  exactly one bucket. **Before the widening it was 18 of 20**, with `verifying` and `replanned`
  falling through into neither.
- Painted: count pill **6/20**, and the hover card's derived line reads
  `3 blocked · 2 active · 1 verifying · 1 replanned · 5 pending · 6 done · 2 skipped` — which also
  sums to 20. Zero page/console errors.

### Regression guard added to the harness (Wave1A's suggestion, implemented not just agreed)
The canned filler was uniform enough to be detectable by entropy alone: the fabricated block
measured **739** distinct colours in the code-block crop, the real syntax-varied diff measures
**967**. `verify_wave2_data.mjs` now asserts a floor of **>850**, so if a future change starts
GENERATING source again instead of reading `hunks`, the harness fails on entropy even if the row
counts and pills still look right.

**Harness now 30 pass / 1 fail.** The single remaining fail is Wave 3 Transcript's item 8
(per-message model/time metadata, `metaNodes: 0`); `sentAt`/`runtime` are ready for them.

### Ghost chased and killed: the "264 missing bytes"
`build.py --check` failed once at 01:54 and `assemble.py` reported `data.js` as 229,292 where
`ls -l` had said 229,556 — which reads exactly like a third party edited my file and I overwrote
them. Both were false:
- **The 264 bytes are characters-vs-bytes.** `assemble.py` printed `len(out)` (characters); the
  file holds 189 multi-byte UTF-8 characters (114 `·`, 58 `—`, 12 `−`, 3 `’`, 1 `→`, 1 `…`)
  worth exactly 264 extra bytes. Fixed the print to report `stat().st_size` with a comment saying
  why, so nobody re-chases this.
- **Nothing clobbered.** Proved it rather than assuming: extracted the inlined `data.js` back out
  of the 01:52 `index.html` (which was built from the pre-assemble file) and diffed it against the
  current one — **byte-identical, zero diff lines**. Recovered copy kept at
  `scratchpad/waves/data.js.at-0138`.
- **The `--check` failure was `activity-panel.{js,css}` changing at 01:54:16/01:54:42**, after the
  01:52 build — the Activity Panel agent mid-work, not a drift of mine. `--check` passes again
  now (`920ef6f9d3144742`).

Lesson worth keeping: an mtime plus a size delta is not evidence of a foreign write. The cheap
proof is to recover the old content from the built deliverable and diff it.

## Follow-up 3 (2026-08-25) — encoding fault in build.py, and my side of it

Wave1A found that `build.py` used locale-dependent `read_text()`/`write_text()` against a UTF-8
`.encode()` digest, and pinned `ENC='utf-8'` across all four reads and both writes. Their note:
my fixture did not cause the fault, but it moved the first multi-byte byte from *absent* to
**position 2972**, turning a latent fault into one that fires on the next environment change.

Checked my own side empirically rather than reasoning about it, which is the same discipline:

- **`assemble.py` already pins `encoding="utf-8"` on both the read and the write.** Confirmed it
  survives the hostile environment with every safety net off:
  `LC_ALL=C PYTHONCOERCECLOCALE=0 PYTHONUTF8=0 python3 assemble.py` -> exit 0, 229,556 bytes,
  and `build.py --check` still passes at the same hash afterwards.
- **All 189 of my multi-byte characters survive into the deliverable byte-exact.** Counted them
  in `data.js` and again in the same region extracted from the standalone:
  `{· 114, — 58, − 12, ’ 3, → 1, … 1}` on both sides, EXACT MATCH, and zero mojibake markers
  (`Â·`, `â€”`, `â€™`, `ï¿½`).
- **They render as real glyphs, not tofu.** This is the part a byte comparison cannot answer: a
  correct codepoint that has no glyph in the font still paints a fallback box. Measured widths at
  12px — middot 3.83, em dash 12.00, minus 10.06, arrow 10.06 — against a deliberately
  unmapped codepoint at 7.20. All three differ from the tofu width and from each other, so the
  font really has them. 68 middots painted in the visible UI with the model menu open, and a
  sample label reads `Work · anthropic-work · Low / Medium / High / Max`.

This mattered because `·` is load-bearing in this fixture, not decoration: every account label,
every `route.label`, every worktree state label and the subagent group summaries are built around
it. Mojibake there would have corrupted the multi-account story that is the whole point of the
`models` rewrite.

## Follow-up 4 (2026-08-25) — my glyph check was wrong; corrected and promoted

Wave1A found the flaw in **my** check from follow-up 3: I compared each glyph's rendered
**advance width** against a tofu box. That heuristic is only valid in a PROPORTIONAL font — in a
monospace font every glyph shares one advance width by definition, tofu included, so the test
reports 100% missing and reads exactly like a content failure.

**Reproduced it myself before accepting the correction** (`spotcheck-glyphs.mjs` now runs both
methods side by side across four themes):

```
basic-dark   ui   Inter            PIXEL: NONE   WIDTH: NONE
basic-dark   mono SFMono-Regular   PIXEL: NONE   WIDTH: middot, emdash, minus, arrow, rsquo, ellipsis  <-- FALSE
retro-dark   ui   SFMono-Regular   PIXEL: NONE   WIDTH: middot, emdash, minus, arrow, rsquo, ellipsis  <-- FALSE
retro-light  ui   SFMono-Regular   PIXEL: NONE   WIDTH: all six                                        <-- FALSE
```

**One thing my reproduction adds to their finding: it was never a retro-only flaw.** The width
method fails in the mono stack under `basic-dark` and `friendly-light` too — the themes I *did*
test in follow-up 3 — because the file-editor diff blocks use `--font-mono` in all eight themes.
I only escaped a false positive there because I happened to probe the UI stack and not the mono
one. The retro themes (`--font-ui: var(--font-mono)`, styles.css:42-43) just make it unmissable.

**Result by pixels: NONE of my six characters is missing, in either stack, in any of the eight
themes.** So the fixture was always safe; only my instrument was broken.

Corrected method (canvas ink + bitmap signature vs a Plane-15 private-use codepoint) and
**promoted from a scratch spot-check into the harness** as assertion 9b, across all 8 themes and
both font stacks, with a comment explaining why it must never be "simplified" back to widths.
Harness is now **31 pass / 1 fail** — the remaining fail is still Wave 3 Transcript's item 8.

### The pattern, now with a fourth instance
Encoding looked like a build failure. A byte delta looked like a foreign write. Tofu would have
looked like bad label design. And here **the test method failed in a way that looked exactly like
a content failure** — the most dangerous of the four, because a broken instrument that reports
real-looking defects sends someone hunting a bug that does not exist. Same family as this
project's `getBoundingClientRect()` history: an easy proxy standing in for the thing itself.
Advance width is not a glyph, and a bounding box is not visibility.

## Follow-up 5 (2026-08-25) — the standing failure was under-reported, and my assertion was the bad kind

Wave1A asked what the one persistent failure actually was, then withdrew the question when the
orchestrator confirmed I had named it (`metaNodes: 0`, Wave 3 Transcript item 8) in all four
reports. **The question was not noise. Investigating it found a defect in my own harness.**

**My assertion was structurally incapable of passing.** It counted `.message-meta` /
`[data-model]` nodes — selectors emitted NOWHERE — and it never clicked "More details", so the
panel it was looking for could not have been in the DOM at the moment it measured. `metaNodes: 0`
was therefore a true statement about a selector that would never match, not a measurement of the
defect. **That is precisely this concept's documented sin** — `PM56_RUNTIME.snapshot()` reporting
three permanently-zero metrics while 434/434 passed — reproduced inside the harness I was using
to hold everyone else to asserting pixels. It reported a real defect for a fake reason, which is
luck, not verification.

**The real defect is worse than what I reported.** Opened the panel on two turns in the `route`
thread that the fixture says ran on different providers, models, accounts, clocks, token counts
and costs:

```
                 route-06 (fixture: Sonnet)   route-08 (fixture: Qwen 3.8)
PROVIDER         Anthropic                    Anthropic
ACCOUNT          Work · anthropic-work        Work · anthropic-work
MODEL            Claude Sonnet 4.6            Claude Sonnet 4.6     <-- WRONG
STARTED          11:42:08                     11:42:08
COMPLETED        11:42:19                     11:42:19
INPUT TOKENS     12,840                       12,840
CONTEXT USED     64%                          64%
ESTIMATED COST   $0.084                       $0.084
TURN ID          route-06                     route-08              <-- the ONLY field that differs
```

**15 of 16 fields are byte-identical**, and the model field is **actively wrong** rather than
merely unpopulated: the panel prints `selectedModel()`, the globally selected model, so the Qwen
turn claims the Anthropic route. "Metadata is not rendered" understated it — metadata IS
rendered, and it misattributes the turn. A reviewer reading that panel is told something false,
which is worse than being told nothing.

**Assertion rebuilt** to open the panel and compare the two turns field by field, so it can pass
and can fail for the right reason. Labelled `[EXPECTED FAIL until Wave 3 Transcript item 8
consumes runtime/sentAt via the messageMeta slot]` — named, owned, with a close condition, so it
cannot decay into background noise. It now carries the fixture-vs-panel comparison in its detail
payload, so whoever clears it sees exactly what to make true.

Harness: **32 pass / 1 fail** — one more passing assertion than before, and the failing one now
measures the thing it claims to.

### The pattern, fifth instance — and the first one that was mine twice over
Encoding looked like a build failure. A byte delta looked like a foreign write. Tofu would have
looked like bad label design. A monospace advance width looked like a missing glyph. And here **a
selector that could never match looked like a measured zero.** Four of the five were instruments,
not content. Two of those instruments were mine. The rule that keeps earning its place: if you
cannot make an assertion go red on purpose, it is not an assertion — and its mirror, if you have
never seen it go green, you do not know what it measures.

## Follow-up 6 (2026-08-25) — item 8 metadata half CLOSED, verified by the non-implementer

The orchestrator rewrote `renderMessageDetails` to read `m.runtime` and asked me to close it,
correctly refusing to be both implementer and verifier. Wave1A independently reported a
mid-fix state (15 of 22 identical, plus a **dual cost row** — real `API billed $0.040` beside
hardcoded `Estimated cost $0.084`). **Both of their snapshots were stale**; the full fix has since
landed at sha `81b370fb0de68186`.

### Verified field by field against the fixture, not by eyeball
`route-08`, the Qwen turn in the thread whose entire purpose is a provider route change:

| panel | fixture | |
|---|---|---|
| PROVIDER `Alibaba` | `Alibaba` | was `Anthropic` |
| ACCOUNT `Coding Plan · qwen-coder` | same | was `Work · anthropic-work` |
| MODEL `Qwen 3.8` | `Qwen 3.8` | was `Claude Sonnet 4.6` — actively wrong |
| STARTED `12:18:23 PM` / COMPLETED `12:18:46 PM` | `…T12:18:23Z` / `…T12:18:46Z` | was `11:42:08`/`11:42:19` on every message everywhere |
| INPUT / OUTPUT `5,453` / `375` | `5453` / `375` | was `12,840`/`1,486` |
| CONTEXT USED `17,637 / 262,000 · 7%` | exact | was `64%` |
| CACHE HIT `63%` | `63` | was `78%` |
| API BILLED `$0.025` · PLAN ESTIMATED `$0.0090` | `0.0251` / `0.009` | — |
| MODE `Agent` · TERMINAL `Completed` | via `labels.mode` / `labels.terminal` | no raw `deep_plan`/`complete` on screen |

**Wave1A's dual-cost defect is resolved** — the only money fields left are `API BILLED` and
`PLAN ESTIMATED`, both tracing to fixture values. The four fields still identical across the two
turns (MODE, PERSONA, EFFORT, TERMINAL REASON) are *correctly* identical: both turns really are
Agent / Release Engineer / High·fast / complete in the fixture.

### I caught a SECOND proxy in my own instrument before it shipped
The assertion I wrote in follow-up 5 asserted that fields **differ between two turns**. Differing
is not correct. A panel can differ per turn and still print wrong values, and two hardcoded fields
would agree across turns while contradicting each other *inside one panel* — which is precisely
the dual-cost defect Wave1A found and which my assertion was structurally blind to. "Differs" was
a proxy for "is right", exactly as advance width was a proxy for a glyph and a bounding box is a
proxy for visibility.

Rewritten to assert the thing itself: **every field equals the value the fixture holds for that
turn**, 20 checks per turn across both turns, plus two invariants — no raw underscored enum may be
user-facing, and every money field must trace to a fixture cost (which is the dual-cost defect
expressed as a rule rather than a one-off).

### Negative control — the other half of my own rule
Having finally seen it go green, I proved it can go red on purpose (`negcontrol.mjs`, faults
injected into the live page):

```
baseline (unmodified)                                 []
panel reverts to the globally selected model          CAUGHT
an invented cost row reappears beside the real one    CAUGHT
a raw underscored enum reaches the screen             CAUGHT
```

All three are the actual historical defects, not synthetic ones.

**Harness: 33 pass / 0 fail.** First clean run of this wave. The remaining halves of item 8
(hover-gating, the per-message meta row) are still Wave 3 Transcript's and are not asserted here.

### Pattern, sixth instance — and the first one I caught in myself unprompted
Encoding looked like a build failure. A byte delta looked like a foreign write. Tofu would have
looked like bad label design. Advance width looked like a missing glyph. A selector that could
never match looked like a measured zero. And "differs between turns" looked like "is correct".
Five of the six were instruments. Three of those were mine. The rule holds in both directions now:
*if you cannot make an assertion go red on purpose it is not an assertion — and if you have never
seen it go green, you do not know what it measures.* This one has now been seen both ways.

### Build state at hand-off (accurate, not rounded up)
`build.py --check` is **RED at the moment of writing, and it is not mine.** Settled in one command
with the accidental-backup method rather than by speculation:
- `data.js` extracted from the built `index.html` is **byte-identical** to `data.js` on disk.
- Sources newer than the deliverable: **`history.js` 02:14:42, `transcript.js` 02:14:18,
  `history.css` 02:15:23** — the Wave 3 History and Transcript agents mid-edit.

I deliberately did **not** rebuild. Running `build.py` here would bake another agent's
in-progress state into both deliverables and let me report a green I did not earn; they will
rebuild when their edit is coherent. The last green I personally verified was
`81b370fb0de68186`, which is the build every measurement in follow-up 6 was taken against.

Note for the record: Wave 3 Transcript being live is also what will close the remaining halves of
item 8 (hover-gating and the per-message meta row).

## Follow-up 7 (2026-08-25) — CORRECTION: my "33 pass / 0 fail" was stale within minutes

**I have to correct my own previous report.** I closed item 8's metadata half and reported
33 pass / 0 fail. The panel changed shape again before that message was read, and re-running my
harness gives **32 pass / 1 fail**. Reporting green and being wrong is the exact failure this
whole exchange has been about, so it is corrected here rather than left standing.

Wave1A also told me "both cost shapes satisfy your invariant". **They did not**, and I checked
instead of relaying: my money rule matched `apiUsd` OR `planUsd`, and a `Total estimated` row
matches neither. Their conclusion was right in spirit and wrong as written, which my own
arithmetic showed before I ran anything.

### What actually changed
`renderMessageDetails` reverted from the 21-field layout I verified to a **16-field** layout
while keeping the runtime sourcing. Dropped: `CACHED TOKENS`, `WORKED FOR`, `TOTAL ELAPSED`,
`QUEUED`. `CONTEXT USED` went from `16,549 / 131,000 · 13%` to `13%`. The two cost rows became a
single `TOTAL ESTIMATED`.

### Third proxy error of mine, and the subtlest
Six of my checks went red for fields that no longer exist. **I had asserted the SHAPE I observed
rather than the PROPERTY that must hold** — a snapshot standing in for a rule, which is the same
family as advance-width-for-a-glyph and differs-for-correct. An assertion over-fitted to one
revision of a renderer is not a regression guard; it is a change detector, and it cries wolf on
every legitimate redesign until someone deletes it.

Rewritten to be shape-independent:
- whatever fields the panel emits must each trace to a fixture value for that turn;
- a small required set (`PROVIDER`, `ACCOUNT`, `MODEL`, `TURN ID`) must exist;
- `CONTEXT USED` is accepted in either the `N / LIMIT · P%` or the bare `P%` form, asserted
  against the fixture in whichever form is on screen;
- money must trace to `apiUsd`, `planUsd` **or** `totalUsd` (my bug, now fixed);
- **display-label rule generalised**: if `labels.*` defines a label for a value, the panel must
  print the LABEL, never the enum key. This is strictly stronger than the old "no underscored
  value" test, which only caught `deep_plan`-shaped strings.

### The one genuine defect that survives, isolated
```
route-06.TERMINAL REASON: prints raw enum "complete" where labels.* defines a display label
route-08.TERMINAL REASON: prints raw enum "complete" where labels.* defines a display label
```
It rendered `Completed` in the 21-field version and prints the raw key now. Not a hard violation
of the no-underscored-enum constraint (`complete` has no underscore), but it is a regression
against `labels.terminal`, and it is the ONLY thing my harness now objects to. Reported to
Wave1A; `app.js` is not mine.

Observation, not a failure: dropping the absolute token counts from `CONTEXT USED` makes that row
unverifiable by eye — a percentage cannot be checked against anything, which is precisely why the
fixture carries integer `context.used`/`context.limit`. My assertion accepts either form, so this
is a design note for the owner rather than a defect.

### Staleness is now the dominant failure mode on this tree
Seven events in one exchange, all within minutes: Wave1A's dual-cost read, their misattribution
read, my money-field read, my red build, their green build, their "satisfies your invariant"
claim, and my own 33/0. **A claim about rendered state has a shelf life of minutes here.** The
durable practice is the one that caught every real defect: re-verify rather than relay, and
prefer claims about fixtures and source — stable and diffable — over claims about build or
render state, which are neither.

## Follow-up 8 (2026-08-25) — both of Wave1A's refinements verified; the real find is a fixture invariant of mine

### Their fixture claim: exactly right
Verified against `data.js` directly, which is the stable/diffable class rather than rendered state:
`310 text messages · 190 with runtime · 120 without · all 120 are user messages · zero assistant
text messages lack runtime` (threads and subagents both). Their numbers match mine precisely.

### Their `submitted` refinement: stale (event nine)
They reported the `if(!runtime)` fallback still printing raw `submitted`. Checked `route-01`
directly: the fallback now reads **`TERMINAL REASON: Submitted`**, with honest em-dashes for every
value it genuinely does not have and `STARTED 12:03:04 PM` sourced from `sentAt`. **No raw enum on
that path.** Fixed between their sweep and my check.

### My own `TERMINAL REASON: complete` report: also stale (event ten)
The runtime path now renders `Completed`. My shape-independent assertion reports
`mismatches: []`. Both of the defects in flight when the last two messages were written are gone.

### The finding that is NOT stale, and it is mine to own
Wave1A correctly reasoned that the `selectedModel()` misattribution is now **dead code** — the
fallback needs an assistant message with no `runtime`, and there are none. But that is true only
because of an **accidental property of my fixture that nothing enforced.** Ship one assistant turn
without a runtime block and the original misattribution returns silently, on that turn only, in a
panel nobody re-checks.

Converted the accident into a contract. Two assertions added:
1. **Every assistant text message carries a runtime block** — threads and subagents, 190/190,
   with the corollary that every runtime-less text message is a user turn. This is the guard that
   keeps the misattribution path dead.
2. **The fallback branch obeys the display-label rule too** — it is a separate branch from the
   runtime path, it was fixed separately, and it therefore needs its own assertion. Asserting only
   the runtime path is how the fallback drifted in the first place.

**Harness: 35 pass / 0 fail** against `build.py --check` sha as recorded below.

### Staleness, final count
**Ten events in one exchange.** Six of the last eight messages between us contained at least one
claim that was already false when it was read — and every single one was about rendered or build
state. Zero were about fixtures or source. That asymmetry is the whole lesson and it is now
measured rather than asserted: on a tree with four live agents, claims about rendered state have a
shelf life of minutes; claims about `data.js` held for the entire session.

So this log states its own shelf life: the harness result above is true of the build I measured,
and the honest form of "green" here is "green at sha X, verified by me, at that moment".

### Postscript: the red build was stale too, and I mis-probed it (instrument #8, mine)
`--check` went RED immediately after the run above. Chasing it I wrote a containment probe that
anchored on app.js's FIRST LINE — `(() => {` — which is also data.js's first line, so it matched
the wrong file and produced a confident 7-hunk "app.js differs from the deliverable" that was
pure artefact. Second time in this session I built an instrument that reported a real-looking
defect for a fake reason; the tell was the same as always, a result too tidy to be true
(mtimes said app.js was OLDER than the build, which cannot coexist with "the build is missing
app.js content").

Settled it the definitive way instead — copied every build input to a temp dir, ran `build.py`
there, and byte-compared: **fresh build from current sources `15ff97ba40f101fa` == live
deliverable `15ff97ba40f101fa`, identical.** The tree had become consistent while I was
investigating. So the red was true when observed and false minutes later — event twelve, and
the sharpest illustration yet.

**CORRECTION (Wave1A, verified by me): the temp-dir dance was redundant — `build.py --check`
already IS that byte-compare.** I reached for a hand-rolled proxy while the real measurement sat
in the repo, which is this session's own pattern one last time, with a different cause: not
convenience, but not knowing the real instrument existed. A proxy chosen for want of knowing
better is the same failure as one chosen for ease, and the fix is documentation, not discipline.

Read it rather than remembering it (build.py:70-83): `--check` assembles the full output in
memory from every current source, sha256s it, and compares against each deliverable read back
from disk. Both sides go through `read_text()`, which normalises CRLF→LF, so it is
newline-agnostic by construction — deliberate, so a line-ending flip on this NFS share can never
produce a false red.

Then I tested it rather than trusting the read, in a temp dir so the shared tree was untouched —
because "an assertion I have never seen go red is not proven" applies to someone else's
instrument too:

| condition | result |
|---|---|
| shipped CRLF deliverables | PASS |
| **both deliverables flipped CRLF→LF** (15,740 bytes of line-ending difference, content identical) | **PASS** — no false red |
| **one character changed** (`fixtures.` → `fixtures!`) | **FAIL**, names the file |

So it is newline-immune and it is not vacuously green. One command, no temp dir, no mtimes, no
substring probe, and it cannot be fooled by anchoring on the wrong file.

**Caveat, Wave1A's and worth keeping:** `--check` removes the proxy, not the raciness. It answers
"do the deliverables match the sources *right now*", so during another agent's mid-write it goes
correctly-but-transiently red — exactly as my temp-dir build did. Neither is a lock. Which is why
the rule that actually carries is the behavioural one: **report a red caused by someone else's
in-flight edit; never "fix" it by rebuilding.**

## FINAL STATE (with its shelf life stated)
- `python3 build.py --check` **PASSES**, deliverables byte-identical, **15,724 CRLF / 0 bare LF**.
- Harness **35 pass / 0 fail**.
- `data.js` is the only file I modified this wave; nothing committed.
- All of the above is true of the tree as I measured it. On a tree with four live agents, that is
  the strongest honest form of the claim.

## Follow-up 9 (2026-08-25) — terminal states: `complete` was the only one shipped

Wave 4 Thread Ops found that all 190 assistant turns carried `runtime.terminal:'complete'`, so
**Retry message (`cmd.chat.retry_message`) had no data to exercise its enabled branch** — the
operation is only eligible on a failed or cancelled assistant turn. Correct code, unreachable by
fixture. This is the exact mirror of the `selectedModel()` case I closed earlier: there a branch
was dead because of my data, here a branch was *correct but unexercisable* because of my data.
**"Unreachable today" is a property of the data, not of the code**, which is why the fix belongs
here and not in a note.

Two turns added, both in threads where the outcome is what the narrative already describes:

| turn | thread | terminal | why there |
|---|---|---|---|
| `tool-failure-02` | Tool Recovery | `error` | the turn that was mid-stream when the execution host dropped at step 7 of 11. `runtime.error` carries the reason. Retry is the obvious thing a reviewer clicks. |
| `debug-10` | Browser Debug Session | `stopped` | a fourth 500-load pass the reviewer interrupts, followed by the user explaining why and the assistant conceding it was cost with no decision attached. |

Distribution is now `{complete: 190, stopped: 1, error: 1}`; 377 messages, minimum thread still 13.

### Asserted, not just added
Per the same reasoning that produced the runtime-block guard, two assertions so a future fixture
pass cannot quietly re-disable Retry:
1. at least one `error` turn **with a real reason string** and at least one `stopped` turn exist;
2. both **paint their display label** — verified in-browser as `Ended in error` and
   `Stopped by user`, not the enum keys.

### Negative control (the other half of my own rule)
```
baseline (shipped fixture)                          pass
a future pass removes the stopped turn              RED
a future pass removes the error turn                RED
error turn keeps terminal but loses its reason      RED
```
Green on the real fixture, red on all three realistic regressions — including the subtle one where
the terminal survives but the reason is dropped, which would leave Retry enabled with nothing to
tell the user why.

**Harness: 37 pass / 0 fail.** `build.py --check` passes; deliverables byte-identical, CRLF.

---

# HANDOFF — read this first if you are picking up after me

## The three durable conclusions, ranked (agreed with Wave1A)

1. **Report a red `--check` caused by someone else's in-flight edit; never "fix" it by rebuilding.**
   Behavioural, survives any tooling change, and it protects *honesty* rather than correctness —
   rebuilding buys a green that belongs to nobody and bakes half-finished work into both
   deliverables.
2. **`python3 build.py --check` IS the byte-compare.** One command, no temp dir, no mtimes, no
   substring probes. Verified in a temp dir, three ways: passes on shipped CRLF, still passes
   after flipping both deliverables CRLF→LF (15,740 bytes of difference, content identical), and
   fails on a single changed character. Newline-immune *and* not vacuously green. Caveat: it
   removes the proxy, not the raciness — it is an honest instantaneous reading, not a lock.
3. **Distrust claims about rendered and build state; trust claims about fixtures and source.**
   Twelve staleness events in one exchange and the asymmetry was perfect: every stale claim was
   about rendered or build state, not one about `data.js`. This tells you *which* claims to
   re-check, which is far more actionable than "re-check everything".

## The pattern that produced all of it
An easy proxy standing in for the thing itself. Advance width for a glyph. A bounding box for
visibility. A row count for a diff. A selector that matches nothing for a measurement of zero.
"Differs between two samples" for "is correct". The shape of one renderer revision for the rule
that must hold. An mtime for a stale build. **Eight instruments, four of them mine.**

Two rules, and the second is the one people forget:
- If you cannot make an assertion go red on purpose, it is not an assertion.
- **If you have never seen it go green, you do not know what it measures.**

And the structural fix, which is not "be more careful": **the author is the worst-placed person
to certify their own green.** Every real defect in this wave was found by the other party.

## State of `data.js` at hand-off
`build.py --check` PASSES (`6a28cc920b15a974`); deliverables byte-identical, 15,740 CRLF / 0 bare
LF. Harness `verify_wave2_data.mjs` **35 pass / 0 fail**. `data.js` is the only file I modified
(+2,672 / −133). Nothing committed. 24 threads · 374 messages · min 13 · 12 changed files /
19 hunks · 14 subagents · 20 todos · 18 artifacts · 14 models / 9 accounts.

Per conclusion 3, the first two sentences of that paragraph are claims about build state and have
a shelf life of minutes; the last is a claim about source and will hold. Re-run `--check` and the
harness yourself rather than trusting either.

## Still open, and not mine
`DATA_HANDOFF.md` §0 lists every shipped-but-unconsumed field and its owner. The live ones are
Wave 3 Context (`contextByThread`), Wave 3 Menus (`operational.worktrees`), and the unassigned
`scriptedReplies` / `drafts` / `warnings`. Item 8's remaining halves — hover-gating and the
per-message meta row — are Wave 3 Transcript's.
