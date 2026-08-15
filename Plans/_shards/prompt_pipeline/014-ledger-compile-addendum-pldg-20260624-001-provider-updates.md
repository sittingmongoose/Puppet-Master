# Shard 014: Ledger Compile Addendum - pldg-20260624-001-provider-updates

Source: `Plans/Prompt_Pipeline.md`

Source lines: L3503-L3544

Source SHA256: `5455de88e0eb4b9f7cc02f3828ce5aa836058f03e12715532ad2c761908fb5d8`

---

## Ledger Compile Addendum - pldg-20260624-001-provider-updates

This addendum compiles accepted provider-update ledger atoms into prompt pipeline requirements. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### PP-054 - Requested Effective Provider Route Snapshot

```yaml
plan_unit_id: PP-054
unit_type: requirement
status: accepted
owner_doc: Plans/Prompt_Pipeline.md
canonical_text: >-
  Prompt Pipeline records must snapshot requested and effective provider route identity for provider_entry_id, provider_family_id, account_profile_ref, transport_kind, auth_surface, model_id, effort intent, effective effort wire mapping, media_route_id, fallback_used, fallback_reason, support_state, verification_state, and capability gates for each provider attempt. This snapshot feeds usage, runtime artifacts, GUI run status, and audits without letting consumers infer route identity from model names alone.
gui_related: false
gui_classification_reason: Prompt/runtime identity snapshot contract rather than visual presentation.
depends_on: [CV-293, MS-113, MA-062]
unblocks: [UF-074, RAP-032, ACD-424]
acceptance_criteria:
  - Requested and effective provider/model/account/effort/media route identities are recorded per attempt.
  - Fallback and effort-clamp reasons remain queryable.
  - Usage, artifacts, and GUI consumers reuse this snapshot rather than creating independent provider identity guesses.
  - Secret material is not stored in prompt pipeline snapshots.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: provider_identity_snapshot_drift
reasoning_tier: high
context_scope: prompt_provider_route_snapshot
implementation_surfaces: [Plans/Prompt_Pipeline.md, Plans/Contracts_V0.md, Plans/Models_System.md, Plans/Multi-Account.md]
node_compile_hint: {mode: requested_effective_provider_route_snapshot, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0119
  - pldg-20260624-001-provider-updates:atom-0122
  - pldg-20260624-001-provider-updates:atom-0139
source_atom_ids: [atom-0017, atom-0052, atom-0117, atom-0118, atom-0119, atom-0122, atom-0129, atom-0131, atom-0132, atom-0139, atom-0140]
preserved_exact_tokens: ["requested", "effective", "provider_entry_id", "provider_family_id", "account_profile_ref", "transport_kind", "auth_surface", "model_id", "media_route_id", "fallback_used", "fallback_reason", "support_state", "verification_state"]
negative_constraints:
  - Do not infer provider route identity from model name alone.
  - Do not store secrets in prompt pipeline snapshots.
  - Do not let usage, GUI, or artifact consumers invent separate requested/effective route schemas.
owner_hints: [Plans/Prompt_Pipeline.md, Plans/Contracts_V0.md, Plans/Models_System.md, Plans/Multi-Account.md]
```
