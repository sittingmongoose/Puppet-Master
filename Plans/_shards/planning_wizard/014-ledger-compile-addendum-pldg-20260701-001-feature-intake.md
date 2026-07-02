# Shard 014: Ledger Compile Addendum - pldg-20260701-001-feature-intake

Source: `Plans/Planning_Wizard.md`

Source lines: L1348-L1432

Source SHA256: `e90a7d8e37335ca18a331be8d6cbd0ba2851cdac39383dec44a19689b5b5b885`

---

## Ledger Compile Addendum - pldg-20260701-001-feature-intake

This addendum compiles first-run onboarding handoff behavior from bootstrap ledger `pldg-20260701-001-feature-intake` into Planning Wizard ownership. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or a governance seal.

### PWIZ-017 - First-Run Onboarding Entry And Limited Setup Landing

```yaml
plan_unit_id: PWIZ-017
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  After first-run provider setup completes or the user chooses `Skip for now`, Puppet Master opens Planning Wizard as the
  first full app page rather than routing to the dense Home shell, Settings, or Agent Config. Planning Wizard consumes
  structured `onboarding_setup_state` rather than a raw onboarding transcript. When setup was skipped, provider count is
  zero, provider warnings exist, or Health is not Ready, the landing state shows a limited setup reminder using the copy
  `Provider setup is not finished. You can still open Planning Wizard, but assistant features may need a provider before
  they can run.` and provides a `Set up provider` CTA without blocking entry. Planning Wizard may start intake in this
  limited state, but it must preserve provider setup warnings and must not create WorkNodes, NodeSeeds, executable queues,
  implementation files, or runtime/build surfaces as part of the handoff.
gui_related: true
gui_classification_reason: Defines visible Planning Wizard landing behavior, limited setup reminder copy, and CTA presentation.
depends_on: [PWIZ-001, CV-305, F3-411, ACD-431, UCC-106]
unblocks: [WM-041, ATS-020]
acceptance_criteria:
  - Completed first-run setup opens Planning Wizard as the first full app page.
  - Skipped first-run setup also opens Planning Wizard in limited setup state rather than the dense Home shell.
  - Planning Wizard consumes structured onboarding_setup_state and preserves provider setup warnings.
  - Limited setup state shows the accepted provider-unfinished copy and a provider setup CTA.
  - Planning Wizard does not mark Health Ready or launch Plan Compile/WorkNodes because of first-run handoff.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future first-run-to-Planning-Wizard routing fixture
  - future skipped-provider limited-state Planning Wizard fixture
risk_class: planning_wizard_false_ready_handoff
reasoning_tier: high
context_scope: first_run_planning_wizard_landing
implementation_surfaces:
  - Plans/Planning_Wizard.md
  - future Planning Wizard first-run landing state
node_compile_hint:
  mode: first_run_planning_wizard_landing
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
  - Do not route completed first-run onboarding to the dense Home shell by default.
  - Do not route completed first-run onboarding to Settings or Agent Config as the primary destination unless a later correction changes this decision.
  - Do not use the raw onboarding transcript as the sole Planning Wizard handoff.
  - Do not drop provider setup warnings when entering Planning Wizard.
  - Do not create WorkNodes, NodeSeeds, executable queues, implementation files, or runtime/build surfaces as part of first-run handoff.
owner_hints:
  - Plans/Planning_Wizard.md
  - Plans/FinalGUISpec.md
  - Plans/Wiring_Matrix.md
  - Plans/Contracts_V0.md
```
