# DDBG — independent investigation event contracts

Branch: `plans/ea-w2-debug-20261104`. Base: `be4766513f` (fetched origin/main). Initial VM memory check: available 16 GiB. Round 2 preflight: available 18 GiB, root disk 119 GB free. Current implementation: `d77cc98f8f7ae9594efd876bc7e02f733319a085`. Round 3 preflight: available 14 GiB, root disk 109 GB free. Native execution: NOT_RUN. No admission record, event-registry append, Decision Log edit, governance reseal, main push, landing lock, mailbox message or subagent.

## Per-row outcomes

| Event | Owner unit | Outcome / self-grade |
|---|---|---|
| `debug.investigation.context_item_added` | CV-570 | prepared without admission; 10 PASS, retention PARTIAL, membership ABSENT |
| `debug.investigation.context_item_state_changed` | CV-571 | prepared without admission; 10 PASS, retention PARTIAL, membership ABSENT |
| `debug.investigation.exported` | CV-572 | prepared without admission; 10 PASS, retention PARTIAL, membership ABSENT |
| `debug.investigation.imported` | CV-573 | prepared without admission; 10 PASS, retention PARTIAL, membership ABSENT |
| `debug.investigation.instrumentation_state_changed` | CV-574 | HELD_FOR_JARED; 8 PASS, 3 PARTIAL, membership ABSENT; no positive transition claim |
| `debug.investigation.started` | CV-575 | prepared without admission; 10 PASS, retention PARTIAL, membership ABSENT |
| `debug.investigation.state_changed` | CV-578 | blocked on Jared; CONFLICT |
| `debug.investigation.target_bound` | CV-576 | prepared without admission; 10 PASS, retention PARTIAL, membership ABSENT |
| `debug.investigation.verification_recorded` | CV-577 | prepared without admission; 10 PASS, retention PARTIAL, membership ABSENT |

Seven rows are prepared. Instrumentation retains structurally closed draft work and conditional technical bindings under CV-574; it is not prepared. Each prepared row owns its exact producer, closed 1.0.0 payload, Project scope and identity recipe, first-receipt ordering, transient reader, source proof, custody, replay, compatibility and withdrawal text. Shared prerequisite definitions do not stand in for an individual adoption. `state_changed` has no schema or fixture: CV-578 records only its unanswered owner conflict.

## Newly authored bindings and search evidence

For each prepared suffix N, CV-570..577 newly author `owner.debug.investigation.N@1.0.0`, `reader.debug.investigation.N@1.0.0`, `consumer.debug.investigation.N.context@1.0.0` and `consumer.debug.investigation.N.artifacts@1.0.0`. Their role is the exact handler and operating consumer named in that family's unit. The identity is independently specified for each family: SHA-256 of RFC 8785 [exact event type, actual project_id, investigation_id, original operation_id], prefixed `debug:` / `evt_debug_`. `operation_id` is frozen by the original operation before append, never regenerated on retry. `target_bound.target_bindings` is a newly authored closed ref/hash/revision join to the existing target owner record, not a new target identity model.

Each family reuses SP-286/CV-339 full-value v2 first-receipt custody, including DL-270/SP-347, and SP-278's generic index projector/key/schema and atomic frontier CAS. No new family projector or durable checkpoint is invented. Each exact reader has `none_required` family checkpoint because its result and cursor are ephemeral, rebuilt over the complete retained range on every open, and discarded on generation/frontier change. Its source proof is still SP-278; only the nine-field token is durable-eligible and no live snapshot id is stored. This is a history-read contract, not materialization of the deferred investigation record. No new stored value is owned, so no storage-value registry row is added. The preserved Project edition is explicit; CV-365/366 and SP-349's distinct application edition is neither rewritten nor granted Event Authority by this draft.

The per-family searches ran `git grep -n -F <exact name> origin/main -- Plans` excluding generated shards/index, pipeline audits/migrations/evidence and source-memory ledgers. All other live Plans files were included. Each found Contracts section 3.5/CV-123/124 minima; relevant partial owners also include Chat 11.0A/12.0A, Runtime Artifacts 5A, MiscPlan instrumentation cleanup, Storage debug records, and the deferred `tooling_skill_debug_families` registry inventory. Those surfaces do not supply exact versioned producer/consumer/checkpoint identities, closed event schemas or idempotency formulas for these names. No sibling definition was used. The exact-name output for each family is archived separately; hashes follow.

- **debug.investigation.context_item_added:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/debug.investigation.context_item_added.search.txt`, SHA-256 `7dbe04fad0b9fe00d74df2c4a2bb80e2901a6f30b0fcf77cdb786907deb0cf04` (3 matches).
- **debug.investigation.context_item_state_changed:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/debug.investigation.context_item_state_changed.search.txt`, SHA-256 `5ffc2e3c2533d017b4349666391769df267f1355c4524db1dafd8c293ba0fe18` (2 matches).
- **debug.investigation.exported:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/debug.investigation.exported.search.txt`, SHA-256 `79755833a7d076d489a483d9e91ffad936624a33de92a094fc8cae7160be9202` (5 matches).
- **debug.investigation.imported:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/debug.investigation.imported.search.txt`, SHA-256 `a64c07957f8899ad4e8dc73890453478b372344a067e9b707b97ac6a6ae62955` (3 matches).
- **debug.investigation.instrumentation_state_changed:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/debug.investigation.instrumentation_state_changed.search.txt`, SHA-256 `79ea15cb4719b42e328a5b346bac1c017a36e11650cac24bde64aa11744e950d` (3 matches).
- **debug.investigation.started:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/debug.investigation.started.search.txt`, SHA-256 `01bf00748ca38a2c1b420318e0131224c242f01cd9e7d5a559f32a6ab03e7809` (4 matches).
- **debug.investigation.state_changed:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/debug.investigation.state_changed.search.txt`, SHA-256 `032ad8c5c1955f7660da4c86a137b287e184b289428f36ff9518f9dfd4bcc387` (3 matches).
- **debug.investigation.target_bound:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/debug.investigation.target_bound.search.txt`, SHA-256 `2cb45ae5b8caabec5da3221670fb43fd4aedbaf5ea87881ea0c914f840beb208` (3 matches).
- **debug.investigation.verification_recorded:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/debug.investigation.verification_recorded.search.txt`, SHA-256 `3c67dd15ec0dd7570a4809955400434ca2b78f688b5e0ef4eb733acd55bd8a9d` (3 matches).

## Premise checks and questions

DL-045's current exact-name table still names all nine families; Contracts 3.5 still requires persisted EventRecords with those names. Its bounded technical permission remains applicable. No old retention answer is applied. DL-075 names runtime_artifact histories, which remain separate original bodies/groups here; it does not decide investigation-event lifetime. Case L-3 names operational, authority and Chat-content classes without assigning these exact investigation histories. Consequently all nine retention cells remain `PENDING_RETENTION_DECISION`, including the held row. No TTL, cardinality, deletion or orphan-thread policy is chosen. RT/Jared must assign them.

**Jared question (CV-578):** Chat 11.0A's closed lifecycle lists active, blocked, attention_required, verifying, failed_cleanup, resolved, cancelled and superseded. The same section's deterministic final-state mapping says `failed` pairs with six stop reasons. Is `failed` an additional lifecycle state, or should these six outcomes map to an existing state, and which? Both assertions are current owner text, not a stale survey. Contracts requires state_changed to carry the lifecycle state. No technical identity recipe can adjudicate this user-visible choice. Other rows do not decide it or grant lifecycle authority.

## Shared-file hunks and ids

- **Contracts_V0.md:** insert CV-570..578 at the end of section 3.5, before AuthState; preserve the existing rows and prose.
- **storage-plan.md:** insert SP-570 beside the debug investigation records, before key reconciliation notes. Each prepared family gets its own explicit Storage adoption paragraph.
- **Automated_Testing_System.md:** append ATS-285 at the end of the existing acceptance section.
- **Companions:** standalone payload schema, per-family fixture/oracle cases, and `scripts/pm-debug-investigation-events.py`. No tests/ file or ignore rule changed.
- **Derived files:** regenerated shards only for these three owners and repository PlanUnit indexes. No unedited owner's shard changed.
- **Ids used:** CV-570..578, SP-570, ATS-285. Before minting, scanned all 475 fetched origin refs; no id-block conflict. Evidence `id-scan.json` in the draft directory. No other ids minted; no event family was registered.

## Initial verification (before review fixes)

- Static DDBG schema/identity/refusal oracles: exit 0, top-level PASS, eight separate family cases. Each case checks every missing required field, unknown fields, version, pinned identity, scope/operation substitution, changed-body digest conflict, original custody identity, unregistered/pending-retention/withdrawal refusal. Native transition, receipt crash, source-generation/CAS, evidence permission/deletion and withdrawal/rebuild cases are authored per family and remain NOT_RUN.
- Shard generation: exit 0. Shard check: exit 0, parsed top-level pass. No unrelated owner shards changed.
- Index generation: exit 0, parsed top-level pass. Copied all 15 ignored currentness-edition files and verified each source/destination SHA-256 before generation.
- Index validation: exit 0, parsed top-level pass. Initial validation caught the new CV/SP dependency cycle; removed the Contracts-to-SP edge and reran shard generation, index generation, shard check and index validation, all exit 0. SP-570 depends on the family Contracts units.
- Existing shared-runtime materialization checker: exit 1, `shared_runtime_storage_materialization_stale`. Its script, registry and all source schemas are unchanged against the base; do not apply its unrelated materialization. `shared-runtime-input-diff.txt` is empty.
- `git diff --check`: exit 0. No native or runtime readiness claim.

Checks and this report are copied to `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/`. Retention and the two explicit owner holds block admission. Each fix worktree is removed after its final branch push; this branch is not landed.

## Check evidence hashes

- **id-scan.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/id-scan.json`, SHA-256 `d20e64f3be5d8db4acb691f07eb2389673335bfb702c3183e5cef438cb5b78f4`.
- **binding-search.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/binding-search.json`, SHA-256 `9bfbebc6d2fe5e4c26db1736ec08a5e467fe2a66bb0cd12280e8a4d503b8941e`.
- **currentness-sha256.txt:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/currentness-sha256.txt`, SHA-256 `76fa6f4657ab818ac61ef422c10a66ef11906f79a736374dc2e6e4da4d5acce9`.
- **pipeline-exits.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/pipeline-exits.json`, SHA-256 `dc78b2c739175d327097d5dba0e3d257f27b44720878fcd9d3ba88469d1b4290`.
- **static-check.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/static-check.json`, SHA-256 `3c6de024814406fb0ac0fb21cc9ea08e13f4624d0054173f358310d191b097e1`.
- **shard-generate.txt:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/shard-generate.txt`, SHA-256 `48c09691cf1c0464d1276a594016813a0df26d1a721256cd653580869c58d3c4`.
- **shard-check.txt:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/shard-check.txt`, SHA-256 `3df84afb0ff89f7052554bb9700a1bc3294714b9109ec8257ee2b7ab46a86b21`.
- **index-generate.txt:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/index-generate.txt`, SHA-256 `1a7ab1721398926651b3e0b7dc04716a44c92671efaf19e0a21b29a0c4a8dcc9`.
- **index-validate.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/index-validate.json`, SHA-256 `020570393b20489bfdb40e482f7ae7de92a175d45f9f898d20517a508cb696ee`.
- **shared-runtime-check.txt:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/shared-runtime-check.txt`, SHA-256 `979a75cb0dbc609ddcbecd4c5e3b0f95ff6cad592869415a92af69a31f066ec7`.
- **shared-runtime-input-diff.txt:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/shared-runtime-input-diff.txt`, SHA-256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.

## Review round 1: findings and responses

Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DDBG-sol/REVIEW.md` (Sol 6.1 max, NOT_READY, 7 families pass as prepared). Fixes by the stream E lead.

1. **Blocking, fixed in `5271b83e9e`.** `debug.investigation.started` accepted any string for `requested_mode_overlay` and `effective_mode_overlay`, and its positive fixture used `scrubbed`/`scrubbed`/`ask`. `Plans/debug_investigation_event_payloads.schema.json` `#/$defs/started` now closes both fields to the enum in `Plans/assistant-chat-design.md` ("Canonical enum closure", line 2669) and adds two if/then rules from section 1.0B/1.0C: requested `debug` implies effective `debug`; effective `debug` resolves to `regular` or `yolo`, never `ask` or `plan`. The fixture carries `debug`/`debug`/`regular`. `scripts/pm-debug-investigation-events.py` adds six forbidden-tuple negative cases (unknown overlay twice, requested debug with effective plan, debug+ask twice, debug+plan) and two legal-tuple positives (`debug`/`debug`/`yolo`; `none`/`none`/`ask`). Verify: the checker prints PASS at this head; with the previous schema restored it prints FAIL on exactly the six new cases. Self-grade: `closed_payload_schema` and `positive_negative_oracles` for `started` stay PASS with the review's downgrade and this fix recorded.
2. **Note, unchanged.** `debug.investigation.state_changed` stays held for Jared ('failed' as a lifecycle state, or which existing state receives the six outcomes); the review confirms the hold is genuine.
3. **Note, unchanged.** Retention (`PENDING_RETENTION_DECISION`) and admission remain explicit gates.
4. **Note, unchanged.** The shared-runtime materialization failure is pre-existing on `main`.


## Review round 2: findings and responses

Astra final review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DDBG-sol/REVIEW-astra.md`, SHA-256 `e1f08f009621a741afd72e78b87c611e71b0f913f14b3f25979ee6b0e1184672`, reviewed head `5e7faf3870cab5105491541978deca20d046224f`. Implementation commit: `1ace7c32935eee55e147a98a05bbca8091707b0c`. The report/self-grade follow-up records the resulting grades against that exact implementation tree. No finding is disputed.

1. **B1 — fixed (1ace7c3293).** Where: `Plans/debug_investigation_event_payloads.schema.json:379`, `Plans/Contracts_V0.md:2217`, `scripts/pm-debug-investigation-events.py:107`. Cause: round 1 encoded Debug alone. Fix: all seven normalized requested/effective overlays and all four runtimes are bound to Assistant Chat 1.0A/1.0B/1.0C, its enum closure/UI table, and Run_Modes' requested/effective owner projection (`Plans/Run_Modes.md:1714`). Plan/Deep Plan retain their overlay and require runtime `plan`; Debug/Interview/BrainStorm/Crew require `regular` or explicit-opt-in `yolo`; Ask requires `none`. Normalized overlays agree. `none/none/plan` remains lawful for the non-primary runtime entrypoint explicitly permitted at Run_Modes:1716. That round used an exhaustive tuple oracle; Astra 2 found its universal restriction unsupported, and round 3 removes it. The two review counterexamples are explicit fixture negatives at `Plans/debug_investigation_event_fixtures.json:558` and `:568`; previous Debug negatives remain. Verify: targeted checker PASS; substituting the round-1 schema makes the full checker FAIL.
2. **B2 — fixed (1ace7c3293).** Where: `scripts/pm-debug-investigation-events.py:14`, `Plans/Contracts_V0.md:2225`, fixture `:578`. Cause: changing the identity preimage tested key separation without proving a Project join. Fix: compare payload, envelope projection, actual owner record, case Project, investigation identity, optional thread/run, and encoded scope partition. The exact payload-only `project_id=other-project` negative preserves the case Project and expected identities, returns `project_scope_mismatch`, and models zero appends. Separate envelope/owner/investigation/thread/run negatives also run through the same gate. Verify: mutating only the shipped started payload Project makes the full checker FAIL; disabling the join check also fails its negative oracles.
3. **B3 — fixed (1ace7c3293).** Where: unchanged canonical no-op owner rule `Plans/Contracts_V0.md:1699`, fixture `:182`, `scripts/pm-debug-investigation-events.py:137`. Cause: active/active was accepted as the positive transition. Fix: positive is active-to-revoked; an equal-state candidate is schema-valid but returns `no_op`, with zero modeled appends and no receipt. Its native zero-append obligation is authored and NOT_RUN. Verify: restoring the equal-state positive or disabling no-op rejection makes the full checker FAIL.
4. **B4 — stopped for Jared (1ace7c3293 records the hold).** Where: `Plans/Contracts_V0.md:2070`, `Plans/storage-plan.md:1106`, `Plans/Automated_Testing_System.md:7239`, schema `:282`, fixture `:449`. Cause: the old manifest-equality wording did not define a source field, domain, or transition predicate. Current-source search covered every tracked live non-pipeline Plans file (`git grep` excluding shards/index/audits/migration/evidence/ledgers/locks). MiscPlan:1333/6085 requires but does not supply collector transitions; MiscPlan:6427 names `collector_state`/`cleanup_result`; Storage:1049 names manifest `scope`/`state`/`cleanup_outcome`; Runtime Artifacts:189 requires lifecycle/cleanup evidence; feature-list:35 names `planned`, `active`, `collecting`, `cleanup_pending`, `cleaned`, `cleanup_failed` without a mapping or legal edges. No source closes `rollback_state`. Fix: preserve the structural draft and conditional technical bindings; remove preparation/positive-transition claims and refuse all candidates as `instrumentation_mapping_unresolved`. Both the old `scrubbed` labels and the review's invented labels are zero-append negatives. The self-grade keeps transitions/oracles PARTIAL. Verify: falsely marking the family prepared or bypassing its hold makes the full checker FAIL.

   **Exact question:** Which exact source fields and closed value domains map to instrumentation_state_changed.scope_kind, state and rollback_state, and which previous-to-next transitions (including cleanup failure, retry and supersession) emit an event versus no event?
5. **Stale self-grade evidence — fixed in the report/self-grade follow-up.** All 152 evidence quotations now resolve at the edited source bytes, including schema `$id` lines `started:563`, `target_bound:635`, `verification_recorded:683`. Every normative file hash is refreshed; the assessed commit is the implementation SHA above, avoiding a self-referential report-commit hash. Reviewer before-grades are preserved per cell, including all five downgrades; repaired cells are re-graded from current evidence. Verify: `round2-evidence-validation.json` reports PASS, 152 quotes, zero mismatches.
6. **Lifecycle hold — preserved.** `debug.investigation.state_changed` stays unprepared under CV-578 (`Plans/Contracts_V0.md:2587`), with no schema or positive fixture. The exact existing question remains whether `failed` joins the closed lifecycle or which existing state receives the six failed outcomes. This fix selects neither answer.
7. **Retention/admission — preserved.** Every family's `PENDING_RETENTION_DECISION` and absent registry membership remain. No registry, admission, Decision Log, Spec Lock, governance evidence, auto-decision row or frozen validator changed. The product-answer and individual-admission gates still apply.

### Standing checks and bounded scope

Every structural candidate, including held instrumentation, now has a `projector_replay_only` negative and current append/retry refusal `replay_only_not_appendable`. All Project positives carry `scope_partition=project~cDE` (the exact unpadded base64url of `p1`); raw `p1` partitions refuse. The raw owning Project ID remains `p1` in identity preimages. No application writer or application key is introduced, so CV-366 application key formatting is inapplicable. Each exact CV-570..577 unit individually adopts the current 16 KiB inline/SP-337 payload-reference boundary; the schema-valid oversized verification body is refused inline. Native pack/reference durability is expressly NOT_RUN, not modeled as a successful write. Removing all native oracle declarations now fails the checker, addressing the review's optional hardening note.

No new PlanUnit IDs, producer/consumer identities, family projectors or checkpoints were minted. The only new held-candidate refusal token is `instrumentation_mapping_unresolved`; it is a technical fence on an unanswered question, not a lifecycle policy. Existing cleanup, restore-point, residue visibility, retention, custody and permission obligations remain. No native readiness, admission or governance seal is claimed.

### Family grades before and after

Before is Astra's independent grade, not the branch's earlier overstatement. P=PASS, p=PARTIAL, A=ABSENT, C=CONFLICT.

| Family suffix | Before | After | Current outcome |
|---|---|---|---|
| context_item_added | 10P / 1p / 1A | unchanged | prepared |
| context_item_state_changed | 9P / 2p / 1A | 10P / 1p / 1A | prepared |
| exported | 10P / 1p / 1A | unchanged | prepared |
| imported | 10P / 1p / 1A | unchanged | prepared |
| instrumentation_state_changed | 8P / 3p / 1A | unchanged grades; hold now explicit | held for Jared |
| started | 8P / 3p / 1A | 10P / 1p / 1A | prepared |
| target_bound | 10P / 1p / 1A | unchanged | prepared |
| verification_recorded | 10P / 1p / 1A | unchanged | prepared |
| state_changed | 0P / 2p / 8A / 2C | unchanged | held for Jared |

Original eight rows: **75P / 13p / 8A -> 78P / 10p / 8A**. All nine: **75P / 15p / 16A / 2C -> 78P / 12p / 16A / 2C**. Preparation verdict: **5 of 8 pass -> 7 prepared pass, 2 explicit holds across the nine-row lane**. Native execution stays NOT_RUN. IDs remain **CV-570..578, SP-570, ATS-285**; round 2 mints none.

### Round-2 verification

| Check | Exit | Parsed result |
|---|---:|---|
| `python3 -B scripts/pm-debug-investigation-events.py` | 0 | PASS; seven prepared, instrumentation held |
| Full-checker mutation probes | 0 | PASS; 13 probes, 12 injected defects detected |
| Shard generation | 0 | pass |
| Index generation | 0 | pass |
| Shard verification | 0 | pass; only the three edited owner shard directories change |
| Index validation, after final generation | 0 | top-level pass; no failures |
| Self-grade quote/hash validation | 0 | PASS; 152 quotes |
| `git diff --check` | 0 | clean |

The ignored currentness edition was copied and all 15 file SHA-256s matched before index generation. Only CV-570..577 prose additions, SP-570's hold adoption, ATS-285, standalone companions/checker, their derived shards/indexes, and this report/self-grade changed. No test file, unrelated owner shard, registry or governance artifact changed. Aggregate landing checks and native tests were not run by this fix worker.

Round-2 evidence files below are retained; report and self-grade copies overwrite the draft delivery paths. Worktree cleanup follows the final successful branch push.

- **round2-pipeline-exits.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round2-pipeline-exits.json`, SHA-256 `48bcfe9b9fdd46a30e43f48cef618b00dd3c6712bc572946340212e5b0039da2`.
- **round2-static-check.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round2-static-check.json`, SHA-256 `e9bd97b0905f6d15967d12cddc15c35b6bf242d0a0e458d87a29c3b89247cff4`.
- **round2-regression-probes.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round2-regression-probes.json`, SHA-256 `06069576f02c55d7314a5ac4e9ae8428a8af4493abde5181a98522056570e092`.
- **round2-shard-generate.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round2-shard-generate.json`, SHA-256 `48c09691cf1c0464d1276a594016813a0df26d1a721256cd653580869c58d3c4`.
- **round2-shard-check.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round2-shard-check.json`, SHA-256 `3df84afb0ff89f7052554bb9700a1bc3294714b9109ec8257ee2b7ab46a86b21`.
- **round2-index-generate.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round2-index-generate.json`, SHA-256 `378a6e93edc253c618d38f08e54a66b4be589134094fb67313d802881c4b2b9c`.
- **round2-index-validate.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round2-index-validate.json`, SHA-256 `fe832becb1df9b2758b5a0cb18f03f79cd44d1b900b830e9b77a39ceffb0ef9d`.
- **round2-evidence-validation.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round2-evidence-validation.json`, SHA-256 `4aa52895fc32a46935501d61b99ac00c3400c91465ff9be0e0081b51f4bb2969`.


## Review round 3: findings and responses

Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DDBG-sol/REVIEW-astra-2.md`, reviewed head `6c3ab9856f65eb95682aee4d6736d0c4776c02cf`. Implementation commit: `d77cc98f8f7ae9594efd876bc7e02f733319a085`. Final allowed fix round; no finding is disputed. Preflight was 14 GiB available RAM and 109 GB root disk free; the later check was 17 GiB and 126 GB. Sparse detached worktree `/home/sittingmongoose/pm-worktrees/DDBG-fix3` came from `~/src/PuppetMaster`; final delivery removes it after pushing the report/grade follow-up.

1. **B1 — fixed (`d77cc98f8f7ae9594efd876bc7e02f733319a085`).** Where: `Plans/Contracts_V0.md:2217`, payload schema `:379`, checker `:136`, fixture `:1829`. Cause: round 2 treated the scope-specific `run.started` projection and Chat's execution-qualified row as universal workflow restrictions. Fix: CV-575 and the schema retain the exact closed enums, selected Debug's `debug/debug` binding, regular/default and explicit-opt-in YOLO posture, and effective planning's read-only runtime. The cited cases independently cover read-only `crew/crew/plan` (Chat:1925-1929, Run_Modes:496-500), explicit inspect/Plan/Deep Plan/Agent resolution (Chat:2675-2680), standard specialized execution (Chat:178), and approved plan/TODO handoff (Chat:114-120). Approval alone does not clear overlays; explicit Agent invocation does. The family does not require all requested/effective overlays to be equal or classify every enum product. Unspecified structural tuples are not proof of launch authority. The `run.started` projection's scope resolves the cited conflict without choosing a new product restriction. Round 2's universal matrix and legal/forbidden totals are superseded and are not grading evidence. Verify: the full checker accepts a Crew/plan positive; restoring the blanket Crew restriction makes it FAIL. The fixture also refuses missing planning approval and missing explicit YOLO opt-in. No mode-owner document changed.
2. **B2 — fixed (`d77cc98f8f7ae9594efd876bc7e02f733319a085`).** Where: payload schema `:514-518`, fixture `:2076`. Cause: `$` accepted the position before a trailing LF. Fix: `source_sha256` requires both minimum and maximum length 64 alongside its lowercase hex pattern. LF, uppercase, short and nonhex negatives run through the candidate gate. Promoting each to the target-bound positive makes the full checker exit 1/FAIL. Recursive schema inspection found no other identifier `pattern` in this payload companion; all seven families additionally reject trailing LF on their exact encoded partition.
3. **B3 — fixed (`d77cc98f8f7ae9594efd876bc7e02f733319a085`).** Where: checker `:14-20`, `:41-42`, `:94`, each prepared family's `negative_cases`. Cause: rejecting reader-only replay did not enforce the family's selected current policy. Fix: both candidate and hypothetical admitted retry require exactly `dedupe_by_idempotency_key`; `projector_replay_only` retains `replay_only_not_appendable`, and `append_once`/`dedupe_by_event_id` return `writer_policy_mismatch`. Every prepared family has three separate full-checker corrupted-positive runs and authored per-family negative vectors. All 21 runs exit 1/FAIL; no policy failure is merely a diagnostic count.
4. **N1 — holds retained.** CV-574, CV-578 and the instrumentation held fixture compare exactly equal to round 2 (excluding relocated line numbers in evidence). `state_changed` remains absent from schema/fixtures. Neither question is answered. Retention remains `PENDING_RETENTION_DECISION` and admission remains absent.
5. **N2 — derived verification passed.** Only Contracts and Automated Testing shards changed in this round; Storage's shard content stayed unchanged. The ignored currentness edition's 15 source/destination hashes match. Shard generation/check and index generation/validation exit 0 with top-level `pass`. Generator-owned index timestamps are regenerated; this report makes no literal byte-equality claim for those timestamps. No unrelated owner shard or governance artifact was edited.

### Standing checks, every prepared family

**P = pass. F = fixed in `d77cc98f8f7ae9594efd876bc7e02f733319a085`.** All cells refer to static full-checker evidence; no cell claims native execution. Each negative below is executed in `scripts/pm-debug-investigation-standing-checks.py`, which creates and removes a bounded disposable tree and verifies both nonzero exit and the checker's top-level FAIL with a diagnostic naming the tested family. It never mutates repository fixtures during the run.

| Family (`debug.investigation.`) | C1 replay | C2 app key | C3 partition | C4 size | C5 LF | C6 semantic body | C7 checkpoint | C8 exit |
|---|---|---|---|---|---|---|---|---|
| context_item_added | F | P (app refused) | P | P (valid oversized) | P (partition; no payload pattern) | F | P (transient) | P |
| context_item_state_changed | F | P (app refused) | P | P (bounded shape) | P (partition; no payload pattern) | F | P (transient) | P |
| exported | F | P (app refused) | P | P (invalid oversized scalar) | P (partition; no payload pattern) | F | P (transient) | P |
| imported | F | P (app refused) | P | P (bounded shape) | P (partition; no payload pattern) | F | P (transient) | P |
| started | F | P (app refused) | P | P (valid oversized) | P (partition; no payload pattern) | F | P (transient) | P |
| target_bound | F | P (app refused) | P | P (invalid oversized scalar) | F (hash) | F | P (transient) | P |
| verification_recorded | F | P (app refused) | P | P (valid oversized) | P (partition; no payload pattern) | F | P (transient) | P |

| Check | Negative that catches the defect, repeated for each prepared family | Whole-checker result |
|---|---|---|
| C1 | Substitute `projector_replay_only`, then `append_once`, then `dedupe_by_event_id` in the positive. Candidate and admitted retry policy checks both run. | 21 runs, exit 1/FAIL. |
| C2 | Substitute `scope_kind=application`, `project_id=null`, partition `app`; this Project-only edition cannot accept an application writer/key. CV-366 is not replaced with a local app recipe. | Seven runs, exit 1/FAIL. |
| C3 | Substitute raw `p1` for `project~cDE` (base64url-unpadded UTF-8 `p1`). | Seven runs, exit 1/FAIL. |
| C4 | Promote a schema-valid encoded body above 16 KiB for context-added, started and verification; for the other four promote an overlong scalar above 16 KiB, refused by the closed schema. | Seven runs, exit 1/FAIL. No external-body success/custody simulation is claimed; SP-337 native durability remains NOT_RUN. Export/count and revision integer domains are not tightened by this fix. |
| C5 | Append LF to each exact encoded partition; for target binding also append LF to the 64-character hash and try uppercase, short and nonhex hashes. | Eleven runs, exit 1/FAIL. Only target_bound has a payload identifier regex; its exact-length guard fixes the actual defect. |
| C6 | Corrupt the semantic digest implementation to include each Storage-assigned field, then to hash payload only; also corrupt a retry oracle to claim Storage metadata causes a changed semantic digest. | Five negative runs per family, exit 1/FAIL. Three metadata-only positive mutations per family correctly remain exit 0/PASS. |
| C7 | Give the transient-reader fixture a durable family checkpoint with a different partition, event type and source generation instead of `none_required`. | Seven runs, exit 1/FAIL. There is no family checkpoint positive/storage identity to reconcile. Shared SP-278 source/CAS identity verification stays native NOT_RUN. |
| C8 | Corrupt the positive schema version; separately add a no-mutation success candidate as a supposed zero-append negative with expected refusal null. | Fourteen runs, exit 1/FAIL; success is never credited as a failure oracle. |

C6 now uses the exact caller semantic field set from Contracts EventRecord: envelope identity/causality/account refs/time/producer sequence/key/schema/redaction/migration fields plus event type, payload and payload_ref. It excludes `sequence_id`, `observed_at_utc`, and `persisted_at_utc`. Field-selection probes distinguish digest changes from complete append adjudication: changing a key/scope is not claimed to be an admissible same-identity retry. These bounded JSON vectors are not native RFC 8785, full-envelope admission, payload-pack, receipt or checkpoint execution evidence.

The final runner reports **134 probes: 110 expected rejection runs, 24 expected successful runs, zero failures**. This includes both baselines and two independent B1 regressions. `python3 -B scripts/pm-debug-investigation-events.py` returns exit 0/PASS; `python3 -B scripts/pm-debug-investigation-standing-checks.py` returns exit 0/PASS. No standing cell is newly open in the static contract/oracle scope. Native obligations remain authored and NOT_RUN.

### Round-3 re-grade and delivery

The before column is Astra 2's independent grade, including all ten downgrades, not round 2's optimistic self-grade. P/p/A/C means PASS/PARTIAL/ABSENT/CONFLICT.

| Family suffix | Before P/p/A/C | After P/p/A/C | Outcome |
|---|---|---|---|
| context_item_added | 9/2/1/0 | 10/1/1/0 | Prepared without admission |
| context_item_state_changed | 9/2/1/0 | 10/1/1/0 | Prepared without admission |
| exported | 9/2/1/0 | 10/1/1/0 | Prepared without admission |
| imported | 9/2/1/0 | 10/1/1/0 | Prepared without admission |
| started | 7/2/1/2 | 10/1/1/0 | Prepared without admission |
| target_bound | 8/3/1/0 | 10/1/1/0 | Prepared without admission |
| verification_recorded | 9/2/1/0 | 10/1/1/0 | Prepared without admission |
| instrumentation_state_changed | 8/3/1/0 | 8/3/1/0 | Existing hold |
| state_changed | 0/2/8/2 | 0/2/8/2 | Existing hold |

Totals: **68P/20p/16A/4C -> 78P/12p/16A/2C**. Prepared verdict: **0/7 -> 7/7 (self-grade)**; independent re-review is not claimed. Seven membership cells remain ABSENT and retention remains PARTIAL. The assessment pins the implementation commit and refreshes every current source/checker hash and quotation location.

The latest fetched `origin/main` at preflight was `16acf7594a3fe8559af89491b895f440b314b99e`; Chat, Run_Modes, MiscPlan, feature-list and Runtime Artifacts blobs match the reviewed lane, so the relevant current owner premises remain unchanged. The rejected premise was round 2's universal application of the scope-specific `run.started` projection. No historical retention answer is newly applied. Existing technical bindings remain those listed above; no new producer, consumer, checkpoint, product mode, persisted field or event family is introduced. `mode_resolution`, `mode_cases`, `retry_cases` and `family_checkpoint` are static fixture projections/assertions only.

Round-3 shared-file hunks are restricted to **CV-575** and **ATS-285**. The standalone payload schema, fixtures, checker and new full-checker regression runner accompany them. IDs used remain **CV-570..578, SP-570, ATS-285**; round 3 mints none. No admission, registry append, Decision Log, retention answer, governance reseal, main push, test-file edit or subagent. Aggregate landing checks are reserved for integration and were not run.

Workflow deviation: before reading the fix brief's no-mail clause, the worker ran read-only mailbox inbox/who queries. No mailbox messages were sent and no further mailbox calls ran after that clause was read.

Reports, self-grade and final check outputs are copied to `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/`; final evidence paths and SHA-256 hashes follow.

- **round3-currentness-sha256.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round3-currentness-sha256.json`, SHA-256 `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c`.
- **round3-static-check.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round3-static-check.json`, SHA-256 `723acf9abcc32f7d28932b8849809cf0c4f6eb2167b7c8f41d9126c619baf693`.
- **round3-standing-checks.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round3-standing-checks.json`, SHA-256 `5e4fb649fb7064af5743648a9fd96e2e87bec4f3adda2bf5ef03809d9b844e17`.
- **round3-shard-generate.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round3-shard-generate.json`, SHA-256 `48c09691cf1c0464d1276a594016813a0df26d1a721256cd653580869c58d3c4`.
- **round3-shard-check.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round3-shard-check.json`, SHA-256 `3df84afb0ff89f7052554bb9700a1bc3294714b9109ec8257ee2b7ab46a86b21`.
- **round3-index-generate.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round3-index-generate.json`, SHA-256 `4a63a5a0aa95c5bd332fd72190e5d808c1a2a3e21fb01bb618b654ee01539740`.
- **round3-index-validate.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round3-index-validate.json`, SHA-256 `3bcb1c7a7a32cc580ad7157c2af5eb956682b173460ca1e1184753d7de5d8432`.
- **round3-evidence-validation.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round3-evidence-validation.json`, SHA-256 `9adeb4e4f5e7636c6f91fcd774494f29285746aa5906bf39a75fa13ce81a293b`.
- **round3-pipeline-exits.json:** `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/round3-pipeline-exits.json`, SHA-256 `36af54b0837b4c7b39ca69de23e8e88c35e7925a11277459b44cc75fa3d7dbe9`.
