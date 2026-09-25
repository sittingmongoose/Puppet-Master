# Shard 043: GRS-084 — Whole certified v3 Event identity, released custody, native/event/history distinction and passive current consumers (2026-09-21)

Source: `Plans/Goal_Runtime_System.md`

Source lines: L7803-L7872

Source SHA256: `4e29386674ebd3cc904fa9217d066792a464e5a9d4a0e69ea5471709f26b59c2`

---

## GRS-084 — Whole certified v3 Event identity, released custody, native/event/history distinction and passive current consumers (2026-09-21)

```yaml
plan_unit_id: GRS-084
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: 'Certified admission selects the entire goal-run-certified.v3 payload schema and the complete coordinator
  identity EventRecord root; the original twenty-five-field payload, required-present null payload_ref, exact typed
  owner values and canonical identity preimage are mandatory. Actor/cause/time/Event identity, Unicode bytes and
  numeric representations are not normalized or reconstructed. The existing goal_run.certified Event family remains
  the same family with its existing scope, alias/redaction and authority retention semantics; only its explicit
  version/payload selection and corresponding source refs advance. Receipt/native retention, full Event inspection,
  historical graph disclosure and live-current consumer reads are separate whole methods. Retained native receipt
  disclosure requires surviving original custody and current permission, but does not imply surviving full Event
  content or grant action authority. Full Event inspection authenticates the whole original frame, payload, append
  group, operation, original origin, release and current visibility. Historical reads validate the whole immutable
  original graph without reacquiring mutable source history; current reads independently obtain the complete current
  native, separate Goal and Guard sources. All consumer methods are passive: no append, native mutation, source
  reissuance, missing-row repair, commit, release or inherited reader capability. This version-scoped complete family
  supplies the previously unbound certified-v3 identity/coordinator/Event selection and passive consumer source
  roles only for a genuine fresh pm.executor.workflow_source.all_writers.v7 birth and pm.goal_run_certified.producer_source.v2
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
- GRS-083
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
context_scope: grs-084_whole_certified_family
implementation_surfaces:
- Plans/Goal_Runtime_System.md
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

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-084, ContractName:Plans/Plan_Document_System.md#PDS-003, ContractName:Plans/goal_certified_event_coordinator_contracts/protocol.md, ContractName:Plans/goal_run_certified_consumer_contracts/protocol.md, ContractName:Plans/goal_certified_family_composition.json
