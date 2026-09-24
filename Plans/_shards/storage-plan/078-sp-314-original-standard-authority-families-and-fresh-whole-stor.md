# Shard 078: SP-314 — Original Standard authority families and fresh whole stored profiles (2026-09-20)

Source: `Plans/storage-plan.md`

Source lines: L26338-L26433

Source SHA256: `8b37bd1b8ee875c5fa67f4ec56509c096cfbd262606cdb686df16061e1db826f`

---

## SP-314 — Original Standard authority families and fresh whole stored profiles (2026-09-20)

```yaml
plan_unit_id: SP-314
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'The full storage_value_registry retains all previous family rows and routes without reinterpretation
  and adds workflow_standard_result, workflow_standard_origin and workflow_standard_capture_origin under the exact
  closed whole-schema refs and key codecs in physical-contracts.json. They are immutable original operation result,
  native publication origin and coissued original Standard receipt capture authority, not archives of mutable bodies.
  RP-AUTHORITY-INDEFINITE preserves these genuine authority rows and their exact original backup bytes and custody;
  it does not extend the independent lifetime of referenced mutable sources or Event records. Restore cannot recreate
  missing original issuance or recapture sources. stored-profile-routes.json explicitly binds all eleven fresh profile
  deltas: Workflow birth/head/update/lineage-origin v6-to-v7; Start candidate/origin v4-to-v5; cancellation result/origin
  v5-to-v6; Standard result/origin/capture-origin v2-to-v3. These prior version labels describe the frozen proposal
  chain, not a claim that each was previously installed in canonical registry. Existing actual registry keys/codecs
  and generic attempt_record, execution_unit_context_store, attempt_receipt and goal_receipt v1/Standard v2 roots
  remain unchanged. The full original profiles and new routes coexist under exact before-birth native installation;
  the complete native owner must reject a missing or incompatible codec/profile/transaction/backup registration.
  SP-289''s native source gap is qualified only by the adopted source composition; SP-214''s independent lower publisher/read
  predicates, SP-286 original custody and SP-278 Event traversal requirements remain mandatory. An immutable unequal
  same-key candidate conflicts; missing mutable current content or original authority refuses current action. Passive
  retained permissioned audit preserves genuine surviving originals with no action capability. No early scheduler-admission
  family or mutable-body archive is added. This is adoption of the complete bounded native source contract, not
  native implementation or qualification. The original four isolated native, Goal, Standard and Event-prerequisite
  schema realms remain separate. Every complete argument, candidate, native capability, whole original owner source
  and entry/final pure predicate in the protocol and full inherited method compositions is mandatory. String tags,
  headers, permission objects, prior checks, worker output and reference resolution never substitute for actual
  original authority. The fresh pm.executor.workflow_source.all_writers.v6 profile is installed before its original
  Workflow birth; existing births and earlier profiles cannot be enrolled, reinterpreted, stamped, rewritten or
  migrated into it. The adopted installation-composition digest binds its exact current resource map separately
  from the preserved frozen source digest. No certified Event coordinator, Event registry selection, append/first-receipt
  dispatch or certified consumer/checkpoint is supplied by this source adoption. Actual native, codec, durability,
  transaction interleaving, backup/restore and end-to-end proof remain NOT_RUN.'
gui_related: false
gui_classification_reason: Original native source, custody and storage contracts; no new visual presentation.
depends_on:
- SP-214
- SP-278
- SP-286
- SP-289
- CV-350
unblocks:
- ATS-055
acceptance_criteria:
- Complete original source, candidates and actual owner capability are independently checked at every entry and
  final publication; missing authority, stale currentness or a returning-helper gap refuses action.
- Fresh before-birth profile selection preserves every original old route; an old birth, unknown writer, incompatible
  schema/codec or unequal immutable same-key value is refused without recapture or reinterpretation.
- Current action requires complete current original sources; retained disclosure exposes only genuine surviving
  originals under current permission and grants no action capability.
- Source/meta/reference checks are reported as static only. Native behavioral, transaction, recovery and backup/restore
  evidence remains NOT_RUN until actually executed.
- The certified payload remains byte-identical and unselected by the Event registry; no certified coordinator, checkpoint
  or reducer admission follows from source adoption.
validation_surfaces:
- Plans/workflow_standard_source_contracts/installation-composition.json
- Plans/workflow_standard_source_contracts/literal-resource-realms.json
- Plans/workflow_standard_source_contracts/stored-profile-routes.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plans-verify.py run-gates
risk_class: original_authority_currentness_and_false_runtime_claim
reasoning_tier: high
context_scope: whole_successful_native_source_and_isolated_owner_realms
implementation_surfaces:
- Plans/storage-plan.md
- Plans/workflow_standard_source_contracts
- Plans/storage_value_registry.json
node_compile_hint:
  mode: native_source_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- external-source-manifest:sha256:664723cf1af8d3deee4a2e71c63d664aa22d4809c31f3f5246bd99e7c5a67c08
- independent-source-review:sha256:f05eb0ebf5560299f32e6962a1ce29391fb1e5d2eab44382b88c5841d1ce64aa
- placement-manifest:sha256:89befda6adfdc13a3b61f38acbc41976353ec1676b60fd2b97fa160e1fd1d17a
preserved_exact_tokens:
- pm.executor.workflow_source.all_writers.v6
- NOT_RUN
- CurrentGoalArgument
- certified_with_approved_exception
negative_constraints:
- No source/schema redesign, child execution, retry/repair/exception writer admission or old-profile enrollment.
- No Event coordinator/registry/consumer/checkpoint admission, Step 9, validator edit, WorkNode/NodeSeed or governance
  seal.
- No old resource rebinding, surrogate extracted schema, mutable-body archive or reconstructed original authority.
owner_hints:
- Plans/Executor_Protocol.md
- Plans/Goal_Runtime_System.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/workflow_standard_source_contracts/protocol.md, ContractName:Plans/workflow_standard_source_contracts/methods.json, ContractName:Plans/workflow_standard_source_contracts/fresh-profile-methods.json, ContractName:Plans/workflow_standard_source_contracts/literal-resource-realms.json, ContractName:Plans/workflow_standard_source_contracts/stored-profile-routes.json, ContractName:Plans/workflow_standard_source_contracts/installation-composition.json
