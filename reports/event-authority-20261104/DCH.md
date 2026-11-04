# DCH — Event Authority wave 2, 2026-11-04

Branch: `plans/ea-w2-chat-20261104`. Base: `be4766513f`. First pushed contract commit: `d6ea5d97c5`. Final contract edition and this report are committed together.

**Outcome:** 16 prepared without admission (retention assignment open for RT), one stopped for Jared, no exclusions. Membership remains ABSENT for every row. Native execution NOT_RUN; independent Sol/Astra review and integration are the lead’s work. No registry/admission/Decision Log/governance edits. `chat.response_stop_requested` and its held card remain untouched.

| Family | Outcome | Self-grade | Units (ACD / CV / SP) |
|---|---|---|---|
| `bundle.selection_forward_blocked` | Prepared without admission; retention open | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership | ACD-610 / CV-630 / SP-610 |
| `bundle.selection_sent_to_chat` | Prepared without admission; retention open | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership | ACD-611 / CV-631 / SP-611 |
| `chat.message` | Prepared without admission; retention open | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership | ACD-612 / CV-632 / SP-612 |
| `chat.thread_archived` | Stopped: Jared question | 3 CONFLICT / 9 ABSENT | None |
| `chat.thread_created` | Prepared without admission; retention open | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership | ACD-614 / CV-634 / SP-614 |
| `chat.thread_deleted` | Prepared without admission; retention open | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership | ACD-615 / CV-635 / SP-615 |
| `chat.thread_worktree_bound` | Prepared without admission; retention open | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership | ACD-616 / CV-636 / SP-616 |
| `chat.thread_worktree_create_failed` | Prepared without admission; retention open | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership | ACD-617 / CV-637 / SP-617 |
| `chat.thread_worktree_merge_failed` | Prepared without admission; retention open | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership | ACD-618 / CV-638 / SP-618 |
| `chat.thread_worktree_merged` | Prepared without admission; retention open | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership | ACD-619 / CV-639 / SP-619 |
| `chat.thread_worktree_pr_created` | Prepared without admission; retention open | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership | ACD-620 / CV-640 / SP-620 |
| `chat.thread_worktree_pr_failed` | Prepared without admission; retention open | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership | ACD-621 / CV-641 / SP-621 |
| `chat.thread_worktree_pre_merge_test_failed` | Prepared without admission; retention open | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership | ACD-622 / CV-642 / SP-622 |
| `chat.thread_worktree_pre_merge_test_passed` | Prepared without admission; retention open | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership | ACD-623 / CV-643 / SP-623 |
| `chat.thread_worktree_pre_merge_test_started` | Prepared without admission; retention open | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership | ACD-624 / CV-644 / SP-624 |
| `chat.thread_worktree_renamed` | Prepared without admission; retention open | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership | ACD-625 / CV-645 / SP-625 |
| `chat.thread_worktree_unbound` | Prepared without admission; retention open | 10 PASS / 1 PARTIAL retention / 1 ABSENT membership | ACD-626 / CV-646 / SP-626 |

## Recovery and checks

Initial VM capacity: 21 GB available RAM, 43 GB free disk. Read both task briefs in full. All 35 new DCH JSON files parse; all 32 schemas pass Draft 2020-12 schema validation, and the full storage registry validates against its schema. Every added owner section is complete. The interrupted run left later prose outside its earlier canonical_text: synchronized the new units, including the domain projector bindings and ATS-305. No existing owner passages were rewritten. Regenerated shards and indexes from owner sources, with all 15 ignored currentness-edition files copied and SHA-256 matched to the shared source. Only the five edited source documents’ shard folders changed.

| Check | Exit | Result |
|---|---:|---|
| pm_dch_events.py | 0 | 1,317 checks; 32 payload editions / records, 16 checkpoint positives and negatives |
| JSON parsing and storage registry schema | 0 | All pass |
| pm-shard-plans.py --generate / --check | 0 | Regenerated; body/path verification pass |
| pm-plan-index.py generate / validate | 0 | Top-level status pass; runtime certification remains blocked |
| pm-storage-profile-check.py | 1 | Same 41 errors as captured base; no new errors |
| pm-assistant-contract-check.py | 1 | Same errors array as captured base; gaps_found |
| Origin ID scan | 0 | Assigned blocks checked across every fetched origin ref; no collisions before first push |
| git diff --check | 0 | Pass |

The two broader failures are preserved, not repaired outside lane scope. No native runtime or governance pass is claimed. Final rerun outputs and command exit codes are in the external evidence directory.

## Newly authored bindings and searches

[DCH-binding-search.json](DCH-binding-search.json) records each of the 17 exact-family searches separately: live non-pipeline Plans markdown, schemas and registries, excluding ledgers/shards/hidden governance. Its per-family hits cite paths, lines and file hashes; its negative-evidence entry records missing versioned family consumers/projectors/checkpoints, full identity and withdrawal definitions. Rechecked every recovered hit against the base: no line mismatch. Generic SP-278/SP-286 exist and are reused; restore-point/compaction bindings do not authorize sibling reuse. Current owner behavior was read in the lifecycle/selection/W.2/W.7/W.8/W.9 sections, CV-366 and SP-278/286/338/349. The exact families are inside DL-045’s canonical 285-name table at Decision_Log.md:603; none relies on DL-046 or DL-090 expansion.

Each non-stopped row receives its **own newly authored owner contract**, not a sibling-derived contract. Exact identifiers are enumerated below; schemas, payload editions, producer and scope joins are enumerated per row in `Plans/dch_event_contracts.json`. Common recipe is separately written in each owner unit: RFC 8785 tuple `[exact event_type, "1.0.0", storage_instance_id, WorkflowScopeV2 scope, computer_id, thread_id, original operation_id]`; event ID `evt_dch_` plus SHA-256, idempotency key `dch:` plus the same digest. Original operation identity freezes before effect and survives retries; changed semantic digest conflicts. Each family adopts SP-286/CV-339 first receipt and SP-278/DL-076 nine-field durable token, reuses `projector.storage.event_record_index@1.0.0` with `event_record_index_checkpoint.v1:{storage_instance_id}`, and adds its own derived checkpoint below. Reader/version, CAS/shadow publication, global source-order rebuild, custody and withdrawal are newly authored technical bindings, never pre-existing evidence.

| Event | New reader | New domain projector | New checkpoint key / stored family |
|---|---|---|
| `bundle.selection_forward_blocked` | `reader.chat.bundle_selection_forward_blocked@1.0.0` | `projector.chat.bundle_selection_forward_blocked@1.0.0` | `projector.checkpoint.dch.bundle_selection_forward_blocked.v1:{storage_instance_id}:{scope_partition}` / `dch_bundle_selection_forward_blocked_checkpoint` |
| `bundle.selection_sent_to_chat` | `reader.chat.bundle_selection_sent_to_chat@1.0.0` | `projector.chat.bundle_selection_sent_to_chat@1.0.0` | `projector.checkpoint.dch.bundle_selection_sent_to_chat.v1:{storage_instance_id}:{scope_partition}` / `dch_bundle_selection_sent_to_chat_checkpoint` |
| `chat.message` | `reader.chat.chat_message@1.0.0` | `projector.chat.chat_message@1.0.0` | `projector.checkpoint.dch.chat_message.v1:{storage_instance_id}:{scope_partition}` / `dch_chat_message_checkpoint` |
| `chat.thread_created` | `reader.chat.chat_thread_created@1.0.0` | `projector.chat.chat_thread_created@1.0.0` | `projector.checkpoint.dch.chat_thread_created.v1:{storage_instance_id}:{scope_partition}` / `dch_chat_thread_created_checkpoint` |
| `chat.thread_deleted` | `reader.chat.chat_thread_deleted@1.0.0` | `projector.chat.chat_thread_deleted@1.0.0` | `projector.checkpoint.dch.chat_thread_deleted.v1:{storage_instance_id}:{scope_partition}` / `dch_chat_thread_deleted_checkpoint` |
| `chat.thread_worktree_bound` | `reader.chat.chat_thread_worktree_bound@1.0.0` | `projector.chat.chat_thread_worktree_bound@1.0.0` | `projector.checkpoint.dch.chat_thread_worktree_bound.v1:{storage_instance_id}:{scope_partition}` / `dch_chat_thread_worktree_bound_checkpoint` |
| `chat.thread_worktree_create_failed` | `reader.chat.chat_thread_worktree_create_failed@1.0.0` | `projector.chat.chat_thread_worktree_create_failed@1.0.0` | `projector.checkpoint.dch.chat_thread_worktree_create_failed.v1:{storage_instance_id}:{scope_partition}` / `dch_chat_thread_worktree_create_failed_checkpoint` |
| `chat.thread_worktree_merge_failed` | `reader.chat.chat_thread_worktree_merge_failed@1.0.0` | `projector.chat.chat_thread_worktree_merge_failed@1.0.0` | `projector.checkpoint.dch.chat_thread_worktree_merge_failed.v1:{storage_instance_id}:{scope_partition}` / `dch_chat_thread_worktree_merge_failed_checkpoint` |
| `chat.thread_worktree_merged` | `reader.chat.chat_thread_worktree_merged@1.0.0` | `projector.chat.chat_thread_worktree_merged@1.0.0` | `projector.checkpoint.dch.chat_thread_worktree_merged.v1:{storage_instance_id}:{scope_partition}` / `dch_chat_thread_worktree_merged_checkpoint` |
| `chat.thread_worktree_pr_created` | `reader.chat.chat_thread_worktree_pr_created@1.0.0` | `projector.chat.chat_thread_worktree_pr_created@1.0.0` | `projector.checkpoint.dch.chat_thread_worktree_pr_created.v1:{storage_instance_id}:{scope_partition}` / `dch_chat_thread_worktree_pr_created_checkpoint` |
| `chat.thread_worktree_pr_failed` | `reader.chat.chat_thread_worktree_pr_failed@1.0.0` | `projector.chat.chat_thread_worktree_pr_failed@1.0.0` | `projector.checkpoint.dch.chat_thread_worktree_pr_failed.v1:{storage_instance_id}:{scope_partition}` / `dch_chat_thread_worktree_pr_failed_checkpoint` |
| `chat.thread_worktree_pre_merge_test_failed` | `reader.chat.chat_thread_worktree_pre_merge_test_failed@1.0.0` | `projector.chat.chat_thread_worktree_pre_merge_test_failed@1.0.0` | `projector.checkpoint.dch.chat_thread_worktree_pre_merge_test_failed.v1:{storage_instance_id}:{scope_partition}` / `dch_chat_thread_worktree_pre_merge_test_failed_checkpoint` |
| `chat.thread_worktree_pre_merge_test_passed` | `reader.chat.chat_thread_worktree_pre_merge_test_passed@1.0.0` | `projector.chat.chat_thread_worktree_pre_merge_test_passed@1.0.0` | `projector.checkpoint.dch.chat_thread_worktree_pre_merge_test_passed.v1:{storage_instance_id}:{scope_partition}` / `dch_chat_thread_worktree_pre_merge_test_passed_checkpoint` |
| `chat.thread_worktree_pre_merge_test_started` | `reader.chat.chat_thread_worktree_pre_merge_test_started@1.0.0` | `projector.chat.chat_thread_worktree_pre_merge_test_started@1.0.0` | `projector.checkpoint.dch.chat_thread_worktree_pre_merge_test_started.v1:{storage_instance_id}:{scope_partition}` / `dch_chat_thread_worktree_pre_merge_test_started_checkpoint` |
| `chat.thread_worktree_renamed` | `reader.chat.chat_thread_worktree_renamed@1.0.0` | `projector.chat.chat_thread_worktree_renamed@1.0.0` | `projector.checkpoint.dch.chat_thread_worktree_renamed.v1:{storage_instance_id}:{scope_partition}` / `dch_chat_thread_worktree_renamed_checkpoint` |
| `chat.thread_worktree_unbound` | `reader.chat.chat_thread_worktree_unbound@1.0.0` | `projector.chat.chat_thread_worktree_unbound@1.0.0` | `projector.checkpoint.dch.chat_thread_worktree_unbound.v1:{storage_instance_id}:{scope_partition}` / `dch_chat_thread_worktree_unbound_checkpoint` |

Each checkpoint has its own closed schema in `Plans/dch_event_payloads/`, registered storage value, profile and RP-PROJECTION-3GEN assignment. No source family is admitted. Each new Project/application payload edition is closed, with distinct schema IDs; operation IDs, ref-only message bodies and current access/deletion checks do not extend existing features.

## Premise checks and open questions

- **DL-045:** Decision_Log.md:560–573 authorizes bounded missing technical bindings for already specified behavior only; the current exact-name scope still lists these families. The current chat lifecycle, worktree operations and selection handoff still exist. This authority applies to the technical draft, not retention choices or admission.
- **DL-076:** current SP-278 still requires the durable nine-field token without persisted redb_snapshot_id. Each checkpoint adopts that definition by name; negative cases reject a persisted snapshot ID. No historical token assumption is carried over.
- **Projection retention:** the existing RP-PROJECTION-3GEN policy and current SP-340 budget still support the disposable per-family checkpoints (three generations, 604800-second retired generation window, hold/live-ref protection). No new retention policy is invented.
- **Chat retention:** Storage Case L-3 (Chat content row, line 17412 at base) already specifies thread lifetime and 250,000/thread linked-successor rollover. SP-612 explicitly binds chat.message to that class. Its structured policy object remains pending RT. Other source events retain explicit PENDING_RETENTION_DECISION with candidate Chat content versus audit-authority classes and their Case L-3 citations; RT resolves exact assignments. No source expiry is authorized by the draft.
- **Failed current-premise reconciliation / Jared question:** Does the lifecycle table’s permission for retention-policy automatic archive still apply to Project chats, or does ACD-508’s “Archive keeps the folder and is never automatic” prohibit automatic archive for every chat? The conflicting current passages are assistant-chat-design.md:1122–1123 and the ACD-508 paragraph. Whole chat.thread_archived family stopped. No invented answer or archive-specific schema/unit.
- **Deletion:** the existing lifecycle text, including DL-270 amendment, still requires immediate hiding, 24-hour unheld content purge, indefinite content-free tombstone and at-most-30-day backup retention unless held. ACD-615 repeats those existing semantics; its event assignment does not turn every deletion payload into an indefinite tombstone.

## Shared hunks and IDs

All shared-file owner changes are appended PlanUnits: Contracts_V0 CV-630–632 and CV-634–646; storage-plan SP-610–612 and SP-614–626; Automated_Testing_System ATS-305. assistant-chat-design appends ACD-610–612 and ACD-614–626. storage_value_registry appends exactly 16 dch_*_checkpoint families and their profiles; no existing rows, policy objects, critical-family lists or event-family registry membership changed. The source chat.message retention clarification is confined to SP-612 and its companion row.

**IDs used:** ACD-610–612, ACD-614–626; CV-630–632, CV-634–646; SP-610–612, SP-614–626; ATS-305. The archived-family slots ACD-613/CV-633/SP-613 are unused. No other IDs minted. Origin scan excludes no remote branches.

## Evidence

External bundle: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/`. The report, self-grade and binding search are copied there. SHA-256 pins for evidence already captured during recovery:

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/binding-search.json` — SHA-256 `7847763f15c2a196245c1a9b9e9394656fd7fe79db06d9af99852722c1bec602`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/binding-search-verification.json` — SHA-256 `7b3834f2142cd465f227499b1e1d173b9a3b19e7a70e02dd73a0b6207eafe4f3`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/currentness-resume-sha256.txt` — SHA-256 `ca78c6c3db2fc74b0d3e2c208ee7b6394aad0f09a55eafb9838fea3ce9981ca5`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/id-scan-resume.json` — SHA-256 `ff8730e74a307289cd19a961112c86dce6da19b57c776ed1bce901124ae54768`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/json-parse-resume.json` — SHA-256 `b1c20cebe6f16d20b4abeca116a194be2c448e566925537d356b15c2b83452a9`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/static-check-resume.log` — SHA-256 `ec301653a9610b8090d1f84b84b348cf157ccaf4800727b3167b6e1e707a040e`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/storage-profile-resume.log` — SHA-256 `fc5885fa872722fec087a51bbfe1f79e9a91803254bd03e69d3eb464a3cee17f`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/storage-profile-base.json` — SHA-256 `89d47858adcab797033a9feca549351641cfb6a2f6ee5da75a2c62082b3d450b`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/assistant-check-resume.log` — SHA-256 `aa3dc19a5d8a9c8a1c4809309f45fea3bd00579fa49e9ac5f0fc3ca46823658c`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/assistant-base.json` — SHA-256 `51430f696784138de1e9a24d0419471a75d97112f87d8620ca17faefde89f505`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/index-validate-resume.json` — SHA-256 `9aa42f497585e3884eba8c14123c12e2edfb4d3aaee523fa867dbc659f4cce79`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/shard-check-resume.log` — SHA-256 `8608385cf79177a3cea843bb0334c1f228f82142115199d7947618612d8acd89`

Final rerun evidence (source retention clarification included):

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/shard-generate-final.log` — SHA-256 `21fade79fb8dcc12af318bb85e3c023f60da5b288b0d36b7925e2fa06600a63b`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/index-generate-final.log` — SHA-256 `30591bc38a04858aeee745842aa8a23565c5d896a35f38f9aa04bc0d95d72ecf`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/static-final.log` — SHA-256 `ec301653a9610b8090d1f84b84b348cf157ccaf4800727b3167b6e1e707a040e`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/shard-check-final.log` — SHA-256 `8608385cf79177a3cea843bb0334c1f228f82142115199d7947618612d8acd89`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/storage-profile-final.log` — SHA-256 `fc5885fa872722fec087a51bbfe1f79e9a91803254bd03e69d3eb464a3cee17f`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/final-exit-codes.json` — SHA-256 `6e61700fcb69a92150a550943ca9ee6cb14566dda74c3cf61af8430efe2f866b`
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/index-validate-final.json` — SHA-256 `7e26818709e754b36c1957070b0765ab008ecc1d1ee00fbb2faabe6d2c2bd1fc`; exit 0, top-level status pass.
