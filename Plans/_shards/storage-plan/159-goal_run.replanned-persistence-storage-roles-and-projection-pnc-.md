# Shard 159: goal_run.replanned persistence, Storage roles and projection (PNC-019 lane rv8b, 2026-11-14)

Source: `Plans/storage-plan.md`

Source lines: L78918-L79103

Source SHA256: `5c118f3f6b4b66bf98fe35bf3b9e2122e98f49473b738bb20cb7f5821098b3bb`

---

## goal_run.replanned persistence, Storage roles and projection (PNC-019 lane rv8b, 2026-11-14)

### SP-3100 - Current goal_run.replanned persistence, identity, custody and withdrawal

```yaml
plan_unit_id: SP-3100
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract under DL-045, written for DL-080 option 1 (PNC-019 lane rv8b, 2026-11-14), for exactly goal_run.replanned v3, Project edition. Append: EP-3101's Replan writer appends the frozen EventRecord pm.event.v0 2.0.0 with payload pm.goal_runtime_event.goal_run_replanned.schema.v3 through the ordinary Storage append path; Storage assigns only sequence_id, observed_at_utc and persisted_at_utc; SP-286 first-AppendReceipt custody and its CV-339 full-value custody_v2 are adopted by name, and the retained original receipt answers a lost acknowledgement. Identity: idempotency key pm.goal-runtime-event.v3: plus lowercase SHA-256 of CV-1100 qualified RFC 8785 JCS of ["pm.goal-runtime-event-idempotency.v3", scope_partition, "goal_run.replanned", project_id, goal_id, goal_revision, expected_goal_run_revision, goal_run_revision, goal_run_id, replan_generation, new_workgraph_ref, next_action] (GRS-079 key family; correction C2); Storage owns scope_partition; inner and outer keys are byte-equal; outer scope_kind project, project_id, run_id = payload goal_run_id, node_id and attempt_id null, event_type = payload event_name, payload_schema_id = payload schema_version; event_id (app-root globally unique, Known-37 3.3), actor, correlation, causation, occurred time and provider/model/account refs are the frozen ProducerIntent choices, never retry-generated. Replay: same key and same producer semantic digest return the original event_id, receipt, sequence and transition with no second append or effect; same key and different digest is idempotency_conflict; a stale Workflow revision is revision_conflict; unprovable dedupe is dedupe_unavailable and appends nothing. Custody: the canonical seglog record and its SP-286 custody row are the Event originals; the v8 compact authority families of SP-3101 are the writer's originals; WorkNode disposition records belong to their native owner; project event backup and restore keep the seglog record, receipt custody and the compact families coherent; every read applies current Project access, deletion and hold checks, and an unresolvable referenced record reads unresolved, never inferred. Retention stays the registry assignment RP-RUNTIME-365D@1.0.0. Withdrawal: writer cutoff at the writer's final predicate before append; a replan past native application but before append stays pending and resolves only from retained original custody and SP-286; readers are withdrawn one by one without deletion and return unavailable; the SP-3102 projection is rebuilt only by a new generation from a full SP-278 scan; v2 rows stay historical and no v2 writer returns. Prepared without admission.
gui_related: false
gui_classification_reason: Defines event, writer, persistence or projection contracts; no visual surface.
split_recommended: false
depends_on:
- SP-286
- SP-278
- CV-339
- CV-3100
- CV-3101
- DL-080
- DL-045
unblocks: []
acceptance_criteria:
- Only EP-3101's writer appends; the first receipt is retained under SP-286 and returned on lost acknowledgement.
- The idempotency key equals the twelve-member recipe over the frozen choices; inner and outer keys are byte-equal; a retry of the same operation yields the same key, event ID and timestamps.
- Same key and digest return the original receipt; same key and different digest is idempotency_conflict; unavailable proof appends nothing.
- Reads apply current access, deletion and hold checks; a missing referenced record is unresolved.
- Withdrawal deletes nothing, rolls nothing back and switches no reader; reinstallation rebuilds a new projection generation.
validation_surfaces:
- Plans/event_payloads/goal_runtime/goal_run_replanned.v3.schema.json
- Plans/goal_run_replan_contracts/oracle-fixtures.json
- python3 scripts/pm_goal_run_replan_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_run_replanned_persistence
reasoning_tier: high
context_scope: goal_run_replanned_persistence
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-080
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PM-Experiments/goal-replan-combined-root-review-20260921/v3/REVIEW.md (adoption items 2, 4 and 5)
preserved_exact_tokens:
- "pm.goal-runtime-event-idempotency.v3"
- "pm.goal-runtime-event.v3:"
- "RP-RUNTIME-365D@1.0.0"
negative_constraints:
- No registry, retention or application-edition change.
- No second event for the same operation and no fresh identity, key or timestamp on retry.
owner_hints:
- Plans/storage-plan.md
```

**Members.** The replan operation is the claimed v8 slot operation; its identity exists before claim and never depends on a future Event or receipt. Two replans of one run at one Workflow revision are different operations and cannot both pass the revision check. The payload's own `idempotency_key` equals the event key, so the payload carries its dedupe identity.

**Custody of referenced records.** `affected_worknode_refs`, `cancelled_or_resteered_refs`, the graph refs and the graph-patch records name originals their own owners hold (native WorkNode and graph owners; the graph-lock owner; the governance-record owner after first custody). The Event holds references and the three graph-patch snapshots only, creates no hold and never reconstructs a referenced body.

**Search (DL-045).** Scope: SP-214, SP-278, SP-286, SP-309..317, SP-426..428, CV-339, BRS-024..029 and the registry row. Found: the v2 row selects RP-RUNTIME-365D; Known-37 7.1 defines the v2 key only; no unit defines a v3 key, append order, custody or withdrawal for this family. All are newly authored.

ContractRef: ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/Executor_Protocol.md#EP-3101, ContractName:Plans/Goal_Runtime_System.md#GRS-3100, ContractName:Plans/Decision_Log.md#DL-080

### SP-3101 - all_writers.v8 Storage roles, lifetime, durability and restore

```yaml
plan_unit_id: SP-3101
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract under DL-045, written for DL-080 option 1 (PNC-019 lane rv8b, 2026-11-14). Storage roles: the v8 Replan, enrollment, slot, slot revision, slot origin and observer-origin families of Plans/goal_run_replan_contracts/physical-families.json are prepared Storage roles with their frozen physical names, key shapes, codecs and mutability; they enter Plans/storage_value_registry.json together with the genuine v8 installation and the S5b Event switch as one landed registry change, and until then nothing is stored under them. The eleven v8 profile-qualified wrapper routes on existing families select their new headers only for a genuine v8 birth (installed profile, family, key, codec, header and whole resource together); SP-314, SP-316 and SP-317 rows, the v7 routes and every existing header stay unchanged. Lifetime: compact original authority families use RP-AUTHORITY-INDEFINITE@1.0.0, the policy of every existing Workflow source, start, cancel, standard and certified authority family; the ProducerIntent family uses RP-RUNTIME-365D@1.0.0 under the run-completion anchor; projections use RP-PROJECTION-3GEN@1.0.0; no new policy, horizon or hold. The twenty-nine transient-only definitions are never stored, and full current native, body, Goal, Event, source and candidate unions keep their own original lifetimes; none acquires indefinite retention because a compact origin survives. Durability (correction C4): every v8 append and every native publication that depends on it follows SP-336 per-class sync and full flush and SP-347 group commit control frames, with precedence over the frozen two-barrier and first-mint text, exactly as the Executor run-start first-receipt recovery adoption records (amended 2026-11-01 under DL-270): issuance is the group's durable commit frame inside Storage's append, with no separate source or manifest barrier step and no first-mint call; an uncertain append resolves through Storage recovery, where a group whose commit frame survives is issued and one whose frame does not is never issued (on macOS this can include an acknowledged ordinary-class group, SP-336); barrier-class or ambiguous loss stays fenced; the Replan append is barrier class, because durable compact authority (AppendLink, CompletionRecord and the observer origin) refers to it and SP-336 lets nothing durable refer to an ordinary group that power loss can drop, so it takes the full flush and its custody rows commit durably before acknowledgement and before any dependent native observation, completion or release; no missing receipt, lost delivery, tail absence or supplied never-issued flag mints custody. Restore: backup holds exact original key and value bytes with their original native issuance, the whole installed profile and a compatible original birth; restore keeps native transaction cuts and separately authentic append authority coherent; an older restore admits a fresh operation only through the original recovery predicates; unknown or missing custody stays mutation-fenced, with no reconstruction, backfill, rekey or substitute issuer. Goal body (correction C6): v8 Goal-realm reads use the current Goal body physical edition DL-270 and SP-339 select (canonical MessagePack under the new schema version and its registered migration edge); GRS-064 semantic inputs are unchanged; no header alias or invented old-body archive.
gui_related: false
gui_classification_reason: Defines event, writer, persistence or projection contracts; no visual surface.
split_recommended: false
depends_on:
- SP-3100
- SP-314
- SP-316
- SP-317
- SP-336
- SP-347
- SP-339
- SP-1101
- EP-3100
- DL-270
- DL-045
unblocks: []
acceptance_criteria:
- Every prepared family names its frozen key shape, codec, mutability, authority class, backup rule and an existing retention policy; no new policy exists.
- No transient-only definition is stored and no full mutable body acquires RP-AUTHORITY-INDEFINITE.
- Every append follows SP-336 and SP-347 (issuance is the durable commit frame); no custody is minted from a manifest barrier, a missing receipt or a supplied never-issued flag, and barrier-class loss stays fenced.
- A v8 header selects only a genuine v8 birth's body; existing rows, routes and headers are unchanged.
- Goal body reads use the current physical edition through its registered migration edge only.
validation_surfaces:
- Plans/goal_run_replan_contracts/physical-families.json
- Plans/goal_run_replan_contracts/source-v8/stored-profile-routes.json
- python3 scripts/pm_goal_run_replan_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_run_replanned_storage_roles
reasoning_tier: high
context_scope: workflow_all_writers_v8_storage
implementation_surfaces:
- Plans/storage-plan.md
- Plans/goal_run_replan_contracts
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-080
- Plans/Decision_Log.md#DL-270
- /mnt/Cursor/PM-Experiments/goal-replan-combined-root-review-20260921/v3/REVIEW.md (adoption items 4 and 5)
preserved_exact_tokens:
- "RP-AUTHORITY-INDEFINITE@1.0.0"
- "RP-PROJECTION-3GEN@1.0.0"
- "workflow_combined_slot"
negative_constraints:
- No storage registry row, retention policy or header change before the landed installation change.
- No reconstruction of a missing original from a hash, receipt or compact origin.
owner_hints:
- Plans/storage-plan.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-314, ContractName:Plans/storage-plan.md#SP-316, ContractName:Plans/storage-plan.md#SP-336, ContractName:Plans/storage-plan.md#SP-347, ContractName:Plans/Executor_Protocol.md#EP-3100

### SP-3102 - Run-history projection branch for all_writers.v8 births

```yaml
plan_unit_id: SP-3102
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract under DL-045, written for DL-080 option 1 (PNC-019 lane rv8b, 2026-11-14): the Storage side of GRS-3101. Consumer: owner.goal_run.history_v8.project_prefix.v1, the only writer of the v8 branch values; readers owner.goal_run.history_v8.read_historical.v1 and owner.goal_run.history_v8.read_current.v1 have no durable effect. Values: the closed run_row (pm.storage_value.goal_run_history_v8_row.v1) and checkpoint (pm.storage_value.goal_run_history_v8_checkpoint.v1) of Plans/goal_run_replan_contracts/projection.schema.json; run_row members are copied from the verified original row or its original custody, never from current native state; next_action in last_replan excludes cancel. Keys: goal_run_history_v8_row.v1:H(storage_instance_id):H(project_id):H(goal_run_id):H(generation_id) and goal_run_history_v8_checkpoint.v1:H(storage_instance_id):H(project_id):H(generation_id). Checkpoint: adopts SP-278 with the nine-field durable read token (DL-076) as index_read_token; no stored value holds redb_snapshot_id. Advance: each accepted row, the checkpoint's processed_through_sequence_id and row_set_sha256 commit in one Storage write transaction under the full before-token CAS and the final pure source and currentness predicate; a halted row advances nothing. Generations: a new projection profile version built only in a new generation from a full scan; current, staged and retired generations count toward RP-PROJECTION-3GEN@1.0.0; cutover follows SP-317. The values are derived, never backed up (DL-270, BRS-027/028), and a restore rebuilds them. The frozen draft_replan_projection_checkpoint family is superseded by goal_run_history_v8_checkpoint (correction C9).
gui_related: false
gui_classification_reason: Defines event, writer, persistence or projection contracts; no visual surface.
split_recommended: false
depends_on:
- SP-3100
- SP-278
- SP-311
- SP-312
- SP-317
- DL-076
- DL-270
- DL-045
unblocks: []
acceptance_criteria:
- A supported row and the checkpoint advance together or not at all, under the full before-token CAS.
- The stored checkpoint token is the nine-field durable token; no redb_snapshot_id is persisted.
- Non-v8 births, v2 rows and unsupported rows halt before the row and advance nothing.
- The profile is built only in a new generation; no existing generation or root is converted.
validation_surfaces:
- Plans/goal_run_replan_contracts/projection.schema.json
- Plans/goal_run_replan_contracts/physical-families.json
- python3 scripts/pm_goal_run_replan_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: run_history_projection_gap
reasoning_tier: high
context_scope: grs085_v8_replan_extension_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-080
- Plans/Decision_Log.md#DL-076
- /mnt/Cursor/PM-Experiments/goal-replan-combined-root-review-20260921/v3/REVIEW.md (adoption item 3)
preserved_exact_tokens:
- "SP-278"
- "DL-076"
- "goal_run_history_v8_checkpoint"
negative_constraints:
- No action authority, resume or replan from a projected value.
- No conversion of a started-only, started/cancelled, certified or stop_block root.
owner_hints:
- Plans/storage-plan.md
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-3101, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-317, ContractName:Plans/Decision_Log.md#DL-080
