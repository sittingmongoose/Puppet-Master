# Wave 1A — Platform — work log

Owner: `app.js` + `build.py` (+ one surgical `styles.css` addition for the Demo Studio back-port).

## Status
- [x] 1. Baseline restored. The 104-line hand-edit (draggable/resizable Demo Studio) was extracted
      by diffing a fresh in-memory build against the standalone, then back-ported into
      `styles.css` (16 lines: `.demo-dialog`, 8 `.demo-resize` edges/corners, hover/dragging
      states, `@keyframes demo-dialog-in`) and `app.js` (helpers, markup, handlers). Verified
      byte-exact — a fresh build from the patched sources is `cmp`-identical to the hand-edited
      standalone. `python3 build.py --check` PASSES.
- [x] 2. `build.py` newline-preserving: `target_newline()` sniffs the target's first 64KB, defaults
      CRLF. Both deliverables stay CRLF; `git diff` shows only real content changes.
- [x] 3. 22 module stubs created + registered in `build.py`
      (activity-panel, activity-bar, goals, context, history, menus, transcript, lens, orbit,
      threadops, questions × .js/.css). CSS appended LAST (after transcripts.css) so module rules
      win over the base sheet AND the variant sheets. JS after variants-*.js, before app.js, with
      an `EXT_SHIM` collector emitted between them.
- [x] 4. `window.PM56_EXT` registry in app.js: ensureExt / extCtx / extRender / extReplace /
      extRun / extRunAfter. All 15 slots emitted. Actions consulted BEFORE the built-in if-chain
      (override) and again AFTER it (`actionAfter`). data-k rule documented in the header comment.
- [x] 5. app.js-resident fixes — all landed (details below).
- [x] 6. `activityDefs()` now derived from the collections; FIXTURE_SCHEMA.md written.
- [x] 7. Pixel verification — all assertions below confirmed in-browser. WAVE 1A COMPLETE.

## Key finding — the audit invocation in the task brief is WRONG
`node tests/audit.mjs reports/audit.json .` FAILS (hard TimeoutError at audit.mjs:48).
`audit.mjs` computes `root = path.resolve(argv[3] || dirname(new URL(import.meta.url).pathname), '..')`.
- With `.` → root = the PARENT dir (`chat-assistant-concepts`), which has no index.html.
- With NO argv[3] → `new URL(...).pathname` is percent-encoded, so root = `.../5.6%20Pro`
  (a literal `%20`), a directory that does not exist. The space in "5.6 Pro" breaks the default.
**CORRECT INVOCATION: `node tests/audit.mjs reports/audit.json ./tests`** → 434 pass / 0 fail,
zero console errors, zero page errors.

## What landed in app.js (task 5)
- **item 5 / model menu**: `.model-layout` now emits `height:100%;max-height:none`, which is the
  actual fix for "cannot scroll" — the layout never stretched to the menu's definite inline height,
  so `.model-scroll`'s `minmax(0,1fr)` never bounded. `modelMenuHeight()` rewritten (54px row
  pitch, counted provider groups instead of `Math.min(n,4)`, viewport clamp moved here). New
  `filteredModels()` is the single filter shared by the menu and its height (they had diverged).
  **`state.modelView` REMOVED** — it defaulted to `'favorites'` while the rail drew "All" active,
  which is why 3 of 6 models showed; the rail (`state.modelProvider`) is now the only source of
  truth, and removing it also removes a write-only field.
  **Favourites moved out of the fixture into `state.favorites`**, so `toggle-favorite` no longer
  mutates `D.models` permanently. `globalReset()` additionally restores `D.models`/`D.artifacts`
  from a boot-time `FIXTURE0` snapshot (retry-artifact still writes to `D.artifacts`).
- **item 3**: `data-history-variant` added to the floating `.history-flyout`.
- **item 7**: the two hardcoded hover chips deleted.
- **item 11**: New-thread icon button in `.chat-header`, outside the pinned-history ternary.
- **item 10**: Revise/Build row added to `renderPlanDocument` (the plan's editor view).
- **item 8 (partial)**: `.always` removed from assistant `.message-actions`.
- **item 12 (partial)**: orbit nodes emit `data-action="inspect-work-step"` + `data-value` +
  `role/tabindex` + inline `pointer-events:auto` (defeats `.orbit-ring{pointer-events:none}`
  without editing styles.css); `CHROME_OPTS[1]={keepBody:true}` so the stage survives completion.
- **15f**: snapshot selectors repointed at `.activity-item[data-hover-domain]`, `.overlay-menu`,
  `[data-artifact-id]`; `data-artifact-id` now emitted on the artifact message card, the artifact
  editor doc, and the activity-panel artifact rows. `listTriggers()` derives from the Demo Studio's
  own hoisted `demoTriggerGroups()` — 88 triggers instead of a hand-kept 45.
- **15d**: `copyText()` added (async Clipboard → execCommand → honest failure toast; there was no
  `navigator.clipboard` call anywhere before). `copy-message` copies the real message body;
  `copy-mermaid` copies the hoisted `MERMAID_SOURCE`. `dismiss-event` actually splices the message
  out of its thread. `export-context` produces a real blob download. The four goal-lifecycle verbs
  keep an honest "not simulated yet" toast and are overridable via `PM56_EXT.action('pause-goal',…)`.
- **15e**: `DEMO_EFFECTS` table gives 28 previously-colliding triggers distinct states.
  `stepMap` no longer maps Browser testing and Program testing to the same step.
- **15g**: `editorMode`, `activityFilter`, `newMessageCount` deleted (zero references).
  `planStatus` now renders on the plan card, `questionQueue` on the questionnaire head,
  `draftHistory` behind a new "Drafts (N)" restore button in the composer + `restore-draft` action.
- **task 6**: `activityDefs` is now `activityDefs()`, derived from `D.goal`/`todos`/`subagents`/
  `changes`/`artifacts` with per-field fallbacks, plus a `tone` field for the Wave 2 Activity Bar
  agent. `renderLiveAgentsCard` ("3 active" over slice(0,4)) and `renderWorkReceipt` now derive
  their counts too. `mostRecentArtifact()` replaces the hardcoded `D.artifacts[0]`.

## Deliberately NOT done (later waves own them)
- `motion.js:73 flipHeight()` is exported and never called — Wave 1B owns motion.js. Noted only.
- `.orbit-ring{pointer-events:none}`, `.model-*` CSS, the hardening layer: Wave 1B / Wave 4.
- `PM56_FEATURE_MANIFEST` (data.js:223) is read by nothing and asserts wrong variant counts —
  data.js belongs to the Wave 2 Demo Data agent.
- `tests/standalone-smoke.mjs`, `production-browser-audit.mjs`, `critical-browser-audit.mjs`,
  `record-motion.mjs` call `PM56_DEMO.closeAll()` / `auditInvariants()` and query `#overlay-root`
  and `[data-selector]`, none of which exist. Those harnesses are stale; not in Wave 1A's scope.

## Decisions
- Back-port applied with anchored python patch scripts (`scratchpad/waves/backport.py`,
  `p_ext.py`, `p_fixes.py`, `p_wire.py`, `p_trig.py`, `p_15e.py`, `p_defs.py`) that abort loudly if
  an anchor is missing or ambiguous.
- The `PM56_EXT` collector shim lives in `build.py` (3 methods) because module JS is concatenated
  BEFORE app.js; the full registry is in app.js and upgrades that object in place. Both carry a
  "keep in sync" comment.
- Module CSS is appended after ALL existing CSS (not just after styles.css) so module rules beat
  the variant sheets too — that is what "module rules win" has to mean in practice.


## Pixel verification results (Playwright + chromium-1234, file://, 1440x900)
Method: `document.elementFromPoint()` at each target's centre, plus a real painted-pixel read —
screenshot the crop, hand the PNG back to the page as a data URL, draw to canvas, `getImageData`.
No assertion rests on `getBoundingClientRect()` alone. Scripts in this directory:
`verify-demo.mjs`, `verify-pixels.mjs`, `measure-model.mjs`, `verify2.mjs`, `probe.mjs`, `final.mjs`.

- **Demo Studio**: header hit-tests to itself; drag moved it (310,126)->(170,216); SE resize
  820x648 -> 700x548; dialog centre still hit-tests inside itself afterwards.
- **Model menu paints > 3 rows**: 6 of 6 rows painted and hit-testable inside `.model-scroll`
  (was 3 of 6). Crop of the menu contains 2,172 distinct colours (real content, not a blank box).
- **Model menu actually scrolls**: with the list forced to 30 rows, `overflow-y:auto`,
  clientHeight 511 vs scrollHeight 1444, `scrollTop` moved 0 -> 933, and after scrolling the LAST
  row is the element returned by `elementFromPoint` at its own centre. Before the fix the same
  test gave clientHeight 1444 == scrollHeight 1444 and `didScroll:false`.
  The decisive declaration turned out to be `grid-template-rows:minmax(0,1fr)` on `.model-layout`,
  not `height:100%` alone — see the comment in `renderModelMenu`.
  Row-pitch constants re-measured in-browser: 44.03 / 22.61 / 47.03, not the plan's "49-54px".
- **New-thread button**: present, hit-tests to itself, paints (13 distinct colours in the crop),
  and creates a thread in BOTH `pinned` and `floating` history modes.
- **Plan editor Revise/Build**: both buttons found inside
  `.editor-doc[data-artifact-id="plan-query"] .plan-actions`, 85x30 and 82x30, both hit-test to
  themselves.
- **Assistant message actions**: at rest `opacity:0` and the Copy button is NOT the element at its
  own centre; on hover `opacity:1` and it IS. Both roles now gated.
- **Orbit**: `.orbit-ring` computed `pointer-events:none`, `.orbit-node` computed
  `pointer-events:auto`, node hit-tests to itself, clicking one changes `work.step`, and the orbit
  stage still exists after `completeWorking()` (CHROME_OPTS[1].keepBody).
- **Clipboard**: `navigator.clipboard.readText()` returns the real message body after clicking
  Copy. **dismiss-event**: thread message count 5 -> 4.
- **15e**: BSD intervention / silent check / timeout produce three different last-message types
  (`bsd-advice` + dialog / `bsd-evaluating` / `tool-error`); Context Focus / Mute / Subcompact
  likewise differ.
- **PM56_EXT end-to-end**: a probe module written into `questions.js`, built, and loaded BEFORE
  app.js registered 3 slots + 2 actions; all rendered on the FIRST paint, the action dispatched,
  a built-in action (`pause-goal`) was overridden, `activityPanelBody` replaced the stock panel,
  and a `data-k` node survived 2+ work ticks without remounting. Probe removed; build hash back to
  the pre-probe value.
- **8 themes**: zero horizontal overflow in every theme; zero console errors AND zero warnings
  across every run above.
- `PM56_RUNTIME.snapshot()`: activityDomains 0 -> 5, artifacts 0 -> 1 (14 with the activity panel
  open), menus 0 -> 1 with a menu open. `listTriggers()` 45 -> 88.
- Derived `activityDefs()` corrects the fixture lies on screen: Subagents now reads **5** (was 2),
  Todo **1/8 · 1 done · 1 active · 1 blocked · 1 skipped** (the literal said 2/8 · 2 done; the
  fixture has exactly one `done`).

## Handoff warning for Wave 1B / Wave 3 Menus
`.chat-header`'s icon buttons flex-shrink: at 1440px the search button and the new New-thread
button are 22.4px wide, and at 1100px they are 14.5px — i.e. the 14px icon with zero padding.
This is PRE-EXISTING (the search button already did it); the new button only matches it. The Menus
agent is about to insert a worktree control into the same row via `headerExtras` and will hit it.
Fix belongs in `styles.css` (`flex:none` on `.chat-header .icon-button`), which Wave 1B owns.

## Late refinement (caught by looking at the screenshot, not by a metric)
The first `draftHistory` affordance was a `.text-button` reading "Drafts (N)". Measured: it cost
the five composer selector chips ~30% of their width (worktree 72.1px -> 48.1px) at the stock
1440x900 layout. Replaced with an icon-only `.icon-button` shown **only while the composer is
empty** (restoring a draft over text you are typing is not an offer worth making). Re-measured:
worktree 72.1 -> 66.5, an ~8% cost. Verified: hidden before any send, hidden while typing, visible
and hit-testable after a send, restores the text, hides again once the composer has content.

## Final state
`python3 build.py --check` PASSES (sha256 604cc960845bfb5d).
`node tests/audit.mjs reports/audit.json ./tests` -> 434 pass / 0 fail / 0 console errors /
0 page errors. `index.html` and the standalone are byte-identical to each other and still CRLF.
Nothing committed; `styles.css` diff is +17 / -0 (the demo-dialog back-port only).

---

## Follow-up (2026-08-25): `renderFileEditor` now reads `changes[].hunks`
Requested by the Wave 2 Demo Data agent, who shipped the fixture but could not kill the fake from
`data.js`. Taken by Wave 1A because `renderFileEditor` lives in `app.js`. Chose the **direct read**
over adding an `editorDoc` slot: a slot only one agent would ever use is more machinery than the fix.

What changed (2 functions, ~40 lines with comments):
- New `renderDiffLine(l, focusLine, deletedFile)` — `kind` maps onto the classes styles.css already
  carries (`.diff-line.add` / `.del` / `.focus`); `meta` has no rule there and Wave 1B has closed
  that file, so its muted tone is inline. **Line numbers come from `l.old` / `l.new` and are never
  computed locally** — doing that arithmetic here is exactly what produced the fake.
- `renderFileEditor` walks `c.hunks`, emits one `.code-block` per hunk with its `@@` header, and
  pills for status (via `D.labels.changeStatus`, so both `added`/`created` print "Created"),
  `oldPath` on renames, `language`, `+N −M`, and a hunk count when >1.
- `white-space:pre` is set **inline** on the diff blocks: the hardening layer (`styles.css:419`)
  relaxes `.code-block` to `pre-wrap`, which is right for prose and wrong for a diff — wrapping
  breaks gutter alignment. Inline keeps the override local to the file editor.
- **No hunks → honest empty state**, not the old fabricated source. The canned SQL is deleted
  outright rather than kept as a fallback.
- Article carries `data-k="file:${path}"`, each block `data-k="hunk:${path}:${header}"`.

Verified in-browser over all 12 changed files (`verify-hunks.mjs`):
- **12 files → 12 distinct rendered bodies.** Previously all 12 rendered the same 18 lines.
- Zero occurrences of `CREATE INDEX CONCURRENTLY idx_events_tenant_created` or
  `-- surrounding source and migration context` anywhere; the string is gone from `app.js` too.
- Row counts match the fixture exactly for every file (492 rows = every hunk line + every `@@`
  header). Exactly one `.focus` row per file, at the declared `c.line`.
- All four statuses render correct English: Created / Modified / Deleted / Renamed.
- The correction packet's three manifest counts reproduce from the hunks themselves:
  provider-selector.js +92/-18, access-controls.css +61/-39, interaction-probes.mjs +31/-10.
- Pixel proof: add rows paint `rgb(92,214,155)`, del rows `rgb(255,108,125)`, both hit-test to
  themselves at their own row centre. Deleted-file focus falls back to `old` numbering correctly.
- `build.py --check` passes, deliverables byte-identical and CRLF, audit 434/0, zero console
  errors or warnings.

### Note for the orchestrator: app.js has more than one writer now
`extReplace('goalEditor', …)` and a 16th `EXT_SLOTS` entry appeared in `app.js` at 01:09, which I
did not write — so the "nobody edits app.js after Wave 1" rule has already been broken once by
another agent. It is coherent and the build is green, but concurrent writers to a 160KB file is the
exact hazard the ownership rule existed to prevent. My patch aborted-on-ambiguity by design and I
snapshotted `app.js` to `scratchpad/waves/app.js.pre-hunks` before writing.

---

## ORCHESTRATOR RULING (2026-08-25) — read this before touching app.js or styles.css
**`app.js` and `styles.css` changes route through the orchestrator, serialized, one edit at a time.**
No agent reopens either file; message the orchestrator, it makes the change, rebuilds, verifies and
hands back. This supersedes my earlier "app.js has more than one writer" note: the second writer was
the orchestrator itself, adding the `goalEditor` slot at 01:09 because Wave 2 Goals hit a real gap
(`renderGoalEditor()` had no slot, so a third of item 2 was unreachable). Wave 2 Goals asked rather
than edited — correct behaviour. Nothing was clobbered.

If a future Wave 1A session resumes from this log: **do not patch app.js directly.** Send the patch
to the orchestrator.

### Three concurrent edits verified to coexist
- my `renderDiffLine` / `renderFileEditor` hunks reader (2 refs present),
- the orchestrator's `goalEditor` slot (16th `EXT_SLOTS` entry, 1 emit site),
- a later widening of my `ACTIVE_STATES` / `RUNNING_STATES` by Wave 2 Demo Data, which found
  `verifying` and `replanned` were in neither list so those todos counted as neither done nor open.
  Reviewed the widening: `verifying` is in BOTH lists (a verifying todo is actively running AND
  open) and `replanned` in ACTIVE only (open but not running). That is the correct reading of my
  derivation and `activityDefs()` still holds.
`build.py --check` passes (sha256 df4c59aa0e74d5c0), audit 434/0/0/0.

### The `--spring` animation-shorthand defect did NOT affect my back-port
The orchestrator found that `--spring` / `--spring-soft` bundle duration + easing, which is correct
in `transition` but wrong in the `animation` shorthand where a second time value is the DELAY — so
19 shorthands carrying their own duration were silently gaining a 440-520ms delay. Fixed with
easing-only `--spring-ease` / `--spring-soft-ease` companions.

My back-ported `.demo-dialog { animation: demo-dialog-in var(--spring) both }` carries NO duration
of its own, so it takes duration from the token — one time value, no delay. **Measured rather than
assumed** (`scratchpad/waves/spring-check.mjs`): computed `animation-duration: 0.52s`,
`animation-delay: 0s`, opacity already 0.111 at 4ms and 1 by 399ms. It starts immediately; there is
no dead period. Correctly left untouched by the fix.

Swept the whole live document for leftover accidental delays: the only non-zero
`animation-delay` values remaining are the two intentional staggers — `pm-materialize` at
65/110/155ms (the evidence-line cascade, `--pm-stagger`) and `bar-grow` at 45ms increments (the
mini-graph bars, `animation-delay:${i*45}ms`). Both scale linearly with index, which is what a
deliberate stagger looks like. No accidental delay survives.

### Deliverable size: accepted at 925KB by the orchestrator
`data.js` is 229KB and inlined twice. Decision is to surface the number to the user rather than
optimise it away. No action for Wave 1A; `build.py` does not and should not gate on size.

### The hunks fix was independently verified (not by me)
Wave 2 Demo Data re-ran its own harness rather than trusting mine — the right instinct, since
implementer-verifies-own-work is a failure mode this project keeps hitting. `verify_wave2_data.mjs`
went 28/2 -> 29/1; the code-block crop paints 967 distinct colours where the canned filler gave 739.
It also spot-checked (`spotcheck-diff-edges.mjs`) the four edge cases where a hunk renderer usually
breaks, and confirmed each independently:
- pure deletion (legacy_rollup.rs): 23 del rows, focus resolved off `old` numbering,
- rename (docs/query-performance.md): "Renamed from docs/perf-notes.md" pill, verified on the
  screenshot and not only in the DOM,
- pure addition (0043_…sql): "Created" pill, i.e. the dual-spelling map resolving `added`,
- multi-hunk (schema.rs): 2 `.code-block` elements, "2 hunks" pill.
Row counts equal `lineCount + hunks` in all four, and `white-space:pre` confirmed live on the diff
blocks, so the local override of the hardening layer's `pre-wrap` is doing its job.
**Two independent harnesses now agree on this fix.**

### Deliverable size, measured against the siblings
Wave 2 Demo Data measured rather than guessing: 903 KB single file, 246 KB gzipped. Sibling concepts
ship as directories — 5-6-sol 364 KB, Fable 651 KB, qwen-3-8 917 KB, grok-4-5 1.2 MB, opus-5 3.0 MB,
kimi-k3 11.4 MB (whose own fixture, 285,743 B, is LARGER than ours). So 5.6 Pro is mid-band on
payload and below the largest sibling fixture while being the only concept that ships as one file.
Nothing to do. If the requester ever does want it smaller, cut fixture volume — do NOT minify in
`build.py`, which would break the source-to-deliverable symmetry `--check` exists to enforce.

---

## build.py: encoding pinned to UTF-8 (2026-08-25)
Prompted by Wave 2 Demo Data's characters-vs-bytes finding. Their bug was in their own assembler,
but the same distinction exposed a latent fault in `build.py`, which I own outright (the
orchestrator's ruling names `app.js` and `styles.css`, not this file).

**The fault:** every `read_text()` / `write_text()` inherited the *locale's* preferred encoding
while `digest` called `.encode()`, which is UTF-8 regardless of locale. The two halves disagreed
with each other and with the file. The sources carry **292 multi-byte characters** (data.js 189,
app.js 101, styles.css 1, shell.html 1), so under a C/POSIX locale `read_text()` decodes as ASCII
and the build dies on the first middot.

**Why it never bit:** Python 3.7+ coerces a C locale to UTF-8 (PEP 538/540) and hides it.
Verified empirically rather than assumed — `LC_ALL=C python3 build.py --check` passes, but with the
safety net switched off the way a container or a pinned-env subprocess does it:
```
LC_ALL=C PYTHONCOERCECLOCALE=0 PYTHONUTF8=0  ->  UnicodeDecodeError: 'ascii' codec can't
                                                 decode byte 0xc2 in position 2972
```
This got materially more likely this wave: data.js went 33KB -> 229KB and gained 189 multi-byte
characters, so the first bad byte is now 2972 bytes into the file rather than absent.

**Fix:** one `ENC='utf-8'` constant, pinned on all four reads and both writes, with a comment
explaining why so it does not get "simplified" back. Verified:
- output **byte-identical**, hash unchanged at `920ef6f9d3144742` before and after;
- a full *write* under `LC_ALL=C PYTHONCOERCECLOCALE=0 PYTHONUTF8=0` now succeeds and reproduces
  the same hash — encoding and `newline='\r\n'` coexist correctly in `write_text`;
- CRLF still preserved, deliverables still byte-identical to each other, 1151 multi-byte
  characters survive the round-trip into the deliverable;
- audit 434 pass / 0 fail / 0 console errors.
Snapshot of the previous version: `scratchpad/waves/build.py.pre-utf8`.

## Technique worth keeping: the deliverable is an accidental backup
From Wave 2 Demo Data, and it generalises beyond their case. On a tree with four concurrent agents,
an mtime plus a size delta looks exactly like a foreign write and usually is not. The cheap proof is
to **extract the inlined source back out of the built `index.html` and diff it** — the deliverable
holds a verbatim copy of every source as of its last build. That is a free backup that costs nothing
to keep and settles "did someone clobber me" in one command. Their two false alarms (264 bytes of
characters-vs-bytes, and a `--check` failure that was just another agent's module landing mid-build)
both dissolved under it.

---

## Glyph coverage across all 8 themes — and a false positive I caught in my own test
Wave 2 Demo Data verified glyph presence by measuring rendered width against a deliberately
unmapped codepoint. Sound method, but measured only in the default theme (Inter). Two gaps I went
to close: **the retro theme sets `--font-ui: var(--font-mono)`**, so its entire UI renders in the
mono stack, and my file-editor diff blocks use `--font-mono` in every theme. Different family,
different coverage — worth checking.

**My first attempt reported all 7 characters missing in every mono context. That was wrong, and the
bug was in my test.** In a monospace font every glyph has the same advance width *by definition* —
including the tofu fallback box — so a width-vs-tofu comparison cannot distinguish them and reports
100% missing. The heuristic is only valid for proportional fonts.

Redone against **pixels** (render to canvas, compare ink coverage and bitmap signature against the
tofu box) — `scratchpad/waves/glyph-pixels.mjs`:

| | tofu box | middot | minus | times | ellipsis | emdash | arrow | cmd | rsquo |
|---|---|---|---|---|---|---|---|---|---|
| ui stack   | 274px ink | 24 | 72 | 180 | 60 | 102 | 144 | 460 | 37 |
| mono stack | 132px ink | 30 | 54 | 136 | 48 | 69 | 65 | 238 | 51 |

**Genuinely missing: NONE**, in either stack. Every one of the 9 non-ASCII codepoints `app.js`
emits (`· − × … — → ⌘ ↵ ’`) renders a real, distinct glyph. Zero U+FFFD in the retro-dark diff
blocks; the `+92 −18` pill renders its true minus sign.

**Pass this to anyone adding a glyph guard to a harness:** the width method silently inverts under
ANY monospace stack. Corrected by Wave 2 Demo Data, and my own captured output had already said so
before I mis-read it — re-tallied from `glyph-themes.mjs`:

| | false positives in the UI stack | in the MONO stack |
|---|---|---|
| basic-dark/light, friendly-dark/light, glass-dark/light | 0 of 7 | **7 of 7** |
| retro-dark/light | 7 of 7 | 7 of 7 |
| | **2 of 8 themes** | **8 of 8 themes** |

So this was never a retro-only flaw. The diff blocks use `--font-mono` in **all eight** themes, so
the width method lies about them everywhere; retro merely promotes mono to the UI stack and makes
it unmissable. I framed it as retro-specific in my first write-up — the data in my own table
contradicted that and I under-read it. Use the pixel method unconditionally.

This is the same trap as the `getBoundingClientRect()` false positives this project has hit before,
in a new costume: an advance-width proxy standing in for the thing itself. Assert the pixels.

---

## Item 8 escalation: the details panel MISATTRIBUTES turns (verified 2026-08-25)
Raised by Wave 2 Demo Data; I reproduced it rather than relaying it, and the measurement sharpens
the claim. `renderMessageDetails` is in `app.js`, so this is a report to the orchestrator, not a
patch — the serialization ruling stands.

**Mechanism (source):** Provider / Account / Model are printed from `selectedModel()` — the model
currently chosen in the composer — for every assistant message, regardless of which model ran it.

**Fixture (data.js):** 190 turns carry `runtime`, across **5 distinct models and 4 providers**
(Sonnet 69, Kimi K3 38, Opus 5 32, Qwen 3.8 28, GLM 5.2 23). The `route` thread is built to
demonstrate a provider route change: turns 02/03/06 Anthropic/Sonnet, then 08/10/11/14/15
Alibaba/Qwen 3.8.

**Rendered (verified in-browser, `verify-metadata.mjs`):** opening the panel on route-06 and
route-08 — the two sides of that route change — prints Provider `Anthropic`, Account
`Work · anthropic-work`, Model `Claude Sonnet 4.6` for BOTH. The fixture says route-08 ran on
Alibaba / `Coding Plan · qwen-coder` / Qwen 3.8. **The one thread whose entire purpose is to show a
provider route change actively denies that the route changed.**

**This is not "metadata is not rendered". It is rendered and it is false** — a reviewer reading that
panel is told something untrue, which is strictly worse than an empty field. It changes item 8's
close condition from "populate the fields" to **"stop asserting a route that did not run"**.

**Second, newer defect — the partial wiring has made the panel self-contradictory.** 7 fields now
read the fixture correctly (Worked for, Total elapsed, Queued, Cached tokens, API billed, Plan
estimated, Turn ID) while 15 of 22 remain identical across the two turns. The result is that
**`API billed $0.040` (real, from the fixture) now sits directly beside `Estimated cost $0.084`
(hardcoded constant) in the same panel, differing by 2x.** Also still hardcoded: Started/Completed
`11:42:08`/`11:42:19` (fixture: 12:13:37 and 12:18:23) and Input/Output tokens `12,840`/`1,486`
(fixture: 17,987 and 5,453). Half-wiring a panel of constants produces a worse artifact than either
end state, because the true fields lend credibility to the false ones sitting next to them.

### Item 8 escalation CLOSED — both defects fixed, verified as non-implementer
Re-ran `verify-metadata.mjs` against the orchestrator's rewrite (build `a85e8fe640f3613b`):
- **Misattribution gone.** route-08 now prints `Alibaba / Coding Plan · qwen-coder / Qwen 3.8`,
  matching the fixture. route-06 stays Anthropic/Sonnet. The route thread now agrees with itself.
- **Dual-cost gone.** One money row, `Total estimated`. Traced it rather than eyeballing:
  `$0.0551` = `cost.totalUsd` = `apiUsd 0.0399 + planUsd 0.0152`, exact. No invented money.
- Clocks, tokens, context and cache are per-turn and real (12:13:37 vs 12:18:23; 17,987 vs 5,453).
- 4 of 16 fields identical across the two turns — Effort, Persona, Mode, Terminal reason — and all
  four are *correctly* identical; both turns really did run Agent / Release Engineer / High / complete.

### Gate 1 was red and is green again — and the non-rebuild was the right call
Wave 2 Demo Data reported `build.py --check` red with `history.{js,css}` / `transcript.js` newer
than the deliverable, and **deliberately did not rebuild**, because rebuilding bakes another
agent's in-progress state into both deliverables and manufactures a green nobody earned. That is
the correct discipline and worth stating as a rule: **on a shared tree, a red `--check` caused by
someone else's in-flight edit is a status to report, never a state to "fix" by rebuilding.**
By my check it is green again at `a85e8fe640f3613b` with zero sources newer than the deliverable.

### Staleness is the ambient condition here, not an anomaly
Four times in this exchange a snapshot went stale within minutes, always in the good direction:
my dual-cost finding, my misattribution finding, their money-field reading, their red build. On a
tree with four concurrent agents **a claim about tree state has a shelf life measured in minutes.**
Two consequences worth keeping: re-verify rather than relay (which is what caught every real defect
here), and prefer claims about *fixtures and source* — which are stable and diffable — over claims
about *build state*, which are not.

### My own instrument has the flaw they just named
Their sharpest finding: an assertion that fields **differ between two turns** is not an assertion
that they are **correct** — two hardcoded fields agree across turns while contradicting each other
inside one panel, which is precisely the dual-cost defect and is invisible to a difference check.
`verify-metadata.mjs`, mine, does exactly that: it diffs two turns and prints the fixture underneath
for a human to compare. It caught the misattribution only because *I* read the two blocks against
each other. Anyone reusing it should assert field-equals-fixture instead. "Differs" is a proxy for
"is right", the same shape as advance width for a glyph and a bounding box for visibility.

---

## Label-rule sweep (2026-08-25) — and my own sweep was instrument #7
Wave 2 Demo Data generalised the enum rule: **if `labels.*` defines a display label for a value,
the panel must print the label, never the key.** I ran it across the whole app rather than the one
field they found. `D.labels` ships **11 maps**; `app.js` consults **one** (`changeStatus`, which I
wired for the file editor) plus a local `lbl()` helper inside `renderMessageDetails`.

**My first sweep was a bad instrument and I caught it before reporting.** It substring-matched each
key against painted text, so prose scored as defects — "Revision 3 **added** the rollback gate"
counted as a raw `added` enum. 40 hits, mostly noise. That is a substring standing in for "a raw
enum was rendered as a value": the same proxy shape, mine, instrument #7. Rewritten to match only
**leaf elements whose entire text is the value**, and to separate raw keys from merely-cased ones.
Then verified every survivor against source, which killed three more as cross-map coincidences
(`.meta-pill` "plan" is an artifact *kind*; there is no `labels.artifactKind`, so `labels.mode.plan`
matching it is meaningless).

### Live defects, verified to source (both in app.js -> orchestrator)
1. **`renderMessageDetails` applies `lbl()` on the runtime path but not on the `if(!r)` fallback.**
   The fallback prints raw `submitted`; `labels.terminal.submitted = "Submitted"`. Fixture check:
   310 text messages, 190 with `runtime`, **120 without — and all 120 are user messages**, so this
   is cosmetic-but-real on every user turn.
2. **`esc(art.status)` at 2 sites renders the raw artifact status** — `ready` / `stale` / `error` /
   `loading` — where `labels.artifactStatus` maps `error -> "Needs retry"` and
   `loading -> "Rendering"`. Not cosmetic: "error" and "Needs retry" say different things.

### Not a defect, and worth recording so nobody re-raises it
The **misattribution is dead code, not a live defect, on that fallback path.** `selectedModel()` is
still used there for Provider/Account/Model, but the path is only reachable by an *assistant*
message with no `runtime`, and **there are zero**. It should still be removed as a trap for future
fixtures, but nothing on screen is wrong today.

Wave 2's reported `TERMINAL REASON: complete` is **already fixed** on the runtime path — it renders
`Completed` via `lbl('terminal', ...)`. Their report was stale, or measured a different build.
Their finding refines rather than contradicts: the runtime path is fixed, the fallback is not.

### Group B (11 hits) needs per-owner attribution, not one escalation
Values like `Blocked` where `labels.todoStatus` says `Stalled`, `Loading` where `artifactStatus`
says `Rendering`. These render in `.right` spans split across `app.js` (6) and `activity-panel.js`
(3), so they belong to different owners and several may be intentional casing. Flagged as a class
for each owner to check against their own map, NOT reported as confirmed defects — I have not
traced them to source and will not report what I have not verified.

---

## Both escalations closed, verified as non-implementer (2026-08-25)
Build `6a28cc920b15a974`, `--check` green.
- `esc(art.status)` raw pills: **0 remaining** in app.js.
- `lbl()` is now applied **inside the `if(!r)` fallback**, so the label rule covers both branches.
- Rendered sweep: Group A raw keys **6 -> 1**, and the survivor is `.meta-pill` "plan", the artifact
  *kind* — a cross-map false positive I had already discarded (there is no `labels.artifactKind`).
- Group B unchanged at 11, still unverified by me, still not reported. Consistent.

## `build.py --check` IS the byte-compare — nobody needs a temp dir
Wave 2 Demo Data ended up copying every build input to a scratch dir, running `build.py` there and
byte-comparing, after an mtime heuristic and a substring probe both misled them. That procedure is a
manual re-implementation of `--check`, which already:
- builds the full output in memory from **all current sources**, and
- compares `sha256` against **each deliverable read back from disk**, and
- does it **newline-agnostically** (`read_text()` normalises CRLF->LF on both sides), which I made
  deliberate so a line-ending flip on this NFS share can never produce a false red.

**So the canonical answer to "is the deliverable stale?" is `python3 build.py --check`, one command,
no temp dir, no mtimes.** Worth stating loudly in the handoff because two agents independently
reached for proxies — mtime ordering, a first-line substring probe — while the direct measurement
sat in the repo. That is the session's own pattern one last time: a proxy chosen over the real
measurement, not because the real one was unavailable but because nobody knew it was there.

**Honest caveat, so this is not oversold:** `--check` removes the *proxy*, not the *raciness*. It
answers "do the deliverables match the sources right now", so during another agent's mid-write it
goes correctly-but-transiently red. The temp-dir build has exactly the same property. Neither is a
lock; both are honest instantaneous readings. The discipline that matters stays the one Wave 2 got
right: **report a red caused by someone else's in-flight edit, never "fix" it by rebuilding.**

---

## `build.py --check` was tested, not just read — by someone other than its author
Wave 2 Demo Data exercised it in a temp dir, applying the "an assertion you have never seen go red
is not proven" rule to *my* instrument rather than only their own:

| condition | result |
|---|---|
| shipped CRLF deliverables | PASS |
| both deliverables flipped CRLF -> LF (15,740 bytes of line-ending difference, content identical) | **PASS** — no false red |
| one character changed, `fixtures.` -> `fixtures!` | **FAIL**, and it names the file |

**The middle row is the one that matters and neither of us had ever exercised it.** It is the
empirical proof of the NFS design note I wrote in `target_newline()` — the claim that a line-ending
flip cannot produce a false red was, until now, asserted rather than demonstrated. The third row
proves it is not vacuously green. So `--check` is newline-immune *and* actually capable of failing,
which is the pair of properties an integrity gate needs and the pair almost no suite verifies.

Recording it here because it is evidence about my own deliverable that I did not produce, and the
whole lesson of this exchange is that the author is the worst-placed person to certify their own
green.

## FINAL STATE — Wave 1A
Build check passed. Both deliverables match sha256 6a28cc920b15a974.
sources intact:
  PM56_EXT slots declared / emitted : 17 / 17
  hunks reader (renderDiffLine)     : present
  fabricated diff SQL in app.js     : 0 occurrences
  build.py UTF-8 pins               : 4
  deliverables byte-identical       : yes
  line endings                      : CRLF line terminators
  committed by Wave 1A              : nothing

---

## Closing note for a Wave 5 verifier — one nuance the summaries overstate
Both handoffs will tell you "the author is the worst-placed person to certify their own green,
so the fix is a second party." That is right and it is the main finding. But the stronger claim
that circulated — *not one instrument was caught by its own builder* — is slightly overstated, and
the exception is the teachable part.

Two of the eight were caught by their builder before ever being reported, both by me:
- the **glyph width heuristic**, caught because the result was too uniform — it reported *every*
  character missing in *every* mono context, which is not what a real font gap looks like;
- the **substring label sweep**, caught because 40 hits was too abundant — a defect that common
  would have been visible on screen without a harness.

Neither was caught by re-reading the code or by being careful. Both were caught by **the result
being implausible on its face** — too uniform, too abundant, too tidy. That is a real and cheap
tell, and it is worth naming next to the second-party rule rather than being absorbed into it:

> **Before believing your own instrument, ask whether its answer is the shape a real defect would
> have.** A defect that is perfectly uniform, or suspiciously abundant, or that implicates
> everything at once, is usually the instrument.

So the honest formulation is: a second party catches what you cannot, and an implausibility check
catches some of what you can. The second is not a substitute for the first — six of eight still
needed the other party — but it is free, and it is the only defence available to an agent working
alone, which a Wave 5 verifier often is.
