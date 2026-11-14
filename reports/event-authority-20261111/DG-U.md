# DG-U — `goal.updated` U1–U5 on the shared TEST_ONLY adapters (stream E, 2026-11-11)

Branch `plans/ea-goal-dg-u-20261111`, cut from `origin/plans/ea-goal-own-c3-w12a-20261105` at `33c60ac069`, with the shared adapters merged (`origin/plans/ea-goal-adapter-20261111` at `62e61fe59a`, merge `72bccf8da2`, no conflict). VM, local worktree `/home/sittingmongoose/pm-worktrees/DG-U`. Brief: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/DG-FAMILY.md`.

**native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.**

Everything here is TEST_ONLY. Nothing here admits anything or proves native issuance, locking, fsync, crash durability, deployment enrollment or restore. No event-registry row, admission, Decision Log entry, retention or deletion policy, PlanUnit, Spec Lock, `.evidence`, `auto_decisions.jsonl` or `.gitignore` change was made. No original bank, URI, hash or stored byte was rewritten or restamped. No NUMRULE, guard-tool or adapter file was edited. No subagents were used. `main` was not pushed.

## Result per group

| Group | Judge's complete case | Closure | Positives | Negatives | Matrix rows |
|---|---|---|---:|---:|---:|
| U1 | Physical successor, complete stored wrappers and references | **COMPLETE** | 3 | 19 | — |
| U2 | Metadata predecessors, editable states and Plan conflicts | **COMPLETE** | 6 | 13 | — |
| U3 | No-effect, unknown results, crash cuts and recovery | **COMPLETE** | 1 | 15 | 29 |
| U4 | Whole passive/current consumers and Event inspection | **COMPLETE** | 6 | 34 | — |
| U5 | Independent fences, retained history, provider guards and exact forms | **COMPLETE** | 5 | 399 | — |
| **Total** | | | **21** | **480** | **29** |

`python3 scripts/pm_goal_dg_u_oracles.py` exits **0**: every case passes. It exits 1 on any failure or accepted negative, and it refuses to run if any pinned member of the selection has drifted.

Each negative starts from a valid complete case, changes exactly one fact at one boundary, and keeps every dependent copy, digest and key coherent. It must refuse with exactly the expected code. Its refused call must also add or release no durable effect: the runner compares a footprint over every Goal and update family, SIR admission, Storage events, first custody and append reservations with the state just after the injected change. Packs are left out of that footprint on purpose. An unreferenced pack is content-addressed bytes with no Goal effect, and SP-337 reclamation owns it.

Two sweep dependencies are named by the judge and stay outside this lane. The shared guard-isolation proof (check 11) runs `scripts/pm_guard_isolation.py` over the inventory below. Shared number/format/retained-recipe adoption is the cross-lane sweep. Neither is claimed here.

## What was built

The C3-W12a finite packages could not express several things today's owner text requires: a second update on the same Goal, metadata revisions, terminal_unknown, a process restart, the full SP-299 inspection, or a fence at every helper. Under the general successor rule this lane authored an **explicitly versioned successor composition, `pm.goal.updated.dg_u.composition.v4`**, on the shared adapters:

- `Plans/goal_own_c_contracts/dg-u-successor-v4/selection.json` pins every member (the owner module, the runner and the five adapter modules) and every support file by SHA-256. The runner verifies all of them before any case.
- `Plans/goal_own_c_contracts/dg-u-corpus.v1.json` maps U1–U5 to the judge's groups and to W1-01..12, with counts and closure.
- The predecessor selections stay byte-exact history and are not relabelled: the v1/v2 corpora, the v2.3 and v3.11 packages, original banks, URIs, hashes and JSON custody.

**Owners** (`scripts/pm_goal_dg_u_owners.py`, 2,314 lines). Each owner issues from its own execution: ids come from `uuid4`, times from the world clock, and sequences and Storage times from the adapter Storage. Each keeps all its state in TEST_ONLY Storage cells, packs or segment frames, so a fresh process reopens the directory and resumes only the original effect chain.

| Owner | Role in the route |
|---|---|
| `SirOwner` | SIR-049 admission: normalized identity, dispatch, nonterminal outcome; equal retry returns the original, altered bytes conflict. Also the immutable terminal (success / no_effect / **terminal_unknown**), the CV-333 RFC 8785 result hash, the central error mapping and replay. |
| `ApprovalOwner` | HITL-1130 capture / decide / revoke / read_resolution, with PS-1130 protected person decisions. It checks the full UUID, refuses self-approval and non-person approvers, and checks content access (the O4 `A2/content_access` guard). |
| `ChatOwner` | The actual user instruction and the actual agent source message. |
| `PermissionOwner`, `ThreadOwner`, `HostStopOwner`, `PlanBindingOwner`, `InstallationOwner` | Permission snapshots; DL-047 tombstones; the single live Stop clock (stop and resume); GoalPlanBinding with binding epoch and material conflict; installed resource graph with withdraw and reinstall. |
| `GoalBodyOwner` | The sole SP-287 issuer (`owner.goal.body.mutation@1.0.0`): start (setup lineage only), objective reserve / commit / release, metadata updates, and the three readers (body, objective history, receipt). |
| `UpdateSourceOwner` | SP-299 U0 capture (SourceAudit, InputContent, Progress epoch 0 and head, written atomically), epoch-CAS progress, the command-audit reader and the input reader. |
| `UpdateProducer` | Frozen ProducerInput (SP-421 identity recomputed from the admitted SourceAudit) and the single append through the adapter `AppendOwner`. |
| `EventInspector` | `storage.goal_updated.inspect_current.v1@1.0.0`: the whole generic source through `GenericSource`, EventObservation and the private witness. |
| `GoalUpdateCommand` | The composition (U0→U4), resumable from durable state; pre-reservation and reserved no-effect; `mark_unknown` and owner `recover`. |

**Recipes, unchanged owners.** GRS-064 semantic hashes are computed over `pm.goal.canonical_json.v1`. Physical keys use the SP-287/SP-299 **lowercase-hex** recipe. That is the update-local and body-local recipe and is distinct from SP-311/SP-312 K(s); base64url `k_component` appears only in the CV-339 generic index key. The SP-421 event identity uses its nine-member JCS array. Complete outer commitments (source audit, progress snapshot, reserved control, body receipt) are SHA-256 of canonical MessagePack outer bytes (the DL-270 re-derivation). The CV-333 result hash is RFC 8785. Every integer goes through `pm_event_numbers` and every timestamp through `pm_event_datetime`.

**Physical edition.** Every stored row uses the unchanged C3-W12a part 2 edition `pm.goal.updated.physical.v3@3.0.0`. An oversized logical wrapper moves to an SP-337 pack, which is durable and read back before any row references it. The runner checks that order against the Storage transaction log. A value that the event cannot hold inline refuses at U0, before any body effect: the producer preparedness check builds the complete prepared EventRecord at its largest field values against the installed ProducerInput root.

**Roots.** Two isolated whole-resource banks are built from `goal_update_schema_resources.json` and `goal_updated_consumer_resources.json`. The three resources whose declared paths now hold newer bytes resolve to their exact original bytes through `whole-root-banks.json`. The selected physical value schema and the CV-1130 approval roots are added. Every issued value is validated against its whole root.

## U1 — physical successor

- **Positives.**
  - Ordinary Direct Save: 17 rows, all inline, largest 7,765 bytes. Equal retry after the terminal writes nothing; a lost-acknowledgement publish returns the original publication.
  - Approved agent with 4,000 supplementary scalars: InputContent, body and revision are referenced. Their logical wrappers are 17,297, 16,419 and 16,528 bytes; every stored row is ≤16,384. Pack bytes are independently resolved (BLAKE3, size, `value_sha256`, canonical decode), and every pack is durable before its referencing transaction.
  - Content-free audit, receipt and inspection survive a thread tombstone.
- **Negatives.**
  - Packs: corrupt at rest, absent, withdrawn, foreign (substituted), size substituted, media substituted, reference before pack, noncanonical pack bytes.
  - Inline rows: tampered without recomputation; tampered coherently (caught by the semantic currentness hash); copied to another key (owner identity); logical edition substituted; predecessor wrapper read as current.
  - Integers: an unrepresentable integer (2^64) refuses before any effect.
  - Text: 4,001 scalars.
  - Lifetime: input and body reads after a tombstone.
  - Event size: an EventRecord that cannot be inline, refused at U0 before the body.
  - Owner cells: an owner-cell pack commitment.

## U2 — metadata, states, Plan

- **Positives.**
  - Objective revision 2, then pause (3) and resume (4), then an approved-agent update (5). History is [1,2,5]. Revision 5 points to revision 2's hash. SourceAudit carries prior objective revision 2 against expected revision 4. Both metadata receipts carry a null accepted objective. `created_at` is unchanged, revision 2's row bytes are unchanged, and no association is invented.
  - Paused and blocked edits keep their state with no implicit resume.
  - An active agent edit; a bound non-conflicting Plan, with its binding epoch captured privately.
  - A second genuine update keeps the first update's observation and replay unchanged.
- **Negatives.** Completed refusal; stale revision (coherent); stale currentness; metadata between capture and reserve; metadata while a reservation is pending; Plan material conflict at capture and before commit; Plan epoch changed before commit; foreign Plan binding; Stop at capture and before commit; an approval made for a prior revision; boolean expected revision.

## U3 — no-effect, unknown, crash and recovery

**Fault matrix (29 rows, all pass).** Each row creates the world in a child process, kills a second child at the cut (`os._exit(73)`), reads back in a third, and re-enters in a fourth and fifth. Re-entry converges to exactly n+1, one receipt, one Event, an unchanged first receipt, unchanged frames and one terminal. The second re-entry leaves the manifest generation unchanged.

| Cut | Read back after the crash |
|---|---|
| none (direct and agent) | terminal_succeeded |
| after_source_capture | source_admitted |
| after_reserve | body_reserved |
| in_commit_before_tx (direct and agent) | body_reserved, pending, revision n |
| in_commit_after_tx | body_committed, n+1, one receipt, no Event |
| after_freeze; append before_reservation, after_reservation, before_append | event_ready |
| torn_member_frame, torn_commit_frame | event_ready, `tail_truncated` |
| after_append_frames | Event without first custody, `tail_group_issued` |
| after_append (direct and agent), before_first_receipt | Event without first custody |
| after_first_receipt | receipted |
| after_publication_progress, before_terminal | event_issued |
| after_terminal | terminal_succeeded |

**Recovery rows.**

| Row | Outcome |
|---|---|
| pre_reservation_no_effect | Stop, then no-effect terminal (rejected, `manual_stop_latched` mapped to the central `blocked_state_required`); re-entry replays it |
| reserved_release | release, then no-effect terminal |
| body_unknown_resolves_no_effect | terminal_unknown (body_effect unknown); recovery proves zero effect and releases; the terminal stays unknown |
| event_unknown_lost_ack_then_factual_success | terminal_unknown (body committed, event unknown); recovery resolves the original append custody with no second Event; replay stays unknown; the factual Event is inspectable |
| altered_reentry_conflict | `dgu/sir/request_conflict` |
| withdrawal_preserves_pending_then_settles | commit refuses during withdrawal; release proves no effect; the terminal waits for reinstall |
| withdrawal_after_commit_then_reinstall | publish refuses during withdrawal; after reinstall, the same Event completes |
| agent_reentry_rechecks_approval | a revoked approval refuses the commit on re-entry |

**In-process.**
- Positive: pre-reservation no-effect.
- Negatives: no-effect after commit; release after commit; unknown edge from body_committed; later success cannot rewrite unknown; a no-effect terminal while an Event exists or a receipt exists; success without an Event; unknown from reserved; unknown kind; unknown command; the terminal source, receipt and first-custody joins; head moved before the unknown terminal's release.

Uncertainty that cannot truthfully become no-effect is covered: event_unknown after a committed body never resolves to no_effect.

## U4 — consumers and inspection

- **Positives.**
  - Event inspection returns the whole tuple: EventObservation plus a private witness carrying the read token with `redb_snapshot_id`, the index value hash, the selected event, source audit, progress head/selector/snapshot, body receipt, original publication and installed graph. It writes nothing and advances no checkpoint.
  - Inspection does not depend on the terminal.
  - Current body and history read with no approval rerun after revocation. Pending text is never current.
  - Audit by immutable epoch and by terminal members.
  - A historical event stays inspectable after a later edit.
- **Negatives.**
  - Inspection request: foreign storage, false selector, wrong sequence, unknown event, pending first custody, another family's event.
  - Source: missing SP-299 source (raw Storage event), substituted receipt commitment, substituted segment bytes.
  - At release: stale checkpoint.
  - Inspector joins: event scope, source action, progress not issued, first receipt, full value, source join, body receipt.
  - Audit reader: selector key, terminal pending, source scope, source join, terminal progress join, progress unavailable, head record, snapshot unavailable, snapshot record, head snapshot commitment.
  - Input reader: disposed input, source join, foreign storage, permission revoked.
  - Receipt and replay: receipt intent, replay before the terminal.

## U5 — fences, retained history, exact forms

- **Fence matrix (278 negatives).**
  - Covered methods: source capture, body reserve, commit and release, producer freeze and publish, SIR terminal, the body, history, receipt, audit and input readers, event inspection and HITL capture.
  - Each method changes exactly one applicable fact at **every** returning helper and before release. The facts are permission, Stop, Stop epoch (stop then resume), tombstone, current body, Plan conflict, Plan epoch, approval, installation, checkpoint, a concurrent control change, concurrent progress, a source row and the unpublished candidate.
  - The expected code is the next helper that reads that fact, or else the method's final predicate.
  - Candidate fences compare against an independently derived copy, never against the object itself.
- **Retained history.** An earlier event, its input, audit and replay stay readable after a later edit and an approval revocation. A committed body's factual event completes after deletion and Stop, while input content refuses. A disposed proposal is not new authority.
- **Retries and forms.**
  - Equal retry writes nothing. The same text under a new instance gets a new SP-421 identity.
  - Empty and unchanged replacements are full revisions.
  - Request form refusals: wrong-type expected revision (float, string, null, bool), trailing LF, empty or array ids, object actor, lone surrogate, extra member, Direct Save with an approval id, uppercase hash, missing member.
  - Surface mismatches: agent on the Direct Save surface and Direct Save on the agent surface.
  - Approval refusals: denied, expired, unresolved, text substituted, source message substituted, request commitment substituted.
  - Proposal refusals: instruction not from the user, instruction with other text, agent message posted by the user, malformed and case-folded UUIDs, content access, self-approval, non-person approval, proposal dispatch conflict, float revision in a proposal.
  - Coherent substitutions: event identity, text commitment, replay-only policy (its whole root refuses at read), body receipt.
  - Occurred time: trailing LF and impossible day.
  - Banks: a retained bank hash substitution, plus a positive whole-bank pin check.
- **Guard-site negatives (111).**
  - Commit: every internal consistency predicate against a coherently substituted reservation.
  - Reserve, release and command: reserve conflicts, cancellation association, intent, stale currentness, Stop epoch after resume, owner epoch, approval authority, reservation missing, reserved-control commitment.
  - Body reader integrity: control bytes, scope, head, key, accepted head, history chain, origin join, missing history, current objective, row unavailable.
  - Plus permission unissued, other actor, other thread and missing right, and every TEST_ONLY owner API guard.

## Guard inventory (for the shared isolation sweep)

`DG-U-guards.json` maps every refusal code to the negatives that refused with exactly that code (262 codes). It maps every `require`/`refuse` site in the owner module, by line, to the codes and negatives that reached it: **223 sites, 203 with a negative**. No local removal engine was run and no check-11 claim is made.

The remaining 20 sites are structural. Each is listed with its reason so the shared tool can pair or prove it:

| Line | Guard | Why it has no dedicated negative |
|---:|---|---|
| 165, 173 | `dgu/jcs/key`, `dgu/jcs/type` | JCS sees only schema-validated JSON: string keys and JSON types |
| 189 | `hexk …/type` | Keys are built from ids already checked as nonempty strings |
| 197, 201 | `dgu/text/type`, `dgu/text/surrogate` | Duplicates of the GoalUpdateRequestV2 string type and no-surrogate pattern (the negative refuses at the schema) |
| 717 | `dgu/sir/request/objective_too_long` | Duplicate of schema `maxLength` 4000 (U1/N/objective_4001_scalars) |
| 1951 | `…/direct_nulls` | Duplicate of the request's Direct Save if/then rule (U5/N/direct_with_approval) |
| 683 | `dgu/physical/noncanonical` | Duplicate of the shared decoder's `physical_noncanonical` (U1/G/noncanonical_pack_bytes) |
| 496, 1923 | `…/installation_graph`, `…/final_installation` | The graph is recomputed from the pinned banks; it drifts only with bank bytes, which the whole-hash pin refuses first |
| 663 | `dgu/physical/compact_row_oversize` | The compact reference row has bounded fixed fields |
| 1044 | `…/approval_decision` | The decision enum's other values have their own guards |
| 1047 | `…/approval_expired` (clock) | This owner records `expires_at_utc` null and invents no duration (U3); the expired *decision* guard has a negative |
| 1805, 1806 | `…/stored_producer`, `…/storage_assigned` | Duplicates of the adapter Storage append readback |
| 1865, 1867 | `…/source_defect*` | A defective source with a coherent token is refused earlier by `GenericSource` (`source/retained_inventory`); the adapter self-test covers frame defects |
| 1890 | `…/publication_event` | `event_id` is a producer25 member, so `frozen_producer` refuses first (masked pair) |
| 1925 | `…/final_custody` | Storage first custody is immutable once issued |
| 2215 | `…/body_unknown_receipt` | The commit transaction CASes the progress head, so no commit can land after body_unknown |

Adapter guards reached by these negatives: `pack/present`, `pack/unavailable`, `payload/numrule/payload_digest`, `payload/numrule/payload_size`, `source/retained_inventory` and `bank/whole_hash/…`.

**Tool issue for the next batch (not a lane blocker).** `pm_goal_test_owner_adapters.observation_digest` falls back to `json.dumps(...).encode()`, which raises `UnicodeEncodeError` on a lone surrogate. Any recorder call that receives hostile text crashes instead of recording. DG-U passes a digest-safe argument summary to the recorder for SIR admissions. No real check falsely passes.

## Components used

| Key | Component | Use here |
|---|---|---|
| ST | Storage | append, frames, receipts, custody |
| TX | Storage | cells, CAS, all-or-none transactions, snapshot token |
| PK | Storage | packs |
| RO | Reopen | FaultPlan cut points, `CRASH_EXIT`, fresh-process reopen and SP-347 recovery; `run_protocol`/`probe_spec` for raw-event negatives |
| IF | Issuer framework | `OwnerRegistry`, `TestOwner`, `AppendOwner`, `RootBank` |
| MR | `MethodRecorder` | order checks |
| GS | `GenericSource` | inspection |
| KC | K(s) codec | `scope_partition`/`k_component`, only in the generic index key |
| RB | Pinned banks | both whole-resource banks |
| NR | NUMRULE | every integer and timestamp |

RT and RQ were not needed: `goal.updated` has no projection or retention gap and no cross-realm route.

## Owner text amended

| File | Lines | Change |
|---|---|---|
| `Plans/Automated_Testing_System.md` | 7481 (ATS-1116); 7509–7511; 7543 | Three validation surfaces added; the footer sentence gains the DG-U selection paragraph |
| `Plans/goal_own_c_contracts/protocol.md` | 57 (W1 section, before W2) | One DG-U paragraph |
| `Plans/goal_own_c_contracts/suites.json` | 38–42 (W1 row only) | Four `dg_u_*` keys |
| `Plans/goal_own_c_contracts/dg-u-corpus.v1.json`, `dg-u-successor-v4/selection.json` | — | New lane files |

No PlanUnit was added and no id was used.

## Twelve-criterion re-grade (`goal.updated`, planning grade)

| # | Criterion | C3-W12a p2 | DG-U | Basis |
|---:|---|---|---|---|
| 1 | Membership/version | PASS | PASS | Unchanged |
| 2 | Owner | PASS | PASS | Unchanged |
| 3 | Producer | PARTIAL | **PASS** | Multi-update, metadata, unknown and restart paths are implemented and tested on the selected successor |
| 4 | Closed payload | PASS | PASS | Active v3 payload validated whole |
| 5 | Scope/identity | PASS | PASS | SP-421 recomputed; UUID full match |
| 6 | Replay | PASS | PASS | Immutable terminal; replay decoration |
| 7 | Retention | PASS | PASS | DL-047 tombstone vs audit survival |
| 8 | Custody/redaction | PASS | PASS | Original custody on every path |
| 9 | Transitions | PASS | PASS | Every SP-299 progress edge, including the unknown edges |
| 10 | Consumers/checkpoints | PASS | PASS | Whole inspection tuple; no checkpoint |
| 11 | Compatibility/withdrawal | PASS | PASS | Withdrawal and reinstall rows; predecessor history kept |
| 12 | Oracles | PARTIAL | **PASS (planning)** | All five judge groups complete; the shared isolation proof and number-rule adoption remain sweep dependencies |

10/12 becomes **12/12** as a proposed self-grade. Sol and Astra reviews decide it.

## Standing checks and "What Astra keeps finding"

| Item | How it was ruled out |
|---|---|
| 1 — contradictory inputs | Every identity and digest is recomputed from source. Coherent substitutions of event identity, text commitment, receipt, publication and source joins are refused. |
| 2 — Storage metadata | Sequence, times and first receipt are compared with Storage's own custody (inspector `first_receipt`/`full_value`, terminal `first_custody`). |
| 3 — historical readers | Retained earlier events, inputs, audits and replays read after a later edit and a revocation. A committed body's event completes after deletion. Foreign, substituted and raw events refuse. |
| 4 — one field read two ways | Exact-type checks run before value checks. Uppercase hashes and case-folded UUIDs refuse. |
| 5 — unresolved references | Whole banks are crawled eagerly through `referencing`; a bank hash substitution refuses. |
| 6 — sizes | Every stored row is measured after encoding; the event fit is checked at U0. |
| 7 — custody | Re-entry resolves original custody on every path. |
| 8 — masked negatives | Each negative changes one fact. Candidate fences compare against independent copies; the self-comparison found during authoring was fixed before the final run. |
| 9 — grades | Group closure is backed by the counts above. |
| 10 — numbers written two ways | Float, string, bool and null revisions refuse. A JCS float in a proposal (1.0 passes jsonschema `integer`) refuses at `dgu/jcs/float`. |
| 11 — wrong types | Wrong-type forms are covered for revision, ids, actor and request. |
| 12 — formats | Occurred-time grammar is enforced (trailing LF, impossible day); UUIDs are checked by full match. |
| Check (1) — replay-only | A substituted `projector_replay_only` producer input refuses. |

## Shared-file hunks for the DG merge (relative to `72bccf8da2`)

| File | Hunk |
|---|---|
| `Plans/Automated_Testing_System.md` | `@@ -7508,0 +7509,3 @@` (ATS-1116 validation surfaces) and `@@ -7540 +7543 @@` (ATS-1116 footer). ATS-1117 onward is byte-exact. |
| `Plans/goal_own_c_contracts/protocol.md` | `@@ -56,0 +57,2 @@` (W1 paragraph). W2 onward, including the adapter section, is byte-exact. |
| `Plans/goal_own_c_contracts/suites.json` | `@@ -38 +38,5 @@` (W1 row only) |
| Derived | ATS shards (`Plans/_shards/automated_testing_system/**`) and `Plans/.plan_index/**`. Regenerate at integration; do not hand-merge. |
| New lane files | `scripts/pm_goal_dg_u_owners.py`, `scripts/pm_goal_dg_u_oracles.py`, `Plans/goal_own_c_contracts/dg-u-corpus.v1.json`, `Plans/goal_own_c_contracts/dg-u-successor-v4/selection.json`, this report |

No K(s) change applies to this family (DG-S/DG-R only).

## Checks

| Check | Exit | Result |
|---|---:|---|
| DG-U oracles (`pm_goal_dg_u_oracles.py --output --guards`) | 0 | 21 positives, 480 negatives, 29 matrix rows, 0 failures; selection pins verified |
| Adapter self-test (`pm_goal_test_adapters_selftest.py`) | 0 | 204/204 (64 positives, 140 negatives incl. 14 matrix rows) |
| W12 successor components | 0 | 106 cases |
| DG-OWN-C existing oracles | 0 | 355 cases (46/309) |
| DG-OWN-C source oracles | 0 | 293 cases (112/181) |
| W12a p2 corpus (re-authored v3.11, venv) | 2 | designed exit: PASS_BOUNDED_CASES, 12 scenarios, 21 positive / 86 negative, same as recorded |
| W12a historical JSON control | 0 | predecessor ordinary route still usable |
| Goal lineage self-test | 0 | pass |
| DG current writer | 0 | 931 cases / 861 negatives |
| DG Stop/block | 0 | 478 cases / 427 negatives |
| DG lifecycle | 0 | 514 cases / 487 negatives |
| DG historical-reader guard audit | 0 | 6143 cases / 6032 negatives |
| Shard generate / index generate / shard check | 0 / 0 / 0 | ATS-only derived scope: 84 ATS PlanUnit rows, no unit added or removed (7,481 / 30,125) |
| Plan-index validate (origin/main `77bae0c636`) | 1 | 126 baseline records: 105 units present on the newer origin/main and absent from both the family base and this branch (branch unit set equals base), 21 legacy removal-ledger records; none attributable to DG-U |
| `git diff --check` | 0 | clean |

Every heavy check ran one at a time inside the long-job `dgu-serial-checks`, each gated at 13.5 GiB available (`PM_GOAL_AUDIT_WORKERS=1`); the gate log is in `serial-checks.log`. The fifteen currentness files were copied from the shared checkout and verified identical (`diff -rq`) before index generation.

## Evidence

`/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-U/` holds this report, `DG-U-oracles.json` (every case, the matrix and the selection pins), `DG-U-guards.json`, every check log and `SHA256SUMS`. The W12a p2 rerun's raw captures are under `/mnt/Cursor/PuppetMaster-Evidence/tests/dg-u-20261111/w12a-p2-rerun/`.

Two re-runs were done on the VM:

- **W12a v3.11 package.** Re-authored by its own unchanged script; the manifest `31447afd…` matches the pin byte for byte, and its selection file is unchanged.
- **W12a p2 corpus.** Ran in `/home/sittingmongoose/PM-Experiments/dg-u-20261111/venv` (system site packages plus `zstandard`).
