# DG-CA3 — goal.cancelled: C3 Workflow route COMPLETE, C4 private inspection COMPLETE

Lane DG-CA3 of `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/DG-FAMILY.md`, stream E, continuing lane DG-CA's family. Branch `plans/ea-goal-dg-ca3-20261112`, cut from `origin/plans/ea-goal-dg-ca-20261111` at `f87dbe1f30` (adapters merged at `62e61fe59a`; DG-CA's C1, C2 and C4 assignment admission COMPLETE). VM, trimmed sparse worktree `/home/sittingmongoose/pm-worktrees/DG-CA3` (no old plan-migration snapshot runs; 0.55 GB). Sibling DG-CB (C5, C6) may later touch the same family files; this branch touches only the C3/C4 rows.

**native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.** Every owner, value and record here is TEST_ONLY. Nothing admits anything, changes the event registry, adds a Decision Log entry, retention or deletion policy or PlanUnit, edits Spec Lock, `.evidence`, `auto_decisions.jsonl`, `.gitignore`, NUMRULE, guard-tool or adapter files, or rewrites an original bank, URI, hash or stored byte. No DG-CA file was edited.

## Groups

| Group | Result | Basis |
|---|---|---|
| C3 Workflow Stop, full D05/D06 and joint sources | **COMPLETE** | The judge's C3 complete case executed end to end (table below), positive and refusal branches, with whole goal/native roots in their own realms |
| C4 late assignment / whole private current inspection | **COMPLETE** | DG-CA's SP-305/SP-310 assignment admission (C4A) plus, here, the Workflow late assignment against Storage custody and the SP-313 v2 private inspection with every lower source route independently callable, and coverage row 10 (C1/C2 `inspect_current`) |

## C3 against the judge's complete case

| Judge element | Where it is executed and observed |
|---|---|
| Independently issue the accepted Goal/Workflow cancellation, Goal Stop/source/binding | SIR acceptance (DG-CA's `SIROwner`); `commit_workflow_binding` writes a Workflow attach `BindingPending` under binding-control CAS, then the original `WorkflowAssociation` (run source = the run body physical, execution owner/epoch) with binding revision1/origin1/control; C-source validates `SourceCaptureEntry` (whole `WholeCurrentGoalValues`, `WorkflowBindingSelection`) and `BeforeStopNativeEntry` |
| SchedulerStop, D01/native/Start activation | `RunOwner` reserves the run identity, the writer graph enrolls every writer category (Goal and Workflow terminal publishers included) **before** allocation and DomainBirth; versioned GoalRunBody/GoalRunControl physicals with a current pointer and D01 lineage; `StartOwner` appends `goal_run.started` through Storage and the CurrentStartSource joins Storage's first custody; `SchedulerStopOwner` issues the SchedulerStop only after the Goal's latched Stop |
| FileSafe/process/effect/capability/inventory/final-flush | `EffectOwner`: capability births, Stop-time revocation and reopening, FileSafe/process invocations with their original resolutions, the inventory cut and the required final flush (durable/failed/unknown) as its own complete statement |
| Complete positive D05/D06 results | `D05Owner` aggregates **only** from the effect owner's current inventory and issues the original AggregateResult/Origin/FinalFlushRecord physicals; a resolved aggregate yields the whole `SuccessfulReadback` with a fresh current boundary. `D06Owner` prepare/publish: intent, control, result, origin, native cancelled transition (revision+1) and its own `goal_run.cancelled` Event appended by Storage with first custody, or terminal preservation (certified/failed) without an Event; `read_current` returns the whole `CurrentSuccessfulReadback` (~330 KB) |
| Distinct operation identities and causal links | Goal, D05, D06 and Start operation ids distinct (asserted); D05's GoalStopSources equal the Goal's own StopIntent/StopReceipt; D06 `intent.goal_stop` selects the Goal's stored StopReceipt; D06 `intent.safe_stop_source` joins the D05 result physical; D06 origin causation selects the intent; the `goal_run.cancelled` Event's causation is the started Event |
| Genuine owner settlements and joint publication | `settle_owner.v1` re-acquires `OriginalOwnersEntry` and `OriginalOwnersNativeEntry`, resolves **every** selector of the readback against Storage's exact stored bytes (current, or a superseded committed version behind an intact latest commit), and checks scope, owner/epoch, operation, result/control/origin custody, D05/D06 join, current native bodies and the Event/first custody; ScopeProof and the `workflow_settled` arm publish in one transaction |
| Goal cancellation Event/control/SIR result and original first custody | `freeze_event.v1`, late `reserve_assignment.v1` / `issue_assignment_audit.v1` / `append_original.v1` (the Goal Event's sequence is the late reservation's), `publish_control.v1`, `terminal_succeeded.v1` (V3 result, v2 terminal through the reserved publication) |
| Mutation/rollback from resolved complete effects | `goal_run.cancelled.payload.mutation_started` and `settlement_refs` derive from the D05 settlements, which derive from resolved invocations; zero-effect positive gives `mutation_started=false` and empty refs |
| Missing, failed, unknown, foreign effects; capability reopening; flush failure | Each is a genuine owner state; D05 issues an unresolved aggregate and the positive D06 refuses with exactly `d05/effect_missing`, `d05/effect_failed`, `d05/effect_unknown`, `d05/effect_foreign`, `d05/capability_reopened`, `d05/flush_failed`, `d05/flush_unknown`; settlement then refuses (`d06/not_published`) and the truthful `terminal_unsettled` (recovery_required) preserves Stop/receipt/D05 effects |
| No-effect and terminal replay; preserving each earlier phase | Pre-Stop permission loss gives `no_effect` with Stop untouched and no native drain; exact duplicate after the terminal returns the original with no Storage or Event change; an earlier unknown terminal stays immutable after later resolution; lost append acknowledgement resolves from Storage only |
| Three route-specific roots in their own isolated banks | Every argument/result validates in `goal`, `native` or `goal_current_inspection` of `cancel-workflow-resources.v2.json` / `cancel-inspection-resources.v3.json`; no realm merge |
| SP-423, held readers, retained audit | Writer cutoff refuses new capture; a held reader refuses after withdrawal; `read_retained_success.v1` passes after a later Stop resume, a later native transition and writer-domain withdrawal (no current runtime required) |

## C4 against the judge's complete case

| Judge element | Where it is executed and observed |
|---|---|
| Fixed full Event template; actual model-Storage sequence allocation; only sequence_id may differ | The template is fixed before Stop (`prepare.v1` readiness hashes it); `reserve_assignment.v1` takes one exclusive fence and the never-reused next sequence/segment/offset after `event_ready`, and Storage assigns its two clock times into the reservation custody; the stored Event differs from the fixed template only in `sequence_id` and the two Storage times (asserted member by member) |
| No extra member or producer-field change; coherent changes compared with Storage custody | A coherent sequence shift (event + reservation + domains consistent with each other) refuses `assigned_sequence_custody`; coherent time shift refuses `assigned_times_custody`; producer field change refuses `template_event`; key-set addition refuses at the whole root; reservation offset substitution refuses `reservation_entry`; a substituted first receipt refuses `custody/receipt_mismatch` |
| Raw stored Event/frame, complete first receipt/group | `OriginalGoalAppendReadback` re-read from Storage custody: the stored Event, its frame bytes (value bytes found inside the hash-checked frame), full-value result, custody_v2, the single-member durable group |
| Genuine generic read source | Lane-local TEST_ONLY SP-278 Event Record Index read source (`scripts/pm_goal_dg_ca3_index.py`): checkpoint, one current generation (`eig_<sha256 of anchor>`), frontier with complete coverage, one row per retained Event, read token with a transient snapshot id; frontier advances only by the index owner's own publication |
| Whole SP-313 v2 private tuple; every lower reader and outer final disclosure | `read_original_inspection_custody.v1` (source audit, stop receipt, cancellation receipt, current progress pair, frozen producer: each independently callable, final predicate repeated after every lower route) and `inspect_current_event.v2` (InspectCurrentEventEntryV2; only the narrow EventObservation or a typed UnavailableRead); the frozen v1 Workflow inspector is `installation_unavailable` |
| Pending/unavailable for missing custody; current refusal on live drift; retained audit survives | `member_pending` at event_ready and before settlement; `missing_original`; stale read token after a newer index publication refuses `source_unavailable` while the retained success read passes and a fresh token observes; a corrupted source frame refuses `source_unavailable` (never reconstructed from receipts or the terminal copy) |
| No effects or checkpoint progress | Every inspection asserts unchanged Storage cell generation, Event count and index frontier revision |
| Row 10 (C1/C2 `inspect_current`) | Executed on DG-CA's `AssignedCancel` world with the index owner: observation after the append, `member_pending` before it, `permission_denied` after revocation, stale token/wrong key/wrong sequence refused |

## Oracle counts

| Group | Positives | Negatives | Failures |
|---|---:|---:|---:|
| C3 Workflow route | 14 (active, paused, blocked; terminal preserved certified and failed; zero-effect `mutation_started=false`; unresolved D05 flush failed and effect unknown with truthful unknown terminal; no-effect before Stop; lost Goal-append acknowledgement resolved from Storage; unknown terminal immutable; capture equal retry; held reader; equal Event retry and dedupe) | 174 | 0 |
| C4 private inspection and late assignment (C4I) | 7 (whole private inspection and observation; member_pending before append; unsettled custody pending; drift: current refused, retained survives, fresh token observes, retained after withdrawal; disposed source unavailable; row 10 C1 `inspect_current`; only sequence and Storage times differ from the fixed template) | 31 | 0 |
| **Total (this lane)** | **21** | **205** | **0** |

DG-CA's C1/C2/C4A corpus reruns unchanged on this branch: 32 positives, 388 negatives, 0 failures (with its child-process crash matrix).

Every negative is built from a valid route, makes one genuine owner change or presents one substituted/transport-shaped value at one boundary, must refuse with exactly its own code, and must leave Storage changed only by the injected change (DG-CA's `Suite.negative`; `effects_preserved` true for every negative). C3 negatives: 102 boundary rechecks (each of the eleven methods' final point, plus settlement's native read, with every applicable genuine source change: SIR restart, permission revocation, body/control change before Stop, Stop change, binding owner transfer, writer-domain withdrawal, scheduler inventory member, native run transition, writer inventory change), 11 native (D06 refuses flush failed/unknown, effect unknown/failed/foreign/missing and reopened capability; body moved between prepare and publish; D05 before the Goal Stop and without SchedulerStop; SchedulerStop before the Goal Stop), and 61 one-defect method negatives across capture, prepare, latch, receipt, settlement, freeze, reservation, audit, append, Storage (replay-only append and equal retry, altered Event retry), control, terminals, retained readers, replay and held reader. C4I negatives: 6 late-assignment (coherent sequence shift, coherent time shift, producer field, key-set addition, reservation offset, substituted first receipt), 11 custody-reader (each lower route substituted or missing at rest, selector not current, wrong event, permission, V2 operation refused, missing original), 9 current-inspection (stale token, index key, sequence, substituted index row, substituted late audit, substituted publication, corrupted frame, before append, permission) and 5 row-10.

**New guards with their negatives:** `DG-CA3-guards.json` lists every literal `require` site in this lane's files with the negatives that refused with exactly that code. 239 sites (route 142, native 47, inspection 41, index 9), 128 with at least one dedicated negative and 111 without; 201 distinct refusal codes observed. Sites without a dedicated negative fall into: issuance idempotency and owner self-consistency guards unreachable from inputs (`*/already_*`, `*_unavailable` on owner-held keys, `native/issue_absent`, `native/seed_not_preserved`, `run/body_join`, `d06/event_candidate_digest`, the index owner's own joins); selector schema/instance checks masked by the hash check of the same selector (any substituted cell changes its hash first); defense in depth behind an earlier guard on the same invariant (repeated writer cutoff and pending checks after Stop, D05 Goal-stop joins behind the Goal-side stop-receipt custody, SIR custody/epoch behind `acquire`); Storage-assigned value joins that actual Storage values cannot violate (`selected_manifest`, `assigned_event`, `domain/<field>`, `interval`, `codec_route` below 2^53); passive-read assertions (`*/passive`); and schema-constant wrapper checks. No local guard-removal engine and no check-11 claim are made; the inventory goes to the shared guard-isolation sweep.

## Components used

| Component | Use |
|---|---|
| ST | appends of `goal_run.started`, `goal_run.cancelled` and `goal.cancelled`; frames, first custody, `full_value_result`, `active_durable_group`, `publish_terminal`, reservations |
| TX | every stored record; per-key CAS; native transitions; the lane-local committed-version history |
| IF | `OwnerRegistry`, `TestOwner`, `acquire`, `AppendOwner`, `PublicationOwner` |
| MR | ordered coordinator calls (asserted), owner calls and before/after observations |
| RB | (through DG-CA's `Roots` banks) |
| NR | Storage/owner times, `uint64`, `producer_digest`, `full_value_commitment`, `event_value_bytes` |

Not used: PK (no over-cap record on this route: largest stored part measured in the positives, under 16 KiB), RT, RO (no child-process cut; see "Also open"), GS, KC.

## Merge notes and lane-local infrastructure (for the adapter batch)

- `WorkflowLeasedStorage` (`scripts/pm_goal_dg_ca3_route.py`) subclasses DG-CA's `LeasedStorage`: Storage-assigned late EventRecord times kept in the reservation custody and used by the reserved append, and a committed-version history so a superseded version at a mutable key stays resolvable only while the cell is its own latest commit. Retire it if the adapter gains native equivalents.
- `EventIndexOwner` (`scripts/pm_goal_dg_ca3_index.py`) is the SP-278 read source the shared adapter Storage lacks; listed for the adapter batch.
- Filler: members no Goal-route or native-reader predicate reads come from the family specimen factory (`pm_goal_own_c3_w12b_roots.Roots.make`); a seed-preservation guard refuses any seeded member the factory would drop or rewrite, and every selector in filler resolves to a stored TEST_ONLY ancillary provenance original with no semantic authority. The D05 SettlementCommitment invocation shapes and the FileSafe settlement selectors are filler; their kind and the process result/origin selectors are owner-derived.
- A whole DomainBirth with all eighteen writer registrations inline measures over the 16 KiB stored-part cap; the run's domain registers the eight categories the cancellation route needs while the exhaustive inventory stays complete (no PK route is selected for DomainBirth by its owner root).
- No change is needed in `scripts/pm_goal_oracle_common.py`, the adapter files, NUMRULE, the guard tool, DG-CA's files or any earlier part's script. DG-CA's runner already looks for `pm_goal_dg_ca_c3_cases`; this lane uses its own runner `scripts/pm_goal_dg_ca3_oracles.py` on DG-CA's `Suite` instead.

## New files

| File | Lines | SHA-256 |
|---|---:|---|
| `scripts/pm_goal_dg_ca3_cases.py` | 709 | `646f7441e883374a92457cdf2675540a737ad6a16db1b3880da84341820654b1` |
| `scripts/pm_goal_dg_ca3_index.py` | 224 | `ee1228ee95963809d89d98193dba0e127abb6cffb855edb82dfbfb1f65b80e35` |
| `scripts/pm_goal_dg_ca3_inspection.py` | 319 | `d35c288da90fa62e9d04911852c1654bd0b1cb17f8146c3430898a3184073ac0` |
| `scripts/pm_goal_dg_ca3_inspection_cases.py` | 401 | `0e6310abc58daf86be3171655558fede763589c21a2fdcdbaef73d60424767a3` |
| `scripts/pm_goal_dg_ca3_native.py` | 1129 | `ac170d7b7464bc8bb03eda7b876affe54269929f2092c23b15765446965cb764` |
| `scripts/pm_goal_dg_ca3_oracles.py` | 113 | `5b6868524fc34573350685f52d064f7dac06522bbdd1074e5feb6863c2a7f162` |
| `scripts/pm_goal_dg_ca3_route.py` | 1406 | `6466b41d12a40f6ad96465cc3578e1c7e9ec3c37ad18da8e44da14c9113ddafb` |

## Units amended

| Unit | Path:line | Change |
|---|---|---|
| ATS-1117 | `Plans/Automated_Testing_System.md:7539` | validation surface `:7571` (`python3 scripts/pm_goal_dg_ca3_oracles.py`); footer `:7598` (C3/C4 executed by DG-CA3; native line) |
| GRS-1131 | `Plans/Goal_Runtime_System.md:8977` | validation surface `:9009` |

No PlanUnit added; PlanUnit count stays 7481.

## Per-family re-grade (twelve criteria)

Order: membership/version, owner, producer, closed payload, scope/identity, replay, retention, custody/redaction, transitions, consumers/checkpoints, compatibility/withdrawal, oracles.

| Family | Before | After | Vector |
|---|---:|---:|---|
| `goal.cancelled` | 10/12 | 10/12 | `P P P P P P P P P P p p` |

The Workflow route now exercises SP-423 writer cutoff, held-reader invalidation and retained audit after withdrawal, but compatibility/withdrawal stays PARTIAL until C6's migration withdrawal (DG-CB) is executed. Oracles stay PARTIAL: C1–C4 are complete; C5/C6 (DG-CB) are not. Native execution is NOT_RUN independently.

## Shared-file hunks for the DG merge

| File | Hunk | Note |
|---|---|---|
| `Plans/goal_own_c_contracts/protocol.md` | `@@ -76,0 +77,4` | two DG-CA3 paragraphs after DG-CA's continuation paragraph, end of W2, before `## W3`; DG-CB's W2 paragraph lands at the same place: keep all |
| `Plans/goal_own_c_contracts/suites.json` | `goal.cancelled` row | `dg_ca_group_closure` C3/C4 values; new keys `dg_ca3_oracle`, `dg_ca3_group_closure`, `dg_ca3_native_owners`, `dg_ca3_index_read_source` |
| `Plans/goal_own_c_contracts/dg-ca-corpus-v1/coverage.json` | rows 10, 18, 20, 49–65; `groups.C3`, `groups.C4`; new `dg_ca3` block | DG-CB touches only its own rows (22, migration) |
| `Plans/Automated_Testing_System.md` | `@@ -7570,0 +7571`, `@@ -7597 +7598` | ATS-1117 validation surface and footer |
| `Plans/Goal_Runtime_System.md` | `@@ -9008,0 +9009` | GRS-1131 validation surface |
| `Plans/_shards/automated_testing_system/**`, `Plans/_shards/goal_runtime_system/**`, `Plans/.plan_index/**` | regenerated | regenerate at merge, never hand-merge; only rows owned by the two edited documents change |

## Also open (not in the judged C3/C4 cases)

- A child-process crash matrix of the Workflow late reserved append (fence loss across a restart leaves the operation bounded pending, never re-reserved, per GRS-078). The W2 Event-protocol crash cuts are DG-CA's C1 matrix; here the fence loss is executed in-process (`audit_fence_lost`).
- Coverage rows 21 (whole `transfer_binding_owner` tuple; used here only as a drift source), 23 (`resolve_stopped_pending`), 11–12/32–34 (backup, delete), 44–48 (Plan run retirement) and the bound-Plan edition of row 18.

## Checks

All runs serial, one per worker, `PM_GOAL_AUDIT_WORKERS=1`, by the chain `/home/sittingmongoose/pm-scratch/DG-CA3/checks3.py` (copy in `drafts/DG-CA3/checks3.py`) as long-job `dgca3-checks`, at head `cf80a5d162` (scripts and Plans as at the final head except the 15 later guard negatives); the DG-CA3 corpus was then rerun complete at `425d193e77` (final scripts). Commands and resource files: `checks.json` and `*-resource.txt` in the evidence folder.

| Check | Exit | Result |
|---|---:|---|
| Adapter self-test `scripts/pm_goal_test_adapters_selftest.py` | 0 | 204 cases pass |
| DG-CA3 oracles `scripts/pm_goal_dg_ca3_oracles.py` (final run at `425d193e77`) | 0 | C3 14/174, C4I 7/31 (positives/negatives); 0 failures; every negative `effects_preserved`; 1,753 s, peak RSS 0.18 GB |
| DG-CA3 oracles in the chain (before the 15 guard negatives) | 0 | C3 14/159, C4I 7/31; 0 failures |
| DG-CA oracles `scripts/pm_goal_dg_ca_oracles.py` (all groups, crash matrix) | 0 | C1 21/230, C2 7/98, C4A 4/60; unchanged from DG-CA |
| W12b corpus `scripts/pm_goal_own_c3_w12b_oracles.py` | 0 | 547 cases (241 valid, 306 refusals), unchanged |
| W12 successor qualification | 0 | 106 cases |
| DG-OWN-C oracles | 0 | 355 cases, 46 positives, 309 negatives |
| DG-OWN-C source components | 0 | 293 cases, 112 positives, 181 negatives |
| Goal lineage self-test | 0 | pass |
| DG current writer | 0 | 931 cases, 861 negatives |
| DG stop/block | 0 | 478 cases, 427 negatives |
| DG lifecycle | 0 | 514 cases, 487 negatives |
| DG historical reader (gated: 2 GB per-process RSS cap, pause below 10 GB, start/resume at 11 GB) | 0 | 6,143 cases, 6,032 negatives, 650 guards removed, 0 unproved; peak RSS 0.8 GB, 12 pauses |
| Shard generate / plan-index generate (documents edit) | 0 / 0 | only rows owned by ATS and GRS change; PlanUnit count 7481 |
| Shard check | 0 | pass |
| Plan-index validate (`origin/main` `b5bd6cafd1`) | 1 | 126 failures, exactly DG-CA's 126 (85 W12b baseline records; 41 `plan_unit_removed_without_ledger_decision` rows naming PlanUnits added on main after the family base); 0 new, 0 gone (`index-baseline-attribution.json`). No ledger, Decision Log or baseline rewritten |
| `git diff --check` | 0 | clean |

The live fifteen-file currentness edition was copied byte-identically before the index generation (`currentness-copy.sha256`). No aggregate gate, landing check or reseal was run; the two edited documents' existing stale readiness rows only change their expected hashes, a reseal request for the separately assigned governance task.
