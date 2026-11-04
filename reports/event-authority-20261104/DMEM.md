# DMEM draft report — 2026-11-04

Branch: `plans/ea-w2-memory-maintenance-20261104`. Assessed source head: `8115886fdacafb9d489d2e779dac2040375c1ba6`. Base: `be4766513ff71776346fc73b84f2542990f955af`. A later report-only commit contains this report and self-grade.

## Outcome

Eight families have their own newly authored owner contracts, closed payload definitions and SP-286/SP-278 adoption. Four held rows stop on Jared. No exclusions, registry append, admission record, Decision Log entry, reseal, landing lock or main push. Native execution is NOT_RUN. This is an incomplete depth preparation: retention and missing static semantic oracle coverage prevent an all-PASS claim.

| Family | Outcome | Self-grade | IDs |
|---|---|---|---|
| `memory.dedup_sweep.completed` | register_prepared | 9 PASS / 2 PARTIAL / 1 ABSENT | AMS-100, SP-630, CV-650 |
| `memory.dedup_sweep.started` | register_prepared | 9 PASS / 2 PARTIAL / 1 ABSENT | AMS-101, SP-631, CV-651 |
| `memory.index.lexical.rebuild.completed` | register_prepared | 9 PASS / 2 PARTIAL / 1 ABSENT | AMS-102, SP-632, CV-652 |
| `memory.index.lexical.rebuild.started` | register_prepared | 9 PASS / 2 PARTIAL / 1 ABSENT | AMS-103, SP-633, CV-653 |
| `memory.index.semantic.rebuild.completed` | register_prepared | 9 PASS / 2 PARTIAL / 1 ABSENT | AMS-104, SP-634, CV-654 |
| `memory.index.semantic.rebuild.started` | register_prepared | 9 PASS / 2 PARTIAL / 1 ABSENT | AMS-105, SP-635, CV-655 |
| `memory.verification_sweep.completed` | register_prepared | 9 PASS / 2 PARTIAL / 1 ABSENT | AMS-106, SP-636, CV-656 |
| `memory.verification_sweep.started` | register_prepared | 9 PASS / 2 PARTIAL / 1 ABSENT | AMS-107, SP-637, CV-657 |
| `memory.monthly_summary.completed` | blocked_on_Jared | 1 PASS / 2 PARTIAL / 9 ABSENT | none new |
| `memory.monthly_summary.started` | blocked_on_Jared | 1 PASS / 2 PARTIAL / 9 ABSENT | none new |
| `memory.prune_archive.completed` | blocked_on_Jared | 1 PASS / 2 PARTIAL / 9 ABSENT | none new |
| `memory.prune_archive.started` | blocked_on_Jared | 1 PASS / 2 PARTIAL / 9 ABSENT | none new |

Membership stays ABSENT for every row. Prepared families have PARTIAL retention and positive_negative_oracles. The latter reflects missing static CAS/crash/replay-effect coverage, never native NOT_RUN by itself. Blocked rows use only existing UCC/AMS evidence; no dependent schema is authored.

## Newly authored bindings and per-family search

See `DMEM-search.json`: twelve independent exact-name searches over live non-generated canonical Plans Markdown/JSON at the base above. Source ledgers, audits, generated indexes/shards and governance outputs were excluded. The existing exact hits are the DL-045 scope table and UCC-085 command pairs. AMS section 7.2 supplies operation behavior; it supplies no exact typed event, producer recovery or qualified consumer. No sibling is evidence for another family.

- **`memory.dedup_sweep.completed`**: emitter `MemoryMaintenance.dedup_sweep.completed.v1@1.0.0`; reader `reader.memory.dedup_sweep.completed.history.v1@1.0.0`; unique payload definition `Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_dedup_sweep_completed`; domain-separated SHA-256 event/idempotency recipe in SP-630. Search evidence is its own DMEM-search row. Each reader explicitly reuses the current SP-278 generic projector/root checkpoint and owns no new durable filtered cursor.
- **`memory.dedup_sweep.started`**: emitter `MemoryMaintenance.dedup_sweep.started.v1@1.0.0`; reader `reader.memory.dedup_sweep.started.history.v1@1.0.0`; unique payload definition `Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_dedup_sweep_started`; domain-separated SHA-256 event/idempotency recipe in SP-631. Search evidence is its own DMEM-search row. Each reader explicitly reuses the current SP-278 generic projector/root checkpoint and owns no new durable filtered cursor.
- **`memory.index.lexical.rebuild.completed`**: emitter `MemoryMaintenance.index_lexical_rebuild.completed.v1@1.0.0`; reader `reader.memory.index.lexical.rebuild.completed.history.v1@1.0.0`; unique payload definition `Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_index_lexical_rebuild_completed`; domain-separated SHA-256 event/idempotency recipe in SP-632. Search evidence is its own DMEM-search row. Each reader explicitly reuses the current SP-278 generic projector/root checkpoint and owns no new durable filtered cursor.
- **`memory.index.lexical.rebuild.started`**: emitter `MemoryMaintenance.index_lexical_rebuild.started.v1@1.0.0`; reader `reader.memory.index.lexical.rebuild.started.history.v1@1.0.0`; unique payload definition `Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_index_lexical_rebuild_started`; domain-separated SHA-256 event/idempotency recipe in SP-633. Search evidence is its own DMEM-search row. Each reader explicitly reuses the current SP-278 generic projector/root checkpoint and owns no new durable filtered cursor.
- **`memory.index.semantic.rebuild.completed`**: emitter `MemoryMaintenance.index_semantic_rebuild.completed.v1@1.0.0`; reader `reader.memory.index.semantic.rebuild.completed.history.v1@1.0.0`; unique payload definition `Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_index_semantic_rebuild_completed`; domain-separated SHA-256 event/idempotency recipe in SP-634. Search evidence is its own DMEM-search row. Each reader explicitly reuses the current SP-278 generic projector/root checkpoint and owns no new durable filtered cursor.
- **`memory.index.semantic.rebuild.started`**: emitter `MemoryMaintenance.index_semantic_rebuild.started.v1@1.0.0`; reader `reader.memory.index.semantic.rebuild.started.history.v1@1.0.0`; unique payload definition `Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_index_semantic_rebuild_started`; domain-separated SHA-256 event/idempotency recipe in SP-635. Search evidence is its own DMEM-search row. Each reader explicitly reuses the current SP-278 generic projector/root checkpoint and owns no new durable filtered cursor.
- **`memory.verification_sweep.completed`**: emitter `MemoryMaintenance.verification_sweep.completed.v1@1.0.0`; reader `reader.memory.verification_sweep.completed.history.v1@1.0.0`; unique payload definition `Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_verification_sweep_completed`; domain-separated SHA-256 event/idempotency recipe in SP-636. Search evidence is its own DMEM-search row. Each reader explicitly reuses the current SP-278 generic projector/root checkpoint and owns no new durable filtered cursor.
- **`memory.verification_sweep.started`**: emitter `MemoryMaintenance.verification_sweep.started.v1@1.0.0`; reader `reader.memory.verification_sweep.started.history.v1@1.0.0`; unique payload definition `Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_verification_sweep_started`; domain-separated SHA-256 event/idempotency recipe in SP-637. Search evidence is its own DMEM-search row. Each reader explicitly reuses the current SP-278 generic projector/root checkpoint and owns no new durable filtered cursor.

Four canonical operation-custody value rows are newly authored: `memory_dedup_sweep_operation`, `memory_index_lexical_rebuild_operation`, `memory_index_semantic_rebuild_operation`, `memory_verification_sweep_operation`. Their distinct closed schemas, reversible hex keys, command handler producers and recovery/history consumers are in the storage-value registry and operation schema. Their status is deferred_not_build_blocking; activation requires retention, native custody and reviewed event admission. This metadata is not an executable job or an admission.

## Premise checks

- **DL-045:** current exact scope table at Decision_Log line 604 and `step-09-binding-authority-scope.json` include every DMEM row. Current UCC-085 and AMS section 7.2 still require these operations. Bounded technical authoring applies; no extension to gist rows or policy.
- **DL-076:** current SP-278 still forbids persisted redb_snapshot_id. The exact current generic checkpoint/read-token is reused, with ephemeral reader output and no additional persisted token.
- **DL-270:** current AMS section 4.2 explicitly supersedes canonical vector-slot/tombstone placement; the semantic rebuild follows separate derived redb custody. SP-286/CV-339 now require barrier/full-flush custody and v2 full-value proof; no September-only durability assumption is copied.
- **AMS-054:** app memory is thread-private. Existing UCC maintenance payloads remain Project commands; this draft defines project_only EventRecord contracts and grants no app-thread event writer. App-event expansion remains unbound.
- **Failed older-premise reuse:** none applied. Historical single-file vector placement was explicitly rejected in favor of its current DL-270 amendment. No old retention decision assigns these maintenance families.

## Pending retention and questions for Jared

All eight event retention_policy_ref cells and all four new canonical operation-custody cells are PENDING_RETENTION_DECISION. Candidate classes are Case L-3 ordinary telemetry (90 days/2M Project) and audit authority (indefinite/no count eviction); exact names/kinds are not assigned by Case L-3, so RT must settle them. Existing generic index/checkpoint retain RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN respectively. No new retention policy object is created.

1. **Monthly summary:** which policy selects older low-activation Note gists, and must source gists remain, archive, or be deleted after consolidation? Preserve EvidenceRefs and pins; no answer is inferred. Both monthly rows remain held.
2. **Prune/archive:** which eligibility policy chooses archive versus deletion and governs source history/holds? Never delete pinned. Both prune rows remain held.
3. **Maintenance source deletion:** dedup merges are specified, but this draft grants no deletion method or source-survivor policy. Any policy-dependent mutation stays unavailable until that policy is settled.

## Shared-file hunks and IDs

- **Contracts_V0.md:** append CV-650–657, one closed payload contract per prepared family.
- **storage-plan.md:** append SP-630–637, one producer/identity/lifecycle/consumer/custody/replay/withdrawal contract per prepared family.
- **storage_value_registry.json:** append only the four operation-custody family rows; all pre-existing family objects are unchanged.
- **Automated_Testing_System.md:** append ATS-315, static and native oracle boundaries.
- **assistant-memory-subsystem.md:** append AMS-100–107, exact semantic/emitter contracts; existing prose is unchanged.

No other id prefix used. Reserved unused: AMS-108–129, SP-638–639, CV-658–659, ATS-316–319. Pre-authoring scan of all fetched origin refs found no assigned-block collisions; `id-scan.json` preserves refs and result.

## Checks

| Check | Exit | Result |
|---|---:|---|
| Targeted DMEM checker | 0 | 136 synthetic cases across 8 families; no registry admission |
| Storage-value registry JSON Schema | 0 | pass after adding required deferred-owner/reason/reopen fields |
| Shard generate, Python 3.12 | 0 | only edited owner/registry shard sets changed |
| Plan index generate, Python 3.12 | 0 | top-level pass |
| Shard check, Python 3.12 | 0 | pass |
| Plan index validate, Python 3.12 | 0 | parsed top-level pass; zero failures |
| git diff --check | 0 | pass |

The system python3 is 3.9.6: first shard generation exited 1 on unsupported Path.write_text(newline=...). Its own generated-file deletions were restored from HEAD before successful generation with the already installed uv Python 3.12 plus PyYAML/jsonschema. No tool code was changed for that failure. A preliminary storage-value schema check found 12 missing deferred metadata fields in the four new rows; fixed before source commit. No unresolved check failure is hidden.

Currentness edition: copied all 15 files from `/Volumes/Cursor/PuppetMaster/Plans/.audits/event-authority-2026-08-13-currentness` and SHA-256 matched before index generation.

## Evidence and handoff

Worktree remains `/Users/jaredsmacbookair/pm-worktrees/DMEM` for lead review/integration. No app was touched, no pm-mail, no subagent and no landing action. Branch pushed after source step and again after this report. Independent grading and review remain outstanding; no DEPTH_PASS or completion of Event Authority is claimed. Raw check outputs and a report copy are under `/Volumes/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/`.

- `/Volumes/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/currentness-sha256.txt` SHA-256 `76fa6f4657ab818ac61ef422c10a66ef11906f79a736374dc2e6e4da4d5acce9`
- `/Volumes/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/id-scan.json` SHA-256 `e44e0bdb59d0efbc28d70bc1952fd933dd328b3cbe9071909506e735338ffd20`
- `/Volumes/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/shard-generate.log` SHA-256 `fafb1c33a567c68de84f9f26c3cbd2828d5f49a400771374af7218463f00b5d2`
- `/Volumes/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/index-generate.json` SHA-256 `e59700642032fd156fcaed149269fa44feeb322d922674a527fba40a10b2cd14`
- `/Volumes/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/shard-check.log` SHA-256 `10cde07211161ba5007ce9acf94b977462852fb760eea82736b42c96996d0c85`
- `/Volumes/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/index-validate.json` SHA-256 `52f41a45e510bad6692421f1543e2d03a61393080d23690bfbd26d16fa4c12d9`
- `/Volumes/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/targeted-check.json` SHA-256 `3668d782fec95cce137fa15464e3a6dac9510f8760cd24df2467fb7bc584ff55`
- `/Volumes/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DMEM/storage-value-schema.json` SHA-256 `f561779247ccc8fe3c3ecf04fe09091f420eb0448f5b7798bc4aa359620c54bc`
