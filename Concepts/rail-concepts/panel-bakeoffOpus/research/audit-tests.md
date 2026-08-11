# Feature-completeness RE-AUDIT — Testing panel (`tests`)

**This supersedes the first pass.** Same requirement checklist, re-scored against
the enriched `_pm-data.js`. Source of requirements: `research/tests.md`. Source
of evidence: the panel function in each version under `versions/`, **rendered**
— headlessly for all seven at 240/320/400/520, and in the browser at
`http://127.0.0.1:47821` (identity-checked: harness `puppet-master-panel-bakeoff`,
root `Concepts/panel-bakeoff`, `dataSha1 169fa176b09e`).

Implementing versions are unchanged: `v0-baseline` (control), `vA-ledger`,
`vB-gutter-sheet`, `vC-lens-deck`, `vD-drill-stack`, `vE-cockpit`, `vF-stream`.
The three `x-*` variant files still register no `tests` panel.

---

## 0. What is actually new in the fixture, and why it matters

The variety layer for `tests` arrived in three forms. Only one of them is
visible to a version that was written before it existed.

**New keys and fields — invisible until read. Read by nobody.** A static scan of
all seven version files returns **zero** references to `specStatus`,
`runPreconditions`, `redactionStates`, `redactionFailed`, `redaction.state`,
`redactionState`, `allowedActionIds`, `receiptRetained`, `cancelledBy`, or
`paging.runs`. Every one of these was added to answer a first-pass finding, and
every one is still unread. That is kit rule 8 working as designed — but it means
**question A has a thin answer: essentially no requirement moved from absent to
present**, because nothing new was rendered.

**New rows — visible to everyone.** `tests.runs` went from 14 to 16. The two
additions are the states that did not exist anywhere:

| id | name | status | specStatus | when |
|---|---|---|---|---|
| 217 | `cargo test - import worker suite, retry sweep` | `cancelled` | `cancelled` | 6h |
| 216 | `playwright - import wizard end to end` | `inconclusive` | `inconclusive` | 8h |

Both are **appended**, so `runs[0..13]` keep their indices — and so the list is
no longer sorted. Run 217 (6h old) and 216 (8h old) render *below* run 201
(5d old) in every version.

**An extended shared vocabulary.** `_pm-data.js` grew from 9 status tokens to
11, adding `cancelled` (glyph `slash`, rail `dashed`, tone `off`) and
`inconclusive` (glyph `info`, rail `dotted`, tone `idle`). The fixture's own
comment flags that `_pm-kit.js:74-78` keeps a private copy of the glyph and dash
maps keyed to the original nine tokens. That prediction is confirmed below, in the
browser, and it is the single most damaging thing this pass found.

Unchanged, and therefore still unexercised: `tests.runtime.enabled` is still
`true` (R8), `tests.failures` is still 9 entries (R35), and there is still no
`host_profile_id`, `coverageLevel`, `browser_sessions` or dev-preview data
anywhere in the file (R38-R42).

---

## 1. Requirement checklist

**MUST** = the brief cites a Plans requirement. **SHOULD** = the brief
recommends it as necessary for the panel to be usable. Excluded per the original
instruction, because `research/tests.md` §9 marks them as spec gaps: the
`failure_refs[]` entry shape, the `test_run_list` projection contract, the
proposed `redaction_pending` token, and the proposed `cmd.testing.rerun_failed`.

### MUST (25)

| # | Requirement | Plans citation |
|---|---|---|
| R1 | Region `run_list` — reverse-chronological `TestRunReceipt` rows, selection driver for regions 2-4 | `Automated_Testing_System.md:L2231-L2237` |
| R2 | Region `active_run_detail` — status, counts, adapter, target, timing for the selected receipt | `Automated_Testing_System.md:L2231-L2237` |
| R3 | Region `failure_list` — `failure_refs[]` entries for the selected run | `Automated_Testing_System.md:L2231-L2237` |
| R4 | Region `artifact_preview` — `log_artifact_refs[]` + `visual_artifact_refs[]`, post-redaction only | `Automated_Testing_System.md:L2231-L2237` |
| R5 | Region `redaction_notice` renders ABOVE the preview, not below — it is a gate | `Automated_Testing_System.md:L2231-L2237`, `L83-L98` |
| R6 | Region 0 `capability_header` — effective capability projection; sole host of the runtime-disabled reason | `Automated_Testing_System.md:L83-L98` |
| R7 | Visible-session / visibility projection surfaced with its value (`show_when_possible`) | `Automated_Testing_System.md:L83-L98`, `L648-L726` |
| R8 | Runtime-disabled panel state replaces the body with one reason line + one action; never an empty run list | `Automated_Testing_System.md:L2239-L2245`; brief §7.1 |
| R9 | Enablement is per adapter/family, not one global boolean; each family carries its own state and reason | `Automated_Testing_System.md:L2239-L2245` |
| R10 | Run status vocabulary verbatim: `queued`, `running`, `passed`, `failed`, `cancelled`, `blocked`, `inconclusive` | `Automated_Testing_System.md:L2221-L2229` |
| R11 | `blocked` and `inconclusive` never collapse into a red failed chip; `blocked` routes to authority, `inconclusive` to the receipt; a `blocked` receipt shows its blocker payload | brief §5, §6; `FinalGUISpec.md:L3984-L4005` |
| R12 | Capability projections `Auto / On / Off` plus `unavailable`, `blocked-needs-authority`, `prohibited-by-policy`, each with a reason label | `Automated_Testing_System.md:L83-L98`, ATS-008 `L581-L646` |
| R13 | An `Off` family never renders as a green pass | `Automated_Testing_System.md:L83-L98` |
| R14 | Button enablement derives from `TestRunReceipt.status`: Watch/Cancel for `queued\|running`, Open receipt for terminal | `Automated_Testing_System.md:L2231-L2237` |
| R15 | Export bundle enabled only when artifact refs are non-empty; egress -> confirm + redaction attestation | `Automated_Testing_System.md:L2231-L2237`; `UI_Command_Catalog.md:L8298-L8313` |
| R16 | Run precondition set surfaced on the Run control (`adapter_configured && capability_probe_available && permission_snapshot_current && fixtures_present`) | `UI_Command_Catalog.md:L8298-L8313` |
| R17 | `cmd.testing.run` trigger present | `UI_Command_Catalog.md:L8298-L8313` |
| R18 | `cmd.testing.watch_run` on run row / detail | idem |
| R19 | `cmd.testing.cancel_run` on detail — destructive-adjacent, needs confirm | idem |
| R20 | `cmd.testing.open_receipt` on detail + run-row context menu | idem |
| R21 | `cmd.testing.open_failure` on `failure_list` row | idem |
| R22 | `cmd.testing.export_bundle` in detail overflow | idem |
| R23 | `cmd.testing.session.redaction.inspect` reachable from the `redaction_notice` action | idem |
| R27 | `redaction_failed` blocks display: preview suppressed, notice occupies the region with the blocking reason + authorize route | `Automated_Testing_System.md:L83-L98` (direct quote), ATS-009 `L648-L726` |
| R28 | The notice is not dismissible while `redaction_failed` holds; no optimistic / blurred-then-sharpened render | `Automated_Testing_System.md:L83-L98`; brief §6.2-6.3 |

### SHOULD (17)

| # | Requirement | Source |
|---|---|---|
| R24 | `cmd.testing.capability_policy.set` — `Auto/On/Off` control on the family row | `UI_Command_Catalog.md:L7970-L7982`; brief §9 |
| R25 | `cmd.testing.visibility_policy.set` on the header visibility chip | `UI_Command_Catalog.md:L7970-L7982` |
| R26 | Visible-session controls: `session.open`, `session.watch`, `session.background` | brief §4, P2 |
| R29 | Reserve the preview region's height so an async redaction notice cannot push `failure_list` off-screen mid-read | brief §8.3 |
| R30 | Middle-elide `target_ref`, never head-truncate — the discriminating token is the trailing segment | brief §5, §8.2 |
| R31 | Full `target_ref` reachable (tooltip at desktop, long-press sheet elsewhere) | brief §8.2 |
| R32 | `test_run_id` present but never the primary label — tooltip/receipt only | brief §5 |
| R33 | Failure row shows the test name only; assertion text on expand | brief §5 |
| R34 | Artifact row = kind icon + short label; the ref is tooltip-only | brief §5 |
| R35 | `failure_list` empty state when `failed_count == 0` | brief §1, region 3 |
| R36 | At 240px `active_run_detail` shows a contextual button PAIR, never four | brief §7.4 |
| R37 | Regions 3-5 collapse to summary rows that expand in place | brief §8.1 |
| R38 | P2 depth: per-family global-vs-project inheritance table | `Automated_Testing_System.md:L83-L98` |
| R39 | P2 depth: containerized-host fields (`host_profile_id`, `host_instance_ref`, port/access URL refs, preflight/launch/cleanup receipt refs) | `Automated_Testing_System.md:L1534-L1622` |
| R40 | P2 depth: TestStrategy `coverageLevel` + `requiredCapabilityRefs` | `Plans/test_strategy.schema.json` |
| R41 | P2 depth: GUI-automation manifest drill-down (`browser_sessions`, `timeline_path`, `checks_path`) | `Plans/gui_automation_manifest.schema.json` |
| R42 | P2 depth: dev-preview / smoke-test controls, absent in production builds unless explicitly configured | `Automated_Testing_System.md:L104-L164`, ATS-023 |

---

## 2. Matrix — before / after

`yes` / `part` / `no`. A cell written `yes -> part` changed in this pass; a plain
cell did not. A feature reachable only through an overflow menu scores `yes`.

### MUST

| # | Requirement | v0 | vA | vB | vC | vD | vE | vF |
|---|---|---|---|---|---|---|---|---|
| R1 | `run_list` reverse-chronological | no | yes -> **part** | yes -> **part** | yes -> **part** | yes -> **part** | yes -> **part** | part |
| R2 | `active_run_detail` | part | yes | part | yes | yes | yes | part |
| R3 | `failure_list` | no | yes | yes | yes | yes | yes | part |
| R4 | `artifact_preview` | no | yes | yes | yes | yes | yes | part |
| R5 | `redaction_notice` above preview | no | yes | part | yes | yes | yes | yes |
| R6 | `capability_header` | part | part | part | yes | part | part | part |
| R7 | visibility value surfaced | yes | yes | no | yes | yes | no | yes |
| R8 | runtime-disabled body replacement | no | no | no | no | part | yes | no |
| R9 | per-family enablement + reason | no | yes | yes | yes | yes | yes | part |
| R10 | exact status vocabulary | no | part | part | part -> **no** | part | part | part |
| R11 | blocked / inconclusive not collapsed | no | part | part | part | part | part | part |
| R12 | Auto/On/Off + 3 projections | no | yes | yes | yes | yes | part | part |
| R13 | Off never green | no | yes | yes | yes | yes | yes | part |
| R14 | button enablement from status | no | yes | no | yes | part | yes | yes |
| R15 | export gated + egress attestation | no | part | part | part | part | part | part |
| R16 | Run precondition set surfaced | no | no | no | no | part -> **no** | no | no |
| R17 | `cmd.testing.run` | yes | yes | yes | yes | yes | yes | yes |
| R18 | `cmd.testing.watch_run` | no | yes | yes | yes | yes | yes | yes |
| R19 | `cmd.testing.cancel_run` + confirm | no | part | part | part | part | part | part |
| R20 | `cmd.testing.open_receipt` | no | yes | yes | yes | yes | yes | yes |
| R21 | `cmd.testing.open_failure` | no | yes | yes | yes | yes | yes | yes |
| R22 | `cmd.testing.export_bundle` | no | yes | yes | yes | yes | yes | yes |
| R23 | `session.redaction.inspect` from notice | no | yes | part | yes | yes | yes | yes |
| R27 | `redaction_failed` suppresses preview | no | no | no | no | no | no | no |
| R28 | notice not dismissible, no optimistic render | no | no | no | no | part | no | no |

### SHOULD

| # | Requirement | v0 | vA | vB | vC | vD | vE | vF |
|---|---|---|---|---|---|---|---|---|
| R24 | `capability_policy.set` control | no | yes | yes | yes | yes | part | part |
| R25 | `visibility_policy.set` control | no | part | part | part | part | part | yes |
| R26 | session open/watch/background | no | part | no | no | no | no | no |
| R29 | preview height reserved | no | no | no | part | yes | no | yes |
| R30 | middle-elide `target_ref` | no | no | no | no | no | no | no |
| R31 | full `target_ref` reachable | no | no | no | yes | no | no | no |
| R32 | run id never the primary label | no | yes | no | yes | yes -> **part** | yes -> **part** | no |
| R33 | failure name only, assertion on expand | no | yes | yes | yes | yes | yes | yes |
| R34 | artifact kind icon + short label | no | part | part | part | part | yes | no |
| R35 | `failure_list` empty state | no | no | no | no | no | no | no |
| R36 | 240px contextual button pair | part | yes | no | yes | yes | yes | part |
| R37 | regions 3-5 collapse, one expanded | no | no | part | yes | yes | part | part |
| R38-R42 | P2 depth tier | no | no | no | no | no | no | no |

### MUST coverage, before -> after (partial counts as half, of 25)

| Version | Before | After | Delta | Why it moved |
|---|---|---|---|---|
| vD-drill-stack | 19.5 / **78%** | 18.5 / **74%** | -4 pts | R1 ordering; R16 downgraded — it reads one of five preconditions and gets the answer wrong |
| vC-lens-deck | 19.0 / **76%** | 18.0 / **72%** | -4 pts | R1 ordering; R10 downgraded — it clips `inconclusive` to `inconclu…` |
| vA-ledger | 18.5 / **74%** | 18.0 / **72%** | -2 pts | R1 ordering only |
| vE-cockpit | 18.0 / **72%** | 17.5 / **70%** | -2 pts | R1 ordering only |
| vF-stream | 15.0 / **60%** | 15.0 / **60%** | 0 | already `part` on R1 |
| vB-gutter-sheet | 15.0 / **60%** | 14.5 / **58%** | -2 pts | R1 ordering only |
| v0-baseline (control) | 3.0 / **12%** | 3.0 / **12%** | 0 | renders no run list at all, so nothing new can reach it |

**The control's score is unchanged, which is the point of including it.** Every
movement above is a real interaction between a design and a state it had never
been shown. None of it is measurement drift.

---

## 3. WHAT BROKE

Ordered by damage. Each item names the version, the state, and what renders
instead.

### B1. `cancelled` and `inconclusive` render as the same empty grey circle — in every version that draws a run list

**State:** run 217 (`cancelled`) and run 216 (`inconclusive`).
**Versions:** vA, vB, vC, vD, vE, vF — all six.

`_pm-data.js` declares `cancelled` with glyph `slash` and rail `dashed`, and
`inconclusive` with glyph `info` and rail `dotted`. `_pm-kit.js:74-78` keeps its
own `GLYPH` and `DASH` maps keyed to the original nine tokens, and
`K.statusMark` (`_pm-kit.js:83-92`) reads those, not the data:

```
K.icon(GLYPH[token] || 'circle', 14, ...)      // GLYPH.cancelled is undefined
var dash = DASH[token] ? ' pmk-rail--' + DASH[token] : '';   // DASH.cancelled too
```

Measured live in the browser (vC, basic-dark, 380px), computed styles:

| status | glyph shape emitted | glyph colour | rail |
|---|---|---|---|
| Cancelled | `<circle r="8">` | `rgb(127,134,148)` | solid, `rgb(66,66,66)` |
| Inconclusive | `<circle r="8">` | `rgb(127,134,148)` | solid, `rgb(127,134,148)` |
| Queued (unexercised) | `<circle r="8">` | `rgb(127,134,148)` | solid, `rgb(127,134,148)` |
| Blocked | `<rect>` bar | `rgb(255,183,77)` | dashed |
| Failed | `<line><line>` X | `rgb(239,83,80)` | solid |
| Stale | circle + clock hands | `rgb(127,134,148)` | dotted |
| Prohibited | circle + slash | `rgb(239,83,80)` | dotted |

`inconclusive` is byte-identical to `queued` on **all four** non-colour channels
except the accessible label — glyph shape, rail dash, rail colour and glyph
colour all match. `FinalGUISpec.md:1237` requires any two of the four to
distinguish. One survives. `cancelled` differs from `inconclusive` only in the
rail's background grey (`#424242` vs `#7F8694`), which is not a channel.

These are precisely the two statuses `research/tests.md` §5 says "must not
collapse". Every other status in the panel has a distinct silhouette. The two
new ones are the only pair that does not.

Fix is two lines in `_pm-kit.js` (`GLYPH.cancelled = 'slash'`,
`GLYPH.inconclusive = 'info'`, and the matching `DASH` entries) or, better, one
line in `statusMark` to read `K.statusOf(token).glyph` and `.rail` — the
documented contract the four-channel comment already promises. No version can
fix this alone.

### B2. The run list is no longer reverse-chronological, and no version notices

**State:** runs 217 (6h) and 216 (8h) appended after run 201 (5d).
**Versions:** vA, vB, vC, vE, vF render the full list in raw array order; vD does
the same inside its `run_list` drill level.

Rendered `when` sequence, identical in all of them:

```
4m  2h  5h  1d  1d  1d  2d  2d  2d  3d  3d  4d  4d  5d  6h  8h
                                                    ^^^^^^^^ out of order
```

R1 says the region is reverse-chronological. Every version treats `T.runs` as a
pre-sorted projection and maps over it. The result is that the two most recent
terminal runs in the fixture are rendered at the very bottom of a 16-row list,
below runs five days older, and a user scanning "what happened recently" will
never see them. Confirmed visually in the browser — the last two rows on screen
read `217 ... 6h` and `216 ... 8h` directly under `201 ... 5d`.

This is a shared-cause finding, not a per-design one, which is why the R1
downgrade is uniform. `research/tests.md` §9 notes there is no `test_run_list`
projection contract; that gap is now load-bearing.

### B3. Every version's redaction notice asserts a clean redaction over a run whose redaction failed

**State:** run 209 carries `redactionState: 'redaction_failed'`; `T.redactionFailed`
carries the full payload (`reason: redaction_profile_unavailable`, 2 of 6 fields
failed, profile `redact-default-v3`, `blocks: ['artifact_preview']`,
`dismissible: false`, an `authorize` action and three `allowedActionIds`).
**Versions:** all six.

Rendered, in every one of them, unconditionally: **"4 fields redacted before
display"** — plus the complete 11-row artifact list including
`playwright-trace.zip` and `import-worker-stdout-retry-2.log`, the two artifacts
`redactionFailed.affectedArtifacts` names as unredacted. Confirmed in the live
DOM: the only redaction string present anywhere in the vE panel is the clean
note.

This is worse than the first pass recorded. Previously R27 was scored `no`
because the failure state did not exist, so the panel merely *lacked* a failure
path. It now *affirmatively states* that redaction succeeded, on data that says
it did not, above a preview of the artifacts that were not masked. That is the
"silently downgrade evidence quality" outcome `Automated_Testing_System.md:L83-L98`
names by that exact phrase.

**The cause has changed from fixture to design.** The first pass wrote that R27
"is partly a fixture problem ... which means the fit checker could never have
caught it". The fixture is fixed. Nothing else moved.

### B4. Run is enabled while the precondition set says it is illegal — all six

**State:** `runPreconditions[3]` is `no_run_in_flight`, `met: false`, sentence
"Run 214 is still running. Cancel it or wait before starting another."
**Versions:** all six.

Every Run control renders as `pmk-btn pmk-btn--primary` with no `disabled`
attribute and no precondition text:

- vA — `data-pm-tip="Run cargo test for this project"` (an adapter description)
- vB — `data-pm-tip="Run the configured adapter"`
- vC, vD — no tip at all
- vF — `Run tests` menu item, unconditional
- vE — has no Run button anywhere (pre-existing)

vD is the special case and the reason its R16 drops from `part` to `no`: it is
the only version that gates Run on a precondition at all
(`disabled: !T.runtime.enabled`, `vD-drill-stack.js:1610`). `runtime.enabled` is
`true`, so vD reads one of the five gates, gets `true`, and renders an enabled
button — a confidently wrong answer where the others give no answer. Reading one
gate out of five is worse than reading none, because it looks derived.

### B5. vD-drill-stack at 240px renders four identical run rows, one of them the cancelled run

**State:** runs 214, 213, 205 and 217 all begin `cargo test - import worker suite`.
**Version:** vD-drill-stack, `run_list` level, bucket 0.

vD's `run_list` rows drop both the `meta` (run id) and the `tail` (relative time)
at 240px, leaving only the head-truncated identity. Measured on the rendered
markup — `pmk-meta-seg` absent, `pmk-tail` absent — the sixteen rows collapse to:

```
x4  "cargo test - import worker…"     <- runs 214, 213, 205, 217
x2  "vitest - web components"
x2  "playwright - import wizard…"
```

Four rows with no id, no time, and a status mark that (per B1) is a plain circle
for 217. There were three colliding rows before; run 217 makes four, and it is
the one whose outcome differs most from its neighbours. vE-cockpit has the same
collision count at 240px for the same reason — its rows carry only
`pmk-mark` + `pmk-id`, no id and no time — which is why R32 drops to `part` for
both: the run id is not merely "not primary", it is absent at the width where it
is the only disambiguator. vA is unaffected: it keeps `run 217` on line two.

This is R30 (head-truncation instead of middle-elision) finally producing a
concrete failure rather than a theoretical one.

### B6. vC-lens-deck clips `inconclusive` to `inconclu…`

**State:** run 216.
**Version:** vC-lens-deck.

vC renders the status word into a fixed `flex: 0 0 62px` column. The full column
series at 400px:

```
running failed ok ok failed attention ok ok attention stale blocked
prohibit… failed ok cancelled inconclu…
```

`inconclusive` is the longest token in the mandated vocabulary and it is the one
that does not fit. `research/tests.md` §5 says the vocabulary is "exact, do not
paraphrase"; a clipped token is neither exact nor a paraphrase. `prohibit…` was
already clipping before this pass (`prohibited` is not one of the seven spec
tokens, so it cost nothing), but the same fixed column now truncates a spec
token, which is why R10 drops to `no` for vC. vC is otherwise the strongest
version on status handling — it is the only one that renders the status word as
its own column at all.

### B7. vB-gutter-sheet offers Cancel on a cancelled run and Watch on an inconclusive one

**State:** runs 217 and 216, both terminal.
**Version:** vB-gutter-sheet.

Extracted from the rendered menu templates, every run row in vB — for every
status, including the two new terminal ones — carries the identical four items
with no `data-disabled` and no `data-reason`:

```
Watch run [on]   Open receipt [on]   Export bundle [on]   Cancel run [on]
```

Compare vA / vC / vF on the same rows:

```
Watch [OFF: run_status_queued_or_running]  Cancel [OFF: ...]  Open receipt [on]  Export bundle [on]
```

R14 was already `no` for vB, so the score does not move — but the failure is now
demonstrable rather than inferred. "Cancel run" on a run that is already
`cancelled` is the specific nonsense the requirement exists to prevent, and
`research/tests.md` §4 notes `cancel_run` "deletes no receipts", so the offered
action is not even a no-op.

**Credit where it is due, and this is question A's real answer:** vA, vC, vE and
vF all gate correctly on `cancelled` and `inconclusive` **without a line of new
code**, because they derived enablement from a terminal/non-terminal predicate
rather than enumerating statuses. Two states their authors never saw, handled
correctly on first contact. That is the one place where the enriched fixture
confirmed a design was already right rather than exposing that it was wrong.

### B8. vD-drill-stack offers "Re-run" as the only forward action on a blocked run

**State:** run 204, `status: blocked`, `reason: testing_needs_authority`,
`allowedActionIds: ['testing.request_authority', 'testing.open_policy']`.
**Version:** vD-drill-stack, drilled to the run object.

Rendered:

```
playwright - import wizard end to end   blocked
Adapter  cargo test
Run      204
When     3d ago
Status   Blocked
[Open receipt] [Export] [Re-run]
```

The blocker payload the fixture now supplies — reason code, sentence, allowed
action ids — appears nowhere, and the action bar offers `Re-run`, which is not
in `allowedActionIds` and which the authority gate would reject. vD renders the
correct *word* and the correct *label* for the state and then offers the wrong
*actions* for it. The other five versions show the same absence more honestly:
they offer the generic Watch/Cancel/Receipt/Export set and make no claim.

No version renders `testing.request_authority` for a blocked run. Four of them
do exactly this correctly for a blocked capability *family* — vA even varies the
action by projection — so the machinery exists and is simply not applied to run
receipts. This was finding 4 in the first pass; the fixture now proves it rather
than predicting it.

### B9. vF-stream's group picker gains a second option with a colliding label

**State:** run 217's name shares its first 25 characters with runs 214/213/205.
**Version:** vF-stream.

The adapter/target picker at 240px now renders 13 options, two pairs of which
elide to the same string:

```
cargo test - import worke…  3     <- the three "import worker suite" runs
cargo test - full workspa…  1
...
cargo test - import worke…  1     <- run 217, "retry sweep"
```

The `full workspa…` collision was pre-existing. The `import worke…` pair is new,
and the two entries are distinguishable only by their trailing count. Selecting
the wrong one is a silent mis-filter.

### B10. Pre-existing, NOT a regression: `active_run_detail` says 1 failure and `failure_list` shows 9

Present in all six and in the first-pass fixture too, so it is a control-line
item rather than something this pass broke. `T.active` reports
`failed: 1` while `T.failures` has nine entries, and every version renders the
counts strip and the failure list side by side without reconciling them. vF makes
it most visible by stamping all nine failures with the active run's `4m`
timestamp directly beneath its `1 failed` pin line. R3 requires `failure_list` to
hold "`failure_refs[]` entries **for the selected run**"; nothing in the field
scopes them. Noted here so it is not mistaken for new damage, and because
selecting run 216 or 217 does not change the failure list in any version.

---

## 4. Still blind

Requirements no version satisfies even now, with the cause reclassified.

### Cause is now DESIGN — the fixture answered these and nobody read them

1. **R27 — `redaction_failed` never suppresses the preview.** `no` in all seven.
   `T.redactionFailed` and `T.redactionStates` supply the complete three-state
   vocabulary, the blocking reason, the authorize route, the affected run and
   the affected artifacts. Zero references in any version. See B3.
2. **R16 — the Run precondition set.** `runPreconditions` supplies five gates and
   the failing one's sentence. Zero references. See B4.
3. **R11's blocker-payload and authority-route clauses.** `reason`, `sentence`
   and `allowedActionIds` now sit on runs 204 and 216, and `cancelledBy` /
   `receiptRetained` / `detail` on 217. Zero references. The "never collapse into
   a red chip" clause, by contrast, now **holds in all six** — no version tints
   `cancelled`, `blocked` or `inconclusive` red. R11 stays `part` because two of
   its four clauses are met and two are not.
4. **R10's `passed` token.** Every row carries `specStatus`, which spells the
   exact spec word. No version reads it, so `passed` still renders as `ok`. The
   other six tokens are now correct in vA, vB and vF, correct-but-clipped in vC,
   and rendered only at object level in vD. **vE renders no status word on run
   rows at all** — its `run_list` carries the mark and the identity and nothing
   else, so the vocabulary reaches the screen only as an accessible label.
5. **R15 / R19 — the confirm gate. Correction to the first pass.** The first
   audit stated that "there is no confirmation affordance in the kit at all" and
   that grepping for `confirm` "returns nothing". **That was wrong.**
   `_pm-components.js:498` defines `PM.confirm`, a real modal sheet with a scrim,
   `role="dialog"`, `aria-modal`, focus capture and no auto-close, documented at
   `_pm-components.js:9` as "replaces confirm()". Zero versions call it. So the
   cause for R15/R19 is not a missing affordance class — it is a wired-up
   component that six designs did not reach for. That reclassifies the cheapest
   remaining fix in the report.

### Cause is still FIXTURE — the state does not exist to render

6. **R8 — runtime-disabled body replacement.** `tests.runtime.enabled` is still
   `true` and there is still no per-adapter disabled family. Only vE has the code
   path (`vE-cockpit.js:1217-1224`), and it remains unexercised. The enrichment
   pass added disabled/degraded runtime states to `docker` but not to `tests`.
7. **R35 — `failure_list` empty state.** Still nine failures, still no
   `failed_count == 0` case. Every version would render a header reading
   `Failures 0` over nothing.
8. **R38-R42 — the entire P2 depth tier.** `host_profile_id`,
   `host_instance_ref`, `coverageLevel`, `requiredCapabilityRefs`,
   `browser_sessions`, `timeline_path`, `checks_path` and any dev-preview or
   smoke-test flag all return **0 occurrences** in `_pm-data.js`. Unchanged from
   the first pass. No version could render them.
9. **R26 — visible-session controls.** `session.open` / `.watch` / `.background`
   still have no data behind them; `policy.visibility` is a bare string. vA's
   `Visible session controls` overflow item remains a route to nothing.

### Cause is KIT

10. **B1's glyph and dash collapse.** `_pm-kit.js:74-78`. Six designs inherit it
    identically; none can fix it from inside a version file.
11. **R30 — head-truncation of `target_ref`.** Unchanged and now consequential
    (B5). `PMK.elide`'s `path` branch needs two `/` separators
    (`_pm-kit.js:105-111`); no run name has any, so every version falls through
    to a tail cut. Run 217's name makes this produce four identical rows in vD
    and vE at 240px. Still a one-line `idKind: 'ref'` change per version.
12. **`paging.runs.total` is unread.** The fixture states `shown: 16, total: 208`.
    vA, vB and vF render a `Load older` affordance; none can say "16 of 208",
    because none reads the block.

---

## 5. Recommended follow-up, in cost order

1. Two lines in `_pm-kit.js`: add `cancelled`/`inconclusive` to `GLYPH` and
   `DASH`, or switch `statusMark` to read `K.statusOf(token).glyph` / `.rail`.
   Fixes B1 for all six versions at once.
2. Sort `run_list` by recency, or add the `test_run_list` ordering contract to
   the fixture and cite it. Fixes B2 for all six.
3. `idKind: 'ref'` on run rows in all six. Fixes B5 and R30.
4. Point one version's `redaction_notice` at `T.redactionFailed` and gate
   `artifact_preview` on `redactionStates[n].preview !== 'render'`. R27 is the
   highest-value unmet MUST and the data is now sitting there unused.
5. Wire `PM.confirm` to `cancel_run` and `export_bundle` in one version to
   demonstrate R15/R19. The component already exists.
6. Add a runtime-disabled adapter and a zero-failure run to `tests` in
   `_pm-data.js` so R8 and R35 stop being unmeasurable.
