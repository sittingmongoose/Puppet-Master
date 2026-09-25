# Shard 080: SP-316 — Seven compact authority families, eleven v7 profile-qualified wrapper routes and atomic native/Event release (2026-09-21)

Source: `Plans/storage-plan.md`

Source lines: L26540-L26610

Source SHA256: `13c7249db9369f9863e9e74631af06b3ff822ef64b49b9175b44cba964e5181f`

---

## SP-316 — Seven compact authority families, eleven v7 profile-qualified wrapper routes and atomic native/Event release (2026-09-21)

```yaml
plan_unit_id: SP-316
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Register exactly seven compact original authority families: goal_certified_event_birth, goal_certified_event_control,
  goal_certified_event_intent, goal_certified_event_eventphase, goal_certified_event_commit, goal_certified_event_origin
  and goal_certified_event_release. Their versioned physical names/keys remain exactly goal_certified_event_*.v1
  with lowercase even-length hex of exact valid nonempty UTF-8 project/run/operation bytes and no normalization.
  Use canonical MessagePack under unchanged CV339 with the complete closed wrapper/header and actual storage identity/physical
  key. Only Control is mutable, by the full original beforeimage/CAS and declared phase transaction; all other rows
  are immutable original issuance, with unequal same-key bytes conflicting. The exact eleven native-v7 profile-qualified
  stored routes select complete new wrapper roots only for genuinely born v7. All 285 previous Storage rows remain
  unchanged, including all three existing workflow_standard_* families and their default v6 wrappers. No absent
  proposal row means canonical family absence. All 27 retention policies remain exact; compact authority uses RP-AUTHORITY-INDEFINITE
  without a new horizon or mutable body archive. The seven families retain only their complete content-free issuance
  metadata/IDs/selectors/clocks/commitments; producer payloads, original source arguments, mutable body snapshots
  and raw Event frames remain governed by original source owners and lifetimes. B1, F5 and joint native/D01 commit/release
  obey EP-124; source commitments do not replace actual original issuance or CV339 encoding. This version-scoped
  complete family supplies the previously unbound certified-v3 identity/coordinator/Event selection and passive
  consumer source roles only for a genuine fresh pm.executor.workflow_source.all_writers.v7 birth and pm.goal_run_certified.producer_source.v2
  prepare.v2 binding. Earlier native-v6 and producer-v1 source editions and old started/cancelled branches retain
  their original closed scope; no existing birth is enrolled or cast. The complete methods, protocols, schemas,
  phase and participant tuples, isolated resource banks and physical/lifetime contracts under Plans/goal_certified_event_coordinator_contracts/,
  Plans/workflow_standard_source_contracts/native-v7/, Plans/goal_certified_producer_source_contracts/ (including
  native-v7/) and Plans/goal_run_certified_consumer_contracts/ are normative together. Source acceptance and registry
  classification establish neither installed native authority nor execution, codec, transaction, durability, recovery,
  Event-depth or readiness proof. All such native evidence remains NOT_RUN. No WorkNode or NodeSeed is created.'
gui_related: false
source_lineage:
- certified-family-placement:sha256:41a4d703b475c2668b243b043934bf0e3a0f22f33c1e663b339aa1aa2395099c
- root-placement-review:sha256:00981271bf2b645c3610804251ce240f83f3d121ab2c654b0fe98b3c5396909c
- accepted-header-source:sha256:dd464f1bec2a1691a045aec1fcd816de1c83feb70f8065f1e37ef0c053b890fe
- producer-repin-source:sha256:ad4c49b5e1fb43425a390c9cb666a95503483699779dfdb860ec770d2e06376a
- consumer-repin-source:sha256:e6f9be4094e68b5d690e93db45ba3199ccff20a1c72fe93264aadf822ed1896d
depends_on:
- PDS-003
- SP-315
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
context_scope: sp-316_whole_certified_family
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

ContractRef: ContractName:Plans/storage-plan.md#SP-316, ContractName:Plans/Plan_Document_System.md#PDS-003, ContractName:Plans/goal_certified_event_coordinator_contracts/protocol.md, ContractName:Plans/goal_run_certified_consumer_contracts/protocol.md, ContractName:Plans/goal_certified_family_composition.json
