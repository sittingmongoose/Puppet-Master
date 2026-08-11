# Feature-completeness audit — consolidated (pass 2, adversarial fixture)

Seven per-panel audits, one question: **if you pick design X for panel Y, what
are you not getting?**

Pass 1 asked that against a fixture of nominal rows — healthy, titled, current,
one state per field. Pass 2 asks it again after `_pm-data.js` was extended with
state variety: title-less artifacts, cancelled and inconclusive runs, reserved
and orphaned and released worktrees, unresolvable registry entries, a failed
redaction, an archived repository, an expired media URL, a degraded auth
provider, five host rows, and blocked rows carrying their own
`allowedActionIds[]`.

**The pass exists to test a hypothesis, and the hypothesis lost.** Pass 1
attributed most absences to the fixture: under kit rule 8 ("all content from
`_pm-data.js`") a version that rendered nothing was obeying the rules, and might
be hiding latent capability. The fixture now carries the states. Across seven
panels, **four requirements moved up and roughly forty designs-times-states
moved down.** The thin data was not only hiding absence. It was holding up code
that cannot survive variety.

**Headline.** No version of any panel exceeds 82% of its MUST requirements
(pass 1's ceiling was 90%). Every panel's leader lost ground or held; only
Agents and Docker gained anywhere. One design stopped rendering entirely. The
spread between finalists is still usually smaller than the block of requirements
**none** of them meets — but the character of the failures changed: pass 1 found
omissions, pass 2 found **assertions that are false**.

Sources: `research/audit-search.md`, `audit-source.md`, `audit-git.md`,
`audit-docker.md`, `audit-tests.md`, `audit-agents.md`, `audit-artifacts.md`.

**Layout is not the issue.** The fit sweep was re-run against the enriched
fixture on the identity-checked server (`/__whoami` = `puppet-master-panel-bakeoff`,
`dataSha1 169fa176b09e`): 3,584 combinations, all 16 versions registered, zero
page errors. **All fifteen redesigns are at zero R-tier, `xA3` now included** —
re-measured twice more in the second verification pass, with the two settled runs
agreeing on every one of the 3,584 combinations. The `xA3` overflow reported
below (once 104 findings, a number that is now historical) was never xA3's to fix
and has been closed at the kit level — `_pm-motion.css:252` now pins
`.pmm-expand` with `grid-template-columns: minmax(0, 1fr)` and `:255` gives its
children `min-width:0`, exactly the one-line fix BROKE-20 identified. The new
states did not break layout. They broke meaning, which the fit checker cannot
see — and that gap is the whole argument for this document.

Two corrections to how that number was reported. **The control now measures 2,544
R-tier, not 2,576**, and the cause is not established: `v0-baseline` reads no
fixture data and uses no `pmk-` or `pmm-` class, so neither the kit CSS nor the
motion fix should be able to reach it. The 32-finding delta is recorded here
unexplained rather than rationalised; it does not affect any verdict, because the
control is still overwhelmingly red and every redesign is still zero. **And "two
agreeing runs" overstated the harness**: the first sweep after a page load
disagrees with the second, and every differing combination is in `retro-dark` or
`retro-light`. The cause is the sweep's own warm-up, which paints one throwaway
stage per theme using only `registry[0]` and `panels[0]`
(`_pm-fitcheck.js:376`), so a retro face that the first panel never paints is
still unapplied when the first real pass measures it. **The first sweep after a
page load is not trustworthy for the retro themes; the second is.** Numbers in
this document are the settled ones.

The size of that cold-start drift is not itself stable, which is worth recording
rather than smoothing over. It was 102 combinations (51 per retro theme) when
first measured; the independent re-run below measures **84 (42 per retro theme)**
on the same 3,584-combination sweep. The shape is identical — retro-only,
first-run-only — and the settled runs agree exactly in both measurements, so the
conclusion is unchanged. The magnitude is a property of paint timing, not of the
designs, and should not be quoted as a fixed number.

**Third measurement (verification pass 3, after the seven-file parallel fix
pass), on a NEW server port so the origin had no cache entries at all.** Identity
re-checked (`/__whoami` = `puppet-master-panel-bakeoff`, root
`Concepts/panel-bakeoff`, `dataSha1 169fa176b09e`). Three back-to-back sweeps,
3,584 combinations each, 16 versions on every axis
(`v0,vA,vB,vC,vD,vE,vF,xD1,xD2,xD3,xS1,xS2,xS3,xA1,xA2,xA3`):

| run | R-tier (fail) | W-tier (warn) | agrees with previous |
|---|---:|---:|---|
| 1 (cold) | 2,584 | 3,017 | — |
| 2 (settled) | 2,576 | 2,651 | 84 combinations differ from run 1, **all** retro-dark/retro-light |
| 3 (settled) | 2,576 | 2,651 | **identical to run 2 on all 3,584 combinations** |

**Every one of the fifteen redesigns is at zero R-tier; all 2,576 belong to
`v0`.** Rule split on the settled runs: `R4` 2,480, `R1` 56, `R3` 40, `W1` 1,748,
`W2` 903.

Two corrections this measurement forces on the paragraph above. **The control
reads 2,576, not 2,544** — the 2,544 figure does not reproduce on a clean origin
in any of five sweeps, so the "32-finding delta, cause not established" note
should be treated as an artefact of that one session rather than a property of
the control. **The cold-start drift reproduces exactly at 84** (42 per retro
theme), which is now two independent measurements agreeing, against the 102 of
the first — so 84 is the better number to quote, while the caveat that the
magnitude is paint-timing and not a constant still stands.

**Two further sweeps were run after driving every stateful version into its new
state** — vC and xD2 on the Hosts subview, vD inside the `Docker / Hosts` drill,
xD3 scoped to Hosts, xD1 with its hosts section expanded — because those bodies
are new in this fix pass and the sweep above never measured them. Both runs:
2,576 R-tier, all `v0`, **zero R-tier for every redesign**, identical to each
other on all 3,584 combinations. Warn moves 2,651 -> 2,607, which is simply
different content being measured. **The hosts bodies added in this pass carry no
R-tier cost.**

**Fourth measurement (independent verification after the nine-file
remediation).** New server port again (`49137`), identity re-checked
(`puppet-master-panel-bakeoff`, root `Concepts/panel-bakeoff`, `dataSha1
169fa176b09e`), `fontsReady()` reporting `ok:true, probed:6, cssReady:true`
before each run. Sixteen versions registered on every axis. Five sweeps across
two page loads:

| run | page load | R-tier (fail) | W-tier (warn) | agrees with previous |
|---|---|---:|---:|---|
| 1 | first | 2,584 | 3,050 | — |
| 2 | first | 2,576 | 2,682 | 112 combinations differ from run 1, **all** retro-dark/retro-light |
| 3 | first | 2,576 | 2,682 | **identical to run 2 on all 3,584 combinations** |
| 4 | second (reload) | 2,584 | 3,050 | reproduces run 1 exactly |
| 5 | second (reload) | 2,576 | 2,682 | reproduces runs 2-3 exactly |

**Every redesign measures zero R-tier in all five runs; all 2,576 settled
findings belong to `v0`.** Per-version fail counts were checked individually,
not inferred from the total.

This forces one correction and adds one caveat. **The correction: "84 is the
better number to quote" no longer holds.** Three independent measurements of the
cold-start drift now read 102, 84 and 112 combinations. The drift is real,
retro-only and first-run-only in every measurement, but its magnitude is not
converging on a value and should be described, not quoted. **The caveat: the
settled W-tier total is not stable across sessions either** — 2,651 there,
2,682 here, on the same 3,584 combinations. W-tier is dominated by `W1`
ellipsize findings, which depend on paint timing and on whatever state the
stateful versions happen to be in. **The R-tier figures reproduce exactly
(2,584 cold / 2,576 settled) across every session, and R-tier is what every
verdict in this document rests on.** Warn totals should not be compared between
sessions.

**One harness hazard found, and it is not in any version file.** The very first
page load of this session registered **15** versions, not 16: `vF` was missing
from `PM_BAKEOFF.versions()` while every later-loading file (`x-docker`,
`x-source`, `x-artifacts`) was present, and `versions/vF-stream.js?v=c93df7ec`
had returned `200 OK` on the wire. Re-fetching and evaluating the same file by
hand registered `vF` with no error, and four subsequent loads all registered 16.
So the file is sound and the failure did not reproduce — but **`register()`
failing leaves no trace anywhere**: the harness prints nothing, the sweep simply
runs one axis short, and 3,584 becomes 3,360 in a total that nobody reads. Every
sweep in this document had its version count asserted before the numbers were
believed. A registration-count assertion in `boot()` would make that automatic.

---

## 1. Coverage matrix — before and after

Percent of MUST requirements present. Partial counts as half. A feature reachable
through an overflow menu, sheet, lens or drill level counts as present.
Each cell is **before -> after**. **Bold** = best in panel after.

| Panel | MUSTs | v0 (control) | vA | vB | vC | vD | vE | vF | X1 | X2 | X3 | Best after |
|---|---:|---|---|---|---|---|---|---|---|---|---|---|
| Search | 26 | 33 -> 33 | 75 -> **73** | 75 -> 71 | 75 -> **73** | 69 -> 67 | 62 -> 62 | 52 -> 52 | - | - | - | vA / vC (73) |
| Source Control | 36 | 40 -> 40 | 76 -> 69 | 50 -> 50 | 68 -> 65 | 51 -> 49 | 53 -> 49 | 44 -> 44 | 90 -> **82** | 83 -> 75 | 83 -> 76 | **xS1** (82) |
| Actions (git) | 36 | 36 -> 36 | 68 -> 65 | 46 -> 42 | 75 -> **71** | 74 -> 68 | 56 -> 51 | 57 -> 54 | - | - | - | **vC** (71) |
| Docker | 32 | 22 -> 22 | 59 -> 59 | 50 -> 52 | 69 -> 69 | 50 -> 52 | 48 -> 48 | 61 -> 63 | 73 -> 73 | 70 -> 70 | 75 -> **75** | **xD3** (75) |
| Tests | 25 | 12 -> 12 | 74 -> 72 | 60 -> 58 | 76 -> 72 | 78 -> **74** | 72 -> 70 | 60 -> 60 | - | - | - | **vD** (74) |
| Agents | 24 | 6 -> 6 | 67 -> **69** | 56 -> 60 | 60 -> 65 | 56 -> 58 | 56 -> 60 | 52 -> 50 | - | - | - | **vA** (69) |
| Artifacts | 29 | 28 -> 28 | 62 -> 62 | 52 -> **0** | 64 -> 62 | 45 -> 43 | 50 -> 50 | 41 -> 41 | 66 -> 66 | 76 -> **74** | 66 -> 66 | **xA2** (74) |
| **Mean (7 panels)** | | **25 -> 25** | **69 -> 67** | **55 -> 47** | **70 -> 68** | **60 -> 59** | **57 -> 56** | **52 -> 52** | | | | |

X1/X2/X3 are the panel-scoped variants: Source `xS1 Commit Desk / xS2 Lane Board
/ xS3 Review Queue`, Docker `xD1 Triage Board / xD2 Column Ledger / xD3 Command
Line`, Artifacts `xA1 Glyph Column / xA2 Casefile / xA3 Monoculture`.

**vB's Artifacts 0% and vB's 47 mean were true when the audit was written and are
not true now.** The panel threw (BROKE-1); the one-line fix landed during this
pass, restoring it to its pass-1 surface. Post-fix vB reads **52%** on Artifacts
and **55** mean. The 0 is left in the table because it is the most important
number in it: it is what a schema-optional field did to a design that assumed it
was mandatory, and it was invisible to a checker that measures geometry.

**Movements from the fix pass, and what is deliberately not re-scored.** The
verification pass measured defects, not MUST coverage, so the percentages above
are **not** recomputed here — inventing a new number from a defect check would be
the same error the document spends section 2 warning about. What can be stated
from measurement is which direction each cell moves and why:

| Cell | Direction | Basis |
|---|---|---|
| vB Artifacts | 0 -> 52 (restored) | BROKE-1 fixed; panel renders everywhere |
| vF Agents | up from 50 | BROKE-2 and, for vF alone, BROKE-9 both fixed |
| vA / vB / vD / vF Search | up | BROKE-7 fixed; all six index states render the mandated line |
| vA / vB / vF Tests | up | BROKE-5 fixed; failure sentence, reason code and authorize route render |
| vA / vB / vD / vF Actions | up | BROKE-6 fixed; archived lifecycle honoured, mutations disabled |
| xD2 / xD3 Docker | up | BROKE-4 fixed; Hosts returns rows, header and footer agree |
| **vC / vD Docker** | **up** (pass 3) | BROKE-4: both now render **5 of 5** host rows once driven, with the subview's code and sentence |
| **vC Actions** | **down on one MUST** (pass 3) | BROKE-6: vC's mutation gate is right, but it now ships **no Dispatch control at all**, which GI L1275 requires to stay visible and disabled |
| **xD1 Docker** | **flat, one row short** (pass 3) | BROKE-4: 4 of 5 hosts; the healthy `local (docker desktop)` renders nowhere at any width |
| xS1 / xS2 / xS3 Source | up (visible **and** a11y) | BROKE-3 fully fixed in the second pass; lifecycle leads the accessible name |
| xA1 / xA2 / xA3 Artifacts | up | BROKE-8 fixed; reason codes match their sentences; xA2 now surfaces all three |
| **vC — Search / Tests / Actions / Agents** | **up** | second fix pass reached vC; BROKE-5, -6, -7, -9 now measure fixed |
| **vE — Tests / Actions** | **up** | second fix pass reached vE; BROKE-5 and -6 now measure fixed |

**The two rows above are a correction, and the correction is the point.** The
first verification pass recorded vC and vE as never edited, with every defect
assigned to them still live. That was true when it was written. A second fix pass
has since reached both files — `versions/vC-lens-deck.js` and
`versions/vE-cockpit.js` now carry the fields they were reported as missing — and
an independent re-render confirms the behaviour, not just the diff. Any ranking
that still treats vC and vE as unfixed is reading a state that no longer exists;
the residue is narrow and is itemised per finding in section 2.

Four things this table says plainly:

- **Read the control row first.** `v0` is extracted static markup that never
  reads `_pm-data.js`, so no fixture change can move it. It is flat at every
  panel, before and after. That is what makes the other rows legible: the drops
  are not the audit getting stricter, they are designs meeting states they were
  never tested against.
- **The best designs lost the most.** xS1 -8, vD-Tests -4, vC-Actions -4,
  vA-Source -7. vB-Source and vF-Source are flat at 50 and 44 for the opposite
  reason: a design that renders a field can render it wrongly; a design that
  renders nothing cannot. **Coverage rank and robustness rank are not the same
  ordering**, and section 2 is the one that separates them.
- **Only Agents improved broadly** (five of six redesigns, +2 to +5). Those were
  real fixture blocks: the remediation-ceiling and session states simply had no
  rows before. Docker moved +2 in three versions for one shared reason (the
  hosts roster row renders whether or not a version designed for it). Everywhere
  else the answer to "which previously-absent requirements are now present" was
  **none**.
- **The ranking is stable; the margins are not.** Every panel keeps its pass-1
  winner except Search, where vB fell out of the three-way tie. The field
  compressed in every panel.

---

## 2. WHAT BROKE

**This is the most decision-relevant section in the document.** It separates
designs that merely scored well from designs that actually work. A coverage
percentage counts whether a feature is present; this section counts whether what
is present is *true*. Ranked by severity.

Severity ladder: **S1** the panel does not function — **S2** the panel asserts
something false to the user — **S3** two distinct states become
indistinguishable — **S4** a number or affordance is wrong but self-evidently so.

### Fix-verification pass 2 (independent, rendered and read)

Every item below carries a **STATUS** line. Status was set by rendering the panel
on the identity-checked server (`/__whoami` = `puppet-master-panel-bakeoff`,
`dataSha1 169fa176b09e`) and reading the literal text, accessible names and
disabled state out of the live DOM — not by reading the diffs, and not by
trusting the report of the agent that made the change. Where a status disagrees
with what a fix claimed, the rendered text is quoted.

**The headline of pass 1 has been overtaken and is corrected here.** Pass 1
reported that two of the nine version files — `versions/vC-lens-deck.js` and
`versions/vE-cockpit.js` — had never been opened, and that every defect assigned
to them was still live. That was accurate at the time. A second fix pass has
since reached both files, and re-rendering shows it: **vC and vE now pass the
Tests-redaction and Actions-archived checks they previously failed outright, and
vC now renders `states[].line` verbatim for all six index states instead of
paraphrasing.** The stale claim is retained above only as a correction, because
the reason pass 1 caught it — measuring rendered behaviour rather than trusting a
completion report — is the same reason this pass can now retire it.

**What this pass measured.** The full fit matrix twice (3,584 combinations each,
16 versions registered, font gate green, zero page errors), plus seven rendered
meaning checks driven through the real UI: worktree lifecycle in all three Source
variants, vF's Agents counts, the Docker Hosts subview in xD1/xD2/xD3/vC/vD, the
Tests redaction gate in all six systems at four widths, the archived-repository
mutation controls at four widths, all six `index.states` values across six
versions and four widths, and the Artifacts blocked reason-code pairing at four
widths.

Tally across the twenty findings:

| Status | Count | Items |
|---|---:|---|
| **Fixed** (confirmed by rendered text) | 10 | BROKE-1, -2, -3, -4, -5, -6, -8, -10, -12, -20 |
| **Partially fixed** | 2 | BROKE-7, -9 |
| **Still open** | 1 | BROKE-11 |
| **Not re-tested in either pass** | 7 | BROKE-13 … BROKE-19 |

Three qualifications on that table, so it is not read as more than it says.
**BROKE-12 was in the "not re-tested" block in pass 1 and is now measured fixed**
— the kit reads `K.statusOf(token).glyph` and `.rail`, and `cancelled`,
`inconclusive` and `queued` are distinct on two non-colour channels.
**BROKE-6 is fixed on the defect it names** — live mutation on an archived
repository — but its secondary clause, the seven GI-021 `lifecycleStates`, still
renders nowhere. **BROKE-4 is fixed in the sense that no version now asserts the
falsehood**, but vC and vD reach the host rows in neither case: they stopped
lying without starting to list.

**Pass 3 supersedes the last of those two sentences and re-grades both findings.
The tally row for BROKE-4 and BROKE-6 should be read as follows, and the detail
is in the `RE-VERIFIED, PASS 3` blocks under each finding:**

| finding | pass-3 grade | what moved | what remains |
|---|---|---|---|
| **BROKE-4** | **FIXED** for every version it names (vC, vD, xD2, xD3) | vC and vD both render **5 of 5** host rows once driven — the pass-2 claim that neither could be reached was a **verification failure, not a product failure** | **PARTIAL for xD1**, which the finding never named: it renders **4 of 5** and drops the healthy `local (docker desktop)` entirely. vD's reason codes sit in the row overflow, not on the row face |
| **BROKE-6** | **PARTIAL** | the mutation gate holds in 6 of 6 through the row overflow menus, and **vD's 240/320px sentence gap is closed** | `lifecycleStates` still renders nowhere, and **vC has no Dispatch control at all** — passing the gate by hiding the button, which `GitHub_Integration.md:L1275` forbids |

The two remaining partials are narrow and specific, and neither is the "whole
file untouched" shape that made pass 1's partials systemic: BROKE-7 is one
version in one state (`vE` × `indexed`), and BROKE-9 is confirmed fixed in three
of six versions with vD still rendering only one of five blocked rows.

**The seven meaning checks, and what each returned.** These are the questions the
fit checker cannot answer, asked against the rendered DOM. Each maps to the
findings noted beside it.

| # | Check | Result | Residue |
|---|---|---|---|
| a | Does a released worktree still announce "Unavailable"? | **PASS** | `Unavailable` is gone from the visible text; the accessible name leads `Lifecycle released` and labels `Status Unavailable`. vA–vF still have no `Lifecycle` label (BROKE-3) |
| b | Does vF Agents' header count match its row count; all five blocked episodes present? | **PASS** | 28 `.vF-ev` rows against a header claiming 28, at all four widths; 5/5 blocked codes. Pass 1's "code printed twice" residue is gone (BROKE-2) |
| c | Do xD2's header and footer agree; does xD3's Hosts scope return rows? | **PASS** | xD2 `Docker / Hosts 5` over `5 rows · column 1/6`; xD3 returns 5/5 hosts. **Pass 3 correction:** vC and vD now measure **5/5 each** — they do list hosts; the pass-2 residue here was wrong. xD1 renders 4/5 (BROKE-4) |
| d | Is the artifact preview withheld on the failed-redaction run, in every version? | **PASS** | Clean notice absent in all 24 version×width renders; gate present in all six. vA and vE still expose the two named affected artifacts as enabled controls (BROKE-5) |
| e | Are Re-run / Cancel / Dispatch disabled on the archived repo, capability sentence as prose? | **PASS** | Zero enabled mutation controls in any version at any width; sentence is prose everywhere (verified by computed style, not class name). **Pass 3 correction:** vD now renders the sentence at 240 and 320px too — that partial is closed. New residue: **vC ships no Dispatch control to disable** (BROKE-6) |
| f | For each of the six `index.states`, does each version render the right sentence? | **1 FAILURE** | 35 of 36 cells pass. **`vE` × `indexed` renders no index identity** at 240/320/380px (BROKE-7) |
| g | Do the blocked reason codes match the sentences beside them? | **PASS** | All three pairs correct in xA1/xA2/xA3; xA2's coverage gap closed. No code or sentence renders at 240/320px in any of the three (BROKE-8) |

### S1 — the panel does not function

**BROKE-1. vB Artifacts throws. Nothing renders, at any width, in any theme.**
`versions/vB-gutter-sheet.js:1158` was
`var idKind = a.title.indexOf('/') >= 0 ? 'path' : 'default';`. `title` is
**optional** on the artifact envelope, and the enriched fixture carries two rows
without it (`art-3ab77f10` `tool_llm_trace`, `art-9c4471e2` `context_snapshot`).
The `forEach` throws `TypeError: Cannot read properties of undefined (reading
'indexOf')` on row 39 of 47; `_pm-shell.js` calls the panel with no try/catch, so
the exception escapes `render()` and the stage is never built — the harness UI
dies with it. 52% to 0%, the largest single move in either pass.
The design's own header comment says "The envelope has NO title field."
**Fixed in this pass** (`label = a.title || a.kind`, the idiom `x-artifacts.js`
already documents); confirmed by re-running the fit matrix, vB back to 0 R-tier.

> **STATUS: FIXED (confirmed).** vB Artifacts renders at every width and theme
> with zero page errors across all 112 version×panel renders in this pass. vB is
> at 0 R-tier in both sweep runs.

**BROKE-2. vF Agents drops 11 of 15 active rows and 4 of 5 blocked episodes.**
`versions/vF-stream.js:1352`:
`var order = [G.active[1], G.active[0], G.active[2], G.active[3]];` — a
hardcoded four-element array, unchanged since pass 1, now four times worse. The
pinned strip is computed from the *full* array, so **the header says `5 blocked`
and the list shows 1**, and the chip strip reads `All 28` above 17 events.
`needs_approval`, `agent_session_disconnected`, `agent_session_restoring` and
`remediation_ceiling_exceeded` appear nowhere in the markup at any width.
`FinalGUISpec.md:L3745` (concurrent blocked episodes must not collapse) is
violated four times by one line, and kit rule 8 with it. The only score in the
Agents panel that fell. **Disqualifying for Agents until fixed.**

> **STATUS: FIXED (confirmed).** The hardcoded four-element array is gone. vF
> now renders **15 of 15** active rows and **13 of 13** completed rows — 28, which
> is exactly what its header claims (`28 events`, `All 28`,
> `15 active · 13 recent · 16 available`). All five blocked episodes render, each
> with its reason code, its sentence and its own action set:
> `Schema Cartographer / agent_session_restoring / "The session is restoring from
> a checkpoint. No action is needed yet." / Open for edit`;
> `Migration Warden / needs_approval / "A destructive column type change needs
> human approval before it runs." / Approve node · Open for edit · Abort node`;
> `Media Pipeline Wrangler / agent_session_disconnected / "The agent session
> dropped 12m ago and has not reconnected." / Reconnect session · Abort node`;
> `Rounding Investigator / remediation_ceiling_exceeded / "Remediation limit
> reached after 3 attempts. No further automatic retries." / Replan node · Open
> for edit · Abort node`; and `Deploy Sentinel / needs_authority`. The header
> count now matches the row count, and the per-row action sets mean vF also
> closes BROKE-9 for itself. **No longer disqualifying for Agents.**
> One cosmetic residue: each blocked row prints its reason code **twice** in the
> visible text (once as the status chip, once as the `pmk-blocked-code`). Not a
> correctness defect, but it reads as a stutter.

### S2 — the panel asserts something false

**BROKE-3. All three Source variants print the status token where the reserved
lifecycle word belongs.** `versions/x-source.js:1879` and its two siblings:
`PMK.kv('Lifecycle', PMK.statusOf(w.status).word, 'token', b)`. The fixture
carries `lifecycle` as its own field precisely because `PM_DATA.status` cannot
express the reserved words (`WorktreeGitImprovement.md:L297`).

| Worktree | `lifecycle` in data | renders as |
|---|---|---|
| `orch/lane-e-search` | `reserved` | **queued** |
| `thread/exif-strip-panic` | `orphaned` | **attention** |
| `thread/ratings-schema` | `released` | **disabled** |
| `orch/lane-f-media-thumbnailer` | `blocked_preserved` | **blocked** |
| `thread/scaling-rounding` | `blocked_preserved` | **blocked** |

`released` is the worst: the worktree was released after a clean merge into
`main` and is retained for lineage, and the panel says it is unavailable. **The
accessible name agrees** — the row announces `thread/ratings-schema.
Unavailable.` — so a screen-reader user is told a successfully merged worktree
is broken. This is the leading pick for the leading panel, and the same defect
appears in all three variants because they share one file. vA-vF have the same
substitution with no `Lifecycle` label at all.

> **STATUS: FIXED (confirmed) — both halves, in all three variants.** Pass 1
> recorded this as partially fixed because the accessible name still led with the
> status word. The second fix pass closed that half, and re-rendering confirms it.
>
> The **visible** defect stays closed. `lifecycleKv()` renders `w.lifecycle`
> verbatim under the `Lifecycle` label; the expanded worktree detail reads
> `Lifecycle released`, and the string `Unavailable` appears **nowhere** in the
> visible text of xS1, xS2 or xS3.
>
> The **accessible name** now leads with the reserved word and labels both fields.
> Rendered `aria-label`, read off the live row, identical in all three variants
> (xS3's worktree list reached through its `Worktrees` tab):
>
> | worktree | `lifecycle` | accessible name as rendered |
> |---|---|---|
> | `orch/lane-b-api` | active | `orch/lane-b-api. `**`Lifecycle active`**`. Status Running. Orchestrator lane-b API. Locked by run #47` |
> | `orch/lane-e-search` | reserved | `orch/lane-e-search. `**`Lifecycle reserved`**`. Status Queued. Orchestrator lane-e search` |
> | `thread/exif-strip-panic` | orphaned | `thread/exif-strip-panic. `**`Lifecycle orphaned`**`. Status Needs attention. EXIF strip panic investigation` |
> | `thread/ratings-schema` | released | `thread/ratings-schema. `**`Lifecycle released`**`. Status Unavailable. Ratings schema and migration 0002` |
> | `orch/lane-f-media-thumbnailer` | blocked_preserved | `… `**`Lifecycle blocked_preserved`**`. Status Blocked. … Locked by safe point sp-11` |
>
> **So a released worktree no longer announces "Unavailable" as a verdict.** The
> word still occurs, and that is the right answer rather than a residual defect:
> `status` and `lifecycle` are independent fields the fixture ships on every row,
> and suppressing one would be a second falsehood. What changed is attribution and
> order — `Status Unavailable` is now audibly the value of one named field, after
> `Lifecycle released`. The code and its comment (`x-source.js:505-540`) now agree.
>
> Two carried-forward notes, neither closed by this fix: the raw enum
> `blocked_preserved` is still spoken as an un-humanised snake_case token
> (defensible under the file's stated "render the code verbatim" convention); and
> **vA–vF are still unchanged on this point** — they substitute the status word
> with no `Lifecycle` label at all, and vA's Source rows carry no `aria-label`,
> so their accessible name is just the row text.

**BROKE-4. Four Docker versions assert, in the UI, that data they were given does
not exist.** `docker.hosts` ships five rows and the subview carries `count: '5'`.
Every version routes an unknown subview id into a "no rows" empty written for
`networks`/`volumes`/`contexts`. vC: "The shared fixture carries a count for this
lens but no rows" with the frame count reading `5`. vD: "5 recorded, none loaded
into this projection yet." xD2: header count 5, footer count **0**, same frame,
same instant. xD3 is sharpest because it contradicts its own thesis — scoping to
Docker / Hosts returns "**Nothing in this runtime or the command catalogue
matches**", while typing `>host` in the same field returns `COMMANDS 11`. The
panel that is the only `+` on M28 tells the user nothing exists at the one
destination where all eleven commands live.

> **STATUS: FIXED — the asserted falsehood is gone from every version that
> reaches the subview.**
>
> `x-docker.js:589` now has a real `id === 'hosts'` branch with its own six
> column definitions, shared by all three x-renderers. Re-driven through the real
> UI (xD3's `data-xd-act="scope"` chip; xD2's portalled subview combobox).
>
> - **xD3 (the sharpest case) is fixed.** Scoping to `Docker / Hosts` returns
>   **5 of 5 host rows** under the header `DOCKER / HOSTS 5`, plus
>   `COMMANDS 11`. The string "Nothing in this runtime or the command catalogue
>   matches" no longer appears anywhere in that scope. Each row carries its own
>   reason code and sentence — `offline_cached`, `network_blocked_by_policy`,
>   `host_unreachable`, `host_untrusted`.
> - **xD2's header and footer now agree.** Header `Docker / Hosts 5`, footer
>   **`5 rows · column 1/6`**, five `.xD2-row` elements rendered. The 5-over-0
>   contradiction is gone.
> - **xD1** shows four hosts in its needs-you feed and the fifth under
>   `SETTLED 1` — all five accounted for, which is grouping, not a drop.
> - **vC no longer asserts the falsehood.** The sentence "The shared fixture
>   carries a count for this lens but no rows" is **absent from vC's Docker panel
>   entirely**, at every width. What replaced it is not a hosts body, though: vC's
>   Docker panel now exposes no Hosts affordance that this pass could reach, so
>   the five host rows are unreachable rather than misdescribed. That is a
>   coverage gap, not an S2 falsehood, and it is a strictly better failure mode
>   than the one reported — but it is not the same thing as rendering the rows.
> - **vD likewise no longer asserts it.** "5 recorded, none loaded into this
>   projection yet" appears nowhere. vD's hub renders `Docker / Hosts` with the
>   subview's own sentence, *"Four of five hosts are read-only, unreachable or
>   untrusted."* — fixture text, correctly attributed. Its hosts body still sits
>   behind a drill-down this pass could not open, so vD surfaces the state
>   without listing the rows.

> **RE-VERIFIED, PASS 3 — now FIXED in four of five, with one number above found
> to be wrong.** Every claim below was taken by driving the live UI on a
> cache-free origin and reading rendered text, not by reading source. Two of the
> three "unreachable / could not open" caveats above were **verification
> failures, not product failures** — the affordances existed and this pass
> reached them.
>
> | version | route driven | host rows rendered | verdict |
> |---|---|---|---|
> | vC | subview combobox -> `Docker / Hosts 5` | **5 of 5**, at 240/320/380/480 | **FIXED** |
> | vD | hub row `data-vd-go="hosts"` -> drill | **5 of 5**, at 240/320/380/480 | **FIXED** |
> | xD1 | needs-you feed, hosts section | **4 of 5** | **PARTIAL** |
> | xD2 | portalled subview combobox | **5 of 5** | **FIXED** |
> | xD3 | `data-xd-act="scope"` chip | **5 of 5** | **FIXED** |
>
> - **vC is fixed, and the bullet above is retracted.** vC's Docker panel does
>   expose a Hosts affordance — the eleven-option subview combobox, option
>   `Docker / Hosts  5`. Driving it renders the header `Docker / Hosts 5`, the
>   subview's degraded code `host_partially_unreachable`, its sentence *"Four of
>   five hosts are read-only, unreachable or untrusted."*, and all five host rows
>   with **all four** reason codes and their sentences, at every width. The pass-2
>   claim that "vC's Docker panel now exposes no Hosts affordance that this pass
>   could reach" was wrong; the affordance was reachable and the rows were there.
> - **vD is fixed, and that bullet is retracted too.** `data-vd-go="hosts"` on
>   the hub opens `DOCKER / HOSTS` listing **all five** hosts at every width
>   (240 collapses to bare names, 480 adds kind/context/container counts). What
>   is true is narrower than "could not open": **no reason code appears on the
>   row face at any width** — `offline_cached`, `network_blocked_by_policy`,
>   `host_unreachable` and `host_untrusted` live in the `+N` overflow and the row
>   context menu (`Open in terminal <offline_cached>`), reachable but not read.
>   That is the residue, and it is a legibility gap, not an absence.
> - **xD1 is the one that does not clear, and the pass-2 bullet overstated it.**
>   The header reads `DOCKER / HOSTS 4` and four rows follow — `ci-pool-3`,
>   `build-01`, `lab-shared`, `tower.platyr.lan`, each with its reason code. The
>   fifth host, the healthy `local (docker desktop)`, is **not under `SETTLED`
>   and is not anywhere**: the string does not occur in xD1's Docker markup at
>   240, 320, 380 or 480px, and `SETTLED 19` is containers only. So "all five
>   accounted for, which is grouping, not a drop" is **false — it is a drop**.
>   xD1 does not *assert* a falsehood (its header says 4 and it shows 4, which is
>   why this is not an S2), but a design whose thesis is triage silently omitting
>   the one host that is working is a real coverage gap.
> - **xD2's header and footer agree, re-confirmed by clicking.** Header
>   `Docker / Hosts 5`, five `.xD2-row` elements, footer **`5 rows · column 1/6`**,
>   read in the same frame.
>   One methodology note for anyone re-running this: `PM.select.setValue()` sets
>   the value **without emitting** (`_pm-components.js:171`, `setValue(v, false)`),
>   so it repaints the trigger and leaves the body on the old subview. Doing that
>   produces a header/footer contradiction that looks exactly like the original
>   BROKE-4 and is entirely the harness's. The subview must be changed by opening
>   the listbox and clicking the option.
> - **xD3 re-confirmed verbatim.** Scoping to Hosts renders
>   `DOCKER / HOSTS 5` over all five hosts, then `COMMANDS 11`, with
>   `Scoped to Docker / Hosts · type : for subviews, > for the 78 commands` in
>   the field. "Nothing in this runtime or the command catalogue matches" does
>   not appear.
>
> **Net: BROKE-4 is FIXED for vC, vD, xD2 and xD3 — every version this finding
> named. It is PARTIAL for xD1**, which was never named by the finding and which
> drops one row of five. Residue: vD's reason codes are one interaction away from
> the row face; xD1's healthy host does not render.

**BROKE-5. Every version asserts a clean redaction over a run whose redaction
failed.** `T.redactionFailed` and `T.redactionStates` supply the three-state
vocabulary, the blocking reason, the authorize route, the affected run and the
affected artifacts. **Zero references in any version.** All seven render a
clean-state notice and then render the artifacts.
`Automated_Testing_System.md:L83-L98` — "Redaction failures block
display/persistence until resolved or explicitly authorized." The gate exists
*for* the failure case; the whole bakeoff designed the happy path. Non-
dismissibility passes everywhere by accident (no version has a dismiss control)
and regresses the moment anyone adds one.

> **STATUS: FIXED — 6 of 6, and the question as posed now passes.** The check
> was "is the artifact preview withheld on the failed-redaction run, in **every**
> version, rather than rendered with a clean notice". It is. Measured at 240, 320,
> 380 and 480px in all six systems.
>
> - **No version renders the clean notice.** The string "4 fields redacted before
>   display" appears in **zero** of the 24 version×width renders. In pass 1 vC and
>   vE both rendered it.
> - **All six render the gate.** Reason code `redaction_profile_unavailable` and
>   the authorize route "Authorize unredacted display" render in every version at
>   every width. **vC and vE now render both** — the finding's two hard failures
>   are closed. **vD now renders the blocking sentence**, closing its partial.
> - **vB adapts the wording by width rather than dropping it.** At 380 and 480px
>   it renders the headline sentence verbatim ("Redaction failed on 2 of 6 fields.
>   Artifact previews are blocked until this is resolved."); at 240 and 320px it
>   renders the fixture's `detail` instead ("The redaction profile
>   redact-default-v3 could not load, so secrets in run 209 were not masked."),
>   with the code and all three actions. Both strings are fixture-supplied, so
>   this is a width adaptation, not a substitution.
> - **Non-dismissibility still holds**: zero dismiss controls in any version.
>
> Two honest qualifications carried forward. **First, no version renders an
> artifact preview element in the Tests panel at all** (zero `img`/`iframe`/
> preview nodes across all 24 renders). So previews are not being shown for run
> 209 — but that is still because previews were never built, not because a gate is
> suppressing them. The gate is a notice, not a suppression mechanism. **Second,
> vA and vE still list the two artifacts the fixture names as affected**
> (`playwright-trace.zip`, `import-worker-stdout-retry-2.log`) as *enabled*
> controls, so the rows the gate declares blocked remain openable in those two.
> That is the nearest thing to a real preview either version has, and it is not
> withheld.

**BROKE-6. Every version offers live mutation on an archived repository.**
`repository.lifecycle`, `capabilitySentence`, `capabilities` and
`mutationDisabled` are all in the fixture. No redesign reads any of them, so
Re-run, Cancel, Dispatch and secret edits stay enabled on a repo the data says
is archived. All seven of GI-021's lifecycle states are present in
`repository.lifecycleStates`; `remote_mismatch`, `transferred`,
`renamed_redirected`, `deleted` and `historical_only` render nowhere.

> **STATUS: FIXED — 6 of 6 on the defect this finding names; the
> `lifecycleStates` clause remains open.** Pass 1 recorded 4 of 6 with vC and vE
> still offering live mutation; both are now gated.
>
> - **All six render the word `archived`** at all four widths, and all six render
>   the capability sentence **"You can view runs but cannot dispatch."** verbatim,
>   as prose rather than a token (`pmk-blocked-say`, `vB-note`, `pmk-note` — no
>   token/chip/badge class on any of them).
> - **Zero enabled mutation controls, in any version, at any width.** vA four ×
>   `Rerun failed jobs` disabled; vB four × `Rerun`/`Rerun failed` disabled;
>   **vC `Re-run` now disabled** (it was enabled in pass 1); vD `Dispatch` and
>   `Re-run failed` disabled; **vE `Rerun` and `Cancel` now both disabled** (both
>   were enabled in pass 1); vF renders no mutation control at all on this repo,
>   which is a stricter answer to the same requirement.
> - One width-gated partial: **vD does not render the capability sentence at 240
>   or 320px**, only the word `archived`. Its controls are disabled at those
>   widths regardless, so the affordance is right and only the explanation is
>   missing.
>
> The `lifecycleStates` half of this finding is untouched everywhere:
> `remote_mismatch`, `transferred`, `renamed_redirected`, `deleted` and
> `historical_only` still render nowhere in any version. **This half is still
> open**, and it is the reason BROKE-6 should not be read as fully retired: what
> is fixed is the archived state and the mutation gate, not GI-021's vocabulary.

> **RE-VERIFIED, PASS 3 — the gate holds in all six, the width gap is closed, and
> one new gap is named.** Measured by rendering the Actions panel at 240, 320,
> 380 and 480px and by **opening a run row's overflow menu in each version** and
> reading the portalled items, on a cache-free origin.
>
> | version | aria-disabled, visible (380px) | aria-disabled, menu items | total | Dispatch | Re-run | Cancel | read-only still enabled | sentence as prose |
> |---|---:|---:|---:|---|---|---|---|---|
> | vA | 34 | 185 | **219** | `Dispatch workflow` (menu) | yes | yes | yes | yes |
> | vB | 6 | 222 | **228** | `Dispatch` (visible) | yes | yes | yes | yes |
> | vC | 2 | 46 | **48** | **absent** | yes | yes | yes | yes |
> | vD | 2 hub | 78 in the Runs drill | **80** | `Dispatch` (visible) | yes | yes | yes | yes |
> | vE | 2 | 78 | **80** | `Run workflow` (menu) | yes | yes | yes | yes |
> | vF | 4 | 87 | **91** | `Run workflow` (visible) | yes | yes | yes | yes |
>
> **No version is at zero, and no version disabled its read-only actions.** Both
> of the failure modes worth watching for are absent. The counts are not in one
> ballpark and should not be expected to be: they measure design shape, not
> compliance. vA's 34 is 30 per-row inline `Rerun this run` icon buttons plus
> four `Rerun failed jobs`, because vA is the only design that puts a mutation on
> the row face; the others put the same action in a row overflow, where it counts
> once per menu template rather than once per visible control. Normalising on the
> *menu* column instead gives 185 / 222 / 46 / 78 / 78 / 87 — one ballpark with
> vC low, which is the real signal.
>
> - **Every row overflow menu was opened and read.** Identical shape in all six:
>   `Re-run` / `Rerun`, `Re-run failed jobs`, `Cancel` / `Cancel run` all carry
>   `aria-disabled="true"` with reason `archived` and the sentence *"This
>   repository is archived. Runs remain readable; every mutation is disabled."*,
>   while `Open run`, `View logs`, `Compare last success`, `Open related diff`,
>   `Open related worktree` and `Open in browser` are **enabled** in every one.
>   vD's Runs drill behaves the same (`Open run` enabled; `Re-run`, `Pin run`,
>   `Cancel run` disabled), so vD honours the gate one level down as well as at
>   the hub.
> - **The vD width gap is CLOSED.** The pass-2 partial — "vD does not render the
>   capability sentence at 240 or 320px" — no longer reproduces. At 240px vD
>   renders `archived` and *"You can view runs but cannot dispatch."* directly
>   under the panel header, screenshot-confirmed. All six versions render both
>   the word and the sentence at all four widths.
> - **Prose confirmed by computed style, not by class name.** The sentence node
>   in all six is `display:block`, no border, transparent background, `0px`
>   radius, `text-transform:none`, `letter-spacing:normal` — `pmk-blocked-say`
>   in vA/vC/vE/vF, `vB-note` in vB, `vD-cap-s` in vD. Nothing is rendered as a
>   token, chip or badge.
> - **NEW, and it is a regression of coverage rather than of safety: vC has no
>   Dispatch affordance at all.** No visible control and no menu item matching
>   dispatch or run-workflow exists in vC's Actions panel at 240, 320, 380 or
>   480px. vC disables `Re-run`, `Re-run failed jobs` and `Cancel`, so it never
>   offers a live mutation — but `GitHub_Integration.md:L1271-L1275`, quoted in
>   the fixture comment at `_pm-data.js:750-752`, is explicit that capability
>   limits show as effective capability state and **not as hidden controls**: "A
>   version that hides its Dispatch button here is violating L1275; the button
>   must stay visible and disabled with the capability cited." vC is the only one
>   of the six in that position. **This is the residue that keeps BROKE-6 from
>   being clean at 6 of 6 on its own terms.**
> - **Pre-existing a11y cost that this fix multiplied, in vA.** The 30 disabled
>   row buttons are `ibtn()` output (`vA-ledger.js:268`): an SVG-only `<button>`
>   with `data-pm-tip` and **no `aria-label` and no text**. `data-pm-tip` is a
>   tooltip only — `_pm-components.js` never promotes it to an accessible name —
>   so a screen reader gets 30 nameless disabled buttons whose entire explanation
>   is in a hover tooltip. The idiom predates this fix and is used across vA's
>   other panels, but before the fix these controls were enabled and unremarkable;
>   now they are the primary carrier of the archived state in vA and their only
>   explanation is unreachable without a pointer.
> - **Minor over-disabling, three versions.** vB disables `Pin run` / `Unpin run`,
>   vC disables `Unpin`, vE disables `Unpin`, all with reason `archived`. A pin is
>   local view state, not a repository mutation; disabling it is defensible but is
>   not what `mutationDisabled` asks for. vD disables `Pin run` in its drill for
>   the same reason.
>
> The `lifecycleStates` clause is **re-confirmed still open**: `remote_mismatch`,
> `transferred`, `renamed_redirected`, `deleted` and `historical_only` appear in
> zero of the six versions, in rendered text and in menu templates, at all four
> widths.
>
> **Net: BROKE-6 is FIXED on the mutation gate in 6 of 6 and the vD width partial
> is closed. It stays PARTIAL overall** for two reasons, one old and one new: the
> `lifecycleStates` vocabulary renders nowhere, and vC now satisfies the gate by
> having no Dispatch control to gate, which L1275 forbids.

**BROKE-7. vB Search states a falsehood under five of six index states, and at
240px states it alone.** vB hardcodes its index identity line, so five of the six
`index.states` values render the wrong sentence; at 240px it is the only text in
that region. vA renders `DISABLED` and `Indexing On` simultaneously (its toggle
is hardcoded `On`). vC raises a false alarm on the healthy state and drops the
cancelled one — it built its vocabulary map from a stale inline comment rather
than the shipped `states` array. vD and vF print the raw enum, and vF prints a
lie. **Six of seven redesigns built a freshness surface that renders correctly
only for the one value that happened to be in the old fixture.**

> **STATUS: PARTIALLY FIXED — 35 of 36 cells pass; the remainder is `vE` ×
> `indexed`.** Driven by setting `index.state` to each of the six `states[].id`
> values in turn and reading the rendered identity line, at 380px (the reference
> width) and re-run at 240, 320 and 480.
>
> | version | indexed | stale | unindexed | fallback | disabled | cancelled |
> |---|---|---|---|---|---|---|
> | vA | PASS | PASS | PASS | PASS | PASS | PASS |
> | vB | PASS | PASS | PASS | PASS | PASS | PASS |
> | vC | PASS | PASS | PASS | PASS | PASS | PASS |
> | vD | PASS | PASS | PASS | PASS | PASS | PASS |
> | vE | **absent** | PASS | PASS | PASS | PASS | PASS |
> | vF | PASS | PASS | PASS | PASS | PASS | PASS |
>
> **Five of six versions render the fixture's `line` verbatim for all six
> values.** Two pass-1 failures are closed outright: **vC no longer paraphrases**
> — it renders `states[].line` verbatim across all six — and **vE no longer
> prints the bare enum**, including at `disabled`, which pass 1 recorded as
> silence and which now reads `Indexing off - grep only`. The hardcoded identity
> line and the stale vocabulary map are gone everywhere.
>
> **The one remaining cell is vE at `indexed`, and it is deliberate.**
> `vE-cockpit.js:773` reads `if (ix.id !== 'indexed') facts.push(K.kv('index',
> ix.line, …))` — the freshness fact is suppressed for the healthy state, on the
> stated argument that at 240px only one fact fits and match counts matter more.
> The consequence is that vE renders **no index identity at all** at 240, 320 and
> 380px when the index is healthy; the line reappears at 480px, where the grid
> facts render. This is the mildest state to omit, but it is still the only cell
> in the matrix where a version says nothing about an index state the fixture
> describes.
>
> **Two apparent failures at other widths are not failures**, and are recorded so
> they are not re-reported: **vC at 240px** moves the index identity into its
> `+N` overflow — clicking it renders the correct line for all six states, which
> counts as present under this document's own coverage rule; and **vF at 320px**
> renders `Indexing off - grep o…`, the mandated line elided by CSS, not a
> different string.

**BROKE-8. Artifacts: three blocked states relabelled as a fourth.** xA1, xA2 and
xA3 share a `rowActions` block whose two-value ternary hard-codes the reason
vocabulary, so five mandated blocked presentations (`RAP:L2060`) collapse and
three are *actively mislabelled* — the code contradicts the sentence rendered
beside it. Because the block is shared, one wrong ternary produces the identical
defect in all three files, and the merged design proposed in pass 1 would
inherit it. Three lines (`x-artifacts.js:824`, `:1045`, `:1377`) reading
`r.blockedReasonCode` would fix all three.

> **STATUS: FIXED (confirmed), and now complete in all three variants.** The
> reason codes match the sentences beside them. Read out of the live DOM — each
> `.x-blk-code` and the sentence element immediately following it (rendered text
> is ellipsis-elided, so the pairing was verified as a prefix match against the
> fixture sentence, and checked not to be a prefix of either other sentence):
>
> - `artifact_storage_read_only` → "Artifact storage is mounted read-only…"
> - `artifact_integrity_mismatch` → "The stored digest does not match thi…"
> - `artifact_preflight_drift` → "Two members changed after this bundle w…"
>
> **All three pairs are correct in xA1, xA2 and xA3**, at 380px and 480px.
> `x-artifacts.js:263` now reads `if (r.blockedReasonCode) return
> String(r.blockedReasonCode)` before any derivation, so the shared ternary can no
> longer overwrite a supplied code. **xA2's pass-1 coverage gap is also closed**:
> `artifact_integrity_mismatch` now appears in its default casefile projection, so
> all three variants surface all three codes.
>
> The two other codes those files render — `policy_denied` and
> `approval_required` — are *derived*, and correctly so: they belong to the two
> rows that predate the field and carry no `blockedReasonCode`, and each pairs
> with its own row's sentence (`provenance` and `preview` respectively). The
> fixture gap is documented in the file rather than papered over.
>
> **One coverage gap this pass records for the first time: at 240px and 320px,
> none of xA1/xA2/xA3 renders any blocked reason code or blocking sentence.** The
> rows themselves are present (titles render at 320px in all three), but the code
> and the sentence are dropped rather than elided or moved to an overflow. This is
> not the mislabelling BROKE-8 was about — nothing false is asserted — but the
> blocked vocabulary `RAP:L2060` mandates is unavailable at the two narrow widths.
>
> None of vA–vF renders any blocked reason code in Artifacts; unchanged, and never
> part of this finding.

**BROKE-9. Every Agents version renders blocked actions the row does not allow.**
The fixture now supplies `allowedActionIds[]` per blocked row. All seven ignore
it: vA emits the same fixed triple (Replan node / Manual fix / Abort node) on all
five blocked rows and is correct on one. vD's blocked screen is five bare names
with no reason and no action at all. This is the single highest-value fix in the
panel, and it is a data read, not a design question.

> **STATUS: PARTIALLY FIXED — now confirmed for vA, vC and vF; vD still the
> worst case.** Verified by locating each blocked row's reason code in the live
> DOM and reading the action labels inside that row, then comparing against the
> row's own `allowedActionIds[]`.
>
> - **vA, vC and vF each emit five distinct action sets across the five blocked
>   rows, and each set matches its row exactly**: `Grant authority · Abort node`
>   on `needs_authority`; `Approve node · Open for edit · Abort node` on
>   `needs_approval`; `Reconnect session · Abort node` on
>   `agent_session_disconnected`; `Open for edit` alone on
>   `agent_session_restoring`; `Replan node · Open for edit · Abort node` on
>   `remediation_ceiling_exceeded`. **vA's pass-1 "same fixed triple on all five
>   rows" is gone**, and vC — one of the two files pass 1 reported as never
>   edited — is now correct on all five.
> - **vE: one row confirmed.** `needs_authority` renders `Grant authority · Abort
>   node · Open lineage`. Its other four blocked rows carry no in-row controls
>   this pass could reach, so they are neither confirmed fixed nor confirmed
>   live.
> - **vB: not confirmed.** Its blocked rows render the reason codes but expose no
>   per-row action controls in the row itself, so `allowedActionIds[]` is not
>   observably read.
> - **vD is the worst case and is not fixed**: its Agents hub renders only one of
>   the five blocked rows (`needs_authority`) and no per-row action set; the other
>   four blocked agents sit behind a drill-down this pass could not open. The
>   original "five bare names, no reason, no action" is still not disproved.
>
> Note the `Grant authority · Abort node` pair is new evidence in this pass: pass
> 1 quoted only four of vF's five sets and did not name the `needs_authority` row.

**BROKE-10. vF Artifacts leaked the literal string `undefined`.**
`versions/vF-stream.js:1456` was `line2: r.kind + DOT + r.preview`. For
`art-9c4471e2` (no `preview`) the row rendered `2h  ok  context_snapshot ·
undefined`, with the identity span emitted **empty** (`subj: r.title` at `:1455`)
— a status word, a raw kind token and the word `undefined`, and nothing a user
could act on. The only literal token leak in the bakeoff.
**Fixed in this pass**, together with the blank identity.

> **STATUS: FIXED (confirmed, re-measured).** The literal string `undefined`
> appears in **zero** of 224 version×panel×width renders (all 16 versions × 7
> panels × 240 and 380px). A scan for `NaN` and `[object Object]` in the same
> sweep returned only matches inside search-result *snippets* — fixture source
> text such as `// reject NaN from the stepper` and `writable<number | null>` —
> which are content, not leaks.

**BROKE-11. Four designs render an identity-less row.** vA, vC, vE and vF bind
the identity slot straight to `r.title`. Neither title-less row is dropped; the
slot simply comes out blank — vE renders `(blank)  2h`. `RAP:L314` forbids
exactly this ("never an empty row") and `RAP:L318` makes identity a *computed*
field with 19 branches. **Seven of ten designs bind the whole row grammar to a
field the schema marks optional.** Only the three x-variants have a fallback, and
theirs skips `summary` (which `art-3ab77f10` has) and stops at the kind, so it
duplicates a token already rendered as glyph, code or run header.
vF's half of this is fixed; vA, vC and vE remain.

> **STATUS: STILL OPEN — the least-moved finding in this section.** Both
> title-less artifacts (`art-3ab77f10 tool_llm_trace`, `art-9c4471e2
> context_snapshot`) still render without a title in every version. Re-measured at
> 380px:
>
> | version | `art-3ab77f10` (has `summary`) | `art-9c4471e2` (no `summary`) |
> |---|---|---|
> | vA | falls back to `kind` | falls back to `kind` |
> | vB | falls back to `kind` | **neither `kind` nor `summary`** |
> | vC | **neither** | **neither** |
> | vD | **neither** | **neither** |
> | vE | surfaces `summary` | **neither** |
> | vF | falls back to `kind` | falls back to `kind` |
> | xA1 / xA2 / xA3 | falls back to `kind` | falls back to `kind` |
>
> **vC and vD render no identity at all for either row** — the worst case, and vD
> is newly recorded here (pass 1 named only vA, vC and vE). vE's `summary` for
> `art-3ab77f10` survives the second fix pass. The x-variants' fallback still
> stops at the kind and still skips `summary`, exactly as originally reported, so
> the row grammar still duplicates a token already rendered as glyph, code or run
> header. No version's `id` is used as a last-resort identity anywhere.
> **This finding is not closed and was not targeted by either fix pass.**

### S3 — two distinct states become indistinguishable

> **VERIFICATION SCOPE.** BROKE-13 through BROKE-19 were **not re-tested** in
> either pass, which targeted the nine defects the fix agents were given. Treat
> every one of them as still open until measured.
>
> **BROKE-12 is the exception and is now FIXED** — measured, not inferred, and the
> body of the finding below is superseded. `_pm-kit.js:107-108` now reads
> `s.glyph` and `s.rail` off `K.statusOf(token)` first, keeping its own maps only
> as a fallback for tokens the data does not describe. Rendered marks in
> `basic-dark`:
>
> ```
> Queued        glyph=circle  rail=solid            tone=pmk-t-idle
> Cancelled     glyph=slash   rail=pmk-rail--dashed tone=pmk-t-off
> Inconclusive  glyph=info    rail=pmk-rail--dotted tone=pmk-t-idle
> ```
>
> `cancelled` and `inconclusive` are now distinct from `queued` on **two**
> non-colour channels each — glyph shape and rail dash — which is what
> `FinalGUISpec.md:L1237` requires. The M8/M10 columns now measure the bakeoff
> rather than the kit.
>
> One correction to the note that stood here: **BROKE-16 and BROKE-19 sit in vC
> and vE, which are no longer unedited files.** Both received the second fix pass.
> Neither finding was in its scope, so both remain unmeasured — but "almost
> certainly still live because nobody opened the file" is no longer a valid
> reason to assume it.

**BROKE-12 (kit). `cancelled` and `inconclusive` were pixel-identical to
`queued`, in every version that draws a run list. THIS FINDING IS CLOSED — the
paragraph below is the original report and its measurements are historical.**
`_pm-data.js` declares `cancelled` with glyph `slash` and rail `dashed`, and
`inconclusive` with glyph `info` and rail `dotted`. `_pm-kit.js:73-77` kept
**its own** `GLYPH` and `DASH` maps keyed to the original nine tokens, and
`K.statusMark` read those, not the data. Measured on the live DOM at the time:

```
Cancelled  shape=<circle r="8">  colour=rgb(127,134,148)  rail=solid
Queued     shape=<circle r="8">  colour=rgb(127,134,148)  rail=solid
```

`FinalGUISpec.md:L1237` requires any two of four non-colour channels to
distinguish two states. Glyph shape, glyph colour and rail dash collapsed at
once; the fourth (the status word) is width-gated, and vC, vD and vE print no
status word in run rows at any width. What survived was the `aria-label`.
It hit **Actions** and **Tests** and was latent in **Source** and **Search**.
**No design could fix this from inside a version file** — the remedy was one line
in `statusMark` reading `K.statusOf(token).glyph` and `.rail`, the contract the
kit's own four-channel comment already promised.

> **STATUS: FIXED (confirmed by measurement).** `_pm-kit.js:107-108` now reads
> `s.glyph` and `s.rail` from `K.statusOf(token)`, keeping the old maps only as
> `GLYPH_FALLBACK` / `DASH_FALLBACK` for tokens the data does not describe. The
> same three marks now render:
>
> ```
> Queued        glyph=circle  rail=solid             tone=pmk-t-idle
> Cancelled     glyph=slash   rail=pmk-rail--dashed  tone=pmk-t-off
> Inconclusive  glyph=info    rail=pmk-rail--dotted  tone=pmk-t-idle
> ```
>
> Two non-colour channels separate each pair, which satisfies `L1237`. **The
> M8/M10 columns now measure the bakeoff rather than the kit**, and the caveat
> that qualified them everywhere in this document is retired.

**BROKE-13. The run list is no longer reverse-chronological and no version
notices.** Runs 217 (6h) and 216 (8h) were appended after run 201 (5d). vA, vB,
vC, vE and vF render raw array order. Every design treated fixture order as sort
order.

**BROKE-14. Docker's degraded third state is silently mapped onto "healthy" in
all ten.** The auth provider ships a `degraded` state and `credential_expired`;
every version has a two-valued healthy/blocked branch, so degraded reads as fine.

**BROKE-15. The Agents cancelled outcome renders with the queued mark; blocked
rows are ranked by the wrong clock.** `blockedFor`/`blockedAt` are supplied and
unread — `elapsed` is substituted, and it is the wrong number for two of five
rows. A 30-second approval wait and a 3-hour one are still unrankable, which was
pass 1's "cheapest gap to close, costliest to leave" and is now a design absence
rather than a fixture one.

**BROKE-16. `unresolved` leaks to the UI as if it were a Persona** (Agents), and
vB hides both unresolvable registry entries entirely —
`orchestrator-subagent-integration.md:L1334` says in as many words "Do not
silently filter." A registry entry that is not listed is indistinguishable from
one that never existed, which is the exact failure the rule exists to prevent.

### S4 — wrong numbers and wrong targets

**BROKE-17. Nobody reads `paging`, in any panel.** Search `total: 132` (six
versions print `48 in 14 files`; vC prints `1-48 of 48`), Actions `total: 320`,
Tests `total: 208`, Artifacts `412`, Source history `1842`. vC remains the
version most likely to tell a user they are looking at everything when they are
looking at 12% — now confirmed across four panels, in none of which it reads the
block.

**BROKE-18. Two versions open the wrong record.** vD-Actions resolves runs by a
non-unique run number and drills into the wrong one; vD-Agents opens the wrong
record on a duplicate agent name. Both are new: the enriched fixture introduced
the collisions that the old one could not.

**BROKE-19. Counts contradict bodies.** vD-Agents' hub claims 15 live and 16
resolving when 12 and 14 are true; vD-Source's hub undercounts locks by four;
vF-Source's filter chip promises 26 events over a 16-event feed; vB-Agents'
Running group is three states wide and the header counts all three;
`+N parallel contexts` now counts contexts that are not active.

**BROKE-20 (layout, and the one fit-sweep finding). xA3 overflowed its band at
240px and 320px. THIS FINDING IS CLOSED — the paragraph below describes the
state before the fix and its numbers are historical, not current.** The finding
was 104 R-tier findings over 8 combinations — R1 content wider than the box, R2
escape, R5 the panel scroller scrolling horizontally by 6px (friendly), 12px
(glass) and 16px (basic) at 240px, and 4px at 320px in basic only; retro clean.
Root cause was confirmed and was **not** xA3's column ladder — at 240px
`bucket()` returns 0 and no column renders. It was `_pm-motion.css:239`:
`.pmm-expand` was `display:grid` with an implicit `auto` column, and an `auto`
grid track cannot shrink below its item's min-content width, so an expanded
bundle wrapper widened the whole band instead of clipping. Both `min-width:0` on
`.pmm-expand > *` and `grid-template-columns:minmax(0,1fr)` were verified to
restore 240/240. It was reported rather than patched because the honest fix was
one line in the shared motion layer, which vA, x-docker and x-source also use,
and that blast radius was a human call rather than a contained per-version edit.

> **STATUS: FIXED AT THE KIT LEVEL (independently re-confirmed).** The human call
> was made and both remedies landed together in `_pm-motion.css`:
> `grid-template-columns: minmax(0, 1fr)` at `:252` and `min-width:0;
> min-height:0` on `.pmm-expand > *` at `:255`, with the rationale written into
> the rule. **xA3 measures 0 R-tier in every one of its 224 combinations**, in
> two independent sweeps run in this pass, and so does every other redesign. The
> latent risk in vA, x-docker and x-source is closed at the same time, which was
> the argument for fixing it in the shared layer rather than per version.
>
> **`104` is not a live number anywhere in this document.** Wherever the text
> above cites it, or says "every redesign is at zero R-tier **except** xA3", it is
> describing the pre-fix state. The count was real when written; it is not a
> current defect.

### What did NOT break, and is worth recording

- **The negative constraints held.** No version renders an automatic-retry
  affordance on a remediation ceiling (`FinalGUISpec.md:L3749-L3760`), and no
  version tints `cancelled`, `blocked` or `inconclusive` red ("never collapse
  into a red chip"). Both hold everywhere — though both hold because no version
  models the state at all, not because any version decided to withhold. The
  distinction matters if the states are ever implemented properly.
- **v0 is flat in all seven panels**, which is what makes every delta above
  credible.
- **Layout held, and now holds completely.** Zero R-tier for **all fifteen**
  redesigns across 3,584 combinations — `xA3` included since the `.pmm-expand`
  kit fix landed (BROKE-20). The control sits at 2,544 on the settled run (2,552
  on a cold first pass; see the warm-up note in the preamble). The earlier
  "fifteen of sixteen" phrasing counted xA3 as the exception and is superseded.
  **Independently re-measured in this pass**: two settled sweeps on the
  identity-checked server, all 16 versions registered, font gate green, zero page
  errors, and the two runs agreeing on **every one of the 3,584 combinations** —
  `0` differing cells, not merely equal totals. The nine fixes cost the matrix
  nothing.
- **Meaning improved without layout regressing, which is the harder half.** The
  second fix pass touched seven version files and the shared kit, and moved
  BROKE-3, -4, -5, -6, -8 and -12 to fixed while the R-tier count stayed at zero
  for all fifteen redesigns. Pass 1's warning — that a fix pass reporting success
  is not evidence — still stands; what changed is that this time the rendered text
  agrees with the report.

---

## 3. Blind spots — pass 3 status after the nine-file remediation

Pass 1 attributed 25 of these to the fixture. Pass 2 extended the fixture and
reclassified most of them as design. **Pass 3 (this pass) verified every row by
DRIVING THE RENDERED UI** on an identity-checked server, not by grepping source.
That distinction changed several answers in both directions, and the method
notes at the end of this section say where.

**Status vocabulary.** `closed` = rendered and reachable, verified in the DOM.
`partial` = reachable in some versions or only behind an interaction, or the
requirement is met in substance but not in the form the spec names. `open` = not
rendered anywhere. `fixture` = still unbuildable, and must not count against any
design.

| # | Blind spot | Panels | Cause pass 1 | **Cause now** | **Pass 3 status + evidence** |
|---|---|---|---|---|---|
| 1 | **`allowedActionIds[]` never becomes buttons.** Supplied per blocked row in Agents, Tests and Actions; read by nobody. `K.blocked` also ignores `severity`, so the `warning` tier renders nowhere. | Agents, Tests, Actions | fixture | **kit — fixed** | **closed (buttons) / partial (severity).** `K.blockedActions` now folds `allowedActionIds` into labelled buttons: vA/tests renders `Retry redaction`, `Open redaction profile`, `Authorize unredacted display` (8 action buttons across 6 blocks); vC/agents renders `Grant authority`, `Abort node` (11 buttons). Severity is live via `SEV_STATUS = {blocked, warning}` and a `pmk-blocked--sev-*` class, but the **`warning` tier only actually renders in vA and vC** (1 block each on Actions); vB, vE and vF paint every block `blocked`, and vD/git renders no blocked block at all |
| 2 | **Repo identity is nowhere.** `source.repo` carries name, owner, `nameWithOwner`, host, remote, lifecycle, visibility and two sibling repos. Ten of ten render none of it. | Source | fixture | **design — fixed** | **closed.** `jared-dev/tastebook` renders as visible text in **all nine** Source versions (vA–vF, xS1–xS3) at 380px. vF's header reads `REPO jared-dev/tastebook · private · github.com` |
| 3 | **Requested vs Effective identity block**, six exact labels (`CRAU:L927`). `docker.auth` ships the six labels, a `degraded` state and `credential_expired`. | Docker | fixture | **design** | **partial, and the row overstated what landed.** The *effective* half now renders: vD/docker shows `Registry identity — anonymous (rate-limited), The stored DockerHub token expired 3 days ago. — degraded`; xD1 shows the same plus the `credential_expired` code and a `warning` tier. But the **`Requested` value `jared-dev (DockerHub)` renders in no version at any width**, and none of the six labels (`Requested`/`Effective`/`Reason`/`Support`/`Inherited from`/`Overridden by`) render as a labelled pair. A reader sees what identity is in force and why, never what was asked for |
| 4 | **`retention_class`**, a required envelope field. Read by no version, in no menu, in no sheet. | Artifacts | fixture | **design — fixed in the x-variants** | **closed in xA1/xA2/xA3, partial elsewhere.** All three x-variants render `governed` and `debug_retained` as visible row text. vA and vE expose retention only through the **overflow menu** (`Retention class` head with per-class counts). vB, vC, vD and vF render it nowhere. Note the fixture spells the field `retention` (53 sites), not `retention_class`; the earlier row implied a field name that is not in the data |
| 5 | **Triage changed files + likely next action.** `changedFiles`, `changedCount`, `likelyNext` on all four triage blocks, rendered by nobody. | Actions | fixture | **design — fixed** | **closed in all six**, but at three different depths. Inline: vA (`2 changed files / src/services/import.rs / src/services/units.rs / Rerun after the parser fix lands on thread/import-fixes.`), vB (`Changed 2 files … Changed files src/services/import.rs, src/services/units.rs`), vF (`2 changed: src/services/import.rs, src/services/unit… / Next: Rerun after the parser fix lands on thread/imp…`, elided at 380). One interaction deep: vC behind the `Runs 26` lens, vD at hub → Runs → `#310`. **Menu-only: vE** puts the whole capsule inside an overflow menu as disabled items — reachable, but it is the weakest of the six treatments |
| 6 | **`redaction_failed` never suppresses the preview.** Three-state vocabulary, blocking reason and authorize route supplied. Zero references. | Tests | fixture | **design** | **partial.** Visible in vA and vE; menu-only in vC; **absent in vB, vD and vF**. Where it lands it is wired properly — the `Authorize unredacted display` route is gated (see row 20) |
| 7 | **The Run precondition set.** `runPreconditions` supplies five gates and the failing one's sentence. Run stays enabled while the set says it is illegal. | Tests | fixture | **design** | **open.** `Test runtime detected` and `Permission to run tests` render in **no version** at 380px. Unchanged from pass 2 |
| 8 | **Conflict resolution.** `conflicts[].sides[]` names both sides with per-side churn, `resolved:false` and `markersRemaining`. | Source | design | **design** | **partial, x-variants only.** `Ours - main` and `Theirs - thread/scaling-rounding` reach the UI in xS1, xS2 and xS3 — through the **overflow menu**, not as a resolution affordance. None of vA–vF render either side. `markersRemaining` is referenced 16× in x-source and 0× in the six full systems |
| 9 | **Worktree `recover`, `lock`/`unlock`, `prunable`.** All four flags drive action enablement; every version derived it from `lockedBy` alone. | Source | fixture | **design** | **partial.** `Recover` is now real, not a comment: visible text in xS1, menu item in vF and xS2. `prunable` is read in vC (5), vD (3), vF (5), xS1–3 (8). **vA, vB and vE still derive nothing from these flags** |
| 10 | **Host context: local vs remote, writable vs read-only**, `terminalCapable`. | Docker | fixture | **design** | **partial.** The host *list* lands only in the x-variants — `local (docker desktop)` is visible in xD1, xD2 and xD3 and in none of vA–vF. `read-only` reaches every version, but as a **menu string in vA, vB, vC, vE, vF** and as visible text only in vD and xD1 |
| 11 | **Compose scenario list**, `stale` badge, repair CTA. Four rows, two stale, with `drift` and a `repair` action. | Docker | fixture | **design, and still a regression** | **partial — 5 of 9, and the regression is half-closed.** Full and inline: **vF** at every width (`Integration matrix (postgres-16, …) · compose_file_changed · warning · 2 services added, 1 port remapped since this scenario was saved · Repair scenario`, and `Observability only · compose_service_missing · blocked · Service tempo is referenced by this scenario and no longer exists · Repair scenario`). Behind a lens: **vC** (`Compose 10`) and **xD2**, both with drift + repair. Default view but stale-only and width-gated: **xD1** (2 stale rows; drift and `Repair scenario` appear only at 480). Scenarios without drift or repair: **xD3**. **Still absent entirely in vA, vB, vD and vE** — those four files contain no `scenarios` reference at all. Caveat on the badge: vF never prints the word `stale`, encoding staleness as the drift code plus a `warning`/`blocked` tier |
| 12 | **Provenance badges** (`protected_core` / `bundled` / `user_created`) on all 16 registry entries. **Requested vs effective persona** likewise. | Agents | fixture | **design** | **open in five of six.** Only **vF** renders provenance (`protected_core` and `bundled` visible, `user_created` in menu). vA, vB, vC, vD and vE render none of the three tokens anywhere. This is the least-improved row in the section |
| 13 | **Gap rendering / `truncation_state`** and **generated-media expiry** (expired provider URL, `expiredAgo`, C2PA caveat). | Artifacts | fixture | **design** | **partial, x-variants only.** `expired 4h ago` is visible in xA1 and xA2, menu in xA3; the `C2PA` caveat is menu-level in all three. vA reaches expiry through the menu only; **vB, vC, vD and vF render neither** |
| 14 | **Object/record identity + `/record` routes.** Five rows, five `objectKind` values. | Search | fixture | **design + spec** | **open, and correctly so.** `/record/run/47` and `Orchestrator run #47` render in no version. `objectKind` is referenced in zero version files. F3-047 still ships no row spec — **this one needs a spec before it needs a design**, and should not be counted against any version |
| 15 | **No-silent-local-fallback statement** and **`Index build cancelled`.** | Search | fixture | **design** | **partial — the cancelled build closed, the fallback statement did not.** `Index build cancelled` is visible in vA, vB, vE and vF, with `Start a fresh build` visible in vA and vE and in vF's menu. **vC and vD render neither.** The remote-unavailable sentence was not confirmed rendering anywhere in this pass |
| 16 | **`cancelled` / `inconclusive` marks.** BROKE-12. Two map entries; unfixable in any version. | Actions, Tests | — (new) | **kit — fixed** | **closed.** Authority moved from the kit's hard-coded map to `PM_DATA.status`, which now carries **11 tokens**. Measured in the live registry: `queued` = circle/solid, `cancelled` = **slash/dashed**, `inconclusive` = **info/dotted** — all three pairwise distinct, so the pixel-identical collision is gone. `K.statusOf` now warns loudly on an unknown token instead of silently aliasing to `queued` |
| 17 | **No list keyboard model.** No roving focus, Home/End, type-ahead or Escape-to-deselect on any list in any version. | all seven | kit | **kit — fixed** | **closed, verified by real keystrokes** (not synthetic events) in two versions. vA/agents, 12 rows: ArrowDown/ArrowUp step, End → row 11, Home → row 0, typing `s` jumps to `Schema Cartographer`, Enter fires `pm:select` and sets `is-selected` + `aria-pressed`, Escape fires `pm:deselect` and clears both. vF/agents, 21 hand-rolled `.vF-ev` rows: identical behaviour. **Single tab stop confirmed structurally** — row tabindex reads `-1,-1,-1,0,-1,…` (exactly one `0` of 21). Two caveats: vF's rows carry no `data-pm-key`, so `pm:select` fires with an **empty identity**; and vF's type-ahead matches the leading elapsed-time column (`9` → `9m lane-c web worker`), not the agent name |
| 18 | **Row activation dispatches nothing.** `_pm-shell.js` had no row-activation handler, so §7.7's 240px behaviour was never testable. | Agents (all in practice) | — | **harness — fixed** | **closed.** `_pm-shell.js:389 activateRow` now dispatches a real bubbling `pm:activate` carrying key, identity, resolved primary action, `how` (click vs key), version and panel, and toasts `pm:activate dispatched. The prototype acknowledges the intent; it does not navigate.` It does **not** stop propagation, so a version's own navigation still runs alongside it — confirmed by vD drilling hub → Runs → `#310` while the toast fired |
| 19 | **The detach grip** and its mandated tooltip (`FinalGUISpec.md:L820`). `PMK.head` had no slot; the harness had no affordance. | all seven | kit | **kit + harness — fixed** | **closed.** A `[data-pm-grip]` control renders in every version sampled (vA, vC, vF, xD1), measures exactly **24×24**, names its surface (`Docker Manager`) and carries the mandated tip `Drag to detach, or double-click to pop out.` `activateGrip` answers double-click and dispatches `pm:detach` |
| 20 | **The `strong`-action confirmation gate.** Pass 1 claimed no confirmation affordance existed; **that was wrong** — `_pm-components.js:498` `PM.confirm` is a real modal sheet. Zero versions called it. | Source, Tests, Docker, Search | kit (wrongly) | **design — fixed** | **closed in all nine files, with one real defect left.** Driven live, one destructive action per file, each opening a `role="dialog"` `aria-modal="true"` sheet with scope and consequence: vA `Discard all changes`, vB `Discard changes`, vC `Discard changes`, vD `Authorize unredacted display`, vE `Remove worktree`, vF `Remove worktree`, xS1 `Discard changes in recipeDraft.ts`, xD1 `Delete scenario worker?`, xA1 `Export evidence bundle?`. **The defect: focus capture fails in vC and vD when the gate is opened from a MENU item.** Seven files defer the `PM.confirm` call by one macrotask so the closing `pm-menu` cannot pull focus back to its trigger; vC (`openGate`, `vC-lens-deck.js:574`) and vD do not. Measured: with the sheet open, `document.activeElement` is `BUTTON.pm-menu-trigger` **outside** the dialog, and stays there for at least 1s. vD's *button* path (`data-vd-confirm`) is unaffected. An `aria-modal` dialog with focus outside it is precisely the failure the component exists to prevent |
| 21 | Docker **first-open disclosure cards**; **receipt detail / publish history**; **template-repo 9-state enum**; **k8s workloads**. | Docker | fixture | **fixture** | **fixture.** Unchanged; must not count against any design |
| 22 | Tests **runtime-disabled body replacement**, **zero-failure empty state**, the **entire P2 depth tier**, **visible-session controls**. | Tests | fixture | **fixture** | **fixture.** The enrichment added disabled/degraded runtime states to `docker` but not to `tests`. Still unbuildable |
| 23 | Actions **runner labels**, **pin health**, **`unknown` observation state**, `staleness_reason_code`; **variables and environments** as distinct inventories. | Actions | fixture | **fixture** | **fixture.** Unchanged |
| 24 | Agents **§7.19 audit summary row**, **time-range query and export**. | Agents | fixture | **fixture, deliberate** | **fixture, deliberate.** `_pm-data.js:1360-1362` records the decision: a second surface, not a field, left out rather than faked |
| 25 | Source **`conflict` as a worktree status**; **simplified-summary vs full-detail mode**; **untracked as its own counted group**. | Source | mixed | **fixture** (status), **design** (mode), **spec** (untracked) | **mixed, unchanged.** No pass-3 movement |
| 26 | Docker **registry `pull` / `inspect`**. | Docker | spec | **spec** | **open (spec).** Neither `cmd.docker.pull` nor `cmd.docker.image.pull` is registered; `inspect` is absent from every menu. Needs a catalog entry before a design |
| 27 | Artifacts **audit surface entry point**; **provider-native detail** (`providerEntryId`, `accountProfileRef`, `mediaRouteId`, `permissionSnapshotId`). | Artifacts | genuine / fixture | **design** | **open.** `providerEntryId` appears once in the fixture and in no version file. Unchanged from pass 2 |

### Pass-3 tally

Of the 27 rows: **7 fully closed** (1-buttons, 2, 5, 16, 17, 18, 19, 20 — counting
20 as closed with a named defect), **9 partial** (1-severity, 3, 4, 6, 8, 9, 10,
11, 13, 15), **4 open on design or spec** (7, 12, 14, 27), **1 open on spec
alone** (26), and **5 still fixture-blocked** (21-25).

The three rows pass 2 called kit or harness — **16, 17, 18, 19** — are now all
closed, and they closed at the layer that owned them. That is the cleanest result
in this pass: no version author could have fixed any of them, and none had to.

**The two rows that moved least are 12 and 7.** Provenance badges land in exactly
one version of six, and the Run precondition set lands in none. Both have full
fixture support and neither needs a spec. They are the cheapest remaining wins.

### Corrections this pass made to its own report

Honesty about method matters more here than a clean table, and pass 1's
`PMK.confirm` error (row 20) is the reason this subsection exists.

1. **Row 11's "nine of nine render none" was true when written and is now
   wrong** — but the fix is partial, not complete, and the table above says
   5 of 9 rather than rounding up.
2. **Section 4 claims v0 is the only version with the compose scenario list.
   That claim survives scrutiny, but a fixture-string scan appears to refute
   it.** v0 hard-codes its own scenario names (`import-load — worker x3`, with a
   `stale` chip and a Run button whose tooltip reads `Scenario is stale: compose
   file changed since it was saved — edit to refresh`), inside a
   `data-pm6-dm-view="compose"` subview. Searching the rendered DOM for the
   *fixture's* scenario names returns nothing for v0 and would wrongly score it
   as not having the feature. **Any future pass that greps for fixture values
   must not conclude v0 lacks a feature** — v0 predates the fixture and
   hard-codes everything. v0 does genuinely lack a `repair` CTA (zero `Repair`
   strings).
3. **Row 4 named a field that does not exist.** The fixture spells it
   `retention`, not `retention_class`; the latter appears once, in a comment.
4. **"Rendered by nobody" claims based on grepping emitted markup understate
   three designs.** vE's Actions triage, vA/vE's retention and the x-source
   conflict sides all live inside `<template data-pm-items>` menu payloads,
   whose text is invisible to a `textContent` scan and to a naive innerHTML
   grep of the panel body. Pass 3 scanned visible text and template payloads
   **separately** and reports which channel each finding used; a requirement met
   only inside an overflow menu is marked `partial`, never `closed`.

### Method note — why pass 3 trusted the DOM over the source

Source greps disagreed with the rendered result in **both** directions this
pass. vC, vD and vE all reference `changedFiles` in source, yet none of the three
renders it in the default view — vC needs a lens, vD needs two drill levels and
vE needs a menu opened. Conversely vF's `.vF-ev` rows carry no keyboard code of
their own and pick the whole model up structurally from the kit. Neither fact is
visible in a grep, and a pass that greps will report the first group as closed
and the second as open. Every `closed` above was reached by setting the combo,
clicking or typing, and reading back the DOM.

---

## 4. Introduced regressions vs v0 — carried forward and updated

Things the **shipped app already does** that the bakeoff dropped. Invisible to a
coverage score, because a redesign can rank first and still be a step backwards.
Pass 2 status in the last column.

| Lost | Who has it | Who dropped it | Pass 2 status |
|---|---|---|---|
| **Compose scenario list** with `stale` badge and repair CTA (`CRAU:L148`) | v0 only | **4 of 9 Docker redesigns** (was 9 of 9) | **Pass 3: half-recovered.** vF renders all four scenarios inline at every width with `drift`, `driftSummary` and a `Repair scenario` CTA; vC and xD2 render the same behind a lens; xD1 renders the two stale rows in its default view with drift and repair at 480 only; xD3 renders scenarios without drift or repair. **Still absent in vA, vB, vD and vE**, which contain no `scenarios` reference at all. Badge caveat: vF never prints the word `stale`, encoding it as the drift code plus a `warning`/`blocked` tier. v0 itself has no `repair` CTA — its stale row offers Run with an explanatory tooltip |
| **Failure triage: changed files + likely next action** (`GitHub_Integration.md:L920`) | v0 only | **none — closed in all 6** | **Pass 3: closed.** All six Actions redesigns now render both fields, at three depths: inline in vA, vB and vF; behind the `Runs` lens in vC; two drill levels down in vD (hub → Runs → `#310`); and **menu-only in vE**, which is reachable but the weakest treatment. Verified by driving the UI — a source grep alone would have scored vC, vD and vE as still missing, since all three reference `changedFiles` but render nothing in the default view |
| **`Open` / `Watch` pair on `browser_recording`** (RAP-021) | v0, xA1, xA2, xA3 | all 6 full systems | Unchanged |
| **GI-021 capability sentence** ("you can view runs but cannot dispatch") | v0 only | all 6 Actions redesigns | **Worse.** `capabilitySentence` is now literally in the fixture and read by nobody (BROKE-6) |
| Worktree **filter bar** (`All / Threads / Orchestrator / Manual`) | v0, vA, vC, xS1, xS2 | vB, vD, vE, vF, xS3 | Unchanged |
| Expanded worktree detail (**Path / Base / Age**) | v0, vD, xS1, xS2, xS3 | vA (none), vB/vC/vE (partial) | **Complicated by BROKE-3.** The variants that render the detail now render its `Lifecycle` field wrongly. Rendering it and rendering it correctly are now different questions. v0's `age 2h` remains fabricated — the fixture has no age field |
| Visibility value chip (`show_when_possible`) | v0, vA, vC, vD, vF | vB, vE | Unchanged |
| `Sources (N)`, redaction count, provenance line on artifact rows | v0, x-variants | vF, several partial | Unchanged |
| **NEW — a working Artifacts panel** | v0 and 9 others | **vB** | vB threw on the enriched data (BROKE-1). **Fixed this pass**; listed because it is the only regression pass 2 introduced and the only one that was a total loss |

Search and Agents still have **no** regressions: v0 sits at 33% and 6% and holds
nothing the field lost.

**The pattern worth naming.** Four of the nine rows are the same failure mode:
v0 hard-codes a string, the redesigns correctly refuse to hard-code, the fixture
did not carry the data, and pass 1 scored that as reasonable. The fixture now
carries all four, and the redesigns still render nothing. **These are no longer
principled abstentions. They are gaps.**

---

## 5. If you pick X, add Y

Top two per panel, updated. Pass-1 items that still stand are kept; pass-2 items
are marked **NEW**.

### Search — pick vA or vC (both 73, and the tie is now real)
- **vC Lens Deck (73%).** **NEW:** fix the freshness map — it was built from the
  stale inline comment at `_pm-data.js:208`, not the shipped `states` array, so
  it raises a false alarm on healthy and drops `cancelled` (BROKE-7). **NEW:**
  render `S.remote.sentence` and disable Evict when `available:false` — the
  cheapest high-value fix in the panel. Make the Index lens *writable*. Fix the
  footer: `1-48 of 48` against `paging.total = 132`.
- **vA Ledger (73%).** **NEW:** the indexing toggle is hardcoded `On` and renders
  `DISABLED` and `Indexing On` side by side. Still add the **replacement field**:
  at bucket 2 it emits a caret promising "Show the replace row" for a row the
  panel never renders — the affordance actively lies.
- **Not vB** (71%, and it fell furthest in this panel): it states a falsehood
  under five of six index states and at 240px states it alone. `Replace All`
  still exists nowhere.

### Source Control — pick xS1, else xS3
- **xS1 Commit Desk (82%, still the highest anywhere).** **NEW and mandatory:**
  the four `versions/x-source.js` corrections, each a handful of lines —
  (1) `Lifecycle` must read `w.lifecycle`, not `statusOf(w.status).word`;
  (2) a null `path` must render an explicit absent state carrying
  `reservedSentence`, not vanish; (3) the lock sentence must switch on
  `lockReason` family and use the fixture's own `preservedSentence` /
  `orphanSentence` / `releasedSentence`; (4) `activeContexts()` must filter on
  `lifecycle`, not `run`. Then the pass-1 additions: `Open Review Mode` on
  worktree rows, a counted untracked group, `resolve_conflict_side`.
- **xS3 Review Queue (76%)** overtakes xS2 (75%). **NEW:** its conflict card
  contradicts itself on the add-add conflict. It also dropped the worktree
  filter bar. Same four shared-file fixes apply.
- If you need **one system across all seven panels**, vA (69%) is still the
  Source answer, and the required addition is still the **conflict group**: its
  two `U`-coded files land in the unstaged list, so `Open Conflict Assistant`,
  `open_merge_editor` and `mark_conflict_resolved` are unreachable.

### Actions — pick vC, else vA (vD drops to third)
- **vC Lens Deck (71%).** Now clearly the best blocked-state renderer at row
  level — code, verbatim message and a real button at every width. **NEW:** its
  account banner **vanishes entirely at 240px on its default lens**. **NEW:**
  read `repository.lifecycle` and stop offering live mutation on an archived
  repo. Still: restore triage changed-files + likely-next, add `Open related
  diff`/`worktree`, fix `1-24 of 24` against `total: 320`.
- **vA Ledger (65%) is the new runner-up** and the most robust blocked-state
  renderer at narrow widths — it renders `#17`'s code, message and button in
  full at 240px and holds the run number at every bucket. **NEW:** its cancelled
  row is the one that loses its status word to meta overflow at 380px.
- **vD Drill Stack (68%) took the largest drop and is no longer a safe second.**
  **NEW:** its job level resolves runs by a **non-unique run number and can open
  the wrong one**, and its run list shows no blocked state at all. It remains the
  only version with a job level and the only one handling account-change
  invalidation.
- **Avoid vE (51%)** — the version the enriched data damaged most: truncated
  reason codes, six rows losing their run number at 240px, no status word
  anywhere, no branch token below 480px.

### Docker — pick xD3, else xD1
- **xD3 Command Line (75%).** **NEW and sharp:** the roster path to Docker /
  Hosts is a dead end that says "Nothing in this runtime or the command
  catalogue matches" while `>host` returns 11 commands (BROKE-4). Fix the scoped
  feed before anything else. Still: add `Explain this state`, the first
  `allowed_action_ids[]` entry on the `xD3-why` line, the stale/read-only
  runtime marker, and restore the Compose scenario list.
- **xD1 Triage Board (73%).** Alone among the ten it does **not** assert that the
  host rows do not exist. Still: promote `Explain this state` below bucket 3,
  render the runtime stale marker, add registry `pull`/`inspect`, restore the
  scenario list. Its CRAU-009 treatment remains the best in the field.
- **Best full system is vC (69%)**, the only one rendering every subview — but
  **NEW:** it is one of the four that announces the host rows do not exist.
  Avoid vA for Docker: `var active = 'containers'` is hard-coded.
- **For all ten:** the panel has no surface for identity, host context or
  capability — only for inventory. Every version is a list of things you own;
  none is an account of what you are allowed to do with them, which is what the
  Publish / Unraid story is made of.

### Tests — pick vD, else vA (vC and vA converge at 72)
- **vD Drill Stack (74%).** **NEW:** at 240px it renders **four identical run
  rows**, one of them the cancelled run — `PMK.elide`'s `path` branch needs two
  `/` separators and no run name has any, so it tail-cuts the discriminating
  token. **NEW:** it offers "Re-run" as the only forward action on a blocked run.
  **NEW:** it reads one of five `runPreconditions` and gets the answer wrong.
  Still: finish R8, derive run-row button enablement from status.
- **vA Ledger (72%)** is now level with vC and lost the least (-2, ordering
  only). The straightforward second pick.
- **vC Lens Deck (72%).** **NEW:** it clips `inconclusive` to `inconclu…`. Still:
  add a runtime-disabled branch, replace the hard-coded `redaction_clean` with a
  real read plus a failed branch, render the redaction notice at panel scope.
- **All six, one line each:** change run-row `idKind` to `'ref'`. And **the two
  kit lines from BROKE-12 must land first** — without them no Tests design can
  distinguish its two newest statuses however it is authored.

### Agents — pick vA, else vC
- **vA Ledger (69%, and it went up).** The only version rendering all five
  blocked episodes with codes, sentences and a full action bar. **NEW:** that
  action bar is the same fixed triple on all five rows and is correct on one —
  read `allowedActionIds[]` (BROKE-9). Still fix `withState()` at
  `vA-ledger.js:1432-1437`, which selects only `running`/`blocked`/`queued` and
  drops the `attention`, `prohibited` and `stale` agents entirely.
- **vC Lens Deck (65%, +5, the biggest gain in the audit).** The only version
  rendering all 15 active rows *and* all six reason codes. **NEW:** its registry
  lens announces a broken entry as "Queued" and tells the user it resolves to
  persona `unresolved` (BROKE-16). Still: render owning thread as text, stop
  letting `note`/`sentence` beat `target`.
- **vF is disqualified for Agents** (BROKE-2) — the only score that fell.

### Artifacts — pick xA2, else xA1
- **xA2 Casefile (74%).** **NEW:** the three-line `blockedReasonCode` fix in
  `x-artifacts.js` (BROKE-8) — shared with xA1 and xA3, so one edit fixes three
  files. **NEW:** its record-only eviction mechanism does not fire on the evicted
  row. Still: restore family as a first-class filter axis, and note that 23 of
  the rows land in the Unfiled pool, so the exception covers a majority.
- **xA1 Glyph Column (66%)** over xA3 for the port, because **xA3 carries the
  only live layout defect in the bakeoff** (BROKE-20). Both still need the entire
  investigation layer — R8, R9, R10 absent, neither touches `R.bundle`.
- **All ten: stop binding identity to `r.title`.** Seven of ten do, and the
  brief's §11.2 opens by stating the envelope has no title field. The three that
  have a fallback should extend it through `summary` and terminate at a truncated
  `artifact_id`.
- **The merge still reaches roughly 90%** — xA2's casefile + xA3's kind-run
  headers + vA's bridge-field viewer + vC's freshness x health strip — but it now
  has to import **four fixes as well as four features**, and vC's strip is
  fabricated (BROKE-8's sibling: it is hard-coded to `healthy` and the rows
  contradict it).

---

## 6. Honest disagreements between audits

Reported rather than averaged.

**1. Whether `PMK.confirm` exists — and pass 1 was wrong.** The Tests re-audit
found `PM.confirm` at `_pm-components.js:498`: a real modal sheet, scrim,
`role="dialog"`, `aria-modal`, focus capture, no auto-close, documented at `:9`
as "replaces confirm()". The Docker re-audit, grepping only `_pm-kit.js`,
independently reports "there is no `PMK.confirm`, `PMK.sheet` or `PMK.dialog`"
and classes the confirm gate as **kit**-blocked. **Both are literally true and
the Tests reading is the decision-relevant one:** the component exists in the
components layer, it is simply not re-exported through `PMK`, and zero versions
call it by either name. Pass 1's headline recommendation ("build `PMK.confirm`")
was based on a grep restricted to the kit. Treat the confirm gate as **design**,
not kit, and treat this as the cheapest open item in the report.

**2. Whether the list keyboard model exists.** Unchanged from pass 1 and still
unresolved. Source scores it present for nine of ten; Actions for six of seven;
Agents for all six. Search scores it **partial for all seven** and shows its
work: grepping for `ArrowDown`/`Home`/`End` finds handlers only inside `pm-menu`
and `pm-select`. The other three credited `tabindex="0" role="button"` as the
model. **Treat it as unmet.** One fix in `_pm-kit.js`, not six, and it changes
nothing about which design wins.

**3. Whether a menu item counts as a feature — now with evidence that it should
not.** Every audit adopted "reachable through an overflow counts as present" and
every audit is uncomfortable with it. Pass 2 supplies the test case: xD3 scores
highest in Docker largely because a command index reaches everything, and
BROKE-4 shows its roster path to those same commands returning "Nothing matches".
**A reachable command and a working destination are different things, and the
scoring rule cannot tell them apart.** Discount xD3, vF-Actions and vE-Tests by
feel; do not discount xS1, vD-Tests or xA2, whose coverage is mostly rendered
surface.

**4. Whether the fixture was ever the real blocker.** The audits split, and the
split is informative. **Agents** says the fixture was a genuine block — five of
six versions improved with no edit, because the ceiling and session states simply
had no rows. **Search** says the opposite in the strongest terms: "no requirement
moved up for any version", and two moved *down*, because `index.state` was always
a variable and six of seven built a surface that renders correctly for one value.
**Docker** splits the difference: the pass-1 hypothesis was "only half right" —
the fixture was blocking six requirements, but unblocking them revealed no latent
capability, because the additions were new *keys* that no version reads.
**Artifacts** is bluntest: the fixture was a real limiting factor for exactly one
of four requirements, and for that one it was hiding a partial credit, not a full
one. **The defensible synthesis: the fixture blocked a minority of requirements
and concealed a majority of defects.**

**5. Percent still does not capture "the panel cannot do its job" — and pass 2
makes it vivid.** vB scores 50% on Source, above vF at 44%, while the same audit
calls its composer defect the most damaging single omission in the bakeoff. vD
scores 52% on Docker while carrying a silent substitution of a mandated
disclosure. And vB-Artifacts scored 52% in pass 1 for a panel that, on the very
next fixture, **could not draw a single pixel**. **Read section 2 for any version
you are seriously considering; the ranking will not tell you.**

**6. Where the shared-file variants agree too much.** xS1/xS2/xS3 share
`x-source.js` and xA1/xA2/xA3 share `x-artifacts.js`. Four of the Source
findings and two of the Artifacts findings are one defect each, counted three
times, because the file is shared. This **flatters the fix estimate** (one edit
repairs three versions) and **flattens the comparison** (the three variants
cannot differ on anything the shared block decides). Neither audit adjusted for
it; both flagged it.

**7. v0's worktree `Age`.** Carried forward unchanged: Source lists it as a
requirement no version satisfies *and* credits v0 with rendering it. Both are
true — v0 prints `main - age 2h`, the fixture has no age field, so v0 fabricates
it and nine of ten correctly declined. Not a regression.

---

## 7. The pick, on feature grounds alone

| Panel | Pick | Coverage (before -> after) | Runner-up | Changed? |
|---|---|---|---|---|
| Search | vA Ledger or vC Lens Deck | 75 -> **73** (both) | the other | vB drops out of the tie |
| Source Control | **xS1 Commit Desk** | 90 -> **82** | xS3 Review Queue (76) | xS3 overtakes xS2 |
| Actions | vC Lens Deck | 75 -> **71** | vA Ledger (65) | **vD loses second place** |
| Docker | xD3 Command Line | 75 -> **75** | xD1 Triage Board (73) | no |
| Tests | vD Drill Stack | 78 -> **74** | vA Ledger (72) | vA joins vC at second |
| Agents | vA Ledger | 67 -> **69** | vC Lens Deck (65) | no |
| Artifacts | xA2 Casefile | 76 -> **74** | xA1 Glyph Column (66) | **xA1 over xA3** (xA3 has the layout defect) |

**Every pass-1 pick survives.** That is the reassuring result, and it should not
be over-read: the picks survived because the defects pass 2 found are broadly
distributed, not because the winners are sound. xS1 lost 8 points and needs four
corrections in a shared file before it is safe to port. vC-Actions lost its
account banner at the narrowest width. vD-Tests renders four identical rows at
240px. **Being first is not the same as being finished.**

**Order of work, cheapest first.** Every item below is a defect, not a feature,
and every one is worth doing before the port rather than after:

1. **Two lines in `_pm-kit.js`** — `GLYPH`/`DASH` entries for `cancelled` and
   `inconclusive`, or better, one line making `statusMark` read
   `K.statusOf(token).glyph`/`.rail`. Repairs Actions and Tests at once and
   defuses Source and Search. **No design can do this itself.**
2. **One line in `_pm-kit.js:257`** — make `K.blocked` honour `allowedActionIds`
   and `severity`. Unblocks the highest-value Agents fix and the `warning` tier.
3. **Four fixes in `versions/x-source.js`** — repairs xS1, xS2 and xS3 together
   and returns the leading pick to roughly its pass-1 standing.
4. **Three lines in `versions/x-artifacts.js`** — `r.blockedReasonCode`, which
   moves R11 and R12 in all three Artifacts variants.
5. **Call `PM.confirm`.** It already exists. Six designs need to reach for it.
6. **Decide `_pm-motion.css:239`** — BROKE-20. `min-width:0` on `.pmm-expand > *`
   is one line and fixes xA3's overflow, but the motion layer is shared with vA,
   x-docker and x-source. **A human should make this call.**
7. **Read `paging.total` anywhere at all.** Five panels, five wrong footers.

**The caveat that applies to the whole table** is unchanged: three of the seven
picks are panel-scoped variants, so this is not a single design system. If the
port needs one system, take **vC** (68% mean, still the best full system) and
budget the Source conflict group, the Agents thread-on-row fix, the Tests
runtime-disabled branch, the Actions 240px banner, and the paging fix.

---

## Appendix — what the two passes measured, and why both were needed

| | Pass 1 (nominal fixture) | Pass 2 (adversarial fixture) |
|---|---|---|
| Question | is the feature present? | is what is present *true*? |
| Typical finding | an omission | a false assertion |
| Best score | 90% (xS1) | 82% (xS1) |
| Scores that rose | — | 8 (5 in Agents, 3 in Docker) |
| Scores that fell | — | 21 |
| Total failures | 0 | 1 (vB Artifacts, fixed) |
| Fit-check R-tier | 0 for every redesign | 0 for every redesign except xA3 |

**The fit check passed both times and was never the point.** 3,584 combinations,
twice, with the control pinned at exactly 2,576 R-tier — and it could not see a
panel that throws, a row that renders the word `undefined`, a merged worktree
announced as broken, or two run states that became the same grey circle. A
geometry checker measures whether a design fits. Only data variety measures
whether it is honest. **The fixture extension cost the field an average of five
points and bought the first evidence in this bakeoff about which designs are
correct rather than merely well-proportioned.**
