# Shard 017: Ledger Compile Addendum - pldg-20260624-001-provider-updates

Source: `Plans/00-plans-index.md`

Source lines: L4548-L4625

Source SHA256: `7fcd6ef30a113ac13345c458296b99bfabdabd08bcb1a291d38000ba648327fc`

---

## Ledger Compile Addendum - pldg-20260624-001-provider-updates

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260624-001-provider-updates` into this index. It registers owner routing only; detailed behavior remains owned by the referenced Plans docs. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### 0PI-061 - Provider Updates Owner Map And Retired Gemini CLI Anchor

```yaml
plan_unit_id: 0PI-061
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: >-
  Provider updates from ledger pldg-20260624-001-provider-updates route to the existing provider owner docs instead of a new owner doc. Gemini CLI and gemini_cli are retired from active provider support and preserved only as compatibility/source-lineage tokens; Gemini Direct remains the API-key-backed direct provider; Antigravity CLI replaces Gemini CLI for the active CLI-backed Google/agent route. Provider support is now Provider -> models, with same-named models allowed under multiple provider entries, direct providers and CLI-backed providers kept separate, and coding-plan/provider-media rows marked green only from route-level E2E proof or explicit capability-gated/unverified status.
gui_related: false
gui_classification_reason: This is index owner routing and stale-anchor disposition, not visual presentation.
depends_on: [PLS-001, PDS-005]
unblocks: [MS-113, MA-062, CBP-019, MGAC-094, F3-400]
acceptance_criteria:
  - Gemini CLI appears only as retired/source-lineage/compatibility terminology after this compile.
  - Provider updates route to Models_System, Multi-Account, CLI_Bridged_Providers, Media_Generation_and_Capabilities, Contracts_V0, usage-feature, FinalGUISpec, Provider_OpenCode, BinaryLocator_Spec, Tools, Permissions_System, Runtime_Artifacts_Panel, and Project_Output_Artifacts as owners or consumers.
  - The index does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: provider_owner_routing_drift
reasoning_tier: high
context_scope: provider_updates_owner_map
implementation_surfaces:
  - Plans/00-plans-index.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Media_Generation_and_Capabilities.md
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: owner_map_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0005
  - pldg-20260624-001-provider-updates:atom-0015
  - pldg-20260624-001-provider-updates:atom-0016
  - pldg-20260624-001-provider-updates:atom-0024
  - pldg-20260624-001-provider-updates:atom-0025
  - pldg-20260624-001-provider-updates:atom-0115
  - pldg-20260624-001-provider-updates:atom-0123
source_atom_ids: [atom-0005, atom-0015, atom-0016, atom-0024, atom-0025, atom-0115, atom-0123]
decision_refs: [dec-0002, dec-0004, dec-0005, dec-0008, dec-0034]
correction_refs: [corr-0001, corr-0003, corr-0012]
preserved_exact_tokens:
  - "Kill Gemini cli support"
  - "it’s being turned off, so no one can use it"
  - "It has to be replaced by antigravity"
  - "No, kill Gemini completely"
  - "Gemini direct provider via api is ok to keep"
  - "Provider -> models"
  - "gemini_cli"
  - "Gemini CLI"
  - "GEMINI_CLI_HOME"
  - "exactly 7 provider entries"
  - "platform_specs.rs"
  - "compatibility-only"
  - "retired-token"
negative_constraints:
  - Do not preserve Gemini CLI as active provider support.
  - Do not silently alias gemini_cli to antigravity_cli.
  - Do not collapse provider/model identity across providers that expose the same model name.
  - Do not rely on removed Rust/Iced or platform_specs.rs anchors as implementation authority.
owner_hints:
  - Plans/00-plans-index.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Multi-Account.md
  - Plans/Models_System.md
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
  - Plans/Media_Generation_and_Capabilities.md
```
