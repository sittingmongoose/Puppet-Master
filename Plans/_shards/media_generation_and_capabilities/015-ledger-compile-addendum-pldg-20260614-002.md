# Shard 015: Ledger Compile Addendum - pldg-20260614-002

Source: `Plans/Media_Generation_and_Capabilities.md`

Source lines: L6226-L6267

Source SHA256: `418bc32eb7b2528e2e8654f6573ff22898801fe0881483bd4b3c18cc9a4115a4`

---

## Ledger Compile Addendum - pldg-20260614-002

### MGAC-092 - Capability Usability State Semantics

```yaml
plan_unit_id: MGAC-092
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: >-
  Capability responses must expose separate `enabled_on_instance` and `usable_now` fields plus
  `caller_scope`, `execution_role`, and identity disclosure level. A capability can be
  `enabled_on_instance` while not `usable_now` for the invoking runtime identity because of actor,
  account, lane, execution_role, mode, provider health, permission, quota, or degraded-state inputs.
  When a capability is visible but not currently usable, `capabilities.get` must return
  `blocked_reason`, `caller_scope`, `execution_role`, identity disclosure level, and evaluated
  caller/runtime identity rather than flattening availability to a global enabled flag.
gui_related: false
gui_classification_reason: Capability state and caller/runtime identity semantics are backend/runtime contracts, not visual presentation.
depends_on: [CV-281]
unblocks: []
acceptance_criteria:
  - Capability payloads distinguish `enabled_on_instance` from `usable_now`.
  - When visible but not currently usable, payloads include `blocked_reason`, `caller_scope`, `execution_role`, identity disclosure level, runtime identity, and requested/effective identity.
  - Provider, agent-rules, and Skills consumers cannot infer `usable_now` from `enabled_on_instance` or a global provider flag alone.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: capability_availability_drift
reasoning_tier: high
context_scope: capability_usability_semantics
implementation_surfaces: [Plans/Media_Generation_and_Capabilities.md, Plans/agent-rules-context.md, Plans/Skills_System.md, Plans/Provider_OpenCode.md]
node_compile_hint: {mode: capability_usability_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0036
  - pldg-20260614-002-part-3-fable-cleanup:atom-0050
preserved_exact_tokens: ["enabled_on_instance", "usable_now", "blocked_reason", "caller_scope", "execution_role", "identity disclosure level", "visible but not currently usable", "capabilities.get"]
negative_constraints:
  - Do not infer `usable_now` from `enabled_on_instance`.
  - Do not expose a visible but not currently usable capability without `blocked_reason`, `caller_scope`, `execution_role`, and identity disclosure level.
owner_hints: [Plans/Media_Generation_and_Capabilities.md, Plans/agent-rules-context.md, Plans/Skills_System.md]
```
