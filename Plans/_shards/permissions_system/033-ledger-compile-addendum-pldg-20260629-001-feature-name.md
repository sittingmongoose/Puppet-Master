# Shard 033: Ledger Compile Addendum - pldg-20260629-001-feature-name

Source: `Plans/Permissions_System.md`

Source lines: L8434-L8493

Source SHA256: `97ed251bf22bfe1db126a705f2e1042a4463a0f5cb4e033f72bec21f30a532f6`

---

## Ledger Compile Addendum - pldg-20260629-001-feature-name

This addendum compiles Free Models trust, credential, probe, and live-call authority boundaries. It does not create WorkNodes, NodeSeeds, executable queues, generated governance artifacts, or implementation files.

### PS-125 - Free Models Source Trust Credential And Probe Authority

```yaml
plan_unit_id: PS-125
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Free Models Auto Apply trust is limited to the configured upstream source/channel unless a future Advanced/Support plan explicitly pins another source. Free Models does not own underlying provider credentials; credential collection, secret refs, reconnect, and sign-in authority remain with the underlying provider/account/Multi-Account owner. Live probes, quota-spending checks, costed fallback, and generated-adapter activation require the relevant permission/authority state and must be redacted in diagnostics.
gui_related: false
gui_classification_reason: Defines trust, permission, and credential authority, not a visual surface.
depends_on: []
unblocks: []
acceptance_criteria:
  - Auto Apply rejects untrusted forks, arbitrary URLs, and arbitrary scripts unless a later Advanced/Support plan explicitly pins them.
  - Free Models setup delegates credential custody to the underlying provider/account flow.
  - Default refresh is metadata/catalog-only and does not spend quota by default.
  - Live probes or quota-spending checks require explicit authority and produce redacted evidence.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models trusted source permission fixtures
  - Free Models credential custody fixtures
  - Live probe authority and redaction fixtures
risk_class: source_trust_and_secret_custody_drift
reasoning_tier: high
context_scope: free_models_permissions
implementation_surfaces:
  - Plans/Permissions_System.md
  - Plans/Multi-Account.md
  - Plans/Models_System.md
  - Plans/FileSafe.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: free_models_source_trust_permissions_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
source_atom_ids: [atom-0018, atom-0019, atom-0033, atom-0058, atom-0059, atom-0068, atom-0072, atom-0193, atom-0196, atom-0197, atom-0200, atom-0277, atom-0278, atom-0280, atom-0293, atom-0294]
preserved_exact_tokens:
  - "trusted upstream source"
  - "configured `vava-nessa/free-coding-models` source/channel"
  - "catalog/model metadata only"
  - "underlying provider/account"
  - "secrets/tokens always redacted"
negative_constraints:
  - Do not collect or store underlying provider credentials inside the Free Models provider.
  - Do not execute arbitrary upstream commands/scripts, local proxies, telemetry hooks, credential writers, endpoint installers, self-update logic, or arbitrary config writers.
  - Do not spend quota during default refresh.
  - Do not expose raw secrets, tokens, or raw provider error payloads in normal UI or diagnostics export.
owner_hints:
  - Plans/Permissions_System.md
  - Plans/Multi-Account.md
  - Plans/Models_System.md
  - Plans/FileSafe.md
```
