# DG-INT — DG family integration branch and cross-family items (stream E, 2026-11-12)

Branch `plans/ea-dg-int-20261112`, cut from `origin/plans/ea-goal-own-c-20261105` at `e1188eae0c`, trimmed cone worktree `/home/sittingmongoose/pm-worktrees/dg-int` (kept for the next merges). VM. Brief: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/DG-INT.md`; item list `state/DG-MERGE-NOTES.md`.

**native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.**

Everything here is TEST_ONLY. No event-registry row, admission, Decision Log entry, retention or deletion policy, PlanUnit, Spec Lock, `.evidence`, `auto_decisions.jsonl`, `.gitignore`, NUMRULE, guard-tool or adapter file was changed. No original bank, URI, hash or stored byte was rewritten or restamped. No subagent was used. `main` was not pushed.

## Head

`@@HEAD@@` on both push URLs (GitHub and the NAS), confirmed with `git ls-remote`.

## Merges

Each `git merge --no-ff` at exactly the head the brief (or the lead) named, in this order. Derived `Plans/_shards` and `Plans/.plan_index` were never hand-merged: conflicts there were kept at the integration side and the whole set was regenerated once after the last merge (commit `5e7603be3c`).

| # | Lane | Head | Merge commit | Hand-written conflicts and resolution |
|---|---|---|---|---|
| 1 | DG-U | `bc03430ed2` | `afd7d9a4f4` | none |
| 2 | DG-S | `3ec6fd928c` | `2df35aa940` | none (58 derived paths) |
| 3 | DG-R | `89df6865da` | `b7453e1a5a` | none (4 derived paths) |
| 4 | DG-CF1 | `3058f80fb3` | `44437219f9` | Brings the W5 family beside W1-W4. Five files, each a both-sides append at the same end of file, kept ours then theirs: ATS-1120 (W34) then ATS-1121 (W5) in `Automated_Testing_System.md`; the W4 CV unit then CV-1137 in `Contracts_V0.md`; the W34 GRS units then GRS-1138 in `Goal_Runtime_System.md`; the W34 SP unit then SP-1139 in `storage-plan.md`; the started/cancelled then certified projection-reference families in `storage_value_registry.json` (families list and storage-profile map; parses, no duplicate family id or key). 898 derived paths. |
| 5 | DG-CF2 | `2637ad20ff` | `b3c0b341bf` | Sibling appends: the DG-CF1 then DG-CF2 ATS-1121 amendment paragraphs, `protocol.md` sections and `suites.json` `dg_cf1`/`dg_cf2` objects. Kept in merge order. |
| 6 | DG-CF3 | `0dfde7bc02` | `e8d645651d` | Same three places, DG-CF3's paragraph, section and `dg_cf3` object after DG-CF1's and DG-CF2's. |
| 7 | DG-CA | `f87dbe1f30` | `60ea8cd325` | none (derived only) |
| 8 | DG-R session 3 | `70bd7d7f45` (lead, 03:5xZ) | `f94bb2bd95` | none: W4 `protocol.md` lines 76-77 and the W4 `native_v7_merge_dependency` object in `suites.json` merged cleanly |

**Verification.** For every lane head, every file the lane changed since `e1188eae0c` is byte-identical in the merged tree except the seven shared files (`Automated_Testing_System.md`, `Contracts_V0.md`, `Goal_Runtime_System.md`, `storage-plan.md`, `storage_value_registry.json`, `goal_own_c_contracts/protocol.md`, `suites.json`). In those, every line a lane added is present. Six lines a lane added appeared to be missing; each traced to a commit shared by two family branches (`109e3c26c4`, W12 part 2; `751bf01ade`, W34 part 2), where the other lane left the line at the shared value and this lane edited its own unit, so the lane's own edit is what the merge kept (ATS-1116 footer: DG-U; ATS-1117 footer: DG-CA; GRS started line: DG-S; protocol W4 line: DG-R; the two `c3_w12_part2_whole_root_closure` suite lines: DG-U and DG-CA).

**DG-R v7 bank on the merged tree (lead's check).** `W5_PACKAGE` (`source-package.v2` at `73c81fa470`): `73c81fa470` is an ancestor of `HEAD`; the four tree files' git blob ids equal the pinned ids and `HEAD`'s; `RootsV7` qualifies with 18 realms, 101,669 reference sites, 272 routed, 22 edge sites, **0 unresolved**, both reading the blobs from git and reading the files in the tree (`checks/dg-r-v7-bank.json`).

**Sparse cone.** The base predates `Plans/goal_run_cancelled_w4_contracts` and `Plans/goal_run_projection_reference_contracts`; both were added to the cone after merge 3.

## K(s)

DG-S and DG-R carry byte-identical files, and so does the merged tree:

| File | SHA-256 (DG-S `3ec6fd928c` = DG-R `89df6865da` = DG-R `70bd7d7f45` = merged) |
|---|---|
| `Plans/goal_run_projection_reference_contracts/started.md` | `c139da0495675b287674b7c55cd8dd64eb45e51c8eab14970e8b1610f5e9abe9` |
| `Plans/goal_run_projection_reference_contracts/cancelled.md` | `80df93179da6cd1ddd83af460e0af051f2e3ca6f725a651846f54fcdc1a000aa` |
| `scripts/pm_goal_own_c3_w34_reference_oracles.py` | `ce0a1311b5c49543befd1a2e45b3d9fab4a8259290ec138ec93734c62e2f6817` |

**W34a converted** (`a4c784dae3`): `scripts/pm_goal_own_c3_w34a_oracles.py` built the Start custody run prefix, the operation component and the started projection key with lower-hex `h()`; its four call sites now use `pm_goal_test_storage.k_component` (unpadded base64url of exact UTF-8), as DG-S's corpus and the corrected reference oracle do. Result unchanged: `PASS_COMPONENT_ONLY`, 9 positive / 283 negative component cases, exit 2 by design (before and after).

## Integration defects found and fixed

1. **S1's D01 head carried unbound placeholder selectors** (`scripts/pm_goal_dg_s_start.py`, lane file, 5 lines, `2d5d77a0ac`). `publication_union` left the head's `activation_body` and `activation_origin` as skeleton placeholders (`storage_instance_id: 'x'`, `physical_value_sha256: 'aaaa...'`). Schema-valid, and nothing in DG-S walked them, so DG-S's claim that every selector resolves to a Storage cell did not hold for these two. DG-R's whole-tuple selector walk found them once the S1 Start sat under R2's consumer. They now select the post-Start body and the birth `owner.workflow.activation.begin.v1` origin, both actual cells. DG-S is rerun after the fix (batch 2 below).
2. **DG-R's current boundary filled real sources with schema filler** in the integrated world: the current Start argument's `d01_current` and the readback's `original_d01_lineage.pointer`. DG-R's own world has no D01 pointer or `CurrentSource` owner; S1's has both. The integrated world (`pm_goal_dg_int_world`) overlays S1's actual fresh `CurrentSource` and D01 pointer, and the P7 cancelled branch compares them across boundaries. No lane file changed.

## Integration findings not fixable on this branch (sent to the lead)

3. **R2's Goal-level `goal.cancelled` Event is a placeholder.** DG-R appends it with `payload_schema_id` `pm.goal_runtime_event.goal_cancelled.schema.v1`; `Plans/event_family_registry.json` registers `goal.cancelled` at `...goal_cancelled.schema.v3`, and the payload has two fields (`goal_id`, `operation_id`). The judge's R2 case requires the Goal cancellation source as an acquired original. The genuine one is the W2 Workflow-route original, C3, which DG-CA3 is building. The combined certified reducer halts at it (`reducer/unregistered_record`), so CF-10/P4's cancelled-row admission and R2 close when DG-CA3's original replaces it in the integrated world.
4. **The adapter's generic source does not check event-family registration.** `pm_goal_test_source.GenericSource.project` validates frames and custody but not `event_type` to exact `payload_schema_id`. DG-R's R5 reducer (and DG-S's S3, same path) therefore no-ops the unregistered off-run row of finding 3, against the judge's R5 "validate every global frame before filtering … halt before malformed/unverified off-run rows". On real inputs this makes a real check falsely pass, so it meets the stopping bar. CF3's reducer and the integrated reducer halt. Fix: adapter batch 2 (lead asked), then rerun R5/S3.
5. **DG-CF3's known-record table** (`REGISTERED`) has no `goal.cancelled` and pins `goal_run.blocked/stopped/replanned` at schema v3 where the registry has v2. The integrated reducer reads the registry instead; CF3's own corpus is unaffected.

## Cross-family items

### P7 legacy current branches — original profile COMPLETE; native-v7 under decision A

**World.** `scripts/pm_goal_dg_int_world.py` `S1CancelWorld`: DG-S's S1 owner issues the Start and DG-R's R2 owners the positive cancellation, in **one** test-owner Storage and one owner registry, without editing either lane's file.
- S1 runs its own issuance (`issue_sources`, then `owner.workflow.activation.commit_start.v2`).
- What S1 published is then adopted: the eight retained native Start wrappers through S1's own retained reader (`original_started`); the native before/after body and control through S1's native owner; and every selector target transitively. Historical versions at mutable keys (the epoch-0 StartControl, the pre-Start D01 pointer) come from the issuing S1 owner's custody. Each family has one custodian, so R2's `select/custody` and `select/cell_substituted` checks apply unchanged.
- The R2 native CAS and D01 head follow S1's native model: immutable per-revision body and control cells, the `workflow_goal_run_current` pointer, immutable per-revision D01 heads and the `executor_workflow_current_pointer`, each moved by CAS in one transaction with the new cells.
- The workflow owner epoch is chosen as 1 before issuance, the value R2 uses.
- The shared Storage instance gains DG-CF2's stamped transactions and DG-CF3's transaction handles (method subclasses), so both lanes' publishers write into it.
- DG-R's consumer and combined projector (original profile and native-v7) pass unchanged on it.

**Method.** `scripts/pm_goal_dg_int_p7.py` `LegacyConsumer` (DG-CF2's consumer, subclassed):
- The legacy row is published through DG-CF2's `publish_projection` (one generation, row plus logical checkpoint in one transaction, W5 successor `Representation`). The record is derived from the whole original: `OriginalStarted` from S1's retained reader, `OriginalCancelled` from R2's passive consumer.
- `read_current` reacquires, in order:
  - root, row and checkpoint;
  - the whole original;
  - the fresh current native source: S1's `CurrentStartSource` from its D01 owner and native truth, or R2's `CurrentSuccessfulReadback`/`CurrentRead` at one held boundary, with native truth read through S1's pointer;
  - the fresh Goal argument.
- It then requires the row to equal the record rederived from that original, and the processed prefix to equal the exact current global prefix.
- After the last helper it repeats root, row, prefix, disclosure, original and every owner-set current member.
- Every method argument is validated in the realm `certified.methods.json` names (request, `legacy_sources`, `original_0` `CurrentStartedPrivate`/`CurrentCancelledPrivate`, `original_1` `CurrentStartedGoal`/`CurrentCancelledGoal`, `original_2` `ProjectGoalCauses`, `original_3` `RetainedFileSafeEffects`), and every result against the successor's adapted root (`CurrentStartedOriginal`, `CurrentCancelledOriginal`, `HistoricalStartedOriginal`, `HistoricalCancelledOriginal`). Reads are checked to write nothing.

**Cases (group P7L):** 3 positives, 20 negatives, 0 failures.
- Positives: started current; cancelled current; retained history surviving a native advance while current refuses.
- Negatives:
  - started read after the cancellation;
  - native advance, Goal Stop, disclosure revoked and an uncovered later Event, each before the read and after the last helper;
  - row substituted at rest;
  - S1 commit withdrawn;
  - D06 control substituted at rest;
  - a newer Goal Stop before and after the helpers;
  - native truth moved before and after the helpers;
  - D06 result withdrawn;
  - a cancelled row read as the started original.
- One caveat on the cancelled positive: its Goal-level cancellation Event is finding 3's placeholder until DG-CA3 lands.

**Native-v7 branches.** `read_current_started.native_v7` and `read_current_cancelled.native_v7` also take `actual_guard_source`/`actual_guard_result`. A v7 run's guard needs the B1 coordinator Birth and empty Control coissued with the native birth. S2's birth does not coissue them, and DG-CF1 (which does) uses a different native store. So these two wait for the unified v7 store below. The S2 Start and the R2 v7 cancellation already run together in one Storage, with DG-R's v7 consumer and `ProjectorV7` passing (P4 group).

### CF-10 and P4 whole-source admission — legacy Start COMPLETE for both profiles; cancelled waits on DG-CA3; certified-run Start under decision A

`scripts/pm_goal_dg_int_reducer.py`:
- **Acquisition.** `project_prefix.reference.v1`'s own `legacy_sources` argument, a `LegacyProjectionEvidence`, is acquired from the source owners: S1/S2's retained reader for every Start, R2's passive consumer for every positive cancellation. It comes in the same coordinated acquisition as CF3's generic source and cell snapshot (`LegacySources`), and is validated whole in the consumer realm.
- **Admission.** Each same-run `goal_run.started`/`goal_run.cancelled` row is admitted only from that evidence:
  - dispatch on the run's installed profile, read from the Storage-held Start installed descriptor;
  - validation of the whole original in its own bank: W4 for the original profile, the W5 `source-package.v2` companions for native-v7, with the v7 companion required in `native_v7_starts`;
  - equality of the event, first receipt, exact custody and commitment with the actual frame;
  - every original wrapper located as a Storage cell of the same snapshot by exact SHA-256, so a substituted or unstored value halts;
  - the native transition, payload revisions and Goal revision;
  - causal order;
  - for a cancellation of a started run, its start cause must be the very Start the prefix admitted.
- **Certified rows** keep CF3's `_certified_record`.
- **Known records** come from the canonical registry.
- **Reuse.** CF3's `derive`, lower publisher, projector and reader run unchanged, rebound (`types.FunctionType` over the same code objects) to this reducer and acquisition. No CF3 file changes.

**Cases (group P4):** 4 positives, 10 negatives, 0 failures.
- Positives:
  - old-profile Start admitted from the whole original and published (stage, advance, cutover, read);
  - native-v7 Start likewise;
  - an off-run registered row validated then no-op;
  - S2 Start plus R2 v7 cancellation in one Storage under DG-R's v7 consumer and projector.
- Negatives:
  - old birth presented to the v7 branch, v7 birth to the old branch, and a header cast (all refused by the whole-evidence root);
  - v7 companion missing;
  - a started row without its original;
  - a duplicated original;
  - an origin that is not the stored original;
  - an original event that differs from the frame;
  - a v7 candidate that is not the stored original;
  - finding 3's unregistered Goal Event halting the prefix.

**Open:**
- *Cancelled-row admission* is implemented, and its joins run in the reducer, but no positive exists until the Goal-level Event is a registered original (finding 3, DG-CA3).
- *Certified-run Start admission:* CF3's certified worlds still birth the run through CF3's compact Start owner. The certified run's Start is then admitted from compact records. That moves to the unified v7 store (decision A).

### Whole native current-source inputs (item 3) — decision A, to be built on adapter batch 2

The three certified lanes built three different native stores for the same run:
- DG-CF1: compact `cf1_*` tables, with whole roots composed in owner custody;
- DG-CF2: compact body and control, whole D01 v8 wrappers and a pointer;
- DG-CF3: compact.

S2's native-v7 Start uses whole per-revision `GoalRunBodyPhysical` cells, D01 v6 heads and a pointer. The v7 body root carries `provisional_success`/`certified` and `certification_receipt`, so it can hold the whole certified chain.

Feeding DG-CF1's issued roots into DG-CF2's coordinator as-is would join values from a different store. The lead chose **option A** (mail `1112041048-e1f1`): one v7 native model, S2's, with:
- DG-CF1's CF-02/CF-03 chain;
- DG-CF2's coordinator commit, readback and current;
- DG-CF3's reducer;

all ported onto it in new `dg_int` files with lane files untouched, built on the adapter batch-2 Storage once its head arrives. Then the CF1, CF2 and CF3 corpora are rerun on it, plus the integrated corpus with item 3 and the v7 P7 branches. The design is recorded in `drafts/DG-INT/STATE.md`:
- B1 birth = S2 native birth plus native v8 birth record plus coordinator Birth and empty Control in one transaction;
- DG-CF1's native owner publishes on the S2 model;
- DG-CF2's `native_preimage`/`native_candidate`/commit publication/`read_current`/guard birth on the S2 model, with DG-CF1's whole roots as inputs and every coordinator argument validated in its `methods.json` realm;
- DG-CF3's certified admission ported to the unified families.

## New files

| File | Role |
|---|---|
| `scripts/pm_goal_dg_int_world.py` | S1/S2 Start plus R2 cancellation in one Storage (adoption, S1-model native/D01 CAS, current-source overlays, shared publisher Storage) |
| `scripts/pm_goal_dg_int_p7.py` | Certified consumer legacy original-profile current/historical branches over DG-CF2's publisher |
| `scripts/pm_goal_dg_int_reducer.py` | CF-10/P4 legacy whole-source admission; CF3's derive/publisher/projector/reader rebound |
| `scripts/pm_goal_dg_int_oracles.py` | Oracle runner, groups INT, P7L, P4; exit 0 only when every case passes |
| `reports/event-authority-20261112/DG-INT.md` | this report |

Lane files changed: `scripts/pm_goal_own_c3_w34a_oracles.py` (brief-mandated K(s) conversion) and `scripts/pm_goal_dg_s_start.py` (defect 1). No other lane file was edited.

## Oracle counts (DG-INT)

| Group | Positives | Negatives | Failures |
|---|---:|---:|---:|
| INT (S1/S2 Start + R2 cancellation, one Storage; DG-R consumer/projector unchanged) | 2 | 3 | 0 |
| P7L (legacy original-profile current/historical) | 3 | 20 | 0 |
| P4 (CF-10/P4 legacy whole-source admission, both profiles) | 4 | 10 | 0 |
| **Total** | **9** | **33** | **0** |

`python3 scripts/pm_goal_dg_int_oracles.py` (groups run separately during development: INT+P7L 268.7 s, P4 104.9 s; both exit 0). The full single run is the first resume step.

## Per-lane rerun on the merged tree

Each lane's oracle runner, one at a time under the gated runner (start/resume at ≥ 11 GB available, pause below 10 GB, 2 GB RSS cap per process; no step hit the cap), `PM_GOAL_AUDIT_WORKERS=1`, compared with the lane's own report.

| Lane | Merged head | Rerun result on the merged tree | Lane report | Match |
|---|---|---|---|---|
| DG-U | `bc03430ed2` | exit 0: 21 positives, 480 negatives, 29 matrix rows, 0 failures (436 s) | 21 / 480 / 29 | yes |
| DG-S | `3ec6fd928c` | exit 0: 46 positives, 154 negatives, 0 failures (1,296 s), before defect 1's fix | 46 / 154 | yes |
| DG-R | `70bd7d7f45` | exit 0: 46 positives, 266 negatives, 0 failures (R4 12/27) | 46 / 266 (session 3) | yes |
| DG-CF1 | `3058f80fb3` | exit 0: 6 positives, 195 negatives, 0 failures (249 s) | 6 / 195 | yes |
| DG-CA | `f87dbe1f30` | exit 0: 32 positives, 388 negatives, 0 failures (442 s) | 32 / 388 | yes |
| DG-CF2 | `2637ad20ff` | running in long-job `dgint-batch2` at the session stop | 11 / 90 / 18 | pending |
| DG-CF3 | `0dfde7bc02` | queued in `dgint-batch2` | 23 / 150 / 8 | pending |
| DG-S after defect 1 fix | `3ec6fd928c` + `2d5d77a0ac` | queued in `dgint-batch2` | 46 / 154 | pending |

## Checks

Batch 2 (long-job `dgint-batch2`, results in `/home/sittingmongoose/pm-scratch/dg-int/out/checks.json`) was still running when the session stopped (lead, claude_party quota): DG-CF2, DG-CF3, DG-S rerun, adapter self-test, NUMRULE, R1 and CF-01 demonstrations, own-c, own-c source, lineage, W12 successor, W12b, W34 reference, W34a, W34b qualify, W5 projection, W5 successor, W5, and the four DG checkers (current writer, Stop/block, lifecycle, historical reader). The W34a component corpus was run before and after its conversion: exit 2 by design, 9 / 283, unchanged.

Regeneration (`5e7603be3c`), all under a 2 GB cap:
- **Shard generate:** exit 0. Only `automated_testing_system`, `contracts_v0`, `goal_runtime_system`, `storage-plan` and `storage_value_registry` shards change, the five documents the merged lanes and families edited.
- **Index generate:** exit 0, after copying the live fifteen-file currentness edition byte-identically (`checks/currentness-sha256.txt`). 7,490 PlanUnits: exactly the union of the seven lane heads. The nine added since `e1188eae0c` (ATS-1120, ATS-1121, CV-1136, CV-1137, GRS-1136, GRS-1137, GRS-1138, SP-1138, SP-1139) come from the W34/W5 family branches; none from this branch.
- **Shard check:** exit 0.
- **Index validate:** exit 1 on both sides against `origin/main` `b5bd6cafd1`: **126 failures on the branch, 126 on a worktree at `e1188eae0c`, 0 added, 0 removed** (`checks/index-baseline-comparison.json`).

Governance staleness is the expected consequence of the merged lanes' canon edits before the next reseal (DG-S: GRS-1132, GRS-1136, SP-1134, EP-1130; DG-U: ATS-1116; DG-CA: ATS-1117, GRS-1131; DG-CF1/2/3: ATS-1121). It is a reseal request for Jared after batch 3, not a landing defect. No aggregate gate, landing check, reseal or baseline refresh was run.

## The 41 groups

| Family | Group | State | What is left, and with whom |
|---|---|---|---|
| goal.updated | U1 | COMPLETE | — (DG-U; rerun pass) |
| goal.updated | U2 | COMPLETE | — |
| goal.updated | U3 | COMPLETE | — |
| goal.updated | U4 | COMPLETE | — |
| goal.updated | U5 | COMPLETE | — |
| goal.cancelled | C1 | COMPLETE | — (DG-CA; rerun pass) |
| goal.cancelled | C2 | COMPLETE | — (Plan run retirement rows 44-48 are outside the judge's C2 case; listed by DG-CA) |
| goal.cancelled | C3 | open | DG-CA3 (running): Workflow Stop, D05/D06 joint sources. Its Goal-level `goal.cancelled` original also replaces finding 3's placeholder (DG-INT merge). |
| goal.cancelled | C4 | open | Assignment admission COMPLETE (DG-CA); private inspection with DG-CA3 |
| goal.cancelled | C5 | open | DG-CB (running) |
| goal.cancelled | C6 | open | DG-CB (after C5) |
| goal_run.started | S1 | COMPLETE | — (DG-S; defect 1 fixed here; rerun after fix below) |
| goal_run.started | S2 | COMPLETE | — |
| goal_run.started | S3 | COMPLETE | — (finding 4's adapter fix applies to its generic source too; rerun after adapter batch 2) |
| goal_run.started | S4 | COMPLETE | — |
| goal_run.started | S5 | COMPLETE | — |
| goal_run.started | S6 | COMPLETE | — |
| goal_run.cancelled | R1 | COMPLETE | — (DG-R; rerun pass) |
| goal_run.cancelled | R2 | reopened | Finding 3: the Goal-level cancellation Event is a placeholder. Closes when DG-CA3's C3 original is issued in the integrated world (DG-INT, after DG-CA3). |
| goal_run.cancelled | R3 | COMPLETE | — |
| goal_run.cancelled | R4 | COMPLETE | — (session 3; v7 bank check on the merged tree pass) |
| goal_run.cancelled | R5 | reopened | Finding 4: unregistered off-run row no-op'd. Adapter batch 2 (registry check in `GenericSource`), then rerun. |
| goal_run.cancelled | R6 | COMPLETE | — |
| goal_run.certified | F0 | COMPLETE | — (DG-CF3) |
| goal_run.certified | CF-01 | COMPLETE | — (DG-CF1; rerun pass) |
| goal_run.certified | CF-02 | COMPLETE | — |
| goal_run.certified | CF-03 | COMPLETE | — |
| goal_run.certified | CF-04 | COMPLETE | — |
| goal_run.certified | CF-05 | COMPLETE | — |
| goal_run.certified | CF-06 | open | Canonical SP-278 CURRENT/manifest/index-checkpoint images and `GenericIndexRow`s in Storage (adapter batch 2), then `NativeCurrentEventSource`/`OriginalEventPrerequisite` on the unified store (DG-INT) |
| goal_run.certified | CF-07 | open | `PublishedWorkflow.current` from DG-CF1's owners: item 3, unified v7 store (DG-INT, decision A, on adapter batch 2) |
| goal_run.certified | CF-08 | open | `CurrentGoalArgument` from the Goal binding owners and S1, plus whole native inputs: item 3 (DG-INT) |
| goal_run.certified | CF-09 | COMPLETE | — (DG-CF2; its current read's `published_native` is the CF-07 item) |
| goal_run.certified | CF-10 | open | Legacy Start admission COMPLETE (both profiles, DG-INT). Cancelled admission waits on DG-CA3 (finding 3); certified-run Start admission moves to the unified store (item 3). |
| goal_run.certified | CF-11 | COMPLETE | — (DG-CF3) |
| goal_run.certified | CF-12 | COMPLETE | — |
| goal_run.certified | P4 | open | As CF-10 |
| goal_run.certified | P5 | COMPLETE | — |
| goal_run.certified | P6 | COMPLETE | — |
| goal_run.certified | P7 | open | Certified branch COMPLETE except `published_native` (item 3). Old-profile started/cancelled COMPLETE (DG-INT; the cancelled Goal Event caveat closes with DG-CA3). Native-v7 started/cancelled need the unified store's B1 guard (item 3). |
| goal_run.certified | P8 | COMPLETE | — |

**29 COMPLETE, 12 open** (C3, C4, C5, C6, R2, R5, CF-06, CF-07, CF-08, CF-10, P4, P7). The lanes' own reports graded 31 groups COMPLETE outright, and CF-06, CF-07 and CF-08 complete only for their phase corpora with named integration inputs. Findings 3 and 4 reopen R2 and R5. This branch closes the P7 old-profile branches and the CF-10/P4 legacy Start admission, but no further whole group yet.

## What waits for whom

- **DG-CA3** (C3, C4 inspection): merge, then issue the Goal-level `goal.cancelled` through its C3 owners in the integrated world; this closes R2, the cancelled-row admission of CF-10/P4, and the P7 cancelled caveat. Rerun R2/R5/P4/P7.
- **DG-CB** (C5, C6): merge; rerun DG-CA/DG-CB corpora.
- **Adapter batch 2** (`plans/ea-goal-adapter-b2-20261112`): canonical SP-278 images, stable manifest, lease/fence, index read source, and finding 4's registry check. Merge, rerun every lane; then build the unified v7 store for item 3 (CF-07, CF-08, CF-06's prerequisite source, CF-10/P4 certified-run Start, P7 v7 branches) on that Storage.
- **DG-R session 3** is merged (`70bd7d7f45`).

## Evidence

Copies of this report, the DG-INT oracle JSON, every check log, the v7 bank check, the index comparison, the currentness hashes and the state file are in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-INT/` with `SHA256SUMS`.
