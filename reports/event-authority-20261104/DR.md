# DR — Runtime artifact Event Authority drafts

Branch: `plans/ea-w2-runtime-artifacts-20261104`. Base: `be4766513ff71776346fc73b84f2542990f955af`. Worktree: `/home/sittingmongoose/pm-worktrees/DR`. Final head is the commit containing this report and self-grade (recorded in the evidence copy's `HEAD.txt` after push).

18 individual Project-edition contracts are prepared without admission. One family is stopped as a question for Jared. No exclusions, registry append, admission record, decision entry, new storage-value registration, governance reseal, landing lock or main push. Native execution is NOT_RUN. These self-grades are drafting-worker judgments, not independent approval or runtime certification.

## Per-row outcomes and self-grades

Every prepared row has its own producer/ordering, closed payload dispatch, identity/joins, replay, retention/custody, transition, passive reader/checkpoint adoption, compatibility/withdrawal and oracle contract. The 18 rows each self-grade 11 PASS plus membership_version ABSENT. No row claims all twelve PASS or admission readiness. Restore-point's two PASS cells are its existing closed schema and retention; its lifecycle/identity transition is CONFLICT, with remaining cells partial or absent.

| Exact family | Outcome | Owner / Storage / Contracts | Self-grade |
|---|---|---|---|
| `runtime_artifact.api_web_call` | register (prepared) | RAP-100 / SP-520 / CV-520 | 11 PASS, membership ABSENT |
| `runtime_artifact.artifact_version` | register (prepared) | RAP-101 / SP-521 / CV-521 | 11 PASS, membership ABSENT |
| `runtime_artifact.before_after_snapshot` | register (prepared) | RAP-102 / SP-522 / CV-522 | 11 PASS, membership ABSENT |
| `runtime_artifact.browser_recording` | register (prepared) | RAP-103 / SP-523 / CV-523 | 11 PASS, membership ABSENT |
| `runtime_artifact.code_diff` | register (prepared) | RAP-104 / SP-524 / CV-524 | 11 PASS, membership ABSENT |
| `runtime_artifact.context_snapshot` | register (prepared) | RAP-105 / SP-525 / CV-525 | 11 PASS, membership ABSENT |
| `runtime_artifact.cost_usage` | register (prepared) | RAP-106 / SP-526 / CV-526 | 11 PASS, membership ABSENT |
| `runtime_artifact.document` | register (prepared) | RAP-107 / SP-527 / CV-527 | 11 PASS, membership ABSENT |
| `runtime_artifact.evidence` | register (prepared) | RAP-108 / SP-528 / CV-528 | 11 PASS, membership ABSENT |
| `runtime_artifact.failed_attempts` | register (prepared) | RAP-109 / SP-529 / CV-529 | 11 PASS, membership ABSENT |
| `runtime_artifact.hitl_approval` | register (prepared) | RAP-110 / SP-530 / CV-530 | 11 PASS, membership ABSENT |
| `runtime_artifact.implementation_plan` | register (prepared) | RAP-111 / SP-531 / CV-531 | 11 PASS, membership ABSENT |
| `runtime_artifact.reasoning_summary` | register (prepared) | RAP-112 / SP-532 / CV-532 | 11 PASS, membership ABSENT |
| `runtime_artifact.restore_point` | blocked on Jared | RAP-113 | 2 PASS; transition CONFLICT; 7 PARTIAL; 2 ABSENT |
| `runtime_artifact.screenshot` | register (prepared) | RAP-114 / SP-534 / CV-534 | 11 PASS, membership ABSENT |
| `runtime_artifact.subagent_lineage` | register (prepared) | RAP-115 / SP-535 / CV-535 | 11 PASS, membership ABSENT |
| `runtime_artifact.suggested_next_steps` | register (prepared) | RAP-116 / SP-536 / CV-536 | 11 PASS, membership ABSENT |
| `runtime_artifact.tool_llm_trace` | register (prepared) | RAP-117 / SP-537 / CV-537 | 11 PASS, membership ABSENT |
| `runtime_artifact.validation_test` | register (prepared) | RAP-118 / SP-538 / CV-538 | 11 PASS, membership ABSENT |

## Newly authored bindings and search evidence

These are newly authored owner contracts under DL-045, for behavior already specified in the Option 2 table. Each family was searched independently across current top-level `Plans/*.md` and `Plans/*.json`, excluding ledgers, generated shards, historical audits and reports. Existing semantic producer labels, per-type closed schemas, generic index/checkpoint and first-receipt custody were found. Exact versioned publish-handler and passive event-history-reader identifiers were not found. The unversioned artifact projector/checkpoint inventory exists but is deferred; it is not reused as a completed filtered projector. No binding is inferred from a sibling.

Search evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/canon-search.json`, SHA-256 `94c22a7cf45511240628db8dbe4cfe94e8da51b545eba8d8dae04b333d999bac`. Each family has its own hit list and negative result. The full 475-origin-ref scan found no assigned-block collision before minting.

| Family | New publish handler | New passive operating consumer |
|---|---|---|
| `runtime_artifact.api_web_call` | `owner.runtime_artifacts.api_web_call.publish@1.0.0` | `reader.runtime_artifacts.api_web_call.history@1.0.0` |
| `runtime_artifact.artifact_version` | `owner.runtime_artifacts.artifact_version.publish@1.0.0` | `reader.runtime_artifacts.artifact_version.history@1.0.0` |
| `runtime_artifact.before_after_snapshot` | `owner.runtime_artifacts.before_after_snapshot.publish@1.0.0` | `reader.runtime_artifacts.before_after_snapshot.history@1.0.0` |
| `runtime_artifact.browser_recording` | `owner.runtime_artifacts.browser_recording.publish@1.0.0` | `reader.runtime_artifacts.browser_recording.history@1.0.0` |
| `runtime_artifact.code_diff` | `owner.runtime_artifacts.code_diff.publish@1.0.0` | `reader.runtime_artifacts.code_diff.history@1.0.0` |
| `runtime_artifact.context_snapshot` | `owner.runtime_artifacts.context_snapshot.publish@1.0.0` | `reader.runtime_artifacts.context_snapshot.history@1.0.0` |
| `runtime_artifact.cost_usage` | `owner.runtime_artifacts.cost_usage.publish@1.0.0` | `reader.runtime_artifacts.cost_usage.history@1.0.0` |
| `runtime_artifact.document` | `owner.runtime_artifacts.document.publish@1.0.0` | `reader.runtime_artifacts.document.history@1.0.0` |
| `runtime_artifact.evidence` | `owner.runtime_artifacts.evidence.publish@1.0.0` | `reader.runtime_artifacts.evidence.history@1.0.0` |
| `runtime_artifact.failed_attempts` | `owner.runtime_artifacts.failed_attempts.publish@1.0.0` | `reader.runtime_artifacts.failed_attempts.history@1.0.0` |
| `runtime_artifact.hitl_approval` | `owner.runtime_artifacts.hitl_approval.publish@1.0.0` | `reader.runtime_artifacts.hitl_approval.history@1.0.0` |
| `runtime_artifact.implementation_plan` | `owner.runtime_artifacts.implementation_plan.publish@1.0.0` | `reader.runtime_artifacts.implementation_plan.history@1.0.0` |
| `runtime_artifact.reasoning_summary` | `owner.runtime_artifacts.reasoning_summary.publish@1.0.0` | `reader.runtime_artifacts.reasoning_summary.history@1.0.0` |
| `runtime_artifact.screenshot` | `owner.runtime_artifacts.screenshot.publish@1.0.0` | `reader.runtime_artifacts.screenshot.history@1.0.0` |
| `runtime_artifact.subagent_lineage` | `owner.runtime_artifacts.subagent_lineage.publish@1.0.0` | `reader.runtime_artifacts.subagent_lineage.history@1.0.0` |
| `runtime_artifact.suggested_next_steps` | `owner.runtime_artifacts.suggested_next_steps.publish@1.0.0` | `reader.runtime_artifacts.suggested_next_steps.history@1.0.0` |
| `runtime_artifact.tool_llm_trace` | `owner.runtime_artifacts.tool_llm_trace.publish@1.0.0` | `reader.runtime_artifacts.tool_llm_trace.history@1.0.0` |
| `runtime_artifact.validation_test` | `owner.runtime_artifacts.validation_test.publish@1.0.0` | `reader.runtime_artifacts.validation_test.history@1.0.0` |

Each prepared family separately authors the `ra1:` identity recipe: SHA-256 over the exact four-member owner-recommended tuple, each UTF-8 member prefixed by its uint32 big-endian byte length. Same identity with different semantic payload conflicts; same identity/value returns the original event/receipt. No new checkpoint identifier or physical family is authored. Each stateless history reader explicitly adopts SP-278's installed `projector.storage.event_record_index@1.0.0`, `reader.storage.event_record_index@1.0.0`, key `event_record_index_checkpoint.v1:{storage_instance_id}`, its closed existing value schema, actual generation/table selection, current source authentication and atomic CAS. It persists no read token or filtered cursor. The ten-field live token is distinct from DL-076's nine-field durable token; `redb_snapshot_id` is never persisted by a DR reader.

The existing artifact-panel projection and its deferred physical group remain independently deferred. These drafts do not claim that the generic full-index checkpoint authenticates a panel projection, enable the panel projector, or add a new user-facing integration. They define passive event-history inspection for the already specified evidence viewers. Event history and source/body custody remain separate.

## Premise checks and retention

DL-045's exact technical scope still lists these 19 names in its Runtime Artifacts row. The current Option 2 table still has the same 19 names, material-depth schemas and original producer/consumer intents. New names above are bounded technical definitions; no new feature or decision is inferred.

DL-075 (Decision Log, heading “Runtime-artifact event histories are kept indefinitely”) explicitly names all 19 families and approves RP-AUTHORITY-INDEFINITE once full contracts are admitted. Current Runtime Artifacts owner authority text and Storage Case L-3 still repeat this exact assignment and its embedded-text cost. The premise remains true. Each contract preserves embedded text indefinitely and rechecks linked-body authorization/deletion/revocation without resurrection. Body policies, receipts, restore-point records and Usage remain with their existing owners. RAP's DL-270 amendment for cost_usage and SP-341/UF-108 keep detailed Usage policy and daily totals distinct; no retention decision is extended from Usage to event history.

**Retention cells left PENDING: none.** Event histories use the exact DL-075 assignment. Reused generic index/checkpoint storage retains its already assigned RP-PROJECTION-3GEN under SP-278. Artifact payload `retention_class` is not an event retention assignment. No new deletion exception, preservation hold or retention class is selected. No failed retention premise check.

Project root payload editions remain Project-only. The separately defined app source/key graphs in CV-366 and SP-349/351/352 are preserved, not silently inserted into Project payload schemas or event partitions. No empty/focused Project fallback is allowed.

## Question for Jared

`runtime_artifact.restore_point` stays stopped (RAP-113). The exact owner Option 2 transition allows a record to become durable **or change recorded availability/lifecycle**, but recommends identity `[event_type, project_id, artifact_id, schema_id]`. Its v1 payload includes mutable status, source_state, availability, retention, holds and actions. With one stable artifact_id, a second lifecycle value conflicts with the first; allocating distinct artifact_ids can change the artifacts/version rows a user sees. RAP's primary restore-point identity and existing restore-created/deleted/expired readers remain unchanged.

Should these lifecycle observations appear as distinct immutable artifacts (distinct artifact_id), or as revisions of the same artifact with an explicitly revised event identity? No answer, schema change, identity choice or producer/reader binding for this family is authored. The canonical restore-point readers/actions retain their own independent source and eligibility contracts.

## Shared-file hunks and ids

All owner changes are appended in a new “Runtime artifact event contracts prepared without admission — 2026-11-04” section; no existing table row or prose is reordered/reflowed.

- `Plans/storage-plan.md`: SP-520..532 and SP-534..538, one exact family adoption per unit. No SP-533.
- `Plans/Contracts_V0.md`: CV-520..532 and CV-534..538, one exact payload/envelope dispatch per unit. No CV-533.
- `Plans/Automated_Testing_System.md`: ATS-260, the exact-family oracle matrix and separately required native cases.
- `Plans/Runtime_Artifacts_Panel.md`: RAP-100..118 (RAP-113 is the stopped question).
- `Plans/storage_value_registry.json`: no hunk; no new stored values are introduced. Generic checkpoint/index and first-receipt families are reused explicitly.

Ids used: **56** (19 RAP + 18 SP + 18 CV + ATS-260). Remaining assigned ids are unused. No additional-prefix id was minted. Derived changes are generated shards for these four owners and the standard global PlanUnit index outputs only; no unrelated owner's shard body changed.

## Validation and handoff

`DR.self-grade.json` contains all 19 rows and 228 exact current-owner evidence quotes, mechanically checked against line ranges. `Plans/runtime_artifact_event_drafts.json` is draft routing, not an admission record. Positive payloads and negative/static source-join oracles live in `Plans/runtime_artifact_event_drafts.fixtures.json` and `scripts/pm-runtime-artifact-event-drafts.py`. Existing payload fixtures are reused by exact type, without changing their schemas. The checker asserts schema closure, missing identity, wrong type, scope/family mismatch, changed semantic payload, original retry result, withdrawal, corrupt source/receipt, revoked access and deleted-body metadata-only behavior. Native crash/authentication/CAS/recovery/backup/UI execution remains NOT_RUN.

Check outputs and exact exit codes are copied to the external evidence directory. The initial validation overlapped regeneration and was superseded by the final sequential check. No frozen validator was edited. No tests file or .gitignore was edited. A currentness edition copy was checked with matching `sha256sum` for all 15 files before index generation. Independent Sol/Astra review and later one-family admission remain with the lead. The pushed worktree is left for integration.

Per-family source searches, the origin-ref allocation inventory and matching currentness SHA-256 list are preserved in the cited evidence directory. The separate app source graphs are not proposed registry members in this draft.

Final checks (all exit 0): shard generation, PlanUnit index generation, shard check, PlanUnit index validate (**top-level status pass**), existing runtime-artifact schema validator, DR static checker (**324 cases pass**), and `git diff --check`. `DR.checks.json` records exact commands, external output paths and SHA-256 hashes.

Evidence `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/id-allocation.json`: SHA-256 `6321437a5ee7c311ec59f31b2850e3a3d4afbfeef0cc03f54ca6e0ccbffab078`.

Evidence `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/currentness-sha256sum.txt`: SHA-256 `76fa6f4657ab818ac61ef422c10a66ef11906f79a736374dc2e6e4da4d5acce9`.
