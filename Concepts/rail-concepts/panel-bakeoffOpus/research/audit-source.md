# SOURCE CONTROL panel — feature audit, PASS 2 against the enriched fixture

This supersedes the first pass. Same scope: does each redesign of the `source`
panel **contain** what `research/source.md` says it must. Layout fit is measured
elsewhere and is not re-litigated.

Versions audited (10): `v0` shipped baseline (control), the six full systems
`vA vB vC vD vE vF`, and the three panel-scoped variants `xS1 xS2 xS3` from
`versions/x-source.js`.

Legend: **Y** present · **P** partial · **-** absent.

---

## 0. Why this pass exists, and what it found

The first pass ended with fifteen blind spots, nine of them attributed to the
fixture: `_pm-data.js` never carried a `blocked_preserved` worktree, never
carried a repo object, never carried `node_id`, never carried a conflict with
two named sides. Kit rule 8 says all content comes from that file, so a version
author who scored "absent" was obeying the rules. The fixture has now been
extended with adversarial state variety. This pass re-runs the same checklist
against it.

**The headline result is negative, and it is the most important thing in this
document.** Not one of the ten version files reads a single new key. Verified by
grep across `versions/*.js` for `repo`, `conflicts`, `lifecycle`, `prunable`,
`repairable`, `worktreeId`, `laneId`, `nodeId`, `attemptId`, `age`,
`preservedSentence`, `orphanSentence`, `reservedSentence`, `releasedSentence`,
`sides`, `markersRemaining`, `nameWithOwner`, `siblingCount`: zero real hits.
The only matches are coincidental substrings (`lockedBy`, `Manage`, `message`,
`Swap compare sides`).

So **no requirement moved from absent to present.** The first pass's hypothesis
— that these were fixture-blocked design questions the authors would have
answered if asked — is falsified for this panel. What the enriched data did
instead was make the existing designs render the new states *wrongly*, because
every one of them was built on a set of implicit assumptions the old fixture
never contradicted:

- that a worktree always has a path on disk;
- that a lock always means "an active run owns this";
- that the shared status pill is the same thing as the lifecycle state;
- that every worktree in the array is a parallel active context.

All four are now false in the data, and all four produce visible defects.
Section 4 names them.

### What is new in the fixture (source section only)

| Addition | Where | Poses |
|---|---|---|
| `source.repo` — name, owner, `nameWithOwner`, host, remote, lifecycle, visibility, `siblingCount: 2`, siblings | new key | GI-005 repo identity |
| `source.conflicts[2]` — `sides[]` with per-side churn, `hunks`, `markersRemaining`, `kind`, `base` (one is **null**), `resolved: false` | new key | `resolve_conflict_side`, three-way base |
| Worktrees 8 to 12 — four appended rows carrying `reserved`, `orphaned`, `released`, `blocked_preserved` | new rows | the reserved lifecycle vocabulary |
| `lifecycle`, `age`, `worktreeId`, `laneId`, `nodeId`, `attemptId`, `locked`, `prunable`, `repairable` on every worktree | new fields | W-014 identity triple, `:L439` enablement flags |
| `path: null` on `orch/lane-e-search` (reserved, no checkout on disk) | new value shape | identity fallback |
| A third lock family, `worktree_preserved_at_safe_point`, plus `preservedSentence` / `orphanSentence` / `reservedSentence` / `releasedSentence` | new fields | W-019 reason-family templates |
| `add` / `del` churn on every changed file | new fields | diff-stat magnitude |

### Method

Rendered, not read. Every claim below is taken from a real Chrome render of the
panel served by the identity-checked harness at `http://127.0.0.1:47821`
(`__whoami` reports harness `puppet-master-panel-bakeoff`, root
`Concepts/panel-bakeoff`, `dataSha1 169fa176b09e`). Panels were built through
`PM_BAKEOFF.buildStage` at 240 / 380 / 480, then driven interactively —
accordion expands, drill pushes, lens switches, row selections, `+N` menus — and
the resulting `innerText`, `aria-label` set and `.pmk-kv` pairs were dumped.
Automated scan for `undefined` / `null` / `NaN` / `[object Object]` in visible
text and accessible names across all 30 combinations: **clean**. The failures in
this panel are not raw-token leaks; they are confident wrong answers, which is
worse and is why they needed rendering to find.

---

## 1. Requirement checklist

Unchanged from pass 1. MUST = the brief cites a Plans requirement. SHOULD = the
brief recommends it. Items the brief marks as an open question (§10.1 missing
command IDs, §10.4 amend/sign-off, §10.6 local worktree merge, §10.7 state-key
collision, §10.9 Rebind/Start fresh) are excluded, as is the GI-007 safe-point
retry confirmation, which §6 states "is a dialog, not a panel row".

### Container and chrome

| # | Kind | Requirement | Plans citation |
|---|---|---|---|
| 1 | MUST | All five canonical views exist: Changes, History, Graph, Worktrees, Branches / Stash | GI-004, `GitHub_Integration.md:L344-395`, `:L90`; `UI_Command_Catalog.md:L566` |
| 2 | MUST | Canonical **display order**; Worktrees promoted only through the user-controllable pinned-sections mechanism, never a hard reorder | `source.md` §1; `FinalGUISpec.md:L719-725` |
| 3 | MUST | Recorded progressive-disclosure defaults: Changes + Worktrees default-open, History / Graph / Branches-Stash default-collapsed, expansion remembered | `FinalGUISpec.md:L719-725` |
| 4 | MUST | Accordion headers are accessible **buttons** carrying item count and expanded/collapsed state in the accessible name | GI-004, `GitHub_Integration.md:L92` |
| 5 | MUST | Two-level scroll model: sections scroll internally, the outer accordion scrolls; no third scroller / card wrapper | `GitHub_Integration.md:L160`; `FinalGUISpec.md:L2133` |
| 6 | MUST | Context header is a **button/picker** over repo + branch + worktree identity with per-option disabled reason — never a native `<select>` | GI-005, `GitHub_Integration.md:L397`, `:L100`; `FinalGUISpec.md:L2133-2134` |
| 7 | MUST | W-018 strip shows `primary_active_context` plus `+N parallel contexts`; `+N` is never dropped at any width | `WorktreeGitImprovement.md:L1749`, `:L293`; `source.md` §5 |
| 8 | MUST | `+N` opens a drilldown listing **every** active worktree with run/node/attempt identity, worktree, branch, status and a blocked/conflict indicator | `WorktreeGitImprovement.md:L293` |
| 9 | MUST | Strip numerals survive to 240px: ahead/behind, `dirty_file_count`, `conflict_file_count` | `WorktreeGitImprovement.md:L295`; `source.md` §5, §8 |

### Changes and the composer

| # | Kind | Requirement | Plans citation |
|---|---|---|---|
| 10 | MUST | Changes groups staged / unstaged / untracked as distinct groups with counts | `GitHub_Integration.md:L90`; `source.md` §4a, §8.4 |
| 11 | MUST | Conflict group rendered when `conflict_file_count > 0`, never folded into modified, with `Open Conflict Assistant` as its action | `source.md` §2 P0, §3, §8.4; `GitHub_Integration.md:L90` |
| 12 | MUST | Conflict row commands: `open_merge_editor`, `resolve_conflict_side` (ours/theirs/base/manual, approval-gated), `mark_conflict_resolved`, `conflict_apply_resolution` | `source.md` §3 conflict group; `WorktreeGitImprovement.md:L451` |
| 13 | MUST | Two-line changed-file row: status letter + basename line 1, dimmed middle-truncated dirname line 2, **full path in the accessible name** | `source.md` §4a, §9.2; `WorktreeGitImprovement.md:L238`, `:L287` |
| 14 | MUST | Per-row stage / unstage / discard (destructive) / open diff | `source.md` §4a; `UI_Command_Catalog.md:L551-573` |
| 15 | MUST | Compare target labelled with its source; deterministic per-group defaults (staged HEAD-index, unstaged index-working, untracked empty-working, history commit-first parent, conflict three-way) | `WorktreeGitImprovement.md:L291`; `GitHub_Integration.md:L94` |
| 16 | MUST | Commit composer: message field + Commit, docked **outside** the file list's scroller, draft persisted | `source.md` §7; `GitHub_Integration.md:L160`; `storage-plan.md:L1886` |
| 17 | MUST | AI commit assist (`generate_commit_message`) plus advisory batching (`suggest_commit_batches` to `accept_commit_group`) | `source.md` §7; `UI_Command_Catalog.md:L551-573` |
| 18 | MUST | Sync row Pull / Push / Fetch with incoming/outgoing counts (P1 at 380px, overflow at 240px) | `source.md` §2 P1, §8 |
| 19 | SHOULD | Generated-file filter toggle (`cmd.source_control.toggle_generated_filter`) | `source.md` §3 chrome, §2 P2 |

### Worktrees

| # | Kind | Requirement | Plans citation |
|---|---|---|---|
| 20 | MUST | Compact worktree row: glyph, branch, expand chevron, status **and owner label** (owner on line 2 at 280px+, expanded-only at 240px) | GI-020, `GitHub_Integration.md:L160`, `:L1179` |
| 21 | MUST | Expanded worktree detail carries Path, Base, Age plus its action row | `GitHub_Integration.md:L160` |
| 22 | MUST | W-014 row facts: owning package/owner, lane, run, lifecycle state, blocked/recovery state | `WorktreeGitImprovement.md:L1520`, `:L190-201` |
| 23 | MUST | Worktrees filter bar `All \| Threads \| Orchestrator \| Manual`, defaults to All, persisted per project; degrades to icon-only controls with accessible labels preserved | `GitHub_Integration.md:L160` |
| 24 | MUST | `open` / `recover` / `prune` / `lineage` preserved on **every** row plus compare; orch-owned rows say `Open Lane`, never `Open Thread` | `GitHub_Integration.md:L158`; W-006 `:L1105` |
| 25 | MUST | Ownership-changing and destructive worktree commands present and **disabled with a reason rather than hidden**: remove, prune, request_prune, reuse, release, recover, lock/unlock | `UI_Command_Catalog.md:L708-725`, `:L730-732`; `WorktreeGitImprovement.md:L439` |
| 26 | MUST | Always-visible, non-hover blocked reason inside the row: reason-family code verbatim + templated sentence + ordered `allowed_action_ids[]` as real buttons, announced to assistive technology; never a native `title` | `source.md` §6; `WorktreeGitImprovement.md:L439`, `:L441`; wiring `disabled_announcement` |
| 27 | MUST | Status pill vocabulary carries dirty / conflict / orphaned / stale plus reserved lifecycle words (reserved, active, `blocked_preserved`, released, orphaned), and drives action enablement rather than decorating | `GitHub_Integration.md:L158`; `WorktreeGitImprovement.md:L297`; `source.md` §9.3 |
| 28 | MUST | Panel-level blocked / ownership banner when the active worktree is blocked or owned elsewhere; preempts everything below it | `GitHub_Integration.md:L154`; `source.md` §8.2 |
| 29 | MUST | `+ New Worktree` create action | `UI_Command_Catalog.md:L708-725` |
| 30 | SHOULD | Noisy-project defaults: hide-stale / collapse stale groups plus ownership display mode | `WorktreeGitImprovement.md:L437`; SP-071 |

### History, Graph, Branches, Stash

| # | Kind | Requirement | Plans citation |
|---|---|---|---|
| 31 | MUST | History rows: sha + relative time line 1, subject line 2; open commit and set compare target | `source.md` §4c; `UI_Command_Catalog.md` History pair |
| 32 | MUST | `Open Review Mode` entrypoint on **both** History and Worktrees | `WorktreeGitImprovement.md:L450` |
| 33 | MUST | History / Graph paging: `initial_window`, `page_size`, load-older | `FinalGUISpec.md:L721`; `source.md` §1 |
| 34 | MUST | Graph answers which worktree/run owns each branch tip, with ahead/behind, and has a keyboard-reachable list equivalent — the graph is never the only path | `FinalGUISpec.md:L721`; `WorktreeGitImprovement.md:L447` |
| 35 | MUST | Branch rows: current marker, ahead/behind, owning worktree; a branch owned by an active worktree opens read-only (gated switch) | `source.md` §4d |
| 36 | MUST | Stash rows two-line (ref + count, message clamped) with apply / pop / drop (destructive) | `source.md` §4e; `UI_Command_Catalog.md:L568-569` |
| 37 | SHOULD | PR create / merge with deterministic disabled state | `UI_Command_Catalog.md:L8399-8406` |
| 38 | SHOULD | GitHub Actions deep-link mirror limited to `open_*` pivots | GI-019, `GitHub_Integration.md:L1126` |

### Cross-cutting

| # | Kind | Requirement | Plans citation |
|---|---|---|---|
| 39 | MUST | `strong` actions show scope, consequence and confirmation boundaries before execution | `GitHub_Integration.md:L156` |
| 40 | MUST | Every view owes the full list keyboard model: focusable rows, Enter / Escape / Home / End / type-ahead | `FinalGUISpec.md:L2133-2134` |

36 MUST, 4 SHOULD.

---

## 2. Requirement x version matrix, after

Cells that changed from pass 1 are marked with a caret: `Y^` means it was Y and
is now P; the caret always points at a downgrade, because nothing went up.

| # | Requirement (short) | v0 | vA | vB | vC | vD | vE | vF | xS1 | xS2 | xS3 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | five canonical views | Y | Y | Y | Y | Y | P | P | Y | Y | Y |
| 2 | canonical order / pin mechanism | - | Y | P | P | P | Y | Y | Y | P | Y |
| 3 | recorded open/collapsed defaults | Y | P | P | P | P | Y | - | Y | P | P |
| 4 | headers are accessible buttons | - | Y | Y | Y | Y | Y | P | Y | Y | Y |
| 5 | two-level scroll model | - | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| 6 | context header picker over **repo** + branch + worktree | - | P^ | P | P | P | P | P | P^ | P^ | P |
| 7 | `+N parallel contexts`, never dropped | - | P^ | P | - | - | P^ | P | P^ | P^ | P^ |
| 8 | `+N` drilldown over every **active** context | - | P^ | - | - | - | P^ | P | P^ | P^ | P^ |
| 9 | strip numerals incl. conflict count | P | P | P | P | P | P | P | Y | P | P |
| 10 | staged / unstaged / untracked groups | P | P | P | P | P | P | - | P | Y | P |
| 11 | conflict group + Conflict Assistant | - | - | - | - | - | - | P | Y | Y | Y |
| 12 | conflict resolution commands | - | - | - | - | - | - | - | P | P | P |
| 13 | two-line file row, path in a11y name | - | P | P | Y | P | P | - | Y | Y | Y |
| 14 | row stage / unstage / discard / diff | Y | Y | Y | Y | P | Y | - | Y | Y | Y |
| 15 | compare target labelled with source | P | P | P | P | - | - | P | Y | Y | Y |
| 16 | composer outside the scroller + draft | P | Y | P | Y | Y | Y | P | Y | Y | Y |
| 17 | AI generate + advisory batching | P | Y | - | Y | - | Y | Y | Y | Y | Y |
| 18 | sync row with in/out counts | Y | Y | P | P | P | - | P | Y | P | P |
| 19 | *generated-file filter* | - | Y | - | Y | - | Y | - | Y | - | Y |
| 20 | compact worktree row + owner | Y | Y | P | Y | Y | Y | Y | Y | Y | Y |
| 21 | expanded detail Path / Base / **Age** | Y | P | P | P | P^ | P | P | P^ | P^ | P^ |
| 22 | W-014 owner / **lane** / run / **lifecycle** | P | P^ | P | P^ | P^ | P^ | P | P^ | P^ | P^ |
| 23 | All / Threads / Orch / Manual filter | Y | Y | - | Y | - | - | - | Y | Y | - |
| 24 | open/**recover**/prune/lineage + compare | P | P | P | P | P | P | P | P | P | P |
| 25 | ownership commands disabled not hidden | P | P | P | P | P | P | P | P | P | P |
| 26 | visible blocked reason + real buttons | - | P^ | P | P^ | P | P | P | P^ | P^ | P^ |
| 27 | lifecycle status vocabulary | P | P | P | P | P | P | P | P | P | P |
| 28 | panel-level blocked banner | - | P | P | P | P | - | P | Y | P | P |
| 29 | new worktree | Y | Y | Y | Y | Y | Y | - | Y | Y | Y |
| 30 | *hide-stale / ownership defaults* | - | Y | Y | Y | - | - | - | Y | Y | Y |
| 31 | history rows + commit actions | P | Y | P | Y | P | - | P | Y | Y | Y |
| 32 | Review Mode on History AND Worktrees | - | P | P | P | - | P | P | P | Y | Y |
| 33 | history / graph paging, load older | - | P | - | P | - | - | P | Y | - | P |
| 34 | graph = tip ownership + list equivalent | - | P | - | Y | P | - | - | Y | Y | Y |
| 35 | branch rows + read-only gating | P | Y | P | P | Y | - | - | Y | Y | Y |
| 36 | stash apply / pop / drop | P | Y | Y | Y | P | - | P | Y | Y | Y |
| 37 | *PR create / merge* | Y | Y | Y | P | Y | P | - | P | P | P |
| 38 | *Actions deep-link mirror* | - | Y | Y | - | - | - | - | - | - | - |
| 39 | destructive scope + consequence | P | Y | P | Y | P | P | P | P | P | P |
| 40 | list keyboard model | - | Y | Y | Y | Y | Y | Y | Y | Y | Y |

*Italic rows are SHOULD and are excluded from the coverage score.*

### Why the six downgraded rows moved

- **6 (repo identity).** `source.repo` now exists with `nameWithOwner`,
  `visibility`, `lifecycle` and `siblingCount: 2`. Ten of ten panels render zero
  bytes of it (grep for `jared-dev` / `tastebook` across every rendered source
  panel: no match). A header that shows only branch and worktree while two
  sibling repos are resolvable is the single-repo assumption `GitHub_Integration.md:L397`
  forbids. vA, xS1 and xS2 had a genuine picker and were scored Y for it; the
  picker is still there, but it is now demonstrably missing a third of its
  subject.
- **7 (`+N`).** The number is now wrong everywhere it appears. See 4.5.
- **8 (`+N` drilldown).** `nodeId` and `attemptId` now exist on every row and
  nobody renders either, so `:L293`'s `run_id + node_id + attempt_id` is still
  run-only — but by design choice now, not by data absence. The drilldown
  population is also wrong (4.5).
- **21 (Path / Base / Age).** `age` exists on all twelve rows and nobody renders
  it; `path` is null on one row and four versions drop the Path key silently
  rather than saying no checkout exists (4.2).
- **22 (W-014).** `laneId` and `lifecycle` now exist. No version renders lane at
  all; three render a field literally labelled `Lifecycle` whose value is the
  shared status token (4.1). A wrong value under the right key is worse than an
  absent key, which is why this is P and not Y.
- **26 (blocked reason).** There are now three reason families and four
  canonical sentences in the data. Every version that renders a sentence renders
  the same one for all three families (4.3).

---

## 3. Coverage, before and after

MUST coverage, partial counts half, out of 36.

| Version | Score before | Coverage before | Score after | Coverage after | Delta |
|---|---|---|---|---|---|
| xS1 Commit Desk | 32.5 | **90%** | 29.5 | **82%** | -8 |
| xS3 Review Queue | 30.0 | **83%** | 27.5 | **76%** | -7 |
| xS2 Lane Board | 30.0 | **83%** | 27.0 | **75%** | -8 |
| vA Ledger | 27.5 | **76%** | 25.0 | **69%** | -7 |
| vC Lens Deck | 24.5 | **68%** | 23.5 | **65%** | -3 |
| vB Gutter Sheet | 18.0 | **50%** | 18.0 | **50%** | 0 |
| vD Drill Stack | 18.5 | **51%** | 17.5 | **49%** | -2 |
| vE Cockpit | 19.0 | **53%** | 17.5 | **49%** | -4 |
| vF Stream | 16.0 | **44%** | 16.0 | **44%** | 0 |
| v0 shipped baseline (control) | 14.5 | **40%** | 14.5 | **40%** | 0 |

**Read the control first.** v0 is verbatim static markup; it never reads
`_pm-data.js` at all, so an enriched fixture cannot move it in either direction.
It sits at 40% before and after. That is what makes the other rows legible: the
drops are not the audit getting stricter, they are the redesigns meeting states
they were never tested against. Every redesign is still a net feature gain over
the shipped panel — but the two most complete ones lost the most, because a
design that renders a field is a design that can render it wrongly, and a design
that renders nothing cannot. vB and vF are flat at 50% and 44% for exactly that
reason: they never built the surfaces that broke.

The ranking is stable. xS1 is still first, the three xS variants still lead the
six full systems, and v0 is still last. What changed is the distance: the field
compressed from a 50-point spread to a 42-point one, and the top three converged
onto the same three defects because they share `versions/x-source.js`.

---

## 4. WHAT BROKE

Every item was reproduced by rendering. Version, state, and the literal string
on screen.

### 4.1 The `Lifecycle` field that prints the status token — xS1, xS2, xS3

`versions/x-source.js:1879` and its two siblings:

    PMK.kv('Lifecycle', PMK.statusOf(w.status).word, 'token', b)

The fixture carries `lifecycle` as its own field precisely because
`PM_DATA.status` cannot express the reserved words. All three variants read
`status` instead. Rendered, at 480, in the expanded worktree detail:

| Worktree | `lifecycle` in data | Renders `Lifecycle` as |
|---|---|---|
| `orch/lane-e-search` | `reserved` | **queued** |
| `thread/exif-strip-panic` | `orphaned` | **attention** |
| `thread/ratings-schema` | `released` | **disabled** |
| `orch/lane-f-media-thumbnailer` | `blocked_preserved` | **blocked** |
| `thread/scaling-rounding` | `blocked_preserved` | **blocked** |

`WorktreeGitImprovement.md:L297` makes those five words reserved because each
carries both a Git-native and a Puppet-Master-specific meaning. `released`
rendering as **disabled** is the worst of the five: the worktree was released
after a clean merge into `main` and is retained for lineage, and the panel says
it is unavailable. The accessible name agrees — the row announces
`thread/ratings-schema. Unavailable. Ratings schema and migration 0002` — so a
screen-reader user is told a successfully merged worktree is broken.

`source.md` §9.3 resolves the W-014 / GI-020 tension by ruling that
`blocked_preserved` and `orphaned` must be **pill states**. Both now exist in
the data. Neither is rendered by any version, in a pill or anywhere else.

**Same defect, no `Lifecycle` label:** vA, vB, vC, vD, vE, vF all key their
worktree pill off `status` alone, so the same four rows show `queued` /
`attention` / `disabled` / `blocked` with no lifecycle anywhere. vD's drilled-in
worktree object shows the word **disabled** as the object's status for
`thread/ratings-schema` while offering Open files / Compare / Merge.

### 4.2 The worktree with no checkout — vD, vF, xS1, xS2, xS3

`orch/lane-e-search` is `lifecycle: reserved`, `path: null`, and the fixture
supplies the sentence `Reserved for a queued lane. No checkout exists on disk
yet.` Nobody renders it. Two distinct failures:

**vF renders a dangling separator.** `versions/vF-stream.js:889`:

    line2: locked ? w.lockReason : (w.owner + DOT + PMK.elide(w.path, 'path', chars))

`elide(null)` returns empty, so the row's second line renders literally:

    Orchestrator lane-e search ·

A trailing middle-dot with nothing after it. This is the empty-identity case:
the row asserts there is a path, draws the separator that introduces it, and
prints nothing.

**vD, xS1, xS2 and xS3 drop the Path row entirely.** vD's `kvs()` at
`versions/vD-drill-stack.js:441` skips any pair whose value is null;
`x-source.js:1875` guards with `(w.path ? ... : '')`. Dumping the `.pmk-kv`
pairs for that row in all four:

    "Owner" => "Orchestrator lane-e search"
    "Owner run" => "#47"
    "Base branch" => "main"
    "Ahead" => "0"
    "Dirty" => "no"
    "Lifecycle" => "queued"

No Path key, no explanation. The detail reads as a normal worktree that happens
to be missing one field. `GitHub_Integration.md:L160` names Path / Base / Age as
the expanded triple; two of the three are gone here and the panel does not say
why. Worse, all four still offer **Open Files**, **Compare**, **Create PR** and
**Remove** as live controls on a directory that does not exist. Not one of them
is disabled, and `WorktreeGitImprovement.md:L439` requires unsafe actions be
"disabled with explanation rather than hidden".

### 4.3 One lock sentence for three reason families — vA, vC, vD, xS1, xS2, xS3

The fixture now carries three lock reasons and four canonical sentences. Every
version that renders a sentence templates a single one and swaps the noun.

**vA** (`versions/vA-ledger.js:856-861`) renders, verbatim, on three different
rows:

| Row | `lockReason` | vA renders |
|---|---|---|
| `orch/lane-b-api` | `worktree_owned_by_active_run` | Locked by run #47. Remove, prune and reuse stay disabled until the lane releases it. |
| `thread/scaling-rounding` | `worktree_locked_by_stopped_run` | Locked by run #46. Remove, prune and reuse stay disabled until the lane releases it. |
| `orch/lane-f-media-thumbnailer` | `worktree_preserved_at_safe_point` | **Locked by safe point sp-11. Remove, prune and reuse stay disabled until the lane releases it.** |

The third is wrong three times over. A safe point is not a lane, a safe point
never releases anything, and the fixture's own sentence for that row is
`Preserved at safe point sp-11. Rebind or release it; do not start fresh.` —
which uses `Rebind` and `Start fresh` exactly as `W-019` reserves them
(`:L1807`) and keeps `safe point` distinct from `restore point` as
`Crosswalk.md:L474` requires. vA's copy does the opposite: it collapses a
preservation state into an ownership state. The second row is wrong too: run #46
is stopped, so "until the lane releases it" names a release that will never
happen, and `Release` is not among the three buttons offered (Open Lane, Focus
lineage, Request prune).

**xS1 / xS2 / xS3** share `x-source.js:504` and render:

    Owned by safe point sp-11. Remove, prune and reuse stay disabled until the run releases it.

Same collapse. "Owned by" is worse than vA's "Locked by", because `Owner` is a
reserved glossary term (`WorktreeGitImprovement.md:L299`) and a safe point owns
nothing.

**vC** (`vC-lens-deck.js:1000`) renders `Locked by safe point sp-11.` — shorter,
same category error.

**vD** (`vD-drill-stack.js:907`) renders `Owned by safe point sp-11.` with
actions Open lane / Focus lineage.

**`Request prune` is offered on a row that forbids it.** All of vA, vC, xS1,
xS2 and xS3 put `Request prune` in the allowed-action row of
`orch/lane-f-media-thumbnailer`, which is `lifecycle: blocked_preserved`,
`prunable: false`. `UI_Command_Catalog.md:L730` and
`WorktreeGitImprovement.md:L224` forbid manual prune/remove/reuse while a
worktree is `active` or `blocked_preserved` unless an override policy allows it
**and records the override**. The `prunable` flag that would have driven this is
in the fixture and is read by nobody.

### 4.4 The orphaned worktree presented as healthy — all ten

`thread/exif-strip-panic` is `lifecycle: orphaned`,
`orphanReason: worktree_directory_missing`, `repairable: true`, with the
sentence `The checkout is gone from disk. Lineage is still resolvable; recover
or prune.` It has no `lockedBy`, so every version's blocked block is gated off.

Rendered in xS1, xS2, xS3 and vD, the detail says:

    Path .worktrees/exif-strip-panic
    Dirty yes
    Lifecycle attention

and offers Open Files / Compare / Open Thread / Focus lineage / Create PR /
Remove, all enabled. The panel prints a path to a directory that is gone,
reports uncommitted changes in it, and offers to open it. `GitHub_Integration.md:L158`
requires `orphaned` as a visible status and requires recoverable lineage to stay
visible "even when the row points to a historical or orphaned checkout"; the
lineage button is there, the orphan state is not, and **`Recover` still does not
exist in any of the ten versions** even though `repairable: true` is now in the
data on two rows.

### 4.5 `+N parallel contexts` now counts contexts that are not active

`WorktreeGitImprovement.md:L293` defines N as
`additional_active_context_count`. Two different wrong formulas are in use, and
both were correct-looking when all eight worktrees were live.

| Version | Formula | Renders | Includes |
|---|---|---|---|
| vA | `S.counts.worktrees - 1` (`vA-ledger.js:690`) | **+11** | reserved, orphaned, released |
| vB | `S.counts.worktrees - 1` (`vB-gutter-sheet.js:546`) | **+11** at 380/480, dropped at 240 | same |
| vC | `s.worktrees.length - 1` (`vC-lens-deck.js:900`) | tooltip only, never a chip | same |
| vE | `others.length` (`vE-cockpit.js:825`) | **+11** | same |
| xS1/xS2/xS3 | `worktrees.filter(w => w.run).length - 1` (`x-source.js:367`) | **+8** | reserved, orphaned, released |

Neither formula excludes the three rows that are not active contexts:
`orch/lane-e-search` has no checkout on disk, `thread/exif-strip-panic`'s
checkout is gone, and `thread/ratings-schema` was released two weeks ago after
merging into `main`. The xS formula is arguably worse despite the smaller
number, because it filters on `run` — and a released worktree still carries
`run: '#39'`, so it is counted as a parallel active context on the strength of
the run that finished it.

**vE's drilldown makes it visible.** Opening `+11` lists eleven rows —
`orch/lane-b-api`, `thread/ratings-schema`, `orch/lane-f-media-thumbnailer` and
the rest — with branch, owner and run, and **no status and no blocked/conflict
indicator on any of them**. A released worktree and a blocked-preserved one are
typographically identical to a running lane. `:L293` requires status and a
blocked/conflict indicator per context.

**vA's drilldown header disagrees with its own list.** The menu head reads
`11 parallel contexts` and the list beneath it has twelve entries, because vA
pushes every worktree into the list and computes the head from
`counts.worktrees - 1`.

### 4.6 vD's hub summary undercounts locks by four

`versions/vD-drill-stack.js:833`:

    summary: '1 owned by ' + (byBranch['orch/lane-b-api'].lockedBy || '')

The Worktrees hub row renders **1 owned by run #47** while the list beneath it
holds five locked worktrees: three by run #47, one by run #46, one by safe point
sp-11. The count was already wrong before this pass (three locks, reported as
one), but the enriched fixture breaks the qualifier as well — "owned by run #47"
no longer describes the population at all now that a safe point holds one of
them. Header count versus rows below it, on the panel's own summary row.

### 4.7 vB expands the wrong worktree, now eleven times out of twelve

`versions/vB-gutter-sheet.js:598` gates the detail sheet on `if (i === 0)`.
Clicking `orch/lane-f-media-thumbnailer` at 480 leaves the sheet showing
`ORCH/LANE-B-API`. Pass 1 recorded this as seven of eight rows having no Path /
Owner / Base detail; it is now **eleven of twelve**, and the four rows that most
need a detail surface — the reserved, orphaned, released and safe-point-preserved
ones — are all in the eleven.

### 4.8 xS3's conflict card contradicts itself on the add-add conflict

`x-source.js:1852` templates one sentence for every conflict:

    sentence: 'Both sides changed ' + baseOf(f.path) + '. Resolution is never written for you; pick a side and confirm it.'

Selecting `docker-compose.override.yml`, whose fixture entry is
`kind: 'add-add'`, `conflict: 'both added'`, `base: null`, renders these four
rows in sequence in one card:

    Compare target   three-way: base, ours, theirs, result
    Conflict         both added
    worktree_conflict
    Both sides changed docker-compose.override.yml. Resolution is never written for you; pick a side and confirm it.

Three defects in one card. The sentence contradicts the field two rows above it
— for an add-add conflict neither side changed the file, both created it. The
compare target names a `base` the fixture explicitly records as `null`, so the
three-way review it promises cannot be constructed. And the sentence instructs
the user to "pick a side and confirm it" while the card offers Open Conflict
Assistant / Open merge editor / Mark resolved and **no side control at all** —
the fixture now carries `sides[]` with `Ours - main` and
`Theirs - orch/lane-d-infra` and their per-side churn, so the affordance the
copy promises is one the data is ready for and the design does not have.

### 4.9 vE and vF print raw reason codes where a sentence belongs

`vE-cockpit.js:891` and `vF-stream.js:889` both put `w.lockReason` on the row's
second line, replacing the owner label. Pass 1 recorded this for vE with two
families in the data. There are now three, so both panels render three different
snake_case tokens in the position a human sentence belongs:

    orch/lane-b-api          worktree_owned_by_active_run
    thread/scaling-rounding  worktree_locked_by_stopped_run
    orch/lane-f-media-thumb  worktree_preserved_at_safe_point

In vF the code is set in monospace at the exact position where the other nine
rows print `Orchestrator lane-d infra · .worktrees/...`, so the reader sees the
owner column silently become a machine token on three rows out of twelve.
`source.md` §6 requires reason-family code **plus** a templated sentence; both
versions ship the code alone. The four canonical sentences are in the fixture.

### 4.10 vF's filter chip promises 26 events and the feed has 16

`vF-stream.js:846`: `allChip('All', S.counts.worktrees + S.counts.commits)` =
12 + 14 = 26. The feed it filters renders three commits, one stash and twelve
worktrees = the 16 the header correctly reports as `16 events`. The chip and the
header disagree on the same screen. Pre-existing (22 versus 12 before), widened
by four.

### 4.11 Pre-existing defects the new data did not cause, confirmed still live

Named separately so they are not mistaken for regressions.

- **vC's Graph invents an owner.** The branch-tip table labels `main`,
  `release/v1.2`, `hotfix/exif-strip-panic` and `dependabot/cargo/tokio-1.39.2`
  as owner **Manual** — a reserved owner label meaning a human-created worktree
  (`GitHub_Integration.md:L160`) — when no worktree tracks those tips at all.
  The lens footer then reads `12 tips · 12 owned`. Four of twelve are unowned.
  This is the exact question `WorktreeGitImprovement.md:L447` says Graph exists
  to answer, answered with a fabrication.
- **vC's history paging still reports `1-14 of 14`** against
  `paging.commits.total: 1842`.
- **vE's History, Graph and Branches / Stash still render header buttons with
  no body.** Fourteen commits, twelve branches and three stashes remain absent.
- **vA's Graph header now reads `12` over an empty body** — the section
  advertises twelve items and renders none.
- **vB's Graph header reads `14` over an empty body.**
- **vB drops `+N` entirely at 240px**, which `source.md` §5 forbids at any
  width.
- **xS1 renders `.` as the dirname line** for root-level files
  (`docker-compose.override.yml`, `Cargo.lock`) — a stray period where the
  dimmed dirname belongs.
- **xS2's header says `12 worktrees` over 13 rows**, because it injects a
  synthetic `main / Repo checkout` lane. Honest design, dishonest count.
- **v0's counts have never matched anything.** It reports `2 staged, 1 unstaged`
  against 16 changed files, `4 active` against 12 worktrees, `3 recent` against
  14 commits and `5 branches, 1 stash` against 12 and 3 — because it is static
  markup that never reads the fixture. Its per-row `main · age 2h` is likewise
  fabricated, and now contradicts twelve real ages spanning 6 minutes to 5 weeks.

---

## 5. Per-version deltas

**v0 — control, 40% before and after.** Unmoved by construction. Its value this
pass is negative evidence: it proves the drops elsewhere are caused by the data,
not by a stricter reading.

**vA Ledger — 76% to 69%.** Took the largest absolute hit of the six systems
because it had the most to lose in the context layer: repo identity, `+N`, the
drilldown and the blocked sentence were four of its five Y-grade strengths, and
the enriched data compromised all four. Its worktree section is still the most
complete of the six — every locked row carries a code, a sentence and three real
buttons — but the sentence is now wrong on two rows out of three lock families,
and the `Request prune` button it offers on the safe-point row is the action the
spec most explicitly gates. Still no conflict group: the two U-coded files sit in
the unstaged list with a `U` letter, and `source.conflicts` goes unread.

**vB Gutter Sheet — 50%, flat.** Flat because the surfaces that broke elsewhere
were never built here. The composer still has no Commit button, which remains
the single most damaging omission in the bakeoff. The sheet-for-row-zero bug is
now eleven-twelfths wrong instead of seven-eighths.

**vC Lens Deck — 68% to 65%.** Smallest drop among the versions that moved,
because its worktree lens carries no lifecycle field to get wrong and no path to
lose. Its blocked sentence is short enough to be merely incomplete rather than
actively false, though `Locked by safe point sp-11.` still calls preservation a
lock. Its Graph remains the best in the field structurally and the least
trustworthy in content.

**vD Drill Stack — 51% to 49%.** The drill-in object was its strength and is
where it broke: Path vanishes on the reserved row, `disabled` shows as the
object's status on the released row, and the hub summary undercounts locks by
four. Still no AI generate, no batching, no `+N`, no Review Mode.

**vE Cockpit — 53% to 49%.** Its context layer was the reason its score
overstated it in pass 1, and the enriched data took exactly that layer apart:
`+11` counts three inactive contexts, and the drilldown lists them with no
status and no blocked indicator. The raw-code-on-line-2 defect tripled. The three
empty sections are unchanged.

**vF Stream — 44%, flat.** Flat for the same reason as vB. It gained the
distinction of the only literal empty-identity render in the panel
(`Orchestrator lane-e search ·`), and it still declines to render `age` even
though the field now exists on every row and its own time column shows `--`
twelve times.

**xS1 Commit Desk — 90% to 82%, still first.** Everything that made it first is
intact: the only version with `conflict_file_count` in the strip at every bucket,
the only honest paging (`Showing 14 of 1842` plus Load older), the only true
panel-level blocked banner. It lost six half-points to the shared
`x-source.js` defects — the `Lifecycle` field printing the status token, the
vanishing Path, the one-sentence-fits-all lock copy, the `+8` that counts a
merged worktree. Its banner sentence is the best in the field
(`thread/scaling-rounding is preserved for run #46. Release it or focus its
lineage before it can be reused.`) and still does not offer the `Release` button
it names.

**xS2 Lane Board — 83% to 75%.** Same six shared defects. Its four counted
change groups (Conflicts 2 / Staged 9 / Unstaged 3 / Untracked 2 = 16) remain
the only fully correct group model in the bakeoff, and its functional filter is
still the only one that filters. The synthetic root lane keeps its honest
`Owner: Repo checkout, no worktree owner` and its honest empty
(`No file list for this lane`) — which makes the silent Path drop on the
reserved row more conspicuous, not less: this is a design that knows how to say
"absent" and does not say it here.

**xS3 Review Queue — 83% to 76%.** Its conflict card is the best-designed
surface in the panel and the one that broke most visibly, because it is the only
one that makes a claim specific enough to be falsified (4.8). Its compare-target
table is still the field's best implementation of
`GitHub_Integration.md:L94`, and the `three-way: base, ours, theirs, result`
entry is now wrong for one of the two conflicts because the fixture says that
conflict has no base.

---

## 6. Still blind

Requirements no version satisfies even now, with the cause re-attributed. Nine
of pass 1's fifteen blind spots were blamed on the fixture. Seven of those nine
are now provably design absences; two remain kit-blocked.

### Now design absence — the data poses the question and nobody answers it

1. **Repo identity is still nowhere.** `source.repo` carries name, owner,
   `nameWithOwner`, host, remote, lifecycle, visibility and two named sibling
   repos. Ten of ten render none of it. `GitHub_Integration.md:L397` says the
   model "never assumes a single repo context"; ten of ten still do. This was
   the most valuable finding in pass 1 and it is now unambiguous, because the
   excuse is gone.
2. **`resolve_conflict_side` and `conflict_apply_resolution` have no control
   anywhere.** `conflicts[].sides[]` now names `Ours - main` and
   `Theirs - thread/scaling-rounding` with per-side churn, `resolved: false` on
   both entries and `markersRemaining` counts. `WorktreeGitImprovement.md:L451`
   says the resolver "must never auto-write a side" — the fixture deliberately
   marks neither side preferred so that a one-click "Take theirs" would be
   visible as a violation. No version renders either the violation or the
   correct affordance. xS3 goes furthest and promises the control in prose it
   does not implement.
3. **`cmd.git.worktree.recover` is absent from all ten**, with `repairable:
   true` now on two rows. The string `Recover` still appears exactly once in the
   whole versions directory, inside a comment.
4. **`lock` / `unlock` are absent from all ten and `prunable` drives nothing.**
   `WorktreeGitImprovement.md:L439` names `locked`, `prunable`, `dirty`,
   `repairable` as the four flags that drive action enablement. All four are now
   in the data. Every version still derives enablement from `lockedBy` alone, so
   `Request prune` appears enabled on `prunable: false` rows and the distinction
   `W-019` insists on between `prune` and `request prune` is still untested.
5. **The lifecycle vocabulary is rendered by nobody.** All five reserved words
   are in the data on real rows. Grepping every rendered source panel for
   `blocked_preserved`, `released` and `orphaned` returns zero matches outside
   the reason code `worktree_preserved_at_safe_point`. `source.md` §9.3's ruling
   that `blocked_preserved` and `orphaned` must be pill states has still never
   been rendered once — but the reason is now design, not fixture.
6. **Worktree `Age` is rendered by no version but the baseline, which
   fabricates it.** `age` is now on all twelve rows, spanning `6m` to `5w`.
   Nine of ten still omit it. Pass 1 called this correct restraint; it is now a
   gap.
7. **The `+N` drilldown still carries no `node_id` or `attempt_id`.** Both now
   exist on every orchestrator and thread row (`n-22` / `att-3` and so on).
   `:L293` requires `run_id + node_id + attempt_id` per active context. All five
   drilldowns show run only.
8. **`W-018`'s payload is still mostly unreached.** No version surfaces
   `repo_root`, `head_commit_oid`, `baseline_commit_oid`, `upstream_remote`,
   `upstream_branch`, `safe_point_id`, `requires_safe_point_restore` or
   `active_git_operation`. `safe_point_id` is now inferable from
   `lockedBy: 'safe point sp-11'` and no version treats it as an identity.
9. **The diff-stat magnitude channel is unbuilt.** `add` / `del` are now on all
   sixteen changed files (`legacy_qty.rs` is `+0 / -240`,
   `0003_quantity_precision.sql` is `+187 / -0`). No version renders either
   number in any form. This one is not a Plans requirement, so it is not in the
   matrix; it is recorded because the fixture note says the numbers were added
   specifically to make a magnitude rail buildable, and nobody built one.

### Still fixture or kit blocked

10. **`conflict` as a worktree status.** `GitHub_Integration.md:L158` lists
    `conflict` among the required visible worktree statuses. No worktree in the
    fixture carries it — the two conflicts are file-level. A worktree whose
    status is `conflict` would need to be added before any version can be
    scored on it.
11. **`cancelled` and `inconclusive` cannot be rendered correctly by any
    version that uses the kit.** The fixture extended the vocabulary to eleven
    tokens; `_pm-kit.js:74-78` keeps its own `GLYPH` and `DASH` maps keyed by
    the original nine, so `K.statusMark('cancelled')` returns a solid circle in
    the `off` tone — the same shape `queued` gets. No source row uses either
    token today, so this does not affect any score here, but it will the moment
    one does. Two-line fix in `_pm-kit.js`, out of scope for this pass.

### Still genuine design absence, unchanged from pass 1

12. **No `strong`-action confirmation surface exists.**
    `GitHub_Integration.md:L156` requires scope, consequence and confirmation
    boundaries before execution. Every version flags discard / remove / drop as
    `danger`; the best add one sentence of consequence copy. Nobody renders the
    confirmation. `alert` and `confirm` are banned by the kit rules, so this is
    an unbuilt component rather than an oversight in one design.
13. **`simplified-summary vs full-detail` mode is unimplemented.**
    `FinalGUISpec.md:L719-725` requires it be recorded alongside default-open
    and pinned sections. Every version keys detail off the width bucket instead.
14. **`Open Review Mode` on Worktrees** exists only in xS2 and xS3.
15. **Untracked as its own counted group** exists only in xS2.
    `source.md` §10.5 flags untracked's row treatment as an open spec question,
    so this stays closer to a spec gap than a design failure.

---

## 7. What this pass changes about the decision

The ranking did not move, so the pick does not change: xS1 leads, and the three
xS variants lead the six systems. What changed is the shape of the remaining
work.

Before this pass, the top three looked like they needed feature additions. They
do not. They need four corrections that are each a handful of lines in one
shared file, `versions/x-source.js`:

1. `PMK.kv('Lifecycle', ...)` must read `w.lifecycle`, not
   `PMK.statusOf(w.status).word` (4.1).
2. A null `path` must render an explicit absent state carrying
   `reservedSentence`, not vanish (4.2).
3. The lock sentence must switch on `lockReason` family and use the fixture's
   own `preservedSentence` / `orphanSentence` / `releasedSentence` (4.3, 4.4).
4. `activeContexts()` must filter on `lifecycle`, not on `run` (4.5).

None of those is a design question. All four are the same mistake — reading the
nearest available field instead of the one that carries the meaning — and it is
worth naming as the pattern, because it is what a fixture full of nominal rows
selects for. Every one of these designs was correct against data where
`status` and `lifecycle` always agreed, where every worktree had a path, and
where every lock meant the same thing. That is the whole argument for adversarial
state variety, and it cost the field an average of five points to demonstrate.
