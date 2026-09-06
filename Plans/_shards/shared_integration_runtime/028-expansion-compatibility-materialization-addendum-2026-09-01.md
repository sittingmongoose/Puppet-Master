# Shard 028: Expansion Compatibility Materialization Addendum - 2026-09-01

Source: `Plans/Shared_Integration_Runtime.md`

Source lines: L1592-L1659

Source SHA256: `68f490730360190a462e589a2e83adc0276929bc4a170d5a69b7be7d9f502852`

---

## Expansion Compatibility Materialization Addendum - 2026-09-01

### SIR-031 - DRY Expansion Compatibility And Local-Action Materialization

```yaml
plan_unit_id: SIR-031
unit_type: schema_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  shared_integration_runtime_expansion_contracts.schema.json remains the single
  DRY state-machine source for the server-gap expansion. Its fixtures close 44
  canonical command records, 14 typed local UI-action records, 44 disabled-reason
  records, and 33 pre-dispatch compatibility normalizations. Existing owner schemas
  expose 40 command compatibility records and all 14 local-action aliases through
  narrow external $ref composition; they do not copy the shared state machines or
  transfer domain ownership to Shared Integration Runtime. Local actions are
  deterministic, presentation-only, non-domain, non-persistent, and authority-free.
  Protected-auth actions additionally remain human-only, non-recordable,
  non-inspectable, unavailable to agents and adapters, and incapable of exposing
  protected content. Remote-Link test normalizes under RAS-013 before validation.
gui_related: true
gui_classification_reason: The materialized aliases provide typed requests, exact disabled reasons, and deterministic returns for real Settings, Onboarding, Doctor, and PMConcept7 consumers.
split_recommended: false
depends_on: [SIR-028, SIR-030, RAS-013, SMPFS-157]
unblocks: [CV-326, ATS-042, 0PI-068]
acceptance_criteria:
  - "The expansion fixture pack contains exactly 44 command cases, 14 typed local UI actions, 44 disabled-reason records, and 33 alias normalizations."
  - "Owner compatibility validation accepts exactly 240 command records and 28 owner-local records while retaining the expansion sidecar as the sole shared state-machine source."
  - "All 168 schema-bearing adjudication rows resolve and the 3 rejected rows remain action-free; unresolved local and other proposed schema references both equal zero."
  - "Local actions cannot install, authenticate, browse protected content, access files, dispatch providers, persist state, emit domain events, or claim a domain handler."
  - "ProtectedAuth local actions require human_only=true and false recording, inspection, agent, adapter, persistence, and protected-content-exposure capabilities."
  - "Compatibility tokens normalize before permission, availability, typed validation, dispatch, receipts, events, or persistence and receive no peer handler or production row."
validation_surfaces:
  - python3 scripts/pm-server-command-gap-verify.py --json
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-plans-verify.py validate-server-command-gap
  - python3 scripts/pm-plans-verify.py validate-new-contracts
  - python3 scripts/pm-touch-closure-verify.py --json
  - python3 scripts/pm-plan-index.py validate
risk_class: copied_expansion_state_machine_or_local_authority_widening
reasoning_tier: high
context_scope: server_gap_expansion_compatibility_materialization
implementation_surfaces:
  - Plans/Shared_Integration_Runtime.md
  - Plans/shared_integration_runtime_expansion_contracts.schema.json
  - Plans/shared_integration_runtime_expansion_fixtures.json
  - Plans/shared_integration_runtime.schema.json
  - Plans/shared_integration_runtime_fixtures.json
  - Plans/shared_runtime_command_contracts.schema.json
  - Plans/shared_runtime_command_contract_fixtures.json
  - Plans/protected_auth_browser_contracts.schema.json
  - Plans/protected_auth_browser_contract_fixtures.json
  - Plans/remote_access_system_contracts.schema.json
  - Plans/remote_access_system_contract_fixtures.json
node_compile_hint: {mode: shared_expansion_external_ref_materialization_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Shared_Integration_Runtime.md#sir-028---local-action-and-compatibility-normalization-boundary
  - Plans/server_command_gap_adjudication.json
  - Plans/Remote_Access_System.md#ras-013---remote-link-test-pre-dispatch-normalization
preserved_exact_tokens: [shared_integration_runtime_expansion_contracts.schema.json, human_only, content_recording_allowed, content_inspection_allowed, agent_access_allowed, adapter_access_allowed, persistence_allowed, protected_content_exposed]
negative_constraints:
  - "Do not copy the expansion state machines into owner schemas; use narrow external-reference composition."
  - "Do not promote a typed local UI action into a domain command, handler, event, persistence write, or capability grant."
  - "Do not let agents, adapters, capture, recording, inspection, export, replay, or restore cross the protected-auth boundary."
  - "Do not claim native implementation, network behavior, security certification, or readiness from schema and fixture closure."
owner_hints: [Plans/Shared_Integration_Runtime.md, Plans/Remote_Access_System.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Commands_System.md]
```
