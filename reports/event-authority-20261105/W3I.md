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
