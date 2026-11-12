# DG-CA — goal.cancelled C1 COMPLETE; C2, C3, C4 NOT_COMPLETE (unfinished, no blocker)

Lane DG-CA of `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/DG-FAMILY.md`, stream E, 2026-11-11. Branch `plans/ea-goal-dg-ca-20261111`, cut from `origin/plans/ea-goal-own-c3-w12b-20261105` at `cf7132263a`, with the shared adapters merged (`origin/plans/ea-goal-adapter-20261111` at `62e61fe59a`, merge `3d1870bf32`, adapter self-test 204/204). Sibling DG-CB (C5, C6) works on the same family; this branch touches only C1–C4 rows.

**native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.** Every owner, value and record here is TEST_ONLY. Nothing here admits anything, changes the event registry, adds a Decision Log entry, retention or deletion policy or PlanUnit, edits Spec Lock, `.evidence`, `auto_decisions.jsonl`, `.gitignore`, NUMRULE, guard-tool or adapter files, or rewrites any original bank, URI, hash or stored byte.

## Groups

| Group | Result | Basis |
|---|---|---|
| C1 authenticated no-association | **COMPLETE** | Judge's C1 complete case executed end to end on the adapters; table below |
| C2 bound-Plan route | **NOT_COMPLETE** | Not implemented this session. No technical blocker: the selected roots exist and the successor rule covers any finite gap. Remaining list: `/home/sittingmongoose/pm-scratch/DG-CA/RESUME.md` (copy in `drafts/DG-CA/RESUME.md`) |
| C3 Workflow Stop / D05 / D06 | **NOT_COMPLETE** | Not implemented this session; same basis |
| C4 late assignment / private inspection | **NOT_COMPLETE** | Not implemented this session; same basis. C2 also needs C4's `AssignmentAdmission` |

The session ran out of time for C2–C4: their entry roots are large (`PreparedBoundCancelRequest` reaches 96 definitions and ~720 required fields, `BeforeStopPrepared` adds a future-slot template engine, `OriginalOwnersNativeEntry` reaches ~412 definitions and ~2,700 required fields, and the SP-310 assignment needs Storage CURRENT/manifest/lease records). This is unfinished implementation, not a reserved choice and not an unfixable blocker. `RESUME.md` gives the order (C4's assignment tuple first, then C2, C3, then C4's inspection), the owners and roots to build, and the commands.

## C1 against the judge's complete case

| Judge element | Where it is executed and observed |
|---|---|
| Whole Goal body/control/history, enrolled binding/origin/writer domain, host Stop domain | `birth_none` (`scripts/pm_goal_dg_ca_c1.py`): one Storage transaction writes body, objective revision/origin, v2 control, host Stop domain, binding revision0/origin0/control0 under a writer domain installed over seven issued native writer registrations. Fresh enrollment, never migration. |
| Complete authenticated empty association/pending inventory | Plan, Workflow and Scheduler inventory owners each issue a complete inventory statement for the Goal; the coordinator acquires each through the registry. The `none_required` scope proof is a stored record joining the three statements. A caller dict, a missing database or a member held by any owner refuses. |
| C-source, C-stop, receipt, `none_required`, frozen Event, first append/full-value receipt, control, SIR-050 terminal | `capture_source`, `latch_and_reserve`, `commit_receipt`, `settle_owner`, `freeze_event`, `append_original`, `publish_control`, `terminal`, in that recorded order. The Event is appended by the test-owner Storage (sequence, times, frames, first custody, group digest and full-value commitment are Storage's). The terminal is published once through the append reservation (Phase D). |
| Unchanged four-state body, revision, history | Body and history cells byte-identical before capture and after the terminal, for `active`, `paused`, `blocked`. |
| Preserved prior Stop | Prior manual stop/resume receipts unchanged; the cancellation latch moves both epochs by exactly one and latches. |
| Display removal only after real publication | Display reads the stored state until `publish_control` commits, `cancelled` after. |
| Immutable duplicate replay, altered request conflict | Exact duplicate after the terminal returns the stored terminal with no Storage generation change; an altered request under the same command instance is `sir/dispatch_conflict`; an altered producer is Storage's `append/conflict/producer25`. |
| Active/paused/blocked; completed and already-cancelled refusal | Three positives; `completed` and a new operation after cancellation refuse. |
| Unknown pending effects | A genuine pending body operation refuses capture; a lost append acknowledgement stays `event_unknown` until Storage custody resolves it; an unknown terminal is never rewritten by a later success; no-effect after the latch refuses. |
| Lost acknowledgements | Append (resolve from first custody, one Event) and terminal (replay returns the published terminal). |
| False-empty sources | Per owner: genuine member present, database missing, caller-supplied empty dict. |
| Every applicable independent boundary | Each method rechecks all nine sources after each returning helper and before its transaction; one genuine owner change per source per point (SIR restart, permission revocation, body mutation, pending body operation, Stop transition, binding owner-epoch transfer, SP-423 withdrawal, Scheduler callback). |
| Crash cuts | `scripts/pm_goal_dg_ca_crash.py`: the C1 route runs in a child process that dies (`os._exit(73)`) at each of 11 Storage protocol cuts, plus a control row; a fresh process reads back, two more re-enter from the stored progress only. All 12 rows converge to one Event, one unchanged first receipt, unchanged frames, and the second re-entry changes nothing. |
| Retained history vs current | After a later Stop change and SP-423 withdrawal, every audit member and the retained binding selection still read; a held current reader and any new writer refuse. |
| Number and type forms | Every whole-root check is paired with an exact-number walk (jsonschema `integer` accepts `2.0`); string/bool/null/array/object forms refuse at the root, float at the walk. |

## Oracle counts

| Group | Positives | Negatives | Failures |
|---|---:|---:|---:|
| C1 | 21 (9 route positives + 12 crash rows) | 229 | 0 |
| C2, C3, C4 | 0 | 0 | — |

Negatives by kind (C1): 128 helper/final boundary drifts (every visited method point × every applicable genuine source change), 31 entry-source and request defects (state, stale/foreign currentness, six wrong-type revision forms, unaccepted/transport/foreign dispatch, permission, pending body work, false-empty inventories per owner, writer cutoff, trailing LF), 11 entry drifts, 19 out-of-order lower methods and caller-supplied progress/source, 5 append/replay-only/retry, 5 custody (substituted receipt fields, substituted append result, unknown stays unknown), 4 substituted stored custody, 5 terminal, 5 owner refusals, 3 birth, 3 audit, 2 withdrawal, 1 size, 1 replay, 6 SourceAudit wrong-type seams. Each negative is built from a valid route, makes one genuine change, and also requires that the refused call add no Storage effect beyond the injected change (`effects_preserved`).

**New guards with their negatives:** `DG-CA-guards.json`: 114 literal `require` sites, 59 with at least one negative refusing with exactly their code, 55 without; 196 distinct observed refusal codes (including the adapters' and the original roots' codes). The inventory lists every `require` site in the four new files with the negatives that refused with exactly that code. Sites without a dedicated negative are listed there for the shared guard-isolation sweep, with these reasons: Storage self-consistency joins unreachable from inputs (`C1/append_original/group_*`, `receipt_sequence`, `value_commitment`, `producer_digest`, `domain/head_join`, `binding/*_join`), bound/Workflow-only predicates a no-association Goal cannot reach (`body_active_run`, `binding_associations`, `binding_pending`, `binding_host_owner`), defense in depth behind an earlier guard on the same invariant (`capture_source/retry_conflict` behind `accepted_dispatch`; `settle_owner/pending_unresolved` and `publish_control/pending_unresolved` behind the owner's `goal/pending_cancel_fenced`; `birth_none/final/writer` behind `domain/writer_registered/*`), and owner-internal shape checks. No local guard-removal engine and no check-11 claim are made.

## Components used

| Component | Use |
|---|---|
| ST | append, member/commit frames, first custody, `full_value_result`, `active_durable_group`, `publish_terminal`, reservations |
| TX | every stored record via `transact` with per-key CAS; cell generation for no-effect checks |
| RO | `FaultPlan` cuts in real child processes, `classify`, the adapter `MATRIX` expectations |
| IF | `OwnerRegistry`, `TestOwner`, `acquire`, `AppendOwner`, `PublicationOwner` |
| MR | ordered calls with before/after observations of every owner and Storage |
| NR | Storage times (`storage_utc_z`), owner clocks via `format_ms`, `uint64` epochs, `producer_digest`, `full_value_commitment`, replay-only refusal |

Not used by C1: GS, RT, PK, KC (cancellation keys keep SP-305's scoped hex recipe), RB (the W12 realm banks are loaded by `pm_goal_own_c3_w12b_roots.Roots`), RQ.

## New files

| File | Lines | SHA-256 |
|---|---:|---|
| `scripts/pm_goal_dg_ca_owners.py` | 737 | `7f330dab07af7c0932c7975e96aec4c92374f70c7ecb881536aa49138900362b` |
| `scripts/pm_goal_dg_ca_c1.py` | 891 | `793e14465a955b7480d2c2a56006996a4fa3c90fa67fd4c1b0763c305208bbed` |
| `scripts/pm_goal_dg_ca_crash.py` | 183 | `791ce4ab2f1c55ccdc7cab54774c9b6eedae22d8f8cf63782dfa0cc460e8acb9` |
| `scripts/pm_goal_dg_ca_oracles.py` | 898 | `8fd700ab0d4dd9b8f1306f2c3b1ce4688ad0d9b673fd051db947562dd38b1410` |
| `Plans/goal_own_c_contracts/dg-ca-corpus-v1/coverage.json` | — | `b356bacaceb02643692946e57f4c23137b6fd02a41b4139d132bc50d3bf071af` |

`coverage.json` maps all 66 inherited method rows: 20 C1 executed, 14 C2, 12 C3, 7 C4, 4 C4/C2 (assignment), 3 C2/C3, 5 unassigned (backup capture/restore, `delete_binding_control`; outside the C1–C4 judge cases), 1 DG-CB (migration adoption).

## Units amended

| Unit | Path:line | Change |
|---|---|---|
| ATS-1117 | `Plans/Automated_Testing_System.md:7539` | validation surfaces `:7569-7570` (oracle, coverage map); footer `:7597` (C1 executed, C2–C4 NOT_COMPLETE, native line) |
| GRS-1131 | `Plans/Goal_Runtime_System.md:8977` | validation surface `:9008` |

No PlanUnit added; PlanUnit count stays 7481.

## Per-family re-grade (twelve criteria)

Order: membership/version, owner, producer, closed payload, scope/identity, replay, retention, custody/redaction, transitions, consumers/checkpoints, compatibility/withdrawal, oracles.

| Family | Before | After | Vector |
|---|---:|---:|---|
| `goal.cancelled` | 10/12 | 10/12 | `P P P P P P P P P P p p` |

Compatibility/withdrawal stays PARTIAL: C1 exercises SP-423 writer cutoff, held-reader invalidation and retained audit after withdrawal for the no-association route only; W2 requires all three routes. Oracles stay PARTIAL: C1 is complete, C2–C6 are not. Native execution is NOT_RUN independently.

## Shared-file hunks for the DG merge

| File | Hunk | Note |
|---|---|---|
| `Plans/goal_own_c_contracts/protocol.md` | `@@ -72,0 +73,2` | one DG-CA paragraph at the end of W2, before `## W3`; DG-CB's W2 paragraph will land at the same place: keep both |
| `Plans/goal_own_c_contracts/suites.json` | `@@ -67 +67,9` | `goal.cancelled` row: `dg_ca_corpus`, `dg_ca_oracle`, `dg_ca_group_closure` |
| `Plans/Automated_Testing_System.md` | `@@ -7568,0 +7569,2`, `@@ -7595 +7597` | ATS-1117 validation surfaces and footer |
| `Plans/Goal_Runtime_System.md` | `@@ -9007,0 +9008` | GRS-1131 validation surface |
| `Plans/_shards/automated_testing_system/**`, `Plans/_shards/goal_runtime_system/**`, `Plans/.plan_index/**` | regenerated | regenerate at merge, never hand-merge; 182 plan-unit rows changed, all owned by the two edited documents; readiness report changes only the two existing stale-row expected hashes |

## Merge notes

No change is needed in `scripts/pm_goal_oracle_common.py`, the adapter files, NUMRULE, the guard tool or any earlier part's script. The DG-CA modules import the adapters and the W12/W12b selection loaders unchanged. The lead's 2026-11-11 23:22Z memory rule was applied to the one heavy check (DG historical reader), run under its own per-process 2 GB RSS cap with pause below 10 GB and start/resume at 11 GB.

## Checks

All runs serial, one process at a time, `PM_GOAL_AUDIT_WORKERS=1`. Commands and resource files: `checks.json` and `*-resource.txt` in the evidence folder.

| Check | Exit | Result |
|---|---:|---|
| Adapter self-test `scripts/pm_goal_test_adapters_selftest.py` | 0 | 64 positives, 140 negatives (204), 14 fault-matrix rows |
| DG-CA oracles `scripts/pm_goal_dg_ca_oracles.py` (with crash matrix) | 0 | C1: 21 positives, 229 negatives, 0 failures; every negative `effects_preserved` |
| W12b corpus `scripts/pm_goal_own_c3_w12b_oracles.py` | 0 | 547 cases, 306 negatives (unchanged from W12b) |
| W12 successor qualification `scripts/pm_goal_own_c3_w12_successor_oracles.py` | 0 | 106 cases |
| DG-OWN-C oracles `scripts/pm_goal_own_c_oracles.py` | 0 | 355 cases, 46 positives, 309 negatives |
| DG-OWN-C source components `scripts/pm_goal_own_c_source_oracles.py` | 0 | 293 cases, 112 positives, 181 negatives |
| Goal lineage self-test | 0 | pass |
| DG current writer | 0 | 931 cases, 861 negatives |
| DG stop/block | 0 | 478 cases, 427 negatives |
| DG lifecycle | 0 | 514 cases, 487 negatives |
| DG historical reader (gated: 2 GB per-process RSS cap, pause below 10 GB, resume at 11 GB) | 0 | 6,143 cases, 6,032 negatives, 650 guards removed, 0 unproved; first complete run on this family (W12b stopped at 251/650); peak RSS 0.8 GB, one pause |
| Shard generate | 0 | ATS and GRS shard bodies only |
| Plan-index generate | 0 | 182 ATS/GRS-owned plan-unit rows; PlanUnit count 7481 |
| Shard check | 0 | pass |
| Plan-index validate (`origin/main` `77bae0c636`) | 1 | 126 failures: all 85 W12b baseline records unchanged; 41 new `plan_unit_removed_without_ledger_decision` rows, each naming a PlanUnit present on `origin/main` and absent from both the branch base `cf7132263a` and this branch (added on main after the base; `index-baseline-attribution.json`). None is a removal by this branch. No ledger, Decision Log or baseline rewritten. |
| `git diff --check` | 0 | clean |

The live fifteen-file currentness edition was copied byte-identically before index generation (`currentness-copy.sha256`). No aggregate gate, landing check or reseal was run; the two edited documents' existing stale readiness rows only change their expected hashes, which is a reseal request for the separately assigned governance task.

Raw outputs, the copied currentness edition hashes and `SHA256SUMS`: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-CA/`.
