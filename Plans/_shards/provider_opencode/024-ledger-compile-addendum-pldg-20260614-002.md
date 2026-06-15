# Shard 024: Ledger Compile Addendum - pldg-20260614-002

Source: `Plans/Provider_OpenCode.md`

Source lines: L3381-L3420

Source SHA256: `d87c86177284c5689c95d0cf397d7b45fdb59b47f7390403643bff096b6f697f`

---

## Ledger Compile Addendum - pldg-20260614-002

### PO-047 - Requested Effective Provider Attempt Identity

```yaml
plan_unit_id: PO-047
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode server-bridged attempts must preserve requested and effective PM runtime identity while keeping
  OpenCode session ids and SSE ids in provider-native correlation fields. Each provider attempt records
  `provider_attempt_ref`, PM attempt_id, requested provider/profile/model/account, effective
  provider/profile/model/account, server profile, transport/session correlation, continuity/reconnect
  fields, and parity gaps when server-bridged identity cannot match direct-provider disclosure.
gui_related: false
gui_classification_reason: Provider attempt identity and SSE correlation fields are runtime/provider contracts, not visual presentation.
depends_on: [CV-281]
unblocks: []
acceptance_criteria:
  - OpenCode session identity never replaces canonical `thread_id`, `run_id`, or `attempt_id`.
  - "`provider_attempt_ref` and continuity/reconnect fields have a stable schema slot for replay and usage correlation."
  - Requested/effective identity parity gaps are explicit for server-bridged providers.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: provider_identity_correlation_drift
reasoning_tier: high
context_scope: opencode_provider_attempt_identity
implementation_surfaces: [Plans/Provider_OpenCode.md, Plans/Provider_Stream_Mapping_External_Reference_A2A.md, Plans/usage-feature.md]
node_compile_hint: {mode: provider_attempt_identity_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0035
  - pldg-20260614-002-part-3-fable-cleanup:atom-0049
preserved_exact_tokens: ["provider_attempt_ref?", "SSE correlation fields", "requested/effective identity parity", "server-bridged providers", "usage-feature.md:74"]
negative_constraints:
  - Do not map OpenCode session id into canonical `thread_id`.
  - Do not treat server-bridged identity parity as equal to direct providers unless evidence proves it.
owner_hints: [Plans/Provider_OpenCode.md, Plans/Provider_Stream_Mapping_External_Reference_A2A.md, Plans/usage-feature.md]
```
