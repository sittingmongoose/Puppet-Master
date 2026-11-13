# W3I — phase 1, continuity and HITL (2026-11-05)

**Branch:** `plans/ea-w3-continuity-hitl-20261105`
**Base:** `f9c5de6561dff0a53a48e530f2a5c6804a7e941d` (`origin/main` fetched before branching).
**Status:** four separately prepared contracts; no admission. Criterion 12 is **PARTIAL** for every family. Shared number/timestamp adoption, oracle code, predicate-level guard isolation, and phase-2 Sol/Astra review belong to phase 2.

## Per-name outcomes

| Name | Outcome | Current owner proof / action |
|---|---|---|
| `continuity.actor_identified` | **prepared** | OSI-1600 / CV-1600 / SP-1600 / ATS-1280. The original actor observation is distinct from an unproved `runtime_continuity.actor_bound` pairing. |
| `continuity.provenance_recorded` | **prepared** | OSI-1601 / CV-1601 / SP-1601 / ATS-1281. Source event/output/handoff provenance is distinct from resolving a navigation target. |
| `continuity.redaction_applied` | **prepared** | OSI-1602 / CV-1602 / SP-1602 / ATS-1282. Actual original redaction result; no proved equality to the runtime-continuity candidate. |
| `continuity.replay_checkpointed` | **prepared** | OSI-1603 / CV-1603 / SP-1603 / ATS-1283. Actual upstream source replay position, without a circular downstream checkpoint. |
| `subagent.cancel_requested` | **excluded** | DL-452, deck 2 item 9.c A; OSI-1604 preserves cancellation delivery and existing group/terminal history. |
| `hitl.approved` | **owner investigation: notification label** | HITL-028 names a scheduler wake; Contracts' durable resolution is `approval.granted`. No separate saved-history contract is authored. |
| `hitl.rejected` | **owner investigation: notification label** | HITL-028 names a scheduler wake; Contracts' durable resolution is `approval.denied`. No separate saved-history contract is authored. |

**Counts, four recount rows:** prepared **4**, merged **0**, excluded **0**, stopped **0**. Including the separately assigned cancellation exclusion: prepared **4**, merged **0**, excluded **1**, stopped **0**. The two HITL investigations are outside the 249 and are reported separately, not added to its denominator. **Stopped questions: none. Retention questions: none.**

## Authority and premise checks

Read in full: WAVE3.md, BRIEF-DRAFT.md, WAVE2.md, the two answer records and deck 2; also the integration-note wording rule, rubric, repository index/rules and ID/currentness memories. The deck-1 answer/option text was checked for the bounded drafting grant and G05 limitation.

- **DL-450 / 9.a A:** answer `i approve all of it`, answer-record SHA-256 `e7e8d3f3a2f23737b201becddd94ff0c707815520a366ab32758088c720927fd`, deck SHA-256 `6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30`. DL-450 and DL-452 are cited from `plans/ea-cards2-answers-20261105` at `7ddbd14d27b41b29d041b9db5105ff39fc2eb350`; they are not copied into this branch's Decision Log. This is permission to author missing definitions after per-family search, without admission, runtime enablement, feature choice or deletion-policy invention.
- **Three merge proposals:** current Orchestration's *Continuity Record Family* names its four audit facts, original `continuity_record.v1`/replay keys and source/principal/provenance/redaction fields. Contracts' *Runtime Continuity And Shared Route Object Model* lists the three target names beside `runtime_continuity.route_resolved` and `runtime_continuity_record.v1`/route-object keys. It gives no same-fact mapping, original-source equality, migration or alias rule. CV-282 is a generic cross-run continuity requirement, not equivalence evidence. Thus no merge application is made; WAVE3's explicit otherwise-draft-separately rule is applied to each. The target candidates remain unchanged and unadmitted.
- **Provenance investigation:** Orchestration requires `source_event_id` and `provenance_ref`; CV-282 requires provenance/evidence refs over stored outputs/handoffs. Contracts' route model and CV-283 describe `surface_id`, `route_kind`, `target_ref`, source/destination surfaces and navigation fallback. They specify two different facts, with no requirement that provenance be encoded as a route. Keeping source provenance separate applies those positive owner requirements; it chooses no winner between conflicting requirements.
- **Retention lead rejected:** G05 is exactly GitHub sign-in, not a continuity bucket. No GitHub app-wide allowance is extended. All four new contracts record source lineage for audit continuity, the existing *source lineage* class in Storage Case L-3, bound individually to `RP-AUTHORITY-INDEFINITE@1.0.0`. The original event/fact custody and rebuilt projection/checkpoint have distinct policies; derived values use existing `RP-PROJECTION-3GEN@1.0.0`. Linked content keeps its own permissions/deletion/hold rules. No application continuity edition is authored for this Project-bound orchestration source.
- **Cancellation exclusion:** today's Required-Subagent Criticality And Parallel Failure Policy still requires cancellable-sibling delivery, group-failure history, non-cancellable draining and terminal receipts. DL-452 explicitly chooses delivery only. Its entire original answer section is SHA-256 `630e54390163987c189b19c65a71bf35cd6982fbb833b45e585d097c81b9521e` at the pinned branch revision. The premise still holds; none of those behaviors is retired.

Recount input is pinned at `c53e4199ae94ca853a197354f3f9e7f296cf1efc`, `NEW-LIST.json` SHA-256 `2515ae5af31178a7d7a93581e982977bfb803d4494d779c72bebad9e7700376c`. The four task rows are leads, not authority for a merge or retention analogy.

## Per-family search and newly authored bindings

[W3I-search.json](W3I-search.json) records each exact-name search against the base, its current-canon scope, matches and scoped negative evidence. The search excludes generated files, source-memory ledgers, migration snapshots, audit/evidence bundles. Each original exact name occurs in the original Orchestration list; no own closed payload, producer/identity recipe, SP-286 adoption, operating consumer/checkpoint or withdrawal binding was found. The target runtime-continuity list and generic CV-282 were inspected separately. These negative results justify new technical definitions under DL-450; sibling similarity supplies no binding.

| Exact family | New semantic producer | Exact payload / units |
|---|---|---|
| `continuity.actor_identified` | `orchestrator.continuity_actor_identified.v1@1.0.0` | `pm.continuity.actor_identified.payload.v1@1.0.0`; OSI-1600, CV-1600, SP-1600, ATS-1280 |
| `continuity.provenance_recorded` | `orchestrator.continuity_provenance_recorded.v1@1.0.0` | `pm.continuity.provenance_recorded.payload.v1@1.0.0`; OSI-1601, CV-1601, SP-1601, ATS-1281 |
| `continuity.redaction_applied` | `orchestrator.continuity_redaction_applied.v1@1.0.0` | `pm.continuity.redaction_applied.payload.v1@1.0.0`; OSI-1602, CV-1602, SP-1602, ATS-1282 |
| `continuity.replay_checkpointed` | `orchestrator.continuity_replay_checkpointed.v1@1.0.0` | `pm.continuity.replay_checkpointed.payload.v1@1.0.0`; OSI-1603, CV-1603, SP-1603, ATS-1283 |

Each family's prose explicitly labels itself **NEWLY AUTHORED** and binds its own completed-fact predicate. Each separately adopts the named append admission `storage.continuity_append.v1@1.0.0`, direct projector `storage.continuity_projector.v1@1.0.0`, operating reader `reader.orchestrator.continuity_audit.v1@1.0.0`, SP-286/CV-339 full-value v2 issuance/resolution, SP-337 payload packs, and SP-278 current index/nine-field durable token. These technical IDs are newly authored. Existing wire/envelope/receipt/number/time owners are reused, without lane-local encoding or timestamp code.

The string-tuple identity is specified per family and recomputed from authenticated originals; CV-317 owns producer-semantic retry comparison, excluding Storage metadata. Each family has source, scope, transition, replay, custody, backup/restore, version and withdrawal rules. Source replay position references an upstream original; it cannot certify this event's own future checkpoint. Derived physical rows are bounded pointers to the complete original logical continuity snapshot, preventing duplicate large bodies. Complete checkpoint cores preserve one current/two retired publications and held original source tokens. No additional canonical operation table is created.

Storage adds exactly six value rows: four individual event bodies, `continuity_record`, and `continuity_replay_checkpoint`. Phase-1 review round 1 adds their six matching `storage_profile.family_profiles` allocations, using existing groups and budgets. Existing Storage value rows and policies stay byte-for-byte equivalent as parsed values; no event-family registry row is appended.

## HITL owner investigations

[W3I-owner-investigations.json](W3I-owner-investigations.json) records each name independently. HITL-028 and its source section *HITL resolution wakes the scheduler* explicitly use both labels for immediate queue reevaluation on approval/rejection resolution. The HITL *Tier-era compatibility retirement* paragraph defines the durable approval outcome, approver principal and scope. Contracts' *Runtime event catalog carry-through* and CV-082 name `approval.granted` / `approval.denied` as the durable resolution events. The exact closed `wake_reason` enum includes `approval_resolved` at `Plans/Contracts_V0.md:917` and `:2420`, and in CV-313's acceptance criterion at `:20372`. CV-215 establishes `scheduler.pass` ownership and its `run.scheduler_analysis` legacy alias. No exact-name persisted writer/value/schema for either HITL notification label was found in current live canon.

Storage's `hitl.approved` migration-only mention concerns command compatibility. It cannot retire the live HITL-028 wake notification, and supplies no independent meaning for `hitl.rejected`. Both findings preserve current notifications and durable approval history; neither is called an alias of an admitted event. There is no demonstrated new-history requirement or competing-owner product choice to send back to Jared.

## Step 9 exclusion application

[W3I-application.json](W3I-application.json) records the DL-452 answer/source/section hashes, before/after owner-file hashes, and before/after hashes for the individual row and the two new-name ledger lines. The Step 9 *Per exclusion* procedure is followed by recording `RECLASSIFY_TO_EXCLUDED`, current owner/decision citations, and an application record.

`subagent.cancel_requested` has **no pre-existing row** in either August individual-disposition or census-adjudication `LEDGER.jsonl`. Its spelling appears in frozen lexical material, not as a member of those working populations. Therefore the new row is `individual-disposition/rows/ROW_subagent.cancel_requested.json`; its supplemental individual line is `individual-disposition/W3I-NEW-NAMES-LEDGER.jsonl` and census line is `census-adjudication/W3I-NEW-NAMES-LEDGER.jsonl`, all beneath `Plans/.audits/event-authority-2026-08-12/`. The absent legacy bucket is explicitly null and its absent pins empty; no August-schema bucket, holding provenance or cohort membership is fabricated. The supplements declare they are outside the frozen August schema. The original population ledgers keep their exact before/after hashes. There is no denominator removal, freeze restamp, registry family append, admission record or Decision Log entry.

## Twelve-criterion self-grade and oracle plan

[W3I-self-grade.json](W3I-self-grade.json) has one assessment per family, exact current line/substring citations in every cell, and hashes of the assessed sources. **All four:** criterion 1 **ABSENT** (required no admission); criteria 2–11 **PASS** as explicit prepared owner contracts; criterion 12 **PARTIAL**. These grades claim no runtime proof or completed phase-2 review.

[W3I-oracle-plan.json](W3I-oracle-plan.json) and ATS-1280..1283 plan each family's own valid originals, retry/replay/history/recovery/withdrawal positives and separate negative predicates. For compound schema/runtime rules, phase 2 expands each field/predicate and enforcement site separately; no distinct predicates may share a removal set. Every negative starts from a valid case with one defective input invariant; dependent copies/digests are recomputed unless that relationship is the target. Actual code and shared guard-removal evidence are intentionally absent in phase 1.

| Standing review concern | Phase-1 treatment / remaining proof |
|---|---|
| **1. Original facts/identities/digests** | Independent actual source resolution and recomputed tuple/pack/commitment; per-join substitutions planned. |
| **2. Storage metadata** | Exact original Storage record and eleven-field receipt; caller semantic digest excludes assigned metadata. |
| **3. Retained history** | Original-valid history remains readable after live changes; authentic compatibility/replay-only rebuild is a positive. |
| **4. Representation differences** | Exact types/ID tokens and semantic joins; shared number recipe in phase 2. |
| **5. References** | Every authored/embedded schema reference branch resolved eagerly by the structural check. |
| **6. Complete stored-value size** | SP-337 event body route; bounded projection pointer; every derived value checked before atomic commit without truncation. |
| **7. Custody on every path** | Initial, retry, replay/recovery/retained reads each verify original fact, full value and original receipt. |
| **8. Single-defect negatives** | Predicate-level construction and shared tool required in phase 2; no masking proof claimed now. |
| **9. Honest grades** | Criterion 12 remains PARTIAL; current registry membership ABSENT; native NOT_RUN. |
| **10. Numbers** | Identity preimage is strings; existing metadata domains preserved; shared-helper alternate-spelling plans, no local caps. |
| **11. Types** | Closed schemas and exact-type negatives per field; no implicit string/number/boolean coercion. |
| **12. Timestamp formats** | CV-317 owner profile and shared fail-closed helper adoption in phase 2; format annotation alone cannot admit. |
| **10a. Historical recipe dispatch** | Authenticated original edition/recipe selector; later tightening cannot revalidate originals as current input. |

## Shared-file hunks and IDs

- **Contracts_V0.md:** CV-1600..1603 inserted at the end of *Runtime Continuity And Shared Route Object Model*, before the existing Governance section. Existing prose is not reflowed.
- **storage-plan.md:** new end section with SP-1600..1603; no shared table row is rewritten.
- **storage_value_registry.json:** six new tail rows and, in phase-1 review round 1, six matching `storage_profile.family_profiles` allocations; existing families, policies, profiles and group budgets are unchanged.
- **Automated_Testing_System.md:** new end section with ATS-1280..1283; existing oracle cases are untouched.
- **orchestrator-subagent-integration.md:** OSI-1600..1603 at the end of *Continuity Record Family*; OSI-1604 at the end of *Required-Subagent Criticality And Parallel Failure Policy*. Existing behavior/list/key lines are retained.

**IDs used:** OSI-1600..1604, CV-1600..1603, SP-1600..1603, ATS-1280..1283. Before minting, all fetched origin tips were scanned across 185 distinct owner blobs; no collision in the allocated ranges. ID evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/id-allocation.json`, SHA-256 `e0303b9820f5b9807d8a2b9aaf709579516b0636fc57879496c1dc07d331990e`.

## Validation and handoff

- **shard-generate**: exit 0; 3.18 s; log `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/shard-generate.log`, SHA-256 `65857140a4b1c7ca0370c518e557344577bbd4604a7681c70f69142efaea8c54`.
- **shard-generate-final**: exit 0; 3.01 s; log `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/shard-generate-final.log`, SHA-256 `65857140a4b1c7ca0370c518e557344577bbd4604a7681c70f69142efaea8c54`.
- **phase1-structural**: exit 0; 1.65 s; log `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/phase1-structural.log`, SHA-256 `dddc6a03f6ea368d3ab64f80f32b913dc3f93d9beb28ba54016fb070b55d9386`.
- **index-generate**: exit 0; 57.7 s; log `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/index-generate.log`, SHA-256 `4c7ad781d72681641192af8b941cb37c1a44ea1460103f4a9a9af15a9b9d7a4b`.
- **shard-check**: exit 0; 29.25 s; log `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/shard-check.log`, SHA-256 `6cb1ecff15d6afd58becb8a36421b904357b2fd47ff258309043184d96056120`.
- **index-validate**: exit 1; 57.43 s; log `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/index-validate.log`, SHA-256 `bbe79c3e771147d1382d3a36ffeff63399a1213236181de6e6690cd0721fcb88`.
- **shard-generate-dag-fix**: exit 0; 3.54 s; log `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/shard-generate-dag-fix.log`, SHA-256 `65857140a4b1c7ca0370c518e557344577bbd4604a7681c70f69142efaea8c54`.
- **index-generate-dag-fix**: exit 0; 58.03 s; log `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/index-generate-dag-fix.log`, SHA-256 `b2b7847250cd8cd2a591560d666c746abdc9bad87b596d5606767bd6fbb8bf19`.
- **shard-check-final**: exit 0; 36.48 s; log `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/shard-check-final.log`, SHA-256 `6cb1ecff15d6afd58becb8a36421b904357b2fd47ff258309043184d96056120`.
- **index-validate-final**: exit 0; 58.24 s; log `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/index-validate-final.log`, SHA-256 `f0683415fdfe3fb345926fee54ebd0362fd6d75eb11fed5627a204c2cfa10358`.
- **phase1-structural-final**: exit 0; 3.6 s; log `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/phase1-structural-final.log`, SHA-256 `dddc6a03f6ea368d3ab64f80f32b913dc3f93d9beb28ba54016fb070b55d9386`.

The initial index validation identified four W3I metadata cycles (OSI-1600..1603 paired with SP-1600..1603), with no other failure kinds. The semantic units now depend on their payload contracts; their explicit adoption of Storage remains in prose. Storage depends on the semantic/payload units. The repaired graph is regenerated and the final validation is recorded above. Two launch attempts were deferred by the memory guard before any checker started; work resumed only after the two-minute recheck found at least 7 GiB available.

Final index validation was parsed as JSON: top-level `status=pass`, zero failures; `coverage_status=pass`. The node-readiness summary remains `blocked_runtime_certification_incomplete`, as expected for planning-only work.

Currentness input: 15 files copied from the shared checkout's ignored currentness edition, every SHA-256 matched before index generation. Shards regenerated only for the four edited owner docs and the edited Storage value registry; no unrelated owner shard changed. Every generator/checker in this lane runs sequentially with a memory check; no subagent, mailbox, server or browser was used. Available memory stayed above the 6 GiB pause threshold for started checks.

Phase 2 must adopt both reviewed foundation branches, implement the per-family oracle plans with the shared helpers, prove guard isolation, and run Sol then Astra reviews before any admission work. No stopped product question is hidden as a technical gap. This phase does not run the repository-wide landing gates or reseal governance. The lead performs integration/landing checks; this branch never pushes main.

## Phase-1 review round 1: findings and responses

**Reviewed head:** `e6df324998c9f8f2d97c43e071daf0910404eae8`. **Comparison main:** `73f2231a9ec1c93190adafcdde51030f028c8c2d`, fetched on Nas1 before this fix round. The review is `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/W3I-sol/REVIEW-phase1.md`, SHA-256 `4b0dd05a4ee31f67f088c421a1269c89fb92f65480a783f7732f28d189f825e1`.

- **B1 — fixed, `ba7d400638eabce66ab08fff6417dfae3afec18d`.** Location: `Plans/storage_value_registry.json:127100` through the six allocations below. Cause: the six materialized W3I value families had no physical storage profiles, adding six failures to main's 41 missing profiles. Fix: allocate the four event bodies to existing `event_log` and the two derived values to existing `coordination_and_storage`, with encodings matching each value row. The derived limits are 16,384 bytes. Existing families, profiles, groups, budgets and the 41 unrelated omissions are unchanged. Verify with `python3 scripts/pm-storage-profile-check.py`; main and fixed head have identical error lists, so W3I adds **zero** failures.
- **N1 — fixed, `66bcd82642147ac7f3b5c4b3b5b56941ce9ae3a5`.** Location: `reports/event-authority-20261105/W3I-owner-investigations.json:10` and `:32`, plus this report's HITL paragraph. Cause: CV-215 summarizes wake categories rather than declaring the exact `approval_resolved` token. Fix: both investigations and the HITL paragraph cite the exact closed enums at `Plans/Contracts_V0.md:917` and `:2420`, and CV-313's acceptance criterion at `:20372`. CV-215 supports only `scheduler.pass` ownership and its `run.scheduler_analysis` legacy alias. Verify those three source lines and both investigation citation arrays; notification/durable-resolution outcomes are unchanged.

| Storage family | Profile line | Physical location | Existing group | Encoding target | Derived value limit |
|---|---:|---|---|---|---:|
| `continuity_actor_identified_event` | 127100 | `seglog` | `event_log` | `seglog_messagepack` | — |
| `continuity_provenance_recorded_event` | 127106 | `seglog` | `event_log` | `seglog_messagepack` | — |
| `continuity_redaction_applied_event` | 127112 | `seglog` | `event_log` | `seglog_messagepack` | — |
| `continuity_replay_checkpointed_event` | 127118 | `seglog` | `event_log` | `seglog_messagepack` | — |
| `continuity_record` | 127124 | `derived` | `coordination_and_storage` | `messagepack_canonical` | 16384 |
| `continuity_replay_checkpoint` | 127131 | `derived` | `coordination_and_storage` | `projection_checkpoint` | 16384 |

### Family reassessment

`W3I-self-grade.json` pins the changed Storage registry hash and regrades each affected family. The twelve semantic cells retain their reviewed grades; the mandatory Storage companion gap is repaired independently.

| Family | Criterion 1, before → after | Criteria 2–11, before → after | Criterion 12, before → after | Storage companion, before → after |
|---|---|---|---|---|
| `continuity.actor_identified` | ABSENT → ABSENT | PASS → PASS | PARTIAL → PARTIAL | B1 missing profiles → PASS |
| `continuity.provenance_recorded` | ABSENT → ABSENT | PASS → PASS | PARTIAL → PARTIAL | B1 missing profiles → PASS |
| `continuity.redaction_applied` | ABSENT → ABSENT | PASS → PASS | PARTIAL → PARTIAL | B1 missing profiles → PASS |
| `continuity.replay_checkpointed` | ABSENT → ABSENT | PASS → PASS | PARTIAL → PARTIAL | B1 missing profiles → PASS |

**Phase boundary:** SW-F1 remains phase-2 work: strengthen the inherited checkpoint/token/hash/segment schema patterns and enforce the shared timestamp profile, including every embedded copy and single-defect negative. Shared number-rule adoption and shared guard-isolation proof also remain in phase 2. This round adds no oracle/runtime guard code or fixtures and claims no guard-removal proof or independent re-review. No new IDs were minted; OSI-1600..1604, CV-1600..1603, SP-1600..1603 and ATS-1280..1283 remain the used IDs. No product or retention question arose.

### Round-1 verification

The final source checks ran at committed `ba7d400638eabce66ab08fff6417dfae3afec18d`; the following handoff commit changes only this report. Both profile-check exit codes remain **1** because the same 41 mainline omissions remain. The complete error lists match exactly. No W3I profile failure remains.

| Command | Exit | Result | Raw evidence and SHA-256 |
|---|---:|---|---|
| `python3 scripts/pm-storage-profile-check.py` on comparison main | 1 | 41 pre-existing missing profiles; 344 families / 303 profiles | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/fix-round1/storage-profile-main.json`, SHA-256 `89d47858adcab797033a9feca549351641cfb6a2f6ee5da75a2c62082b3d450b` |
| `python3 scripts/pm-storage-profile-check.py` on committed B1 head | 1 | Identical 41 errors; 350 families / 309 profiles; zero W3I-added failures | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/fix-round1/storage-profile-head-final.log`, SHA-256 `6e550e1e361f3fb8865210511a0bc682d661fa18c1a2d72ca8151dc243baa064` |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | Only Storage registry shards changed | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/fix-round1/shard-generate.log`, SHA-256 `5b172afd4a3f3b16555cb621d9a7bcf34e977907ff0d123a82802db037768e51` |
| `python3 scripts/pm-plan-index.py generate` | 0 | Index regenerated; four artifacts changed | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/fix-round1/index-generate.log`, SHA-256 `8146b1c1d8b768c99709f9290c6288839ac12683c7853020d45a904294ce8701` |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | Pass | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/fix-round1/shard-check.log`, SHA-256 `25e03937700c17eaf1c5af802b6ea0730d0222ae7ca02f62e39577442c305420` |
| `python3 scripts/pm-plan-index.py validate` | 0 | Parsed status pass; zero failures; coverage pass; 7,439 units | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/fix-round1/index-validate.log`, SHA-256 `a98125c2abc4ad08853868dc37d3135bcf79255a534829ffd6db9d7d5967bca7` |
| `python3 /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/fix-round1/phase1-structural.py` | 0 | Pass: 142 eager refs, 4 payload positives, 498 structural negatives, 88 self-grade quotes; B1/N1 and scope/hash checks | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/fix-round1/phase1-structural-final.log`, SHA-256 `7b24ad7d05baed999df0220489d9e819aa8922d8296b7d5034c077970b03597a` |

The worker structural checker is adapted from the phase-1 reviewer check only to allow the six named profile additions and verify their encodings, files, existing groups, derived limits and N1 citations. It retains the prior schema/reference, embedded-copy, original-source/application-hash, protected-path and self-grade-quote assertions. It is a worker self-check, not an independent re-review or a runtime oracle.

Reproduction inputs retained outside the repository:

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/fix-round1/storage-profile-main-inputs.json`, SHA-256 `5d1d5765da02dba17b39e9e7a8af270cd7ea224a5ce1caca3b0257c93a777656`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/fix-round1/currentness-inputs.json`, SHA-256 `352d5ead518a544989f9552b21440f24ec3c6643c3e115a32d427b9f014ff0d5`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/fix-round1/phase1-structural.py`, SHA-256 `65c08bb4ddc3caf2fd9c3093c47d6e22157b7d1fc8403e3e5fa78f09c880dede`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/fix-round1/run-checks.py`, SHA-256 `1fcd612743b393dc45a780d37813545d28d5648120cb553f90abbf5ba3ab6f13`.

The main check used exact git blobs for every file the checker reads, including the main checker and plan-unit index; the scratch extraction has been removed. The 15-file ignored currentness edition was copied from the shared checkout and verified file by file before index generation. Only the edited Storage registry's shards changed; no unrelated owner shard changed. Every generator/checker ran sequentially after a memory check, with at least 7 GiB available at each launch; no memory pause was needed in this round. Disk had 477 GB available before worktree creation.

The report, investigations and updated self-grade are copied to `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3I/`. Push target remains `plans/ea-w3-continuity-hitl-20261105`; the literal-path worktree is removed after the final push. No admission, event-family append, Decision Log entry, governance reseal, landing/main push, mailbox, subagent, browser or server is part of this fix round.

## Wave 3 phase 2: findings and responses

**Phase-2 start head:** `0ef6e6842a52209b4eed4c0443d1ee6ed8648b1d`. **Merges, in order:**
1. `6d73f3955c` — `git merge --no-ff 004bdedd632d9463f3535190a6ed5772338cdce1` (the gated guard tool). Adds exactly the tool's 11 files; none edited after the merge.
2. `ad592c6844` — `git merge --no-ff 58c2816ff33365384d4039553f5efdb5370930e6` (the gated NUMRULE head, both scopes). 163 conflicts, all under `Plans/_shards/**` or `Plans/.plan_index/**`, resolved by regeneration (`pm-shard-plans.py --generate`, `pm-plan-index.py generate`), never by hand. No non-derived conflict. The 22 NUMRULE-exclusive files are byte-identical to `58c2816ff3` at HEAD; the two shared owner documents (`Contracts_V0.md`, `storage-plan.md`) are the exact union of both sides (every lane-added line present; the single differing base line is NUMRULE's own `ContractRef` edit).

No rebase; `main` never pushed. No tool or NUMRULE file edited. No admission, registry append, Decision Log entry, or governance reseal.

### Oracles with the shared helpers

New lane checker `scripts/pm_w3i_continuity_oracles.py` implements the four families' criterion-12 oracles (ATS-1280..1283) over five boundaries — append, retry, retained, derived projection/checkpoint, withdrawal/rebuild — as **59 named guard rows**. Every refusal goes through a named row; the shape validator disables `pattern`/`format`/`not` and the checkpoint state `allOf`, and each disabled invariant is enforced by its own row with a single-defect witness (no rule weakened; the owner schema files are unchanged).

Shared calls adopted at every slot (gated NUMRULE head):
- **CV-1100:** `loads_current_json` at raw ingress; `current_integer`/`storage_uint64` at every schema integer slot (envelope `sequence_id`, projection `sequence_id`, checkpoint/token/cursor integers); `qualified_jcs` for the identity preimage; `producer_semantic_bytes`/`_digest` for the CV-317 projection. Identity is the ordered string tuple `[event_type, project_id, continuity_id, source_event_id, fact_ref]`, `event_id=evt_continuity_`+SHA-256, `idempotency_key=continuity@1:`+digest, recomputed from the authenticated tuple.
- **SP-1100:** `storage_value_bytes`/`decode_storage_value` (`EVENT_VALUE`) for derived-value sizes and `full_value_commitment` (CV-339); `verify_payload_bytes` for the SP-337 pack relation.
- **SP-1101:** retained originals resolve through `RetainedDispatcher` over the independently sealed receipt for the exact original (below).
- **CV-1101:** `pm_event_datetime.date_time` at every timestamp field with its owner profile (below).

No lane-local number cap, serializer, or timestamp parser; no blanket 2^53 cap; signed zero and float bytes preserved by the shared codecs.

### Guard tables (gated tool `004bdedd63`)

`scripts/pm-w3i-guard-proof.py` generates one Method-B adapter per suite under `scripts/w3i-guards/` (14 suites, ≤5 rows each) and runs the gated tool one suite at a time. **Result: 59/59 rows proved, 0 masked, 0 unproved, 14/14 suites PASS.** Every reachable row has a single-defect witness refused first at exactly that row; the full-boundary matrix confirms every control passes every row and every negative is refused by exactly its target. There are no unproved rows, so no unproved-only table is needed.

### Numbers

- `python3 scripts/pm_event_numbers.py --self-test --scope numbers` → exit 0, `"status": "pass"`, 276 positives.
- The shared number corpus runs through the complete append route at the Storage sequence slot via the checker's own raw ingress: **260 checks (76 accepted, 92 refused, 92 load-refused), 0 disagreements** (expectations composed from the shared helpers alone).
- **4,400-digit integer crash class (DX/DS15/DF/DM/DCO):** 16 checks; every route refuses with a code, none raises. The shape validator catches Python's integer-string-conversion `ValueError` and refuses with a code (no process-global digit-limit change).

### Timestamps (no longer interim)

Every timestamp field this lane owns is checked by the shared `pm_event_datetime.date_time` predicate with its owner's exact profile:

| Field | Profile |
|---|---|
| payload `created_at_utc` (original source occurrence) | `event_record` |
| envelope `occurred_at_utc` (= `created_at_utc`) | `event_record` |
| envelope `observed_at_utc` (Storage-assigned) | `storage_utc_z` |
| envelope `persisted_at_utc` (Storage-assigned) | `storage_utc_z` |
| checkpoint `withdrawn_at_utc` (current/retired) | `event_record` |
| receipt `acknowledged_at_utc` (Storage-assigned) | `storage_utc_z` |

Single-defect witnesses cover lowercase-`z`, `+00:00`, hour-24, trailing-LF and missing-zone forms on the Storage profile, and the oversized-fraction inline case on the EventRecord profile.

**Date-time inventory gate over the fixtures: PASS.** A fixture-scoped universe (the fixture data file excluded as instance data — the gate's sanctioned mechanism, exactly as the shared fixture files are handled — plus the EventRecord schema the fixtures instantiate, classified with its verbatim CV-253 citation) returns `status: pass`, 2 classified nodes, 0 unclassified, 0 failures (`dt-inventory-fixtures.json`). The fixture data declares no timestamp schema nodes (scan: 0 rows, 0 errors). The committed `Plans/event_datetime_inventory.json` and `scripts/pm_event_datetime_exclusions.json` are unchanged. The **whole-tree** gate in this lane tree fails only on the known T198 hash-drift class (recorded in `dt-inventory-tree.json`); per the lead's SWEEP-P2B Addendum 2, `datetime_validator` and the whole-tree gate run at batch integration after the inventory refresh.

### Retained reads: never guess the recipe

Retained reads select the recipe **only** from the independently sealed receipt for that exact original (`SealedReceiptOwner` → `RetainedDispatcher` over a frozen `RecipeTuple`→`FrozenRecipe` map installed outside request data). The frozen verifier recomputes identity, full-value commitment, producer-semantic digest and the original payload schema. No receipt is created while reading; `current_append_policy` never runs on a retained original; a later live-state change does not invalidate a valid retained original (positive control). Negatives: **missing receipt** (`original_receipt_missing`), **ambiguous receipt** (`original_receipt_ambiguous`), **receipt for another original** (`original_binding`), plus caller override (`caller_recipe_override`), unknown recipe, corrupted record, and disclosure refusal. 20 dispatch checks.

### Retention

All four families record audit/source lineage: event body and original fact custody bind existing `RP-AUTHORITY-INDEFINITE@1.0.0` (Case L-3 source-lineage class, indefinite, no count eviction, fail-closed pressure; `Plans/storage-plan.md:17409`, `:23547`); rebuilt snapshot/checkpoint bind existing `RP-PROJECTION-3GEN@1.0.0` (one current + two retired, holds, withdrawal anchors). The G05 lead is rejected (GitHub sign-in only). Bound to the landed Storage canon under DL-045; **no pending retention question**.

### SW-F1 carryover closed

Full-match grammars replace the anchored patterns for every copied identifier: payload ID/ref tokens (`id_token_invalid`), token `generation_id`/`generation_anchor_sha256`/`frontier_sha256`/`storage_instance_id` (UUID) (`token_join`), and `source_cursor.segment_name` (`cursor_join`). Trailing-LF single-defect witnesses refuse each; the shared `date_time` predicate refuses the malformed timestamp forms. The owner schema keeps its patterns; the checker enforces them through named rows.

### Grades before and after

Criterion 1 stays **ABSENT** (no admission). Criteria 2–11 stay **PASS**. Criterion 12 moves **PARTIAL → PASS** for all four families: the oracle code is written, all 59 guard rows are proved by the gated tool with single-defect witnesses, the shared number corpus runs with 0 disagreements, and every timestamp field uses the shared predicate. Native execution remains **NOT_RUN** (planning oracles, not the native runtime); the whole-tree date-time gate is the T198 integration item.

### Verification commands

| Command | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_w3i_continuity_oracles.py` | 0 | pass; 59 rows/59 witnesses, 32 controls, 260 negatives, 0 corpus disagreements, 16 long-integer, 20 dispatch |
| `python3 scripts/pm-w3i-guard-proof.py matrix` | 0 | pass; every negative refused by exactly its target |
| `python3 scripts/pm-w3i-guard-proof.py run` (gated tool, 14 suites) | 0 | 59/59 proved, 0 masked, 14/14 PASS |
| `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | 0 | `"status": "pass"`, 276 positives |
| `python3 scripts/pm_event_datetime_inventory.py --root <fixture universe>` | 0 | pass; 2 nodes, 0 unclassified, 0 failures |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | pass; 99 docs, 3,104 shards, 0 failures |
| `python3 scripts/pm-plan-index.py validate` | 1 | top-level fail, but **only base failures**: 760 rows, all present at the base; 0 introduced by this lane |

**Index baseline proof.** `pm-plan-index.py validate` compares against `origin/main` `8f4eddac6f24c933f3e1c3c375343fb6e34ecd2e`. At the phase-2 start head `0ef6e6842a` the same validate reports **764** failures (21 `plan_unit_removal_ledger_invalid` on unchanged legacy ledgers + 743 `plan_unit_removed_without_ledger_decision`). This branch reports **760**: the gated NUMRULE merge adds CV-1100/CV-1101/SP-1100/SP-1101, resolving exactly those 4 base rows. A set comparison shows **0 new failures introduced** and exactly those 4 resolved. The 739 remaining removal rows are units added to `origin/main` after this lane's base (none present in the base index); the no-rebase rule leaves them for batch-3 integration. No W3I/continuity file appears in any failure.

**Diff scope.** From `0ef6e6842a`, the committed diff is exactly the two gated merges (11 tool files + 22 NUMRULE-exclusive files + the 2 shared owner-document unions) plus 164 regenerated derived files, then this lane's new checker/driver/adapters and report/self-grade. No tool or NUMRULE file is edited after its merge; no unrelated owner document, registry, Decision Log, Spec Lock, `.evidence`, `auto_decisions`, `.gitignore` or frozen validator is touched.
## Wave 3 phase 2, fix 1

**Start:** `origin/plans/ea-w3-continuity-hitl-20261105` at `d569a07086451749abed531f94412d51163d558c`. **Review answered:** `reviews/W3I-p2-recheck/REVIEW.md` (Opus 5.5 recheck, NOT_CLEAN, nine REAL findings; code 5/10, tests 3/10). **Commits:**
- `1756709fdb`: the checker, tables, generator and guard driver; the adapters removed.
- `f77574cc03`: the mutation runner.
- `1834769f7b` and `198a635a02`: the own-audit fixes below.
- The report commit that adds this section.

No rebase, no merge, `main` never pushed; no guard-tool or NUMRULE file edited; no `Plans/` file edited, so no regeneration; no admission, registry append or Decision Log entry.

> **Superseded above.** The phase-2 section's guard-table credit (59/59 by verdict-lookup adapters), its "no rule weakened" and "SW-F1 carryover closed" claims, its timestamp table (`acknowledged_at_utc` on `storage_utc_z`) and its criterion-12 PASS are replaced by this section.

### How the checker is now built

- **One predicate per row.** `scripts/pm_w3i_continuity_oracles.py` declares **217 rows** (`row()`, `:1184`; the rows from `:1228`) in **41 tables**. Each row has one template (`TEMPLATES`, `:1157`): equal, not-equal, true/false/none, empty list, membership, at-most, ordered, not-in, handled.
- **The table modules are the refusal path.** `scripts/pm-w3i-table-generate.py` writes each row's decision into `scripts/pm_w3i_table_<table>.py` (`--check` fails on any stale or extra module). `evaluate()` (`:1827`) projects each row's inputs and calls those table predicates in table order; their refusals are the checker's result. Nothing else refuses.
- **Inputs, never verdicts.** A row's inputs are the presented value and the independent reference it must equal (the recomputed identity, Storage's own record, the resolved source, the sealed original), or a shared helper's own result where the rule is that helper (owner schema validation with the shared CV-1101 format checker, `date_time`, `storage_uint64`, `storage_value_bytes`, `verify_payload_bytes`, `RetainedDispatcher`).
- **`applies` is the precondition.** It holds the row's family and readiness gates derived from the case (for example: the integer slots hold, then the value encodes physically, then the owner schema accepts). It never reads a table result, so cutting one table row changes only that row.
- **Copies join their authority.** Every copy is compared with its authority (the Storage instance, Storage's record, the event, the source), never with another copy. A single-defect witness changes one value and resyncs its dependent copies (`resync()`, `:584`); Storage's record and the source observation are never resynced.
- **The gated tool sees the predicate code.** `scripts/pm-w3i-guard-proof.py` runs the gated tool once per table, in its own process, with that table module as `checker_modules`. The verdict adapters `scripts/w3i-guards/*.py` are deleted.

### Findings and responses

| # | Finding | Fix (commit, path:line) | How to verify |
|---|---|---|---|
| 1 | Guard credit came from adapters that looked up precomputed verdicts | `1756709fdb`: the rows are the checker's predicates, generated into `scripts/pm_w3i_table_*.py`; `evaluate()` (`pm_w3i_continuity_oracles.py:1827`) refuses only through them; adapters deleted; the tool scans each table module (`pm-w3i-guard-proof.py` `run_table`) | `python3 scripts/pm-w3i-table-generate.py --check`; `python3 scripts/pm-w3i-guard-proof.py collect --out D && python3 scripts/pm-w3i-guard-proof.py run --out D`; each `D/<table>.summary.json` lists `static_files` = that table module |
| 2 | Multi-clause rows with one witness; 10 of 14 mutations survived | `1756709fdb`: every clause is its own row (59 → 217 rows); each reachable row has single-defect witnesses for every family it covers. `f77574cc03`: `scripts/pm-w3i-mutations.py` runs the recheck's 14 (adapted) and 13 own mutations | `python3 scripts/pm-w3i-mutations.py --scratch <dir>`: **27/27 killed** (table below) |
| 3 | Shape view stripped `pattern`/`format`/`not` and the state `allOf`; owner-invalid values accepted | `1756709fdb`: `schema_errors()` (`:132`) validates with the **full owner schemas** and the shared format checker (`_validator`, `:127`); the shape view is gone. Named rows restore only what Python cannot see: a `$`-anchored pattern without a CR/LF guard (`_owner_pattern`, `:159`, reads the owner's own pattern) and the RFC 4122 uuid form (`UUID_RE`, `:179`). Joins added for the checkpoint's `storage_instance_id`, `project_id`, `stream_id` (`checkpoint_instance`/`_project`/`_stream`, `:1566`–`:1572`), each retired core (`retired_*`, `:1641`–`:1672`), and `source_selection.storage_instance_id` (`selection_instance`) | Negatives (built in `build_negatives()`, `:1947`): `!` and trailing-LF on the checkpoint's `project_id`, `stream_id`, `storage_instance_id`, `publication_id`; uuid defects on `source_selection.storage_instance_id`; and **every field of a retired publication** (consts, ids, token fields, the nine integer slots, `segment_name`, `last_event_id`, `filter_complete`, `state`, `withdrawn_at_utc`, `hold_refs`, maxItems), each refused by exactly its row |
| 4 | `acknowledged_at_utc` and retired `withdrawn_at_utc` never checked | `1756709fdb`: both go through `pm_event_datetime` via the full owner schemas with the shared format checker (custody_v2 at `append_custody_schema`, `:1387`; checkpoint core at `checkpoint_schema`, `:1530`); `acknowledged_at_utc` also joins Storage's record (`append_receipt_acknowledged_at_utc`, `:1392`). The field list is re-derived from the schemas at every run (`timestamp_inventory()`, `:2577`; `TIMESTAMP_FIELDS`, `:2541`) and any difference fails the checker | Negatives: ack `garbage`, hour 25, trailing LF, missing zone; retired `withdrawn_at_utc` `not-a-time`, trailing LF, missing zone, null; mutation X8 |
| 5 | No join of payload `created_at_utc` to the source; two-defect oversize witness; no >16 KiB SP-337 positive | `1756709fdb`: `append_created_source` (`:1301`). The oversize witness changes only the source time and resyncs its copies (`set_source_time`, `:641`). Control `pack-large:<family>` (`build_controls`, `:1863`, `:1873`) externalizes an owner-valid 20,470-byte body through SP-337, and `append_pack_body` (`:1454`) checks the pack bytes are exactly that body | Negatives for both join directions; `pack-large` controls accept; mutations X1, X10, X11 |
| 6 | Payload integers outside the physical range raised | `1756709fdb`: `append_event_physical` (`:1248`) refuses any value outside SP-1100 EVENT_VALUE with a code, before any schema validation or packing; every schema row and packing row is gated after it. The `except ValueError` in schema validation is removed | Negatives: `2**64`, `10**4399`, `-(2**63)-1` and `-10**4399` as an extra payload member and at a string field, for all four families; retry and derived equivalents. No route raises (the checker would crash) |
| 7 | Retained-read properties were fixture flags | `1756709fdb`: `resolve_retained()` (`:814`) snapshots the sealed store before and after `resolve` and counts every call of the shared `current_append_policy` while it runs. The caller override goes through `resolve(recipe_override=...)`. The live-state control (`retained-live`, `:1894`) changes the live admission and the live source facts the append boundary reads. The frozen verifier is split into its 16 components (`frozen_components`, `:710`) | Negatives: a store-writing owner (`AccessLoggingOwner`, `:695`) refused only by `retained_no_receipt_creation`; a verifier that runs the writer gate (`_current_gated_verify`, `:773`) refused only by `retained_no_current_gate`; missing, ambiguous, malformed and other-original receipts. Mutations M2, X2–X5 |
| 8 | Integer slots used a lane-local bound | `1756709fdb`: `storage_uint64` at every integer slot: the envelope `sequence_id` (`:1244`), the five receipt slots (`:1379`), the projection `sequence_id`, the nine checkpoint slots and the nine in each retired core (`:1505`–`:1515`). No lane-local bound remains; `current_integer` applies only through `verify_payload_bytes` (`byte_size`), since no W3I slot is a caller-supplied current integer | Negatives at every slot (`2**64`, `-1`, float, string number, boolean, null, array, object); mutation M14 |
| 9 | Criterion-12 PASS and "SW-F1 closed" not supported | Report commit: criterion 12 re-graded **PARTIAL** for all four families (`W3I-self-grade.json`). SW-F1 is now closed for every embedded copy: the owner patterns apply in full to the current checkpoint and every retired core (owner schema plus the trailing-LF rows), and the uuid fields keep their RFC 4122 form | Self-grade quotes checked: 96/96 at their lines |

**Own audit (beyond the nine).** After every row was gated on readiness, an audit of the gates found three inputs that no row refused. All three are closed in commit `1834769f7b`, each with its own witnesses:
- **A non-object EventRecord.** Every append row is gated on the family and an object event. Fix: `append_event_object`.
- **A non-object retry candidate.** Fix: `retry_event_object`.
- **A retry candidate that is not a valid EventRecord.** Example: a malformed Storage time, which the semantic comparison rightly ignores. Fix: `retry_envelope_schema`, with the full EventRecord schema.

Two smaller fixes:
- **Retained request.** A request that names no original, or whose expected binding the shared full-value commitment refuses (another envelope edition), now reaches the shared dispatcher with no binding through `retained_request()`. The dispatcher refuses it as `original_query`; before, it raised or returned a reason no row owned. Without this, the entailed catch-all `retained_resolved` could have refused first. Fixed in commit `198a635a02`.
- **Pack descriptor.** Type witnesses for its fields were added (`1834769f7b`).

**Notes from the recheck.** N1: the source-lineage retention row is now `Plans/storage-plan.md:17410` (one line later after the NUMRULE merge). N3: index validate is pinned to the base below. N4: the checker no longer reads a token or cursor before the checkpoint schema accepts it. N5: the withdrawal-boundary rows stay scenario models (graded accordingly).

### Mutation table

`python3 scripts/pm-w3i-mutations.py --scratch <dir>`, run at `198a635a02`. Each mutation edits a scratch copy of the checker, regenerates the tables and runs the complete checker. Baseline clean; **27/27 killed**. Each kill is the mutated row's own witness refusing nowhere, or, for X5, the live-state control being refused (`mutations-final.json`).

| Id | Clause weakened | Row | Killing case |
|---|---|---|---|
| M1 | owner `$defs/id` CR/LF guard dropped (id full match) | `append_payload_schema` | 40 failures; first: free id + LF accepted |
| M2 | ambiguous-receipt refusal removed | `retained_receipt_unique` | ambiguous receipt accepted |
| M3 | Storage time on the event_record profile | `append_observed_utc_z` | `+00:00` accepted |
| M4 | frozen verifier skips the payload schema | `frozen_payload_schema` | invalid retained payload accepted |
| M5 | frozen verifier skips the identity recompute | `frozen_identity` | forged retained event_id accepted |
| M6 | prefix-membership clause dropped | `append_fact_replay_prefix_member` | prefix without the source accepted |
| M7 | storage-instance clause dropped | `append_fact_replay_instance` | foreign-instance token accepted |
| M8 | retired limit dropped (owner maxItems) | `checkpoint_schema` | three retired cores accepted |
| M9 | custody partition join dropped | `append_custody_partition` | wrong custody partition accepted |
| M10 | self-reference clause dropped | `append_source_not_self` | event_id = source accepted |
| M11 | checkpoint_key join dropped | `token_checkpoint_key` | wrong checkpoint_key accepted |
| M12 | cursor offset order dropped | `cursor_offset_order` | offset after end accepted |
| M13 | producer_sequence_id null dropped | `append_producer_sequence_null` | `7` accepted |
| M14 | sequence slot accepts `2**64` | `append_sequence_uint64` | `2**64` accepted |
| X1 | created_at_utc not joined to the source | `append_created_source` | payload time ≠ source accepted |
| X2 | store snapshot compared with itself | `retained_no_receipt_creation` | store-writing owner accepted |
| X3 | writer-gate instrumentation removed | `retained_no_current_gate` | gated verifier accepted |
| X4 | override not passed to the dispatcher | `retained_recipe_override` | caller override accepted |
| X5 | retained read consults live admission | `retained_disclosure` | **control** `retained-live` refused |
| X6 | payload skipped by the physical row | `append_event_physical` | payload `2**64` accepted |
| X7 | frozen custody digest compared with itself | `frozen_receipt_semantic` | forged sealed digest accepted |
| X8 | custody validated without date-time format | `append_custody_schema` | ack `garbage` accepted |
| X9 | retired state clause dropped | `retired_state` | current retired core accepted |
| X10 | inline limit doubled | `append_inline_limit` | 20,470-byte inline body accepted |
| X11 | pack bytes not compared with the body | `append_pack_body` | pack of another body accepted |
| X12 | ack join to Storage's record dropped | `append_receipt_acknowledged_at_utc` | different ack accepted |
| X13 | `eq` template type check dropped | `withdrawal_once` | `True` for 1 accepted |

M1, M8: the clause now lives in the owner schema the checker validates in full, so the adapted mutation removes that keyword from the checker's copy of the schema. M14: the slot now calls the shared `storage_uint64`, so the mutation clamps the value before the call.

### Guard-table result (gated tool `004bdedd63`, Method B)

`python3 scripts/pm-w3i-guard-proof.py collect --out D && python3 scripts/pm-w3i-guard-proof.py run --out D`. One gated-tool run per table, each in its own process, under the tool's MemoryGate.

- **Tool:** `scripts/pm_guard_isolation.py`, sha256 `e8038992eabbe067c8bcba8d48824b97fbb6b5b7e69cbfe28a669f939a96c0b8` (the file `004bdedd63` merged, unedited).
- **What it scans:** each table's own module, with no adapters. Each report's `static.files` names exactly that table module.
- **Credit is the tool's own.** This driver adds none.

**Result: 41 tables, 217 rows; 215 proved, 2 unproved, each with a written proof; 39/39 tables run PASS; masked: 0.**

- **Suite sizes.** Up to 4 distinct negative projections per row and up to 6 control projections per table were given to the tool. The complete checker runs all of them.
- **Lane matrix.** The driver's own matrix checks every collected case on every table predicate.

| Table | Boundary | Rows | Proved | Tool N / C | Seconds |
|---|---|---:|---:|---|---:|
| `append_admission` | append | 6 | 6 | 21 / 4 | 44.3 |
| `append_numbers` | append | 2 | 2 | 3 / 2 | 0.9 |
| `append_envelope` | append | 7 | 7 | 28 / 5 | 83.3 |
| `append_storage` | append | 4 | 4 | 16 / 6 | 21.4 |
| `append_policy` | append | 4 | 4 | 7 / 3 | 10.4 |
| `append_payload` | append | 7 | 7 | 28 / 6 | 99.3 |
| `append_copies_1` | append | 5 | 5 | 20 / 6 | 40.6 |
| `append_copies_2` | append | 5 | 5 | 6 / 2 | 8.8 |
| `append_fact_1` | append | 6 | 6 | 6 / 4 | 12.4 |
| `append_fact_2` | append | 5 | 5 | 5 / 2 | 8.8 |
| `append_custody_1` | append | 7 | 7 | 11 / 2 | 33.9 |
| `append_receipt_1` | append | 6 | 6 | 24 / 6 | 64.8 |
| `append_receipt_2` | append | 5 | 5 | 5 / 2 | 7.5 |
| `append_custody_2` | append | 6 | 6 | 24 / 6 | 59.0 |
| `append_custody_3` | append | 2 | 2 | 8 / 6 | 3.0 |
| `append_body_1` | append | 5 | 5 | 17 / 6 | 27.8 |
| `append_body_2` | append | 4 | 4 | 10 / 6 | 15.5 |
| `retry` | retry | 8 | 8 | 25 / 4 | 129.7 |
| `retry_custody` | retry | 3 | 3 | 10 / 4 | 4.9 |
| `derived_slots_1` | derived | 5 | 5 | 6 / 1 | 6.0 |
| `derived_slots_2` | derived | 5 | 5 | 6 / 1 | 6.7 |
| `retired_slots_1` | derived | 5 | 5 | 5 / 3 | 21.4 |
| `retired_slots_2` | derived | 4 | 4 | 4 / 3 | 8.5 |
| `derived_shape` | derived | 5 | 5 | 15 / 6 | 22.0 |
| `entailed_projection_size` | derived | 1 | 0 (entailed, own table) | not run: no negative can exist | — |
| `projection_joins` | derived | 8 | 8 | 32 / 6 | 183.7 |
| `checkpoint_joins` | derived | 8 | 8 | 32 / 6 | 183.9 |
| `token_format_1` | derived | 6 | 6 | 6 / 2 | 11.2 |
| `token_format_2` | derived | 6 | 6 | 6 / 2 | 10.4 |
| `token_joins` | derived | 5 | 5 | 5 / 5 | 11.8 |
| `cursor` | derived | 5 | 5 | 20 / 5 | 28.1 |
| `retired_joins` | derived | 8 | 8 | 8 / 5 | 140.1 |
| `retired_format_1` | derived | 7 | 7 | 7 / 2 | 62.4 |
| `retired_format_2` | derived | 6 | 6 | 6 / 2 | 30.8 |
| `withdrawal` | withdrawal | 6 | 6 | 11 / 1 | 17.1 |
| `retained_dispatch` | retained | 8 | 8 | 8 / 2 | 45.1 |
| `retained_frozen_1` | retained | 6 | 6 | 18 / 5 | 39.9 |
| `retained_frozen_2` | retained | 6 | 6 | 24 / 6 | 63.7 |
| `retained_frozen_3` | retained | 4 | 4 | 13 / 6 | 12.3 |
| `retained_effects` | retained | 5 | 5 | 20 / 6 | 29.2 |
| `entailed_retained_resolved` | retained | 1 | 0 (entailed, own table) | not run: no negative can exist | — |

**Unproved rows and their proofs (each alone in its own table, never the first refusal):**

- `projection_size` (rows that always refuse first: `projection_schema`). Proof: Plans/continuity_event_contracts.schema.json $defs/projection is closed (additionalProperties false) with exactly ten members: two consts (39 and 5 bytes), seven $defs/id strings of at most 256 ASCII characters and an event_type enum of at most 30 characters, and one uint64. Every projection_schema accepts therefore encodes to at most 1 + 10*(1+21) + 2*(3+39) + 7*(3+256) + (2+30) + 9 = 2129 bytes of SP-236 MessagePack, below 16384; a larger projection always fails projection_schema first (this row is gated on it).

- `retained_resolved` (rows that always refuse first: `retained_recipe_override`, `retained_query`, `retained_receipt_present`, `retained_receipt_unique`, `retained_receipt_wellformed`, `retained_binding`, `retained_recipe_known`, `retained_disclosure`, and the 16 frozen rows). Proof: RetainedDispatcher.resolve (scripts/pm_event_numbers.py:523-545) refuses with caller_recipe_override, original_query, original_authority, original_binding, recipe_selection, recipe_unknown, original_bytes_type, original_verification or current_disclosure, plus what the owner raises. A request with no computable expected binding reaches it as None and is refused as original_query (retained_request). The owner here (SealedReceiptOwner/_custody_from_sealed) raises only original_receipt_missing, original_receipt_ambiguous and sealed_receipt_malformed, and always returns an OriginalCustody built from OriginalBinding(**), RecipeTuple(**) and bytes.fromhex(...) values, so original_authority, recipe_selection and original_bytes_type cannot occur. Every other reason has its own dispatch row (retained_dispatch), and original_verification is returned exactly when a frozen_* row refuses (_frozen_verify is the conjunction of frozen_components). So this catch-all never refuses first.

### Owner rules and SW-F1

- **Full owner schemas.** The EventRecord envelope, every family payload, `custody_v2`, the projection and the checkpoint are validated with every owner keyword, including the checkpoint state `allOf` and each retired core's `checkpoint_core`. The shared CV-1101 format checker (`format_checker(profile=EVENT_RECORD)`) runs date-time and jsonschema's other built-in formats.
- **Restored at named rows:**
  - **Trailing LF.** The owner's `$`-anchored patterns without a CR/LF guard accept a final LF under Python. The rows are `generation_id` and the nine `*_sha256` fields of the current token and every retired token, `segment_name` in the current and retired cursors, and `group_digest`.
  - **uuid.** The four `format: uuid` fields keep the RFC 4122 string form. jsonschema's check is `uuid.UUID()` plus four hyphen positions, which accepts a trailing `}`, an extra hyphen and `_` (tested).
  - **`event_type`.** It is held to its family by equality, so a trailing LF fails there.
- **SW-F1.** Closed for every embedded copy (current and retired `segment_name`, checkpoint ids, uuid fields), each with single-defect negatives.

### Timestamps (re-derived from the schemas)

`timestamp_inventory()` walks every `format: date-time` location in the subjects the lane validates, and the checker fails if the list differs from this table.

| Subject | Field | Owner profile | Shared check and rows |
|---|---|---|---|
| EventRecord | `occurred_at_utc` | event_record | `append_envelope_schema` (format) / `frozen_envelope_schema`; copy of `created_at_utc` (`append_copy_occurred`) |
| EventRecord | `observed_at_utc` | event_record + CV-253 storage_utc_z | schema format + `append_observed_utc_z` (`date_time`, storage_utc_z) / `frozen_observed_utc_z`; `append_storage_observed` |
| EventRecord | `persisted_at_utc` | event_record + CV-253 storage_utc_z | schema format + `append_persisted_utc_z` / `frozen_persisted_utc_z`; `append_storage_persisted` |
| family payload (all four) | `created_at_utc` | event_record | `append_payload_schema` (format) / `frozen_payload_schema`; `append_created_source` |
| checkpoint | `withdrawn_at_utc` | event_record | `checkpoint_schema` (format and the state `allOf`) |
| checkpoint | `retired_publications/*/withdrawn_at_utc` | event_record | `checkpoint_schema` (format and the core `allOf`) |
| custody_v2 | `first_append_receipt/acknowledged_at_utc` | event_record | `append_custody_schema` (format) / `frozen_receipt_schema`; `append_receipt_acknowledged_at_utc` |

- **`acknowledged_at_utc`.** It moves from phase 2's `storage_utc_z` to `event_record`. Its owner schema (`Plans/event_append_receipt_contracts.schema.json` `$defs/AppendReceipt`) says only `format: date-time`, and CV-1101 selects a stricter profile only where the field's owner requires one. W3F made the same choice. One question for Jared follows below.
- **Date-time inventory gate.**
  - **Fixture-scoped universe: PASS.** The 1,639 exported controls and negatives, as excluded instance data, plus the EventRecord schema: 2 nodes, 0 unclassified, 0 failures.
  - **One exclusion re-pinned in the universe.** The fence that the lane's own phase-1 CV-1600..1603 text moved in `Contracts_V0.md` keeps its content hash, moving from `fence:20988` to `fence:21205`.
  - **Whole tree: fail, T198 class only.** 37 rows (19 `.plan_migration`, 16 `.plan_index`, 2 `Contracts_V0.md` position drift), the same count the recheck measured.
  - **Not edited.** The NUMRULE inventory and exclusions files are unchanged.

### Numbers

- **Self-test.** `python3 scripts/pm_event_numbers.py --self-test --scope numbers`: exit 0, `"status": "pass"` (276 positives, 304 negatives).
- **Corpus through the complete checker.** The shared corpus enters through `loads_current_json` at the Storage sequence slot (event and Storage's record) and runs the complete append route: 260 checks (76 accepted, 92 refused, 92 load-refused), **0 disagreements**. A disagreement is collected as a failure, not asserted.
- **4,400-digit integers.** `10**4399` and `-10**4399` are negatives at:
  - the sequence slot;
  - a payload extra member and a payload string field (all four families);
  - the retry candidate;
  - the derived `index_through_sequence_id`;
  - the projection and custody extra members.
  Each is refused with a code at its row, and none raises.
- **Fixture expectations the shared rule changes:**
  - **Payload integers.** A payload integer outside the physical range is refused at `append_event_physical`, where it used to raise. Inside the range but not a string, the payload schema refuses it.
  - **Slot types.** A float, string number, boolean, null, array or object at any uint64 slot is refused at that slot's `storage_uint64` row before the owner schema runs.

### Retained reads

- **Recipe from the sealed receipt only.** The recipe comes only from the independently sealed receipt for that exact original (`SealedReceiptOwner` → shared `RetainedDispatcher`), with a frozen map installed outside the request.
- **Refused reasons.** Missing, ambiguous, malformed and other-original receipts, an unknown recipe, a caller override (through `resolve(recipe_override=...)`) and refused disclosure are each refused by their own row.
- **Frozen verifier.** Its 16 components are rows: decoding, the envelope and payload schemas, the family, the payload schema id, the recipe family, the Storage times on storage_utc_z, the identity and key recompute, the source commitment, the result, the custody schema, the semantic digest, the full value and the event id.
- **No receipt is created while reading.** Proven by the sealed-store snapshot.
- **The current gate is never used.** Proven by instrumenting the shared `current_append_policy`.
- **History after a live-state change still verifies.** The live admission is revoked and the live source facts change, and the read still verifies. The compatibility (replay-only) original, and an original written with a lowercase `t`, a `+02:00` offset and a long fraction, also verify.
- **The catch-all row is entailed.** `retained_resolved` covers any dispatcher reason no earlier row owns. It sits alone in its own table with its written proof. A faulty verifier that raises its own refusal reaches it second, after `retained_no_current_gate`.

### Retention

Unchanged from phase 2: the cells bind `RP-AUTHORITY-INDEFINITE@1.0.0` (`Plans/storage-plan.md:17410`) and `RP-PROJECTION-3GEN@1.0.0`, and no retention question is pending.

### Grades before and after

| Criterion | Phase 2 (`d569a07086`) | Fix 1 |
|---|---|---|
| 1 membership | ABSENT | ABSENT (no admission) |
| 2–11 | PASS | PASS (no owner text changed) |
| 12 positive/negative oracles | PASS, not supported per the recheck | **PARTIAL**, all four families |

- **Why PARTIAL.** It is graded only on what the fixed tests prove, and the plan's own list (ATS-1280..1283) is not fully tested:
  - the source-frame relocation and held retention/restore cases are not built;
  - withdrawal, successor rebuild, CAS and dedupe catch-up are scenario-flag models;
  - each owner schema is enforced in full by one row per subject, not by the separate per-keyword guards ATS-128x names.
- **Native execution** stays NOT_RUN.

### Verification commands (exit codes)

Run at the final code head `198a635a02`; the report commit adds only `reports/`. `Plans/` is byte-identical to `d569a07086`. Every heavy command ran under `systemd-run --user --scope -p MemoryMax=2G -p MemorySwapMax=0`, with at least 12 GB available.

| Command | Exit | Result |
|---|---:|---|
| `python3 scripts/pm-w3i-table-generate.py --check` | 0 | 41 tables, 217 rows, 2 entailed, 0 stale, 0 extra |
| `python3 scripts/pm_w3i_continuity_oracles.py` | 0 | `pass`; 217 rows, 215 witnessed, 2 entailed; 48 controls; 1,591 negatives, each refused by exactly its row; corpus 260 checks, 0 disagreements; timestamp inventory matches the schemas; eager `$ref`s 71/46/13 |
| `python3 scripts/pm-w3i-guard-proof.py collect --out D` | 0 | lane matrix 0 problems; rows without a negative = the 2 entailed rows |
| `python3 scripts/pm-w3i-guard-proof.py run --out D` (gated tool, one process per table) | 0 | 41 tables, 217 rows; **215 proved**, 2 unproved, each with a written proof in its own table; 39/39 tables run PASS; 0 masked |
| `python3 scripts/pm-w3i-mutations.py --scratch S` | 0 | baseline clean; **27/27 killed** (14 recheck mutations adapted, 13 own on 13 rows) |
| `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | 0 | `"status": "pass"`, 276 positives, 304 negatives |
| `python3 scripts/pm_event_datetime_inventory.py --root <fixture universe>` | 0 | `pass`; 2 nodes, 0 unclassified, 0 failures (1,639 fixture items) |
| `python3 scripts/pm_event_datetime_inventory.py --root .` (whole tree) | 1 | 37 failure rows, all T198 class (recorded for the batch-3 inventory refresh) |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | `pass`; 99 docs, 3,104 shards |
| `python3 scripts/pm-plan-index.py validate` in a scratch clone at this branch, `origin/main` pinned to `58c2816ff33365384d4039553f5efdb5370930e6`, ignored currentness edition copied (15 files, sha256 identical) | 0 | `pass`, 0 failures |


### Questions for Jared

1. **16 KiB inline limit.** Does SP-337's "at most 16 KiB inline" (`Plans/storage-plan.md:245`) bound only the payload body, as `Plans/Contracts_V0.md:1019` reads, or the whole stored record?
   - **Why it matters here:** the only unbounded continuity field, `created_at_utc`, is copied into the envelope's `occurred_at_utc`. So a payload over 16 KiB always leaves an envelope field over 16 KiB inline.
   - **If it bounds the whole record:** the `pack-large` positive becomes a size-refusal case, and these families can never carry an owner-valid externalized body.
2. **`acknowledged_at_utc` profile.** Does `AppendReceipt.acknowledged_at_utc` keep the broad EventRecord date-time profile its owner schema declares, or does SP-347's "RFC 3339 UTC with milliseconds" make it a stricter Storage profile?
   - **What the checker does now:** it applies the owner schema's profile, as W3F does.
