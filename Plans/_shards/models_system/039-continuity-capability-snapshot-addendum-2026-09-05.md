# Shard 039: Continuity Capability Snapshot Addendum (2026-09-05)

Source: `Plans/Models_System.md`

Source lines: L9605-L9723

Source SHA256: `6f1bc38af76db1a37030921dc1cce39365039781a53862e862ff9aa4b6151815`

---

## Continuity Capability Snapshot Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Fresh-window sizing consumes the existing capability snapshot, not new fields: `effective_context_window_tokens`, `max_input_tokens`, `max_output_tokens`, and the model-owned pressure defaults (`pressure_start_pct = 70`, `pressure_aggressive_pct = 85`) feed the pipeline's checkpoint reserve and admission checks with current post-assembly estimates and provider counting semantics (no double-counted output reserve, no second contingency pool). Capability facts stay route/model/account/version-specific with provenance and staleness states; on a model or account change mid-task, the new snapshot is resolved before reconstruction so mandatory state is preserved and optional notes/history narrow first. No provider support, authentication, installation, or billing policy changes under this packet.

```yaml
plan_unit_id: MS-138
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Fresh-window transition and checkpoint-reserve sizing consume the existing model capability snapshot (effective_context_window_tokens, max_input_tokens, max_output_tokens, pressure defaults) with provenance/staleness states, per route/model/account/version. A model or account change resolves the new snapshot before reconstruction; mandatory state is preserved and optional material narrows first. No new provider policy, tier rule, or preview flag is introduced by the continuity work.
gui_related: false
gui_classification_reason: Capability snapshot semantics are model-system behavior, not GUI work.
depends_on: [MS-137, PP-086]
unblocks: []
acceptance_criteria:
  - A smaller continuation window uses its actual capability/account snapshot and estimator semantics.
  - Capabilities stay route/model/account/version-specific with recorded provenance.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: stale_capability_use
reasoning_tier: standard
context_scope: models_system
implementation_surfaces: [Plans/Models_System.md, Plans/Prompt_Pipeline.md, Plans/CLI_Bridged_Providers.md]
node_compile_hint: {mode: model_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C04
  - source_packet:PM-WNC-2026-09-05-v1:WNC-P04
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A29
preserved_exact_tokens: ["effective_context_window_tokens", "pressure_start_pct", "capability_snapshot_id"]
negative_constraints:
  - Do not size transitions from a stale or provider-name-guessed snapshot.
  - Do not add provider configuration scope creep.
owner_hints: [Plans/Models_System.md, Plans/Prompt_Pipeline.md]
```

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/CLI_Bridged_Providers.md

### MS-139 - Original complete Models activation resolution custody

MS-139 defines original Models output custody for the accepted WorkNode activation route through CV-349, SP-308 and EP-117. `models.resolve_plans_to_code_role.v1` remains the actual semantic resolver. `models_plans_to_code_resolution_receipt` stores its complete unchanged eight-field model_resolution_receipt: receipt_id, requested_lane, requested_model_profile, effective_model_profile, fallback_used, fallback_reason, capability_checks and the complete handoff. No effective-model projection, Settings snapshot, capture digest or fabricated output replaces this receipt.

The complete original request is bound through its authentic original source and full canonical request hash. Every work_type, GUI/frontend flag, effort_class, capability_lane, context/risk/reasoning/test input and complete model_routing survives. The actual original Models operation independently owns provider/account/effort/variant/fallback disposition and its genuine configuration/policy/capability sources. The eight-field handoff receipt is a complete defined semantic output; it is not the entire broader native provider/account authority graph. Neither a copied receipt nor a schema-valid requested_effective_runtime snapshot manufactures those independent original sources.

`owner.storage.activation_operational_custody.publish.v1` joins the actual resolver’s original output transaction to the complete ModelsPhysical and operational OriginPhysical under SP-308. The original output identity/revision, operation/transaction, scope, occurrence and complete input/output digests must agree with the actual resolver and original request. The durable output precedes its independent live capture and dependent activation source/origin in the acyclic publication order. It cannot include a future capture hash or activation-origin hash as its own prior authorization.

`models.storage.capture_role_resolution.v1` is the exact original capture publisher; workflow_models_request_live_origin.issuer_method retains that capture method while original_source_method remains models.resolve_plans_to_code_role.v1. The paired request-set capture uses goal_runtime.storage.capture_activation_request_set.v1 with original_source_method=goal_runtime.executor.decide_activation_request_set.v1. These are separate original operations/roles even when a real owner joins them into one admitted transaction. A producer registry cannot replace an origin issuer with its source owner or let a capture issuer claim to have resolved the model.

`owner.models_plans_to_code_resolution_receipt.read_original.v1` uses the whole ModelsReadRequest/ModelsReadResult from operational-custody.v2. Its available arm returns the complete actual original input, whole source/origin and all original request/output identity; missing, stale, corrupt, foreign or unavailable original source returns its exact unavailable arm. The full ModelsDurableInputBinding retains the unchanged original capture provenance plus the actual durable source/origin. `original_durable_custody` explicitly selects this route; it neither changes the old live source_mode nor reacquires a disposed live lease. Retained metadata audit discloses only genuine surviving capture/origin metadata under current policy, with no full input or action authority.

The complete original Models collection in CurrentMaterializeArgument preserves every corresponding ProvisioningReceipt.model_resolution_receipts member. Match each original capture to the exact original source position, full accepted request applicability, source/origin and request digest. Require exact membership with no duplicate, omitted or foreign receipt; an empty collection is permitted only for an actual original provisioning branch with no Models member and valid original admission. Failed reader or unresolved request applicability is not an empty branch. WorkNode.model is the entire same A4 Models metadata object selected by that original source; the durable collection supplies its full eight-field receipt. The native owner independently derives and validates both whole values after helpers.

When a real native runtime identity already exists, requested_effective_runtime_source selects the complete existing 34-field requested_effective_runtime value with its exact key, codec, RP-RUNTIME-365D policy and reference floor. It is never a substitute for the receipt and is not extended with fallback_reason or other receipt fields. Genuine pre-dispatch/pre-Goal resolution does not fabricate a run, Attempt, Goal, dummy WorkNodeRequest or runtime snapshot. The original host Stop and actual OriginalPreGoalGuard remain mandatory. Actual bound materialization instead uses GRS-077’s complete current Goal/binding authority; a pre-Goal branch cannot excuse that later check.

This selected activation WorkNode route adds no fake request for compiler-only Models roles. It adds no new provider routing, model tier, account/effort policy, fallback rule, variant, billing, capability flag, public command or Settings behavior. Current original provider/account/model/capability facts required for execution must be revalidated by their actual owners; the original resolution receipt proves what its original operation resolved and does not prove current availability. Recovery returns the same genuine receipt and original dependencies, never a new resolution to repair missing old evidence.

The receipt’s full canonical strings and fallback explanation remain original receipt authority under SP-308’s existing indefinite class. Separate prompt/provider-response/body/capability/runtime sources retain their own owner lifetimes, access/deletion/hold and backup policies; a receipt reference does not extend them. BRS-024 includes exactly the original dependency closure needed for a claimed recovery/action, preserves newer current truth and leaves a missing required source unavailable. Restored receipt custody never recreates Models native capabilities.

Every independently callable original issuer, capture participant, head/artifact writer, Storage publisher, live/current/durable/retained reader, recovery reader and replay responder must enforce both native boundaries itself. Before its first returning helper it authenticates the complete actual operation, registered owner and epoch, native Storage/root/backend identity, whole original source values and beforeimages, current permissions, effective Stop/cancellation, writer/registration generations, deletion/tombstone/hold and coherent recovery state. It independently derives every complete permissible candidate and return from those sources. Caller-selected method, schema, family, codec, source mode, operation ID, owner string or serialized lease cannot establish that authority.

After all returning parsers, builders, codecs, copies, resolvers, validators, comparison helpers and currentness reads, the same original participant independently rechecks the whole authentic source/preimage set, actual native fences and entire candidate. A publisher checks its complete pending transaction union, including preserved/unrelated members; the outer joint publisher independently checks the complete joined union as well. One final pure predicate has no returning helper, asynchronous callback, logger or mutable gap before that participant’s commit or passive disclosure. A lower entry never inherits authority merely because its caller checked. Whole original readback with its own independent final predicate precedes dependent release. A later refusal preserves every genuine prior effect and never repairs a missing source by replaying its producer.

This unit establishes a canonical source contract and the required original-owner placements. Native installation and capability authentication, original source execution, all-writer exclusion, exact codec execution, redb atomicity/fsync/crash behavior, retained/current replay and coherent backup/restore remain NOT_RUN. Schema/source checks do not establish those properties. No WorkNode, NodeSeed, executable queue, runtime launch, PNC-019 enablement, readiness admission, event-depth pass, Step 9 campaign result, global D05 closure or governance seal follows from this adoption.

```yaml
plan_unit_id: MS-139
unit_type: schema_contract
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Original complete Models activation resolution custody. Original Models custody preserves all eight
  receipt fields and full original request applicability without replacing broader native provider/account/configuration/capability
  authority.
gui_related: false
gui_classification_reason: Defines original source, owner, storage and verification semantics without a visual surface.
split_recommended: false
depends_on:
- MS-138
- CV-349
- SP-308
unblocks: []
acceptance_criteria:
- Original Models custody preserves all eight receipt fields and full original request applicability without replacing
  broader native provider/account/configuration/capability authority.
- The semantic resolver, capture publisher, original origin and durable reader retain their distinct exact methods
  and whole source/operation identity.
- Materialization preserves the complete corresponding Models collection and whole WorkNode metadata, with exact
  membership and unavailable-source refusal.
- Existing requested_effective_runtime and all referenced source lifetimes remain unchanged; no dummy runtime/request,
  replayed resolution or new provider policy is introduced.
validation_surfaces:
- Plans/workflow_activation_contracts/schemas/operational-custody.v2.schema.json
- Plans/workflow_activation_contracts/schemas/models-request-live.v1.schema.json
- Plans/workflow_activation_contracts/methods.json
- Plans/workflow_activation_contracts/schemas/current-materialization.v1.schema.json
- Plans/requested_effective_runtime.schema.json
risk_class: workflow_activation_original_source_or_lifetime_drift
reasoning_tier: high
context_scope: ms_139_activation_original_custody
implementation_surfaces:
- Plans/Models_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Decision_Log.md#DL-047
- Plans/workflow_activation_contracts/methods.json
- Plans/workflow_activation_contracts/physical-families.json
source_atom_ids: []
negative_constraints:
- No public command, event or Goal lifecycle expansion and no fabricated original source or receipt.
- No full historical mutable-body archive, new retention policy, native field redaction, numeric coercion or automatic
  deployed migration.
- No WorkNode/NodeSeed/runtime/readiness/global event-depth or governance claim from source adoption.
```

ContractRef: ContractName:Plans/workflow_activation_contracts/schemas/operational-custody.v2.schema.json, ContractName:Plans/workflow_activation_contracts/schemas/models-request-live.v1.schema.json, ContractName:Plans/workflow_activation_contracts/methods.json, ContractName:Plans/workflow_activation_contracts/schemas/current-materialization.v1.schema.json, ContractName:Plans/requested_effective_runtime.schema.json
