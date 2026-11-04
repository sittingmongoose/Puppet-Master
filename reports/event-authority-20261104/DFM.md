# DFM — FileManager Event Authority draft, 2026-11-04

Branch: plans/ea-w2-filemanager-20261104. Base: be4766513f (origin/main at branch creation). Prepared without admission. Native execution: NOT_RUN.

## Per-row outcomes and self-grade

Each row is register (prepared), with membership ABSENT, retention PARTIAL, and the other ten criteria PASS for normative text only. Retention and later independent review/admission remain gates. No registry or admission record was written. No exclusion or product decision was made.

| Family | Own semantic unit | Outcome | Self-grade |
|---|---|---|---|
| file.copied | F-150 | register (prepared) | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership |
| file.created | F-151 | register (prepared) | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership |
| file.deleted | F-152 | register (prepared) | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership |
| file.exported | F-153 | register (prepared) | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership |
| file.moved | F-154 | register (prepared) | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership |
| file.renamed | F-155 | register (prepared) | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership |
| folder.copied | F-156 | register (prepared) | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership |
| folder.created | F-157 | register (prepared) | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership |
| folder.deleted | F-158 | register (prepared) | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership |
| folder.exported | F-159 | register (prepared) | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership |
| folder.moved | F-160 | register (prepared) | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership |
| folder.renamed | F-161 | register (prepared) | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership |

## Per-family search and newly authored bindings

Immutable-base search: git grep over non-generated Plans at be4766513f, including owner prose, Contracts, Storage, payloads, both registries, Decision Log, PRD/Planning Wizard/Assistant Chat. Generated shards/index/evidence/migration and ledgers were excluded. Existing schema handler names, fields and versions are reused first; no sibling supplies another family’s semantics.
Raw exact-hit search: /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DFM/canonical-search.json; SHA-256 b1e2eec88ec45180435a41c115da4895b0e38edc96966cfca09319bf5793824d. Each row below was independently checked. Existing UCC rows and draft schemas give partial payload/producer definitions, but no complete family identity formula, exact versioned operating history reader, SP-278 adoption, SP-286/full-value recovery adoption or withdrawal protocol was found. New definitions are explicitly labelled newly authored owner contracts under DL-045. This is a scoped absence finding, not global absence proof.

| Family | Existing partial evidence | Newly authored exact reader | Identity and recovery binding |
|---|---|---|---|
| file.copied | UCC lines 350–359; existing closed draft schema | reader.filemanager.file_copied.v1@1.0.0 | F-150: exact six-string RFC8785 tuple, family-prefixed SHA-256 ID/key; original operation/first receipt reconciliation |
| file.created | UCC lines 350–359; existing closed draft schema | reader.filemanager.file_created.v1@1.0.0 | F-151: exact six-string RFC8785 tuple, family-prefixed SHA-256 ID/key; original operation/first receipt reconciliation |
| file.deleted | UCC lines 350–359; existing closed draft schema | reader.filemanager.file_deleted.v1@1.0.0 | F-152: exact six-string RFC8785 tuple, family-prefixed SHA-256 ID/key; original operation/first receipt reconciliation |
| file.exported | UCC lines 350–359; existing closed draft schema | reader.filemanager.file_exported.v1@1.0.0 | F-153: exact six-string RFC8785 tuple, family-prefixed SHA-256 ID/key; original operation/first receipt reconciliation |
| file.moved | UCC lines 350–359; existing closed draft schema | reader.filemanager.file_moved.v1@1.0.0 | F-154: exact six-string RFC8785 tuple, family-prefixed SHA-256 ID/key; original operation/first receipt reconciliation |
| file.renamed | UCC lines 350–359; existing closed draft schema | reader.filemanager.file_renamed.v1@1.0.0 | F-155: exact six-string RFC8785 tuple, family-prefixed SHA-256 ID/key; original operation/first receipt reconciliation |
| folder.copied | UCC lines 350–359; existing closed draft schema | reader.filemanager.folder_copied.v1@1.0.0 | F-156: exact six-string RFC8785 tuple, family-prefixed SHA-256 ID/key; original operation/first receipt reconciliation |
| folder.created | UCC lines 350–359; existing closed draft schema | reader.filemanager.folder_created.v1@1.0.0 | F-157: exact six-string RFC8785 tuple, family-prefixed SHA-256 ID/key; original operation/first receipt reconciliation |
| folder.deleted | UCC lines 350–359; existing closed draft schema | reader.filemanager.folder_deleted.v1@1.0.0 | F-158: exact six-string RFC8785 tuple, family-prefixed SHA-256 ID/key; original operation/first receipt reconciliation |
| folder.exported | UCC lines 350–359; existing closed draft schema | reader.filemanager.folder_exported.v1@1.0.0 | F-159: exact six-string RFC8785 tuple, family-prefixed SHA-256 ID/key; original operation/first receipt reconciliation |
| folder.moved | UCC lines 350–359; existing closed draft schema | reader.filemanager.folder_moved.v1@1.0.0 | F-160: exact six-string RFC8785 tuple, family-prefixed SHA-256 ID/key; original operation/first receipt reconciliation |
| folder.renamed | UCC lines 350–359; no own closed schema at base; authored folder_renamed.schema.json | reader.filemanager.folder_renamed.v1@1.0.0 | F-161: exact six-string RFC8785 tuple, family-prefixed SHA-256 ID/key; original operation/first receipt reconciliation |

Every F-150..161 independently binds its named existing handler/command, original receipt ordering, SP-286/CV-339 full-value v2 and first AppendReceipt, SP-278 generic source/checkpoint, identity/retry, scoped opaque path-ref interpretation, original-owner custody, coherent restore and exact-family withdrawal/version fences. These are newly authored technical bindings for already specified behavior, not previously existing definitions.

Each reader is history-only and writes no checkpoint or projection of its own. SP-278 retains sole generic checkpoint/schema/CAS/rebuild ownership, including its nine-field durable token and live transaction snapshot join. Thus no new storage-value rows are required; no new file body, path map, journal, receipt table, projector or pending-event outbox is created. Original FileSafe/transfer owners and SP-286 keep original custody. Loss or ambiguity fences completion rather than reconstructing originals or repeating effects.

## Premise checks

- DL-045 at Decision_Log.md lines 6663–6683 and its frozen exact-scope manifest: all twelve exact names remain in technical_scope_exact_event_types; current UCC lines 350–359 and FileManager sections 1.1/11 still specify their actions. Bounded technical authorship applies; no admission or product/retention decision follows.
- F2-205 at FileSafe.md lines 14740–14776 still explicitly decides OS-trash default, confirmed permanent deletion and distinct same-directory journaled tombstones. Current FileManager create/rename/delete actions remain live. Existing unadmitted delete schemas omitted permanent mode and conflated custody: changed deletion_mode to os_trash|permanent|journaled_tombstone, matching this current decision without changing it.
- SP-278/DL-076 and SP-286/CV-339 remain current shared owners. SP-336 supersedes any older per-group manifest-sync assumption; these contracts adopt current group durability and never restamp old receipt custody.
- No August/September family-retention answer is applied. DL-075 runtime_artifact lifetime is not transferred to file operations. No historical answer with changed premises was used. Failed answer-premise checks: none.
- Existing Project-scoped schema editions remain Project-only; current app opening/root behavior (FileManager F-090) is not converted into Project scope and is not assigned an app event edition by this draft.

## Retention and questions for Jared

All twelve retention_policy_ref cells remain PENDING_RETENTION_DECISION. Case L-3 (storage-plan.md lines 17403–17418) distinguishes authority/receipt/source-lineage indefinite, ordinary telemetry 90 days and non-authority operational history 2,555 days. It does not explicitly name FileManager operation history. RT/CC-L5-1 must settle the exact class, anchor and scope; DFM does not pick a class. Event history retention is distinct from file contents, OS trash, FileSafe journals/tombstones and referenced receipts.

Question for Jared, routed through RT/CC-L5-1: should file/folder operation history use indefinite content-free audit/receipt retention, indefinite deletion history with bounded other operations, or bounded operation history with separately retained authority/tombstones? This is the existing card question, not a new decision or a recommendation adopted here. No other product question was identified.

## Shared-file hunks and IDs

- Plans/Contracts_V0.md: append-only CV-560 routes each of the twelve closed schemas to its own F unit.
- Plans/storage-plan.md: append-only SP-560 lists twelve independent F routes and twelve pending retention cells; no existing rows reflowed.
- Plans/Automated_Testing_System.md: append-only ATS-280 binds per-family positive/negative fixtures and static checker; native obligations remain NOT_RUN.
- Plans/storage_value_registry.json: unchanged. Plans/UI_Command_Catalog.md: unchanged; exact current command/event names are adopted from its existing rows.
- Plans/FileManager.md: new F-150..F-161, one full contract per family. Main and all fetched origin branches were checked: highest F was 90; F-150 starts 60 above it. Assigned SP-560..569, CV-560..569, ATS-280..284 were unused on fetched origin branches.
- IDs used: F-150..F-161, SP-560, CV-560, ATS-280. No other allocated unit IDs, registry family IDs, Decision Log IDs or policy IDs were minted.
- Existing eleven schemas retain schema IDs and version 1.0.0; add the previously missing pm.file_manager_event.folder_renamed.schema.v1. Per-family original ref semantics are now explicit. Fixtures use pm.filemanager_event_contract_fixtures.v1 (nonstored assurance data).

## Verification

- free -g: 16 GB available at start, over the 6 GB stop threshold.
- Fifteen ignored currentness-edition files copied from the shared checkout and SHA-256 compared byte-for-byte before index generation; manifest is currentness-sha256.txt in the evidence directory.
- pm-shard-plans.py --generate --config Plans/sharding_config.json: exit 0.
- pm-plan-index.py generate: exit 0.
- pm-filemanager-event-contracts.py: exit 0; 12 families, 279 positive/negative static oracle cases. Native execution NOT_RUN.
- pm-shard-plans.py --check --config Plans/sharding_config.json: exit 0, top-level status pass; 99 documents and 3,092 shards checked.
- pm-plan-index.py validate: exit 0; parsed JSON top-level status pass.
- git diff --check: exit 0.
- Targeted-check discovery used rg over scripts/ and tests/. No pre-existing dedicated FileManager event checker/test was found; the new script and Plans fixture provide these oracles. No tests/ file edited.
- Derived changes were checked: shard owners are only automated_testing_system, contracts_v0, filemanager and storage-plan (the four edited docs); the six aggregate .plan_index files are generated. No unrelated owner shards changed.
- No main push, landing lock, reseal, event-registry append, admission/Decision Log record, frozen validator edit, pm-mail or subagent.

Checks and report copies: /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DFM. Leave this local worktree for the lead; it has not landed.
