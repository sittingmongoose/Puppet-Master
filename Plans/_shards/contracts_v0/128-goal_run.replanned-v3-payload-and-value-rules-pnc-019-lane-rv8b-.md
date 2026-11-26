# Shard 128: goal_run.replanned v3 payload and value rules (PNC-019 lane rv8b, 2026-11-14)

Source: `Plans/Contracts_V0.md`

Source lines: L57654-L57766

Source SHA256: `20b166e3f5825e366fd62bfebf5499ccb5000932011f62ef6e45b31412bb1aa5`

---

## goal_run.replanned v3 payload and value rules (PNC-019 lane rv8b, 2026-11-14)

### CV-3100 - Current goal_run.replanned v3 payload contract

```yaml
plan_unit_id: CV-3100
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045, written for DL-080 option 1 (PNC-019 lane rv8b, 2026-11-14). goal_run.replanned binds schema ID pm.goal_runtime_event.goal_run_replanned.schema.v3 at Plans/event_payloads/goal_runtime/goal_run_replanned.v3.schema.json, closed at the root (additionalProperties false, unevaluatedProperties false) and self-contained, on the GoalRun envelope grammar that CV-288 keeps for Event Authority custody after DL-478: expected_goal_run_revision, goal_run_revision and idempotency_key are required; expected_goal_revision and parent_goal_id are gone; goal_revision is the unchanged Goal context revision; execution_role is runtime_controller. The specific payload keeps the seven v2 fields (goal_run_id, previous_workgraph_ref, new_workgraph_ref, replan_generation with maximum 4294967295, affected_worknode_refs, cancelled_or_resteered_refs, next_action) and adds the required original_graph_patch and original_graph_patch_history from the accepted v8 source, whose graph-patch and OwnerIdentity definitions are inlined under graph_patch_* with their grammar unchanged. It is the restriction successor of the v8 draft clock-split payload (Plans/goal_run_replan_contracts/payload-correspondence.json): each canon instance maps to exactly one draft instance that satisfies the draft's own owner rules, and back; no other draft instance has a canon image. The delivery profile pm.goal_run_replanned.delivery.v3 selects this schema for the v8 Replan writer's WholeProducerSubmission and appended Event (adoption correction C1). The whole v2 schema stays unchanged as the historical reader and is never reinterpreted. Prepared without admission: the registry row keeps v2 until the S5b switch (prepared row in Plans/goal_run_replan_contracts/prepared-registry-row.json).
gui_related: false
gui_classification_reason: Defines event, writer, persistence or projection contracts; no visual surface.
split_recommended: false
depends_on:
- CV-287
- CV-288
- DL-080
- DL-045
unblocks: []
acceptance_criteria:
- The v3 root rejects expected_goal_revision, parent_goal_id and any unknown member, and requires idempotency_key, both Workflow revisions and both graph-patch members.
- goal_run_revision is the successor of expected_goal_run_revision and idempotency_key equals the SP-3100 key (owner predicates).
- Every canon instance maps to a draft instance accepted by the pinned draft schema, and the map is reversible; a draft instance with expected_goal_revision unequal to goal_revision, a parent_goal_id or no idempotency_key has no canon image.
- The v2 schema bytes are unchanged.
validation_surfaces:
- Plans/event_payloads/goal_runtime/goal_run_replanned.v3.schema.json
- Plans/goal_run_replan_contracts/payload-correspondence.json
- Plans/goal_run_replan_contracts/oracle-fixtures.json
- python3 scripts/pm_goal_run_replan_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_run_replanned_payload
reasoning_tier: high
context_scope: goal_run_replanned_payload_v3
implementation_surfaces:
- Plans/Contracts_V0.md
- Plans/event_payloads/goal_runtime/goal_run_replanned.v3.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-080
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PM-Experiments/goal-replan-combined-source-20260921/v3/inputs/replan-v3/goal-run-replanned-clock-split.schema.json (placed byte-identical under Plans/goal_run_replan_contracts/source-v8/)
preserved_exact_tokens:
- "pm.goal_runtime_event.goal_run_replanned.schema.v3"
- "pm.goal_run_replanned.delivery.v3"
negative_constraints:
- No change to the v2 schema, the registry or an application edition (CV-366 keeps goal_run.replanned preserve_project_only).
- No selection of the draft payload or draft delivery profile for a canon write.
owner_hints:
- Plans/Contracts_V0.md
```

Positive and negative payload cases are in `Plans/goal_run_replan_contracts/oracle-fixtures.json` and the cases `scripts/pm_goal_run_replan_oracles.py` derives from them (ATS-3100).

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-3100, ContractName:Plans/storage-plan.md#SP-3100, ContractName:Plans/Contracts_V0.md#CV-288, ContractName:Plans/Decision_Log.md#DL-080

### CV-3101 - goal_run.replanned numbers, date-time and retained recipes

```yaml
plan_unit_id: CV-3101
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract under DL-045, written for DL-080 option 1 (PNC-019 lane rv8b, 2026-11-14), adoption correction C5. Numbers: current inputs follow CV-1100 exactly. Raw JSON is parsed only by the shared current decoder; -0, 01, non-finite tokens and duplicate keys refuse before any commitment. Every schema integer slot of the v3 root (goal_revision, expected_goal_run_revision, goal_run_revision, replan_generation, the OwnerIdentity epochs) and of the SP-3102 values is admitted by the shared exact-integer call with range left to the slot's own schema bounds; a fraction or exponent spelling is never folded to an integer, and there is no blanket integer walk, safe-integer cap or binary64 narrowing. The SP-3100 idempotency preimage, the CV-317 producer semantic digest and every other RFC 8785 use are CV-1100 qualified RFC 8785; a value binary64 or the emitted decimal cannot preserve refuses. SP-1100 purpose profiles supply the CV-339 full-value commitment and stored value bytes; first-receipt integers are exact SP-1100 storage_uint64 values. Date-time: every timestamp this family validates uses the shared CV-1101 predicate: occurred_at_utc and the graph-patch created_at_utc and issued_at_utc use the EventRecord profile; Storage-assigned observed_at_utc and persisted_at_utc use storage_utc_z; the first receipt's acknowledged_at_utc uses the EventRecord profile (E5-2). No timestamp is rewritten, normalized or regenerated on retry. Retained recipes: a retained original resolves only through SP-1101: Storage's independently sealed write receipt for that exact original (write-time edition plus frozen resource manifest) selects the frozen verifier; a missing, ambiguous or other-original receipt preserves the bytes and returns unavailable or unsupported; no receipt is created while reading; no current number or date-time guard runs on a retained original; new-write selection stays separate. The v2 historical reader keeps its original recipes.
gui_related: false
gui_classification_reason: Defines event, writer, persistence or projection contracts; no visual surface.
split_recommended: false
depends_on:
- CV-1100
- CV-1101
- CV-3100
- SP-1100
- SP-1101
- DL-045
unblocks: []
acceptance_criteria:
- Every integer slot passes the shared exact-integer call; a 4,400-digit valid integer reaches a refusal row or acceptance without a crash.
- Every timestamp field passes date_time with its named profile, and acknowledged_at_utc uses the EventRecord profile.
- A retained read selects its recipe only from the sealed receipt for that exact original; missing, ambiguous and other-original receipts refuse without creating custody or altering bytes.
validation_surfaces:
- python3 scripts/pm_goal_run_replan_oracles.py
- python3 scripts/pm_event_numbers.py --self-test --scope numbers
- python3 scripts/pm_event_datetime_inventory.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_run_replanned_values
reasoning_tier: high
context_scope: goal_run_replanned_values
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Contracts_V0.md#CV-1100
- Plans/Contracts_V0.md#CV-1101
- Plans/storage-plan.md#SP-1101
- /mnt/Cursor/PM-Experiments/goal-replan-combined-root-review-20260921/v3/REVIEW.md (adoption item 6)
preserved_exact_tokens:
- "storage_utc_z"
- "acknowledged_at_utc"
negative_constraints:
- No lane-local serializer, number cap, timestamp normalizer or recipe probe.
- No receipt created by a read.
owner_hints:
- Plans/Contracts_V0.md
```

ContractRef: ContractName:Plans/Contracts_V0.md#CV-1100, ContractName:Plans/Contracts_V0.md#CV-1101, ContractName:Plans/storage-plan.md#SP-1101, ContractName:Plans/Contracts_V0.md#CV-3100
