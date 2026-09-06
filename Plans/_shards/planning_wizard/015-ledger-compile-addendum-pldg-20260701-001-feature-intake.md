# Shard 015: Ledger Compile Addendum - pldg-20260701-001-feature-intake

Source: `Plans/Planning_Wizard.md`

Source lines: L1462-L1550

Source SHA256: `e3bd3e17e5ca0dce00a6b7b6776eeec9d67cb2c4283fa8706b180dbfe4604dce`

---

## Ledger Compile Addendum - pldg-20260701-001-feature-intake

This addendum compiles first-run onboarding handoff behavior from bootstrap ledger `pldg-20260701-001-feature-intake` into Planning Wizard ownership. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or a governance seal.

### PWIZ-017 - Superseded Provider-First Handoff Source Lineage

```yaml
plan_unit_id: PWIZ-017
unit_type: source_lineage_disposition
status: retired
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  PWIZ-017 preserves the 2026-07-01 four-screen, provider-first, direct-to-Planning-Wizard proposal as historical
  source lineage only. It is not current Product Onboarding choreography, command authority, or landing-page authority.
  PWIZ-021 through PWIZ-023 own the current nine-stage `welcome` / `simple_path` / `first_project` /
  `source_control_setup` / `server_storage_client` / `remote_access_setup` / `review_setup_plan` /
  `automatic_preparation` / `ready` flow, its six-stage connect-existing shortcut, durable migration, and optional
  three-chapter Guided Tour.
  Provider and advanced setup are optional and deferrable, incomplete provider state remains a truthful warning rather
  than a false Health/Doctor Ready claim; PWIZ-023's September 3 correction makes Planning Wizard the tour destination.
  The current handoff
  consumes bounded typed Onboarding state and owner receipt refs rather than a raw transcript or legacy
  `onboarding_setup_state` shape. The retired exact copy and tokens below remain searchable for migration and audit;
  they do not authorize a provider gate, a `cmd.onboarding.*` command family, or replay of owner work.
gui_related: true
gui_classification_reason: Preserves the retired visible first-run choreography and copy solely for audit and migration lineage.
depends_on: [PWIZ-021, PWIZ-022, PWIZ-023]
unblocks: []
acceptance_criteria:
  - The four-screen/provider-first order, mandatory provider prompt, legacy setup-state shape, and direct landing behavior are classified as source-lineage rather than current product authority.
  - Current behavior routes through PWIZ-021 through PWIZ-023, the nine-stage primary path, the six-stage connect-existing shortcut, and the exact three-scene Guided Tour.
  - The superseded seven-stage Onboarding flow and five-chapter Guided Tour are explicitly source-lineage only.
  - Legacy provider decisions and warnings remain migration inputs without becoming current stage, command, or readiness authority.
  - No old onboarding record reruns provider, Server, pairing, restore, Project, authentication, or source-control owner work.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Plans/product_onboarding_contracts.schema.json
  - future legacy-to-current durable migration fixture
risk_class: retired_provider_first_choreography_reactivated
reasoning_tier: high
context_scope: retired_first_run_handoff_lineage
implementation_surfaces:
  - Plans/Planning_Wizard.md
node_compile_hint:
  mode: source_lineage_disposition
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0029
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0036
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0037
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0038
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0042
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0045
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0046
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0047
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/onboarding_doctor_user_decisions_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/assistant_provider_wizard_proposal_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/user_accepts_provider_wizard_proposal_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/pmconcept_gui_reference_20260701.json
source_atom_ids: [atom-0029, atom-0036, atom-0037, atom-0038, atom-0042, atom-0045, atom-0046, atom-0047]
decision_refs: [dec-0007, dec-0008]
preserved_exact_tokens:
  - "After the setup, it dumps the user into the planning Wizard page."
  - "Planning Wizard"
  - "Open Planning Wizard"
  - "Skip for now"
  - "Provider setup is not finished. You can still open Planning Wizard, but assistant features may need a provider before they can run."
  - "Set up provider"
  - "onboarding_setup_state"
  - "setup_completed"
  - "setup_skipped"
  - "connected_provider_count"
  - "provider_warning_count"
  - "free_models_reviewed"
  - "health_summary_state"
negative_constraints:
  - Do not restore the four-screen/provider-first proposal as active choreography.
  - Do not make provider or advanced setup a prerequisite for reaching Ready or Planning Wizard.
  - Do not register `cmd.onboarding.*` from retired command-era text; current controls are owner-local typed UI actions.
  - Do not use the raw onboarding transcript or legacy onboarding_setup_state as current Product Onboarding authority.
  - Do not drop retained provider warnings or convert Connected or Logged in into Ready.
  - Do not create WorkNodes, NodeSeeds, executable queues, implementation files, or runtime/build surfaces as part of first-run handoff.
owner_hints:
  - Plans/Planning_Wizard.md
  - Plans/FinalGUISpec.md
  - Plans/Wiring_Matrix.md
  - Plans/Contracts_V0.md
```
