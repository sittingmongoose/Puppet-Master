# DDBG — independent investigation event contracts

Branch: `plans/ea-w2-debug-20261104`. Base: `be4766513f` (fetched origin/main). VM memory check: available 16 GiB. Native execution: NOT_RUN. No admission record, event-registry append, Decision Log edit, governance reseal, main push, landing lock, pm-mail or subagent.

## Per-row outcomes

| Event | Owner unit | Outcome / self-grade |
|---|---|---|
| `debug.investigation.context_item_added` | CV-570 | prepared without admission; 10 PASS, retention PARTIAL, membership ABSENT |
| `debug.investigation.context_item_state_changed` | CV-571 | prepared without admission; 10 PASS, retention PARTIAL, membership ABSENT |
| `debug.investigation.exported` | CV-572 | prepared without admission; 10 PASS, retention PARTIAL, membership ABSENT |
| `debug.investigation.imported` | CV-573 | prepared without admission; 10 PASS, retention PARTIAL, membership ABSENT |
| `debug.investigation.instrumentation_state_changed` | CV-574 | prepared without admission; 10 PASS, retention PARTIAL, membership ABSENT |
| `debug.investigation.started` | CV-575 | prepared without admission; 10 PASS, retention PARTIAL, membership ABSENT |
| `debug.investigation.state_changed` | CV-578 | blocked on Jared; CONFLICT |
| `debug.investigation.target_bound` | CV-576 | prepared without admission; 10 PASS, retention PARTIAL, membership ABSENT |
| `debug.investigation.verification_recorded` | CV-577 | prepared without admission; 10 PASS, retention PARTIAL, membership ABSENT |

Each prepared row owns its exact producer, closed 1.0.0 payload, Project scope and identity recipe, first-receipt ordering, transient reader, source proof, custody, replay, compatibility and withdrawal text. Shared prerequisite definitions do not stand in for an individual adoption. `state_changed` has no schema or fixture: CV-578 records only its unanswered owner conflict.

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

## Verification

- Static DDBG schema/identity/refusal oracles: exit 0, top-level PASS, eight separate family cases. Each case checks every missing required field, unknown fields, version, pinned identity, scope/operation substitution, changed-body digest conflict, original custody identity, unregistered/pending-retention/withdrawal refusal. Native transition, receipt crash, source-generation/CAS, evidence permission/deletion and withdrawal/rebuild cases are authored per family and remain NOT_RUN.
- Shard generation: exit 0. Shard check: exit 0, parsed top-level pass. No unrelated owner shards changed.
- Index generation: exit 0, parsed top-level pass. Copied all 15 ignored currentness-edition files and verified each source/destination SHA-256 before generation.
- Index validation: exit 0, parsed top-level pass. Initial validation caught the new CV/SP dependency cycle; removed the Contracts-to-SP edge and reran shard generation, index generation, shard check and index validation, all exit 0. SP-570 depends on the family Contracts units.
- Existing shared-runtime materialization checker: exit 1, `shared_runtime_storage_materialization_stale`. Its script, registry and all source schemas are unchanged against the base; do not apply its unrelated materialization. `shared-runtime-input-diff.txt` is empty.
- `git diff --check`: exit 0. No native or runtime readiness claim.

Checks and this report are copied to `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DDBG/`. Retention and the state_changed owner conflict block admission. The worktree remains for lead integration; this branch is not landed.

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
