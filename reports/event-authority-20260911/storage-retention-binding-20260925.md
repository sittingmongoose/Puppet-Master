# Storage retention binding: DL-083, DL-089, DL-084 to DL-086 and DL-092 written into Storage owner text, 2026-09-25

Branch `plans/ea-storage-retention-20260925`, cut from `origin/main` `63cf2cb97f` (the landing record of Step 9 batch 2's coordination prep). It is pushed and not landed. As the Storage retention owner, it writes six of Jared's retention answers into Storage owner text:
- DL-083 and DL-089: the two application-wide count buckets under `RP-OPERATIONAL-2555D@1.0.0`, in SP-291's aggregate custody text;
- DL-084 and DL-092: kept as long as the chat exists, after the reuse check both entries asked for;
- DL-085 and DL-086: the Case L-3 assignments for the board records and the three orchestrator diagnostics.

It then moves the 25 J248 retention cells from `FAIL` to `PASS` on that owner text, and it carries the v2-current review's R2-01 wording note.

It registers, admits and retires nothing. It changes no event family registry row, DL-077 admission record, validator, receipt, Decision Log entry, Spec Lock, evidence file or procedure count. One retention policy object is added: the only one DL-092 allows.

## 1. What changes

Line citations refer to the branch tip `1aae02ac37`.

| Surface | Where | What | Commit |
|---|---|---|---|
| SP-291 aggregate custody text | `Plans/storage-plan.md:23604`, new subsection `23606-23626` | The "unproved policy-owner adapter seam" sentence is replaced. A new subsection, "Application-wide count buckets under the operational policy (DL-083, DL-089)", binds the buckets under DL-045 (section 3) | `306b9e30f2` |
| SP-291 PlanUnit | `Plans/storage-plan.md:23679`, `23689`, `23704`, source lineage | The acceptance criterion and the negative constraint name the two buckets instead of forbidding any bucket. `depends_on` and `source_lineage` gain DL-083 and DL-089 | `306b9e30f2` |
| Registry prose | `Plans/storage_value_registry.json`, `boot_recovery_control.retention_compaction` | The prose now states the DL-083 bucket instead of "adapter remains unproved". The structured `retention_policy_ref` stays `RP-OPERATIONAL-2555D` | `306b9e30f2` |
| Reuse check and new policy object | `Plans/storage-plan.md:17282-17284`; `Plans/storage_value_registry.json:557` | `RP-GOAL-THREAD-LIFETIME` is not reused. The Chat content class becomes `RP-CHAT-THREAD-LIFETIME@1.0.0` (section 2) | `0d624161eb` |
| Census re-pin | `Plans/storage-plan.md:523`; `scripts/pm-implementation-readiness.py` (`STORAGE_VALUE_REGISTRY_EXPECTED_RETENTION_POLICY_COUNT`); `tests/test_pm_onboarding_phases.py` | Retention policies go from 27 to 28. The family, status and tier counts are unchanged | `0d624161eb` |
| Case L-3 assignments, in DL-075's form | `Plans/storage-plan.md:17286` (DL-084), `17288` (DL-085), `17290` (DL-086), `17292` (DL-092) | Four assignment paragraphs follow DL-075's line (`17280`) (section 4) | `2d2562fe23` |
| R2-01 | `Plans/storage-plan.md:20022` | "this conditional target alone grants none of them." now reads "the 2026-09-23 conditional target alone granted none of them." | `34998368f3` |
| J248 rows and ledgers | 25 files `Plans/.audits/event-authority-2026-08-12/individual-disposition/rows/ROW_<event>.json`, `individual-disposition/LEDGER.jsonl`, `census-adjudication/LEDGER.jsonl` | Retention cell `FAIL` to `PASS` on the owner text (section 5) | `1aae02ac37` |
| Application record | `reports/event-authority-20260911/step-09-retention-binding-application-20260925.json` (SHA-256 `c86e9f6e648d542026dd5b19b40da528fe22b22cba627293ca47069a485a51d1`) | Before and after SHA-256 of every row, both ledgers and every other branch file. The 15 other batch 2 rows are recorded as unchanged | `1aae02ac37` |
| Derived | `Plans/_shards/storage-plan` (85), `Plans/_shards/storage_value_registry` (568), `Plans/.plan_index` (6) | Regenerated with each Plans edit, and no other document's shards changed. The registry shard list changes: `565-lines-112801-112995.md` becomes `565-lines-112801-113000.md`, and `566-lines-113001-113011.md` is new | with each edit |

The four authored files, against `63cf2cb97f`, are these:

| File | SHA-256 before | SHA-256 after |
|---|---|---|
| `Plans/storage-plan.md` (+42/-6 lines) | `011b88771f4a9fff2ed5448035e0b448232fcedfcc9eb51dcffbecfcc3fd67f7` | `cefd36c74fe5ce86304f639be67b48196f592e533448aafa86f7a4b7c475cd82` |
| `Plans/storage_value_registry.json` (+17/-1) | `32d267dd4f06f3dbec4b5319b49bff94c909c600d87c2a6dbed11e07e74c0f46` | `b3b053ca8a9d4d3880f939eff2f2852d17276237bd3a8079aafb14591b79fa8a` |
| `scripts/pm-implementation-readiness.py` | `8cc389e78728f1fd0381fff523a5b23f4b58eccea0949ab0a89ad0454c9eb28d` | `43b020486482b133438f08cbe9c2c4a580544bb3d61ea3acbab75b4aa0f0bb76` |
| `tests/test_pm_onboarding_phases.py` | `16f4a9a7d1d36defe11c08eeabd24e545205556ffdc79fbc40027933d69123ca` | `d90ce535ef1300cfff9da37324e4585f37c915e1ff278d12978e890186442007` |

In all, 691 paths change: 4 authored files, 27 audit files, the application record, 653 shard files and 6 index files. PlanUnits stay at 6,742 and acceptance units at 26,321. No new test file is added, so no `.gitignore` line is needed.

## 2. The reuse check: RP-GOAL-THREAD-LIFETIME is not reused

DL-084 and DL-092 named `RP-GOAL-THREAD-LIFETIME@1.0.0` for "as long as the chat exists", subject to the Storage owner's reuse check under DL-045. They allowed the Chat content class to be materialized, with the same lifetime, if that object could not be reused. The review of the batch 2 map had recorded DL-047 as an analogy only.

**Decision: reuse is not justified.** The Chat content class is materialized as one policy object, `RP-CHAT-THREAD-LIFETIME@1.0.0`, and both DL-084 and DL-092 are bound to it.

**Reasons.**
1. **The lifetimes match, so the lifetime question was never at issue.** Both objects keep records while the chat exists and end them when it is deleted: explicit-delete anchor, `tombstone_then_compact`, hold eligible, and the same 24-hour active and 30-day backup purge limits.
2. **The role does not match.** DL-045 allows reuse only "when its owner defines the required role, version and scope", and never from a sibling or a descriptive role. The object's owner text is "DL-047 lifetime and deletion" (`Plans/storage-plan.md:22175-22177` at the tip). It defines the object as "the explicit machine assignment for the four content-bearing families" of the Goal body. DL-047 decides Goal text only and "does not select ... sibling event admission".
3. **The count rule does not match.** The same owner text says to apply "no imported 250,000-message Goal-revision cap". The object has `max_cardinality=null` and `fail_closed` overflow. Child-run and collaborative histories belong to a chat and are shown in its history (DL-084, DL-092), which makes them chat content. Jared already decided the chat content rule on 2026-07-17 as PD-L005-02 (DL-029): "Retain chat content while its thread exists; cap at 250,000 canonical chat-content events per thread, then roll into a linked successor rather than evict." Reusing the Goal object would silently drop that approved cap and successor rule for busy chats.

**The policy object** (`Plans/storage_value_registry.json:557`) has these values:
- `retention_mode` `indefinite`, `anchor_kind` `explicit_delete`, `retain_indefinitely` true, `ttl_seconds` null, `source_policy_ref` null;
- `max_cardinality` 250000, `cardinality_scope` `thread`, no additional limits, `max_bytes` null;
- `overflow_action` `roll_successor`, `hold_eligible` true, `expiry_action` `tombstone_then_compact`, `policy_version` `1.0.0`.

It validates against the unchanged registry schema.

**Cap and successor rule, from PD-L005-02** (`Plans/storage-plan.md:17284`):
- A thread holds at most 250,000 records under the policy, counted over every family assigned to it in that thread, in the existing count order.
- At the cap, the thread's history continues in a linked successor. No record is evicted and the count never deletes content.
- A successor belongs to the same chat and is deleted with it.
- Deleting the chat follows Case L-3 "Thread/project deletion" (PD-L015-04): a tombstone at once, unheld active copies purged within 24 hours and deleted backup bytes within 30 days. A hold delays the purge but never restores visibility.
- The successor's physical form is not defined anywhere in canon. It stays technical work for the first admission of a family bound to this policy.

`RP-GOAL-THREAD-LIFETIME@1.0.0` keeps its Goal families and its values.

## 3. The application-wide buckets (DL-083, DL-089)

This is a newly authored Storage owner contract under DL-045. The four families are in DL-045's registered-depth column. It creates no policy object and changes no `RP-OPERATIONAL-2555D@1.0.0` value, so `cardinality_scope` stays `project`.

- **Identity.** There are two count keys, `app:storage_operational` (DL-083) and `app:platform_capability` (DL-089), beside the unchanged Project buckets. Each Project bucket is named by its scope partition `project~{base64url_no_pad(UTF8(project_id))}`. A bucket name is a count key only. It is not a scope partition, Project ID, dedupe partition or event field. The records keep `scope_kind=application`, `project_id=null`, the partition `app` and their identities (DL-031 `EVT-01`, `EVT-02`).
- **Assignment.** A record's bucket comes from its registered family and scope; for an EventRecord, from its `event_type` and `scope_kind`. It never comes from a key prefix, file name, actor, ID grammar or time.
  - Application-scoped `storage.boot_recovery`, `storage.recovery_applied` and `storage.compaction_lifecycle_changed` count in `app:storage_operational`. So do the settled and no-obligation Boot aggregate controls (`boot_recovery_control`), which are `storage.boot_recovery`'s own aggregate custody under the same policy.
  - Application-scoped `platform.capability_evaluated` counts in `app:platform_capability`.
  - Project-scoped records stay in their Project bucket.
  - Nothing else is assigned to either application bucket. An unknown scope or event type is quarantined (DL-031 `EVT-05`), never defaulted into a bucket.
- **Overflow.** Each bucket has the same limits: 2,000,000 retained records, expiry at the terminal-transition anchor plus 220,752,000 seconds, and compaction of expired unheld records only. When no expired unheld member remains, a new record is refused and nothing is written, as for a Project. A full bucket never evicts, never borrows room from another bucket and never refuses another bucket's records. Platform checks therefore cannot use up the room kept for recovery records (DL-089).
- **Boundary.** The platform capability catalog stays empty until build time (DL-082). Native counting, refusal and cleanup are NOT_RUN.

## 4. The Case L-3 assignments

Each assignment is written in DL-075's form: the family set, the policy, "for the time their full contracts are admitted", "retention assignment only: it admits no family, defines no binding", what keeps its own policy, and what each full contract must still do before admission.

| Line | Decision | Families | Policy | Notes |
|---|---|---|---|---|
| `17286` | DL-084 | the 19 `subagent.*` families of CV-267 to CV-269 | `RP-CHAT-THREAD-LIFETIME@1.0.0` | Previews and error text are kept with the chat. `runtime_artifact.subagent_lineage` stays indefinite (DL-075). A child's history can outlive its parent Run's one-year history |
| `17288` | DL-085 | `crew.board_message_posted`, `crew.board_message_read`, `crew.board_messages_archived` | `RP-COORDINATION-180D@1.0.0` | The 24-hour rule is visibility only. See below for `coordination_event_records` |
| `17290` | DL-086 | `phase.force_completed`, `config.validation.failed`, `parser.error` | `RP-RUNTIME-365D@1.0.0` | The raw output of `parser.error`, at least its first 500 characters, is kept for the year. The "first 500 characters" and "All raw output is preserved" reconciliation stays Orchestrator work |
| `17292` | DL-092 | the 17 names of Collaborative Workflows section 13 and DL-091's `collaboration.failed` | `RP-CHAT-THREAD-LIFETIME@1.0.0` | Recorded events only. The run, transcript message, proposal and finding records stay open |

**The coordination storage family and the board events (DL-085).** Yes: when the three board families are registered, `coordination_event_records` will need them in its key shape. Three facts require it:
- the Orchestrator appends board events to the canonical coordination event stream (`append_coordination_event`, `Plans/orchestrator-subagent-integration.md:4546`);
- DL-085 keeps them with that family's records;
- an SP-320 keyed value composition holds exactly one member per key shape.

Each board family's own admission landing adds its key shape and member, and binds the run anchor from the board payload's `run_id` as SP-320 does. It must also reconcile the row's content rule. That rule allows only "IDs, refs, hashes, enums, integers, timestamps and CV-353's bounded status and operation text", while board records carry message subjects and text (`AgentMessage.subject` and `content`). The family is not changed on this branch.

## 5. The 25 rows

The rows follow Step 9 batch 1's form (`step-09-card-answer-application-20260924.json`). The cell becomes `PASS` and cites the landed owner line. Its note says what the policy keeps, cites the reuse check and the registry object, and states the open admission precondition: each full contract's structured `retention_policy_ref` and its chat-deletion, text-protection or Run-anchor reconciliation. It adds "that precondition is still open and no evidence cell in this row records it as met".

Each row stays `KEEP_QUARANTINED`, and only three fields change:
- `disposition_rationale`, with one passage appended;
- `evidence.retention`;
- `citations_checked`, with entries appended.

Both ledgers rewrite or amend exactly those 25 lines, keeping each file's serialization and line endings. The 15 other batch 2 rows (7 coordination, 6 crew lifecycle, 2 spawn) are byte-identical. The campaign count stays 0 registered, 15 excluded, 0 carded and 237 remaining of 252, and the procedure record is not edited.

| # | Row | Decision | Cell now | Row SHA-256 before | Row SHA-256 after |
|---:|---|---|---|---|---|
| 1 | `subagent.spawned` | DL-084 | PASS `Plans/storage-plan.md:17286` | `c013087d6491` | `15373c84ab7e` |
| 2 | `subagent.started` | DL-084 | PASS `…:17286` | `58d45008ec0c` | `cae168e95d8c` |
| 3 | `subagent.completed` | DL-084 | PASS `…:17286` | `276f4e316049` | `1d19aa5b9c73` |
| 4 | `subagent.failed` | DL-084 | PASS `…:17286` | `f2de060509e2` | `90b24b707ce3` |
| 5 | `subagent.cancelled` | DL-084 | PASS `…:17286` | `2ac0ea5e3c6c` | `e560b5b88db0` |
| 6 | `subagent.timeout` | DL-084 | PASS `…:17286` | `947533dfa711` | `29c5767d4962` |
| 7 | `subagent.paused` | DL-084 | PASS `…:17286` | `8c12d5661d63` | `17fde92877c1` |
| 8 | `subagent.resumed` | DL-084 | PASS `…:17286` | `968b4827d04f` | `10e0c023b9ed` |
| 9 | `subagent.progress` | DL-084 | PASS `…:17286` | `4d11c612981e` | `87db8b71e404` |
| 10 | `subagent.tool_called` | DL-084 | PASS `…:17286` | `bb7554f479fe` | `934f1b2fc9d5` |
| 11 | `subagent.tool_completed` | DL-084 | PASS `…:17286` | `816a80d2e4a8` | `d639b90f6511` |
| 12 | `subagent.message_sent` | DL-084 | PASS `…:17286` | `0d55ab0e0564` | `da7ff5916f94` |
| 13 | `subagent.message_received` | DL-084 | PASS `…:17286` | `50dd18933f14` | `02bc1e9994f4` |
| 14 | `subagent.output_truncated` | DL-084 | PASS `…:17286` | `cb705014d974` | `a69503543913` |
| 15 | `subagent.retried` | DL-084 | PASS `…:17286` | `7ce3de42ff70` | `40ad6fb4a873` |
| 16 | `subagent.context_warning` | DL-084 | PASS `…:17286` | `df017f36bdfa` | `93c7a7c7329a` |
| 17 | `subagent.model_switched` | DL-084 | PASS `…:17286` | `6993e0ce6747` | `6e0519df6ffd` |
| 18 | `subagent.budget_warning` | DL-084 | PASS `…:17286` | `016f664c079a` | `89d8064d7e5a` |
| 19 | `subagent.escalated` | DL-084 | PASS `…:17286` | `f5cb92cd9f8f` | `836f47f29673` |
| 20 | `crew.board_message_posted` | DL-085 | PASS `…:17288` | `9bad6992c5ee` | `06ca1d4a9ba5` |
| 21 | `crew.board_message_read` | DL-085 | PASS `…:17288` | `a4a50d07447f` | `fbc8bb1435c0` |
| 22 | `crew.board_messages_archived` | DL-085 | PASS `…:17288` | `9fcb79b9d524` | `5fdf812fe710` |
| 23 | `phase.force_completed` | DL-086 | PASS `…:17290` | `c04a5d6fe6a6` | `4870a2d5bd35` |
| 24 | `config.validation.failed` | DL-086 | PASS `…:17290` | `16215bd7deff` | `07cee61b2459` |
| 25 | `parser.error` | DL-086 | PASS `…:17290` | `cd0604a4fc3d` | `decf9a2a5464` |

The ledgers change as follows:
- `individual-disposition/LEDGER.jsonl`: `abea8410fdee…` to `e8245a317703…`, 25 lines;
- `census-adjudication/LEDGER.jsonl`: `2d35c1e4d69e…` to `73ffa7a20fb1…`, 25 lines.

Full hashes are in the application record.

## 6. Checks

The same read-only set ran at the base `63cf2cb97f` and at the tip `1aae02ac37`, each in a clean worktree with the ignored currentness edition symlinked in. The outcomes are identical.

| Check | Base | Tip |
|---|---|---|
| Shard check (`--config Plans/sharding_config.json`) | pass | pass (99 documents). After each Plans edit only the edited documents' shards and the index changed |
| `pm-plan-index.py validate` | pass, 6,742 / 26,321 | pass, 6,742 / 26,321 |
| `pm-implementation-readiness.py validate` | exit 1, 36 rows | exit 1, the same 36 rows (no new or removed row). The census accepts 28 policies; the 8 currentness drift rows already name `storage-plan.md` and `storage_value_registry.json` |
| `pm-implementation-readiness.py self-test` | exit 1, 3 false checks | exit 1, the same 3 pre-existing Case L event residual checks |
| `test_event_authority_holding_bucket` | OK (34) | OK (34) |
| `test_pm_emit_only_event_boundaries` | OK (13) | OK (13) |
| `test_pm_pnc019_currentness` | 1 failure, 8 drift rows | the same failure and 8 rows (drift only) |
| `pm-event-authority-currentness.py validate` (explicit `PM_EVIDENCE_MAP`) | 13 of 14 true | 13 of 14 true; `all_live_sources_rehashed` false for the drift; `quarantined_252_exact_set_and_custody` true |
| Tests that read the registry: shared runtime storage 15, onboarding 42, runtime vocabulary 9, coordination 45, Browser admission 38, testing session 11, GitHub project 15, Browser created 65, reset 53, assistant contract closure 38, FinalGUI tour 4 | all OK | all OK |
| `pm_coordination_events.py`, `pm-browser-event-admission.py` | pass | pass |
| `pm-plans-verify.py lint-contractrefs` | the pre-existing `Plans/00-plans-index.md:81` | the same |

These were run at the tip only:
- **Registry validators.** `validate-working-notebook-contracts`, `validate-case-l-non-event-materialization`, `validate-new-contracts`, `validate-browser-event-admission`, `validate-testing-session-event-admission` and `validate-github-project-integration` all pass.
- **`verify-spec-lock`.** It lists the same 7 `stale_hash` rows as on `main`. Three of them are this branch's files, with new actual hashes.
- **`json-syntax` and `lint-path-refs`.** Both fail only on paths outside the sparse cone, `tests/agent_packet_restrictions` and `Concepts`.

`verify_branch.py` passes all 17 of its checks:
- only allowed paths changed;
- exactly one policy was added, and the other 27 policies and every family are identical except the one prose field;
- no `retention_policy_ref` changed;
- the six removed storage-plan lines are exactly the expected ones;
- exactly 25 rows changed, only in the permitted fields;
- the ledgers changed exactly those lines, with line endings kept;
- the other batch 2 rows are unchanged;
- every hash in the application record matches;
- no other document's shards changed.

**Not run**, by instruction or rule:
- the independent validator;
- `pm-implementation-readiness.py generate` and the currentness `generate`;
- `run-gates` and `audit-governance` as aggregates;
- the landing check, which refuses a sparse worktree.

## 7. Evidence

`/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/storage-retention-binding-20260925/` holds:
- **Scripts.** The edit scripts (`edit_r2_01.py`, `edit_sp291_buckets.py`, `edit_chat_policy.py`, `edit_case_l3_assignments.py`), the row application `apply_retention_binding_rows.py`, the check runner and summarizer, and `verify_branch.py`.
- **Outputs.** The base and tip check runs with their summaries, the tip-only verifier subchecks, the regeneration logs, the application output and the verifier output.

Its `SHA256SUMS` (83 files, written after the last check and before this report, which it does not cover) has SHA-256 `a517adcf9d3d53bbedfa6ed4c9be9cd50d6e57add55167197a556a1c37c15054`. The working log is `/mnt/Cursor/PM-Experiments/ea-storage-retention-20260925/log.md`.

## 8. Expected at landing

These are forecasts, not measurements. They follow the coordination prep landing (`LANDING_20260925_EA_S09_COORDINATION_PREP.md`), which edited the same four authored files, and batch 1's landing, which changed the same kind of audit rows.
- **Exit and new rows.** The expected result is exit 1 with 0 blocking items. Every row naming this branch's files should be governance staleness.
- **Spec Lock.** `stale_hash` for `Plans/storage-plan.md`, `Plans/storage_value_registry.json` and `scripts/pm-implementation-readiness.py`. These rows are already on `main`; only their actual hashes move, and the count stays 7.
- **Evidence and plan graph.** `artifact_hash_stale` for the two documents and their shards in the live plan-sharding bundle. The registry's shard list changes again, but the bundle never listed `565-lines-112801-112995.md`, so no new `missing_ref` is expected. The 4 pre-existing `missing_ref` rows for `551-lines-110001-110108.md` stay.
- **Implementation readiness.** The same 36 rows as at the base. These include the currentness drift and `pnc019_source_hash_stale` rows for the registry, and the pre-existing self-test row, whose count stays 1.
- **Plan migration.** Run-002 `stale_batch_report_sha256_after` for the storage-plan and registry batch report rows. In the 2026-09-06 snapshot, the span rows of storage-plan units after line 17280 change content. The PlanUnit count is unchanged, so the final summary's count row should not move.
- **No rows expected** for the 25 row files, the two ledgers, the application record, this report or `tests/test_pm_onboarding_phases.py`.

**Before landing:**
- **Review and go.** One blind form-driven review, dispatched by the coordinator, and the coordinator's landing go.
- **Re-reading.** At the landing fetch, every passage cited here is re-read against `main`: SP-291, Case L-3 `17280-17292`, section 2.3.1 line 523 and the SP-266 subsection.
- **Rebase.** If `main` changes `storage-plan.md` before this lands, the rebase regenerates shards and index. The row citations (`17286`, `17288`, `17290`, `17282-17284`, registry `557`) and the application record's anchor revision must then be re-checked, and re-applied if they moved.

## 9. Reseal request

For the designated Plans agent, from editing `Plans/storage-plan.md`, `Plans/storage_value_registry.json` and `scripts/pm-implementation-readiness.py`:
- **Spec Lock.** Refresh the entries of those three files.
- **Plan-sharding bundle.** Refresh the rows of the two documents and their shards, including the registry's changed shard file list.
- **PNC-019 source hash.** Refresh it for `Plans/storage_value_registry.json`.
- **Currentness.** An edition covering `storage-plan.md` and `storage_value_registry.json`. Until then, `test_pm_pnc019_currentness` keeps their drift rows.
- **Run-002.** `refresh-batch-hashes` for the two documents' batch report rows, and `refresh-final-summary`.
- **Readiness and snapshot.** The implementation-readiness gate report, and the nightly `snapshot-current`.

## 10. For the host

1. **The Boot aggregate controls in the DL-083 bucket.** DL-083 names the records of three event families. SP-291's seam sentence was about the Boot aggregate controls and the Boot event together, and DL-089 says that only the Platform part was left open. This branch therefore counts the settled and no-obligation `boot_recovery_control` values in `app:storage_operational`, as `storage.boot_recovery`'s own aggregate custody. If the host reads DL-083 as covering EventRecords only, that sentence (`Plans/storage-plan.md:23619`) and the registry prose should be narrowed, and the controls' count stays open.
2. **`storage_maintenance_operation` has the same gap, and no decision covers it.** The family is application-scoped (`storage_maintenance_operation.v1:{storage_instance_id}:{operation_id}`) under `RP-OPERATIONAL-2555D`, which counts per Project. Neither DL-083 nor DL-089 names it, and the bucket text assigns it nothing. Whether it needs its own card is the host's call.
3. **PASS on the Case L-3 text.** The host ruling kept the cells `FAIL` "until the Storage owner binding (the Case L-3 assignment and the family contract) is written". This branch writes the assignment. Each family contract's structured `retention_policy_ref` does not exist yet, because no family contract is written. The cells follow batch 1, whose `PASS` also stood on owner text while each full contract's reconciliation stayed an open admission precondition, stated in every cell note. The task instructed this move; the host confirms the reading or keeps the cells `FAIL`.
4. **The linked successor has no physical form yet.** No canon defines it for any chat content, including chat messages. It is recorded as technical work for the first admission of a family bound to `RP-CHAT-THREAD-LIFETIME`.
5. **Other owners' follow-ups, not done here:**
   - Contracts: CV-267 to CV-269 cite DL-084, and the board rows carry `RP-COORDINATION-180D` (DL-085).
   - Orchestrator: "archived or deleted" becomes "archived" (DL-085), the raw-output reconciliation (DL-086), and the child-run section cites DL-084.
   - Collaborative Workflows: section 13 cites DL-090 and gains `collaboration.failed` (DL-091).
   - The Step 8 depth assessment's four `RP-OPERATIONAL-2555D` retention cells can leave `PARTIAL` at the next regrade. The assessment is pinned by the DL-077 admission records and is not edited here.
6. **Response rows unchanged.** `decision-responses.jsonl` still says the DL-084 to DL-086 cells are `FAIL` "until the Storage owner binding lands". That stays true as history and is not edited.

## 11. Commits

| Commit | What |
|---|---|
| `34998368f3` | R2-01 wording in the SP-266 successor subsection |
| `306b9e30f2` | SP-291: the DL-083 and DL-089 application-wide buckets, PlanUnit, registry prose |
| `0d624161eb` | Reuse check; `RP-CHAT-THREAD-LIFETIME@1.0.0`; census re-pinned to 28 policies (storage-plan, readiness, onboarding test) |
| `2d2562fe23` | Case L-3 assignments for DL-084, DL-085, DL-086 and DL-092 |
| `1aae02ac37` | The 25 rows, both ledgers and the application record |
| this commit | This report |
