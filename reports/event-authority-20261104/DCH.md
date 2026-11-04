# DCH — Event Authority wave 2, review round 1

Branch: `plans/ea-w2-chat-20261104`. Reviewed head: `2cc5f4246638ee4367d6ab14f3f6fceadc36ac6e`. Fix contract commit: `2444634dc45b1df0c9d80c7f8d8ee3ccaadd11bc`. This report and its self-grade follow in a report-only commit.

**Outcome:** seventeen families prepared without admission; no archive product stop and no exclusions. Every family has ten PASS cells, PARTIAL retention and ABSENT membership. This is the worker's post-fix assessment; independent re-review is pending. Native execution remains NOT_RUN. No admission, event registry append, Decision Log entry, governance seal or `main` push occurred. The held `chat.response_stop_requested` record/card is untouched.

## Review round 1: findings and responses

- **F1 — fixed (`2444634dc45b1df0c9d80c7f8d8ee3ccaadd11bc`).** Each of the sixteen affected ACD/CV pairs explicitly selects the existing CV-366 application key: `application@1:` plus lowercase hex of exact UTF-8 `scope.server_id`, colon, and lowercase hex of the original `operation_id`. `owner_operation_id` is this original source operation, frozen before effect; no additional optional effect component is defined. Original Server/Computer/thread/source joins remain mandatory. The separate Project `dch:` key and Storage lifetime tuple remain explicit. Representative owner: `Plans/Contracts_V0.md:24474` (CV-630); the self-grade cites each family's own units. All seventeen application records now conform, including the new archive record. Same-operation/same-semantics returns original evidence, changed semantics conflicts, and unavailable dedupe refuses. Verify with `python3 scripts/pm_dch_events.py`; deliberately restoring every old application key makes the full checker fail.
- **F2 — fixed (`2444634dc45b1df0c9d80c7f8d8ee3ccaadd11bc`).** All Project positives and EventRecord payloads now bind `p1` to `project~cDE`. Dependent event IDs and Project keys were recomputed. `scripts/pm_dch_events.py:21` checks both strict decode equality to exact UTF-8 Project identity and canonical unpadded encode equality, independently of JSON Schema and envelope matching. Every Project edition includes valid and mismatched punctuation/Unicode cases, composed/decomposed distinctions, raw-ID, padding, invalid UTF-8 and noncanonical pad-bit negatives. Even a wrong partition with a recomputed matching event ID/key/envelope is rejected. Verify with the full checker; restoring `project~p1` makes it fail.
- **F3 — fixed (`2444634dc45b1df0c9d80c7f8d8ee3ccaadd11bc`).** Verified the current accepted text directly: DL-287 says “No chat auto-archives” (`Plans/Decision_Log.md:20343`); DL-280 gives approved recommendations and later rulings precedence (`Plans/Decision_Log.md:19967`). ACD-071 applies shared lifecycle scope (`Plans/assistant-chat-design.md:7024`) and ACD-508 says archive is never automatic (`Plans/assistant-chat-design.md:28766`). There is no Project exception. The two stale lifecycle trigger rows (`Plans/assistant-chat-design.md:1122`, `:1123`) now allow manual archive only. New ACD-613 at `Plans/assistant-chat-design.md:30157`, CV-633 at `Plans/Contracts_V0.md:25607`, and SP-613 at `Plans/storage-plan.md:31666` prepare this exact family with closed Project/application payloads, original-source joins, receipt ordering, concrete reader/projector/checkpoint, recovery/withdrawal and positive/negative oracles. The existing cataloged `cmd.chat.archive` action (`Plans/UI_Command_Catalog.md:730`) reaches the lifecycle owner interface `cmd.chat.thread.archive`; no new command is registered. Existing selected-thread/no-active-run guards, active/suspended predecessor, revision CAS/readback, stable lineage/folder/worktree, and current-state/tombstone fences remain. Retention assignment stays explicitly pending RT. Verify with the full checker and archive source/transition cases. No Jared question remains on automatic archive.

No findings are disputed or stopped for Jared. No notes require an integration change outside this lane.

## Per-family grades before and after

Before is the independent Sol review at the reviewed head, which supersedes the original overclaimed self-grade. P=PASS, Pa=PARTIAL, C=CONFLICT, A=ABSENT. After is the worker self-grade of the fix commit. No row is a twelve-cell complete/admitted family while membership and retention remain open.

| Family | Before (review) | After (self) | Units ACD / CV / SP |
|---|---|---|---|
| `bundle.selection_forward_blocked` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-610 / CV-630 / SP-610 |
| `bundle.selection_sent_to_chat` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-611 / CV-631 / SP-611 |
| `chat.message` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-612 / CV-632 / SP-612 |
| `chat.thread_archived` | 3 Pa / 9 A | 10 P / 1 Pa retention / 1 A membership | ACD-613 / CV-633 / SP-613 |
| `chat.thread_created` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-614 / CV-634 / SP-614 |
| `chat.thread_deleted` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-615 / CV-635 / SP-615 |
| `chat.thread_worktree_bound` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-616 / CV-636 / SP-616 |
| `chat.thread_worktree_create_failed` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-617 / CV-637 / SP-617 |
| `chat.thread_worktree_merge_failed` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-618 / CV-638 / SP-618 |
| `chat.thread_worktree_merged` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-619 / CV-639 / SP-619 |
| `chat.thread_worktree_pr_created` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-620 / CV-640 / SP-620 |
| `chat.thread_worktree_pr_failed` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-621 / CV-641 / SP-621 |
| `chat.thread_worktree_pre_merge_test_failed` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-622 / CV-642 / SP-622 |
| `chat.thread_worktree_pre_merge_test_passed` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-623 / CV-643 / SP-623 |
| `chat.thread_worktree_pre_merge_test_started` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-624 / CV-644 / SP-624 |
| `chat.thread_worktree_renamed` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-625 / CV-645 / SP-625 |
| `chat.thread_worktree_unbound` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-626 / CV-646 / SP-626 |

## Binding searches and premise checks

`DCH-binding-search.json` retains the initial per-family lineage and adds a fresh `review_round_1` search for every exact family against the immutable reviewed head: 928 live owner/schema/registry files, excluding hidden/generated/bootstrap/ledger material. Each row records exact hits, paths, lines, file hashes, existing CV-365/366 adoption and explicit negative evidence. For the sixteen already drafted rows, original event_id, producer, readers, domain projector/checkpoint and withdrawal bindings are retained; the incompatible application key is removed. No sibling is evidence for another family's binding.

Archive's own search found existing lifecycle/name mentions and generic SP-278/SP-286, but no complete archive payload/reader/domain projector/checkpoint/withdrawal binding. Its new owner contract explicitly authors `reader.chat.chat_thread_archived@1.0.0`, `projector.chat.chat_thread_archived@1.0.0`, `projector.checkpoint.dch.chat_thread_archived.v1:{storage_instance_id}:{scope_partition}`, stored family `dch_chat_thread_archived_checkpoint`, and schema `Plans/dch_event_payloads/dch_chat_thread_archived_checkpoint.schema.json` (`pm.storage_value.dch_chat_thread_archived_checkpoint.v1`, 1.0.0). Its closed payload editions are `pm.dch_event.chat_thread_archived.project.v1` and `pm.dch_event.chat_thread_archived.application.v1` in `Plans/dch_event_payloads/chat_thread_archived.schema.json`. These are newly authored technical bindings under DL-045, for manual behavior already decided. SP-613 separately adopts the existing generic `projector.storage.event_record_index@1.0.0`, `event_record_index_checkpoint.v1:{storage_instance_id}` and nine-field SP-278/DL-076 token; no persisted redb_snapshot_id. The derived value has a registered profile and existing RP-PROJECTION-3GEN policy, source-order/CAS/shadow publication, coherent rebuild and withdrawal fencing.

- **DL-045:** the current exact 285-family table still includes all seventeen names (`Plans/Decision_Log.md:603`); the bounded technical-authoring scope and reuse-first requirement remain (`:564–566`). No feature or retention choice is made.
- **CV-365/366:** the current scope/key owner clauses at `Plans/Contracts_V0.md:24018` and `:24099` still apply. The old DCH replacement key and invalid positive partitions failed this premise check and are corrected.
- **DL-280/287 and ACD-071/508:** the former archive product question was based on obsolete trigger wording. Direct inspection establishes manual-only archive for Project and application chats; no conflicting accepted owner choice remains.
- **DL-076:** current SP-278 still requires the durable nine-field token; archive adopts it explicitly and its checkpoint negatives reject redb_snapshot_id.
- **Retention:** all source policy objects stay PENDING_RETENTION_DECISION for RT; chat.message retains its existing Case L-3 Chat content class binding (thread lifetime, 250,000/thread linked successor). All seventeen derived checkpoints adopt existing RP-PROJECTION-3GEN and its three-generation/604800-second eligible-retired bound with current/staged/hold/live-ref protection. Archive authorizes no expiry or deletion. Existing deletion semantics and the held Stop card remain unchanged.

## Scope, IDs and checks

Initial capacity: 17 GB available RAM and 125 GB free disk, above the 6 GB/50 GB hard limits. Used detached sparse `~/pm-worktrees/DCH-fix1` from the local clone at the named branch head. Fifteen ignored currentness-edition files were copied from the shared source and SHA-256 matched before index generation. No pm-mail, subagent, admission, frozen-validator edit or governance operation occurred.

Shared changes: existing lane ACD-610–612/614–626 and CV-630–632/634–646 identity prose and matching canonical_text; two old ACD lifecycle table cells; new ACD-613/CV-633/SP-613 appended units; ATS-305 oracle coverage; exactly one appended storage checkpoint row and one profile. Existing Storage units and registry rows/profiles are preserved. The only regenerated shard owners are assistant-chat-design, contracts_v0, storage-plan, automated_testing_system and storage_value_registry. Schema, fixture, checker and report companions remain inside lane scope; no test file was edited.

**New IDs this round:** ACD-613, CV-633, SP-613. Scanned 500 fetched origin refs / 145 distinct owner blobs; no collision. **Total lane IDs:** ACD-610–626, CV-630–646, SP-610–626 and ATS-305. No other IDs minted.

| Command/check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_dch_events.py` | 0 | 2,209 checks, 34 payload editions/records and 17 checkpoint suites |
| Full checker with original defects deliberately restored in memory | 1 / 1 expected | Rejects old application keys and invalid Project partitions; repository inputs unchanged |
| JSON/Schema/owner integrity | 0 | 34 schemas, full storage registry schema, 51 exact prose/canonical_text pairs |
| Per-family self-grade citation check | 0 | 204 cells and all disposition/cell citations match current bytes |
| `pm-shard-plans.py --generate` / `--check` | 0 / 0 | 99 sources, 3,135 shards verified; only five edited source owners changed |
| `pm-plan-index.py generate` / `validate` | 0 / 0 | Both top-level status=pass; runtime certification remains blocked |
| `pm-storage-profile-check.py` | 1 | Identical 41 baseline errors; no new error |
| `pm-assistant-contract-check.py` | 1 | Same gaps_found baseline; errors and projects_refresh_static_failures remain empty |
| Origin ID / source-scope audits | 0 / 0 | No collisions, protected artifacts/Stop preserved |
| `git diff --check` | 0 | Pass |

No aggregate governance/native pass or admission is claimed. RT assignment, independent review and later integration/admission remain with the lead. The required fix worktree is removed after all pushes.

## Evidence

Evidence directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/fix-round1/`. Paths below are relative to that directory; each pin is SHA-256. The report, self-grade and updated binding search are also copied to the parent DCH draft directory.

| Evidence | SHA-256 |
|---|---|
| `dch-static.json` | `eb09b0ffab853d8441c47b835554cb9117276b8089cb31f544f9b8e20fe17461` |
| `original-defect-regressions.json` | `edf0c7e006d8e5a30a0e8f03529a964db8cd46d27a81a48186a4e84233712535` |
| `integrity-results.json` | `3636a55d86390b96c4c3ebbe001fc5a3a10f87e355c1af8852e66fad6ef102f4` |
| `grade-citation-check.json` | `d2ef5487a20d0c0a0e35ed66f51080c910de0d6281d42a17fea16246458c61d2` |
| `scope-audit.json` | `7fd561fef7c55acc124c60ad66285791c3019a428bb3da9c60e1e65119e4ed9a` |
| `derived-scope.json` | `6525af00f82b120f628ed1a4371776249b097f80ec432a72a2117f1acf206ec9` |
| `id-scan.json` | `9a8720683be4aad9e54c4a195bbdc3e63acfebf849d659cbaf530d766aaa4b61` |
| `currentness-sha256.json` | `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c` |
| `base-comparison.json` | `4caefa8dea08a4ecb19844f5d0ba5d463fea0668a68b9ced4394e371d9538abd` |
| `shard-generate.log` | `a860c43269caab92d401c4ed0955268da735a36aee6a0f1d26608e7f426ade81` |
| `shard-check.log` | `6749d1671ce42bb36b5a4b623875e0db779efaf197186095421986d7d5490039` |
| `index-generate.log` | `d031f5b1bfa46765866e3b51502a4cd804716695bf3fed95ebfd149ce1e1b7c8` |
| `index-validate.json` | `7d71a3b5614d6c0361c250b999829ddd23d7f5d6a2f75c0cf14edd9c8feeb720` |
| `storage-profile.log` | `61b57de32ef976006a497d80df135d0ecd3a6841e3efb447572a6c3e3543c8e2` |
| `assistant-contract.log` | `8a541e973fc9979fa6396c54fd0fef531c84d7e468c4f9f424f33332a1c31b48` |
| `exit-codes.json` | `7ca33d6392ea974542b54a4adf9b50965748162e02b5af99e6463467e1071647` |
