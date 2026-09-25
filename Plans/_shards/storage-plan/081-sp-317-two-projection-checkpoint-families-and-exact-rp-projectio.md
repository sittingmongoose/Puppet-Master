# Shard 081: SP-317 — Two projection/checkpoint families and exact RP-PROJECTION-3GEN transaction/generation/cutover obligations (2026-09-21)

Source: `Plans/storage-plan.md`

Source lines: L26613-L26684

Source SHA256: `ec8f477e0e1e3eaa19e3532c956714f4f4343a50e9dbba00d8a28a093a0b2a17`

---

## SP-317 — Two projection/checkpoint families and exact RP-PROJECTION-3GEN transaction/generation/cutover obligations (2026-09-21)

```yaml
plan_unit_id: SP-317
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Register exactly two separate derived families: goal_run_started_cancelled_certified_projection
  and goal_run_started_cancelled_certified_checkpoint. Their complete closed StorageProjection and Checkpoint roots,
  exact goal_run_projection.v5@<generation_id> dataset, versioned physical keys and unpadded base64url K of exact
  valid UTF-8 components remain as specified in the complete consumer contract. P7 publishes the entire affected
  row and its own complete checkpoint/root/frontier in one actual original Storage CAS transaction with independent
  current native/Goal/Guard final checks; no row/checkpoint split or checkpoint-ahead visibility. P8 stages an empty
  isolated generation from complete actual retained original sources and validates actual replay frontier before
  atomic own-root cutover. Never copy an old checkpoint or reinterpret old row bytes. Exact RP-PROJECTION-3GEN@1.0.0
  means no current TTL, maximum three staged/current/retired generations together, original retirement plus 604800
  seconds subject to actual holds and references, and governed rebuild. The full projection includes original Event
  content and is source-coupled across every generation: Start retains RP-RUNTIME-365D (31536000 seconds from run
  completion), cancelled/certified authority retains RP-AUTHORITY-INDEFINITE, and every other source keeps its own
  unchanged lifetime. An indefinite certified record or held generation cannot extend expired Start or mutable owner
  content. Missing, deleted, unauthorized or expired original sources make dependent disclosure unavailable. This
  version-scoped complete family supplies the previously unbound certified-v3 identity/coordinator/Event selection
  and passive consumer source roles only for a genuine fresh pm.executor.workflow_source.all_writers.v7 birth and
  pm.goal_run_certified.producer_source.v2 prepare.v2 binding. Earlier native-v6 and producer-v1 source editions
  and old started/cancelled branches retain their original closed scope; no existing birth is enrolled or cast.
  The complete methods, protocols, schemas, phase and participant tuples, isolated resource banks and physical/lifetime
  contracts under Plans/goal_certified_event_coordinator_contracts/, Plans/workflow_standard_source_contracts/native-v7/,
  Plans/goal_certified_producer_source_contracts/ (including native-v7/) and Plans/goal_run_certified_consumer_contracts/
  are normative together. Source acceptance and registry classification establish neither installed native authority
  nor execution, codec, transaction, durability, recovery, Event-depth or readiness proof. All such native evidence
  remains NOT_RUN. No WorkNode or NodeSeed is created.'
gui_related: false
source_lineage:
- certified-family-placement:sha256:41a4d703b475c2668b243b043934bf0e3a0f22f33c1e663b339aa1aa2395099c
- root-placement-review:sha256:00981271bf2b645c3610804251ce240f83f3d121ab2c654b0fe98b3c5396909c
- accepted-header-source:sha256:dd464f1bec2a1691a045aec1fcd816de1c83feb70f8065f1e37ef0c053b890fe
- producer-repin-source:sha256:ad4c49b5e1fb43425a390c9cb666a95503483699779dfdb860ec770d2e06376a
- consumer-repin-source:sha256:e6f9be4094e68b5d690e93db45ba3199ccff20a1c72fe93264aadf822ed1896d
depends_on:
- PDS-003
- SP-316
unblocks: []
acceptance_criteria:
- Preserve the complete scoped source and every original entry/final/phase/type/lifetime predicate.
- Use complete canonical resources and exact isolated original retrieval scopes; prove full inverse metadata and
  actual final acyclic hash graph.
- Native installation, authentic original source capabilities, execution, codec/transaction/durability/recovery
  and end-to-end readiness remain NOT_RUN.
validation_surfaces:
- Plans/goal_certified_event_coordinator_contracts/protocol.md
- Plans/goal_certified_event_coordinator_contracts/phase-boundaries.json
- Plans/goal_certified_event_coordinator_contracts/participant-method-tuples.json
- Plans/goal_run_certified_consumer_contracts/protocol.md
- Plans/goal_certified_family_composition.json
risk_class: original_source_authority_native_transaction_and_lifetime
reasoning_tier: high
context_scope: sp-317_whole_certified_family
implementation_surfaces:
- Plans/storage-plan.md
- Plans/goal_certified_event_coordinator_contracts
- Plans/goal_certified_producer_source_contracts
- Plans/workflow_standard_source_contracts/native-v7
- Plans/goal_run_certified_consumer_contracts
node_compile_hint:
  mode: source_contract_only
  create_worknodes: false
  create_nodeseeds: false
gui_classification_reason: Original source, native authority/custody, schema, storage or passive consumer contract;
  no new visual presentation.
```

ContractRef: ContractName:Plans/storage-plan.md#SP-317, ContractName:Plans/Plan_Document_System.md#PDS-003, ContractName:Plans/goal_certified_event_coordinator_contracts/protocol.md, ContractName:Plans/goal_run_certified_consumer_contracts/protocol.md, ContractName:Plans/goal_certified_family_composition.json
