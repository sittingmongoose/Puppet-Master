# Shard 035: Ledger Compile Addendum - pldg-20260614-002

Source: `Plans/chain-wizard-flexibility.md`

Source lines: L9929-L10010

Source SHA256: `0b73f2f9279538abf08313620fd9f5d277911139b86a3ab9b23e127ce0b86230`

---

## Ledger Compile Addendum - pldg-20260614-002

### CWF-149 - Wizard Blocked Packet Payload Contract

```yaml
plan_unit_id: CWF-149
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Wizard `gap-005` is resolved by a versioned blocked-packet payload contract carrying packet_id,
  blocker type/reason, source stage/surface, target action, affected inputs/outputs, actor/runtime_identity,
  lane/account/project/worktree scope, permission/capability impact, recoverability classification,
  required user/agent action, evidence refs, retry/override policy, stale/expiration behavior, and UI
  display/interaction requirements. Wizard blocked-state UI derives its actions and copy from this
  structured payload rather than heading precision or free-form blocker text.
gui_related: true
gui_classification_reason: Wizard blocked-state copy, actions, retry/override controls, and interaction requirements are user-visible wizard UI behavior.
depends_on: [CWF-148, CV-281, CV-283]
unblocks: []
acceptance_criteria:
  - Blocked packets carry packet identity, blocker reason, source/target, affected data, runtime identity, scope, permission/capability impact, recoverability, evidence, retry/override, stale/expiration, and UI requirements.
  - Wizard blocked UI derives allowed actions from the payload.
  - "`gap-005` no longer remains open due to under-specified blocked-packet payloads."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: wizard_blocked_payload_gap
reasoning_tier: high
context_scope: wizard_blocked_packet_payload
implementation_surfaces: [Plans/chain-wizard-flexibility.md, Plans/FinalGUISpec.md, Plans/Contracts_V0.md]
node_compile_hint: {mode: wizard_blocked_packet_payload_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0112
  - pldg-20260614-002-part-3-fable-cleanup:atom-0113
preserved_exact_tokens: ["gap-005", "blocked-packet payload", "remains open", "blocked_reason_code", "allowed_action_ids", "UI display/interaction requirements"]
negative_constraints:
  - Do not derive wizard blocked actions from heading text alone.
  - Do not leave `gap-005` as an open blocked-packet payload design gap.
owner_hints: [Plans/chain-wizard-flexibility.md, Plans/FinalGUISpec.md, Plans/Contracts_V0.md]
```

### CWF-150 - Fork Destination And Unsupported Host Active Contract

```yaml
plan_unit_id: CWF-150
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Chain Wizard fork and PR setup must not use future-scope placeholders for organization forks or
  non-GitHub hosts. Organization fork support is an active typed path requiring destination selection,
  scope disclosure such as `read:org` when needed, permission preflight, and blocked outcomes when the
  authenticated account cannot fork into the selected organization. Non-GitHub hosts return typed
  unsupported-host outcomes with owner docs and recovery/help actions, not silent placeholders.
gui_related: true
gui_classification_reason: Fork destination selection, host-support messages, and blocked outcomes are user-visible wizard setup UI.
depends_on: [CWF-061, CWF-149]
unblocks: []
acceptance_criteria:
  - Organization forks require explicit destination, scope disclosure, preflight, and blocked outcomes.
  - Non-GitHub hosts produce typed unsupported-host outcomes.
  - The wizard contains no canonical future-scope placeholder language for fork destinations or hosts.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - PlanUnit-aware scan of live canonical_text and acceptance_criteria outside CWF-150's own placeholder-ban definition for "future scope|future-scope", excluding source_lineage, preserved_exact_tokens, compatibility_only_notes, negative_constraints, and stale/retired-token fields.
risk_class: wizard_host_scope_placeholder_drift
reasoning_tier: standard
context_scope: chain_wizard_fork_host_scope
implementation_surfaces: [Plans/chain-wizard-flexibility.md, Plans/GitHub_API_Auth_and_Flows.md]
node_compile_hint: {mode: wizard_fork_host_scope_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0027
preserved_exact_tokens: ["Nothing in the plans is future scope at all.", "org forks are future scope", "Non-GitHub hosts remain future scope for MVP", "read:org"]
stale_retired_dispositions:
  - "`org forks are future scope` is retired source-lineage wording; organization fork support is an active typed path with destination selection and preflight."
  - "`Non-GitHub hosts remain future scope for MVP` is retired source-lineage wording; non-GitHub hosts return typed unsupported-host outcomes with owner docs and recovery/help actions."
negative_constraints:
  - Do not leave organization forks or non-GitHub hosts as future scope placeholders.
  - Do not silently hide unsupported host outcomes.
owner_hints: [Plans/chain-wizard-flexibility.md, Plans/GitHub_API_Auth_and_Flows.md]
```
