# Shard 050: Scoped Browser EventRecord Contracts — 2026-09-10

Source: `Plans/Contracts_V0.md`

Source lines: L21509-L21548

Source SHA256: `8def03992f31bb3cb109045143302d34c9331789b410cfffac86b14967b7698b`

---

## Scoped Browser EventRecord Contracts — 2026-09-10

### CV-330 - Browser Event Payload Identity Scope And Replay Admission

```yaml
plan_unit_id: CV-330
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Browser EventRecords consume the existing EventRecord 2.0 envelope and Case L identity/replay rules.
  Fifty-three exact registered event_type values each select one unique closed metadata payload schema from
  browser_event_payloads.schema.json through browser_event_admission.json; producer admission requires the
  actual owner transition and verified exact scope, not a Client action or receipt-shaped object alone.
gui_related: false
gui_classification_reason: This is event envelope, payload, producer and replay authority.
depends_on: [CV-317, SMPFS-147]
unblocks: []
acceptance_criteria:
  - Validate the central envelope, registered payload schema ID and event_type pair, payload, project scope, and parity for project, thread, Run, and attempt where applicable before checkpoint advance.
  - Require exact Home Server, Execution Host, Environment, Source Location and row-specific workspace, session, page/generation, program, segment, ProgramWorkspace or routine context; pre-allocation identities remain null only where the selected transition permits them.
  - Payloads are at most 65536 UTF-8 JSON bytes with at most 64 artifact refs and closed typed facts; owner-record schema ID, transition receipt, permission snapshot and capability snapshot refs do not substitute for resolving and authenticating the actual producer and transition.
  - Application-scope, mismatched scope, unknown family, stale generation, protected-auth content, unhandled inline data, mismatched schema identity and oversized payloads fail closed without checkpoint advance.
  - App-root-global event_id and scope-partition/event_type/idempotency_key use the existing producer-semantic digest; a matching retry returns the original with zero effects while conflicting identity is quarantined.
  - Storage-assigned sequence and observation/persistence times do not change producer-semantic digest; producer sequence and correlation retain their existing meaning.
  - Projector replay is non-appendable, idempotent, generation-monotonic and effect-free; it cannot execute commands, restore leases/processes, deliver prompts, create UsageRecords, or retry unknown effects.
  - Static fixtures test payload admission and a replay oracle using the existing Case L digest; native signed-producer lookup, durable checkpoint atomicity and runtime security are separate proof obligations.
validation_surfaces: [Plans/browser_event_admission_fixtures.json, tests/test_pm_browser_event_admission.py, python3 scripts/pm-browser-event-admission.py, python3 scripts/pm-plans-verify.py validate-browser-event-admission]
risk_class: browser_event_payload_identity_scope_or_replay_escape
reasoning_tier: high
context_scope: browser_eventrecord_contract
implementation_surfaces: [Plans/event_record.schema.json, Plans/event_family_registry.json, Plans/browser_event_admission.json, Plans/browser_event_payloads.schema.json, Plans/storage-plan.md]
node_compile_hint: {mode: static_event_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Section15_MVP_Promoted_Features_Spec.md#318a-pm-browser-script-browserprogram-and-local-execution, source_ref:packet:PKT-04/04_COMMAND_EVENT_WIRING_REGISTER.md, USER-PACKET-GAP-CLOSURE-20260910]
negative_constraints:
  - Do not create a second EventRecord envelope, idempotency algorithm, arbitrary event alias, payload body store, or protected-auth event route.
  - Do not infer producer execution, native checkpoint safety, storage-family admission, complete global event census, or readiness from static registration.
```

ContractRef: ContractName:Plans/Contracts_V0.md#CV-317, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-166, ContractName:Plans/browser_event_admission.json, ContractName:Plans/browser_event_payloads.schema.json
