# DX sweep part 1 — retention text and isolated graph-ID fixtures

Branch `plans/ea-w2-executor-20261104`; original lane head `976fc2bea824659e86baf3130fe8bc0ce877b70a`; rebased onto fetched main `d5ec2f70c0d69c469796eea9b9cfdae30f281f42`. Graded code/fixture head `52fb3ad7809f29eb7d4f37730530ed5ba3c2dc09`; the following report-only commit preserves that tree. Final pushed head is in `sweep-p1/head.txt`.

**NOT_READY: part 2 remains required.** Sixteen prepared contracts remain unadmitted; native execution **NOT_RUN**. No deck-2 items were assigned to DX in this task. The assigned decision application is the residual first-deck G28/DL-401 text repair. No new owner choice is needed.

## Sweep part 1: findings and responses

| Item | Location, cause and fix | Commit / verification |
|---|---|---|
| **F16 / G28** | `Plans/Executor_Protocol.md:9773` (EP-216) still declared retention stopped after SP-506 and its companion had applied DL-401. Replace that stop with `RP-OPERATIONAL-2555D@1.0.0` from original fallback commitment and the SP-506 pointer. Preserve pre-lock/no-run, holds, overflow refusal and independent body/checkpoint policies. | `52fb3ad7809f29eb7d4f37730530ed5ba3c2dc09`. Compare EP-216 with `Plans/storage-plan.md:29961` and landed `Plans/Decision_Log.md:4493`; the old stop is absent. Shard check and both decomposition family CLIs pass. |
| **F20** | Graph-ID cases in twelve families changed an ID but left its joined peer well typed and different. Rebuild all 144 demonstrated multi-defect cases at the owner-read boundary, plus the 24 float cases previously masked by canonical admission. Keep 24 separate full-capture equality negatives with nonempty string IDs and recomputed source digests. | `7693cd0ba8`. `scripts/pm_executor_event_semantics.py:151` / `911`; `Plans/executor_event_semantic_fixtures.json:39770` / `12529`. Run both family CLIs and external `verify-f20.py`, `verify-cli.py`. |
| **F19** | Ordinary scheduler clocks still refuse CV-515-admitted lowercase `t`; the two `F19-wake-*-lower-t` negatives encode that mistake. | **Part 2**, as assigned: adopt CV-1101's field-owner profile with NUMRULE. Exact locations and required controls below. No new local format/number helper. |
| **Other review findings** | F1–F15, F17–F18 and S12 repairs are preserved. Cycle 10 reports no other lane-local non-number/non-proof blocker. N1/N2 remain integration gaps; N3 closes after rebase, as assessed below. | All old baselines, histories, traces, numeric/schema fixtures and unrelated source cases are unchanged; normal family suites and 230 fresh adversarial probes pass. |

### Landed decision and premise check

DL-401 records Jared's answer **“approve all except 4c B”** and the approved G28 option at `Plans/Decision_Log.md:4493`: **“The 2 restore-point records: Run year. The fallback record: 7 years, kept as operational history and counted from when the fallback result was committed.”** The current EP-216 owner still describes pre-lock fallback without a run; SP-506 already binds the same terminal commitment anchor, 2,555 days, 2,000,000/Project, expired-unheld deletion only and new-write refusal on count overflow. This repair applies that decision only to the fallback's residual semantic-owner sentence. The two restore-point contracts are outside this repair.

## Family grades before and after

PASS / PARTIAL / ABSENT against independent cycle 10. These are finite normative/static rubric cells, not admission or whole-lane readiness. All sixteen verdicts remain `NOT_READY_PENDING_PART_2` until the shared tools/profile adoptions pass.

| Family | Before | After |
|---|---|---|
| `attempt.completed` | 10 / 1 / 1 | 11 / 0 / 1 |
| `attempt.started` | 10 / 1 / 1 | 11 / 0 / 1 |
| `node.blocked` | 10 / 1 / 1 | 11 / 0 / 1 |
| `node.completed` | 10 / 1 / 1 | 11 / 0 / 1 |
| `node.started` | 10 / 1 / 1 | 11 / 0 / 1 |
| `node.unblocked` | 10 / 1 / 1 | 11 / 0 / 1 |
| `plan.decomposition_degraded` | 10 / 1 / 1 | 11 / 0 / 1 |
| `remediation.resolved` | 10 / 1 / 1 | 11 / 0 / 1 |
| `remediation.spawned` | 10 / 1 / 1 | 11 / 0 / 1 |
| `run.completed` | 11 / 0 / 1 | 11 / 0 / 1 |
| `run.graph_integrity_failed` | 11 / 0 / 1 | 11 / 0 / 1 |
| `run.node_backoff_expired` | 10 / 1 / 1 | 11 / 0 / 1 |
| `run.node_backoff_started` | 10 / 1 / 1 | 11 / 0 / 1 |
| `run.node_ready` | 10 / 1 / 1 | 11 / 0 / 1 |
| `run.node_retry_scheduled` | 10 / 1 / 1 | 11 / 0 / 1 |
| `scheduler.pass` | 10 / 1 / 1 | 10 / 1 / 1 |

Totals: **162 PASS / 14 PARTIAL / 16 ABSENT → 175 PASS / 1 PARTIAL / 16 ABSENT**. F16 upgrades one retention cell; F20 upgrades twelve oracle cells. Scheduler's oracle cell stays PARTIAL for F19. Current source quotations were mechanically relocated/rechecked and source pins refreshed; no governance hash was restamped.

## Finding-specific guard witnesses

The owner-read ID boundary is called separately for node and run before equality. String type and nonempty-string are different predicates. Nonempty applies to strings only, so null/false cannot add a second emptiness defect. Boundary cases have one value and no peer/hash observation to leave stale. Every seed is the valid ID from that family's real owner record. Full-capture equality cases retain both type/nonempty checks, all revisions, copies and independently recomputed source hashes.

| Single predicate removed | Negatives that flip in each affected family | Others remain rejected |
|---|---|---|
| Node ID string type | Six node wrong-type values, including null/float | Eight boundary negatives retain their exact own refusal |
| Run ID string type | Six run wrong-type values, including null/float | Eight boundary negatives retain their exact own refusal |
| Node ID nonempty string | One node empty string | Thirteen boundary negatives retain their exact own refusal |
| Run ID nonempty string | One run empty string | Thirteen boundary negatives retain their exact own refusal |
| Node/run ID equality only | Two well-typed, nonempty full-capture disagreements per family | Source hashes, revisions, type and emptiness predicates stay enabled |

All twelve families pass these witnesses. The full `attempt.completed` semantic CLI fails on exactly its own six/six/one/one boundary cases under the four corresponding per-field cuts and passes after restoration. No unrelated predicate is removed; no distinct predicates are called duplicates. This is F20-specific evidence. **Whole-lane check 11 completeness remains P1 for part 2; no new inventory, guard table or general proof machinery was authored.**

## Checks and integration limits

All DX jobs run serially with the 6 GB available-memory floor; no aggregate checker was launched. The bounded check/generator children peaked at 463.1 MiB RSS, with at least 14 GB available at every normal command start; no low-memory pause was needed. No checker failure is hidden by a nested status. All 32 normal family commands exit 0 with top-level `pass`. Fresh adversarial probes: **230 expected outcomes**. Targeted F20 witnesses, all unchanged-original fixture preservation checks and source-pin/quotation checks pass.

Semantic totals:

```json
{
  "source_transition_cases": 3214,
  "receipt_replay_withdrawal_traces": 230,
  "source_score_domain_cases": 16,
  "isolated_schema_cases": 326,
  "schema_reference_cases": 208,
  "historical_read_cases": 1345,
  "numeric_boundary_cases": 2060,
  "exact_type_cases": 4020,
  "workgraph_id_boundary_cases": 168
}
```

The sixteen semantic processes also run 56 shared helper and 21 canonical golden cases each. The 168 graph-ID boundary cases are counted separately from full captures.

| Check | Exit / result |
|---|---|
| Shards generate / check | 0 / 0 |
| Index generate | 0 / pass |
| Index validate | 0 / top-level `pass`, 0 failures |
| Event-index tests | 0 |
| Runtime-vocabulary tests | 1 / existing N1 |
| `git diff --check` | 0 |

**N1:** renderer-order assertion remains outside DX. Its test and both governing GUI/release sources are byte-identical to rebased main. **N2:** the shared dormant `execution_unit_context.schema.json` → goal `body_application_v1` reference remains outside lane-owned schemas; its source is byte-identical to rebased main. **N3 is resolved by the required rebase:** current index validation exits 0 with top-level pass and zero failures, replacing cycle 10's 22 integration failures. The comparison is in `index-baseline-comparison.json`; DL-302 is now present. Changed-owner governance staleness remains for integration/reseal; no reseal was attempted.

### Standing and recurring checks

1–3: all current append/retry/replay refusals, encoded Project scope and independent foreign-Project probes pass; CV-366 application keys are N/A to these Project-only families. 4–5: existing exact inline limits, referenced logical bodies and whole-string/calendar refusals pass; scheduler lowercase-`t` remains F19 and general physical codec remains S-N4. 6–7: original semantic retry body/first receipt, source revisions/roots, checkpoint identities and exact primitive joins remain tested. 8: closed payloads still refuse success-exit injection; these are not process-exit families. 9: dormant lane reference mutations refuse; N2 remains shared. 10: unchanged retained originals read after live transitions, while withdrawal/source loss/foreign disclosure refuse; S-N5 remains. 11: F20-specific isolation passes; P1 remains open.

Fresh own mutations cover recurring classes 1–7, 11 and 12: forged source hashes, Storage identity/revision disagreement, retained disclosure fences, typed equality, dormant refs, large linked-body corruption and publication ordering. The full existing family suites retain exact size thresholds and fresh custody cases. Class 8 has the F20 table above. Class 9 is the explicit partial/readiness reporting here. Number domains (10), frozen write-time resources (10a) and full physical bytes remain the named shared adoptions; no broader clearance is claimed.

## Part 2 items

- **F19 / CV-1101:** `scripts/pm_executor_event_semantics.py:362` (`instant`, default UTC), `458` (`validate_score_domain`), scheduler ready/wake sorts and `scripts/pm_executor_event_contracts.py:92`. Owner `Plans/Contracts_V0.md:25295` (CV-515). Adopt CV-1101's field-owner profile: ordinary ready-since and prerequisite/capacity wake clocks admit lowercase `t`; backoff observations retain uppercase T; final Z/calendar/full precision remain. Add four coherent admitted lowercase-`t` capture/shape/wake positives and replace the two contrary wake negatives, preserving source copies/digests/originals.
- **S-N1:** `run_numeric_case` loses original `-0` tokens; adopt shared current token admission at declared slots, preserving authenticated old editions.
- **S-N2:** `canonical` / `validate_canonical_domain` admit `2^60` without qualifying actual JCS decimal output; adopt CV-1100 qualification over actual owner preimages and existing tuple/prefix rules.
- **S-N3:** `validate_capture_domain`, `stored_digest`, source/dependency walks conflate JCS inputs, owner integers, Storage uint64 and physical values; separate domains with the shared helper, without local caps.
- **S-N4:** `payload_bytes` uses the restricted integer/string fixture codec; adopt SP-1100 where general physical values are needed, preserving float types and signed zero.
- **S-N5:** `record_rules`, `identity`, `schema_validate` still resolve current same-URI resources for originals; adopt SP-1101's authenticated original tuple and frozen schema/recipe/format resources. Keep valid predecessor and forgery controls.
- **P1:** restructure into named predicate guard tables and adopt `scripts/pm_guard_isolation.py` after the shared tool passes. Whole-lane predicate/duplicate completeness remains unproved until then. Existing AST/removal-set artifacts are superseded as proof claims.

## Scope and evidence

No admissions, registry append, Decision Log entry, new PlanUnit ID, new binding, test-file edit, governance artifact edit, local number helper, pm-mail or subagent. Existing IDs only: EP-210..225, CV-500..515, SP-500..515, ATS-250..257; cited DL-401. Source changes in this sweep are EP-216, the semantic checker and its graph-ID fixtures. Rebase regeneration covers the lane's existing EP/CV/SP/ATS edits; no other document's shards changed. All 15 ignored currentness inputs were copied and SHA-256 matched. The temporary worktree is removed after the lane branch is pushed; main is never pushed.

Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/sweep-p1/`.

- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/sweep-p1/f20-verification.json` — SHA-256 `f32545d00250430b2d6021ab471d6c0537b1e73333b465eb2060be62ca34179a`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/sweep-p1/f20-cli-verification.json` — SHA-256 `f8b46c3cf4d9cc23b9471a58f34f648d5c7cea5d2adb174fb0b132c45112f4ad`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/sweep-p1/own-probes.json` — SHA-256 `64213529110079724adf1dfcdeb02ad881876505ad7779efe51fc759bfcd0f7c`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/sweep-p1/preservation.json` — SHA-256 `5754ef09343ef79076393da68deea3cfb3397f6dee3f728cd8ab3acb78122b9c`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/sweep-p1/checks.json` — SHA-256 `3a9de2be5e8064860fd928adb8e11596202ba1f624b901eb1f42ffddf32b1582`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/sweep-p1/quote-audit.json` — SHA-256 `fe013898af395ac50dc3b6b8f23c2faf405520d316f931ae60dd00a87c28a296`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/sweep-p1/currentness.json` — SHA-256 `b72623c6887c9cb3b53eb0da0baf1e1b8c0b5d46fe116d4f25746361bbe73b8b`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/sweep-p1/index-baseline-comparison.json` — SHA-256 `86d9e1dcb562a0beb6fbeaddb299ce2b7d6291163e30e4cec1813cb2a54d26da`.

## Original contract binding/search lineage

The earlier per-family searches and newly authored bindings below are retained as source lineage. Their earlier grades and proof-completeness claims are superseded by this sweep report and its explicit part-2 gaps. The original binding searches remain source lineage; CV-500..515 and SP-500..515 received round 8’s numeric/format amendments.

### First-pass independent binding searches

Each row below independently searched all live top-level Plans markdown/JSON before writing. Generated shards, ledger source memory and historical audits were excluded as authority. The search captured every exact-name hit with its source line/text. Existing EventRecord, runtime snapshot/execution context, Case L-5 dedupe, SP-278 generic index and SP-286/CV-339 full-value receipt contracts are reused. No family borrows a sibling identity. New emitter/reader/version and hash recipe are labeled newly authored owner contracts. No new projector/checkpoint ID, physical family or retention policy was created.

Raw per-family search: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/binding-search.json`, SHA-256 `5c17e252b884e1f4ac1d574f73f06a9648d49ba78901729586091c2a4ee91578`.

### `attempt.completed`

Search: 12 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2753, Plans/Contracts_V0.md:15232, Plans/Contracts_V0.md:15241, Plans/Contracts_V0.md:15259, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.attempt_completed.emitter.v1@1.0.0`. New operating consumer: `executor.attempt_completed.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-500. Transition: active_attempt -> terminal_attempt; terminal outcome must have success=true or failure_class, never both; retry/backoff evidence is not a second dispatch.

### `attempt.started`

Search: 16 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:508, Plans/Contracts_V0.md:522, Plans/Contracts_V0.md:2741, Plans/Contracts_V0.md:15181, Plans/Contracts_V0.md:15191, Plans/Contracts_V0.md:15209, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.attempt_started.emitter.v1@1.0.0`. New operating consumer: `executor.attempt_started.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-501. Transition: admitted candidate -> started attempt; frozen permission/model/runtime snapshots and exact worktree baseline are durable before the barrier; increment policy counters once before worker spawn.

### `node.blocked`

Search: 39 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:598, Plans/Contracts_V0.md:712, Plans/Contracts_V0.md:2453, Plans/Contracts_V0.md:2455, Plans/Contracts_V0.md:2459, Plans/Contracts_V0.md:2762, Plans/Contracts_V0.md:2814. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.node_blocked.emitter.v1@1.0.0`. New operating consumer: `executor.node_blocked.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "blocked_sequence", "event_sequence"]`; exact RFC8785/hash recipe in SP-502. Transition: eligible node -> blocked episode; mint blocked_sequence once per actual episode under node CAS. Before an attempt exists omit attempt_id. Required restore anchors and snapshot refs publish atomically with the block, never fabricate a prior attempt.

### `node.completed`

Search: 4 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:940, Plans/Contracts_V0.md:7072, Plans/Contracts_V0.md:7104, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.node_completed.emitter.v1@1.0.0`. New operating consumer: `executor.node_completed.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-503. Transition: verified -> done or verify_pending -> failed; preserve verifier and packaging evidence. Removing a node from the ready set cannot complete it.

### `node.started`

Search: 4 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:939, Plans/Contracts_V0.md:7072, Plans/Contracts_V0.md:7103, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.node_started.emitter.v1@1.0.0`. New operating consumer: `executor.node_started.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-504. Transition: queued -> in_progress after admitted readiness and frozen actual attempt; a ready event alone cannot start a node.

### `node.unblocked`

Search: 55 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:598, Plans/Contracts_V0.md:921, Plans/Contracts_V0.md:2478, Plans/Contracts_V0.md:2480, Plans/Contracts_V0.md:2491, Plans/Contracts_V0.md:2815, Plans/Contracts_V0.md:14271. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.node_unblocked.emitter.v1@1.0.0`. New operating consumer: `executor.node_unblocked.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "blocked_sequence", "event_sequence"]`; exact RFC8785/hash recipe in SP-505. Transition: matching unresolved blocked episode -> resolved; require the exact ordered action/current prerequisite and durable recovery result. No stale approval and no safe-point anchor release before its owner terminal result.

### `plan.decomposition_degraded`

Search: 12 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2665, Plans/Contracts_V0.md:2709, Plans/Contracts_V0.md:14819, Plans/Contracts_V0.md:14828, Plans/Contracts_V0.md:14843, Plans/Contracts_V0.md:15040, Plans/Contracts_V0.md:15049. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.plan_decomposition_degraded.emitter.v1@1.0.0`. New operating consumer: `executor.plan_decomposition_degraded.history_reader.v1@1.0.0`. New identity input order: `["project_id", "source_stage", "event_sequence"]`; exact RFC8785/hash recipe in SP-506. Transition: pre-lock decomposition -> degraded pre-lock shape; graph_locked=true rejects. Shapes are redacted bounded shape descriptors, not plan bodies; evidence_ref resolves the original evidence.

### `remediation.resolved`

Search: 45 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:417, Plans/Contracts_V0.md:500, Plans/Contracts_V0.md:540, Plans/Contracts_V0.md:778, Plans/Contracts_V0.md:2643, Plans/Contracts_V0.md:2646, Plans/Contracts_V0.md:2657. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.remediation_resolved.emitter.v1@1.0.0`. New operating consumer: `executor.remediation_resolved.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "child_attempt_id", "remediation_root_id", "remediation_generation", "event_sequence"]`; exact RFC8785/hash recipe in SP-507. Transition: active remediation child -> fixed, superseded, abandoned or replan_required with exact original parent/root/child joins; ceiling_exceeded is blocked-state evidence, not a current resolution.

### `remediation.spawned`

Search: 33 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2626, Plans/Contracts_V0.md:2628, Plans/Contracts_V0.md:2630, Plans/Contracts_V0.md:2784, Plans/Contracts_V0.md:2816, Plans/Contracts_V0.md:14697, Plans/Contracts_V0.md:14706. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.remediation_spawned.emitter.v1@1.0.0`. New operating consumer: `executor.remediation_spawned.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "child_attempt_id", "remediation_root_id", "remediation_generation", "event_sequence"]`; exact RFC8785/hash recipe in SP-508. Transition: classified failed parent -> admitted remediation child, within existing generation/ceiling policy; append lineage before child dispatch; child_attempt_id is the child attempt identity, never the parent.

### `run.completed`

Search: 47 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:938, Plans/Contracts_V0.md:2366, Plans/Contracts_V0.md:7072, Plans/Contracts_V0.md:7102, Plans/Contracts_V0.md:13479, Plans/Contracts_V0.md:13489, Plans/Contracts_V0.md:13507. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.run_completed.emitter.v1@1.0.0`. New operating consumer: `executor.run_completed.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-509. Transition: active run -> owner-declared terminal result only after all required Document Set packaging audits pass and in-flight work is reconciled. Canonical usage remains usage.event; optional usage_ref resolves the UF-085 snapshot; no legacy inline token tuple.

### `run.graph_integrity_failed`

Search: 8 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2675, Plans/Contracts_V0.md:14863, Plans/Contracts_V0.md:14871, Plans/Contracts_V0.md:14886, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.run_graph_integrity_failed.emitter.v1@1.0.0`. New operating consumer: `executor.run_graph_integrity_failed.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-510. Transition: active graph validation -> integrity failure and replan path; never convert locked graph corruption into pre-lock decomposition degradation or blind retry.

### `run.node_backoff_expired`

Search: 7 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2507, Plans/Contracts_V0.md:14363, Plans/Contracts_V0.md:14371, Plans/Contracts_V0.md:14387, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.run_node_backoff_expired.emitter.v1@1.0.0`. New operating consumer: `executor.run_node_backoff_expired.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-511. Transition: matching active backoff -> elapsed wake only at or after durable backoff_until_utc; no attempt dispatch or success inferred from timer expiry.

### `run.node_backoff_started`

Search: 7 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2497, Plans/Contracts_V0.md:14320, Plans/Contracts_V0.md:14328, Plans/Contracts_V0.md:14344, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.run_node_backoff_started.emitter.v1@1.0.0`. New operating consumer: `executor.run_node_backoff_started.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-512. Transition: classified retryable failure -> scheduled backoff with existing per-error budgets; no retry of graph_integrity, verification_failed or reviewer_findings; timer never converts to terminal success.

### `run.node_ready`

Search: 5 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2444, Plans/Contracts_V0.md:14127, Plans/Contracts_V0.md:14135, Plans/Contracts_V0.md:14151, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.run_node_ready.emitter.v1@1.0.0`. New operating consumer: `executor.run_node_ready.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-513. Transition: not ready -> dependency-satisfying ready; all blockers resolve and current graph/Spec Lock/capacity requirements pass. Preserve ready_since_utc while continuously ready, do not dispatch from this event.

### `run.node_retry_scheduled`

Search: 7 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2515, Plans/Contracts_V0.md:14406, Plans/Contracts_V0.md:14415, Plans/Contracts_V0.md:14431, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.run_node_retry_scheduled.emitter.v1@1.0.0`. New operating consumer: `executor.run_node_retry_scheduled.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "prior_attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-514. Transition: classified prior attempt -> scheduled successor admission under the existing retry budget; preserve prior identity, verify safe-point/worktree and refresh permission before any distinct successor attempt.

### `scheduler.pass`

Search: 71 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:540, Plans/Contracts_V0.md:712, Plans/Contracts_V0.md:2418, Plans/Contracts_V0.md:2423, Plans/Contracts_V0.md:2425, Plans/Contracts_V0.md:2732, Plans/Contracts_V0.md:2740. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.scheduler_pass.emitter.v1@1.0.0`. New operating consumer: `executor.scheduler_pass.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "scheduler_pass_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-515. Transition: one pending wake set -> one scored pass, before dispatch; first recovery wake is startup_recovered. Select at most available_slots using the canonical score order, retain every nonselected ready node and its exclusion reason. Legacy non_selected is import-only.


## Pass-two evidence receipts

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/pass2-binding-search.json` — SHA-256 `bf22655fd256e6ec4e3cfbfde40da9b90cc84f4b487573365a8d41184a9b7600`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/pass2-id-search.json` — SHA-256 `c329cfa01802d3529a337baac0205a34824ec84317f0fe899a70af7b6c096400`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/pass2-currentness-sha256.log` — SHA-256 `7861f231de81ca0ce756a9b27d297e2c5f2700a7f7a000697492191912f685e1`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/pass2-runtime-baseline.json` — SHA-256 `abac3b4abdee0293aebdb2863521002a67ce5f5eaf1a7694e90518f8df898e1b`.
