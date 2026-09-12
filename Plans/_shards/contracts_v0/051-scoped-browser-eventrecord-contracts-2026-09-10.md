# Shard 051: Scoped Browser EventRecord Contracts — 2026-09-10

Source: `Plans/Contracts_V0.md`

Source lines: L21536-L21615

Source SHA256: `6452c533d694ae75071b524c3baf829cd049105b05247a06ae3ed68fbeb71cd2`

---

## Scoped Browser EventRecord Contracts — 2026-09-10

### CV-332 - Browser Event Payload Identity Scope And Replay Admission

```yaml
plan_unit_id: CV-332
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Browser EventRecords consume the existing EventRecord 2.0 envelope and Case L identity/replay rules.
  Fifty-three exact prepared event_type values each select one unique closed metadata payload schema from
  browser_event_payloads.schema.json through browser_event_admission.json. Preparation does not register them;
  only an admitted_static_contract row with its exact central family binding passes admission. Producer admission requires the
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
  - Candidate fixtures and CandidateReplayOracle test prepared payload semantics without admission; the default ReplayOracle separately rejects every unadmitted family without projection or checkpoint advance. Admitted-label-only, central-row-only, mismatched-binding and mixed-subset cases fail closed as applicable.
  - Each new family requires a separate complete owner/Storage review and landing under DL-046. Missing technical bindings may be newly authored only after the decision's per-family search and scoped-negative-evidence requirements; the prepared payloads are not proof of contract depth. Native signed-producer lookup, durable checkpoint atomicity and runtime security are separate proof obligations; a passing consistency report is not admission completion.
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


### CV-333 - Central UI Command Response And Typed Owner Result Join

```yaml
plan_unit_id: CV-333
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: "The closed v2 UICommandResponse is the single dispatcher projection over the authenticated normalized request, existing Full Thread CommandOutcomeRecord and separately owned typed result/error. It does not duplicate domain schemas, equate acknowledgement with success, or fabricate durable scope for local projections and pre-dispatch refusals."
gui_related: false
gui_classification_reason: This governs backend record binding and dispatcher contracts.
depends_on: [CV-313, SIR-015]
unblocks: []
acceptance_criteria:
  - "Every response validates Plans/ui_command_response.schema.json; all twenty fields are present with conditional nullability, closed error codes, bounded references and replay identity."
  - "Owner-operation joins preserve exact request, canonical command, command instance, operation, full topology identity, payload hash, idempotency key, target generation and dispatch frame."
  - "Terminal outcomes bind the actual owner result ref, exact schema path/definition/schema identity, and SHA-256 of RFC 8785 canonical JSON; native resolution authenticates the owner and applies its validation and permission rules before publication."
  - "Accepted, acknowledged and executing project accepted/pending; succeeded projects succeeded or owner-verified no_op; failed and cancelled retain those states; rejected projects rejected with null result status; terminal_unknown projects recovery_required."
  - "A typed owner acceptance cannot prove completion; owner-specific receipt and effect-unknown semantics remain authoritative, including the shared-runtime, Browser and Server result contracts."
  - "Local route/open disposition has null operation, owner identity, outcome and typed owner refs, with zero domain events; pre-dispatch refusal has no accepted operation or effects and preserves unknown input only through request lineage."
  - "Replay preserves the original request, command, scope, outcome, owner result, receipt, events, error and status for all three response kinds; it cannot re-execute an effect or mint replacement operation identity."
  - "Version-1 minima are read/import lineage only; missing identities are never synthesized to claim v2 success."
  - "Static fixtures cover cross-record mismatch, hash tampering, unknown schema, stale generation, acknowledgement laundering, application scope, local action, refusal and replay; trusted fixture resolutions do not prove native authentication."
  - "The integer/string Case L digest oracle is reused; fixture success does not claim general numeric RFC 8785 or every owner-specific native adapter."
validation_surfaces: [Plans/ui_command_response_fixtures.json, tests/test_pm_ui_command_response.py, python3 scripts/pm-plans-verify.py validate-ui-command-response, python3 scripts/pm-plan-index.py validate]
risk_class: command_response_identity_or_false_completion
reasoning_tier: high
context_scope: central_command_response_bridge
implementation_surfaces: [Plans/ui_command_response.schema.json, Plans/full_thread_runtime_contracts.schema.json, Plans/shared_runtime_command_contracts.schema.json]
node_compile_hint: {mode: static_command_response_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [USER-PACKET-GAP-CLOSURE-20260910, Plans/Shared_Integration_Runtime.md#SIR-015]
negative_constraints:
  - No native dispatcher, owner authentication, effect execution, new command, event or physical storage-family admission is proved by static fixtures.
  - No second command outcome owner, fabricated operation scope, automatic retry of unknown effects, or governance/readiness lift.
```

ContractRef: ContractName:Plans/Contracts_V0.md#CV-333, ContractName:Plans/ui_command_response.schema.json, ContractName:Plans/Shared_Integration_Runtime.md#SIR-015
