# Continuation 4 adjudication — the `union` arm (full arm from discovery)

**I am an Opus 5 agent** (`claude-opus-5[1m]`) acting as adjudicator. I ran no arm and have no
model-family relationship with the reviewed model. Every figure below was rebuilt from the run's
durable state; none was taken from the runner's summary.

## What this arm is, and what that means for its recall

This is **the only continuation-4 arm whose recall is not bounded by the premium arm's artifacts.**
It ran the whole pipeline — discovery, implementation, history, reconcile, compare — on the frozen
case `bc7569b3f5`. Discovery and study workers received the product brief only; the frozen Plans
entered at reconciliation and comparison; **no artifact from any other arm was an input.**

Verified from durable state, not from the report:

- `run.json` `continuation.fresh_arm: true`, `continuation.original_run: null`
- `run.json` `inputs_note`: *"Frozen case snapshot bc7569b3f5 only. Discovery and study workers
  receive the product brief; the frozen Plans enter at reconciliation and comparison. No artifact
  from any other arm."*
- `run.json` `input_manifest_sha256` `11a497945fa57bb5ea062b67289f258af1f89eb9bcb475e7f6b1f9f692c8272a`
  — the same frozen case premium and hybrid ran
- `run.json` `premium` carries the union model itself, not a premium-artifact pointer
- `protocol/arm-budgets/union.json` `policy.admitted_phases` lists all five stages

**Consequence for the reader.** Compare this arm with **premium and hybrid on the full pipeline**.
Do **not** rank it against `claude`, `deepseek41`, `claude-hicap` or `muse13`: those are same-input
replacements of the review model whose ceiling is whatever the premium arm's frozen research
artifacts already contain. Their recall answers a different question.

## The stop was designed — confirmed before scoring

`run.json` `stop_reason: "Stop: admitted_attempt_cap"` with `stop_kind: "limit_or_gate"`;
`campaign-terminal.json` and `monitor-state.json` agree. This is a designed gate, not an exception.
That is the material difference from the quarantined union attempt of 21:57Z, which died on a Python
`FileNotFoundError` renaming `worker-process.json.tmp`. **Checked first, as instructed.**

## Verification

| Item | Value |
|---|---|
| Run directory | `/home/sittingmongoose/PM-Experiments/jujutsu-followup-20260911/continuation4/runs/jujutsu-union-20260916-221929` |
| Manifest | `arm-outputs/union-manifest.json` |
| Internal `manifest_sha256` | `2e8ada3ff095c4fd544daee0311e17cc78503b166a43db4331693495d205f5d8` |
| Manifest file's own bytes | `77d2059a34f267191af5e73ccdb2b2a9c6aa0d2f9bf59513e15fd4eefe5dd1da` |
| Files / bytes | 7,894 / 363,829,324 |

I recomputed the internal digest from the 7,894 sorted rows and independently re-hashed the whole
tree; both match. The runner's quoted figure is the **internal** digest over the sorted file rows,
not the manifest file's own bytes.

Model of record: `openrouter/stealth/union-alpha` at effort `high` through oh-my-pi, reported
version `omp/18.2.2`. Two labelling notes for later readers: the binary sits under
`omp-runtimes/omp-18.1.12-linux-x64/` but reports 18.2.2 (stale directory name), and
`protocol/arm-budgets/union.json` `continuation4_arms.union` still says `opencode-go/union-alpha`
and `oh-my-pi 18.1.13` — the frozen cost-policy copy, the same stale-selector class the runner
documented for deepseek41. **`run.json` `researcher` is the selector of record.**

## Two corrections to the runner's figures

1. **"18 of 20 wrote `notes.md`" is wrong; it is 19 of 20.** `J0018-reconcile` (6,336 bytes, plus
   **8** lead documents) and `J0020-reconcile` (8,790 bytes) both timed out and still saved
   `notes.md`. Only `J0019-reconcile` produced nothing. Those saved documents are scored, under
   continuation 3's rule that budget-limited saved findings count when supported, and they carry
   **12 of the 43 credits**. Taking the runner's figure would have dropped real credits.
2. **"12 to 39 responses per job" reconciles only through the durable meter.** The three timeout
   jobs have **no `raw-omp/usage.json` at all**, so their native receipt count is zero while the
   durable meter recorded 27, 12 and 13. Totals: **484 native receipts** across the 17 completed
   jobs (22–39 each) plus **52 durable-metered requests that were never receipted = 536 attempted**.
   That is exactly why each timeout job retains $1 unresolved:
   `native-job-end-accounting.json` records `missing_retained_usage_records` and
   `durable_meter_request_count_mismatch`. No effect on the score.

## Job table, rebuilt from durable state

| Job | Stage | Status | Bound by | Elapsed s | Native receipts | notes.md | Leads written | Primary credits |
|---|---|---|---|---:|---:|---|---:|---:|
| `J0001-discovery` | discovery | completed | finished | 594.6 | 27 | yes | 30 | 3 |
| `J0002-implementation` | implementation | completed | finished | 461.7 | 28 | yes | 4 | 0 |
| `J0003-history` | history | completed | finished | 684.2 | 39 | yes | 3 | 0 |
| `J0004-implementation` | implementation | completed | finished | 430.0 | 26 | yes | 4 | 0 |
| `J0005-history` | history | completed | finished | 519.1 | 30 | yes | 3 | 0 |
| `J0006-implementation` | implementation | completed | finished | 425.1 | 27 | yes | 4 | 0 |
| `J0007-history` | history | completed | finished | 616.0 | 39 | yes | 5 | 0 |
| `J0008-implementation` | implementation | completed | finished | 479.7 | 27 | yes | 3 | 0 |
| `J0009-history` | history | completed | finished | 378.1 | 26 | yes | 4 | 0 |
| `J0010-implementation` | implementation | completed | finished | 584.7 | 26 | yes | 3 | 0 |
| `J0011-history` | history | completed | finished | 746.7 | 38 | yes | 4 | 0 |
| `J0012-reconcile` | reconcile | completed | finished | 637.4 | 26 | yes | 6 | 0 |
| `J0013-reconcile` | reconcile | completed | finished | 665.6 | 23 | yes | 7 | 0 |
| `J0014-reconcile` | reconcile | completed | finished | 794.3 | 30 | yes | 7 | 0 |
| `J0015-compare` | compare | completed | finished | 597.9 | 27 | yes | 0 | 9 |
| `J0016-compare` | compare | completed | finished | 396.7 | 22 | yes | 0 | 12 |
| `J0017-compare` | compare | completed | finished | 498.0 | 23 | yes | 0 | 7 |
| `J0018-reconcile` | reconcile | timeout | 2,400 s wall | 2400.6 | 0 (27 metered) | yes | 8 | 8 |
| `J0019-reconcile` | reconcile | timeout | 2,400 s wall | 2400.6 | 0 (12 metered) | NO | 0 | 0 |
| `J0020-reconcile` | reconcile | timeout | 2,400 s wall | 2400.4 | 0 (13 metered) | yes | 0 | 4 |

| Stage | Wall s | Summed job s | Concurrency |
|---|---:|---:|---:|
| discovery | 595.1 | 594.6 | 0.999 |
| implementation | 1889.2 | 2381.2 | 1.260 |
| history | 2079.6 | 2944.2 | 1.416 |
| reconcile | 3699.3 | 9298.8 | 2.514 |
| compare | 658.3 | 1492.6 | 2.267 |

Arm wall 6378.3 s, summed
16711.4 s, average concurrency
2.6200. Captured **$0.00** at a zero tariff against a $100
cap, with **$3.00 unresolved** from the three killed jobs; 17 reconciled, 3 unresolved.
**Cost is a tariff artefact here and is not comparable with any other arm.**

## Recall on the fixed 110-finding union

**43 / 110 = 39.09%.** On continuation 3's original 105-finding basis, 43/105 = 40.95%.

| Class | Credited | Denominator |
|---|---:|---:|
| correction | 0 | 5 |
| optional_capability | 7 | 36 |
| product_choice | 0 | 6 |
| unsupported_or_rejected | 36 | 63 |

Corrections missed: F001, F106, F107, F108, F109. Partial matches recorded but **not** credited:
F001, F027, F044, F089, F103, F105, F107.

### optional_capability (7)

| ID | Title | First credited at | Strongest statement |
|---|---|---|---|
| F015 | Operation history navigation | compare | `J0017-compare` |
| F024 | Interdiff | compare | `J0017-compare` |
| F025 | Change evolution view | compare | `J0017-compare` |
| F028 | Machine-readable hunk selection | discovery | `J0001-discovery` |
| F035 | External diff and merge tool handoff | compare | `J0016-compare` |
| F065 | Revset assistance | compare | `J0017-compare` |
| F066 | Direct graph manipulation | discovery | `J0016-compare` |

### unsupported_or_rejected (36)

| ID | Title | First credited at | Strongest statement |
|---|---|---|---|
| F002 | Nominal reads may write | reconcile | `J0018-reconcile` |
| F004 | Writer authority is stronger than native locks | discovery | `J0018-reconcile` |
| F005 | Expected operation is not native compare-and-swap | discovery | `J0018-reconcile` |
| F006 | Exact durable identity and operation-local selectors | reconcile | `J0015-compare` |
| F007 | Process failure and cancellation are not no-effect proof | reconcile | `J0018-reconcile` |
| F008 | Partial multi-file resolve | reconcile | `J0020-reconcile` |
| F010 | Native versus sidecar crash boundary | reconcile | `J0018-reconcile` |
| F011 | Native recovery has explicit scope | discovery | `J0017-compare` |
| F019 | Stale workspace recovery | discovery | `J0015-compare` |
| F029 | Hunk and editable diff safety | compare | `J0016-compare` |
| F030 | Empty, absent and failed reads are distinct | compare | `J0016-compare` |
| F031 | Diff text and metadata round-trip | compare | `J0016-compare` |
| F038 | Credential architecture and custody already chosen | compare | `J0017-compare` |
| F043 | Authenticated browser and local IPC | compare | `J0017-compare` |
| F050 | Included tools and exact qualification | discovery | `J0015-compare` |
| F051 | Colocated import/export stays fail-closed | compare | `J0015-compare` |
| F052 | Git HEAD and index health are separate | compare | `J0015-compare` |
| F056 | Native conflict truth and supported shape | reconcile | `J0020-reconcile` |
| F057 | Exact-profile conflict byte regression | reconcile | `J0020-reconcile` |
| F059 | Push targets and bookmark effects | discovery | `J0020-reconcile` |
| F061 | Graph bounds, continuity and isolation | discovery | `J0016-compare` |
| F062 | Graph visual and menu regressions | discovery | `J0016-compare` |
| F068 | Description drafts survive refresh | compare | `J0016-compare` |
| F069 | Immutable content caches and async selection | compare | `J0016-compare` |
| F072 | One catalog and authoritative eligibility | compare | `J0016-compare` |
| F073 | Runtime evidence versus unused scaffolding | compare | `J0015-compare` |
| F079 | Complete retained native backup closure | discovery | `J0001-discovery` |
| F080 | Snapshot omission and skipped checkout | compare | `J0015-compare` |
| F081 | Backup existence is not verified recovery | compare | `J0015-compare` |
| F082 | Extras head integrity and crash corruption | reconcile | `J0018-reconcile` |
| F084 | Sanitized inactive restore configuration | discovery | `J0001-discovery` |
| F087 | Read preview and dry-run side effects | compare | `J0015-compare` |
| F088 | Parent retention in history edits | compare | `J0016-compare` |
| F092 | Performance mechanisms are not capability proof | compare | `J0016-compare` |
| F094 | Operation metadata is not idempotency | reconcile | `J0018-reconcile` |
| F102 | Upstream narrative inconsistencies | reconcile | `J0018-reconcile` |

## Recall by stage — compared with premium and hybrid on the full pipeline

*First credited support* = the earliest stage whose delivered assertion states the proposition and
cites a passage.

| Stage | New | Cumulative | % of 110 |
|---|---:|---:|---:|
| discovery | 12 | 12 | 10.91 |
| implementation | 0 | 12 | 10.91 |
| history | 0 | 12 | 10.91 |
| reconcile | 10 | 22 | 20.00 |
| compare | 21 | 43 | 39.09 |

Against the two full-pipeline arms. Premium and hybrid's `original_arms` credit was earned in the
goal-2 run, which admitted only discovery, implementation and history (the d3 report records their
reconcile and compare wall time as 0.00 / unknown); `continuation_credit` names the continuation-3
job that first earned the rest.

| Arm | Research stages (disc+impl+hist) | reconcile | compare | Total | Share earned after research |
|---|---:|---:|---:|---:|---:|
| premium | 73 | 0 | 5 | 78 | 6% |
| hybrid | 86 | 2 | 2 | 90 | 4% |
| **union** | **12** | **10** | **21** | **43** | **72%** |

Premium's five late credits are F001, F106, F107, F108, F110; hybrid's four are F030, F088, F107,
F109.

**The shapes are not alike.** Premium and hybrid earned almost all of their coverage in the research
stages, across 88 and 91 leads over two campaigns. This arm earned 72% of its coverage in reconcile
and compare, from **8 admitted leads in a single 106-minute run**. One caveat the reader must keep:
premium's and hybrid's research-stage figures cannot be split finer than
discovery+implementation+history from the published artifacts, whereas this arm's 12 are all
attributable to `J0001-discovery`.

**A result inside that table: the union arm's implementation and history stages produced zero first
credits.** Ten of the twenty admissions and 5,325 summed job-seconds went to stages that added no
union finding discovery had not already supported with a citation and that reconcile and compare did
not later supply. Their 47 documents were read in full and are not empty — they supply the
passage-level evidence the reconcile and compare jobs then cite, and `job.json` upstream chains
record it (J0012 cites J0002 and J0003). The result is about first credit against this union, not
about whether those stages did work. For premium and hybrid the same stages carried essentially
everything.

## Time-truncated coverage, reported separately

Three reconcile jobs were killed by the **2,400 s per-job wall** (elapsed 2400.590, 2400.604,
2400.372 s), affecting five leads. **No job was request-limited or money-limited** — see the next
section.

| Measure | Value |
|---|---|
| Credits whose primary evidence is a truncated job | 12 — F002 F004 F005 F007 F008 F010 F056 F057 F059 F082 F094 F102 |
| Credits with any evidence from a truncated job | 17 |
| Credits that would be **lost** if truncated output were excluded | **3** — F008, F057, F082 |
| Recall excluding truncated output | 40/110 = 36.36% |

12 of 43 credits rest primarily on time-truncated jobs, but only 3 findings rest on them *alone*.
Excluding truncated output entirely moves recall from 39.09% to 36.36%. The truncated jobs were
productive: `J0018` alone carries 8 primary credits, more than any job but the two strongest compare
jobs.

**What was actually lost.** `J0019-reconcile` is the only true blank. Lead `L-e3903531cf7b`
completed implementation (`J0010`) and history (`J0011`) and then lost its reconciliation entirely,
so it never reached comparison. Its two study documents were still read and scored.

## Request-limited coverage — none

**No job in this arm was request-limited.** Native receipts per completed job run 22–39 against a
40-response ceiling; no job reached it. `timing.json` `money_stop_reason` is null,
`priced-usage-final.json` `stop_reason` is null, and observed upper usage is $0.00 against $100.
This is the first continuation-4 arm for which the ceiling was not binding, so the adapter's
`budget_truncated` mislabel — which had to be unwound for every review arm — does not arise: no job
carries that status. The binding limits here are the **20-admission cap** and, for three jobs, the
**2,400 s wall**.

## Reached-delivery fraction — separating "did not get there" from "got there and missed"

| Measure | Value |
|---|---|
| Jobs admitted | 20 |
| Jobs producing a saved assertion document | 19 (95.0%) |
| Jobs producing a receipted delivery | 17 (85.0%) |
| Leads in the registry | 106 (30 authored by discovery, 76 child leads) |
| Leads admitted beyond discovery | **8 (7.55%)** |
| Admitted leads producing a delivered assertion | **8 of 8 (100%)** |
| Admitted leads reaching reconcile delivery | 7 of 8 |
| Admitted leads reaching compare delivery | 3 of 8 |

**Everything admitted got there.** The arm's misses are overwhelmingly "did not get there": 98 of
106 leads were never admitted to any study job, because a 20-admission budget spread over five
stages can carry only about five lead chains. 11 of the unadmitted leads carry `unresolved_intake`.

## Coverage against premium and hybrid

| | Premium (78) | Hybrid (90) |
|---|---:|---:|
| Shared with the union arm | 42 | 38 |
| Union arm has, this arm lacks | 1 (F073) | 5 (F005, F008, F031, F065, F084) |
| That arm has, union arm lacks | 36 | 52 |

**Unique to the union arm: none.** All 43 credits sit inside premium ∪ hybrid.

## The union question: a different research model redistributed coverage; it did not extend it

This is the one arm in the experiment that could have changed the 110-finding union. **It did not.**
Zero of its 43 credited findings falls outside premium ∪ hybrid, and none of its five out-of-union
candidates is a proposition the union lacks and needs.

What it *did* do is reach **11 findings no review arm reached** — a different part of the same
space:

| ID | Title | Class |
|---|---|---|
| F005 | Expected operation is not native compare-and-swap | unsupported_or_rejected |
| F015 | Operation history navigation | optional_capability |
| F019 | Stale workspace recovery | unsupported_or_rejected |
| F024 | Interdiff | optional_capability |
| F025 | Change evolution view | optional_capability |
| F038 | Credential architecture and custody already chosen | unsupported_or_rejected |
| F052 | Git HEAD and index health are separate | unsupported_or_rejected |
| F057 | Exact-profile conflict byte regression | unsupported_or_rejected |
| F065 | Revset assistance | optional_capability |
| F068 | Description drafts survive refresh | unsupported_or_rejected |
| F069 | Immutable content caches and async selection | unsupported_or_rejected |

That lifts the five-arm continuation-4 union from **46 (41.82%)** to **57 (51.82%)**.

Against that, the review arms hold **14** findings this arm misses:

F001 (Terminal attempts always have receipts), F032 (Edited text line-ending policy), F033 (External editor path confinement), F034 (Partial external editor writes), F036 (External editor stale sessions), F037 (Bound reads before allocating), F044 (Adapter implementation shape), F053 (Windows links and native file types), F074 (Process execution follows owner environment), F083 (Backup derived indexes), F089 (Partial clone and LFS/submodule eligibility), F090 (Authorized incomplete-object materialization), F106 (Restore readiness consistency), F107 (Graph page consistency and adjacency bounds).

**Seven of those fourteen are one lead family** — diffedit3 and external-editor handling (F032, F033,
F034, F036, F037, F053, F074). The union arm's own discovery *found* that family: lead 23,
"Diffedit3: editable intermediate tree, not merely a merge dialog", names the deletion bug, the SSH
and WSL story and the server-lifetime question. With 20 admissions across five stages it never
routed that lead to a study or compare job. **The finding was in hand and never developed.** That is
the clearest cost of a full arm's breadth: it pays for discovery with depth.

On this evidence, the answer to *"could a different research model change the union?"* is **no for
the union's membership and yes for its reachability.**

## Out-of-union candidates

Recorded with evidence; **none is added to the union.** Each gives the assertion, the passages cited,
my classification, and whether continuation 3 already rejected it. Continuation 3's rejected
expansions, checked against every candidate, are: the marker-only conflict command; a mutating
`status.refresh` branch as a required correction; generic in-operation credential prompting; and the
refinement cluster under F082/F086/F056 (corruption taxonomy, extras detector, clone stage details,
arbitrary conflict editor).

### C4U-01 — A read-class PM command must not be implemented by a default mutating jj invocation

**Where** `union/J0015-compare`, J0015-compare R1.

**My classification: correction.**

**The assertion.** PM rejects a disabled interchange command before invoking any native helper or process, including flags that force explicit interchange; the adapter describes and gates its complete native effect scope (automatic working-copy snapshotting, Git HEAD/ref import, Git index/ref/HEAD updates, configured stale-workspace refresh); read/navigation requests keep their null mutation-authority contract and must use a proven non-mutating observation path, returning a typed stale/blocked/degraded result rather than calling default `jj status` or refreshing the workspace; successful completion requires structured native and Git postconditions, because a no-op message or exit status is diagnostic only.

**Passages cited.**
  - Plans/Jujutsu_Integration.md JJI-003:113-141, JJI-004:153-176, JJI-006:220-243, section 3.3:301
  - Plans/jujutsu_integration_contracts.schema.json:1010-1053 (read branch with null writer/FileSafe/interop authority)
  - jj-vcs/jj cli/src/cli_util.rs:460-517 (locks and snapshots for writable invocation; may recover a stale working copy under snapshot.auto-update-stale) and cli/src/commands/status.rs:67-91 (status calls that helper), pinned e6dd2c0d
  - jj PR #9904 patch lines 7-9, 53-59, 83-88, 147-190

**Did continuation 3 already reject it?** NO - and the relationship is worth stating precisely. Continuation 3 rejected 'Add mutating status.refresh branch as a required correction' with the reason 'F002 already fixes read effects and denial; a new writer-bearing branch would change that authority.' This candidate asks for the OPPOSITE of that rejected expansion: it keeps the read branch's null authority and explicitly says 'Blanket addition of writer leases to all reads would change the existing contract unnecessarily.' The union arm, working from its own discovery with no sight of continuation 3, independently arrived at the same conclusion continuation 3 reached when it rejected that expansion.

**Why it is distinct from what is credited.** F002 requires nominal-read effects to be classified and fenced and is credited to this arm; F087 requires a read label not to confer authority and is also credited. This candidate is the implementation constraint that makes both decidable at the adapter boundary: name the native effect scope, prove the observation path is non-mutating, and never satisfy a read-class command with a default mutating invocation.

*Not added to the union. The strongest of this arm's candidates and the one most directly useful to the Plans owners.*

### C4U-02 — The certification references have no scenario matrix behind them

**Where** `union/J0015-compare`, J0015-compare R2.

**My classification: correction.**

**The assertion.** A colocation certification record must identify exact jj executable/build and adapter versions separately, Git version, catalog/source revision, Host/Environment/OS/filesystem, effective configuration, native repository/store and workspace name/root, Git worktree and common-directory identity, and topology/currentness generation, and must record separately the evidence for non-mutating observation, ordinary snapshot/synchronization, explicit import, explicit export, stale-workspace refresh, external-Git compatibility, workspace creation/removal and any approved conversion path. An unsupported, unreleased, untested, stale or mismatched combination cannot borrow another row's mutation admission; root certification does not certify a child layout.

**Passages cited.**
  - Plans/Jujutsu_Integration.md JJI-006 compatibility matrix, section 5 acceptance, JJI-004 reconciliation, JJI-005 recovery, JJI-008 closure
  - Plans/source_control_contracts.schema.json:811-1015 (jj_effective_capability_snapshot)
  - Plans/jujutsu_integration_contracts.schema.json:451-569, 573-699, 700-773, 1144-1189
  - Plans/Source_Control_System.md SCS-004:166-187 (0.44.0 and Git 2.55.0 are not timeless floors)

**Did continuation 3 already reject it?** NO. Continuation 3's rejected expansions were the marker-only conflict command, the mutating status.refresh branch, generic in-operation credential prompting, and a refinement cluster under F082/F086/F056. None is this.

**Why it is distinct from what is credited.** F050 requires exact engine, CLI, repository-format and environment qualification and is credited to this arm. This candidate is the enumeration behind the existing references: the arm establishes that the inspected definitions 'do not themselves specify a root/child/common-directory/automatic-effect/versioned scenario record or the tests needed to admit it', and supplies a nine-row acceptance matrix. Closest in kind to deepseek41's C4D-01 version-binding candidate, reached independently and from a different direction.

*Not added to the union.*

### C4U-03 — Graph gestures are a distinct operation vocabulary, not pictures of the existing scalar target

**Where** `union/J0016-compare`, J0016-compare section 3.

**My classification: product choice.**

**The assertion.** If graph gestures are offered, a gesture must capture an immutable intent against the initiating Client, RepositoryContext, repo/workspace/backend, full operation and commit snapshot and projection generation, with typed operands that distinguish one change, a materialized ordered set, a parent edge with both endpoints and expected parent list, a path or byte-safe patch with source and base identities, and an exact bookmark with expected old target; command mapping is semantic rather than name-based, edge insertion and parent add/remove require an explicit approved operand contract and must not be shoehorned into a scalar destination or a hidden composite.

**Passages cited.**
  - Plans/Source_Control_System.md SCS-017:948-996 (navigation never mutates; projection introduces no mutation command)
  - Plans/jujutsu_integration_contracts.schema.json:451-572 (closed scalar command target with source/destination revisions)
  - Plans/UI_Command_Catalog.md:12055-12069
  - Plans/FinalGUISpec.md:35710-35754
  - gulbanana/gg app/mutators/BinaryMutator.ts:97-375 and src/worker/mutations/revision.rs:473-640 @ e9d3bfe

**Did continuation 3 already reject it?** NO, but note the overlap: F066 (direct graph manipulation) is already in the union as an optional capability and is credited to this arm. What is outside the union is the operand-vocabulary observation - that the frozen command target is 'a closed scalar target with source/destination revisions, not an edge/range/path/hunk gesture vocabulary', so the gestures are different operations rather than a different picture of rebase. claude-hicap reached the same structural point from the schema side (its Defect 5).

**Why it is distinct from what is credited.** F066 asks whether to offer the gestures. This candidate is about what the contract would have to be able to express before any of them could be dispatched, and it is the reason the arm classifies the whole thing as requiring approval rather than as a repair.

*Not added to the union. Classified product choice because the arm itself does, and because the union already carries the capability question as F066.*

### C4U-04 — Contextual source, evolution and operation inspection with assisted revset entry

**Where** `union/J0017-compare`, J0017-compare Proposals A and B.

**My classification: capability.**

**The assertion.** (A) Add a source-history details mode for a selected change's immutable evolution commits, explicitly labelled rewrite interdiff versus full revision diff, plus a contextual inspector for revision, file and operation selections in the existing Source Control surface, keeping operation history and Backup on their existing owner routes. (B) Offer native-aware revset completion and signature help with source/destination selection for rebase and squash, and label search scope explicitly - bounded loaded-page quick search plus an explicit cancellable native query rather than silent scan-to-exhaustion, with missing targets retaining their identity under an unavailable or not-loaded explanation.

**Passages cited.**
  - Plans/Jujutsu_Integration.md JJI-005:180-209, section 4.1:307-309, section 3.1:253-287 (exact 31-command inventory)
  - Plans/Source_Control_System.md SCS-017:948-995
  - Plans/FinalGUISpec.md F3-529:35703-35740
  - Plans/Backup_Restore_System.md BRS-014:563-599
  - idursun/jjui internal/config/default/config.toml:30-34, 52-99 and internal/ui/common/selection.go:36-80 @ 83a5851

**Did continuation 3 already reject it?** NO. Three of its four components are already IN the union and are credited to this arm - F024 interdiff, F025 change evolution view, F065 revset assistance, F015 operation history navigation - all of them premium-side or hybrid-side optional capabilities that no review arm reached. The residue outside the union is the search-scope labelling rule: that 'not loaded' must never be presented as proof of absence and that a missing target keeps its identity rather than silently selecting a different mutation target.

**Why it is distinct from what is credited.** Recorded because the arm bundles four union capabilities with one genuinely new disclosure rule. The new part is small and specific; the rest is why this arm's optional-capability recall is the highest of the five continuation-4 arms.

*Not added to the union. The search-scope rule is the only part outside it.*

### C4U-05 — Conflict presentation must not replace a real change with a deletion-shaped surrogate

**Where** `union/J0016-compare`, J0016-compare conflict presentation.

**My classification: capability.**

**The assertion.** Show the normal parent-to-current change and the inherited unresolved conflict content as distinct views of one path, rather than replacing one with a deletion-shaped surrogate, with acceptance across changed-conflict, inherited-conflict, delete/edit and empty-diff cases and no false clean, resolved or deleted outcome and no duplicate change statistics.

**Passages cited.**
  - Plans/Jujutsu_Integration.md JJI-005:188-208
  - Plans/Source_Control_System.md SCS-017:959-972
  - Plans/FinalGUISpec.md:35710-35714
  - Plans/FileManager.md:569-577
  - gulbanana/gg src/worker/queries.rs:361-414 @ e9d3bfe (computes regular diffs then synthesizes conflict-to-empty hunks and discards regular changes for conflicted paths)

**Did continuation 3 already reject it?** PARTIALLY - and I am flagging it. Continuation 3 rejected the cluster 'Corruption taxonomy, extras detector, clone stage details and arbitrary conflict editor' as 'Refinements/alternatives under existing F082/F086/F056 and their scope boundaries, not additional demonstrated product obligations.' This is a conflict-presentation refinement under F056, which is credited to this arm. It is a presentation proposal rather than a conflict editor, so it is not squarely the rejected item, but it sits inside that rejected class and I would expect it to be declined on the same reasoning.

**Why it is distinct from what is credited.** F056 requires native multi-term conflict state and side provenance to be preserved and clean-looking text to be insufficient. This candidate is about how the preserved state is rendered alongside ordinary changes. The arm itself marks GG's current visual result uncertain.

*Not added to the union, and flagged as probably inside continuation 3's rejected-expansion class.*

## Observations

**THE UNION QUESTION: a different research model redistributed coverage; it did not extend the union.** This is the only arm whose recall is not bounded by the premium arm's artifacts, and it is the one thing in the experiment that could have changed the union. It did not. All 43 credited findings sit inside premium or hybrid: 42 in premium, 38 in hybrid, ZERO outside both. What it did do is reach 11 findings no review arm reached - F005, F015, F019, F024, F025, F038, F052, F057, F065, F068, F069 - lifting the five-arm union from 46 (41.82%) to 57 (51.82%). Those 11 come from lead families the premium arm never generated or never routed, which is exactly the space a full arm can enter and a same-input review replacement structurally cannot. On this evidence the answer to 'could a different research model change the union' is no for the union's membership and yes for its reachability.

**The review arms hold 14 findings the union misses, dominated by one lead family the union found but never routed.** F001, F032, F033, F034, F036, F037, F044, F053, F074, F083, F089, F090, F106 and F107 are held by review arms and not by the union. Seven of them (F031 aside, which the union does hold) are the diffedit3 and external-editor family: F032, F033, F034, F036, F037, F053 plus F074. The union's own discovery DID find that family - lead 23, 'Diffedit3: editable intermediate tree, not merely a merge dialog', which names the deletion bug, the SSH and WSL story and the server lifetime question - but with 20 admissions covering five stages it never routed that lead to a study or a compare job. The finding was in hand and never developed. That is the clearest cost of a full arm's breadth: it pays for discovery with depth.

**Two corrections to the runner's figures, verified from durable state.** (1) notes.md count is 19 of 20, not 18. J0018 and J0020 both timed out and still wrote notes.md (6,336 and 8,790 bytes), and J0018 wrote 8 lead documents as well; only J0019 produced nothing. Those saved documents are scored, per continuation 3's rule that budget-limited saved findings count when supported, and they carry the F005, F004, F002, F094, F082, F056, F057, F008 and F059 credits. (2) The 12-to-39 response range reconciles only through the durable meter: the three timeout jobs have no raw-omp/usage.json at all, so their native receipt count is zero while the durable meter recorded 27, 12 and 13. Totals are 484 native receipts across the 17 completed jobs (22-39 each) plus 52 durable-metered requests never receipted - which is exactly why each timeout job carries $1 unresolved, with accounting gaps missing_retained_usage_records and durable_meter_request_count_mismatch.

**The arm independently reached a conclusion continuation 3 reached by rejecting an expansion.** Continuation 3 rejected 'Add mutating status.refresh branch as a required correction' because 'F002 already fixes read effects and denial; a new writer-bearing branch would change that authority.' The union arm, with no sight of continuation 3 or any other arm, reached the same place from the opposite direction: J0015 R1 keeps the read branch's null authority, says 'Blanket addition of writer leases to all reads would change the existing contract unnecessarily', and instead requires a proven non-mutating observation path with a typed stale result. Independent convergence on a previously adjudicated boundary is the strongest single piece of evidence in this experiment that the continuation-3 union is well drawn.

## Comparison table

Premium and hybrid rows are continuation 3's own numbers. **Premium, hybrid and union ran the full
pipeline on this case; the four review arms replaced the review model only, so only their outputs
are comparable with each other, and their recall is bounded by the premium arm's artifacts while the
union arm's is not.**

| Measure | Premium | Hybrid | **union** | Claude (Arm C) | deepseek41 | muse13 | claude-hicap | glm53 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Arm kind | full pipeline | full pipeline | **full pipeline** | review only | review only | review only | review only, control | running |
| Review model | gpt-6-astra xhigh | gpt-6-astra xhigh | **stealth/union-alpha high** | claude-opus-5 xhigh | deepseek-v4.1-flash max | muse-spark-1.3 xhigh | claude-opus-5 xhigh | – |
| Recall / expanded 110 | 78 (70.91%) | 90 (81.82%) | **43 (39.09%)** | 18 (16.36%) | 33 (30.00%) | 40 (36.36%) | 46 (41.82%) | – |
| Corrections / 5 | 4 | 2 | **0** | 0 | 0 | 1 | 3 | – |
| Optional capabilities / 36 | 20 | 30 | **7** | 1 | 2 | 3 | 4 | – |
| Product choices / 6 | 3 | 5 | **0** | 0 | 1 | 1 | 3 | – |
| Unsupported or already-covered / 63 | 51 | 53 | **36** | 17 | 30 | 35 | 36 | – |
| Unique to the arm | 20 | 32 | **0** | 0 | 0 | 0 | 0 | – |
| Stage job split (d/i/h/r/c) | – / – / – / 6 / 6 | – / – / – / 6 / 4 | **1 / 5 / 5 / 6 / 3** | – / – / – / 8 / 4 | – / – / – / 9 / 3 | – / – / – / 7 / 5 | – / – / – / 6 / 6 | – |
| Completed / limited / interrupted | 7 / 5 / 0 | 2 / 5 / 3 | **17 / 0 / 3 (time)** | 1 / 11 / 0 | 2 / 10 / 0 | 10 / 2 / 0 | 12 / 0 / 0 | – |
| Jobs with a saved assertion | 12/12 | 10/10 | **19/20** | 4/12 | 8/12 | 11/12 | 12/12 | – |
| Leads reaching a comparison | – | – | **3/106 own leads (2.8%)** | 3/88 (3.4%) | 4/88 (4.5%) | 11/88 (12.5%) | 14/88 (15.9%) | – |
| Assertion documents | – | – | **114** | 18 | 19 | 16 | 64 | – |
| Discovery wall (min) | 38.450 | 7.540 | **9.918** | – | – | – | – | – |
| Implementation wall (min) | 8.600 | 24.790 | **31.486** | – | – | – | – | – |
| History wall (min) | 8.600 | 27.370 | **34.661** | – | – | – | – | – |
| Reconcile wall (min) | 48.186 | 42.341 | **61.654** | 23.103 | 18.896 | 9.296 | 43.927 | – |
| Compare wall (min) | 53.615 | 27.546 | **10.972** | 20.265 | 12.524 | 8.798 | 44.710 | – |
| Arm wall (min) | 66.346 | 42.343 | **106.306** | 31.133 | 18.930 | 11.145 | 58.920 | – |
| Summed job time (min) | 185.362 | 126.294 | **278.523** | 81.482 | 51.590 | 28.232 | 170.988 | – |
| Average concurrency | 2.794 | 2.983 | **2.620** | 2.617 | 2.725 | 2.533 | 2.902 | – |
| Per-job limits | continuation-3 regime | continuation-3 regime | **40 resp / 2400 s / no money gate** | 40 resp / 2400 s / $12 | 40 resp / 2400 s | 40 resp / 2400 s | 160 resp / 3600 s / $20 | – |
| Lifetime captured / cap | $121.92 / $250 | $73.72 / $100 | **$0.00 / $100** | $36.12 / $100 | $0.53 / $50 | $0.16 / $50 | $82.52 / $150 | – |
| New unresolved charges | $24.00 | $36.00 | **$3.00** | $0.00 | $0.00 | $0.00 | $0.00 | – |
| Captured $ per credited finding | $1.563 | $0.819 | **$0.000 (zero tariff)** | $2.007 | $0.016 | $0.004 | $1.794 | – |

The union arm's wall times are the only ones in this table that cover a whole pipeline in a single
run. Premium's and hybrid's stage rows come from two campaigns (goal 2 for the research stages,
continuation 3 for reconcile and compare) and are not one clock. **Cost is not comparable in any
direction here**: the union arm's tariff is zero, `claude-hicap` ran under an authorized higher
ceiling, and premium and hybrid accumulated over two campaigns.

Set relations among the continuation-4 arms: `claude` (18) is a subset of `union` (43), of `muse13`
(40) and of `claude-hicap` (46); `deepseek41` (33) is a subset of `muse13` and `claude-hicap`;
`muse13` is a subset of `claude-hicap`. **The union arm is comparable with none of them by
containment** — it holds 11 they all miss and misses 14 they hold. Four-arm review union 46;
five-arm union **57 (51.82%)**.

## Assertion corpus

114 documents, 488,422 bytes: 19 `notes.md` (one per job except `J0019`) and 95 lead documents.
Included: `workspace/notes.md` and `workspace/leads/*.md` only. Excluded as inputs: `handoff.md`,
`navigation.md`, `brief.md`, `assignment.md`, `sources.md`, `tool-help.md`, `research.py`. Excluded
as locator inventories: `workspace/research-evidence/sources/**`.

## Limits

- One case, one run. This does not establish a general model ranking.
- Cost is $0 at a zero tariff and is not comparable with any other arm. Duration is comparable only
  with premium and hybrid, and only loosely: the admission budgets differ (20 here against 88 and 91
  leads over two campaigns there).
- Recall is measured against continuation 3's fixed 110-finding union, which was itself built from
  premium and hybrid output. **A full arm can only score inside it**; its out-of-union propositions
  are recorded as candidates and are not added. The "zero unique findings" result must be read with
  that in mind — it says this model found nothing outside the union *that I judged a distinct,
  supported proposition*, not that no such proposition could exist.
- Premium and hybrid's research-stage credit cannot be split into discovery / implementation /
  history from the published artifacts.

## Files

| File | Contents |
|---|---|
| `union-findings.json` | 43 credited rows with class, stage, credited job, basis and evidence hashes; 7 partials |
| `union-candidates.json` | 5 out-of-union candidates and 4 observations, with rejection checks |
| `union-scoring.json` | Run verification, job table, stage timing, recall, by-stage recall, time-truncated and reached-delivery figures |
| `PROGRESS.md` | Stage-by-stage progress note |
| `../union-manifest.json` | Hash manifest for this directory |
