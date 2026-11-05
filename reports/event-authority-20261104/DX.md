# DX round 9 — retention application, exact types, coherent versions and exact clocks

Branch `plans/ea-w2-executor-20261104`; reviewed base `d1bdb7cc479477a9b6f4b907001eb7f81bba84f0`; graded code/fixtures `5db3831aa1475c9318648498bb46205698319d46`. The following report-only commit preserves that code. Final pushed head is recorded in `drafts/DX/head.txt`. Sixteen families prepared without admission. Native execution **NOT_RUN**.

## Review round 9: findings and responses

| Finding | Location, cause and fix | Commit and verification |
|---|---|---|
| **F16** | `Plans/storage-plan.md:29852` (SP-506) and the companion assignment retained a stale pending question. Apply first-deck G28/DL-401: `RP-OPERATIONAL-2555D@1.0.0`, anchored to the original committed fallback result. Remove the pending marker/question. | `be6b138f20`. Exact G28 answer at `decision-answers/E-CARDS-1.as-presented-578a6774.md:92`; applied owner at `origin/plans/ea-retention-cards1-20261104`, `2663667e14346235daaa561d193e959422640b6e:Plans/storage-plan.md:17461-17464`. EP-216 still governs the same pre-lock fallback without a run. Holds/count-overflow refusal and independent linked-body/checkpoint policies remain. |
| **F17** | `scripts/pm_executor_event_semantics.py:520` and post-state effects used Python cross-type equality. Validate graph IDs/revisions and effect-count primitive types/domains before comparison, on both sides. | `e19b791890`. 504 new full-capture/type negatives: 192 effect counts, 144 revisions, 168 graph IDs. Boolean, float, string, null, array and object forms included. All 56 reviewed bool aliases now reject; 56 field-specific type cuts expose exactly their own bool witness while the family's other new type negatives reject. Existing owner minimums; no numeric cap. |
| **F18** | `Plans/executor_event_semantic_fixtures.json:2505`, case `coupled-change-original-schema_version`, had stale original/mirror copies. Rebuild all 16 with every copy at `1.0.1` and the source hash refreshed. | `2745807023`. Removing only that schema-version property's domain makes each full capture pass; all other schema predicates, original equality and hashes stay enabled. This is not a duplicate set. Prior source-value-disagreement controls remain separate. |
| **F19** | `scripts/pm_executor_event_semantics.py:352` and its retry/refresh/scheduler callers admitted weaker clock spellings and lost sub-microsecond precision; scheduler sorts used text. Current source clocks require uppercase T/final Z. Exact rational seconds preserve every fraction digit for retry arithmetic, comparison and scheduler ready/wake sorting. | `5db3831aa1`. 168 new cases (155 reject, 13 accept): source/refresh/wake formats, exact early/equal/late boundaries, 61-digit clocks, older-ready/node-ID and wake-ID ties, plus shape routes. All 28 reviewed clock/ordering counterexamples now reject. Exact 90 ns early refuses; equal and 9 ns late accept. No precision cap or retained-original rewrite. |

**No disputes.** All four blocking findings are fixed. Applying F16 uses an already-decided answer; no new product decision or Decision Log entry was made.

## Family grades before and after

PASS / PARTIAL / ABSENT against independent cycle 9. Normative/static grades only; membership stays ABSENT until separate admission.

| Family | Before | After |
|---|---|---|
| `attempt.completed` | 10 / 1 / 1 | 11 / 0 / 1 |
| `attempt.started` | 10 / 1 / 1 | 11 / 0 / 1 |
| `node.blocked` | 10 / 1 / 1 | 11 / 0 / 1 |
| `node.completed` | 10 / 1 / 1 | 11 / 0 / 1 |
| `node.started` | 10 / 1 / 1 | 11 / 0 / 1 |
| `node.unblocked` | 10 / 1 / 1 | 11 / 0 / 1 |
| `plan.decomposition_degraded` | 9 / 2 / 1 | 11 / 0 / 1 |
| `remediation.resolved` | 10 / 1 / 1 | 11 / 0 / 1 |
| `remediation.spawned` | 10 / 1 / 1 | 11 / 0 / 1 |
| `run.completed` | 10 / 1 / 1 | 11 / 0 / 1 |
| `run.graph_integrity_failed` | 10 / 1 / 1 | 11 / 0 / 1 |
| `run.node_backoff_expired` | 10 / 1 / 1 | 11 / 0 / 1 |
| `run.node_backoff_started` | 10 / 1 / 1 | 11 / 0 / 1 |
| `run.node_ready` | 10 / 1 / 1 | 11 / 0 / 1 |
| `run.node_retry_scheduled` | 10 / 1 / 1 | 11 / 0 / 1 |
| `scheduler.pass` | 10 / 1 / 1 | 11 / 0 / 1 |

Overall **159 PASS / 17 PARTIAL / 16 ABSENT → 176 PASS / 0 PARTIAL / 16 ABSENT**. All sixteen are self-graded PASS_AS_PREPARED_WITHOUT_ADMISSION within the finite static scope. All current evidence quotations are mechanically revalidated. Shared sweep items below remain open; this is neither an admission nor a native clearance.

## Targeted predicate witnesses and whole-lane check 11

The round-8 aggregate table is superseded as a completeness claim by **P1**. Per FIX-ROUND's 04:45 shared-tool instruction, no lane proof inventory was rebuilt. Whole-lane per-predicate proof is pending adoption of `scripts/pm_guard_isolation.py`; aggregate counts and compound cuts do not prove duplicates. A duplicate means the same field and same predicate at multiple sites, with each site tested alone and all together. None of the targeted cuts below merges distinct predicates.

| Guard / scope | Negatives that flip | Negatives still rejected / limit |
|---|---|---|
| Exact primitive integer type, one effect key or one node/run revision | 56 individual bool-alias witnesses, one per field cut | Every other new F17 negative in that family reruns and rejects; exact IDs are in `fix-verification.json`. Wrong float observations also hit the existing current numeric-domain guard; no general numeric proof is inferred. |
| Version membership, one schema property only | All 16 rebuilt unsupported-version negatives | Peer schema rules and all original-copy/hash joins remain enabled. Version membership is not equality with an original. |
| UTC spelling, one source-clock value | 48 offset/lowercase witnesses | Calendar parser, exact comparison, source copies/hashes and peer clock admission stay enabled. Other source paths are not weakened. |
| Early timer comparison | 90 ns and 61-digit early controls | All other retry policy/clock/custody predicates remain enabled. |
| Scheduler score ordering | 3 coherent wrong selections | Candidate partition, capacity, selected-score copies and owner hashes remain enabled. |
| Primary wake ordering | 2 coherent wrong primary reasons | Coalesced reasons and wake refs remain correct and enabled; each specimen has only one ordering defect. |

Targeted witnesses are finding-specific evidence, not a full-lane per-predicate inventory. F18's fixture defect is repaired now; P1 does not excuse stale copies or accepting product guards.

## Sweep items

- **S-N1** — `scripts/pm_executor_event_semantics.py: run_numeric_case`: Raw -0 token is lost by json.loads. Adopt shared exact current integer-token admission, preserving authenticated original editions.
- **S-N2** — `scripts/pm_executor_event_semantics.py: canonical/validate_canonical_domain`: Binary64 integer exactness does not qualify JCS output decimal exactness (2^60). Adopt shared qualification over each actual owner preimage.
- **S-N3** — `scripts/pm_executor_event_semantics.py: validate_capture_domain/stored_digest/source-dependency walks`: Current JCS admissibility is applied outside identity preimages. Separate owner integer ranges, Storage uint64 and physical domains; no new lane caps.
- **S-N4** — `scripts/pm_executor_event_semantics.py: payload_bytes`: Restricted integer/string fixture codec is not the general physical profile. Adopt SP-1100 selected physical codec, preserving float types and signed zero.
- **S-N5** — `scripts/pm_executor_event_semantics.py: record_rules/identity/schema_validate`: Original verification still resolves current same-URI resources. Adopt SP-1101 authenticated original tuple and frozen schema/recipe resources.
- **P1** — `Existing lane AST proof inventory and named removal sets`: Aggregate sites and sets are not per-predicate completeness proofs. Adopt scripts/pm_guard_isolation.py in the shared sweep; do not rebuild lane proof machinery.

These use the review's shared-rule comparison at `origin/plans/ea-numrule-20261105` `e20fa723c14a3e514005381c9c18cff7470c0bad`. No new lane-local serializer, number cap, float normalization, signed-zero erasure or unapproved format policy was added. CV-1101 was absent from that reviewed shared revision; F19 enforces this lane's existing UTC owner grammar.

## Checks and results

All family checks ran **one family/process at a time**, with resource checks and a 6 GB floor (resume threshold 7 GB). No low-memory pause was needed in the completed round-9 runs. Initial disk/RAM were 103 GB / 11 GB. All 32 normal family commands return exit 0 and top-level pass. A final scheduler rerun passes after the two new primary-wake cases were narrowed to one predicate.

```json
{
  "semantic": {
    "source_transition_cases": 3358,
    "receipt_replay_withdrawal_traces": 230,
    "source_score_domain_cases": 16,
    "isolated_schema_cases": 326,
    "schema_reference_cases": 208,
    "historical_read_cases": 1345,
    "numeric_boundary_cases": 2060,
    "exact_type_cases": 4020
  },
  "shape": {
    "fixture_cases": 775,
    "identity_replay_cases": 80,
    "schema_reference_cases": 208
  },
  "shared_helpers_per_family_process": 56,
  "shared_goldens_per_family_process": 21,
  "targeted_review_verification": {
    "typed_regressions": 56,
    "clock_regressions": 28,
    "version_isolation": 16,
    "predicate_witnesses": 111,
    "precision": 5,
    "retained": 128,
    "status": "pass"
  }
}
```

The precision probes distinguish adjacent admitted fractions at 7, 8, 9, 61 and 4,501 digits, beyond Python's decimal-string conversion limit. `.1Z` and `.10Z` compare as the same instant. Exact timestamp parsing affects comparison only; original timestamp strings, physical bodies, identities, source hashes and first receipts remain unchanged.

All 128 predecessor originals reproduce the review's exact unchanged custody hashes and read under ordinary/replay-only policies; 128 forged originals refuse. All original fixture prefixes, baselines, traces, histories, numeric/schema cases and the custody catalogue are unchanged, except the sixteen documented F18 negative repairs. All 504 new type cases reject; all 168 new clock cases match expectations. No guard was weakened in production.

| Check | Exit / result |
|---|---|
| `semantic-scheduler-final` | 0 / pass |
| `shards-check` | 0 / pass |
| `index-validate` | 1 / fail |
| `event-index-tests` | 0 / see captured test output |
| `runtime-vocabulary-tests` | 1 / see captured test output |
| `diff-check` | 0 / see captured test output |

Index validation is judged by its **top-level** status. N1 remains the pre-existing runtime-vocabulary renderer assertion. N2 remains the shared dormant goal-body schema reference outside this lane. N3 remains the 21 legacy-ledger rows plus DL-302 absent on this older branch: 22 existing integration index failures, with no new DX unit named. These are reported without changing unrelated owners or restamping governance. The owning integration/reseal phase must address expected changed-owner hash staleness.

## All eleven standing checks and recurring classes

| Check / class | Evidence and disposition |
|---|---|
| 1 append/replay policy | All sixteen current capture/shape/trace refusals remain; retained read routes are separate. |
| 2 application key | Project-only families; application scope refuses, CV-366 app key N/A. |
| 3 Project partition | Encoded `project~` positives and raw-ID refusals retained. |
| 4 sizes / class 6 | 16,384/16,385-byte boundaries and referenced pack/custody cases retained; S-N4 limits the fixture codec claim. Native full-record bytes NOT_RUN. |
| 5 exact end / class 12 | Full schema/source/shape formats, F19 T/Z admission and exact fractional boundaries pass. |
| 6 semantic retry body / class 2 | Storage metadata-only retry preserves one original receipt/effect; caller semantic changes conflict. |
| 7 source/checkpoint joins / classes 1 and 4 | Original digests/parents/identities and F17 typed graph/effect joins refuse contradictory inputs; SP-278 nine-field tokens remain explicitly adopted. |
| 8 failure exit | Closed family payloads refuse `exit_code=0`; no subprocess-exit family. |
| 9 refs / class 5 | All lane payload/proof eager-reference cases pass; shared N2 remains an integration item. |
| 10 retained direction / classes 3 and 10a | All 128 unchanged prior originals read; forged originals and current withdrawal/access/deletion denials refuse. S-N5 frozen-resource adoption remains open. |
| 11 masks / class 8 | F18 now flips on its version-domain cut alone; targeted F17/F19 controls pass. Whole-lane proof machinery remains P1. |
| Class 7 custody | Source/Storage/family mismatch and current linked-body read checks remain in all-family production suites. |
| Class 9 grades | All 192 cells cite current text; explicit shared sweep/native limits retained. |
| Class 10 number domain | S-N1–S-N4 recorded for the shared sweep; no lane caps or physical float normalization. |
| Class 11 primitive types | 4,020 exact-type cases and all 56 reviewed alias counterexamples pass; no universal type-surface clearance is claimed. |

## Scope, IDs and evidence

Shared-file hunk: **SP-506 only** in `Plans/storage-plan.md`, plus its companion retention row. Only Storage-derived shards and the generated plan index changed; all 15 ignored currentness inputs were copied and SHA-256 matched before generation. CV/EP/ATS prose, registry, Decision Log, Spec Lock, generated evidence and auto-decisions remain untouched. No admission, WorkNodes, governance seal, subagent, pm-mail, browser or server. The temporary sparse worktree is removed after push.

**IDs used:** EP-210..225, CV-500..515, SP-500..515 and ATS-250..257 (56 existing IDs; zero minted). DL-401 and first-deck G28 are cited existing decision evidence. No new bindings or family IDs.

Raw evidence is external under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix9/`. Each cited receipt has an exact SHA-256 below; `evidence-manifest.json` covers the retained evidence, excluding itself.

- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix9/family-jobs.json` — `527e6f604e434eec6ff44b99280c6d619f254d2a2c38d69f282b462140728372`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix9/final-checks.json` — `94b399270840b5eaed3fd601e045efd195656af12ac5203dee9ff90dfbc270af`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix9/fix-verification.json` — `90c1da95061de46c7fb0fef03ce0f0b85a9d71a0c574404f9b82210f5e369468`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix9/f17-added.json` — `287a72d90612a1a16bfc19819d0dd9c6a33efe1847143a9975b4bb46779df54a`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix9/f18-repairs.json` — `33b61ddaefa4cc58c0565bb07708bd9f8565ded89694d1bdbebca23bfdbd5594`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix9/f19-added.json` — `0e89ea5c526699bd3fff7d9902dc15b0b3d9e063733915c4ad06816d0300866d`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix9/preservation.json` — `51116321bc8eab6a20831300987db1df8a6ec1aac8008067b85a17482b7ec956`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix9/quote-audit.json` — `6b8d27c9d3544b2a386d34818163143df3cf8566b614719b910fd19b10bec29c`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/fix9/currentness.json` — `5c99f673f4396a206bc852dafe6ba4c976ec1cb26b3a3ce75cdad69d6e4db75a`.

## Original contract binding/search lineage

The earlier per-family searches and newly authored bindings below are retained as source lineage. Their earlier grades and round-8 proof-completeness claims are superseded by round 9. The original binding searches remain source lineage; CV-500..515 and SP-500..515 receive this round’s numeric/format amendments.

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

