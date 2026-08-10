# Search Panel — Feature-Completeness Re-Audit (adversarial fixture)

**This supersedes the first pass.** The first audit scored seven implementations
of `panels.search` against `research/search.md` while `_pm-data.js` carried only
nominal state: one index state (`ok`), no record rows, no remote-availability
field, no cancelled build. Three MUSTs scored absent for every version and the
first audit diagnosed all three as *fixture-blocked* — kit rule 8 says all
content comes from the fixture, so an author who omitted them was obeying the
rules.

The fixture has now been extended with adversarial state variety. This pass
re-scores against it and, more importantly, drives the panels through the states
the data now poses.

**Method.** Every claim below comes from a rendered panel, not from reading
source. All seven versions were built through `PM_BAKEOFF.buildStage` in headless
Chrome against the harness server at `127.0.0.1:47821` (identity-checked:
harness `puppet-master-panel-bakeoff`, root `Concepts/panel-bakeoff`, data sha1
`169fa176b09e`), at 240 / 280 / 380 / 480px, and then re-rendered once per value
of the freshness vocabulary the fixture now ships in
`_pm-data.js:232-239` — `indexed`, `stale`, `unindexed`, `fallback`, `disabled`,
`cancelled` — plus the live value `ok`. That is 7 versions x 7 states x 4 widths.
Zero page errors in every combination; nothing throws. What follows is what the
panels *say*.

Versions audited: `v0-baseline` (the shipped PMConcept7 markup, the control),
`vA-ledger`, `vB-gutter-sheet`, `vC-lens-deck`, `vD-drill-stack`, `vE-cockpit`,
`vF-stream`. The three variant files register no `search` panel (verified: they
render the harness `NOT BUILT` placeholder) and stay out of scope.

Legend: **P** present, **~** partial, **A** absent.

---

## 0. What is new in the fixture, and what reads it

| Fixture addition | Location | Requirement it unblocks | Versions that read it |
|---|---|---|---|
| `index.lastBuild` — cancelled build, partial generation discarded, non-resumable | `_pm-data.js:223-229` | #26 | **0 of 7** |
| `index.states` — the six-value strip vocabulary with per-state `line` copy and `annotateRows` | `_pm-data.js:232-239` | #9 | **0 of 7** |
| `remote` — availability, reason code, and the mandated sentence | `_pm-data.js:248-258` | #23 | **0 of 7** |
| `recordSummary` + `records` — 5 Orchestrator-owned hits with `objectKind`, `label`, `/record/...` route | `_pm-data.js:277-304` | #22 | **0 of 7** |

Verified by string-reach probe: for each of the nine distinguishing strings
(`Orchestrator run #47`, `/record/`, `investigation`, `Remote search
acceleration is unavailable`, `build-01.platyr.internal`, `Index build
cancelled`, `Partial generation discarded`, `of 132`, `5 records`), every one of
the seven versions emits **none** of them, at **any** of the four widths.

`search.files`, `search.summary` and `search.paging` are unchanged, so the
result tree renders byte for byte what it rendered in the first pass. The
enrichment for this panel is entirely new keys, and no version reads a single
one of them.

---

## 1. Requirement checklist

Unchanged from the first pass; reproduced so this document stands alone.

**MUST** = the brief cites a Plans requirement. **SHOULD** = the brief
recommends it as necessary for the panel to be usable. Items the brief itself
marks as spec gaps (`research/search.md` section 10) are excluded and revisited
in section 5.

| # | Requirement | Tier | Citation |
|---|---|---|---|
| 1 | Header carries the panel label `Search` | MUST | `FinalGUISpec.md:L820`, `L950` |
| 2 | Header carries a drag-grip for detach, tooltip "Drag to detach, or double-click to pop out." | MUST | `FinalGUISpec.md:L820`, `L950` |
| 3 | Header carries an overflow menu | MUST | `FinalGUISpec.md:L820`, `L950` |
| 4 | Editable query field, open by default; the `/open-focus` target `focus: "query"` | MUST | `FinalGUISpec.md:L697`, `UI_Command_Catalog.md:L1147` |
| 5 | Regex / case / whole-word toggles, icon-only, present at 240px, each >=24px | MUST | `FinalGUISpec.md:L752-L753`, `L2146` |
| 6 | Replace row: replacement field plus Replace / Replace All, collapsed by default | MUST | `FinalGUISpec.md:L791`, `L753`; `UI_Command_Catalog.md:L1149`, `L1152` |
| 7 | Scope row expressing include / exclude globs (not just a preset list) | MUST | `FinalGUISpec.md:L697`, `L753` |
| 8 | Freshness strip: one line, never a card, in region-5 position | MUST | `FinalGUISpec.md:L699` |
| 9 | Four-value freshness vocabulary `indexed` / `stale` / `unindexed` / `fallback`, plus the subtle annotation when a query truly fell back | MUST | `FinalGUISpec.md:L699`, `L6511`, `L565-L567` |
| 10 | Enable/disable indexing (project-scoped) with the `Indexing off — grep only` copy | MUST | `FinalGUISpec.md:L699` |
| 11 | Rebuild index (`cmd.search.rebuild_index`) | MUST | `UI_Command_Catalog.md:L1153` |
| 12 | Re-anchor index | MUST | `FinalGUISpec.md:L699` |
| 13 | Large-file threshold (10 MB), generated-file exclusion patterns, follow-symlinks | MUST | `FinalGUISpec.md:L699` |
| 14 | Evict remote cache, confirmed (`cmd.search.evict_remote_cache`) | MUST | `UI_Command_Catalog.md:L1154` |
| 15 | No index card, and no engine / document-count diagnostics competing with results | MUST (negative) | `FinalGUISpec.md:L562-L567`, `L699`, `L2089` |
| 16 | Results tree with **distinct** file-group headers and match rows | MUST | `FinalGUISpec.md:L697` |
| 17 | Match rows are fixed-height and non-wrapping | MUST | `FinalGUISpec.md:L697` |
| 18 | Match highlight is background + weight, not hue alone | MUST | `FinalGUISpec.md:L1237` |
| 19 | Result nav: match count plus Prev / Next | MUST | `FinalGUISpec.md:L697` region 7; `UI_Command_Catalog.md` search family |
| 20 | Expand all / collapse all | MUST | `FinalGUISpec.md:L752-L753` |
| 21 | Results-tree keyboard: Up/Down, Enter, Escape, Home/End, type-ahead | MUST | `FinalGUISpec.md:L2131-L2134` |
| 22 | Orchestrator-owned hits expose object/record identity and a `/record` route target rather than a bare text hit | MUST | `FinalGUISpec.md:L703`, `L6524-L6571` (F3-047) |
| 23 | Remote search acceleration is never a silent local fallback — if unavailable, say so | MUST | `GitHub_Integration.md:L1600`, `L1630-L1631` |
| 24 | Panel hosts no quick-open file picker, no symbol jumper, no chat-history box | MUST (negative) | `FinalGUISpec.md:L705`, `L744-L746` |
| 25 | Every `<select>` is a `pm-select`; the native scope dropdown must go | MUST | `FinalGUISpec.md:L753` + kit rule 7 |
| 26 | `Index build cancelled` state after cancelling a build by turning indexing off mid-build | MUST | `FinalGUISpec.md:L699` |
| 27 | Per-file match count on the group header, kept at 240px | SHOULD | search.md sections 2, 8 |
| 28 | Match-centred horizontal window, ellipsis on each cut side | SHOULD | search.md sections 6.3-6.4 |
| 29 | Line number inline as the leading token, no 28px left gutter | SHOULD | search.md section 6.2 |
| 30 | Row actions: open (default), replace this match, copy path:line | SHOULD | search.md section 4 |
| 31 | Hover shows the untrimmed source line | SHOULD | search.md section 6.5 |

26 MUST, 5 SHOULD.

---

## 2. Requirement x version matrix, re-scored

Cells that moved are marked with an arrow. Every other cell is re-affirmed
against the enriched fixture, not merely carried forward.

| # | Requirement | v0 | vA | vB | vC | vD | vE | vF |
|---|---|---|---|---|---|---|---|---|
| 1 | Header label `Search` | P | P | P | P | ~ | P | P |
| 2 | Drag-grip detach + tooltip | A | A | A | ~ | A | A | A |
| 3 | Header overflow menu | A | P | P | P | P | P | P |
| 4 | Editable query field, open | P | P | P | P | P | P | ~ |
| 5 | Regex / case / whole-word at 240px | ~ | P | P | P | P | P | ~ |
| 6 | Replace field + Replace / Replace All | P | ~ | ~ | P | P | ~ | ~ |
| 7 | Scope row with include/exclude globs | ~ | ~ | ~ | ~ | ~ | ~ | ~ |
| 8 | Freshness strip, one line, never a card | A | ~ | P | P | P | ~ | P |
| 9 | Four-value freshness vocabulary | A | ~ | **~ -> A** | **P -> ~** | ~ | ~ | A |
| 10 | Enable/disable indexing + off copy | A | **P -> ~** | **P -> ~** | ~ | **P -> ~** | A | A |
| 11 | Rebuild index | P | P | P | P | P | P | P |
| 12 | Re-anchor index | A | P | P | A | A | A | A |
| 13 | Threshold / exclusions / symlinks | A | P | P | ~ | ~ | A | ~ |
| 14 | Evict remote cache | A | P | P | P | P | P | P |
| 15 | No index card above the results | A | P | ~ | P | P | P | P |
| 16 | Distinct group headers + match rows | P | P | P | P | P | P | ~ |
| 17 | Fixed-height, non-wrapping match rows | A | P | P | P | P | P | P |
| 18 | Highlight = background + weight | ~ | P | P | P | P | P | P |
| 19 | Match count + Prev / Next | P | P | P | P | ~ | ~ | A |
| 20 | Expand all / collapse all | A | P | P | P | P | P | A |
| 21 | Results-tree keyboard | A | ~ | ~ | ~ | ~ | ~ | ~ |
| 22 | Object/record identity + `/record` | A | A | A | A | A | A | A |
| 23 | no-silent-local-fallback statement | A | A | A | A | A | A | A |
| 24 | No quick-open / symbol / chat box | P | P | P | P | P | P | P |
| 25 | pm-select only, no native select | A | P | P | P | P | P | P |
| 26 | `Index build cancelled` state | A | A | A | A | A | A | A |
| 27 | Per-file count on group header | P | P | ~ | P | P | P | P |
| 28 | Match-centred window | A | P | P | P | P | P | P |
| 29 | Inline line number, no gutter | A | P | P | P | P | P | ~ |
| 30 | Row actions open / replace / copy | A | P | P | P | P | ~ | P |
| 31 | Hover shows untrimmed line | A | ~ | A | ~ | A | ~ | A |

### Coverage, before and after

MUST coverage only, partial counts as half, out of 26.

| Version | Before | After | Delta | Cause of the move |
|---|---|---|---|---|
| vA-ledger | 19.5 — **75%** | 19.0 — **73%** | -0.5 | #10: the indexing toggle is hardcoded `On` and contradicts the state |
| vC-lens-deck | 19.5 — **75%** | 19.0 — **73%** | -0.5 | #9: `cancelled` and `indexed` fall out of its vocabulary map |
| vB-gutter-sheet | 19.5 — **75%** | 18.5 — **71%** | -1.0 | #9 hardcoded identity, #10 static Disable |
| vD-drill-stack | 18.0 — **69%** | 17.5 — **67%** | -0.5 | #10: `Disable indexing` never becomes Enable |
| vE-cockpit | 16.0 — **62%** | 16.0 — **62%** | 0 | no change; its gaps were never fixture-shaped |
| vF-stream | 13.5 — **52%** | 13.5 — **52%** | 0 | no change; already scored A on the states it fakes |
| v0-baseline (control) | 8.5 — **33%** | 8.5 — **33%** | 0 | no change; pre-existing gaps intact |

**No requirement moved up for any version.** This is the pass's first result and
it is worth stating plainly: the first audit's hypothesis — that some designs had
handled a state correctly and simply had none to show — is **false for this
panel**. Section 3 answers why.

---

## 3. Question A — which previously-absent requirements are now present

**None.** All four fixture additions were checked directly, and the result is
the same in each case: the data now poses the question and no version answers it.

- **#22 (record identity + `/record`)** was scored A x7 with the diagnosis "the
  cause is upstream — `search.files` contains only file/line/pre/hit/post". The
  fixture now carries 5 record rows at `_pm-data.js:278-304` with `objectKind`,
  `label`, `owner`, `field` and a `/record/...` route on every one. All seven
  versions iterate `S.files` and nothing else. **The 5 rows are dropped from the
  panel entirely** — not truncated, not collapsed behind a disclosure, absent.
- **#23 (no-silent-local-fallback)** was scored A x7 with the same diagnosis.
  `search.remote` now carries `available: false`, `reason:
  "remote_acceleration_unavailable"` and the ready-made sentence the requirement
  asks for. No version renders it. See BREAK 6 — this one is worse than absent.
- **#26 (`Index build cancelled`)** was scored A x7. `index.lastBuild` now
  carries the terminal state, the copy line, the "Partial generation discarded"
  detail and a `Start a fresh build` action. No version renders it.
- **#9 (four-value vocabulary)** is the one requirement the fixture makes
  *testable* rather than merely *available*, and testing it moved two versions
  **down**. Section 4 is that result.

The correct reading is that these were never really fixture-blocked. Kit rule 8
explains why an author could not have *invented* the record rows or the remote
sentence, and that excuse still holds for #22 and #23. It does not hold for #9:
`index.state` was always a variable, the brief always named four values, and six
of seven versions built a freshness surface that only ever renders correctly for
the single value that happened to be in the fixture.

---

## 4. Question B — WHAT BROKE

Each finding names the version, the exact state, and the exact rendered string.
All strings below are `innerText` read off a built stage, quoted verbatim.

### BREAK 1 — vB-gutter-sheet states a falsehood under five of six states, and at 240px states it alone

`versions/vB-gutter-sheet.js:456` builds the freshness row identity as a literal:

    id: 'Indexed - ' + String(ix.builtAt).split(',')[0],

The state never enters the identity. Driving `index.state` through the fixture's
own vocabulary, the region-5 row renders:

| state | 240px and 280px renders | 380px and 480px renders |
|---|---|---|
| `indexed` | `Indexed · commit abc12ef` | `Indexed · commit abc12ef` + `indexed` |
| `stale` | `Indexed · commit abc12ef` | `Indexed · commit abc12ef` + `stale` |
| `unindexed` | `Indexed · commit abc12ef` | `Indexed · commit abc12ef` + `unindexed` |
| `fallback` | `Indexed · commit abc12ef` | `Indexed · commit abc12ef` + `fallback` |
| `disabled` | `Indexed · commit abc12ef` | `Indexed · commit abc12ef` + `disabled` |
| `cancelled` | `Indexed · commit abc12ef` | `Indexed · commit abc12ef` + `cancelled` |

Two separate defects stack here. At 380px and up the row displays its own
contradiction — the identity says `Indexed`, the word slot four characters later
says `unindexed`. Below 380px `row()` drops the `word` slot, so **at the panel's
minimum width the row reads `Indexed · commit abc12ef` under an unindexed,
fallback, disabled or cancelled index, with nothing on screen to contradict it.**
Requirement 8 credits vB with the cleanest one-line strip in the bakeoff; that
line is now the one that lies.

Third defect, on the non-colour channel. `versions/vB-gutter-sheet.js:455`:

    status: ix.state === 'ok' ? 'ok' : 'stale',

Every state that is not the literal `ok` collapses onto `stale`. Rendered
`pmk-mark` class and accessible label:

| state | rendered mark | screen reader hears |
|---|---|---|
| `ok` | `pmk-mark pmk-t-ok` | "Succeeded" |
| `indexed` | `pmk-mark pmk-t-idle` | **"Stale"** |
| `unindexed` | `pmk-mark pmk-t-idle` | **"Stale"** |
| `fallback` | `pmk-mark pmk-t-idle` | **"Stale"** |
| `disabled` | `pmk-mark pmk-t-idle` | **"Stale"** |
| `cancelled` | `pmk-mark pmk-t-idle` | **"Stale"** |

Note the first row of that collapse: `indexed` is the spec's **healthy** token
(`FinalGUISpec.md:L699`), and vB renders it as Stale, in the idle tone, with the
clock glyph. A perfectly fresh index is announced as stale to a non-sighted user
because the author matched on the fixture's incidental `ok` instead of on the
vocabulary. Score #9 drops from ~ to A.

### BREAK 2 — vE-cockpit collapses the same five states onto "Stale", and says nothing at all when healthy

`versions/vE-cockpit.js:696` repeats vB's mistake exactly:

    status: S.index.state === 'ok' ? 'ok' : 'stale',

Rendered marks are identical to the vB table above: `indexed`, `unindexed`,
`fallback`, `disabled` and `cancelled` all produce `pmk-mark pmk-t-idle` with the
accessible label **"Stale"**. Two independent authors converged on the same
`=== 'ok'` shortcut, which makes this a fixture-shaped failure rather than a
carelessness one — worth saying in the writeup that picks a winner.

vE's own surfacing (`versions/vE-cockpit.js:678`) is
`if (S.index.state !== 'ok') meta.push(S.index.state)`, which appends the raw
enum to a list of flag words. Under `fallback` the focus card reads:

    All files · fallback     matches     48 in 14 files

so `fallback` arrives as a peer of `regex` and `case` — a degraded-service
condition rendered in the same slot and the same weight as a search option. And
under the live fixture value `ok`, vE renders **no freshness text anywhere**;
the panel is silent while `remote.available` is false and `lastBuild.state` is
cancelled.

### BREAK 3 — vA-ledger renders "DISABLED" and "Indexing On" simultaneously

`versions/vA-ledger.js:653` hardcodes the toggle:

    ix += ctl('Indexing', tgl('On', true, 'Disable the project index for this project'));

The literal `true` is never read from state. Under `index.state = 'disabled'` the
panel renders, in this order, top to bottom:

    SEARCH        48 in 14 files (disabled)
    ...
    INDEX         DISABLED · 1,284
    Indexing      On

The header says the index is disabled, the section count says `DISABLED`, and
the only control in the panel that governs it says `On`. Under `cancelled` the
same contradiction reads `CANCELLED · 1,284` above `Indexing On`, and it also
asserts 1,284 indexed documents for a build the fixture says was cancelled at 41
percent with partial generation discarded. Requirement 10 drops from P to ~: the
control is present and correctly placed, and it does not reflect the state it
controls. No `Enable` affordance and no `Indexing off — grep only` copy exists at
any width.

vA is otherwise the best-behaved version on state, and this is worth crediting
precisely: `versions/vA-ledger.js:582` and `:642` pass every state through to the
UI verbatim, so vA is one of only two versions that never states something false.
It states something raw — `48 in 14 files (unindexed)` and an uppercased
`UNINDEXED · 1,284` — which is #9 partial, not #9 absent.

### BREAK 4 — vC-lens-deck raises a false alarm on the healthy state and drops the cancelled one

vC is the only version with a real vocabulary map
(`versions/vC-lens-deck.js:648-655`), and it is keyed to the *old* fixture. Its
`IDX_WORD` covers `ok, stale, building, unindexed, fallback, disabled`. The
enriched fixture's `states` array is keyed `indexed, stale, unindexed, fallback,
disabled, cancelled`. Two keys fall through.

`cancelled`. `IDX_WORD` has no entry, so `word` falls back to the raw token and
the context line renders:

    All files · cancelled · 1,284 docs

with the footer `48 in 14 files·cancelled`. The fixture ships the sentence
`Index build cancelled` two objects away; vC prints the enum instead. `IDX_TOKEN`
also has no entry, so `mark()` receives `undefined`, `K.statusOf(undefined)`
falls through to `D.status.queued` (`_pm-kit.js`), and the status mark renders
`vC-mark vC-tn-idle` — a *terminal failure* shown in the **queued** tone with the
**circle** glyph. Nothing reads `undefined` on screen; the failure is silent and
therefore worse.

`indexed`. This is the sharper one. `IDX_TOKEN[ix.state] !== 'ok'` is the guard
that decides whether to raise a status mark at all — the whole point of vC's
design, and the most literal reading of `FinalGUISpec.md:L567` in the bakeoff.
`IDX_TOKEN['indexed']` is `undefined`, `undefined !== 'ok'` is true, so under the
spec's **healthy** token vC raises a status mark it is designed to suppress:

    vC-mark vC-tn-idle    tip: "Index — indexed"

A panel whose entire freshness thesis is "stay silent when nothing is wrong"
raises an alert when nothing is wrong, because the fixture's healthy token is now
spelled the way the spec spells it. Score #9 drops from P to ~.

### BREAK 5 — vD and vF print the enum, and vF prints a lie

`vD-drill-stack.js:639` is the whole of its state handling:

    var word = S.index.state === 'ok' ? 'Indexed' : S.index.state;

so the fixed freshness strip renders, verbatim:

| state | rendered |
|---|---|
| `ok` | `Indexed … commit abc12ef, 4m ago` |
| `disabled` | `disabled … commit abc12ef, 4m ago` |
| `cancelled` | `cancelled … commit abc12ef, 4m ago` |
| `unindexed` | `unindexed … commit abc12ef, 4m ago` |

Lowercase bare enum where a sentence belongs, and — under `disabled` and
`cancelled` — an anchor commit and a build age presented as current facts for an
index that is off or whose build was discarded.

`vF-stream.js:763` is the worst single line in the panel family:

    pinSub('Indexed' + DOT + S.index.builtAt, state.width, b, b >= 1 ? 120 : 0))

`S.index.state` is never read. vF renders

    Indexed · commit abc12ef, 4m ago

**identically under all seven states**, including `unindexed`, `fallback`,
`disabled` and `cancelled`. The first audit called this out from source; it is
now confirmed across the full vocabulary the fixture ships. vF is the only
version that asserts a healthy index while the index is off.

### BREAK 6 — all six redesigns offer to evict a cache for a service the fixture says is down

This is the highest-severity finding in the pass because it is unanimous and
because the requirement is a *negative* one.

`search.remote` (`_pm-data.js:248-258`) now says `available: false`,
`state: "unavailable"`, `silentFallback: false`, and supplies the sentence
`Remote search acceleration is unavailable. These results are local only.`
`GitHub_Integration.md:L1600` and `L1630-L1631` make it mandatory that this be
stated rather than silently replaced by a local search.

Rendered at 240px, every one of vA, vB, vC, vD, vE and vF carries a menu item
reading **`Evict remote cache`** (verified in markup for all six). Not one of
them renders the sentence, the host, the reason code, or any availability
indication whatsoever. The panel therefore:

1. serves local-only results with no statement that they are local-only — the
   exact silent fallback the requirement forbids; and
2. offers a destructive, confirm-gated command against a remote subsystem the
   data says is unreachable, with no disabled state and no disabled reason.

Point 2 is the concrete consequence of spec gap `research/search.md` section
10.1: all 11 Search wiring rows carry `preconditions: null` and
`disabled_reason: null`, so nothing told any author when to grey this out. The
fixture now supplies exactly the precondition that was missing.

Note the control's position here. **v0-baseline does not expose Evict at all**,
so v0 fails #23 by omission while the six redesigns fail it by *contradiction*.
On this one requirement the redesigns are behind the control, and that is only
visible because the fixture now poses the state.

### BREAK 7 — five record rows exist and no panel has a row for them

`recordSummary` says `records: 5, kinds: 5`. The five rows carry `run`, `node`,
`investigation`, `thread` and `plan_step` identities with `/record/...` routes,
and deliberately carry **no** `path`, **no** `line` and **no** `pre/hit/post`
triple. Every version's row grammar is "path, then line number, then windowed
match", so there is nothing to put in any of the three slots — and every version
resolves that by iterating `S.files` and never looking at `S.records`.

The rows are dropped silently. No count changes (correctly — `recordSummary` is
deliberately separate from the 48 text matches, so no header disagrees with its
rows), no empty state appears, no overflow item hints they exist. A user
searching `quantity` in a project where the Orchestrator holds five matching
records sees zero of them and is given no signal that Search is not showing
them. `FinalGUISpec.md:L703` assigns those hits to this panel.

### Not a break, and worth recording as such

- Nothing throws. 7 versions x 7 states x 4 widths, zero page errors, zero
  `undefined` / `NaN` / `[object Object]` leaks in rendered text or in any
  `aria-label` or `title`. The only `null` and `NaN` tokens the scanner found are
  inside fixture match text (`i.quantity != null`, `// reject NaN from the
  stepper`) and are correct.
- No header count disagrees with the rows beneath it. All six redesigns render
  `48 in 14 files` over exactly 48 rows in 14 groups.
- The result tree is unchanged from the first pass, because `search.files` is
  unchanged. Requirements 16-18, 27-29 re-verified as scored.

---

## 5. Question C — what is still blind, and why

Blind means: no version satisfies it even now. The **cause** column is the part
that changed in this pass.

| # | Requirement | Cause before | Cause now |
|---|---|---|---|
| 22 | Object/record identity + `/record` route | fixture | **design + spec** |
| 23 | no-silent-local-fallback statement | fixture | **design** |
| 26 | `Index build cancelled` | fixture | **design** |
| 2 | Detach grip + mandated tooltip | kit | kit (unchanged) |
| 21 | Results-tree keyboard nav | kit | kit (unchanged) |
| 7 | Real include/exclude glob **pair** | design | design (unchanged) |
| 12 | Re-anchor index (vA, vB only) | design | design (unchanged) |
| — | `paging.total = 132` never surfaced | design | design (unchanged) |

**#22 — object/record rows. Cause: design absence, with a live spec gap behind
it.** The fixture no longer blocks this: five rows with five distinct
`objectKind` values and routes are sitting in `search.records`. But
`research/search.md` section 10.6 records that F3-047 ships **no row spec** — no
field list, no badge vocabulary, no statement of how such a row differs from a
file match at 224px. The fixture comment at `_pm-data.js:266-273` says the same
thing and calls that unanswered question the point of the rows. So this is a
design gap that cannot be closed by picking a winner; it needs a row spec first.
It is the one blind spot where "fix the fixture" was the right first answer and
is now done.

**#23 — remote availability. Cause: design absence, and now an active
contradiction.** See BREAK 6. Nothing stands in the way of any version rendering
`S.remote.sentence` in region 5 and disabling Evict when `available` is false.
This is the cheapest high-value fix in the panel.

**#26 — cancelled build. Cause: design absence.** `index.lastBuild` supplies the
copy line, the detail, and the action. Three versions (vA, vB, vD) can turn
indexing off and none says what happens to a build in flight. vC's vocabulary map
is one key away from covering it.

**#2 and #21 remain kit-level.** `PMK.head` still has no grip slot; `PMK.row`
still emits only `tabindex="0" role="button"` with no roving focus, no Home/End,
no Escape-to-deselect and no type-ahead. Fix once in `_pm-kit.js`, not six times.
The enriched fixture changed nothing here and could not have.

**#7 remains design.** All seven ship the same five-item preset picker; vC alone
offers glob text entry, and as a single combined field rather than an
include/exclude pair. Unchanged.

**Paging remains invisible.** `search.paging` still says `shown: 48, total: 132`.
Verified by string search across all versions and widths: **no version renders
`132`**. Six print `48 in 14 files` as though that were the whole result set; vC
prints `1-48 of 48` at 480px, actively asserting completeness for a result set
missing 84 matches; vF's `Load more results` is the only affordance and is not
bound to the paging data.

### Two fixture defects found while driving the states

Reporting these because they will mislead the next author who tries to close #9.

1. **`index.state` is not a member of `index.states`.** The live value is `'ok'`
   (`_pm-data.js:208`); the vocabulary array is keyed `indexed, stale, unindexed,
   fallback, disabled, cancelled` (`:232-239`); and the inline comment on `:208`
   declares a third domain, `ok | stale | building | unindexed | fallback |
   disabled` — which contains `ok` and `building` (absent from `states`) and
   omits `cancelled` (present in `states`). Three vocabularies in one object, no
   two identical. This is directly responsible for BREAK 4: vC built its map from
   the `:208` comment, and the healthy token it maps (`ok`) is not the healthy
   token the array ships (`indexed`). A version cannot map `states[].id` to
   `index.state` today because the live value never appears in the array.
2. **`lastBuild` is older than the last build.** `lastBuild.at` is `'2d'` while
   `index.builtAt` is `'commit abc12ef, 4m ago'`. A cancelled build two days ago
   cannot be the *last* build when a successful one landed four minutes ago. Any
   version that renders `lastBuild` beside `builtAt` will print a contradiction
   through no fault of its own. Either rename the key (`lastCancelledBuild`) or
   move `at` forward of `builtAt`.

### Kit hazard, latent for this panel

`_pm-data.js:148-158` documents that `_pm-kit.js` keeps its own `GLYPH` and
`DASH` maps keyed to the original nine status tokens, so `K.statusMark('cancelled')`
returns a solid circle in the off tone — the same shape `queued` gets — collapsing
three of the four non-colour channels. No search version currently routes a
freshness state through `K.statusMark`, so this does not fire here today. It will
fire the moment anyone fixes #9 the obvious way. The two-line fix belongs in
`_pm-kit.js` and should land before, not after, the freshness work.

---

## 6. What this pass changes about the bakeoff's conclusions

- **The first audit's central excuse does not survive for requirement 9.** Three
  MUSTs were genuinely fixture-blocked and are now merely unbuilt. The fourth
  was never blocked, and testing it dropped two of the three joint leaders.
- **The three-way tie broke.** vA and vC now lead at 73 percent, vB falls to 71
  percent. The separation is entirely about state handling, which is the axis the
  first pass could not measure.
- **vB's headline strength was its weakest point.** It won requirement 8 for the
  cleanest one-line freshness strip in the field; that strip is the single
  surface in the bakeoff that renders a flat falsehood at the panel's minimum
  width. A design that is right about *where* the state goes and wrong about
  *what it says* is not ahead of one that puts the raw enum in the right place.
- **`=== 'ok'` is the bakeoff's shared bug.** vB:455, vE:696 and vD:639 all
  branch on the single fixture value instead of on the vocabulary; vF does not
  branch at all. Only vC and vA are safe, and only vA by refusing to interpret.
  Whatever wins, the freshness surface should be built once from
  `index.states[]`, not six times from a literal.
- **Coverage is still a ceiling, not a floor.** Every score credits an affordance
  that exists and has somewhere to live. None of these menus dispatch anything.
