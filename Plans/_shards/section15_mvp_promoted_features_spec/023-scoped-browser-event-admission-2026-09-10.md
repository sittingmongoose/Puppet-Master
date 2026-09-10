# Shard 023: Scoped Browser Event Admission — 2026-09-10

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L11305-L11349

Source SHA256: `ed6bb2f8a102a2bab3b7ea67eddb5bcd155bb3c67f85bfef59c0e62607783f68`

---

## Scoped Browser Event Admission — 2026-09-10

### SMPFS-166 - Browser Event And Consumer Admission Boundary

```yaml
plan_unit_id: SMPFS-166
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  The exact fifty-three Section 3.18A browser event families have scoped static admission through the central
  EventRecord registry and unique metadata-only payload schemas. The admission manifest owns each producer,
  actual transition, exact subject scope, retention assignment, compatibility, recovery, redaction, replay,
  consumer, and command-event binding; it does not register a physical owner-record family or prove a native producer.
gui_related: false
gui_classification_reason: This unit binds event authority and consumer contracts, not GUI implementation.
depends_on: [SMPFS-147, SMPFS-156, CV-330]
unblocks: []
acceptance_criteria:
  - The exact owner event census equals the manifest and new registry rows with no missing, duplicate, inferred, or bulk-admitted families; all preexisting thirty-nine rows remain unchanged.
  - Every family has one unique closed payload schema ID and event_type pair, exact project and topology lineage, owner-record and transition refs, and separately evaluated permission/capability refs.
  - Manual non-program browser commands and events may omit Run/Attempt only as paired nulls; program execution, compilation, segments, and ProgramWorkspace events remain Run-bound.
  - Representation results include direct result and omission counts and byte/token estimates; current/stale, continuation, coverage, and generation semantics are checked by the shared owner validator.
  - Handoff failure receipts express only achieved phases, and unknown effects or unfenced sources cannot authorize retry or claim reconstruction.
  - The fifteen existing command rows consume exact event bindings; unavailable, rejected, acceptance-only, and no-change outcomes emit no transition event, and inspect remains receipt-only.
  - Runtime producer, handler, journal adapter, security, recovery execution, provider usage, empirical savings, readiness and global Event Authority closure remain unproved.
validation_surfaces:
  - python3 scripts/pm-browser-event-admission.py
  - python3 scripts/pm-plans-verify.py validate-browser-event-admission
  - Plans/browser_event_admission_fixtures.json
  - Plans/section15_browser_program_contract_fixtures.json
  - tests/test_pm_browser_event_admission.py
  - tests/test_pm_browser_program_semantics.py
risk_class: browser_event_scope_retention_replay_or_consumer_drift
reasoning_tier: high
context_scope: scoped_browser_event_admission
implementation_surfaces: [Plans/browser_event_admission.json, Plans/browser_event_payloads.schema.json, Plans/event_family_registry.json, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json]
node_compile_hint: {mode: static_contract_admission_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:packet:PKT-04/04_COMMAND_EVENT_WIRING_REGISTER.md, source_ref:egolite-requirement:HBU-010, source_ref:egolite-requirement:HBU-017, source_ref:egolite-requirement:HBU-021, source_ref:egolite-requirement:HBU-022, source_ref:egolite-requirement:EGO-006, USER-PACKET-GAP-CLOSURE-20260910]
negative_constraints:
  - No protected authentication identity or content, arbitrary page code, source body, inline capture, credential, or event alias.
  - No handler availability lift, physical record admission by reference, global denominator completion, historical currentness rewrite, WorkNodes, NodeSeeds or governance seal.
```

ContractRef: ContractName:Plans/Contracts_V0.md#CV-330, ContractName:Plans/storage-plan.md#SP-260, ContractName:Plans/usage-feature.md#UF-102, ContractName:Plans/Prompt_Pipeline.md#PP-091, ContractName:Plans/Wiring_Matrix.md#WM-054, ContractName:Plans/browser_event_admission.json, ContractName:Plans/browser_event_payloads.schema.json
